import React, { useState, useEffect, useRef } from 'react';
import styles from './Footer.module.css';

import footerGrass from '../../assets/logo/footerGrass.png'; 
import blog from "../../assets/logo/blog.avif";
import facebook from "../../assets/logo/Facebook.png";
import kakao from "../../assets/logo/KakaoTalk.png";
import instagram from "../../assets/logo/Instagram.png";
import naver from "../../assets/logo/naverband.avif";
import FocusOnMeal from "../../assets/logo/FocusOnMeal.png";

const Footer = () => {
    const [hoveredSns, setHoveredSns] = useState(null);
    const grassRef = useRef(null);
    const [grassHeight, setGrassHeight] = useState(0);

    // 🌿 이미지 로드 후 실제 높이를 자동으로 padding-top에 반영
    useEffect(() => {
        if (grassRef.current) {
            const img = grassRef.current;
            const updateHeight = () => {
                setGrassHeight(img.offsetHeight);
            };

            updateHeight();
            window.addEventListener('resize', updateHeight);
            return () => window.removeEventListener('resize', updateHeight);
        }
    }, []);

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
        <footer 
            className={styles.footer}
            style={{ paddingTop: grassHeight }} // 🌿 잔디 높이만큼 푸터 자동 내려가기
        >

            {/* 🌿 잔디 이미지 (푸터 최상단) */}
            <div className={styles.grassWrapper}>
                <img 
                    ref={grassRef}
                    src={footerGrass} 
                    alt="Footer Grass"
                    className={styles.grassImage}
                />
            </div>

            <div className={styles.footerContent}>
                
                {/* 상단 영역 */}
                <div className={styles.topSection}>
                    <div className={styles.messageBox}>
                        <h3 className={styles.messageTitle}>
                            당신의 건강에<br />
                            정성을 담아드립니다.
                        </h3>
                    </div>

                    {/* SNS 링크 */}
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

                {/* 중단 영역 */}
                <div className={styles.middleSection}>
                    <div className={styles.logoContainer}>
                        <img 
                            src={FocusOnMeal} 
                            alt="Focus OnMeal" 
                            className={styles.logoImage} 
                        />
                    </div>

                    <div className={styles.rightSection}>
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

                        <p className={styles.addressText}>
                            우)20251   서울특별시 중구 을지로 12 창업빌딩 3층   TEL : 02 - 123 - 4567
                        </p>

                        <div className={styles.divider}>
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
