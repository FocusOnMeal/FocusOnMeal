import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom"; // useLocation 추가
import styles from "./Sidebar.module.css";

const menuItems = [
    { label: "홈", href: "/mypage" },
    { label: "내 식단 관리", href: "/mypage/myMeal" },
    { label: "즐겨찾는 식재료", href: "/mypage/ingredients/favorite" },
    { 
        label: "알림 설정", 
        subMenu: [
            { label: "가격 변동 알림", href: "/mypage/setting/priceAlert" },
            { label: "안전 정보 알림", href: "/mypage/setting/safetyAlert" }
        ]
    },
    { 
        label: "내 정보 관리", 
        subMenu: [
            { label: "개인정보 관리", href: "/mypage/profile" },
            { label: "알레르기 정보 관리", href: "/mypage/allergies" }
        ]
    }
];

const Sidebar = () => {
    const location = useLocation(); // 현재 경로를 확인하기 위한 훅

    // 2. 어떤 메뉴가 열려있는지 관리하는 State (객체 형태 추천: { "식재료 관리": true })
    // 초기값으로 모든 메뉴를 닫아두거나, 필요하면 true로 설정 가능
    const [openMenus, setOpenMenus] = useState({});

    // ✅ 새로고침/페이지 이동 시 현재 URL을 확인하여 해당 메뉴 열어두기
    useEffect(() => {
        const path = location.pathname;

        menuItems.forEach((item) => {
            if (item.subMenu) {
                // 현재 주소가 서브메뉴의 주소를 포함하고 있다면 부모 메뉴를 켬
                const shouldBeOpen = item.subMenu.some(sub => path.startsWith(sub.href));
                
                if (shouldBeOpen) {
                    setOpenMenus(prev => ({
                        ...prev,
                        [item.label]: true
                    }));
                }
            }
        });
    }, [location.pathname]);

    // 토글 함수
    const toggleMenu = (label) => {
        setOpenMenus(prev => ({
            ...prev,
            [label]: !prev[label] // 클릭한 메뉴의 상태를 반전 (true <-> false)
        }));
    };

    return (
        <aside className={styles.sidebar}>
            <ul className={styles.menuList}>
                {menuItems.map((item, index) => {
                    // 서브 메뉴가 있는 경우 (부모 메뉴)
                    if (item.subMenu) {
                        const isOpen = openMenus[item.label];
                        
                        return (
                            <li key={index}>
                                {/* 부모 메뉴 제목 (클릭 시 토글) */}
                                <div 
                                    className={styles.menuTitle} 
                                    onClick={() => toggleMenu(item.label)}
                                    style={{ cursor: "pointer", display: "flex", justifyContent: "space-between" }}
                                >
                                    {item.label}
                                    <span className={`${styles.toggleIcon} ${isOpen ? styles.rotated : ""}`}>
                                        ▼
                                    </span>
                                </div>

                                {/* 서브 메뉴 리스트 (isOpen일 때만 렌더링) */}
                                {isOpen && (
                                    <ul className={styles.subList}>
                                        {item.subMenu.map((subItem) => (
                                            <li key={subItem.href}>
                                                
                                                <NavLink
                                                    to={subItem.href}
                                                    className={({ isActive }) =>
                                                        isActive ? `${styles.subItem} ${styles.active}` : styles.subItem
                                                    }
                                                >
                                                    {subItem.label}
                                                </NavLink>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </li>
                        );
                    } 
                    
                    // 서브 메뉴가 없는 경우 (일반 링크)
                    else {
                        return (
                            <li key={item.href}>
                                <NavLink
                                    to={item.href}
                                    // ✅ 홈 버튼 문제 해결: '/mypage'인 경우 정확히 일치할 때만 active 처리
                                    end={item.href === "/mypage"} 
                                    className={({ isActive }) =>
                                        isActive ? `${styles.menuTitle} ${styles.active}` : styles.menuTitle
                                    }
                                >
                                    {item.label}
                                </NavLink>
                            </li>
                        );
                    }
                })}
            </ul>
        </aside>
    );
};

export default Sidebar;