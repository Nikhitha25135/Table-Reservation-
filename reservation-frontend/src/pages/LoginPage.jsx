import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Banner from '../components/Banner';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const user = await login(form.email, form.password);
      const redirectTo = location.state?.from?.pathname || (user.role === 'admin' ? '/admin' : '/book');
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-card__eyebrow">The Ledger</div>
        <h1>Welcome back</h1>
        <p className="auth-card__sub">Sign in to book a table or manage the room.</p>

        <Banner tone="error">{error}</Banner>

        <form className="form" onSubmit={handleSubmit}>
          <label className="form__field">
            <span>Email</span>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </label>
          <label className="form__field">
            <span>Password</span>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </label>
          <button type="submit" className="btn btn--brass" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="auth-card__foot">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
