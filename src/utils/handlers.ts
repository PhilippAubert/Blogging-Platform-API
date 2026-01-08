import { ErrorRequestHandler } from "express";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    const status = (err as any).status ?? 500;
    const message = err.message ?? "Something broke!";
    console.log(err);
    res.status(status).json({ error: message });
};

export const validateID = (id:number): boolean => {
    return !(isNaN(id) || id <= 0);
};

export const validateBody = (title: string, content: string, category: string, tags: string[]) => {
    return !(!title || !content || !category || !Array.isArray(tags))
};