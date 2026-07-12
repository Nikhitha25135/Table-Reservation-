const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Reservation = require('../models/Reservation');
const Table = require('../models/Table');
const { RESERVATION_STATUS, TIME_SLOTS } = require('../config/constants');

// Finds tables with enough capacity that do NOT already have a confirmed
// reservation for the given date + timeSlot.
const findAvailableTables = async (date, timeSlot, guests) => {
  const bookedTableIds = await Reservation.find({
    date,
    timeSlot,
    status: RESERVATION_STATUS.CONFIRMED,
  }).distinct('table');

  const candidates = await Table.find({
    isActive: true,
    capacity: { $gte: guests },
    _id: { $nin: bookedTableIds },
  }).sort({ capacity: 1 }); // smallest suitable table first -> efficient allocation

  return candidates;
};

// @desc    Check which tables are available for a given date/timeSlot/guests
// @route   GET /api/reservations/availability?date=YYYY-MM-DD&timeSlot=...&guests=2
// @access  Private
const checkAvailability = asyncHandler(async (req, res) => {
  const { date, timeSlot, guests } = req.query;

  if (!date || !timeSlot || !guests) {
    throw new ApiError(400, 'date, timeSlot and guests query parameters are required');
  }
  if (!TIME_SLOTS.includes(timeSlot)) {
    throw new ApiError(400, `timeSlot must be one of: ${TIME_SLOTS.join(', ')}`);
  }

  const availableTables = await findAvailableTables(date, timeSlot, Number(guests));

  res.status(200).json({
    success: true,
    count: availableTables.length,
    data: availableTables,
  });
});

// @desc    Create a reservation for the logged-in customer
// @route   POST /api/reservations
// @access  Private
const createReservation = asyncHandler(async (req, res) => {
  const { date, timeSlot, guests, tableId } = req.body;

  // Reject bookings for dates in the past.
  const today = new Date().toISOString().slice(0, 10);
  if (date < today) {
    throw new ApiError(400, 'Cannot create a reservation for a past date');
  }

  let table;

  if (tableId) {
    table = await Table.findOne({ _id: tableId, isActive: true });
    if (!table) {
      throw new ApiError(404, 'Selected table not found or inactive');
    }
    if (table.capacity < guests) {
      throw new ApiError(
        400,
        `Table ${table.tableNumber} only seats ${table.capacity} guests`
      );
    }

    const conflict = await Reservation.findOne({
      table: table._id,
      date,
      timeSlot,
      status: RESERVATION_STATUS.CONFIRMED,
    });
    if (conflict) {
      throw new ApiError(
        409,
        'This table is already booked for the selected date and time slot'
      );
    }
  } else {
    // No specific table requested: auto-assign the smallest table that fits.
    const available = await findAvailableTables(date, timeSlot, guests);
    if (available.length === 0) {
      throw new ApiError(
        409,
        'No tables are available for the selected date, time slot and party size'
      );
    }
    table = available[0];
  }

  // The unique partial index on (table, date, timeSlot) is the final
  // safety net against race conditions between the check above and the
  // insert below (two concurrent requests for the same slot).
  let reservation;
  try {
    reservation = await Reservation.create({
      user: req.user._id,
      table: table._id,
      date,
      timeSlot,
      guests,
    });
  } catch (err) {
    if (err.code === 11000) {
      throw new ApiError(
        409,
        'This table was just booked by someone else for that slot. Please try another table or time.'
      );
    }
    throw err;
  }

  const populated = await reservation.populate('table', 'tableNumber capacity');

  res.status(201).json({ success: true, data: populated });
});

// @desc    Get the logged-in customer's own reservations
// @route   GET /api/reservations/me
// @access  Private
const getMyReservations = asyncHandler(async (req, res) => {
  const reservations = await Reservation.find({ user: req.user._id })
    .populate('table', 'tableNumber capacity')
    .sort({ date: -1, timeSlot: 1 });

  res.status(200).json({ success: true, count: reservations.length, data: reservations });
});

// @desc    Cancel the logged-in customer's own reservation
// @route   DELETE /api/reservations/:id
// @access  Private
const cancelMyReservation = asyncHandler(async (req, res) => {
  const reservation = await Reservation.findById(req.params.id);

  if (!reservation) {
    throw new ApiError(404, 'Reservation not found');
  }
  if (reservation.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You can only cancel your own reservations');
  }
  if (reservation.status === RESERVATION_STATUS.CANCELLED) {
    throw new ApiError(400, 'Reservation is already cancelled');
  }

  reservation.status = RESERVATION_STATUS.CANCELLED;
  await reservation.save();

  res.status(200).json({ success: true, message: 'Reservation cancelled', data: reservation });
});

module.exports = {
  checkAvailability,
  createReservation,
  getMyReservations,
  cancelMyReservation,
};
