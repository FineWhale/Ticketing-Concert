import React from "react";
import { useNavigate } from "react-router-dom";

export const Footer: React.FC = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-green-900  text-white pt-14 pb-8 mt-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          {/* Brand */}
          <div>
            <h3 className="text-lg font-bold mb-1 leading-tight">
              The Beach Boys
            </h3>
            <p className="text-sm text-gray-400 mb-4">60 Years of Pet Sounds</p>
            <p className="text-xs text-gray-500 leading-relaxed">
              Rayakan 60 tahun album legendaris Pet Sounds bersama The Beach
              Boys dalam konser spektakuler di Jakarta.
            </p>
          </div>

          {/* Event Info */}
          <div>
            <h4 className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wider">
              Info Event
            </h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-center gap-2">
                <span>📅</span>
                <span>17 Agustus 2026</span>
              </li>
              <li className="flex items-center gap-2">
                <span>🕖</span>
                <span>19:00 WIB — Selesai</span>
              </li>
              <li className="flex items-center gap-2">
                <span>📍</span>
                <span>Gelora Bung Karno, Jakarta</span>
              </li>
              <li className="flex items-center gap-2">
                <span>🎵</span>
                <span>Genre: Surf Rock / Pop</span>
              </li>
            </ul>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wider">
              Navigasi
            </h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <button
                  onClick={() => navigate("/")}
                  className="hover:text-white transition-colors"
                >
                  Beranda
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("/book-ticket")}
                  className="hover:text-white transition-colors"
                >
                  Beli Tiket
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("/orders")}
                  className="hover:text-white transition-colors"
                >
                  Pesanan Saya
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("/profile")}
                  className="hover:text-white transition-colors"
                >
                  Profil
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-gray-500">
            © 2026 The Beach Boys — 60 Years of Pet Sounds. All rights reserved.
          </p>
          <p className="text-xs text-gray-600">
            Powered by Midtrans · Secured Payment
          </p>
        </div>
      </div>
    </footer>
  );
};
