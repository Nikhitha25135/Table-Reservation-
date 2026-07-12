import { Fragment, useEffect, useState } from 'react';
import { getAllReservations, updateReservation, cancelReservation } from '../api/admin';
import { getTables } from '../api/tables';
import { TIME_SLOTS, RESERVATION_STATUS } from '../utils/constants';
import { formatDateLong } from '../utils/date';
import Banner from '../components/Banner';
import Spinner from '../components/Spinner';
import StatusBadge from '../components/StatusBadge';

export default function AdminReservations() {
  const [reservations, setReservations] = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ date: '', status: '' });

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState('');
  const [cancellingId, setCancellingId] = useState(null);

  const load = async (activeFilters = filters) => {
    setLoading(true);
    setError('');
    try {
      const cleaned = Object.fromEntries(Object.entries(activeFilters).filter(([, v]) => v));
      const res = await getAllReservations(cleaned);
      setReservations(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getTables(true).then((res) => setTables(res.data)).catch(() => {});
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyFilters = (e) => {
    e.preventDefault();
    load(filters);
  };

  const clearFilters = () => {
    const cleared = { date: '', status: '' };
    setFilters(cleared);
    load(cleared);
  };

  const startEdit = (reservation) => {
    setEditingId(reservation._id);
    setEditError('');
    setEditForm({
      date: reservation.date,
      timeSlot: reservation.timeSlot,
      guests: reservation.guests,
      tableId: reservation.table?._id || '',
      status: reservation.status,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
    setEditError('');
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setEditError('');
    try {
      await updateReservation(editingId, {
        date: editForm.date,
        timeSlot: editForm.timeSlot,
        guests: Number(editForm.guests),
        tableId: editForm.tableId,
        status: editForm.status,
      });
      cancelEdit();
      load();
    } catch (err) {
      setEditError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async (reservation) => {
    setCancellingId(reservation._id);
    try {
      await cancelReservation(reservation._id);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setCancellingId(null);
    }
  };

  const grouped = reservations.reduce((acc, r) => {
    acc[r.date] = acc[r.date] || [];
    acc[r.date].push(r);
    return acc;
  }, {});
  const dates = Object.keys(grouped).sort();

  return (
    <div className="page page--admin">
      <div className="ledger-heading">
        <span className="panel__eyebrow panel__eyebrow--on-ink">Administration</span>
        <h2>Reservation ledger</h2>
        <p className="panel__sub panel__sub--on-ink">Every booking across the restaurant, filterable by date and status.</p>
      </div>

      <form className="filter-bar" onSubmit={applyFilters}>
        <label className="form__field">
          <span>Date</span>
          <input type="date" value={filters.date} onChange={(e) => setFilters({ ...filters, date: e.target.value })} />
        </label>
        <label className="form__field">
          <span>Status</span>
          <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
            <option value="">All</option>
            <option value={RESERVATION_STATUS.CONFIRMED}>Confirmed</option>
            <option value={RESERVATION_STATUS.CANCELLED}>Cancelled</option>
          </select>
        </label>
        <button type="submit" className="btn btn--brass">
          Apply filters
        </button>
        <button type="button" className="btn btn--ghost" onClick={clearFilters}>
          Clear
        </button>
      </form>

      <Banner tone="error">{error}</Banner>

      {loading ? (
        <Spinner label="Loading reservations" />
      ) : reservations.length === 0 ? (
        <p className="empty-state empty-state--on-ink">No reservations match these filters.</p>
      ) : (
        <div className="ledger">
          {dates.map((date) => (
            <div key={date} className="ledger__group">
              <div className="ledger__date-rule">
                <span>{formatDateLong(date)}</span>
              </div>
              <table className="ledger__table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Guest</th>
                    <th>Party</th>
                    <th>Table</th>
                    <th>Status</th>
                    <th aria-label="Actions" />
                  </tr>
                </thead>
                <tbody>
                  {grouped[date]
                    .sort((a, b) => a.timeSlot.localeCompare(b.timeSlot))
                    .map((r) => (
                      <Fragment key={r._id}>
                        <tr className={editingId === r._id ? 'is-editing' : ''}>
                          <td className="mono">{r.timeSlot}</td>
                          <td>
                            {r.user?.name}
                            <div className="ledger__email">{r.user?.email}</div>
                          </td>
                          <td>{r.guests}</td>
                          <td className="mono">
                            {r.table?.tableNumber ?? '—'}
                            {r.table?.capacity ? ` (${r.table.capacity})` : ''}
                          </td>
                          <td>
                            <StatusBadge status={r.status} />
                          </td>
                          <td className="ledger__actions">
                            <button type="button" className="btn btn--ghost btn--small" onClick={() => startEdit(r)}>
                              Edit
                            </button>
                            {r.status === 'confirmed' && (
                              <button
                                type="button"
                                className="btn btn--wine btn--small"
                                onClick={() => handleCancel(r)}
                                disabled={cancellingId === r._id}
                              >
                                {cancellingId === r._id ? 'Cancelling…' : 'Cancel'}
                              </button>
                            )}
                          </td>
                        </tr>
                        {editingId === r._id && (
                          <tr className="ledger__edit-row">
                            <td colSpan={6}>
                              <form className="edit-form" onSubmit={saveEdit}>
                                <Banner tone="error">{editError}</Banner>
                                <div className="edit-form__grid">
                                  <label className="form__field">
                                    <span>Date</span>
                                    <input
                                      type="date"
                                      value={editForm.date}
                                      onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                                    />
                                  </label>
                                  <label className="form__field">
                                    <span>Time slot</span>
                                    <select
                                      value={editForm.timeSlot}
                                      onChange={(e) => setEditForm({ ...editForm, timeSlot: e.target.value })}
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
                                      value={editForm.guests}
                                      onChange={(e) => setEditForm({ ...editForm, guests: e.target.value })}
                                    />
                                  </label>
                                  <label className="form__field">
                                    <span>Table</span>
                                    <select
                                      value={editForm.tableId}
                                      onChange={(e) => setEditForm({ ...editForm, tableId: e.target.value })}
                                    >
                                      {tables.map((t) => (
                                        <option key={t._id} value={t._id}>
                                          Table {t.tableNumber} · seats {t.capacity}
                                          {!t.isActive ? ' (inactive)' : ''}
                                        </option>
                                      ))}
                                    </select>
                                  </label>
                                  <label className="form__field">
                                    <span>Status</span>
                                    <select
                                      value={editForm.status}
                                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                                    >
                                      <option value={RESERVATION_STATUS.CONFIRMED}>Confirmed</option>
                                      <option value={RESERVATION_STATUS.CANCELLED}>Cancelled</option>
                                    </select>
                                  </label>
                                </div>
                                <div className="edit-form__actions">
                                  <button type="submit" className="btn btn--brass btn--small" disabled={saving}>
                                    {saving ? 'Saving…' : 'Save changes'}
                                  </button>
                                  <button type="button" className="btn btn--ghost btn--small" onClick={cancelEdit}>
                                    Discard
                                  </button>
                                </div>
                              </form>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
