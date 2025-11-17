package com.fom.boot.domain.ingredient.model.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fom.boot.domain.ingredient.model.mapper.IngredientMapper;
import com.fom.boot.domain.ingredient.model.mapper.IngredientPriceHistoryMapper;
import com.fom.boot.domain.ingredient.model.service.KamisDataSyncService;
import com.fom.boot.domain.ingredient.model.vo.Ingredient;
import com.fom.boot.domain.ingredient.model.vo.PriceHistory;
import com.fom.boot.domain.meal.model.service.KamisApiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * KAMIS API 데이터 동기화 서비스 구현체
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class KamisDataSyncServiceImpl implements KamisDataSyncService {

    private final KamisApiService kamisApiService;
    private final IngredientMapper ingredientMapper;
    private final IngredientPriceHistoryMapper priceHistoryMapper;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public boolean syncTodayPrice(String itemCategoryCode, String itemCode, String kindCode) {
        log.info("오늘 가격 동기화 시작 - 부류: {}, 품목: {}, 품종: {}", itemCategoryCode, itemCode, kindCode);

        try {
            // 오늘 날짜로 API 호출
            String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
            String response = kamisApiService.getPeriodProductList(today, today, itemCategoryCode, itemCode, kindCode);

            if (response == null) {
                log.error("KAMIS API 응답이 null입니다.");
                return false;
            }

            // 응답 파싱 및 저장
            return parseAndSaveData(response, itemCategoryCode, itemCode, kindCode);

        } catch (Exception e) {
            log.error("가격 동기화 실패", e);
            return false;
        }
    }

    @Override
    @Transactional
    public int syncCategoryPrices(String itemCategoryCode) {
        log.info("카테고리 전체 동기화 시작 - 부류: {}", itemCategoryCode);

        try {
            String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
            String response = kamisApiService.getDailyPriceByCategoryList(itemCategoryCode, today);

            if (response == null) {
                log.error("KAMIS API 응답이 null입니다.");
                return 0;
            }

            return parseAndSaveAllItems(response, itemCategoryCode);

        } catch (Exception e) {
            log.error("카테고리 전체 동기화 실패", e);
            return 0;
        }
    }

    @Override
    @Transactional
    public String syncAndGetResult(String itemCategoryCode, String itemCode, String kindCode) {
        log.info("테스트 동기화 시작 - 부류: {}, 품목: {}, 품종: {}", itemCategoryCode, itemCode, kindCode);

        try {
            String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
            String response = kamisApiService.getPeriodProductList(today, today, itemCategoryCode, itemCode, kindCode);

            if (response == null) {
                return "KAMIS API 응답이 null입니다.";
            }

            // JSON 파싱
            JsonNode root = objectMapper.readTree(response);
            JsonNode data = root.path("data");

            // 에러 체크
            if (data.isArray() && data.size() > 0 && !data.get(0).isObject()) {
                String errorCode = data.get(0).asText();
                return "KAMIS API 에러 코드: " + errorCode;
            }

            JsonNode items = data.path("item");
            if (!items.isArray() || items.size() == 0) {
                return "데이터 없음";
            }

            // 품목 정보 추출 (첫 번째 아이템에서)
            String itemName = extractItemName(items);
            if (itemName == null) {
                return "품목명을 찾을 수 없습니다.";
            }

            // Ingredient 저장 또는 조회
            Ingredient ingredient = getOrCreateIngredient(itemName, itemCategoryCode, itemCode, kindCode);
            if (ingredient == null) {
                return "식자재 저장 실패";
            }

            // 오늘 날짜의 평균 가격 추출
            Integer avgPrice = extractTodayAveragePrice(items, today);
            if (avgPrice == null) {
                return "오늘 날짜의 평균 가격을 찾을 수 없습니다.";
            }

            // PriceHistory 저장
            PriceHistory priceHistory = new PriceHistory();
            priceHistory.setIngredientId(ingredient.getIngredientId());
            priceHistory.setPriceValue(avgPrice);
            priceHistory.setPriceType("소매");
            priceHistory.setRegion("서울");
            priceHistory.setCollectedDate(LocalDateTime.now());

            int saved = priceHistoryMapper.insertPrice(priceHistory);

            if (saved > 0) {
                return String.format("동기화 성공 - 품목: %s, 가격: %d원, ingredientId: %d",
                        itemName, avgPrice, ingredient.getIngredientId());
            } else {
                return "가격 이력 저장 실패";
            }

        } catch (Exception e) {
            log.error("테스트 동기화 실패", e);
            return "에러: " + e.getMessage();
        }
    }

    /**
     * JSON 응답 파싱 및 데이터 저장
     */
    private boolean parseAndSaveData(String response, String itemCategoryCode, String itemCode, String kindCode) {
        try {
            JsonNode root = objectMapper.readTree(response);
            JsonNode data = root.path("data");

            // 에러 체크
            if (data.isArray() && data.size() > 0 && !data.get(0).isObject()) {
                String errorCode = data.get(0).asText();
                log.error("KAMIS API 에러 코드: {}", errorCode);
                return false;
            }

            JsonNode items = data.path("item");
            if (!items.isArray() || items.size() == 0) {
                log.warn("응답 데이터 없음");
                return false;
            }

            // 품목 정보 추출
            String itemName = extractItemName(items);
            if (itemName == null) {
                log.error("품목명을 찾을 수 없습니다.");
                return false;
            }

            // Ingredient 저장 또는 조회
            Ingredient ingredient = getOrCreateIngredient(itemName, itemCategoryCode, itemCode, kindCode);
            if (ingredient == null) {
                return false;
            }

            // 오늘 날짜의 평균 가격 추출
            String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
            Integer avgPrice = extractTodayAveragePrice(items, today);
            if (avgPrice == null) {
                log.warn("오늘 날짜의 평균 가격을 찾을 수 없습니다.");
                return false;
            }

            // PriceHistory 저장
            PriceHistory priceHistory = new PriceHistory();
            priceHistory.setIngredientId(ingredient.getIngredientId());
            priceHistory.setPriceValue(avgPrice);
            priceHistory.setPriceType("소매");
            priceHistory.setRegion("서울");
            priceHistory.setCollectedDate(LocalDateTime.now());

            int saved = priceHistoryMapper.insertPrice(priceHistory);
            log.info("가격 이력 저장 완료 - 품목: {}, 가격: {}원", itemName, avgPrice);

            return saved > 0;

        } catch (Exception e) {
            log.error("데이터 파싱 및 저장 실패", e);
            return false;
        }
    }

    /**
     * 품목명 추출 (첫 번째 아이템에서 kindname 사용)
     */
    private String extractItemName(JsonNode items) {
        for (JsonNode item : items) {
            JsonNode kindNameNode = item.path("kindname");
            if (kindNameNode.isArray() && kindNameNode.size() > 0) {
                // "시금치(1kg)" 형태에서 품목명만 추출
                String fullName = kindNameNode.get(0).asText();
                if (fullName.contains("(")) {
                    return fullName.substring(0, fullName.indexOf("(")).trim();
                }
                return fullName;
            }
        }
        return null;
    }

    /**
     * 오늘 날짜의 평균 가격 추출
     */
    private Integer extractTodayAveragePrice(JsonNode items, String today) {
        // today: "2025-11-17" -> "11/17"
        String monthDay = today.substring(5).replace("-", "/");

        for (JsonNode item : items) {
            String countyName = item.path("countyname").asText();
            String regday = item.path("regday").asText();

            // "평균" 데이터이고, 날짜가 오늘인 경우
            if ("평균".equals(countyName) && regday.equals(monthDay)) {
                String priceStr = item.path("price").asText();
                if (priceStr != null && !priceStr.isEmpty() && !"-".equals(priceStr)) {
                    return Integer.parseInt(priceStr.replace(",", ""));
                }
            }
        }

        return null;
    }

    /**
     * Ingredient 조회 또는 생성
     */
    private Ingredient getOrCreateIngredient(String itemName, String itemCategoryCode, String itemCode, String kindCode) {
        // 기존 데이터 확인
        Ingredient existing = ingredientMapper.selectByKamisCode(itemCode, kindCode);
        if (existing != null) {
            log.debug("기존 식자재 사용 - id: {}, name: {}", existing.getIngredientId(), existing.getName());
            return existing;
        }

        // 새로 등록
        Ingredient newIngredient = new Ingredient();
        newIngredient.setName(itemName);
        newIngredient.setCategory(getCategoryName(itemCategoryCode));
        newIngredient.setStandardUnit("kg");
        newIngredient.setKamisItemCode(itemCode);
        newIngredient.setKamisKindCode(kindCode);
        newIngredient.setKamisItemCategoryCode(itemCategoryCode);

        int inserted = ingredientMapper.insertIngredient(newIngredient);
        if (inserted > 0) {
            log.info("새 식자재 등록 - id: {}, name: {}", newIngredient.getIngredientId(), itemName);
            return newIngredient;
        }

        log.error("식자재 등록 실패 - name: {}", itemName);
        return null;
    }

    /**
     * 부류 코드를 한글명으로 변환
     */
    private String getCategoryName(String code) {
        return switch (code) {
            case "100" -> "식량작물";
            case "200" -> "채소류";
            case "300" -> "특용작물";
            case "400" -> "과일류";
            case "500" -> "축산물";
            case "600" -> "수산물";
            default -> "기타";
        };
    }

    @Override
    @Transactional
    public int syncAllCategories() {
        log.info("전체 카테고리 동기화 시작");

        String[] categories = {"100", "200", "300", "400", "500", "600"};
        int totalSynced = 0;

        for (String category : categories) {
            try {
                int synced = syncCategoryPrices(category);
                totalSynced += synced;
                log.info("카테고리 {} 동기화 완료 - {}개 품목", getCategoryName(category), synced);
            } catch (Exception e) {
                log.error("카테고리 {} 동기화 실패", category, e);
            }
        }

        log.info("전체 카테고리 동기화 완료 - 총 {}개 품목", totalSynced);
        return totalSynced;
    }

    @Override
    @Transactional
    public String syncAllCategoriesAndGetResult() {
        log.info("전체 카테고리 동기화 시작 (결과 반환)");

        StringBuilder result = new StringBuilder();
        String[] categories = {"100", "200", "300", "400", "500", "600"};
        int totalSynced = 0;

        for (String category : categories) {
            try {
                int synced = syncCategoryPrices(category);
                totalSynced += synced;
                result.append(String.format("%s: %d개, ", getCategoryName(category), synced));
            } catch (Exception e) {
                log.error("카테고리 {} 동기화 실패", category, e);
                result.append(String.format("%s: 실패, ", getCategoryName(category)));
            }
        }

        String finalResult = String.format("동기화 완료 - 총 %d개 품목 [%s]", totalSynced, result.toString());
        log.info(finalResult);
        return finalResult;
    }

    /**
     * dailyPriceByCategoryList 응답에서 모든 품목 파싱 및 저장
     */
    private int parseAndSaveAllItems(String response, String categoryCode) {
        try {
            JsonNode root = objectMapper.readTree(response);
            JsonNode data = root.path("data");

            // 에러 체크
            if (data.isArray() && data.size() > 0 && !data.get(0).isObject()) {
                String errorCode = data.get(0).asText();
                log.error("KAMIS API 에러 코드: {}", errorCode);
                return 0;
            }

            JsonNode items = data.path("item");
            if (!items.isArray() || items.size() == 0) {
                log.warn("응답 데이터 없음 - 카테고리: {}", categoryCode);
                return 0;
            }

            int savedCount = 0;

            for (JsonNode item : items) {
                try {
                    // 품목 정보 추출
                    String itemName = item.path("item_name").asText();
                    String itemCode = item.path("item_code").asText();
                    String kindCode = item.path("kind_code").asText();
                    String rank = item.path("rank").asText();

                    // 상품 등급만 처리
                    if (!"상품".equals(rank)) {
                        continue;
                    }

                    // 가격 추출 (dpr1: 당일)
                    String priceStr = item.path("dpr1").asText();
                    if (priceStr == null || priceStr.isEmpty() || "-".equals(priceStr)) {
                        log.debug("가격 없음 - 품목: {}", itemName);
                        continue;
                    }

                    Integer price = Integer.parseInt(priceStr.replace(",", ""));

                    // Ingredient 저장 또는 조회
                    Ingredient ingredient = getOrCreateIngredient(itemName, categoryCode, itemCode, kindCode);
                    if (ingredient == null) {
                        continue;
                    }

                    // 오늘 이미 저장된 가격이 있는지 확인
                    int exists = priceHistoryMapper.checkTodayPriceExists(ingredient.getIngredientId());
                    if (exists > 0) {
                        log.debug("오늘 가격 이미 존재 - 품목: {}, 건너뜀", itemName);
                        continue;
                    }

                    // PriceHistory 저장
                    PriceHistory priceHistory = new PriceHistory();
                    priceHistory.setIngredientId(ingredient.getIngredientId());
                    priceHistory.setPriceValue(price);
                    priceHistory.setPriceType("소매");
                    priceHistory.setRegion("서울");
                    priceHistory.setCollectedDate(LocalDateTime.now());

                    int saved = priceHistoryMapper.insertPrice(priceHistory);
                    if (saved > 0) {
                        savedCount++;
                        log.debug("가격 저장 - 품목: {}, 가격: {}원", itemName, price);
                    }

                } catch (Exception e) {
                    log.warn("품목 저장 실패", e);
                }
            }

            log.info("카테고리 {} 저장 완료 - {}개 품목", getCategoryName(categoryCode), savedCount);
            return savedCount;

        } catch (Exception e) {
            log.error("전체 품목 파싱 및 저장 실패", e);
            return 0;
        }
    }
}