package com.fom.boot.app.alert.controller;

import java.math.BigDecimal;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fom.boot.domain.alert.model.service.PriceAlertService;
import com.fom.boot.domain.alert.model.vo.PriceAlert;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/price-alert")
@RequiredArgsConstructor
public class PriceAlertController {

    private final PriceAlertService priceAlertService;

    /**
     * 설정 조회 (모달 Open 시 호출)
     * GET /api/price-alert?ingredientId=101
     */
    @GetMapping
    public ResponseEntity<?> getAlertSetting(Authentication auth, @RequestParam int ingredientId) {
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }
        
        // Service 메서드명: getMyPriceAlert (VO 리턴)
        PriceAlert alert = priceAlertService.getMyPriceAlert(auth.getName(), ingredientId);
        
        // 설정이 없으면 null이 리턴되는데, 프론트에서는 200 OK에 body가 비어있거나 null로 받아서 처리
        return ResponseEntity.ok(alert); 
    }

    /**
     * 설정 저장/수정 (모달 Save 버튼)
     * POST /api/price-alert
     * Body: { "ingredientId": 101, "targetPrice": 3000 }
     */
    @PostMapping
    public ResponseEntity<?> saveAlertSetting(Authentication auth, @RequestBody Map<String, Object> req) {
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }
        
        try {
            // 1. ID 파싱 (VO가 int이므로 int로 변환)
            int ingredientId = Integer.parseInt(req.get("ingredientId").toString());
            
            // 2. 가격 파싱 (VO가 BigDecimal이므로 변환 주의)
            // toString() 후 생성자에 넣는 것이 가장 안전합니다.
            BigDecimal targetPrice = new BigDecimal(req.get("targetPrice").toString());
            
            // Service 메서드명: setPriceAlert
            priceAlertService.setPriceAlert(auth.getName(), ingredientId, targetPrice);
            
            return ResponseEntity.ok("알림 설정이 저장되었습니다.");
            
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body("잘못된 숫자 형식입니다.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("저장 중 오류가 발생했습니다.");
        }
    }
}