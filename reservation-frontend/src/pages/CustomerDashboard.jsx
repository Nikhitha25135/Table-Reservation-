import { useEffect, useState } from 'react';
import { getTables } from '../api/tables';
import { checkAvailability, createReservation, getMyReservations, cancelMyReservation } from '../api/reservations';
import { TIME_SLOTS } from '../utils/constants';
import { todayISO } from '../utils/date';
import Banner from '../components/Banner';
import Spinner from '../components/Spinner';
import TicketCard from '../components/TicketCard';
import TableMap from '../components/TableMap';

export default function CustomerDashboard() {
  const [tables, setTables] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState('');

  const [form, setForm] = useState({ date: todayISO(), timeSlot: TIME_SLOTS[0], guests: 2 });
  const [availableIds, setAvailableIds] = useState(null); // null = not checked yet
  const [selectedTableId, setSelectedTableId] = useState(null);
  const [checking, setChecking] = useState(false);
  const [booking, setBooking] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [cancellingId, setCancellingId] = useState(null);

  const loadReservations = async () => {
    setLoadingList(true);
    setListError('');
    try {
      const res = await getMyReservations();
      setReservations(res.data);
    } catch (err) {
      setListError(err.message);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    getTables().then((res) => setTables(res.data)).catch(() => {});
    loadReservations();
  }, []);

  const handleCheckAvailability = async (e) => {
    e?.preventDefault();
    setFormError('');
    setFormSuccess('');
    setChecking(true);
    setSelectedTableId(null);
    try {
      const res = await checkAvailability(form.date, form.timeSlot, form.guests);
      setAvailableIds(new Set(res.data.map((t) => t._id)));
    } catch (err) {
      setFormError(err.message);
      setAvailableIds(null);
    } finally {
      setChecking(false);
    }
  };

  const handleBook = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setBooking(true);
    try {
      await createReservation({
        date: form.date,
        timeSlot: form.timeSlot,
        guests: Number(form.guests),
        ...(selectedTableId ? { tableId: selectedTableId } : {}),
      });
      setFormSuccess('Table reserved. Your ticket is below.');
      setAvailableIds(null);
      setSelectedTableId(null);
      loadReservations();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setBooking(false);
    }
  };

  const handleCancel = async (reservation) => {
    setCancellingId(reservation._id);
    try {
      await cancelMyReservation(reservation._id);
      loadReservations();
    } catch (err) {
      setListError(err.message);
    } finally {
      setCancellingId(null);
    }
  };

  const upcoming = reservations.filter((r) => r.status === 'confirmed');
  const past = reservations.filter((r) => r.status === 'cancelled');

  return (
    <div className="page page--customer">
      <section className="panel panel--form">
        <div className="panel__heading">
          <span className="panel__eyebrow">Step 1 &middot; 2</span>
          <h2>Reserve a table</h2>
          <p className="panel__sub">Pick a date, time and party size, then choose a table from the room.</p>
        </div>

        <form className="form form--inline" onSubmit={handleCheckAvailability}>
          <label className="form__field">
            <span>Date</span>
            <input
              type="date"
              min={todayISO()}
              required
              value={form.date}
              onChange={(e) => {
                setForm({ ...form, date: e.target.value });
                setAvailableIds(null);
              }}
            />
          </label>
          <label className="form__field">
            <span>Time slot</span>
            <select
              value={form.timeSlot}
              onChange={(e) => {
                setForm({ ...form, timeSlot: e.target.value });
                setAvailableIds(null);
              }}
            >
              {TIME_SLOTS.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </label>
          <label className="form__field form__field--narrow">
            <span>Guests</span>
            <input
              type="number"
              min={1}
              required
              value={form.guests}
              onChange={(e) => {
                setForm({ ...form, guests: e.target.value });
                setAvailableIds(null);
              }}
            />
          </label>
          <button type="submit" className="btn btn--ink" disabled={checking}>
            {checking ? 'Checking…' : 'Check availability'}
          </button>
        </form>

        <Banner tone="error" onDismiss={() => setFormError('')}>
          {formError}
        </Banner>
        <Banner tone="success" onDismiss={() => setFormSuccess('')}>
          {formSuccess}
        </Banner>

        {availableIds !== null && (
          <div className="panel__map-block">
            <div className="panel__heading panel__heading--tight">
              <span className="panel__eyebrow">Step 2 &middot; 2</span>
              <h3>Choose a table</h3>
              <p className="panel__sub">
                {availableIds.size === 0
                  ? 'No tables are free for that slot — try another date, time or party size.'
                  : 'Highlighted tables fit your party and are free for this slot. You can also let us assign one automatically.'}
              </p>
            </div>
            <TableMap
              tables={tables}
              availableIds={availableIds}
              selectedId={selectedTableId}
              onSelect={setSelectedTableId}
              guests={form.guests}
            />
            {availableIds.size > 0 && (
              <form onSubmit={handleBook} className="panel__confirm">
                <button type="submit" className="btn btn--brass" disabled={booking}>
                  {booking
                    ? 'Reserving…'
                    : selectedTableId
                    ? 'Reserve selected table'
                    : 'Reserve — auto-assign smallest fit'}
                </button>
              </form>
            )}
          </div>
        )}
      </section>

      <section className="panel panel--list">
        <div className="panel__heading">
          <span className="panel__eyebrow">Your bookings</span>
          <h2>My reservations</h2>
        </div>

        <Banner tone="error">{listError}</Banner>

        {loadingList ? (
          <Spinner label="Loading your reservations" />
        ) : upcoming.length === 0 && past.length === 0 ? (
          <p className="empty-state">No reservations yet — book your first table above.</p>
        ) : (
          <>
            {upcoming.length > 0 && (
              <div className="ticket-grid">
                {upcoming.map((r) => (
                  <TicketCard key={r._id} reservation={r} onCancel={handleCancel} cancelling={cancellingId === r._id} />
                ))}
              </div>
            )}
            {past.length > 0 && (
              <details className="past-reservations">
                <summary>Cancelled reservations ({past.length})</summary>
                <div className="ticket-grid">
                  {past.map((r) => (
                    <TicketCard key={r._id} reservation={r} />
                  ))}
                </div>
              </details>
            )}
          </>
        )}
      </section>
    </div>
  );
}
