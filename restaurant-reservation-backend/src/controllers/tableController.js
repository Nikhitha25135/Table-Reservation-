const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Table = require('../models/Table');

// @desc    List all active tables (used by customers to pick a table, and admins)
// @route   GET /api/tables
// @access  Private
const getTables = asyncHandler(async (req, res) => {
  const filter = req.query.includeInactive === 'true' ? {} : { isActive: true };
  const tables = await Table.find(filter).sort({ tableNumber: 1 });
  res.status(200).json({ success: true, count: tables.length, data: tables });
});

// @desc    Create a new table
// @route   POST /api/tables
// @access  Private/Admin
const createTable = asyncHandler(async (req, res) => {
  const { tableNumber, capacity } = req.body;

  const existing = await Table.findOne({ tableNumber });
  if (existing) {
    throw new ApiError(409, `Table number ${tableNumber} already exists`);
  }

  const table = await Table.create({ tableNumber, capacity });
  res.status(201).json({ success: true, data: table });
});

// @desc    Update a table (capacity, active status, table number)
// @route   PUT /api/tables/:id
// @access  Private/Admin
const updateTable = asyncHandler(async (req, res) => {
  const table = await Table.findById(req.params.id);
  if (!table) {
    throw new ApiError(404, 'Table not found');
  }

  const { tableNumber, capacity, isActive } = req.body;
  if (tableNumber !== undefined) table.tableNumber = tableNumber;
  if (capacity !== undefined) table.capacity = capacity;
  if (isActive !== undefined) table.isActive = isActive;

  await table.save();
  res.status(200).json({ success: true, data: table });
});

// @desc    Deactivate (soft-delete) a table
// @route   DELETE /api/tables/:id
// @access  Private/Admin
const deleteTable = asyncHandler(async (req, res) => {
  const table = await Table.findById(req.params.id);
  if (!table) {
    throw new ApiError(404, 'Table not found');
  }

  // Soft delete: keeps reservation history intact and referentially valid.
  table.isActive = false;
  await table.save();

  res.status(200).json({ success: true, message: 'Table deactivated', data: table });
});

module.exports = { getTables, createTable, updateTable, deleteTable };
