/**
 * Seeds the database with:
 *  - A fixed set of restaurant tables
 *  - A default admin user (only if one doesn't already exist)
 *
 * Usage: npm run seed
 */
require('dotenv').config();
const connectDB = require('../config/db');
const Table = require('../models/Table');
const User = require('../models/User');
const { ROLES } = require('../config/constants');

const DEFAULT_TABLES = [
  { tableNumber: 1, capacity: 2 },
  { tableNumber: 2, capacity: 2 },
  { tableNumber: 3, capacity: 4 },
  { tableNumber: 4, capacity: 4 },
  { tableNumber: 5, capacity: 6 },
  { tableNumber: 6, capacity: 8 },
];

const DEFAULT_ADMIN = {
  name: 'Admin',
  email: 'admin@restaurant.com',
  password: 'Admin@123',
  role: ROLES.ADMIN,
};

const seed = async () => {
  await connectDB();

  for (const t of DEFAULT_TABLES) {
    await Table.findOneAndUpdate(
      { tableNumber: t.tableNumber },
      { $setOnInsert: t },
      { upsert: true, new: true }
    );
  }
  console.log(`Seeded ${DEFAULT_TABLES.length} tables (existing ones left untouched).`);

  const existingAdmin = await User.findOne({ email: DEFAULT_ADMIN.email });
  if (!existingAdmin) {
    await User.create(DEFAULT_ADMIN);
    console.log(`Created default admin: ${DEFAULT_ADMIN.email} / ${DEFAULT_ADMIN.password}`);
  } else {
    console.log('Default admin already exists, skipping.');
  }

  console.log('Seeding complete.');
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
