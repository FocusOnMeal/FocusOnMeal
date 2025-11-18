package com.fom.boot.app.member.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.fom.boot.app.jwt.JwtTokenProvider;
import com.fom.boot.app.member.dto.*;
import com.fom.boot.domain.member.model.service.MemberService;
import com.fom.boot.domain.member.model.service.EmailService;
import com.fom.boot.domain.member.model.service.PasswordResetService;
import com.fom.boot.domain.member.model.vo.Member;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequiredArgsConstructor
@RequestMapping("/member")
public class MemberController {

    private final BCryptPasswordEncoder bcrypt;
    private final MemberService mService;
    private final JwtTokenProvider jwtTokenProvider;
    private final EmailService emailService;
    private final PasswordResetService passwordResetService;

    // ========== 로그인/로그아웃 ==========

    @PostMapping("/login")
    public ResponseEntity<?> checkLogin(@RequestBody LoginRequest loginRequest) {
        log.info("[로그인 시도] ID: {}", loginRequest.getMemberId());
        try {
            Member loginMember = mService.selectOneByLogin(loginRequest);

            if(loginMember == null || "N".equals(loginMember.getStatusYn())) {
                log.warn("[로그인 실패] 존재하지 않는 회원: {}", loginRequest.getMemberId());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("회원정보가 없습니다."));
            }

            if(!bcrypt.matches(loginRequest.getMemberPw(), loginMember.getMemberPw())) {
                log.warn("[로그인 실패] 비밀번호 불일치: {}", loginRequest.getMemberId());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("비밀번호가 일치하지 않습니다."));
            }

            String token = jwtTokenProvider.createToken(loginMember.getMemberId());

            LoginResponse response = new LoginResponse(
                token,
                loginMember.getMemberId(),
                loginMember.getMemberName(),
                loginMember.getAdminYn(),
                loginMember.getMemberNickname()
            );
            log.info("[로그인 성공] ID: {}", loginMember.getMemberId());

