const express = require('express');
const bodyParser = require('body-parser');
const bookRoutes = require('./src/routes/bookRoutes');

const app = express();

// Middleware to parse JSON
app.use(bodyParser.json());

// Use the routes
app.use('/api/v1', bookRoutes);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
