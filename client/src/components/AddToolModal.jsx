import { useState } from 'react';
import { categories } from '../data';

function AddToolModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({
    name: '',
    category: 'Power tools',
    area: 'Vijay Nagar',
    deposit: 400,
    description: '',
    image: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=900&q=85'
  });

  function updateField(field, value) {
    setForm((currentForm) => ({ ...currentForm, [field]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit({ ...form, deposit: Number(form.deposit), distance: 'Your listing' });
  }

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <form className="modal" onSubmit={handleSubmit}>
        <div className="modal-head">
          <div><p className="eyebrow">Your workshop</p><h2>List a tool</h2></div>
          <button type="button" className="close-button" onClick={onClose} aria-label="Close">×</button>
        </div>

        <label>Tool name
          <input value={form.name} onChange={(event) => updateField('name', event.target.value)} placeholder="e.g. Cordless drill" required />
        </label>

        <div className="date-grid">
          <label>Category
            <select value={form.category} onChange={(event) => updateField('category', event.target.value)}>
              {categories.slice(1).map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label>Deposit (₹)
            <input type="number" min="0" value={form.deposit} onChange={(event) => updateField('deposit', event.target.value)} required />
          </label>
        </div>

        <label>Short description
          <textarea
            rows="3"
            value={form.description}
            onChange={(event) => updateField('description', event.target.value)}
            placeholder="Condition, included parts, and suitable uses"
            required
          />
        </label>

        <button className="submit-button" type="submit">Publish tool</button>
      </form>
    </div>
  );
}

export default AddToolModal;
