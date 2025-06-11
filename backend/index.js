// Import required modules
const express = require('express'); // Express framework for building the API
const cors = require('cors'); // Middleware to enable Cross-Origin Resource Sharing
const db = require('./db'); // Database connection module (assumed to be configured elsewhere)
const authRoutes = require('./routes/auth'); // Authentication routes module
const personRoutes = require('./routes/person');
const courseRoutes = require('./routes/course'); // Import course routes
const paymentRoutes = require('./routes/payment'); // Import payment routes
const documentRoutes = require('./routes/document');
const assignmentRoutes = require('./routes/assignment'); // Import assignment routes
const submissionRoutes = require('./routes/submission'); // Import submission routes
const categoryRoutes = require('./routes/category'); // Import category routes
const padletRoutes = require('./routes/padlet'); // Import padlet routes
const path = require('path');
// Initialize Express application
const app = express();

// Enable CORS for all routes to allow cross-origin requests
app.use(cors());

// Parse incoming JSON request bodies
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount authentication routes at the root path
app.use('/', authRoutes);
app.use('/person', personRoutes);
app.use('/course', courseRoutes); // Mount course routes
app.use('/payment', paymentRoutes); // Mount payment routes
app.use('/documents', documentRoutes);
app.use('/assignments', assignmentRoutes); // Mount assignment routes
app.use('/submissions', submissionRoutes); // Mount submission routes
app.use('/category', categoryRoutes); // Mount category routes
app.use('/padlet', padletRoutes); // Mount padlet routes
// Set the port from environment variable or default to 3000
const PORT = process.env.PORT || 3000;

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});