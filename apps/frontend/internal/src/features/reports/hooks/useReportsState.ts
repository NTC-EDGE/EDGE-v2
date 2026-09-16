import { useState, useMemo, useCallback } from 'react';
import { Platform } from 'react-native';
import {
  useAdminApplications,
  useTenantTransactions,
  useAdminFeedback,
  ApplicationSummaryDto,
  TenantTransactionDto,
  FeedbackDto,
} from '@edge/api';
import { useAuthContext } from '../../auth/context/AuthContext';

export type ReportType = 'applications' | 'financial' | 'compliance' | 'satisfaction';
export type TimeRangeFilter = '7d' | '30d' | '90d' | 'ytd' | 'all';
export type CategoryFilter = 'all' | 'Permits' | 'Licenses' | 'Accreditations' | 'Certificates' | 'Exams';

export interface CategoryBreakdown {
  category: string;
  count: number;
  percentage: number;
}

export function useReportsState() {
  const { user } = useAuthContext();
  const [reportType, setReportType] = useState<ReportType>('applications');
  const [timeRange, setTimeRange] = useState<TimeRangeFilter>('30d');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Live Applications Data
  const {
    applications,
    statistics,
    isLoading: loadingApps,
    refetch: refetchApps,
  } = useAdminApplications({
    scope: 'queue',
    pageSize: 100,
  });

  // Live Tenant Financial Transactions Data
  const {
    transactions,
    isLoading: loadingTx,
    refetch: refetchTx,
  } = useTenantTransactions(user?.tenantId, {
    pageSize: 100,
  });

  // Live Customer Satisfaction & Feedback Data
  const {
    feedback,
    isLoading: loadingFeedback,
    refetch: refetchFeedback,
  } = useAdminFeedback();

  const isLoading = loadingApps || loadingTx || loadingFeedback;

  const handleRefreshAll = useCallback(async () => {
    await Promise.allSettled([refetchApps(), refetchTx(), refetchFeedback()]);
  }, [refetchApps, refetchTx, refetchFeedback]);

  // Date Filter Predicate
  const isWithinTimeRange = useCallback((dateStr?: string | null): boolean => {
    if (dateStr === null || dateStr === undefined || dateStr.trim().length === 0) return true;
    if (timeRange === 'all') return true;

    try {
      const itemDate = new Date(dateStr).getTime();
      const now = Date.now();
      const diffDays = (now - itemDate) / (1000 * 60 * 60 * 24);

      if (timeRange === '7d') return diffDays <= 7;
      if (timeRange === '30d') return diffDays <= 30;
      if (timeRange === '90d') return diffDays <= 90;
      if (timeRange === 'ytd') {
        const currentYear = new Date().getFullYear();
        return new Date(dateStr).getFullYear() === currentYear;
      }
    } catch {
      return true;
    }
    return true;
  }, [timeRange]);

  // Filtered Applications
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      if (!isWithinTimeRange(app.createdAt)) return false;

      if (categoryFilter !== 'all') {
        const cat = app.serviceCategory ?? app.serviceName ?? '';
        if (!cat.toLowerCase().includes(categoryFilter.toLowerCase())) {
          return false;
        }
      }

      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase().trim();
        const appNum = (app.applicationNumber ?? '').toLowerCase();
        const refNum = (app.referenceNumber ?? '').toLowerCase();
        const applicantName = (app.filingUser?.name ?? app.filingUser?.company?.name ?? '').toLowerCase();
        const service = (app.serviceName ?? app.serviceCategory ?? '').toLowerCase();

        if (!appNum.includes(q) && !refNum.includes(q) && !applicantName.includes(q) && !service.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [applications, isWithinTimeRange, categoryFilter, searchQuery]);

  // Filtered Financial Transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      if (!isWithinTimeRange(tx.date)) return false;

      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase().trim();
        const ref = (tx.refNo ?? '').toLowerCase();
        const name = (tx.applicantName ?? '').toLowerCase();
        const sType = (tx.serviceType ?? '').toLowerCase();

        if (!ref.includes(q) && !name.includes(q) && !sType.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [transactions, isWithinTimeRange, searchQuery]);

  // Filtered Feedback
  const filteredFeedback = useMemo(() => {
    return feedback.filter((fb) => {
      if (!isWithinTimeRange(fb.createdAt)) return false;

      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase().trim();
        const sender = (fb.senderName ?? '').toLowerCase();
        const subject = (fb.subject ?? '').toLowerCase();
        const msg = (fb.message ?? '').toLowerCase();

        if (!sender.includes(q) && !subject.includes(q) && !msg.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [feedback, isWithinTimeRange, searchQuery]);

  // Category Breakdown Statistics
  const categoryBreakdown: CategoryBreakdown[] = useMemo(() => {
    const counts: Record<string, number> = {
      Permits: 0,
      Licenses: 0,
      Accreditations: 0,
      Certificates: 0,
      Exams: 0,
    };

    let total = 0;
    for (const app of filteredApplications) {
      const catName = app.serviceCategory ?? app.serviceName ?? 'Permits';
      let assigned = false;
      for (const key of Object.keys(counts)) {
        if (catName.toLowerCase().includes(key.toLowerCase())) {
          counts[key] = (counts[key] ?? 0) + 1;
          total += 1;
          assigned = true;
          break;
        }
      }
      if (!assigned) {
        counts.Permits = (counts.Permits ?? 0) + 1;
        total += 1;
      }
    }

    const safeTotal = Math.max(total, 1);
    return Object.entries(counts).map(([category, count]) => ({
      category,
      count,
      percentage: Math.round((count / safeTotal) * 100),
    }));
  }, [filteredApplications]);

  // Key KPI Aggregates
  const stats = useMemo(() => {
    const totalApps = filteredApplications.length;
    const approvedCount = filteredApplications.filter((a) => a.status === 'Approved').length;
    const evaluatingCount = filteredApplications.filter((a) => a.status === 'Evaluating' || a.status === 'Submitted').length;
    const returnedCount = filteredApplications.filter((a) => a.status === 'Returned').length;
    const completedCount = filteredApplications.filter((a) => a.status === 'Completed').length;

    const approvalRate = totalApps > 0 ? Math.round((approvedCount / totalApps) * 100) : 100;

    const totalCollected = filteredTransactions.reduce((sum, tx) => {
      return tx.paymentStatus === 'Paid' ? sum + (tx.amount ?? 0) : sum;
    }, 0);

    const totalInvoiced = filteredTransactions.reduce((sum, tx) => {
      return sum + (tx.amount ?? 0);
    }, 0);

    const outstandingBalance = Math.max(0, totalInvoiced - totalCollected);

    const csatTotal = filteredFeedback.length;
    const avgCsat = csatTotal > 0
      ? (filteredFeedback.reduce((sum, fb) => sum + fb.rating, 0) / csatTotal).toFixed(1)
      : '5.0';

    return {
      totalApps,
      approvedCount,
      evaluatingCount,
      returnedCount,
      completedCount,
      approvalRate,
      totalCollected,
      totalInvoiced,
      outstandingBalance,
      csatTotal,
      avgCsat,
    };
  }, [filteredApplications, filteredTransactions, filteredFeedback]);

  // Dynamic Active Total Items & Total Pages
  const activeItemCount = useMemo(() => {
    if (reportType === 'applications' || reportType === 'compliance') {
      return filteredApplications.length;
    }
    if (reportType === 'financial') {
      return filteredTransactions.length;
    }
    return filteredFeedback.length;
  }, [reportType, filteredApplications.length, filteredTransactions.length, filteredFeedback.length]);

  const totalPages = Math.max(1, Math.ceil(activeItemCount / pageSize));

  // Paginated Rows
  const paginatedApplications = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredApplications.slice(start, start + pageSize);
  }, [filteredApplications, currentPage, pageSize]);

  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTransactions.slice(start, start + pageSize);
  }, [filteredTransactions, currentPage, pageSize]);

  const paginatedFeedback = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredFeedback.slice(start, start + pageSize);
  }, [filteredFeedback, currentPage, pageSize]);

  // CSV Export Generator
  const exportCsv = useCallback(() => {
    let csvContent = '';
    let fileName = `NTC_EDGE_Report_${new Date().toISOString().slice(0, 10)}.csv`;

    if (reportType === 'applications' || reportType === 'compliance') {
      fileName = `NTC_Applications_Report_${new Date().toISOString().slice(0, 10)}.csv`;
      csvContent = 'Application ID,Reference No,Applicant,Service Category,Service Name,Status,Submission Date\n';
      for (const app of filteredApplications) {
        const id = `"${app.applicationNumber ?? app.id}"`;
        const ref = `"${app.referenceNumber ?? ''}"`;
        const applicant = `"${(app.filingUser?.name ?? app.filingUser?.company?.name ?? 'Applicant').replace(/"/g, '""')}"`;
        const cat = `"${(app.serviceCategory ?? 'General').replace(/"/g, '""')}"`;
        const svc = `"${(app.serviceName ?? 'Permit Service').replace(/"/g, '""')}"`;
        const status = `"${app.status ?? 'Submitted'}"`;
        const date = `"${app.createdAt ?? ''}"`;
        csvContent += `${id},${ref},${applicant},${cat},${svc},${status},${date}\n`;
      }
    } else if (reportType === 'financial') {
      fileName = `NTC_Financial_Report_${new Date().toISOString().slice(0, 10)}.csv`;
      csvContent = 'Reference No,Applicant Name,Service Type,Amount,Payment Status,Date\n';
      for (const tx of filteredTransactions) {
        const ref = `"${tx.refNo ?? ''}"`;
        const name = `"${(tx.applicantName ?? '').replace(/"/g, '""')}"`;
        const svc = `"${(tx.serviceType ?? '').replace(/"/g, '""')}"`;
        const amt = tx.amount ?? 0;
        const status = `"${tx.paymentStatus ?? ''}"`;
        const date = `"${tx.date ?? ''}"`;
        csvContent += `${ref},${name},${svc},${amt},${status},${date}\n`;
      }
    } else {
      fileName = `NTC_Customer_Satisfaction_Report_${new Date().toISOString().slice(0, 10)}.csv`;
      csvContent = 'Sender Name,Sender Email,Subject,Rating,Anonymous,Message,Date\n';
      for (const fb of filteredFeedback) {
        const name = `"${(fb.senderName ?? '').replace(/"/g, '""')}"`;
        const email = `"${(fb.senderEmail ?? '').replace(/"/g, '""')}"`;
        const subject = `"${(fb.subject ?? '').replace(/"/g, '""')}"`;
        const rating = fb.rating;
        const anon = fb.isAnonymous ? 'Yes' : 'No';
        const msg = `"${(fb.message ?? '').replace(/"/g, '""')}"`;
        const date = `"${fb.createdAt ?? ''}"`;
        csvContent += `${name},${email},${subject},${rating},${anon},${msg},${date}\n`;
      }
    }

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }, [reportType, filteredApplications, filteredTransactions, filteredFeedback]);

  return {
    reportType,
    setReportType,
    timeRange,
    setTimeRange,
    categoryFilter,
    setCategoryFilter,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    pageSize,
    totalPages,
    activeItemCount,
    filteredApplications,
    paginatedApplications,
    filteredTransactions,
    paginatedTransactions,
    filteredFeedback,
    paginatedFeedback,
    categoryBreakdown,
    stats,
    isLoading,
    handleRefreshAll,
    exportCsv,
  };
}
