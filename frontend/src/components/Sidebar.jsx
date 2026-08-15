import { useNavigate } from 'react-router-dom';

function Sidebar({ role }) {
  const navigate = useNavigate();

  const items =
    role === 'admin'
      ? ['Dashboard', 'All Complaints', 'Reports', 'Settings']
      : ['Dashboard', 'My Complaints', 'Create Complaint', 'Profile'];

  const handleClick = (item) => {
    if (role !== 'student') return;

    if (item === 'Dashboard') {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
      return;
    }

    if (item === 'Create Complaint') {
      const form = document.getElementById('complaint-form');

      if (form) {
        form.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }

      return;
    }

    if (item === 'My Complaints') {
      const complaintsSection =
        document.getElementById('my-complaints') ||
        document.querySelector('.complaints-section');

      if (complaintsSection) {
        complaintsSection.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      } else {
        window.scrollTo({
          top: 600,
          behavior: 'smooth',
        });
      }

      return;
    }

    if (item === 'Profile') {
      navigate('/profile');
      return;
    }
  };

  return (
    <aside
      style={{
        background: '#ffffff',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 6px 18px rgba(0,0,0,0.08)',
        height: 'fit-content',
      }}
    >
      <h3
        style={{
          marginTop: 0,
          color: '#1e3a8a',
        }}
      >
        {role === 'admin' ? 'Admin Menu' : 'Student Menu'}
      </h3>

      <div
        style={{
          display: 'grid',
          gap: '10px',
        }}
      >
        {items.map((item) => (
          <button
            key={item}
            type='button'
            onClick={() => handleClick(item)}
            style={{
              textAlign: 'left',
              padding: '10px 12px',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              background: '#f8fafc',
              cursor: 'pointer',
            }}
          >
            {item}
          </button>
        ))}
      </div>
    </aside>
  );
}

export default Sidebar;