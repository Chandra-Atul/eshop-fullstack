package com.eshop.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String category;

    private String tags;
    private Double originalPrice;

    @Column(nullable = false)
    private Double discountPrice;

    @Column(nullable = false)
    private Integer stock;

    @ElementCollection
    @CollectionTable(name = "product_images", joinColumns = @JoinColumn(name = "product_id"))
    @AttributeOverrides({
            @AttributeOverride(name = "public_id", column = @Column(name = "img_public_id")),
            @AttributeOverride(name = "url", column = @Column(name = "img_url"))
    })
    @Builder.Default
    private List<Avatar> images = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "product_reviews", joinColumns = @JoinColumn(name = "parent_product_id"))
    @Builder.Default
    private List<ProductReview> reviews = new ArrayList<>();

    private Double ratings;

    @Column(nullable = false)
    private Long shopId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "shop_fk")
    private Shop shop;

    @Builder.Default
    private Integer sold_out = 0;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}