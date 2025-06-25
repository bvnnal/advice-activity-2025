import mysql from 'mysql2/promise';
import { NextResponse } from 'next/server';

const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '', 
            database: 'newyear',
        });

export async function POST(request) {
    const data = await request.json();
    const {name_ac,description_ac,type_ac,location_ac,date_start,date_end,max_participants,image_url,created_by,} = data;
    try{
        const [result] = await db.execute(
            `INSERT INTO activity (name_ac, description_ac, type_ac, location_ac, date_start, date_end, max_participants, current_participants, image_url, created_by, create_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?, NOW(), NOW())`,
            [
                name_ac,
                description_ac,
                type_ac,
                location_ac,
                date_start,
                date_end,
                max_participants,
                image_url,
                created_by,
            ]
        );
        return new Response(JSON.stringify({ success: true, id: result.insertId }), {status: 200,});
    } catch (error) {
        console.error('DB Insert Error:', error);
        return new NextResponse.json(JSON.stringify({ success: false, error: 'database error'}));
    }
}
