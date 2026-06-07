import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Search, Receipt, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

import {
  getPayments,
  createPayment,
  updatePayment,
  deletePayment,
} from '../services/paymentService';

import { getHouses } from '../services/houseService';

import type { Payment, PaymentStatus, PaymentType, House } from '../types';

function initForm() {
  const today = new Date().toISOString().split('T')[0];
  const month = today.slice(0, 7);

  return {
    house_id: '',
    resident_id: '',
    amount: '',
    payment_date: today,
    type: 'kebersihan' as PaymentType,
    for_month: month,
    status: 'belum' as PaymentStatus,
  };
}

const formatCurrency = (value: number | string) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(value));

export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [houses, setHouses] = useState<House[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Payment | null>(null);

  const [confirmDelete, setConfirmDelete] = useState<Payment | null>(null);

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterMonth, setFilterMonth] = useState('');

  const [form, setForm] = useState(initForm());

  const load = async () => {
    try {
      setLoading(true);

      const [paymentsRes, housesRes] = await Promise.all([
        getPayments(),
        getHouses(),
      ]);

      setPayments(paymentsRes.data);
      setHouses(housesRes.data);
    } catch (error) {
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = payments.filter(payment => {
    const q = search.toLowerCase();

    const matchSearch =
      payment.house?.house_code?.toLowerCase().includes(q) ||
      payment.resident?.full_name?.toLowerCase().includes(q);

    const matchType = filterType
      ? payment.type === filterType
      : true;

    const matchStatus = filterStatus
      ? payment.status === filterStatus
      : true;

    const matchMonth = filterMonth
      ? payment.for_month === filterMonth
      : true;

    return matchSearch && matchType && matchStatus && matchMonth;
  });

  const openCreate = () => {
    setEditing(null);
    setForm(initForm());
    setShowModal(true);
  };

  const openEdit = (payment: Payment) => {
    setEditing(payment);

    setForm({
      house_id: String(payment.house_id),
      resident_id: String(payment.resident_id),
      amount: String(payment.amount),
      payment_date: payment.payment_date,
      type: payment.type,
      for_month: payment.for_month,
      status: payment.status,
    });

    setShowModal(true);
  };

  const handleHouseChange = (houseId: string) => {
    const selectedHouse = houses.find(
      h => h.id === Number(houseId)
    );

    setForm(prev => ({
      ...prev,
      house_id: houseId,
      resident_id: selectedHouse?.current_resident?.id
        ? String(selectedHouse.current_resident.id)
        : '',
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);

      const payload = {
        house_id: Number(form.house_id),
        resident_id: Number(form.resident_id),
        amount: Number(form.amount),
        payment_date: form.payment_date,
        type: form.type,
        for_month: form.for_month,
        status: form.status,
      };

      if (editing) {
        await updatePayment(editing.id, payload);
        toast.success('Pembayaran berhasil diperbarui');
      } else {
        await createPayment(payload);
        toast.success('Pembayaran berhasil ditambahkan');
      }

      setShowModal(false);
      load();
    } catch (error) {
      toast.error('Terjadi kesalahan');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;

    try {
      await deletePayment(confirmDelete.id);

      toast.success('Pembayaran berhasil dihapus');
      setConfirmDelete(null);

      load();
    } catch (error) {
      toast.error('Gagal menghapus pembayaran');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Pembayaran</div>
          <div className="page-subtitle">
            Kelola data pembayaran iuran warga
          </div>
        </div>

        <button
          className="btn btn-primary"
          onClick={openCreate}
        >
          <Plus size={16} />
          Tambah Pembayaran
        </button>
      </div>

      <div className="filter-bar">
        <div
          style={{
            position: 'relative',
            flex: 1,
            maxWidth: 320,
          }}
        >
          <Search
            size={14}
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
            }}
          />

          <input
            className="form-control"
            style={{ paddingLeft: 36 }}
            placeholder="Cari rumah atau penghuni..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <input
          type="month"
          className="form-control"
          value={filterMonth}
          onChange={e => setFilterMonth(e.target.value)}
        />

        <select
          className="form-control"
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
        >
          <option value="">Semua Tipe</option>
          <option value="kebersihan">Kebersihan</option>
          <option value="satpam">Satpam</option>
        </select>

        <select
          className="form-control"
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
        >
          <option value="">Semua Status</option>
          <option value="lunas">Lunas</option>
          <option value="belum">Belum</option>
        </select>
      </div>

      {loading ? (
        <div className="loading-center">
          <div className="spinner" />
          <span>Memuat...</span>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Rumah</th>
                <th>Penghuni</th>
                <th>Tipe</th>
                <th>Bulan</th>
                <th>Nominal</th>
                <th>Status</th>
                <th>Tanggal Bayar</th>
                <th>Aksi</th>
              </tr>
            </thead>

            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    style={{
                      textAlign: 'center',
                      padding: 40,
                      color: 'var(--text-muted)',
                    }}
                  >
                    Tidak ada data pembayaran
                  </td>
                </tr>
              ) : (
                filtered.map((payment, index) => (
                  <tr key={payment.id}>
                    <td>{index + 1}</td>

                    <td>
                      <strong>
                        {payment.house?.house_code}
                      </strong>
                    </td>

                    <td>
                      {payment.resident?.full_name}
                    </td>

                    <td>
                      <span className="badge badge-blue">
                        {payment.type}
                      </span>
                    </td>

                    <td>{payment.for_month}</td>

                    <td>
                      {formatCurrency(payment.amount)}
                    </td>

                    <td>
                      <span
                        className={`badge ${
                          payment.status === 'lunas'
                            ? 'badge-green'
                            : 'badge-amber'
                        }`}
                      >
                        {payment.status}
                      </span>
                    </td>

                    <td>{payment.payment_date}</td>

                    <td>
                      <div className="flex gap-2">
                        <button
                          className="btn-icon btn-sm"
                          onClick={() =>
                            openEdit(payment)
                          }
                        >
                          <Pencil size={14} />
                        </button>

                        <button
                          className="btn-icon btn-sm"
                          onClick={() =>
                            setConfirmDelete(payment)
                          }
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div
          className="modal-overlay"
          onClick={e =>
            e.target === e.currentTarget &&
            setShowModal(false)
          }
        >
          <div className="modal-box">
            <form onSubmit={handleSubmit}>
              <div className="modal-header">
                <div className="modal-title">
                  {editing
                    ? 'Edit Pembayaran'
                    : 'Tambah Pembayaran'}
                </div>
              </div>

              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">
                    Rumah
                  </label>

                  <select
                    className="form-control"
                    required
                    value={form.house_id}
                    onChange={e =>
                      handleHouseChange(
                        e.target.value
                      )
                    }
                  >
                    <option value="">
                      Pilih Rumah
                    </option>

                    {houses.map(house => (
                      <option
                        key={house.id}
                        value={house.id}
                      >
                        {house.house_code}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Penghuni
                  </label>

                  <input
                    className="form-control"
                    disabled
                    value={
                      houses.find(
                        h =>
                          h.id ===
                          Number(form.house_id)
                      )?.current_resident
                        ?.full_name || ''
                    }
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">
                      Nominal
                    </label>

                    <input
                      type="number"
                      required
                      className="form-control"
                      value={form.amount}
                      onChange={e =>
                        setForm({
                          ...form,
                          amount:
                            e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Tanggal Bayar
                    </label>

                    <input
                      type="date"
                      required
                      className="form-control"
                      value={form.payment_date}
                      onChange={e =>
                        setForm({
                          ...form,
                          payment_date:
                            e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">
                      Tipe
                    </label>

                    <select
                      className="form-control"
                      value={form.type}
                      onChange={e =>
                        setForm({
                          ...form,
                          type:
                            e.target
                              .value as PaymentType,
                        })
                      }
                    >
                      <option value="kebersihan">
                        Kebersihan
                      </option>

                      <option value="satpam">
                        Satpam
                      </option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Bulan Iuran
                    </label>

                    <input
                      type="month"
                      className="form-control"
                      required
                      value={form.for_month}
                      onChange={e =>
                        setForm({
                          ...form,
                          for_month:
                            e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Status
                  </label>

                  <select
                    className="form-control"
                    value={form.status}
                    onChange={e =>
                      setForm({
                        ...form,
                        status:
                          e.target
                            .value as PaymentStatus,
                      })
                    }
                  >
                    <option value="belum">
                      Belum
                    </option>

                    <option value="lunas">
                      Lunas
                    </option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() =>
                    setShowModal(false)
                  }
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary"
                >
                  {saving
                    ? 'Menyimpan...'
                    : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div
          className="modal-overlay"
          onClick={e =>
            e.target === e.currentTarget &&
            setConfirmDelete(null)
          }
        >
          <div className="modal-box">
            <div className="modal-body">
              <div
                className="confirm-icon danger"
              >
                <AlertTriangle size={28} />
              </div>

              <h3
                style={{
                  textAlign: 'center',
                  marginBottom: 8,
                }}
              >
                Hapus Pembayaran?
              </h3>

              <p
                style={{
                  textAlign: 'center',
                  color:
                    'var(--text-muted)',
                }}
              >
                Data pembayaran ini akan
                dihapus permanen.
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
