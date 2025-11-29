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
     * @param previousPrice 이전 추천 식단 가격 (더 저렴한 식단 요청 시)
     * @return AI가 생성한 식단 추천 텍스트
     */
    public String generateMealPlan(int userHeight, int userWeight, int servingSize,
                                   List<String> allergies, String chatMessage, Integer previousPrice) {

        log.info("Gemini API 호출 시작 - 키: {}cm, 몸무게: {}kg, 이전 가격: {}원",
                userHeight, userWeight, previousPrice);

        try {
            // 프롬프트 생성
            String prompt = buildPrompt(userHeight, userWeight, servingSize, allergies, chatMessage, previousPrice);

            // API 호출 및 응답 반환
            return callGeminiApi(prompt);

        } catch (HttpClientErrorException e) {
            log.error("Gemini API 호출 실패 - HTTP 에러: {}, 응답: {}",
                    e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("AI 식단 생성에 실패했습니다: " + e.getMessage());

        } catch (Exception e) {
            log.error("Gemini API 호출 중 예류 발생", e);
            throw new RuntimeException("AI 식단 생성 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    /**
     * 프롬프트 생성 (JSON 응답 형태로 수정)
     */
    private String buildPrompt(int height, int weight, int servingSize,
                               List<String> allergies, String chatMessage, Integer previousPrice) {

        String allergyText = allergies == null || allergies.isEmpty()
                ? "없음"
                : String.join(", ", allergies);

        // 주요 식자재 가격 정보 조회
        String priceInfo = getPriceInformation();

        // 이전 가격 정보 텍스트
        String previousPriceText = "";
        if (previousPrice != null && previousPrice > 0) {
            previousPriceText = String.format("""

                ⚠️ **중요: 가격 제약 조건**
                - 이전에 추천한 식단 가격: %,d원
                - 이번에는 이것보다 저렴한 식단을 추천해주세요
                - 목표 가격: %,d원 이하
                - 방법은 자유롭게: 재료 양 조절, 저렴한 대체 재료 사용, 간단한 조리법 등
                - 단, 맛과 영양이 크게 떨어지지 않도록 주의하세요
                """, previousPrice, (int)(previousPrice * 0.8));
        }

        return String.format("""
            당신은 전문 영양사이자 요리 전문가입니다.

            사용자 정보:
            - 키: %dcm
            - 몸무게: %dkg
            - 인분: %d인분
            - 알러지: %s

            사용자 요청: %s

            **참고: 한국 주요 식자재 시장 가격 정보 (원/kg)**
            %s
            %s

            위 정보를 참고하되, **사용자 요청에 가장 적합한 식단**을 자유롭게 추천해주세요.
            - 위 목록에 없는 재료도 필요하면 자유롭게 사용하세요
            - 사용자가 특정 음식을 요청하면 해당 음식을 우선 추천하세요
            - 다양한 세계 각국의 요리를 추천할 수 있습니다 (양식, 중식, 일식, 한식, 디저트 등)

            **가격 고려 지침:**
            - 사용자가 "저렴한", "싼", "가성비", "경제적인" 등의 키워드를 사용할 때만 가격을 우선 고려하세요
            - 그 외에는 맛과 영양, 사용자 요청을 최우선으로 하세요
            - 예상 가격은 일반적인 시장 가격을 기준으로 정확하게 계산해주세요

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
            - estimatedPrice는 숫자만 입력 (원, 약 등 제외)
            - 영양 정보는 대략적인 추정치로 제공

            **알러지 처리 지침:**
            - 기본적으로 알러지 식품은 사용하지 마세요
            - 단, 사용자가 알러지 식품이 포함된 요리를 명시적으로 요청한 경우:
              1. description에 "⚠️ 알레르기 주의: 이 요리에는 {알레르기 식품}이(가) 포함되어 있습니다" 경고를 포함하세요
              2. 대체 재료를 사용한 알레르기 프리 버전을 추천하는 것을 우선 고려하세요
              3. 대체가 불가능하면 경고와 함께 원래 요청대로 추천하세요

            **재료 단위 지침 (매우 중요):**
            - 재료 수량은 반드시 g, kg, ml, l 단위로 표기하세요
            - "개" 단위는 계란 등 명확한 개수 단위 식재료에만 사용
            - 채소, 향신료는 반드시 g 단위로 표기 (예: "파슬리 5g", "바질 10g")
            - 고기, 생선은 반드시 g 또는 kg 단위로 표기
            - 액체 조미료는 ml 단위로 표기

            **다양성 및 창의성 지침 (매우 중요):**
            - 사용자 요청을 최우선으로 고려하세요
            - 케이크를 요청하면 케이크를, 파스타를 요청하면 파스타를 추천하세요
            - 다양한 요리를 추천하세요 (양식, 중식, 일식, 한식, 베이킹, 디저트 등)
            - 매번 다른 재료와 조합을 사용하여 창의적인 식단을 만드세요
            - 건강식이라고 해서 항상 닭가슴살이 필요한 것은 아닙니다
            - 사용자가 특정 음식을 명시하지 않았을 때만 영양과 가격을 균형있게 고려하세요
            """,
                height, weight, servingSize, allergyText, chatMessage, priceInfo, previousPriceText
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
                "쌀", "찹쌀", "현미",
                // 채소류
                "배추", "무", "당근", "양파", "대파", "마늘", "고추", "감자", "고구마",
                "시금치", "상추", "깻잎", "토마토", "오이", "호박", "가지", "양배추", "알배기배추",
                    "브로콜리", "얼갈이배추", "갓"," 수박", "참외", "딸기", "열무", "건고추",
                    "풋고추", "붉은고추", "생강", "고춧가루", "미나리", "피망", "파프리카",
                    "멜론", "방울토마토", "땅콩", "느타리버섯", "팽이버섯", "새송이버섯", "호두", "아몬드",
                    "사과", "배", "복숭아", "포도", "감귤", "단감", "바나나", "참다래", "파인애플",
                    "오렌지", "자몽", "레몬", "체리", "건포도", "건블루베리", "망고", "아보카도",

                // 육류
                "쇠고기", "돼지고기", "삼겹살", "닭고기", "계란",
                // 수산물
                "고등어", "갈치", "삼치", "연어", "오징어", "조기", "명태", "물오징어", "마른멸치",
                    "마른오징어", "김", "마른미역", "굴", "새우젓", "멸치액젓", "천일염", "꽁치",
                    "전복", "새우", "가리비", "건다시마", "바지락", "고등어필렛", "전어", "삼치",
                    "꽃게", "홍합",
                // 기타
                "두부", "우유", "계란"
            };

            Map<String, Integer> prices = priceService.getPrices(ingredients);

            if (prices.isEmpty()) {
                log.warn("가격 정보를 가져올 수 없음 - 기본 메시지 사용");
                return "가격 정보를 불러올 수 없습니다. 일반적인 시장 가격을 고려하여 추천합니다.";
            }

            StringBuilder priceInfo = new StringBuilder();

            // 카테고리별로 분류
            priceInfo.append("【곡류】\n");
            appendPricesByCategory(priceInfo, prices, "쌀", "찹쌀", "현미");

            priceInfo.append("\n【채소류】\n");
            appendPricesByCategory(priceInfo, prices, "배추", "무", "당근", "양파", "대파",
                    "마늘", "고추", "감자", "고구마", "시금치", "상추", "깻잎", "토마토", "오이", "호박", "가지",
                    "양배추", "알배기배추", "브로콜리", "얼갈이배추", "갓", "열무", "건고추",
                    "풋고추", "붉은고추", "생강", "고춧가루", "미나리", "피망", "파프리카",
                    "땅콩", "느타리버섯", "팽이버섯", "새송이버섯", "호두", "아몬드");

            priceInfo.append("\n【과일류】\n");
            appendPricesByCategory(priceInfo, prices, " 수박", "참외", "딸기",
                    "멜론", "방울토마토","사과", "배", "복숭아", "포도", "감귤", "단감", "바나나", "참다래", "파인애플",
                    "오렌지", "자몽", "레몬", "체리", "건포도", "건블루베리", "망고", "아보카도");

            priceInfo.append("\n【육류】\n");
            appendPricesByCategory(priceInfo, prices, "쇠고기", "돼지고기", "삼겹살", "닭고기", "계란");

            priceInfo.append("\n【수산물】\n");
            appendPricesByCategory(priceInfo, prices, "고등어", "갈치", "삼치", "연어", "오징어",
                    "조기", "명태", "물오징어", "마른멸치",
                    "마른오징어", "김", "마른미역", "굴", "새우젓", "멸치액젓", "천일염", "꽁치",
                    "전복", "새우", "가리비", "건다시마", "바지락", "고등어필렛", "전어", "삼치",
                    "꽃게", "홍합");

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
