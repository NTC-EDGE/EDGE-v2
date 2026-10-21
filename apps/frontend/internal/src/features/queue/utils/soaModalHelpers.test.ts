import { ApplicationData } from '../../../../types/application';
import {
  SOA_STANDARD_PARTICULARS,
  normalizeParticularKey,
  isDuplicateParticular,
  getAvailableStandardParticular,
  mapExistingSoaItemsToEditableItems,
  calculateLineItemAmount,
  resolveInitialAddress,
} from './soaModalHelpers';

describe('soaModalHelpers - SOA Item 9 & Item 10', () => {
  describe('SOA_STANDARD_PARTICULARS', () => {
    it('contains all standard SOA particulars across 4 official categories', () => {
      expect(SOA_STANDARD_PARTICULARS.length).toBeGreaterThanOrEqual(20);

      const categories = new Set(SOA_STANDARD_PARTICULARS.map((p) => p.category));
      expect(categories.has('FOR LICENSES')).toBe(true);
      expect(categories.has('FOR PERMITS')).toBe(true);
      expect(categories.has('FOR AMATEUR AND ROC')).toBe(true);
      expect(categories.has('OTHER APPLICATION')).toBe(true);
    });

    it('contains "Others" under OTHER APPLICATION with default code 4-02-01-990 and isOthers: true', () => {
      const others = SOA_STANDARD_PARTICULARS.find((p) => p.particular === 'Others');
      expect(others).toBeDefined();
      if (others) {
        expect(others.category).toBe('OTHER APPLICATION');
        expect(others.defaultCode).toBe('4-02-01-990');
        expect(others.isOthers).toBe(true);
      }
    });

    it('contains official NTC accounting codes for standard particulars', () => {
      const license = SOA_STANDARD_PARTICULARS.find((p) => p.particular === 'Permit to Purchase');
      expect(license?.defaultCode).toBe('4-02-01-010');

      const filing = SOA_STANDARD_PARTICULARS.find((p) => p.particular === 'Filling Fee');
      expect(filing?.defaultCode).toBe('4-02-01-130');

      const suf = SOA_STANDARD_PARTICULARS.find((p) => p.particular === "Spectrum User's Fee (SUF)");
      expect(suf?.defaultCode).toBe('4-02-01-080');

      const dst = SOA_STANDARD_PARTICULARS.find((p) => p.particular === 'Documentary Stamp Tax (DST)');
      expect(dst?.defaultCode).toBe('4-01-04-010');
    });
  });

  describe('normalizeParticularKey', () => {
    it('normalizes case, whitespace, and category qualifiers', () => {
      expect(normalizeParticularKey('  Radio Station License  ')).toBe('radio station license');
      expect(normalizeParticularKey('Inspection Fee (Licenses)')).toBe('inspection fee');
      expect(normalizeParticularKey('Inspection Fee (Permits)')).toBe('inspection fee');
      expect(normalizeParticularKey('Radio Station License (Amateur/ROC)')).toBe('radio station license');
    });

    it('normalizes any "Others: <custom>" entry to "others" so only one Others row can exist', () => {
      expect(normalizeParticularKey('Others')).toBe('others');
      expect(normalizeParticularKey('Others: Penalty for late delivery')).toBe('others');
      expect(normalizeParticularKey('others: Storage Fee')).toBe('others');
    });

    it('returns empty string for null, undefined, or empty inputs', () => {
      expect(normalizeParticularKey(null)).toBe('');
      expect(normalizeParticularKey(undefined)).toBe('');
      expect(normalizeParticularKey('   ')).toBe('');
    });
  });

  describe('isDuplicateParticular', () => {
    const existingItems = [
      { id: 'item-1', particular: 'Permit to Purchase' },
      { id: 'item-2', particular: 'Inspection Fee' },
      { id: 'item-3', particular: 'Others: Late Submission' },
    ];

    it('detects duplicate for identical or case-insensitive matching particular', () => {
      expect(isDuplicateParticular('Permit to Purchase', existingItems)).toBe(true);
      expect(isDuplicateParticular('permit to purchase', existingItems)).toBe(true);
    });

    it('detects duplicate across category variants of the same particular', () => {
      expect(isDuplicateParticular('Inspection Fee (Permits)', existingItems)).toBe(true);
    });

    it('detects duplicate when trying to select Others when an Others item already exists', () => {
      expect(isDuplicateParticular('Others', existingItems)).toBe(true);
      expect(isDuplicateParticular('Others: Another Description', existingItems)).toBe(true);
    });

    it('allows editing an item without reporting duplicate against itself (ignoreId)', () => {
      expect(isDuplicateParticular('Permit to Purchase', existingItems, 'item-1')).toBe(false);
      expect(isDuplicateParticular('Inspection Fee', existingItems, 'item-2')).toBe(false);
      expect(isDuplicateParticular('Others: Updated Description', existingItems, 'item-3')).toBe(false);
    });

    it('returns false when particular is unique', () => {
      expect(isDuplicateParticular('Construction Permit Fee', existingItems)).toBe(false);
      expect(isDuplicateParticular('Documentary Stamp Tax (DST)', existingItems)).toBe(false);
    });
  });

  describe('getAvailableStandardParticular', () => {
    it('returns the first standard particular not already in the existing items list', () => {
      const items = [{ id: '1', particular: 'Permit to Purchase' }];
      const available = getAvailableStandardParticular(items);
      expect(available).not.toBeNull();
      expect(available?.particular).not.toBe('Permit to Purchase');
    });

    it('returns null if every single standard particular is already used', () => {
      const allItems = SOA_STANDARD_PARTICULARS.map((p, idx) => ({
        id: `all-${idx}`,
        particular: p.particular,
      }));
      const available = getAvailableStandardParticular(allItems);
      expect(available).toBeNull();
    });
  });

  describe('mapExistingSoaItemsToEditableItems with Others description', () => {
    it('extracts custom description from "Others: <description>" for traceability', () => {
      const items = [
        {
          particular: 'Others: Penalty for late delivery',
          code: '4-02-01-990',
          fees: 250,
          amount: 250,
          noOfUnits: 1,
          validityYears: 1,
          percentage: 0,
        },
      ];

      const mapped = mapExistingSoaItemsToEditableItems(items);
      expect(mapped.length).toBe(1);
      const first = mapped[0];
      if (first) {
        expect(first.particular).toBe('Others: Penalty for late delivery');
        expect(first.description).toBe('Penalty for late delivery');
        expect(first.amount).toBe(250);
      }
    });
  });

  describe('resolveInitialAddress - complete address resolution', () => {
    const baseApp: ApplicationData = {
      id: 'app-addr-test',
      tenantId: 'tenant-1',
      referenceNumber: 'REF-2026-ADDR',
      applicationNumber: 'APP-2026-ADDR',
      applicant: 'Test Applicant',
      permitTitle: 'Radio Station Permit',
      category: 'Commercial',
      status: 'Evaluating',
      queueTab: 'queue',
      payment: {
        amountReceived: 0,
        orNumber: '',
        orDate: '',
        feeAmount: 1000,
        status: 'Unpaid',
        paymentMethod: 'Cash',
      },
      soaItems: [],
      totalAmountDue: 1000,
      assignedTo: 'NTC Regional Office',
      createdAt: '2026-10-21T00:00:00Z',
      dateLabel: 'Oct 21, 2026',
      isBeingViewed: false,
      isUrgent: false,
      isPinned: false,
      isArchived: false,
      address: {
        streetAddress: '123 Main St',
        barangay: 'Barangay Central',
        city: 'Cebu City',
        province: 'Cebu',
        region: 'Region VII',
        zipCode: '6000',
      },
      contactDetails: {
        contactNumber: '09123456789',
        email: 'test@example.com',
      },
      documents: [],
      history: [],
      correctionAuditTrail: [],
      rejectionNotes: [],
      requirements: [],
    };

    it('constructs complete address with barangay, city, province, region, and zip code', () => {
      const resolved = resolveInitialAddress(baseApp);
      expect(resolved).toBe('123 Main St, Barangay Central, Cebu City, Cebu, Region VII, 6000');
    });

    it('prefers existing soaIssuedToAddress when already set', () => {
      const appWithIssued: ApplicationData = {
        ...baseApp,
        soaIssuedToAddress: 'Custom Issued Address, Mandaue City, 6014',
      };
      const resolved = resolveInitialAddress(appWithIssued);
      expect(resolved).toBe('Custom Issued Address, Mandaue City, 6014');
    });

    it('returns empty string when app is null or undefined', () => {
      expect(resolveInitialAddress(null)).toBe('');
      expect(resolveInitialAddress(undefined)).toBe('');
    });
  });
});
