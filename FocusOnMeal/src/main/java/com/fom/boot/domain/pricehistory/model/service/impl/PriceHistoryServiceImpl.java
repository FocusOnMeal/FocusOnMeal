package com.fom.boot.domain.pricehistory.model.service.impl;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.fom.boot.app.pricehistory.dto.PriceChangeRate;
import com.fom.boot.app.pricehistory.dto.PriceDataPoint;
import com.fom.boot.app.pricehistory.dto.PriceTrendResponse;
import com.fom.boot.domain.ingredient.model.mapper.IngredientMapper;
import com.fom.boot.domain.ingredient.model.vo.Ingredient;
import com.fom.boot.domain.ingredient.model.vo.PriceHistory;
import com.fom.boot.domain.pricehistory.model.mapper.PriceHistoryMapper;
import com.fom.boot.domain.pricehistory.model.service.PriceHistoryService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 가격 변동 추이 및 등락률 계산 서비스 구현체
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PriceHistoryServiceImpl implements PriceHistoryService {
	
	private final PriceHistoryMapper priceHistoryMapper;
    private final IngredientMapper ingredientMapper;
    
    @Override
    public PriceTrendResponse getPriceTrend(int ingredientId, String period, 
                                           LocalDate startDate, LocalDate endDate,
                                           String priceType, String region) {
        
        log.debug("getPriceTrend - ingredientId: {}, period: {}", ingredientId, period);
        
        // 식자재 정보 조회
        Ingredient ingredient = ingredientMapper.selectById(ingredientId);
        if (ingredient == null) {
            throw new RuntimeException("식자재를 찾을 수 없습니다. ID: " + ingredientId);
        }
        
        // 기간 설정 (미지정시 기본값)
        if (endDate == null) {
            endDate = LocalDate.now();
        }
        if (startDate == null) {
            startDate = calculateStartDate(endDate, period);
        }
        
        // 가격 이력 조회
        Map<String, Object> params = new HashMap<>();
        params.put("ingredientId", ingredientId);
        params.put("startDate", startDate.atStartOfDay());
        params.put("endDate", endDate.atTime(23, 59, 59));
        params.put("priceType", priceType);
        params.put("region", region);
        
        List<PriceHistory> histories = priceHistoryMapper.selectByDateRange(params);
        
        // 시계열 데이터 생성
        List<PriceDataPoint> dataPoints = buildTimeSeriesData(histories, period, startDate, endDate);
        
        // 등락률 계산
        PriceChangeRate changeRate = calculateChangeRate(dataPoints);
        
        // 응답 생성
        return PriceTrendResponse.builder()
                .ingredientId(ingredientId)
                .ingredientName(ingredient.getName())
                .category(ingredient.getCategory())
                .standardUnit(ingredient.getStandardUnit())
                .period(period)
                .startDate(startDate)
                .endDate(endDate)
                .priceType(priceType)
                .region(region)
                .dataPoints(dataPoints)
                .changeRate(changeRate)
                .build();
    }
    
    @Override
    public PriceTrendResponse getLatestPriceWithChanges(int ingredientId, 
                                                        String priceType, String region) {
        
        log.debug("getLatestPriceWithChanges - ingredientId: {}", ingredientId);
        
        // 식자재 정보 조회
        Ingredient ingredient = ingredientMapper.selectById(ingredientId);
        if (ingredient == null) {
            throw new RuntimeException("식자재를 찾을 수 없습니다. ID: " + ingredientId);
        }
        
        // 최근 가격 조회
        Map<String, Object> params = new HashMap<>();
        params.put("ingredientId", ingredientId);
        params.put("priceType", priceType);
        params.put("region", region);
        
        PriceHistory latestPrice = priceHistoryMapper.selectLatestPrice(params);
        
        if (latestPrice == null) {
            throw new RuntimeException("가격 정보가 없습니다. 식자재 ID: " + ingredientId);
        }
        
        // 1일 전 가격 조회
        LocalDateTime oneDayAgo = latestPrice.getCollectedDate().minusDays(1);
        params.put("targetDate", oneDayAgo);
        PriceHistory dayAgoPrice = priceHistoryMapper.selectClosestPrice(params);

        params.put("priceType", latestPrice.getPriceType());
        params.put("region", latestPrice.getRegion());
        
        // 1주일 전 가격 조회
        LocalDateTime oneWeekAgo = latestPrice.getCollectedDate().minusWeeks(1);
        params.put("targetDate", oneWeekAgo);
        PriceHistory weekAgoPrice = priceHistoryMapper.selectClosestPrice(params);

        // 1개월 전 가격 조회
        LocalDateTime oneMonthAgo = latestPrice.getCollectedDate().minusMonths(1);
        params.put("targetDate", oneMonthAgo);
        PriceHistory monthAgoPrice = priceHistoryMapper.selectClosestPrice(params);

        // 등락률 계산
        PriceChangeRate changeRate = new PriceChangeRate();
        changeRate.setCurrentPrice(latestPrice.getPriceValue());

        if (dayAgoPrice != null) {
            changeRate.setDailyChange(calculatePercentChange(
                    dayAgoPrice.getPriceValue(),
                    latestPrice.getPriceValue()
            ));
            changeRate.setDailyPriceDiff(latestPrice.getPriceValue() - dayAgoPrice.getPriceValue());
        }

        if (weekAgoPrice != null) {
            changeRate.setWeeklyChange(calculatePercentChange(
                    weekAgoPrice.getPriceValue(),
                    latestPrice.getPriceValue()
            ));
            changeRate.setWeeklyPriceDiff(latestPrice.getPriceValue() - weekAgoPrice.getPriceValue());
        }

        if (monthAgoPrice != null) {
            changeRate.setMonthlyChange(calculatePercentChange(
                    monthAgoPrice.getPriceValue(),
                    latestPrice.getPriceValue()
            ));
            changeRate.setMonthlyPriceDiff(latestPrice.getPriceValue() - monthAgoPrice.getPriceValue());
        }
        
        // 데이터 포인트 생성
        List<PriceDataPoint> dataPoints = new ArrayList<>();
        dataPoints.add(PriceDataPoint.builder()
                .date(latestPrice.getCollectedDate().toLocalDate())
                .price(latestPrice.getPriceValue())
                .priceType(latestPrice.getPriceType())
                .region(latestPrice.getRegion())
                .dataCount(1)
                .build());
        
        return PriceTrendResponse.builder()
                .ingredientId(ingredientId)
                .ingredientName(ingredient.getName())
                .category(ingredient.getCategory())
                .standardUnit(ingredient.getStandardUnit())
                .period("LATEST")
                .priceType(priceType)
                .region(region)
                .dataPoints(dataPoints)
                .changeRate(changeRate)
                .build();
    }
    
    @Override
    public List<PriceTrendResponse> getLatestPricesBatch(String ingredientIds, 
                                                         String priceType, String region) {
        
        log.debug("getLatestPricesBatch - ingredientIds: {}", ingredientIds);
        
        String[] ids = ingredientIds.split(",");
        List<PriceTrendResponse> responses = new ArrayList<>();
        
        for (String id : ids) {
            try {
                int ingredientId = Integer.parseInt(id.trim());
                PriceTrendResponse response = getLatestPriceWithChanges(
                        ingredientId, priceType, region
                );
                responses.add(response);
            } catch (NumberFormatException e) {
                log.warn("잘못된 식자재 ID 형식: {}", id);
            } catch (RuntimeException e) {
                log.warn("식자재 ID {}의 가격 정보 조회 실패: {}", id, e.getMessage());
            }
        }
        
        return responses;
    }
    
    /**
     * 시계열 데이터 생성 (일별/주별/월별)
     */
    private List<PriceDataPoint> buildTimeSeriesData(List<PriceHistory> histories, 
                                                     String period, 
                                                     LocalDate startDate, 
                                                     LocalDate endDate) {
        
        if (histories.isEmpty()) {
            return new ArrayList<>();
        }
        
        // 날짜별로 그룹화 및 평균 계산
        Map<LocalDate, List<PriceHistory>> groupedByDate;
        
        switch (period.toUpperCase()) {
            case "WEEKLY":
                groupedByDate = groupByWeek(histories);
                break;
            case "MONTHLY":
                groupedByDate = groupByMonth(histories);
                break;
            case "DAILY":
            default:
                groupedByDate = groupByDay(histories);
                break;
        }
        
        // 데이터 포인트 생성
        return groupedByDate.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> {
                    LocalDate date = entry.getKey();
                    List<PriceHistory> dayHistories = entry.getValue();
                    
                    // 평균 가격 계산
                    double avgPrice = dayHistories.stream()
                            .mapToInt(PriceHistory::getPriceValue)
                            .average()
                            .orElse(0);
                    
                    return PriceDataPoint.builder()
                            .date(date)
                            .price((int) Math.round(avgPrice))
                            .priceType(dayHistories.get(0).getPriceType())
                            .region(dayHistories.get(0).getRegion())
                            .dataCount(dayHistories.size())
                            .build();
                })
                .collect(Collectors.toList());
    }
    
    /**
     * 일별 그룹화
     */
    private Map<LocalDate, List<PriceHistory>> groupByDay(List<PriceHistory> histories) {
        return histories.stream()
                .collect(Collectors.groupingBy(
                        h -> h.getCollectedDate().toLocalDate()
                ));
    }
    
    /**
     * 주별 그룹화 (월요일 기준)
     */
    private Map<LocalDate, List<PriceHistory>> groupByWeek(List<PriceHistory> histories) {
        return histories.stream()
                .collect(Collectors.groupingBy(h -> {
                    LocalDate date = h.getCollectedDate().toLocalDate();
                    // 해당 주의 월요일 날짜 반환
                    return date.minusDays(date.getDayOfWeek().getValue() - 1);
                }));
    }
    
    /**
     * 월별 그룹화 (매월 1일 기준)
     */
    private Map<LocalDate, List<PriceHistory>> groupByMonth(List<PriceHistory> histories) {
        return histories.stream()
                .collect(Collectors.groupingBy(h -> {
                    LocalDate date = h.getCollectedDate().toLocalDate();
                    // 해당 월의 1일 반환
                    return date.withDayOfMonth(1);
                }));
    }
    
    /**
     * 등락률 계산
     */
    private PriceChangeRate calculateChangeRate(List<PriceDataPoint> dataPoints) {
        PriceChangeRate changeRate = new PriceChangeRate();
        
        if (dataPoints.isEmpty()) {
            return changeRate;
        }
        
        // 최근 가격
        PriceDataPoint latest = dataPoints.get(dataPoints.size() - 1);
        changeRate.setCurrentPrice(latest.getPrice());
        
        // 1주일 전 가격
        LocalDate weekAgo = latest.getDate().minusWeeks(1);
        Optional<PriceDataPoint> weekAgoPoint = findClosestDataPoint(dataPoints, weekAgo);
        weekAgoPoint.ifPresent(point -> {
            changeRate.setWeeklyChange(calculatePercentChange(point.getPrice(), latest.getPrice()));
            changeRate.setWeeklyPriceDiff(latest.getPrice() - point.getPrice());
        });
        
        // 1개월 전 가격
        LocalDate monthAgo = latest.getDate().minusMonths(1);
        Optional<PriceDataPoint> monthAgoPoint = findClosestDataPoint(dataPoints, monthAgo);
        monthAgoPoint.ifPresent(point -> {
            changeRate.setMonthlyChange(calculatePercentChange(point.getPrice(), latest.getPrice()));
            changeRate.setMonthlyPriceDiff(latest.getPrice() - point.getPrice());
        });
        
        return changeRate;
    }
    
    /**
     * 퍼센트 변동률 계산
     */
    private double calculatePercentChange(int oldPrice, int newPrice) {
        if (oldPrice == 0) {
            return 0.0;
        }
        
        BigDecimal oldValue = new BigDecimal(oldPrice);
        BigDecimal newValue = new BigDecimal(newPrice);
        BigDecimal diff = newValue.subtract(oldValue);
        BigDecimal percentChange = diff.divide(oldValue, 4, RoundingMode.HALF_UP)
                .multiply(new BigDecimal(100));
        
        return percentChange.setScale(2, RoundingMode.HALF_UP).doubleValue();
    }
    
    /**
     * 가장 가까운 날짜의 데이터 포인트 찾기
     */
    private Optional<PriceDataPoint> findClosestDataPoint(List<PriceDataPoint> dataPoints, 
                                                          LocalDate targetDate) {
        return dataPoints.stream()
                .min(Comparator.comparingLong(
                        point -> Math.abs(ChronoUnit.DAYS.between(point.getDate(), targetDate))
                ));
    }
    
    /**
     * 조회 기간에 따른 시작 날짜 계산
     */
    private LocalDate calculateStartDate(LocalDate endDate, String period) {
        switch (period.toUpperCase()) {
            case "WEEKLY":
                return endDate.minusWeeks(1);  // 1주
            case "MONTHLY":
                return endDate.minusMonths(1); // 1개월
            case "DAILY":
            default:
                return endDate.minusDays(1);  // 1일
        }
    }
	
}
