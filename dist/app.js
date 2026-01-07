import express from "express";
import dotenv from "dotenv";
import { listAllPosts, listOnePost, addPost } from "./db.js";
import { errorHandler } from "./utils/handlers.js";
dotenv.config();
const port = process.env.PORT || 4400;
const app = express();
app.get("/", (req, res) => {
    res.end("Nice to see you!");
});
app.get("/posts", async (req, res) => {
    const posts = await listAllPosts();
    if (posts.length === 0)
        res.end("Nothing posted yet!");
    res.send(posts);
    return;
});
app.get("/posts/:id", async (req, res) => {
    const { id } = req.params;
    const post = await listOnePost(Number(id));
    if (post === undefined)
        res.end("Cannot find the post!");
    res.send(post);
});
app.post("/posts", async (req, res) => {
    const { title, content, category, tags } = req.body;
    const post = await addPost(title, content, category, tags);
    res.status(201).send(post);
});
app.use(errorHandler);
app.listen(port, () => {
    console.log("SERVER IS STILL RUNNING!");
});
