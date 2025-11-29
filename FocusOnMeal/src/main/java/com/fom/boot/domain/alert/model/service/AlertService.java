package com.fom.boot.domain.alert.model.service;

import java.util.List;
import java.util.Map;

import com.fom.boot.common.pagination.PageInfo;

public interface AlertService {
	/**
     * 회원의 알림 목록 조회 (제목 포함)
     * @param memberId 회원 ID
     * @return 알림 목록 (제목, 타입, 내용, 발송 시각 포함)
     */
    List<Map<String, Object>> getNotificationsByMemberId(String memberId);
    
    /**
     * 알림을 읽음 상태로 변경
     * @param notificationId 알림 ID
     * @param memberId 회원 ID
     * @return 성공 여부
     */
    boolean markNotificationAsRead(int notificationId, String memberId);
    
    /**
     * 알림 삭제
     * @param notificationId 알림 ID
     * @param memberId 회원 ID
     * @return 성공 여부
     */
    boolean deleteNotification(int notificationId, String memberId);
    
    /**
     * 읽지 않은 알림 개수 조회
     * @param memberId 회원 ID
     * @return 읽지 않은 알림 개수
     */
    int getUnreadNotificationCount(String memberId);
    
    /**
     * 안전 알림 설정 조회
     * @param memberId 회원 ID
     * @return 알림 설정 정보
     */
    Map<String, Object> getSafetyAlertSettings(String memberId);
    
    /**
     * 안전 알림 설정 업데이트
     * @param memberId 회원 ID
     * @param notificationEnabled 알림 수신 여부 (Y/N)
     * @return 성공 여부
     */
    boolean updateSafetyAlertSettings(String memberId, String notificationEnabled);
    
    /**
     * 새로운 안전 위험 공표에 대한 알림 생성
     * (관리자가 SAFETY_ALERT_MASTER에 데이터를 추가할 때 호출)
     * @param alertId 공표 정보 ID
     */
    void createSafetyAlertNotifications(int alertId);

    /**
     * 회원의 특정 식재료 알림 설정 확인
     * @param memberId 회원 ID
     * @param ingredientId 식재료 ID
     * @return 알림 설정 여부
     */
    boolean checkIngredientAlertEnabled(String memberId, int ingredientId);

    /**
     * 특정 식재료 알림 등록
     * @param memberId 회원 ID
     * @param ingredientId 식재료 ID
     * @return 생성된 행 수
     */
    int insertIngredientAlert(String memberId, int ingredientId);

    /**
     * 특정 식재료 알림 해제
     * @param memberId 회원 ID
     * @param ingredientId 식재료 ID
     * @return 삭제된 행 수
     */
    int deleteIngredientAlert(String memberId, int ingredientId);

    /**
     * 가격 변동 알림 생성 (전날 대비 가격 변동 체크)
     * PRICE_ALERT_SETTING에 등록된 식재료의 가격 변동을 확인하고
     * 전날 대비 변동이 있을 경우 알림 생성
     */
    void createPriceChangeNotifications();

    /**
     * 회원의 특정 식재료 가격 알림 설정 확인
     * @param memberId 회원 ID
     * @param ingredientId 식재료 ID
     * @return 가격 알림 설정 여부
     */
    boolean checkPriceAlertEnabled(String memberId, int ingredientId);

    /**
     * 특정 식재료 가격 알림 등록
     * @param memberId 회원 ID
     * @param ingredientId 식재료 ID
     * @return 생성된 행 수
     */
    int insertPriceAlert(String memberId, int ingredientId);

    /**
     * 특정 식재료 가격 알림 해제
     * @param memberId 회원 ID
     * @param ingredientId 식재료 ID
     * @return 삭제된 행 수
     */
    int deletePriceAlert(String memberId, int ingredientId);

    /**
     * 마이페이지 : 검색 조건에 맞는 개인 알림 개수 조회
     *
     * @param searchMap 검색 조건(Map)
     * @return 알림 개수
     */
	int getUserSafetyNotiCount(Map<String, Object> searchMap);
	
	/**
	 * 마이페이지 : 검색 조건에 맞는 개인 알림 목록 조회 (페이징 포함)
	 *
	 * @param pi        페이지 정보(PageInfo)
	 * @param searchMap 검색 조건(Map)
	 * @return 알림 목록 리스트
	 */
	List<Map<String, Object>> getUserSafetyNotiList(PageInfo pi, Map<String, Object> searchMap);

	/**
	 * 마이페이지 : 안전 알림 삭제
	 *
	 * @param notificationId 알림 ID
	 * @param memberId       회원 ID
	 * @return 삭제 성공 여부
	 */
	boolean deleteSafetyAlert(int notificationId, String memberId);
    
    /**
     * 회원의 모든 읽지 않은 알림을 읽음 처리
     * @param memberId 회원 ID
     * @return 처리된 알림 개수
     */
    int markAllNotificationsAsRead(String memberId);

    /**
     * 회원의 특정 유형 읽지 않은 알림을 읽음 처리
     * @param memberId 회원 ID
     * @param type 알림 유형
     * @return 처리된 알림 개수
     */
    int markAllNotificationsAsReadByType(String memberId, String type);
}
