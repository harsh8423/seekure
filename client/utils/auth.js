'use client';
export async function getSession() {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return null;
  }

  try {
    const res = await fetch('http://localhost:5000/api/auth/verify', {
      headers: {
        'Authorization': `Bearer ${token}` // Make sure 'Bearer' is included
      },
      credentials: 'include',
      mode: 'cors'
    });

    if (res.ok) {
        const data = await res.json();
      return data.id;
    }
    return null;
  } catch (error) {
    return null;
  }
}