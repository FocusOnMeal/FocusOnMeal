import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./NoticeDetail.module.css";
import Footer from "../../../components/common/Footer";

const NoticeDetail = () => {
    const { noticeNo } = useParams();
    const navigate = useNavigate();

    const [prev, setPrev] = useState(null);
    const [next, setNext] = useState(null);
    const [notice, setNotice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!noticeNo || isNaN(parseInt(noticeNo))) {
            setError("유효하지 않은 공지 번호입니다.");
            setLoading(false);
            return;
        }

        const fetchNoticeDetail = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`/api/board/notice/view/${noticeNo}`);
                
                setNotice(response.data.notice);
                setPrev(response.data.prev); 
                setNext(response.data.next); 
                setLoading(false);

            } catch (err) {
                console.error("❌ 에러:", err);
                setError("해당 공지사항을 찾을 수 없습니다.");
                setLoading(false);
            }
        };

        fetchNoticeDetail();
    }, [noticeNo]);

    // 이전/다음 글 이동 핸들러
    const handlePrevClick = () => {
        if (prev) navigate(`/board/notice/detail/${prev.noticeNo}`);
    };

    const handleNextClick = () => {
        if (next) navigate(`/board/notice/detail/${next.noticeNo}`);
    };

    if (loading) return <div className={styles.loadingContainer}><p className={styles.loadingText}>로딩 중... 🌱</p></div>;
    if (error) return <div className={styles.errorContainer}><p>{error}</p></div>;
    if (!notice) return <div className={styles.errorContainer}><p>공지사항이 없습니다.</p></div>;

    return (
        <>
        <div className={styles.container}>
            <div className={styles.detailCard}>
                
                {/* 헤더 영역 */}
                <div className={styles.header}>
                    <h1 className={styles.pageTitle}>공지사항</h1>
                    <div className={styles.titleWrapper}>
                        <div className={styles.badgeGroup}>
                            {notice.noticeImportant === "Y" && (
                                <span className={styles.badgeImportant}>필독</span>
                            )}
                            {notice.noticeIsnew === "Y" && (
                                <span className={styles.badgeNew}>NEW</span>
                            )}
                        </div>
                        <h2 className={styles.noticeSubject}>{notice.noticeSubject}</h2>
                    </div>

                    <div className={styles.infoBar}>
                        <span className={styles.infoItem}>
                            <strong>작성자</strong> 관리자
                        </span>
                        <span className={styles.infoItem}>
                            <strong>작성일</strong> {new Date(notice.noticeCreateAt).toLocaleDateString("ko-KR")}
                        </span>
                        <span className={styles.infoItem}>
                            <strong>조회수</strong> {notice.viewCount}
                        </span>
                    </div>
                </div>

                <div className={styles.divider}></div>

                {/* 본문 영역 */}
                <div className={styles.noticeContent}>
                    {/* pre-wrap을 적용하여 줄바꿈 유지 */}
                    <p>{notice.noticeContent}</p>
                </div>

                <div className={styles.divider}></div>

                {/* 이전/다음 글 영역 (메모지 스타일) */}
                <div className={styles.navArea}>
                    <div 
                        className={`${styles.navItem} ${!prev ? styles.disabled : ''}`}
                        onClick={handlePrevClick}
                    >
                        <span className={styles.navLabel}>이전글 ▲</span>
                        <span className={styles.navTitle}>
                            {prev ? prev.noticeTitle : '이전글이 없습니다.'}
                        </span>
                    </div>

                    <div
                        className={`${styles.navItem} ${!next ? styles.disabled : ''}`}
                        onClick={handleNextClick}
                    >
                        <span className={styles.navLabel}>다음글 ▼</span>
                        <span className={styles.navTitle}>
                            {next ? next.noticeTitle : '다음글이 없습니다.'}
                        </span>
                    </div>
                </div>

                {/* 목록 버튼 */}
                <div className={styles.buttonWrapper}>
                    <button
                        className={styles.listBtn}
                        onClick={() => navigate("/board/notice/list")}
                    >
                        목록으로 돌아가기
                    </button>
                </div>
            </div>
        </div>
        <Footer/>
        </>
    );
};

export default NoticeDetail;