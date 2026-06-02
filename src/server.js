require('dotenv').config();

const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// DATABASE CONNECTION
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
}).promise();

// ===================== API ROUTES =====================

// GET ALL + STATS
app.get('/api/students', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM students ORDER BY id DESC');

        const stats = {
            total: rows.length,
            form1: rows.filter(s => s.form === 'Form1').length,
            form2: rows.filter(s => s.form === 'Form2').length,
            form3: rows.filter(s => s.form === 'Form3').length,
            male: rows.filter(s => s.gender === 'Male').length,
            female: rows.filter(s => s.gender === 'Female').length,
            acacia: rows.filter(s => s.house === 'Acacia').length,
            baobab: rows.filter(s => s.house === 'Baobab').length,
            palm: rows.filter(s => s.house === 'Palm').length
        };

        res.json({ success: true, data: rows, stats });

    } catch (err) {
        console.error('Error fetching students:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET ONE STUDENT
app.get('/api/students/:id', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM students WHERE id = ?',
            [req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        res.json({ success: true, data: rows[0] });

    } catch (err) {
        console.error('Error fetching student:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// ADD STUDENT
app.post('/api/students', async (req, res) => {
    try {
        const {
            student_name,
            form,
            class: className,
            gender,
            house,
            primary_contact,
            secondary_contact,
            guardian_names
        } = req.body;

        const sql = `
            INSERT INTO students (
                student_name,
                form,
                class,
                gender,
                house,
                primary_contact,
                secondary_contact,
                guardian_names
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        await pool.query(sql, [
            student_name,
            form,
            className,
            gender,
            house,
            primary_contact,
            secondary_contact,
            guardian_names
        ]);

        res.json({
            success: true,
            message: "Student added successfully"
        });

    } catch (error) {
        console.error(error);
        res.json({
            success: false,
            message: "Failed to save student"
        });
    }
});

// UPDATE STUDENT
app.put('/api/students/:id', async (req, res) => {
    try {
        const id = req.params.id;

        const {
            student_name,
            form,
            class: className,
            gender,
            house,
            primary_contact,
            secondary_contact,
            guardian_names
        } = req.body;

        const sql = `
            UPDATE students 
            SET student_name=?,
                form=?,
                class=?,
                gender=?,
                house=?,
                primary_contact=?,
                secondary_contact=?,
                guardian_names=?
            WHERE id=?
        `;

        await pool.query(sql, [
            student_name,
            form,
            className,
            gender,
            house,
            primary_contact,
            secondary_contact,
            guardian_names,
            id
        ]);

        res.json({
            success: true,
            message: "Student updated successfully"
        });

    } catch (error) {
        console.error(error);
        res.json({
            success: false,
            message: "Failed to update student"
        });
    }
});

// DELETE STUDENT
app.delete('/api/students/:id', async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM students WHERE id = ?', [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        res.json({ success: true });

    } catch (err) {
        console.error('Error deleting student:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// ===================== DATABASE SETUP SCRIPT =====================

async function initializeDatabase() {
    try {
        // Create database if not exists
        await pool.query('CREATE DATABASE IF NOT EXISTS ocjss_stud_mgmt');
        await pool.query('USE ocjss_stud_mgmt');
        
        // Create students table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS students (
                id INT PRIMARY KEY AUTO_INCREMENT,
                student_name VARCHAR(100) NOT NULL,
                form VARCHAR(20) NOT NULL,
                class VARCHAR(20) NOT NULL,
                gender VARCHAR(10) NOT NULL,
                house VARCHAR(20) NOT NULL,
                primary_contact VARCHAR(20) NOT NULL,
                secondary_contact VARCHAR(20) NOT NULL,
                guardian_names VARCHAR(100) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        console.log('✅ Database and table ready (empty - no sample data)');
        
    } catch (err) {
        console.error('Database initialization error:', err);
    }
}

// ===================== PAGE ROUTES =====================

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/student-list', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/student-list.html'));
});

// ===================== START SERVER =====================

// Initialize database and start server
async function startServer() {
    await initializeDatabase();
    
    app.listen(PORT, () => {
        console.log(`✅ Server running on http://localhost:${PORT}`);
        console.log(`📊 Dashboard: http://localhost:${PORT}/`);
        console.log(`📋 Student List: http://localhost:${PORT}/student-list`);
        console.log(`💾 Database is empty - add students using the "Add Student" button`);
    });
}

startServer().catch(console.error);