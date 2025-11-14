import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const [memberId, setMemberId] = useState('');
    const [memberPw, setMemberPw] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch('/member/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    memberId: memberId,
                    memberPw: memberPw
                })
            });

            if (response.ok) {
                const data = await response.json();

                // JWT 토큰 및 사용자 정보 저장
                localStorage.setItem('token', data.token);
                localStorage.setItem('memberId', data.memberId);
                localStorage.setItem('memberName', data.memberName);
                localStorage.setItem('adminYn', data.adminYn);
                localStorage.setItem("memberNickname", data.memberNickname);

                // 로그인 상태 변경 이벤트 발생 (로그인 시 바로 변경된 상태를 확인해 헤더 상태를 변경할 수 있게 함)
                window.dispatchEvent(new Event("loginStateChange"));

                // 관리자 여부에 따라 페이지 이동
                if (data.adminYn === 'Y') {
                    navigate('/admin');
                } else {
                    navigate('/');
                }
            } else {
                const errorText = await response.text();
                setError(errorText || '로그인에 실패했습니다.');
            }
        } catch (err) {
            console.error('로그인 오류:', err);
            setError('서버와의 통신 중 오류가 발생했습니다.');
        }
    };

    return (
        <div id="container">
            <main id="main">
                <div className="login-container">
                    <div className="login-title">
                        <h2>로그인</h2>
                    </div>
                    <form className="login-form" onSubmit={handleSubmit}>
                        {error && <div style={{color: 'red', marginBottom: '10px'}}>{error}</div>}
                        <div className="form-group">
                            <label htmlFor="memberIdInput">아이디</label>
                            <input
                                type="text"
                                name="memberId"
                                id="memberIdInput"
                                placeholder="아이디를 입력하세요."
                                value={memberId}
                                onChange={(e) => setMemberId(e.target.value)}
                                required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="memberPwInput">비밀번호</label>
                            <input
                                type="password"
                                name="memberPw"
                                id="memberPwInput"
                                placeholder="비밀번호를 입력하세요."
                                value={memberPw}
                                onChange={(e) => setMemberPw(e.target.value)}
                                required />
                        </div>
                        <button type="submit">로그인</button>
                    </form>
                    <div className="login-links">
                        <a href="#">아이디 찾기</a>
                        <a href="#">비밀번호 찾기</a>
                        <a href="/member/join">회원가입</a>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default Login;