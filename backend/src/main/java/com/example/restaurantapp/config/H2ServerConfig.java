package com.example.restaurantapp.config;

import java.sql.SQLException;
import java.util.concurrent.atomic.AtomicReference;
import org.h2.tools.Server;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class H2ServerConfig {

  private static final AtomicReference<Server> SERVER = new AtomicReference<>();

  @Bean(initMethod = "start", destroyMethod = "stop")
  @ConditionalOnMissingBean(Server.class)
  public Server h2TcpServer() throws SQLException {
    Server existing = SERVER.get();
    if (existing != null) {
      return existing;
    }
    Server server = Server.createTcpServer("-tcp", "-tcpPort", "9092");
    if (SERVER.compareAndSet(null, server)) {
      return server;
    }
    return SERVER.get();
  }
}
