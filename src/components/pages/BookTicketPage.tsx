import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../organisms";

interface TicketType {
  id: string;
  name: string;
  price: number;
  description: string;
  available: number;
}

const BookTicketPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedTickets, setSelectedTickets] = useState<
    Record<string, number>
  >({});

  const ticketTypes: TicketType[] = [
    {
      id: "vip",
      name: "VIP Package",
      price: 2500000,
      description:
        "Premium seating, meet & greet, exclusive merchandise, backstage access",
      available: 50,
    },
    {
      id: "premium",
      name: "Premium Seat",
      price: 1500000,
      description: "Front section seating, complimentary drink, event poster",
      available: 200,
    },
    {
      id: "regular",
      name: "Regular Seat",
      price: 750000,
      description: "Standard seating with great view of the stage",
      available: 500,
    },
    {
      id: "balcony",
      name: "Balcony Seat",
      price: 400000,
      description: "Upper level seating, full stage view",
      available: 300,
    },
  ];

  const handleQuantityChange = (ticketId: string, quantity: number) => {
    if (quantity <= 0) {
      const newSelected = { ...selectedTickets };
      delete newSelected[ticketId];
      setSelectedTickets(newSelected);
    } else {
      setSelectedTickets({
        ...selectedTickets,
        [ticketId]: quantity,
      });
    }
  };

  const calculateTotal = () => {
    return Object.entries(selectedTickets).reduce((total, [ticketId, qty]) => {
      const ticket = ticketTypes.find((t) => t.id === ticketId);
      return total + (ticket ? ticket.price * qty : 0);
    }, 0);
  };

  const getTotalTickets = () => {
    return Object.values(selectedTickets).reduce((sum, qty) => sum + qty, 0);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleCheckout = () => {
    if (getTotalTickets() === 0) {
      alert("Please select at least one ticket");
      return;
    }
    // checkout/login first
    console.log("Selected tickets:", selectedTickets);
    navigate("/login");
  };

  return (
    <div className="book-ticket-page">
      <Header
        onContactClick={() => console.log("Contact clicked")}
        onBookClick={() => navigate("/book-ticket")}
      />

      <div className="book-ticket-container">
        <div className="book-ticket-header">
          <button className="back-button" onClick={() => navigate("/")}>
            ← Back to Home
          </button>
          <div className="event-info">
            <h1 className="book-ticket-title">60 Years of Pet Sounds</h1>
            <p className="book-ticket-subtitle">
              The Beach Boys Concert • Gelora Bung Karno, Jakarta
            </p>
            <p className="book-ticket-date">17 August 2026 • 7:00 PM</p>
          </div>
        </div>

        <div className="book-ticket-content">
          <div className="tickets-section">
            <h2 className="section-title">Select Your Tickets</h2>

            <div className="ticket-types">
              {ticketTypes.map((ticket) => (
                <div key={ticket.id} className="ticket-card">
                  <div className="ticket-info">
                    <div className="ticket-header">
                      <h3 className="ticket-name">{ticket.name}</h3>
                      <p className="ticket-price">
                        {formatPrice(ticket.price)}
                      </p>
                    </div>
                    <p className="ticket-description">{ticket.description}</p>
                    <p className="ticket-availability">
                      {ticket.available} tickets available
                    </p>
                  </div>

                  <div className="ticket-selector">
                    <button
                      className="quantity-btn"
                      onClick={() =>
                        handleQuantityChange(
                          ticket.id,
                          (selectedTickets[ticket.id] || 0) - 1,
                        )
                      }
                      disabled={!selectedTickets[ticket.id]}
                    >
                      −
                    </button>
                    <span className="quantity-display">
                      {selectedTickets[ticket.id] || 0}
                    </span>
                    <button
                      className="quantity-btn"
                      onClick={() =>
                        handleQuantityChange(
                          ticket.id,
                          (selectedTickets[ticket.id] || 0) + 1,
                        )
                      }
                      disabled={
                        (selectedTickets[ticket.id] || 0) >= ticket.available
                      }
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="order-summary">
            <div className="summary-card">
              <h2 className="summary-title">Order Summary</h2>

              {getTotalTickets() === 0 ? (
                <p className="empty-cart">No tickets selected</p>
              ) : (
                <>
                  <div className="summary-items">
                    {Object.entries(selectedTickets).map(([ticketId, qty]) => {
                      const ticket = ticketTypes.find((t) => t.id === ticketId);
                      if (!ticket) return null;
                      return (
                        <div key={ticketId} className="summary-item">
                          <div className="summary-item-info">
                            <span className="summary-item-name">
                              {ticket.name}
                            </span>
                            <span className="summary-item-qty">× {qty}</span>
                          </div>
                          <span className="summary-item-price">
                            {formatPrice(ticket.price * qty)}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="summary-divider" />

                  <div className="summary-total">
                    <span className="summary-total-label">Total</span>
                    <span className="summary-total-price">
                      {formatPrice(calculateTotal())}
                    </span>
                  </div>

                  <button className="checkout-btn" onClick={handleCheckout}>
                    Proceed to Checkout
                  </button>
                </>
              )}

              <div className="summary-info">
                <p className="info-text">
                  <strong>Note:</strong> Tickets are non-refundable. Please
                  review your selection carefully.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookTicketPage;
