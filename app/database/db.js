import mysql from "mysql2/promise"
require("dotenv").config()

const pool = mysql.createPool({
    database:process.env.NEXT_PUBLIC_DB_DATABASE,
    host:process.env.NEXT_PUBLIC_DB_HOST,
    user:process.env.NEXT_PUBLIC_DB_USER,
    password:process.env.NEXT_PUBLIC_DB_PASSWORD,
})
export default pool