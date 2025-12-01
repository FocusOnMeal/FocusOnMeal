package com.fom.boot.app.mypage.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fom.boot.app.mypage.dto.Allergy;
import com.fom.boot.app.mypage.dto.FavoriteIngredientSummaryDTO;
import com.fom.boot.app.mypage.dto.MyPageDashboardDTO;
import com.fom.boot.app.mypage.dto.ProfileResponse;
import com.fom.boot.app.mypage.dto.ProfileUpdateRequest;
import com.fom.boot.app.pricehistory.dto.PriceTrendResponse;
import com.fom.boot.common.pagination.PageInfo;
import com.fom.boot.common.pagination.Pagination;
import com.fom.boot.domain.alert.model.service.AlertService;
import com.fom.boot.domain.alert.model.service.PriceAlertService;
import com.fom.boot.domain.alert.model.vo.SafetyAlert;
import com.fom.boot.domain.ingredient.model.service.IngredientService;
import com.fom.boot.domain.member.model.service.MemberService;
import com.fom.boot.domain.mypage.model.service.MyPageService;
import com.fom.boot.domain.safety.model.service.SafetyService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/mypage")
public class MyPageController {
	
	private final MyPageService mService;
	
	private final MemberService bService;
	
	private final IngredientService iService;
	
	private final AlertService aService;

	private final PriceAlertService pService;

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

	// 특정 식자재의 물가 추이 그래프 조회 (전체 공개 - 로그인 불필요)
    @GetMapping("/price-chart/{ingredientId}")
    public ResponseEntity<?> getPriceChart(
            @PathVariable int ingredientId,
            @RequestParam(defaultValue = "30") int days) {

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
	
	/**
	 * ✅ 수정: 전체 알레르기 목록 조회
	 * 실제 경로: /api/mypage/allergy/list
	 */
	@GetMapping("/allergy/list")
	public ResponseEntity<?> getAllergyList() {
	    try {
	        log.info("=== 알레르기 목록 조회 ===");
	        List<Allergy> allergies = (List<Allergy>) mService.getAllAllergies();
	        log.info("조회된 알레르기 개수: {}", allergies.size());
	        return ResponseEntity.ok(allergies);
	    } catch (Exception e) {
	        log.error("알레르기 목록 조회 오류", e);
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
	            .body(Map.of("error", "알레르기 목록 조회 실패"));
	    }
	}

	/**
	 * ✅ 수정: 사용자 알레르기 조회
	 * 실제 경로: /api/mypage/allergies
	 */
	@GetMapping("/allergies")
	public ResponseEntity<?> getUserAllergies(Authentication authentication) {
	    try {
	        if (authentication == null || !authentication.isAuthenticated()) {
	            log.warn("인증되지 않은 요청");
	            return ResponseEntity.ok(Map.of("allergies", List.of()));
	        }

	        String memberId = authentication.getName();
	        log.info("사용자 알레르기 조회: memberId={}", memberId);

	        // ✅ 캐스팅 제거 - mService.getUserAllergyIds()가 이미 List<Integer>를 반환
	        List<Integer> allergyIds = mService.getUserAllergyIds(memberId);
	        log.info("조회된 알레르기 ID: {}", allergyIds);

	        return ResponseEntity.ok(Map.of("allergies", allergyIds));
	    } catch (Exception e) {
	        log.error("사용자 알레르기 조회 오류", e);
	        return ResponseEntity.ok(Map.of("allergies", List.of()));
	    }
	}

	/**
	 * ✅ 수정: 알레르기 저장
	 * 실제 경로: /api/mypage/allergies
	 */
	@PostMapping("/allergies")  // ← /mypage 제거!
	public ResponseEntity<?> saveAllergies(
	        @RequestBody Map<String, Object> body,
	        Authentication authentication) {
	    
	    try {
	        if (authentication == null || !authentication.isAuthenticated()) {
	            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
	                .body(Map.of("error", "로그인이 필요합니다."));
	        }
	        
	        String memberId = authentication.getName();
	        Object allergyObj = body.get("allergyIds");
	        
	        log.info("알레르기 저장 요청: memberId={}, allergyIds={}", memberId, allergyObj);
	        
	        if (!(allergyObj instanceof List<?>)) {
	            return ResponseEntity.badRequest()
	                .body(Map.of("error", "알레르기 정보가 올바르지 않습니다."));
	        }
	        
	        @SuppressWarnings("unchecked")
	        List<Integer> allergyIds = (List<Integer>) allergyObj;
	        
	        mService.saveUserAllergies(memberId, allergyIds);
	        log.info("알레르기 저장 성공");
	        
	        return ResponseEntity.ok(Map.of(
	            "success", true,
	            "message", "알레르기 정보가 저장되었습니다."
	        ));
	    } catch (Exception e) {
	        log.error("알레르기 저장 오류", e);
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
	            .body(Map.of("error", "저장 실패: " + e.getMessage()));
	    }
	}

	// 내 식단 목록 조회 (페이지네이션)
	@GetMapping("/myMeals")
	public ResponseEntity<?> getMyMealPlans(
			@RequestParam(defaultValue = "1") int page,
			Authentication authentication) {

		if (authentication == null || !authentication.isAuthenticated()) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
					.body(Map.of("message", "로그인이 필요합니다."));
		}

		String memberId = authentication.getName();
		Map<String, Object> result = mService.getMyMealPlans(memberId, page);

		return ResponseEntity.ok(result);
	}

