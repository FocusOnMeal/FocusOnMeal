package com.fom.boot.app.ingredient.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.fom.boot.app.ingredient.dto.IngredientDTO;
import com.fom.boot.app.ingredient.dto.PricePredictionDTO;
import com.fom.boot.app.mypage.dto.FavoriteIngredientSummaryDTO;
import com.fom.boot.domain.alert.model.service.AlertService;
import com.fom.boot.domain.ingredient.model.service.IngredientService;
import com.fom.boot.domain.ingredient.model.service.PricePredictionService;
import com.fom.boot.domain.ingredient.model.vo.FavoriteIngredient;
import com.fom.boot.domain.ingredient.model.vo.Ingredient;
import com.fom.boot.domain.ingredient.model.vo.PriceHistory;

import lombok.RequiredArgsConstructor;

@Controller
@RequestMapping("/ingredient")
@RequiredArgsConstructor
public class IngredientController {

	private final IngredientService iService;
	private final AlertService alertService;
	private final PricePredictionService pricePredictionService;
	
    // --- [API 1] React 리스트 페이지용 ---
    @GetMapping("/api/list")
    @ResponseBody // JSON 반환
    public ResponseEntity<List<IngredientDTO>> getIngredientList() {
        List<IngredientDTO> list = iService.getIngredientListWithPrice();
        return ResponseEntity.ok(list);
    }

