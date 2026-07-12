// Fixed set of reservation time slots offered by the restaurant.
// Kept simple and centralized so validation and business logic stay consistent.
const TIME_SLOTS = [
  '11:00-12:30',
  '12:30-14:00',
  '14:00-15:30',
  '18:00-19:30',
  '19:30-21:00',
  '21:00-22:30',
];

const ROLES = {
  CUSTOMER: 'customer',
  ADMIN: 'admin',
};

const RESERVATION_STATUS = {
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
};

module.exports = { TIME_SLOTS, ROLES, RESERVATION_STATUS };
