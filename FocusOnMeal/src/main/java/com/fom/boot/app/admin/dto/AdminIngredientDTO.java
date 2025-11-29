package com.fom.boot.app.admin.dto;

import java.math.BigDecimal;
import java.sql.Date;
import java.time.LocalDateTime;
import lombok.Data;

@Data
public class AdminIngredientDTO {
    // 1. 식재료 기본 정보 (INGREDIENT 테이블)
    private int ingredientId;      // 식자재 ID (PK)
    private String name;           // 표준 품목명
    private String category;       // 분류 (곡류, 육류 등)
    private String standardUnit;   // 기준 단위 (예: 1kg)
    
    // 2. KAMIS API 관련 코드 (확인용)
    private String kamisItemCode;
    private String kamisKindCode;
    
    // 3. 영양 정보 (NUTRITION_MASTER 테이블) - 수정 대상
    private int nutritionId;       // 영양정보 ID (없으면 0 or null)
    private BigDecimal calories;   // 칼로리 (100g 당)
    private BigDecimal carbsG;     // 탄수화물 (g)
    private BigDecimal proteinG;   // 단백질 (g)
    private BigDecimal fatG;       // 지방 (g)
    private BigDecimal sugarG;     // 당류 (g)
    
    // 4. 가격 정보 (PRICE_HISTORY 테이블)
    private Integer currentPrice;           // 최신 가격 (원)
    private LocalDateTime collectedDate;    // 최신 수집일
    private Integer previousPrice;          // 직전 가격 (날짜 무관, 바로 이전 데이터)
    private LocalDateTime previousCollectedDate; // 직전 가격 수집일
    private Double priceChangePercent;      // 가격 변동률 (%) - 선택적
    
    // 5. 활성 상태
    private String statusYn;       // 활성 상태 (Y/N)
    
    // 6. 기타 정보
    private String imageUrl;       // 이미지 URL (선택적, 서버에서 생성 가능)
    private Date enrollDate;       // 등록일
}