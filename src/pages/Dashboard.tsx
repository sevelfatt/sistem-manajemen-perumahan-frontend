import { useEffect, useState } from 'react';
import { Users, Home, CreditCard, TrendingDown, TrendingUp, Activity } from 'lucide-react';
import { getResidents } from '../services/residentService';
import { getHouses } from '../services/houseService';
import { getPayments } from '../services/paymentService';
import { getExpenses } from '../services/expenseService';
import type { Resident, House, Payment, Expense } from '../types';

const fmt = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

const today = new Date();
const thisMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
const monthLabel = today.toLocaleString('id-ID', { month: 'long', year: 'numeric' });

export default function Dashboard() {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [houses, setHouses] = useState<House[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getResidents(), getHouses(), getPayments(), getExpenses()])
      .then(([r, h, p, e]) => {
        setResidents(r.data);
        setHouses(h.data);
        setPayments(p.data);
        setExpenses(e.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const occupied = houses.filter(h => h.status === 'dihuni').length;
  const vacant   = houses.filter(h => h.status === 'tidak_dihuni').length;

  const thisMonthPayments = payments.filter(p => p.for_month === thisMonth);
  const totalIncome  = thisMonthPayments.filter(p => p.status === 'lunas').reduce((s, p) => s + parseFloat(String(p.amount)), 0);
  const unpaid       = thisMonthPayments.filter(p => p.status === 'belum').length;

  const thisMonthExpenses = expenses.filter(e => e.expense_date.startsWith(thisMonth));
  const totalExpense = thisMonthExpenses.reduce((s, e) => s + parseFloat(String(e.amount)), 0);
  const balance = totalIncome - totalExpense;

  const recentPayments = [...payments]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 6);

  if (loading) {
    return (
      <div className="loading-center">
        <div className="spinner" />
        <span>Memuat data...</span>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-title">Dashboard</div>
          <div className="page-subtitle">Ringkasan administrasi perumahan — {monthLabel}</div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon green"><Users size={22} /></div>
          <div>
            <div className="stat-label">Total Penghuni</div>
            <div className="stat-value">{residents.length}</div>
            <div className="stat-sub">Tetap: {residents.filter(r => r.status === 'tetap').length} | Kontrak: {residents.filter(r => r.status === 'kontrak').length}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon blue"><Home size={22} /></div>
          <div>
            <div className="stat-label">Total Rumah</div>
            <div className="stat-value">{houses.length}</div>
            <div className="stat-sub">Dihuni: {occupied} | Kosong: {vacant}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green"><TrendingUp size={22} /></div>
          <div>
            <div className="stat-label">Pemasukan Bulan Ini</div>
            <div className="stat-value" style={{ fontSize: 16 }}>{fmt(totalIncome)}</div>
            <div className="stat-sub">{unpaid} tagihan belum lunas</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon red"><TrendingDown size={22} /></div>
          <div>
            <div className="stat-label">Pengeluaran Bulan Ini</div>
            <div className="stat-value" style={{ fontSize: 16 }}>{fmt(totalExpense)}</div>
            <div className="stat-sub">{thisMonthExpenses.length} transaksi</div>
          </div>
        </div>

        <div className="stat-card" style={{ gridColumn: 'span 2' }}>
          <div className="stat-icon" style={{ background: balance >= 0 ? 'var(--accent-muted)' : 'var(--danger-muted)', color: balance >= 0 ? 'var(--accent)' : 'var(--danger)' }}>
            <Activity size={22} />
          </div>
          <div>
            <div className="stat-label">Saldo Bulan Ini</div>
            <div className="stat-value" style={{ fontSize: 20, color: balance >= 0 ? 'var(--accent-light)' : 'var(--danger)' }}>
              {fmt(balance)}
            </div>
            <div className="stat-sub">Pemasukan – Pengeluaran</div>
          </div>
        </div>
      </div>

      {/* Two-column */}
      <div className="cards-grid-2">
        {/* House status */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="fw-700" style={{ fontSize: 15 }}>Status Rumah</div>
            <span className="badge badge-blue">{houses.length} Total</span>
          </div>
          {houses.slice(0, 8).map(h => (
            <div key={h.id} className="flex items-center justify-between" style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <div>
                <span className="fw-600" style={{ color: 'var(--text-primary)' }}>{h.house_code}</span>
                {h.current_resident && (
                  <span className="text-muted" style={{ marginLeft: 10 }}>{h.current_resident.full_name}</span>
                )}
              </div>
              <span className={`badge ${h.status === 'dihuni' ? 'badge-green' : 'badge-gray'}`}>
                {h.status === 'dihuni' ? 'Dihuni' : 'Kosong'}
              </span>
            </div>
          ))}
          {houses.length > 8 && <div className="text-muted mt-2">+{houses.length - 8} rumah lainnya</div>}
        </div>

        {/* Recent payments */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="fw-700" style={{ fontSize: 15 }}>Pembayaran Terbaru</div>
            <span className="badge badge-green">{payments.length} Total</span>
          </div>
          {recentPayments.length === 0 ? (
            <div className="text-muted">Belum ada data pembayaran.</div>
          ) : recentPayments.map(p => (
            <div key={p.id} className="flex items-center justify-between" style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13 }}>
                  {p.resident?.full_name ?? '—'}
                </div>
                <div className="text-muted" style={{ fontSize: 12 }}>
                  {p.house?.house_code} &bull; {p.type === 'kebersihan' ? 'Kebersihan' : 'Satpam'} &bull; {p.for_month}
                </div>
              </div>
              <span className={`badge ${p.status === 'lunas' ? 'badge-green' : 'badge-amber'}`}>
                {p.status === 'lunas' ? 'Lunas' : 'Belum'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
