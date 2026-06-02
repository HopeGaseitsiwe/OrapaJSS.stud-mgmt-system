// Updated server.js routes (without timestamp fields)

// Get all students
app.get('/api/students', async (req, res) => {
    try {
        const [students] = await promisePool.query(
            'SELECT id, student_name, class, gender, house, primary_contact, secondary_contact FROM students ORDER BY class, student_name'
        );
        
        // Get statistics
        const [form1Count] = await promisePool.query('SELECT COUNT(*) as count FROM students WHERE class = "Form 1"');
        const [form2Count] = await promisePool.query('SELECT COUNT(*) as count FROM students WHERE class = "Form 2"');
        const [form3Count] = await promisePool.query('SELECT COUNT(*) as count FROM students WHERE class = "Form 3"');
        const [maleCount] = await promisePool.query('SELECT COUNT(*) as count FROM students WHERE gender = "Male"');
        const [femaleCount] = await promisePool.query('SELECT COUNT(*) as count FROM students WHERE gender = "Female"');
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

// Search/Filter students
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

// The rest of the routes (POST, PUT, DELETE) remain the same