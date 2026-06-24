package com.loahub.common.config;

import jakarta.annotation.PostConstruct;
import javax.sql.DataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class DatabaseConnectionLogger {
    private static final Logger log = LoggerFactory.getLogger(DatabaseConnectionLogger.class);

    private final DataSource dataSource;

    @Value("${spring.datasource.url:}")
    private String datasourceUrl;

    public DatabaseConnectionLogger(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @PostConstruct
    public void logDatasource() {
        try {
            log.info("Datasource URL: {}", datasourceUrl);
            log.info("Datasource class: {}", dataSource.getClass().getName());
        } catch (Exception exception) {
            log.warn("Datasource inspection failed: {}", exception.getMessage());
        }
    }
}
