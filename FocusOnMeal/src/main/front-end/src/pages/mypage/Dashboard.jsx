import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styles from './Dashboard.module.css';
import axios from "axios";
import Sidebar from "../../components/mypage/Sidebar";

const Dashboard = () => {

    const [dashboard, setDashboard] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
        console.error("JWT 토큰 없음 → 로그인 필요");
        return;
        }

        axios.get("http://localhost:8080/api/mypage/dashboard", {
        headers: {
            Authorization: `Bearer ${token}`
        }
        })
        .then(res => {
            console.log(res.data);
            setDashboard(res.data);
        })
        .catch(err => {
        console.error(err);
        });

    }, []);

    // dashboard가 null이면 로딩 화면 출력
    if (!dashboard) return <div>Loading...</div>;

    return(
    <>
    <div className={styles.dashboardContainer}>
        <Sidebar />

        <div className={styles.dashboardContent}>
            <h2>{dashboard.memberInfo.memberNickname} 님의 마이페이지</h2>
            <div>
                <p>즐겨찾은 식자재: {dashboard.favoriteIngredientCount}개</p>
                <p>즐겨찾은 식단: {dashboard.favoriteMealCount}개</p>
            </div>
        </div>
    </div>
    </>
    )
}


export default Dashboard;
