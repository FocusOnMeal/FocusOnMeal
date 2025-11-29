package com.fom.boot.app.ingredient.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

/**
 * 가격 예측 응답 DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PricePredictionDTO {

    private boolean hasAccess;  // 사용자 접근 권한 여부

    // 비로그인 사용자용 미리보기
    private PreviewData preview;

    // 로그인 사용자용 상세 예측 데이터
    private PredictionData prediction;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PreviewData {
        private String trend;              // "상승 예상", "하락 예상", "안정 예상"
        private String estimatedRange;     // "5,000 ~ 6,000원"
        private int dataPoints;            // 예측 데이터 개수
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PredictionData {
        private Integer predictedPrice;     // 예상 가격 (최종일 기준)
        private Integer currentPrice;       // 현재 가격
        private Integer minPrice;           // 최소 예상가
        private Integer maxPrice;           // 최대 예상가
        private Double confidence;          // 신뢰도 (%)
        private String trend;               // "상승", "하락", "안정"
        private List<ForecastPoint> forecast;  // 일별 예측 데이터
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ForecastPoint {
        private LocalDate date;
        private Integer price;
    }
}