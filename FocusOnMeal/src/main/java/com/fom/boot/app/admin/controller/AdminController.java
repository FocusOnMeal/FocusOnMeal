

package com.fom.boot.app.admin.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fom.boot.common.pagination.PageInfo;
import com.fom.boot.common.pagination.Pagination;
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
	public ResponseEntity<?> selectMembers(
			@RequestParam(defaultValue ="1") int page
			,@RequestParam(defaultValue = "all") String type
	        ,@RequestParam(defaultValue = "") String keyword
	        ,@RequestParam(required = false) String sortColumn
	        ,@RequestParam(required = false) String sortOrder
			,Authentication authentication) {
		// 1. 토큰 인증 체크
        if (authentication == null || !authentication.isAuthenticated()) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "로그인이 필요합니다.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }

        System.out.println("Auth name = " + authentication.getName());
        System.out.println("Auth authorities = " + authentication.getAuthorities());
        
        // 2. 토큰에서 관리자 여부 확인
        String memberId = authentication.getName();
        Member member = mService.findByMemberId(memberId);
        
        if (member == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("관리자 아님");
        }
        if (!"Y".equals(member.getAdminYn())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("관리자만 접근 가능합니다.");
        }
        
        // 검색포함 총 데이터 개수 조회
        int totalCount = mService.getTotalMembersBySearch(type, keyword);

        // Pagination
        PageInfo pageInfo= Pagination.getPageInfo(page, totalCount);
        
        // 전체 회원 목록 조회
        List<Member> mList = mService.selectAllMembers(pageInfo, type, keyword, sortColumn, sortOrder);
        
        Map<String, Object> data = new HashMap<>();
    	data.put("pageInfo", pageInfo);
    	data.put("memberList", mList);
    	
        return ResponseEntity.ok(data);
	}
	
	// 관리자 등급 및 닉네임 수정
	@PatchMapping("/memberInfo/adminYn")
	public ResponseEntity<?> updateAdminYn(
	        Authentication authentication,
	        @RequestParam String memberId,
	        @RequestParam String adminYn) {
		
		Map<String, String> responseBody = new HashMap<>();

	    // 1. 토큰 인증 체크
	    if (authentication == null || !authentication.isAuthenticated()) {
	        Map<String, String> error = new HashMap<>();
	        error.put("message", "로그인이 필요합니다.");
	        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
	    }
	    
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
	    
	    // 3. 자기 자신을 수정하려는 시도 방지 (선택 사항: 관리자가 실수로 자신의 권한을 해제하는 것을 막음)
	    if (loginId.equals(memberId) && "N".equals(adminYn)) {
	        responseBody.put("message", "자신의 관리자 권한을 해제할 수 없습니다.");
	        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(responseBody);
	    }

	    try {
	        // 1. 서비스 호출하여 등급 및 닉네임 변경 로직 수행
	        String newNickname = mService.updateAdminYn(memberId, adminYn);
	        
	        // 2. 변경된 닉네임을 클라이언트로 응답
	        responseBody.put("newNickname", newNickname);
	        responseBody.put("message", "등급 및 닉네임이 성공적으로 변경되었습니다.");
	        
	        return ResponseEntity.ok(responseBody);
	        
	    } catch (RuntimeException e) {
	        // 서비스에서 발생시킨 실패 예외 처리
	        responseBody.put("message", "DB 업데이트 오류: " + e.getMessage());
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(responseBody);
	    } catch (Exception e) {
	        // 기타 서버 오류 처리
	        responseBody.put("message", "서버 처리 중 예기치 않은 오류가 발생했습니다.");
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(responseBody);
	    }
	}

	// 관리자 - 회원 상태 수정
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
	public ResponseEntity<?> selectNotices(
			@RequestParam(defaultValue ="1") int page
			,@RequestParam(defaultValue = "all") String type
	        ,@RequestParam(defaultValue = "") String keyword
	        ,@RequestParam(required = false) String sortColumn
	        ,@RequestParam(required = false) String sortOrder
	        ,@RequestParam(defaultValue ="all") String filterType
			,Authentication authentication) {
		// 1. 토큰 인증 체크
        if (authentication == null || !authentication.isAuthenticated()) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "로그인이 필요합니다.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }

        System.out.println("Auth name = " + authentication.getName());
        System.out.println("Auth authorities = " + authentication.getAuthorities());
        
        // 2. 토큰에서 관리자 여부 확인
        String memberId = authentication.getName();
        Member member = mService.findByMemberId(memberId);
        
        if (member == null) {
        	return ResponseEntity.status(HttpStatus.FORBIDDEN).body("관리자 아님");
        }
        if (!"Y".equals(member.getAdminYn())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("관리자만 접근 가능합니다.");
        }

        int totalCount = nService.getTotalNoticesBySearch(type, keyword);
        
        // pagination
        PageInfo pageInfo = Pagination.getPageInfo(page, totalCount);
        
        // 3. 전체 회원 목록 조회
        List<Notice> nList = nService.selectAllNotices(pageInfo, type, keyword, sortColumn, sortOrder, filterType);
        
        Map<String, Object> data = new HashMap<>();
        data.put("pageInfo", pageInfo);
        data.put("noticeList", nList);
        return ResponseEntity.ok(data);
	}
		
	// 관리자 공지사항 수정
	@PatchMapping("/noticeInfo/modify")
	public ResponseEntity<?> updateNotice(
			@RequestBody Notice notice,
			Authentication authentication) {

		// 1. 토큰 인증 체크
        if (authentication == null || !authentication.isAuthenticated()) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "로그인이 필요합니다.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }

        System.out.println("Auth name = " + authentication.getName());
        System.out.println("Auth authorities = " + authentication.getAuthorities());
        
        // 2. 토큰에서 관리자 여부 확인
        String memberId = authentication.getName();
        Member member = mService.findByMemberId(memberId);
        
        if (member == null) {
        	return ResponseEntity.status(HttpStatus.FORBIDDEN).body("관리자 아님");
        }
        if (!"Y".equals(member.getAdminYn())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("관리자만 접근 가능합니다.");
        }
		
        System.out.println("=== 받은 Notice JSON ===");
        System.out.println(notice);
        
	    int result = nService.modifyNotice(notice);

	    if (result > 0) {
	        return ResponseEntity.ok("success");
	    } else {
	        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("공지사항 수정 실패");
	    }
	}
	
	
	// 관리자 공지사항 삭제
	@DeleteMapping("/noticeInfo/{noticeNo}")
	public ResponseEntity<?> deleteNotice(@PathVariable int noticeNo) {
		nService.deleteNotice(noticeNo);
	    return ResponseEntity.ok("삭제 완료");
	}
}
