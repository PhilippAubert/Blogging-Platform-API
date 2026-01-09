import express from "express";
import dotenv from "dotenv";

import { 
    listAllPosts,
    listOnePost,
    addPost,
    deleteOnePost,
    updatePost
} from "./db.js";

import {
    errorHandler,
    validateBody,
    validateID,
} from "./utils/handlers.js";

dotenv.config();

const port = process.env.PORT || 4400;
const app = express();

app.use(express.json());

app.get("/posts", async (req, res, next) => {

    const searchValue = Object.values(req.query).toString();
      
    try {
        const posts = await listAllPosts(searchValue);
        if (posts.length === 0) {
            res.status(200).send("Nothing found!");
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
        if (!validateID(id)) return res.status(412).end("unprocessable id");
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
        if (!validateBody(title, content, category, tags)) {
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
        const { title, content, category, tags } = req.body;
        if (!validateID(id)) throw new Error("Invalid post ID");      
        if (!validateBody(title, content, category, tags)) {
            res.status(400).json({ error: "Missing required fields" });
            return;
        }
        const updatedPost = await updatePost(id, title, content, category, tags);
        if (!updatedPost) {
            return res.status(404).json({ error: `Post not found: ${id}` });
        }
        res.status(200).json(updatedPost);
    } catch (err) {
        next(err);
    }
});
  
app.delete("/posts/:id", async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        if (!validateID(id)) throw new Error("Invalid post ID");
        const message = await deleteOnePost(id);
        if (!message) {
            return res.status(404).json({ error: `Post not found: ${id}` });
        }
        res.status(204).json({ message });
    } catch (err) {
        next(err);
    }
});

app.use(errorHandler);

app.listen(port, () => {
    console.log(`SERVER IS RUNNING on port ${port}`);
});