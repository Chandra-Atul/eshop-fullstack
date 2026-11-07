package com.eshop.repository;
import com.eshop.model.CouponCode;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
public interface CouponCodeRepository extends JpaRepository<CouponCode, Long> {
    Optional<CouponCode> findByName(String name);
    List<CouponCode> findByShopId(Long shopId);
}
