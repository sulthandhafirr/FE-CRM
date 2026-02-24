import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { ROUTE } from "../router/routes";
// import { useAuth } from "../hooks/useAuth";
import { MdDashboard, MdConfirmationNumber, MdHistory, MdPerson, MdLogout, MdChat } from 'react-icons/md';
import ChatBot from '../components/ChatBot';

export default function CustomerDashboard() {
  // const { user } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [chatOpen, setChatOpen] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate(ROUTE.login);
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
          transition: 'all 0.3s'
        }}>
          {sidebarOpen ? 'crm.' : 'c.'}
        </div>

        {/* Menu Items */}
        <div style={{ flex: 1, padding: '10px' }}>
          {/* Dashboard */}
          <div
            onClick={() => setActiveMenu('dashboard')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              padding: '12px 15px',
              marginBottom: '5px',
              borderRadius: '8px',
              background: activeMenu === 'dashboard' ? '#FF8040' : 'transparent',
              color: activeMenu === 'dashboard' ? 'white' : '#666',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontWeight: '500'
            }}
            onMouseOver={(e) => {
              if (activeMenu !== 'dashboard') {
                e.currentTarget.style.background = '#f5f5f5';
              }
            }}
            onMouseOut={(e) => {
              if (activeMenu !== 'dashboard') {
                e.currentTarget.style.background = 'transparent';
              }
            }}
          >
            <MdDashboard size={18} />
            {sidebarOpen && <span>Dashboard</span>}
          </div>

          {/* Ticket */}
          <div
            onClick={() => navigate(ROUTE.ticket)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              padding: '12px 15px',
              marginBottom: '5px',
              borderRadius: '8px',
              background: activeMenu === 'ticket' ? '#FF8040' : 'transparent',
              color: activeMenu === 'ticket' ? 'white' : '#666',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontWeight: '500'
            }}
            onMouseOver={(e) => {
              if (activeMenu !== 'ticket') {
                e.currentTarget.style.background = '#f5f5f5';
              }
            }}
            onMouseOut={(e) => {
              if (activeMenu !== 'ticket') {
                e.currentTarget.style.background = 'transparent';
              }
            }}
          >
            <MdConfirmationNumber size={18} />
            {sidebarOpen && <span>Ticket</span>}
          </div>

          {/* History */}
          <div
            onClick={() => navigate(ROUTE.history)}
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
            onMouseOver={(e) => {
              if (activeMenu !== 'history') {
                e.currentTarget.style.background = '#f5f5f5';
              }
            }}
            onMouseOut={(e) => {
              if (activeMenu !== 'history') {
                e.currentTarget.style.background = 'transparent';
              }
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
              background: activeMenu === 'profile' ? '#FF8040' : 'transparent',
              color: activeMenu === 'profile' ? 'white' : '#666',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontWeight: '500'
            }}
            onMouseOver={(e) => {
              if (activeMenu !== 'profile') {
                e.currentTarget.style.background = '#f5f5f5';
              }
            }}
            onMouseOut={(e) => {
              if (activeMenu !== 'profile') {
                e.currentTarget.style.background = 'transparent';
              }
            }}
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

        {/* Dashboard Content */}
        <div style={{ padding: '30px', flex: 1, overflowY: 'auto' }}>
          {/* Top Cards Row */}
          <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
            {/* Total Technician Card */}
            <div style={{
              flex: 1,
              background: 'white',
              padding: '25px',
              borderRadius: '12px',
              border: '2px solid #FF8040',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}>
              <div style={{ fontSize: '16px', color: '#333', marginBottom: '10px', fontWeight: '500' }}>
                Total Technician
              </div>
              <div style={{ fontSize: '36px', fontWeight: '700', color: '#FF8040' }}>45</div>
            </div>

            {/* Total CS Agent Card */}
            <div style={{
              flex: 1,
              background: 'white',
              padding: '25px',
              borderRadius: '12px',
              border: '2px solid #FF8040',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}>
              <div style={{ fontSize: '16px', color: '#333', marginBottom: '10px', fontWeight: '500' }}>
                Total CS Agent
              </div>
              <div style={{ fontSize: '36px', fontWeight: '700', color: '#FF8040' }}>17</div>
            </div>
          </div>

          {/* Charts Row */}
          <div style={{ display: 'flex', gap: '20px' }}>
            {/* Ticket Solved by AI Chart */}
            <div style={{
              flex: 2,
              background: 'white',
              padding: '25px',
              borderRadius: '12px',
              border: '2px solid #FF8040',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              minHeight: '400px'
            }}>
              <div style={{ fontSize: '18px', fontWeight: '600', color: '#333', marginBottom: '20px' }}>
                Ticket Solved by AI
              </div>
              <div style={{ 
                height: '300px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: '#999',
                fontSize: '14px'
              }}>
                Chart will be implemented here (Line Chart)
              </div>
            </div>

            {/* Ticket Priority Chart */}
            <div style={{
              flex: 1,
              background: 'white',
              padding: '25px',
              borderRadius: '12px',
              border: '2px solid #FF8040',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              minHeight: '400px'
            }}>
              <div style={{ fontSize: '18px', fontWeight: '600', color: '#333', marginBottom: '20px' }}>
                Ticket Priority
              </div>
              <div style={{ 
                height: '300px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: '#999',
                fontSize: '14px'
              }}>
                Chart will be implemented here (Bar Chart)
              </div>
            </div>
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
