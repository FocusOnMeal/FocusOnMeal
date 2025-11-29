package com.fom.boot.app.alert.controller;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
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
     * 모든 알림 조회 (하락/상승 모두)
     * GET /api/price-alert/all?ingredientId=101
     */
    @GetMapping("/all")
    public ResponseEntity<?> getAllAlerts(Authentication auth, @RequestParam int ingredientId) {
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }

        List<PriceAlert> alerts = priceAlertService.getAllPriceAlerts(auth.getName(), ingredientId);
        return ResponseEntity.ok(alerts);
    }

    /**
     * 알림 추가
     * POST /api/price-alert
     * Body: { "ingredientId": 101, "targetPrice": 3000, "alertType": "decrease" }
     */
    @PostMapping
    public ResponseEntity<?> addAlert(Authentication auth, @RequestBody Map<String, Object> req) {
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }

        try {
            int ingredientId = Integer.parseInt(req.get("ingredientId").toString());
            BigDecimal targetPrice = new BigDecimal(req.get("targetPrice").toString());
            String alertType = req.getOrDefault("alertType", "decrease").toString();

            priceAlertService.addPriceAlert(auth.getName(), ingredientId, targetPrice, alertType);

            return ResponseEntity.ok("알림이 추가되었습니다.");

        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body("잘못된 숫자 형식입니다.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("알림 추가 중 오류가 발생했습니다.");
        }
    }

    /**
     * 알림 삭제 (개별)
     * DELETE /api/price-alert?ingredientId=101&alertId=123
     */
    @DeleteMapping
    public ResponseEntity<?> deleteAlert(
            Authentication auth,
            @RequestParam int ingredientId,
            @RequestParam int alertId) {

        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }

        try {
            priceAlertService.deletePriceAlert(auth.getName(), ingredientId, alertId);
            return ResponseEntity.ok("알림이 삭제되었습니다.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("알림 삭제 중 오류가 발생했습니다.");
        }
    }

    /**
     * 전체 알림 삭제
     * DELETE /api/price-alert/all?ingredientId=101
     */
    @DeleteMapping("/all")
    public ResponseEntity<?> deleteAllAlerts(Authentication auth, @RequestParam int ingredientId) {
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }

        try {
            priceAlertService.deleteAllPriceAlerts(auth.getName(), ingredientId);
            return ResponseEntity.ok("모든 알림이 삭제되었습니다.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("알림 삭제 중 오류가 발생했습니다.");
        }
    }
}