import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider }    from './context/AuthContext'
import { ThemeProvider }   from './context/ThemeContext'
import Sidebar             from './components/Layout/Sidebar'
import Navbar              from './components/Layout/Navbar'
import ClientSidebar       from './components/Layout/ClientSidebar'
import ProtectedRoute      from './components/ProtectedRoute'
import Landing             from './pages/Landing'
import Login               from './pages/Login'
import Register            from './pages/Register'
import Pricing             from './pages/Pricing'
import Honeypots           from './pages/Honeypots'
import News                from './pages/News'
import Dashboard           from './pages/Dashboard'
import Education           from './pages/Education'
import ArticlePage         from './pages/ArticlePage'
import AttackDetail        from './pages/AttackDetail'
import HoneypotDetail      from './pages/HoneypotDetail'
import AdminQuizResults    from './pages/AdminQuizResults'
import AdminEmployees      from './pages/AdminEmployees'
import AdminClients        from './pages/AdminClients'
import AdminClientView     from './pages/AdminClientView'
import Academy             from './pages/Academy'
import ClientDashboard     from './pages/client/ClientDashboard'
import ClientSensors       from './pages/client/ClientSensors'
import ClientAlerts        from './pages/client/ClientAlerts'
import ClientReports       from './pages/client/ClientReports'
import ClientAccount       from './pages/client/ClientAccount'

function AppLayout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar" style={{ background: 'var(--bg)' }}>
          {children}
        </main>
      </div>
    </div>
  )
}

function ClientLayout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <ClientSidebar />
      <main className="flex-1 overflow-y-auto p-8 custom-scrollbar" style={{ background: 'var(--bg)' }}>
        {children}
      </main>
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/"          element={<Landing />}   />
          <Route path="/login"     element={<Login />}     />
          <Route path="/register"  element={<Register />}  />
          <Route path="/pricing"   element={<Pricing />}   />
          <Route path="/honeypots"      element={<Honeypots />}    />
          <Route path="/news"           element={<News />}         />
          <Route path="/academy"        element={<Academy />}      />
          <Route path="/academy/:slug"  element={<ArticlePage />}  />

          {/* Employee + Admin */}
          <Route path="/dashboard" element={
            <ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>
          } />
          <Route path="/education" element={
            <ProtectedRoute><AppLayout><Education /></AppLayout></ProtectedRoute>
          } />
          <Route path="/education/:slug" element={
            <ProtectedRoute><AppLayout><ArticlePage /></AppLayout></ProtectedRoute>
          } />

          {/* Admin only */}
          <Route path="/admin/quiz-results" element={
            <ProtectedRoute requiredRole="admin"><AppLayout><AdminQuizResults /></AppLayout></ProtectedRoute>
          } />
          <Route path="/admin/employees" element={
            <ProtectedRoute requiredRole="admin"><AppLayout><AdminEmployees /></AppLayout></ProtectedRoute>
          } />
          <Route path="/admin/clients" element={
            <ProtectedRoute requiredRole="admin"><AppLayout><AdminClients /></AppLayout></ProtectedRoute>
          } />
          <Route path="/admin/clients/:id" element={
            <ProtectedRoute requiredRole="admin"><AppLayout><AdminClientView /></AppLayout></ProtectedRoute>
          } />
          <Route path="/attacks/:id" element={
            <ProtectedRoute requiredRole="admin"><AppLayout><AttackDetail /></AppLayout></ProtectedRoute>
          } />
          <Route path="/honeypots/:name" element={
            <ProtectedRoute requiredRole="admin"><AppLayout><HoneypotDetail /></AppLayout></ProtectedRoute>
          } />

          {/* Client portal */}
          <Route path="/client/dashboard" element={
            <ProtectedRoute requiredRole="client"><ClientLayout><ClientDashboard /></ClientLayout></ProtectedRoute>
          } />
          <Route path="/client/sensors" element={
            <ProtectedRoute requiredRole="client"><ClientLayout><ClientSensors /></ClientLayout></ProtectedRoute>
          } />
          <Route path="/client/alerts" element={
            <ProtectedRoute requiredRole="client"><ClientLayout><ClientAlerts /></ClientLayout></ProtectedRoute>
          } />
          <Route path="/client/reports" element={
            <ProtectedRoute requiredRole="client"><ClientLayout><ClientReports /></ClientLayout></ProtectedRoute>
          } />
          <Route path="/client/account" element={
            <ProtectedRoute requiredRole="client"><ClientLayout><ClientAccount /></ClientLayout></ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </ThemeProvider>
  )
}
