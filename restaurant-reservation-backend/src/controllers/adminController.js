const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Reservation = require('../models/Reservation');
const Table = require('../models/Table');
const { RESERVATION_STATUS, TIME_SLOTS } = require('../config/constants');

// @desc    Get all reservations, optionally filtered by date and/or status
// @route   GET /api/admin/reservations?date=YYYY-MM-DD&status=confirmed
// @access  Private/Admin
const getAllReservations = asyncHandler(async (req, res) => {
  const { date, status } = req.query;

  const filter = {};
  if (date) filter.date = date;
  if (status) filter.status = status;

  const reservations = await Reservation.find(filter)
    .populate('user', 'name email')
    .populate('table', 'tableNumber capacity')
    .sort({ date: 1, timeSlot: 1 });

  res.status(200).json({ success: true, count: reservations.length, data: reservations });
});

// @desc    Get a single reservation by id
// @route   GET /api/admin/reservations/:id
// @access  Private/Admin
const getReservationById = asyncHandler(async (req, res) => {
  const reservation = await Reservation.findById(req.params.id)
    .populate('user', 'name email')
    .populate('table', 'tableNumber capacity');

  if (!reservation) {
    throw new ApiError(404, 'Reservation not found');
  }

  res.status(200).json({ success: true, data: reservation });
});

// @desc    Update any reservation (date, timeSlot, guests, table, status)
// @route   PUT /api/admin/reservations/:id
// @access  Private/Admin
const updateReservation = asyncHandler(async (req, res) => {
  const reservation = await Reservation.findById(req.params.id);
  if (!reservation) {
    throw new ApiError(404, 'Reservation not found');
  }

  const { date, timeSlot, guests, tableId, status } = req.body;

  const nextDate = date ?? reservation.date;
  const nextTimeSlot = timeSlot ?? reservation.timeSlot;
  const nextGuests = guests ?? reservation.guests;
  const nextTableId = tableId ?? reservation.table.toString();

  if (timeSlot && !TIME_SLOTS.includes(timeSlot)) {
    throw new ApiError(400, `timeSlot must be one of: ${TIME_SLOTS.join(', ')}`);
  }

  const table = await Table.findById(nextTableId);
  if (!table) {
    throw new ApiError(404, 'Table not found');
  }
  if (table.capacity < nextGuests) {
    throw new ApiError(400, `Table ${table.tableNumber} only seats ${table.capacity} guests`);
  }

  // If date/time/table are changing, re-check for conflicts with other
  // active reservations (excluding this reservation itself).
  const conflict = await Reservation.findOne({
    _id: { $ne: reservation._id },
    table: table._id,
    date: nextDate,
    timeSlot: nextTimeSlot,
    status: RESERVATION_STATUS.CONFIRMED,
  });
  if (conflict && (status ?? reservation.status) === RESERVATION_STATUS.CONFIRMED) {
    throw new ApiError(
      409,
      'Another reservation already occupies that table for the selected date and time slot'
    );
  }

  reservation.date = nextDate;
  reservation.timeSlot = nextTimeSlot;
  reservation.guests = nextGuests;
  reservation.table = table._id;
  if (status) {
    if (!Object.values(RESERVATION_STATUS).includes(status)) {
      throw new ApiError(400, `status must be one of: ${Object.values(RESERVATION_STATUS).join(', ')}`);
    }
    reservation.status = status;
  }

  await reservation.save();
  const populated = await reservation.populate([
    { path: 'user', select: 'name email' },
    { path: 'table', select: 'tableNumber capacity' },
  ]);

  res.status(200).json({ success: true, data: populated });
});

// @desc    Cancel any reservation
// @route   DELETE /api/admin/reservations/:id
// @access  Private/Admin
const cancelReservation = asyncHandler(async (req, res) => {
  const reservation = await Reservation.findById(req.params.id);
  if (!reservation) {
    throw new ApiError(404, 'Reservation not found');
  }

  reservation.status = RESERVATION_STATUS.CANCELLED;
  await reservation.save();

  res.status(200).json({ success: true, message: 'Reservation cancelled', data: reservation });
});

module.exports = {
  getAllReservations,
  getReservationById,
  updateReservation,
  cancelReservation,
};
