package com.oliwier.listmebackend.api.dto;

import com.oliwier.listmebackend.domain.model.Item;

import java.time.Instant;
import java.util.UUID;

public record ItemResponse(
        UUID id,
        UUID listId,
        String name,
        boolean checked,
        int position,
        UUID categoryId,
        String categoryName,
        String categoryColor,
        Instant createdAt,
        Instant updatedAt
) {
    public static ItemResponse from(Item item) {
        return new ItemResponse(
                item.getId(),
                item.getList().getId(),
                item.getName(),
                item.isChecked(),
                item.getPosition(),
                item.getCategory() != null ? item.getCategory().getId() : null,
                item.getCategory() != null ? item.getCategory().getName() : null,
                item.getCategory() != null ? item.getCategory().getColor() : null,
                item.getCreatedAt(),
                item.getUpdatedAt()
        );
    }
}
