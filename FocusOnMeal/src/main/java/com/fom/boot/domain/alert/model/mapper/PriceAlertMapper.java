package com.fom.boot.domain.alert.model.mapper;

import java.math.BigDecimal;
import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import com.fom.boot.domain.alert.model.vo.PriceAlert;

@Mapper
public interface PriceAlertMapper {

    // 1. 내 알림 설정 조회 (모달 열 때)
    PriceAlert selectMySetting(@Param("memberId") String memberId, 
                               @Param("ingredientId") int ingredientId);

    // 2. 신규 알림 설정 추가
    int insertPriceAlert(PriceAlert priceAlert);

    // 3. 기존 알림 설정 수정
    int updatePriceAlert(PriceAlert priceAlert);

    // 4. 가격 변동 시 알림 대상 조회 (중요!)
    // 현재 가격이 목표 가격보다 낮거나 같은(목표 달성) 유저 찾기
    List<String> selectTargetMemberIds(@Param("ingredientId") int ingredientId, 
                                       @Param("currentPrice") BigDecimal currentPrice);
}