import { Link } from "react-router-dom";
import "./Header.css"
import logo from "../../../../webapp/resources/images/headerLogo.png";

const Header = () => {
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

                {/* 로그인 / 회원가입 */}
                <div className="user-area">
                    <Link to="/member/login" className="login">로그인</Link>
                    <span className="slash">/</span>
                    <Link to="/member/join" className="join">회원가입</Link>
                </div>
            </div>

            {/* <div className="header-line"></div> */}
        </header>
    );
};

export default Header;
