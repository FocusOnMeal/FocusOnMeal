import { Link } from "react-router-dom";
import styles from './Dashboard.module.css';
import React, { useEffect, useState } from "react";
import axios from "axios";

const Dashboard = () => {

    const [dashboard, setDashboard] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("jwtToken"); // JWT 저장 위치에 따라 수정
        if (!token) {
        console.error("JWT 토큰이 없습니다. 로그인 필요");
        return;
        }

        axios.get("/api/mypage/dashboard", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then(res => setDashboard(res.data))
        .catch(err => console.error(err));
    }, []);

    if (!dashboard) return <p>로딩 중...</p>;

    return(
        <>
        <div className="mypage-dashboard">
            <h2>{dashboard.memberInfo.name} 님의 마이페이지</h2>
            <p>이메일: {dashboard.memberInfo.email}</p>
            <div>
                <p>즐겨찾은 식자재: {dashboard.favoriteIngredientCount}개</p>
                <p>즐겨찾은 식단: {dashboard.favoriteMealCount}개</p>
            </div>
        </div>
        </>
    )
}

export default Dashboard;