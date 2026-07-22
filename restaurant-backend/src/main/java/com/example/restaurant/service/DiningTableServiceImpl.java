package com.example.restaurant.service;

import com.example.restaurant.dto.MergeTablesRequest;
import com.example.restaurant.dto.TableRequest;
import com.example.restaurant.dto.TableResponse;
import com.example.restaurant.entity.DiningTable;
import com.example.restaurant.exception.ApiException;
import com.example.restaurant.repository.DiningTableRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DiningTableServiceImpl implements DiningTableService {

    @Autowired
    private DiningTableRepository diningTableRepository;

    @Override
    @Transactional(readOnly = true)
    public List<TableResponse> searchTables(String search, String area, String status) {
        String searchParam = (search == null || search.trim().isEmpty()) ? null : search.trim();
        String areaParam = (area == null || area.trim().isEmpty() || area.equalsIgnoreCase("All")) ? null : area.trim();
        String statusParam = (status == null || status.trim().isEmpty() || status.equalsIgnoreCase("All")) ? null : status.trim();

        List<DiningTable> list = diningTableRepository.searchTables(searchParam, areaParam, statusParam);
        return list.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public TableResponse getTableById(Long id) {
        DiningTable table = diningTableRepository.findById(id)
                .orElseThrow(() -> new ApiException("Dining table not found", HttpStatus.NOT_FOUND));
        return mapToResponse(table);
    }

    @Override
    @Transactional
    public TableResponse createTable(TableRequest request) {
        String number = request.getTableNumber().trim();
        if (diningTableRepository.existsByTableNumber(number)) {
            throw new ApiException("Table number already exists", HttpStatus.BAD_REQUEST);
        }

        String code = (request.getTableCode() != null && !request.getTableCode().trim().isEmpty())
                ? request.getTableCode().trim().toUpperCase()
                : "TBL-" + (System.currentTimeMillis() % 10000);

        DiningTable table = DiningTable.builder()
                .tableCode(code)
                .tableNumber(number)
                .area(request.getArea().trim())
                .capacity(request.getCapacity())
                .tableType(request.getTableType() != null ? request.getTableType() : "Thường")
                .notes(request.getNotes())
                .assignedStaff(request.getAssignedStaff())
                .currentCustomer(request.getCurrentCustomer())
                .reservationTime(request.getReservationTime())
                .specialRequests(request.getSpecialRequests())
                .status(request.getStatus() != null ? request.getStatus().trim() : "AVAILABLE")
                .build();

        DiningTable saved = diningTableRepository.save(table);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public TableResponse updateTable(Long id, TableRequest request) {
        DiningTable table = diningTableRepository.findById(id)
                .orElseThrow(() -> new ApiException("Dining table not found", HttpStatus.NOT_FOUND));

        String number = request.getTableNumber().trim();
        if (!number.equalsIgnoreCase(table.getTableNumber()) && diningTableRepository.existsByTableNumber(number)) {
            throw new ApiException("Table number already exists", HttpStatus.BAD_REQUEST);
        }

        String code = (request.getTableCode() != null && !request.getTableCode().trim().isEmpty())
                ? request.getTableCode().trim().toUpperCase()
                : (table.getTableCode() != null ? table.getTableCode() : "TBL-" + table.getId());

        table.setTableCode(code);
        table.setTableNumber(number);
        table.setArea(request.getArea().trim());
        table.setCapacity(request.getCapacity());
        if (request.getTableType() != null) table.setTableType(request.getTableType());
        if (request.getNotes() != null) table.setNotes(request.getNotes());
        if (request.getAssignedStaff() != null) table.setAssignedStaff(request.getAssignedStaff());
        if (request.getCurrentCustomer() != null) table.setCurrentCustomer(request.getCurrentCustomer());
        if (request.getReservationTime() != null) table.setReservationTime(request.getReservationTime());
        if (request.getSpecialRequests() != null) table.setSpecialRequests(request.getSpecialRequests());
        if (request.getStatus() != null) table.setStatus(request.getStatus().trim());

        DiningTable saved = diningTableRepository.save(table);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public void deleteTable(Long id) {
        DiningTable table = diningTableRepository.findById(id)
                .orElseThrow(() -> new ApiException("Dining table not found", HttpStatus.NOT_FOUND));

        if (table.getParentTable() != null) {
            throw new ApiException("Cannot delete a merged sub-table. Please split it first.", HttpStatus.BAD_REQUEST);
        }
        if (!table.getMergedTables().isEmpty()) {
            throw new ApiException("Cannot delete a table containing merged sub-tables. Please split it first.", HttpStatus.BAD_REQUEST);
        }

        diningTableRepository.delete(table);
    }

    @Override
    @Transactional
    public TableResponse mergeTables(MergeTablesRequest request) {
        DiningTable primary = diningTableRepository.findById(request.getPrimaryTableId())
                .orElseThrow(() -> new ApiException("Primary table not found", HttpStatus.NOT_FOUND));

        if (primary.getParentTable() != null) {
            throw new ApiException("Primary table is currently merged under another table.", HttpStatus.BAD_REQUEST);
        }

        for (Long subId : request.getTableIdsToMerge()) {
            if (subId.equals(primary.getId())) {
                continue;
            }
            DiningTable sub = diningTableRepository.findById(subId)
                    .orElseThrow(() -> new ApiException("Sub-table not found with ID: " + subId, HttpStatus.NOT_FOUND));

            if (sub.getParentTable() != null) {
                throw new ApiException("Table " + sub.getTableNumber() + " is already merged elsewhere.", HttpStatus.BAD_REQUEST);
            }
            if (!sub.getMergedTables().isEmpty()) {
                throw new ApiException("Table " + sub.getTableNumber() + " is a primary table containing merged sub-tables.", HttpStatus.BAD_REQUEST);
            }

            sub.setParentTable(primary);
            sub.setStatus("OCCUPIED"); // Or sync with primary
            diningTableRepository.save(sub);
        }

        primary.setStatus("OCCUPIED");
        DiningTable saved = diningTableRepository.save(primary);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public TableResponse splitTable(Long id) {
        DiningTable primary = diningTableRepository.findById(id)
                .orElseThrow(() -> new ApiException("Dining table not found", HttpStatus.NOT_FOUND));

        if (primary.getMergedTables().isEmpty()) {
            throw new ApiException("Table does not contain any merged sub-tables.", HttpStatus.BAD_REQUEST);
        }

        for (DiningTable sub : new ArrayList<>(primary.getMergedTables())) {
            sub.setParentTable(null);
            sub.setStatus("AVAILABLE");
            diningTableRepository.save(sub);
        }

        primary.setStatus("AVAILABLE");
        primary.getMergedTables().clear();
        DiningTable saved = diningTableRepository.save(primary);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public TableResponse changeTableStatus(Long id, String status) {
        DiningTable table = diningTableRepository.findById(id)
                .orElseThrow(() -> new ApiException("Dining table not found", HttpStatus.NOT_FOUND));

        table.setStatus(status.toUpperCase().trim());
        // Propagate to sub-tables if merged
        for (DiningTable sub : table.getMergedTables()) {
            sub.setStatus(status.toUpperCase().trim());
            diningTableRepository.save(sub);
        }

        DiningTable saved = diningTableRepository.save(table);
        return mapToResponse(saved);
    }

    private TableResponse mapToResponse(DiningTable table) {
        return TableResponse.builder()
                .id(table.getId())
                .tableCode(table.getTableCode() != null ? table.getTableCode() : "TBL-" + String.format("%03d", table.getId()))
                .tableNumber(table.getTableNumber())
                .area(table.getArea())
                .capacity(table.getCapacity())
                .tableType(table.getTableType() != null ? table.getTableType() : "Thường")
                .notes(table.getNotes())
                .assignedStaff(table.getAssignedStaff())
                .currentCustomer(table.getCurrentCustomer())
                .reservationTime(table.getReservationTime())
                .specialRequests(table.getSpecialRequests())
                .status(table.getStatus())
                .parentTableId(table.getParentTable() != null ? table.getParentTable().getId() : null)
                .parentTableNumber(table.getParentTable() != null ? table.getParentTable().getTableNumber() : null)
                .mergedTableIds(table.getMergedTables().stream().map(DiningTable::getId).collect(Collectors.toList()))
                .mergedTableNumbers(table.getMergedTables().stream().map(DiningTable::getTableNumber).collect(Collectors.toList()))
                .build();
    }
}
