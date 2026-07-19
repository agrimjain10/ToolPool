import { useState } from 'react';

function AddToolModal({ onClose, onSubmit, categories }) {
  const categoryOptions = categories.length ? categories.filter((item) => item !== 'All') : ['Power tools', 'Home repair', 'Gardening', 'Cleaning', 'Outdoor'];
  const [form, setForm] = useState({
    name: '',
    category: 'Power tools',
    area: 'Vijay Nagar',
    deposit: 400,
    description: '',
    condition: 'Good',
    image: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=900&q=85'
  });
  const [imagePreview, setImagePreview] = useState(form.image);

  function updateField(field, value) {
    setForm((currentForm) => ({ ...currentForm, [field]: value }));
    if (field === 'image') setImagePreview(value);
  }

  function handleImageUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const nextImage = String(reader.result || '');
      setForm((currentForm) => ({ ...currentForm, image: nextImage }));
      setImagePreview(nextImage);
    };
    reader.readAsDataURL(file);
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
              {categoryOptions.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label>Condition
            <select value={form.condition} onChange={(event) => updateField('condition', event.target.value)}>
              <option>Like New</option>
              <option>Good</option>
              <option>Fair</option>
              <option>Needs Repair</option>
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

        <label>Image URL
          <input
            type="url"
            value={form.image}
            onChange={(event) => updateField('image', event.target.value)}
            placeholder="Paste an image link or upload below"
          />
        </label>

        <label>Upload image
          <input type="file" accept="image/*" onChange={handleImageUpload} />
        </label>

        {imagePreview && (
          <div className="image-preview">
            <img src={imagePreview} alt="Tool preview" />
          </div>
        )}

        <button className="submit-button" type="submit">Publish tool</button>
      </form>
    </div>
  );
}

export default AddToolModal;
