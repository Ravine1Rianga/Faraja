require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');

const app = express();

app.use(cors({
  origin: true,
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth',          require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/funerals',      require('./routes/funerals'));
app.use('/api/funerals',      require('./routes/members'));
app.use('/api/tasks',         require('./routes/tasks'));
app.use('/api/expenses',      require('./routes/expenses'));
app.use('/api/donations',     require('./routes/donations'));
app.use('/api/vendors',       require('./routes/vendors'));
app.use('/api/products',      require('./routes/products'));
app.use('/api/bookings',      require('./routes/bookings'));
app.use('/api/reviews',       require('./routes/reviews'));
app.use('/api/condolences',   require('./routes/condolences'));

app.get('/api/health', (req, res) =>
  res.json({ success: true, message: 'Faraja API running', timestamp: new Date() })
);

app.use((req, res) =>
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found` })
);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ success: false, message: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Faraja API listening on http://localhost:${PORT}`));
