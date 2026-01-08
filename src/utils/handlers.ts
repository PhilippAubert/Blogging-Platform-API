import { ErrorRequestHandler } from "express";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    const status = (err as any).status ?? 500;
    const message = err.message ?? "Something broke!";
    console.log(err);
    res.status(status).json({ error: message });
};