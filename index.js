import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { createServer } from 'http';
import pool from './config/db.js';
import customerRoute from './routes/customer.route.js'; 
import estimateRoute from './routes/estimate.route.js'; 
import inventoryRoute from './routes/inventory.route.js'; 
import invoiceRoute from './routes/invoice.route.js';
import vendorRoute from './routes/vendor.route.js';
import orderRoute from './routes/order.route.js';
import jobRoute from './routes/job.route.js';
import employeeRoute from './routes/employee.route.js';
import timesheetRoute from './routes/timesheet.route.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const corsOptions = {
    origin: "https://service-erp-ui.onrender.com", // ✅ Update if your frontend is hosted elsewhere
    credentials: true,
};
app.use(cors(corsOptions));

// API Routes
app.use('/api/v1/customer', customerRoute);
app.use('/api/v1/estimate', estimateRoute);
app.use('/api/v1/inventory', inventoryRoute);
app.use('/api/v1/invoice', invoiceRoute);
app.use('/api/v1/vendor', vendorRoute);
app.use('/api/v1/order', orderRoute);
app.use('/api/v1/job', jobRoute);
app.use('/api/v1/employee', employeeRoute);
app.use('/api/v1/timesheet', timesheetRoute); 
// Create and start HTTP server
const server = createServer(app);

const serverStart = async () => {
    try {
        await pool.query('SELECT NOW()'); // Test the DB connection
        server.listen(PORT, () => {
            console.log(`✅ Server running at http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("❌ Failed to connect to DB:", error.message);
        process.exit(1); // Exit the app if DB fails to connect
    }
};

serverStart();
