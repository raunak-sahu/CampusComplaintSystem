import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

function StudentDashboard() {
const [complaints, setComplaints] = useState([]);
const [history, setHistory] = useState([]);

const [historyComplaintId, setHistoryComplaintId] = useState(null);
const [title, setTitle] = useState('');
const [description, setDescription] = useState('');
const [category, setCategory] = useState('Electrical');
const [priority, setPriority] = useState('Medium');
const[editingId,setEditingId]=useState(null);
const navigate = useNavigate();
const[comments,setComments]=useState({});
const[newComment,setNewComment]=useState({});
const[commentLoading,setCommentLoading]=useState({});
const[image,setImage]=useState(null);
const fetchComplaints = async () => {
try {
const res = await api.get('complaints/my/');
const data = Array.isArray(res.data) ? res.data : res.data.results || [];
setComplaints(data);
} catch (err) {
console.log(err.response?.data || err.message);
  if (err.response?.status === 401) {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.removeItem('role');
    window.location.replace('/');
  }
}

};
const fetchProfile = async (token) => {
  try {
    const res = await api.get('auth/profile/', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setProfile(res.data);
  } catch (err) {
    console.log(err.response?.data || err.message);
  }
};
useEffect(() => {
const token = localStorage.getItem('access');
if (!token) {
  window.location.replace('/');
  return;
}

fetchComplaints();
fetchProfile(token);
}, []);
const fetchHistory = async (complaintId) => {
  try {
    const token = localStorage.getItem('access');

    console.log('Fetching history for complaint:', complaintId);

    const res = await api.get(
      `complaints/${complaintId}/history/`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log('History response:', res.data);

    const data = Array.isArray(res.data)
      ? res.data
      : res.data.results || [];

    setHistory(data);
    setHistoryComplaintId(complaintId);
  } catch (err) {
    console.log(
      'History error:',
      err.response?.data || err.message
    );
  }
};
const fetchComments=async(complaintId)=>{
    const token=localStorage.getItem('access');
    try{
        const res=await api.get(`complaints/${complaintId}/comments/`,
            {
                headers:{
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        const data=Array.isArray(res.data)?res.data:res.data.results||[];
        setComments((prev)=>({
            ...prev,
            [complaintId]:data,
        }));
    }
    catch(err){
        console.log(err.response?.data || err.message);
    }
};

const handleAddComment=async(complaintId)=>{
    const token=localStorage.getItem('access');
    const commentText=newComment[complaintId]?.trim();
    if(!commentText){
        return;
    }

    setCommentLoading((prev)=>({
        ...prev,[complaintId]:true,
    }));

    try{
        await api.post(`complaints/${complaintId}/comments/add/`,
        {
            text:commentText,
        },
        {
            headers:{Authorization:`Bearer ${token}`,},
        }
    );

    await fetchComments(complaintId);
    setNewComment((prev) => ({
    ...prev,
    [complaintId]: '',
}));
    }
    catch(err){
        console.log(err.response?.data|| err.message);
        alert('Unable to add comment.');
    }
    finally{
        setCommentLoading((prev)=>({
            ...prev,[complaintId]:false,
        }));
    }
};

const handleCreateComplaint = async (e) => {
  e.preventDefault();

  const token = localStorage.getItem("access");

  try {
    const formData = new FormData();

    formData.append("title", title);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("priority", priority);

    if (image) {
      formData.append("image", image);
    }

    console.log("CREATING COMPLAINT");
    console.log("title:", title);
    console.log("description:", description);
    console.log("category:", category);
    console.log("priority:", priority);
    console.log("image:", image);
    console.log("token exists:", !!token);

    const response = await api.post(
      "complaints/",
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("COMPLAINT CREATED:", response.data);

    // Clear form
    setTitle("");
    setDescription("");
    setCategory("Electrical");
    setPriority("Medium");
    setImage(null);

    // Refresh complaints
    fetchComplaints(token);

    alert("Complaint created successfully!");

  } catch (err) {
    console.error("CREATE COMPLAINT ERROR:");

    console.error("Status:", err.response?.status);
    console.error("Data:", err.response?.data);
    console.error("Message:", err.message);

    if (err.response?.status === 401) {
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      localStorage.removeItem("role");

      window.location.replace("/");
      return;
    }

    alert(
      JSON.stringify(
        err.response?.data || err.message,
        null,
        2
      )
    );
  }
};
const handleDeleteComplaint = async (id) => {
  const confirmDelete = window.confirm(
    'Are you sure you want to delete this complaint?'
  );

  if (!confirmDelete) {
    return;
  }

  const token = localStorage.getItem('access');

  try {
    await api.delete(`complaints/${id}/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setComplaints((prevComplaints) =>
      prevComplaints.filter((complaint) => complaint.id !== id)
    );
  } catch (err) {
    console.log(err.response?.data || err.message);
    alert('Unable to delete complaint.');
  }
};

const handleEditComplaint = async (e) => {
  e.preventDefault();

  const token = localStorage.getItem('access');

  try {
    await api.patch(
      `complaints/${editingId}/`,
      {
        title,
        description,
        category,
        priority,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setEditingId(null);
    setTitle('');
    setDescription('');
    setCategory('Electrical');
    setPriority('Medium');

    fetchComplaints(token);
  } catch (err) {
    console.log(err.response?.data || err.message);
    alert('Unable to update complaint.');
  }
};

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
> <Navbar
     title='My Complaints'
     role='student'
     onLogout={handleLogout}
   />
  <div
     style={{
       display: 'grid',
       gridTemplateColumns:
         window.innerWidth < 768 ? '1fr' : '260px 1fr',
       gap: '24px',
    }}
  >
    <Sidebar role='student' />

<div>

  {/* WRITE COMPLAINT BUTTON */}
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 16,
      marginBottom: 20,
      background: '#ffffff',
      padding: 20,
      borderRadius: 12,
      boxShadow: '0 6px 18px rgba(0,0,0,0.08)',
    }}
  >
    <div>
      <h2
        style={{
          margin: 0,
          color: '#0f172a',
        }}
      >
        Need to report an issue?
      </h2>

      <p
        style={{
          margin: '6px 0 0',
          color: '#64748b',
          fontSize: 14,
        }}
      >
        Submit a new complaint and track its progress.
      </p>
    </div>

    <button
      type="button"
      onClick={() => {
        document
          .getElementById('complaint-form')
          ?.scrollIntoView({
            behavior: 'smooth',
          });
      }}
      style={{
        padding: '12px 18px',
        border: 'none',
        borderRadius: 10,
        background: 'linear-gradient(90deg, #2563eb, #4f46e5)',
        color: '#ffffff',
        fontWeight: 700,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        boxShadow: '0 8px 20px rgba(37,99,235,0.2)',
      }}
    >
      + Write a Complaint
    </button>
  </div>

  {/* STATS */}
  <div
    style={{
      display: 'grid',
      gridTemplateColumns:
        window.innerWidth < 768
          ? '1fr'
          : window.innerWidth < 1024
          ? 'repeat(2, 1fr)'
          : 'repeat(4, 1fr)',
      gap: 16,
      marginBottom: 24,
    }}
  >
        <div
          style={{
            background: '#fff',
            padding: 20,
            borderRadius: 12,
            boxShadow: '0 6px 18px rgba(0,0,0,0.08)',
          }}
        >
          <p style={{ margin: 0, color: '#64748b' }}>Total</p>
          <h2 style={{ margin: '8px 0 0' }}>{complaints.length}</h2>
        </div>

        <div
          style={{
            background: '#fff',
            padding: 20,
            borderRadius: 12,
            boxShadow: '0 6px 18px rgba(0,0,0,0.08)',
          }}
        >
          <p style={{ margin: 0, color: '#64748b' }}>Pending</p>
          <h2 style={{ margin: '8px 0 0' }}>
            {complaints.filter(c => c.status === 'Pending').length}
          </h2>
        </div>

        <div
          style={{
            background: '#fff',
            padding: 20,
            borderRadius: 12,
            boxShadow: '0 6px 18px rgba(0,0,0,0.08)',
          }}
        >
          <p style={{ margin: 0, color: '#64748b' }}>In Progress</p>
          <h2 style={{ margin: '8px 0 0' }}>
            {complaints.filter(c => c.status === 'In Progress').length}
          </h2>
        </div>

        <div
          style={{
            background: '#fff',
            padding: 20,
            borderRadius: 12,
            boxShadow: '0 6px 18px rgba(0,0,0,0.08)',
          }}
        >
          <p style={{ margin: 0, color: '#64748b' }}>Resolved</p>
          <h2 style={{ margin: '8px 0 0' }}>
            {complaints.filter(c => c.status === 'Resolved').length}
          </h2>
        </div>
      </div>

     <form
  id="complaint-form"
  onSubmit={
    editingId
      ? handleEditComplaint
      : handleCreateComplaint
  }
  style={{
          background: '#fff',
          padding: 20,
          borderRadius: 12,
          marginBottom: 24,
          boxShadow: '0 6px 18px rgba(0,0,0,0.08)',
        }}
      >
        <h2 style={{ marginTop: 0 }}>
          {editingId ? 'Edit Complaint' : 'Create Complaint'}
        </h2>

        <input
          type='text'
          placeholder='Complaint title'
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{
            width: '100%',
            padding: 12,
            marginBottom: 12,
            border: '1px solid #cbd5e1',
            borderRadius: 8,
            boxSizing: 'border-box',
          }}
        />

        <textarea
          placeholder='Describe the issue'
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          style={{
            width: '100%',
            padding: 12,
            marginBottom: 12,
            border: '1px solid #cbd5e1',
            borderRadius: 8,
            boxSizing: 'border-box',
          }}
        />

        <div
  style={{
    display: 'grid',
    gridTemplateColumns:
      window.innerWidth < 768 ? '1fr' : '1fr 1fr',
    gap: 12,
    marginBottom: 12,
  }}
>
  {/* Image Upload */}
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
    }}
  >
    <label
      style={{
        fontSize: 14,
        fontWeight: 600,
        color: '#334155',
      }}
    >
      Attach Image (optional)
    </label>

    <input
      type="file"
      accept="image/*"
      onChange={(e) =>
        setImage(e.target.files[0] || null)
      }
      style={{
        width: '100%',
        padding: '10px',
        border: '1px solid #cbd5e1',
        borderRadius: 8,
        boxSizing: 'border-box',
        background: '#fff',
      }}
    />
  </div>

  {/* Category */}
  <select
    value={category}
    onChange={(e) => setCategory(e.target.value)}
    style={{
      padding: 12,
      border: '1px solid #cbd5e1',
      borderRadius: 8,
      width: '100%',
      boxSizing: 'border-box',
      background: '#fff',
    }}
  >
    <option value="Electrical">Electrical</option>
    <option value="Water">Water</option>
    <option value="Hostel">Hostel</option>
    <option value="Internet">Internet</option>
    <option value="Mess">Mess</option>
    <option value="Cleaning">Cleaning</option>
    <option value="Other">Other</option>
  </select>

  {/* Priority */}
  <select
    value={priority}
    onChange={(e) => setPriority(e.target.value)}
    style={{
      padding: 12,
      border: '1px solid #cbd5e1',
      borderRadius: 8,
      width: '100%',
      boxSizing: 'border-box',
      background: '#fff',
    }}
  >
    <option value="Low">Low</option>
    <option value="Medium">Medium</option>
    <option value="High">High</option>
    <option value="Urgent">Urgent</option>
  </select>
</div>

       <button
  type='submit'
  style={{
    padding: '12px 20px',
    background: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
  }}
>
  {editingId ? 'Update Complaint' : 'Submit Complaint'}
</button>

{editingId && (
  <button
    type='button'
    onClick={() => {
      setEditingId(null);
      setTitle('');
      setDescription('');
      setCategory('Electrical');
      setPriority('Medium');
    }}
    style={{
      padding: '12px 20px',
      marginLeft: 10,
      background: '#64748b',
      color: '#fff',
      border: 'none',
      borderRadius: 8,
      cursor: 'pointer',
    }}
  >
    Cancel Edit
  </button>
)}
      </form>
<div id='my-complaints'>
  {complaints.length === 0 ? (
    <p>No complaints submitted yet.</p>
  ) : (
    complaints.map((c) => (
      <div
        key={c.id}
        style={{
          background: '#fff',
          padding: 20,
          borderRadius: 12,
          marginBottom: 16,
          boxShadow: '0 6px 18px rgba(0,0,0,0.08)',
        }}
      >
        <h3 style={{ marginTop: 0 }}>{c.title}</h3>

        <p>{c.description}</p>

        <div
          style={{
            display: 'flex',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <span>
            <strong>Category:</strong> {c.category}
          </span>

          <span>
            <strong>Status:</strong> {c.status}
          </span>

          <span>
            <strong>Priority:</strong> {c.priority}
          </span>
        </div>

        {c.image && (
          <img
            src={c.image}
            alt='Complaint'
            style={{
              width: '100%',
              maxWidth: 300,
              marginTop: 12,
              borderRadius: 8,
            }}
          />
        )}

        <div
          style={{
            marginTop: 16,
            display: 'flex',
            gap: 10,
            flexWrap: 'wrap',
            justifyContent: 'flex-end',
          }}
        >
          <button
            type='button'
            onClick={() => {
              setEditingId(c.id);
              setTitle(c.title);
              setDescription(c.description);
              setCategory(c.category);
              setPriority(c.priority);

              const form = document.getElementById('complaint-form');

              if (form) {
                form.scrollIntoView({
                  behavior: 'smooth',
                  block: 'start',
                });
              }
            }}
            style={{
              padding: '10px 16px',
              background: '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
            }}
          >
            Edit Complaint
          </button>

          <button
            type='button'
            onClick={() => handleDeleteComplaint(c.id)}
            style={{
              padding: '10px 16px',
              background: '#dc2626',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
            }}
          >
            Delete Complaint
          </button>

          <button
            type='button'
            onClick={() => fetchHistory(c.id)}
            style={{
              padding: '10px 16px',
              background: '#7c3aed',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
            }}
          >
            View History
          </button>
        </div>

        <div
          style={{
            marginTop: 20,
            paddingTop: 16,
            borderTop: '1px solid #e5e7eb',
          }}
        >
          <button
            type='button'
            onClick={() => fetchComments(c.id)}
            style={{
              padding: '8px 14px',
              background: '#475569',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
            }}
          >
            View Comments
          </button>

          {comments[c.id] && (
            <div style={{ marginTop: 14 }}>
              {comments[c.id].length === 0 ? (
                <p style={{ color: '#64748b' }}>
                  No comments yet.
                </p>
              ) : (
                comments[c.id].map((comment) => (
                  <div
                    key={comment.id}
                    style={{
                      background: '#f8fafc',
                      padding: 12,
                      borderRadius: 8,
                      marginBottom: 8,
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <strong>{comment.user || 'User'}</strong>

                    <p
                      style={{
                        margin: '6px 0 0',
                        color: '#475569',
                      }}
                    >
                      {comment.message}
                    </p>
                  </div>
                ))
              )}

              <div
                style={{
                  display: 'flex',
                  gap: 10,
                  marginTop: 12,
                  flexWrap: 'wrap',
                }}
              >
                <input
                  type='text'
                  placeholder='Write a comment...'
                  value={newComment[c.id] || ''}
                  onChange={(e) =>
                    setNewComment((prev) => ({
                      ...prev,
                      [c.id]: e.target.value,
                    }))
                  }
                  style={{
                    flex: 1,
                    minWidth: '200px',
                    padding: 10,
                    border: '1px solid #cbd5e1',
                    borderRadius: 8,
                    boxSizing: 'border-box',
                  }}
                />

                <button
                  type='button'
                  disabled={commentLoading[c.id]}
                  onClick={() => handleAddComment(c.id)}
                  style={{
                    padding: '10px 16px',
                    background: '#2563eb',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    cursor: commentLoading[c.id]
                      ? 'not-allowed'
                      : 'pointer',
                  }}
                >
                  {commentLoading[c.id]
                    ? 'Adding...'
                    : 'Add Comment'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    ))
  )}
</div>

{historyComplaintId && (
  <div
    style={{
      background: '#fff',
      padding: 20,
      borderRadius: 12,
      marginTop: 20,
      boxShadow: '0 6px 18px rgba(0,0,0,0.08)',
    }}
  >
    <h2 style={{ marginTop: 0 }}>Complaint History</h2>

    {history.length === 0 ? (
      <p>No history available.</p>
    ) : (
      history.map((item) => (
        <div
          key={item.id}
          style={{
            borderBottom: '1px solid #e5e7eb',
            padding: '12px 0',
          }}
        >
          <p style={{ margin: '0 0 6px' }}>
            <strong>Status:</strong> {item.status}
          </p>

          <p style={{ margin: '0 0 6px', color: '#64748b' }}>
            {item.created_at}
          </p>

          {item.comment && (
            <p style={{ margin: 0 }}>
              <strong>Comment:</strong> {item.comment}
            </p>
          )}
        </div>
      ))
    )}

    <button
      type='button'
      onClick={() => {
        setHistory([]);
        setHistoryComplaintId(null);
      }}
      style={{
        marginTop: 16,
        padding: '10px 16px',
        background: '#64748b',
        color: '#fff',
        border: 'none',
        borderRadius: 8,
        cursor: 'pointer',
      }}
    >
      Close History
    </button>
  </div>
)}
    </div>
  </div>
</div>

);
}

export default StudentDashboard;