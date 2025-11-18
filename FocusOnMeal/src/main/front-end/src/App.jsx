import { Routes, Route, Form } from 'react-router-dom'
import './App.css'
import Header from "./components/common/Header";

// 회원
import Login from './pages/member/Login'
import Join from './pages/member/Join';
import MyForm from './pages/member/MyForm';
import Terms from './pages/member/TermsContent';
import Privacy from './pages/member/PrivacyContent';

// 마이페이지
import Dashboard from './pages/mypage/Dashboard';
import ProtectedRoute from './components/mypage/ProtectedRoute';

// 식재료
import IngredientSearch from './pages/ingredient/list';
import IngredientDetail from './pages/ingredient/detail';

// 식단
import MealPlan from './pages/meal/MealPlan';


//게시판
import NoticeList from './pages/board/notice/NoticeList';

//관리자
import AdminDashboard from './pages/admin/AdminDashboard';
import MemberInfo from './pages/admin/MemberInfo';
import NoticeInfo from './pages/admin/NoticeInfo';

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

        {/* 식단 관련 */}
        <Route path="/meal/mealAI" element={<MealPlan />} />

        <Route path="/ingredient/detail/:id" element={<IngredientDetail />} />
      
        {/* 관리자 홈 (대시보드) */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/memberInfo" element={<MemberInfo />} />
        <Route path="/admin/noticeInfo" element={<NoticeInfo/>} />

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