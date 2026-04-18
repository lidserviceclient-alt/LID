package com.lifeevent.lid.catalog.mapper;

import com.lifeevent.lid.article.entity.Article;
import com.lifeevent.lid.article.entity.Category;
import com.lifeevent.lid.catalog.dto.ArticleCatalogDto;
import com.lifeevent.lid.catalog.dto.CatalogCategoryDto;
import com.lifeevent.lid.catalog.dto.CatalogProductDetailsDto;
import com.lifeevent.lid.catalog.dto.CatalogProductDto;
import com.lifeevent.lid.catalog.dto.ProductReviewDto;
import com.lifeevent.lid.review.entity.ProductReview;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;
import java.util.Locale;

@Component
public class CatalogMapper {

    public ArticleCatalogDto toArticleCatalogDto(Article article) {
        return ArticleCatalogDto.builder()
                .id(article.getId())
                .name(article.getName())
                .image(article.getImg())
                .price(article.getPrice())
                .discountPercent(article.getDiscountPercent())
                .brand(article.getBrand())
                .isFlashSale(article.getIsFlashSale())
                .isFeatured(article.getIsFeatured())
                .isBestSeller(article.getIsBestSeller())
                .build();
    }

    public CatalogProductDto toCatalogProductDto(Article article, int stock, double rating, long reviews, BigDecimal displayPrice, BigDecimal initialPrice) {
        Category category = firstCategory(article);
        String mainImageUrl = resolveMainImageUrl(article);
        List<String> secondaryImages = resolveSecondaryImages(article);
        return new CatalogProductDto(
                String.valueOf(article.getId()),
                article.getSku(),
                article.getName(),
                buildSlug(article),
                displayPrice,
                initialPrice,
                article.getBrand(),
                category == null ? null : String.valueOf(category.getId()),
                category == null ? null : category.getName(),
                category == null ? null : category.getSlug(),
                Boolean.TRUE.equals(article.getIsFeatured()),
                Boolean.TRUE.equals(article.getIsBestSeller()),
                mainImageUrl,
                secondaryImages,
                stock,
                article.getCreatedAt(),
                rating,
                reviews
        );
    }

    public CatalogProductDetailsDto toCatalogProductDetailsDto(Article article, int stock, List<String> images, BigDecimal displayPrice, BigDecimal initialPrice) {
        Category category = firstCategory(article);
        String mainImage = resolveMainImageUrl(article);
        List<String> secondaryImages = resolveSecondaryImages(article);
        return new CatalogProductDetailsDto(
                String.valueOf(article.getId()),
                article.getSku(),
                article.getName(),
                buildSlug(article),
                displayPrice,
                initialPrice,
                article.getBrand(),
                article.getDescription(),
                toBigDecimal(article.getVat() == null ? null : Double.valueOf(article.getVat())),
                category == null ? null : String.valueOf(category.getId()),
                category == null ? null : category.getName(),
                category == null ? null : category.getSlug(),
                Boolean.TRUE.equals(article.getIsFeatured()),
                Boolean.TRUE.equals(article.getIsBestSeller()),
                mainImage,
                secondaryImages,
                images,
                stock,
                article.getCreatedAt()
        );
    }

    public CatalogCategoryDto toCatalogCategoryDto(Category category, boolean featured) {
        return new CatalogCategoryDto(
                String.valueOf(category.getId()),
                null,
                null,
                category.getName(),
                category.getSlug(),
                category.getImageUrl(),
                category.getLevel() == null ? null : category.getLevel().name(),
                category.getOrderIdx(),
                Boolean.TRUE.equals(category.getIsActivated()),
                featured,
                category.getCreatedAt(),
                category.getUpdatedAt()
        );
    }

    public ProductReviewDto toProductReviewDto(ProductReview review, boolean likedByMe) {
        String userId = review.getCustomer() == null ? null : review.getCustomer().getUserId();
        String userName = resolveUserName(review);
        String userAvatarUrl = review.getCustomer() == null ? null : review.getCustomer().getAvatarUrl();
        return new ProductReviewDto(
                String.valueOf(review.getId()),
                review.getArticle() == null ? null : String.valueOf(review.getArticle().getId()),
                userId,
                userName,
                userAvatarUrl,
                review.getRating(),
                review.getContent(),
                review.getLikeCount() == null ? 0L : review.getLikeCount(),
                likedByMe,
                review.getCreatedAt()
        );
    }

    private Category firstCategory(Article article) {
        if (article.getCategories() == null || article.getCategories().isEmpty()) {
            return null;
        }
        return article.getCategories().get(0);
    }

    private String buildSlug(Article article) {
        if (article == null || article.getName() == null) {
            return null;
        }
        String base = article.getName().trim().toLowerCase(Locale.ROOT).replace(" ", "-");
        return base + "-" + article.getId();
    }

    private BigDecimal toBigDecimal(Double value) {
        return value == null ? null : BigDecimal.valueOf(value);
    }

    private String resolveUserName(ProductReview review) {
        if (review.getCustomer() == null) {
            return "Utilisateur";
        }
        String first = review.getCustomer().getFirstName() == null ? "" : review.getCustomer().getFirstName().trim();
        String last = review.getCustomer().getLastName() == null ? "" : review.getCustomer().getLastName().trim();
        String full = (first + " " + last).trim();
        if (!full.isBlank()) {
            return full;
        }
        return review.getCustomer().getEmail() == null ? "Utilisateur" : review.getCustomer().getEmail();
    }

    private String resolveMainImageUrl(Article article) {
        if (article == null) {
            return null;
        }
        return article.getMainImageUrl();
    }

    private List<String> resolveSecondaryImages(Article article) {
        if (article == null || article.getSecondaryImageUrls() == null) {
            return List.of();
        }
        return article.getSecondaryImageUrls().stream()
                .map(value -> value == null ? null : value.trim())
                .filter(value -> value != null && !value.isBlank())
                .toList();
    }
}
