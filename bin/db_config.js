// db_config.js - Optimized for 700+ students
const mysql = require('mysql2');
require('dotenv').config();

// Optimized connection pool for large datasets
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'sql.freesqldatabase.com',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Hag06@71201872',
    database: process.env.DB_NAME || 'ocjss_stud_mgmt',
    port: 3306,
    
    // CONNECTION POOL SETTINGS (Optimized for 700+ students)
    waitForConnections: true,
    connectionLimit: 20,           // Increased from 10 to 20 for better performance
    queueLimit: 0,                 // Unlimited queue (never reject connections)
    enableKeepAlive: true,         // Keep connections alive
    keepAliveInitialDelay: 10000,  // 10 seconds keep-alive
    
    // PERFORMANCE OPTIMIZATIONS
    enableTracing: false,          // Disable tracing for speed
    namedPlaceholders: false,      // Use positional placeholders for speed
    
    // TIMEOUT SETTINGS
    acquireTimeout: 60000,         // 60 seconds to acquire connection
    timeout: 60000,                // 60 seconds query timeout
    connectTimeout: 60000,         // 60 seconds connection timeout
    
    // DATABASE OPTIONS
    dateStrings: true,             // Return dates as strings
    supportBigNumbers: true,       // Support large numbers
    bigNumberStrings: false
});

const promisePool = pool.promise();

// Monitor pool status (for debugging)
setInterval(() => {
    console.log(`📊 Connection Pool Status: ${pool._allConnections.length} total, ${pool._freeConnections.length} free, ${pool._acquiringConnections.length} acquiring`);
}, 30000); // Log every 30 seconds

module.exports = promisePool;