import { Routes, Route } from 'react-router-dom'
import './App.css'
import Login from './pages/member/Login'
import IngredientSearch from './pages/ingredient/list';
import IngredientDetail from './pages/ingredient/detail';
import Header from "./components/common/Header";
import AdminDashboard from './pages/admin/AdminDashboard';
import Dashboard from './pages/mypage/Dashboard';


function App() {

	return (
		<>
		<Header />
		<Routes>
			<Route path="/member/login" element={<Login />} />
			<Route path="/" element={<div>홈페이지</div>} />
			<Route path="/ingredient/list" element={<IngredientSearch />} />
            <Route path="/ingredient/:id" element={<IngredientDetail />} />
			{/* 관리자 홈 (대시보드) */}
			<Route path="/admin" element={<AdminDashboard />} />
			{/* 마이페이지 홈 (대시보드) */}
			<Route path="/mypage" element={<Dashboard />} />
		</Routes>
		</>
	)
}

export default App
