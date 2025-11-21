package com.fom.boot.domain.alert.model.service;

import java.util.List;

import com.fom.boot.domain.alert.model.vo.SafetyAlert;

public interface FoodSafetyApiService {
    /**
     * API 연결 테스트
     * 최근 7일 데이터로 연결 확인
     * @return 테스트 결과 메시지
     */
    String testConnection();
    
    /**
     * 식품안전정보 조회 (최근 30일, 범위 지정)
     * @param startIdx 시작 인덱스
     * @param endIdx 종료 인덱스
     * @return 위험 정보 리스트
     */
    List<SafetyAlert> fetchSafetyAlerts(int startIdx, int endIdx);
    
    /**
     * 최근 N일 이내의 위험 정보 가져오기
     * @param days 조회할 일 수 (예: 7, 30)
     * @return 위험 정보 리스트
     */
    List<SafetyAlert> fetchRecentSafetyAlerts(int days);
    
    /**
     * 원본 JSON/XML 응답 가져오기 (디버깅용)
     * @param startIdx 시작 인덱스
     * @param endIdx 종료 인덱스
     * @return JSON/XML 응답 문자열
     */
    String getRawResponse(int startIdx, int endIdx);
}