            return ResponseEntity.ok(ApiResponse.success("로그인 성공", response));

        } catch (Exception e) {
            log.error("로그인 오류: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("서버 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader("Authorization") String authHeader) {
        if(authHeader == null || !authHeader.startsWith("Bearer")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("토큰이 없습니다."));
        }
        
        String token = authHeader.substring(7);
        
        return ResponseEntity.ok(ApiResponse.success("로그아웃 완료"));
    }

    // ========== 회원가입 ==========

    /**
     * ✅ 수정: 아이디 중복 확인 - 응답 구조 단순화
     */
    @GetMapping("/check-id/{memberId}")
    public ResponseEntity<?> checkMemberId(@PathVariable String memberId) {
        log.info("[아이디 중복 확인] memberId: {}", memberId);
        
        try {
            Member existMember = mService.selectOneById(memberId);
            boolean available = (existMember == null);
            
            // ✅ 수정: Map으로 직접 응답하여 구조 단순화
            Map<String, Object> response = new HashMap<>();
            response.put("available", available);
            response.put("message", available ? "사용 가능한 아이디입니다." : "이미 사용중인 아이디입니다.");
            
            log.info("[아이디 중복 확인 결과] memberId: {}, available: {}", memberId, available);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("[아이디 중복 확인 오류] memberId: {}, error: {}", memberId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "서버 오류가 발생했습니다."));
        }
    }

    /**
     * ✅ 수정: 이메일 인증 코드 발송 - 로깅 강화
     */
    @PostMapping("/send-verification-code")
    public ResponseEntity<?> sendVerificationCode(@RequestBody EmailVerificationRequest request) {
        log.info("[이메일 인증 코드 발송 요청] email: {}", request.getEmail());
        
        try {
            // 이메일 중복 확인
            boolean exists = mService.checkEmailExists(request.getEmail());
            if (exists) {
                log.warn("[이메일 인증 실패] 이미 사용중인 이메일: {}", request.getEmail());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "이미 사용중인 이메일입니다."));
            }
            
            // 6자리 인증 코드 생성
            String verificationCode = emailService.generateVerificationCode();
            log.info("[인증 코드 생성] email: {}, code: {}", request.getEmail(), verificationCode);
            
            // 이메일 발송
            try {
                emailService.sendVerificationEmail(request.getEmail(), verificationCode);
                log.info("[이메일 발송 성공] email: {}", request.getEmail());
            } catch (Exception emailError) {
                log.error("[이메일 발송 실패] email: {}, error: {}", request.getEmail(), emailError.getMessage());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "이메일 발송에 실패했습니다. 메일 서버 설정을 확인해주세요."));
            }
            
            // 인증 코드 저장 (5분 유효)
            mService.saveVerificationCode(request.getEmail(), verificationCode);
            log.info("[인증 코드 저장 완료] email: {}", request.getEmail());
            
            return ResponseEntity.ok(
                Map.of(
                    "success", true,
                    "message", "인증 코드가 이메일로 발송되었습니다."
                )
            );
            
        } catch (Exception e) {
            log.error("[이메일 인증 코드 발송 오류] email: {}, error: {}", request.getEmail(), e.getMessage());
            e.printStackTrace(); // 전체 스택 트레이스 출력
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "서버 오류: " + e.getMessage()));
        }
    }

    /**
     * ✅ 수정: 이메일 인증 코드 확인 - 응답 구조 단순화
     */
    @PostMapping("/verify-email-code")
    public ResponseEntity<?> verifyEmailCode(@RequestBody EmailCodeVerificationRequest request) {
        log.info("[이메일 인증 코드 확인] email: {}, code: {}", request.getEmail(), request.getCode());
        
        try {
            boolean isValid = mService.verifyEmailCode(request.getEmail(), request.getCode());
            
            Map<String, Object> response = new HashMap<>();
            response.put("verified", isValid);
            response.put("message", isValid ? "이메일 인증이 완료되었습니다." : "인증 코드가 일치하지 않거나 만료되었습니다.");
            
            log.info("[이메일 인증 결과] email: {}, verified: {}", request.getEmail(), isValid);
            
            if (isValid) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
            
        } catch (Exception e) {
            log.error("[이메일 인증 확인 오류] email: {}, error: {}", request.getEmail(), e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "서버 오류가 발생했습니다."));
        }
    }

    /**
     * 회원가입
     */
    @PostMapping("/join")
    public ResponseEntity<?> joinMember(@Valid @RequestBody JoinRequest request) {
        log.info("[회원가입 시도] memberId: {}, email: {}", request.getMemberId(), request.getEmail());
        
        try {
            // 1. 아이디 중복 확인
            Member existMember = mService.selectOneById(request.getMemberId());
            if (existMember != null) {
                log.warn("[회원가입 실패] 중복 아이디: {}", request.getMemberId());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "이미 사용중인 아이디입니다."));
            }
            
            // 2. 이메일 중복 확인
            if (mService.checkEmailExists(request.getEmail())) {
                log.warn("[회원가입 실패] 중복 이메일: {}", request.getEmail());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "이미 사용중인 이메일입니다."));
            }
            
            // 3. 이메일 인증 여부 확인
            if (!mService.isEmailVerified(request.getEmail())) {
                log.warn("[회원가입 실패] 이메일 미인증: {}", request.getEmail());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "이메일 인증이 필요합니다."));
            }
            
            // 4. 비밀번호 유효성 검증
            if (!isValidPassword(request.getMemberPw())) {
                log.warn("[회원가입 실패] 비밀번호 형식 오류: {}", request.getMemberId());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "비밀번호는 8자 이상이며, 숫자와 특수문자를 포함해야 합니다."));
            }
            
            // 5. Member 객체 생성
            Member member = new Member();
            member.setMemberId(request.getMemberId());
            member.setMemberPw(bcrypt.encode(request.getMemberPw()));
            member.setMemberName(request.getMemberName());
            member.setMemberNickname(request.getMemberNickname());
            member.setEmail(request.getEmail());
            member.setPhone(request.getPhone());
            member.setGender(request.getGender());
            
            log.info("[회원 정보] nickname: {}", request.getMemberNickname()); // 닉네임 로깅
            
            // 6. 회원가입 처리
            int result = mService.insertMember(member);
            
            if (result > 0) {
                // 인증 완료된 이메일 정보 삭제
                mService.deleteVerificationCode(request.getEmail());
                
                log.info("[회원가입 성공] memberId: {}, nickname: {}", request.getMemberId(), request.getMemberNickname());
                
                return ResponseEntity.ok(
                    Map.of(
                        "success", true,
                        "message", "회원가입이 완료되었습니다."
                    )
                );
            } else {
                log.error("[회원가입 실패] DB 저장 실패: {}", request.getMemberId());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "회원가입에 실패했습니다."));
            }
        } catch (Exception e) {
            log.error("[회원가입 오류] memberId: {}, error: {}", request.getMemberId(), e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "서버 오류: " + e.getMessage()));
        }
    }

    // ========== 비밀번호 찾기 ==========

    /**
     * 비밀번호 재설정 링크 발송
     */
    @PostMapping("/password/reset-request")
    public ResponseEntity<?> sendPasswordResetLink(
            @Valid @RequestBody PasswordResetLinkRequest request,
            HttpServletRequest httpRequest) {
        
        log.info("[비밀번호 재설정 요청] memberId: {}, email: {}", request.getMemberId(), request.getEmail());
        
        try {
            String ipAddress = getClientIpAddress(httpRequest);
            String userAgent = httpRequest.getHeader("User-Agent");
            
            boolean success = passwordResetService.sendPasswordResetLink(
                request.getMemberId(),
                request.getEmail(),
                ipAddress,
                userAgent
            );
            
            if (success) {
                log.info("[비밀번호 재설정 링크 발송 성공] email: {}", request.getEmail());
                return ResponseEntity.ok(
                    Map.of(
                        "success", true,
                        "message", "비밀번호 재설정 링크가 이메일로 발송되었습니다.",
                        "email", request.getEmail()
                    )
                );
            } else {
                log.error("[비밀번호 재설정 링크 발송 실패] email: {}", request.getEmail());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "처리 중 오류가 발생했습니다."));
            }
        } catch (Exception e) {
            log.error("[비밀번호 재설정 요청 실패] error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 토큰 유효성 검증
     */
    @GetMapping("/password/validate-token")
    public ResponseEntity<?> validateToken(@RequestParam("token") String token) {
        log.info("[토큰 검증] token: {}", token.substring(0, Math.min(20, token.length())) + "...");
        
        try {
            boolean isValid = passwordResetService.validateToken(token);
            
            Map<String, Object> response = new HashMap<>();
            response.put("valid", isValid);
            response.put("message", isValid ? "유효한 토큰입니다." : "유효하지 않거나 만료된 링크입니다.");
            
            log.info("[토큰 검증 결과] valid: {}", isValid);
            
            if (isValid) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
        } catch (Exception e) {
            log.error("[토큰 검증 실패] error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "토큰 검증 중 오류가 발생했습니다."));
        }
    }

    /**
     * 비밀번호 재설정
     */
    @PostMapping("/password/reset")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody PasswordResetRequest request) {
        log.info("[비밀번호 재설정 시도]");
        
        try {
            if (!request.getNewPassword().equals(request.getConfirmPassword())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "비밀번호가 일치하지 않습니다."));
            }
            
            if (!isValidPassword(request.getNewPassword())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "비밀번호는 8자 이상이며, 숫자와 특수문자를 포함해야 합니다."));
            }
            
            boolean success = passwordResetService.resetPassword(
                request.getToken(), 
                request.getNewPassword()
            );
            
            if (success) {
                log.info("[비밀번호 재설정 성공]");
                return ResponseEntity.ok(
                    Map.of(
                        "success", true,
                        "message", "비밀번호가 성공적으로 변경되었습니다."
                    )
                );
            } else {
                log.error("[비밀번호 재설정 실패]");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "비밀번호 변경에 실패했습니다."));
            }
        } catch (Exception e) {
            log.error("[비밀번호 재설정 실패] error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", e.getMessage()));
        }
    }

    // ========== 아이디 찾기 ==========

    /**
     * 아이디 찾기
     */
    @PostMapping("/id/search")
    public ResponseEntity<?> searchMemberId(@Valid @RequestBody IdSearchRequest request) {
        log.info("[아이디 찾기] name: {}, email: {}", request.getMemberName(), request.getEmail());
        
        try {
            boolean success = passwordResetService.sendMemberIdByEmail(
                request.getMemberName(),
                request.getEmail()
            );
            
            if (success) {
                log.info("[아이디 찾기 성공] email: {}", request.getEmail());
                return ResponseEntity.ok(
                    Map.of(
                        "success", true,
                        "message", "아이디 찾기 결과가 이메일로 발송되었습니다.",
                        "email", request.getEmail()
                    )
                );
            } else {
                log.error("[아이디 찾기 실패] email: {}", request.getEmail());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "처리 중 오류가 발생했습니다."));
            }
        } catch (Exception e) {
            log.error("[아이디 찾기 실패] error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", e.getMessage()));
        }
    }

    // ========== 유틸리티 메서드 ==========

    /**
     * ⭐ 테스트용: 이메일 발송 테스트 (개발 환경에서만 사용)
     */
    @GetMapping("/test-email")
    public ResponseEntity<?> testEmail(@RequestParam(required = false) String email) {
        if (email == null || email.isEmpty()) {
            email = "dofvm1004@gmail.com"; // 기본 테스트 이메일
        }
        
        try {
            log.info("[이메일 테스트] 시작: {}", email);
            emailService.sendVerificationEmail(email, "123456");
            log.info("[이메일 테스트] 성공: {}", email);
            return ResponseEntity.ok(
                Map.of(
                    "success", true,
                    "message", "테스트 이메일 발송 성공! " + email + " 확인해주세요."
                )
            );
        } catch (Exception e) {
            log.error("[이메일 테스트] 실패: {}, error: {}", email, e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                    "error", "이메일 발송 실패: " + e.getMessage(),
                    "detail", e.getClass().getName()
                ));
        }
    }

    private String getClientIpAddress(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        return ip;
    }

    private boolean isValidPassword(String password) {
        if (password == null || password.length() < 8) {
            return false;
        }
        // ✅ 수정: 숫자 + 특수문자만 있어도 OK (영문은 선택)
        boolean hasDigit = password.matches(".*\\d.*");
        boolean hasSpecial = password.matches(".*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>/?].*");
        return hasDigit && hasSpecial;
    }
}