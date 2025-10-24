import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function TicketView() {
  const { uuid } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        //const res = await fetch(`/api/tickets/ticket/${uuid}`);
        const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/tickets/ticket/${uuid}`);
        if (!res.ok) {
          setData({ error: 'Ticket not found' });
          return;
        }
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
        setData({ error: 'Server error' });
      }
    }
    load();
  }, [uuid]);

  if (!data) return <div>Loading...</div>;
  if (data.error) return <div>{data.error}</div>;

  return (
    <div>
      <h1 className='current'>Ticket {data.ticket_uuid}</h1>
      <p>Personal ID: {data.personal_id}</p>
      <p>Ticket numbers: {data.ticket_numbers.join(', ')}</p>
      <p>Drawn numbers: {data.drawn_numbers ? data.drawn_numbers.join(', ') : 'Not drawn yet'}</p>
    </div>
  );
}
