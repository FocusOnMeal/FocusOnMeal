package com.fom.boot.app.api.controller;


import com.fom.boot.domain.alert.model.service.FoodSafetyApiService;
import com.fom.boot.domain.alert.model.service.FoodSafetyDataSyncService;
import com.fom.boot.domain.ingredient.model.service.KamisDataSyncService;
import com.fom.boot.domain.ingredient.model.service.PriceService;
import com.fom.boot.domain.meal.model.service.ChamgaApiService;
import com.fom.boot.domain.meal.model.service.GeminiApiService;
import com.fom.boot.domain.meal.model.service.KamisApiService;
import com.fom.boot.domain.meal.model.service.SeoulPriceApiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * API 연결 테스트 컨트롤러
 * 각 외부 API의 연결 상태를 테스트하는 엔드포인트 제공
 */
@Slf4j
@RestController
@RequestMapping("/api/test")
@RequiredArgsConstructor
public class ApiTestController {
    private final GeminiApiService geminiApiService;
    private final KamisApiService kamisApiService;
    private final ChamgaApiService chamgaApiService;
    private final SeoulPriceApiService seoulPriceApiService;
    private final PriceService priceService;
    private final KamisDataSyncService kamisDataSyncService;
    private final FoodSafetyApiService foodSafetyApiService;
    private final FoodSafetyDataSyncService foodSafetyDataSyncService;

    /**
     * 전체 API 연결 테스트
     * GET /api/test/all
     */
    @GetMapping("/all")
    public ResponseEntity<Map<String, Object>> testAllApis() {
        log.info("전체 API 연결 테스트 시작");

        Map<String, Object> result = new HashMap<>();

        try {
            // Gemini API 테스트
            String geminiResult = geminiApiService.testConnection();
            result.put("gemini", Map.of(
                    "status", geminiResult.contains("성공") ? "SUCCESS" : "FAIL",
                    "message", geminiResult
            ));
        } catch (Exception e) {
            result.put("gemini", Map.of(
                    "status", "ERROR",
                    "message", e.getMessage()
            ));
        }

        try {
            // KAMIS API 테스트
            String kamisResult = kamisApiService.testConnection();
            result.put("kamis", Map.of(
                    "status", kamisResult.contains("성공") ? "SUCCESS" : "FAIL",
                    "message", kamisResult
            ));
        } catch (Exception e) {
            result.put("kamis", Map.of(
                    "status", "ERROR",
                    "message", e.getMessage()
            ));
        }

        try {
            // 참가격 API 테스트
            String chamgaResult = chamgaApiService.testConnection();
            result.put("chamga", Map.of(
                    "status", chamgaResult.contains("성공") ? "SUCCESS" : "FAIL",
                    "message", chamgaResult
            ));
        } catch (Exception e) {
            result.put("chamga", Map.of(
                    "status", "ERROR",
                    "message", e.getMessage()
            ));
        }

        log.info("전체 API 연결 테스트 완료: {}", result);
        return ResponseEntity.ok(result);
    }

    /**
     * Gemini API 테스트
     * GET /api/test/gemini
     */
    @GetMapping("/gemini")
    public ResponseEntity<Map<String, Object>> testGemini() {
        log.info("Gemini API 단독 테스트");

        try {
            String result = geminiApiService.testConnection();

            return ResponseEntity.ok(Map.of(
                    "status", "SUCCESS",
                    "message", result
            ));
        } catch (Exception e) {
            log.error("Gemini API 테스트 실패", e);
            return ResponseEntity.ok(Map.of(
                    "status", "ERROR",
                    "message", e.getMessage()
            ));
        }
    }

