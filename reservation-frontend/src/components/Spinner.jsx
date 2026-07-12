export default function Spinner({ full = false, label = 'Loading' }) {
  const spinner = (
    <div className="spinner" role="status" aria-label={label}>
      <span className="spinner__ring" />
      <span className="spinner__label">{label}&hellip;</span>
    </div>
  );

  if (!full) return spinner;

  return <div className="spinner-full">{spinner}</div>;
}
