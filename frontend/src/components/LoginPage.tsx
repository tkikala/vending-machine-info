import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { signup } from '../api';
import { useNavigate, useLocation } from 'react-router-dom';
import DarkModeToggle from './DarkModeToggle';
import { useDarkMode } from '../hooks/useDarkMode';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [signupMode, setSignupMode] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useDarkMode();

  const from = location.state?.from?.pathname || '/admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      // Redirect based on user role
      if (user?.role === 'ADMIN') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/my-machines', { replace: true });
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async () => {
    try {
      const res = await fetch('/api/auth?action=google');
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (e) {
      setError('Failed to start Google login');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Get reCAPTCHA v3 token
      let captchaToken = '';
      console.log('reCAPTCHA available:', !!(window as any).grecaptcha);
      console.log('reCAPTCHA object:', (window as any).grecaptcha);
      
      if ((window as any).grecaptcha) {
        try {
          console.log('Attempting reCAPTCHA execute...');
          captchaToken = await (window as any).grecaptcha.execute('6LdyX6grAAAAAJ_fSEF9e1TQJMP8I6udIl0znNeC', {
            action: 'SIGNUP'
          });
          console.log('reCAPTCHA token received:', captchaToken ? 'YES' : 'NO');
        } catch (err) {
          console.warn('reCAPTCHA failed:', err);
          // Continue without CAPTCHA
        }
      } else {
        console.warn('reCAPTCHA not loaded');
      }
      
      await signup(email, password, captchaToken);
      navigate('/my-machines', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="header">
        <h1>Vending Machine Admin</h1>
        <p style={{ color: '#888', fontWeight: 500 }}>Sign in to manage vending machines</p>
        <div className="dark-toggle">
          <DarkModeToggle mode={mode} setMode={setMode} />
        </div>
      </div>

      <div className="login-container">
        <div className="login-card">
          <h2>{signupMode ? 'Create Account' : 'Admin Login'}</h2>
          
          {signupMode && (
            <div style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
              color: 'white', 
              padding: '12px', 
              borderRadius: '8px', 
              marginBottom: '16px',
              fontSize: '14px'
            }}>
              <strong>🎉 Free to Start!</strong> Create your account and get immediate access to:
              <ul style={{ margin: '8px 0 0 20px', padding: 0 }}>
                <li>Add up to 5 vending machines</li>
                <li>Basic analytics and customer reviews</li>
                <li>QR code generation</li>
                <li>No credit card required</li>
              </ul>
            </div>
          )}
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <form onSubmit={signupMode ? handleSignup : handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder={signupMode ? "your@email.com" : "admin@vendingmachine.com"}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                minLength={signupMode ? 8 : undefined}
              />
              {signupMode && (
                <small style={{ color: '#888', fontSize: '12px' }}>
                  Password must be at least 8 characters long
                </small>
              )}
            </div>

            {signupMode && (
              <div className="form-group" style={{ marginTop: '16px' }}>
                <small style={{ color: '#888', fontSize: '12px', textAlign: 'center', display: 'block' }}>
                  🔒 Protected by Google reCAPTCHA v3
                </small>
                <small style={{ color: '#666', fontSize: '10px', textAlign: 'center', display: 'block', marginTop: '4px' }}>
                  (Invisible protection - no interaction needed)
                </small>
              </div>
            )}

            <button 
              type="submit" 
              className="login-button"
              disabled={loading}
            >
              {loading ? (signupMode ? 'Creating account...' : 'Signing in...') : (signupMode ? 'Create Account' : 'Sign In')}
            </button>
          </form>

          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
            <button className="login-button" onClick={googleLogin} style={{ background: 'linear-gradient(135deg,#4285F4,#34A853)', border: 'none' }}>
              Continue with Google
            </button>
          </div>

          <div style={{ marginTop: 10 }}>
            <button className="login-button" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'var(--text-main)' }} onClick={() => setSignupMode(!signupMode)}>
              {signupMode ? 'Have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage; 