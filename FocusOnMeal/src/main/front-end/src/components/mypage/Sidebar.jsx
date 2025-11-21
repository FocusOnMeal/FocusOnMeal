import React from "react";
import { NavLink } from "react-router-dom";
import styles from "./Sidebar.module.css";

const Sidebar = () => {
    return (
        <aside className={styles.sidebar}>
            <ul className={styles.menuList}>

                <li>
                    <NavLink
                        to="/mypage"
                        className={({ isActive }) =>
                            isActive ? styles.active : styles.menuTitle
                        }>
                        홈
                    </NavLink>
                </li>

                <li className={styles.menuTitle}>식단 관리</li>
                <li>
                    <NavLink
                        to="/meal/myMeal"
                        className={({ isActive }) =>
                            isActive ? styles.active : styles.subItem
                        }
                    >
                        내 식단
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to="/mypage/favorite"
                        className={({ isActive }) =>
                            isActive ? styles.active : styles.subItem
                        }
                    >
                        즐겨찾는 식단
                    </NavLink>
                </li>

                <li className={styles.menuTitle}>식재료 관리</li>
                <li>
                    <NavLink
                        to="/mypage/customIngredients"
                        className={({ isActive }) =>
                            isActive ? styles.active : styles.subItem
                        }
                    >
                        나만의 식재료
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to="/ingredient/favorite"
                        className={({ isActive }) =>
                            isActive ? styles.active : styles.subItem
                        }
                    >
                        즐겨찾는 식재료
                    </NavLink>
                </li>

                <li className={styles.menuTitle}>알림 설정</li>
                <li>
                    <NavLink
                        to="/mypage/setting/priceAlert"
                        className={({ isActive }) =>
                            isActive ? styles.active : styles.subItem
                        }
                    >
                        가격 변동 알림
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to="/mypage/setting/safetyAlert"
                        className={({ isActive }) =>
                            isActive ? styles.active : styles.subItem
                        }
                    >
                        안전 정보 알림
                    </NavLink>
                </li>

                <li className={styles.menuTitle}>내 정보 관리</li>
                <li>
                    <NavLink
                        to="/mypage/profile"
                        className={({ isActive }) =>
                            isActive ? styles.active : styles.subItem
                        }
                    >
                        개인정보 관리
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to="/mypage/allergies"
                        className={({ isActive }) =>
                            isActive ? styles.active : styles.subItem
                        }
                    >
                        알레르기 정보 관리
                    </NavLink>
                </li>
            </ul>
        </aside>
    );
};

export default Sidebar;
