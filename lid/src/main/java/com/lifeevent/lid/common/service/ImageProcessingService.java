package com.lifeevent.lid.common.service;

import com.lifeevent.lid.common.dto.ProcessedImageFile;
import org.springframework.web.multipart.MultipartFile;

public interface ImageProcessingService {
    ProcessedImageFile compress(MultipartFile file);
}
