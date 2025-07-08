"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";

interface Article {
    _id: string;
    title: string;
    slug: string;
    status: string;
    publishedAt: string;
    viewCount: number;
    commentCount: number;
}

export default function DashboardPage() {
    const router = useRouter();
    const { user, loading: authLoading, isAdmin } = useAuthContext();
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        // Redirect if not admin
        if (!authLoading && !isAdmin) {
            router.push("/");
        }
    }, [authLoading, isAdmin, router]);

    useEffect(() => {
        const fetchArticles = async () => {
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
                    `http://localhost:5000/api/admin/articles?page=${page}&limit=10`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                setArticles(response.data.articles || []);
                setTotalPages(Math.ceil(response.data.total / 10));
                setLoading(false);
            } catch (err) {
                console.error("Error fetching articles:", err);
                setError("Failed to load articles");
                setLoading(false);
            }
        };

        if (isAdmin) {
            fetchArticles();
        }
    }, [isAdmin, page]);

    const handleDeleteArticle = async (slug: string) => {
        if (!confirm("Are you sure you want to delete this article?")) {
            return;
        }

        try {
            const token = localStorage.getItem("auth_token");

            await axios.delete(`http://localhost:5000/api/articles/${slug}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            // Remove the article from the list
            setArticles(articles.filter(article => article.slug !== slug));
        } catch (err) {
            console.error("Error deleting article:", err);
            alert("Failed to delete article");
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
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

    return (
        <div className="container py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <Button asChild>
                    <Link href="/generate">Generate New Article</Link>
                </Button>
            </div>

            {loading ? (
                <div className="py-8 text-center">Loading articles...</div>
            ) : error ? (
                <div className="py-8 text-center text-destructive">{error}</div>
            ) : articles.length === 0 ? (
                <div className="py-8 text-center">
                    <p className="mb-4">No articles found.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left py-3 px-4">Title</th>
                                <th className="text-left py-3 px-4">Status</th>
                                <th className="text-left py-3 px-4">Published</th>
                                <th className="text-left py-3 px-4">Views</th>
                                <th className="text-left py-3 px-4">Comments</th>
                                <th className="text-left py-3 px-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {articles.map((article) => (
                                <tr key={article._id} className="border-b hover:bg-muted/50">
                                    <td className="py-3 px-4">
                                        <Link
                                            href={`/articles/${article.slug}`}
                                            className="font-medium hover:underline"
                                        >
                                            {article.title}
                                        </Link>
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className={`inline-block px-2 py-1 rounded text-xs ${article.status === 'published'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {article.status}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        {article.publishedAt ? formatDate(article.publishedAt) : "Draft"}
                                    </td>
                                    <td className="py-3 px-4">{article.viewCount || 0}</td>
                                    <td className="py-3 px-4">{article.commentCount || 0}</td>
                                    <td className="py-3 px-4">
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                asChild
                                            >
                                                <Link href={`/dashboard/edit/${article.slug}`}>
                                                    Edit
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleDeleteArticle(article.slug)}
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {!loading && !error && articles.length > 0 && (
                <div className="flex justify-center gap-2 mt-8">
                    <Button
                        variant="outline"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                    >
                        Previous
                    </Button>
                    <span className="flex items-center px-4">
                        Page {page} of {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                    >
                        Next
                    </Button>
                </div>
            )}
        </div>
    );
} 