import { useState } from 'react';
import api from '../api';

function Login() {
const [username, setUsername] = useState('');
const [password, setPassword] = useState('');
const [loading, setLoading] = useState(false);
const [error, setError] = useState('');

const handleLogin = async (e) => {
e.preventDefault();
setLoading(true);
setError('');
try {
  const res = await api.post('auth/login/', {
    username,
    password,
  });

  localStorage.setItem('access', res.data.access);
  localStorage.setItem('refresh', res.data.refresh);

  const profile = await api.get('auth/profile/', {
    headers: {
      Authorization: `Bearer ${res.data.access}`,
    },
  });

  console.log('Profile:', profile.data);

 localStorage.setItem('role', profile.data.is_staff ? 'admin' : 'student');

if (profile.data.is_staff) {
  window.location.replace('/admin');
} else {
  window.location.replace('/dashboard');
}
} catch (err) {
  console.log(err.response?.data || err.message);
  setError(err.response?.data?.detail || 'Invalid username or password');
} finally {
  setLoading(false);
}

};

return (
<div
style={{
minHeight: '100vh',
display: 'flex',
alignItems: 'center',
justifyContent: 'center',
background: '#eef2f7',
fontFamily: 'Arial, sans-serif',
}}
>
<div
style={{
width: 430,
background: '#fff',
padding: 36,
borderRadius: 14,
boxShadow: '0 12px 30px rgba(0,0,0,0.12)',
}}
>
<h1 style={{ margin: 0, color: '#1e3a8a' }}>Campus Complaint System</h1>
    <p style={{ color: '#64748b', marginTop: 10, marginBottom: 28 }}>
      Sign in with your student or admin account
    </p>

    <form onSubmit={handleLogin}>
      <input
        type='text'
        placeholder='Username'
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={{
          width: '100%',
          padding: 14,
          marginBottom: 16,
          border: '1px solid #cbd5e1',
          borderRadius: 10,
          boxSizing: 'border-box',
        }}
      />

      <input
        type='password'
        placeholder='Password'
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{
          width: '100%',
          padding: 14,
          marginBottom: 20,
          border: '1px solid #cbd5e1',
          borderRadius: 10,
          boxSizing: 'border-box',
        }}
      />

      <button
        type='submit'
        disabled={loading}
        style={{
          width: '100%',
          padding: 14,
          background: '#2563eb',
          color: '#fff',
          border: 'none',
          borderRadius: 10,
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? 'Signing in...' : 'Login'}
      </button>
    </form>

    {error && (
      <p style={{ color: '#dc2626', marginTop: 18, textAlign: 'center' }}>
        {error}
      </p>
    )}
  </div>
</div>
);
}

export default Login;
