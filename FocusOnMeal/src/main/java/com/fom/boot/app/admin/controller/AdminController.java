package com.fom.boot.app.admin.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fom.boot.domain.member.model.service.MemberService;
import com.fom.boot.domain.member.model.vo.Member;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {
	
	private final MemberService mService;
	
	//회원 목록 조회
	@GetMapping("/memberInfo")
	public ResponseEntity<?> selectMembers(Authentication authentication) {
		 System.out.println("Auth name = " + authentication.getName());
		 System.out.println("Auth authorities = " + authentication.getAuthorities());

		// 1. 토큰 인증 체크
        if (authentication == null || !authentication.isAuthenticated()) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "로그인이 필요합니다.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }

        // 2. 토큰에서 관리자 여부 확인
        String memberId = authentication.getName();
        Member member = mService.findByMemberId(memberId);
        
        if (member == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("관리자 아님");
        }
        if (!"Y".equals(member.getAdminYn())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("관리자만 접근 가능합니다.");
        }

        // 3. 전체 회원 목록 조회
        List<Member> list = mService.selectAllMembers();

        return ResponseEntity.ok(list);
	}
//	
//	@PatchMapping("/memberInfo/admin")
//	public ResponseEntity<?> updateAdminYn(@RequestParam String memberId,
//	                                       @RequestParam String adminYn) {
//
//	    mService.updateAdminYn(memberId, adminYn);
//	    return ResponseEntity.ok("success");
//	}
//	
//	@PatchMapping("/memberInfo/status")
//	public ResponseEntity<?> updateStatusYn(@RequestParam String memberId,
//	                                        @RequestParam String statusYn) {
//
//	    mService.updateStatusYn(memberId, statusYn);
//	    return ResponseEntity.ok("success");
//	}

}