    /**
     * Gemini API로 식단 생성 테스트
     * POST /api/test/gemini/meal
     */
    @PostMapping("/gemini/meal")
    public ResponseEntity<Map<String, Object>> testGeminiMealGeneration(
            @RequestBody Map<String, Object> request
    ) {
        log.info("Gemini 식단 생성 테스트: {}", request);

        try {
            int height = (Integer) request.getOrDefault("height", 170);
            int weight = (Integer) request.getOrDefault("weight", 70);
            int servingSize = (Integer) request.getOrDefault("servingSize", 1);
            List<String> allergies = (List<String>) request.getOrDefault("allergies", List.of());
            String message = (String) request.getOrDefault("message", "건강한 식단을 추천해주세요");

            String mealPlan = geminiApiService.generateMealPlan(
                    height, weight, servingSize, allergies, message, null
            );

            return ResponseEntity.ok(Map.of(
                    "status", "SUCCESS",
                    "mealPlan", mealPlan
            ));

        } catch (Exception e) {
            log.error("Gemini 식단 생성 테스트 실패", e);
            return ResponseEntity.ok(Map.of(
                    "status", "ERROR",
                    "message", e.getMessage()
            ));
        }
    }

    /**
     * KAMIS API 테스트
     * GET /api/test/kamis
     */
    @GetMapping("/kamis")
    public ResponseEntity<Map<String, Object>> testKamis() {
        log.info("KAMIS API 단독 테스트");

        try {
            String result = kamisApiService.testConnection();

            return ResponseEntity.ok(Map.of(
                    "status", "SUCCESS",
                    "message", result
            ));
        } catch (Exception e) {
            log.error("KAMIS API 테스트 실패", e);
            return ResponseEntity.ok(Map.of(
                    "status", "ERROR",
                    "message", e.getMessage()
            ));
        }
    }

    /**
     * KAMIS API 원본 응답 조회 (디버깅용)
     * GET /api/test/kamis/raw?date=2025-11-09&category=100
     */
    @GetMapping("/kamis/raw")
    public ResponseEntity<String> testKamisRaw(
            @RequestParam(required = false) String date,
            @RequestParam(defaultValue = "100") String category
    ) {
        log.info("KAMIS API 원본 응답 조회 - 날짜: {}, 부류: {}", date, category);

        try {
            // KamisApiService에 getRawResponse 메서드 필요
            String rawResponse = kamisApiService.getRawResponse(date, category);
            return ResponseEntity.ok(rawResponse);
        } catch (Exception e) {
            log.error("KAMIS API 원본 응답 조회 실패", e);
            return ResponseEntity.ok("ERROR: " + e.getMessage());
        }
    }

    /**
     * KAMIS API 품목 가격 조회 테스트
     * GET /api/test/kamis/price?item=쌀
     */
    @GetMapping("/kamis/price")
    public ResponseEntity<Map<String, Object>> testKamisPrice(
            @RequestParam(defaultValue = "쌀") String item
    ) {
        log.info("KAMIS 가격 조회 테스트 - 품목: {}", item);

        try {
            Integer price = kamisApiService.getRetailPrice(item);

            if (price != null) {
                return ResponseEntity.ok(Map.of(
                        "status", "SUCCESS",
                        "item", item,
                        "price", price,
                        "unit", "원/kg"
                ));
            } else {
                return ResponseEntity.ok(Map.of(
                        "status", "NOT_FOUND",
                        "message", "품목을 찾을 수 없습니다: " + item
                ));
            }

        } catch (Exception e) {
            log.error("KAMIS 가격 조회 실패", e);
            return ResponseEntity.ok(Map.of(
                    "status", "ERROR",
                    "message", e.getMessage()
            ));
        }
    }

    /**
     * 참가격 API 테스트
     * GET /api/test/chamga
     */
    @GetMapping("/chamga")
    public ResponseEntity<Map<String, Object>> testChamga() {
        log.info("참가격 API 단독 테스트");

        try {
            String result = chamgaApiService.testConnection();

            return ResponseEntity.ok(Map.of(
                    "status", "SUCCESS",
                    "message", result
            ));
        } catch (Exception e) {
            log.error("참가격 API 테스트 실패", e);
            return ResponseEntity.ok(Map.of(
                    "status", "ERROR",
                    "message", e.getMessage()
            ));
        }
    }

