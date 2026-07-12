import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="auth-screen">
      <div className="auth-card auth-card--center">
        <div className="auth-card__eyebrow">404</div>
        <h1>Page not found</h1>
        <p className="auth-card__sub">That page doesn&rsquo;t exist.</p>
        <Link to="/" className="btn btn--brass">
          Back home
        </Link>
      </div>
    </div>
  );
}
