import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Banner from '../components/Banner';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'customer' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const user = await register(form.name, form.email, form.password, form.role);
      navigate(user.role === 'admin' ? '/admin' : '/book', { replace: true });
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
        <h1>Create an account</h1>
        <p className="auth-card__sub">Reserve tables and track your bookings.</p>

        <Banner tone="error">{error}</Banner>

        <form className="form" onSubmit={handleSubmit}>
          <label className="form__field">
            <span>Full name</span>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Alex Rivera"
              autoComplete="name"
            />
          </label>
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
              minLength={6}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="At least 6 characters"
              autoComplete="new-password"
            />
          </label>

          <fieldset className="form__fieldset">
            <legend>Account type</legend>
            <label className="form__radio">
              <input
                type="radio"
                name="role"
                checked={form.role === 'customer'}
                onChange={() => setForm({ ...form, role: 'customer' })}
              />
              <span>Guest &mdash; book and manage my own reservations</span>
            </label>
            <label className="form__radio">
              <input
                type="radio"
                name="role"
                checked={form.role === 'admin'}
                onChange={() => setForm({ ...form, role: 'admin' })}
              />
              <span>Administrator &mdash; manage the restaurant's bookings</span>
            </label>
          </fieldset>

          <button type="submit" className="btn btn--brass" disabled={submitting}>
            {submitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="auth-card__foot">
          Already registered? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
