package com.eshop.repository;

import com.eshop.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);

    @Query("SELECT o FROM Order o WHERE EXISTS (SELECT 1 FROM o.cart c WHERE c.shopId = :shopId) ORDER BY o.createdAt DESC")
    List<Order> findByShopIdOrderByCreatedAtDesc(@Param("shopId") Long shopId);

    List<Order> findAllByOrderByDeliveredAtDescCreatedAtDesc();
}