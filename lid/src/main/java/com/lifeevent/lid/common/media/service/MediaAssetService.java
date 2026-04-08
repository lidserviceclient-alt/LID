package com.lifeevent.lid.common.media.service;

import com.lifeevent.lid.common.dto.BulkFileUploadResponseDto;
import com.lifeevent.lid.common.dto.FileUploadResponseDto;
import com.lifeevent.lid.common.media.dto.MediaAssetDto;
import com.lifeevent.lid.common.media.enumeration.MediaOwnerScope;
import org.springframework.data.domain.Page;
import org.springframework.web.multipart.MultipartFile;

public interface MediaAssetService {
    FileUploadResponseDto upload(MultipartFile file, String folder, MediaOwnerScope ownerScope, String ownerUserId, boolean overwrite);

    BulkFileUploadResponseDto uploadBulk(MultipartFile[] files, String folder, MediaOwnerScope ownerScope, String ownerUserId, boolean overwrite);

    Page<MediaAssetDto> search(MediaOwnerScope ownerScope, String ownerUserId, String folder, String query, int page, int size);

    void delete(String objectKey);
}
