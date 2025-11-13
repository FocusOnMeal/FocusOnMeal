// src/layouts/CommonLayout.jsx (이름은 아무거나 상관없습니다)
import React from 'react';
import { Outlet } from 'react-router-dom';

// 공통 헤더와 푸터 컴포넌트
const Header = () => <header>공통 헤더</header>;
const Footer = () => <footer>공통 푸터</footer>;

function CommonLayout() {
    return (
        <div>
            <Header />

        <main>
            {/*<Outlet /> 자리에 페이지만 바뀜 */}
            {/* (list.jsx 또는 detail.jsx 등이 여기에 들어옴) */}
            <Outlet /> 
        </main>

            <Footer />
        </div>
    );
}

export default CommonLayout;