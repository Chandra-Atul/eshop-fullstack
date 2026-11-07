package com.eshop.model;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity @Table(name = "orders")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Order {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ElementCollection @CollectionTable(name = "order_items", joinColumns = @JoinColumn(name = "order_id"))
    @Builder.Default private List<OrderItem> cart = new ArrayList<>();
    @Embedded private Address shippingAddress;
    @Column(nullable = false) private Long userId;
    private String userName;
    private String userEmail;
    @Column(nullable = false) private Double totalPrice;
    @Builder.Default private String status = "Processing";
    @Embedded private PaymentInfo paymentInfo;
    private LocalDateTime paidAt;
    private LocalDateTime deliveredAt;
    @CreationTimestamp @Column(updatable = false) private LocalDateTime createdAt;
}
