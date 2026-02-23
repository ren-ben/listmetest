package com.oliwier.listmebackend.api;

import com.oliwier.listmebackend.api.dto.CreateListRequest;
import com.oliwier.listmebackend.api.dto.ListResponse;
import com.oliwier.listmebackend.api.dto.UpdateListRequest;
import com.oliwier.listmebackend.domain.model.Device;
import com.oliwier.listmebackend.domain.model.ListDevice;
import com.oliwier.listmebackend.domain.model.ShoppingList;
import com.oliwier.listmebackend.domain.repository.ListDeviceRepository;
import com.oliwier.listmebackend.domain.repository.ShoppingListRepository;
import com.oliwier.listmebackend.identity.CurrentDevice;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/lists")
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ListController {

    private final ShoppingListRepository listRepository;
    private final ListDeviceRepository listDeviceRepository;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    public ListResponse create(@CurrentDevice Device device, @Valid @RequestBody CreateListRequest req) {
        ShoppingList list = new ShoppingList();
        list.setId(UUID.randomUUID());
        list.setName(req.name());
        list.setEmoji(req.emoji() != null ? req.emoji() : "\uD83D\uDED2");
        list.setCreatedByDevice(device);

        ListDevice ld = new ListDevice(list, device, "owner");
        list.getListDevices().add(ld);

        list = listRepository.save(list);
        return ListResponse.from(list);
    }

    @GetMapping
    public List<ListResponse> getMyLists(@CurrentDevice Device device) {
        return listRepository.findAllByDeviceId(device.getId())
                .stream()
                .map(ListResponse::from)
                .toList();
    }

    @GetMapping("/{listId}")
    public ListResponse getList(@PathVariable UUID listId, @CurrentDevice Device device) {
        return ListResponse.from(requireAccess(listId, device));
    }

    @PutMapping("/{listId}")
    @Transactional
    public ListResponse update(@PathVariable UUID listId,
                               @CurrentDevice Device device,
                               @Valid @RequestBody UpdateListRequest req) {
        ShoppingList list = requireAccess(listId, device);
        list.setName(req.name());
        if (req.emoji() != null) list.setEmoji(req.emoji());
        return ListResponse.from(listRepository.save(list));
    }

    @DeleteMapping("/{listId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Transactional
    public void delete(@PathVariable UUID listId, @CurrentDevice Device device) {
        ShoppingList list = requireAccess(listId, device);

        // Remove this device from participants
        listDeviceRepository.findByListId(listId).stream()
                .filter(ld -> ld.getDevice().getId().equals(device.getId()))
                .findFirst()
                .ifPresent(listDeviceRepository::delete);

        // If no participants remain, delete the list entirely
        if (listDeviceRepository.findByListId(listId).isEmpty()) {
            listRepository.delete(list);
        }
    }

    private ShoppingList requireAccess(UUID listId, Device device) {
        ShoppingList list = listRepository.findById(listId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "List not found"));
        if (!listDeviceRepository.existsByListIdAndDeviceId(listId, device.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not a participant of this list");
        }
        return list;
    }
}
