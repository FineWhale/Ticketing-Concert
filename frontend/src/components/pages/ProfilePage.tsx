import React from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../organisms";
import { useAuthContext } from "../../context/AuthContext";

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthContext();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  if (!user) return null;

  const initials =
    `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase();

  return (
    <div className="min-h-screen bg-[#f5f5f5] pt-[72px]">
      <Header
        onContactClick={() => navigate("/")}
        onBookClick={() => navigate("/book-ticket")}
      />

      <div className="max-w-lg mx-auto py-10 px-4">
        {/* back */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
        >
          ← Kembali ke Home
        </button>

        {/* ava */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center shrink-0">
              <span className="text-white text-xl font-bold">{initials}</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {user.firstName} {user.lastName}
              </h1>
              <p className="text-sm text-gray-400">{user.email}</p>
            </div>
          </div>

          {/* INFO */}
          <div className="space-y-3 border-t border-gray-100 pt-5">
            {[
              {
                label: "Nama Lengkap",
                value: `${user.firstName} ${user.lastName}`,
              },
              { label: "Email", value: user.email },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="flex justify-between items-center text-sm"
              >
                <span className="text-gray-500">{label}</span>
                <span className="font-medium text-gray-800">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* MENU */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-4">
          <button
            onClick={() => navigate("/orders")}
            className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors border-b border-gray-100"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">🎫</span>
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-900">My Orders</p>
                <p className="text-xs text-gray-400">Riwayat pembelian tiket</p>
              </div>
            </div>
            <span className="text-gray-400 text-sm">→</span>
          </button>

          <button
            onClick={() => navigate("/book-ticket")}
            className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">🎵</span>
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-900">
                  Book Ticket
                </p>
                <p className="text-xs text-gray-400">Beli tiket konser baru</p>
              </div>
            </div>
            <span className="text-gray-400 text-sm">→</span>
          </button>
        </div>

        {/* LOGOUT */}
        <button
          onClick={handleLogout}
          className="w-full py-3 border-2 border-gray-200 text-gray-600 rounded-full font-semibold text-sm hover:border-red-300 hover:text-red-500 transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
