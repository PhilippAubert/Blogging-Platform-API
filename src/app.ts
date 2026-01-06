import express from "express";
import dotenv from "dotenv";

dotenv.config();

const port = process.env.PORT || 4400;

const app = express();

app.get("/", (req, res) => {
    res.end("Nice to see you!");
});

app.listen(port, ()=>{
    console.log("SERVER IS RUNNING!");
});