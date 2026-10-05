import {
  formatCompositeAddress,
  sanitizeAddressSegment,
} from './formPreviewHelpers';

describe('Address formatting helpers', () => {
  describe('sanitizeAddressSegment', () => {
    it('returns null for null, undefined, empty, or whitespace', () => {
      expect(sanitizeAddressSegment(null)).toBeNull();
      expect(sanitizeAddressSegment(undefined)).toBeNull();
      expect(sanitizeAddressSegment('')).toBeNull();
      expect(sanitizeAddressSegment('   ')).toBeNull();
    });

    it('returns null for placeholder strings like N/A, NA, -, [], {}', () => {
      expect(sanitizeAddressSegment('N/A')).toBeNull();
      expect(sanitizeAddressSegment('n/a')).toBeNull();
      expect(sanitizeAddressSegment('NA')).toBeNull();
      expect(sanitizeAddressSegment('-')).toBeNull();
      expect(sanitizeAddressSegment('[]')).toBeNull();
      expect(sanitizeAddressSegment('{}')).toBeNull();
    });

    it('returns trimmed valid strings', () => {
      expect(sanitizeAddressSegment('  123 Main Street  ')).toBe('123 Main Street');
      expect(sanitizeAddressSegment('Barangay San Antonio')).toBe('Barangay San Antonio');
    });
  });

  describe('formatCompositeAddress', () => {
    it('returns null for empty or all-null input', () => {
      expect(formatCompositeAddress()).toBeNull();
      expect(formatCompositeAddress(null)).toBeNull();
      expect(formatCompositeAddress({})).toBeNull();
      expect(
        formatCompositeAddress({
          street: 'N/A',
          barangay: '-',
          city: '',
          province: 'NA',
          region: '[]',
          zipCode: '{}',
        })
      ).toBeNull();
    });

    it('formats a full Philippine composite address correctly', () => {
      const result = formatCompositeAddress({
        street: '123 Rizal Ave',
        barangay: 'San Antonio',
        city: 'Pasig City',
        province: 'Metro Manila',
        region: 'NCR',
        zipCode: '1600',
      });
      expect(result).toBe('123 Rizal Ave, Brgy. San Antonio, Pasig City, Metro Manila, (NCR), ZIP 1600');
    });

    it('gracefully handles missing optional barangay without extra commas', () => {
      const result = formatCompositeAddress({
        streetAddress: 'Unit 402, Sunset Bldg',
        cityMunicipality: 'Cebu City',
        province: 'Cebu',
        region: 'Region VII',
        zipCode: '6000',
      });
      expect(result).toBe('Unit 402, Sunset Bldg, Cebu City, Cebu, (Region VII), ZIP 6000');
      expect(result).not.toContain(', ,');
    });

    it('gracefully handles missing optional region without layout shifts or extra commas', () => {
      const result = formatCompositeAddress({
        street: '456 Acacia Lane',
        barangay: 'Poblacion',
        city: 'Davao City',
        province: 'Davao del Sur',
        zipCode: '8000',
      });
      expect(result).toBe('456 Acacia Lane, Brgy. Poblacion, Davao City, Davao del Sur, ZIP 8000');
      expect(result).not.toContain(', ,');
    });

    it('gracefully handles missing both barangay and region', () => {
      const result = formatCompositeAddress({
        streetAddress: '789 Quezon Blvd',
        cityMunicipality: 'Iloilo City',
        province: 'Iloilo',
        zipCode: '5000',
      });
      expect(result).toBe('789 Quezon Blvd, Iloilo City, Iloilo, ZIP 5000');
      expect(result).not.toContain(', ,');
    });

    it('gracefully handles missing zipCode', () => {
      const result = formatCompositeAddress({
        street: 'Block 5 Lot 12',
        barangay: 'Brgy. Central',
        city: 'Quezon City',
        province: 'Metro Manila',
        region: 'NCR',
      });
      expect(result).toBe('Block 5 Lot 12, Brgy. Central, Quezon City, Metro Manila, (NCR)');
      expect(result).not.toMatch(/,\s*$/);
    });

    it('does not duplicate "Brgy." if barangay name already starts with Brgy or Barangay', () => {
      const resultWithBrgy = formatCompositeAddress({
        barangay: 'Brgy. San Roque',
        city: 'Marikina',
      });
      expect(resultWithBrgy).toBe('Brgy. San Roque, Marikina');

      const resultWithBarangay = formatCompositeAddress({
        barangay: 'Barangay 1',
        city: 'Caloocan',
      });
      expect(resultWithBarangay).toBe('Barangay 1, Caloocan');
    });

    it('deduplicates when raw address string already includes the street name', () => {
      const result = formatCompositeAddress({
        street: 'Mabini Street',
        address: '123 Mabini Street, Malate',
        city: 'Manila',
      });
      expect(result).toBe('123 Mabini Street, Malate, Manila');
    });

    it('avoids duplicating province if province is identical to city name', () => {
      const result = formatCompositeAddress({
        street: '10 Main Road',
        city: 'Iloilo',
        province: 'Iloilo',
      });
      expect(result).toBe('10 Main Road, Iloilo');
    });
  });
});
