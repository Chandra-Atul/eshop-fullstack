package com.eshop.model;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

@Entity @Table(name = "withdraw_requests")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Withdraw {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.EAGER) @JoinColumn(name = "shop_id", nullable = false)
    private Shop seller;
    @Column(nullable = false) private Double amount;
    @Builder.Default private String status = "Processing";
    @CreationTimestamp @Column(updatable = false) private LocalDateTime createdAt;
    @UpdateTimestamp private LocalDateTime updatedAt;
}
