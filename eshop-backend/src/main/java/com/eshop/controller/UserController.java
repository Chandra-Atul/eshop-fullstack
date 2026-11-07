package com.eshop.controller;

import com.eshop.model.Address;
import com.eshop.model.Avatar;
import com.eshop.model.User;
import com.eshop.repository.UserRepository;
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
@RequestMapping("/api/v2/user")
public class UserController {

    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtTokenProvider tokenProvider;
    @Autowired private EmailService emailService;
    @Autowired private CloudinaryService cloudinaryService;

    @Value("${app.frontend-url:http://localhost:4200}")
    private String frontendUrl;

    @PostMapping("/create-user")
    public ResponseEntity<?> createUser(@RequestBody Map<String, Object> body) throws Exception {
        String email = (String) body.get("email");
        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body(Map.of("message", "User already exists"));
        }
        Avatar avatar = cloudinaryService.uploadImage((String) body.get("avatar"), "avatars");

        Map<String, Object> claims = new HashMap<>();
        claims.put("name", body.get("name"));
        claims.put("email", email);
        claims.put("password", passwordEncoder.encode((String) body.get("password")));
        claims.put("avatar_id", avatar != null ? avatar.getPublic_id() : null);
        claims.put("avatar_url", avatar != null ? avatar.getUrl() : null);

        String activationToken = tokenProvider.generateActivationToken(claims);
        String activationUrl = frontendUrl + "/activation/" + activationToken;

        emailService.sendEmail(email, "Activate your account",
                "Hello " + body.get("name") + ", please click on the link to activate your account: " + activationUrl);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "success", true,
                "message", "please check your email:- " + email + " to activate your account!"
        ));
    }

    @PostMapping("/activation")
    public ResponseEntity<?> activateUser(@RequestBody Map<String, String> body, HttpServletResponse response) {
        Claims claims = tokenProvider.extractActivationClaims(body.get("activation_token"));
        String email = claims.get("email", String.class);
        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body(Map.of("message", "User already exists"));
        }

        User user = User.builder()
                .name(claims.get("name", String.class))
                .email(email)
                .password(claims.get("password", String.class))
                .avatar(new Avatar(claims.get("avatar_id", String.class), claims.get("avatar_url", String.class)))
                .build();

        user = userRepository.save(user);
        String token = tokenProvider.generateToken(user.getId(), user.getRole());
        tokenProvider.addTokenCookie(response, "token", token);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("success", true, "user", user, "token", token));
    }

    @PostMapping("/login-user")
    public ResponseEntity<?> loginUser(@RequestBody Map<String, String> body, HttpServletResponse response) {
        String email = body.get("email");
        String password = body.get("password");
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty() || !passwordEncoder.matches(password, userOpt.get().getPassword())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid email or password!"));
        }
        User user = userOpt.get();
        String token = tokenProvider.generateToken(user.getId(), user.getRole());
        tokenProvider.addTokenCookie(response, "token", token);
        return ResponseEntity.ok(Map.of("success", true, "user", user, "token", token));
    }

    @GetMapping("/getuser")
    public ResponseEntity<?> getUser(@AuthenticationPrincipal User authUser) {
        return ResponseEntity.ok(Map.of("success", true, "user", authUser));
    }

    @GetMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        tokenProvider.clearTokenCookie(response, "token");
        return ResponseEntity.ok(Map.of("success", true, "message", "Log out successful!"));
    }

    @PutMapping("/update-user-info")
    public ResponseEntity<?> updateUserInfo(@AuthenticationPrincipal User authUser, @RequestBody Map<String, Object> body) {
        String password = (String) body.get("password");
        if (!passwordEncoder.matches(password, authUser.getPassword())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Please provide the correct information"));
        }
        authUser.setName((String) body.get("name"));
        authUser.setEmail((String) body.get("email"));
        if (body.get("phoneNumber") != null) {
            authUser.setPhoneNumber(Long.valueOf(body.get("phoneNumber").toString()));
        }
        userRepository.save(authUser);
        return ResponseEntity.ok(Map.of("success", true, "user", authUser));
    }

    @PutMapping("/update-avatar")
    public ResponseEntity<?> updateAvatar(@AuthenticationPrincipal User authUser, @RequestBody Map<String, String> body) throws Exception {
        String avatarBase64 = body.get("avatar");
        if (avatarBase64 != null && !avatarBase64.isEmpty()) {
            if (authUser.getAvatar() != null && authUser.getAvatar().getPublic_id() != null) {
                cloudinaryService.deleteImage(authUser.getAvatar().getPublic_id());
            }
            Avatar newAvatar = cloudinaryService.uploadImage(avatarBase64, "avatars");
            authUser.setAvatar(newAvatar);
            userRepository.save(authUser);
        }
        return ResponseEntity.ok(Map.of("success", true, "user", authUser));
    }

    @PutMapping("/update-user-addresses")
    public ResponseEntity<?> updateUserAddresses(@AuthenticationPrincipal User authUser, @RequestBody Address address) {
        boolean typeExists = authUser.getAddresses().stream()
                .anyMatch(a -> a.getAddressType() != null && a.getAddressType().equals(address.getAddressType()) && !a.getAddressId().equals(address.getAddressId()));
        if (typeExists) {
            return ResponseEntity.badRequest().body(Map.of("message", address.getAddressType() + " address already exists"));
        }
        authUser.getAddresses().removeIf(a -> a.getAddressId().equals(address.getAddressId()));
        authUser.getAddresses().add(address);
        userRepository.save(authUser);
        return ResponseEntity.ok(Map.of("success", true, "user", authUser));
    }

    @DeleteMapping("/delete-user-address/{id}")
    public ResponseEntity<?> deleteUserAddress(@AuthenticationPrincipal User authUser, @PathVariable String id) {
        authUser.getAddresses().removeIf(a -> a.getAddressId().equals(id));
        userRepository.save(authUser);
        return ResponseEntity.ok(Map.of("success", true, "user", authUser));
    }

    @PutMapping("/update-user-password")
    public ResponseEntity<?> updateUserPassword(@AuthenticationPrincipal User authUser, @RequestBody Map<String, String> body) {
        String oldPassword = body.get("oldPassword");
        String newPassword = body.get("newPassword");
        String confirmPassword = body.get("confirmPassword");
        if (!passwordEncoder.matches(oldPassword, authUser.getPassword())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Old password is incorrect!"));
        }
        if (!newPassword.equals(confirmPassword)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Password doesn't matched with each other!"));
        }
        authUser.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(authUser);
        return ResponseEntity.ok(Map.of("success", true, "message", "Password updated successfully!"));
    }

    @GetMapping("/user-info/{id}")
    public ResponseEntity<?> getUserInfo(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(u -> ResponseEntity.ok(Map.of("success", true, "user", u)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/admin-all-users")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<?> getAllUsersAdmin() {
        return ResponseEntity.ok(Map.of("success", true, "users", userRepository.findAllByOrderByCreatedAtDesc()));
    }

    @DeleteMapping("/delete-user/{id}")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<?> deleteUserAdmin(@PathVariable Long id) throws Exception {
        Optional<User> uOpt = userRepository.findById(id);
        if (uOpt.isEmpty()) return ResponseEntity.badRequest().body(Map.of("message", "User is not available with this id"));
        if (uOpt.get().getAvatar() != null && uOpt.get().getAvatar().getPublic_id() != null) {
            cloudinaryService.deleteImage(uOpt.get().getAvatar().getPublic_id());
        }
        userRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("success", true, "message", "User deleted successfully!"));
    }
}