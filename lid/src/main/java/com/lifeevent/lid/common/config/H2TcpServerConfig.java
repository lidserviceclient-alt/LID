package com.lifeevent.lid.common.config;

import org.h2.tools.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import java.sql.SQLException;

@Configuration
@Profile("local")
public class H2TcpServerConfig {

    @Bean(initMethod = "start", destroyMethod = "stop")
    public Server h2TcpServer() throws SQLException {
        // Enable TCP access for local shell scripts. DB remains in-memory and is lost on shutdown.
        return Server.createTcpServer("-tcp", "-tcpPort", "9092");
    }
}
