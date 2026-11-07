package com.eshop.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItem {
    @Column(name = "item_product_id")
    private Long productId;

    @Column(name = "item_name")
    private String name;

    @Column(name = "item_discount_price")
    private Double discountPrice;

    @Column(name = "item_qty")
    private Integer qty;

    @Column(name = "item_shop_id")
    private Long shopId;

    @Builder.Default
    @Column(name = "item_is_reviewed")
    private Boolean isReviewed = false;
}