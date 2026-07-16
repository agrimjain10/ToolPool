import { useState } from 'react';

function BorrowModal({ tool, onClose, onSubmit }) {
  const [form, setForm] = useState({
    from: '2026-07-18',
    to: '2026-07-20',
    message: 'Hi! I need this for a small home project. I can pick it up in the evening.'
  });

  function updateField(field, value) {
    setForm((currentForm) => ({ ...currentForm, [field]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit(tool, form);
  }

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <form className="modal" onSubmit={handleSubmit}>
        <div className="modal-head">
          <div><p className="eyebrow">Borrow request</p><h2>{tool.name}</h2></div>
          <button type="button" className="close-button" onClick={onClose} aria-label="Close">×</button>
        </div>

        <div className="date-grid">
          <label>From
            <input type="date" value={form.from} onChange={(event) => updateField('from', event.target.value)} required />
          </label>
          <label>To
            <input type="date" min={form.from} value={form.to} onChange={(event) => updateField('to', event.target.value)} required />
          </label>
        </div>

        <label>Message to {tool.owner.split(' ')[0]}
          <textarea rows="4" value={form.message} onChange={(event) => updateField('message', event.target.value)} required />
        </label>

        <div className="deposit-line"><span>Refundable deposit</span><strong>₹{tool.deposit}</strong></div>
        <button className="submit-button" type="submit">Send request</button>
      </form>
    </div>
  );
}

export default BorrowModal;
