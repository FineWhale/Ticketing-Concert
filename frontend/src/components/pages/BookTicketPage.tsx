import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header, SeatMap, TicketPanel } from "../organisms";
import { SeatPickerModal } from "../organisms/SeatPickerModal";

type BlockID = "i" | "j" | "k" | "l";

const RUNNING_TEXT =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. ";

const BookTicketPage: React.FC = () => {
  const navigate = useNavigate();
  const [seatModal, setSeatModal] = useState<BlockID | null>(null);

  return (
    <div className="min-h-screen bg-[#f5f5f5] pt-[72px]">
      <Header
        onContactClick={() => {
          navigate("/");
          setTimeout(() => {
            document
              .getElementById("footer")
              ?.scrollIntoView({ behavior: "smooth" });
          }, 100);
        }}
        onBookClick={() => navigate("/book-ticket")}
      />

      <section
        className="relative w-full min-h-[380px] md:min-h-[380px] overflow-hidden"
        aria-label="Event hero"
      >
        <img
          src="/images/beachboys-ticketImg.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover saturate-[0.85] brightness-90"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent pointer-events-none" />
        <div className="relative z-[2] max-w-[1200px] mx-auto px-5 md:px-12 pt-10 md:pt-16 pb-8 md:pb-12 text-left">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-3 leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
            60 Years of Pet Sounds
          </h1>
          <p className="text-sm md:text-lg text-white mb-1 drop-shadow-[0_1px_4px_rgba(0,0,0,0.3)]">
            The Beach Boys Concert • Gelora Bung Karno, Jakarta
          </p>
          <p className="text-sm md:text-base text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.3)]">
            17 August 2026 • 7:00 PM
          </p>
        </div>
      </section>

      <div
        className="w-full bg-running-text-bg py-[14px] overflow-hidden"
        role="marquee"
        aria-label="Running text"
      >
        <div className="flex w-max animate-ticketing-marquee">
          <span className="text-sm text-[#1a1a1a] whitespace-nowrap pr-8">
            {RUNNING_TEXT.repeat(4)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_400px] gap-0 max-w-full bg-white">
        {/* SeatMap — sticky */}
        <div
          className="px-4 md:px-6 pt-12 md:pt-16 pb-4 md:pb-6 border-r-0 md:border-r border-[#e0e0e0]
                      sticky top-[72px] self-start
                      h-[calc(100vh-72px)] overflow-hidden"
        >
          <SeatMap />
        </div>

        {/* TicketPanel — scrollable */}
        <div
          className="p-4 md:p-6 flex flex-col
                      h-[calc(100vh-72px)] overflow-y-auto sticky top-[72px] self-start"
        >
          <TicketPanel onOpenSeatPicker={(block) => setSeatModal(block)} />
        </div>
      </div>

      {seatModal && (
        <SeatPickerModal
          block={seatModal}
          onConfirm={() => setSeatModal(null)}
          onClose={() => setSeatModal(null)}
        />
      )}
    </div>
  );
};

export default BookTicketPage;
