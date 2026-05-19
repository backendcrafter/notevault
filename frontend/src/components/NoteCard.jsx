import React from 'react';

export default function NoteCard({ note, onEdit, onDelete }) {
  const preview = note.content
    ? note.content.slice(0, 120) + (note.content.length > 120 ? '…' : '')
    : '';

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div style={styles.card} className="fade-in">
      <div style={styles.header}>
        <h3 style={styles.title}>{note.title}</h3>
        {note.is_pinned && <span className="badge badge-pinned">📌 pinned</span>}
      </div>

      {preview && <p style={styles.preview}>{preview}</p>}

      {note.tags?.length > 0 && (
        <div style={styles.tags}>
          {note.tags.map((tag) => (
            <span key={tag} style={styles.tag}>#{tag}</span>
          ))}
        </div>
      )}

      <div style={styles.footer}>
        <span style={styles.time}>{timeAgo(note.updated_at)}</span>
        <div style={styles.actions}>
          <button className="btn btn-secondary btn-sm" onClick={() => onEdit(note)}>Edit</button>
          <button className="btn btn-danger btn-sm" onClick={() => onDelete(note.id)}>Delete</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: 'var(--surface)',
    border: '1.5px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: 20,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    transition: 'border-color 0.18s, transform 0.18s, box-shadow 0.18s',
    cursor: 'default',
    ':hover': { borderColor: 'var(--accent)', transform: 'translateY(-2px)' },
  },
  header: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 },
  title: { fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1.3, flex: 1 },
  preview: { fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 },
  tags: { display: 'flex', flexWrap: 'wrap', gap: 6 },
  tag: {
    fontSize: 11,
    fontFamily: 'var(--mono)',
    color: 'var(--accent)',
    background: 'var(--accent-glow)',
    padding: '2px 7px',
    borderRadius: 4,
  },
  footer: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  time: { fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--mono)' },
  actions: { display: 'flex', gap: 8 },
};
