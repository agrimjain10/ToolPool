import { useEffect, useRef, useState } from 'react';
import { api } from '../api';

function ChatModal({ request, user, onClose }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [live, setLive] = useState(false);
  const endRef = useRef(null);

  async function loadMessages() {
    try {
      const conversation = await api.getChatMessages(request.id);
      setMessages(conversation);
      setError('');
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMessages();
    const stream = new EventSource(api.chatStreamUrl(request.id));
    let fallbackInterval;

    stream.addEventListener('ready', () => setLive(true));
    stream.addEventListener('message', (event) => {
      try {
        const nextMessage = JSON.parse(event.data);
        setMessages((current) => current.some((item) => item._id === nextMessage._id) ? current : [...current, nextMessage]);
      } catch {
        // Ignore malformed events and keep the conversation usable.
      }
    });
    stream.onerror = () => {
      setLive(false);
      stream.close();
      fallbackInterval = window.setInterval(loadMessages, 4000);
    };

    return () => {
      stream.close();
      if (fallbackInterval) window.clearInterval(fallbackInterval);
    };
  }, [request.id]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend(event) {
    event.preventDefault();
    if (!text.trim()) return;

    try {
      await api.sendChatMessage({ requestId: request.id, text: text.trim() });
      setText('');
      await loadMessages();
    } catch (apiError) {
      setError(apiError.message);
    }
  }

  const counterpart = user.name === request.borrower ? request.toolOwner : request.borrower;

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="modal chat-modal">
        <div className="modal-head">
          <div>
            <p className="eyebrow">Approved request chat</p>
            <h2>{request.tool}</h2>
            <p>Chat with {counterpart} · <span className={live ? 'live-indicator' : ''}>{live ? 'Live' : 'Connecting…'}</span></p>
          </div>
          <button type="button" className="close-button" onClick={onClose} aria-label="Close">×</button>
        </div>

        <div className="chat-thread">
          {loading ? (
            <div className="empty-state"><strong>Loading chat</strong></div>
          ) : messages.length ? messages.map((message) => (
            <div className={`chat-bubble ${message.sender === user.name ? 'mine' : ''}`} key={message._id}>
              <strong>{message.sender}</strong>
              <p>{message.text}</p>
            </div>
          )) : (
            <div className="empty-state"><strong>No messages yet</strong><p>Say hello to start the chat.</p></div>
          )}
          <div ref={endRef} />
        </div>

        {error && <div className="form-error">{error}</div>}

        <form className="chat-form" onSubmit={handleSend}>
          <textarea rows="3" value={text} onChange={(event) => setText(event.target.value)} placeholder="Type your message" />
          <button className="submit-button" type="submit">Send</button>
        </form>
      </section>
    </div>
  );
}

export default ChatModal;
