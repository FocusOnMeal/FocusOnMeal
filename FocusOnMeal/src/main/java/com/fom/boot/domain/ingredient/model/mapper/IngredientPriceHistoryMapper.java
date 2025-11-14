package com.fom.boot.domain.ingredient.model.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.fom.boot.domain.ingredient.model.vo.PriceHistory;

@Mapper
public interface IngredientPriceHistoryMapper {

	/**
	 * 특정 식자재의 최근 가격 조회 (1개)
	 * @param ingredientName 식자재명
	 * @return 최근 가격 정보
	 */
	PriceHistory getRecentPriceByName(@Param("ingredientName") String ingredientName);

	/**
	 * 특정 식자재의 최근 가격 이력 조회 (여러 개)
	 * @param ingredientName 식자재명
	 * @param limit 조회할 개수
	 * @return 가격 이력 리스트
	 */
	List<PriceHistory> getRecentPricesByName(@Param("ingredientName") String ingredientName,
											  @Param("limit") int limit);

	/**
	 * 가격 정보 저장
	 * @param priceHistory 가격 정보
	 * @return 저장된 개수
	 */
	int insertPrice(PriceHistory priceHistory);

	/**
	 * 특정 식자재의 모든 가격 이력 조회
	 * @param ingredientId 식자재 ID
	 * @return 가격 이력 리스트
	 */
	List<PriceHistory> getPriceHistoryByIngredientId(@Param("ingredientId") int ingredientId);
}