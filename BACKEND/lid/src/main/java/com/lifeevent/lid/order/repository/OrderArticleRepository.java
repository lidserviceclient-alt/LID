package com.lifeevent.lid.order.repository;

import com.lifeevent.lid.order.entity.OrderArticle;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderArticleRepository extends JpaRepository<OrderArticle, Long> {
}
