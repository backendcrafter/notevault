import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import NoteCard from '../components/NoteCard';
import NoteModal from '../components/NoteModal';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [notes, setNotes] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 9, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  const fetchNotes = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await api.get('/notes', {
        params: { page, limit: pagination.limit, search },
      });
      setNotes(data.data);
      setPagination(data.pagination);
    } catch {
      toast.error('Failed to fetch notes.');
    } finally {
      setLoading(false);
    }
  }, [search, pagination.limit]);

  useEffect(() => { fetchNotes(1); }, [fetchNotes]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const openCreate = () => { setEditingNote(null); setModalOpen(true); };
  const openEdit = (note) => { setEditingNote(note); setModalOpen(true); };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this note?')) return;
    try {
      await api.delete(`/notes/${id}`);
      toast.success('Note deleted.');
      fetchNotes(pagination.page);
    } catch {
      toast.error('Failed to delete note.');
    }
  };

  const handleSaved = () => { setModalOpen(false); fetchNotes(pagination.page); };

  return (
    <div style={styles.page}>
      {/* Navbar */}
      <nav style={styles.nav}>
        <div style={styles.navLeft}>
          <span style={styles.logoIcon}>◈</span>
          <span style={styles.logoText}>NoteVault</span>
        </div>
        <div style={styles.navRight}>
          <span style={styles.userInfo}>
            <span className={`badge badge-${user?.role}`}>{user?.role}</span>
            {user?.name}
          </span>
          <button className="btn btn-secondary btn-sm" onClick={handleLogout}>Sign out</button>
        </div>
      </nav>

      <main style={styles.main}>
        {/* Header */}
        <div style={styles.header} className="fade-in">
          <div>
            <h1 style={styles.title}>My Notes</h1>
            <p style={styles.subtitle}>{pagination.total} note{pagination.total !== 1 ? 's' : ''} total</p>
          </div>
          <button className="btn btn-primary" onClick={openCreate}>
            + New Note
          </button>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} style={styles.searchRow}>
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search notes by title or content…"
            style={styles.searchInput}
          />
          <button type="submit" className="btn btn-secondary">Search</button>
          {search && (
            <button type="button" className="btn btn-secondary" onClick={() => { setSearch(''); setSearchInput(''); }}>
              Clear
            </button>
          )}
        </form>

        {/* Notes Grid */}
        {loading ? (
          <div style={styles.center}>
            <div style={styles.bigSpinner} />
          </div>
        ) : notes.length === 0 ? (
          <div style={styles.empty} className="fade-in">
            <span style={styles.emptyIcon}>◎</span>
            <p style={styles.emptyText}>{search ? 'No notes match your search.' : 'No notes yet. Create your first one!'}</p>
          </div>
        ) : (
          <div style={styles.grid} className="fade-in">
            {notes.map((note) => (
              <NoteCard key={note.id} note={note} onEdit={openEdit} onDelete={handleDelete} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div style={styles.pagination}>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                className={`btn btn-sm ${p === pagination.page ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => fetchNotes(p)}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </main>

      {modalOpen && (
        <NoteModal note={editingNote} onClose={() => setModalOpen(false)} onSaved={handleSaved} />
      )}
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', display: 'flex', flexDirection: 'column' },
  nav: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '14px 32px',
    borderBottom: '1.5px solid var(--border)',
    background: 'var(--surface)',
    position: 'sticky', top: 0, zIndex: 100,
  },
  navLeft: { display: 'flex', alignItems: 'center', gap: 10 },
  logoIcon: { fontSize: 22, color: 'var(--accent)' },
  logoText: { fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em' },
  navRight: { display: 'flex', alignItems: 'center', gap: 14 },
  userInfo: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--text-muted)' },
  main: { flex: 1, padding: '40px 32px', maxWidth: 1100, margin: '0 auto', width: '100%' },
  header: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 },
  title: { fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' },
  subtitle: { color: 'var(--text-muted)', fontSize: 13, marginTop: 4 },
  searchRow: { display: 'flex', gap: 10, marginBottom: 32 },
  searchInput: { flex: 1 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 },
  center: { display: 'flex', justifyContent: 'center', padding: 80 },
  bigSpinner: {
    width: 36, height: 36,
    border: '3px solid var(--border)',
    borderTopColor: 'var(--accent)',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
  },
  empty: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: 80 },
  emptyIcon: { fontSize: 48, color: 'var(--text-dim)' },
  emptyText: { color: 'var(--text-muted)', fontSize: 15 },
  pagination: { display: 'flex', gap: 8, justifyContent: 'center', marginTop: 40 },
};
