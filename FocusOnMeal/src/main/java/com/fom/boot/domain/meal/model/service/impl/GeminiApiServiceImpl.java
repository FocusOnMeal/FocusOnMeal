package com.fom.boot.domain.meal.model.service.impl;

import com.fom.boot.domain.ingredient.model.service.PriceService;
import com.fom.boot.domain.meal.model.service.GeminiApiService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Gemini API 호출 서비스
 * AI를 통한 식단 추천 및 레시피 생성
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class GeminiApiServiceImpl implements GeminiApiService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final PriceService priceService;

    @Value("${api.gemini.key}")
    private String apiKey;

    @Value("${api.gemini.url}")
    private String apiUrl;

    /**
     * 식단 추천 생성
     *
     * @param userHeight 사용자 키
     * @param userWeight 사용자 몸무게
     * @param servingSize 인분
     * @param allergies 알러지 목록
     * @param chatMessage 사용자 요청 메시지
     * @return AI가 생성한 식단 추천 텍스트
     */
    public String generateMealPlan(int userHeight, int userWeight, int servingSize,
                                   List<String> allergies, String chatMessage) {

        log.info("Gemini API 호출 시작 - 키: {}cm, 몸무게: {}kg", userHeight, userWeight);

        try {
            // 프롬프트 생성
            String prompt = buildPrompt(userHeight, userWeight, servingSize, allergies, chatMessage);

            // API 호출 및 응답 반환
            return callGeminiApi(prompt);

        } catch (HttpClientErrorException e) {
            log.error("Gemini API 호출 실패 - HTTP 에러: {}, 응답: {}",
                    e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("AI 식단 생성에 실패했습니다: " + e.getMessage());

        } catch (Exception e) {
            log.error("Gemini API 호출 중 예외 발생", e);
            throw new RuntimeException("AI 식단 생성 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    /**
     * 프롬프트 생성 (JSON 응답 형태로 수정)
     */
    private String buildPrompt(int height, int weight, int servingSize,
                               List<String> allergies, String chatMessage) {

        String allergyText = allergies == null || allergies.isEmpty()
                ? "없음"
                : String.join(", ", allergies);

        // 주요 식자재 가격 정보 조회
        String priceInfo = getPriceInformation();

        return String.format("""
            당신은 전문 영양사입니다.

            사용자 정보:
            - 키: %dcm
            - 몸무게: %dkg
            - 인분: %d인분
            - 알러지: %s

            사용자 요청: %s

            현재 식자재 시장 가격 정보 (원/kg):
            %s

            위 정보를 바탕으로 사용자 요청에 맞는 **한 끼 식단**을 추천해주세요.
            반드시 아래 JSON 형식으로만 응답해주세요. 다른 텍스트는 포함하지 마세요.

            {
              "mealName": "식단 이름",
              "mealType": "아침/점심/저녁 중 하나",
              "description": "식단에 대한 간단한 설명",
              "ingredients": [
                {
                  "name": "재료명",
                  "amount": "수량",
                  "unit": "단위"
                }
              ],
              "recipe": [
                "조리 순서 1",
                "조리 순서 2",
                "조리 순서 3"
              ],
              "nutrition": {
                "calories": "예상 칼로리(kcal)",
                "carbs": "탄수화물(g)",
                "protein": "단백질(g)",
                "fat": "지방(g)"
              },
              "estimatedPrice": "예상 가격(숫자만, 단위 제외)"
            }

            예시:
            {
              "mealName": "김치볶음밥",
              "mealType": "점심",
              "description": "간단하면서도 영양가 있는 한끼 식사",
              "ingredients": [
                {"name": "밥", "amount": "200", "unit": "g"},
                {"name": "김치", "amount": "100", "unit": "g"},
                {"name": "계란", "amount": "1", "unit": "개"},
                {"name": "참기름", "amount": "15", "unit": "ml"},
                {"name": "대파", "amount": "30", "unit": "g"}
              ],
              "recipe": [
                "팬에 참기름을 두르고 김치를 볶습니다",
                "밥을 넣고 잘 섞어줍니다",
                "계란을 풀어서 넣고 함께 볶습니다",
                "대파를 송송 썰어 넣고 마무리합니다"
              ],
              "nutrition": {
                "calories": "520",
                "carbs": "65",
                "protein": "18",
                "fat": "15"
              },
              "estimatedPrice": "3500"
            }

            주의사항:
            - 반드시 유효한 JSON 형식으로만 응답
            - 알러지 식품은 절대 사용하지 마세요
            - 재료명은 DB에 있는 식자재명과 최대한 일치하도록 (쌀, 배추, 무, 쇠고기, 돼지고기 등)
            - estimatedPrice는 숫자만 입력 (원, 약 등 제외)
            - 영양 정보는 대략적인 추정치로 제공
            """,
                height, weight, servingSize, allergyText, chatMessage, priceInfo
        );
    }

    /**
     * 주요 식자재 가격 정보 문자열 생성
     */
    private String getPriceInformation() {
        try {
            // 주요 식자재 목록 (곡류, 채소, 육류, 수산물 등)
            String[] ingredients = {
                // 곡류
                "쌀", "현미",
                // 채소류
                "배추", "무", "당근", "양파", "대파", "마늘", "고추", "감자", "고구마",
                "시금치", "상추", "깻잎", "토마토", "오이", "호박", "가지",
                // 육류
                "쇠고기", "돼지고기", "삼겹살", "닭고기", "계란",
                // 수산물
                "고등어", "갈치", "삼치", "연어", "오징어",
                // 기타
                "두부", "우유"
            };

            Map<String, Integer> prices = priceService.getPrices(ingredients);

            if (prices.isEmpty()) {
                log.warn("가격 정보를 가져올 수 없음 - 기본 메시지 사용");
                return "가격 정보를 불러올 수 없습니다. 일반적인 시장 가격을 고려하여 추천합니다.";
            }

            StringBuilder priceInfo = new StringBuilder();

            // 카테고리별로 분류
            priceInfo.append("【곡류】\n");
            appendPricesByCategory(priceInfo, prices, "쌀", "현미");

            priceInfo.append("\n【채소류】\n");
            appendPricesByCategory(priceInfo, prices, "배추", "무", "당근", "양파", "대파",
                    "마늘", "고추", "감자", "고구마", "시금치", "상추", "깻잎", "토마토", "오이", "호박", "가지");

            priceInfo.append("\n【육류】\n");
            appendPricesByCategory(priceInfo, prices, "쇠고기", "돼지고기", "삼겹살", "닭고기", "계란");

            priceInfo.append("\n【수산물】\n");
            appendPricesByCategory(priceInfo, prices, "고등어", "갈치", "삼치", "연어", "오징어");

            priceInfo.append("\n【기타】\n");
            appendPricesByCategory(priceInfo, prices, "두부", "우유");

            log.info("가격 정보 생성 완료 - {}개 품목", prices.size());
            return priceInfo.toString();

        } catch (Exception e) {
            log.error("가격 정보 생성 실패", e);
            return "가격 정보를 불러올 수 없습니다. 일반적인 시장 가격을 고려하여 추천합니다.";
        }
    }

    /**
     * 카테고리별 가격 정보 추가
     */
    private void appendPricesByCategory(StringBuilder sb, Map<String, Integer> prices, String... items) {
        for (String item : items) {
            Integer price = prices.get(item);
            if (price != null) {
                sb.append(String.format("- %s: %,d원/kg\n", item, price));
            }
        }
    }

    /**
     * API 요청 바디 생성
     */
    private Map<String, Object> createRequestBody(String prompt) {
        Map<String, Object> requestBody = new HashMap<>();

        Map<String, String> part = new HashMap<>();
        part.put("text", prompt);

        Map<String, Object> content = new HashMap<>();
        content.put("parts", List.of(part));

        requestBody.put("contents", List.of(content));

        return requestBody;
    }

    /**
     * API 응답에서 텍스트 추출
     */
    private String extractTextFromResponse(String responseBody) {
        try {
            JsonNode root = objectMapper.readTree(responseBody);

            // candidates[0].content.parts[0].text 경로로 접근
            JsonNode textNode = root
                    .path("candidates")
                    .get(0)
                    .path("content")
                    .path("parts")
                    .get(0)
                    .path("text");

            if (textNode.isMissingNode()) {
                log.error("응답에서 텍스트를 찾을 수 없음: {}", responseBody);
                throw new RuntimeException("AI 응답 형식이 올바르지 않습니다");
            }

            return textNode.asText();

        } catch (Exception e) {
            log.error("응답 파싱 실패", e);
            throw new RuntimeException("AI 응답 파싱에 실패했습니다: " + e.getMessage());
        }
    }

    /**
     * API 테스트용 간단한 메시지 생성
     */
    public String testConnection() {
        log.info("Gemini API 연결 테스트 시작");

        try {
            String prompt = "안녕하세요. 간단히 '연결 성공'이라고만 답해주세요.";
            String result = callGeminiApi(prompt);
            log.info("Gemini API 연결 테스트 성공: {}", result);
            return result;

        } catch (Exception e) {
            log.error("Gemini API 연결 테스트 실패", e);
            return "연결 실패: " + e.getMessage();
        }
    }

    /**
     * Gemini API 호출 공통 메서드
     * @param prompt 전송할 프롬프트
     * @return AI 응답 텍스트
     */
    private String callGeminiApi(String prompt) {
        // 요청 바디 생성
        Map<String, Object> requestBody = createRequestBody(prompt);

        // HTTP 헤더 설정
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // API URL에 키 파라미터 추가
        String fullUrl = apiUrl + "?key=" + apiKey;

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        // API 호출
        ResponseEntity<String> response = restTemplate.exchange(
                fullUrl,
                HttpMethod.POST,
                entity,
                String.class
        );

        // 응답 파싱
        String result = extractTextFromResponse(response.getBody());
        log.info("Gemini API 호출 성공");

        return result;
    }
}
