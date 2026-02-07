package com.lifeevent.lid.batch.config;


import com.lifeevent.lid.batch.dto.ArticleCsvDto;
import com.lifeevent.lid.batch.dto.ArticleImportAggregate;
import org.springframework.batch.core.configuration.annotation.StepScope;
import org.springframework.batch.item.file.FlatFileItemReader;
import org.springframework.batch.item.file.builder.FlatFileItemReaderBuilder;
import org.springframework.batch.item.file.mapping.BeanWrapperFieldSetMapper;
import org.springframework.batch.item.database.JpaItemWriter;
import org.springframework.batch.item.database.builder.JpaItemWriterBuilder;
import org.springframework.batch.item.file.mapping.DefaultLineMapper;
import org.springframework.batch.item.file.separator.DefaultRecordSeparatorPolicy;
import org.springframework.batch.item.file.transform.DelimitedLineTokenizer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import jakarta.persistence.EntityManagerFactory;
import org.springframework.core.io.FileSystemResource;

@Configuration
public class BatchConfiguration {


    @Bean
    @StepScope
    public FlatFileItemReader<ArticleCsvDto> reader(
            @Value("#{jobParameters['filePath']}") String filePath
    ) {

        DefaultLineMapper<ArticleCsvDto> lineMapper = new DefaultLineMapper<>();

        DelimitedLineTokenizer tokenizer = new DelimitedLineTokenizer();
        tokenizer.setDelimiter(";");
        tokenizer.setStrict(false);
        tokenizer.setNames(
                "sku",
                "ean",
                "title",
                "description",
                "category",
                "brand",
                "price",
                "currency",
                "stock",
                "weightKg",
                "imageUrl",
                "status",
                "isFeatured",
                "isBestSeller",
                "isFlashSale"
        );


        BeanWrapperFieldSetMapper<ArticleCsvDto> fieldSetMapper =
                new BeanWrapperFieldSetMapper<>();
        fieldSetMapper.setTargetType(ArticleCsvDto.class);

        lineMapper.setLineTokenizer(tokenizer);
        lineMapper.setFieldSetMapper(fieldSetMapper);

        return new FlatFileItemReaderBuilder<ArticleCsvDto>()
                .name("articleItemReader")
                .resource(new FileSystemResource(filePath))
                .encoding("UTF-8")
                .linesToSkip(1)
                .lineMapper(lineMapper)
                .recordSeparatorPolicy(new DefaultRecordSeparatorPolicy()) // ignore lignes vides
                .build();
    }



    @Bean
    public JpaItemWriter<ArticleImportAggregate> writer(EntityManagerFactory entityManagerFactory) {
        return new JpaItemWriterBuilder<ArticleImportAggregate>()
                .entityManagerFactory(entityManagerFactory)
                .build();
    }






}
