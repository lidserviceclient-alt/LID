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

        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(cpu * 2);
        executor.setMaxPoolSize(cpu * 8);
        executor.setQueueCapacity(cpu * 200);
        executor.setThreadNamePrefix("aggregator-");

        executor.setKeepAliveSeconds(60);
        executor.setAllowCoreThreadTimeOut(true);

        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(30);

        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());

        executor.initialize();
        return executor;
    }
}
