package com.lifeevent.lid.common.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;
import java.util.concurrent.ThreadPoolExecutor;

@Configuration
public class OverviewAggregationExecutorConfig {

    @Bean(name = "aggregatorExecutor")
    Executor aggregatorExecutor() {
        int cpu = Math.max(1, Runtime.getRuntime().availableProcessors());
        int corePoolSize = cpu;
        int maxPoolSize = cpu * 3;
        int queueCapacity = cpu * 80;

        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(corePoolSize);
        executor.setMaxPoolSize(maxPoolSize);
        executor.setQueueCapacity(queueCapacity);
        executor.setThreadNamePrefix("aggregator-");
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        executor.initialize();
        return executor;
    }
}
