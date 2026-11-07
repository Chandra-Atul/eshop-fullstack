package com.eshop.repository;
import com.eshop.model.Withdraw;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface WithdrawRepository extends JpaRepository<Withdraw, Long> {
    List<Withdraw> findAllByOrderByCreatedAtDesc();
}
