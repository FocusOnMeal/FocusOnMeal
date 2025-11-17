package com.fom.boot.domain.ingredient.model.service;

/**
 * KAMIS API 데이터 동기화 서비스
 * 농산물 가격 정보를 조회하여 DB에 저장
 */
public interface KamisDataSyncService {

    /**
     * 특정 품목의 오늘 가격 데이터 동기화
     * @param itemCategoryCode 부류코드 (200:채소류 등)
     * @param itemCode 품목코드
     * @param kindCode 품종코드
     * @return 저장 성공 여부
     */
    boolean syncTodayPrice(String itemCategoryCode, String itemCode, String kindCode);

    /**
     * 특정 카테고리의 모든 품목 가격 동기화
     * @param itemCategoryCode 부류코드
     * @return 동기화된 품목 수
     */
    int syncCategoryPrices(String itemCategoryCode);

    /**
     * 테스트용: 특정 품목 데이터 동기화 및 결과 반환
     * @param itemCategoryCode 부류코드
     * @param itemCode 품목코드
     * @param kindCode 품종코드
     * @return 동기화 결과 메시지
     */
    String syncAndGetResult(String itemCategoryCode, String itemCode, String kindCode);

    /**
     * 전체 카테고리 데이터 동기화 (모든 부류 + 모든 품목)
     * @return 동기화된 총 품목 수
     */
    int syncAllCategories();

    /**
     * 전체 카테고리 동기화 및 결과 반환
     * @return 동기화 결과 메시지
     */
    String syncAllCategoriesAndGetResult();
}

