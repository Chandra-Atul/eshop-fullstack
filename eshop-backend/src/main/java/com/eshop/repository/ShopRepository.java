package com.eshop.repository;
import com.eshop.model.Shop;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
public interface ShopRepository extends JpaRepository<Shop, Long> {
    Optional<Shop> findByEmail(String email);
    Boolean existsByEmail(String email);
    List<Shop> findAllByOrderByCreatedAtDesc();
}
