package com.example.restaurant.service;

import com.example.restaurant.dto.MergeTablesRequest;
import com.example.restaurant.dto.TableRequest;
import com.example.restaurant.dto.TableResponse;

import java.util.List;

public interface DiningTableService {
    List<TableResponse> searchTables(String search, String area, String status);
    TableResponse getTableById(Long id);
    TableResponse createTable(TableRequest request);
    TableResponse updateTable(Long id, TableRequest request);
    void deleteTable(Long id);
    TableResponse mergeTables(MergeTablesRequest request);
    TableResponse splitTable(Long id);
    TableResponse changeTableStatus(Long id, String status);
}
