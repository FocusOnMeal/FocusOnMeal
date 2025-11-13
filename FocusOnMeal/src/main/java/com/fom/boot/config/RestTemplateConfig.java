package com.fom.boot.config;

import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;

/**
 * API 통신을 위한 RestTemplate 설정
 */
@Configuration
public class RestTemplateConfig {

    /**
     * RestTemplate Bean 생성
     * - Connection Timeout: 5초
     * - Read Timeout: 10초
     */
    @Bean
    public RestTemplate restTemplate(RestTemplateBuilder builder) {
        return builder.connectTimeout(Duration.ofSeconds(5)).readTimeout(Duration.ofSeconds(10)).build();
    }

    /**
     * 커스텀 설정이 필요한 경우 사용
     */
    @Bean(name = "customRestTemplate")
    public RestTemplate customRestTemplate() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5000);
        factory.setReadTimeout(10000);

        return new RestTemplate(factory);
    }
}


