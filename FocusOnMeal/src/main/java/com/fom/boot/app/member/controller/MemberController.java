package com.fom.boot.app.member.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fom.boot.app.jwt.JwtTokenProvider;
import com.fom.boot.app.member.dto.LoginRequest;
import com.fom.boot.app.member.dto.LoginResponse;
import com.fom.boot.domain.member.model.service.MemberService;
import com.fom.boot.domain.member.model.vo.Member;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("member")
public class MemberController {

	private final BCryptPasswordEncoder bcrypt;
	private final MemberService mService;
	private final JwtTokenProvider jwtTokenProvider;

	@PostMapping("login")
	public ResponseEntity<?> checkLogin(@RequestBody LoginRequest loginRequest) {
		try {
			Member loginMember = mService.selectOneByLogin(loginRequest);

			// 회원 정보 검증
			if(loginMember == null || "N".equals(loginMember.getStatusYn())) {
				return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
					.body("회원정보가 없습니다.");
			}

			// 비밀번호 검증
			if(!bcrypt.matches(loginRequest.getMemberPw(), loginMember.getMemberPw())) {
				return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
					.body("비밀번호가 일치하지 않습니다.");
			}

			// JWT 토큰 생성
			String token = jwtTokenProvider.createToken(loginMember.getMemberId());

			// 로그인 응답 생성
			LoginResponse response = new LoginResponse(
				token,
				loginMember.getMemberId(),
				loginMember.getMemberName(),
				loginMember.getAdminYn()
			);

			return ResponseEntity.ok(response);

		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.body("서버 오류가 발생했습니다: " + e.getMessage());
		}
	}
	
	
	
	@PostMapping("form")
	public String sigupFormPage() {
		return "member/join";
	}
	
	@PostMapping("join")
	public String joinMember(@ModelAttribute Member member, Model model) {
		try {
			member.setMemberPw(bcrypt.encode(member.getMemberPw()));
			int result = mService.insertMember(member);
			return "redirect:/member/login";
		} catch (Exception e) {
			model.addAttribute("errorMsg", e.getMessage());
			return "common/error";
		}
	}

}
