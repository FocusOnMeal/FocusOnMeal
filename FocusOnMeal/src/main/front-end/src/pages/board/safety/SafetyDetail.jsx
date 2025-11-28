import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import DOMPurify from 'dompurify';
import styles from "./SafetyDetail.module.css";

const SafetyDetail = () => {
    const { alertId } = useParams();
    const navigate = useNavigate();

    const [alert, setAlert] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [prevAlert, setPrevAlert] = useState(null);
    const [nextAlert, setNextAlert] = useState(null);

    useEffect(() => {
        // 번호 validation
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

                console.log("📦 받은 데이터:", response.data);
                console.log("📄 alert:", alert);
                console.log("⬅️ prevAlert:", prevAlert);
                console.log("➡️ nextAlert:", nextAlert);

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

        // ✅ 이전/다음 글 이동
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

    if (loading) {
        return <div className={styles.loading}>안전 정보를 불러오는 중...</div>;
    }

    if (error) {
        return <div className={styles.error}>{error}</div>;
    }

    if (!alert) {
        return <div className={styles.error}>해당 안전 정보를 찾을 수 없습니다.</div>;
    }

    // 위험 유형별 뱃지 클래스
    const getHazardTypeBadgeClass = (hazardType) => {
        if (hazardType === '위해식품정보') return styles.badgeDanger;
        if (hazardType === '글로벌 동향정보') return styles.badgeGlobal;
        if (hazardType === '연구평가정보') return styles.badgeResearch;
        if (hazardType === '법제도정보') return styles.badgeLaw;
        return styles.badgeDefault;
    };

    // ✅ HTML을 안전하게 정제
    const sanitizedDescription = DOMPurify.sanitize(alert.description, {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'div'],
        ALLOWED_ATTR: ['class', 'style']
    });

    return (
        <div className={styles.container}>
            <div className={styles.detailWrapper}>
                <h1 className={styles.pageTitle}>안전 정보 뉴스</h1>

                <div className={styles.alertHeader}>
                    <div className={styles.subjectRow}>
                        <span className={getHazardTypeBadgeClass(alert.hazardType)}>
                            {alert.hazardType}
                        </span>
                        <h2 className={styles.alertTitle}>
                            {alert.title}
                        </h2>
                    </div>

                    <div className={styles.infoBar}>
                        <span className={styles.infoItem}>
                            공표 국가: {alert.nation}
                        </span>
                        <span className={styles.separator}>|</span>
                        <span className={styles.infoItem}>
                            공표일: {new Date(alert.publicationDate).toLocaleDateString("ko-KR")}
                        </span>
                    </div>
                </div>

                {/* ✅ HTML 렌더링 적용 */}
                <div 
                    className={styles.alertContent}
                    dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
                />

                {/* ✅ 이전/다음 글 영역 */}
                <div className={styles.actionButtons}>
                    <div className={styles.prevNextWrapper}>
                        {/* 이전글 */}
                        <div 
                            className={`${styles.prevRow} ${!prevAlert ? styles.disabled : ''}`}
                            onClick={handlePrevClick}
                            style={{ cursor: prevAlert ? 'pointer' : 'default' }}
                        >
                            <span className={styles.label}>이전글</span>
                            <span className={styles.separator}>|</span>
                            <span className={styles.title}>
                                {prevAlert ? prevAlert.title : '이전글이 없습니다.'}
                            </span>
                        </div>
                        
                        {/* 다음글 */}
                        <div 
                            className={`${styles.nextRow} ${!nextAlert ? styles.disabled : ''}`}
                            onClick={handleNextClick}
                            style={{ cursor: nextAlert ? 'pointer' : 'default' }}
                        >
                            <span className={styles.label}>다음글</span>
                            <span className={styles.separator}>|</span>
                            <span className={styles.title}>
                                {nextAlert ? nextAlert.title : '다음글이 없습니다.'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 목록 버튼 */}
                <div className={styles.listButtonWrapper}>
                    <button
                        className={styles.listBtn}
                        onClick={() => navigate("/board/safety/list")}
                    >
                        목록으로
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SafetyDetail;