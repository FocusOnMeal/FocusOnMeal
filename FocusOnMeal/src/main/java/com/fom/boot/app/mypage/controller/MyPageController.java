package com.fom.boot.app.mypage.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fom.boot.app.mypage.dto.MyPageDashboardDTO;
import com.fom.boot.domain.mypage.model.service.MyPageService;

import lombok.RequiredArgsConstructor;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/mypage")
public class MyPageController {
	
	private final MyPageService mService;
	
	@GetMapping("/dashboard")
	public ResponseEntity<?> getDashboard(Authentication authentication) {
		
		// JWT 토큰에서 인증된 사용자 정보 가져오기
    	// 로그인 확인
	    if (authentication == null || !authentication.isAuthenticated()) {
	        Map<String, String> error = new HashMap<>();
	        error.put("message", "로그인이 필요합니다.");
	        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
	    }

	    String memberId = authentication.getName();
	    MyPageDashboardDTO dashboard = mService.getDashboardData(memberId);

	    return ResponseEntity.ok(dashboard);
	}

	
	// 식단 논리 삭제 (IS_DELETED = 'Y')
	@PutMapping("/mealDelete/{planId}")
	public ResponseEntity<?> deleteMealPlan(@PathVariable("planId") int planId, Authentication authentication) {
		
		// JWT 토큰에서 인증된 사용자 정보 가져오기
    	// 로그인 확인
        if (authentication == null || !authentication.isAuthenticated()) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "로그인이 필요합니다.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
        
        int result = mService.logicalDeleteMealPlan(planId);
        
        if (result > 0) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("isFavorite", false);
            response.put("message", "식단이 삭제되었습니다.");
            return ResponseEntity.ok(response);
        }
        
        // 실패한 경우
        Map<String, String> error = new HashMap<>();
        error.put("message", "처리에 실패했습니다.");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
	}
}
