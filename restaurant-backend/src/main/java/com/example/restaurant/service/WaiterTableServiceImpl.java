package com.example.restaurant.service;

import com.example.restaurant.dto.TableActionRequest;
import com.example.restaurant.entity.DiningTable;
import com.example.restaurant.entity.Order;
import com.example.restaurant.exception.ApiException;
import com.example.restaurant.repository.DiningTableRepository;
import com.example.restaurant.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class WaiterTableServiceImpl implements WaiterTableService {

    @Autowired
    private DiningTableRepository diningTableRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Override
    @Transactional(readOnly = true)
    public List<DiningTable> getAllTables() {
        return diningTableRepository.findAll();
    }

    @Override
    public DiningTable updateTableStatus(Long id, String status) {
        DiningTable table = diningTableRepository.findById(id)
                .orElseThrow(() -> new ApiException("Không tìm thấy bàn #" + id, HttpStatus.NOT_FOUND));
        table.setStatus(status);
        return diningTableRepository.save(table);
    }

    @Override
    public DiningTable handleTableAction(TableActionRequest request) {
        if (request == null || request.getAction() == null) {
            throw new ApiException("Yêu cầu thao tác bàn không hợp lệ", HttpStatus.BAD_REQUEST);
        }

        DiningTable fromTable = diningTableRepository.findById(request.getFromTableId())
                .orElseThrow(() -> new ApiException("Không tìm thấy bàn nguồn #" + request.getFromTableId(), HttpStatus.NOT_FOUND));

        switch (request.getAction().toUpperCase()) {
            case "CHANGE_STATUS":
                if (request.getNewStatus() != null) {
                    fromTable.setStatus(request.getNewStatus());
                    return diningTableRepository.save(fromTable);
                }
                break;

            case "MOVE":
                if (request.getToTableId() == null) {
                    throw new ApiException("Vui lòng chọn bàn đích để chuyển", HttpStatus.BAD_REQUEST);
                }
                DiningTable toTableMove = diningTableRepository.findById(request.getToTableId())
                        .orElseThrow(() -> new ApiException("Không tìm thấy bàn đích #" + request.getToTableId(), HttpStatus.NOT_FOUND));

                // Move active orders from fromTable to toTableMove
                List<Order> activeOrdersMove = orderRepository.findByDiningTableId(fromTable.getId());
                for (Order ord : activeOrdersMove) {
                    if ("IN_SERVICE".equalsIgnoreCase(ord.getStatus()) || "PENDING".equalsIgnoreCase(ord.getStatus()) || "COOKING".equalsIgnoreCase(ord.getStatus())) {
                        ord.setDiningTable(toTableMove);
                        orderRepository.save(ord);
                    }
                }
                fromTable.setStatus("AVAILABLE");
                toTableMove.setStatus("OCCUPIED");
                diningTableRepository.save(fromTable);
                return diningTableRepository.save(toTableMove);

            case "MERGE":
                if (request.getToTableId() == null) {
                    throw new ApiException("Vui lòng chọn bàn để ghép", HttpStatus.BAD_REQUEST);
                }
                DiningTable toTableMerge = diningTableRepository.findById(request.getToTableId())
                        .orElseThrow(() -> new ApiException("Không tìm thấy bàn #" + request.getToTableId(), HttpStatus.NOT_FOUND));

                // Merge table orders and set both to OCCUPIED with merged note
                List<Order> ordersToMerge = orderRepository.findByDiningTableId(fromTable.getId());
                for (Order ord : ordersToMerge) {
                    if ("IN_SERVICE".equalsIgnoreCase(ord.getStatus()) || "PENDING".equalsIgnoreCase(ord.getStatus())) {
                        ord.setDiningTable(toTableMerge);
                        orderRepository.save(ord);
                    }
                }
                fromTable.setStatus("OCCUPIED");
                toTableMerge.setStatus("OCCUPIED");
                diningTableRepository.save(fromTable);
                return diningTableRepository.save(toTableMerge);

            case "SPLIT":
                fromTable.setStatus("AVAILABLE");
                return diningTableRepository.save(fromTable);

            default:
                throw new ApiException("Thao tác bàn không được hỗ trợ: " + request.getAction(), HttpStatus.BAD_REQUEST);
        }

        return fromTable;
    }
}
