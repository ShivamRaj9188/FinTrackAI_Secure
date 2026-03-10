import React, { useEffect, useState } from 'react';
import {
  getContactMessages,
  getContactStats,
  updateContactMessage,
  sendEmailResponse,
  deleteContactMessage,
  sendContactMessage,
  sendContactResponse
} from '../api/contact';

const AdminDashboard = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Replace with your actual token logic
    const token = localStorage.getItem('authToken');
    getContactMessages(token).then(res => {
      if (res.success) {
        setMessages(res.data);
      }
      setLoading(false);
    });
  }, []);

  if (loading) return <div>Loading...</div>;

  return ( 
    <div>
      <h2>Contact Messages</h2>
      {messages.length === 0 ? (
        <p>No messages found.</p>
      ) : (
        <ul>
          {messages.map(msg => (
            <li key={msg._id}>
              <strong>{msg.firstName} {msg.lastName}</strong>: {msg.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminDashboard;
