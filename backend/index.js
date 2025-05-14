// Import required modules
const express = require('express'); // Express framework for building the API
const cors = require('cors'); // Middleware to enable Cross-Origin Resource Sharing
const db = require('./db'); // Database connection module (assumed to be configured elsewhere)
const authRoutes = require('./routes/auth'); // Authentication routes module
const personRoutes = require('./routes/person');
const staffRoutes = require('./routes/allocate_staffaccount');
// Initialize Express application
const app = express();

// Enable CORS for all routes to allow cross-origin requests
app.use(cors());

// Parse incoming JSON request bodies
app.use(express.json());

// Mount authentication routes at the root path
app.use('/', authRoutes);
app.use('/person', personRoutes);
app.use('/staff', staffRoutes);
// Set the port from environment variable or default to 3000
const PORT = process.env.PORT || 3000;

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});