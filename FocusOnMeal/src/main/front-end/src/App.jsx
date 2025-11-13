import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import Login from './pages/member/Login'
import IngredientLayout from './components/IngredientLayout';
import IngredientSearch from './pages/ingredient/list';
import NoticeList from './pages/board/notice/NoticeList';
import Header from "./components/common/Header";
import Dashboard from './pages/mypage/Dashboard';


function App() {
  
  return (
    <> 
      <Header />
      <Routes>
        {/* 메인페이지 */}
        <Route path="/" element={<div>홈페이지</div>} />

        {/* 회원 관련 */}
        <Route path="/member/login" element={<Login />} />

        {/* 마이페이지 관련 */}
        <Route path="/mypage" element={<Dashboard />} />

        {/* 식자재 관련 */}
        <Route path="/ingredient" element={<IngredientLayout />}>
          <Route index element={<IngredientSearch />} /> 
          <Route path="list" element={<IngredientSearch />} /> 
        </Route>

        {/* 공지사항 게시판 관련 */}
        <Route path="/board/notice/list" element={<NoticeList /> }/>
        {/* <Route path="/notice/detail" element={<NoticeDetail />} /> */}

        {/* 안전정보 게시판 관련 */}
      </Routes>
    </>
  );
}

export default App