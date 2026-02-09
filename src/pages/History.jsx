import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { ROUTE } from "../router/routes";
import { MdDashboard, MdConfirmationNumber, MdHistory, MdPerson, MdLogout, MdChat } from 'react-icons/md';
import { FaRobot, FaUserTie, FaHeadset } from 'react-icons/fa';
import ChatBot from '../components/ChatBot';

export default function History() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState('history');
  const [chatOpen, setChatOpen] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate(ROUTE.login);
  };

  // Sample history data
  const historyData = [
    {
      id: 1,
      createdAt: "19-01-2026",
      name: "Question Request",
      priority: "Low",
      solvedAt: "27-01-2026",
      solvedBy: { type: "ai", name: "AI Agent" },
      satisfaction: 1
    },
    {
      id: 2,
      createdAt: "19-01-2026",
      name: "Product Issue",
      priority: "Crucial",
      solvedAt: "20-01-2026",
      solvedBy: { type: "human", name: "Bani" },
      satisfaction: 3
    },
    {
      id: 3,
      createdAt: "19-01-2026",
      name: "Question Request",
      priority: "Normal",
      solvedAt: "20-01-2026",
      solvedBy: { type: "cs", name: "CS Agent" },
      satisfaction: 3
    }
  ];

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'Crucial': return '#dc2626';
      case 'High': return '#ea580c';
      case 'Normal': return '#666';
      case 'Low': return '#16a34a';
      default: return '#666';
    }
  };

  const renderStars = (count) => {
    return (
      <div style={{ display: 'flex', gap: '3px' }}>
        {[1, 2, 3].map((star) => (
          <span 
            key={star}
            style={{ 
              fontSize: '20px',
              color: star <= count ? '#FF8040' : '#e0e0e0'
            }}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  const getSolverIcon = (type) => {
    switch(type) {
      case 'ai': return <FaRobot size={14} />;
      case 'human': return <FaUserTie size={14} />;
      case 'cs': return <FaHeadset size={14} />;
      default: return <FaUserTie size={14} />;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f5f5', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {/* Sidebar */}
      <div style={{
        width: sidebarOpen ? '220px' : '70px',
        background: '#ffffff',
        transition: 'width 0.3s ease',
        boxShadow: '2px 0 5px rgba(0,0,0,0.05)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        zIndex: 100
      }}>
        {/* Logo */}
        <div style={{
          padding: sidebarOpen ? '25px 20px' : '25px 15px',
          fontSize: '28px',
          fontWeight: '700',
          color: '#FF8040',
          transition: 'all 0.3s',
          cursor: 'pointer'
        }}
        onClick={() => navigate(ROUTE.dashboard)}
        >
          {sidebarOpen ? 'crm.' : 'c.'}
        </div>

        {/* Menu Items */}
        <div style={{ flex: 1, padding: '10px' }}>
          {/* Dashboard */}
          <div
            onClick={() => navigate(ROUTE.dashboard)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              padding: '12px 15px',
              marginBottom: '5px',
              borderRadius: '8px',
              background: 'transparent',
              color: '#666',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontWeight: '500'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#f5f5f5'}
            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <MdDashboard size={18} />
            {sidebarOpen && <span>Dashboard</span>}
          </div>

          {/* Ticket */}
          <div
            onClick={() => navigate('/ticket')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              padding: '12px 15px',
              marginBottom: '5px',
              borderRadius: '8px',
              background: 'transparent',
              color: '#666',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontWeight: '500'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#f5f5f5'}
            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <MdConfirmationNumber size={18} />
            {sidebarOpen && <span>Ticket</span>}
          </div>

          {/* History */}
          <div
            onClick={() => setActiveMenu('history')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              padding: '12px 15px',
              marginBottom: '5px',
              borderRadius: '8px',
              background: activeMenu === 'history' ? '#FF8040' : 'transparent',
              color: activeMenu === 'history' ? 'white' : '#666',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontWeight: '500'
            }}
          >
            <MdHistory size={18} />
            {sidebarOpen && <span>History</span>}
          </div>
        </div>

        {/* Profile at bottom */}
        <div style={{ padding: '10px' }}>
          <div
            onClick={() => setActiveMenu('profile')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              padding: '12px 15px',
              borderRadius: '8px',
              background: 'transparent',
              color: '#666',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontWeight: '500'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#f5f5f5'}
            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <MdPerson size={18} />
            {sidebarOpen && <span>Profile</span>}
          </div>
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            position: 'absolute',
            right: '-12px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: '#FF8040',
            border: '2px solid white',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
          }}
        >
          {sidebarOpen ? '‹' : '›'}
        </button>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Top Bar */}
        <div style={{
          background: 'white',
          padding: '15px 30px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
        }}>
          {/* Search Bar */}
          <div style={{ flex: 1, maxWidth: '400px' }}>
            <input
              type="text"
              placeholder="Search..."
              style={{
                width: '100%',
                padding: '10px 15px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>

          {/* Logout Button */}
          <button
            onClick={handleSignOut}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '24px',
              color: '#666'
            }}
          >
            <MdLogout size={24} />
          </button>
        </div>

        {/* History Content */}
        <div style={{ padding: '30px', flex: 1, overflowY: 'auto' }}>
          {/* Header */}
          <div style={{ 
            fontSize: '28px', 
            fontWeight: '700', 
            marginBottom: '25px',
            color: '#333'
          }}>
            History
          </div>

          {/* History Table */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '25px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}>
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse',
              fontSize: '14px'
            }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f0f0f0' }}>
                  <th style={{ 
                    padding: '15px 10px', 
                    textAlign: 'left', 
                    color: '#FF8040',
                    fontWeight: '600',
                    fontSize: '15px'
                  }}>
                    Created at
                  </th>
                  <th style={{ 
                    padding: '15px 10px', 
                    textAlign: 'left', 
                    color: '#FF8040',
                    fontWeight: '600',
                    fontSize: '15px'
                  }}>
                    Name
                  </th>
                  <th style={{ 
                    padding: '15px 10px', 
                    textAlign: 'left', 
                    color: '#FF8040',
                    fontWeight: '600',
                    fontSize: '15px'
                  }}>
                    Priority
                  </th>
                  <th style={{ 
                    padding: '15px 10px', 
                    textAlign: 'left', 
                    color: '#FF8040',
                    fontWeight: '600',
                    fontSize: '15px'
                  }}>
                    Solved at
                  </th>
                  <th style={{ 
                    padding: '15px 10px', 
                    textAlign: 'left', 
                    color: '#FF8040',
                    fontWeight: '600',
                    fontSize: '15px'
                  }}>
                    Solved by
                  </th>
                  <th style={{ 
                    padding: '15px 10px', 
                    textAlign: 'left', 
                    color: '#FF8040',
                    fontWeight: '600',
                    fontSize: '15px'
                  }}>
                    Satisfaction
                  </th>
                </tr>
              </thead>
              <tbody>
                {historyData.map((item, index) => (
                  <tr 
                    key={item.id}
                    style={{ 
                      borderBottom: index < historyData.length - 1 ? '1px solid #f0f0f0' : 'none'
                    }}
                  >
                    <td style={{ padding: '18px 10px', color: '#666' }}>
                      {item.createdAt}
                    </td>
                    <td style={{ padding: '18px 10px', color: '#666' }}>
                      {item.name}
                    </td>
                    <td style={{ 
                      padding: '18px 10px',
                      color: getPriorityColor(item.priority),
                      fontWeight: '500'
                    }}>
                      {item.priority}
                    </td>
                    <td style={{ padding: '18px 10px', color: '#666' }}>
                      {item.solvedAt}
                    </td>
                    <td style={{ padding: '18px 10px', color: '#666' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        {getSolverIcon(item.solvedBy.type)}
                        {item.solvedBy.name}
                      </span>
                    </td>
                    <td style={{ padding: '18px 10px' }}>
                      {renderStars(item.satisfaction)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Floating Chat Button */}
        <button 
          onClick={() => setChatOpen(!chatOpen)}
          style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: '#FF8040',
          border: 'none',
          color: 'white',
          fontSize: '28px',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(255, 128, 64, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <MdChat size={28} />
        </button>

        {/* ChatBot Component */}
        <ChatBot isOpen={chatOpen} onClose={() => setChatOpen(false)} />
      </div>
    </div>
  );
}
