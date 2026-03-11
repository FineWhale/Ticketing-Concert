import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";
import { useCartContext } from "../../context/CartContext";

interface HeaderProps {
  onContactClick?: () => void;
  onBookClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onContactClick,
  onBookClick,
}) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthContext();
  const { cart, totalItems, totalPrice, removeItem } = useCartContext(); // ← fix
  const [cartOpen, setCartOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setCartOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);

  return (
    <div className="fixed top-0 left-0 right-0 h-[72px] bg-primary px-12 flex items-center justify-between z-[100]">
      <img
        src="/images/logo.png"
        alt="Logo"
        className="h-10 object-contain cursor-pointer"
        onClick={() => navigate("/")}
      />

      <div className="flex items-center gap-8 text-sm font-medium text-white">
        <span className="cursor-pointer" onClick={onContactClick}>
          Contact
        </span>
        {isAuthenticated ? (
          <span className="cursor-pointer" onClick={() => navigate("/profile")}>
            Profile
          </span>
        ) : (
          <span className="cursor-pointer" onClick={() => navigate("/login")}>
            Login
          </span>
        )}

        {/* Cart Dropdown */}
        {isAuthenticated && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setCartOpen(!cartOpen)}
              className="relative cursor-pointer hover:opacity-80 transition-opacity"
              title="View Cart"
            >
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Dropdown Panel */}
            {cartOpen && (
              <div className="absolute right-0 top-full mt-3 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <h3 className="text-sm font-bold text-gray-900">
                    Keranjang Saya
                  </h3>
                </div>

                {cart.length === 0 ? (
                  <div className="p-6 text-center">
                    <svg
                      className="w-12 h-12 text-gray-300 mx-auto mb-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    <p className="text-sm text-gray-400">Keranjang kosong</p>
                  </div>
                ) : (
                  <>
                    <div className="p-4 space-y-2 max-h-72 overflow-y-auto">
                      {cart.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-start justify-between py-2 border-b border-gray-100 last:border-0"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-gray-900 truncate">
                              Section {item.section}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {item.type}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {item.quantity} × {formatPrice(item.priceEach)}
                            </p>
                            {/* Seat labels kalau ada */}
                            {item.seatLabels && item.seatLabels.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {item.seatLabels.map((label) => (
                                  <span
                                    key={label}
                                    className="text-[9px] px-1.5 py-0.5 bg-[#fee505] text-[#1a1a1a] rounded font-bold"
                                  >
                                    {label}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex items-start gap-2 ml-2">
                            <p className="text-xs font-bold text-gray-900 whitespace-nowrap">
                              {formatPrice(item.priceEach * item.quantity)}
                            </p>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeItem(item.id); // ← fix
                              }}
                              className="text-red-500 hover:text-red-700 text-sm transition-colors"
                              title="Remove"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs text-gray-600">
                          Total ({totalItems} item)
                        </span>
                        <span className="text-sm font-bold text-gray-900">
                          {formatPrice(totalPrice)}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setCartOpen(false);
                          navigate("/checkout");
                        }}
                        className="w-full py-2.5 bg-yellow text-gray-900 rounded-full text-sm font-bold hover:brightness-95 transition-all"
                      >
                        Checkout
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        <button
          className="px-5 py-2 rounded-full border-none bg-yellow text-[#1a1a1a] font-bold cursor-pointer hover:brightness-95"
          onClick={onBookClick}
        >
          Book Ticket
        </button>
      </div>
    </div>
  );
};
