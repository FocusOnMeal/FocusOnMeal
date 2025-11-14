import { Routes, Route, Form } from 'react-router-dom'
import './App.css'
import Login from './pages/member/Login'
import IngredientSearch from './pages/ingredient/list';
import IngredientDetail from './pages/ingredient/detail';
import NoticeList from './pages/board/notice/NoticeList';
import Header from "./components/common/Header";
import AdminDashboard from './pages/admin/AdminDashboard';
import Dashboard from './pages/mypage/Dashboard';
import MyForm from './pages/member/MyForm';
import Terms from './pages/member/TermsContent';
import Privacy from './pages/member/PrivacyContent';
import Join from './pages/member/Join';
import ProtectedRoute from './components/mypage/ProtectedRoute';


function App() {
  
  return (
    <> 
      <Header />
      <Routes>
        {/* 메인페이지 */}
        <Route path="/" element={<div>홈페이지</div>} />

        {/* 회원 관련 */}
        <Route path="/member/login" element={<Login />} />
        <Route path="/member/form" element={<MyForm />} />
        <Route path="/member/terms" element={<Terms />} />
        <Route path="/member/privacy" element={<Privacy />} />
        <Route path="/member/Join" element={<Join />} />

        {/* 마이페이지 관련 */}
        <Route path="/mypage" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>} 
        />

        {/* 식자재 관련 */}
        <Route path="/ingredient/list" element={<IngredientSearch />} />
        <Route path="/ingredient/:id" element={<IngredientDetail />} />
      
        {/* 관리자 홈 (대시보드) */}
        <Route path="/admin" element={<AdminDashboard />} />
        {/* 마이페이지 홈 (대시보드) */}
        <Route path="/mypage" element={<Dashboard />} />

        {/* 공지사항 게시판 관련 */}
        <Route path="/board/notice/list" element={<NoticeList /> }/>
        {/* <Route path="/notice/detail" element={<NoticeDetail />} /> */}

        {/* 안전정보 게시판 관련 */}
      </Routes>
    </>
  );
}

export default App