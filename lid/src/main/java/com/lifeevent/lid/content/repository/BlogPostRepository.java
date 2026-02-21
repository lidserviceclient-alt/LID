package com.lifeevent.lid.content.repository;

import com.lifeevent.lid.content.entity.BlogPost;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BlogPostRepository extends JpaRepository<BlogPost, String> {
}
