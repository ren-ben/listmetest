package com.oliwier.listmebackend.domain.repository;

import com.oliwier.listmebackend.domain.model.Item;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ItemRepository extends JpaRepository<Item, UUID> {

    // Active items (not deleted)
    List<Item> findByListIdAndDeletedAtIsNullOrderByPosition(UUID listId);

    List<Item> findByListIdAndNameContainingIgnoreCaseAndDeletedAtIsNullOrderByPosition(UUID listId, String name);

    int countByListIdAndDeletedAtIsNull(UUID listId);

    int countByListIdAndCheckedTrueAndDeletedAtIsNull(UUID listId);

    // Trashed items
    List<Item> findByListIdAndDeletedAtIsNotNullOrderByDeletedAtDesc(UUID listId);
}
