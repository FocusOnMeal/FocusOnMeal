package com.fom.boot.domain.alert.model.service.impl;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fom.boot.domain.alert.model.mapper.AlertMapper;
import com.fom.boot.domain.alert.model.service.AlertService;
import com.fom.boot.domain.alert.model.service.FoodSafetyApiService;
import com.fom.boot.domain.alert.model.service.FoodSafetyDataSyncService;
import com.fom.boot.domain.alert.model.vo.SafetyAlert;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 식품안전정보원 API 데이터 동기화 서비스 구현체
 * KAMIS 패턴을 따라 구현
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class FoodSafetyDataSyncServiceImpl implements FoodSafetyDataSyncService {
	
	private final FoodSafetyApiService foodSafetyApiService;
    private final AlertMapper alertMapper;
    private final AlertService alertService; // 알림 발송 서비스
    
    // API 최대 조회 건수 (전체 동기화 시 페이징을 위해 필요)
    private static final int MAX_PER_PAGE = 100;
    
    @Override
    @Transactional
    public int syncRecentAlerts() {
        log.info("최근 식품안전정보 동기화 시작 (최근 3일)");

        try {
            // 1. 먼저 totalCount 확인
            int totalCount = foodSafetyApiService.getTotalCount(3);
            log.info("최근 3일 전체 데이터 개수: {}", totalCount);

            if (totalCount == 0) {
                log.warn("동기화할 데이터가 없거나 API 호출에 실패했습니다. 서버는 정상적으로 시작됩니다.");
                return 0;
            }

            // 2. 페이징 처리하여 전체 데이터 가져오기
            int totalSaved = 0;
            int pageSize = MAX_PER_PAGE;

            for (int startIdx = 1; startIdx <= totalCount; startIdx += pageSize) {
                int endIdx = Math.min(startIdx + pageSize - 1, totalCount);

                log.info("페이지 조회 중: {}-{} / {}", startIdx, endIdx, totalCount);

                List<SafetyAlert> alerts = foodSafetyApiService.fetchSafetyAlerts(3, startIdx, endIdx);
                int saved = saveAlerts(alerts);
                totalSaved += saved;

                log.info("페이지 저장 완료: {} 건 저장", saved);
            }

            log.info("최근 3일 동기화 완료 - 총 {} 건 저장", totalSaved);
            return totalSaved;

        } catch (Exception e) {
            log.error("최근 식품안전정보 동기화 실패 - 외부 API 일시적 장애 가능성", e);
            log.warn("동기화 실패했지만 서버는 정상적으로 시작됩니다. API 복구 후 수동으로 동기화하거나 스케줄러가 자동으로 재시도합니다.");
            // 동기화 실패해도 서버 시작을 막지 않음 (RuntimeException을 던지지 않음)
            return 0;
        }
    }
    
    @Override
    @Transactional
    public int syncAllAlerts() {
        log.info("전체 식품안전정보 동기화 시작 (최근 30일)");

        try {
            // 1. 먼저 totalCount 확인 (최근 30일)
            int totalCount = foodSafetyApiService.getTotalCount(30);
            log.info("최근 30일 전체 데이터 개수: {}", totalCount);

            if (totalCount == 0) {
                log.info("동기화할 데이터가 없습니다.");
                return 0;
            }

            // 2. 페이징 처리하여 전체 데이터 가져오기
            int totalSaved = 0;
            int pageSize = MAX_PER_PAGE;

            for (int startIdx = 1; startIdx <= totalCount; startIdx += pageSize) {
                int endIdx = Math.min(startIdx + pageSize - 1, totalCount);

                log.info("페이지 조회 중: {}-{} / {}", startIdx, endIdx, totalCount);

                List<SafetyAlert> alerts = foodSafetyApiService.fetchSafetyAlerts(30, startIdx, endIdx);
                int saved = saveAlerts(alerts);
                totalSaved += saved;

                log.info("페이지 저장 완료: {} 건 저장", saved);
            }

            log.info("전체 동기화 완료 (30일) - 총 {} 건 저장", totalSaved);
            return totalSaved;

        } catch (Exception e) {
            log.error("전체 식품안전정보 동기화 실패", e);
            throw new RuntimeException("All alert sync failed", e);
        }
    }
    
    @Override
    @Transactional
    public String syncAndGetResult() {
        log.info("식품안전정보 동기화 테스트 시작");
        
        try {
            List<SafetyAlert> alerts = foodSafetyApiService.fetchRecentSafetyAlerts(7);
            
            if (alerts.isEmpty()) {
                return "API에서 가져온 데이터 없음";
            }
            
            int savedCount = saveAlerts(alerts);
            
            return String.format("동기화 완료 - 조회: %d 건, 저장: %d 건", alerts.size(), savedCount);
            
        } catch (Exception e) {
            log.error("식품안전정보 동기화 테스트 실패", e);
            // RuntimeException을 던져서 상위에서 트랜잭션이 롤백되도록 유도
            throw new RuntimeException("Sync test failed: " + e.getMessage(), e);
        }
    }
    
    @Override
    @Transactional
    public int syncAlertsByRange(int startIdx, int endIdx) {
        log.info("식품안전정보 범위별 동기화 - startIdx: {}, endIdx: {}", startIdx, endIdx);

        try {
            // 기본적으로 최근 30일 데이터에서 범위 조회
            List<SafetyAlert> alerts = foodSafetyApiService.fetchSafetyAlerts(30, startIdx, endIdx);
            return saveAlerts(alerts);

        } catch (Exception e) {
            log.error("범위별 식품안전정보 동기화 실패", e);
            throw new RuntimeException("Range sync failed", e);
        }
    }
    
    /**
     * SafetyAlert 리스트를 DB에 저장하고 알림 발송 (배치 처리)
     */
    private int saveAlerts(List<SafetyAlert> alerts) {
        if (alerts == null || alerts.isEmpty()) {
            return 0;
        }
        
        // 1. 식재료 매칭 및 중복 필터링을 위한 임시 리스트
        List<SafetyAlert> alertsToInsert = new ArrayList<>();
        
        // 2. 현재 DB에 존재하는 중복 데이터를 미리 조회 (제목 + 발행일 + 국가 복합 키)
        // DTO에 해당 복합 키를 확인할 수 있는 필드가 없으므로, 일단 모든 Alert를 매핑 후 체크해야 함.
        
        for (SafetyAlert alert : alerts) {
            try {
                // 1. INGREDIENT_ID 매핑 (제목/내용에서 식재료 찾기)
                int ingredientId = findIngredientIdFromContent(alert);
                alert.setIngredientId(ingredientId); // 매칭 실패 시 0으로 저장
                
                // 2. 중복 체크 (제목 + 공표일 + 국가)
                if (isDuplicate(alert)) { // 복합 키로 변경
                    log.debug("중복 데이터 스킵 - title: {}", alert.getTitle());
                    continue; // 중복이면 스킵
                }
                
                alertsToInsert.add(alert);
                
            } catch (Exception e) {
                log.error("Alert 전처리 중 오류 발생 - title: {}", alert.getTitle(), e);
            }
        }
        
        if (alertsToInsert.isEmpty()) {
            log.info("동기화 대상 데이터 없음. 총 조회 건수: {}", alerts.size());
            return 0;
        }
        
        // 3. 배치 삽입 (insertBatchSafetyAlert)
        int savedCount = 0;
        try {
            // MyBatis의 selectKey 대신, Service에서 미리 PK를 생성하지 않고, Mapper에서 시퀀스를 사용하도록 처리
            savedCount = alertMapper.insertBatchSafetyAlert(alertsToInsert);

            // 4. 배치 삽입 후 생성된 Alert ID 조회 및 알림 발송
            int notificationSentCount = 0;
            for (SafetyAlert savedAlert : alertsToInsert) {
                try {
                    // 복합 키를 사용하여 DB에서 생성된 Alert ID 조회
                    Integer alertId = alertMapper.findAlertIdByComplexKey(savedAlert);

                    if (alertId != null) {
                        savedAlert.setAlertId(alertId); // VO에 ID 설정

                        // 식재료가 매핑된 경우에만 알림 발송
                        if (savedAlert.getIngredientId() > 0) {
                            alertService.createSafetyAlertNotifications(alertId);
                            notificationSentCount++;
                            log.debug("알림 발송 완료 - alertId: {}, title: {}", alertId, savedAlert.getTitle());
                        }
                    } else {
                        log.warn("Alert ID 조회 실패 - title: {}", savedAlert.getTitle());
                    }

                } catch (Exception e) {
                    log.error("Alert ID 조회 또는 알림 발송 실패 - title: {}", savedAlert.getTitle(), e);
                    // 개별 알림 발송 실패는 전체 트랜잭션을 롤백하지 않음
                }
            }

            log.info("알림 발송 완료 - {} 건 / {} 건", notificationSentCount, alertsToInsert.size());

        } catch (Exception e) {
            log.error("위험 공표 배치 저장 실패", e);
            // Batch 실패 시 트랜잭션 롤백
            throw new RuntimeException("Batch insert failed", e);
        }
        
        log.info("식품안전정보 동기화 완료 - 조회: {}, 저장: {}, 중복 스킵: {}", 
                alerts.size(), savedCount, alerts.size() - alertsToInsert.size());
        
        return savedCount;
    }
    
    /**
     * 제목/내용에서 식재료 ID 찾기
     */
    private int findIngredientIdFromContent(SafetyAlert alert) {
        String title = alert.getTitle();
        String content = alert.getDescription();
        
        // 제목과 내용에서 키워드 추출
        String searchText = (title + " " + content).toLowerCase();
        
        // INGREDIENT_MASTER에서 이름으로 검색
        // 이 메서드는 AlertMapper.xml에 구현되어야 함
        Integer ingredientId = alertMapper.findIngredientIdByKeyword(searchText);
        
        return ingredientId != null ? ingredientId : 0;
    }
    
    /**
     * 중복 체크 (제목 + 공표일 + 국가 복합 키 사용)
     * 이 메서드는 현재 AlertMapper.xml에 구현되어야 함
     */
    private boolean isDuplicate(SafetyAlert alert) {
        int count = alertMapper.countByComplexKey(alert); // 복합 키를 사용하는 새로운 Mapper 메서드
        return count > 0;
    }
}
