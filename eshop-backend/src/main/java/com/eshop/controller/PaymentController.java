package com.eshop.controller;

import com.stripe.Stripe;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/v2/payment")
public class PaymentController {

    @Value("${stripe.secret-key}") private String stripeSecretKey;
    @Value("${stripe.api-key}") private String stripeApiKey;

    @PostConstruct
    public void init() { Stripe.apiKey = stripeSecretKey; }

    @PostMapping("/process")
    public ResponseEntity<?> processPayment(@RequestBody Map<String, Object> body) throws Exception {
        Long amount = Long.valueOf(body.get("amount").toString());
        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(amount)
                .setCurrency("INR")
                .putMetadata("company", "EzyCart")
                .build();
        PaymentIntent paymentIntent = PaymentIntent.create(params);
        return ResponseEntity.ok(Map.of("success", true, "client_secret", paymentIntent.getClientSecret()));
    }

    @GetMapping("/stripeapikey")
    public ResponseEntity<?> getStripeApiKey() {
        System.out.println(">>> HIT api/v2/payment/stripeapikey <<<");
        return ResponseEntity.ok(Map.of("stripeApikey", stripeApiKey));
    }
}
