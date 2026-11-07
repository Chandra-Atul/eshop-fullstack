package com.eshop.model;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity @Table(name = "conversations")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Conversation {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String groupTitle;
    @ElementCollection @CollectionTable(name = "conversation_members", joinColumns = @JoinColumn(name = "conversation_id"))
    @Builder.Default private List<String> members = new ArrayList<>();
    private String lastMessage;
    private String lastMessageId;
    @CreationTimestamp @Column(updatable = false) private LocalDateTime createdAt;
    @UpdateTimestamp private LocalDateTime updatedAt;
}
