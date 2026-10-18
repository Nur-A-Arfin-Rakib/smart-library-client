"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Heart, Search, BookMarked, ArrowRight } from "lucide-react";
import { RequireRole } from "@/components/RequireRole";
import { api } from "@/lib/api";
import { Book } from "@/types/library";

interface WishlistItem {
  _id: string;
  book: Book;
}

function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const { data } = await api.get<WishlistItem[]>("/books/wishlist/my");
      // Filter out any orphaned items whose book was removed
      const valid = (data || []).filter((i) => i && i.book && i.book._id);
      setItems(valid);
    } catch {
      toast.error("Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (bookId: string) => {
    try {
      await api.post(`/books/${bookId}/wishlist`);
      toast.success("Removed from wishlist");
      setItems((prev) => prev.filter((i) => i.book?._id !== bookId));
    } catch {
      toast.error("Failed to update wishlist");
    }
  };

  const handleBorrow = async (bookId: string) => {
    try {
      await api.post(`/books/${bookId}/borrow`);
      toast.success("Book borrowed — due in 30 days");
      fetchWishlist();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Borrow failed");
    }
  };

  const filtered = items.filter((i) => {
    const title = i.book?.title?.toLowerCase() || "";
    const author = i.book?.author?.toLowerCase() || "";
    const q = query.toLowerCase();
    return title.includes(q) || author.includes(q);
  });

  return (
    <div>
      <span className="eyebrow">Saved for later</span>
      <h1 className="mt-1 mb-1 font-serif text-2xl text-ink dark:text-white">
        My Wishlist
      </h1>
      <p className="mb-6 text-sm text-gray-500">
        Books you&apos;ve bookmarked with the heart icon on the catalog page.
      </p>

      {items.length > 0 && (
        <div className="mb-6 relative max-w-sm">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search saved books..."
            className="input-field pl-8 !py-1.5 text-xs"
          />
        </div>
      )}

      {loading ? (
        <p className="text-sm text-gray-500">Loading wishlist...</p>
      ) : items.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 p-10 text-center">
          <div className="stat-icon bg-stamp/10 text-stamp">
            <Heart size={22} className="text-stamp" />
          </div>
          <h3 className="font-semibold text-ink dark:text-white">Your wishlist is empty</h3>
          <p className="max-w-xs text-xs text-gray-500">
            Save books you&apos;d like to read later by tapping the heart icon on any book in the catalog.
          </p>
          <Link href="/student/books" className="btn-primary mt-2 text-xs">
            <BookMarked size={14} className="mr-1.5" /> Browse Books
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-gray-500">No matching books in your wishlist.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item, i) => {
            const b = item.book;
            if (!b) return null;
            return (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card flex flex-col p-5"
              >
                <div className="mb-1 flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-ink dark:text-white">{b.title}</h3>
                  <button
                    onClick={() => handleRemove(b._id)}
                    aria-label="Remove from wishlist"
                    className="shrink-0 p-1 hover:scale-110 transition"
                  >
                    <Heart size={18} className="fill-stamp text-stamp" />
                  </button>
                </div>
                <p className="mb-2 text-xs text-gray-500">{b.author}</p>
                {b.shelfLocation && (
                  <p className="mb-3 text-[11px] text-gray-400">Shelf: {b.shelfLocation}</p>
                )}
                <div className="mt-auto pt-3 border-t border-ink/5 dark:border-white/5 flex items-center justify-between">
                  <span className="font-mono text-xs text-gray-500">
                    {b.availableCopies}/{b.totalCopies} available
                  </span>
                  {b.availableCopies > 0 ? (
                    <button
                      onClick={() => handleBorrow(b._id)}
                      className="btn-primary !py-1 !px-3 text-xs"
                    >
                      Borrow Now
                    </button>
                  ) : (
                    <span className="rounded bg-stamp/10 px-2 py-0.5 text-[10px] font-semibold text-stamp">
                      Unavailable
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function StudentWishlistPage() {
  return (
    <RequireRole allow={["student"]}>
      <WishlistPage />
    </RequireRole>
  );
}
