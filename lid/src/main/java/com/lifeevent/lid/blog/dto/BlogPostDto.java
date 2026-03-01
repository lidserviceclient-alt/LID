package com.lifeevent.lid.blog.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BlogPostDto {
    private Long id;
    private String title;
    private String excerpt;
    private String content;
    private String imageUrl;
    private Boolean featured;
    private LocalDateTime publishedAt;
}
