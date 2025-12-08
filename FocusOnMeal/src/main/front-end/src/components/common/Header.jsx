import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Header.css";
import logo from "../../../../webapp/resources/images/headerLogo.png";
import { Bell } from "lucide-react";

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [memberNickname, setMemberNickname] = useState("");
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [hasUnread, setHasUnread] = useState(false);
    const [activeTab, setActiveTab] = useState("위험공표"); // 탭 상태 추가
    const [adminYn, setadminYn] = useState(false);

    const [unreadCount, setUnreadCount] = useState({
        위험공표: 0,
        가격정보: 0
    });


    // 페이지 이동 시 알림탭 닫기
    useEffect(() => {
        setShowNotifications(false);
    }, [location.pathname]);

    // ✅ 수정: localStorage → sessionStorage
    useEffect(() => {
        const checkLogin = () => {
            const token = sessionStorage.getItem("token");
            const nickname = sessionStorage.getItem("memberNickname");
            const adminCheck = sessionStorage.getItem("adminYn");

            if (token) {
                setIsLoggedIn(true);
                setMemberNickname(nickname || "");
                setadminYn(adminCheck === "Y");
                fetchNotifications();
            } else {
                setIsLoggedIn(false);
                setMemberNickname("");
                setadminYn(false);
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
        console.log("📦 클릭한 알림 전체 데이터:", JSON.stringify(notification, null, 2));
    
        try {
            const token = sessionStorage.getItem("token");
            
            await fetch(`/api/alert/notifications/${notification.notificationId}/read`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (notification.type === "위험공표") {
                if (notification.alertId) {
                    console.log("✅ 위험공표 페이지 이동:", notification.alertId);
                    navigate(`/board/safety/detail/${notification.alertId}`);
                } else {
                    console.error("❌ alertId가 없습니다. 메시지:", notification.message);
                    alert("해당 알림의 상세 정보를 찾을 수 없습니다.");
                }
            } else if (notification.type === "가격정보" || notification.type === "가격변동") {
                // 가격정보(일일 변동) + 가격변동(지정가 도달) 모두 처리
                if (notification.ingredientId) {
                    console.log("✅ 식재료 페이지 이동:", notification.ingredientId);
                    navigate(`/ingredient/detail/${notification.ingredientId}`);
                } else {
                    console.error("❌ ingredientId가 없습니다. 메시지:", notification.message);
                    alert("해당 식재료 정보를 찾을 수 없습니다.");
                }
            }
            
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
        setadminYn(false);
        navigate("/");
    };

    const getTypeLabel = (type) => {
        if (type === "위험공표") return "위험공표";
        if (type === "가격변동") return "지정가 도달";
        return "가격정보";
    };

    // 탭 필터 함수: "가격정보" 탭은 "가격정보"와 "가격변동" 둘 다 포함
    const filterByTab = (notification) => {
        if (activeTab === "위험공표") {
            return notification.type === "위험공표";
        } else {
            // "가격정보" 탭: 가격정보 + 가격변동 (지정가 도달)
            return notification.type === "가격정보" || notification.type === "가격변동";
        }
    };

    // 메시지에서 ||ingredientId 부분 제거
    const formatMessage = (message) => {
        if (!message) return '';
        return message.replace(/\|\|\d+$/, '').trim();
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
                
                // ✅ 중복 체크
                const uniqueIds = new Set(data.map(n => n.notificationId));
                console.log("🔑 고유 ID 개수:", uniqueIds.size);
                
                if (uniqueIds.size !== data.length) {
                    console.warn("⚠️ 중복된 notificationId가 있습니다!");
                    
                    // 중복 제거
                    const uniqueNotifications = data.filter((notif, index, self) =>
                        index === self.findIndex(n => n.notificationId === notif.notificationId)
                    );
                    
                    console.log("✅ 중복 제거 후:", uniqueNotifications.length);
                    setNotifications(uniqueNotifications);
                    calculateUnreadCounts(uniqueNotifications);
                } else {
                    setNotifications(data);
                    calculateUnreadCounts(data);
                }
                
                setHasUnread(data.some(n => n.isRead === 'N'));
            } else {
                console.error("❌ 응답 실패:", response.status);
            }
        } catch (error) {
            console.error("❌ 알림 조회 실패:", error);
        }
    };

    const calculateUnreadCounts = (notificationList) => {
        const counts = {
            위험공표: 0,
            가격정보: 0
        };

        notificationList.forEach(notif => {
            if (notif.isRead === 'N') {
                if (notif.type === '위험공표') {
                    counts.위험공표++;
                } else if (notif.type === '가격정보' || notif.type === '가격변동') {
                    counts.가격정보++;
                }
            }
        });

        setUnreadCount(counts);
        console.log("📊 탭별 읽지 않은 알림:", counts);
    };

    // ✅ 현재 탭의 알림 일괄 읽음 처리
    const handleMarkAllAsRead = async () => {
        try {
            const token = sessionStorage.getItem("token");
            
            const response = await fetch(`/api/alert/notifications/mark-all-read/${activeTab}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (response.ok) {
                const result = await response.json();
                console.log(`✅ ${result.count}개 알림 읽음 처리 완료`);
                
                // 알림 목록 다시 조회
                fetchNotifications();
            }
        } catch (error) {
            console.error("일괄 읽음 처리 실패:", error);
        }
    };

    // ✅ 개별 알림 읽음 처리 (페이지 이동 없이)
    const handleMarkAsReadOnly = async (e, notificationId) => {
        e.stopPropagation(); // 알림 클릭 이벤트 전파 방지
        
        try {
            const token = sessionStorage.getItem("token");
            
            const response = await fetch(`/api/alert/notifications/${notificationId}/read`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (response.ok) {
                console.log("✅ 알림 읽음 처리 완료:", notificationId);
                
                // 알림 목록 다시 조회
                fetchNotifications();
            }
        } catch (error) {
            console.error("알림 읽음 처리 실패:", error);
        }
    };

    // ✅ 알림 삭제 기능 (선택사항)
    const handleDeleteNotification = async (e, notificationId) => {
        e.stopPropagation(); // 알림 클릭 이벤트 전파 방지
        
        if (!confirm("이 알림을 삭제하시겠습니까?")) {
            return;
        }
        
        try {
            const token = sessionStorage.getItem("token");
            
            const response = await fetch(`/api/alert/notifications/${notificationId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (response.ok) {
                console.log("✅ 알림 삭제 완료:", notificationId);
                
                // 알림 목록 다시 조회
                fetchNotifications();
            }
        } catch (error) {
            console.error("알림 삭제 실패:", error);
        }
    };

    const isMain = location.pathname === "/";

    // ✅ 추가 권장: 페이지 이동(location 변경) 시 스크롤 최상단 이동
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location.pathname]);

    return (
        <header className={`header ${isMain ? "transparent" : ""}`}>
            <div className="header-inner">
                <div className="logo-area">
                    <Link to="/">
                        <img src={logo} alt="FocusOnMeal" className="logo-img" />
                    </Link>
                </div>

                <nav className="nav">
                    <ul className="nav-menu">
                        <li>
                            <Link 
                                to="/ingredient/list"
                                className={location.pathname.startsWith('/ingredient') ? 'active' : ''}
                            >
                                식재료
                            </Link>
                        </li>
                        <li>
                            <Link 
                                to="/meal/mealAI"
                                className={location.pathname.startsWith('/meal') ? 'active' : ''}
                            >
                                식단
                            </Link>
                        </li>
                        <li>
                            <Link 
                                to="/board/safety/list"
                                className={location.pathname.startsWith('/board/safety') ? 'active' : ''}
                            >
                                안전정보
                            </Link>
                        </li>
                        <li>
                            <Link 
                                to="/board/notice/list"
                                className={location.pathname.startsWith('/board/notice') ? 'active' : ''}
                            >
                                공지사항
                            </Link>
                        </li>
                    </ul>
                </nav>

                <div className="user-area">
                    {isLoggedIn ? (
                        <>
                            <span
                                className={`welcome ${adminYn ? "admin-clickable" : ""}`}
                                onClick={() => {
                                    if (adminYn) navigate("/admin");   // 관리자만 페이지 이동
                                }}
                            >
                                {memberNickname}님
                            </span>
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
                                                        {unreadCount.위험공표 > 0 && (
                                                            <span className="tab-unread-dot"></span>
                                                        )}
                                                    </button>
                                                    <button
                                                        className={`notification-tab ${activeTab === '가격정보' ? 'active' : ''}`}
                                                        onClick={() => setActiveTab('가격정보')}
                                                    >
                                                        가격정보
                                                        {unreadCount.가격정보 > 0 && (
                                                            <span className="tab-unread-dot"></span>
                                                        )}
                                                    </button>
                                                </div>

                                                {/* 읽음 처리 버튼 */}
                                                {notifications.filter(n => filterByTab(n) && n.isRead === 'N').length > 0 && (
                                                    <div className="notification-action-bar">
                                                        <button 
                                                            className="mark-all-read-btn"
                                                            onClick={handleMarkAllAsRead}
                                                        >
                                                            모두 읽음으로 처리
                                                        </button>
                                                    </div>
                                                )}

                                                {/* 탭 콘텐츠 */}
                                                <div className="notification-content">
                                                    {notifications.filter(filterByTab).length === 0 ? (
                                                        <div className="notification-empty">알림이 없습니다.</div>
                                                    ) : (
                                                        notifications
                                                            .filter(filterByTab)
                                                            .map((notif, index) => (  // ✅ index 추가
                                                                <div
                                                                    key={`${notif.notificationId}-${index}`}  // ✅ 복합 키 사용
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
                                                                        {formatMessage(notif.message)}
                                                                    </div>

                                                                    {/* ✅ 개별 액션 버튼 추가 */}
                                                                    <div className="notification-actions">
                                                                        <button
                                                                            className="notification-action-btn mark-read"
                                                                            onClick={(e) => handleMarkAsReadOnly(e, notif.notificationId)}
                                                                            title="읽음 처리"
                                                                        >
                                                                            읽음
                                                                        </button>
                                                                        <button
                                                                            className="notification-action-btn delete"
                                                                            onClick={(e) => handleDeleteNotification(e, notif.notificationId)}
                                                                            title="알림 삭제"
                                                                        >
                                                                            삭제
                                                                        </button>
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
                            <Link to="/mypage" className="user-menu-item">마이페이지</Link>
                            <button onClick={handleLogout} className="user-menu-item logout-btn">로그아웃</button>
                        </>
                    ) : (
                        <>
                            <Link to="/member/login" className="user-menu-item">로그인</Link>
                            <Link to="/member/form" className="user-menu-item">회원가입</Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;