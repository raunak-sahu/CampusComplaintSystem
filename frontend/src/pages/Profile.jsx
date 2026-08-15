import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Navbar from '../components/Navbar';

function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access');

    if (!token) {
      window.location.replace('/');
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await api.get('auth/profile/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log('PROFILE:', res.data);
        setProfile(res.data);
      } catch (err) {
        console.log(
          'PROFILE ERROR:',
          err.response?.data || err.message
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.removeItem('role');

    window.location.replace('/');
  };

  return (
    <div
      style={{
        padding: 32,
        fontFamily: 'Arial, sans-serif',
        background: '#f5f7fb',
        minHeight: '100vh',
      }}
    >
      <Navbar
        title='My Profile'
        role='student'
        onLogout={handleLogout}
      />

      <div
        style={{
          maxWidth: 800,
          margin: '24px auto',
        }}
      >
        <button
          type='button'
          onClick={() => navigate('/dashboard')}
          style={{
            marginBottom: 20,
            padding: '10px 16px',
            background: '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
          }}
        >
          ← Back to Dashboard
        </button>

        <div
          style={{
            background: '#fff',
            padding: 28,
            borderRadius: 16,
            boxShadow: '0 10px 24px rgba(0,0,0,0.08)',
          }}
        >
          <h2 style={{ marginTop: 0 }}>Student Profile</h2>

          {loading ? (
            <p>Loading profile...</p>
          ) : profile ? (
            <div
              style={{
                display: 'grid',
                gap: 20,
              }}
            >
              <div
                style={{
                  padding: 16,
                  background: '#f8fafc',
                  borderRadius: 10,
                }}
              >
                <p
                  style={{
                    margin: '0 0 6px',
                    color: '#64748b',
                  }}
                >
                  Username
                </p>

                <h3 style={{ margin: 0 }}>
                  {profile.username}
                </h3>
              </div>

              <div
                style={{
                  padding: 16,
                  background: '#f8fafc',
                  borderRadius: 10,
                }}
              >
                <p
                  style={{
                    margin: '0 0 6px',
                    color: '#64748b',
                  }}
                >
                  Email
                </p>

                <h3 style={{ margin: 0 }}>
                  {profile.email || 'Not provided'}
                </h3>
              </div>

              <div
                style={{
                  padding: 16,
                  background: '#f8fafc',
                  borderRadius: 10,
                }}
              >
                <p
                  style={{
                    margin: '0 0 6px',
                    color: '#64748b',
                  }}
                >
                  Role
                </p>

                <h3 style={{ margin: 0 }}>
                  {profile.is_staff
                    ? 'Administrator'
                    : 'Student'}
                </h3>
              </div>
            </div>
          ) : (
            <p>
              Unable to load profile information.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;