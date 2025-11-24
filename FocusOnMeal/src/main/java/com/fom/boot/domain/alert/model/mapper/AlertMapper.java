package com.fom.boot.domain.alert.model.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.fom.boot.domain.alert.model.vo.NotificationLog;
import com.fom.boot.domain.alert.model.vo.SafetyAlert;

@Mapper
public interface AlertMapper {

    /**
     * 회원의 알림 목록 조회 (제목 포함)
     * @param memberId 회원 ID
     * @return 알림 목록
     */
    List<Map<String, Object>> selectNotificationsByMemberId(@Param("memberId") String memberId);
    
    /**
     * 알림 읽음 상태 업데이트
     * @param notificationId 알림 ID
     * @param memberId 회원 ID
     * @return 업데이트된 행 수
     */
    int updateNotificationReadStatus(@Param("notificationId") int notificationId, 
                                     @Param("memberId") String memberId);
    
    /**
     * 읽지 않은 알림 개수 조회
     * @param memberId 회원 ID
     * @return 읽지 않은 알림 개수
     */
    int selectUnreadNotificationCount(@Param("memberId") String memberId);
    
    /**
     * 안전 알림 설정 조회
     * @param memberId 회원 ID
     * @return 알림 설정
     */
    Map<String, Object> selectSafetyAlertSettings(@Param("memberId") String memberId);
    
    /**
     * 기본 안전 알림 설정 생성
     * @param memberId 회원 ID
     * @return 생성된 행 수
     */
    int insertDefaultSafetyAlertSettings(@Param("memberId") String memberId);
    
    /**
     * 안전 알림 설정 생성
     * @param memberId 회원 ID
     * @param notificationEnabled 알림 수신 여부
     * @return 생성된 행 수
     */
    int insertSafetyAlertSettings(@Param("memberId") String memberId, 
                                  @Param("notificationEnabled") String notificationEnabled);
    
    /**
     * 안전 알림 설정 업데이트
     * @param memberId 회원 ID
     * @param notificationEnabled 알림 수신 여부
     * @return 업데이트된 행 수
     */
    int updateSafetyAlertSettings(@Param("memberId") String memberId, 
                                  @Param("notificationEnabled") String notificationEnabled);
    
    /**
     * 공표 정보 조회
     * @param alertId 공표 ID
     * @return 공표 정보
     */
    SafetyAlert selectSafetyAlertById(@Param("alertId") int alertId);
    
    /**
     * 특정 식재료에 대해 알림 수신이 활성화된 회원 목록 조회 (개인화)
     * @param ingredientId 식재료 ID
     * @return 회원 ID 목록
     */
    List<String> selectMembersWithIngredientAlertEnabled(@Param("ingredientId") int ingredientId);
    
    /**
     * 키워드로 식재료 ID 찾기
     * @param keyword 검색 키워드
     * @return 식재료 ID (없으면 null)
     */
    Integer findIngredientIdByKeyword(@Param("keyword") String keyword);
    
    /**
     * 알림 로그 생성
     * @param memberId 회원 ID
     * @param type 알림 유형
     * @param message 알림 메시지
     * @param alertId 공표 ID (선택)
     * @return 생성된 행 수
     */
    int insertNotificationLog(@Param("memberId") String memberId, 
                             @Param("type") String type, 
                             @Param("message") String message,
                             @Param("alertId") Integer alertId);
    
    /**
     * 안전 위험 공표 정보 등록
     * @param safetyAlert 공표 정보
     * @return 생성된 행 수
     */
    int insertSafetyAlert(SafetyAlert safetyAlert);
    
    /**
     * 제목으로 중복 체크
     * @param title 제목
     * @return 중복 건수
     */
    int countByTitle(@Param("title") String title);
  
    /**
     * 안전 위험 공표 정보 배치 등록
     * @param safetyAlerts 공표 정보 리스트
     * @return 생성된 행 수
     */
    int insertBatchSafetyAlert(List<SafetyAlert> safetyAlerts);
    
    /**
     * 제목, 국가, 공표일 복합 키로 중복 체크
     * @param safetyAlert 공표 정보 (title, nation, publicationDate 사용)
     * @return 중복 건수
     */
    int countByComplexKey(SafetyAlert safetyAlert);

    /**
     * 제목, 국가, 공표일 복합 키로 Alert ID 조회 (배치 삽입 후 ID 조회용)
     * @param safetyAlert 공표 정보 (title, nation, publicationDate 사용)
     * @return Alert ID (없으면 null)
     */
    Integer findAlertIdByComplexKey(SafetyAlert safetyAlert);

    /**
     * 회원의 특정 식재료 알림 설정 확인
     * @param memberId 회원 ID
     * @param ingredientId 식재료 ID
     * @return 설정 건수 (0 또는 1)
     */
    int countIngredientAlert(@Param("memberId") String memberId,
                            @Param("ingredientId") int ingredientId);

    /**
     * 특정 식재료 알림 등록
     * @param memberId 회원 ID
     * @param ingredientId 식재료 ID
     * @return 생성된 행 수
     */
    int insertIngredientAlert(@Param("memberId") String memberId,
                             @Param("ingredientId") int ingredientId);

    /**
     * 특정 식재료 알림 해제
     * @param memberId 회원 ID
     * @param ingredientId 식재료 ID
     * @return 삭제된 행 수
     */
    int deleteIngredientAlert(@Param("memberId") String memberId,
                             @Param("ingredientId") int ingredientId);

    /**
     * 알림이 설정된 모든 고유 식재료 ID 조회
     * @return 식재료 ID 목록
     */
    List<Integer> selectAllAlertIngredientIds();
}
