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
        try {
            return Server.createTcpServer("-tcp", "-tcpPort", "9092");
        } catch (SQLException e) {
            return Server.createTcpServer("-tcp", "-tcpPort", "0");
        }
    }
}
