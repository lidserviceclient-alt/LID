package com.lifeevent.lid;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableJpaAuditing(auditorAwareRef = "auditAwareImpl")
@EnableScheduling
@ComponentScan(basePackages = {
		"com.lifeevent.lid.core",
		"com.lifeevent.lid.common",
		"com.lifeevent.lid.auth",
		"com.lifeevent.lid.article",
		"com.lifeevent.lid.batch",
		"com.lifeevent.lid.content",
		"com.lifeevent.lid.stock",
		"com.lifeevent.lid.user",
		"com.lifeevent.lid.cart",
		"com.lifeevent.lid.order",
		"com.lifeevent.lid.payment",
		"com.lifeevent.lid.wishlist"
})
@EntityScan(basePackages = {
		"com.lifeevent.lid.core.entity",
		"com.lifeevent.lid.auth.entity",
		"com.lifeevent.lid.article.entity",
		"com.lifeevent.lid.content.entity",
		"com.lifeevent.lid.stock.entity",
		"com.lifeevent.lid.user",
		"com.lifeevent.lid.cart",
		"com.lifeevent.lid.order",
		"com.lifeevent.lid.payment",
		"com.lifeevent.lid.wishlist.entity"
})
@EnableJpaRepositories(basePackages = {
		"com.lifeevent.lid.core.repository",
		"com.lifeevent.lid.auth.repository",
		"com.lifeevent.lid.article.repository",
		"com.lifeevent.lid.content.repository",
		"com.lifeevent.lid.stock.repository",
		"com.lifeevent.lid.user",
		"com.lifeevent.lid.cart",
		"com.lifeevent.lid.order",
		"com.lifeevent.lid.payment",
		"com.lifeevent.lid.wishlist.repository"
})
public class LidApplication {

	public static void main(String[] args) {
		SpringApplication.run(LidApplication.class, args);
	}

}
 
