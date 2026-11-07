package com.eshop.controller;

import com.eshop.model.CouponCode;
import com.eshop.repository.CouponCodeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v2/coupon")
public class CouponController {

    @Autowired private CouponCodeRepository couponRepository;

    @PostMapping("/create-coupon-code")
    public ResponseEntity<?> createCoupon(@RequestBody CouponCode coupon) {
        if (couponRepository.findByName(coupon.getName()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Coupoun code already exists!"));
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("success", true, "coupounCode", couponRepository.save(coupon)));
    }

    @GetMapping("/get-coupon/{id}")
    public ResponseEntity<?> getCoupons(@PathVariable Long id) {
        return ResponseEntity.ok(Map.of("success", true, "couponCodes", couponRepository.findByShopId(id)));
    }

    @DeleteMapping("/delete-coupon/{id}")
    public ResponseEntity<?> deleteCoupon(@PathVariable Long id) {
        couponRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("success", true, "message", "Coupon code deleted successfully!"));
    }

    @GetMapping("/get-coupon-value/{name}")
    public ResponseEntity<?> getCouponValue(@PathVariable String name) {
        Optional<CouponCode> cOpt = couponRepository.findByName(name);
        return cOpt.map(c -> ResponseEntity.ok(Map.of("success", true, "couponCode", c)))
                .orElse(ResponseEntity.badRequest().build());
    }
}
