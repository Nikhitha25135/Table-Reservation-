const mongoose = require('mongoose');
const { TIME_SLOTS, RESERVATION_STATUS } = require('../config/constants');

const reservationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    table: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Table',
      required: true,
    },
    date: {
      // stored as 'YYYY-MM-DD' string to keep date-only comparisons simple
      // and timezone-independent for this assignment's scope.
      type: String,
      required: [true, 'Reservation date is required'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'],
    },
    timeSlot: {
      type: String,
      required: [true, 'Time slot is required'],
      enum: TIME_SLOTS,
    },
    guests: {
      type: Number,
      required: [true, 'Number of guests is required'],
      min: [1, 'Guests must be at least 1'],
    },
    status: {
      type: String,
      enum: Object.values(RESERVATION_STATUS),
      default: RESERVATION_STATUS.CONFIRMED,
    },
  },
  { timestamps: true }
);

// A table cannot have two active (confirmed) reservations for the same
// date + time slot. Partial index only enforces this for confirmed
// reservations so cancelled ones don't block the slot.
reservationSchema.index(
  { table: 1, date: 1, timeSlot: 1 },
  {
    unique: true,
    partialFilterExpression: { status: RESERVATION_STATUS.CONFIRMED },
  }
);

module.exports = mongoose.model('Reservation', reservationSchema);
