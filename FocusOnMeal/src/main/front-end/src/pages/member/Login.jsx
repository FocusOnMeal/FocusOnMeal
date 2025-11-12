import React, {useEffect} from "react";

const Login = () => {
    useEffect(() => {
        const beforeURLInput = document.getElementsByName('beforeURL')[0];
        if(beforeURLInput) {
            beforeURLInput.value = document.referrer;
        }
    }, [])

    return (
        <div id="container">``
            <main id="main">
                <div className="login-container">
                    <div className="login-title">
                        <h2>로그인</h2>
                    </div>
                    <form className="login-form" action="/member/login" method="post">
                        <div className="form-group">
                            <label htmlFor="memberIdInput">아이디</label>
                            <input 
                            type="text"
                            name="memberId"
                            id="memberIdInput"
                            placeholder="아이디를 입력하세요."
                            required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="memberPwInput">비밀번호</label>
                            <input 
                            type="password"
                            name="memberPw"
                            id="memberPwInput"
                            placeholder="비밀번호를 입력하세요."
                            required />
                        </div>
                        {/* <input type="text" /> */}
                        <button type="submit">로그인</button>
                    </form>
                    <div className="login-links">
                        <a href="#">아이디 찾기</a>
                        <a href="#">비밀번호 찾기</a>
                        <a href="#">회원가입</a>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default Login;