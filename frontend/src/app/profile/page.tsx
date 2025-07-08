"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";

interface CommentHistory {
    _id: string;
    content: string;
    createdAt: string;
    articleId: string;
    articleTitle: string;
    articleSlug: string;
}

export default function ProfilePage() {
    const router = useRouter();
    const { user, loading: authLoading, isAuthenticated } = useAuthContext();
    const [comments, setComments] = useState<CommentHistory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Redirect if not authenticated
        if (!authLoading && !isAuthenticated) {
            router.push("/");
        }
    }, [authLoading, isAuthenticated, router]);

    useEffect(() => {
        const fetchCommentHistory = async () => {
            if (!isAuthenticated) return;

            try {
                setLoading(true);
                const token = localStorage.getItem("auth_token");

                if (!token) {
                    setError("Authentication token not found");
                    setLoading(false);
                    return;
                }

                const response = await axios.get(
                    "http://localhost:5000/api/comments/user/history",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                setComments(response.data.comments || []);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching comment history:", err);
                setError("Failed to load comment history");
                setLoading(false);
            }
        };

        if (isAuthenticated) {
            fetchCommentHistory();
        }
    }, [isAuthenticated]);

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

    if (!isAuthenticated) {
        return null; // Will redirect in useEffect
    }

    return (
        <div className="container py-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center mb-8">
                    {user?.image ? (
                        <img
                            src={user.image}
                            alt={user.name || "User"}
                            className="h-16 w-16 rounded-full mr-4"
                        />
                    ) : (
                        <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xl mr-4">
                            {user?.name?.charAt(0) || "U"}
                        </div>
                    )}
                    <div>
                        <h1 className="text-3xl font-bold">{user?.name}</h1>
                        <p className="text-muted-foreground">{user?.email}</p>
                    </div>
                </div>

                <div className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">Your Comment History</h2>

                    {loading ? (
                        <div className="py-8 text-center">Loading comments...</div>
                    ) : error ? (
                        <div className="py-8 text-center text-destructive">{error}</div>
                    ) : comments.length === 0 ? (
                        <div className="py-8 text-center">
                            <p className="mb-4">You haven't made any comments yet.</p>
                            <Button asChild>
                                <Link href="/">Browse Articles</Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {comments.map((comment) => (
                                <div key={comment._id} className="border rounded-lg p-4">
                                    <div className="flex justify-between mb-2">
                                        <Link
                                            href={`/articles/${comment.articleSlug}`}
                                            className="font-medium hover:underline"
                                        >
                                            {comment.articleTitle}
                                        </Link>
                                        <span className="text-sm text-muted-foreground">
                                            {formatDate(comment.createdAt)}
                                        </span>
                                    </div>
                                    <p className="text-muted-foreground">{comment.content}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 