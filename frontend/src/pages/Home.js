import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

export default function Home() {
  const [data, setData] = useState(null);
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    async function load() {
      try {
        //const res = await fetch('/api/status'); 
        const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/status`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        } else {
          setData(null);
        }
      } catch (err) {
        console.error(err);
        setData(null);
      }
    }
    load();
  }, []);

  return (
    <div>
      <h1 className="welcome">Welcome to the game of Loto 6/45!</h1>
      <p style={{marginLeft: '10px'}}>
        {isAuthenticated ? "You are logged in. :)" : "You are not logged in. :("}
      </p>

      <section>
        <h2 className='current' style={{ marginTop: '40px'}}>Latest round info:</h2>
        <p style={{ marginLeft: '40px' }}>
          Number of tickets in current round: {data?.tickets_count ?? 0}
        </p>
        <p style={{ marginLeft: '40px' }}>
          Drawn numbers: {data?.drawn_numbers?.length > 0 ? data.drawn_numbers.join(', ') : 'Not drawn yet'}
        </p>
      </section>
    </div>
  );
}
