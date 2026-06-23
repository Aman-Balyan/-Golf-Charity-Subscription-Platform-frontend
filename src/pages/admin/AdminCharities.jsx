import { useEffect, useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react';

const EMPTY = {
  name: '', description: '', imageUrl: '',
  websiteUrl: '', isFeatured: false,
};

export default function AdminCharities() {
  const [charities, setCharities] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [form,      setForm]      = useState(EMPTY);
  const [editId,    setEditId]    = useState(null);
  const [saving,    setSaving]    = useState(false);
  const [showForm,  setShowForm]  = useState(false);

  useEffect(() => { loadCharities(); }, []);

  const loadCharities = () => {
    api.get('/charities')
      .then(r => setCharities(r.data))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  };

  const startEdit = (c) => {
    setForm({
      name: c.name, description: c.description || '',
      imageUrl: c.imageUrl || '', websiteUrl: c.websiteUrl || '',
      isFeatured: c.isFeatured,
    });
    setEditId(c.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setForm(EMPTY); setEditId(null); setShowForm(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) {
        await api.put(`/charities/${editId}`, form);
        toast.success('Charity updated');
      } else {
        await api.post('/charities', form);
        toast.success('Charity created');
      }
      resetForm();
      loadCharities();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Deactivate "${name}"?`)) return;
    try {
      await api.delete(`/charities/${id}`);
      toast.success('Charity deactivated');
      loadCharities();
    } catch {
      toast.error('Failed to deactivate');
    }
  };

  return (
    <div style={{ padding: '2.5rem' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-end', marginBottom: '2rem',
      }}>
        <div>
          <p style={{
            fontSize: '0.7rem', letterSpacing: '0.12em',
            textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.4rem',
          }}>Admin</p>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.8rem', fontWeight: 700, color: 'var(--cream)',
          }}>Charities</h1>
        </div>
        <button className="btn-primary"
          onClick={() => { resetForm(); setShowForm(true); }}
          style={{
            display: 'flex', alignItems: 'center',
            gap: '0.4rem', fontSize: '0.85rem', padding: '0.65rem 1.25rem',
          }}>
          <Plus size={15} /> Add charity
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card" style={{
          marginBottom: '2rem', padding: '1.75rem',
          border: '1px solid rgba(201,168,76,0.25)',
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', marginBottom: '1.25rem',
          }}>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.05rem', fontWeight: 700, color: 'var(--cream)',
            }}>
              {editId ? 'Edit charity' : 'New charity'}
            </h2>
            <button onClick={resetForm} style={{ color: 'rgba(240,237,230,0.4)' }}>
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSave} style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr', gap: '1rem',
          }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="label">Name</label>
              <input className="input-field" required
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="label">Description</label>
              <textarea className="input-field" rows={3}
                style={{ resize: 'vertical' }}
                value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              />
            </div>
            <div>
              <label className="label">Image URL</label>
              <input className="input-field" type="url"
                placeholder="https://…"
                value={form.imageUrl}
                onChange={e => setForm(p => ({ ...p, imageUrl: e.target.value }))}
              />
            </div>
            <div>
              <label className="label">Website URL</label>
              <input className="input-field" type="url"
                placeholder="https://…"
                value={form.websiteUrl}
                onChange={e => setForm(p => ({ ...p, websiteUrl: e.target.value }))}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" id="featured"
                checked={form.isFeatured}
                onChange={e => setForm(p => ({ ...p, isFeatured: e.target.checked }))}
                style={{ accentColor: 'var(--gold)', width: '16px', height: '16px' }}
              />
              <label htmlFor="featured" style={{
                fontSize: '0.85rem', color: 'var(--cream)', cursor: 'pointer',
              }}>
                Featured on homepage
              </label>
            </div>
            <div style={{
              gridColumn: '1 / -1', display: 'flex', gap: '0.75rem',
            }}>
              <button type="submit" className="btn-primary"
                disabled={saving}
                style={{ opacity: saving ? 0.7 : 1, fontSize: '0.875rem' }}>
                {saving ? 'Saving…' : editId ? 'Update charity' : 'Create charity'}
              </button>
              <button type="button" className="btn-outline"
                onClick={resetForm} style={{ fontSize: '0.875rem' }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Charities list */}
      {loading ? (
        <p style={{ color: 'rgba(240,237,230,0.35)', fontSize: '0.9rem' }}>Loading…</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {charities.map(c => (
            <div key={c.id} className="card" style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {c.imageUrl && (
                  <img src={c.imageUrl} alt={c.name} style={{
                    width: '48px', height: '48px',
                    borderRadius: '4px', objectFit: 'cover',
                    flexShrink: 0,
                    background: 'rgba(255,255,255,0.05)',
                  }} />
                )}
                <div>
                  <div style={{
                    fontSize: '0.9rem', fontWeight: 600,
                    color: 'var(--cream)', marginBottom: '0.2rem',
                  }}>
                    {c.name}
                    {c.isFeatured && (
                      <span className="tag tag-gold"
                        style={{ fontSize: '0.6rem', marginLeft: '0.5rem' }}>
                        Featured
                      </span>
                    )}
                  </div>
                  <div style={{
                    fontSize: '0.75rem', color: 'rgba(240,237,230,0.4)',
                  }}>
                    £{Number(c.totalContributions || 0).toLocaleString()} raised
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span className="tag" style={{
                  fontSize: '0.6rem',
                  background: c.isActive
                    ? 'rgba(39,174,96,0.12)' : 'rgba(255,255,255,0.05)',
                  color: c.isActive ? '#7DC67A' : 'rgba(240,237,230,0.3)',
                }}>
                  {c.isActive ? 'Active' : 'Inactive'}
                </span>
                <button onClick={() => startEdit(c)} style={{
                  padding: '0.4rem', color: 'rgba(240,237,230,0.4)',
                  transition: 'color 0.2s',
                }}
                  onMouseOver={e => e.currentTarget.style.color = 'var(--gold)'}
                  onMouseOut={e => e.currentTarget.style.color = 'rgba(240,237,230,0.4)'}
                >
                  <Pencil size={15} />
                </button>
                <button onClick={() => handleDelete(c.id, c.name)} style={{
                  padding: '0.4rem', color: 'rgba(240,237,230,0.4)',
                  transition: 'color 0.2s',
                }}
                  onMouseOver={e => e.currentTarget.style.color = '#E67E73'}
                  onMouseOut={e => e.currentTarget.style.color = 'rgba(240,237,230,0.4)'}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}