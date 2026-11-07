package com.eshop.model;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity @Table(name = "coupon_codes")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CouponCode {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, unique = true) private String name;
    @Column(nullable = false) private Double value;
    private Double minAmount;
    private Double maxAmount;
    @Column(nullable = false) private Long shopId;
    @CreationTimestamp @Column(updatable = false) private LocalDateTime createdAt;
}
