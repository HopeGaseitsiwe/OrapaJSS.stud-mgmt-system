// server.js - Updated for ocjss_stud_mgmt database
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// MySQL Connection Pool - Using ocjss_stud_mgmt database
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'sql.freesqldatabase.com',
    user: process.env.DB_USER || 'your_username',
    password: process.env.DB_PASSWORD || 'your_password',
    database: process.env.DB_NAME || 'ocjss_stud_mgmt',  // Your database name
    waitForConnections: true,
    connectionLimit: 20,
    queueLimit: 0,
    enableKeepAlive: true
});

const promisePool = pool.promise();

// Test connection
async function testConnection() {
    try {
        const [rows] = await promisePool.query('SELECT 1');
        console.log('✅ MySQL connected successfully to ocjss_stud_mgmt database!');
    } catch (error) {
        console.error('❌ MySQL connection failed:', error.message);
    }
}
testConnection();

// ===================== API ROUTES =====================

// Get all students
app.get('/api/students', async (req, res) => {
    try {
        const [students] = await promisePool.query(
            'SELECT id, student_name, class, gender, house, primary_contact, secondary_contact FROM students ORDER BY class, student_name'
        );
        
        // Get statistics by Class
        const [form1Count] = await promisePool.query('SELECT COUNT(*) as count FROM students WHERE class = "Form 1"');
        const [form2Count] = await promisePool.query('SELECT COUNT(*) as count FROM students WHERE class = "Form 2"');
        const [form3Count] = await promisePool.query('SELECT COUNT(*) as count FROM students WHERE class = "Form 3"');
        const [maleCount] = await promisePool.query('SELECT COUNT(*) as count FROM students WHERE gender = "Male"');
        const [femaleCount] = await promisePool.query('SELECT COUNT(*) as count FROM students WHERE gender = "Female"');
        
        // Get house distribution
        const [acaciaCount] = await promisePool.query('SELECT COUNT(*) as count FROM students WHERE house = "Acacia"');
        const [baobabCount] = await promisePool.query('SELECT COUNT(*) as count FROM students WHERE house = "Baobab"');
        const [palmCount] = await promisePool.query('SELECT COUNT(*) as count FROM students WHERE house = "Palm"');
        
        res.json({
            success: true,
            data: students,
            stats: {
                total: students.length,
                form1: form1Count[0].count,
                form2: form2Count[0].count,
                form3: form3Count[0].count,
                male: maleCount[0].count,
                female: femaleCount[0].count,
                acacia: acaciaCount[0].count,
                baobab: baobabCount[0].count,
                palm: palmCount[0].count
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get single student by ID
app.get('/api/students/:id', async (req, res) => {
    try {
        const [rows] = await promisePool.query(
            'SELECT id, student_name, class, gender, house, primary_contact, secondary_contact FROM students WHERE id = ?',
            [req.params.id]
        );
        if (rows.length > 0) {
            res.json({ success: true, data: rows[0] });
        } else {
            res.json({ success: false, message: 'Student not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Search/Filter students (search by name or class)
app.get('/api/students/search', async (req, res) => {
    try {
        let query = 'SELECT id, student_name, class, gender, house, primary_contact, secondary_contact FROM students WHERE 1=1';
        const params = [];
        
        if (req.query.q) {
            query += ' AND (student_name LIKE ? OR class LIKE ?)';
            const like = `%${req.query.q}%`;
            params.push(like, like);
        }
        if (req.query.class) {
            query += ' AND class = ?';
            params.push(req.query.class);
        }
        if (req.query.house) {
            query += ' AND house = ?';
            params.push(req.query.house);
        }
        if (req.query.gender) {
            query += ' AND gender = ?';
            params.push(req.query.gender);
        }
        
        query += ' ORDER BY class, student_name';
        
        const [rows] = await promisePool.query(query, params);
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Add new student
app.post('/api/students', async (req, res) => {
    try {
        const { id, studentName, class: className, gender, house, primaryContact, secondaryContact } = req.body;
        
        const [existing] = await promisePool.query('SELECT id FROM students WHERE id = ?', [id]);
        if (existing.length > 0) {
            return res.json({ success: false, message: 'Student ID already exists!' });
        }
        
        await promisePool.query(
            `INSERT INTO students 
             (id, student_name, class, gender, house, primary_contact, secondary_contact) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [id, studentName, className, gender, house, primaryContact, secondaryContact || null]
        );
        
        res.json({ success: true, message: 'Student added successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update student
app.put('/api/students/:id', async (req, res) => {
    try {
        const { studentName, class: className, gender, house, primaryContact, secondaryContact } = req.body;
        
        await promisePool.query(
            `UPDATE students SET 
             student_name = ?, class = ?, gender = ?, house = ?, 
             primary_contact = ?, secondary_contact = ? 
             WHERE id = ?`,
            [studentName, className, gender, house, primaryContact, secondaryContact || null, req.params.id]
        );
        
        res.json({ success: true, message: 'Student updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete student
app.delete('/api/students/:id', async (req, res) => {
    try {
        await promisePool.query('DELETE FROM students WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Student deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get students by Class
app.get('/api/students/by-class/:class', async (req, res) => {
    try {
        const [rows] = await promisePool.query(
            'SELECT id, student_name, class, gender, house, primary_contact, secondary_contact FROM students WHERE class = ? ORDER BY student_name',
            [req.params.class]
        );
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Serve HTML pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/student-list', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'student-list.html'));
});

app.get('/student-info', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'student-info.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`📊 Dashboard: http://localhost:${PORT}/`);
    console.log(`📋 Student List: http://localhost:${PORT}/student-list`);
    console.log(`ℹ️ Student Info: http://localhost:${PORT}/student-info`);
    console.log(`💾 Database: ocjss_stud_mgmt`);
});