import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Calendar,
  Wallet,
  ArrowUpCircle,
  ArrowDownCircle,
  Eye,
  X,
} from 'lucide-react';

import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

import {
  getReportSummary,
  getReportDetail,
} from '../services/reportService';

import {
  MonthlySummary,
  ReportDetail,
} from '../types/index';

import { formatCurrency, formatDate } from '../utils/index';

export default function Reports() {
  const currentYear = new Date().getFullYear();

  const [year, setYear] = useState(currentYear);

  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<MonthlySummary[]>([]);

  const [detailLoading, setDetailLoading] =
    useState(false);

  const [detail, setDetail] =
    useState<ReportDetail | null>(null);

  const [showDetailModal, setShowDetailModal] =
    useState(false);

  useEffect(() => {
    fetchSummary();
  }, [year]);

  const fetchSummary = async () => {
    try {
      setLoading(true);

      const response =
        await getReportSummary(year);

      setSummary(
        Array.isArray(response.data)
          ? response.data
          : response.data.data || []
      );
    } catch (error) {
      toast.error(
        'Gagal memuat data laporan'
      );
    } finally {
      setLoading(false);
    }
  };

  const openDetail = async (
    month: string
  ) => {
    try {
      setDetailLoading(true);

      const response =
        await getReportDetail(month);

      setDetail(response.data.data || response.data);

      setShowDetailModal(true);
    } catch (error) {
      toast.error(
        'Gagal memuat detail laporan'
      );
    } finally {
      setDetailLoading(false);
    }
  };

  const totalIncome = useMemo(
    () =>
      summary.reduce(
        (sum, item) => sum + item.income,
        0
      ),
    [summary]
  );

  const totalExpense = useMemo(
    () =>
      summary.reduce(
        (sum, item) => sum + item.expense,
        0
      ),
    [summary]
  );

  const totalBalance =
    totalIncome - totalExpense;

  const bestMonth = useMemo(() => {
    if (!summary.length) return '-';

    return [...summary].sort(
      (a, b) => b.balance - a.balance
    )[0].month;
  }, [summary]);

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
          <h1>Laporan Keuangan</h1>
          <p>
            Ringkasan pemasukan dan
            pengeluaran perumahan
          </p>
        </div>

        <div>
          <select
            className="form-control"
            value={year}
            onChange={e =>
              setYear(
                Number(e.target.value)
              )
            }
          >
            {Array.from(
              { length: 5 },
              (_, i) => currentYear - i
            ).map(y => (
              <option
                key={y}
                value={y}
              >
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <ArrowUpCircle size={22} />

          <div>
            <h3>Total Pemasukan</h3>

            <strong>
              {formatCurrency(
                totalIncome
              )}
            </strong>
          </div>
        </div>

        <div className="stat-card">
          <ArrowDownCircle size={22} />

          <div>
            <h3>Total Pengeluaran</h3>

            <strong>
              {formatCurrency(
                totalExpense
              )}
            </strong>
          </div>
        </div>

        <div className="stat-card">
          <Wallet size={22} />

          <div>
            <h3>Saldo</h3>

            <strong>
              {formatCurrency(
                totalBalance
              )}
            </strong>
          </div>
        </div>

        <div className="stat-card">
          <Calendar size={22} />

          <div>
            <h3>Bulan Terbaik</h3>

            <strong>
              {bestMonth}
            </strong>
          </div>
        </div>
      </div>

      <div
        className="card"
        style={{
          height: 420,
          padding: '1.5rem',
          marginBottom: '1.5rem',
        }}
      >
        <h3
          style={{
            marginBottom: '1rem',
          }}
        >
          Grafik Keuangan
        </h3>

        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <BarChart data={summary}>
            <CartesianGrid
              strokeDasharray="3 3"
            />

            <XAxis dataKey="month" />

            <YAxis />

            <Tooltip />

            <Legend />

            <Bar
              dataKey="income"
              name="Pemasukan"
            />

            <Bar
              dataKey="expense"
              name="Pengeluaran"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Bulan</th>
              <th>Pemasukan</th>
              <th>Pengeluaran</th>
              <th>Saldo</th>
              <th>Aksi</th>
            </tr>
          </thead>

          <tbody>
            {summary.map(item => (
              <tr key={item.month}>
                <td>{item.month}</td>

                <td>
                  {formatCurrency(
                    item.income
                  )}
                </td>

                <td>
                  {formatCurrency(
                    item.expense
                  )}
                </td>

                <td>
                  {formatCurrency(
                    item.balance
                  )}
                </td>

                <td>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() =>
                      openDetail(
                        item.month
                      )
                    }
                  >
                    <Eye size={16} />
                    Detail
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showDetailModal && detail && (
        <div
          className="modal-overlay"
          onClick={e =>
            e.target ===
              e.currentTarget &&
            setShowDetailModal(false)
          }
        >
          <div
            className="modal-box"
            style={{
              maxWidth: '1000px',
            }}
          >
            <div className="modal-header">
              <h2>
                Detail {detail.month}
              </h2>

              <button
                className="btn-icon"
                onClick={() =>
                  setShowDetailModal(false)
                }
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              {detailLoading ? (
                <div className="loading-center">
                  <div className="spinner" />
                </div>
              ) : (
                <>
                  <h3
                    style={{
                      marginBottom:
                        '1rem',
                    }}
                  >
                    Pembayaran
                  </h3>

                  <div
                    className="table-wrapper"
                    style={{
                      marginBottom:
                        '1.5rem',
                    }}
                  >
                    <table>
                      <thead>
                        <tr>
                          <th>Rumah</th>
                          <th>Warga</th>
                          <th>Tipe</th>
                          <th>Nominal</th>
                        </tr>
                      </thead>

                      <tbody>
                        {detail.incomes.map(
                          payment => (
                            <tr
                              key={
                                payment.id
                              }
                            >
                              <td>
                                {
                                  payment
                                    .house
                                    ?.house_code
                                }
                              </td>

                              <td>
                                {
                                  payment
                                    .resident
                                    ?.full_name
                                }
                              </td>

                              <td>
                                {
                                  payment.type
                                }
                              </td>

                              <td>
                                {formatCurrency(
                                  payment.amount
                                )}
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>

                  <h3
                    style={{
                      marginBottom:
                        '1rem',
                    }}
                  >
                    Pengeluaran
                  </h3>

                  <div className="table-wrapper">
                    <table>
                      <thead>
                        <tr>
                          <th>
                            Deskripsi
                          </th>
                          <th>Tipe</th>
                          <th>
                            Tanggal
                          </th>
                          <th>
                            Nominal
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {detail.expenses.map(
                          expense => (
                            <tr
                              key={
                                expense.id
                              }
                            >
                              <td>
                                {
                                  expense.description
                                }
                              </td>

                              <td>
                                {
                                  expense.type
                                }
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
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
