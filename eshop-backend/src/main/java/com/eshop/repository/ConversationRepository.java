package com.eshop.repository;
import com.eshop.model.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;
public interface ConversationRepository extends JpaRepository<Conversation, Long> {
    Optional<Conversation> findByGroupTitle(String groupTitle);
    @Query("SELECT c FROM Conversation c JOIN c.members m WHERE m = :memberId ORDER BY c.updatedAt DESC, c.createdAt DESC")
    List<Conversation> findByMemberId(@Param("memberId") String memberId);
}
