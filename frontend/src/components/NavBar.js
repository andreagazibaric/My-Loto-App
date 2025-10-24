import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';

export default function NavBar() {
  const { isAuthenticated, user, loginWithRedirect, logout } = useAuth0();

  return (
    <nav className='navbar' style={{ display: 'flex', gap: 15, alignItems: 'center', padding: 10 }}>
      <Link to="/" className='home'>Home</Link>
      <Link to="/buy" className='buy'>Buy Ticket</Link>
      <div style={{ marginLeft: 'auto' }}>
        {isAuthenticated ? (
          <>
            <span className='user' style={{ marginRight: 10 }}>{user.name || user.email}</span>
            <button className='login' onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}>Logout</button>
          </>
        ) : (
          <button className='login' onClick={() => loginWithRedirect()}>Login</button>
        )}
      </div>
    </nav>
  );
}
