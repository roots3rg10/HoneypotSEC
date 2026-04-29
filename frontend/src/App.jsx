import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar        from './components/Layout/Sidebar'
import Navbar         from './components/Layout/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Landing        from './pages/Landing'
import Login          from './pages/Login'
import Honeypots      from './pages/Honeypots'
import News           from './pages/News'
import Dashboard      from './pages/Dashboard'
import Education      from './pages/Education'
import ArticlePage    from './pages/ArticlePage'
import AttackDetail   from './pages/AttackDetail'
import HoneypotDetail from './pages/HoneypotDetail'

function AppLayout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-8 bg-slate-950 custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/"           element={<Landing />}   />
        <Route path="/login"      element={<Login />}     />
        <Route path="/honeypots"  element={<Honeypots />} />
        <Route path="/news"       element={<News />}      />

        {/* Protected */}
        <Route path="/dashboard" element={
          <ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>
        } />
        <Route path="/attacks/:id" element={
          <ProtectedRoute><AppLayout><AttackDetail /></AppLayout></ProtectedRoute>
        } />
        <Route path="/honeypots/:name" element={
          <ProtectedRoute><AppLayout><HoneypotDetail /></AppLayout></ProtectedRoute>
        } />
        <Route path="/education" element={
          <ProtectedRoute><AppLayout><Education /></AppLayout></ProtectedRoute>
        } />
        <Route path="/education/:slug" element={
          <ProtectedRoute><AppLayout><ArticlePage /></AppLayout></ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}
