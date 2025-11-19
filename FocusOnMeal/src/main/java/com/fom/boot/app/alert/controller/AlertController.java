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
	
}
