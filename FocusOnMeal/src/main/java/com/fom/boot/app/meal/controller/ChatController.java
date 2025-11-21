package com.fom.boot.app.meal.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fom.boot.app.meal.dto.ChatRequest;
import com.fom.boot.app.meal.dto.MealIngredient;
import com.fom.boot.app.meal.dto.MealNutrition;
import com.fom.boot.app.meal.dto.MealPlanResponse;
import com.fom.boot.domain.ingredient.model.service.PriceService;
import com.fom.boot.domain.meal.model.service.GeminiApiService;
import com.fom.boot.domain.meal.model.service.MealService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 채팅 기반 식단 추천 컨트롤러
 */
@Slf4j
@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class ChatController {

    private final GeminiApiService geminiApiService;
    private final PriceService priceService;
    private final ObjectMapper objectMapper;
    private final MealService mealService;

    /**
     * 채팅 메시지로 식단 추천 요청
     */
    @PostMapping("/meal-recommendation")
    public ResponseEntity<Map<String, Object>> getMealRecommendation(@RequestBody ChatRequest request) {
        log.info("식단 추천 요청 - 메시지: {}", request.getMessage());

        Map<String, Object> response = new HashMap<>();

        try {
            // Gemini API 호출
            log.info("Gemini API 호출 시작...");
            String aiResponse = geminiApiService.generateMealPlan(
                    request.getHeight(),
                    request.getWeight(),
                    request.getServingSize(),
                    request.getAllergies(),
                    request.getMessage(),
                    request.getPreviousPrice()
            );

            log.info("Gemini API 응답 받음 (길이: {})", aiResponse.length());
            log.debug("Gemini API 원본 응답: {}", aiResponse);

            // JSON 응답 파싱 및 가격 계산
            MealPlanResponse mealPlan = parseAndCalculatePrice(aiResponse);

            response.put("status", "SUCCESS");
            response.put("mealPlan", mealPlan);

            log.info("식단 추천 성공 - {}", mealPlan.getMealName());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("식단 추천 실패 - 상세 에러", e);
            response.put("status", "ERROR");
            response.put("message", "식단 추천 중 오류가 발생했습니다: " + e.getMessage());
            response.put("errorDetail", e.getClass().getSimpleName());
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * AI 응답 파싱 및 가격 계산
     */
    private MealPlanResponse parseAndCalculatePrice(String aiResponse) {
        try {
            log.info("JSON 파싱 시작...");

            // JSON 응답에서 ```json ``` 마크다운 제거 (AI가 포함시킬 수 있음)
            String cleanJson = aiResponse.trim();
            if (cleanJson.startsWith("```json")) {
                cleanJson = cleanJson.substring(7);
                log.info("```json 마커 제거됨");
            }
            if (cleanJson.startsWith("```")) {
                cleanJson = cleanJson.substring(3);
                log.info("``` 마커 제거됨");
            }
            if (cleanJson.endsWith("```")) {
                cleanJson = cleanJson.substring(0, cleanJson.length() - 3);
                log.info("끝의 ``` 마커 제거됨");
            }
            cleanJson = cleanJson.trim();

            log.info("정제된 JSON (첫 200자): {}", cleanJson.substring(0, Math.min(200, cleanJson.length())));

            // JSON 파싱
            JsonNode rootNode = objectMapper.readTree(cleanJson);

            // 필드명 확인
            List<String> fieldList = new ArrayList<>();
            rootNode.fieldNames().forEachRemaining(fieldList::add);
            log.info("JSON 파싱 성공, 필드 개수: {}, 필드명: {}", fieldList.size(), String.join(", ", fieldList));

            // 재료 목록 파싱 및 가격 계산
            List<MealIngredient> ingredients = new ArrayList<>();
            int totalPrice = 0;
            JsonNode ingredientsNode = rootNode.get("ingredients");

            if (ingredientsNode != null && ingredientsNode.isArray()) {
                for (JsonNode ingredientNode : ingredientsNode) {
                    String name = ingredientNode.get("name").asText();
                    String amount = ingredientNode.get("amount").asText();
                    String unit = ingredientNode.get("unit").asText();

                    // DB에서 가격 조회
                    Integer pricePerKg = priceService.getPrice(name);
                    Integer ingredientPrice = null;

                    if (pricePerKg != null) {
                        // 가격 계산 (단위에 따라)
                        ingredientPrice = calculateIngredientPrice(pricePerKg, amount, unit);
                        totalPrice += ingredientPrice;
                    }

                    ingredients.add(MealIngredient.builder()
                            .name(name)
                            .amount(amount)
                            .unit(unit)
                            .price(pricePerKg)
                            .calculatedPrice(ingredientPrice)  // 실제 계산된 가격 저장
                            .build());
                }
            }

            // 영양 정보 파싱
            JsonNode nutritionNode = rootNode.get("nutrition");
            MealNutrition nutrition = null;
            if (nutritionNode != null) {
                nutrition = MealNutrition.builder()
                        .calories(nutritionNode.get("calories").asText())
                        .carbs(nutritionNode.get("carbs").asText())
                        .protein(nutritionNode.get("protein").asText())
                        .fat(nutritionNode.get("fat").asText())
                        .build();
            }

            // 레시피 파싱
            List<String> recipe = new ArrayList<>();
            JsonNode recipeNode = rootNode.get("recipe");
            if (recipeNode != null && recipeNode.isArray()) {
                recipeNode.forEach(node -> recipe.add(node.asText()));
            }

            // AI 예상 가격
            Integer estimatedPrice = rootNode.get("estimatedPrice").asInt();

            // 계산된 가격이 0이면 AI 예상 가격 사용
            Integer finalPrice = totalPrice > 0 ? totalPrice : estimatedPrice;

            return MealPlanResponse.builder()
                    .mealName(rootNode.get("mealName").asText())
                    .mealType(rootNode.get("mealType").asText())
                    .description(rootNode.get("description").asText())
                    .ingredients(ingredients)
                    .recipe(recipe)
                    .nutrition(nutrition)
                    .calculatedPrice(finalPrice)
                    .estimatedPrice(estimatedPrice)
                    .build();

        } catch (Exception e) {
            log.error("AI 응답 파싱 실패: {}", aiResponse, e);
            throw new RuntimeException("식단 데이터 파싱에 실패했습니다: " + e.getMessage());
        }
    }

    /**
     * 재료 가격 계산
     */
    private Integer calculateIngredientPrice(Integer pricePerKg, String amount, String unit) {
        try {
            double amountValue = Double.parseDouble(amount);

            // 단위에 따라 계산
            switch (unit.toLowerCase()) {
                case "g":
                    return (int) (pricePerKg * amountValue / 1000);
                case "kg":
                    return (int) (pricePerKg * amountValue);
                case "개":
                    // 개당 평균 중량 가정 (예: 계란 60g, 양파 200g 등)
                    return (int) (pricePerKg * amountValue * 0.2);  // 대략 200g 기준
                case "ml":
                case "l":
                    // 액체는 무게와 유사하게 계산
                    return (int) (pricePerKg * amountValue / (unit.equals("ml") ? 1000 : 1));
                default:
                    return pricePerKg;
            }
        } catch (NumberFormatException e) {
            log.warn("가격 계산 실패 - amount: {}, unit: {}", amount, unit);
            return 0;
        }
    }

    /**
     * 간단한 채팅 테스트 엔드포인트
     */
    @PostMapping("/simple")
    public ResponseEntity<Map<String, Object>> simpleChat(@RequestBody Map<String, String> request) {
        log.info("간단 채팅 요청 - 메시지: {}", request.get("message"));

        Map<String, Object> response = new HashMap<>();

        try {
            // 기본값으로 식단 추천
            String mealPlan = geminiApiService.generateMealPlan(
                    170,  // 기본 키
                    70,   // 기본 몸무게
                    1,    // 1인분
                    List.of(), // 알러지 없음
                    request.get("message"),
                    null  // 이전 가격 없음
            );

            response.put("status", "SUCCESS");
            response.put("reply", mealPlan);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("간단 채팅 실패", e);
            response.put("status", "ERROR");
            response.put("message", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * 식단 저장
     * POST /api/chat/save-meal
     */
    @PostMapping("/save-meal")
    public ResponseEntity<Map<String, Object>> saveMealPlan(
            @RequestBody com.fom.boot.app.meal.dto.SaveMealPlanRequest request,
            org.springframework.security.core.Authentication authentication) {

        log.info("식단 저장 요청 - 식단명: {}, 인분: {}", request.getPlanName(), request.getServingSize());

        Map<String, Object> response = new HashMap<>();

        try {
            // 로그인 확인
            if (authentication == null || !authentication.isAuthenticated()) {
                response.put("status", "ERROR");
                response.put("message", "로그인이 필요합니다.");
                return ResponseEntity.status(401).body(response);
            }

            String memberId = authentication.getName();

            // MealPlan VO 생성
            com.fom.boot.domain.meal.model.vo.MealPlan mealPlan = new com.fom.boot.domain.meal.model.vo.MealPlan();
            mealPlan.setMemberId(memberId);
            mealPlan.setPlanName(request.getPlanName());
            mealPlan.setServingSize(request.getServingSize());
            mealPlan.setTotalCost(request.getTotalCost());
            mealPlan.setWhenEat(request.getMealType());
            mealPlan.setAiRecipe(request.getRecipe());
            mealPlan.setIngredientsJson(request.getIngredients());

            // 영양 정보 설정
            if (request.getNutrition() != null) {
                try {
                    mealPlan.setCalories(new java.math.BigDecimal(request.getNutrition().getCalories()));
                    mealPlan.setCarbsG(new java.math.BigDecimal(request.getNutrition().getCarbs()));
                    mealPlan.setProteinG(new java.math.BigDecimal(request.getNutrition().getProtein()));
                    mealPlan.setFatG(new java.math.BigDecimal(request.getNutrition().getFat()));
                } catch (NumberFormatException e) {
                    log.warn("영양 정보 파싱 실패 - 기본값 사용", e);
                }
            }

            // DB 저장
            boolean success = mealService.saveMealPlan(mealPlan);

            if (success) {
                response.put("status", "SUCCESS");
                response.put("message", "식단이 저장되었습니다.");
                log.info("식단 저장 성공 - 회원ID: {}, 식단명: {}", memberId, request.getPlanName());
            } else {
                response.put("status", "ERROR");
                response.put("message", "식단 저장에 실패했습니다.");
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("식단 저장 중 오류 발생", e);
            response.put("status", "ERROR");
            response.put("message", "식단 저장 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
}
