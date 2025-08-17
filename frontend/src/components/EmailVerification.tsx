import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export default function EmailVerification() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setStatus('error');
        setMessage('No verification token provided');
        return;
      }

      try {
        const response = await fetch(`/api/auth?action=verify-email&token=${token}`, {
          method: 'GET',
          credentials: 'include'
        });

        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage('Email verified successfully! You now have full access to all features.');
          
          // Update the user context with verified status
          if (data.user) {
            // Force a page reload to update all components
            window.location.href = '/my-machines';
          }
        } else {
          setStatus('error');
          setMessage(data.error || 'Verification failed');
        }
      } catch (error) {
        setStatus('error');
        setMessage('Network error. Please try again.');
      }
    };

    verifyEmail();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-slate-700">
          <div className="text-center">
            {status === 'loading' && (
              <>
                <div className="text-4xl mb-4">⏳</div>
                <h1 className="text-2xl font-bold mb-4">Verifying Email</h1>
                <p className="text-gray-300">Please wait while we verify your email address...</p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="text-4xl mb-4">✅</div>
                <h1 className="text-2xl font-bold mb-4 text-green-400">Email Verified!</h1>
                <p className="text-gray-300 mb-6">{message}</p>
                <button
                  onClick={() => navigate('/my-machines')}
                  className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Go to My Machines
                </button>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="text-4xl mb-4">❌</div>
                <h1 className="text-2xl font-bold mb-4 text-red-400">Verification Failed</h1>
                <p className="text-gray-300 mb-6">{message}</p>
                <button
                  onClick={() => navigate('/my-machines')}
                  className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Go to My Machines
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
