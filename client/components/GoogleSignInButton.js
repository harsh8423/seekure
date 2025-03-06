'use client';
import Cookies from 'js-cookie';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function GoogleSignInButton() {
  const router = useRouter();

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      window.google.accounts.id.initialize({
        client_id: '904389234161-6a296iocvp1702cflt0coo00deb7qdpe.apps.googleusercontent.com',
        callback: handleCredentialResponse,
      });

      window.google.accounts.id.renderButton(
        document.getElementById('google-signin'),
        { theme: 'outline', size: 'large' }
      );
    };
  }, []);

  const handleCredentialResponse = async (response) => {
    try {
      const result = await fetch('https://seekure.onrender.com/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: response.credential,
        }),
      });

      const data = await result.json();
      
      if (data.token) {
        // Store the token
        Cookies.set('token', data.token);
        localStorage.setItem('token', data.token);
        
        // Navigate based on resume status
        if (!data.hasResume) {
          router.push(`/resume/${data.userId}`);
        } else {
          router.push(`/home/${data.userId}`);
        }
      }
    } catch (error) {
      console.error('Error during Google sign-in:', error);
    }
  };

  return <div id="google-signin"></div>;
}