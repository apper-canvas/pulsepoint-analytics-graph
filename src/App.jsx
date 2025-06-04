import { Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Home from './pages/Home'
import FeedbackForms from './pages/FeedbackForms'
import Analytics from './pages/Analytics'
import Clients from './pages/Clients'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import NotFound from './pages/NotFound'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 to-surface-100">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/feedback-forms" element={<FeedbackForms />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        className="mt-16"
        toastClassName="bg-white shadow-lg border border-surface-200"
      />
    </div>
  )
}

export default App