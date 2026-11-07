package com.eshop.controller;

import com.eshop.model.Shop;
import com.eshop.model.Withdraw;
import com.eshop.model.WithdrawTransaction;
import com.eshop.repository.ShopRepository;
import com.eshop.repository.WithdrawRepository;
import com.eshop.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v2/withdraw")
public class WithdrawController {

    @Autowired private WithdrawRepository withdrawRepository;
    @Autowired private ShopRepository shopRepository;
    @Autowired private EmailService emailService;

    @PostMapping("/create-withdraw-request")
    public ResponseEntity<?> createWithdrawRequest(@RequestBody Map<String, Double> body, @AuthenticationPrincipal Shop seller) {
        Double amount = body.get("amount");
        emailService.sendEmail(seller.getEmail(), "Withdraw Request",
                "Hello " + seller.getName() + ", Your withdraw request of $" + amount + " is processing. It will take 3days to 7days to processing!");

        Withdraw withdraw = Withdraw.builder()
                .seller(seller)
                .amount(amount)
                .build();

        seller.setAvailableBalance(seller.getAvailableBalance() - amount);
        shopRepository.save(seller);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("success", true, "withdraw", withdrawRepository.save(withdraw)));
    }

    @GetMapping("/get-all-withdraw-request")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<?> getAllWithdrawRequests() {
        return ResponseEntity.ok(Map.of("success", true, "withdraws", withdrawRepository.findAllByOrderByCreatedAtDesc()));
    }

    @PutMapping("/update-withdraw-request/{id}")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<?> updateWithdrawRequest(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        Long sellerId = Long.valueOf(body.get("sellerId").toString());
        Optional<Withdraw> wOpt = withdrawRepository.findById(id);
        if (wOpt.isEmpty()) return ResponseEntity.notFound().build();

        Withdraw withdraw = wOpt.get();
        withdraw.setStatus("succeed");
        withdraw.setUpdatedAt(LocalDateTime.now());
        withdrawRepository.save(withdraw);

        shopRepository.findById(sellerId).ifPresent(seller -> {
            seller.getTransections().add(WithdrawTransaction.builder()
                    .amount(withdraw.getAmount())
                    .status(withdraw.getStatus())
                    .updatedAt(withdraw.getUpdatedAt())
                    .build());
            shopRepository.save(seller);

            emailService.sendEmail(seller.getEmail(), "Payment confirmation",
                    "Hello " + seller.getName() + ", Your withdraw request of $" + withdraw.getAmount() + " is on the way. Delivery time depends on your bank's rules it usually takes 3days to 7days.");
        });

        return ResponseEntity.ok(Map.of("success", true, "withdraw", withdraw));
    }
}
