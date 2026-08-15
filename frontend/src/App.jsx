import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
function App() {
  const token = localStorage.getItem('access');
  const role = localStorage.getItem('role');

  return (
    <Routes>
      <Route
        path='/'
        element={
          token ? (
            role === 'admin'
              ? <Navigate to='/admin' replace />
              : <Navigate to='/dashboard' replace />
          ) : (
            <Login />
          )
        }
      />

      <Route
        path='/dashboard'
        element={
          token && role === 'student'
            ? <StudentDashboard />
            : <Navigate to='/' replace />
        }
      />
<Route
  path='/profile'
  element={
    token && role === 'student'
      ? <Profile />
      : <Navigate to='/' replace />
  }
/>
      <Route
        path='/admin'
        element={
          token && role === 'admin'
            ? <AdminDashboard />
            : <Navigate to='/' replace />
        }
      />
    </Routes>
  );
}

export default App;