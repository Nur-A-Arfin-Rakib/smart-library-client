"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Heart } from "lucide-react";
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

  const fetchWishlist = async () => {
    setLoading(true);
    const { data } = await api.get<WishlistItem[]>("/books/wishlist/my");
    setItems(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (bookId: string) => {
    try {
      await api.post(`/books/${bookId}/wishlist`);
      toast.success("Removed from wishlist");
      setItems((prev) => prev.filter((i) => i.book._id !== bookId));
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

  return (
    <div>
      <span className="eyebrow">Saved for later</span>
      <h1 className="mt-1 mb-1 font-serif text-2xl text-ink dark:text-white">
        My wishlist
      </h1>
      <p className="mb-8 text-sm text-gray-500">
        Books you&apos;ve saved with the heart icon on the Books page.
      </p>

      {loading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : items.length === 0 ? (
        <div className="card flex flex-col items-center gap-2 p-10 text-center">
          <Heart size={22} className="text-gray-300" />
          <p className="text-sm text-gray-500">
            Nothing saved yet — tap the heart icon on any book in{" "}
            <span className="font-medium text-ink dark:text-white">Books</span>{" "}
            to add it here.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card flex flex-col p-5"
            >
              <div className="mb-1 flex items-start justify-between gap-2">
                <h3 className="font-medium text-ink dark:text-white">{item.book.title}</h3>
                <button
                  onClick={() => handleRemove(item.book._id)}
                  aria-label="Remove from wishlist"
                  className="shrink-0"
                >
                  <Heart size={18} className="fill-stamp text-stamp" />
                </button>
              </div>
              <p className="mb-3 text-sm text-gray-500">{item.book.author}</p>
              <p className="mb-4 font-mono text-xs text-gray-400">
                {item.book.availableCopies}/{item.book.totalCopies} available
              </p>
              {item.book.availableCopies > 0 ? (
                <button onClick={() => handleBorrow(item.book._id)} className="btn-primary mt-auto !py-2 text-sm">
                  Borrow
                </button>
              ) : (
                <span className="mt-auto rounded-lg bg-stamp/10 px-3 py-2 text-center text-xs text-stamp">
                  Currently unavailable
                </span>
              )}
            </motion.div>
          ))}
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
