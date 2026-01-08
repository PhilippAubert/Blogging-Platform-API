import dotenv from "dotenv";

import mysql, { 
    RowDataPacket, 
    ResultSetHeader 
} from "mysql2";

import { buildUpdateFields } from "./utils/handlers.js";

import { Post, UpdatePostInput } from "./types/types.js";

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
    } catch (err) {
        console.error("DB bootstrap error:", err);
        process.exit(1);
    }
};

export const listAllPosts = async (): Promise<any[]> => {
    try {
        const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM posts");
        return rows;
    } catch (err: unknown) {
        if (typeof err === "object" && err !== null && 'code' in err && (err as any).code === "ER_NO_SUCH_TABLE") {
            console.log("Posts table doesn't exist — creating DB and tables...");
            await createDBAndTables();
            const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM posts");
            return rows;
        }
        throw err;
    }
};

export const listOnePost = async (id: number): Promise<Post | undefined> => {
    const [rows] = await pool.query<RowDataPacket[] & Post[]>(`SELECT * FROM posts WHERE id = ?`, [id]);
    return rows[0];
};

export const addPost = async (title: string, content: string, category: string, tags: string[]): Promise<Post | undefined> => { 
    const tagsString = tags.join(',');
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO posts (title, content, category, tags)
       VALUES (?, ?, ?, ?)`,
      [title, content, category, JSON.stringify(tagsString)]
    );
    return await listOnePost(result.insertId)
};

export const updatePost = async (id: number, fields: UpdatePostInput): Promise<Post | undefined> => {
    const { sql, values } = buildUpdateFields(fields);
    if (sql.length === 0) return await listOnePost(id);
    values.push(id);
    const query = `UPDATE posts SET ${sql.join(", ")} WHERE id = ?`;
    const [result] = await pool.query<ResultSetHeader>(query, values);
    if (result.affectedRows === 0) return undefined;
    return await listOnePost(result.insertId);
};

export const deleteOnePost = async (id: number): Promise<boolean> => {
    const [result] = await pool.query<ResultSetHeader>(
        `DELETE FROM posts WHERE id = ?`,
        [id]
    );
    return result.affectedRows > 0;
};

