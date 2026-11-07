package com.eshop.controller;

import com.eshop.model.Avatar;
import com.eshop.model.Message;
import com.eshop.repository.MessageRepository;
import com.eshop.service.CloudinaryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/v2/message")
public class MessageController {

    @Autowired private MessageRepository messageRepository;
    @Autowired private CloudinaryService cloudinaryService;

    @PostMapping("/create-new-message")
    public ResponseEntity<?> createMessage(@RequestBody Map<String, String> body) throws Exception {
        Avatar img = null;
        if (body.get("images") != null && !body.get("images").isEmpty()) {
            img = cloudinaryService.uploadImage(body.get("images"), "messages");
        }

        Message msg = Message.builder()
                .conversationId(Long.valueOf(body.get("conversationId")))
                .sender(body.get("sender"))
                .text(body.get("text"))
                .images(img)
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("success", true, "message", messageRepository.save(msg)));
    }

    @GetMapping("/get-all-messages/{id}")
    public ResponseEntity<?> getMessages(@PathVariable Long id) {
        return ResponseEntity.ok(Map.of("success", true, "messages", messageRepository.findByConversationId(id)));
    }
}
