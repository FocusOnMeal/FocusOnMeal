import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import Login from './pages/member/Login'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/member/login" element={<Login />} />
        <Route path="/" element={<div>홈페이지</div>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
