import { NextResponse } from "next/server";
import pool from "@/app/database/db";

export async function GET() {
    try {
        const [rows] = await pool.query("SELECT * FROM activity ORDER BY date_start DESC");
        console.log(rows)
        return NextResponse.json(rows);
    } catch (error) {
        console.error("Error fetching activities:", error);
        return NextResponse.json({ error: "Failed to fetch activity" }, { status: 500 });
    }
}
