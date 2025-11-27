package com.fom.boot.domain.alert.model.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import com.fom.boot.domain.alert.model.vo.PriceAlert;
import java.math.BigDecimal;
import java.util.List;

@Mapper
public interface PriceAlertMapper {
    
    // ===== 기존 단일 알림용 메서드 =====
    
    /**
     * 회원의 특정 식재료 가격 알림 설정 확인
     */
    int countPriceAlert(@Param("memberId") String memberId,
                        @Param("ingredientId") int ingredientId);
    
    /**
     * 내 알림 설정 조회 (모달 열 때)
     */
    PriceAlert selectMySetting(@Param("memberId") String memberId, 
                               @Param("ingredientId") int ingredientId);
    
    /**
     * 신규 알림 설정 추가 (기존 방식 - VO 사용)
     */
    int insertPriceAlert(PriceAlert priceAlert);
    
    /**
     * 신규 알림 설정 추가 (기존 방식 - 파라미터 사용)
     */
    int insertPriceAlert(@Param("memberId") String memberId, 
                         @Param("ingredientId") int ingredientId);
    
    /**
     * 기존 알림 설정 수정
     */
    int updatePriceAlert(PriceAlert priceAlert);
    
    /**
     * 특정 식재료 가격 알림 해제 (기존 방식)
     */
    int deletePriceAlert(@Param("memberId") String memberId,
                         @Param("ingredientId") int ingredientId);
    
    /**
     * 가격 알림이 설정된 모든 고유 식재료 ID 조회
     */
    List<Integer> selectAllPriceAlertIngredientIds();
    
    /**
     * 특정 식재료에 대해 가격 알림이 활성화된 회원 목록 조회
     */
    List<String> selectMembersWithPriceAlertEnabled(@Param("ingredientId") int ingredientId);
    
    /**
     * 가격 변동 시 알림 대상 조회 (배치용)
     */
    List<String> selectTargetMemberIds(@Param("ingredientId") int ingredientId, 
                                       @Param("currentPrice") BigDecimal currentPrice);
    
    // ===== 새로운 다중 알림용 메서드 =====
    
    /**
     * 특정 재료에 대한 모든 알림 조회
     */
    List<PriceAlert> selectAllAlerts(@Param("memberId") String memberId, 
                                      @Param("ingredientId") int ingredientId);
    
    /**
     * 알림 추가 (다중 알림용)
     */
    void insertPriceAlertNew(PriceAlert alert);
    
    /**
     * 개별 알림 삭제 (다중 알림용)
     */
    void deleteAlertById(@Param("memberId") String memberId, 
                         @Param("ingredientId") int ingredientId, 
                         @Param("alertId") int alertId);
    
    /**
     * 특정 재료의 모든 알림 삭제 (다중 알림용)
     */
    void deleteAllAlerts(@Param("memberId") String memberId, 
                         @Param("ingredientId") int ingredientId);
}