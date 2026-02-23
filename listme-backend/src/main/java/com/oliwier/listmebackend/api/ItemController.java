package com.oliwier.listmebackend.api;

import com.oliwier.listmebackend.api.dto.CreateItemRequest;
import com.oliwier.listmebackend.api.dto.ItemResponse;
import com.oliwier.listmebackend.api.dto.UpdateItemRequest;
import com.oliwier.listmebackend.domain.model.Device;
import com.oliwier.listmebackend.domain.service.ItemService;
import com.oliwier.listmebackend.identity.CurrentDevice;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/lists/{listId}/items")
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ItemController {

    private final ItemService itemService;

    @GetMapping
    public List<ItemResponse> getItems(@PathVariable UUID listId, @CurrentDevice Device device) {
        return itemService.getByList(listId, device).stream().map(ItemResponse::from).toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    public ItemResponse create(@PathVariable UUID listId,
                               @CurrentDevice Device device,
                               @Valid @RequestBody CreateItemRequest req) {
        return ItemResponse.from(itemService.create(listId, device, req));
    }

    @PutMapping("/{itemId}")
    @Transactional
    public ItemResponse update(@PathVariable UUID listId,
                               @PathVariable UUID itemId,
                               @CurrentDevice Device device,
                               @Valid @RequestBody UpdateItemRequest req) {
        return ItemResponse.from(itemService.update(listId, itemId, device, req));
    }

    @PatchMapping("/{itemId}/check")
    @Transactional
    public ItemResponse toggleCheck(@PathVariable UUID listId,
                                    @PathVariable UUID itemId,
                                    @CurrentDevice Device device) {
        return ItemResponse.from(itemService.toggleCheck(listId, itemId, device));
    }

    @DeleteMapping("/{itemId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Transactional
    public void delete(@PathVariable UUID listId,
                       @PathVariable UUID itemId,
                       @CurrentDevice Device device) {
        itemService.delete(listId, itemId, device);
    }
}
