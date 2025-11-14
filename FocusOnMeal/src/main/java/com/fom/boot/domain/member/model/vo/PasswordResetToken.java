package com.fom.boot.domain.member.model.vo;

import java.sql.Timestamp;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class PasswordResetToken {
	private Long tokenId;
	private String memberId;
	private String token;
	private Timestamp expireDate;
	private String usedYn;
	private String ipAddress;
	private String userAgent;
	private Timestamp createdDate;
	private Timestamp usedDate;
	
	public boolean isExpired() {
		if(expireDate == null) {
			return true;
		}
		return expireDate.before(new Timestamp(System.currentTimeMillis()));
	}
		
		/**
	     * 토큰이 사용되었는지 확인
	     * @return true: 사용됨, false: 미사용
	     */
	    public boolean isUsed() {
	        return "Y".equals(usedYn);
	    }
	    
	    /**
	     * 토큰이 유효한지 확인 (만료되지 않고 미사용)
	     * @return true: 유효함, false: 유효하지 않음
	     */
	    public boolean isValid() {
	        return !isExpired() && !isUsed();
	    }
	    
	    /**
	     * 토큰 정보를 보안상 안전하게 출력 (토큰 값 마스킹)
	     */
	    @Override
	    public String toString() {
	        String maskedToken = token != null && token.length() > 8 
	            ? token.substring(0, 8) + "****" 
	            : "****";
	            
	        return "PasswordResetToken{" +
	                "tokenId=" + tokenId +
	                ", memberId='" + memberId + '\'' +
	                ", token='" + maskedToken + '\'' +
	                ", expireDate=" + expireDate +
	                ", usedYn='" + usedYn + '\'' +
	                ", ipAddress='" + ipAddress + '\'' +
	                ", createdDate=" + createdDate +
	                ", usedDate=" + usedDate +
	                '}';
	    }
	}
