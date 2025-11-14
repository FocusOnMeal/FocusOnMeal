package com.fom.boot.domain.member.model.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class EmailService {
    
    @Autowired
    private JavaMailSender mailSender;
    
    /**
     * 서버 도메인 (application.properties에서 설정)
     * 예: http://localhost:8080 또는 https://focusonmale.com
     */
    @Value("${app.domain:http://localhost:8080}")
    private String appDomain;
    
    /**
     * 비밀번호 재설정 이메일 발송
     * 
     * @param toEmail 수신자 이메일
     * @param memberId 회원 ID
     * @param token 재설정 토큰
     * @throws RuntimeException 이메일 발송 실패 시
     */
    public void sendPasswordResetEmail(String toEmail, String memberId, String token) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setTo(toEmail);
            helper.setSubject("[FocusOnMale] 비밀번호 재설정 안내");
            helper.setFrom("noreply@focusonmale.com"); // 발신자 주소
            
            // 재설정 링크 생성
            String resetLink = appDomain + "/member/resetPassword?token=" + token;
            
            // HTML 이메일 내용 생성
            String content = buildPasswordResetEmailHtml(memberId, resetLink);
            helper.setText(content, true); // true = HTML 형식
            
            // 이메일 발송
            mailSender.send(message);
            
            log.info("비밀번호 재설정 이메일 발송 성공: memberId={}, email={}", memberId, toEmail);
            
        } catch (Exception e) {
            log.error("비밀번호 재설정 이메일 발송 실패: memberId={}, email={}, error={}", 
                     memberId, toEmail, e.getMessage());
            throw new RuntimeException("이메일 발송에 실패했습니다: " + e.getMessage());
        }
    }
    
    /**
     * 비밀번호 재설정 이메일 HTML 생성
     */
    private String buildPasswordResetEmailHtml(String memberId, String resetLink) {
        return "<!DOCTYPE html>" +
                "<html>" +
                "<head>" +
                "    <meta charset='UTF-8'>" +
                "    <style>" +
                "        body { font-family: 'Malgun Gothic', Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }" +
                "        .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }" +
                "        .header { background-color: #2563eb; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }" +
                "        .header h1 { color: #ffffff; margin: 0; font-size: 24px; }" +
                "        .content { padding: 40px 30px; }" +
                "        .content p { color: #374151; line-height: 1.6; margin: 10px 0; }" +
                "        .button-container { text-align: center; margin: 30px 0; }" +
                "        .button { display: inline-block; padding: 14px 32px; background-color: #2563eb; color: #ffffff !important; " +
                "                  text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; }" +
                "        .button:hover { background-color: #1d4ed8; }" +
                "        .notice { background-color: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #f59e0b; }" +
                "        .notice p { color: #92400e; margin: 5px 0; font-size: 14px; }" +
                "        .footer { background-color: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; }" +
                "        .footer p { color: #6b7280; margin: 5px 0; font-size: 12px; }" +
                "    </style>" +
                "</head>" +
                "<body>" +
                "    <div class='container'>" +
                "        <div class='header'>" +
                "            <h1>🔐 비밀번호 재설정</h1>" +
                "        </div>" +
                "        <div class='content'>" +
                "            <p>안녕하세요, <strong>" + memberId + "</strong>님</p>" +
                "            <p>FocusOnMale에서 비밀번호 재설정을 요청하셨습니다.</p>" +
                "            <p>아래 버튼을 클릭하여 새로운 비밀번호를 설정해주세요.</p>" +
                "            <div class='button-container'>" +
                "                <a href='" + resetLink + "' class='button'>비밀번호 재설정하기</a>" +
                "            </div>" +
                "            <div class='notice'>" +
                "                <p><strong>⚠️ 중요 안내</strong></p>" +
                "                <p>• 이 링크는 <strong>1시간 동안만</strong> 유효합니다.</p>" +
                "                <p>• 링크는 <strong>1회만</strong> 사용 가능합니다.</p>" +
                "                <p>• 비밀번호 재설정을 요청하지 않으셨다면 이 메일을 무시해주세요.</p>" +
                "            </div>" +
                "            <p style='color: #6b7280; font-size: 14px; margin-top: 30px;'>" +
                "                버튼이 작동하지 않는 경우 아래 링크를 복사하여 브라우저에 붙여넣으세요:<br>" +
                "                <a href='" + resetLink + "' style='color: #2563eb; word-break: break-all;'>" + resetLink + "</a>" +
                "            </p>" +
                "        </div>" +
                "        <div class='footer'>" +
                "            <p>FocusOnMale</p>" +
                "            <p>본 메일은 발신전용입니다. 문의사항은 고객센터를 이용해주세요.</p>" +
                "        </div>" +
                "    </div>" +
                "</body>" +
                "</html>";
    }
    
    /**
     * 아이디 찾기 이메일 발송
     * 
     * @param toEmail 수신자 이메일
     * @param memberName 회원 이름
     * @param memberId 회원 ID (일부 마스킹)
     */
    public void sendMemberIdEmail(String toEmail, String memberName, String memberId) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setTo(toEmail);
            helper.setSubject("[FocusOnMale] 아이디 찾기 결과");
            helper.setFrom("noreply@focusonmale.com");
            
            // 아이디 마스킹
            String maskedId = maskMemberId(memberId);
            
            // HTML 이메일 내용 생성
            String content = buildMemberIdEmailHtml(memberName, maskedId);
            helper.setText(content, true);
            
            // 이메일 발송
            mailSender.send(message);
            
            log.info("아이디 찾기 이메일 발송 성공: name={}, email={}", memberName, toEmail);
            
        } catch (Exception e) {
            log.error("아이디 찾기 이메일 발송 실패: name={}, email={}, error={}", 
                     memberName, toEmail, e.getMessage());
            throw new RuntimeException("이메일 발송에 실패했습니다: " + e.getMessage());
        }
    }
    
    /**
     * 아이디 찾기 이메일 HTML 생성
     */
    private String buildMemberIdEmailHtml(String memberName, String maskedId) {
        String loginLink = appDomain + "/member/login";
        
        return "<!DOCTYPE html>" +
                "<html>" +
                "<head>" +
                "    <meta charset='UTF-8'>" +
                "    <style>" +
                "        body { font-family: 'Malgun Gothic', Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }" +
                "        .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }" +
                "        .header { background-color: #2563eb; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }" +
                "        .header h1 { color: #ffffff; margin: 0; font-size: 24px; }" +
                "        .content { padding: 40px 30px; text-align: center; }" +
                "        .content p { color: #374151; line-height: 1.6; margin: 10px 0; }" +
                "        .id-box { background-color: #f3f4f6; padding: 30px; margin: 30px 0; border-radius: 8px; }" +
                "        .id-box p { font-size: 28px; font-weight: bold; color: #1f2937; margin: 0; letter-spacing: 2px; }" +
                "        .button { display: inline-block; padding: 14px 32px; background-color: #2563eb; color: #ffffff !important; " +
                "                  text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; margin-top: 20px; }" +
                "        .button:hover { background-color: #1d4ed8; }" +
                "        .notice { color: #6b7280; font-size: 14px; margin-top: 20px; }" +
                "        .footer { background-color: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; }" +
                "        .footer p { color: #6b7280; margin: 5px 0; font-size: 12px; }" +
                "    </style>" +
                "</head>" +
                "<body>" +
                "    <div class='container'>" +
                "        <div class='header'>" +
                "            <h1>🔍 아이디 찾기 결과</h1>" +
                "        </div>" +
                "        <div class='content'>" +
                "            <p>안녕하세요, <strong>" + memberName + "</strong>님</p>" +
                "            <p>회원님의 아이디는 다음과 같습니다.</p>" +
                "            <div class='id-box'>" +
                "                <p>" + maskedId + "</p>" +
                "            </div>" +
                "            <p class='notice'>" +
                "                * 보안을 위해 아이디 일부가 가려져 있습니다.<br>" +
                "                전체 아이디는 로그인 페이지에서 확인 가능합니다." +
                "            </p>" +
                "            <a href='" + loginLink + "' class='button'>로그인 페이지로 이동</a>" +
                "        </div>" +
                "        <div class='footer'>" +
                "            <p>FocusOnMale</p>" +
                "            <p>본 메일은 발신전용입니다. 문의사항은 고객센터를 이용해주세요.</p>" +
                "        </div>" +
                "    </div>" +
                "</body>" +
                "</html>";
    }
    
    /**
     * 아이디 마스킹 처리
     * 예: "focusonmale" → "foc*******"
     */
    private String maskMemberId(String memberId) {
        if (memberId == null || memberId.length() < 3) {
            return memberId;
        }
        
        int length = memberId.length();
        int visibleChars = Math.max(3, length / 3); // 최소 3자는 보이게
        
        String visible = memberId.substring(0, visibleChars);
        String masked = "*".repeat(length - visibleChars);
        
        return visible + masked;
    }
}
