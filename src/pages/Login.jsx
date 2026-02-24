import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { ROUTE } from "../router/routes";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const navigate = useNavigate();

  // Images for carousel
  const images = [
    {
      title: "AI Virtual Assistant",
      version: "1.0"
    },
    {
      title: "Monitoring Dashboard",
      version: "1.0"
    },
    {
      title: "Intelligent Ticket Classification",
      version: "1.0"
    },
    {
      title: "Duplicate & Similar Ticket Detection",
      version: "1.0"
    }
  ];

  // Auto-scroll carousel every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  });

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate company ID
    if (!companyId.trim()) {
      setError("Please enter Company ID");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate(ROUTE.dashboard);
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      width: '100vw',
      margin: '-9px',
      padding: 0,
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      boxSizing: 'border-box'
    }}>
      {/* Left Side - Image Carousel */}
      <div style={{
        flex: 1,
        background: '#FF8040',
        position: 'relative',
        overflow: 'hidden',
        minHeight: '100vh'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: '100%',
          padding: '30px',
          boxSizing: 'border-box'
        }}>
        {/* Logo */}
        <div style={{
          position: 'absolute',
          top: '30px',
          left: '30px',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          gap: '15px'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            background: 'linear-gradient(135deg, #132440 0%, #BF092F 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '26px',
            fontWeight: '700',
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15), 0 0 0 4px rgba(255, 255, 255, 0.2)',
            letterSpacing: '1px'
          }}>
            C
          </div>
          <div style={{ color: 'white' }}>
            <div style={{ fontSize: '20px', fontWeight: '700', letterSpacing: '3px' }}>CRM</div>
            <div style={{ fontSize: '10px', fontWeight: '500', letterSpacing: '2px', opacity: '0.9' }}>SYSTEM</div>
          </div>
        </div>

        {/* Image Container */}
        <div style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            textAlign: 'center',
            color: 'white',
            zIndex: 5,
            maxWidth: '450px',
            padding: '30px'
          }}>
            <h1 style={{
              fontSize: '32px',
              fontWeight: 'bold',
              marginBottom: '20px',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              textShadow: '2px 2px 8px rgba(0,0,0,0.2)',
              lineHeight: '1.4'
            }}>
              {images[currentImageIndex].title}
            </h1>
            <p style={{
              fontSize: '14px',
              fontWeight: '600',
              opacity: 0.95,
              letterSpacing: '2px',
              background: 'rgba(255, 255, 255, 0.2)',
              padding: '8px 20px',
              borderRadius: '20px',
              display: 'inline-block'
            }}>
              VERSION {images[currentImageIndex].version}
            </p>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevImage}
            style={{
              position: 'absolute',
              left: '15px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'transparent',
              border: 'none',
              width: '45px',
              height: '45px',
              cursor: 'pointer',
              fontSize: '30px',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s',
              zIndex: 10
            }}
            onMouseOver={(e) => e.target.style.opacity = '0.7'}
            onMouseOut={(e) => e.target.style.opacity = '1'}
          >
            ‹
          </button>

          <button
            onClick={nextImage}
            style={{
              position: 'absolute',
              right: '15px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'transparent',
              border: 'none',
              width: '45px',
              height: '45px',
              cursor: 'pointer',
              fontSize: '30px',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s',
              zIndex: 10
            }}
            onMouseOver={(e) => e.target.style.opacity = '0.7'}
            onMouseOut={(e) => e.target.style.opacity = '1'}
          >
            ›
          </button>

          {/* Dots Indicator */}
          <div style={{
            position: 'absolute',
            bottom: '25px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '10px',
            zIndex: 10
          }}>
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImageIndex(idx)}
                style={{
                  width: currentImageIndex === idx ? '30px' : '10px',
                  height: '10px',
                  borderRadius: '5px',
                  background: currentImageIndex === idx ? 'white' : 'rgba(255, 255, 255, 0.4)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>

      {/* Right Side - Login Form */}
      <div style={{
        flex: 1,
        background: '#ffffff',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}>
        <div style={{ width: '100%', maxWidth: '420px', padding: '20px 30px', boxSizing: 'border-box' }}>
          <div style={{ marginBottom: '24px', textAlign: 'center' }}>
            <h2 style={{
              fontSize: '28px',
              fontWeight: '700',
              marginBottom: '6px',
              color: '#1a202c'
            }}>
              Sign in
            </h2>
            <p style={{
              color: '#718096',
              fontSize: '13px'
            }}>
              Please enter your Email, Password and Company ID
            </p>
          </div>

          <form onSubmit={handleSignIn}>
            {/* User ID (Email) Input */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151'
              }}>
                Email
              </label>
              <input
                type="email"
                placeholder="Please enter your email."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  fontSize: '14px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  outline: 'none',
                  transition: 'all 0.2s',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#FF6B6B'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
            </div>

            {/* Password Input */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151'
              }}>
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Please enter your password."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  fontSize: '14px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  outline: 'none',
                  transition: 'all 0.2s',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#FF6B6B'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
            </div>

            {/* Company ID Input */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151'
              }}>
                Company id
              </label>
              <input
                type="text"
                placeholder="Please enter your Company ID."
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  fontSize: '14px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  outline: 'none',
                  transition: 'all 0.2s',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#FF6B6B'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
            </div>

            {/* Show Password Checkbox */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                fontSize: '13px',
                color: '#374151',
                fontWeight: '500'
              }}>
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                  style={{
                    width: '16px',
                    height: '16px',
                    marginRight: '7px',
                    cursor: 'pointer',
                    accentColor: '#FF6B6B'
                  }}
                />
                Show password
              </label>
            </div>

            {/* Error Message */}
            {error && (
              <div style={{
                padding: '10px',
                marginBottom: '14px',
                background: '#fee2e2',
                border: '1px solid #fecaca',
                borderRadius: '4px',
                color: '#dc2626',
                fontSize: '13px'
              }}>
                {error}
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '11px',
                fontSize: '15px',
                fontWeight: '600',
                color: '#374151',
                background: 'white',
                border: '2px solid #e5e7eb',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                fontFamily: 'inherit',
                marginBottom: '10px'
              }}
              onMouseOver={(e) => !loading && (e.target.style.borderColor = '#FF6B6B')}
              onMouseOut={(e) => e.target.style.borderColor = '#e5e7eb'}
            >
              {loading ? 'Signing in...' : 'Login'}
            </button>

            {/* Don't have account text */}
            <div style={{
              textAlign: 'center',
              fontSize: '12px',
              color: '#6b7280',
              marginTop: '8px'
            }}>
              Don't have account? <span style={{ 
                color: '#374151', 
                fontWeight: '600',
                cursor: 'pointer'
              }}>Contact admin</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