    /**
     * 서울시 생필품 가격 API 테스트
     * GET /api/test/seoul
     */
    @GetMapping("/seoul")
    public ResponseEntity<Map<String, Object>> testSeoul() {
        log.info("서울시 생필품 가격 API 단독 테스트");

        try {
            String result = seoulPriceApiService.testConnection();

            return ResponseEntity.ok(Map.of(
                    "status", "SUCCESS",
                    "message", result
            ));
        } catch (Exception e) {
            log.error("서울시 API 테스트 실패", e);
            return ResponseEntity.ok(Map.of(
                    "status", "ERROR",
                    "message", e.getMessage()
            ));
        }
    }

    /**
     * 서울시 API 품목 가격 조회 테스트
     * GET /api/test/seoul/price?item=쌀
     */
    @GetMapping("/seoul/price")
    public ResponseEntity<Map<String, Object>> testSeoulPrice(
            @RequestParam(defaultValue = "쌀") String item
    ) {
        log.info("서울시 API 가격 조회 테스트 - 품목: {}", item);

        try {
            Integer price = seoulPriceApiService.getAveragePrice(item);

            if (price != null) {
                return ResponseEntity.ok(Map.of(
                        "status", "SUCCESS",
                        "item", item,
                        "price", price,
                        "unit", "원"
                ));
            } else {
                return ResponseEntity.ok(Map.of(
                        "status", "NOT_FOUND",
                        "message", "품목을 찾을 수 없습니다: " + item
                ));
            }

        } catch (Exception e) {
            log.error("서울시 API 가격 조회 실패", e);
            return ResponseEntity.ok(Map.of(
                    "status", "ERROR",
                    "message", e.getMessage()
            ));
        }
    }

    /**
     * 참가격 API 상품 가격 조회 테스트
     * GET /api/test/chamga/price?product=계란
     */
    @GetMapping("/chamga/price")
    public ResponseEntity<Map<String, Object>> testChamgaPrice(
            @RequestParam(defaultValue = "계란") String product
    ) {
        log.info("참가격 가격 조회 테스트 - 상품: {}", product);

        try {
            Integer price = chamgaApiService.getRetailPrice(product);

            if (price != null) {
                return ResponseEntity.ok(Map.of(
                        "status", "SUCCESS",
                        "product", product,
                        "price", price,
                        "unit", "원"
                ));
            } else {
                return ResponseEntity.ok(Map.of(
                        "status", "NOT_FOUND",
                        "message", "상품을 찾을 수 없습니다: " + product
                ));
            }

        } catch (Exception e) {
            log.error("참가격 가격 조회 실패", e);
            return ResponseEntity.ok(Map.of(
                    "status", "ERROR",
                    "message", e.getMessage()
            ));
        }
    }

    /**
     * PriceService 가격 조회 테스트
     * GET /api/test/price?ingredient=쌀
     */
    @GetMapping("/price")
    public ResponseEntity<Map<String, Object>> testPrice(
            @RequestParam(defaultValue = "쌀") String ingredient
    ) {
        log.info("PriceService 가격 조회 테스트 - 식자재: {}", ingredient);

        try {
            Integer price = priceService.getPrice(ingredient);

            if (price != null) {
                return ResponseEntity.ok(Map.of(
                        "status", "SUCCESS",
                        "ingredient", ingredient,
                        "price", price,
                        "unit", "원/kg"
                ));
            } else {
                return ResponseEntity.ok(Map.of(
                        "status", "NOT_FOUND",
                        "message", "가격을 찾을 수 없습니다: " + ingredient
                ));
            }

        } catch (Exception e) {
            log.error("가격 조회 실패", e);
            return ResponseEntity.ok(Map.of(
                    "status", "ERROR",
                    "message", e.getMessage()
            ));
        }
    }

