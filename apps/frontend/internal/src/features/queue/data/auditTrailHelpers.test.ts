// @ts-expect-error - bun test runtime module
import { describe, it, expect } from 'bun:test';
import { buildAuditTrailList, deriveStaffRoleFromAction } from './auditTrailHelpers';
import { ApplicationDto, ApplicationHistoryDto, StatementOfAccountDto } from '@edge/api';

describe('auditTrailHelpers', () => {
  it('correctly derives Evaluating Officer for SOA generation action', () => {
    expect(deriveStaffRoleFromAction(null, 'Statement of Account (SOA) Generated', 'Evaluating')).toBe('Evaluating Officer');
    expect(deriveStaffRoleFromAction(null, 'SOA created by Evaluator', 'Pending')).toBe('Evaluating Officer');
    expect(deriveStaffRoleFromAction('Evaluator', 'Statement of Account (SOA) Generated', 'Evaluating')).toBe('Evaluator');
  });

  it('includes SOA generation event when recorded in dto.histories', () => {
    const historyDto: ApplicationHistoryDto = {
      id: 'hist-soa-1',
      action: 'Statement of Account (SOA) Generated',
      fromStatus: 'Evaluating',
      toStatus: 'Evaluating',
      staffName: 'Engr. John Evaluator',
      staffRole: 'Evaluator',
      remarks: 'SOA SOA-2026-ABC123 generated with total amount PHP 1,500.00.',
      timestamp: '2026-10-15T08:00:00Z',
    };

    const dto: ApplicationDto = {
      id: 'app-1',
      referenceNumber: 'REF-001',
      status: 'Evaluating',
      createdAt: '2026-10-15T07:00:00Z',
      histories: [historyDto],
    } as unknown as ApplicationDto;

    const trail = buildAuditTrailList(dto);

    expect(trail.length).toBeGreaterThanOrEqual(2); // Initial submission + SOA generation
    const soaEntry = trail.find((t) => t.action.includes('SOA'));
    expect(soaEntry).toBeDefined();
    expect(soaEntry?.action).toBe('Statement of Account (SOA) Generated');
    expect(soaEntry?.staff).toBe('Engr. John Evaluator');
    expect(soaEntry?.role).toBe('Evaluator');
    expect(soaEntry?.remarks).toContain('SOA-2026-ABC123');
    expect(soaEntry?.timestamp).toBeTruthy();
  });

  it('includes SOA generation event from statementsOfAccount when not yet in dto.histories', () => {
    const soaDto: StatementOfAccountDto = {
      id: 'soa-99',
      applicationId: 'app-2',
      soaNumber: 'SOA-2026-XYZ999',
      status: 'Pending',
      issuedToType: 'Individual',
      issuedToName: 'Jane Applicant',
      totalAmount: 2500,
      dueDate: '2026-11-15T00:00:00Z',
      createdAt: '2026-10-15T08:15:00Z',
      lineItems: [],
      histories: [
        {
          id: 'sh-1',
          action: 'SOA created by Evaluator',
          fromStatus: undefined,
          toStatus: 'Pending',
          staffName: 'Engr. Evaluator',
          staffRole: 'Evaluator',
          remarks: 'Standard statutory fees',
          timestamp: '2026-10-15T08:15:00Z',
        },
      ],
    };

    const dto: ApplicationDto = {
      id: 'app-2',
      referenceNumber: 'REF-002',
      status: 'Evaluating',
      createdAt: '2026-10-15T07:00:00Z',
      histories: [],
      statementsOfAccount: [soaDto],
    } as unknown as ApplicationDto;

    const trail = buildAuditTrailList(dto);

    const soaEntry = trail.find((t) => t.action.toLowerCase().includes('soa'));
    expect(soaEntry).toBeDefined();
    expect(soaEntry?.staff).toBe('Engr. Evaluator');
    expect(soaEntry?.timestamp).toBeTruthy();
  });
});
