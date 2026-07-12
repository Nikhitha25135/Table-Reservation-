// A literal small map of the room: every table the restaurant has, each
// drawn to roughly reflect its seating capacity, coloured by whether it can
// take the party for the currently-selected date/time/guest count.
export default function TableMap({ tables, availableIds, selectedId, onSelect, guests }) {
  if (!tables.length) {
    return <p className="table-map__empty">No tables have been set up yet.</p>;
  }

  return (
    <div className="table-map">
      {tables.map((table) => {
        const isAvailable = availableIds === null || availableIds.has(table._id);
        const tooSmall = guests && table.capacity < Number(guests);
        const disabled = !isAvailable || tooSmall;
        const selected = selectedId === table._id;
        const size = Math.min(1.4, 0.7 + table.capacity * 0.09);

        return (
          <button
            type="button"
            key={table._id}
            className={`table-chip ${selected ? 'table-chip--selected' : ''} ${disabled ? 'table-chip--disabled' : 'table-chip--available'}`}
            style={{ '--chip-scale': size }}
            onClick={() => !disabled && onSelect(table._id)}
            disabled={disabled}
            title={
              tooSmall
                ? `Seats ${table.capacity} — too small for ${guests} guests`
                : !isAvailable
                ? 'Already booked for this date and time'
                : `Table ${table.tableNumber} · seats ${table.capacity}`
            }
          >
            <span className="table-chip__number">{table.tableNumber}</span>
            <span className="table-chip__capacity">{table.capacity} seats</span>
          </button>
        );
      })}
    </div>
  );
}