    /**
     * PriceService 여러 식자재 가격 조회 테스트
     * GET /api/test/prices?ingredients=쌀,배추,돼지고기
     */
    @GetMapping("/prices")
    public ResponseEntity<Map<String, Object>> testPrices(
            @RequestParam(defaultValue = "쌀,배추,돼지고기,계란,우유") String ingredients
    ) {
        log.info("PriceService 여러 식자재 가격 조회 테스트 - 식자재: {}", ingredients);

        try {
            String[] ingredientArray = ingredients.split(",");
            Map<String, Integer> prices = priceService.getPrices(ingredientArray);

            return ResponseEntity.ok(Map.of(
                    "status", "SUCCESS",
                    "requested", ingredientArray.length,
                    "found", prices.size(),
                    "prices", prices,
                    "unit", "원/kg"
            ));

        } catch (Exception e) {
            log.error("여러 식자재 가격 조회 실패", e);
            return ResponseEntity.ok(Map.of(
                    "status", "ERROR",
                    "message", e.getMessage()
            ));
        }
    }

    /**
     * 헬스 체크 엔드포인트
     * GET /api/test/health
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "message", "API Test Controller is running"
        ));
    }

    /**
     * KAMIS 데이터 동기화 테스트
     * GET /api/test/kamis/sync?category=200&item=213&kind=00
     * 예: 채소류(200), 시금치(213), 전체품종(00)
     */
    @GetMapping("/kamis/sync")
    public ResponseEntity<Map<String, Object>> testKamisSync(
            @RequestParam(defaultValue = "200") String category,
            @RequestParam(defaultValue = "213") String item,
            @RequestParam(defaultValue = "00") String kind
    ) {
        log.info("KAMIS 데이터 동기화 테스트 - 부류: {}, 품목: {}, 품종: {}", category, item, kind);

        try {
            String result = kamisDataSyncService.syncAndGetResult(category, item, kind);

            return ResponseEntity.ok(Map.of(
                    "status", result.contains("성공") ? "SUCCESS" : "FAIL",
                    "category", category,
                    "itemCode", item,
                    "kindCode", kind,
                    "result", result
            ));

        } catch (Exception e) {
            log.error("KAMIS 데이터 동기화 실패", e);
            return ResponseEntity.ok(Map.of(
                    "status", "ERROR",
                    "message", e.getMessage()
            ));
        }
    }

    /**
     * KAMIS periodProductList 원본 응답 조회
     * GET /api/test/kamis/period?category=200&item=213&kind=00
     */
    @GetMapping("/kamis/period")
    public ResponseEntity<String> testKamisPeriod(
            @RequestParam(defaultValue = "200") String category,
            @RequestParam(defaultValue = "213") String item,
            @RequestParam(defaultValue = "00") String kind,
            @RequestParam(required = false) String startDay,
            @RequestParam(required = false) String endDay
    ) {
        log.info("KAMIS periodProductList 조회 - 부류: {}, 품목: {}, 품종: {}", category, item, kind);

        try {
            // 날짜 미지정시 오늘 날짜 사용
            if (startDay == null || startDay.isEmpty()) {
                startDay = java.time.LocalDate.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd"));
            }
            if (endDay == null || endDay.isEmpty()) {
                endDay = startDay;
            }

            String response = kamisApiService.getPeriodProductList(startDay, endDay, category, item, kind);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("KAMIS periodProductList 조회 실패", e);
            return ResponseEntity.ok("ERROR: " + e.getMessage());
        }
    }

    /**
     * KAMIS 전체 카테고리 데이터 동기화
     * GET /api/test/kamis/sync/all
     * 모든 부류(식량작물, 채소류, 특용작물, 과일류, 축산물, 수산물)의 모든 품목을 동기화
     */
    @GetMapping("/kamis/sync/all")
    public ResponseEntity<Map<String, Object>> testKamisSyncAll() {
        log.info("KAMIS 전체 카테고리 데이터 동기화 시작");

        try {
            String result = kamisDataSyncService.syncAllCategoriesAndGetResult();

            return ResponseEntity.ok(Map.of(
                    "status", result.contains("동기화 완료") ? "SUCCESS" : "FAIL",
                    "result", result
            ));

        } catch (Exception e) {
            log.error("KAMIS 전체 동기화 실패", e);
            return ResponseEntity.ok(Map.of(
                    "status", "ERROR",
                    "message", e.getMessage()
            ));
        }
    }

