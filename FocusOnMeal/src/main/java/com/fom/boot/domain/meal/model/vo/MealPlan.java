package com.fom.boot.domain.meal.model.vo;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.math.BigDecimal;
import java.sql.Timestamp;

@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class MealPlan {
    private int planId; // 해당 식단 고유 ID (SEQ_MEAL_PLAN)
    private String memberId; // 회원 ID (FK)
    private String planName; // 사용자가 설정한 식단 명칭 또는 추천 명칭
    private int servingSize; // 가격을 측정할때 사용자가 몇 인분 기준으로 했는지 저장하는 테이블 (1로 함)
    private int totalCost; // 최종 계산된 비용
    private Timestamp createdAt; // 식단 생성 일시 (default)
    private String isDelete; // 논리 삭제 (default)
    private Timestamp deleteAt; // 삭제 요청 일시 (default)
    private BigDecimal calories; // 해당 식자재의 칼로리
    private BigDecimal carbsG; // 해당 식자재의 탄수화물
    private BigDecimal proteinG; // 해당 식자재의 단백질
    private BigDecimal fatG; // 해당 식자재의 지방
    private String aiRecipe; // 해당 식단 AI 레시피
    private String whenEat; // 언제 먹는 식단인지 (아침, 점심, 저녁)
}
