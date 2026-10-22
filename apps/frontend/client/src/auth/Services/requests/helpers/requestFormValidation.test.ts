// @ts-expect-error - bun test runtime module
import { describe, it, expect } from 'bun:test';
import {
  SPAM_COMPLAINT_NATURES,
  TELCO_COMPLAINT_NATURES,
} from './complaintNatures';
import { FIELD_GUID_MAP } from '../../shared/helpers/applicantFieldSynthesizer';

describe('Requests and Complaints Form Definitions (Client 4 - 8)', () => {
  it('Client 6: restricts Text Spam / Scam nature checkboxes strictly to Spam, Scam, Threat, Others', () => {
    expect(SPAM_COMPLAINT_NATURES).toEqual([
      'Spam',
      'Scam',
      'Threat',
      'Others',
    ]);
  });

  it('Client 7: restricts Telco / Broadcast nature checkboxes strictly to required 5 items', () => {
    expect(TELCO_COMPLAINT_NATURES).toEqual([
      'Billing Complaint',
      'Fair Use',
      'Poor Service (Technical Service/Customer Service)',
      'Denial of Subscription Plan',
      'Others',
    ]);
  });

  it('Client 4: maps incident_others_specify to standard field GUID', () => {
    expect(FIELD_GUID_MAP['incident_others_specify']).toBe(
      'fd000000-0000-0000-0000-000000000318'
    );
  });

  it('Client 5: maps unblocking fields (date of filing, date of recovery, unblocking details) to standard field GUIDs', () => {
    expect(FIELD_GUID_MAP['date_of_filing']).toBe(
      'fd000000-0000-0000-0000-000000000319'
    );
    expect(FIELD_GUID_MAP['date_of_recovery']).toBe(
      'fd000000-0000-0000-0000-000000000320'
    );
    expect(FIELD_GUID_MAP['unblocking_details']).toBe(
      'fd000000-0000-0000-0000-000000000321'
    );
  });

  it('Client 8: maps tape preservation broadcast fields to standard field GUIDs', () => {
    expect(FIELD_GUID_MAP['broadcast_station']).toBe(
      'fd000000-0000-0000-0000-000000000334'
    );
    expect(FIELD_GUID_MAP['program_name']).toBe(
      'fd000000-0000-0000-0000-000000000322'
    );
    expect(FIELD_GUID_MAP['time_of_airing']).toBe(
      'fd000000-0000-0000-0000-000000000335'
    );
    expect(FIELD_GUID_MAP['anchor_commentator']).toBe(
      'fd000000-0000-0000-0000-000000000323'
    );
  });
});
