export type Post = {
    id: number;
    title: string;
    content: string;
    category: string;
    tags: string;
    created_at?: Date;
    updated_at?: Date;
}