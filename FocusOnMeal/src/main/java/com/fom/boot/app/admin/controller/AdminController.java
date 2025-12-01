package com.fom.boot.app.admin.controller;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.fom.boot.app.admin.dto.AdminIngredientDTO;
import com.fom.boot.common.pagination.PageInfo;
import com.fom.boot.common.pagination.Pagination;
import com.fom.boot.domain.alert.model.vo.SafetyAlert;
import com.fom.boot.domain.ingredient.model.service.IngredientService;
import com.fom.boot.domain.ingredient.model.vo.NutritionMaster;
import com.fom.boot.domain.member.model.service.MemberService;
import com.fom.boot.domain.member.model.vo.Member;
import com.fom.boot.domain.notice.model.service.NoticeService;
import com.fom.boot.domain.notice.model.vo.Notice;
import com.fom.boot.domain.safety.model.service.SafetyService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {
	
	private final MemberService mService;
	private final NoticeService nService;
	private final IngredientService iService;
	private final SafetyService safetyService;
	
	// application.properties에 설정된 파일 저장 경로 주입
	@Value("${file.upload-dir}")
	private String uploadDir;
	
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
	
	// =========================================================================
	// [추가] 3. 식재료 관리 (조회, 영양성분 수정, 이미지 덮어쓰기)
	// =========================================================================
	
	// 식재료 목록 조회 (API 데이터 및 영양정보 확인용)
	@GetMapping("/ingredient")
	public ResponseEntity<?> selectIngredients(
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
		
		// 2. 토큰에서 관리자 여부 확인
		String memberId = authentication.getName();
		Member member = mService.findByMemberId(memberId);
		
		if (member == null || !"Y".equals(member.getAdminYn())) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN).body("관리자만 접근 가능합니다.");
		}

		// 검색 조건에 맞는 식재료 총 개수
		int totalCount = iService.getTotalIngredientsBySearch(type, keyword);

		// 페이징 처리
		PageInfo pageInfo = Pagination.getPageInfo(page, totalCount);

		// 목록 조회 (DTO: 식재료 정보 + 영양 정보)
		List<AdminIngredientDTO> list = iService.selectAdminIngredients(pageInfo, type, keyword, sortColumn, sortOrder);

		Map<String, Object> data = new HashMap<>();
		data.put("pageInfo", pageInfo);
		data.put("ingredientList", list);

		return ResponseEntity.ok(data);
	}

	// 영양성분 수정
	@PatchMapping("/ingredient/nutrition")
	public ResponseEntity<?> updateNutrition(
			@RequestBody NutritionMaster nutrition,
			Authentication authentication) {

		// 1. 토큰 인증 체크
		if (authentication == null || !authentication.isAuthenticated()) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "로그인 필요"));
		}

		// 2. 관리자 여부 확인
		String memberId = authentication.getName();
		Member member = mService.findByMemberId(memberId);
		if (member == null || !"Y".equals(member.getAdminYn())) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN).body("관리자 권한 필요");
		}

		log.info("수정할 영양성분 정보: {}", nutrition);

		try {
			// Service에서 nutritionId 유무에 따라 update/insert 처리
			int result = iService.updateNutrition(nutrition);
			
			if(result > 0) {
				return ResponseEntity.ok("영양성분 수정 성공");
			} else {
				return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("수정 실패");
			}
		} catch (Exception e) {
			log.error("영양성분 수정 중 에러 발생", e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("서버 에러");
		}
	}

	// 식재료 이미지 변경 (서버 파일 덮어쓰기 방식)
	// 식재료 이미지 변경 (상대 경로 -> 절대 경로 변환 로직 추가)
	@PostMapping("/ingredient/image")
	public ResponseEntity<?> updateIngredientImage(
			@RequestParam("ingredientId") int ingredientId,
			@RequestPart("file") MultipartFile file,
			Authentication authentication) {

		// 1. 관리자 권한 체크 (기존 스타일대로 수동 체크)
		if (authentication == null || !authentication.isAuthenticated()) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인 필요");
		}
		
		String memberId = authentication.getName();
		Member member = mService.findByMemberId(memberId);
		
		if (member == null || !"Y".equals(member.getAdminYn())) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN).body("관리자 권한이 필요합니다.");
		}

		if (file.isEmpty()) {
			return ResponseEntity.badRequest().body("업로드된 파일이 없습니다.");
		}

		try {
			// 2. 파일명 생성 (ID.jpg)
			String fileName = ingredientId + ".jpg";
			
			// 3. 상대 경로(src/...)를 현재 실행 위치(프로젝트 루트) 기준으로 절대 경로로 변환
			// 이렇게 하면 팀원들 컴퓨터 위치가 달라도 프로젝트 루트 안의 public/images/ingredients를 찾아갑니다.
			File projectRoot = new File(System.getProperty("user.dir"));
			File uploadPath = new File(projectRoot, uploadDir);
			
			// 디렉토리가 없으면 생성
			if (!uploadPath.exists()) {
				uploadPath.mkdirs();
			}
			
			// 4. 최종 저장 파일 객체
			File dest = new File(uploadPath, fileName);

			log.info("이미지 저장 시도: {}", dest.getAbsolutePath()); // 로그로 실제 저장 위치 확인 가능

			// 5. 파일 저장 (덮어쓰기)
			file.transferTo(dest);
			
			Map<String, String> res = new HashMap<>();
			res.put("message", "이미지가 성공적으로 변경되었습니다.");
			
			return ResponseEntity.ok(res);

		} catch (IOException e) {
			log.error("이미지 파일 저장 실패", e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("이미지 저장 중 오류가 발생했습니다.");
		}
	}
	
	/**
     * 관리자 - 안전 정보 목록 조회
     */
    @GetMapping("/safetyInfo")
    public ResponseEntity<Map<String, Object>> getAlertList(
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "type", required = false) String type,
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "sortColumn", defaultValue = "alertId") String sortColumn,
            @RequestParam(value = "sortOrder", defaultValue = "desc") String sortOrder) {

        log.info("[관리자] 안전 정보 목록 조회 - page: {}", page);

        try {
            Map<String, Object> searchMap = new HashMap<>();
            if (keyword != null && !keyword.trim().isEmpty()) {
                searchMap.put("type", type);
                searchMap.put("keyword", keyword);
            }
            searchMap.put("sortColumn", sortColumn);
            searchMap.put("sortOrder", sortOrder);

            int totalCount = safetyService.selectAlertListCount(searchMap);
            PageInfo pi = Pagination.getPageInfo(page, totalCount);
            List<SafetyAlert> list = safetyService.selectAlertList(pi, searchMap);

            Map<String, Object> response = new HashMap<>();
            response.put("list", list);
            response.put("pi", pi);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("[관리자] 안전 정보 목록 조회 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "목록을 불러오는 데 실패했습니다."));
        }
    }

    /**
     * 관리자 - 안전 정보 상세 조회
     */
    @GetMapping("/safetyInfo/detail/{alertId}")
    public ResponseEntity<?> getAlertDetail(@PathVariable("alertId") int alertId) {
        
        log.info("[관리자] 안전 정보 상세 조회 - alertId: {}", alertId);

        try {
            SafetyAlert alert = safetyService.selectAlertDetail(alertId);

            if (alert == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "해당 안전 정보를 찾을 수 없습니다."));
            }

            return ResponseEntity.ok(alert);

        } catch (Exception e) {
            log.error("[관리자] 안전 정보 상세 조회 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "데이터를 불러오는 데 실패했습니다."));
        }
    }

    /**
     * 관리자 - 안전 정보 등록
     */
    @PostMapping("/safetyInfo/register")
    public ResponseEntity<?> registerAlert(@RequestBody SafetyAlert alert) {
        
        log.info("[관리자] 안전 정보 등록 - title: {}", alert.getTitle());

        try {
            int result = safetyService.insertAlert(alert);

            if (result > 0) {
                return ResponseEntity.status(HttpStatus.CREATED)
                        .body(Map.of("message", "등록되었습니다."));
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("error", "등록에 실패했습니다."));
            }

        } catch (Exception e) {
            log.error("[관리자] 안전 정보 등록 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "등록 중 오류가 발생했습니다."));
        }
    }

    /**
     * 관리자 - 안전 정보 수정
     */
    @PutMapping("/safetyInfo/update/{alertId}")
    public ResponseEntity<?> updateAlert(
            @PathVariable("alertId") int alertId,
            @RequestBody SafetyAlert alert) {
        
        log.info("[관리자] 안전 정보 수정 - alertId: {}", alertId);

        try {
            alert.setAlertId(alertId);
            int result = safetyService.updateAlert(alert);

            if (result > 0) {
                return ResponseEntity.ok(Map.of("message", "수정되었습니다."));
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("error", "수정에 실패했습니다."));
            }

        } catch (Exception e) {
            log.error("[관리자] 안전 정보 수정 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "수정 중 오류가 발생했습니다."));
        }
    }

    /**
     * 관리자 - 안전 정보 삭제 (다중 삭제)
     */
    @DeleteMapping("/safetyInfo/delete")
    public ResponseEntity<?> deleteAlerts(@RequestBody Map<String, List<Integer>> request) {
        
        List<Integer> alertIds = request.get("alertIds");
        log.info("[관리자] 안전 정보 삭제 - alertIds: {}", alertIds);

        try {
            int result = safetyService.deleteAlerts(alertIds);

            if (result > 0) {
                return ResponseEntity.ok(Map.of("message", result + "건이 삭제되었습니다."));
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("error", "삭제에 실패했습니다."));
            }

        } catch (Exception e) {
            log.error("[관리자] 안전 정보 삭제 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "삭제 중 오류가 발생했습니다."));
        }
    }
}