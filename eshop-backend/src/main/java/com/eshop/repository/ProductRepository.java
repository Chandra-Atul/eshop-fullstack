package com.eshop.repository;
import com.eshop.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByShopId(Long shopId);
    List<Product> findAllByOrderByCreatedAtDesc();
}
