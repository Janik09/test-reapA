package com.example.restaurantapp.config;

import java.sql.SQLException;
import org.h2.tools.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class H2ServerConfiguration {

  @Bean(destroyMethod = "stop")
  public Server h2TcpServer() throws SQLException {
    Server server = Server.createTcpServer("-tcp", "-tcpPort", "9092").start();
    Runtime.getRuntime().addShutdownHook(new Thread(server::stop));
    return server;
  }
}
