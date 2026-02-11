import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../organisms";

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [hoveredTicket, setHoveredTicket] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    const handleMouseMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // transitions based on scroll
  const maxScroll = 600;
  const scrollProgress = Math.min(scrollY / maxScroll, 1);

  // img cale
  const imageScale = 0.75 + scrollProgress * 0.75;
  const borderRadius = 16 - scrollProgress * 16;

  // text color transition
  const textOpacityBlack = Math.max(0, 1 - scrollProgress * 2);
  const textOpacityWhite = Math.min(1, scrollProgress * 2);

  // fixed text (bug)
  const textTranslateY = 0;

  // ASPECT RATIO
  const startRatio = 1.78;
  const endRatio = 1.33;
  const currentRatio = startRatio - scrollProgress * (startRatio - endRatio);

  // staircase animation
  const staircaseStart = 1500;
  const staircaseProgress = Math.max(
    0,
    Math.min(1, (scrollY - staircaseStart) / 500),
  );

  return (
    <div className="homepage">
      <Header
        onContactClick={() => console.log("Contact clicked")}
        onBookClick={() => navigate("/book-ticket")}
      />

      <div className="hero-section-new">
        <div className="hero-content-wrapper">
          <div
            className="hero-text-overlay"
            style={{
              transform: `translate(-50%, ${textTranslateY}px)`,
            }}
          >
            <div
              className="hero-text-layer"
              style={{ opacity: textOpacityBlack }}
            >
              <p className="hero-subtitle-new">
                The Beach Boys Concert, Gelora Bungkarno Jakarta
              </p>
              <p className="hero-date-new">17 August 2026</p>
              <h1 className="hero-title-new">60 Years of Pet Sounds</h1>
            </div>

            <div
              className="hero-text-layer hero-text-white"
              style={{ opacity: textOpacityWhite }}
            >
              <p className="hero-subtitle-new">
                The Beach Boys Concert, Gelora Bungkarno Jakarta
              </p>
              <p className="hero-date-new">17 August 2026</p>
              <h1 className="hero-title-new">60 Years of Pet Sounds</h1>
            </div>
          </div>

          <div className="hero-image-container">
            <img
              src="/images/beachboys-hero.jpg"
              alt="Beach Boys Concert"
              className="hero-image-new"
              style={{
                transform: `scale(${imageScale})`,
                borderRadius: `${borderRadius}px`,
                aspectRatio: `${currentRatio}`,
              }}
            />
          </div>
        </div>
      </div>

      <div className="tagline-section">
        <h2 className="tagline-text">
          60 years of orchestral innovation, emotional depth, and the harmonies
          that changed music forever—performed live as Brian Wilson envisioned.
        </h2>
      </div>

      <div className="youtube-section">
        <div className="youtube-container">
          <div className="youtube-content">
            <h2 className="youtube-title">Pet Sounds 89'</h2>
            <p className="youtube-description">Lorem ipsum dolor sit amet</p>
            <button
              className="youtube-cta-btn"
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
            className="youtube-image-wrapper"
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
              className="youtube-image"
            />
          </div>
        </div>
      </div>

      <div className="staircase-headline-section">
        <div className="staircase-headline-container">
          <h2 className="staircase-headline">
            <span
              className="staircase-word"
              style={{
                transform: `translateY(${(1 - staircaseProgress) * 0}px)`,
              }}
            >
              A
            </span>
            <span
              className="staircase-word"
              style={{
                transform: `translateY(${(1 - staircaseProgress) * 100}px)`,
              }}
            >
              bold
            </span>
            <span
              className="staircase-word"
              style={{
                transform: `translateY(${(1 - staircaseProgress) * 200}px)`,
              }}
            >
              headline
            </span>
            <span
              className="staircase-word"
              style={{
                transform: `translateY(${(1 - staircaseProgress) * 300}px)`,
              }}
            >
              that delivers
            </span>
            <span
              className="staircase-word"
              style={{
                transform: `translateY(${(1 - staircaseProgress) * 400}px)`,
              }}
            >
              delivers
            </span>
          </h2>
          <p className="staircase-description">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum
            dolor sit amet, consectetur adipiscing elit.
          </p>
        </div>
      </div>

      <div className="masterpiece-section">
        <div className="masterpiece-container">
          <div className="masterpiece-image-wrapper">
            <img
              src="/images/beachboys-mono.jpg"
              alt="Beach Boys Concert"
              className="masterpiece-image"
            />
          </div>
          <div className="masterpiece-content">
            <p className="masterpiece-eyebrow">60 Years of Innovation</p>
            <h2 className="masterpiece-title">
              Pet Sounds: The Beach Boys' Masterpiece
            </h2>
            <p className="masterpiece-text">
              Celebrate 60 extraordinary years of The Beach Boys' Pet Sounds –
              the groundbreaking masterpiece that revolutionized music in 1966.
              From the orchestral beauty of "God Only Knows" to the youthful
              energy of "Wouldn't It Be Nice," relive the album that inspired
              generations, performed live in Jakarta for the first time.
            </p>
          </div>
        </div>
      </div>

      <div className="tickets-section">
        <div className="tickets-container">
          {/* tix 1 */}
          <div
            className="floating-ticket ticket-1"
            style={{
              transform: `translate(${scrollY * 0.05}px, ${scrollY * 0.03}px) rotate(-15deg)`,
            }}
            onMouseEnter={() => setHoveredTicket(1)}
            onMouseLeave={() => setHoveredTicket(null)}
          >
            <img src="/images/tix1.png" alt="Ticket 1" />
          </div>

          {/* tix 2 */}
          <div
            className="floating-ticket ticket-2"
            style={{
              transform: `translate(${scrollY * -0.03}px, ${scrollY * 0.05}px) rotate(10deg)`,
            }}
            onMouseEnter={() => setHoveredTicket(2)}
            onMouseLeave={() => setHoveredTicket(null)}
          >
            <img src="/images/tix2.png" alt="Ticket 2" />
          </div>

          {/* tix 3 */}
          <div
            className="floating-ticket ticket-3"
            style={{
              transform: `translate(${scrollY * 0.04}px, ${scrollY * -0.02}px) rotate(5deg)`,
            }}
            onMouseEnter={() => setHoveredTicket(3)}
            onMouseLeave={() => setHoveredTicket(null)}
          >
            <img src="/images/tix3.png" alt="Ticket 3" />
          </div>

          {/* tix 4 */}
          <div
            className="floating-ticket ticket-4"
            style={{
              transform: `translate(${scrollY * -0.04}px, ${scrollY * 0.04}px) rotate(-8deg)`,
            }}
            onMouseEnter={() => setHoveredTicket(4)}
            onMouseLeave={() => setHoveredTicket(null)}
          >
            <img src="/images/tix4.png" alt="Ticket 4" />
          </div>

          {/* tix 5 */}
          <div
            className="floating-ticket ticket-5"
            style={{
              transform: `translate(${scrollY * 0.02}px, ${scrollY * -0.05}px) rotate(12deg)`,
            }}
            onMouseEnter={() => setHoveredTicket(5)}
            onMouseLeave={() => setHoveredTicket(null)}
          >
            <img src="/images/tix5.png" alt="Ticket 5" />
          </div>
        </div>

        {/* cursor gimmick */}
        {hoveredTicket === 1 && (
          <div
            className="cursor-follower"
            style={{
              left: cursorPos.x + 20,
              top: cursorPos.y + 20,
            }}
          >
            <img src="/images/brianwilson.png" alt="Brian Wilson" />
          </div>
        )}
        {hoveredTicket === 2 && (
          <div
            className="cursor-follower"
            style={{
              left: cursorPos.x + 20,
              top: cursorPos.y + 20,
            }}
          >
            <img src="/images/beachboys-login.jpg" alt="Beach Boys" />
          </div>
        )}
        {hoveredTicket === 3 && (
          <div
            className="cursor-follower"
            style={{
              left: cursorPos.x + 20,
              top: cursorPos.y + 20,
            }}
          >
            <img src="/images/brianwilson.png" alt="Brian Wilson" />
          </div>
        )}
        {hoveredTicket === 4 && (
          <div
            className="cursor-follower"
            style={{
              left: cursorPos.x + 20,
              top: cursorPos.y + 20,
            }}
          >
            <img src="/images/beachboys-login.jpg" alt="Beach Boys" />
          </div>
        )}
        {hoveredTicket === 5 && (
          <div
            className="cursor-follower"
            style={{
              left: cursorPos.x + 20,
              top: cursorPos.y + 20,
            }}
          >
            <img src="/images/brianwilson.png" alt="Brian Wilson" />
          </div>
        )}
      </div>

      <div className="live-section">
        <img
          src="/images/beachboys-hero.jpg"
          alt="Beach Boys Live"
          className="live-background-image"
        />
        <div className="live-content">
          <h2 className="live-title">Live</h2>
          <p className="live-description">
            Sorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc
            vulputate libero et velit interdum, ac aliquet odio mattis. Class
            aptent taciti sociosqu ad litora torquent per conubia nostra, per
            inceptos himenaeos.
          </p>
          <button
            className="live-cta-btn"
            onClick={() => navigate("/book-ticket")}
          >
            Call to action →
          </button>
        </div>
      </div>

      <footer className="footer">
        <div className="footer-container">
          <div className="footer-content">
            <div className="footer-brand">
              <h3>Namedly</h3>
              <p>lorem Ipsum dolor sit amet, consectetur adipiscing elit.</p>
              <div className="footer-socials">
                <a href="#" className="footer-social-icon">
                  a
                </a>
                <a href="#" className="footer-social-icon">
                  b
                </a>
                <a href="#" className="footer-social-icon">
                  c
                </a>
              </div>
            </div>

            <div className="footer-column">
              <h4>Features</h4>
              <ul className="footer-links">
                <li>
                  <a href="#">Core features</a>
                </li>
                <li>
                  <a href="#">Pro experience</a>
                </li>
                <li>
                  <a href="#">Integrations</a>
                </li>
              </ul>
            </div>

            <div className="footer-column">
              <h4>Learn more</h4>
              <ul className="footer-links">
                <li>
                  <a href="#">Blog</a>
                </li>
                <li>
                  <a href="#">Case studies</a>
                </li>
                <li>
                  <a href="#">Customer stories</a>
                </li>
                <li>
                  <a href="#">Best practices</a>
                </li>
              </ul>
            </div>

            <div className="footer-column">
              <h4>Support</h4>
              <ul className="footer-links">
                <li>
                  <a href="#">Contact</a>
                </li>
                <li>
                  <a href="#">Support</a>
                </li>
                <li>
                  <a href="#">Legal</a>
                </li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <p>© 2026 Beach Boys Concert. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
