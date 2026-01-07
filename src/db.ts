import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

const bootstrapPool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PW,
}).promise();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PW,
    database: process.env.DB,
}).promise();

const createDBAndTables = async () => {
    try {
        await bootstrapPool.query(`
            CREATE DATABASE IF NOT EXISTS \`${process.env.DB}\`
            CHARACTER SET utf8mb4
            COLLATE utf8mb4_unicode_ci`);

        console.log(`Database '${process.env.DB}' is ready`);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS posts (
                id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                category VARCHAR(100) NOT NULL,
                tags JSON NOT NULL,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                ON UPDATE CURRENT_TIMESTAMP ) 
            ENGINE=InnoDB
            DEFAULT CHARSET=utf8mb4
            COLLATE=utf8mb4_unicode_ci
        `);
        console.log("Posts table is ready!");
    } catch (err) {
        console.error("DB bootstrap error:", err);
        process.exit(1);
    }
};

await createDBAndTables();

const [rows] = await pool.query("SELECT * FROM posts");
console.log(rows);
