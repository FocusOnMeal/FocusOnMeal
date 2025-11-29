package com.fom.boot.app.alert.controller;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fom.boot.domain.alert.model.service.AlertService;

import lombok.RequiredArgsConstructor;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/alert")
@RequiredArgsConstructor
public class AlertController {

	private final AlertService alertService;
	    
	/**
	 * 사용자의 알림 목록 조회
	 * @param authentication JWT 토큰에서 추출된 인증 정보
	 * @return 알림 목록
	 */
	@GetMapping("/notifications")
	public ResponseEntity<?> getNotifications(Authentication authentication) {
		try {
	        if (authentication == null || !authentication.isAuthenticated()) {
	            Map<String, String> error = new HashMap<>();
	            error.put("message", "로그인이 필요합니다.");
	            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
	        }
	        
	        String memberId = authentication.getName();
	        System.out.println("🔑 추출된 memberId: " + memberId);
	        
	        List<Map<String, Object>> notifications = alertService.getNotificationsByMemberId(memberId);
	        System.out.println("📊 조회된 알림 개수: " + notifications.size());
	        
	        // 실제 데이터 확인
	        if (!notifications.isEmpty()) {
	            System.out.println("📋 첫 번째 알림 데이터: " + notifications.get(0));
	        }
	        
	        return ResponseEntity.ok(notifications);
	    } catch (Exception e) {
	        e.printStackTrace();
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
	    }
	}
	
	/**
	 * 알림 읽음 처리
	 * @param notificationId 알림 ID
	 * @param authentication JWT 토큰에서 추출된 인증 정보
	 * @return 처리 결과
	 */
	@PutMapping("/notifications/{notificationId}/read")
	public ResponseEntity<?> markAsRead(
	        @PathVariable int notificationId,
	        Authentication authentication) {
	    try {
	        // 로그인 확인
	        if (authentication == null || !authentication.isAuthenticated()) {
	            Map<String, String> error = new HashMap<>();
	            error.put("message", "로그인이 필요합니다.");
	            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
	        }
	        
	        String memberId = authentication.getName();
	        
	        boolean success = alertService.markNotificationAsRead(notificationId, memberId);
	        
	        Map<String, Object> response = new HashMap<>();
	        response.put("success", success);
	        
	        return ResponseEntity.ok(response);
	    } catch (Exception e) {
	        e.printStackTrace();
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
	    }
	}
	
	/**
	 * 알림 삭제
	 * @param notificationId 알림 ID
	 * @param authentication JWT 토큰에서 추출된 인증 정보
	 * @return 처리 결과
	 */
	@DeleteMapping("/notifications/{notificationId}")
	public ResponseEntity<?> deleteNotification(
	        @PathVariable int notificationId,
	        Authentication authentication) {
	    try {
	        if (authentication == null || !authentication.isAuthenticated()) {
	            Map<String, String> error = new HashMap<>();
	            error.put("message", "로그인이 필요합니다.");
	            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
	        }
	        
	        String memberId = authentication.getName();
	        
	        boolean success = alertService.deleteNotification(notificationId, memberId);
	        
	        Map<String, Object> response = new HashMap<>();
	        response.put("success", success);
	        
	        return ResponseEntity.ok(response);
	    } catch (Exception e) {
	        e.printStackTrace();
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
	    }
	}
	
	/**
	 * 읽지 않은 알림 개수 조회
	 * @param authentication JWT 토큰에서 추출된 인증 정보
	 * @return 읽지 않은 알림 개수
	 */
	@GetMapping("/notifications/unread-count")
	public ResponseEntity<?> getUnreadCount(Authentication authentication) {
	    try {
	        // 로그인 확인
	        if (authentication == null || !authentication.isAuthenticated()) {
	            Map<String, String> error = new HashMap<>();
	            error.put("message", "로그인이 필요합니다.");
	            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
	        }
	        
	        String memberId = authentication.getName();
	        
	        int count = alertService.getUnreadNotificationCount(memberId);
	        
	        Map<String, Object> response = new HashMap<>();
	        response.put("count", count);
	        
	        return ResponseEntity.ok(response);
	    } catch (Exception e) {
	        e.printStackTrace();
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
	    }
	}
	
