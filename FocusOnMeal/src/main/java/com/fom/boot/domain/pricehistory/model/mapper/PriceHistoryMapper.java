package com.fom.boot.domain.pricehistory.model.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;

import com.fom.boot.domain.ingredient.model.vo.Ingredient;
import com.fom.boot.domain.ingredient.model.vo.PriceHistory;

/**
 * 가격 이력 Mapper 인터페이스
 */
@Mapper
public interface PriceHistoryMapper {

//	/**
//     * 식자재 ID와 날짜 범위로 가격 이력 조회
//     * 
//     * @param params 조회 조건 (ingredientId, startDate, endDate, priceType, region)
//     * @return 가격 이력 목록
//     */
//    List<PriceHistory> selectByDateRange(Map<String, Object> params);
//    
//    /**
//     * 최근 가격 정보 조회
//     * 
//     * @param params 조회 조건 (ingredientId, priceType, region)
//     * @return 최근 가격 정보
//     */
//    PriceHistory selectLatestPrice(Map<String, Object> params);
//    
//    /**
//     * 특정 날짜에 가장 가까운 가격 정보 조회
//     * 
//     * @param params 조회 조건 (ingredientId, targetDate, priceType, region)
//     * @return 가장 가까운 날짜의 가격 정보
//     */
//    PriceHistory selectClosestPrice(Map<String, Object> params);
    
    /**
     * 특정 식자재의 가격 통계 조회
     * 
     * @param params 조회 조건 (ingredientId, startDate, endDate)
     * @return 가격 통계 (최소/최대/평균)
     */
    Map<String, Object> selectPriceStatistics(Map<String, Object> params);
    
    /**
     * 가격 이력 저장 (배치 데이터 입력용)
     * 
     * @param priceHistory 가격 이력 정보
     * @return 저장된 행 수
     */
    int insertPriceHistory(PriceHistory priceHistory);
    
    /**
     * 가격 이력 수정
     * 
     * @param priceHistory 가격 이력 정보
     * @return 수정된 행 수
     */
    int updatePriceHistory(PriceHistory priceHistory);
    
    /**
     * 가격 이력 삭제
     * 
     * @param priceHistoryId 가격 이력 ID
     * @return 삭제된 행 수
     */
    int deletePriceHistory(int priceHistoryId);
    
    /**
     * 날짜 범위로 가격 이력 조회
     */
    List<PriceHistory> selectByDateRange(Map<String, Object> params);
    
    /**
     * 최신 가격 조회
     */
    PriceHistory selectLatestPrice(Map<String, Object> params);
    
    /**
     * 특정 날짜에 가장 가까운 가격 조회
     */
    PriceHistory selectClosestPrice(Map<String, Object> params);

}
