

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
import com.fom.boot.domain.notice.model.service.NoticeService;
import com.fom.boot.domain.notice.model.vo.Notice;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {
	
	private final MemberService mService;
	private final NoticeService nService;
	
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
	
	@PatchMapping("/memberInfo/adminYn")
	public ResponseEntity<?> updateAdminYn(
	        Authentication authentication,
	        @RequestParam String memberId,
	        @RequestParam String adminYn) {


	    // 1. 토큰 인증 체크
	    if (authentication == null || !authentication.isAuthenticated()) {
	        Map<String, String> error = new HashMap<>();
	        error.put("message", "로그인이 필요합니다.");
	        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
	    }
	    System.out.println("===  PATCH /memberInfo/adminYn 호출됨 ===");
	    System.out.println("Auth name = " + authentication.getName());
	    System.out.println("Auth authorities = " + authentication.getAuthorities());

	    // 2. 관리자 여부 체크
	    String loginId = authentication.getName();
	    Member admin = mService.findByMemberId(loginId);

	    if (admin == null) {
	        return ResponseEntity.status(HttpStatus.FORBIDDEN).body("관리자 아님");
	    }
	    if (!"Y".equals(admin.getAdminYn())) {
	        return ResponseEntity.status(HttpStatus.FORBIDDEN).body("관리자만 접근 가능합니다.");
	    }

	    // 3. 실제 수정
	    System.out.println("받은 memberId : " + memberId);
	    System.out.println("받은 adminYn  : " + adminYn);

	    mService.updateAdminYn(memberId, adminYn);

	    return ResponseEntity.ok("success");
	}

	
	@PatchMapping("/memberInfo/status")
	public ResponseEntity<?> updateStatusYn(
			Authentication authentication,
			@RequestParam String memberId,
			@RequestParam String statusYn) {
		// 1. 토큰 인증 체크
	    if (authentication == null || !authentication.isAuthenticated()) {
	        Map<String, String> error = new HashMap<>();
	        error.put("message", "로그인이 필요합니다.");
	        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
	    }

	    // 2. 관리자 여부 체크
	    String loginId = authentication.getName();
	    Member admin = mService.findByMemberId(loginId);

	    if (admin == null) {
	        return ResponseEntity.status(HttpStatus.FORBIDDEN).body("관리자 아님");
	    }
	    if (!"Y".equals(admin.getAdminYn())) {
	        return ResponseEntity.status(HttpStatus.FORBIDDEN).body("관리자만 접근 가능합니다.");
	    }

	    mService.updateStatusYn(memberId, statusYn);
	    return ResponseEntity.ok("success");
	}
	
	// 관리자 공지사항 조회
		@GetMapping("/noticeInfo")
		public ResponseEntity<?> selectNotices(Authentication authentication) {
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
	        List<Notice> list = nService.selectAllNotices();
	        return ResponseEntity.ok(list);
		}
	

}
