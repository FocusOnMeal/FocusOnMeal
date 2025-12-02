import React, { useState } from 'react';
import styles from './Footer.module.css';
import blog from "../../assets/logo/blog.avif";
import facebook from "../../assets/logo/Facebook.png";
import kakao from "../../assets/logo/KakaoTalk.png";
import instagram from "../../assets/logo/Instagram.png";
import naver from "../../assets/logo/naverband.avif";
import FocusOnMeal from "../../assets/logo/FocusOnMeal.png";

const Footer = () => {
    const [hoveredSns, setHoveredSns] = useState(null);

    const snsItems = [
        { id: 'blog', name: '블로그', logo: blog, url: 'https://section.blog.naver.com/BlogHome.naver?directoryNo=0&currentPage=1&groupId=0' },
        { id: 'facebook', name: '페이스북', logo: facebook, url: 'https://www.facebook.com/' },
        { id: 'kakao', name: '카카오톡', logo: kakao, url: 'https://accounts.kakao.com/' },
        { id: 'instagram', name: '인스타그램', logo: instagram, url: 'https://www.instagram.com/' },
        { id: 'naver', name: '네이버밴드', logo: naver, url: 'https://www.band.us/ko' },
    ];

    const menuLinks = [
        '개인정보처리방침',
        '이용약관',
        '저작권정책',
        '고객서비스헌장',
        '이메일정보처리방침',
        '법적고지',
        '고객센터'
    ];

    return (
        <footer className={styles.footer}>
            {/* 푸터 콘텐츠 */}
            <div className={styles.footerContent}>
                {/* 상단: 문구 + SNS 버튼 */}
                <div className={styles.topSection}>
                    {/* 문구 */}
                    <div className={styles.messageBox}>
                        <h3 className={styles.messageTitle}>
                            당신의 건강에<br />
                            정성을 담아서 냅니다.
                        </h3>
                    </div>

                    {/* SNS 버튼들 */}
                    <div className={styles.snsContainer}>
                        {snsItems.map((sns) => (
                            <a
                                key={sns.id}
                                href={sns.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onMouseEnter={() => setHoveredSns(sns.id)}
                                onMouseLeave={() => setHoveredSns(null)}
                                className={styles.snsLink}
                            >
                                <img
                                    src={sns.logo}
                                    alt={sns.name}
                                    className={styles.snsLogo}
                                />
                                <span className={styles.snsName}>
                                    {sns.name.length > 4 ? (
                                        <>
                                            {sns.name.slice(0, 3)}<br />{sns.name.slice(3)}
                                        </>
                                    ) : (
                                        sns.name
                                    )}
                                </span>
                            </a>
                        ))}
                    </div>
                </div>

                {/* 중단: 로고 + 링크 메뉴 */}
                <div className={styles.middleSection}>
                    {/* 로고 */}
                    <div className={styles.logoContainer}>
                        <img 
                            src={FocusOnMeal} 
                            alt="Focus OnMeal" 
                            className={styles.logoImage} 
                        />
                        <div className={styles.logoPlaceholder}></div>
                    </div>

                    {/* 오른쪽 영역: 링크 메뉴 + 하단 정보 */}
                    <div className={styles.rightSection}>
                        {/* 링크 메뉴 */}
                        <div className={styles.menuLinks}>
                            {menuLinks.map((link, index) => (
                                <React.Fragment key={link}>
                                    <a 
                                        href="#" 
                                        className={`${styles.menuLink} ${index === 0 ? styles.primary : ''}`}
                                    >
                                        {link}
                                    </a>
                                    {index < menuLinks.length - 1 && (
                                        <span className={styles.menuSeparator}>|</span>
                                    )}
                                </React.Fragment>
                            ))}
                        </div>

                        {/* 주소 정보 */}
                        <div>
                            <p className={styles.addressText}>
                                우)20251   서울특별시 중구 을지로 12 창업빌딩 3층   TEL : 02 - 123 - 4567
                            </p>
                        </div>

                        {/* 구분선 */}
                        <div className={styles.divider}>
                            {/* 저작권 */}
                            <p className={styles.copyright}>
                                Copyright © 2025 Focus ON Meal. All Rights Reserved.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;