import express from "express";
import dotenv from "dotenv";

import { 
    listAllPosts, 
    listOnePost, 
    addPost, 
    deleteOnePost,
    updatePost
} from "./db.js";

import { errorHandler } from "./utils/handlers.js";

dotenv.config();

const port = process.env.PORT || 4400;
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.end("Nice to see you!");
});

app.get("/posts", async (req, res, next) => {
    try {
        const posts = await listAllPosts();
        if (posts.length === 0) {
            res.status(200).send("Nothing posted yet!");
            return;
        }
        res.send(posts);
    } catch (err) {
        next(err);
    }
});

app.get("/posts/:id", async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id) || id <= 0) throw new Error("Invalid post ID");

        const post = await listOnePost(id);
        if (!post) {
            res.status(404).json({ error: `Cannot find post with ID ${id}` });
            return;
        }

        res.send(post);
    } catch (err) {
        next(err);
    }
});

app.post("/posts", async (req, res, next) => {
    try {
        const { title, content, category, tags } = req.body;
        if (!title || !content || !category || !tags) {
            res.status(400).json({ error: "Missing required fields" });
            return;
        }

        const post = await addPost(title, content, category, tags);
        res.status(201).send(post);
    } catch (err) {
        next(err);
    }
});

app.put("/posts/:id", async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id) || id <= 0) {
            res.status(400).json({ error: "Invalid post ID" });
            return;
        }
        const { title, content, category, tags } = req.body;
        const updatedPost = await updatePost(id, title, content, category, tags);
        if (!updatedPost) {
            res.status(404).json({ error: `Post not found: ${id}` });
            return;
        }
        res.status(200).json(updatedPost);
    } catch (err) {
        next(err);
    }
});

app.delete("/posts/:id", async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id) || id <= 0) throw new Error("Invalid post ID");

        const message = await deleteOnePost(id);
        res.json({ message });
    } catch (err) {
        next(err);
    }
});

app.use(errorHandler);

app.listen(port, () => {
    console.log(`SERVER IS RUNNING on port ${port}`);
});
