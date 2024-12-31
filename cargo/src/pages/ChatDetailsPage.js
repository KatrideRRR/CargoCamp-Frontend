import React from 'react';
import { useParams } from 'react-router-dom';

const ChatDetailsPage = () => {
  const { id } = useParams();

  return (
    <div>
      <div style={{ paddingTop: '30px' }}></div>
      <h1>Чат {id}</h1>
      <p>Детали переписки...</p>
    </div>
  );
};

export default ChatDetailsPage;
