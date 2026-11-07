package com.eshop.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;
import java.time.LocalDateTime;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductReview {
    private Long userId;
    private String userName;
    private String userEmail;
    private Double rating;
    private String comment;

    // Explicitly rename column to target_product_id or review_product_id
    @Column(name = "target_product_id")
    private Long productId;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}