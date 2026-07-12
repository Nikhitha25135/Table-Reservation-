const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/authMiddleware');
const {
  checkAvailability,
  createReservation,
  getMyReservations,
  cancelMyReservation,
} = require('../controllers/reservationController');
const { TIME_SLOTS } = require('../config/constants');

const router = express.Router();

router.use(protect); // all reservation routes require authentication

router.get('/availability', checkAvailability);

router.post(
  '/',
  [
    body('date')
      .matches(/^\d{4}-\d{2}-\d{2}$/)
      .withMessage('date must be in YYYY-MM-DD format'),
    body('timeSlot').isIn(TIME_SLOTS).withMessage(`timeSlot must be one of: ${TIME_SLOTS.join(', ')}`),
    body('guests').isInt({ min: 1 }).withMessage('guests must be a positive integer'),
    body('tableId').optional().isMongoId().withMessage('tableId must be a valid id'),
  ],
  validate,
  createReservation
);

router.get('/me', getMyReservations);

router.delete('/:id', cancelMyReservation);

module.exports = router;
