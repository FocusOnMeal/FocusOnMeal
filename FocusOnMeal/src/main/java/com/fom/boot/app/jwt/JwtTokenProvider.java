package com.fom.boot.app.jwt;

import java.security.Key;
import java.util.Date;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import com.fom.boot.app.security.CustomUserDetailsService;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;

@Slf4j // private Logger log 처럼 필드에 생성하지 않고 log를 사용할 수 있음. import를 해서 lombok.slf4j가 생겨야함.(필드는 변수명을 바꿀 수 있지만 slf4j의 변수명은 무조건 log)
@Component
public class JwtTokenProvider {
	
	private final Key key; 	// JWT 서명에 사용할 비밀키
    private final long accessTokenValidityInMilliseconds; 	// 토큰 유효시간
    private final CustomUserDetailsService customUserDetailsService; // 사용자 정보 조회(토큰에서 추출한 username으로 DB에서 사용자 정보 가져옴)

    public JwtTokenProvider( // 생성자
            @Value("${jwt.secret}") String secretKey, // application.properties에서 값을 주입받음(비밀키)
            @Value("${jwt.expiration-time}") long expirationTime, // (토큰 유효시간)
            CustomUserDetailsService customUserDetailsService) {
        
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);	// Base64로 인코딩된 문자열을 바이트 배열로 디코딩
        this.key = Keys.hmacShaKeyFor(keyBytes);	// HMAC-SHA 알고리즘용 Key 객체 생성
        this.accessTokenValidityInMilliseconds = expirationTime;
        this.customUserDetailsService = customUserDetailsService;
    }

    // 1. 인증 정보(Authentication)로 토큰 생성
    public String generateToken(Authentication authentication) {
        String username = authentication.getName();
        Date now = new Date();
        Date validity = new Date(now.getTime() + this.accessTokenValidityInMilliseconds);

        return Jwts.builder()
            .setSubject(username) // 토큰 주체 (사용자 ID)
            .setIssuedAt(now) // 발급 시간
            .setExpiration(validity) // 만료 시간
            .signWith(key, SignatureAlgorithm.HS256) // 암호화 알고리즘
            .compact();
    }

    // 1-1. username(memberId)로 직접 토큰 생성
    public String createToken(String username) {
        Date now = new Date();
        Date validity = new Date(now.getTime() + this.accessTokenValidityInMilliseconds);

        return Jwts.builder()
            .setSubject(username) // 토큰 주체 (사용자 ID)
            .setIssuedAt(now) // 발급 시간
            .setExpiration(validity) // 만료 시간
            .signWith(key, SignatureAlgorithm.HS256) // 암호화 알고리즘
            .compact();
    }

    // 2. 토큰에서 인증 정보(Authentication) 조회
    public Authentication getAuthentication(String token) {
        Claims claims = Jwts.parserBuilder()
            .setSigningKey(key)
            .build()
            .parseClaimsJws(token)
            .getBody();

        // CustomUserDetailsService를 통해 UserDetails 조회
        UserDetails userDetails = customUserDetailsService.loadUserByUsername(claims.getSubject());
        
        return new UsernamePasswordAuthenticationToken(userDetails, "", userDetails.getAuthorities());
    }

    // 3. 토큰 유효성 검증
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            log.warn("Invalid JWT token: {}", e.getMessage());
            return false;
        }
    }
}
