package com.eshop.model;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity @Table(name = "shops")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Shop {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false) private String name;
    @Column(nullable = false, unique = true) private String email;
    @Column(nullable = false) @JsonProperty(access = JsonProperty.Access.WRITE_ONLY) private String password;
    @Column(columnDefinition = "TEXT") private String description;
    @Column(nullable = false) private String address;
    @Column(nullable = false) private Long phoneNumber;
    @Builder.Default private String role = "Seller";
    @Embedded private Avatar avatar;
    @Column(nullable = false) private Long zipCode;
    private String withdrawMethod;
    @Builder.Default private Double availableBalance = 0.0;
    @ElementCollection @CollectionTable(name = "shop_transactions", joinColumns = @JoinColumn(name = "shop_id"))
    @Builder.Default private List<WithdrawTransaction> transections = new ArrayList<>();
    private String resetPasswordToken;
    private LocalDateTime resetPasswordTime;
    @CreationTimestamp @Column(updatable = false) private LocalDateTime createdAt;
}
