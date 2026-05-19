import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function NoteModal({ note, onClose, onSaved }) {
  const isEdit = !!note;
  const [form, setForm] = useState({
    title: note?.title || '',
    content: note?.content || '',
    is_pinned: note?.is_pinned || false,
    tags: note?.tags?.join(', ') || '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    setErrors((err) => ({ ...err, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      title: form.title,
      content: form.content || null,
      is_pinned: form.is_pinned,
      tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
    };

    try {
      if (isEdit) {
        await api.put(`/notes/${note.id}`, payload);
        toast.success('Note updated!');
      } else {
        await api.post('/notes', payload);
        toast.success('Note created!');
      }
      onSaved();
    } catch (err) {
      const apiErrors = err.response?.data?.errors;
      if (apiErrors) {
        const mapped = {};
        apiErrors.forEach(({ field, message }) => { mapped[field] = message; });
        setErrors(mapped);
      } else {
        toast.error(err.response?.data?.message || 'Failed to save note.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={styles.modal} className="fade-in">
        <div style={styles.header}>
          <h2 style={styles.title}>{isEdit ? 'Edit Note' : 'New Note'}</h2>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div className="form-group">
            <label>Title *</label>
            <input
              name="title" value={form.title} onChange={handleChange}
              placeholder="Note title" autoFocus
            />
            {errors.title && <span className="form-error">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label>Content</label>
            <textarea
              name="content" value={form.content} onChange={handleChange}
              placeholder="Write your note here…"
              rows={8}
              style={styles.textarea}
            />
            {errors.content && <span className="form-error">{errors.content}</span>}
          </div>

          <div className="form-group">
            <label>Tags (comma-separated)</label>
            <input
              name="tags" value={form.tags} onChange={handleChange}
              placeholder="work, ideas, todo"
            />
          </div>

          <label style={styles.checkboxLabel}>
            <input
              type="checkbox" name="is_pinned"
              checked={form.is_pinned} onChange={handleChange}
              style={styles.checkbox}
            />
            <span>Pin this note</span>
          </label>

          <div style={styles.actions}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : isEdit ? 'Update Note' : 'Create Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.7)',
    backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, padding: 20,
  },
  modal: {
    background: 'var(--surface)',
    border: '1.5px solid var(--border)',
    borderRadius: 'var(--radius)',
    width: '100%', maxWidth: 560,
    maxHeight: '90vh', overflowY: 'auto',
    padding: 32,
  },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  title: { fontSize: 20, fontWeight: 800 },
  closeBtn: {
    background: 'none', border: 'none', color: 'var(--text-muted)',
    fontSize: 16, cursor: 'pointer', padding: 4, borderRadius: 4,
  },
  form: { display: 'flex', flexDirection: 'column', gap: 20 },
  textarea: { resize: 'vertical', minHeight: 160, lineHeight: 1.6, fontFamily: 'var(--mono)', fontSize: 13 },
  checkboxLabel: {
    display: 'flex', alignItems: 'center', gap: 10,
    fontSize: 14, color: 'var(--text-muted)', cursor: 'pointer',
  },
  checkbox: { width: 16, height: 16, accentColor: 'var(--accent)', cursor: 'pointer' },
  actions: { display: 'flex', gap: 12, justifyContent: 'flex-end', paddingTop: 8 },
};
