export const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);

export const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('id-ID');