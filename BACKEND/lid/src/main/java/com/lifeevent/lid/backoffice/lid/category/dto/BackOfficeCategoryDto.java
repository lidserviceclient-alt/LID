package com.lifeevent.lid.backoffice.lid.category.dto;

import com.lifeevent.lid.article.enumeration.CategoryLevel;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BackOfficeCategoryDto {
    private Integer id;
    private String nom;
    private String slug;
    private CategoryLevel niveau;
    private String parentId;
    private Integer ordre;
    private Boolean estActive;
    private String imageUrl;
}
