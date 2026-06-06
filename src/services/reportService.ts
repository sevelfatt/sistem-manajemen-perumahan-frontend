import api from '../lib/api';

export const getReportSummary = (year: number) => api.get(`/reports/summary?year=${year}`);
export const getReportDetail = (yearMonth: string) => api.get(`/reports/detail/${yearMonth}`);
