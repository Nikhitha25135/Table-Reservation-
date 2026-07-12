export default function Banner({ tone = 'error', children, onDismiss }) {
  if (!children) return null;
  return (
    <div className={`banner banner--${tone}`} role={tone === 'error' ? 'alert' : 'status'}>
      <span>{children}</span>
      {onDismiss && (
        <button type="button" className="banner__dismiss" onClick={onDismiss} aria-label="Dismiss">
          &times;
        </button>
      )}
    </div>
  );
}
