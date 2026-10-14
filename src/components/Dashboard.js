
import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import {
  getAvailableSlots,
  createOrder,
  verifyPayment,
  getBookedSlot
} from '../api/auth';
import '../styles/Dashboard.css';
import 'react-datepicker/dist/react-datepicker.css';
import Sections from './Sections';

const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );

    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true), { once: true });
      existingScript.addEventListener('error', () => resolve(false), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

// Use Indian Standard Time consistently.
const getISTParts = (date = new Date()) => {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23'
  }).formatToParts(date);

  return Object.fromEntries(
    parts.filter((p) => p.type !== 'literal').map((p) => [p.type, p.value])
  );
};

const getISTDateString = (date = new Date()) => {
  const p = getISTParts(date);
  return `${p.year}-${p.month}-${p.day}`;
};

const parseSlotDateTime = (dateString, timeString) => {
  // Supports slot times such as "09:00 AM" and "01:00 PM".
  const match = String(timeString).trim().match(
    /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i
  );

  if (!match) return null;

  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const meridiem = match[3].toUpperCase();

  if (hour < 1 || hour > 12 || minute < 0 || minute > 59) {
    return null;
  }

  if (meridiem === 'AM' && hour === 12) hour = 0;
  if (meridiem === 'PM' && hour !== 12) hour += 12;

  const dateMatch = String(dateString).match(
    /^(\d{4})-(\d{2})-(\d{2})$/
  );

  if (!dateMatch) return null;

  const [, year, month, day] = dateMatch;

  // Convert the slot's IST wall-clock time into a real UTC timestamp.
  // India is UTC+05:30 and does not observe daylight saving time.
  return new Date(
    Date.UTC(
      Number(year),
      Number(month) - 1,
      Number(day),
      hour - 5,
      minute - 30
    )
  );
};

const getSlotStatus = (date, slot, now = new Date()) => {
  if (slot.booked) return 'booked';

  const slotDateTime = parseSlotDateTime(date, slot.time);

  // Fail closed: unknown time formats must not be bookable.
  if (!slotDateTime) return 'expired';

  if (slotDateTime.getTime() <= now.getTime()) {
    return 'expired';
  }

  return 'available';
};

