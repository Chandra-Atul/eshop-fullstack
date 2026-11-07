package com.eshop.controller;

import com.eshop.model.Conversation;
import com.eshop.repository.ConversationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v2/conversation")
public class ConversationController {

    @Autowired private ConversationRepository conversationRepository;

    @PostMapping("/create-new-conversation")
    public ResponseEntity<?> createConversation(@RequestBody Map<String, String> body) {
        String groupTitle = body.get("groupTitle");
        Optional<Conversation> exist = conversationRepository.findByGroupTitle(groupTitle);
        if (exist.isPresent()) {
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("success", true, "conversation", exist.get()));
        }

        Conversation conv = Conversation.builder()
                .groupTitle(groupTitle)
                .members(List.of(body.get("userId"), body.get("sellerId")))
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("success", true, "conversation", conversationRepository.save(conv)));
    }

    @GetMapping("/get-all-conversation-seller/{id}")
    public ResponseEntity<?> getSellerConversations(@PathVariable String id) {
        return ResponseEntity.ok(Map.of("success", true, "conversations", conversationRepository.findByMemberId(id)));
    }

    @GetMapping("/get-all-conversation-user/{id}")
    public ResponseEntity<?> getUserConversations(@PathVariable String id) {
        return ResponseEntity.ok(Map.of("success", true, "conversations", conversationRepository.findByMemberId(id)));
    }

    @PutMapping("/update-last-message/{id}")
    public ResponseEntity<?> updateLastMessage(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Optional<Conversation> convOpt = conversationRepository.findById(id);
        if (convOpt.isEmpty()) return ResponseEntity.notFound().build();
        Conversation conv = convOpt.get();
        conv.setLastMessage(body.get("lastMessage"));
        conv.setLastMessageId(body.get("lastMessageId"));
        return ResponseEntity.ok(Map.of("success", true, "conversation", conversationRepository.save(conv)));
    }
}
