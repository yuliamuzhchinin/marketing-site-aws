"use client";
import { useState } from "react";
import { useBooking } from "./BookingContext";

export default function BookingModal() {
    const { isOpen, close } = useBooking();
    const [step, setStep] = useState<"form" | "calendar">("form");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const bookingUrl = process.env.NEXT_PUBLIC_BOOKING_URL!;
    const api = process.env.NEXT_PUBLIC_API_URL!;

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true); setError(null);
        const data = Object.fromEntries(new FormData(e.currentTarget).entries()) as Record<string, string>;
        try {
            const res = await fetch(api + "/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: data.name,
                    email: data.email,
                    phone: data.phone,
                    message: "Booking intent via Book Call modal",
                }),
            });
            const j = await res.json();
            if (!j.ok) throw new Error(j.error || "Failed to save lead");
            setStep("calendar");
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Network error";
            setError(message);
        } finally {
            setLoading(false);
        }
    }

    function onBg(e: React.MouseEvent<HTMLDivElement>) {
        if (e.target === e.currentTarget) {
            setStep("form"); // reset when dismissing
            close();
        }
    }

    if (!isOpen) return null;

    return (
        <div
            onClick={onBg}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
        >
            <div className="w-full max-w-4xl rounded-2xl bg-[#0F0F10] text-white ring-1 ring-white/10 shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                    <h2 className="text-lg font-semibold">Book a Discovery Call</h2>
                    <button
                        onClick={() => { setStep("form"); close(); }}
                        className="text-white/70 hover:text-white"
                        aria-label="Close"
                    >
                        ✕
                    </button>
                </div>

                {step === "form" && (
                    <form onSubmit={handleSubmit} className="p-6 grid gap-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm mb-1">Name</label>
                                <input name="name" required className="w-full rounded-lg border border-white/10 bg-transparent px-3 py-2" />
                            </div>
                            <div>
                                <label className="block text-sm mb-1">Email</label>
                                <input name="email" type="email" required className="w-full rounded-lg border border-white/10 bg-transparent px-3 py-2" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm mb-1">Phone (optional)</label>
                            <input name="phone" type="tel" className="w-full rounded-lg border border-white/10 bg-transparent px-3 py-2" />
                        </div>
                        {error && <div className="text-red-400 text-sm">{error}</div>}
                        <div className="mt-2 flex items-center gap-3">
                            <button className="btn btn-primary" disabled={loading}>
                                {loading ? "Saving…" : "Continue to calendar"}
                            </button>
                            <button
                                type="button"
                                onClick={() => { setStep("form"); close(); }}
                                className="btn btn-ghost"
                            >
                                Cancel
                            </button>
                        </div>
                        <p className="text-xs text-white/50 mt-2">We’ll email you a confirmation after you pick a time.</p>
                    </form>
                )}

                {step === "calendar" && (
                    <div className="p-0">
                        <iframe
                            src={bookingUrl}
                            width="100%"
                            height={880}
                            style={{ border: 0 }}
                            loading="lazy"
                            title="Google Appointment Booking"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
