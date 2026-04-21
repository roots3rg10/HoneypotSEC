import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Layout/Sidebar'
import Navbar  from './components/Layout/Navbar'
import Dashboard   from './pages/Dashboard'
import Education   from './pages/Education'
import ArticlePage from './pages/ArticlePage'
import AttackDetail from './pages/AttackDetail'

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Navbar />
          <main className="flex-1 overflow-y-auto p-6 bg-dark-900">
            <Routes>
              <Route path="/"               element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard"      element={<Dashboard />} />
              <Route path="/attacks/:id"    element={<AttackDetail />} />
              <Route path="/education"      element={<Education />} />
              <Route path="/education/:slug" element={<ArticlePage />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  )
}
