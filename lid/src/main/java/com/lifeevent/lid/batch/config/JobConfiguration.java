package com.lifeevent.lid.batch.config;

import com.lifeevent.lid.article.entity.Article;
import com.lifeevent.lid.batch.dto.ArticleCsvDto;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.job.builder.JobBuilder;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.core.step.builder.StepBuilder;
import org.springframework.batch.item.file.FlatFileItemReader;
import org.springframework.batch.item.database.JpaItemWriter;
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
                      JpaItemWriter<Article> writer) {
        return new StepBuilder("step1", jobRepository)
                .<ArticleCsvDto, Article>chunk(10, transactionManager)
                .reader(reader)
                .processor(processor)
                .writer(writer)
                .build();
    }

    @Bean
    public ArticleItemProcessor processor() {
        return new ArticleItemProcessor();
    }
}
