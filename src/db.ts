import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PW
});

connection.connect((err) => {
    if (err) {
        console.error("Error connecting to MySQL:", err);
        process.exit(1);
    }

    console.log("Connected to MySQL server");

    connection.query(
        `CREATE DATABASE IF NOT EXISTS \`${process.env.DB}\`
         CHARACTER SET utf8mb4
         COLLATE utf8mb4_unicode_ci`,
        (err) => {
            if (err) {
                console.error("Error creating database:", err);
                process.exit(1);
            }

            connection.changeUser({ database: process.env.DB }, (err) => {
                if (err) {
                    console.error("Error selecting database:", err);
                    process.exit(1);
                }

                console.log(`Using database '${process.env.DB}'`);

                const createPostsTableSQL = `
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
                      COLLATE=utf8mb4_unicode_ci;
                `;

                connection.query(createPostsTableSQL, (err) => {
                    if (err) {
                        console.error("Error creating posts table:", err);
                        process.exit(1);
                    }

                    console.log("Posts table is ready!");
                });
            });
        }
    );
});

export default connection;
