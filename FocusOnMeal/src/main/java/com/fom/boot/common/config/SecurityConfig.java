package com.fom.boot.common.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.fom.boot.app.jwt.JwtAuthenticationFilter;
import com.fom.boot.app.jwt.JwtTokenProvider;

import lombok.RequiredArgsConstructor;

@Configuration // 스프링의 설정 클래스임을 나타내는 어노테이션
@EnableWebSecurity // 스프링 시큐리티 설정을 활성화하는 어노테이션
@RequiredArgsConstructor
public class SecurityConfig {
	
	private final JwtTokenProvider jwtTokenProvider;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // CSRF 비활성화 (JWT 사용 시)
            .httpBasic(httpBasic -> httpBasic.disable()) // HTTP Basic 인증 비활성화
            .formLogin(formLogin -> formLogin.disable()) // 폼 로그인 비활성화
            
            // 세션 정책을 STATELESS로 설정 (세션 사용 안 함)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            
            .authorizeHttpRequests(authz -> authz
                // 리소스 접근 권한 설정
                .requestMatchers("/", "/css/**", "/js/**", "/images/**", "/assets/**", "/resources/**").permitAll()

                // 로그인/회원가입 API 경로 허용
                .requestMatchers("/member/login", "/member/join").permitAll()
                .requestMatchers("/api/member/login", "/api/member/join").permitAll()

                // 식단 페이지 허용
                .requestMatchers("/meal/**").permitAll()

                // API 테스트 경로 허용
                .requestMatchers("/api/test/**").permitAll()

                // 채팅 API 경로 허용 (가격 정보 없이 테스트 가능)
                .requestMatchers("/api/chat/**").permitAll()
                
                // Actuator 경로는 모두 허용
                .requestMatchers("/actuator/**", "/actuator/prometheus", "/favicon.ico").permitAll()
                
                .requestMatchers("/api/admin/**").hasRole("ADMIN") // /api/admin/ 경로는 ADMIN 권한 필요
                .anyRequest().authenticated() // 그 외 모든 요청은 인증 필요
            )
            
            // JwtAuthenticationFilter를 UsernamePasswordAuthenticationFilter 앞에 추가
            .addFilterBefore(new JwtAuthenticationFilter(jwtTokenProvider), 
                             UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // 비밀번호 암호화 BCryptPasswordEncoder Bean 등록
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // AuthenticationManager Bean 등록 (로그인 시 사용)
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

	
	@Bean
	public BCryptPasswordEncoder getPasswordEncoder() {
		return new BCryptPasswordEncoder();
	}

}
