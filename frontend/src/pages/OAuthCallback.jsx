import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import apiService from '../services/apiService';

function OAuthCallback({ onLogin }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('Processing...');
  const [error, setError] = useState(null);

  useEffect(() => {
    const code = searchParams.get('code');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      setError('LinkedIn authentication was cancelled or failed');
      setTimeout(() => navigate('/'), 3000);
      return;
    }

    if (code) {
      handleCallback(code);
    } else {
      setError('No authorization code received');
      setTimeout(() => navigate('/'), 3000);
    }
  }, [searchParams, navigate]);

  const handleCallback = async (code) => {
    try {
      setStatus('Fetching your LinkedIn profile...');
      const response = await apiService.axiosInstance.get('/api/auth/profile');
      
      setStatus('Success! Redirecting to dashboard...');
      onLogin(response.data);
      
      setTimeout(() => navigate('/'), 500);
    } catch (err) {
      console.error('OAuth error:', err);
      setError('Failed to fetch profile data. Please try again.');
      setTimeout(() => navigate('/'), 3000);
    }
  };

  return (
    <div className="oauth-callback">
      <div className="callback-container">
        {error ? (
          <>
            <div className="error-icon">❌</div>
            <h2>Authentication Error</h2>
            <p>{error}</p>
            <p className="redirect-msg">Redirecting to home page...</p>
          </>
        ) : (
          <>
            <div className="loading-spinner"></div>
            <h2>{status}</h2>
            <p>Please wait while we fetch your LinkedIn profile data...</p>
          </>
        )}
      </div>
    </div>
  );
}

export default OAuthCallback;
