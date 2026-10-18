export interface Seat {
  id: string;
  seatNumber: string;
  status: "available" | "booked";
}

export interface ZoneWithSeats {
  id: string;
  name: string;
  description?: string;
  restrictedToDepartment?: string;
  seats: Seat[];
}

export interface Booking {
  _id: string;
  seat: { _id: string; seatNumber: string };
  zone: { _id: string; name: string };
  startTime: string;
  endTime: string;
  status: "booked" | "checked-in" | "completed" | "no-show" | "cancelled";
  qrToken: string;
}

export interface Book {
  _id: string;
  title: string;
  author: string;
  isbn: string;
  category?: string;
  shelfLocation?: string;
  totalCopies: number;
  availableCopies: number;
  avgRating?: number | null;
  reviewCount?: number;
}

export interface BorrowRecord {
  _id: string;
  book: { _id: string; title: string; author: string; isbn: string; shelfLocation?: string };
  issueDate: string;
  dueDate: string;
  returnDate?: string;
  status: "borrowed" | "returned" | "overdue" | "purchased";
  fine: number;
  liveFine: number;
  finePaid: boolean;
  renewed: boolean;
}

export interface AttendanceRecord {
  _id: string;
  student: string;
  type: "entry" | "exit";
  createdAt: string;
}

export interface LibrarianBorrowRecord extends Omit<BorrowRecord, "book"> {
  student: {
    _id: string;
    name: string;
    email: string;
    department?: string;
    studentId?: string;
  };
  book: {
    _id: string;
    title: string;
    author: string;
    isbn: string;
    shelfLocation?: string;
  };
}

export interface LibrarianBooking {
  _id: string;
  student: {
    _id: string;
    name: string;
    email: string;
    department?: string;
    studentId?: string;
  };
  seat: { _id: string; seatNumber: string };
  zone: { _id: string; name: string };
  startTime: string;
  endTime: string;
  status: "booked" | "checked-in" | "completed" | "no-show" | "cancelled";
  qrToken: string;
  checkedInAt?: string;
}

