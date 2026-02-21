package com.lifeevent.lid.content.entity;

import com.lifeevent.lid.core.entity.UuidEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "blog_post")
@Getter
@Setter
public class BlogPost extends UuidEntity {
    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "excerpt", columnDefinition = "TEXT")
    private String excerpt;

    @Column(name = "content", columnDefinition = "TEXT")
    private String content;

    @Column(name = "image_url", length = 512)
    private String imageUrl;

    @Column(name = "category", length = 100)
    private String category;

    @Column(name = "date")
    private LocalDateTime date;

    @Column(name = "author", length = 120)
    private String author;

    @Column(name = "featured")
    private Boolean featured = false;

    @Column(name = "read_time", length = 50)
    private String readTime;

    @PrePersist
    void onCreate() {
        if (date == null) {
            date = LocalDateTime.now();
        }
        if (featured == null) {
            featured = false;
        }
    }
}
