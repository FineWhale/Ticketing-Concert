import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../organisms";

// ============================================================
// TICKET CONFIG — edit di sini saja
// ============================================================
const TICKETS = [
  {
    id: 1,
    src: "/images/tix1.png",
    hoverImg: "/images/brianwilson.png",
    top: 50, // px dari atas container
    left: "25%", // dari kiri (bisa "25%" atau px: 300)
    right: "auto",
    width: 200, // lebar tiket dalam px
    rotate: -15, // derajat kemiringan
    scrollX: 0.05, // kecepatan gerak horizontal saat scroll (+ = kanan, - = kiri)
    scrollY: 0.03, // kecepatan gerak vertikal saat scroll (+ = bawah, - = atas)
    zIndex: 3,
  },
  {
    id: 2,
    src: "/images/tix2.png",
    hoverImg: "/images/beachboys-login.jpg",
    top: 150,
    left: "40%",
    right: "auto",
    width: 220,
    rotate: 10,
    scrollX: -0.03,
    scrollY: 0.05,
    zIndex: 2,
  },
  {
    id: 3,
    src: "/images/tix3.png",
    hoverImg: "/images/brianwilson.png",
    top: 80,
    left: "auto",
    right: "25%",
    width: 180,
    rotate: 5,
    scrollX: 0.04,
    scrollY: -0.02,
    zIndex: 4,
  },
  {
    id: 4,
    src: "/images/tix4.png",
    hoverImg: "/images/beachboys-login.jpg",
    top: 300,
    left: "30%",
    right: "auto",
    width: 240,
    rotate: -8,
    scrollX: -0.04,
    scrollY: 0.04,
    zIndex: 5,
  },
  {
    id: 5,
    src: "/images/tix5.png",
    hoverImg: "/images/brianwilson.png",
    top: 350,
    left: "auto",
    right: "30%",
    width: 200,
    rotate: 12,
    scrollX: 0.02,
    scrollY: -0.05,
    zIndex: 2,
  },
];
// ============================================================

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [hoveredTicket, setHoveredTicket] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    const handleMouseMove = (e: MouseEvent) =>
      setCursorPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const maxScroll = 600;
  const scrollProgress = Math.min(scrollY / maxScroll, 1);
  const imageScale = 0.75 + scrollProgress * 0.75;
  const borderRadius = 16 - scrollProgress * 16;
  const textOpacityBlack = Math.max(0, 1 - scrollProgress * 2);
  const textOpacityWhite = Math.min(1, scrollProgress * 2);
  const textTranslateY = 0;
  const startRatio = 1.78;
  const endRatio = 1.33;
  const currentRatio = startRatio - scrollProgress * (startRatio - endRatio);
  const staircaseStart = 1500;
  const staircaseProgress = Math.max(
    0,
    Math.min(1, (scrollY - staircaseStart) / 500),
  );

  return (
    <div className="min-h-screen bg-white">
      <Header
        onContactClick={() => console.log("Contact clicked")}
        onBookClick={() => navigate("/book-ticket")}
      />

      <div className="pt-[72px] bg-white min-h-screen relative flex items-start justify-center overflow-hidden">
        <div className="w-full relative p-0">
          <div
            className="absolute top-20 md:top-20 left-1/2 z-10 w-full max-w-[1200px] px-5 md:px-20 pointer-events-none transition-transform duration-[50ms] linear"
            style={{ transform: `translate(-50%, ${textTranslateY}px)` }}
          >
            <div
              className="absolute top-0 left-0 right-0 text-center transition-opacity duration-200 ease-out"
              style={{ opacity: textOpacityBlack }}
            >
              <p className="text-base mb-2 font-normal">
                The Beach Boys Concert, Gelora Bungkarno Jakarta
              </p>
              <p className="text-base mb-6 font-normal">17 August 2026</p>
              <h1 className="text-4xl md:text-[64px] font-bold m-0 leading-tight">
                60 Years of Pet Sounds
              </h1>
            </div>
            <div
              className="absolute top-0 left-0 right-0 text-center text-white transition-opacity duration-200 ease-out"
              style={{ opacity: textOpacityWhite }}
            >
              <p className="text-base mb-2 font-normal">
                The Beach Boys Concert, Gelora Bungkarno Jakarta
              </p>
              <p className="text-base mb-6 font-normal">17 August 2026</p>
              <h1 className="text-4xl md:text-[64px] font-bold m-0 leading-tight">
                60 Years of Pet Sounds
              </h1>
            </div>
          </div>

          <div className="flex justify-center items-center px-5 md:px-20 mt-[120px] md:mt-[180px]">
            <img
              src="/images/beachboys-hero.jpg"
              alt="Beach Boys Concert"
              className="w-full max-w-[1200px] h-auto min-h-[400px] object-cover object-center block transition-[transform,border-radius] duration-[50ms] linear will-change-transform"
              style={{
                transform: `scale(${imageScale})`,
                borderRadius: `${borderRadius}px`,
                aspectRatio: `${currentRatio}`,
              }}
            />
          </div>
        </div>
      </div>

      <div className="bg-white py-10 md:py-20 px-5 md:px-20 max-w-[1200px] mx-auto">
        <h2 className="text-2xl md:text-[32px] font-bold text-[#1a1a1a] leading-[1.4] text-center m-0">
          60 years of orchestral innovation, emotional depth, and the harmonies
          that changed music forever—performed live as Brian Wilson envisioned.
        </h2>
      </div>

      <div className="bg-white py-20 md:py-[100px] px-5 md:px-20">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20 items-center">
          <div className="flex flex-col gap-5">
            <h2 className="text-3xl md:text-[48px] font-bold text-[#1a1a1a] m-0 leading-tight">
              Pet Sounds 89'
            </h2>
            <p className="text-base text-[#666] m-0 leading-relaxed">
              Lorem ipsum dolor sit amet
            </p>
            <button
              className="bg-[#1a1a1a] text-white border-none px-8 py-4 rounded-full text-base font-semibold cursor-pointer transition-colors duration-200 w-fit hover:bg-[#333]"
              onClick={() =>
                window.open(
                  "https://www.youtube.com/watch?v=YHdi3zW78pg",
                  "_blank",
                )
              }
            >
              Call to action →
            </button>
          </div>
          <div
            className="cursor-pointer transition-transform duration-300 ease-in-out hover:scale-[1.02]"
            onClick={() =>
              window.open(
                "https://www.youtube.com/watch?v=YHdi3zW78pg",
                "_blank",
              )
            }
          >
            <img
              src="/images/brianwilson.png"
              alt="Brian Wilson"
              className="w-full h-auto rounded-3xl block object-cover"
            />
          </div>
        </div>
      </div>

      <div className="bg-white py-[150px] px-5 md:px-20 min-h-screen flex items-center justify-center">
        <div className="max-w-[1200px] w-full">
          <h2 className="text-5xl md:text-[96px] font-bold text-[#1a1a1a] leading-[1.1] m-0 mb-10 flex flex-wrap gap-[30px] justify-center">
            {[
              { word: "A", offset: 0 },
              { word: "bold", offset: 100 },
              { word: "headline", offset: 200 },
              { word: "that delivers", offset: 300 },
              { word: "delivers", offset: 400 },
            ].map(({ word, offset }) => (
              <span
                key={word}
                className="inline-block transition-transform duration-[100ms] linear will-change-transform"
                style={{
                  transform: `translateY(${(1 - staircaseProgress) * offset}px)`,
                }}
              >
                {word}
              </span>
            ))}
          </h2>
          <p className="text-lg text-[#666] leading-relaxed max-w-[600px] m-0 text-center mx-auto">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum
            dolor sit amet, consectetur adipiscing elit.
          </p>
        </div>
      </div>

      <div className="bg-white py-20 md:py-[100px] px-5 md:px-20">
        <div className="max-w-[1200px] mx-auto">
          <div className="mb-10">
            <img
              src="/images/beachboys-mono.jpg"
              alt="Beach Boys Concert"
              className="w-full h-auto rounded-xl block border-[3px] border-blue-500"
            />
          </div>
          <div className="max-w-[800px]">
            <p className="text-sm text-[#666] m-0 mb-4 font-medium tracking-wider">
              60 Years of Innovation
            </p>
            <h2 className="text-3xl md:text-[36px] font-bold text-[#1a1a1a] m-0 mb-6 leading-tight">
              Pet Sounds: The Beach Boys' Masterpiece
            </h2>
            <p className="text-base text-[#666] leading-[1.8] m-0">
              Celebrate 60 extraordinary years of The Beach Boys' Pet Sounds –
              the groundbreaking masterpiece that revolutionized music in 1966.
              From the orchestral beauty of "God Only Knows" to the youthful
              energy of "Wouldn't It Be Nice," relive the album that inspired
              generations, performed live in Jakarta for the first time.
            </p>
          </div>
        </div>
      </div>

      {/* TICKET GIMMICK */}
      <div className="bg-white py-[150px] px-5 md:px-20 min-h-screen relative overflow-hidden">
        <div className="max-w-[1200px] mx-auto relative h-[600px]">
          {TICKETS.map((tix) => (
            <div
              key={tix.id}
              className="absolute cursor-pointer transition-[transform,filter] duration-[50ms] linear will-change-transform hover:brightness-110"
              style={{
                top: tix.top,
                left: tix.left,
                right: tix.right,
                width: tix.width,
                zIndex: tix.zIndex,
                transform: `translate(${scrollY * tix.scrollX}px, ${scrollY * tix.scrollY}px) rotate(${tix.rotate}deg)`,
              }}
              onMouseEnter={() => setHoveredTicket(tix.id)}
              onMouseLeave={() => setHoveredTicket(null)}
            >
              <img
                src={tix.src}
                alt={`Ticket ${tix.id}`}
                className="w-full h-auto block pointer-events-none"
              />
            </div>
          ))}
        </div>

        {/* CURSOR GIMMICK */}
        {hoveredTicket !== null && (
          <div
            className="fixed pointer-events-none z-[9999] w-[150px] h-[150px] rounded-xl overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.3)]"
            style={{ left: cursorPos.x + 20, top: cursorPos.y + 20 }}
          >
            <img
              src={TICKETS.find((t) => t.id === hoveredTicket)?.hoverImg}
              alt="hover preview"
              className="w-full h-full object-cover block"
            />
          </div>
        )}
      </div>

      <div className="py-[120px] px-5 md:px-20 relative min-h-[400px] flex items-center justify-center overflow-hidden">
        <img
          src="/images/beachboys-hero.jpg"
          alt="Beach Boys Live"
          className="absolute top-0 left-0 w-full h-full object-cover z-0 brightness-110"
        />
        <div className="absolute inset-0 bg-white/85 z-[1]" />
        <div className="relative z-[2] text-center max-w-[800px]">
          <h2 className="text-5xl md:text-[64px] font-bold text-[#1a1a1a] m-0 mb-8">
            Live
          </h2>
          <p className="text-lg text-[#333] leading-[1.8] m-0 mb-10">
            Sorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc
            vulputate libero et velit interdum, ac aliquet odio mattis. Class
            aptent taciti sociosqu ad litora torquent per conubia nostra, per
            inceptos himenaeos.
          </p>
          <button
            className="bg-[#1a1a1a] text-white border-none px-10 py-[18px] rounded-full text-base font-semibold cursor-pointer transition-colors duration-200 hover:bg-[#333]"
            onClick={() => navigate("/book-ticket")}
          >
            Call to action →
          </button>
        </div>
      </div>

      <footer className="bg-white py-20 px-5 md:px-20 border-t border-[#e0e0e0]">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr] gap-15 mb-15">
            <div>
              <h3 className="text-lg font-bold text-[#1a1a1a] m-0 mb-4">
                Namedly
              </h3>
              <p className="text-sm text-[#666] leading-relaxed m-0 mb-5">
                lorem Ipsum dolor sit amet, consectetur adipiscing elit.
              </p>
              <div className="flex gap-4">
                {["a", "b", "c"].map((l) => (
                  <a
                    key={l}
                    href="#"
                    className="w-8 h-8 flex items-center justify-center text-[#666] text-lg transition-colors duration-200 hover:text-[#1a1a1a]"
                  >
                    {l}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-base font-semibold text-[#1a1a1a] m-0 mb-5">
                Features
              </h4>
              <ul className="list-none p-0 m-0">
                {["Core features", "Pro experience", "Integrations"].map(
                  (item) => (
                    <li key={item} className="mb-3">
                      <a
                        href="#"
                        className="text-sm text-[#666] no-underline transition-colors duration-200 hover:text-[#1a1a1a]"
                      >
                        {item}
                      </a>
                    </li>
                  ),
                )}
              </ul>
            </div>

            <div>
              <h4 className="text-base font-semibold text-[#1a1a1a] m-0 mb-5">
                Learn more
              </h4>
              <ul className="list-none p-0 m-0">
                {[
                  "Blog",
                  "Case studies",
                  "Customer stories",
                  "Best practices",
                ].map((item) => (
                  <li key={item} className="mb-3">
                    <a
                      href="#"
                      className="text-sm text-[#666] no-underline transition-colors duration-200 hover:text-[#1a1a1a]"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-base font-semibold text-[#1a1a1a] m-0 mb-5">
                Support
              </h4>
              <ul className="list-none p-0 m-0">
                {["Contact", "Support", "Legal"].map((item) => (
                  <li key={item} className="mb-3">
                    <a
                      href="#"
                      className="text-sm text-[#666] no-underline transition-colors duration-200 hover:text-[#1a1a1a]"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="text-center pt-10 border-t border-[#e0e0e0]">
            <p className="text-sm text-[#666] m-0">
              © 2026 Beach Boys Concert. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
