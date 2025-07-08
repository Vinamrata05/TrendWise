"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Article {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  publishedAt: string;
  media?: {
    images?: string[];
  };
}

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:5000/api/articles?page=${page}&limit=10&search=${search}`
        );
        setArticles(response.data.articles);
        setTotalPages(Math.ceil(response.data.total / 10));
        setLoading(false);
      } catch (err) {
        console.error("Error fetching articles:", err);
        setError("Failed to load articles");
        setLoading(false);
      }
    };

    fetchArticles();
  }, [page, search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
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
    e.currentTarget.src = "https://placehold.co/600x400?text=No+Image";
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Latest Articles</h1>

      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search articles..."
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <Button type="submit">Search</Button>
        </div>
      </form>

      {loading ? (
        <div className="flex justify-center py-12">Loading articles...</div>
      ) : error ? (
        <div className="text-destructive py-12 text-center">{error}</div>
      ) : articles.length === 0 ? (
        <div className="text-center py-12">No articles found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <Link
              href={`/articles/${article.slug}`}
              key={article._id}
              className="group"
            >
              <div className="border rounded-lg overflow-hidden h-full flex flex-col hover:shadow-md transition-shadow">
                {article.media?.images && article.media.images.length > 0 ? (
                  <img
                    src={article.media.images[0]}
                    alt={article.title}
                    className="h-48 w-full object-cover"
                    onError={handleImageError}
                  />
                ) : (
                  <div className="h-48 w-full bg-muted flex items-center justify-center text-muted-foreground">
                    No image available
                  </div>
                )}
                <div className="p-4 flex flex-col flex-1">
                  <h2 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                    {article.title}
                  </h2>
                  <p className="text-muted-foreground mb-4 flex-1">
                    {article.excerpt}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(article.publishedAt)}
                  </p>
                </div>
              </div>
            </Link>
          ))}
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
