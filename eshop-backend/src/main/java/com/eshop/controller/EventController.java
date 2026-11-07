package com.eshop.controller;

import com.eshop.model.Avatar;
import com.eshop.model.Event;
import com.eshop.model.Shop;
import com.eshop.repository.EventRepository;
import com.eshop.repository.ShopRepository;
import com.eshop.service.CloudinaryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/v2/event")
public class EventController {

    @Autowired private EventRepository eventRepository;
    @Autowired private ShopRepository shopRepository;
    @Autowired private CloudinaryService cloudinaryService;

    @PostMapping("/create-event")
    public ResponseEntity<?> createEvent(@RequestBody Map<String, Object> body) throws Exception {
        Long shopId = Long.valueOf(body.get("shopId").toString());
        Optional<Shop> shopOpt = shopRepository.findById(shopId);
        if (shopOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Shop Id is invalid!"));
        }

        List<Avatar> imagesLinks = new ArrayList<>();
        Object imgData = body.get("images");
        List<String> images = (imgData instanceof List) ? (List<String>) imgData : Collections.singletonList(imgData.toString());

        for (String base64 : images) {
            imagesLinks.add(cloudinaryService.uploadImage(base64, "products"));
        }

        Event event = Event.builder()
                .name((String) body.get("name"))
                .description((String) body.get("description"))
                .category((String) body.get("category"))
                .tags((String) body.get("tags"))
                .discountPrice(Double.valueOf(body.get("discountPrice").toString()))
                .stock(Integer.valueOf(body.get("stock").toString()))
                .shopId(shopId)
                .shop(shopOpt.get())
                .images(imagesLinks)
                .start_Date(LocalDateTime.now())
                .finish_Date(LocalDateTime.now().plusDays(7))
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("success", true, "event", eventRepository.save(event)));
    }

    @GetMapping("/get-all-events")
    public ResponseEntity<?> getAllEvents() {
        return ResponseEntity.ok(Map.of("success", true, "events", eventRepository.findAllByOrderByCreatedAtDesc()));
    }

    @GetMapping("/get-all-events/{id}")
    public ResponseEntity<?> getShopEvents(@PathVariable Long id) {
        return ResponseEntity.ok(Map.of("success", true, "events", eventRepository.findByShopId(id)));
    }

    @DeleteMapping("/delete-shop-event/{id}")
    public ResponseEntity<?> deleteEvent(@PathVariable Long id) throws Exception {
        Optional<Event> eOpt = eventRepository.findById(id);
        if (eOpt.isEmpty()) return ResponseEntity.notFound().build();
        for (Avatar img : eOpt.get().getImages()) {
            cloudinaryService.deleteImage(img.getPublic_id());
        }
        eventRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("success", true, "message", "Event Deleted successfully!"));
    }

    @GetMapping("/admin-all-events")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<?> getAllEventsAdmin() {
        return ResponseEntity.ok(Map.of("success", true, "events", eventRepository.findAllByOrderByCreatedAtDesc()));
    }
}
