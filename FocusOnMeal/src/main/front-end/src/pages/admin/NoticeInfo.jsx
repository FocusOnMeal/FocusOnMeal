import React, { useState , useEffect} from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import styles from "./NoticeInfo.module.css";
import Sidebar from "../../components/admin/Sidebar";


const NoticeInfo = () => {

    const [noticeInfo, setNoticeInfo] = useState([]);
    
    // 모달 선택 + 선택된 공지
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedNotice, setSelectedNotice] = useState(null);

    // 제목 클릭 시 모달 열기
    const openModal = (notice) => {
        setSelectedNotice({...notice});
        setIsModalOpen(true);
    }

    // modal close
    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedNotice(null);
    }

    // save modify
    const handleSave = () => {
        const token = localStorage.getItem("token");

        const payload = { ...selectedNotice };

        delete payload.noticeCreateAt;   // 날짜 제외
        delete payload.viewCount;       // 조회수 제외

        axios.patch(`/api/admin/noticeInfo/modify`, payload, {
            headers: { Authorization: `Bearer ${token}`}
        })
        .then(()=>{
            setNoticeInfo(prev => 
                prev.map(n=>
                    n.noticeNo === selectedNotice.noticeNo ? selectedNotice : n
                )
            );
            closeModal();
        })
        .catch(err => console.error(err));
    };

    useEffect(() => {
        const fetchNoticeInfo = () => {
            const token = localStorage.getItem("token");
            if (!token) {
                console.error("JWT 토큰이 없습니다.");
                return;
            }

                axios.get("/api/admin/noticeInfo", {
                                headers: {
                                    Authorization: `Bearer ${token}`
                                }
                            })
                .then(res => {
                    console.log("[API 성공] 서버 응답:", res);
                    console.log("[API 성공] 받은 데이터:", res.data);
                    
                    setNoticeInfo(res.data);
                })
                .catch(err => {
                    console.error("[API 실패] 에러 발생:", err);

                    // --- 서버로부터 응답이 온 경우 ---
                    // (예: 401, 403, 404, 500 에러)
                    if (err.response) {
                        console.error("[서버 응답 에러] 상세:", err.response);
                        console.error("[서버 응답 에러] 상태 코드:", err.response.status);
                        console.error("[서버 응답 에러] 서버 메시지:", err.response.data);
                    } 
                    // --- 서버로 요청은 갔으나 응답을 못 받은 경우 ---
                    // (예: 네트워크 오류, CORS, 타임아웃)
                    else if (err.request) {
                        console.error("[요청 에러] 응답을 받지 못함:", err.request);
                    } 
                    // --- 요청을 보내기 전 설정 단계에서 에러가 난 경우 ---
                    else {
                        console.error("[설정 에러] 요청 설정 중 오류:", err.message);
                    }
                });
        };
        fetchNoticeInfo();
    }, []);


    return (
        <div className={styles.container}>
            <Sidebar/>
            <div className={styles.main}>
                <h1>공지사항</h1>

                <table className={styles.noticeTable}>
                    <thead>
                        <tr>
                            <th>번호</th>
                            <th>제목</th>
                            <th>작성자</th>
                            <th>작성일</th>
                            <th>조회수</th>
                            <th>관리</th>
                        </tr>
                    </thead>

                    <tbody>
                        {Array.isArray(noticeInfo) && noticeInfo.length > 0 ? (
                            noticeInfo.map((notice) => (
                                <tr key={notice.noticeNo}>
                                    <td>{notice.noticeNo}</td>

                                    <td>
                                        {/* 필독 */}
                                        {notice.noticeImportant === "Y" && (
                                            <span className={styles.badgeImportant}>필독 !</span>
                                        )}

                                        {/* NEW */}
                                        {notice.noticeImportant !== "Y" &&
                                            notice.noticeIsNew === "Y" && (
                                                <span className={styles.badgeIsNew}>NEW</span>
                                            )}

                                        <span 
                                            className={styles.subjectLink}
                                            onClick={() => openModal(notice)}
                                        >
                                            {notice.noticeSubject}
                                        </span>
                                    </td>

                                    <td>{notice.memberId}</td>

                                    <td>
                                        {new Date(notice.noticeCreateAt).toLocaleDateString("ko-KR")}
                                    </td>

                                    <td>{notice.viewCount}</td>

                                    <td>
                                        <button className={styles.editBtn} onClick={() => openModal(notice)}>
                                            수정
                                        </button>
                                        <button className={styles.deleteBtn}>삭제</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" style={{ textAlign: "center" }}>
                                    등록된 공지사항이 없습니다.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && selectedNotice && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <h2>공지사항 수정</h2>

                        <label>제목</label>
                        <input
                            type="text"
                            value={selectedNotice.noticeSubject}
                            onChange={(e) =>
                                setSelectedNotice({ ...selectedNotice, noticeSubject: e.target.value })
                            }
                        />

                        <label>내용</label>
                        <textarea
                            value={selectedNotice.noticeContent}
                            onChange={(e) =>
                                setSelectedNotice({ ...selectedNotice, noticeContent: e.target.value })
                            }
                        />

                        {/* NEW 여부 토글 */}
                        <label>NEW 표시</label>
                        <button
                            className={
                                selectedNotice.noticeIsNew === "Y" 
                                ? styles.toggleOn 
                                : styles.toggleOff
                            }
                            onClick={() =>
                                setSelectedNotice({
                                    ...selectedNotice,
                                    noticeIsNew: selectedNotice.noticeIsNew === "Y" ? "N" : "Y"
                                })
                            }
                        >
                            {selectedNotice.noticeIsNew === "Y" ? "ON" : "OFF"}
                        </button>

                        {/* 필독 여부 토글 */}
                        <label>필독 여부</label>
                        <button
                            className={
                                selectedNotice.noticeImportant === "Y"
                                ? styles.toggleOn 
                                : styles.toggleOff
                            }
                            onClick={() =>
                                setSelectedNotice({
                                    ...selectedNotice,
                                    noticeImportant: selectedNotice.noticeImportant === "Y" ? "N" : "Y"
                                })
                            }
                        >
                            {selectedNotice.noticeImportant === "Y" ? "필독" : "일반"}
                        </button>

                        <div className={styles.modalButtons}>
                            <button onClick={handleSave} className={styles.saveBtn}>저장</button>
                            <button onClick={closeModal} className={styles.closeBtn}>닫기</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NoticeInfo;
