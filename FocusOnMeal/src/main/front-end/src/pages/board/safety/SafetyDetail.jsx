import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import DOMPurify from 'dompurify';
import styles from "./SafetyDetail.module.css";
import Footer from "../../../components/common/Footer";

const SafetyDetail = () => {
    const { alertId } = useParams();
    const navigate = useNavigate();

    const [alert, setAlert] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [prevAlert, setPrevAlert] = useState(null);
    const [nextAlert, setNextAlert] = useState(null);

    useEffect(() => {
        if (!alertId || isNaN(parseInt(alertId))) {
            setError("안전 정보 번호가 유효하지 않습니다.");
            setLoading(false);
            return;
        }

        const fetchAlertDetail = async () => {
            try {
                setLoading(true);

                const response = await axios.get(
                    `/api/board/safety/detail/${alertId}`
                );

                const { alert, prevAlert, nextAlert } = response.data;

                setAlert(alert);
                setPrevAlert(prevAlert);
                setNextAlert(nextAlert);
                setLoading(false);

            } catch (err) {
                console.error(err);
                setError("해당 안전 정보를 찾을 수 없습니다.");
                setLoading(false);
            }
        };

        fetchAlertDetail();
    }, [alertId]);

    const handlePrevClick = () => {
        if (prevAlert) {
            navigate(`/board/safety/detail/${prevAlert.alertId}`);
        }
    };

    const handleNextClick = () => {
        if (nextAlert) {
            navigate(`/board/safety/detail/${nextAlert.alertId}`);
        }
    };

    if (loading) return <div className={styles.loadingContainer}><p className={styles.loadingText}>로딩 중... 🌱</p></div>;
    if (error) return <div className={styles.errorContainer}><p>{error}</p></div>;
    if (!alert) return <div className={styles.errorContainer}><p>안전 정보가 없습니다.</p></div>;

    const getHazardTypeBadgeClass = (hazardType) => {
        if (hazardType === '위해식품정보') return styles.badgeDanger;
        if (hazardType === '글로벌 동향정보') return styles.badgeGlobal;
        if (hazardType === '연구평가정보') return styles.badgeResearch;
        if (hazardType === '법제도정보') return styles.badgeLaw;
        return styles.badgeDefault;
    };

    const sanitizedDescription = DOMPurify.sanitize(alert.description, {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'div'],
        ALLOWED_ATTR: ['class', 'style']
    });

    return (
        <>
            <div className={styles.container}>
                <div className={styles.detailCard}>

                    {/* 헤더 영역 */}
                    <div className={styles.header}>
                        <h1 className={styles.pageTitle}>안전 정보 뉴스</h1>
                        <div className={styles.titleWrapper}>
                            <span className={getHazardTypeBadgeClass(alert.hazardType)}>
                                {alert.hazardType}
                            </span>
                            <h2 className={styles.alertTitle}>{alert.title}</h2>
                        </div>

                        <div className={styles.infoBar}>
                            <span className={styles.infoItem}>
                                <strong>공표 국가</strong> {alert.nation}
                            </span>
                            <span className={styles.infoItem}>
                                <strong>공표일</strong> {new Date(alert.publicationDate).toLocaleDateString("ko-KR")}
                            </span>
                        </div>
                    </div>

                    <div className={styles.divider}></div>

                    {/* 본문 영역 */}
                    <div
                        className={styles.alertContent}
                        dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
                    />

                    <div className={styles.divider}></div>

                    {/* 이전/다음 글 영역 */}
                    <div className={styles.navArea}>
                        <div
                            className={`${styles.navItem} ${!prevAlert ? styles.disabled : ''}`}
                            onClick={handlePrevClick}
                        >
                            <span className={styles.navLabel}>이전글 ▲</span>
                            <span className={styles.navTitle}>
                                {prevAlert ? prevAlert.title : '이전글이 없습니다.'}
                            </span>
                        </div>

                        <div
                            className={`${styles.navItem} ${!nextAlert ? styles.disabled : ''}`}
                            onClick={handleNextClick}
                        >
                            <span className={styles.navLabel}>다음글 ▼</span>
                            <span className={styles.navTitle}>
                                {nextAlert ? nextAlert.title : '다음글이 없습니다.'}
                            </span>
                        </div>
                    </div>

                    {/* 목록 버튼 */}
                    <div className={styles.buttonWrapper}>
                        <button
                            className={styles.listBtn}
                            onClick={() => navigate("/board/safety/list")}
                        >
                            목록으로 돌아가기
                        </button>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default SafetyDetail;