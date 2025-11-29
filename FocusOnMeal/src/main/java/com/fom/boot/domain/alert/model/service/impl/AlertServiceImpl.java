package com.fom.boot.domain.alert.model.service.impl;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fom.boot.app.pricehistory.dto.PriceTrendResponse;
import com.fom.boot.common.pagination.PageInfo;
import com.fom.boot.domain.alert.model.mapper.AlertMapper;
import com.fom.boot.domain.alert.model.mapper.PriceAlertMapper;
import com.fom.boot.domain.alert.model.service.AlertService;
import com.fom.boot.domain.alert.model.vo.SafetyAlert;
import com.fom.boot.domain.ingredient.model.mapper.IngredientMapper;
import com.fom.boot.domain.ingredient.model.vo.Ingredient;
import com.fom.boot.domain.pricehistory.model.service.PriceHistoryService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class AlertServiceImpl implements AlertService {

    private final AlertMapper alertMapper;
    private final PriceAlertMapper priceAlertMapper;
    private final PriceHistoryService priceHistoryService;
    private final IngredientMapper ingredientMapper;

    @Override
    public List<Map<String, Object>> getNotificationsByMemberId(String memberId) {
        try {
            // NOTIFICATION_LOG와 SAFETY_ALERT_MASTER를 조인하여 제목 포함
            List<Map<String, Object>> notifications = alertMapper.selectNotificationsByMemberId(memberId);
            return notifications;
        } catch (Exception e) {
            log.error("알림 목록 조회 실패: memberId={}", memberId, e);
            throw new RuntimeException("알림 목록 조회에 실패했습니다.", e);
        }
    }
    
    @Override
    @Transactional
    public boolean markNotificationAsRead(int notificationId, String memberId) {
        try {
            int result = alertMapper.updateNotificationReadStatus(notificationId, memberId);
            return result > 0;
        } catch (Exception e) {
            log.error("알림 읽음 처리 실패: notificationId={}, memberId={}", notificationId, memberId, e);
            throw new RuntimeException("알림 읽음 처리에 실패했습니다.", e);
        }
    }
    
    @Override
    @Transactional
    public boolean deleteNotification(int notificationId, String memberId) {
        try {
            int result = alertMapper.deleteNotification(notificationId, memberId);
            log.info("알림 삭제: notificationId={}, memberId={}, success={}", 
                    notificationId, memberId, result > 0);
            return result > 0;
        } catch (Exception e) {
            log.error("알림 삭제 실패: notificationId={}, memberId={}", notificationId, memberId, e);
            throw new RuntimeException("알림 삭제에 실패했습니다.", e);
        }
    }
    
    @Override
    public int getUnreadNotificationCount(String memberId) {
        try {
            return alertMapper.selectUnreadNotificationCount(memberId);
        } catch (Exception e) {
            log.error("읽지 않은 알림 개수 조회 실패: memberId={}", memberId, e);
            return 0;
        }
    }
    
    @Override
    public Map<String, Object> getSafetyAlertSettings(String memberId) {
        try {
            Map<String, Object> settings = alertMapper.selectSafetyAlertSettings(memberId);
            
            // 설정이 없으면 기본값으로 생성
            if (settings == null) {
                alertMapper.insertDefaultSafetyAlertSettings(memberId);
                settings = new HashMap<>();
                settings.put("notificationEnabled", "N");
            }
            
            return settings;
        } catch (Exception e) {
            log.error("안전 알림 설정 조회 실패: memberId={}", memberId, e);
            throw new RuntimeException("안전 알림 설정 조회에 실패했습니다.", e);
        }
    }
    
    @Override
    @Transactional
    public boolean updateSafetyAlertSettings(String memberId, String notificationEnabled) {
        try {
            // 기존 설정이 있는지 확인
            Map<String, Object> existing = alertMapper.selectSafetyAlertSettings(memberId);
            
            int result;
            if (existing == null) {
                // 없으면 새로 생성
                result = alertMapper.insertSafetyAlertSettings(memberId, notificationEnabled);
            } else {
                // 있으면 업데이트
                result = alertMapper.updateSafetyAlertSettings(memberId, notificationEnabled);
            }
            
            return result > 0;
        } catch (Exception e) {
            log.error("안전 알림 설정 업데이트 실패: memberId={}, enabled={}", memberId, notificationEnabled, e);
            throw new RuntimeException("안전 알림 설정 업데이트에 실패했습니다.", e);
        }
    }
    
    @Override
    @Transactional
    public void createSafetyAlertNotifications(int alertId) {
        try {
            // 공표 정보 조회
            SafetyAlert alert = alertMapper.selectSafetyAlertById(alertId);
            
            if (alert == null) {
                log.error("공표 정보를 찾을 수 없습니다: alertId={}", alertId);
                return;
            }
            
            // 🔥 개인화: 해당 식재료(INGREDIENT_ID)에 대해 알림을 설정한 회원만 조회
            List<String> memberIds = alertMapper.selectMembersWithIngredientAlertEnabled(alert.getIngredientId());
            
            // 각 회원에게 알림 생성
            for (String memberId : memberIds) {
                String message = String.format("[%s] %s - %s",
                    alert.getNation(),
                    alert.getHazardType(),
                    alert.getTitle());
                
                // ✅ 형식: "메시지내용||alertId||ingredientId"
                String messageWithMetadata = String.format("%s||%d||%d", 
                    message, 
                    alertId,  // 이게 제대로 전달되는지 확인
                    alert.getIngredientId()
                );

                alertMapper.insertNotificationLog(memberId, "위험공표", messageWithMetadata, alertId);
                
                log.info("안전 알림 생성: memberId={}, message={}", memberId, messageWithMetadata);
            }
            
            log.info("안전 알림 발송 완료: alertId={}, ingredientId={}, 수신자 수={}", 
                    alertId, alert.getIngredientId(), memberIds.size());
            
        } catch (Exception e) {
            log.error("안전 알림 생성 실패: alertId={}", alertId, e);
            throw new RuntimeException("안전 알림 생성에 실패했습니다.", e);
        }
    }

    @Override
    public boolean checkIngredientAlertEnabled(String memberId, int ingredientId) {
        try {
            int count = alertMapper.countIngredientAlert(memberId, ingredientId);
            return count > 0;
        } catch (Exception e) {
            log.error("식재료 알림 설정 확인 실패: memberId={}, ingredientId={}", memberId, ingredientId, e);
            return false;
        }
    }

    @Override
    public int insertIngredientAlert(String memberId, int ingredientId) {
        try {
            int result = alertMapper.insertIngredientAlert(memberId, ingredientId);
            log.info("식재료 알림 등록 성공: memberId={}, ingredientId={}", memberId, ingredientId);
            return result;
        } catch (Exception e) {
            log.error("식재료 알림 등록 실패: memberId={}, ingredientId={}", memberId, ingredientId, e);
            throw new RuntimeException("식재료 알림 등록에 실패했습니다.", e);
        }
    }

    @Override
    public int deleteIngredientAlert(String memberId, int ingredientId) {
        try {
            int result = alertMapper.deleteIngredientAlert(memberId, ingredientId);
            log.info("식재료 알림 해제 성공: memberId={}, ingredientId={}", memberId, ingredientId);
            return result;
        } catch (Exception e) {
            log.error("식재료 알림 해제 실패: memberId={}, ingredientId={}", memberId, ingredientId, e);
            throw new RuntimeException("식재료 알림 해제에 실패했습니다.", e);
        }
    }

    @Override
    @Transactional
    public void createPriceChangeNotifications() {
        log.info("=== 가격 변동 알림 생성 시작 ===");

        try {
            // 1. 가격 알림이 설정된 모든 식재료 ID 조회
            List<Integer> ingredientIds = priceAlertMapper.selectAllPriceAlertIngredientIds();

            if (ingredientIds.isEmpty()) {
                log.info("가격 알림이 설정된 식재료가 없습니다.");
                return;
            }

            log.info("가격 알림 대상 식재료 수: {}", ingredientIds.size());

            int totalNotifications = 0;

            // 2. 각 식재료에 대해 가격 변동 체크
            for (Integer ingredientId : ingredientIds) {
                try {
                    // 식재료 정보 조회
                    Ingredient ingredient = ingredientMapper.selectById(ingredientId);
                    if (ingredient == null) {
                        log.warn("식재료를 찾을 수 없습니다: ingredientId={}", ingredientId);
                        continue;
                    }

                    // 최신 가격 및 등락률 조회 (전날 대비)
                    PriceTrendResponse priceData = priceHistoryService.getLatestPriceWithChanges(
                        ingredientId, "소매", "서울"
                    );

                    if (priceData == null || priceData.getChangeRate() == null) {
                        log.debug("가격 정보 없음: ingredientId={}, name={}", ingredientId, ingredient.getName());
                        continue;
                    }

                    // 일간 변동률 조회
                    Double dailyChangeRate = priceData.getChangeRate().getDailyChange();

                    if (dailyChangeRate == null) {
                        log.debug("가격 변동 정보 없음: ingredientId={}", ingredientId);
                        continue;
                    }

                    // 변동률이 ±0.5% 이상일 경우에만 알림 발송
                    if (Math.abs(dailyChangeRate) < 0.5) {
                        log.debug("가격 변동 미미: ingredientId={}, 변동률={}%", ingredientId, dailyChangeRate);
                        continue;
                    }

                    // 3. 해당 식재료 가격 알림 설정한 회원 조회
                    List<String> memberIds = priceAlertMapper.selectMembersWithPriceAlertEnabled(ingredientId);

                    if (memberIds.isEmpty()) {
                        log.debug("알림 대상 회원 없음: ingredientId={}", ingredientId);
                        continue;
                    }

                    // 4. 알림 메시지 생성
                    String changeIcon = dailyChangeRate > 0 ? "↑" : "↓";
                    String message = String.format("[%s] %s %s %.2f%% (현재가: %,d원)",
                        ingredient.getName(),
                        changeIcon,
                        dailyChangeRate > 0 ? "상승" : "하락",
                        Math.abs(dailyChangeRate),
                        priceData.getChangeRate().getCurrentPrice()
                    );

                    // 5. 각 회원에게 알림 생성
                    for (String memberId : memberIds) {
                        	message = String.format("[%s] %s %s %.2f%% (현재가: %,d원)",
                            ingredient.getName(),
                            changeIcon,
                            dailyChangeRate > 0 ? "상승" : "하락",
                            Math.abs(dailyChangeRate),
                            priceData.getChangeRate().getCurrentPrice()
                        );
                        
                        // ✅ 형식: "메시지내용||ingredientId"
                        String messageWithMetadata = String.format("%s||%d", 
                            message, 
                            ingredientId
                        );
                        
                        alertMapper.insertNotificationLog(memberId, "가격정보", messageWithMetadata, null);
                        
                        log.info("가격 알림 생성: memberId={}, message={}", memberId, messageWithMetadata);
                    }

                    log.info("가격 알림 발송: ingredientId={}, name={}, 변동률={}%, 수신자={}",
                        ingredientId, ingredient.getName(), String.format("%.2f", dailyChangeRate), memberIds.size());

                } catch (Exception e) {
                    log.error("가격 알림 생성 실패: ingredientId={}", ingredientId, e);
                    // 개별 실패는 전체 프로세스 중단하지 않음
                }
            }

            log.info("=== 가격 변동 알림 생성 완료: 총 {} 건 발송 ===", totalNotifications);

        } catch (Exception e) {
            log.error("가격 변동 알림 생성 실패", e);
            throw new RuntimeException("가격 변동 알림 생성에 실패했습니다.", e);
        }
    }

    @Override
    public boolean checkPriceAlertEnabled(String memberId, int ingredientId) {
        try {
            int count = priceAlertMapper.countPriceAlert(memberId, ingredientId);
            return count > 0;
        } catch (Exception e) {
            log.error("가격 알림 설정 확인 실패: memberId={}, ingredientId={}", memberId, ingredientId, e);
            return false;
        }
    }

    @Override
    public int insertPriceAlert(String memberId, int ingredientId) {
        try {
            int result = priceAlertMapper.insertPriceAlert(memberId, ingredientId);
            log.info("가격 알림 등록 성공: memberId={}, ingredientId={}", memberId, ingredientId);
            return result;
        } catch (Exception e) {
            log.error("가격 알림 등록 실패: memberId={}, ingredientId={}", memberId, ingredientId, e);
            throw new RuntimeException("가격 알림 등록에 실패했습니다.", e);
        }
    }

    @Override
    public int deletePriceAlert(String memberId, int ingredientId) {
        try {
            int result = priceAlertMapper.deletePriceAlert(memberId, ingredientId);
            log.info("가격 알림 해제 성공: memberId={}, ingredientId={}", memberId, ingredientId);
            return result;
        } catch (Exception e) {
            log.error("가격 알림 해제 실패: memberId={}, ingredientId={}", memberId, ingredientId, e);
            throw new RuntimeException("가격 알림 해제에 실패했습니다.", e);
        }
    }
    
    // 검색 조건에 맞는 개인 안전 알림 개수 조회 (페이지네이션용)
    @Override
    public int getUserSafetyNotiCount(Map<String, Object> searchMap) {
        try {
            return alertMapper.selectUserSafetyNotiCount(searchMap);
        } catch (Exception e) {
            log.error("알림 개수 조회 실패: searchMap={}", searchMap, e);
            return 0;
        }
    }

    // 검색 조건에 맞는 개인 안전알림 목록 조회 (페이징 + 검색)
    @Override
    public List<Map<String, Object>> getUserSafetyNotiList(PageInfo pi, Map<String, Object> searchMap) {
        try {
            // 페이징 계산 (Oracle ROWNUM 기준)
            int startRow = (pi.getCurrentPage() - 1) * pi.getBoardLimit() + 1;
            int endRow = startRow + pi.getBoardLimit() - 1;

            searchMap.put("startRow", startRow);
            searchMap.put("endRow", endRow);

            return alertMapper.selectUserSafetyNotiList(searchMap);
        } catch (Exception e) {
            log.error("알림 목록 조회 실패: searchMap={}", searchMap, e);
            throw new RuntimeException("알림 목록 조회에 실패했습니다.", e);
        }
    }

    // 마이페이지 개인 안전 알림 삭제 (물리 삭제)
    @Override
    @Transactional
    public boolean deleteSafetyAlert(int notificationId, String memberId) {
        try {
            int result = alertMapper.deleteNotification(notificationId, memberId);
            return result > 0;
        } catch (Exception e) {
            log.error("알림 삭제 실패: notificationId={}, memberId={}", notificationId, memberId, e);
            throw new RuntimeException("알림 삭제에 실패했습니다.", e);
        }
    }
    
    @Override
    @Transactional
    public int markAllNotificationsAsRead(String memberId) {
        try {
            int count = alertMapper.updateAllNotificationsReadStatus(memberId);
            log.info("모든 알림 읽음 처리: memberId={}, count={}", memberId, count);
            return count;
        } catch (Exception e) {
            log.error("모든 알림 읽음 처리 실패: memberId={}", memberId, e);
            throw new RuntimeException("모든 알림 읽음 처리에 실패했습니다.", e);
        }
    }

    @Override
    @Transactional
    public int markAllNotificationsAsReadByType(String memberId, String type) {
        try {
            int count = alertMapper.updateAllNotificationsReadStatusByType(memberId, type);
            log.info("특정 유형 알림 읽음 처리: memberId={}, type={}, count={}", memberId, type, count);
            return count;
        } catch (Exception e) {
            log.error("특정 유형 알림 읽음 처리 실패: memberId={}, type={}", memberId, type, e);
            throw new RuntimeException("특정 유형 알림 읽음 처리에 실패했습니다.", e);
        }
    }
}
