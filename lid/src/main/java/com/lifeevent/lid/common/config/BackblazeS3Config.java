package com.lifeevent.lid.common.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import software.amazon.awssdk.core.client.config.SdkAdvancedClientOption;
import software.amazon.awssdk.core.client.config.ClientOverrideConfiguration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;

import java.net.URI;

@Configuration
//@Profile("!local")
public class BackblazeS3Config {

    @Bean
    public S3Client s3Client(
            @Value("${storage.backblaze.key-id}") String keyId,
            @Value("${storage.backblaze.application-key}") String applicationKey
    ) {
        return S3Client.builder()
                .credentialsProvider(
                        StaticCredentialsProvider.create(
                                AwsBasicCredentials.create(keyId.trim(), applicationKey.trim())
                        )
                )
                .endpointOverride(URI.create("https://s3.eu-central-003.backblazeb2.com"))
                .region(Region.of("eu-central-003"))
                .overrideConfiguration(
                        ClientOverrideConfiguration.builder()
                                .putAdvancedOption(SdkAdvancedClientOption.USER_AGENT_PREFIX, "lid-api")
                                .build()
                )
                .serviceConfiguration(
                        S3Configuration.builder()
                                .pathStyleAccessEnabled(true)
                                .checksumValidationEnabled(false)
                                .build()
                )
                .build();
    }
}
