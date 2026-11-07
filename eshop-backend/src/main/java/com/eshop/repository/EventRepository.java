package com.eshop.repository;
import com.eshop.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findByShopId(Long shopId);
    List<Event> findAllByOrderByCreatedAtDesc();
}
