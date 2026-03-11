package com.lifeevent.lid.backoffice.lid.blog.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BackOfficeBlogPostDto {
    private Long id;
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
