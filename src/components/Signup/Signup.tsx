import { useState } from 'react';
import { authApi } from '../../api/api';
import styles from './Signup.module.css';

interface SignupProps {
  onSignupSuccess: () => void;
  onSwitchToLogin: () => void;
}

export const Signup = ({ onSignupSuccess, onSwitchToLogin }: SignupProps) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      await authApi.register(email, password, name);
      onSignupSuccess();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign up failed';
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
        <h2 className={styles.title}>Create Your Account</h2>
        <p className={styles.subtitle}>Join BarakaFlow to get started</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}

          <div className={styles.inputGroup}>
            <label htmlFor="name" className={styles.label}>Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={styles.input}
              placeholder="Your name"
              required
              disabled={loading}
            />
          </div>

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
              placeholder="At least 6 characters"
              required
              disabled={loading}
              minLength={6}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="confirmPassword" className={styles.label}>Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={styles.input}
              placeholder="Confirm your password"
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
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <div className={styles.switchAuth}>
          <p className={styles.switchText}>
            Already have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className={styles.switchButton}
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
