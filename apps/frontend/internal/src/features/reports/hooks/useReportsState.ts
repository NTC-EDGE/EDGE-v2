import { useState, useMemo, useCallback } from 'react';
import { Platform } from 'react-native';
import {
  useAdminApplications,
  useTenantTransactions,
  useAdminFeedback,
  useOperationalReportStatistics,
  useOfficialReceipts,
  useBankDeposits,
  useTenants,
  useAdminFieldOffices,
  ApplicationSummaryDto,
  TenantTransactionDto,
  FeedbackDto,
} from '@edge/api';
import { useAuthContext } from '../../auth/context/AuthContext';

import {
  StatutoryReportCode,
  StatutoryReportMetadata,
} from '../types/statutoryReports';
import {
  STATUTORY_REPORTS_LIST,
  generateStatutoryCsv,
  downloadCsvFile,
  generateStatutoryPrintableHtml,
  openPrintableReportWindow,
  getPaidTransactions,
  resolveEvaluatorName,
  resolveServiceName,
  resolveEntityName,
  filterApplicationsForStatutoryReport,
} from '../utils/statutoryReportGenerator';

export type ReportType = 'applications' | 'financial' | 'compliance' | 'satisfaction' | 'statutory';
export type PeriodMode = 'monthly' | 'quarterly' | 'yearly' | 'rolling' | 'custom';
export type TimeRangeFilter = '7d' | '30d' | '90d' | 'ytd' | 'all';
export type CategoryFilter = 'all' | 'Permits' | 'Licenses' | 'Accreditations' | 'Certificates' | 'Exams';
export type StatutoryPeriod = 'Q1 2026' | 'Q2 2026' | 'Q3 2026' | 'Q4 2026' | 'Annual 2026';

export interface CategoryBreakdown {
  category: string;
  count: number;
  percentage: number;
}

export interface PeriodicStatBucket {
  id: string;
  label: string;
  shortLabel: string;
  totalApplications: number;
  approvedCount: number;
  evaluatingCount: number;
  returnedCount: number;
  approvalRate: number;
  totalRevenue: number;
  feedbackCount: number;
  avgCsat: string;
}

export interface FieldOfficeFilterOption {
  id: string;
  name: string;
  code: string;
  category: string;
  isMainOffice: boolean;
  applicationCount: number;
}

