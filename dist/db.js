import dotenv from "dotenv";
import mysql from "mysql2";
import { buildUpdateFields } from "./utils/handlers.js";
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
            COLLATE utf8mb4_unicode_ci
        `);
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
                    ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB
            DEFAULT CHARSET=utf8mb4
            COLLATE=utf8mb4_unicode_ci
        `);
        console.log("Posts table is ready!");
    }
    catch (err) {
        console.error("DB bootstrap error:", err);
        process.exit(1);
    }
};
export const listAllPosts = async () => {
    try {
        const [rows] = await pool.query("SELECT * FROM posts");
        return rows;
    }
    catch (err) {
        if (typeof err === "object" && err !== null && 'code' in err && err.code === "ER_NO_SUCH_TABLE") {
            console.log("Posts table doesn't exist — creating DB and tables...");
            await createDBAndTables();
            const [rows] = await pool.query("SELECT * FROM posts");
            return rows;
        }
        throw err;
    }
};
export const listOnePost = async (id) => {
    const [rows] = await pool.query(`SELECT * FROM posts WHERE id = ?`, [id]);
    return rows[0];
};
export const addPost = async (title, content, category, tags) => {
    const [result] = await pool.query(`INSERT INTO posts (title, content, category, tags) VALUES (?, ?, ?, ?)`, [title, content, category, tags]);
    return await listOnePost(result.insertId);
};
export const updatePost = async (id, title, content, category, tags) => {
    const { sql, values } = buildUpdateFields({ title, content, category, tags });
    if (sql.length === 0)
        return await listOnePost(id);
    values.push(id);
    const query = `UPDATE posts SET ${sql.join(", ")} WHERE id = ?`;
    const [result] = await pool.query(query, values);
    if (result.affectedRows === 0)
        return undefined;
    return await listOnePost(id);
};
export const deleteOnePost = async (id) => {
    const [result] = await pool.query(`DELETE FROM posts WHERE id = ?`, [id]);
    return result.affectedRows > 0;
};
