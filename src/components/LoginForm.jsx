
import React, { useContext, useState } from 'react';
import AuthContext from './AuthContext';

const LoginForm = () => {
  const { login } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = e => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please enter username and password');
      return;
    }
    setError('');
    login(username, password);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div className="card z-depth-5" style={{ maxWidth: 440, width: '90%', borderRadius: 20, padding: '48px 40px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        <form onSubmit={handleSubmit} autoComplete="on">
          <h4 className="center-align" style={{ marginBottom: 40, marginTop: 0, fontWeight: 700, fontSize: 32, color: '#333' }}>Sign In</h4>
          
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, fontSize: 14, color: '#555' }}>Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoComplete="username"
              required
              placeholder="Enter your username"
              style={{
                width: '100%',
                padding: '14px 16px',
                border: '2px solid #e0e0e0',
                borderRadius: 10,
                fontSize: 15,
                outline: 'none',
                transition: 'all 0.3s ease',
                backgroundColor: '#f8f9fa',
                boxSizing: 'border-box'
              }}
              onFocus={e => e.target.style.borderColor = '#667eea'}
              onBlur={e => e.target.style.borderColor = '#e0e0e0'}
            />
          </div>
          
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, fontSize: 14, color: '#555' }}>Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              placeholder="Enter your password"
              style={{
                width: '100%',
                padding: '14px 16px',
                border: '2px solid #e0e0e0',
                borderRadius: 10,
                fontSize: 15,
                outline: 'none',
                transition: 'all 0.3s ease',
                backgroundColor: '#f8f9fa',
                boxSizing: 'border-box'
              }}
              onFocus={e => e.target.style.borderColor = '#667eea'}
              onBlur={e => e.target.style.borderColor = '#e0e0e0'}
            />
          </div>
          
          {error && (
            <div style={{ 
              padding: '12px', 
              backgroundColor: '#ffebee', 
              color: '#c62828', 
              borderRadius: 8, 
              marginBottom: 20,
              fontSize: 14,
              textAlign: 'center',
              border: '1px solid #ef9a9a'
            }}>
              {error}
            </div>
          )}
          
          <button 
            type="submit" 
            style={{ 
              width: '100%', 
              borderRadius: 10, 
              fontWeight: 600, 
              fontSize: 16, 
              padding: '14px 0',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
              textTransform: 'uppercase',
              letterSpacing: 1.2,
              transition: 'all 0.3s ease',
              color: '#ffffff',
              cursor: 'pointer',
              textAlign: 'center',
              lineHeight: '1.5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseOver={e => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
            }}
            onMouseOut={e => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
            }}
          >
            <span style={{ color: '#ffffff', fontSize: 16, fontWeight: 600 }}>LOGIN</span>
          </button>
          
          <div style={{ marginTop: 24, textAlign: 'center', fontSize: 13, color: '#999' }}>
            Demo credentials: any username/password
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
