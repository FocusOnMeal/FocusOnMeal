import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./SafetyDetail.module.css";

const SafetyDetail = () => {
    const { alertId } = useParams();
    const navigate = useNavigate();

    const [alert, setAlert] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

                setAlert(response.data);
                setLoading(false);

            } catch (err) {
                console.error(err);
                setError("해당 안전 정보를 찾을 수 없습니다.");
                setLoading(false);
            }
        };

        fetchAlertDetail();
    }, [alertId]);

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
        return styles.badgeDefault;
    };

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

                <div className={styles.alertContent}>
                    <p>{alert.description}</p>
                </div>

                {/* 이전/다음 글 영역 */}
                <div className={styles.actionButtons}>
                    <div className={styles.prevNextWrapper}>
                        <div className={styles.prevRow}>
                            <span className={styles.label}>이전글</span>
                            <span className={styles.separator}>|</span>
                            <span className={styles.title}>이전글 제목</span>
                        </div>
                        <div className={styles.nextRow}>
                            <span className={styles.label}>다음글</span>
                            <span className={styles.separator}>|</span>
                            <span className={styles.title}>다음글 제목</span>
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