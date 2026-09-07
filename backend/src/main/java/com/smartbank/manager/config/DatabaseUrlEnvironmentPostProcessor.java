package com.smartbank.manager.config;

import java.net.URI;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

/**
 * Most hosted Postgres providers (Render, Neon, Railway, Heroku) hand you a single
 * DATABASE_URL like postgres://user:pass@host:5432/dbname. Spring's datasource
 * properties need a jdbc: URL plus separate username/password. This converts one
 * into the other at startup, so deployment only needs DATABASE_URL set - nothing
 * in application.properties has to change per environment.
 */
public class DatabaseUrlEnvironmentPostProcessor implements EnvironmentPostProcessor {

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        String databaseUrl = environment.getProperty("DATABASE_URL");
        if (databaseUrl == null || databaseUrl.isBlank()) {
            return;
        }

        try {
            URI uri = new URI(databaseUrl.replaceFirst("^postgres(ql)?://", "postgresql://"));
            String userInfo = uri.getUserInfo();
            String username = null;
            String password = null;
            if (userInfo != null && userInfo.contains(":")) {
                String[] parts = userInfo.split(":", 2);
                username = parts[0];
                password = parts[1];
            }

            String jdbcUrl = "jdbc:postgresql://" + uri.getHost() + ":" + (uri.getPort() == -1 ? 5432 : uri.getPort())
                    + uri.getPath() + (uri.getQuery() != null ? "?" + uri.getQuery() : "");

            Map<String, Object> overrides = new LinkedHashMap<>();
            overrides.put("spring.datasource.url", jdbcUrl);
            if (username != null) {
                overrides.put("spring.datasource.username", username);
            }
            if (password != null) {
                overrides.put("spring.datasource.password", password);
            }

            environment.getPropertySources().addFirst(new MapPropertySource("databaseUrl", overrides));
        } catch (Exception e) {
            throw new IllegalStateException("Could not parse DATABASE_URL: " + e.getMessage(), e);
        }
    }
}
