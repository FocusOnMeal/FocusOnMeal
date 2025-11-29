package com.fom.boot.domain.ingredient.model.service.impl;

import com.fom.boot.app.ingredient.dto.PricePredictionDTO;
import com.fom.boot.app.ingredient.dto.PricePredictionDTO.ForecastPoint;
import com.fom.boot.app.ingredient.dto.PricePredictionDTO.PreviewData;
import com.fom.boot.app.ingredient.dto.PricePredictionDTO.PredictionData;
import com.fom.boot.domain.ingredient.model.mapper.IngredientPriceHistoryMapper;
import com.fom.boot.domain.ingredient.model.service.PricePredictionService;
import com.fom.boot.domain.ingredient.model.vo.PriceHistory;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 가격 예측 서비스 구현체
 * 이동평균 및 선형회귀 기반 단순 예측
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PricePredictionServiceImpl implements PricePredictionService {

    private final IngredientPriceHistoryMapper priceHistoryMapper;

    @Override
    public PricePredictionDTO predictPrice(int ingredientId, int days, boolean isAuthenticated) {
        log.info("가격 예측 시작 - ingredientId: {}, days: {}, authenticated: {}",
                ingredientId, days, isAuthenticated);

        PricePredictionDTO response = new PricePredictionDTO();
        response.setHasAccess(isAuthenticated);

        try {
            // 최근 30일 가격 데이터 조회
            LocalDateTime endDate = LocalDateTime.now();
            LocalDateTime startDate = endDate.minusDays(30);

            Map<String, Object> params = new HashMap<>();
            params.put("ingredientId", ingredientId);
            params.put("startDate", startDate);
            params.put("endDate", endDate);
            params.put("priceType", "소매");
            params.put("region", "서울");

            List<PriceHistory> history = priceHistoryMapper.selectByDateRange(params);

            if (history == null || history.isEmpty()) {
                log.warn("가격 히스토리 데이터 없음 - ingredientId: {}", ingredientId);
                return createEmptyResponse(isAuthenticated);
            }

            // 예측 계산
            List<ForecastPoint> forecast = calculateForecast(history, days);
            Integer currentPrice = history.get(history.size() - 1).getPriceValue();
            Integer predictedPrice = forecast.get(forecast.size() - 1).getPrice();

            // 최소/최대 가격 계산 (신뢰구간)
            int minPrice = (int) (predictedPrice * 0.95);
            int maxPrice = (int) (predictedPrice * 1.05);

            // 추세 판단
            String trend = determineTrend(currentPrice, predictedPrice);

            // 신뢰도 계산 (데이터 개수에 따라)
            double confidence = calculateConfidence(history.size());

            if (isAuthenticated) {
                // 로그인 사용자: 전체 데이터 제공
                PredictionData predictionData = new PredictionData();
                predictionData.setPredictedPrice(predictedPrice);
                predictionData.setCurrentPrice(currentPrice);
                predictionData.setMinPrice(minPrice);
                predictionData.setMaxPrice(maxPrice);
                predictionData.setConfidence(confidence);
                predictionData.setTrend(trend);
                predictionData.setForecast(forecast);

                response.setPrediction(predictionData);
                response.setPreview(null);

            } else {
                // 비로그인 사용자: 미리보기만 제공
                PreviewData preview = new PreviewData();
                preview.setTrend(trend + " 예상");
                preview.setEstimatedRange(String.format("%,d ~ %,d원", minPrice, maxPrice));
                preview.setDataPoints(forecast.size());

                response.setPreview(preview);
                response.setPrediction(null);
            }

        } catch (Exception e) {
            log.error("가격 예측 실패 - ingredientId: {}", ingredientId, e);
            return createEmptyResponse(isAuthenticated);
        }

        return response;
    }

    /**
     * 이동평균 기반 가격 예측
     */
    private List<ForecastPoint> calculateForecast(List<PriceHistory> history, int days) {
        List<ForecastPoint> forecast = new ArrayList<>();

        // 최근 7일 이동평균 계산
        int windowSize = Math.min(7, history.size());
        double movingAvg = 0;

        for (int i = history.size() - windowSize; i < history.size(); i++) {
            movingAvg += history.get(i).getPriceValue();
        }
        movingAvg /= windowSize;

        // 선형 회귀로 추세 계산
        double slope = calculateSlope(history);

        // 예측 데이터 생성
        LocalDate lastDate = history.get(history.size() - 1).getCollectedDate().toLocalDate();

        for (int i = 1; i <= days; i++) {
            LocalDate forecastDate = lastDate.plusDays(i);
            int forecastPrice = (int) (movingAvg + (slope * i));

            // 음수 방지
            forecastPrice = Math.max(forecastPrice, 100);

            forecast.add(new ForecastPoint(forecastDate, forecastPrice));
        }

        return forecast;
    }

    /**
     * 선형 회귀로 기울기 계산
     */
    private double calculateSlope(List<PriceHistory> history) {
        int n = Math.min(14, history.size()); // 최근 14일
        int startIdx = history.size() - n;

        double sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

        for (int i = 0; i < n; i++) {
            int x = i;
            int y = history.get(startIdx + i).getPriceValue();

            sumX += x;
            sumY += y;
            sumXY += x * y;
            sumX2 += x * x;
        }

        // y = mx + b에서 m (기울기) 계산
        double slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

        return slope;
    }

    /**
     * 추세 판단
     */
    private String determineTrend(int currentPrice, int predictedPrice) {
        double changePercent = ((double) (predictedPrice - currentPrice) / currentPrice) * 100;

        if (changePercent > 2.0) {
            return "상승";
        } else if (changePercent < -2.0) {
            return "하락";
        } else {
            return "안정";
        }
    }

    /**
     * 신뢰도 계산 (데이터 개수에 비례)
     */
    private double calculateConfidence(int dataSize) {
        if (dataSize >= 30) {
            return 85.0;
        } else if (dataSize >= 20) {
            return 75.0;
        } else if (dataSize >= 10) {
            return 65.0;
        } else {
            return 50.0;
        }
    }

    /**
     * 빈 응답 생성 (데이터 없을 때)
     */
    private PricePredictionDTO createEmptyResponse(boolean isAuthenticated) {
        PricePredictionDTO response = new PricePredictionDTO();
        response.setHasAccess(isAuthenticated);

        if (!isAuthenticated) {
            PreviewData preview = new PreviewData();
            preview.setTrend("데이터 부족");
            preview.setEstimatedRange("N/A");
            preview.setDataPoints(0);
            response.setPreview(preview);
        }

        return response;
    }
}