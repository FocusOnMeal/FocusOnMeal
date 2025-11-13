import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Header.css"
import logo from "../../../../webapp/resources/images/headerLogo.png";

const Header = () => {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [memberNickname, setMemberNickname] = useState("");

    // 로그인 상태 확인
    useEffect(() => {
    const checkLogin = () => {
        const token = localStorage.getItem("token");
        const nickname = localStorage.getItem("memberNickname");

        if (token) {
        setIsLoggedIn(true);
        setMemberNickname(nickname || "");
        } else {
        setIsLoggedIn(false);
        }
    };

    // 컴포넌트 처음 로드 시 체크
    checkLogin();

    // 로그인 상태 변경 이벤트 받기
    window.addEventListener("loginStateChange", checkLogin);

    // cleanup
    return () => {
        window.removeEventListener("loginStateChange", checkLogin);
    };
    }, []);

    // 로그아웃 기능
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("memberId");
        localStorage.removeItem("memberName");
        localStorage.removeItem("memberNickname");
        localStorage.removeItem("adminYn");

        setIsLoggedIn(false);
        navigate("/");
    };

    return (
        <header className="header">
            <div className="header-inner">

                {/* 로고 */}
                <div className="logo-area">
                    <Link to="/">
                        <img src={logo} alt="FocusOnMeal" className="logo-img" />
                    </Link>
                </div>

                {/* 메뉴 */}
                <nav className="nav">
                <ul className="nav-menu">
                    <li className="dropdown">
                    <Link to="/ingredient/list">식자재</Link>
                        <ul className="dropdown-menu">
                            <li><Link to="/ingredient/list">식자재 목록</Link></li>
                            <li><Link to="/mypage/customIngredients">커스텀 식자재</Link></li>
                        </ul>
                    </li>
                    <li><Link to="/meal/mealAI">식단</Link></li>
                    <li><Link to="/board/safety/list">안전정보</Link></li>
                    <li><Link to="/board/notice/list">공지사항</Link></li>
                </ul>
                </nav>

                {/* 로그인 상태에 따라 헤더 변경 */}
                <div className="user-area">
                    {isLoggedIn ? (
                    <>
                        <span className="welcome">{memberNickname}님</span>
                        <Link to="/mypage" className="mypage">
                            마이페이지
                        </Link>
                        <span className="slash">/</span>
                        <button onClick={handleLogout} className="logout">
                            로그아웃
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/member/login" className="login">
                            로그인
                        </Link>
                        <span className="slash">/</span>
                        <Link to="/member/join" className="join">
                            회원가입
                        </Link>
                    </>
                )}
                </div>
            </div>
            {/* <div className="header-line"></div> */}
        </header>
    );
};

export default Header;
