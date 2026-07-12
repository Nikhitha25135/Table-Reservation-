const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getAllReservations,
  getReservationById,
  updateReservation,
  cancelReservation,
} = require('../controllers/adminController');
const { ROLES, TIME_SLOTS, RESERVATION_STATUS } = require('../config/constants');

const router = express.Router();

// Every route below requires a logged-in admin.
router.use(protect, authorize(ROLES.ADMIN));

router.get('/reservations', getAllReservations);
router.get('/reservations/:id', getReservationById);

router.put(
  '/reservations/:id',
  [
    body('date').optional().matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('date must be in YYYY-MM-DD format'),
    body('timeSlot').optional().isIn(TIME_SLOTS).withMessage(`timeSlot must be one of: ${TIME_SLOTS.join(', ')}`),
    body('guests').optional().isInt({ min: 1 }).withMessage('guests must be a positive integer'),
    body('tableId').optional().isMongoId().withMessage('tableId must be a valid id'),
    body('status')
      .optional()
      .isIn(Object.values(RESERVATION_STATUS))
      .withMessage(`status must be one of: ${Object.values(RESERVATION_STATUS).join(', ')}`),
  ],
  validate,
  updateReservation
);

router.delete('/reservations/:id', cancelReservation);

module.exports = router;
