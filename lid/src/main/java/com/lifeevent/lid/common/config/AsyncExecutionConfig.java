package com.lifeevent.lid.common.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.aop.interceptor.AsyncUncaughtExceptionHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.AsyncConfigurer;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.lang.reflect.Method;
import java.util.concurrent.Executor;
import java.util.concurrent.ThreadPoolExecutor;

@Slf4j
@Configuration
public class AsyncExecutionConfig implements AsyncConfigurer {

    @Bean(name = "defaultAsyncExecutor")
    ThreadPoolTaskExecutor defaultAsyncExecutor() {
        int cpu = Math.max(1, Runtime.getRuntime().availableProcessors());
        int core = cpu;
        int max = cpu * 2;
        int queue = cpu * 100;
        return buildExecutor("async-default-", core, max, queue);
    }

    @Bean(name = "externalIoExecutor")
    ThreadPoolTaskExecutor externalIoExecutor() {
        int cpu = Math.max(1, Runtime.getRuntime().availableProcessors());
        int core = cpu;
        int max = cpu * 4;
        int queue = cpu * 120;
        return buildExecutor("async-external-io-", core, max, queue);
    }

    @Override
    public Executor getAsyncExecutor() {
        return defaultAsyncExecutor();
    }

    @Override
    public AsyncUncaughtExceptionHandler getAsyncUncaughtExceptionHandler() {
        return this::logAsyncUncaughtError;
    }

    private void logAsyncUncaughtError(Throwable ex, Method method, Object... params) {
        log.error("Uncaught async error in method {} with params {}", method, params, ex);
    }

    private ThreadPoolTaskExecutor buildExecutor(String threadNamePrefix, int coreSize, int maxSize, int queueCapacity) {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(coreSize);
        executor.setMaxPoolSize(maxSize);
        executor.setQueueCapacity(queueCapacity);
        executor.setThreadNamePrefix(threadNamePrefix);
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        executor.initialize();
        return executor;
    }
}
