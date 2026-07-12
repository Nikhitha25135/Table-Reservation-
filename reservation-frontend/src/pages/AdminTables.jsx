import { useEffect, useState } from 'react';
import { getTables, createTable, updateTable, deleteTable } from '../api/tables';
import Banner from '../components/Banner';
import Spinner from '../components/Spinner';

export default function AdminTables() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [newTable, setNewTable] = useState({ tableNumber: '', capacity: '' });
  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getTables(true);
      setTables(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setCreating(true);
    try {
      await createTable({
        tableNumber: Number(newTable.tableNumber),
        capacity: Number(newTable.capacity),
      });
      setNewTable({ tableNumber: '', capacity: '' });
      setSuccess('Table added.');
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleToggleActive = async (table) => {
    setBusyId(table._id);
    setError('');
    try {
      if (table.isActive) {
        await deleteTable(table._id); // soft-delete (sets isActive false)
      } else {
        await updateTable(table._id, { isActive: true });
      }
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const handleCapacityChange = async (table, capacity) => {
    setBusyId(table._id);
    setError('');
    try {
      await updateTable(table._id, { capacity: Number(capacity) });
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="page page--admin">
      <div className="ledger-heading">
        <span className="panel__eyebrow panel__eyebrow--on-ink">Administration</span>
        <h2>Tables</h2>
        <p className="panel__sub panel__sub--on-ink">Set up the room. Deactivated tables keep their reservation history but stop taking new bookings.</p>
      </div>

      <form className="filter-bar" onSubmit={handleCreate}>
        <label className="form__field form__field--narrow">
          <span>Table number</span>
          <input
            type="number"
            min={1}
            required
            value={newTable.tableNumber}
            onChange={(e) => setNewTable({ ...newTable, tableNumber: e.target.value })}
          />
        </label>
        <label className="form__field form__field--narrow">
          <span>Capacity</span>
          <input
            type="number"
            min={1}
            required
            value={newTable.capacity}
            onChange={(e) => setNewTable({ ...newTable, capacity: e.target.value })}
          />
        </label>
        <button type="submit" className="btn btn--brass" disabled={creating}>
          {creating ? 'Adding…' : 'Add table'}
        </button>
      </form>

      <Banner tone="error">{error}</Banner>
      <Banner tone="success">{success}</Banner>

      {loading ? (
        <Spinner label="Loading tables" />
      ) : (
        <div className="ledger">
          <table className="ledger__table">
            <thead>
              <tr>
                <th>Table</th>
                <th>Capacity</th>
                <th>Status</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {tables
                .sort((a, b) => a.tableNumber - b.tableNumber)
                .map((table) => (
                  <tr key={table._id}>
                    <td className="mono">Table {table.tableNumber}</td>
                    <td>
                      <input
                        type="number"
                        min={1}
                        className="inline-input"
                        defaultValue={table.capacity}
                        disabled={busyId === table._id}
                        onBlur={(e) => {
                          if (Number(e.target.value) !== table.capacity) {
                            handleCapacityChange(table, e.target.value);
                          }
                        }}
                      />
                    </td>
                    <td>
                      <span className={`status-badge ${table.isActive ? 'status-badge--confirmed' : 'status-badge--cancelled'}`}>
                        <span className="status-badge__dot" />
                        {table.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="ledger__actions">
                      <button
                        type="button"
                        className={`btn btn--small ${table.isActive ? 'btn--wine' : 'btn--ghost'}`}
                        onClick={() => handleToggleActive(table)}
                        disabled={busyId === table._id}
                      >
                        {busyId === table._id ? 'Saving…' : table.isActive ? 'Deactivate' : 'Reactivate'}
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
