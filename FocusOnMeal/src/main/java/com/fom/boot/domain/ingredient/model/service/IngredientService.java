package com.fom.boot.domain.ingredient.model.service;

import java.util.List;

import com.fom.boot.app.ingredient.dto.IngredientDTO;
import com.fom.boot.domain.ingredient.model.vo.FavoriteIngredient;
import com.fom.boot.domain.ingredient.model.vo.Ingredient;
import com.fom.boot.domain.ingredient.model.vo.PriceHistory;

public interface IngredientService {

	// 찜 등록 및 해제
	int insertFavorite(FavoriteIngredient favorite);
	int deleteFavorite(String memberId, int ingredientId);
	boolean checkFavoriteExists(String memberId, int ingredientId);
	
	// 리스트 페이지 : 전체 식재료 목록 + 최신 가격 조회
	List<IngredientDTO> getIngredientListWithPrice();
	// 상세 페이지 : 특정 식재료 기본 정보 조회
	Ingredient getIngredientById(int id);
	// 상세 페이지 : 특정 식재료 가격 이력 조회
	List<PriceHistory> getPriceHistory(int id);

}
