package com.lifeevent.lid;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing(auditorAwareRef = "auditAwareImpl")
@ComponentScan(basePackages = {
		"com.lifeevent.lid.article",
		"com.lifeevent.lid.customer",
		"com.lifeevent.lid.cart",
		"com.lifeevent.lid.order",
		"com.lifeevent.lid.auth",
		"com.lifeevent.lid.batch",
		"com.lifeevent.lid.common"
})
public class LidApplication {

	public static void main(String[] args) {
		SpringApplication.run(LidApplication.class, args);
	}

}
