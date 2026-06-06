import { useEffect, useState, useRef } from 'react';
import { Plus, Pencil, Trash2, Search, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { getResidents, createResident, updateResident, deleteResident } from '../services/residentService';
import type { Resident } from '../types';

const BASE = 'http://sistem-manajemen-perumahan-backend.test/storage/';

function initForm() {
  return { full_name: '', status: 'tetap' as 'tetap' | 'kontrak', phone_number: '', is_married: false };
}

export default function Residents() {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]   = useState<Resident | null>(null);
  const [form, setForm]         = useState(initForm());
  const [ktpFile, setKtpFile]   = useState<File | null>(null);
  const [ktpPreview, setKtpPreview] = useState<string | null>(null);
  const [saving, setSaving]     = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Resident | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = () => {
    setLoading(true);
    getResidents().then(r => setResidents(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = residents.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = r.full_name.toLowerCase().includes(q) || r.phone_number.includes(q);
    const matchStatus = filterStatus ? r.status === filterStatus : true;
    return matchSearch && matchStatus;
  });

  const openCreate = () => {
    setEditing(null);
    setForm(initForm());
    setKtpFile(null);
    setKtpPreview(null);
    setShowModal(true);
  };

  const openEdit = (r: Resident) => {
    setEditing(r);
    setForm({ full_name: r.full_name, status: r.status, phone_number: r.phone_number, is_married: r.is_married });
    setKtpFile(null);
    setKtpPreview(r.ktp_photo ? BASE + r.ktp_photo : null);
    setShowModal(true);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setKtpFile(f);
    setKtpPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      let payload: FormData | typeof form;
      if (ktpFile) {
        const fd = new FormData();
        Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
        fd.append('ktp_photo', ktpFile);
        payload = fd;
      } else {
        payload = form;
      }

      if (editing) {
        await updateResident(editing.id, payload);
        toast.success('Penghuni berhasil diperbarui');
      } else {
        await createResident(payload);
        toast.success('Penghuni berhasil ditambahkan');
      }
      setShowModal(false);
      load();
    } catch (_) {
      toast.error('Terjadi kesalahan, coba lagi');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await deleteResident(confirmDelete.id);
      toast.success('Penghuni berhasil dihapus');
      setConfirmDelete(null);
      load();
    } catch (_) {
      toast.error('Gagal menghapus penghuni');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Penghuni</div>
          <div className="page-subtitle">Kelola data penghuni perumahan</div>
        </div>
        <button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> Tambah Penghuni</button>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="form-control" style={{ paddingLeft: 36 }} placeholder="Cari nama atau telepon…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-control" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">Semua Status</option>
          <option value="tetap">Tetap</option>
          <option value="kontrak">Kontrak</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="loading-center"><div className="spinner" /><span>Memuat...</span></div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Nama Lengkap</th>
                <th>Status</th>
                <th>No. Telepon</th>
                <th>Menikah</th>
                <th>KTP</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Tidak ada data penghuni</td></tr>
              ) : filtered.map((r, i) => (
                <tr key={r.id}>
                  <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="avatar" style={{ width: 30, height: 30, fontSize: 11 }}>
                        {r.full_name.charAt(0).toUpperCase()}
                      </div>
                      <strong>{r.full_name}</strong>
                    </div>
                  </td>
                  <td><span className={`badge ${r.status === 'tetap' ? 'badge-green' : 'badge-blue'}`}>{r.status === 'tetap' ? 'Tetap' : 'Kontrak'}</span></td>
                  <td>{r.phone_number}</td>
                  <td><span className={`badge ${r.is_married ? 'badge-amber' : 'badge-gray'}`}>{r.is_married ? 'Menikah' : 'Belum'}</span></td>
                  <td>
                    {r.ktp_photo
                      ? <a href={BASE + r.ktp_photo} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', fontSize: 12 }}>Lihat KTP</a>
                      : <span className="text-muted">—</span>}
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button className="btn btn-secondary btn-icon btn-sm" onClick={() => openEdit(r)} title="Edit"><Pencil size={14} /></button>
                      <button className="btn btn-danger btn-icon btn-sm" onClick={() => setConfirmDelete(r)} title="Hapus"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal-box">
            <div className="modal-header">
              <div className="modal-title">{editing ? 'Edit Penghuni' : 'Tambah Penghuni'}</div>
              <button className="btn btn-secondary btn-icon" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Nama Lengkap *</label>
                  <input className="form-control" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} placeholder="Nama lengkap sesuai KTP" required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Status *</label>
                    <select className="form-control" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as 'tetap' | 'kontrak' }))}>
                      <option value="tetap">Tetap</option>
                      <option value="kontrak">Kontrak</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">No. Telepon *</label>
                    <input className="form-control" value={form.phone_number} onChange={e => setForm(f => ({ ...f, phone_number: e.target.value }))} placeholder="08xxxxxxxxxx" required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="checkbox-label">
                    <input type="checkbox" checked={form.is_married} onChange={e => setForm(f => ({ ...f, is_married: e.target.checked }))} />
                    Sudah menikah
                  </label>
                </div>
                <div className="form-group">
                  <label className="form-label">Foto KTP (opsional)</label>
                  <input ref={fileRef} type="file" accept="image/*" className="form-control" onChange={handleFile} />
                  <div className="form-hint">Format: JPG, PNG. Maks 2MB.</div>
                  {ktpPreview && <img src={ktpPreview} alt="Preview KTP" className="ktp-preview" />}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Menyimpan…' : editing ? 'Simpan Perubahan' : 'Tambah Penghuni'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setConfirmDelete(null)}>
          <div className="modal-box" style={{ maxWidth: 420 }}>
            <div className="modal-body" style={{ textAlign: 'center', padding: '32px 24px' }}>
              <div className="confirm-icon danger"><User size={24} /></div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Hapus Penghuni?</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                Penghuni <strong style={{ color: 'var(--text-primary)' }}>{confirmDelete.full_name}</strong> akan dihapus secara permanen.
              </p>
              <div className="flex gap-2 mt-4" style={{ justifyContent: 'center' }}>
                <button className="btn btn-secondary" onClick={() => setConfirmDelete(null)}>Batal</button>
                <button className="btn btn-danger" onClick={handleDelete}>Ya, Hapus</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
