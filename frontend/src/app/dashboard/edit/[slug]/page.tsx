"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { useAuthContext } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";

interface Article {
    _id: string;
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    status: string;
    author: string;
    publishedAt: string | null;
    meta: {
        title: string;
        description: string;
        keywords: string[];
    };
}

export default function EditArticlePage() {
    const { slug } = useParams();
    const router = useRouter();
    const { loading: authLoading, isAdmin } = useAuthContext();

    const [article, setArticle] = useState<Article | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Form state
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [excerpt, setExcerpt] = useState("");
    const [status, setStatus] = useState("draft");
    const [metaTitle, setMetaTitle] = useState("");
    const [metaDescription, setMetaDescription] = useState("");
    const [metaKeywords, setMetaKeywords] = useState("");

    useEffect(() => {
        // Redirect if not admin
        if (!authLoading && !isAdmin) {
            router.push("/");
        }
    }, [authLoading, isAdmin, router]);

    useEffect(() => {
        const fetchArticle = async () => {
            if (!isAdmin) return;

            try {
                setLoading(true);
                const token = localStorage.getItem("auth_token");

                if (!token) {
                    setError("Authentication token not found");
                    setLoading(false);
                    return;
                }

                const response = await axios.get(
                    `http://localhost:5000/api/articles/${slug}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const articleData = response.data;
                setArticle(articleData);

                // Populate form fields
                setTitle(articleData.title || "");
                setContent(articleData.content || "");
                setExcerpt(articleData.excerpt || "");
                setStatus(articleData.status || "draft");
                setMetaTitle(articleData.meta?.title || "");
                setMetaDescription(articleData.meta?.description || "");
                setMetaKeywords(articleData.meta?.keywords?.join(", ") || "");

                setLoading(false);
            } catch (err) {
                console.error("Error fetching article:", err);
                setError("Failed to load article");
                setLoading(false);
            }
        };

        if (isAdmin && slug) {
            fetchArticle();
        }
    }, [isAdmin, slug]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setSaving(true);
            setError(null);
            setSuccess(null);

            const token = localStorage.getItem("auth_token");

            if (!token) {
                setError("Authentication token not found");
                setSaving(false);
                return;
            }

            const updatedArticle = {
                title,
                content,
                excerpt,
                status,
                meta: {
                    title: metaTitle,
                    description: metaDescription,
                    keywords: metaKeywords.split(",").map(k => k.trim()).filter(Boolean),
                },
            };

            await axios.put(
                `http://localhost:5000/api/articles/${slug}`,
                updatedArticle,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setSuccess("Article updated successfully!");
            setSaving(false);
        } catch (err) {
            console.error("Error updating article:", err);
            setError("Failed to update article");
            setSaving(false);
        }
    };

    if (authLoading) {
        return (
            <div className="container py-12 flex justify-center">
                Loading...
            </div>
        );
    }

    if (!isAdmin) {
        return null; // Will redirect in useEffect
    }

    if (loading) {
        return (
            <div className="container py-12 flex justify-center">
                Loading article...
            </div>
        );
    }

    if (!article) {
        return (
            <div className="container py-12 text-center">
                <p className="text-destructive">Article not found</p>
                <Button className="mt-4" onClick={() => router.push("/dashboard")}>
                    Back to Dashboard
                </Button>
            </div>
        );
    }

    return (
        <div className="container py-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold">Edit Article</h1>
                <Button variant="outline" onClick={() => router.push("/dashboard")}>
                    Back to Dashboard
                </Button>
            </div>

            {error && (
                <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-6">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-100 text-green-800 p-4 rounded-md mb-6">
                    {success}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 gap-6">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium mb-2">
                            Title
                        </label>
                        <input
                            id="title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="excerpt" className="block text-sm font-medium mb-2">
                            Excerpt
                        </label>
                        <textarea
                            id="excerpt"
                            rows={3}
                            value={excerpt}
                            onChange={(e) => setExcerpt(e.target.value)}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="content" className="block text-sm font-medium mb-2">
                            Content
                        </label>
                        <textarea
                            id="content"
                            rows={15}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="status" className="block text-sm font-medium mb-2">
                            Status
                        </label>
                        <select
                            id="status"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                        </select>
                    </div>

                    <div className="border-t pt-6">
                        <h2 className="text-xl font-semibold mb-4">SEO Metadata</h2>

                        <div className="space-y-4">
                            <div>
                                <label htmlFor="metaTitle" className="block text-sm font-medium mb-2">
                                    Meta Title
                                </label>
                                <input
                                    id="metaTitle"
                                    type="text"
                                    value={metaTitle}
                                    onChange={(e) => setMetaTitle(e.target.value)}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                />
                            </div>

                            <div>
                                <label htmlFor="metaDescription" className="block text-sm font-medium mb-2">
                                    Meta Description
                                </label>
                                <textarea
                                    id="metaDescription"
                                    rows={2}
                                    value={metaDescription}
                                    onChange={(e) => setMetaDescription(e.target.value)}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                />
                            </div>

                            <div>
                                <label htmlFor="metaKeywords" className="block text-sm font-medium mb-2">
                                    Meta Keywords (comma separated)
                                </label>
                                <input
                                    id="metaKeywords"
                                    type="text"
                                    value={metaKeywords}
                                    onChange={(e) => setMetaKeywords(e.target.value)}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push("/dashboard")}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={saving}>
                        {saving ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            </form>
        </div>
    );
} 