    // --- [API 2] React 상세 페이지용 ---
    @GetMapping("/api/detail/{id}")
    @ResponseBody // JSON 반환
    public ResponseEntity<Map<String, Object>> getIngredientDetail(@PathVariable int id) {
        
        Ingredient ingredientInfo = iService.getIngredientById(id);
        if (ingredientInfo == null) {
            return ResponseEntity.notFound().build();
        }
        List<PriceHistory> priceHistory = iService.getPriceHistory(id);

        Map<String, Object> response = new HashMap<>();
        response.put("info", ingredientInfo);     // 식재료 기본 정보
        response.put("history", priceHistory); // 가격 이력 (그래프용)

        return ResponseEntity.ok(response);
    }
	
//		마이페이지로 이동
//    // [API 3] 찜한 식재료 목록 조회 (마이페이지용)
//    @GetMapping("/api/favorites")
//    @ResponseBody
//    public ResponseEntity<?> getFavoriteIngredients(Authentication authentication) {
//        
//        // 로그인 확인
//        if (authentication == null || !authentication.isAuthenticated()) {
//            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
//        }
//        
//        String memberId = authentication.getName();
//        List<FavoriteIngredientSummaryDTO> favorites = iService.getFavoritesByMemberId(memberId);
//        
//        return ResponseEntity.ok(favorites);
//    }
    
    
    // 찜 등록 및 해제
    @PostMapping("detail/{ingredientId}/favorite")
    @ResponseBody
    public ResponseEntity<?> toggleFavoriteIngredient(@PathVariable("ingredientId") int ingredientId,
                                                        Authentication authentication) { // 변경: HttpSession → Authentication
        
        // JWT 토큰에서 인증된 사용자 정보 가져오기
    	// 로그인 확인
        if (authentication == null || !authentication.isAuthenticated()) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "로그인이 필요합니다.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
        
        String memberId = authentication.getName(); // JWT의 subject(username) 가져오기

        try {
            // 이미 찜한 상태인지 확인
            boolean isCurrentlyFavorite = iService.checkFavoriteExists(memberId, ingredientId);

            if (isCurrentlyFavorite) {
                // 찜 해제
                int result = iService.deleteFavorite(memberId, ingredientId);
                if (result > 0) {
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", true);
                    response.put("isFavorite", false);
                    response.put("message", "찜 목록에서 제거되었습니다.");
                    return ResponseEntity.ok(response);
                }
            } else {
                // 찜 등록
                FavoriteIngredient favorite = new FavoriteIngredient();
                favorite.setMemberId(memberId);
                favorite.setIngredientId(ingredientId);
                favorite.setIsCustom("N"); // 커스텀 여부 'N' 고정
                int result = iService.insertFavorite(favorite);
                if (result > 0) {
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", true);
                    response.put("isFavorite", true);
                    response.put("message", "찜 목록에 추가되었습니다.");
                    response.put("favoriteId", favorite.getFavoriteId());
                    return ResponseEntity.ok(response);
                }
            }
            // 실패한 경우
            Map<String, String> error = new HashMap<>();
            error.put("message", "처리에 실패했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    // 안전 알림 상태 확인
    @GetMapping("/api/{ingredientId}/alert")
    @ResponseBody
    public ResponseEntity<?> checkIngredientAlert(@PathVariable("ingredientId") int ingredientId,
                                                   Authentication authentication) {
        // 로그인 확인
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String memberId = authentication.getName();

        try {
            boolean isEnabled = alertService.checkIngredientAlertEnabled(memberId, ingredientId);

            Map<String, Object> response = new HashMap<>();
            response.put("isEnabled", isEnabled);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    // 안전 알림 ON/OFF 토글
    @PostMapping("/api/{ingredientId}/alert")
    @ResponseBody
    public ResponseEntity<?> toggleIngredientAlert(@PathVariable("ingredientId") int ingredientId,
                                                    Authentication authentication) {
        // 로그인 확인
        if (authentication == null || !authentication.isAuthenticated()) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "로그인이 필요합니다.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }

        String memberId = authentication.getName();

        try {
            // 현재 상태 확인
            boolean isCurrentlyEnabled = alertService.checkIngredientAlertEnabled(memberId, ingredientId);

            if (isCurrentlyEnabled) {
                // 알림 해제
                int result = alertService.deleteIngredientAlert(memberId, ingredientId);
                if (result > 0) {
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", true);
                    response.put("isEnabled", false);
                    response.put("message", "안전 알림이 해제되었습니다.");
                    return ResponseEntity.ok(response);
                }
            } else {
                // 알림 등록
                int result = alertService.insertIngredientAlert(memberId, ingredientId);
                if (result > 0) {
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", true);
                    response.put("isEnabled", true);
                    response.put("message", "안전 알림이 설정되었습니다.");
                    return ResponseEntity.ok(response);
                }
            }

            // 실패한 경우
            Map<String, String> error = new HashMap<>();
            error.put("message", "처리에 실패했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    // 가격 알림 상태 확인
    @GetMapping("/api/{ingredientId}/price-alert")
    @ResponseBody
    public ResponseEntity<?> checkPriceAlert(@PathVariable("ingredientId") int ingredientId,
                                             Authentication authentication) {
        // 로그인 확인
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String memberId = authentication.getName();

        try {
            boolean isEnabled = alertService.checkPriceAlertEnabled(memberId, ingredientId);

            Map<String, Object> response = new HashMap<>();
            response.put("isEnabled", isEnabled);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    // 가격 알림 ON/OFF 토글
    @PostMapping("/api/{ingredientId}/price-alert")
    @ResponseBody
    public ResponseEntity<?> togglePriceAlert(@PathVariable("ingredientId") int ingredientId,
                                              Authentication authentication) {
        // 로그인 확인
        if (authentication == null || !authentication.isAuthenticated()) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "로그인이 필요합니다.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }

        String memberId = authentication.getName();

        try {
            // 현재 상태 확인
            boolean isCurrentlyEnabled = alertService.checkPriceAlertEnabled(memberId, ingredientId);

            if (isCurrentlyEnabled) {
                // 가격 알림 해제
                int result = alertService.deletePriceAlert(memberId, ingredientId);
                if (result > 0) {
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", true);
                    response.put("isEnabled", false);
                    response.put("message", "가격 알림이 해제되었습니다.");
                    return ResponseEntity.ok(response);
                }
            } else {
                // 가격 알림 등록
                int result = alertService.insertPriceAlert(memberId, ingredientId);
                if (result > 0) {
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", true);
                    response.put("isEnabled", true);
                    response.put("message", "가격 알림이 설정되었습니다.");
                    return ResponseEntity.ok(response);
                }
            }

            // 실패한 경우
            Map<String, String> error = new HashMap<>();
            error.put("message", "처리에 실패했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    // 가격 예측 API
    @GetMapping("/api/{ingredientId}/price-prediction")
    @ResponseBody
    public ResponseEntity<?> getPricePrediction(@PathVariable("ingredientId") int ingredientId,
                                                Authentication authentication) {
        try {
            // 로그인 여부 확인
            boolean isAuthenticated = authentication != null && authentication.isAuthenticated();

            // 예측 일수 (기본 3일)
            int days = 3;

            PricePredictionDTO prediction = pricePredictionService.predictPrice(ingredientId, days, isAuthenticated);

            return ResponseEntity.ok(prediction);

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "가격 예측 조회 실패: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}
