import { Outlet } from 'react-router-dom';
import Header from './Header';

export default function Layout({ session, hideHeader = false }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {!hideHeader && <Header session={session} />}
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
    </div>
  );
}