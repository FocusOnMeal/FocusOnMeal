package com.fom.boot.app.member.controller;

import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import com.fom.boot.app.member.dto.LoginRequest;
import com.fom.boot.domain.member.model.service.MemberService;
import com.fom.boot.domain.member.model.vo.Member;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
@RequestMapping("member")
public class MemberController {
	
	private final BCryptPasswordEncoder bcrypt;
	private final MemberService mService;
	
	@GetMapping("login")
	public String showLoginPage() {
		return "member/login";
	}
	
	@PostMapping("login")
	public String checkLogin(
			@ModelAttribute LoginRequest member
			, HttpSession session
			, Model model) {
		try {
			Member loginMember = mService.selectOneByLogin(member);
			if(loginMember == null || "N".equals(loginMember.getStatusYn())) {
				model.addAttribute("msg", "회원정보가 없습니다.");
				model.addAttribute("url", "/member/login");
				return "common/alert";
			}
			if(bcrypt.matches(member.getMemberPw(), loginMember.getMemberPw())) {
				session.setAttribute("loginMember", loginMember);
				session.setAttribute("adminYn", loginMember.getAdminYn());
				
				String adminYn = (String) session.getAttribute("adminYn");
				System.out.println("로그인 멤버 관리자 여부: " + adminYn);
				if(loginMember.getAdminYn().equals("Y")) {
					return "admin";
				}else {
					model.addAttribute("errorMsg", "데이터가 없습니다.");
					return "redirect:/";
				}
			}else {
				model.addAttribute("errorMsg", "데이터가 없습니다.");
				return "common/error";
			}
		} catch (Exception e) {
			e.printStackTrace();
			model.addAttribute("errorMsg", e.getMessage());
			return "common/error";
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
			int resutl = mService.insertMember(member);
			return "redirect:/member/login";
		} catch (Exception e) {
			model.addAttribute("errorMsg", e.getMessage());
			return "common/error";
		}
	}

}
