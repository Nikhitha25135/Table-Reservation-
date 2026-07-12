export default function StatusBadge({ status }) {
  const isConfirmed = status === 'confirmed';
  return (
    <span className={`status-badge status-badge--${isConfirmed ? 'confirmed' : 'cancelled'}`}>
      <span className="status-badge__dot" />
      {isConfirmed ? 'Confirmed' : 'Cancelled'}
    </span>
  );
}
