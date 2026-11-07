package com.eshop.model;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity @Table(name = "messages")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Message {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long conversationId;
    private String sender;
    @Column(columnDefinition = "TEXT") private String text;
    @Embedded private Avatar images;
    @CreationTimestamp @Column(updatable = false) private LocalDateTime createdAt;
}
