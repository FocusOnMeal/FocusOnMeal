package com.fom.boot.domain.ingredient.model.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.fom.boot.domain.ingredient.model.vo.FavoriteIngredient;
import com.fom.boot.domain.ingredient.model.vo.Ingredient;

@Mapper
public interface IngredientMapper {

	// 찜 등록 및 해제
	int insertFavorite(FavoriteIngredient favorite);
	int deleteFavorite(@Param("memberId") String memberId,
					   @Param("ingredientId") int ingredientId);
	int checkFavoriteExists(@Param("memberId") String memberId,
			   				@Param("ingredientId") int ingredientId);

	Ingredient selectById(int ingredientId);

	/**
	 * KAMIS 코드로 식자재 조회
	 * @param kamisItemCode 품목코드
	 * @param kamisKindCode 품종코드
	 * @return 식자재 정보
	 */
	Ingredient selectByKamisCode(@Param("kamisItemCode") String kamisItemCode,
								 @Param("kamisKindCode") String kamisKindCode);

	/**
	 * 식자재 등록
	 * @param ingredient 식자재 정보
	 * @return 등록된 행 수
	 */
	int insertIngredient(Ingredient ingredient);

}
