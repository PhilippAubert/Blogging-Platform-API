import dotenv from "dotenv";

import mysql, { 
    RowDataPacket, 
    ResultSetHeader 
} from "mysql2";

dotenv.config();

export type Post = {
    id: number;
    title: string;
    content: string;
    category: string;
    tags: string;
    created_at: Date;
    updated_at: Date;
}

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

const listAllPosts = async (): Promise<any[]> => {
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

const listOnePost = async (id: number): Promise<Post | undefined> => {
    const [rows] = await pool.query<RowDataPacket[] & Post[]>(`SELECT * FROM posts WHERE id = ?`, [id]);
    return rows[0];
};

const addPost = async (title: string, content: string, category: string, tags: string): Promise<string> => { 
    const [result] = await pool.query<ResultSetHeader>(`
        INSERT INTO posts (title, content, category, tags) VALUES (?, ?, ?, ?)
    `, [title, content, category, tags]);
    return result.insertId, " added";
};