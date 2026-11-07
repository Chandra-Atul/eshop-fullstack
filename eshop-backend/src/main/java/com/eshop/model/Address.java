package com.eshop.model;
import jakarta.persistence.Embeddable;
import lombok.*;
import java.util.UUID;
@Embeddable @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Address {
    @Builder.Default private String addressId = UUID.randomUUID().toString();
    private String country;
    private String city;
    private String address1;
    private String address2;
    private Long zipCode;
    private String addressType;
}
