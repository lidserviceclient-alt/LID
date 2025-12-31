package com.lifeevent.lid.batch.service;

import org.springframework.batch.core.BatchStatus;
import org.springframework.web.multipart.MultipartFile;

public interface BatchService {
    BatchStatus launchArticlesImport(MultipartFile csvFile);
}
