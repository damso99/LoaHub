package com.loahub;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@MapperScan("com.loahub")
public class LoaHubApplication {
    public static void main(String[] args) {
        loadLocalEnvFile();
        SpringApplication.run(LoaHubApplication.class, args);
    }

    private static void loadLocalEnvFile() {
        for (String candidate : List.of("../.env", ".env", "../backend/.env")) {
            Path path = Path.of(candidate).normalize();
            if (Files.exists(path)) {
                try {
                    Files.readAllLines(path).stream()
                        .map(String::trim)
                        .filter(line -> !line.isBlank() && !line.startsWith("#") && line.contains("="))
                        .forEach(line -> {
                            int index = line.indexOf('=');
                            if (index > 0) {
                                String key = line.substring(0, index).trim();
                                String value = line.substring(index + 1).trim();
                                if (!key.isBlank() && System.getProperty(key) == null) {
                                    System.setProperty(key, value);
                                }
                            }
                        });
                    return;
                } catch (IOException exception) {
                    throw new IllegalStateException("로컬 환경 파일을 읽지 못했습니다.", exception);
                }
            }
        }
    }
}
