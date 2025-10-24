import React, { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

export default function BuyTicket() {
  const { isAuthenticated, loginWithRedirect, getAccessTokenSilently } = useAuth0();
  const [personalId, setPersonalId] = useState('');
  const [numbers, setNumbers] = useState('');
  const [qrSrc, setQrSrc] = useState(null);
  const [error, setError] = useState(null);

  if (!isAuthenticated) {
    return (
      <div>
        <p>You must be logged in to buy a ticket.</p>
        <button className='submitbtn' onClick={() => loginWithRedirect()}>Login</button>
      </div>
    );
  }

  async function submitTicket(e) {
    e.preventDefault();
    setError(null);
    setQrSrc(null);
    try {
      const body = { personal_id: personalId, numbers: numbers };
      const token = await getAccessTokenSilently();
      const res = await fetch(`${process.env.REACT_APP_API_URL}/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        const json = await res.json();
        setError(json.error || 'Error');
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setQrSrc(url);
    } catch (err) {
      console.error(err);
      setError('Server error');
    }
  }

  return (
    <div>
      <h1 className='current'>Buy Ticket</h1>
      <form onSubmit={submitTicket}>
        <div style={{marginTop: '20px'}}>
          <label>Personal ID (max 20 chars)</label><br/>
          <input value={personalId} onChange={e => setPersonalId(e.target.value)} maxLength={20} />
        </div>
        <div style={{marginTop: '20px'}}>
          <label>Numbers (6-10 numbers comma separated)</label><br/>
          <input value={numbers} onChange={e => setNumbers(e.target.value)} />
        </div>
        <button className='submitbtn' type="submit" style={{marginTop: '20px'}}>Submit</button>
      </form>
      {error && <div style={{color:'red'}}>{error}</div>}
      {qrSrc && (
        <div>
          <h3>Your ticket QR code</h3>
          <img src={qrSrc} alt="QR code" />
        </div>
      )}
    </div>
  );
}