    /**
     * KAMIS dailyPriceByCategoryList 원본 응답 조회
     * GET /api/test/kamis/daily?category=200
     */
    @GetMapping("/kamis/daily")
    public ResponseEntity<String> testKamisDaily(
            @RequestParam(defaultValue = "200") String category,
            @RequestParam(required = false) String regDay
    ) {
        log.info("KAMIS dailyPriceByCategoryList 조회 - 부류: {}, 날짜: {}", category, regDay);

        try {
            String response = kamisApiService.getDailyPriceByCategoryList(category, regDay);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("KAMIS dailyPriceByCategoryList 조회 실패", e);
            return ResponseEntity.ok("ERROR: " + e.getMessage());
        }
    }
    
    /**
     * 식품안전정보원 API 테스트
     * GET /api/test/food-safety
     */
    @GetMapping("/food-safety")
    public ResponseEntity<Map<String, Object>> testFoodSafety() {
        log.info("식품안전정보원 API 단독 테스트");

        try {
            String result = foodSafetyApiService.testConnection();

            return ResponseEntity.ok(Map.of(
                    "status", result.contains("성공") || result.contains("연결 성공") ? "SUCCESS" : "FAIL",
                    "message", result
            ));
        } catch (Exception e) {
            log.error("식품안전정보원 API 테스트 실패", e);
            return ResponseEntity.ok(Map.of(
                    "status", "ERROR",
                    "message", e.getMessage()
            ));
        }
    }

    /**
     * 식품안전정보원 API 원본 응답 조회
     * GET /api/test/food-safety/raw?start=1&end=10
     */
    @GetMapping("/food-safety/raw")
    public ResponseEntity<String> testFoodSafetyRaw(
            @RequestParam(defaultValue = "1") int start,
            @RequestParam(defaultValue = "10") int end
    ) {
        log.info("식품안전정보원 API 원본 응답 조회 - start: {}, end: {}", start, end);

        try {
            String rawResponse = foodSafetyApiService.getRawResponse(start, end);
            return ResponseEntity.ok(rawResponse);
        } catch (Exception e) {
            log.error("식품안전정보원 API 원본 응답 조회 실패", e);
            return ResponseEntity.ok("ERROR: " + e.getMessage());
        }
    }

    /**
     * 식품안전정보 동기화 테스트
     * GET /api/test/food-safety/sync
     */
    @GetMapping("/food-safety/sync")
    public ResponseEntity<Map<String, Object>> testFoodSafetySync() {
        log.info("식품안전정보 동기화 테스트");

        try {
            String result = foodSafetyDataSyncService.syncAndGetResult();

            return ResponseEntity.ok(Map.of(
                    "status", result.contains("완료") ? "SUCCESS" : "FAIL",
                    "result", result
            ));

        } catch (Exception e) {
            log.error("식품안전정보 동기화 테스트 실패", e);
            return ResponseEntity.ok(Map.of(
                    "status", "ERROR",
                    "message", e.getMessage()
            ));
        }
    }

    /**
     * 식품안전정보 최근 데이터 동기화
     * GET /api/test/food-safety/sync/recent
     */
    @GetMapping("/food-safety/sync/recent")
    public ResponseEntity<Map<String, Object>> testFoodSafetySyncRecent() {
        log.info("식품안전정보 최근 데이터 동기화 테스트");

        try {
            int savedCount = foodSafetyDataSyncService.syncRecentAlerts();

            return ResponseEntity.ok(Map.of(
                    "status", "SUCCESS",
                    "savedCount", savedCount,
                    "message", savedCount + "건의 위험 공표 정보가 저장되었습니다."
            ));

        } catch (Exception e) {
            log.error("식품안전정보 최근 동기화 실패", e);
            return ResponseEntity.ok(Map.of(
                    "status", "ERROR",
                    "message", e.getMessage()
            ));
        }
    }

