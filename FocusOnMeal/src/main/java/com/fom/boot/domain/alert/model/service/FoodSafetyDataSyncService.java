package com.fom.boot.domain.alert.model.service;

public interface FoodSafetyDataSyncService {
	/**
     * 최근 위험 정보 동기화 (최근 7일)
     * @return 저장된 건수
     */
    int syncRecentAlerts();
    
    /**
     * 전체 위험 정보 동기화
     * @return 저장된 건수
     */
    int syncAllAlerts();
    
    /**
     * 테스트용: 동기화 및 결과 반환
     * @return 동기화 결과 메시지
     */
    String syncAndGetResult();
    
    /**
     * 특정 범위의 위험 정보 동기화
     * @param startIdx 시작 인덱스
     * @param endIdx 종료 인덱스
     * @return 저장된 건수
     */
    int syncAlertsByRange(int startIdx, int endIdx);
}
