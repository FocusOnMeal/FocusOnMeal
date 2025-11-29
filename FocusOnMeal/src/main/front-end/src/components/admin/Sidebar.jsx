import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import styles from "./Sidebar.module.css";

const Sidebar = () => {
    const location = useLocation();
    const isDataManagementActive = 
        location.pathname === "/admin/safetyInfo" || 
        location.pathname === "/admin/ingredientInfo";

    return (
        <aside className={styles.sidebar}>
            <ul className={styles.menuList}>

                {/* 관리자 홈 */}
                <li>
                    <NavLink
                        to="/admin"
                        end
                        className={({ isActive }) =>
                            isActive ? styles.activeTitle : styles.menuTitle
                        }
                    >
                        홈
                    </NavLink>
                </li>

                {/* 회원 관리 */}
                <li>
                    <NavLink
                        to="/admin/memberInfo"
                        className={({ isActive }) =>
                            isActive ? styles.activeTitle : styles.menuTitle
                        }
                    >
                        회원 관리
                    </NavLink>
                </li>

                {/* 데이터 관리 - 식재료 관리로 이동 */}
                <li>
                    <NavLink
                        to="/admin/ingredientInfo"
                        className={isDataManagementActive ? styles.activeTitle : styles.menuTitle}
                    >
                        데이터 관리
                    </NavLink>
                </li>

                <li>
                    <NavLink
                        to="/admin/ingredientInfo"
                        className={({ isActive }) =>
                            isActive ? styles.active : styles.subItem
                        }
                    >
                        식재료 관리
                    </NavLink>
                </li>
                
                <li>
                    <NavLink
                        to="/admin/safetyInfo"
                        className={({ isActive }) =>
                            isActive ? styles.active : styles.subItem
                        }
                    >
                        안전 정보 관리
                    </NavLink>
                </li>


                {/* 공지사항 관리 */}
                <li>
                    <NavLink
                        to="/admin/noticeInfo"
                        className={({ isActive }) =>
                            isActive ? styles.activeTitle : styles.menuTitle
                        }
                    >
                        공지사항 관리
                    </NavLink>
                </li>

                {/* 배치 */}
                <li>
                    <NavLink
                        to="/admin/batch"
                        className={({ isActive }) =>
                            isActive ? styles.activeTitle : styles.menuTitle
                        }
                    >
                        배치 / 로그
                    </NavLink>
                </li>
            </ul>
        </aside>
    );
};

export default Sidebar;