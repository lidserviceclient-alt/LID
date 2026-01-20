package com.lifeevent.lid.batch.service.impl;

import com.lifeevent.lid.article.repository.ArticleRepository;
import com.lifeevent.lid.batch.service.BatchService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.core.BatchStatus;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobParameters;
import org.springframework.batch.core.JobParametersBuilder;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;

@Slf4j
@Service
@RequiredArgsConstructor
public class BatchServiceImpl implements BatchService {
    private final JobLauncher jobLauncher;
    private final Job importArticlesJob;
    private final ArticleRepository articleRepository;
        @Override
        public BatchStatus launchArticlesImport(MultipartFile csvFile) {
            try {
                log.info("========== DÉMARRAGE DU TEST BATCH ==========");

                Path tempFile = Files.createTempFile("articles-", ".csv");
                Files.copy(csvFile.getInputStream(), tempFile, StandardCopyOption.REPLACE_EXISTING);
                // Lancer le job
                JobParameters jobParameters = new JobParametersBuilder()
                        .addString("filePath", tempFile.toAbsolutePath().toString())
                        .addLong("timestamp", System.currentTimeMillis())
                        .toJobParameters();

                var execution = jobLauncher.run(importArticlesJob, jobParameters);

                log.info("Status du job: {}", execution.getStatus());
                log.info("Nombre d'articles après import: {}", articleRepository.count());
                log.info("========== FIN DU TEST BATCH ==========");

                Files.deleteIfExists(tempFile);
                return execution.getStatus();

            } catch (Exception e) {
                log.error("Erreur lors du test batch", e);
            }
            return null;
        }
    }
