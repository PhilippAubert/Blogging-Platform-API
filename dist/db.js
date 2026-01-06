import mysql from "mysql";
import dotenv from "dotenv";
dotenv.config();
const connection = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PW,
    database: "tha_blog"
});
connection.connect((err) => {
    console.log("ENTERING!");
    if (err) {
        console.error('Error connecting to MySQL!!!:', err);
        return;
    }
    console.log('Connected to MySQL!');
});
