package com.lifeevent.lid.content.dto;

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
    private String id;
    private String title;
    private String excerpt;
    private String content;
    private String imageUrl;
    private String category;
    private LocalDateTime date;
    private String author;
    private Boolean featured;
    private String readTime;
}
