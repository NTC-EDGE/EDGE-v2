import { z } from 'zod';

export const reportFiltersSchema = z.object({
  reportType: z.enum(['applications', 'financial', 'compliance', 'satisfaction', 'statutory']).default('applications'),
  periodMode: z.enum(['monthly', 'quarterly', 'yearly', 'rolling']).default('monthly'),
  selectedYear: z.number().int().min(2020).max(2035).default(2026),
  selectedQuarter: z.number().int().min(1).max(4).default(1),
  selectedMonth: z.number().int().min(0).max(11).default(new Date().getMonth()),
  timeRange: z.enum(['7d', '30d', '90d', 'ytd', 'all']).default('30d'),
  categoryFilter: z.enum(['all', 'Permits', 'Licenses', 'Accreditations', 'Certificates', 'Exams']).default('all'),
  selectedPeriod: z.enum(['Q1 2026', 'Q2 2026', 'Q3 2026', 'Q4 2026', 'Annual 2026']).default('Q1 2026'),
  searchQuery: z.string().default(''),
  currentPage: z.number().int().min(1).default(1),
});

export type ReportFiltersValues = z.infer<typeof reportFiltersSchema>;
