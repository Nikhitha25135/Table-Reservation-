// Mirrors src/config/constants.js on the backend. Kept in sync manually since
// the API does not currently expose these as a lookup endpoint (documented
// as a known limitation in the README).
export const TIME_SLOTS = [
  '11:00-12:30',
  '12:30-14:00',
  '14:00-15:30',
  '18:00-19:30',
  '19:30-21:00',
  '21:00-22:30',
];

export const ROLES = {
  CUSTOMER: 'customer',
  ADMIN: 'admin',
};

export const RESERVATION_STATUS = {
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
};
