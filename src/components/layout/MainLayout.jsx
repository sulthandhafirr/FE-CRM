import { Outlet } from 'react-router-dom';

export default function MainLayout() {
  return (
    <div className="app-container">
      {/* Header/Navbar will go here */}
      
      <main className="main-content">
        <Outlet />
      </main>
      
      {/* Footer will go here */}
    </div>
  );
}
