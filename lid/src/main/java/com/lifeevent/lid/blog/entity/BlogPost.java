package com.lifeevent.lid.blog.entity;

import com.lifeevent.lid.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@Entity
@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "blog_post")
public class BlogPost extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 1000)
    private String excerpt;

    @Column(length = 10000)
    private String content;

    private String imageUrl;

    private String category;

    private LocalDateTime publishedAt;

    private String author;

    @Builder.Default
    private Boolean featured = false;

    private String readTime;
}
