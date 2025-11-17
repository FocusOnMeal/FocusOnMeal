package com.fom.boot.domain.meal.model.service;

public interface KamisApiService {
    String testConnection();

    Integer getRetailPrice(String item);

    String getRawResponse(String date, String categoryCode);

    /**
     * 기간별 품목 가격 조회 (periodProductList)
     * @param startDay 시작일 (yyyy-MM-dd)
     * @param endDay 종료일 (yyyy-MM-dd)
     * @param itemCategoryCode 부류코드 (200:채소류 등)
     * @param itemCode 품목코드
     * @param kindCode 품종코드
     * @return JSON 응답 문자열
     */
    String getPeriodProductList(String startDay, String endDay, String itemCategoryCode,
                                 String itemCode, String kindCode);

    /**
     * 카테고리별 일일 가격 목록 조회 (dailyPriceByCategoryList)
     * @param categoryCode 부류코드 (100:식량작물, 200:채소류, 300:특용작물, 400:과일류, 500:축산물, 600:수산물)
     * @param regDay 조회일 (yyyy-MM-dd), null이면 오늘
     * @return JSON 응답 문자열
     */
    String getDailyPriceByCategoryList(String categoryCode, String regDay);
}

