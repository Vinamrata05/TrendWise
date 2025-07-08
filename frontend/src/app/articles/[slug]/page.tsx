"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import { useAuthContext } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";

interface Article {
    _id: string;
    title: string;
    slug: string;
    content: string;
    publishedAt: string;
    author: string;
    media?: {
        images?: string[];
    };
}

interface Comment {
    _id: string;
    content: string;
    createdAt: string;
    userName: string;
    userAvatar?: string;
}

export default function ArticlePage() {
    const { slug } = useParams();
    const { user, isAuthenticated } = useAuthContext();
    const [article, setArticle] = useState<Article | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [commentContent, setCommentContent] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchArticle = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem("auth_token");
                const headers = token ? { Authorization: `Bearer ${token}` } : {};

                const articleResponse = await axios.get(
                    `http://localhost:5000/api/articles/${slug}`,
                    { headers }
                );

                setArticle(articleResponse.data);

                // Fetch comments for this article
                const commentsResponse = await axios.get(
                    `http://localhost:5000/api/comments/${articleResponse.data._id}`
                );

                setComments(commentsResponse.data.comments || []);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching article:", err);
                setError("Failed to load article");
                setLoading(false);
            }
        };

        if (slug) {
            fetchArticle();
        }
    }, [slug]);

    const handleSubmitComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentContent.trim()) return;

        try {
            setSubmitting(true);
            const token = localStorage.getItem("auth_token");

            if (!token) {
                setError("You must be logged in to comment");
                setSubmitting(false);
                return;
            }

            const response = await axios.post(
                `http://localhost:5000/api/comments/${article?._id}`,
                { content: commentContent },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            // Add the new comment to the comments array
            setComments([response.data, ...comments]);
            setCommentContent("");
            setSubmitting(false);
        } catch (err) {
            console.error("Error posting comment:", err);
            setError("Failed to post comment");
            setSubmitting(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    // Function to handle image loading errors
    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
        e.currentTarget.src = "https://placehold.co/800x400?text=No+Image";
    };

    if (loading) {
        return (
            <div className="container py-12 flex justify-center">
                Loading article...
            </div>
        );
    }

    if (error || !article) {
        return (
            <div className="container py-12 text-center text-destructive">
                {error || "Article not found"}
            </div>
        );
    }

    return (
        <div className="container py-8">
            <article className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold mb-4">{article.title}</h1>

                <div className="flex items-center text-sm text-muted-foreground mb-8">
                    <span>By {article.author}</span>
                    <span className="mx-2">•</span>
                    <span>{formatDate(article.publishedAt)}</span>
                </div>

                {article.media?.images && article.media.images.length > 0 && (
                    <div className="mb-8">
                        <img
                            src={article.media.images[0]}
                            alt={article.title}
                            className="w-full h-auto rounded-lg"
                            onError={handleImageError}
                        />
                    </div>
                )}

                <div
                    className="prose prose-lg max-w-none mb-12"
                    dangerouslySetInnerHTML={{ __html: article.content }}
                />

                <div className="border-t pt-8">
                    <h2 className="text-2xl font-bold mb-6">Comments</h2>

                    {isAuthenticated ? (
                        <form onSubmit={handleSubmitComment} className="mb-8">
                            <div className="mb-4">
                                <label htmlFor="comment" className="block text-sm font-medium mb-2">
                                    Leave a comment
                                </label>
                                <textarea
                                    id="comment"
                                    rows={4}
                                    value={commentContent}
                                    onChange={(e) => setCommentContent(e.target.value)}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    placeholder="Share your thoughts..."
                                />
                            </div>
                            <Button type="submit" disabled={submitting}>
                                {submitting ? "Posting..." : "Post Comment"}
                            </Button>
                        </form>
                    ) : (
                        <div className="bg-muted p-4 rounded-md mb-8">
                            <p>Please sign in to leave a comment.</p>
                        </div>
                    )}

                    {comments.length === 0 ? (
                        <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
                    ) : (
                        <div className="space-y-6">
                            {comments.map((comment) => (
                                <div key={comment._id} className="border-b pb-6">
                                    <div className="flex items-center mb-2">
                                        {comment.userAvatar ? (
                                            <img
                                                src={comment.userAvatar}
                                                alt={comment.userName}
                                                className="h-8 w-8 rounded-full mr-2"
                                                onError={(e) => {
                                                    e.currentTarget.src = "https://placehold.co/32x32?text=" + comment.userName.charAt(0);
                                                }}
                                            />
                                        ) : (
                                            <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-2">
                                                {comment.userName.charAt(0)}
                                            </div>
                                        )}
                                        <span className="font-medium">{comment.userName}</span>
                                        <span className="mx-2 text-muted-foreground">•</span>
                                        <span className="text-sm text-muted-foreground">
                                            {formatDate(comment.createdAt)}
                                        </span>
                                    </div>
                                    <p>{comment.content}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </article>
        </div>
    );
} 