    /**
     * 식품안전정보 전체 동기화
     * GET /api/test/food-safety/sync/all
     */
    @GetMapping("/food-safety/sync/all")
    public ResponseEntity<Map<String, Object>> testFoodSafetySyncAll() {
        log.info("식품안전정보 전체 동기화 테스트");

        try {
            int savedCount = foodSafetyDataSyncService.syncAllAlerts();

            return ResponseEntity.ok(Map.of(
                    "status", "SUCCESS",
                    "savedCount", savedCount,
                    "message", savedCount + "건의 위험 공표 정보가 저장되었습니다."
            ));

        } catch (Exception e) {
            log.error("식품안전정보 전체 동기화 실패", e);
            return ResponseEntity.ok(Map.of(
                    "status", "ERROR",
                    "message", e.getMessage()
            ));
        }
    }
    
    /**
     * 최근 7일치 위험 공표 정보를 수동으로 동기화하고 결과를 반환합니다.
     * 엔드포인트: GET /api/sync/recent
     * @return 동기화 결과 메시지
     */
    @GetMapping("/sync/recent")
    public ResponseEntity<String> syncRecentAlertsManually() {
        log.info("Manual synchronization of recent alerts triggered.");
        
        try {
            // FoodSafetyDataSyncServiceImpl의 테스트용 메서드 호출
            // 이 메서드는 최근 7일치 데이터를 가져오고 상세 결과를 문자열로 반환합니다.
            String result = foodSafetyDataSyncService.syncAndGetResult();
            
            return ResponseEntity.ok("데이터 동기화 요청 성공: " + result);
            
        } catch (Exception e) {
            log.error("Manual synchronization failed", e);
            return ResponseEntity.internalServerError().body("데이터 동기화 중 오류 발생: " + e.getMessage());
        }
    }

    /**
     * 특정 범위의 위험 공표 정보를 수동으로 동기화합니다. (대량 데이터 동기화용)
     * 엔드포인트: GET /api/sync/range?start=1&end=100
     * @param startIdx 시작 인덱스 (API 기준)
     * @param endIdx 종료 인덱스 (API 기준)
     * @return 동기화된 건수
     */
    @GetMapping("/sync/range")
    public ResponseEntity<String> syncAlertsByRange(
            @RequestParam(required = true) Integer start,
            @RequestParam(required = true) Integer end
    ) {
        log.info("Manual synchronization by range triggered: start={}, end={}", start, end);

        if (start <= 0 || end <= 0 || start > end) {
            return ResponseEntity.badRequest().body("시작 및 종료 인덱스가 유효하지 않습니다.");
        }

        try {
            int savedCount = foodSafetyDataSyncService.syncAlertsByRange(start, end);
            return ResponseEntity.ok(String.format("범위 동기화 요청 성공: %d 건 저장 완료", savedCount));
        } catch (Exception e) {
            log.error("Range synchronization failed", e);
            return ResponseEntity.internalServerError().body("범위 동기화 중 오류 발생: " + e.getMessage());
        }
    }
    
    // [추가] Raw Response 확인용 임시 엔드포인트
    @GetMapping("/raw")
    public String getRawApi(int start, int end) {
        log.info("Raw API response requested: start={}, end={}", start, end);
        
        // **중요: 기간을 1년으로 넓힌 버전으로 호출해야 정확한 테스트가 됩니다.**
        // getRawResponse의 내부 로직이 7일로 고정되어 있다면, 그 코드를 수정해야 합니다.
        // 현재 FoodSafetyApiServiceImpl의 getRawResponse는 7일로 되어 있습니다.
        
        // 임시로 getRawResponse 내부 코드를 1년으로 변경하거나,
        // 아래처럼 Service에 별도의 1년 조회 메서드를 임시로 만들어 사용해야 합니다.
        
        return foodSafetyApiService.getRawResponse(start, end);
    }
}


