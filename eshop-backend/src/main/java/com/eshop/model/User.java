package com.eshop.model;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity @Table(name = "users")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false) private String name;
    @Column(nullable = false, unique = true) private String email;
    @Column(nullable = false) @JsonProperty(access = JsonProperty.Access.WRITE_ONLY) private String password;
    private Long phoneNumber;
    @Builder.Default private String role = "user";
    @Embedded private Avatar avatar;
    @ElementCollection @CollectionTable(name = "user_addresses", joinColumns = @JoinColumn(name = "user_id"))
    @Builder.Default private List<Address> addresses = new ArrayList<>();
    private String resetPasswordToken;
    private LocalDateTime resetPasswordTime;
    @CreationTimestamp @Column(updatable = false) private LocalDateTime createdAt;
}