export default function Dashboard() {
  const { user, refreshUser } = useOutletContext();

  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [bookedSlots, setBookedSlots] = useState([]);
  const [currentTime, setCurrentTime] = useState(() => new Date());

  const fetchBookedSlots = useCallback(async (email) => {
    if (!email) return;

    try {
      const { data } = await getBookedSlot(email);

      const sorted = [...data].sort((a, b) => {
        const timeA = parseSlotDateTime(a.date, a.time);
        const timeB = parseSlotDateTime(b.date, b.time);
        return (timeB?.getTime() || 0) - (timeA?.getTime() || 0);
      });

      setBookedSlots(sorted);
    } catch (err) {
      console.error('Error fetching booked slots:', err);
    }
  }, []);

  const fetchAvailableSlots = useCallback(async () => {
    try {
      const response = await getAvailableSlots();
      setAvailableSlots(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error loading available slots:', err);
      setError('Failed to load available slots. Please refresh the page.');
    }
  }, []);

  useEffect(() => {
    if (user?.email) {
      fetchBookedSlots(user.email);
    }

    fetchAvailableSlots();
    loadRazorpay();
  }, [user, fetchBookedSlots, fetchAvailableSlots]);

  // Update slot status every second so past slots become unavailable
  // even when the page remains open.
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const todayString = getISTDateString(currentTime);

  const getSlotsForDate = (date) => {
    const dateString = getISTDateString(date);
    const dateDocument = availableSlots.find(
      (item) => item.date === dateString
    );

    if (!dateDocument || !Array.isArray(dateDocument.slots)) {
      return [];
    }

    return dateDocument.slots.map((slot) => ({
      ...slot,
      status: getSlotStatus(dateDocument.date, slot, currentTime)
    }));
  };

  const getAvailableDates = () => {
    return availableSlots
      .filter((item) => {
        if (item.date < todayString) return false;

        return item.slots?.some(
          (slot) => getSlotStatus(item.date, slot, currentTime) === 'available'
        );
      })
      .map((item) => {
        const [year, month, day] = item.date.split('-').map(Number);
        return new Date(year, month - 1, day, 12, 0, 0);
      });
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    setError('');
    setSuccess('');
  };

  const handleSlotSelect = (slot) => {
    if (slot.status !== 'available') return;

    setSelectedSlot((current) =>
      current === slot.time ? null : slot.time
    );

    setError('');
    setSuccess('');
  };



const handlePayment = async () => {
  if (!user?.email) {
    setError("Please log in to book an interview.");
    return;
  }

  if (!selectedDate || !selectedSlot) {
    setError("Please select a date and available time slot.");
    return;
  }

  const dateString = getISTDateString(selectedDate);

  const dateDocument = availableSlots.find(
    (item) => item.date === dateString
  );

  const slot = dateDocument?.slots?.find(
    (item) => item.time === selectedSlot
  );

  if (
    !slot ||
    getSlotStatus(dateString, slot, new Date()) !== "available"
  ) {
    setSelectedSlot(null);
    setError(
      "This slot has expired or is no longer available. Please select another slot."
    );

    try {
      await fetchAvailableSlots();
    } catch (err) {
      console.error("Failed to refresh available slots:", err);
    }

    return;
  }

  setLoading(true);
  setError("");
  setSuccess("");

  try {
    const razorpayLoaded = await loadRazorpay();

    if (!razorpayLoaded || !window.Razorpay) {
      throw new Error("Razorpay failed to load. Please try again.");
    }

    // Create order on the backend; the backend fixes the amount at ₹49.
    const orderResponse = await createOrder();
    const order = orderResponse.data;

    const orderId = order?.orderId || order?.id;

    if (!orderId || !order?.key || !order?.amount || !order?.currency) {
      throw new Error(
        "Invalid order response. Check the backend create-order API."
      );
    }

    const options = {
      key: order.key,
      amount: order.amount,
      currency: order.currency,
      name: "SBTechWave",
      description: `Interview booking for ${dateString} at ${selectedSlot}`,
      order_id: orderId,

      handler: async (response) => {
        try {
          const paymentData = {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            userEmail: String(user.email).trim().toLowerCase(),
            date: dateString,
            time: selectedSlot,
          };

          // Verify the payment and save the booking on the backend.
          const verificationResponse = await verifyPayment(paymentData);
          const result = verificationResponse.data;

          if (!result?.success) {
            throw new Error(
              result?.message || "Payment verification failed."
            );
          }

          // IMPORTANT:
          // Booking is confirmed by the backend.
          // Show success before attempting optional UI refreshes.
          setError("");
          setSuccess(
            "Interview Slot Booked Successfully! Your payment is confirmed. Powered by SBTechWave."
          );
          setSelectedSlot(null);

          // Refresh operations must not turn a successful booking
          // into a displayed payment failure.
          try {
            if (typeof refreshUser === "function") {
              await refreshUser();
            }
          } catch (refreshError) {
            console.error("User refresh error:", refreshError);
          }

          try {
            await fetchAvailableSlots();
          } catch (refreshError) {
            console.error("Available slots refresh error:", refreshError);
          }

          try {
            await fetchBookedSlots(user.email);
          } catch (refreshError) {
            console.error("Booked slots refresh error:", refreshError);
          }
        } catch (err) {
          console.error("PAYMENT VERIFICATION ERROR:", err);

          setError(
            err.response?.data?.message ||
              err.message ||
              "Payment verification failed. If money was deducted, contact support."
          );
        } finally {
          setLoading(false);
        }
      },

      prefill: {
        name: user.name || "",
        email: user.email,
        contact: user.phone || "",
      },

      theme: {
        color: "#4f46e5",
      },

      modal: {
        ondismiss: () => {
          setLoading(false);
          setError(
            "Payment cancelled. You can select a slot and try again."
          );
        },
      },
    };

    const checkout = new window.Razorpay(options);

    checkout.on("payment.failed", (response) => {
      console.error("RAZORPAY PAYMENT FAILED:", response.error);

      setLoading(false);
      setError(
        response.error?.description ||
          "Payment failed. Please try again."
      );
    });

    checkout.open();
  } catch (err) {
    console.error("PAYMENT START ERROR:", err);

    setError(
      err.response?.data?.message ||
        err.message ||
        "Unable to start payment. Please try again."
    );

    setLoading(false);
  }
};



  const slotsForSelectedDate = selectedDate
    ? getSlotsForDate(selectedDate)
    : [];

  const latestBooking = bookedSlots[0];
  const latestBookingDateTime = latestBooking
    ? parseSlotDateTime(latestBooking.date, latestBooking.time)
    : null;

  return (
    <>
      <main className="main-content">
        <div className="booking-container" id="booking">
          <div className="calendar-section">
            <h2>Select Date</h2>

            <DatePicker
              selected={selectedDate}
              onChange={handleDateSelect}
              includeDates={getAvailableDates()}
              minDate={new Date()}
              inline
            />

            <div className="booking-instructions">
              <h3>Booking Process</h3>
              <ol>
                <li>Select a date and choose an available time slot.</li>
                <li>Click "Pay ₹49" to complete booking.</li>
                <li>Check your email for confirmation.</li>
              </ol>

              <div className="note-box">
                <strong>Important Note:</strong>
                <ul>
                  <li>Google Meet link shared 1 day before the interview.</li>
                  <li>For today's bookings: link shared 1 hour prior.</li>
                </ul>
              </div>
            </div>
          </div>

          {selectedDate && (
            <div className="slots-section">
              <h3>
                Available Time Slots for{' '}
                {selectedDate.toDateString()}
              </h3>

              <div className="slots-grid">
                {slotsForSelectedDate.length === 0 ? (
                  <p>No available slots for this date.</p>
                ) : (
                  slotsForSelectedDate.map((slot) => {
                    const isSelected = selectedSlot === slot.time;
                    const status = slot.status;

                    return (
                      <button
                        key={slot.time}
                        type="button"
                        className={`time-slot ${isSelected ? 'selected' : ''} ${status}`}
                        onClick={() => handleSlotSelect(slot)}
                        disabled={status !== 'available' || loading}
                        aria-disabled={status !== 'available' || loading}
                        title={
                          status === 'expired'
                            ? 'This time slot has expired'
                            : status === 'booked'
                            ? 'This time slot is already booked'
                            : 'Select this time slot'
                        }
                      >
                        {slot.time}

                        {status === 'expired' && (
                          <span className="expired-label">
                            Time Over
                          </span>
                        )}

                        {status === 'booked' && (
                          <span className="booked-label">
                            Booked
                          </span>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}

         
{(error || success) && (
  <div className="payment-section" aria-live="polite">
    {error && <p className="error">{error}</p>}

    {success && (
      <div className="booking-success" role="status">
        <div className="booking-success-icon">✓</div>

        <h2>Interview Slot Booked Successfully!</h2>

        <p>
          Your payment was successful, and your interview slot
          has been confirmed.
        </p>

        <p>
          Powered by <strong>SBTechWave</strong>
        </p>
      </div>
    )}
  </div>
)}

          {selectedSlot && (
            <div className="payment-section">
              <button
                type="button"
                onClick={handlePayment}
                disabled={loading}
              >
                {loading
                  ? 'Processing...'
                  : `Pay ₹49 for ${selectedSlot}`}
              </button>
            </div>
          )}
        </div>

        <div className="booked-slots-section" id="booked-slots">
          {!latestBooking ? (
            <>
              <h2>Book Your First Interview</h2>
              <p>
                No interviews booked yet. Take the first step in your
                career journey — schedule your interview now!
              </p>
            </>
          ) : latestBookingDateTime &&
            latestBookingDateTime.getTime() > currentTime.getTime() ? (
            <>
              <h2>Your Upcoming Interview</h2>
              <p>
                <strong>Scheduled:</strong> {latestBooking.date} at{' '}
                {latestBooking.time}
              </p>
              <p className="reminder">
                Get ready for your upcoming interview! Make sure to
                prepare your materials in advance.
              </p>
            </>
          ) : (
            <>
              <h2>Your Last Booked Interview</h2>
              <p>
                <strong>Last Attended:</strong> {latestBooking.date} at{' '}
                {latestBooking.time}
              </p>
            </>
          )}
        </div>
      </main>

      <div>
        <Sections />
      </div>
    </>
  );
}
