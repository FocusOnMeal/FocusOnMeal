import Sidebar from "../../components/admin/Sidebar";
import styles from "./MemberInfo.module.css";
import React, { useState, useEffect } from 'react';
import axios from "axios";


const MemberInfo = () => {

    const [memberInfo, setMemberInfo] = useState([]);

    const handleToggleAdmin = (member) => {
        const newGrade = member.adminYn === "Y" ? "N" : "Y";

        axios.patch(`/api/admin/memberInfo/admin`, null, {
            params: {
                memberId: member.memberId,
                adminYn: newGrade
            },
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
        })
        .then(() => {
            setMemberInfo(prev =>
                prev.map(m =>
                    m.memberId === member.memberId ? { ...m, adminYn: newGrade } : m
                )
            );
        })
        .catch(err => console.error(err));
    };

    const handleToggleStatus = (member) => {
        const newStatus = member.statusYn === "Y" ? "N" : "Y";

        axios.patch(`/api/admin/memberInfo/status`, null, {
            params: {
                memberId: member.memberId,
                statusYn: newStatus
            },
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
        })
        .then(() => {
            setMemberInfo(prev =>
                prev.map(m =>
                    m.memberId === member.memberId ? { ...m, statusYn: newStatus} : m
                )
            );
        })
        .catch(err => console.error(err));
    };


    useEffect(() => {
        
        const fetchMemberInfo = () => {
            const token = localStorage.getItem("token");
            if (!token) {
                console.error("JWT 토큰이 없습니다.");
                return;
            }

                axios.get("/api/admin/memberInfo", {
                                headers: {
                                    Authorization: `Bearer ${token}`
                                }
                            })
                .then(res => {
                    console.log("[API 성공] 서버 응답:", res);
                    console.log("[API 성공] 받은 데이터:", res.data);
                    
                    setMemberInfo(res.data);
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
                        console.error("설정 에러] 요청 설정 중 오류:", err.message);
                    }
                });
        };
        fetchMemberInfo();
    }, []);

    return (
        <div className={styles.container}>
            <Sidebar />

            <main className={styles.main}>
                <h2 className={styles.title}>회원 관리</h2>
                <table className={styles.memberTable}>
                    <thead>
                        <tr>
                            <th>아이디</th>
                            <th>닉네임</th>
                            <th>이름</th>
                            <th>전화번호</th>
                            <th>이메일</th>
                            <th>성별</th>
                            <th>가입일</th>
                            <th>회원등급</th>
                            <th>상태</th>
                        </tr>
                    </thead>

                    <tbody>
                        {memberInfo.map((m, i) => (
                            <tr key={i}>
                                <td>{m.memberId}</td>
                                <td>{m.memberNickname}</td>
                                <td>{m.memberName}</td>
                                <td>{m.phone}</td>
                                <td>{m.email}</td>
                                <td>{m.gender}</td>
                                <td>{new Date(m.enrollDate).toLocaleDateString("ko-KR")}</td>
                                <td>{m.adminYn}</td>
{/*                                토글 나중에 구현 예정
                                <td>
                                    <button
                                        className={m.adminYn === "Y" ? styles.badgeAdmin : styles.badgeUser}
                                        onClick={() => handleToggleAdmin(m)}
                                    >
                                        {m.adminYn === "Y" ? "관리자" : "일반회원"}
                                    </button>
                                </td>

                                <td>
                                    <button
                                        className={m.statusYn === "Y" ? styles.badgeStatus : styles.badgeUser}
                                        onClick={() => handleToggleStatus(m)}
                                    >
                                        {m.statusYn === "Y" ? "활성" : "비활성"}
                                    </button>
                                </td> 
                                */}

                                <td>{m.statusYn}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </main>
        </div>
    );
};

export default MemberInfo;
