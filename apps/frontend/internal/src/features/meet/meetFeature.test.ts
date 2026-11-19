import {
  createMeetingSchema,
  createPollSchema,
  isBooleanValue,
  isValidParticipantRole,
  joinMeetingSchema,
} from './schemas/meetSchemas';
import {
  acceptIncomingCall,
  extractMeetingCodeFromInput,
  isCustomEventWithCode,
} from './utils/meetingNavigationHelper';

describe('Meet Feature Schemas & Navigation Helpers', () => {
  describe('extractMeetingCodeFromInput & joinMeetingSchema', () => {
    it('extracts meeting code from raw code or full meeting URL', () => {
      expect(extractMeetingCodeFromInput('  edg-a1b2c3d4  ')).toBe('edg-a1b2c3d4');
      expect(
        extractMeetingCodeFromInput('https://edge.ntc.gov.ph/meet?code=edg-99887766&tab=Live')
      ).toBe('edg-99887766');

      const parsed = joinMeetingSchema.parse({
        meetingCode: 'http://localhost:8081/meet?code=edg-abcd1234',
      });
      expect(parsed.meetingCode).toBe('edg-abcd1234');
    });
  });

  describe('createPollSchema', () => {
    it('validates 2 to 4 options and anonymous flag', () => {
      const valid = createPollSchema.safeParse({
        question: 'Approve regional deployment schedule?',
        option1: 'Approve',
        option2: 'Revise',
        option3: 'Defer',
        option4: '',
        isAnonymous: true,
      });
      expect(valid.success).toBe(true);
    });

    it('rejects short questions or missing required options', () => {
      const invalid = createPollSchema.safeParse({
        question: 'Hi',
        option1: 'Yes',
        option2: '',
        isAnonymous: false,
      });
      expect(invalid.success).toBe(false);
    });
  });

  describe('createMeetingSchema', () => {
    it('validates standard scheduled meeting fields', () => {
      const nowIso = new Date().toISOString();
      const res = createMeetingSchema.safeParse({
        title: 'NTC Regional Directors Sync',
        description: 'Monthly operational review',
        scope: 'InterRegional',
        meetingDate: '2026-11-20',
        meetingTime: '10:00',
        durationMinutes: 60,
        scheduledStartTime: nowIso,
      });
      expect(res.success).toBe(true);
    });
  });

  describe('runtime type guards', () => {
    it('validates boolean values strictly', () => {
      expect(isBooleanValue(true)).toBe(true);
      expect(isBooleanValue(false)).toBe(true);
      expect(isBooleanValue('true')).toBe(false);
      expect(isBooleanValue(1)).toBe(false);
    });

    it('validates participant roles strictly', () => {
      expect(isValidParticipantRole('Owner')).toBe(true);
      expect(isValidParticipantRole('Admin')).toBe(true);
      expect(isValidParticipantRole('Member')).toBe(true);
      expect(isValidParticipantRole('Guest')).toBe(false);
    });
  });

  describe('acceptIncomingCall & isCustomEventWithCode', () => {
    it('invokes navigation callback and recognizes valid CustomEvent payloads', () => {
      const navigatedScreens: string[] = [];
      acceptIncomingCall('edg-call7777', (screen) => navigatedScreens.push(screen), {
        audioOnly: true,
      });
      expect(navigatedScreens).toEqual(['Meet']);

      if (typeof CustomEvent === 'function') {
        const validEvt = new CustomEvent('edge_join_meeting', {
          detail: { code: 'edg-call7777', immediate: true, audioOnly: true },
        });
        expect(isCustomEventWithCode(validEvt)).toBe(true);
      }
    });
  });
});
