import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Header.css";
import logo from "../../../../webapp/resources/images/headerLogo.png";
import { Bell } from "lucide-react";

const Header = () => {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [memberNickname, setMemberNickname] = useState("");
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [hasUnread, setHasUnread] = useState(false);
    const [activeTab, setActiveTab] = useState("위험공표"); // 탭 상태 추가

    // ✅ 수정: localStorage → sessionStorage
    useEffect(() => {
        const checkLogin = () => {
            const token = sessionStorage.getItem("token");
            const nickname = sessionStorage.getItem("memberNickname");

            if (token) {
                setIsLoggedIn(true);
                setMemberNickname(nickname || "");
                fetchNotifications();
            } else {
                setIsLoggedIn(false);
            }
        };

        checkLogin();
        window.addEventListener("loginStateChange", checkLogin);

        return () => {
            window.removeEventListener("loginStateChange", checkLogin);
        };
    }, []);

    // ✅ 수정: localStorage → sessionStorage
    const handleNotificationClick = async (notification) => {
        try {
            const token = sessionStorage.getItem("token");
            
            await fetch(`/api/alert/notifications/${notification.notificationId}/read`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            navigate(`/board/safety/detail/${notification.notificationId}`);
            setShowNotifications(false);
        } catch (error) {
            console.error("알림 처리 실패:", error);
        }
    };

    const handleBellClick = () => {
        if (!isLoggedIn) {
            setShowNotifications(true);
        } else {
            setShowNotifications(!showNotifications);
            if (!showNotifications) {
                fetchNotifications();
            }
        }
    };

    // ✅ 수정: localStorage → sessionStorage
    const handleLogout = () => {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("memberId");
        sessionStorage.removeItem("memberName");
        sessionStorage.removeItem("memberNickname");
        sessionStorage.removeItem("adminYn");

        setIsLoggedIn(false);
        navigate("/");
    };

    const getTypeLabel = (type) => {
        return type === "위험공표" ? "위험공표" : "가격정보";
    };

    const formatTime = (sentAt) => {
        const date = new Date(sentAt);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        
        if (diffMins < 1) return "방금 전";
        if (diffMins < 60) return `${diffMins}분 전`;
        
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}시간 전`;
        
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays}일 전`;
    };

    // ✅ 수정: localStorage → sessionStorage
    const fetchNotifications = async () => {
        try {
            const token = sessionStorage.getItem("token");
            console.log("🔍 Token:", token);
            
            const response = await fetch("/api/alert/notifications", {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            console.log("📡 Response status:", response.status);

            if (response.ok) {
                const data = await response.json();
                console.log("📦 받은 데이터:", data);
                console.log("📦 데이터 길이:", data.length);
                
                setNotifications(data);
                setHasUnread(data.some(n => n.isRead === 'N'));
            } else {
                console.error("❌ 응답 실패:", response.status);
            }
        } catch (error) {
            console.error("❌ 알림 조회 실패:", error);
        }
    };

    return (
        <header className="header">
            <div className="header-inner">
                <div className="logo-area">
                    <Link to="/">
                        <img src={logo} alt="FocusOnMeal" className="logo-img" />
                    </Link>
                </div>

                <nav className="nav">
                    <ul className="nav-menu">
                        <li className="dropdown">
                            <Link to="/ingredient/list">식재료</Link>
                            <ul className="dropdown-menu">
                                <li><Link to="/ingredient/list">식재료 목록</Link></li>
                                <li><Link to="/mypage/customIngredients">커스텀 식재료</Link></li>
                            </ul>
                        </li>
                        <li><Link to="/meal/mealAI">식단</Link></li>
                        <li><Link to="/board/safety/list">안전정보</Link></li>
                        <li><Link to="/board/notice/list">공지사항</Link></li>
                    </ul>
                </nav>

                <div className="user-area">
                    {isLoggedIn ? (
                        <>
                            <span className="welcome">{memberNickname}님</span>
                            <div className="notification-bell-wrapper">
                                <button 
                                    className="notification-bell-button"
                                    onClick={handleBellClick}
                                >
                                    <Bell size={24} color="#333" />
                                    {hasUnread && <span className="notification-unread-dot"></span>}
                                </button>

                                {showNotifications && (
                                    <div className="notification-dropdown">
                                        {!isLoggedIn ? (
                                            <div className="notification-login-required">
                                                <p>로그인이 필요합니다.</p>
                                                <Link to="/member/login" className="login-link">로그인하기</Link>
                                            </div>
                                        ) : (
                                            <>
                                                {/* 탭 헤더 */}
                                                <div className="notification-tabs">
                                                    <button
                                                        className={`notification-tab ${activeTab === '위험공표' ? 'active' : ''}`}
                                                        onClick={() => setActiveTab('위험공표')}
                                                    >
                                                        위험공표
                                                    </button>
                                                    <button
                                                        className={`notification-tab ${activeTab === '가격정보' ? 'active' : ''}`}
                                                        onClick={() => setActiveTab('가격정보')}
                                                    >
                                                        가격정보
                                                    </button>
                                                </div>

                                                {/* 탭 콘텐츠 */}
                                                <div className="notification-content">
                                                    {notifications.filter(n => n.type === activeTab).length === 0 ? (
                                                        <div className="notification-empty">알림이 없습니다.</div>
                                                    ) : (
                                                        notifications
                                                            .filter(n => n.type === activeTab)
                                                            .map((notif) => (
                                                                <div
                                                                    key={notif.notificationId}
                                                                    className={`notification-item ${notif.isRead === 'N' ? 'unread' : ''}`}
                                                                    onClick={() => handleNotificationClick(notif)}
                                                                    onMouseEnter={(e) => e.currentTarget.classList.add('hover')}
                                                                    onMouseLeave={(e) => e.currentTarget.classList.remove('hover')}
                                                                >
                                                                    <div className="notification-item-header">
                                                                        <span className={`notification-type ${notif.type === '위험공표' ? 'danger' : 'normal'}`}>
                                                                            {getTypeLabel(notif.type)}
                                                                        </span>
                                                                        <span className="notification-time">{formatTime(notif.sentAt)}</span>
                                                                    </div>

                                                                    <div className={`notification-title ${notif.isRead === 'N' ? 'bold' : ''}`}>
                                                                        {notif.title}
                                                                    </div>

                                                                    <div className="notification-message">
                                                                        {notif.message}
                                                                    </div>
                                                                </div>
                                                            ))
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                            <Link to="/mypage" className="mypage">마이페이지</Link>
                            <span className="slash">/</span>
                            <button onClick={handleLogout} className="logout">로그아웃</button>
                        </>
                    ) : (
                        <>
                            <Link to="/member/login" className="login">로그인</Link>
                            <span className="slash">/</span>
                            <Link to="/member/form" className="form">회원가입</Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;