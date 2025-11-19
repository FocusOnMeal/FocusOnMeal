package com.fom.boot.app.mypage.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fom.boot.app.mypage.dto.MyPageDashboardDTO;
import com.fom.boot.app.pricehistory.dto.PriceTrendResponse;
import com.fom.boot.domain.mypage.model.service.MyPageService;

import lombok.RequiredArgsConstructor;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/mypage")
public class MyPageController {
	
	private final MyPageService mService;
	
	// 마이페이지 대시보드 이동
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

	// 특정 식자재의 물가 추이 그래프 조회
    @GetMapping("/price-chart/{ingredientId}")
    public ResponseEntity<?> getPriceChart(
            @PathVariable int ingredientId,
            @RequestParam(defaultValue = "30") int days,
            Authentication authentication) {
        
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "로그인이 필요합니다."));
        }
        
        try {
            PriceTrendResponse chartData = mService.getPriceChartData(ingredientId, days);
            return ResponseEntity.ok(chartData);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", e.getMessage()));
        }
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
	
	// 모든 알레르기 목록 조회 (예: 우유, 계란, 견과류 등)
	@GetMapping("/allergies/list")
	public ResponseEntity<?> getAllergyList() {
	    return ResponseEntity.ok(mService.getAllAllergies());
	}
	
	// 특정 회원의 알레르기 조회
	@GetMapping("/allergies/{memberId}")
	public ResponseEntity<?> getUserAllergies(@PathVariable String memberId) {

	    // DB에서 회원이 체크한 알레르기 ID 리스트 가져오기
	    Map<String, Object> response = new HashMap<>();
	    response.put("allergyIds", mService.getUserAllergyIds(memberId));

	    return ResponseEntity.ok(response);
	}
	
	// 알레르기 정보 저장
	@PostMapping("/allergies")
	public ResponseEntity<?> saveAllergies(
	        @RequestBody Map<String, Object> body,
	        Authentication authentication) {

	    if (authentication == null || !authentication.isAuthenticated()) {
	        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
	                .body(Map.of("message", "로그인이 필요합니다."));
	    }

	    String memberId = authentication.getName();

	    // { "allergyIds": [1, 3, 5] }
	    Object allergyObj = body.get("allergyIds");

	    if (!(allergyObj instanceof java.util.List<?> allergyIds)) {
	        return ResponseEntity.badRequest()
	                .body(Map.of("message", "알레르기 정보가 올바르지 않습니다."));
	    }

	    boolean result = mService.updateMemberAllergies(memberId, allergyIds);

	    if (result) {
	        return ResponseEntity.ok(Map.of(
	                "success", true,
	                "message", "알레르기 정보가 저장되었습니다."
	        ));
	    }

	    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
	            .body(Map.of("message", "저장 실패"));
	}
	
	// 회원의 알레르기 저장·업데이트
	@PostMapping("/allergies/update")
	public ResponseEntity<?> saveUserAllergies(
	        @RequestBody Map<String, Object> data,
	        Authentication authentication) {

	    if (authentication == null || !authentication.isAuthenticated()) {
	        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
	            .body(Map.of("message", "로그인이 필요합니다."));
	    }

	    String memberId = (String) data.get("memberId");
	    var allergyIds = (List<Integer>) data.get("allergyIds");

	    mService.saveUserAllergies(memberId, allergyIds);

	    return ResponseEntity.ok(Map.of("success", true, "message", "알레르기 정보가 저장되었습니다."));
	}

	
	
}
