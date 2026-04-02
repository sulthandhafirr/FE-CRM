import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  const { t } = useTranslation();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Images for carousel
  const images = [
    {
      title: t("pages.login.carousel.aiAssistant"),
      version: t("pages.login.version"),
    },
    {
      title: t("pages.login.carousel.monitoringDashboard"),
      version: t("pages.login.version"),
    },
    {
      title: t("pages.login.carousel.ticketClassification"),
      version: t("pages.login.version"),
    },
    {
      title: t("pages.login.carousel.duplicateDetection"),
      version: t("pages.login.version"),
    },
  ];

  // Auto-scroll carousel every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  });

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        margin: 0,
        padding: 0,
        overflow: "hidden",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        boxSizing: "border-box",
      }}
    >
      {/* Left Side - Image Carousel */}
      <div
        style={{
          flex: 1,
          background: "#FF8040",
          position: "relative",
          overflow: "hidden",
          minHeight: "100vh",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            height: "100%",
            padding: "30px",
            boxSizing: "border-box",
          }}
        >
          {/* Logo */}
          <div
            style={{
              position: "absolute",
              top: "30px",
              left: "30px",
              zIndex: 10,
              display: "flex",
              alignItems: "center",
              gap: "15px",
            }}
          >
            <div
              style={{
                width: "60px",
                height: "60px",
                background: "linear-gradient(135deg, #132440 0%, #BF092F 100%)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "26px",
                fontWeight: "700",
                boxShadow:
                  "0 8px 16px rgba(0, 0, 0, 0.15), 0 0 0 4px rgba(255, 255, 255, 0.2)",
                letterSpacing: "1px",
              }}
            >
              C
            </div>
            <div style={{ color: "white" }}>
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: "700",
                  letterSpacing: "3px",
                }}
              >
                {t("pages.login.brand.crm")}
              </div>
              <div
                style={{
                  fontSize: "10px",
                  fontWeight: "500",
                  letterSpacing: "2px",
                  opacity: "0.9",
                }}
              >
                {t("pages.login.brand.system")}
              </div>
            </div>
          </div>

          {/* Image Container */}
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                textAlign: "center",
                color: "white",
                zIndex: 5,
                maxWidth: "450px",
                padding: "30px",
              }}
            >
              <h1
                style={{
                  fontSize: "32px",
                  fontWeight: "bold",
                  marginBottom: "20px",
                  textTransform: "uppercase",
                  letterSpacing: "2px",
                  textShadow: "2px 2px 8px rgba(0,0,0,0.2)",
                  lineHeight: "1.4",
                }}
              >
                {images[currentImageIndex].title}
              </h1>
              <p
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  opacity: 0.95,
                  letterSpacing: "2px",
                  background: "rgba(255, 255, 255, 0.2)",
                  padding: "8px 20px",
                  borderRadius: "20px",
                  display: "inline-block",
                }}
              >
                {t("pages.login.versionLabel")}{" "}
                {images[currentImageIndex].version}
              </p>
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={prevImage}
              style={{
                position: "absolute",
                left: "15px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "transparent",
                border: "none",
                width: "45px",
                height: "45px",
                cursor: "pointer",
                fontSize: "30px",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.3s",
                zIndex: 10,
              }}
              onMouseOver={(e) => (e.target.style.opacity = "0.7")}
              onMouseOut={(e) => (e.target.style.opacity = "1")}
            >
              ‹
            </button>

            <button
              onClick={nextImage}
              style={{
                position: "absolute",
                right: "15px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "transparent",
                border: "none",
                width: "45px",
                height: "45px",
                cursor: "pointer",
                fontSize: "30px",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.3s",
                zIndex: 10,
              }}
              onMouseOver={(e) => (e.target.style.opacity = "0.7")}
              onMouseOut={(e) => (e.target.style.opacity = "1")}
            >
              ›
            </button>

            {/* Dots Indicator */}
            <div
              style={{
                position: "absolute",
                bottom: "25px",
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                gap: "10px",
                zIndex: 10,
              }}
            >
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  style={{
                    width: currentImageIndex === idx ? "30px" : "10px",
                    height: "10px",
                    borderRadius: "5px",
                    background:
                      currentImageIndex === idx
                        ? "white"
                        : "rgba(255, 255, 255, 0.4)",
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.3s",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div
        style={{
          flex: 1,
          background: "#ffffff",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <LoginForm />
      </div>
    </div>
  );
}
