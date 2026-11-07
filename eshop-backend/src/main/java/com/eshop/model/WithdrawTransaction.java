package com.eshop.model;
import jakarta.persistence.Embeddable;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;
@Embeddable @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class WithdrawTransaction {
    @Builder.Default private String transactionId = UUID.randomUUID().toString();
    private Double amount;
    @Builder.Default private String status = "Processing";
    @Builder.Default private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt;
}
