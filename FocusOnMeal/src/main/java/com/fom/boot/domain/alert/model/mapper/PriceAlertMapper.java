package com.fom.boot.domain.alert.model.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.fom.boot.domain.alert.model.vo.PriceAlert;

@Mapper
public interface PriceAlertMapper {

    /**
     * 회원의 특정 식재료 가격 알림 설정 확인
     * @param memberId 회원 ID
     * @param ingredientId 식재료 ID
     * @return 설정 건수 (0 또는 1)
     */
    int countPriceAlert(@Param("memberId") String memberId,
                        @Param("ingredientId") int ingredientId);

    /**
     * 특정 식재료 가격 알림 등록
     * @param memberId 회원 ID
     * @param ingredientId 식재료 ID
     * @return 생성된 행 수
     */
    int insertPriceAlert(@Param("memberId") String memberId,
                         @Param("ingredientId") int ingredientId);

    /**
     * 특정 식재료 가격 알림 해제
     * @param memberId 회원 ID
     * @param ingredientId 식재료 ID
     * @return 삭제된 행 수
     */
    int deletePriceAlert(@Param("memberId") String memberId,
                         @Param("ingredientId") int ingredientId);

    /**
     * 가격 알림이 설정된 모든 고유 식재료 ID 조회
     * @return 식재료 ID 목록
     */
    java.util.List<Integer> selectAllPriceAlertIngredientIds();

    /**
     * 특정 식재료에 대해 가격 알림이 활성화된 회원 목록 조회
     * @param ingredientId 식재료 ID
     * @return 회원 ID 목록
     */
    java.util.List<String> selectMembersWithPriceAlertEnabled(@Param("ingredientId") int ingredientId);
}