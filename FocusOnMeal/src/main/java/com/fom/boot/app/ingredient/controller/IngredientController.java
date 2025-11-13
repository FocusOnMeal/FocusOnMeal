package com.fom.boot.app.ingredient.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import com.fom.boot.domain.ingredient.model.service.IngredientService;
import com.fom.boot.domain.ingredient.model.vo.FavoriteIngredient;
import com.fom.boot.domain.member.model.vo.Member;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;

@Controller
@RequestMapping("/ingredient")
@RequiredArgsConstructor
public class IngredientController {

	private final IngredientService iService;
	
	@GetMapping("/list")
	public String showListPage() {
		return "forward:/index.html";
	}
	
	// 찜 등록 및 해제
	@PostMapping("detail/{ingredientId}/favorite")
	public ResponseEntity<?> toggleFavoriteIngredient(@PathVariable("ingredientId") int ingredientId,
														HttpSession session) {
		// 세션에서 로그인한 회원 ID 가져오기
        String memberId = (String) session.getAttribute("loginMember");
        // 로그인 확인
        if (memberId == null) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "로그인이 필요합니다.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }

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
}
