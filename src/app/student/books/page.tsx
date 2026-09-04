"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Heart } from "lucide-react";
import { RequireRole } from "@/components/RequireRole";
import { SearchBar } from "@/components/SearchBar";
import { api } from "@/lib/api";
import { Book, BorrowRecord } from "@/types/library";

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString();
}

function BooksPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [books, setBooks] = useState<Book[]>([]);
  const [myBorrows, setMyBorrows] = useState<BorrowRecord[]>([]);
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [notifiedBooks, setNotifiedBooks] = useState<{ _id: string; book: { title: string } }[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBooks = async (search: string) => {
    const { data } = await api.get<Book[]>("/books", { params: { search } });
    setBooks(data);
  };

  const fetchMyBorrows = async () => {
    const { data } = await api.get<BorrowRecord[]>("/books/my-borrows");
    setMyBorrows(data);
  };

  const fetchWishlist = async () => {
    const { data } = await api.get<{ book: { _id: string } }[]>("/books/wishlist/my");
    setWishlistIds(new Set(data.map((w) => w.book._id)));
  };

  const fetchReservations = async () => {
    const { data } = await api.get<{ _id: string; status: string; book: { title: string } }[]>(
      "/books/reservations/my"
    );
    setNotifiedBooks(data.filter((r) => r.status === "notified"));
  };

  const handleToggleWishlist = async (bookId: string) => {
    try {
      const { data } = await api.post<{ wishlisted: boolean }>(`/books/${bookId}/wishlist`);
      setWishlistIds((prev) => {
        const next = new Set(prev);
        if (data.wishlisted) next.add(bookId);
        else next.delete(bookId);
        return next;
      });
    } catch {
      toast.error("Failed to update wishlist");
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([fetchBooks(""), fetchMyBorrows(), fetchWishlist(), fetchReservations()]);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    const payment = searchParams.get("payment");
    if (payment === "success") {
      toast.success("Payment received — thanks!");
      fetchMyBorrows();
      router.replace("/student/books");
    } else if (payment === "cancelled") {
      toast("Payment cancelled", { icon: "ℹ️" });
      router.replace("/student/books");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    const t = setTimeout(() => fetchBooks(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  const handleBorrow = async (bookId: string) => {
    try {
      await api.post(`/books/${bookId}/borrow`);
      toast.success("Book borrowed — due in 30 days");
      fetchBooks(query);
      fetchMyBorrows();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Borrow failed");
    }
  };

  const handleReserve = async (bookId: string) => {
    try {
      await api.post(`/books/${bookId}/reserve`);
      toast.success("You're on the hold list — we'll notify you");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Reservation failed");
    }
  };

  const handleRenew = async (recordId: string) => {
    try {
      await api.patch(`/books/borrow/${recordId}/renew`);
      toast.success("Due date extended by 7 days");
      fetchMyBorrows();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Renewal failed");
    }
  };

  const handlePayFine = async (recordId: string) => {
    try {
      const { data } = await api.post<{ url: string }>(`/payments/checkout-session/${recordId}`);
      window.location.href = data.url; // redirect to Stripe's hosted checkout page
    } catch (err: any) {
      if (err?.response?.status === 503) {
        // Stripe isn't configured on this server yet — fall back to the
        // direct "mark as paid" flow so the app is still testable locally.
        try {
          await api.post(`/books/borrow/${recordId}/pay-fine`);
          toast.success("Fine marked as paid (Stripe not configured — using test flow)");
          fetchMyBorrows();
        } catch (fallbackErr: any) {
          toast.error(fallbackErr?.response?.data?.message || "Payment failed");
        }
        return;
      }
      toast.error(err?.response?.data?.message || "Payment failed");
    }
  };

  const handleReview = async (bookId: string, rating: number) => {
    try {
      await api.post(`/books/${bookId}/review`, { rating });
      toast.success("Thanks for your review!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Review failed");
    }
  };

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold text-gray-900 dark:text-white">
        Books
      </h1>
      <p className="mb-6 text-sm text-gray-500">
        Search the catalog, borrow, renew, or reserve a book.
      </p>

      <div className="mb-8">
        <SearchBar value={query} onChange={setQuery} placeholder="Search by title or author..." />
      </div>

      {notifiedBooks.length > 0 && (
        <div className="card mb-8 border-l-4 border-accent p-4 text-sm">
          <p className="font-medium text-gray-900 dark:text-white">
            A book you reserved is now available:
          </p>
          <ul className="mt-1 list-inside list-disc text-gray-600 dark:text-gray-400">
            {notifiedBooks.map((r) => (
              <li key={r._id}>{r.book?.title ?? "Unknown book"} — borrow it soon before someone else does</li>
            ))}
          </ul>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : (
        <>
          <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {books.map((book, i) => (
              <motion.div
                key={book._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="card flex flex-col p-5"
              >
                <div className="mb-1 flex items-start justify-between gap-2">
                  <h3 className="font-medium text-gray-900 dark:text-white">{book.title}</h3>
                  <button
                    onClick={() => handleToggleWishlist(book._id)}
                    aria-label="Toggle wishlist"
                    className="shrink-0"
                  >
                    <Heart
                      size={18}
                      className={wishlistIds.has(book._id) ? "fill-red-500 text-red-500" : "text-gray-300"}
                    />
                  </button>
                </div>
                <p className="mb-1 text-sm text-gray-500">{book.author}</p>
                {book.avgRating != null && (
                  <p className="mb-2 flex items-center gap-1 text-xs text-amber-500">
                    <span>★ {book.avgRating}</span>
                    <span className="text-gray-400">({book.reviewCount})</span>
                  </p>
                )}
                <p className="mb-4 text-xs text-gray-400">
                  {book.availableCopies}/{book.totalCopies} available
                  {book.shelfLocation ? ` · Shelf ${book.shelfLocation}` : ""}
                </p>
                {book.availableCopies > 0 ? (
                  <button onClick={() => handleBorrow(book._id)} className="btn-primary mt-auto !py-2 text-sm">
                    Borrow
                  </button>
                ) : (
                  <button onClick={() => handleReserve(book._id)} className="btn-secondary mt-auto !py-2 text-sm">
                    Join hold queue
                  </button>
                )}
              </motion.div>
            ))}
            {books.length === 0 && (
              <p className="text-sm text-gray-500">No books found.</p>
            )}
          </div>

          <h2 className="mb-3 mt-10 text-lg font-semibold text-gray-900 dark:text-white">
            My borrowed books
          </h2>
          <div className="flex flex-col gap-3">
            {myBorrows.length === 0 && (
              <p className="text-sm text-gray-500">You haven&apos;t borrowed any books yet.</p>
            )}
            {myBorrows.map((r) => (
              <div key={r._id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{r.book?.title ?? "Unknown book"}</p>
                  <p className="text-xs text-gray-500">
                    Due {fmtDate(r.dueDate)} · Status:{" "}
                    <span className="font-medium">{r.status}</span>
                    {r.liveFine > 0 && (
                      <span className="ml-2 text-red-500">Fine: Tk {r.liveFine}</span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {r.status === "borrowed" && !r.renewed && (
                    <button onClick={() => handleRenew(r._id)} className="btn-secondary !py-1.5 !px-3 text-xs">
                      Renew
                    </button>
                  )}
                  {!r.finePaid && r.liveFine > 0 && (
                    <button onClick={() => handlePayFine(r._id)} className="btn-primary !py-1.5 !px-3 text-xs">
                      Pay Tk {r.liveFine}
                    </button>
                  )}
                  {r.status === "returned" && r.book?._id && (
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => handleReview(r.book._id, star)}
                          className="text-lg text-amber-400 hover:scale-110 transition"
                          aria-label={`Rate ${star} stars`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function StudentBooksPage() {
  return (
    <RequireRole allow={["student"]}>
      <BooksPage />
    </RequireRole>
  );
}
