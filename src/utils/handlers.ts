import { ErrorRequestHandler } from "express";
import { UpdatePostInput } from "../types/types.js";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    const status = (err as any).status ?? 500;
    const message = err.message ?? "Something broke!";
    console.log(err);
    res.status(status).json({ error: message });
};

export const buildUpdateFields = (fields: UpdatePostInput): { sql: string[]; values: (string | number)[] } => {
    const sql: string[] = [];
    const values: (string | number)[] = [];

    if (fields.title !== undefined) {
        sql.push("title = ?");
        values.push(fields.title);
    }
    if (fields.content !== undefined) {
        sql.push("content = ?");
        values.push(fields.content);
    }
    if (fields.category !== undefined) {
        sql.push("category = ?");
        values.push(fields.category);
    }
    if (fields.tags !== undefined) {
        sql.push("tags = ?");
        values.push(JSON.stringify(fields.tags));
    }

    return { sql, values };
};

