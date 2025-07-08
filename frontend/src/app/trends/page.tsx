"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";

interface TrendingTopic {
    id: string;
    title: string;
    source: string;
    score: number;
    url?: string;
}

interface TrendsStatus {
    lastFetchTime: string;
    cacheAge: number;
    cacheDuration: number;
    hasCachedData: boolean;
    cachedTrendsCount: number;
}

export default function TrendsPage() {
    const [trends, setTrends] = useState<TrendingTopic[]>([]);
    const [status, setStatus] = useState<TrendsStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeSource, setActiveSource] = useState<string | null>(null);

    useEffect(() => {
        fetchTrends();
        fetchStatus();
    }, []);

    const fetchTrends = async () => {
        try {
            setLoading(true);
            const response = await axios.get("http://localhost:5000/api/trends");
            console.log("Trends data:", response.data); // Log the data for debugging

            // Ensure each trend has a unique ID
            const trendsWithIds = (response.data.trends || []).map((trend: any, index: number) => {
                if (!trend.id) {
                    return { ...trend, id: `trend-${index}` };
                }
                return trend;
            });

            setTrends(trendsWithIds);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching trends:", err);
            setError("Failed to load trending topics");
            setLoading(false);
        }
    };

    const fetchStatus = async () => {
        try {
            const response = await axios.get("http://localhost:5000/api/trends/status");
            setStatus(response.data);
        } catch (err) {
            console.error("Error fetching trends status:", err);
        }
    };

    const handleRefresh = async () => {
        try {
            setRefreshing(true);
            setError(null);
            await axios.post("http://localhost:5000/api/trends/refresh");
            await fetchTrends();
            await fetchStatus();
            setRefreshing(false);
        } catch (err) {
            console.error("Error refreshing trends:", err);
            setError("Failed to refresh trending topics");
            setRefreshing(false);
        }
    };

    // Add an index to make sure sources are unique even if there are duplicates
    const uniqueSources = [...new Set(trends.map((trend) => trend.source))];

    const filteredTrends = activeSource
        ? trends.filter((trend) => trend.source === activeSource)
        : trends;

    const formatDate = (dateString: string) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleString();
    };

    const formatTimeAgo = (seconds: number) => {
        if (!seconds) return "N/A";
        if (seconds < 60) return `${seconds} seconds ago`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
        return `${Math.floor(seconds / 3600)} hours ago`;
    };

    return (
        <div className="container py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Trending Topics</h1>
                <Button onClick={handleRefresh} disabled={refreshing}>
                    {refreshing ? "Refreshing..." : "Refresh Trends"}
                </Button>
            </div>

            {status && (
                <div className="bg-muted p-4 rounded-md mb-6">
                    <h2 className="font-semibold mb-2">Trends Status</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div key="last-updated">
                            <span className="text-muted-foreground">Last Updated:</span>{" "}
                            {formatDate(status.lastFetchTime)}
                        </div>
                        <div key="cache-age">
                            <span className="text-muted-foreground">Cache Age:</span>{" "}
                            {formatTimeAgo(status.cacheAge)}
                        </div>
                        <div key="cache-duration">
                            <span className="text-muted-foreground">Cache Duration:</span>{" "}
                            {Math.round(status.cacheDuration / 60)} minutes
                        </div>
                        <div key="cached-trends">
                            <span className="text-muted-foreground">Cached Trends:</span>{" "}
                            {status.cachedTrendsCount}
                        </div>
                    </div>
                </div>
            )}

            {error && (
                <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-6">
                    {error}
                </div>
            )}

            <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                    <Button
                        key="all-sources"
                        variant={activeSource === null ? "default" : "outline"}
                        onClick={() => setActiveSource(null)}
                    >
                        All Sources
                    </Button>
                    {uniqueSources.map((source, index) => (
                        <Button
                            key={`source-${index}-${source}`}
                            variant={activeSource === source ? "default" : "outline"}
                            onClick={() => setActiveSource(source)}
                        >
                            {source}
                        </Button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="py-12 text-center">Loading trending topics...</div>
            ) : filteredTrends.length === 0 ? (
                <div className="py-12 text-center">No trending topics found</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTrends.map((trend, index) => (
                        <div key={trend.id || `trend-${index}`} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-2">
                                <h2 className="font-semibold text-lg">{trend.title}</h2>
                                <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs">
                                    Score: {trend.score}
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">Source: {trend.source}</p>
                            {trend.url && (
                                <a
                                    href={trend.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-primary hover:underline"
                                >
                                    View Source
                                </a>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
} 