	// 식단 상세 조회
	@GetMapping("/myMeals/{planId}")
	public ResponseEntity<?> getMealPlanDetail(
			@PathVariable int planId,
			Authentication authentication) {

		if (authentication == null || !authentication.isAuthenticated()) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
					.body(Map.of("message", "로그인이 필요합니다."));
		}

		var mealPlan = mService.getMealPlanDetail(planId);

		if (mealPlan == null) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND)
					.body(Map.of("message", "식단을 찾을 수 없습니다."));
		}

		return ResponseEntity.ok(mealPlan);
	}

	// ====== 휴지통 기능 ======

	// 삭제된 식단 목록 조회 (휴지통)
	@GetMapping("/trash")
	public ResponseEntity<?> getDeletedMealPlans(Authentication authentication) {
		if (authentication == null || !authentication.isAuthenticated()) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
					.body(Map.of("message", "로그인이 필요합니다."));
		}

		String memberId = authentication.getName();
		var deletedMeals = mService.getDeletedMealPlans(memberId);
		int count = mService.getDeletedMealCount(memberId);

		Map<String, Object> result = new HashMap<>();
		result.put("deletedMeals", deletedMeals);
		result.put("count", count);

		return ResponseEntity.ok(result);
	}

	// 식단 복원
	@PutMapping("/trash/restore/{planId}")
	public ResponseEntity<?> restoreMealPlan(
			@PathVariable int planId,
			Authentication authentication) {

		if (authentication == null || !authentication.isAuthenticated()) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
					.body(Map.of("message", "로그인이 필요합니다."));
		}

		int result = mService.restoreMealPlan(planId);

		if (result > 0) {
			return ResponseEntity.ok(Map.of(
					"success", true,
					"message", "식단이 복원되었습니다."
			));
		}

		return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.body(Map.of("message", "복원에 실패했습니다."));
	}

	// 식단 영구 삭제
	@DeleteMapping("/trash/{planId}")
	public ResponseEntity<?> permanentDeleteMealPlan(
			@PathVariable int planId,
			Authentication authentication) {

		if (authentication == null || !authentication.isAuthenticated()) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
					.body(Map.of("message", "로그인이 필요합니다."));
		}

		int result = mService.permanentDeleteMealPlan(planId);

		if (result > 0) {
			return ResponseEntity.ok(Map.of(
					"success", true,
					"message", "식단이 영구 삭제되었습니다."
			));
		}

		return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.body(Map.of("message", "삭제에 실패했습니다."));
	}

	// 휴지통 비우기 (일괄 영구 삭제)
	@DeleteMapping("/trash/empty")
	public ResponseEntity<?> emptyTrash(Authentication authentication) {
		if (authentication == null || !authentication.isAuthenticated()) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
					.body(Map.of("message", "로그인이 필요합니다."));
		}

		String memberId = authentication.getName();
		int deletedCount = mService.emptyTrash(memberId);

		return ResponseEntity.ok(Map.of(
				"success", true,
				"deletedCount", deletedCount,
				"message", deletedCount + "개의 식단이 영구 삭제되었습니다."
		));
	}

	/*
	 * 개인정보 수정 부분
	 */

	// 프로필 조회
    @GetMapping("/profile")
    public ResponseEntity<ProfileResponse> getUserProfile(Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                log.warn("인증되지 않은 요청");
                return ResponseEntity.status(401).build();
            }

            String memberId = authentication.getName();
            log.info("프로필 조회: memberId={}", memberId);

            ProfileResponse profile = bService.getUserProfile(memberId);
            return ResponseEntity.ok(profile);
            
        } catch (Exception e) {
            log.error("프로필 조회 오류", e);
            return ResponseEntity.status(500).build();
        }
    }

    // 프로필 수정
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            @RequestBody ProfileUpdateRequest request,
            Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                log.warn("인증되지 않은 요청");
                return ResponseEntity.status(401)
                        .body(Map.of("message", "로그인이 필요합니다."));
            }

            String memberId = authentication.getName();
            log.info("프로필 수정 요청: memberId={}, request={}", memberId, request);

            bService.updateProfile(memberId, request);
            
            return ResponseEntity.ok(Map.of("message", "회원정보가 수정되었습니다."));
            
        } catch (IllegalArgumentException e) {
            log.warn("프로필 수정 실패: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            log.error("프로필 수정 오류", e);
            return ResponseEntity.status(500)
                    .body(Map.of("message", "서버 오류가 발생했습니다."));
        }
    }
    
    // 찜한 식재료 목록 조회 (마이페이지용)
    @GetMapping("/ingredients/favorite")
    public ResponseEntity<?> getFavoriteIngredients(Authentication authentication) {
        
        // 로그인 확인
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "로그인이 필요합니다."));
        }
        
        String memberId = authentication.getName();
        
        List<FavoriteIngredientSummaryDTO> favorites = iService.getFavoritesByMemberId(memberId);
        
        return ResponseEntity.ok(favorites);
    }
    
    // 마이페이지 안전정보알림
    @GetMapping("/settings/safetyAlert")
    public ResponseEntity<?> getSafetyAlerts(
    		@RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "all") String type,
            @RequestParam(defaultValue = "") String keyword,
            @RequestParam(defaultValue = "sentAt") String sortColumn, // 기본 정렬을 수신일(sentAt)로 변경
            @RequestParam(defaultValue = "desc") String sortOrder,
            @RequestParam(defaultValue = "all") String readStatus,
            Authentication authentication) {
    	// 로그인 확인
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "로그인이 필요합니다."));
        }
        
        String memberId = authentication.getName();
        
        // 검색 조건 구성
        Map<String, Object> searchMap = new HashMap<>();
        searchMap.put("memberId", memberId);  
        searchMap.put("type", type);
        searchMap.put("keyword", keyword.trim());
        searchMap.put("sortColumn", sortColumn);
        searchMap.put("sortOrder", sortOrder);
        searchMap.put("readStatus", readStatus);

        // 전체 개수 조회
        int total = aService.getUserSafetyNotiCount(searchMap);

        // 페이징 생성
        PageInfo pi = Pagination.getPageInfo(page, total);

        // 목록 조회
        List<Map<String, Object>> list = aService.getUserSafetyNotiList(pi, searchMap);
        
        // 유저 알림
        Map<String, Object> setting = aService.getSafetyAlertSettings(memberId);
        
        // 사용자 관심 식재료
        List<FavoriteIngredientSummaryDTO> subscribedIngredients
        = iService.getFavoritesByMemberId(memberId);

        // 응답 데이터 구성
        Map<String, Object> response = new HashMap<>();
        response.put("alertList", list);
        response.put("pageInfo", pi);
        response.put("userSetting", setting.get("notificationEnabled")); 
        response.put("subscribedIngredients", subscribedIngredients);

        return ResponseEntity.ok(response);
    }
    
    // 마이페이지 안전정보 전체 알림 토글
    @PatchMapping("/settings/safetyAlert/toggle")
    public ResponseEntity<?> toggleSafetyAlert(@RequestBody Map<String, String> body,
    		Authentication authentication) {
    	// 로그인 확인
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "로그인이 필요합니다."));
        }
        
        String memberId = authentication.getName();
        String notificationEnabled = body.get("notificationEnabled");
        
        // DB 저장 로직
        aService.updateSafetyAlertSettings(memberId, notificationEnabled);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("notificationEnabled", notificationEnabled);
    	
    	return ResponseEntity.ok(response);
    }
    
    // 마이페이지 안전 알림 삭제
    @DeleteMapping("/settings/safetyAlert/{notificationId}")
    public ResponseEntity<?> deleteNotification(
            @PathVariable int notificationId,
            Authentication authentication) {
        
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String memberId = authentication.getName();

        boolean result = aService.deleteSafetyAlert(notificationId, memberId);
        
        if(result) {
            return ResponseEntity.ok(Map.of("message", "삭제되었습니다."));
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "삭제 실패"));
        }
    }
    
    // 마이페이지 안전 알림 읽음 처리
    @PatchMapping("/settings/safetyAlert/{notificationId}/read")
    public ResponseEntity<?> readNotification(
            @PathVariable int notificationId,
            Authentication authentication) {

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String memberId = authentication.getName();

        boolean result = aService.markNotificationAsRead(notificationId, memberId);
        return ResponseEntity.ok(Map.of("success", result));
    }

    // ====== 가격 알림 관련 ======

    // 마이페이지 가격 알림 내역 및 지정가 설정 조회
    @GetMapping("/settings/priceAlert")
    public ResponseEntity<?> getPriceAlerts(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "") String keyword,
            @RequestParam(defaultValue = "sentAt") String sortColumn,
            @RequestParam(defaultValue = "desc") String sortOrder,
            @RequestParam(defaultValue = "all") String readStatus,
            Authentication authentication) {

        // 로그인 확인
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "로그인이 필요합니다."));
        }

        String memberId = authentication.getName();

        // 검색 조건 구성
        Map<String, Object> searchMap = new HashMap<>();
        searchMap.put("memberId", memberId);
        searchMap.put("keyword", keyword.trim());
        searchMap.put("sortColumn", sortColumn);
        searchMap.put("sortOrder", sortOrder);
        searchMap.put("readStatus", readStatus);

        // 전체 개수 조회
        int total = aService.getUserPriceNotiCount(searchMap);

        // 페이징 생성
        PageInfo pi = Pagination.getPageInfo(page, total);

        // 가격 알림 내역 목록 조회
        List<Map<String, Object>> alertList = aService.getUserPriceNotiList(pi, searchMap);

        // 지정가 알림 설정 목록 조회
        List<Map<String, Object>> watchedIngredients = pService.getAllAlertsByMember(memberId);

        // 유저 알림 설정
        Map<String, Object> setting = aService.getSafetyAlertSettings(memberId);

        // 응답 데이터 구성
        Map<String, Object> response = new HashMap<>();
        response.put("alertList", alertList);
        response.put("pageInfo", pi);
        response.put("watchedIngredients", watchedIngredients);
        response.put("userSetting", setting.get("notificationEnabled"));

        return ResponseEntity.ok(response);
    }

    // 마이페이지 가격 알림 삭제
    @DeleteMapping("/settings/priceAlert/{notificationId}")
    public ResponseEntity<?> deletePriceNotification(
            @PathVariable int notificationId,
            Authentication authentication) {

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String memberId = authentication.getName();

        boolean result = aService.deleteSafetyAlert(notificationId, memberId);

        if (result) {
            return ResponseEntity.ok(Map.of("message", "삭제되었습니다."));
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "삭제 실패"));
        }
    }

    // 마이페이지 가격 알림 읽음 처리
    @PatchMapping("/settings/priceAlert/{notificationId}/read")
    public ResponseEntity<?> readPriceNotification(
            @PathVariable int notificationId,
            Authentication authentication) {

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String memberId = authentication.getName();

        boolean result = aService.markNotificationAsRead(notificationId, memberId);
        return ResponseEntity.ok(Map.of("success", result));
    }

}
