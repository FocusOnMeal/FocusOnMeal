package com.fom.boot.domain.ingredient.model.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.fom.boot.app.admin.dto.AdminIngredientDTO;
import com.fom.boot.app.ingredient.dto.IngredientDTO;
import com.fom.boot.app.mypage.dto.FavoriteIngredientSummaryDTO;
import com.fom.boot.domain.ingredient.model.vo.FavoriteIngredient;
import com.fom.boot.domain.ingredient.model.vo.Ingredient;
import com.fom.boot.domain.ingredient.model.vo.NutritionMaster;

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

	/**
	 * React 리스트 페이지용: 식재료 전체 목록 + 최신 가격 조회
	 * (IngredientMapper.xml의 selectListWithLatestPrice 쿼리 호출)
	 * @return List<IngredientDTO>
	 */
	List<IngredientDTO> selectListWithLatestPrice();
	
	List<FavoriteIngredientSummaryDTO> selectFavoritesByMemberId(String memberId);
	
	List<IngredientDTO> getIngredientList();
	
	// [관리자] 검색 카운트 (@Param 추가)
	int selectAdminTotalCount(@Param("type") String type, 
							  @Param("keyword") String keyword);
	
	// [관리자] 목록 조회 (Offset, Limit 방식)
	List<AdminIngredientDTO> selectAdminList(
			@Param("type") String type, 
			@Param("keyword") String keyword, 
			@Param("sortColumn") String sortColumn, 
			@Param("sortOrder") String sortOrder,
			@Param("offset") int offset, 
			@Param("limit") int limit);
			
	int updateNutrition(NutritionMaster nutrition);
	
	int insertNutrition(NutritionMaster nutrition);
	
}
