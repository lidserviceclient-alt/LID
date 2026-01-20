package com.lifeevent.lid.batch.config;

import com.lifeevent.lid.batch.config.listener.JobCompletionNotificationListener;
import com.lifeevent.lid.batch.config.processor.ArticleItemProcessor;
import com.lifeevent.lid.batch.config.writer.ArticleImportWriter;
import com.lifeevent.lid.batch.dto.ArticleCsvDto;
import com.lifeevent.lid.batch.dto.ArticleImportAggregate;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.job.builder.JobBuilder;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.core.step.builder.StepBuilder;
import org.springframework.batch.item.file.FlatFileItemReader;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.PlatformTransactionManager;

@Configuration
public class JobConfiguration {
    
    @Bean
    public Job importArticlesJob(JobRepository jobRepository, JobCompletionNotificationListener listener, Step step1) {
        return new JobBuilder("importArticlesJob", jobRepository)
                .listener(listener)
                .start(step1)
                .build();
    }

    @Bean
    public Step step1(JobRepository jobRepository,
                      PlatformTransactionManager transactionManager,
                      FlatFileItemReader<ArticleCsvDto> reader,
                      ArticleItemProcessor processor,
                      ArticleImportWriter writerV2) {
        return new StepBuilder("step1", jobRepository)
                .<ArticleCsvDto, ArticleImportAggregate>chunk(10, transactionManager)
                .reader(reader)
                .processor(processor)
                .writer(writerV2)
                .build();
    }

    @Bean
    public ArticleItemProcessor processor() {
        return new ArticleItemProcessor();
    }
}
