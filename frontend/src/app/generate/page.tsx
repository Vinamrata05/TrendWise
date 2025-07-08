"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";

interface TrendingTopic {
    id: string;
    title: string;
    source: string;
    score: number;
}

export default function GeneratePage() {
    const router = useRouter();
    const { loading: authLoading, isAdmin } = useAuthContext();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [trends, setTrends] = useState<TrendingTopic[]>([]);
    const [selectedTrend, setSelectedTrend] = useState<string>("");
    const [customTopic, setCustomTopic] = useState<string>("");
    const [generationType, setGenerationType] = useState<"trend" | "custom">("trend");

    useEffect(() => {
        // Redirect if not admin
        if (!authLoading && !isAdmin) {
            router.push("/");
        }
    }, [authLoading, isAdmin, router]);

    useEffect(() => {
        const fetchTrends = async () => {
            if (!isAdmin) return;

            try {
                const response = await axios.get("http://localhost:5000/api/trends");
                setTrends(response.data.trends || []);
            } catch (err) {
                console.error("Error fetching trends:", err);
                setError("Failed to load trending topics");
            }
        };

        if (isAdmin) {
            fetchTrends();
        }
    }, [isAdmin]);

    const handleGenerateArticle = async () => {
        try {
            setLoading(true);
            setError(null);
            setSuccess(null);

            const token = localStorage.getItem("auth_token");

            if (!token) {
                setError("Authentication token not found");
                setLoading(false);
                return;
            }

            let response;

            if (generationType === "trend") {
                if (!selectedTrend) {
                    setError("Please select a trending topic");
                    setLoading(false);
                    return;
                }

                response = await axios.post(
                    "http://localhost:5000/api/admin/generate-from-trends",
                    { trendId: selectedTrend },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
            } else {
                if (!customTopic.trim()) {
                    setError("Please enter a custom topic");
                    setLoading(false);
                    return;
                }

                response = await axios.post(
                    "http://localhost:5000/api/admin/generate-article",
                    { topic: customTopic },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
            }

            setSuccess(`Article "${response.data.title}" generated successfully!`);

            // Reset form
            setSelectedTrend("");
            setCustomTopic("");

            setLoading(false);

            // Redirect to the edit page for the new article
            router.push(`/dashboard/edit/${response.data.slug}`);
        } catch (err) {
            console.error("Error generating article:", err);
            setError("Failed to generate article. Please try again.");
            setLoading(false);
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

    return (
        <div className="container py-8">
            <h1 className="text-3xl font-bold mb-8">Generate Article</h1>

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

            <div className="max-w-2xl">
                <div className="mb-6">
                    <div className="flex gap-4 mb-4">
                        <Button
                            type="button"
                            variant={generationType === "trend" ? "default" : "outline"}
                            onClick={() => setGenerationType("trend")}
                        >
                            From Trending Topic
                        </Button>
                        <Button
                            type="button"
                            variant={generationType === "custom" ? "default" : "outline"}
                            onClick={() => setGenerationType("custom")}
                        >
                            Custom Topic
                        </Button>
                    </div>

                    {generationType === "trend" ? (
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Select a Trending Topic
                            </label>
                            <select
                                value={selectedTrend}
                                onChange={(e) => setSelectedTrend(e.target.value)}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            >
                                <option value="">Select a trending topic</option>
                                {trends.map((trend) => (
                                    <option key={trend.id} value={trend.id}>
                                        {trend.title} (Score: {trend.score}, Source: {trend.source})
                                    </option>
                                ))}
                            </select>
                        </div>
                    ) : (
                        <div>
                            <label htmlFor="customTopic" className="block text-sm font-medium mb-2">
                                Custom Topic
                            </label>
                            <input
                                id="customTopic"
                                type="text"
                                value={customTopic}
                                onChange={(e) => setCustomTopic(e.target.value)}
                                placeholder="Enter a topic for the article"
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            />
                        </div>
                    )}
                </div>

                <Button
                    onClick={handleGenerateArticle}
                    disabled={loading}
                    className="w-full"
                >
                    {loading ? "Generating..." : "Generate Article"}
                </Button>

                <p className="mt-4 text-sm text-muted-foreground">
                    Note: Article generation may take up to a minute. Please be patient.
                </p>
            </div>
        </div>
    );
} 