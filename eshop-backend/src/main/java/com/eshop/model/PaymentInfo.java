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
public class PaymentInfo {

    @Column(name = "payment_info_id")
    private String paymentId;

    @Column(name = "payment_status")
    private String status;

    @Column(name = "payment_type")
    private String type;
}