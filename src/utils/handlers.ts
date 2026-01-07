import { ErrorRequestHandler } from "express";

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Something broke!");
};


export const buildUpdateFields = (fieldsObj: Record<string, string | undefined>): { sql: string[], values: (string | number)[] } => {
    const sql: string[] = [];
    const values: (string | number)[] = [];

    for (const [key, value] of Object.entries(fieldsObj)) {
        if (value !== undefined) {
            sql.push(`${key} = ?`);
            values.push(value);
        }
    }

    return { sql, values };
}
