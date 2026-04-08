package com.lifeevent.lid.common.media.entity;

import com.lifeevent.lid.common.entity.BaseEntity;
import com.lifeevent.lid.common.media.enumeration.MediaOwnerScope;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(
        name = "media_asset",
        indexes = {
                @Index(name = "idx_media_asset_scope_folder_created", columnList = "owner_scope,folder,created_at"),
                @Index(name = "idx_media_asset_scope_created", columnList = "owner_scope,created_at"),
                @Index(name = "idx_media_asset_owner_created", columnList = "owner_user_id,created_at"),
                @Index(name = "idx_media_asset_owner_filename", columnList = "owner_scope,owner_user_id,original_filename", unique = true),
                @Index(name = "idx_media_asset_object_key", columnList = "object_key", unique = true)
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
public class MediaAssetEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "owner_scope", nullable = false, length = 32)
    private MediaOwnerScope ownerScope;

    @Column(name = "owner_user_id", nullable = false, length = 128)
    private String ownerUserId;

    @Column(nullable = false, length = 128)
    private String folder;

    @Column(name = "object_key", nullable = false, unique = true, length = 512)
    private String objectKey;

    @Column(name = "original_filename", nullable = false, length = 255)
    private String originalFilename;

    @Column(name = "stored_filename", nullable = false, length = 255)
    private String storedFilename;

    @Column(name = "content_type", nullable = false, length = 100)
    private String contentType;

    @Column(name = "original_size", nullable = false)
    private long originalSize;

    @Column(nullable = false)
    private long size;
}
