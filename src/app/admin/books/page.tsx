"use client";

import { useEffect, useState, FormEvent } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { RequireRole } from "@/components/RequireRole";
import { SearchBar } from "@/components/SearchBar";
import { api } from "@/lib/api";
import { Book } from "@/types/library";

function BookAdmin() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [isbn, setIsbn] = useState("");
  const [category, setCategory] = useState("");
  const [shelfLocation, setShelfLocation] = useState("");
  const [copies, setCopies] = useState(1);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTotalCopies, setEditTotalCopies] = useState(1);
  const [editShelf, setEditShelf] = useState("");

  const fetchBooks = async () => {
    setLoading(true);
    const { data } = await api.get<Book[]>("/admin/books");
    setBooks(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/admin/books", {
        title,
        author,
        isbn,
        category: category || undefined,
        shelfLocation: shelfLocation || undefined,
        totalCopies: copies,
      });
      toast.success("Book added");
      setTitle("");
      setAuthor("");
      setIsbn("");
      setCategory("");
      setShelfLocation("");
      setCopies(1);
      fetchBooks();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to add book");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/admin/books/${id}`);
      toast.success("Book removed");
      fetchBooks();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete book");
    }
  };

  const startEdit = (book: Book) => {
    setEditingId(book._id);
    setEditTotalCopies(book.totalCopies);
    setEditShelf(book.shelfLocation || "");
  };

  const handleSaveEdit = async (id: string) => {
    try {
      await api.put(`/admin/books/${id}`, {
        totalCopies: editTotalCopies,
        shelfLocation: editShelf || undefined,
      });
      toast.success("Book updated");
      setEditingId(null);
      fetchBooks();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update book");
    }
  };

  const filtered = books.filter(
    (b) =>
      b.title.toLowerCase().includes(query.toLowerCase()) ||
      b.author.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold text-gray-900 dark:text-white">
        Manage books
      </h1>
      <p className="mb-6 text-sm text-gray-500">
        Add books to the catalog and manage copies.
      </p>

      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleCreate}
        className="card mb-8 grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3"
      >
        <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="input-field" />
        <input required value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Author" className="input-field" />
        <input required value={isbn} onChange={(e) => setIsbn(e.target.value)} placeholder="ISBN" className="input-field" />
        <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category (optional)" className="input-field" />
        <input value={shelfLocation} onChange={(e) => setShelfLocation(e.target.value)} placeholder="Shelf location (optional)" className="input-field" />
        <input
          type="number"
          min={1}
          value={copies}
          onChange={(e) => setCopies(Number(e.target.value))}
          placeholder="Total copies"
          className="input-field"
        />
        <button className="btn-primary sm:col-span-2 lg:col-span-3">Add book</button>
      </motion.form>

      <div className="mb-4">
        <SearchBar value={query} onChange={setQuery} placeholder="Search catalog..." />
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((book) => (
            <div key={book._id} className="card p-5">
              <h3 className="font-medium text-gray-900 dark:text-white">{book.title}</h3>
              <p className="mb-2 text-sm text-gray-500">{book.author}</p>

              {editingId === book._id ? (
                <div className="mb-3 flex flex-col gap-2">
                  <input
                    type="number"
                    min={0}
                    value={editTotalCopies}
                    onChange={(e) => setEditTotalCopies(Number(e.target.value))}
                    placeholder="Total copies"
                    className="input-field !py-1.5 text-sm"
                  />
                  <input
                    value={editShelf}
                    onChange={(e) => setEditShelf(e.target.value)}
                    placeholder="Shelf location"
                    className="input-field !py-1.5 text-sm"
                  />
                  <div className="flex gap-2">
                    <button onClick={() => handleSaveEdit(book._id)} className="btn-primary !py-1.5 !px-3 text-xs">
                      Save
                    </button>
                    <button onClick={() => setEditingId(null)} className="btn-secondary !py-1.5 !px-3 text-xs">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="mb-3 text-xs text-gray-400">
                  {book.availableCopies}/{book.totalCopies} available · ISBN {book.isbn}
                  {book.shelfLocation ? ` · Shelf ${book.shelfLocation}` : ""}
                </p>
              )}

              {editingId !== book._id && (
                <div className="flex gap-3">
                  <button
                    onClick={() => startEdit(book)}
                    className="text-xs font-medium text-accent hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(book._id)}
                    className="text-xs font-medium text-red-500 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          ))}
          {filtered.length === 0 && <p className="text-sm text-gray-500">No books found.</p>}
        </div>
      )}
    </div>
  );
}

export default function AdminBooksPage() {
  return (
    <RequireRole allow={["admin"]}>
      <BookAdmin />
    </RequireRole>
  );
}
