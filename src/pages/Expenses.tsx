
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Receipt,
  X,
} from 'lucide-react';

import {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
} from '../services/expenseService';

import { Expense, ExpenseType } from '../types/index';
import { formatCurrency, formatDate } from '../utils/index';

interface ExpenseForm {
  description: string;
  amount: number;
  expense_date: string;
  type: ExpenseType;
}

const defaultForm: ExpenseForm = {
  description: '',
  amount: 0,
  expense_date: new Date().toISOString().split('T')[0],
  type: 'rutin',
};

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [form, setForm] = useState<ExpenseForm>(defaultForm);

  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);

      const response = await getExpenses();

      setExpenses(
        Array.isArray(response.data)
          ? response.data
          : response.data.data || []
      );
    } catch (error) {
      toast.error('Gagal memuat data pengeluaran');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      const matchesSearch =
        expense.description
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesType =
        !typeFilter || expense.type === typeFilter;

      const matchesMonth =
        !monthFilter ||
        expense.expense_date.startsWith(monthFilter);

      return (
        matchesSearch &&
        matchesType &&
        matchesMonth
      );
    });
  }, [expenses, search, typeFilter, monthFilter]);

  const totalExpense = useMemo(() => {
    return filteredExpenses.reduce(
      (sum, item) => sum + Number(item.amount),
      0
    );
  }, [filteredExpenses]);

  const openCreateModal = () => {
    setEditingExpense(null);
    setForm(defaultForm);
    setShowModal(true);
  };

  const openEditModal = (expense: Expense) => {
    setEditingExpense(expense);

    setForm({
      description: expense.description,
      amount: Number(expense.amount),
      expense_date: expense.expense_date.slice(0, 10),
      type: expense.type,
    });

    setShowModal(true);
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    try {
      if (editingExpense) {
        await updateExpense(editingExpense.id, form);

        toast.success(
          'Pengeluaran berhasil diperbarui'
        );
      } else {
        await createExpense(form);

        toast.success(
          'Pengeluaran berhasil ditambahkan'
        );
      }

      setShowModal(false);
      fetchExpenses();
    } catch (error) {
      toast.error('Gagal menyimpan data');
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (!expenseToDelete) return;

    try {
      await deleteExpense(expenseToDelete.id);

      toast.success(
        'Pengeluaran berhasil dihapus'
      );

      setExpenseToDelete(null);
      fetchExpenses();
    } catch (error) {
      toast.error('Gagal menghapus pengeluaran');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="loading-center">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Pengeluaran</h1>
          <p>
            Kelola seluruh pengeluaran
            perumahan
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={openCreateModal}
        >
          <Plus size={18} />
          Tambah Pengeluaran
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <Receipt size={22} />

          <div>
            <h3>Total Pengeluaran</h3>
            <strong>
              {formatCurrency(totalExpense)}
            </strong>
          </div>
        </div>
      </div>

      <div className="filter-bar">
        <div className="search-box">
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />

          <input
          className='form-control'
            type="text"
            placeholder="Cari deskripsi..."
            value={search}
            onChange={e =>
              setSearch(e.target.value)
            }
          />
        </div>

        <select
          value={typeFilter}
          className='form-control'
          onChange={e =>
            setTypeFilter(e.target.value)
          }
        >
          <option value="">
            Semua Tipe
          </option>
          <option value="rutin">
            Rutin
          </option>
          <option value="insidental">
            Insidental
          </option>
        </select>

        <input
          type="month"
          value={monthFilter}
          className='form-control'
          onChange={e =>
            setMonthFilter(e.target.value)
          }
        />
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Deskripsi</th>
              <th>Tipe</th>
              <th>Tanggal</th>
              <th>Nominal</th>
              <th>Aksi</th>
            </tr>
          </thead>

          <tbody>
            {filteredExpenses.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  style={{
                    textAlign: 'center',
                    padding: '2rem',
                  }}
                >
                  Tidak ada data
                </td>
              </tr>
            ) : (
              filteredExpenses.map(expense => (
                <tr key={expense.id}>
                  <td>
                    {expense.description}
                  </td>

                  <td>
                    <span
                      className={
                        expense.type ===
                        'rutin'
                          ? 'badge-blue'
                          : 'badge-amber'
                      }
                    >
                      {expense.type}
                    </span>
                  </td>

                  <td>
                    {formatDate(
                      expense.expense_date
                    )}
                  </td>

                  <td>
                    {formatCurrency(
                      expense.amount
                    )}
                  </td>

                  <td>
                    <div
                      style={{
                        display: 'flex',
                        gap: '0.5rem',
                      }}
                    >
                      <button
                        className="btn-icon"
                        onClick={() =>
                          openEditModal(
                            expense
                          )
                        }
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        className="btn-icon"
                        onClick={() =>
                          setExpenseToDelete(
                            expense
                          )
                        }
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div
          className="modal-overlay"
          onClick={e =>
            e.target ===
              e.currentTarget &&
            setShowModal(false)
          }
        >
          <div className="modal-box">
            <div className="modal-header">
              <h2>
                {editingExpense
                  ? 'Edit Pengeluaran'
                  : 'Tambah Pengeluaran'}
              </h2>

              <button
                className="btn-icon"
                onClick={() =>
                  setShowModal(false)
                }
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
            >
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">
                    Deskripsi
                  </label>

                  <textarea
                    className="form-control"
                    rows={3}
                    required
                    value={
                      form.description
                    }
                    onChange={e =>
                      setForm({
                        ...form,
                        description:
                          e.target.value,
                      })
                    }
                  />
                </div>

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
                            .value as ExpenseType,
                      })
                    }
                  >
                    <option value="rutin">
                      Rutin
                    </option>

                    <option value="insidental">
                      Insidental
                    </option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Nominal
                  </label>

                  <input
                    type="number"
                    className="form-control"
                    min={0}
                    required
                    value={form.amount}
                    onChange={e =>
                      setForm({
                        ...form,
                        amount:
                          Number(
                            e.target
                              .value
                          ),
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Tanggal
                  </label>

                  <input
                    type="date"
                    className="form-control"
                    required
                    value={
                      form.expense_date
                    }
                    onChange={e =>
                      setForm({
                        ...form,
                        expense_date:
                          e.target.value,
                      })
                    }
                  />
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
                  className="btn btn-primary"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {expenseToDelete && (
        <div
          className="modal-overlay"
          onClick={() =>
            setExpenseToDelete(null)
          }
        >
          <div
            className="modal-box"
            onClick={e =>
              e.stopPropagation()
            }
          >
            <div className="modal-body">
              <div className="confirm-icon danger">
                <Trash2 size={24} />
              </div>

              <h3>
                Hapus Pengeluaran?
              </h3>

              <p>
                Data pengeluaran ini akan
                dihapus secara permanen.
              </p>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() =>
                  setExpenseToDelete(null)
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
    </>
  );
}
