package com.example.restaurant.service;

import com.example.restaurant.entity.Ingredient;
import com.example.restaurant.entity.InventoryTransaction;
import com.example.restaurant.entity.Dish;
import com.example.restaurant.entity.DishRecipe;
import com.example.restaurant.dto.IngredientStockRequest;
import com.example.restaurant.repository.IngredientRepository;
import com.example.restaurant.repository.InventoryTransactionRepository;
import com.example.restaurant.repository.DishRecipeRepository;
import com.example.restaurant.exception.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class InventoryServiceImpl implements InventoryService {

    @Autowired
    private IngredientRepository ingredientRepository;

    @Autowired
    private InventoryTransactionRepository transactionRepository;

    @Autowired
    private DishRecipeRepository dishRecipeRepository;

    @Override
    @Transactional(readOnly = true)
    public List<Ingredient> getAllIngredients(String search) {
        if (search != null && !search.trim().isEmpty()) {
            return ingredientRepository.searchIngredients(search.trim());
        }
        return ingredientRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Ingredient getIngredientById(Long id) {
        return ingredientRepository.findById(id)
                .orElseThrow(() -> new ApiException("Nguyên liệu không tồn tại với ID: " + id, HttpStatus.NOT_FOUND));
    }

    @Override
    public Ingredient createIngredient(Ingredient ingredient) {
        if (ingredient.getStockQuantity() == null) ingredient.setStockQuantity(0.0);
        if (ingredient.getMinStockThreshold() == null) ingredient.setMinStockThreshold(0.0);
        if (ingredient.getCode() == null || ingredient.getCode().trim().isEmpty()) {
            ingredient.setCode("ING-" + String.format("%03d", (int)(Math.random() * 900 + 100)));
        }
        return ingredientRepository.save(ingredient);
    }

    @Override
    public Ingredient updateIngredient(Long id, Ingredient details) {
        Ingredient ing = getIngredientById(id);
        if (details.getCode() != null) ing.setCode(details.getCode());
        ing.setName(details.getName());
        if (details.getCategory() != null) ing.setCategory(details.getCategory());
        ing.setMinStockThreshold(details.getMinStockThreshold());
        ing.setUnit(details.getUnit());
        if (details.getImportPrice() != null) ing.setImportPrice(details.getImportPrice());
        if (details.getSupplierName() != null) ing.setSupplierName(details.getSupplierName());
        if (details.getStorageLocation() != null) ing.setStorageLocation(details.getStorageLocation());
        if (details.getExpiryDate() != null) ing.setExpiryDate(details.getExpiryDate());
        if (details.getNotes() != null) ing.setNotes(details.getNotes());
        
        return ingredientRepository.save(ing);
    }

    @Override
    public void deleteIngredient(Long id) {
        Ingredient ing = getIngredientById(id);
        List<InventoryTransaction> txs = transactionRepository.findByIngredientId(id);
        transactionRepository.deleteAll(txs);
        List<DishRecipe> recipes = dishRecipeRepository.findByIngredientId(id);
        dishRecipeRepository.deleteAll(recipes);
        ingredientRepository.delete(ing);
    }

    @Override
    public Ingredient stockIn(Long id, IngredientStockRequest request) {
        Ingredient ing = getIngredientById(id);
        double qty = request.getQuantity() != null ? request.getQuantity() : 0.0;
        ing.setStockQuantity(ing.getStockQuantity() + qty);

        if (request.getUnitPrice() != null) {
            ing.setImportPrice(request.getUnitPrice());
        }
        if (request.getSupplierName() != null && !request.getSupplierName().trim().isEmpty()) {
            ing.setSupplierName(request.getSupplierName().trim());
        }
        if (request.getExpiryDate() != null) {
            if (ing.getExpiryDate() == null || request.getExpiryDate().isBefore(ing.getExpiryDate())) {
                ing.setExpiryDate(request.getExpiryDate());
            }
        }

        ingredientRepository.save(ing);

        String ticket = request.getTicketCode() != null ? request.getTicketCode() : "NK-" + System.currentTimeMillis() % 100000;
        String performer = request.getPerformedBy() != null ? request.getPerformedBy() : "Admin";

        InventoryTransaction tx = InventoryTransaction.builder()
                .ticketCode(ticket)
                .ingredient(ing)
                .type("STOCK_IN")
                .quantity(qty)
                .unitPrice(request.getUnitPrice() != null ? request.getUnitPrice() : ing.getImportPrice())
                .supplierName(request.getSupplierName() != null ? request.getSupplierName() : ing.getSupplierName())
                .performedBy(performer)
                .transactionDate(LocalDateTime.now())
                .expiryDate(request.getExpiryDate() != null ? request.getExpiryDate() : ing.getExpiryDate())
                .note(request.getNote() != null ? request.getNote() : "Nhập kho thủ công")
                .build();
        transactionRepository.save(tx);

        return ing;
    }

    @Override
    public Ingredient stockOut(Long id, IngredientStockRequest request) {
        Ingredient ing = getIngredientById(id);
        double qty = request.getQuantity() != null ? request.getQuantity() : 0.0;

        if (ing.getStockQuantity() < qty) {
            throw new ApiException("Không thể xuất kho! Số lượng yêu cầu (" + qty + " " + ing.getUnit() + 
                    ") vượt quá tồn kho thực tế (" + ing.getStockQuantity() + " " + ing.getUnit() + ").", HttpStatus.BAD_REQUEST);
        }

        ing.setStockQuantity(ing.getStockQuantity() - qty);
        ingredientRepository.save(ing);

        String ticket = request.getTicketCode() != null ? request.getTicketCode() : "XK-" + System.currentTimeMillis() % 100000;
        String performer = request.getPerformedBy() != null ? request.getPerformedBy() : "Chef";

        InventoryTransaction tx = InventoryTransaction.builder()
                .ticketCode(ticket)
                .ingredient(ing)
                .type("STOCK_OUT")
                .quantity(qty)
                .unitPrice(ing.getImportPrice())
                .supplierName(ing.getSupplierName())
                .performedBy(performer)
                .transactionDate(LocalDateTime.now())
                .note(request.getNote() != null ? request.getNote() : "Xuất kho phục vụ chế biến")
                .build();
        transactionRepository.save(tx);

        return ing;
    }

    @Override
    public Ingredient stockAdjustment(Long id, IngredientStockRequest request) {
        Ingredient ing = getIngredientById(id);
        double newQty = request.getQuantity() != null ? request.getQuantity() : ing.getStockQuantity();
        double diff = newQty - ing.getStockQuantity();

        ing.setStockQuantity(newQty);
        ingredientRepository.save(ing);

        String ticket = request.getTicketCode() != null ? request.getTicketCode() : "DC-" + System.currentTimeMillis() % 100000;
        String performer = request.getPerformedBy() != null ? request.getPerformedBy() : "Manager";

        InventoryTransaction tx = InventoryTransaction.builder()
                .ticketCode(ticket)
                .ingredient(ing)
                .type("ADJUSTMENT")
                .quantity(diff)
                .unitPrice(ing.getImportPrice())
                .supplierName(ing.getSupplierName())
                .performedBy(performer)
                .transactionDate(LocalDateTime.now())
                .note(request.getNote() != null ? request.getNote() : "Điều chỉnh tồn kho sau kiểm kê")
                .build();
        transactionRepository.save(tx);

        return ing;
    }

    @Override
    @Transactional(readOnly = true)
    public List<InventoryTransaction> getTransactionHistory() {
        return transactionRepository.findAllOrderByDateDesc();
    }

    @Override
    @Transactional(readOnly = true)
    public List<InventoryTransaction> getTransactionHistoryByIngredient(Long ingredientId) {
        return transactionRepository.findByIngredientId(ingredientId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Dish> getDishesUsingIngredient(Long ingredientId) {
        List<DishRecipe> recipes = dishRecipeRepository.findByIngredientId(ingredientId);
        return recipes.stream().map(DishRecipe::getDish).distinct().collect(Collectors.toList());
    }
}
