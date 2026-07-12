const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');

const openapiSpec = require('./docs/openapi.json');
const authRoutes = require('./routes/authRoutes');
const tableRoutes = require('./routes/tableRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// CORS: if CLIENT_ORIGIN is set, restrict to it (comma separated list);
// otherwise allow all origins (convenient for local/dev use).
const allowedOrigins = (process.env.CLIENT_ORIGIN || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins.length ? allowedOrigins : true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'API is healthy' });
});

// Interactive API docs (Swagger UI) at /api-docs, raw spec at /api-docs.json
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpec, { customSiteTitle: 'Restaurant Reservation API Docs' }));
app.get('/api-docs.json', (req, res) => res.status(200).json(openapiSpec));

app.use('/api/auth', authRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/admin', adminRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
