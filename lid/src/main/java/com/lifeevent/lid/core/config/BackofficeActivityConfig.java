package com.lifeevent.lid.core.config;

import com.lifeevent.lid.core.service.BackofficeActivityService;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class BackofficeActivityConfig implements WebMvcConfigurer {

    private final BackofficeActivityService activityService;

    public BackofficeActivityConfig(BackofficeActivityService activityService) {
        this.activityService = activityService;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new BackofficeActivityInterceptor(activityService))
                .addPathPatterns("/api/backoffice/**");
    }
}

