package com.fom.boot.app.pricehistory.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 가격 등락률 정보
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PriceChangeRate {
    private int currentPrice;           // 현재 가격

    // 1일 전 대비
    private Double dailyChange;         // 1일 전 대비 등락률 (%)
    private Integer dailyPriceDiff;     // 1일 전 대비 가격 차이

    // 1주일 전 대비
    private Double weeklyChange;        // 1주일 전 대비 등락률 (%)
    private Integer weeklyPriceDiff;    // 1주일 전 대비 가격 차이

    // 1개월 전 대비
    private Double monthlyChange;       // 1개월 전 대비 등락률 (%)
    private Integer monthlyPriceDiff;   // 1개월 전 대비 가격 차이
    
    /**
     * 주간 등락률 텍스트 반환 (예: "↑ 5.2%", "↓ 3.1%", "→ 0.0%")
     */
    public String getWeeklyChangeText() {
        if (weeklyChange == null) return "데이터 없음";
        if (weeklyChange > 0) return String.format("↑ %.2f%%", weeklyChange);
        if (weeklyChange < 0) return String.format("↓ %.2f%%", Math.abs(weeklyChange));
        return "→ 0.00%";
    }
    
    /**
     * 월간 등락률 텍스트 반환
     */
    public String getMonthlyChangeText() {
        if (monthlyChange == null) return "데이터 없음";
        if (monthlyChange > 0) return String.format("↑ %.2f%%", monthlyChange);
        if (monthlyChange < 0) return String.format("↓ %.2f%%", Math.abs(monthlyChange));
        return "→ 0.00%";
    }
    
    /**
     * 주간 변동 상태 반환 (UP/DOWN/STABLE/NO_DATA)
     */
    public String getWeeklyStatus() {
        if (weeklyChange == null) return "NO_DATA";
        if (weeklyChange > 0.5) return "UP";
        if (weeklyChange < -0.5) return "DOWN";
        return "STABLE";
    }
    
    /**
     * 월간 변동 상태 반환
     */
    public String getMonthlyStatus() {
        if (monthlyChange == null) return "NO_DATA";
        if (monthlyChange > 0.5) return "UP";
        if (monthlyChange < -0.5) return "DOWN";
        return "STABLE";
    }
}