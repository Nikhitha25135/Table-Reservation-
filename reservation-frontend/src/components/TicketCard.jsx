import StatusBadge from './StatusBadge';
import { formatDateLong } from '../utils/date';

export default function TicketCard({ reservation, onCancel, cancelling, ownerLabel }) {
  const { date, timeSlot, guests, table, status } = reservation;
  const canCancel = status === 'confirmed' && onCancel;

  return (
    <div className="ticket">
      <div className="ticket__perforation" aria-hidden="true" />
      <div className="ticket__body">
        <div className="ticket__row ticket__row--top">
          <span className="ticket__eyebrow">Reservation</span>
          <StatusBadge status={status} />
        </div>

        <div className="ticket__main">
          <div className="ticket__date">{formatDateLong(date)}</div>
          <div className="ticket__time">{timeSlot}</div>
        </div>

        <div className="ticket__meta">
          <div>
            <span className="ticket__meta-label">Guests</span>
            <span className="ticket__meta-value">{guests}</span>
          </div>
          <div>
            <span className="ticket__meta-label">Table</span>
            <span className="ticket__meta-value">
              {table?.tableNumber ?? '—'}
              {table?.capacity ? ` · seats ${table.capacity}` : ''}
            </span>
          </div>
          {ownerLabel && (
            <div>
              <span className="ticket__meta-label">Guest name</span>
              <span className="ticket__meta-value">{ownerLabel}</span>
            </div>
          )}
        </div>

        {canCancel && (
          <button type="button" className="btn btn--wine btn--small" onClick={() => onCancel(reservation)} disabled={cancelling}>
            {cancelling ? 'Cancelling…' : 'Cancel reservation'}
          </button>
        )}
      </div>
      <div className="ticket__stamp" style={{ '--stamp-rotate': `${((reservation.table?.tableNumber ?? 0) % 5) - 2}deg` }}>
        T{table?.tableNumber ?? '—'}
      </div>
    </div>
  );
}
