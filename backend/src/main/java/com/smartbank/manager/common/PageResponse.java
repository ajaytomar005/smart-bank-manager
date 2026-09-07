package com.smartbank.manager.common;

import java.io.Serializable;
import java.util.List;

public record PageResponse<T>(List<T> items, int page, int pageSize, long total) implements Serializable {

    public static <T> PageResponse<T> of(List<T> allItems, int page, int pageSize) {
        int fromIndex = Math.min(page * pageSize, allItems.size());
        int toIndex = Math.min(fromIndex + pageSize, allItems.size());
        return new PageResponse<>(allItems.subList(fromIndex, toIndex), page, pageSize, allItems.size());
    }
}
