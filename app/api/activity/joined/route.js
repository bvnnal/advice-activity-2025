// /pages/api/activity/joined.js
import pool from '@/app/database/db';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const userId = req.query.userId; // ← 🔑 รับจาก query param เช่น /api/activity/joined?userId=2

    if (!userId) {
        return res.status(400).json({ error: 'Missing userId' });
    }

    try {
        const [rows] = await pool.query(
            'SELECT id_user AS id, role FROM user WHERE email = ? AND password = ?',
            [email, password]
        );

        return res.status(200).json(rows || []);
    } catch (err) {
        console.error('Error in /api/activity/joined:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
