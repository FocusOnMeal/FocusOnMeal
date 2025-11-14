package com.fom.boot.app.member.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.fom.boot.domain.member.model.service.PasswordResetService;

import jakarta.servlet.http.HttpServletRequest;

/**
 * 비밀번호 재설정 및 아이디 찾기 컨트롤러
 * 
 * @author FocusOnMale Team
 * @since 2025-11-15
 */
@Slf4j
@Controller
@RequestMapping("/member")
public class PasswordResetController {
    
    @Autowired
    private PasswordResetService passwordResetService;
    
    // ========== 비밀번호 찾기 ==========
    
    /**
     * 비밀번호 찾기 페이지
     */
    @GetMapping("/pwSearch")
    public String showPwSearchPage() {
        return "member/pwSearch";
    }
    
    /**
     * 비밀번호 재설정 링크 발송
     */
    @PostMapping("/pwSearch")
    public String sendPasswordResetLink(
            @RequestParam("memberId") String memberId,
            @RequestParam("email") String email,
            HttpServletRequest request,
            Model model) {
        
        try {
            // 요청 IP 주소 가져오기
            String ipAddress = getClientIpAddress(request);
            
            // User-Agent 가져오기
            String userAgent = request.getHeader("User-Agent");
            
            // 비밀번호 재설정 링크 발송
            boolean success = passwordResetService.sendPasswordResetLink(
                memberId, email, ipAddress, userAgent
            );
            
            if (success) {
                model.addAttribute("email", email);
                return "member/pwSearchResult";
            } else {
                model.addAttribute("errorMsg", "처리 중 오류가 발생했습니다.");
                return "member/pwSearch";
            }
            
        } catch (Exception e) {
            log.error("비밀번호 찾기 오류: memberId={}, error={}", memberId, e.getMessage());
            model.addAttribute("errorMsg", e.getMessage());
            return "member/pwSearch";
        }
    }
    
    /**
     * 비밀번호 재설정 페이지 (이메일 링크 클릭 시)
     */
    @GetMapping("/resetPassword")
    public String showResetPasswordPage(
            @RequestParam("token") String token,
            Model model) {
        
        try {
            // 토큰 유효성 검증
            boolean isValid = passwordResetService.validateToken(token);
            
            if (!isValid) {
                model.addAttribute("errorMsg", 
                    "유효하지 않거나 만료된 링크입니다. 비밀번호 찾기를 다시 진행해주세요.");
                return "member/tokenExpired";
            }
            
            model.addAttribute("token", token);
            return "member/resetPassword";
            
        } catch (Exception e) {
            log.error("비밀번호 재설정 페이지 오류: error={}", e.getMessage());
            model.addAttribute("errorMsg", "오류가 발생했습니다.");
            return "common/error";
        }
    }
    
    /**
     * 새 비밀번호 저장
     */
    @PostMapping("/resetPassword")
    public String resetPassword(
            @RequestParam("token") String token,
            @RequestParam("newPassword") String newPassword,
            @RequestParam("confirmPassword") String confirmPassword,
            Model model) {
        
        try {
            // 1. 비밀번호 일치 확인
            if (!newPassword.equals(confirmPassword)) {
                model.addAttribute("errorMsg", "비밀번호가 일치하지 않습니다.");
                model.addAttribute("token", token);
                return "member/resetPassword";
            }
            
            // 2. 비밀번호 유효성 검증 (8자 이상, 영문+숫자+특수문자)
            if (!isValidPassword(newPassword)) {
                model.addAttribute("errorMsg", 
                    "비밀번호는 8자 이상이며, 영문, 숫자, 특수문자를 포함해야 합니다.");
                model.addAttribute("token", token);
                return "member/resetPassword";
            }
            
            // 3. 비밀번호 재설정
            boolean success = passwordResetService.resetPassword(token, newPassword);
            
            if (success) {
                model.addAttribute("successMsg", "비밀번호가 성공적으로 변경되었습니다.");
                return "member/resetPasswordSuccess";
            } else {
                model.addAttribute("errorMsg", "비밀번호 변경에 실패했습니다.");
                model.addAttribute("token", token);
                return "member/resetPassword";
            }
            
        } catch (Exception e) {
            log.error("비밀번호 재설정 오류: error={}", e.getMessage());
            model.addAttribute("errorMsg", e.getMessage());
            model.addAttribute("token", token);
            return "member/resetPassword";
        }
    }
    
    // ========== 아이디 찾기 ==========
    
    /**
     * 아이디 찾기 페이지
     */
    @GetMapping("/idSearch")
    public String showIdSearchPage() {
        return "member/idSearch";
    }
    
    /**
     * 아이디 찾기 - 이메일로 발송
     */
    @PostMapping("/idSearch")
    public String searchMemberId(
            @RequestParam("memberName") String memberName,
            @RequestParam("email") String email,
            Model model) {
        
        try {
            // 아이디 찾기 및 이메일 발송
            boolean success = passwordResetService.sendMemberIdByEmail(memberName, email);
            
            if (success) {
                model.addAttribute("email", email);
                return "member/idSearchResult";
            } else {
                model.addAttribute("errorMsg", "처리 중 오류가 발생했습니다.");
                return "member/idSearch";
            }
            
        } catch (Exception e) {
            log.error("아이디 찾기 오류: name={}, error={}", memberName, e.getMessage());
            model.addAttribute("errorMsg", e.getMessage());
            return "member/idSearch";
        }
    }
    
    // ========== 유틸리티 메서드 ==========
    
    /**
     * 클라이언트 IP 주소 가져오기
     * (프록시, 로드밸런서 고려)
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("HTTP_CLIENT_IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("HTTP_X_FORWARDED_FOR");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        
        return ip;
    }
    
    /**
     * 비밀번호 유효성 검증
     * 조건: 8자 이상, 영문 + 숫자 + 특수문자 포함
     */
    private boolean isValidPassword(String password) {
        if (password == null || password.length() < 8) {
            return false;
        }
        
        // 영문 포함 여부
        boolean hasLetter = password.matches(".*[A-Za-z].*");
        
        // 숫자 포함 여부
        boolean hasDigit = password.matches(".*\\d.*");
        
        // 특수문자 포함 여부
        boolean hasSpecial = password.matches(".*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>/?].*");
        
        return hasLetter && hasDigit && hasSpecial;
    }
}