"use client";
import { BookingProvider } from "./BookingContext";
import BookingModal from "./BookingModal";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <BookingProvider>
      {children}
      <BookingModal />
    </BookingProvider>
  );
}