export function useReportsState() {
  const { user } = useAuthContext();
  const [reportType, setReportType] = useState<ReportType>('statutory');
  const [periodMode, setPeriodMode] = useState<PeriodMode>('yearly');
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedQuarter, setSelectedQuarter] = useState<number>(1);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [timeRange, setTimeRange] = useState<TimeRangeFilter>('ytd');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [selectedPeriodState, setSelectedPeriodState] = useState<StatutoryPeriod>('Annual 2026');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState<string>('2026-01-01');
  const [endDate, setEndDate] = useState<string>('2026-12-31');
  const [selectedEvaluatorId, setSelectedEvaluatorId] = useState<string | undefined>(undefined);
  const [selectedServiceId, setSelectedServiceId] = useState<string | undefined>(undefined);
  const [selectedApplicantId, setSelectedApplicantId] = useState<string | undefined>(undefined);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | undefined>(undefined);
  const [selectedFieldOffices, setSelectedFieldOffices] = useState<string[]>([]);

  const setSelectedPeriod = useCallback((period: StatutoryPeriod) => {
    setSelectedPeriodState(period);
    if (period === 'Q1 2026') {
      setPeriodMode('quarterly');
      setSelectedYear(2026);
      setSelectedQuarter(1);
      setStartDate('2026-01-01');
      setEndDate('2026-03-31');
    } else if (period === 'Q2 2026') {
      setPeriodMode('quarterly');
      setSelectedYear(2026);
      setSelectedQuarter(2);
      setStartDate('2026-04-01');
      setEndDate('2026-06-30');
    } else if (period === 'Q3 2026') {
      setPeriodMode('quarterly');
      setSelectedYear(2026);
      setSelectedQuarter(3);
      setStartDate('2026-07-01');
      setEndDate('2026-09-30');
    } else if (period === 'Q4 2026') {
      setPeriodMode('quarterly');
      setSelectedYear(2026);
      setSelectedQuarter(4);
      setStartDate('2026-10-01');
      setEndDate('2026-12-31');
    } else {
      setPeriodMode('yearly');
      setSelectedYear(2026);
      setSelectedQuarter(1);
      setStartDate('2026-01-01');
      setEndDate('2026-12-31');
    }
  }, []);

  const selectedPeriod = selectedPeriodState;

  const [statutoryModal, setStatutoryModal] = useState<{
    visible: boolean;
    report: StatutoryReportMetadata | null;
  }>({
    visible: false,
    report: null,
  });
  const pageSize = 10;

  const fieldOfficesQueryParam = useMemo(() => {
    if (selectedFieldOffices.length === 0) return undefined;
    return selectedFieldOffices.join(',');
  }, [selectedFieldOffices]);

  // Server-Aggregated Operational Reports Statistics (Single Source of Truth)
  const {
    data: serverStats,
    isLoading: loadingServerStats,
    refetch: refetchServerStats,
  } = useOperationalReportStatistics({
    tenantId: user?.tenantId,
    periodMode,
    startDate: periodMode === 'custom' ? startDate : undefined,
    endDate: periodMode === 'custom' ? endDate : undefined,
    year: selectedYear,
    quarter: selectedQuarter,
    month: selectedMonth + 1,
    category: categoryFilter !== 'all' ? categoryFilter : undefined,
    fieldOffices: fieldOfficesQueryParam,
  });

  // Live Field Offices of the authenticated tenant (for monitoring filter)
  const {
    fieldOffices: adminFieldOffices,
    refetch: refetchFieldOffices,
  } = useAdminFieldOffices(user?.tenantId ?? undefined);

  // Live Applications Data (Filtered strictly by authenticated tenant and regional scope)
  const {
    applications,
    statistics,
    isLoading: loadingApps,
    refetch: refetchApps,
  } = useAdminApplications({
    tenantId: user?.tenantId,
    scope: 'region',
    pageSize: 500,
  });

  // Live Tenant Financial Transactions Data (for tabular inspection)
  const {
    transactions,
    isLoading: loadingTx,
    refetch: refetchTx,
  } = useTenantTransactions(user?.tenantId, {
    pageSize: 500,
  });

  // Live Official Receipts Data (Cashier collections)
  const {
    receipts: officialReceipts,
    isLoading: loadingReceipts,
    mutate: refetchReceipts,
  } = useOfficialReceipts({
    tenantId: user?.tenantId,
  });

  // Live Bank Deposits Data (AGDB / BTr remittances)
  const {
    deposits: bankDeposits,
    isLoading: loadingDeposits,
    mutate: refetchDeposits,
  } = useBankDeposits({
    tenantId: user?.tenantId,
  });

  // Live Tenants list to resolve display name accurately
  const { tenants: allTenants } = useTenants();

  // Live Customer Satisfaction & Feedback Data (for tabular inspection)
  const {
    feedback,
    isLoading: loadingFeedback,
    refetch: refetchFeedback,
  } = useAdminFeedback();

  const isLoading =
    (loadingServerStats && applications.length === 0) ||
    loadingApps ||
    loadingTx ||
    loadingFeedback ||
    loadingReceipts ||
    loadingDeposits;

  const tenantDisplayName = useMemo(() => {
    if (user?.tenantId && allTenants.length > 0) {
      const matched = allTenants.find((t) => t.id === user.tenantId);
      if (matched?.name) return matched.name;
    }
    if (serverStats?.tenantDisplayName && !serverStats.tenantDisplayName.includes('(')) {
      return serverStats.tenantDisplayName;
    }
    if (serverStats?.tenantDisplayName) {
      return serverStats.tenantDisplayName;
    }
    if (user?.tenantId) {
      return `NTC Regional Office (${user.tenantId.toUpperCase().slice(0, 8)})`;
    }
    return 'National Telecommunications Commission - Central Office';
  }, [allTenants, serverStats?.tenantDisplayName, user?.tenantId]);

  const handleRefreshAll = useCallback(async () => {
    await Promise.allSettled([
      refetchServerStats(),
      refetchApps(),
      refetchTx(),
      refetchReceipts(),
      refetchDeposits(),
      refetchFeedback(),
      refetchFieldOffices(),
    ]);
  }, [refetchServerStats, refetchApps, refetchTx, refetchReceipts, refetchDeposits, refetchFeedback, refetchFieldOffices]);

  // Unified Transactions combining TenantTransactions, OfficialReceipts, and Paid Applications
  const unifiedTransactions = useMemo(() => {
    const merged: TenantTransactionDto[] = [];
    const seenRefs = new Set<string>();
    const seenAppIds = new Set<string>();

    for (const r of officialReceipts) {
      if (r.status === 'Cancelled') continue;
      const ref = (r.officialReceiptNumber ?? '').trim();
      if (ref.length > 0) seenRefs.add(ref.toUpperCase());
      if (r.applicationId) seenAppIds.add(r.applicationId);
      const lineSummary =
        r.lineItems && r.lineItems.length > 0
          ? r.lineItems.map((li) => `${li.description} (${li.feeCode})`).join('; ')
          : r.remarks ?? 'Official Receipt Collection';

      merged.push({
        id: r.applicationId ?? r.id,
        refNo: ref || `OR-${r.id.slice(0, 8).toUpperCase()}`,
        applicantName: r.payorName || 'Payor',
        serviceType: lineSummary,
        amount: r.amount ?? 0,
        paymentStatus: r.status === 'Deposited' || r.depositId ? 'Deposited' : 'Paid',
        date: r.issuedAt,
      });
    }

    for (const tx of transactions) {
      const ref = (tx.refNo ?? '').trim();
      if (ref.length > 0 && seenRefs.has(ref.toUpperCase())) continue;
      if ((tx.amount ?? 0) <= 0 && ref.toUpperCase().startsWith('APP-')) continue;
      if (ref.length > 0) seenRefs.add(ref.toUpperCase());
      if (tx.id) seenAppIds.add(tx.id);
      merged.push(tx);
    }

    for (const app of applications) {
      if (seenAppIds.has(app.id)) continue;
      const orNum = (app.officialReceiptNumber ?? app.issuedDocumentDetails?.[0]?.officialReceiptNumber ?? '').trim();
      const isPaidApp =
        orNum.length > 0 ||
        (app.amountPaid ?? 0) > 0 ||
        app.opStatus === 'Paid' ||
        app.status === 'ForIssuance' ||
        app.status === 'Approved' ||
        app.status === 'Completed';
      const paidAmt = app.amountPaid ?? (isPaidApp ? (app.totalAmountDue ?? 0) : 0);
      const effectiveRef =
        orNum.length > 0
          ? orNum
          : (app.opNumber ?? app.soaNumber ?? app.applicationNumber ?? app.referenceNumber ?? '').trim();

      if (isPaidApp && paidAmt > 0 && effectiveRef.length > 0 && !seenRefs.has(effectiveRef.toUpperCase())) {
        seenRefs.add(effectiveRef.toUpperCase());
        seenAppIds.add(app.id);
        merged.push({
          id: app.id,
          refNo: effectiveRef,
          applicantName:
            app.filingUser?.company?.name ??
            app.filingUser?.name ??
            app.applicants?.[0]?.name ??
            'Applicant',
          serviceType: app.serviceName ?? app.serviceCategory ?? 'Regulatory Permit Fee',
          amount: paidAmt,
          paymentStatus: 'Paid',
          date: app.paidAt ?? app.updatedAt ?? app.createdAt,
        });
      }
    }

    return merged.sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));
  }, [officialReceipts, transactions, applications]);

  // Date Filter Predicate based on Period Mode & Custom Date Range
  const isWithinTimeRange = useCallback((dateStr?: string | null): boolean => {
    if (dateStr === null || dateStr === undefined || dateStr.trim().length === 0) return true;

    try {
      const itemDate = new Date(dateStr);
      if (isNaN(itemDate.getTime())) return true;

      if (periodMode === 'custom') {
        if (startDate.length > 0) {
          const s = new Date(startDate);
          s.setHours(0, 0, 0, 0);
          if (itemDate < s) return false;
        }
        if (endDate.length > 0) {
          const e = new Date(endDate);
          e.setHours(23, 59, 59, 999);
          if (itemDate > e) return false;
        }
        return true;
      }

      if (periodMode === 'monthly') {
        return itemDate.getFullYear() === selectedYear && itemDate.getMonth() === selectedMonth;
      }

      if (periodMode === 'quarterly') {
        const itemQuarter = Math.floor(itemDate.getMonth() / 3) + 1;
        return itemDate.getFullYear() === selectedYear && itemQuarter === selectedQuarter;
      }

      if (periodMode === 'yearly') {
        return itemDate.getFullYear() === selectedYear;
      }

      // Rolling Mode
      if (timeRange === 'all') return true;
      const now = Date.now();
      const diffDays = (now - itemDate.getTime()) / (1000 * 60 * 60 * 24);

      if (timeRange === '7d') return diffDays <= 7;
      if (timeRange === '30d') return diffDays <= 30;
      if (timeRange === '90d') return diffDays <= 90;
      if (timeRange === 'ytd') {
        const currentYear = new Date().getFullYear();
        return itemDate.getFullYear() === currentYear;
      }
    } catch {
      return true;
    }
    return true;
  }, [periodMode, startDate, endDate, selectedYear, selectedQuarter, selectedMonth, timeRange]);

  // Build Tenant Field Offices list (for checkbox monitoring filter)
  const fieldOfficeOptions = useMemo<FieldOfficeFilterOption[]>(() => {
    const map = new Map<string, FieldOfficeFilterOption>();

    const registerOffice = (item: {
      id?: string;
      name?: string | null;
      code?: string | null;
      category?: string | null;
    }) => {
      const rawName = (item.name ?? '').trim();
      if (rawName.length === 0) return;
      const key = rawName.toLowerCase();
      if (map.has(key)) return;

      const catStr = (item.category ?? '').trim();
      const isMain =
        catStr.toLowerCase().includes('main') ||
        rawName.toLowerCase().includes('main office') ||
        rawName.toLowerCase() === tenantDisplayName.toLowerCase();

      map.set(key, {
        id: item.id ?? rawName,
        name: rawName,
        code: (item.code ?? '').trim(),
        category: catStr || (isMain ? 'MainOffice' : 'FieldOffice'),
        isMainOffice: isMain,
        applicationCount: 0,
      });
    };

    for (const fo of adminFieldOffices) {
      registerOffice({
        id: fo.id,
        name: fo.name,
        code: fo.code,
        category: fo.category,
      });
    }

    if (serverStats?.fieldOffices) {
      for (const fo of serverStats.fieldOffices) {
        registerOffice({
          id: fo.id,
          name: fo.name,
          code: fo.code,
          category: fo.category,
        });
      }
    }

    for (const app of applications) {
      const appOff = (app.office ?? '').trim();
      if (appOff.length > 0 && appOff.toLowerCase() !== tenantDisplayName.toLowerCase()) {
        const alreadyCovered = Array.from(map.values()).some(
          (o) =>
            o.name.toLowerCase() === appOff.toLowerCase() ||
            (o.code.length > 0 && o.code.toLowerCase() === appOff.toLowerCase()) ||
            (o.isMainOffice && appOff.toLowerCase().includes('main office'))
        );
        if (!alreadyCovered) {
          registerOffice({
            id: appOff,
            name: appOff,
            code: '',
            category: appOff.toLowerCase().includes('main') ? 'MainOffice' : 'FieldOffice',
          });
        }
      }
    }

    // Ensure a Main Office entry always exists for the tenant
    const hasMain = Array.from(map.values()).some((o) => o.isMainOffice);
    if (!hasMain) {
      const mainName = `${tenantDisplayName} - Main Office`;
      map.set(mainName.toLowerCase(), {
        id: 'main-office',
        name: mainName,
        code: 'MAIN',
        category: 'MainOffice',
        isMainOffice: true,
        applicationCount: 0,
      });
    }

    const list = Array.from(map.values()).sort((a, b) => {
      if (a.isMainOffice && !b.isMainOffice) return -1;
      if (!a.isMainOffice && b.isMainOffice) return 1;
      return a.name.localeCompare(b.name);
    });

    const resolveOfficeForApp = (
      app: ApplicationSummaryDto,
      optionsList: FieldOfficeFilterOption[]
    ): FieldOfficeFilterOption | undefined => {
      const mainOpt = optionsList.find((o) => o.isMainOffice) ?? optionsList[0];
      const rawOffice = (app.office ?? '').trim();
      if (
        rawOffice.length === 0 ||
        rawOffice.toLowerCase() === tenantDisplayName.toLowerCase() ||
        rawOffice.toLowerCase().includes('main office')
      ) {
        return mainOpt;
      }

      const exactMatch = optionsList.find(
        (o) =>
          o.name.toLowerCase() === rawOffice.toLowerCase() ||
          (o.code.length > 0 && o.code.toLowerCase() === rawOffice.toLowerCase()) ||
          o.id.toLowerCase() === rawOffice.toLowerCase()
      );
      if (exactMatch) return exactMatch;

      const subMatch = optionsList.find(
        (o) =>
          !o.isMainOffice &&
          (o.name.toLowerCase().includes(rawOffice.toLowerCase()) ||
            rawOffice.toLowerCase().includes(o.name.toLowerCase()))
      );
      if (subMatch) return subMatch;

      return mainOpt;
    };

    for (const app of applications) {
      if (!isWithinTimeRange(app.createdAt)) continue;
      const targetOffice = resolveOfficeForApp(app, list);
      if (targetOffice) {
        targetOffice.applicationCount += 1;
      }
    }

    return list;
  }, [adminFieldOffices, serverStats?.fieldOffices, applications, tenantDisplayName, isWithinTimeRange]);

  const isAllFieldOfficesSelected = selectedFieldOffices.length === 0;

  const hasBackendFieldOfficeSupport = useMemo(() => {
    return Array.isArray(serverStats?.fieldOffices);
  }, [serverStats?.fieldOffices]);

  const toggleFieldOffice = useCallback((officeName: string) => {
    setSelectedFieldOffices((prev) => {
      const exists = prev.some((s) => s.toLowerCase() === officeName.toLowerCase());
      if (exists) {
        return prev.filter((s) => s.toLowerCase() !== officeName.toLowerCase());
      }
      return [...prev, officeName];
    });
    setCurrentPage(1);
  }, []);

  const selectAllFieldOffices = useCallback(() => {
    setSelectedFieldOffices([]);
    setCurrentPage(1);
  }, []);

  const matchesSelectedFieldOffices = useCallback(
    (app: ApplicationSummaryDto): boolean => {
      if (selectedFieldOffices.length === 0) return true;

      const selectedLower = new Set(selectedFieldOffices.map((s) => s.toLowerCase()));
      const mainOpt = fieldOfficeOptions.find((o) => o.isMainOffice) ?? fieldOfficeOptions[0];
      const rawOffice = (app.office ?? '').trim();

      let resolvedOffice: FieldOfficeFilterOption | undefined = mainOpt;
      if (
        rawOffice.length > 0 &&
        rawOffice.toLowerCase() !== tenantDisplayName.toLowerCase() &&
        !rawOffice.toLowerCase().includes('main office')
      ) {
        const exactMatch = fieldOfficeOptions.find(
          (o) =>
            o.name.toLowerCase() === rawOffice.toLowerCase() ||
            (o.code.length > 0 && o.code.toLowerCase() === rawOffice.toLowerCase()) ||
            o.id.toLowerCase() === rawOffice.toLowerCase()
        );
        if (exactMatch) {
          resolvedOffice = exactMatch;
        } else {
          const subMatch = fieldOfficeOptions.find(
            (o) =>
              !o.isMainOffice &&
              (o.name.toLowerCase().includes(rawOffice.toLowerCase()) ||
                rawOffice.toLowerCase().includes(o.name.toLowerCase()))
          );
          resolvedOffice = subMatch ?? mainOpt;
        }
      }

      if (!resolvedOffice) return true;
      return selectedLower.has(resolvedOffice.name.toLowerCase());
    },
    [selectedFieldOffices, fieldOfficeOptions, tenantDisplayName]
  );

  // Filtered Applications
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      if (!isWithinTimeRange(app.createdAt)) return false;
      if (!matchesSelectedFieldOffices(app)) return false;

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
  }, [applications, isWithinTimeRange, matchesSelectedFieldOffices, categoryFilter, searchQuery]);

  // Filtered Financial Transactions
  const filteredTransactions = useMemo(() => {
    const allAppIds = new Set(applications.map((a) => a.id));
    const matchedAppIds = new Set(filteredApplications.map((a) => a.id));
    const matchedRefs = new Set<string>();
    for (const a of filteredApplications) {
      if (a.officialReceiptNumber) matchedRefs.add(a.officialReceiptNumber.trim().toUpperCase());
      if (a.opNumber) matchedRefs.add(a.opNumber.trim().toUpperCase());
      if (a.soaNumber) matchedRefs.add(a.soaNumber.trim().toUpperCase());
      if (a.applicationNumber) matchedRefs.add(a.applicationNumber.trim().toUpperCase());
      if (a.referenceNumber) matchedRefs.add(a.referenceNumber.trim().toUpperCase());
    }
    const mainOption = fieldOfficeOptions.find((o) => o.isMainOffice) ?? fieldOfficeOptions[0];
    const isMainSelected =
      isAllFieldOfficesSelected ||
      Boolean(mainOption && selectedFieldOffices.some((s) => s.toLowerCase() === mainOption.name.toLowerCase())) ||
      selectedFieldOffices.some((s) => s.toLowerCase().includes('main office'));

    return unifiedTransactions.filter((tx) => {
      if (!isWithinTimeRange(tx.date)) return false;

      if (!isAllFieldOfficesSelected) {
        const refUpper = (tx.refNo ?? '').trim().toUpperCase();
        const isMatchedApp = matchedAppIds.has(tx.id) || (refUpper.length > 0 && matchedRefs.has(refUpper));
        if (!isMatchedApp) {
          if (allAppIds.has(tx.id)) {
            return false;
          }
          if (!isMainSelected) {
            return false;
          }
        }
      }

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
  }, [
    unifiedTransactions,
    isWithinTimeRange,
    isAllFieldOfficesSelected,
    applications,
    filteredApplications,
    fieldOfficeOptions,
    selectedFieldOffices,
    searchQuery,
  ]);

  // Distinct Filter Options for Evaluator, Service, Entity, and Exam Class
  const evaluatorOptions = useMemo(() => {
    const set = new Set<string>();
    for (const app of filteredApplications) {
      const name = resolveEvaluatorName(app, user?.name);
      if (name.trim().length > 0) set.add(name.trim());
    }
    return Array.from(set).sort();
  }, [filteredApplications, user?.name]);

  const serviceOptions = useMemo(() => {
    const set = new Set<string>();
    for (const app of filteredApplications) {
      const svc = resolveServiceName(app);
      if (svc.trim().length > 0) set.add(svc.trim());
    }
    return Array.from(set).sort();
  }, [filteredApplications]);

  const entityOptions = useMemo(() => {
    const set = new Set<string>();
    for (const app of filteredApplications) {
      const ent = resolveEntityName(app);
      if (ent.trim().length > 0) set.add(ent.trim());
    }
    return Array.from(set).sort();
  }, [filteredApplications]);

  const scheduleOptions = useMemo(() => {
    const set = new Set<string>();
    for (const app of filteredApplications) {
      const cat = `${app.serviceCategory ?? ''} ${app.serviceName ?? ''} ${app.serviceVariantName ?? ''}`.toLowerCase();
      if (cat.includes('exam') || cat.includes('operator') || cat.includes('roce') || cat.includes('amateur') || cat.includes('rroc')) {
        const label = (app.serviceVariantName ?? app.element ?? app.serviceName ?? '').trim();
        if (label.length > 0) set.add(label);
      }
    }
    return Array.from(set).sort();
  }, [filteredApplications]);

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

  // Category Breakdown Statistics (Server Single Source of Truth with Client Fallback)
  const categoryBreakdown: CategoryBreakdown[] = useMemo(() => {
    if (serverStats?.categoryBreakdown && serverStats.categoryBreakdown.length > 0) {
      return serverStats.categoryBreakdown;
    }

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
  }, [serverStats?.categoryBreakdown, filteredApplications]);

  // Key KPI Aggregates (Live Filtered Records with Server Fallback)
  const stats = useMemo(() => {
    const totalApps = filteredApplications.length;
    const approvedCount = filteredApplications.filter(
      (a) => a.status === 'Approved' || a.status === 'Completed'
    ).length;
    const evaluatingCount = filteredApplications.filter(
      (a) =>
        a.status === 'Evaluating' ||
        a.status === 'Submitted' ||
        a.status === 'ForAccountant' ||
        a.status === 'PendingPayment'
    ).length;
    const returnedCount = filteredApplications.filter(
      (a) => a.status === 'Returned'
    ).length;
    const completedCount = filteredApplications.filter((a) => a.status === 'Completed').length;

    const approvalRate = totalApps > 0 ? Math.round((approvedCount / totalApps) * 100) : 100;

    const paidTx = getPaidTransactions(filteredTransactions, filteredApplications);
    const totalCollected = paidTx.reduce((sum, tx) => sum + (tx.amount ?? 0), 0);

    const totalInvoiced = filteredTransactions.reduce((sum, tx) => {
      return sum + (tx.amount ?? 0);
    }, 0);

    const outstandingBalance = Math.max(0, totalInvoiced - totalCollected);

    const csatTotal = filteredFeedback.length;
    const avgCsat = csatTotal > 0
      ? (filteredFeedback.reduce((sum, fb) => sum + fb.rating, 0) / csatTotal).toFixed(1)
      : serverStats?.summary?.avgCsat ?? '5.0';

    return {
      totalApps,
      approvedCount,
      evaluatingCount,
      returnedCount,
      completedCount,
      approvalRate,
      totalCollected,
      totalInvoiced: Math.max(totalInvoiced, totalCollected),
      outstandingBalance,
      csatTotal,
      avgCsat,
    };
  }, [filteredApplications, filteredTransactions, filteredFeedback, serverStats?.summary?.avgCsat]);

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
        const name = fb.isAnonymous ? '"Anonymous Client"' : `"${(fb.senderName ?? '').replace(/"/g, '""')}"`;
        const email = fb.isAnonymous ? '"[Redacted / Anonymous]"' : `"${(fb.senderEmail ?? '').replace(/"/g, '""')}"`;
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
      setTimeout(() => {
        try {
          URL.revokeObjectURL(url);
        } catch {
          // Ignore revocation error
        }
      }, 60_000);
    }
  }, [reportType, filteredApplications, filteredTransactions, filteredFeedback]);

  // Computed Statutory Reports with Accurate Live Stats
  const statutoryReports = useMemo(() => {
    const paidTx = getPaidTransactions(filteredTransactions, filteredApplications);
    const filterOpts = {
      startDate,
      endDate,
      evaluatorFilter: selectedEvaluatorId,
      serviceFilter: selectedServiceId,
      entityFilter: selectedApplicantId,
      scheduleFilter: selectedScheduleId,
    };

    return STATUTORY_REPORTS_LIST.map((meta) => {
      let recordCount = filteredApplications.length;
      let complianceRate = stats.approvalRate;
      let totalAmount: number | undefined = undefined;

      if (meta.code === 'NTC-BTr-COA-01' || meta.code === 'NTC-COA-APP26-M' || meta.code === 'NTC-COA-APP26-D') {
        recordCount = paidTx.length;
        complianceRate = 100;
        totalAmount = stats.totalCollected;
      } else if (meta.code === 'NTC-BIR-DST-01') {
        recordCount = paidTx.length;
        complianceRate = 100;
        totalAmount = paidTx.length * 30;
      } else if (meta.code === 'NTC-BTR-INC-01') {
        recordCount = paidTx.length;
        complianceRate = 100;
        totalAmount = stats.totalCollected;
      } else if (meta.code === 'NTC-MIS-OPS' || meta.code === 'NTC-BAR-1') {
        recordCount = filteredApplications.length;
        complianceRate = stats.approvalRate;
        totalAmount = stats.totalCollected;
      } else if (meta.code === 'NTC-APP-SUM-EVAL' || meta.code === 'NTC-APP-SUM-SVC' || meta.code === 'NTC-APP-SUM-ENT') {
        const scoped = filterApplicationsForStatutoryReport(meta.code, filteredApplications, filterOpts, user?.name);
        const scopedApproved = scoped.filter((a) => a.status === 'Approved' || a.status === 'Completed').length;
        recordCount = scoped.length;
        complianceRate = scoped.length > 0 ? Math.round((scopedApproved / scoped.length) * 100) : 100;
        totalAmount = stats.totalCollected;
      } else if (meta.code === 'NTC-APP-VOL-01') {
        recordCount = filteredApplications.length;
        complianceRate = stats.approvalRate;
        totalAmount = stats.totalCollected;
      } else if (meta.code === 'NTC-EXAM-MST-01') {
        const examScoped = filterApplicationsForStatutoryReport(meta.code, filteredApplications, filterOpts, user?.name).filter((a) => {
          const cat = `${a.serviceCategory ?? ''} ${a.serviceName ?? ''} ${a.serviceVariantName ?? ''}`.toLowerCase();
          return cat.includes('exam') || cat.includes('operator') || cat.includes('roce') || cat.includes('amateur') || cat.includes('rroc');
        });
        recordCount = examScoped.length;
        complianceRate = 100;
      } else if (meta.code === 'NTC-CSMR-8888') {
        recordCount = filteredFeedback.length;
        complianceRate = Math.round((Number(stats.avgCsat) / 5) * 100);
      } else if (meta.code === 'ARTA-RA-11032') {
        complianceRate = stats.approvalRate;
      } else if (meta.code === 'NTC-NOV-ENF') {
        recordCount = stats.returnedCount;
        complianceRate = 98;
      }

      const status: 'Ready' | 'Needs Review' | 'Complete' = recordCount > 0 ? 'Ready' : 'Complete';
      return {
        metadata: meta,
        recordCount,
        complianceRate,
        totalAmount,
        status,
      };
    });
  }, [
    filteredApplications,
    filteredTransactions,
    filteredFeedback.length,
    stats,
    startDate,
    endDate,
    selectedEvaluatorId,
    selectedServiceId,
    selectedApplicantId,
    selectedScheduleId,
    user?.name,
  ]);

  const handleOpenStatutoryModal = useCallback((report: StatutoryReportMetadata) => {
    setStatutoryModal({
      visible: true,
      report,
    });
  }, []);

  const handleCloseStatutoryModal = useCallback(() => {
    setStatutoryModal({
      visible: false,
      report: null,
    });
  }, []);

  const handleDownloadStatutoryCsv = useCallback((reportCode: StatutoryReportCode) => {
    const effectivePeriod = periodMode === 'custom'
      ? `${startDate} to ${endDate}`
      : selectedPeriod;
    const { content, filename } = generateStatutoryCsv(
      reportCode,
      tenantDisplayName,
      effectivePeriod,
      filteredApplications,
      filteredTransactions,
      filteredFeedback,
      {
        startDate,
        endDate,
        evaluatorFilter: selectedEvaluatorId,
        serviceFilter: selectedServiceId,
        entityFilter: selectedApplicantId,
        scheduleFilter: selectedScheduleId,
      }
    );
    downloadCsvFile(content, filename);
  }, [
    tenantDisplayName,
    periodMode,
    selectedPeriod,
    startDate,
    endDate,
    selectedEvaluatorId,
    selectedServiceId,
    selectedApplicantId,
    selectedScheduleId,
    filteredApplications,
    filteredTransactions,
    filteredFeedback,
  ]);

  const handlePrintStatutoryReport = useCallback((reportMeta: StatutoryReportMetadata) => {
    const effectivePeriod = periodMode === 'custom'
      ? `${startDate} to ${endDate}`
      : selectedPeriod;
    const html = generateStatutoryPrintableHtml(
      reportMeta,
      tenantDisplayName,
      effectivePeriod,
      filteredApplications,
      filteredTransactions,
      filteredFeedback,
      user?.name,
      {
        startDate,
        endDate,
        evaluatorFilter: selectedEvaluatorId,
        serviceFilter: selectedServiceId,
        entityFilter: selectedApplicantId,
        scheduleFilter: selectedScheduleId,
      }
    );
    openPrintableReportWindow(html);
  }, [
    tenantDisplayName,
    user?.name,
    periodMode,
    selectedPeriod,
    startDate,
    endDate,
    selectedEvaluatorId,
    selectedServiceId,
    selectedApplicantId,
    selectedScheduleId,
    filteredApplications,
    filteredTransactions,
    filteredFeedback,
  ]);

  // Aggregated Periodic Statistics (Server Single Source of Truth with Client Fallback)
  const periodicStatistics: PeriodicStatBucket[] = useMemo(() => {
    if (serverStats?.periodicStatistics && serverStats.periodicStatistics.length > 0) {
      return serverStats.periodicStatistics;
    }

    if (periodMode === 'monthly') {
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      const shortNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      return monthNames.map((mName, mIdx) => {
        const mApps = applications.filter((a) => {
          if (!a.createdAt) return false;
          const d = new Date(a.createdAt);
          return d.getFullYear() === selectedYear && d.getMonth() === mIdx;
        });

        const mTx = transactions.filter((t) => {
          if (!t.date) return false;
          const d = new Date(t.date);
          return d.getFullYear() === selectedYear && d.getMonth() === mIdx;
        });

        const mFb = feedback.filter((f) => {
          if (!f.createdAt) return false;
          const d = new Date(f.createdAt);
          return d.getFullYear() === selectedYear && d.getMonth() === mIdx;
        });

        const totalApps = mApps.length;
        const approvedCount = mApps.filter((a) => a.status === 'Approved').length;
        const evaluatingCount = mApps.filter((a) => a.status === 'Evaluating' || a.status === 'Submitted').length;
        const returnedCount = mApps.filter((a) => a.status === 'Returned').length;
        const approvalRate = totalApps > 0 ? Math.round((approvedCount / totalApps) * 100) : 100;
        const totalRevenue = mTx.reduce((sum, tx) => (tx.paymentStatus === 'Paid' ? sum + (tx.amount ?? 0) : sum), 0);
        const avgCsat = mFb.length > 0 ? (mFb.reduce((sum, f) => sum + f.rating, 0) / mFb.length).toFixed(1) : '5.0';

        return {
          id: `month-${mIdx}`,
          label: `${mName} ${selectedYear}`,
          shortLabel: shortNames[mIdx] ?? mName,
          totalApplications: totalApps,
          approvedCount,
          evaluatingCount,
          returnedCount,
          approvalRate,
          totalRevenue,
          feedbackCount: mFb.length,
          avgCsat,
        };
      });
    }

    if (periodMode === 'quarterly') {
      const quarters = [
        { q: 1, name: 'Q1 (Jan - Mar)', short: 'Q1' },
        { q: 2, name: 'Q2 (Apr - Jun)', short: 'Q2' },
        { q: 3, name: 'Q3 (Jul - Sep)', short: 'Q3' },
        { q: 4, name: 'Q4 (Oct - Dec)', short: 'Q4' },
      ];

      return quarters.map(({ q, name, short }) => {
        const qApps = applications.filter((a) => {
          if (!a.createdAt) return false;
          const d = new Date(a.createdAt);
          const quarter = Math.floor(d.getMonth() / 3) + 1;
          return d.getFullYear() === selectedYear && quarter === q;
        });

        const qTx = transactions.filter((t) => {
          if (!t.date) return false;
          const d = new Date(t.date);
          const quarter = Math.floor(d.getMonth() / 3) + 1;
          return d.getFullYear() === selectedYear && quarter === q;
        });

        const qFb = feedback.filter((f) => {
          if (!f.createdAt) return false;
          const d = new Date(f.createdAt);
          const quarter = Math.floor(d.getMonth() / 3) + 1;
          return d.getFullYear() === selectedYear && quarter === q;
        });

        const totalApps = qApps.length;
        const approvedCount = qApps.filter((a) => a.status === 'Approved').length;
        const evaluatingCount = qApps.filter((a) => a.status === 'Evaluating' || a.status === 'Submitted').length;
        const returnedCount = qApps.filter((a) => a.status === 'Returned').length;
        const approvalRate = totalApps > 0 ? Math.round((approvedCount / totalApps) * 100) : 100;
        const totalRevenue = qTx.reduce((sum, tx) => (tx.paymentStatus === 'Paid' ? sum + (tx.amount ?? 0) : sum), 0);
        const avgCsat = qFb.length > 0 ? (qFb.reduce((sum, f) => sum + f.rating, 0) / qFb.length).toFixed(1) : '5.0';

        return {
          id: `q-${q}`,
          label: `${name} ${selectedYear}`,
          shortLabel: short,
          totalApplications: totalApps,
          approvedCount,
          evaluatingCount,
          returnedCount,
          approvalRate,
          totalRevenue,
          feedbackCount: qFb.length,
          avgCsat,
        };
      });
    }

    if (periodMode === 'yearly') {
      const years = [selectedYear - 2, selectedYear - 1, selectedYear];

      return years.map((yr) => {
        const yrApps = applications.filter((a) => {
          if (!a.createdAt) return false;
          return new Date(a.createdAt).getFullYear() === yr;
        });

        const yrTx = transactions.filter((t) => {
          if (!t.date) return false;
          return new Date(t.date).getFullYear() === yr;
        });

        const yrFb = feedback.filter((f) => {
          if (!f.createdAt) return false;
          return new Date(f.createdAt).getFullYear() === yr;
        });

        const totalApps = yrApps.length;
        const approvedCount = yrApps.filter((a) => a.status === 'Approved').length;
        const evaluatingCount = yrApps.filter((a) => a.status === 'Evaluating' || a.status === 'Submitted').length;
        const returnedCount = yrApps.filter((a) => a.status === 'Returned').length;
        const approvalRate = totalApps > 0 ? Math.round((approvedCount / totalApps) * 100) : 100;
        const totalRevenue = yrTx.reduce((sum, tx) => (tx.paymentStatus === 'Paid' ? sum + (tx.amount ?? 0) : sum), 0);
        const avgCsat = yrFb.length > 0 ? (yrFb.reduce((sum, f) => sum + f.rating, 0) / yrFb.length).toFixed(1) : '5.0';

        return {
          id: `yr-${yr}`,
          label: `Year ${yr}`,
          shortLabel: String(yr),
          totalApplications: totalApps,
          approvedCount,
          evaluatingCount,
          returnedCount,
          approvalRate,
          totalRevenue,
          feedbackCount: yrFb.length,
          avgCsat,
        };
      });
    }

    // Default: rolling weekly buckets
    const rollingWeeks = [
      { id: 'w1', label: 'Last 7 Days', short: '7D' },
      { id: 'w2', label: '8-14 Days Ago', short: '14D' },
      { id: 'w3', label: '15-30 Days Ago', short: '30D' },
      { id: 'w4', label: '31-90 Days Ago', short: '90D' },
    ];

    return rollingWeeks.map(({ id, label, short }) => ({
      id,
      label,
      shortLabel: short,
      totalApplications: filteredApplications.length,
      approvedCount: stats.approvedCount,
      evaluatingCount: stats.evaluatingCount,
      returnedCount: stats.returnedCount,
      approvalRate: stats.approvalRate,
      totalRevenue: stats.totalCollected,
      feedbackCount: stats.csatTotal,
      avgCsat: stats.avgCsat,
    }));
  }, [serverStats?.periodicStatistics, periodMode, selectedYear, applications, transactions, feedback, filteredApplications.length, stats]);

  // Export Periodic Statistics Matrix CSV
  const exportPeriodicStatsCsv = useCallback(() => {
    let csv = `Periodic Statistical Report (${periodMode.toUpperCase()} - ${selectedYear})\n`;
    csv += 'Period / Interval,Total Applications,Approved Count,In Review,Returned,Approval Rate (%),Total Revenue (PHP),CSAT Score,Feedback Count\n';

    for (const b of periodicStatistics) {
      csv += `"${b.label}",${b.totalApplications},${b.approvedCount},${b.evaluatingCount},${b.returnedCount},${b.approvalRate}%,${b.totalRevenue},"${b.avgCsat} ★",${b.feedbackCount}\n`;
    }

    const filename = `NTC_Statistical_Report_${periodMode}_${selectedYear}_${new Date().toISOString().slice(0, 10)}.csv`;
    downloadCsvFile(csv, filename);
  }, [periodMode, selectedYear, periodicStatistics]);

  return {
    reportType,
    setReportType,
    periodMode,
    setPeriodMode,
    selectedYear,
    setSelectedYear,
    selectedQuarter,
    setSelectedQuarter,
    selectedMonth,
    setSelectedMonth,
    timeRange,
    setTimeRange,
    categoryFilter,
    setCategoryFilter,
    selectedPeriod,
    setSelectedPeriod,
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
    periodicStatistics,
    exportPeriodicStatsCsv,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    selectedEvaluatorId,
    setSelectedEvaluatorId,
    selectedServiceId,
    setSelectedServiceId,
    selectedApplicantId,
    setSelectedApplicantId,
    selectedScheduleId,
    setSelectedScheduleId,
    evaluatorOptions,
    serviceOptions,
    entityOptions,
    scheduleOptions,
    fieldOfficeOptions,
    selectedFieldOffices,
    setSelectedFieldOffices,
    isAllFieldOfficesSelected,
    hasBackendFieldOfficeSupport,
    toggleFieldOffice,
    selectAllFieldOffices,
    fieldOfficesQueryParam,
    statutoryReports,
    statutoryModal,
    handleOpenStatutoryModal,
    handleCloseStatutoryModal,
    handleDownloadStatutoryCsv,
    handlePrintStatutoryReport,
    activeTenantId: user?.tenantId ?? null,
    tenantDisplayName,
    stats,
    isLoading,
    handleRefreshAll,
    exportCsv,
  };
}
