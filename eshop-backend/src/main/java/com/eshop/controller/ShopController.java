package com.eshop.controller;

import com.eshop.model.Avatar;
import com.eshop.model.Shop;
import com.eshop.repository.ShopRepository;
import com.eshop.security.JwtTokenProvider;
import com.eshop.service.CloudinaryService;
import com.eshop.service.EmailService;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v2/shop")
public class ShopController {

    @Autowired private ShopRepository shopRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtTokenProvider tokenProvider;
    @Autowired private EmailService emailService;
    @Autowired private CloudinaryService cloudinaryService;

    @Value("${app.frontend-url:http://localhost:4200}")
    private String frontendUrl;

    @PostMapping("/create-shop")
    public ResponseEntity<?> createShop(@RequestBody Map<String, Object> body) throws Exception {
        String email = (String) body.get("email");
        if (shopRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body(Map.of("message", "User already exists"));
        }
        Avatar avatar = cloudinaryService.uploadImage((String) body.get("avatar"), "avatars");

        Map<String, Object> claims = new HashMap<>();
        claims.put("name", body.get("name"));
        claims.put("email", email);
        claims.put("password", passwordEncoder.encode((String) body.get("password")));
        claims.put("address", body.get("address"));
        claims.put("phoneNumber", body.get("phoneNumber") != null ? body.get("phoneNumber").toString() : "");
        claims.put("zipCode", body.get("zipCode") != null ? body.get("zipCode").toString() : "");
        claims.put("avatar_id", avatar != null ? avatar.getPublic_id() : null);
        claims.put("avatar_url", avatar != null ? avatar.getUrl() : null);

        String activationToken = tokenProvider.generateActivationToken(claims);
        String activationUrl = frontendUrl + "/seller/activation/" + activationToken;
        emailService.sendEmail(email, "Activate your Shop",
                "Hello " + body.get("name") + ", please click on the link to activate your shop: " + activationUrl);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "success", true,
                "message", "please check your email:- " + email + " to activate your shop!"
        ));
    }

    @PostMapping("/activation")
    public ResponseEntity<?> activateShop(@RequestBody Map<String, String> body, HttpServletResponse response) {
        Claims claims = tokenProvider.extractActivationClaims(body.get("activation_token"));
        String email = claims.get("email", String.class);
        if (shopRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body(Map.of("message", "User already exists"));
        }

        String phoneStr = claims.get("phoneNumber", String.class);
        String zipStr = claims.get("zipCode", String.class);

        Shop shop = Shop.builder()
                .name(claims.get("name", String.class))
                .email(email)
                .password(claims.get("password", String.class))
                .address(claims.get("address", String.class))
                .phoneNumber(phoneStr != null && !phoneStr.isBlank() ? Long.parseLong(phoneStr) : null)
                .zipCode(zipStr != null && !zipStr.isBlank() ? Long.parseLong(zipStr) : null)
                .avatar(new Avatar(claims.get("avatar_id", String.class), claims.get("avatar_url", String.class)))
                .build();

        shop = shopRepository.save(shop);
        String token = tokenProvider.generateToken(shop.getId(), "Seller");
        tokenProvider.addTokenCookie(response, "seller_token", token);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("success", true, "user", shop, "token", token));
    }

    @PostMapping("/login-shop")
    public ResponseEntity<?> loginShop(@RequestBody Map<String, String> body, HttpServletResponse response) {
        String email = body.get("email");
        String password = body.get("password");
        Optional<Shop> shopOpt = shopRepository.findByEmail(email);
        if (shopOpt.isEmpty() || !passwordEncoder.matches(password, shopOpt.get().getPassword())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Please provide the correct information"));
        }
        Shop shop = shopOpt.get();
        String token = tokenProvider.generateToken(shop.getId(), "Seller");
        tokenProvider.addTokenCookie(response, "seller_token", token);
        return ResponseEntity.ok(Map.of("success", true, "user", shop, "token", token));
    }

    @GetMapping("/getSeller")
    public ResponseEntity<?> getSeller(@AuthenticationPrincipal Shop authSeller) {
        return ResponseEntity.ok(Map.of("success", true, "seller", authSeller));
    }

    @GetMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        tokenProvider.clearTokenCookie(response, "seller_token");
        return ResponseEntity.ok(Map.of("success", true, "message", "Log out successful!"));
    }

    @GetMapping("/get-shop-info/{id}")
    public ResponseEntity<?> getShopInfo(@PathVariable Long id) {
        return shopRepository.findById(id)
                .map(s -> ResponseEntity.ok(Map.of("success", true, "shop", s)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/update-shop-avatar")
    public ResponseEntity<?> updateShopAvatar(@AuthenticationPrincipal Shop authSeller, @RequestBody Map<String, String> body) throws Exception {
        if (authSeller.getAvatar() != null && authSeller.getAvatar().getPublic_id() != null) {
            cloudinaryService.deleteImage(authSeller.getAvatar().getPublic_id());
        }
        Avatar newAvatar = cloudinaryService.uploadImage(body.get("avatar"), "avatars");
        authSeller.setAvatar(newAvatar);
        shopRepository.save(authSeller);
        return ResponseEntity.ok(Map.of("success", true, "seller", authSeller));
    }

    @PutMapping("/update-seller-info")
    public ResponseEntity<?> updateSellerInfo(@AuthenticationPrincipal Shop authSeller, @RequestBody Map<String, Object> body) {
        authSeller.setName((String) body.get("name"));
        authSeller.setDescription((String) body.get("description"));
        authSeller.setAddress((String) body.get("address"));
        if (body.get("phoneNumber") != null) authSeller.setPhoneNumber(Long.valueOf(body.get("phoneNumber").toString()));
        if (body.get("zipCode") != null) authSeller.setZipCode(Long.valueOf(body.get("zipCode").toString()));
        shopRepository.save(authSeller);
        return ResponseEntity.ok(Map.of("success", true, "shop", authSeller));
    }

    @PutMapping("/update-payment-methods")
    public ResponseEntity<?> updatePaymentMethods(@AuthenticationPrincipal Shop authSeller, @RequestBody Map<String, Object> body) {
        authSeller.setWithdrawMethod(body.get("withdrawMethod") != null ? body.get("withdrawMethod").toString() : null);
        shopRepository.save(authSeller);
        return ResponseEntity.ok(Map.of("success", true, "seller", authSeller));
    }

    @DeleteMapping("/delete-withdraw-method")
    public ResponseEntity<?> deleteWithdrawMethod(@AuthenticationPrincipal Shop authSeller) {
        authSeller.setWithdrawMethod(null);
        shopRepository.save(authSeller);
        return ResponseEntity.ok(Map.of("success", true, "seller", authSeller));
    }

    @GetMapping("/admin-all-sellers")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<?> getAllSellersAdmin() {
        return ResponseEntity.ok(Map.of("success", true, "sellers", shopRepository.findAllByOrderByCreatedAtDesc()));
    }

    @DeleteMapping("/delete-seller/{id}")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<?> deleteSellerAdmin(@PathVariable Long id) throws Exception {
        Optional<Shop> sOpt = shopRepository.findById(id);
        if (sOpt.isEmpty()) return ResponseEntity.badRequest().body(Map.of("message", "Seller is not available with this id"));
        if (sOpt.get().getAvatar() != null && sOpt.get().getAvatar().getPublic_id() != null) {
            cloudinaryService.deleteImage(sOpt.get().getAvatar().getPublic_id());
        }
        shopRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("success", true, "message", "Seller deleted successfully!"));
    }
}