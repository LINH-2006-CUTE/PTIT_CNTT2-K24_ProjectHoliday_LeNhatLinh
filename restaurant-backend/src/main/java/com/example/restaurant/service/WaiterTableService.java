package com.example.restaurant.service;

import com.example.restaurant.dto.TableActionRequest;
import com.example.restaurant.entity.DiningTable;

import java.util.List;

public interface WaiterTableService {
    List<DiningTable> getAllTables();
    DiningTable updateTableStatus(Long id, String status);
    DiningTable handleTableAction(TableActionRequest request);
}
