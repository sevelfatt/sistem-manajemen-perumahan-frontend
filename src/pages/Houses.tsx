import { useEffect, useMemo, useState } from 'react';
import {
  Home,
  Plus,
  Pencil,
  Trash2,
  Search,
  Clock,
  Users,
} from 'lucide-react';
import toast from 'react-hot-toast';

import {
  getHouses,
  createHouse,
  updateHouse,
  deleteHouse,
  getHouse,
} from '../services/houseService';

import { getResidents } from '../services/residentService';

import type {
  House,
  HouseStatus,
  HouseHistory,
} from '../types/index';
import type { Resident } from '../types/index';

interface HouseForm {
  house_code: string;
  status: HouseStatus;
  current_resident_id: number | null;
}

const initialForm: HouseForm = {
  house_code: '',
  status: 'tidak_dihuni',
  current_resident_id: null,
};

export default function Houses() {
  const [houses, setHouses] = useState<House[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | HouseStatus>('all');

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<House | null>(null);

  const [historyModal, setHistoryModal] = useState(false);
  const [selectedHouse, setSelectedHouse] = useState<House | null>(null);

  const [confirmDelete, setConfirmDelete] = useState<House | null>(null);

  const [form, setForm] = useState<HouseForm>(initialForm);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const [housesRes, residentsRes] = await Promise.all([
        getHouses(),
        getResidents(),
      ]);

      setHouses(housesRes.data);
      setResidents(residentsRes.data);
    } catch {
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const filteredHouses = useMemo(() => {
    return houses.filter((house) => {
      const matchesSearch = house.house_code
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' || house.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [houses, search, statusFilter]);

  const resetForm = () => {
    setForm(initialForm);
    setEditing(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (house: House) => {
    setEditing(house);

    setForm({
      house_code: house.house_code,
      status: house.status,
      current_resident_id: house.current_resident_id,
    });

    setShowModal(true);
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        ...form,
        current_resident_id:
          form.status === 'tidak_dihuni'
            ? null
            : form.current_resident_id,
      };

      if (editing) {
        await updateHouse(editing.id, payload);
        toast.success('Rumah berhasil diperbarui');
      } else {
        await createHouse(payload);
        toast.success('Rumah berhasil ditambahkan');
      }

      setShowModal(false);
      resetForm();
      loadData();
    } catch {
      toast.error('Terjadi kesalahan');
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;

    try {
      await deleteHouse(confirmDelete.id);

      toast.success('Rumah berhasil dihapus');

      setConfirmDelete(null);
      loadData();
    } catch {
      toast.error('Gagal menghapus rumah');
    }
  };

  const openHistory = async (house: House) => {
    try {
      const response = await getHouse(house.id);

      setSelectedHouse(response.data);
      setHistoryModal(true);
    } catch {
      toast.error('Gagal memuat riwayat rumah');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Rumah</h1>
          <p>Kelola data rumah dan penghuni</p>
        </div>

        <button
          className="btn btn-primary"
          onClick={openCreateModal}
        >
          <Plus size={18} />
          Tambah Rumah
        </button>
      </div>

      <div className="filter-bar">
        <div className="search-box">
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Cari kode rumah..."
            className='form-control'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="form-control"
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as any)
          }
        >
          <option value="all">Semua Status</option>
          <option value="dihuni">Dihuni</option>
          <option value="tidak_dihuni">Tidak Dihuni</option>
        </select>
      </div>

      {loading ? (
        <div className="loading-center">
          <div className="spinner" />
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Kode Rumah</th>
                <th>Status</th>
                <th>Penghuni Saat Ini</th>
                <th>Aksi</th>
              </tr>
            </thead>

            <tbody>
              {filteredHouses.map((house) => (
                <tr key={house.id}>
                  <td>
                    <strong>{house.house_code}</strong>
                  </td>

                  <td>
                    <span
                      className={`badge ${
                        house.status === 'dihuni'
                          ? 'badge-green'
                          : 'badge-gray'
                      }`}
                    >
                      {house.status}
                    </span>
                  </td>

                  <td>
                    {house.current_resident?.full_name || '-'}
                  </td>

                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        className="btn-icon btn-sm"
                        onClick={() => openHistory(house)}
                      >
                        <Clock size={16} />
                      </button>

                      <button
                        className="btn-icon btn-sm"
                        onClick={() => openEditModal(house)}
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        className="btn-icon btn-sm"
                        onClick={() =>
                          setConfirmDelete(house)
                        }
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!filteredHouses.length && (
                <tr>
                  <td colSpan={4}>
                    <div
                      style={{
                        textAlign: 'center',
                        padding: '2rem',
                      }}
                    >
                      Tidak ada data rumah
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* FORM MODAL */}

      {showModal && (
        <div
          className="modal-overlay"
          onClick={(e) =>
            e.target === e.currentTarget &&
            setShowModal(false)
          }
        >
          <div className="modal-box">
            <div className="modal-header">
              <h3>
                {editing
                  ? 'Edit Rumah'
                  : 'Tambah Rumah'}
              </h3>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">
                  Kode Rumah
                </label>

                <input
                  className="form-control"
                  value={form.house_code}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      house_code: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Status
                </label>

                <select
                  className="form-control"
                  value={form.status}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      status:
                        e.target.value as HouseStatus,
                    })
                  }
                >
                  <option value="dihuni">
                    Dihuni
                  </option>
                  <option value="tidak_dihuni">
                    Tidak Dihuni
                  </option>
                </select>
              </div>

              {form.status === 'dihuni' && (
                <div className="form-group">
                  <label className="form-label">
                    Penghuni
                  </label>

                  <select
                    className="form-control"
                    value={
                      form.current_resident_id ?? ''
                    }
                    onChange={(e) =>
                      setForm({
                        ...form,
                        current_resident_id:
                          Number(e.target.value),
                      })
                    }
                  >
                    <option value="">
                      Pilih Penghuni
                    </option>

                    {residents.map((resident) => (
                      <option
                        key={resident.id}
                        value={resident.id}
                      >
                        {resident.full_name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() =>
                  setShowModal(false)
                }
              >
                Batal
              </button>

              <button
                className="btn btn-primary"
                onClick={handleSubmit}
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HISTORY MODAL */}

      {historyModal && selectedHouse && (
        <div
          className="modal-overlay"
          onClick={(e) =>
            e.target === e.currentTarget &&
            setHistoryModal(false)
          }
        >
          <div className="modal-box modal-box-lg">
            <div className="modal-header">
              <h3>
                Riwayat Rumah{' '}
                {selectedHouse.house_code}
              </h3>
            </div>

            <div className="modal-body">
              {!selectedHouse.histories?.length ? (
                <p>Belum ada riwayat penghuni.</p>
              ) : (
                selectedHouse.histories.map(
                  (history: HouseHistory) => (
                    <div
                      key={history.id}
                      className="history-item"
                    >
                      <div className="history-dot" />

                      <div>
                        <strong>
                          {
                            history.resident
                              ?.full_name
                          }
                        </strong>

                        <p>
                          {history.start_date} -{' '}
                          {history.end_date ??
                            'Sekarang'}
                        </p>
                      </div>
                    </div>
                  )
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}

      {confirmDelete && (
        <div
          className="modal-overlay"
          onClick={(e) =>
            e.target === e.currentTarget &&
            setConfirmDelete(null)
          }
        >
          <div className="modal-box">
            <div className="modal-body">
              <div className="confirm-icon danger">
                <Trash2 />
              </div>

              <h3>Hapus Rumah</h3>

              <p>
                Yakin ingin menghapus rumah{' '}
                <strong>
                  {confirmDelete.house_code}
                </strong>
                ?
              </p>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() =>
                  setConfirmDelete(null)
                }
              >
                Batal
              </button>

              <button
                className="btn btn-danger"
                onClick={handleDelete}
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
