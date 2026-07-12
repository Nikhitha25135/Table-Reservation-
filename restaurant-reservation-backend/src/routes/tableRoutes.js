const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect, authorize } = require('../middleware/authMiddleware');
const { getTables, createTable, updateTable, deleteTable } = require('../controllers/tableController');
const { ROLES } = require('../config/constants');

const router = express.Router();

router.use(protect);

router.get('/', getTables);

router.post(
  '/',
  authorize(ROLES.ADMIN),
  [
    body('tableNumber').isInt({ min: 1 }).withMessage('tableNumber must be a positive integer'),
    body('capacity').isInt({ min: 1 }).withMessage('capacity must be a positive integer'),
  ],
  validate,
  createTable
);

router.put(
  '/:id',
  authorize(ROLES.ADMIN),
  [
    body('tableNumber').optional().isInt({ min: 1 }),
    body('capacity').optional().isInt({ min: 1 }),
    body('isActive').optional().isBoolean(),
  ],
  validate,
  updateTable
);

router.delete('/:id', authorize(ROLES.ADMIN), deleteTable);

module.exports = router;
