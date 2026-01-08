export type Post = {
    id?: number;
    title: string;
    content: string;
    category: string;
    tags: string;
    created_at?: Date;
    updated_at?: Date;
}

export type UpdatePostInput = Partial<Omit<Post, "id" | "created_at" | "updated_at">> & {
    tags?: string[];
};