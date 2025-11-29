package com.fom.boot.domain.alert.model.service.impl;

import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.xml.XmlMapper;
import com.fom.boot.domain.alert.model.service.FoodSafetyApiService;
import com.fom.boot.domain.alert.model.vo.SafetyAlert;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 식품안전정보원 API 연동 서비스 구현체
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class FoodSafetyApiServiceImpl implements FoodSafetyApiService {
	
	private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final XmlMapper xmlMapper = new XmlMapper();
    
    @Value("${food.safety.api.key}")
    private String apiKey;
    
    @Value("${food.safety.api.url}") 
    private String apiUrl;
    
    @Value("${food.safety.api.type:json}")
    private String responseType;
    
    /**
     * 응답 문자열에서 실제 XML/JSON 데이터가 시작하는 부분만 추출
     * @param responseBody 전체 응답 문자열
     * @return 실제 데이터 부분 문자열
     */
    private String extractActualResponseData(String responseBody) {
        if (responseBody == null || responseBody.isEmpty()) {
            return "";
        }
        
        // JSON 응답의 경우 첫 번째 '{' 또는 XML 응답의 경우 첫 번째 '<'를 찾습니다.
        int startIndex = responseBody.indexOf('<');
        if (startIndex == -1) {
            startIndex = responseBody.indexOf('{');
        }
        
        if (startIndex > 0) {
            // 불필요한 앞부분을 잘라냅니다.
            return responseBody.substring(startIndex);
        }
        
        return responseBody;
    }
    
    @Override
    public String testConnection() {
        log.info("식품안전정보원 API 연결 테스트 시작");
        
        try {
            LocalDate endDate = LocalDate.now();
            LocalDate startDate = endDate.minusDays(7);
            
            String bgnde = startDate.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
            String endde = endDate.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
            
            String url = UriComponentsBuilder.fromUriString(apiUrl + "/" + responseType) 
                    .queryParam("apiKey", apiKey)
                    .queryParam("bgnde", bgnde)
                    .queryParam("endde", endde)
                    .queryParam("startIndex", 1)
                    .queryParam("endIndex", 5)
                    .build()
                    .toUriString();
            
            log.debug("테스트 URL: {}", url);
            
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            
            if (response.getStatusCode().is2xxSuccessful()) {
                String responseBody = response.getBody();
                log.debug("API 응답: {}", responseBody.substring(0, Math.min(500, responseBody.length())));
                
                // 실제 데이터 부분만 추출하여 파싱 시도
                String actualData = extractActualResponseData(responseBody);
                log.debug("API 응답 (추출 후): {}", actualData.substring(0, Math.min(500, actualData.length())));
                
                int count = parseResponseCount(responseBody);
                
                if (count >= 0) {
                    log.info("식품안전정보원 API 연결 성공 - {} 건 조회", count);
                    return String.format("연결 성공 - %d 건 조회됨", count);
                } else {
                    return "연결 성공 - 데이터 없음";
                }
            }
            
            return "API 호출 실패: " + response.getStatusCode();
            
        } catch (Exception e) {
            log.error("식품안전정보원 API 연결 테스트 실패", e);
            return "연결 실패: " + e.getMessage();
        }
    }
    
    @Override
    public int getTotalCount(int days) {
        int maxRetries = 3;
        int retryDelayMs = 2000;

        for (int attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                LocalDate endDate = LocalDate.now();
                LocalDate startDate = endDate.minusDays(days);

                String bgnde = startDate.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
                String endde = endDate.format(DateTimeFormatter.ofPattern("yyyyMMdd"));

                String url = UriComponentsBuilder.fromUriString(apiUrl + "/" + responseType)
                        .queryParam("apiKey", apiKey)
                        .queryParam("bgnde", bgnde)
                        .queryParam("endde", endde)
                        .queryParam("startIndex", 1)
                        .queryParam("endIndex", 1)  // 최소 요청으로 totalCount만 확인
                        .build()
                        .toUriString();

                log.info("식품안전정보원 totalCount 조회 (시도 {}/{}) - days: {}, bgnde: {}, endde: {}",
                        attempt, maxRetries, days, bgnde, endde);

                ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);

                if (response.getStatusCode().is2xxSuccessful()) {
                    String responseBody = response.getBody();
                    int count = extractTotalCount(responseBody);
                    log.info("totalCount 조회 성공 (시도 {}): {} 건", attempt, count);
                    return count;
                }

                log.warn("totalCount 조회 실패 - Status: {}", response.getStatusCode());
                return 0;

            } catch (org.springframework.web.client.HttpServerErrorException e) {
                log.warn("totalCount 조회 실패 (시도 {}/{}) - 서버 에러: {} {}",
                        attempt, maxRetries, e.getStatusCode(), e.getMessage());

                if (attempt < maxRetries) {
                    try {
                        log.info("{} ms 후 재시도합니다...", retryDelayMs);
                        Thread.sleep(retryDelayMs);
                        retryDelayMs *= 2; // 지수 백오프
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        log.error("재시도 대기 중 인터럽트 발생", ie);
                        return 0;
                    }
                } else {
                    log.error("totalCount 조회 최종 실패 - 모든 재시도 소진", e);
                    return 0;
                }
            } catch (Exception e) {
                log.error("totalCount 조회 중 예외 발생 (시도 {}/{})", attempt, maxRetries, e);

                if (attempt < maxRetries) {
                    try {
                        Thread.sleep(retryDelayMs);
                        retryDelayMs *= 2;
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        return 0;
                    }
                } else {
                    return 0;
                }
            }
        }

        return 0;
    }

    @Override
    public List<SafetyAlert> fetchSafetyAlerts(int days, int startIdx, int endIdx) {
        int maxRetries = 3;
        int retryDelayMs = 2000;

        for (int attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                LocalDate endDate = LocalDate.now();
                LocalDate startDate = endDate.minusDays(days);

                String bgnde = startDate.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
                String endde = endDate.format(DateTimeFormatter.ofPattern("yyyyMMdd"));

                String url = UriComponentsBuilder.fromUriString(apiUrl + "/" + responseType)
                        .queryParam("apiKey", apiKey)
                        .queryParam("bgnde", bgnde)
                        .queryParam("endde", endde)
                        .queryParam("startIndex", startIdx)
                        .queryParam("endIndex", endIdx)
                        .build()
                        .toUriString();

                log.info("식품안전정보원 API 호출 (시도 {}/{}): days={}, bgnde={}, endde={}, startIdx={}, endIdx={}",
                        attempt, maxRetries, days, bgnde, endde, startIdx, endIdx);
                log.debug("요청 URL: {}", url);

                ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);

                if (response.getStatusCode().is2xxSuccessful()) {
                    String responseBody = response.getBody();
                    List<SafetyAlert> alerts = parseResponse(responseBody);

                    log.info("식품안전정보원 API 조회 성공 (시도 {}): {} 건", attempt, alerts.size());
                    return alerts;
                }

                log.warn("API 호출 실패 - Status: {}", response.getStatusCode());

            } catch (org.springframework.web.client.HttpServerErrorException e) {
                log.warn("API 호출 실패 (시도 {}/{}) - 서버 에러: {} {}",
                        attempt, maxRetries, e.getStatusCode(), e.getMessage());

                if (attempt < maxRetries) {
                    try {
                        log.info("{} ms 후 재시도합니다...", retryDelayMs);
                        Thread.sleep(retryDelayMs);
                        retryDelayMs *= 2; // 지수 백오프
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        log.error("재시도 대기 중 인터럽트 발생", ie);
                        return new ArrayList<>();
                    }
                } else {
                    log.error("API 호출 최종 실패 - 모든 재시도 소진", e);
                }
            } catch (Exception e) {
                log.error("API 호출 중 예외 발생 (시도 {}/{})", attempt, maxRetries, e);

                if (attempt < maxRetries) {
                    try {
                        Thread.sleep(retryDelayMs);
                        retryDelayMs *= 2;
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        return new ArrayList<>();
                    }
                } else {
                    log.error("API 호출 최종 실패", e);
                }
            }
        }

        return new ArrayList<>();
    }
    
    @Override
    public List<SafetyAlert> fetchRecentSafetyAlerts(int days) {
        log.info("최근 {} 일 식품안전정보 조회", days);
        
        try {
            LocalDate endDate = LocalDate.now();
            LocalDate startDate = endDate.minusDays(days);
            
            String bgnde = startDate.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
            String endde = endDate.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
            
            String url = UriComponentsBuilder.fromUriString(apiUrl + "/" + responseType)
                    .queryParam("apiKey", apiKey)
                    .queryParam("bgnde", bgnde)
                    .queryParam("endde", endde)
                    .queryParam("startIndex", 1)
                    .queryParam("endIndex", 100)
                    .build()
                    .toUriString();
            
            log.debug("요청 URL: {}", url);
            
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            
            if (response.getStatusCode().is2xxSuccessful()) {
                String responseBody = response.getBody();
                List<SafetyAlert> alerts = parseResponse(responseBody);
                
                log.info("최근 {} 일 데이터 조회 완료: {} 건", days, alerts.size());
                return alerts;
            }
            
        } catch (Exception e) {
            log.error("최근 식품안전정보 조회 실패", e);
        }
        
        return new ArrayList<>();
    }
    
    @Override
    public String getRawResponse(int days, int startIdx, int endIdx) {
        try {
            LocalDate endDate = LocalDate.now();
            LocalDate startDate = endDate.minusDays(days);

            String bgnde = startDate.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
            String endde = endDate.format(DateTimeFormatter.ofPattern("yyyyMMdd"));

            String url = UriComponentsBuilder.fromUriString(apiUrl + "/" + responseType)
                    .queryParam("apiKey", apiKey)
                    .queryParam("bgnde", bgnde)
                    .queryParam("endde", endde)
                    .queryParam("startIndex", startIdx)
                    .queryParam("endIndex", endIdx)
                    .build()
                    .toUriString();

            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            return response.getBody();

        } catch (Exception e) {
            log.error("원본 응답 조회 실패", e);
            return "ERROR: " + e.getMessage();
        }
    }

    /**
     * 응답에서 totalCount 추출
     */
    private int extractTotalCount(String responseBody) {
        try {
            if ("json".equalsIgnoreCase(responseType)) {
                JsonNode root = objectMapper.readTree(responseBody);
                JsonNode totalCountNode = root.path("totalCount");
                if (!totalCountNode.isMissingNode()) {
                    return totalCountNode.asInt();
                }
            } else {
                // XML 응답 처리 - XML은 대문자 필드명 사용
                JsonNode root = xmlMapper.readTree(responseBody);

                // NFSI-FOODINFO 구조: <TOTAL_COUNT>값</TOTAL_COUNT>
                JsonNode totalCountNode = root.path("TOTAL_COUNT");
                if (!totalCountNode.isMissingNode()) {
                    int count = totalCountNode.asInt();
                    log.info("totalCount 추출 성공: {}", count);
                    return count;
                }
            }

            log.warn("totalCount 필드를 찾을 수 없습니다. 응답: {}", responseBody.substring(0, Math.min(300, responseBody.length())));
            return 0;

        } catch (Exception e) {
            log.error("totalCount 추출 실패", e);
            return 0;
        }
    }
    
    /**
     * 응답에서 데이터 개수 파싱
     */
    private int parseResponseCount(String responseBody) {
        try {
            if ("json".equalsIgnoreCase(responseType)) {
                JsonNode root = objectMapper.readTree(responseBody);
                JsonNode items = root.path("data");

                if (items.isArray()) {
                    return items.size();
                }
            } else {
                // XML 응답 처리
                JsonNode root = xmlMapper.readTree(responseBody);
                JsonNode items = root.path("ITEMS").path("ITEM");

                if (items.isArray()) {
                    return items.size();
                } else if (!items.isMissingNode()) {
                    return 1;
                }
            }

            return 0;

        } catch (Exception e) {
            log.error("응답 카운트 파싱 실패", e);
            return -1;
        }
    }
    
    /**
     * 응답 파싱
     */
    private List<SafetyAlert> parseResponse(String responseBody) {
        List<SafetyAlert> alerts = new ArrayList<>();

        try {
            JsonNode items;

            if ("json".equalsIgnoreCase(responseType)) {
                JsonNode root = objectMapper.readTree(responseBody);
                items = root.path("data");
            } else {
                // XML 응답 처리
                JsonNode root = xmlMapper.readTree(responseBody);
                // <NFSI-FOODINFO><ITEMS><ITEM>...</ITEM></ITEMS></NFSI-FOODINFO>
                items = root.path("ITEMS").path("ITEM");
            }

            if (items.isArray()) {
                for (JsonNode item : items) {
                    SafetyAlert alert = parseItem(item);
                    if (alert != null) {
                        alerts.add(alert);
                    }
                }
            } else if (!items.isMissingNode()) {
                SafetyAlert alert = parseItem(items);
                if (alert != null) {
                    alerts.add(alert);
                }
            }

        } catch (Exception e) {
            log.error("응답 파싱 실패", e);
        }

        return alerts;
    }
    
    /**
     * 개별 아이템을 SafetyAlert 객체로 변환
     */
    private SafetyAlert parseItem(JsonNode item) {
        try {
            SafetyAlert alert = new SafetyAlert();
            
            alert.setTitle(getTextValue(item, "TITLE", "title"));
            alert.setNation(getTextValue(item, "COUNTRY", "country"));
            alert.setHazardType(getTextValue(item, "INFO_TYPE", "infoType"));
            alert.setDescription(getTextValue(item, "CONTENT", "content"));
            
            String registrationDate = getTextValue(item, "REGISTRATION_DATE", "registrationDate");
            if (registrationDate != null && !registrationDate.isEmpty()) {
                alert.setPublicationDate(parseDate(registrationDate));
            }
            
            alert.setIngredientId(0);
            
            return alert;
            
        } catch (Exception e) {
            log.error("아이템 파싱 실패: {}", item, e);
            return null;
        }
    }
    
    /**
     * JsonNode에서 텍스트 값 추출
     */
    private String getTextValue(JsonNode node, String... fieldNames) {
        for (String fieldName : fieldNames) {
            JsonNode field = node.path(fieldName);
            if (!field.isMissingNode() && !field.isNull()) {
                return field.asText();
            }
        }
        return null;
    }
    
    private Timestamp parseDate(String dateStr) {
        try {
            if (dateStr == null || dateStr.trim().isEmpty() || dateStr.equalsIgnoreCase("null")) {
                return null;
            }

            dateStr = dateStr.trim();

            // "2025-11-19T00:00:00" 또는 "2025-11-19 00:00:00"
            if (dateStr.contains("T") || dateStr.contains(" ")) {
                try {
                    return Timestamp.valueOf(dateStr.replace("T", " "));
                } catch (Exception e) {
                    // 실패하면 뒤에서 다른 패턴으로 처리
                }
            }

            // yyyy-MM-dd
            if (dateStr.matches("\\d{4}-\\d{1,2}-\\d{1,2}")) {
                LocalDate date = LocalDate.parse(dateStr, DateTimeFormatter.ofPattern("yyyy-M-d"));
                return Timestamp.valueOf(date.atStartOfDay());
            }

            // yyyy.MM.dd
            if (dateStr.matches("\\d{4}\\.\\d{1,2}\\.\\d{1,2}")) {
                LocalDate date = LocalDate.parse(dateStr, DateTimeFormatter.ofPattern("yyyy.M.d"));
                return Timestamp.valueOf(date.atStartOfDay());
            }

            // yyyyMMdd
            if (dateStr.matches("\\d{8}")) {
                LocalDate date = LocalDate.parse(dateStr, DateTimeFormatter.ofPattern("yyyyMMdd"));
                return Timestamp.valueOf(date.atStartOfDay());
            }

            log.warn("지원하지 않는 날짜 형식: {}", dateStr);
            return null;

        } catch (Exception e) {
            log.error("날짜 파싱 실패: {}", dateStr, e);
            return null;
        }
    }
}
