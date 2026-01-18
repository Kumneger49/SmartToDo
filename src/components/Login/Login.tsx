import { useState } from 'react';
import { authApi } from '../../api/api';
import styles from './Login.module.css';

interface LoginProps {
  onLoginSuccess: () => void;
  onSwitchToSignup: () => void;
}

export const Login = ({ onLoginSuccess, onSwitchToSignup }: LoginProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await authApi.login(email, password);
      onLoginSuccess();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      if (errorMessage.includes('fetch')) {
        setError('Cannot connect to server. Make sure the backend is running on http://localhost:3000');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <h2 className={styles.title}>Welcome to BarakaFlow</h2>
        <p className={styles.subtitle}>Sign in to continue</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}

          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              placeholder="your.email@example.com"
              required
              disabled={loading}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              placeholder="Enter your password"
              required
              disabled={loading}
              minLength={6}
            />
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className={styles.switchAuth}>
          <p className={styles.switchText}>
            Don't have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToSignup}
              className={styles.switchButton}
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