	/**
	 * 안전 알림 설정 조회
	 * @param token JWT 토큰
	 * @return 알림 설정 정보
	 */
	@GetMapping("/settings/safety")
	public ResponseEntity<Map<String, Object>> getSafetyAlertSettings(
	        @RequestHeader("Authorization") String token) {
	    try {
	        String memberId = extractMemberIdFromToken(token);
	        
	        Map<String, Object> settings = alertService.getSafetyAlertSettings(memberId);
	        
	        return ResponseEntity.ok(settings);
	    } catch (Exception e) {
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
	    }
	}
	
	/**
	 * 안전 알림 설정 업데이트
	 * @param token JWT 토큰
	 * @param enabled 알림 수신 여부
	 * @return 업데이트 결과
	 */
	@PutMapping("/settings/safety")
	public ResponseEntity<Map<String, Object>> updateSafetyAlertSettings(
	        @RequestHeader("Authorization") String token,
	        @RequestBody Map<String, String> request) {
	    try {
	        String memberId = extractMemberIdFromToken(token);
	        String enabled = request.get("notificationEnabled");
	        
	        boolean success = alertService.updateSafetyAlertSettings(memberId, enabled);
	        
	        Map<String, Object> response = new HashMap<>();
	        response.put("success", success);
	        
	        return ResponseEntity.ok(response);
	    } catch (Exception e) {
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
	    }
	}
	
	/**
	 * JWT 토큰에서 memberId 추출 (실제 구현 시 JwtUtil 사용)
	 * @param token JWT 토큰
	 * @return 회원 ID
	 */
	private String extractMemberIdFromToken(String token) {
	    // 실제 구현:
	    // String cleanToken = token.replace("Bearer ", "");
	    // return jwtUtil.extractMemberId(cleanToken);

	    // 임시 구현 (실제로는 JWT 파싱 필요)
	    return "tempMemberId";
	}

	/**
	 * 🔧 테스트용: 가격 알림 수동 생성
	 * 실제 배포 시에는 삭제하거나 관리자 권한 체크 필요
	 */
	@GetMapping("/test/generate-price-alerts")
	public ResponseEntity<?> generatePriceAlerts() {
	    try {
	        System.out.println("🔔 수동 가격 알림 생성 시작");
	        alertService.createPriceChangeNotifications();

	        Map<String, Object> response = new HashMap<>();
	        response.put("success", true);
	        response.put("message", "가격 알림 생성 완료");

	        return ResponseEntity.ok(response);
	    } catch (Exception e) {
	        e.printStackTrace();
	        Map<String, String> error = new HashMap<>();
	        error.put("message", "가격 알림 생성 실패: " + e.getMessage());
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
	    }
	}

	/**
	 * 읽지 않은 알림 일괄 읽음 처리
	 * @param authentication JWT 토큰에서 추출된 인증 정보
	 * @return 처리 결과
	 */
	@PutMapping("/notifications/mark-all-read")
	public ResponseEntity<?> markAllAsRead(Authentication authentication) {
	    try {
	        if (authentication == null || !authentication.isAuthenticated()) {
	            Map<String, String> error = new HashMap<>();
	            error.put("message", "로그인이 필요합니다.");
	            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
	        }
	        
	        String memberId = authentication.getName();
	        
	        int count = alertService.markAllNotificationsAsRead(memberId);
	        
	        Map<String, Object> response = new HashMap<>();
	        response.put("success", true);
	        response.put("count", count);
	        
	        return ResponseEntity.ok(response);
	    } catch (Exception e) {
	        e.printStackTrace();
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
	    }
	}

	/**
	 * 특정 유형의 읽지 않은 알림 일괄 읽음 처리
	 * @param type 알림 유형 (위험공표, 가격정보)
	 * @param authentication JWT 토큰에서 추출된 인증 정보
	 * @return 처리 결과
	 */
	@PutMapping("/notifications/mark-all-read/{type}")
	public ResponseEntity<?> markAllAsReadByType(
	        @PathVariable String type,
	        Authentication authentication) {
	    try {
	        if (authentication == null || !authentication.isAuthenticated()) {
	            Map<String, String> error = new HashMap<>();
	            error.put("message", "로그인이 필요합니다.");
	            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
	        }
	        
	        String memberId = authentication.getName();
	        
	        int count = alertService.markAllNotificationsAsReadByType(memberId, type);
	        
	        Map<String, Object> response = new HashMap<>();
	        response.put("success", true);
	        response.put("count", count);
	        
	        return ResponseEntity.ok(response);
	    } catch (Exception e) {
	        e.printStackTrace();
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
	    }
	}
}
