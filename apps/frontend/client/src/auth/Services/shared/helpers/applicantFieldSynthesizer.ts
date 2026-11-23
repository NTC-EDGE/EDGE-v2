import { GeneralApplicantData } from '../types/generalApplicantTypes';
import { isSuppressedValue } from '../../../../shared/formPreview/core/formPreviewFieldCheckers';
import { formatCompositeAddress } from '../../../../shared/formPreview/core/formPreviewHelpers';

/**
 * Static GUID registry — mirrors FastTrackSeederData.cs / CommonSeederData.cs GetFieldsPool().
 * Keys are lowercase field-label slugs.
 * Values are the exact database GUIDs seeded at startup.
 */
export const FIELD_GUID_MAP: Record<string, string> = {
  // Core personal / applicant (fd000000-0000-0000-0000-0000000000xx)
  'full name / company name': 'fd000000-0000-0000-0000-000000000001',
  'full legal name':          'fd000000-0000-0000-0000-000000000001',
  'full name':                'fd000000-0000-0000-0000-000000000001',
  'applicant name':           'fd000000-0000-0000-0000-000000000001',
  'date of birth':            'fd000000-0000-0000-0000-000000000002',
  'birth date':               'fd000000-0000-0000-0000-000000000002',
  'complete address':         'fd000000-0000-0000-0000-000000000003',
  'address':                  'fd000000-0000-0000-0000-000000000003',
  'contact / mobile number':  'fd000000-0000-0000-0000-000000000004',
  'contact number':           'fd000000-0000-0000-0000-000000000004',
  'mobile number':            'fd000000-0000-0000-0000-000000000004',
  'email address':            'fd000000-0000-0000-0000-000000000005',
  'email':                    'fd000000-0000-0000-0000-000000000005',
  'education / school attended': 'fd000000-0000-0000-0000-000000000006',

  // NTC 1-01 exam
  'exam category':            'fd000000-0000-0000-0000-000000000007',
  'examinee type':            'fd000000-0000-0000-0000-000000000008',
  'selected exam elements':   'fd000000-0000-0000-0000-000000000009',
  'elements':                 'fd000000-0000-0000-0000-000000000009',
  'element':                  'fd000000-0000-0000-0000-000000000009',
  'selected elements':        'fd000000-0000-0000-0000-000000000009',
  'service variant & station class': 'fd000000-0000-0000-0000-000000000009',
  'service variant':          'fd000000-0000-0000-0000-000000000024',
  'application variant':      'fd000000-0000-0000-0000-000000000024',
  'special assistance details': 'fd000000-0000-0000-0000-000000000010',
  'admission slip number':    'fd000000-0000-0000-0000-000000000011',

  // Declarations & signatures
  'applicant signature':      'fd000000-0000-0000-0000-000000000012',
  'i hereby declare':         'fd000000-0000-0000-0000-000000000013',
  'official receipt (or) number': 'fd000000-0000-0000-0000-000000000021',
  'amount paid':              'fd000000-0000-0000-0000-000000000022',
  'payment date':             'fd000000-0000-0000-0000-000000000023',

  // Demographics
  'sex / gender':             'fd000000-0000-0000-0000-000000000041',
  'sex':                      'fd000000-0000-0000-0000-000000000041',
  'gender':                   'fd000000-0000-0000-0000-000000000041',
  'civil status':             'fd000000-0000-0000-0000-000000000042',
  'nationality / citizenship': 'fd000000-0000-0000-0000-000000000043',
  'nationality':              'fd000000-0000-0000-0000-000000000043',
  'citizenship':              'fd000000-0000-0000-0000-000000000043',

  // Granular Address
  'region':                   'fd000000-0000-0000-0000-000000000051',
  'province':                 'fd000000-0000-0000-0000-000000000052',
  'city / municipality':      'fd000000-0000-0000-0000-000000000053',
  'city':                     'fd000000-0000-0000-0000-000000000053',
  'barangay':                 'fd000000-0000-0000-0000-000000000054',
  'street address / unit / building': 'fd000000-0000-0000-0000-000000000055',
  'street address':           'fd000000-0000-0000-0000-000000000055',
  'street':                   'fd000000-0000-0000-0000-000000000055',
  'zip / postal code':        'fd000000-0000-0000-0000-000000000056',
  'zip code':                 'fd000000-0000-0000-0000-000000000056',
  'postal code':              'fd000000-0000-0000-0000-000000000056',

  // Education
  'school / university attended': 'fd000000-0000-0000-0000-000000000061',
  'school / university':          'fd000000-0000-0000-0000-000000000061',
  'school attended':              'fd000000-0000-0000-0000-000000000061',
  'course / degree program':      'fd000000-0000-0000-0000-000000000062',
  'course / degree':              'fd000000-0000-0000-0000-000000000062',
  'course taken':                 'fd000000-0000-0000-0000-000000000062',
  'year graduated':               'fd000000-0000-0000-0000-000000000063',

  // Corporate & Representative
  'company / business name':  'fd000000-0000-0000-0000-000000000081',
  'company name':             'fd000000-0000-0000-0000-000000000081',
  'company / corporation name': 'fd000000-0000-0000-0000-000000000081',
  'authorized representative name': 'fd000000-0000-0000-0000-000000000082',
  'representative name':      'fd000000-0000-0000-0000-000000000082',
  'designation / position':   'fd000000-0000-0000-0000-000000000083',
  'representative position':  'fd000000-0000-0000-0000-000000000083',
  'position':                 'fd000000-0000-0000-0000-000000000083',
  'make / type / model':      'fd000000-0000-0000-0000-000000000084',
  'device / equipment type':  'fd000000-0000-0000-0000-000000000085',
  'sec / dti registration number': 'fd000000-0000-0000-0000-000000000086',
  'sec/dti no':               'fd000000-0000-0000-0000-000000000086',

  // NTC 1-02 Certificate Specific
  'type of certificate':      'fd000000-0000-0000-0000-000000000014',
  'weight (kg)':              'fd000000-0000-0000-0000-000000000015',
  'height (cm)':              'fd000000-0000-0000-0000-000000000016',
  'employment status':        'fd000000-0000-0000-0000-000000000017',
  'employment type':          'fd000000-0000-0000-0000-000000000018',
  'employment location':      'fd000000-0000-0000-0000-000000000046',
  'seminar / exam address':   'fd000000-0000-0000-0000-000000000047',
  'exam / seminar date':      'fd000000-0000-0000-0000-000000000019',
  'rating':                   'fd000000-0000-0000-0000-000000000020',

  // Permits & Licenses
  'permit / license type':    'fd000000-0000-0000-0000-000000000024',
  'class of station':         'fd000000-0000-0000-0000-000000000025',
  'amateur club details':     'fd000000-0000-0000-0000-000000000026',
  'registration type':        'fd000000-0000-0000-0000-000000000045',

  // Technical Vessel & Station & Equipment
  'vessel name':              'fd000000-0000-0000-0000-000000000027',
  'call sign':                'fd000000-0000-0000-0000-000000000028',
  'imo number / gross tonnage': 'fd000000-0000-0000-0000-000000000029',
  'particulars of equipment': 'fd000000-0000-0000-0000-000000000030',
  'equipment technical details': 'fd000000-0000-0000-0000-000000000030',
  'radio officers details':   'fd000000-0000-0000-0000-000000000031',
  'station location / coordinates': 'fd000000-0000-0000-0000-000000000032',
  'antenna technical details': 'fd000000-0000-0000-0000-000000000033',

  // NTC 1-09 permit fields
  'station class':            'fd000000-0000-0000-0000-000000000101',
  'service area':             'fd000000-0000-0000-0000-000000000102',
  'frequency / frequencies':  'fd000000-0000-0000-0000-000000000103',
  'bandwidth':                'fd000000-0000-0000-0000-000000000104',
  'emission':                 'fd000000-0000-0000-0000-000000000105',
  'power output':             'fd000000-0000-0000-0000-000000000106',
  'hours of operation':       'fd000000-0000-0000-0000-000000000107',
  'configuration':            'fd000000-0000-0000-0000-000000000108',
  'data rate':                'fd000000-0000-0000-0000-000000000109',
  'remarks':                  'fd000000-0000-0000-0000-000000000110',
  'serial number':            'fd000000-0000-0000-0000-000000000111',
  'frequency range':          'fd000000-0000-0000-0000-000000000112',
  'antenna type':             'fd000000-0000-0000-0000-000000000113',
  'antenna height':           'fd000000-0000-0000-0000-000000000114',
  'antenna gain':             'fd000000-0000-0000-0000-000000000115',
  'antenna directivity':      'fd000000-0000-0000-0000-000000000116',
  'antenna diameter':         'fd000000-0000-0000-0000-000000000117',
  'antenna polarization':     'fd000000-0000-0000-0000-000000000118',
  'antenna beamwidth':        'fd000000-0000-0000-0000-000000000119',
  'antenna remarks':          'fd000000-0000-0000-0000-000000000128',
  'dealer name':              'fd000000-0000-0000-0000-000000000120',
  'authorized seller / buyer': 'fd000000-0000-0000-0000-000000000121',
  'or / invoice no':          'fd000000-0000-0000-0000-000000000122',
  'permit / rsl no':          'fd000000-0000-0000-0000-000000000123',
  'seller address':           'fd000000-0000-0000-0000-000000000124',
  'amateur license no':       'fd000000-0000-0000-0000-000000000125',
  'intended use of equipment': 'fd000000-0000-0000-0000-000000000126',
  'intended use type':        'fd000000-0000-0000-0000-000000000126',
  'intended use':             'fd000000-0000-0000-0000-000000000126',
  'specify details':          'fd000000-0000-0000-0000-000000000127',

  // Amateur station license
  'application type':         'fd000000-0000-0000-0000-000000000200',
  'number of years':          'fd000000-0000-0000-0000-000000000201',
  'existing license no':      'fd000000-0000-0000-0000-000000000202',
  'license expiry date':      'fd000000-0000-0000-0000-000000000203',
  'modification due to':      'fd000000-0000-0000-0000-000000000204',
  'place of exam / seminar':  'fd000000-0000-0000-0000-000000000205',
  'date of exam / seminar':   'fd000000-0000-0000-0000-000000000206',
  'ratings / exam score details': 'fd000000-0000-0000-0000-000000000207',
  'particulars of radio equipment (json)': 'fd000000-0000-0000-0000-000000000208',
  'station location / installation address': 'fd000000-0000-0000-0000-000000000209',
  'middle name':              'fd000000-0000-0000-0000-000000000210',
  'suffix':                   'fd000000-0000-0000-0000-000000000211',

  // VAS Registration
  'type of entity':           'fd000000-0000-0000-0000-000000000230',
  'entity type':              'fd000000-0000-0000-0000-000000000230',
  'cpcn / pa / ca no.':       'fd000000-0000-0000-0000-000000000231',
  'cpcn / pa / ca no':        'fd000000-0000-0000-0000-000000000231',
  'cpcn / pa / ca license no': 'fd000000-0000-0000-0000-000000000231',
  'cpcn/pa/ca license no':    'fd000000-0000-0000-0000-000000000231',
  'cpcn / pa / ca no. date of expiry': 'fd000000-0000-0000-0000-000000000232',
  'cpcn / pa / ca date of expiry': 'fd000000-0000-0000-0000-000000000232',
  'cpcn date of expiry':      'fd000000-0000-0000-0000-000000000232',
  'cpcn/pa/ca expiration date': 'fd000000-0000-0000-0000-000000000232',
  'cor / vas no.':            'fd000000-0000-0000-0000-000000000233',
  'cor / vas no':             'fd000000-0000-0000-0000-000000000233',
  'cor/vas certificate no':   'fd000000-0000-0000-0000-000000000233',
  'cor / vas no. date of expiry': 'fd000000-0000-0000-0000-000000000238',
  'cor / vas no. expiry date': 'fd000000-0000-0000-0000-000000000238',
  'cor / vas date of expiry': 'fd000000-0000-0000-0000-000000000238',
  'cor/vas expiry date':      'fd000000-0000-0000-0000-000000000238',
  'known by other name':      'fd000000-0000-0000-0000-000000000234',
  'known by another name':    'fd000000-0000-0000-0000-000000000234',
  'please specify':           'fd000000-0000-0000-0000-000000000235',
  'other trade name':         'fd000000-0000-0000-0000-000000000235',
  'operating trade name':     'fd000000-0000-0000-0000-000000000235',
  'vas registration no. (assigned by ntc)': 'fd000000-0000-0000-0000-000000000236',
  'vas registration no':      'fd000000-0000-0000-0000-000000000236',
  'vas registration':         'fd000000-0000-0000-0000-000000000236',

  // NTC 1-24 Blocking / Unblocking
  'action requested':         'fd000000-0000-0000-0000-000000000307',
  'action_requested':         'fd000000-0000-0000-0000-000000000307',
  'make / model / type':      'fd000000-0000-0000-0000-000000000308',
  'make_model_type':          'fd000000-0000-0000-0000-000000000308',
  'international mobile equipment identification (imei)': 'fd000000-0000-0000-0000-000000000309',
  'imei number':              'fd000000-0000-0000-0000-000000000309',
  'imei_number':              'fd000000-0000-0000-0000-000000000309',
  'subscriber identity module (sim) / cell phone number': 'fd000000-0000-0000-0000-000000000310',
  'government identification attached': 'fd000000-0000-0000-0000-000000000311',
  'identity_proof_type':      'fd000000-0000-0000-0000-000000000311',
  'proof of ownership':       'fd000000-0000-0000-0000-000000000312',
  'proof_of_ownership_type':  'fd000000-0000-0000-0000-000000000312',
  'incident type':            'fd000000-0000-0000-0000-000000000313',
  'loss_reason':              'fd000000-0000-0000-0000-000000000313',
  'age group':                'fd000000-0000-0000-0000-000000000314',
  'age_group':                'fd000000-0000-0000-0000-000000000314',
  'place of incident':        'fd000000-0000-0000-0000-000000000315',
  'place_of_incident':        'fd000000-0000-0000-0000-000000000315',
  'date of incident':         'fd000000-0000-0000-0000-000000000316',
  'date_of_incident':         'fd000000-0000-0000-0000-000000000316',
  'time of incident (daytime/nighttime)': 'fd000000-0000-0000-0000-000000000317',
  'time_of_day':              'fd000000-0000-0000-0000-000000000317',
  'device particulars':       'fd000000-0000-0000-0000-000000000332',
  'device_particulars':       'fd000000-0000-0000-0000-000000000332',
  'sim card / mobile numbers': 'fd000000-0000-0000-0000-000000000333',
  'sim_mobile_numbers':       'fd000000-0000-0000-0000-000000000333',
  'incident_others_specify':  'fd000000-0000-0000-0000-000000000318',
  'date of filing':           'fd000000-0000-0000-0000-000000000319',
  'date_of_filing':           'fd000000-0000-0000-0000-000000000319',
  'date of recovery':         'fd000000-0000-0000-0000-000000000320',
  'date_of_recovery':         'fd000000-0000-0000-0000-000000000320',
  'unblocking details':       'fd000000-0000-0000-0000-000000000321',
  'unblocking_details':       'fd000000-0000-0000-0000-000000000321',

  // NTC 1-25 Complaints & Tape Preservation
  'broadcast station':        'fd000000-0000-0000-0000-000000000334',
  'broadcast_station':        'fd000000-0000-0000-0000-000000000334',
  'program name':             'fd000000-0000-0000-0000-000000000322',
  'program_name':             'fd000000-0000-0000-0000-000000000322',
  'time of airing':           'fd000000-0000-0000-0000-000000000335',
  'time_of_airing':           'fd000000-0000-0000-0000-000000000335',
  'anchor / commentator':     'fd000000-0000-0000-0000-000000000323',
  'anchor/commentator':       'fd000000-0000-0000-0000-000000000323',
  'anchor_commentator':       'fd000000-0000-0000-0000-000000000323',
  'date of airing':           'fd000000-0000-0000-0000-000000000316',
  'provider business name':   'fd000000-0000-0000-0000-000000000324',
  'provider_business_name':   'fd000000-0000-0000-0000-000000000324',
  'provider business address': 'fd000000-0000-0000-0000-000000000325',
  'provider_business_address': 'fd000000-0000-0000-0000-000000000325',
  'provider contact number':  'fd000000-0000-0000-0000-000000000326',
  'provider_contact_number':  'fd000000-0000-0000-0000-000000000326',
  'nature of complaint':      'fd000000-0000-0000-0000-000000000327',
  'complaint category':       'fd000000-0000-0000-0000-000000000327',
  'complaint_types':          'fd000000-0000-0000-0000-000000000327',
  'if others, please specify': 'fd000000-0000-0000-0000-000000000328',
  'others_specification':     'fd000000-0000-0000-0000-000000000328',
  'time of incident/transaction': 'fd000000-0000-0000-0000-000000000329',
  'time of incident':         'fd000000-0000-0000-0000-000000000329',
  'time_of_incident':         'fd000000-0000-0000-0000-000000000329',
  'state briefly the details of complaint': 'fd000000-0000-0000-0000-000000000330',
  'details of complaint':     'fd000000-0000-0000-0000-000000000330',
  'state_briefly_details':    'fd000000-0000-0000-0000-000000000330',
  'attached proof / supporting documents': 'fd000000-0000-0000-0000-000000000331',
  'attached proof documents': 'fd000000-0000-0000-0000-000000000331',
  'attached_proof_documents': 'fd000000-0000-0000-0000-000000000331',

  // Repeater Field for Station Particulars (Amateur Permits NTC 1-09)
  'particulars':              'fd000000-0000-0000-0000-000000000340',
  'station particulars':      'fd000000-0000-0000-0000-000000000340',
  'station / class particulars': 'fd000000-0000-0000-0000-000000000340',
  'particulars of radio station': 'fd000000-0000-0000-0000-000000000340',

  // Copy of Permits (NTC 1-21)
  'detailsservice':           'fd000000-0000-0000-0000-000000000244',
  'details_service':          'fd000000-0000-0000-0000-000000000244',
  'targetpermittype':         'fd000000-0000-0000-0000-000000000245',
  'target_permit_type':       'fd000000-0000-0000-0000-000000000245',
  'permitno':                 'fd000000-0000-0000-0000-000000000246',
  'permit_no':                'fd000000-0000-0000-0000-000000000246',
  'permit no.':               'fd000000-0000-0000-0000-000000000246',
  'permit no':                'fd000000-0000-0000-0000-000000000246',
  'no of copies':             'fd000000-0000-0000-0000-000000000243',
  'no. of copies':            'fd000000-0000-0000-0000-000000000243',
  'no_of_copies':             'fd000000-0000-0000-0000-000000000243',
  'noofcopies':               'fd000000-0000-0000-0000-000000000243',
};

/**
 * Reverse lookup map (lowercase GUID -> human-readable field label) for friendly error messages.
 */
export const FIELD_LABEL_BY_GUID: Record<string, string> = {
  'fd000000-0000-0000-0000-000000000001': 'Full Legal Name',
  'fd000000-0000-0000-0000-000000000002': 'Date of Birth',
  'fd000000-0000-0000-0000-000000000003': 'Complete Address',
  'fd000000-0000-0000-0000-000000000004': 'Contact / Mobile Number',
  'fd000000-0000-0000-0000-000000000005': 'Email Address',
  'fd000000-0000-0000-0000-000000000006': 'Education / School Attended',
  'fd000000-0000-0000-0000-000000000007': 'Exam Category',
  'fd000000-0000-0000-0000-000000000008': 'Examinee Type',
  'fd000000-0000-0000-0000-000000000009': 'Selected Exam Elements',
  'fd000000-0000-0000-0000-000000000010': 'Special Assistance Details',
  'fd000000-0000-0000-0000-000000000011': 'Admission Slip Number',
  'fd000000-0000-0000-0000-000000000012': 'Applicant Signature',
  'fd000000-0000-0000-0000-000000000013': 'Declaration',
  'fd000000-0000-0000-0000-000000000014': 'Type of Certificate',
  'fd000000-0000-0000-0000-000000000015': 'Weight (kg)',
  'fd000000-0000-0000-0000-000000000016': 'Height (cm)',
  'fd000000-0000-0000-0000-000000000017': 'Employment Status',
  'fd000000-0000-0000-0000-000000000018': 'Employment Type',
  'fd000000-0000-0000-0000-000000000019': 'Exam / Seminar Date',
  'fd000000-0000-0000-0000-000000000020': 'Rating',
  'fd000000-0000-0000-0000-000000000021': 'Official Receipt (OR) Number',
  'fd000000-0000-0000-0000-000000000022': 'Amount Paid',
  'fd000000-0000-0000-0000-000000000023': 'Payment Date',
  'fd000000-0000-0000-0000-000000000024': 'Permit / License Type',
  'fd000000-0000-0000-0000-000000000025': 'Class of Station',
  'fd000000-0000-0000-0000-000000000026': 'Amateur Club Details',
  'fd000000-0000-0000-0000-000000000027': 'Vessel Name',
  'fd000000-0000-0000-0000-000000000028': 'Call Sign',
  'fd000000-0000-0000-0000-000000000029': 'IMO Number / Gross Tonnage',
  'fd000000-0000-0000-0000-000000000030': 'Particulars of Equipment',
  'fd000000-0000-0000-0000-000000000031': 'Radio Officers Details',
  'fd000000-0000-0000-0000-000000000032': 'Station Location / Coordinates',
  'fd000000-0000-0000-0000-000000000033': 'Antenna Technical Details',
  'fd000000-0000-0000-0000-000000000034': 'ECE / Technician Personnel Details',
  'fd000000-0000-0000-0000-000000000035': 'Registered Devices Details',
  'fd000000-0000-0000-0000-000000000036': 'Value-Added Services / Category',
  'fd000000-0000-0000-0000-000000000037': 'Circumstances',
  'fd000000-0000-0000-0000-000000000038': 'TVRO / CATV Details',
  'fd000000-0000-0000-0000-000000000041': 'Sex / Gender',
  'fd000000-0000-0000-0000-000000000042': 'Civil Status',
  'fd000000-0000-0000-0000-000000000043': 'Nationality / Citizenship',
  'fd000000-0000-0000-0000-000000000045': 'Registration Type',
  'fd000000-0000-0000-0000-000000000046': 'Employment Location',
  'fd000000-0000-0000-0000-000000000047': 'Seminar / Exam Address',
  'fd000000-0000-0000-0000-000000000051': 'Region',
  'fd000000-0000-0000-0000-000000000052': 'Province',
  'fd000000-0000-0000-0000-000000000053': 'City / Municipality',
  'fd000000-0000-0000-0000-000000000054': 'Barangay',
  'fd000000-0000-0000-0000-000000000055': 'Street Address / Unit / Building',
  'fd000000-0000-0000-0000-000000000056': 'Zip / Postal Code',
  'fd000000-0000-0000-0000-000000000061': 'School / University Attended',
  'fd000000-0000-0000-0000-000000000062': 'Course / Degree Program',
  'fd000000-0000-0000-0000-000000000063': 'Year Graduated',
  'fd000000-0000-0000-0000-000000000071': 'Emergency Contact Person',
  'fd000000-0000-0000-0000-000000000072': 'Emergency Contact Number',
  'fd000000-0000-0000-0000-000000000081': 'Company / Business Name',
  'fd000000-0000-0000-0000-000000000082': 'Authorized Representative Name',
  'fd000000-0000-0000-0000-000000000083': 'Designation / Position',
  'fd000000-0000-0000-0000-000000000084': 'Make / Type / Model',
  'fd000000-0000-0000-0000-000000000085': 'Device / Equipment Type',
  'fd000000-0000-0000-0000-000000000086': 'SEC / DTI Registration Number',
  'fd000000-0000-0000-0000-000000000087': 'Serial Number(s)',
  'fd000000-0000-0000-0000-000000000088': 'Applicant Name',
  'fd000000-0000-0000-0000-000000000101': 'Station Class',
  'fd000000-0000-0000-0000-000000000102': 'Service Area',
  'fd000000-0000-0000-0000-000000000103': 'Frequency / Frequencies',
  'fd000000-0000-0000-0000-000000000104': 'Bandwidth',
  'fd000000-0000-0000-0000-000000000105': 'Emission',
  'fd000000-0000-0000-0000-000000000106': 'Power Output',
  'fd000000-0000-0000-0000-000000000107': 'Hours of Operation',
  'fd000000-0000-0000-0000-000000000108': 'Configuration',
  'fd000000-0000-0000-0000-000000000109': 'Data Rate',
  'fd000000-0000-0000-0000-000000000110': 'Remarks',
  'fd000000-0000-0000-0000-000000000111': 'Serial Number',
  'fd000000-0000-0000-0000-000000000112': 'Frequency Range',
  'fd000000-0000-0000-0000-000000000113': 'Antenna Type',
  'fd000000-0000-0000-0000-000000000114': 'Antenna Height',
  'fd000000-0000-0000-0000-000000000115': 'Antenna Gain',
  'fd000000-0000-0000-0000-000000000116': 'Antenna Directivity',
  'fd000000-0000-0000-0000-000000000117': 'Antenna Diameter',
  'fd000000-0000-0000-0000-000000000118': 'Antenna Polarization',
  'fd000000-0000-0000-0000-000000000119': 'Antenna Beamwidth',
  'fd000000-0000-0000-0000-000000000120': 'Name of Dealer',
  'fd000000-0000-0000-0000-000000000121': 'Authorized Seller / Buyer',
  'fd000000-0000-0000-0000-000000000122': 'OR / Invoice No.',
  'fd000000-0000-0000-0000-000000000123': 'Permit / RSL No.',
  'fd000000-0000-0000-0000-000000000124': 'Seller Address',
  'fd000000-0000-0000-0000-000000000125': 'Amateur License No.',
  'fd000000-0000-0000-0000-000000000126': 'Intended Use of Equipment',
  'fd000000-0000-0000-0000-000000000127': 'Specify Details',
  'fd000000-0000-0000-0000-000000000128': 'Antenna Remarks',
  'fd000000-0000-0000-0000-000000000129': 'Nature of Service',
  'fd000000-0000-0000-0000-000000000130': 'Class of Station',
  'fd000000-0000-0000-0000-000000000131': 'Class of Station',
  'fd000000-0000-0000-0000-000000000132': 'Frequency Unit',
  'fd000000-0000-0000-0000-000000000200': 'Application Type',
  'fd000000-0000-0000-0000-000000000201': 'Number of Years',
  'fd000000-0000-0000-0000-000000000202': 'Existing License No.',
  'fd000000-0000-0000-0000-000000000203': 'License Expiry Date',
  'fd000000-0000-0000-0000-000000000204': 'Modification Due To',
  'fd000000-0000-0000-0000-000000000205': 'Place of Exam / Seminar',
  'fd000000-0000-0000-0000-000000000206': 'Date of Exam / Seminar',
  'fd000000-0000-0000-0000-000000000207': 'Ratings / Exam Score Details',
  'fd000000-0000-0000-0000-000000000208': 'Particulars of Radio Equipment',
  'fd000000-0000-0000-0000-000000000209': 'Station Location / Installation Address',
  'fd000000-0000-0000-0000-000000000210': 'Middle Name',
  'fd000000-0000-0000-0000-000000000211': 'Suffix',
  'fd000000-0000-0000-0000-000000000220': 'Exact Location of TVRO System',
  'fd000000-0000-0000-0000-000000000221': 'Longitude',
  'fd000000-0000-0000-0000-000000000222': 'Latitude',
  'fd000000-0000-0000-0000-000000000223': 'Particulars of Equipment',
  'fd000000-0000-0000-0000-000000000224': 'Particulars of Antenna System',
  'fd000000-0000-0000-0000-000000000225': 'Particulars of Signal to be Received',
  'fd000000-0000-0000-0000-000000000226': 'BSD No.',
  'fd000000-0000-0000-0000-000000000228': 'Invoice Number',
  'fd000000-0000-0000-0000-000000000230': 'Entity Type',
  'fd000000-0000-0000-0000-000000000231': 'CPCN / PA / CA No.',
  'fd000000-0000-0000-0000-000000000232': 'CPCN / PA / CA No. Date of Expiry',
  'fd000000-0000-0000-0000-000000000233': 'COR / VAS No.',
  'fd000000-0000-0000-0000-000000000234': 'Known by other Name',
  'fd000000-0000-0000-0000-000000000235': 'Operating Trade Name',
  'fd000000-0000-0000-0000-000000000236': 'VAS Registration No.',
  'fd000000-0000-0000-0000-000000000237': 'Service Classification',
  'fd000000-0000-0000-0000-000000000238': 'COR / VAS No. Date of Expiry',
  'fd000000-0000-0000-0000-000000000240': 'Service',
  'fd000000-0000-0000-0000-000000000241': 'Certificate Type',
  'fd000000-0000-0000-0000-000000000242': 'Certificate Number',
  'fd000000-0000-0000-0000-000000000243': 'No. of Copies',
  'fd000000-0000-0000-0000-000000000244': 'Details Service',
  'fd000000-0000-0000-0000-000000000245': 'Permit Type',
  'fd000000-0000-0000-0000-000000000246': 'Permit No.',
  'fd000000-0000-0000-0000-000000000250': 'Certificate/ECT No.',
  'fd000000-0000-0000-0000-000000000251': 'Certificate/Number Date of Expiry',
  'fd000000-0000-0000-0000-000000000252': 'Supervising Engineer',
  'fd000000-0000-0000-0000-000000000253': 'Technician Name',
  'fd000000-0000-0000-0000-000000000254': 'Certificate/Number',
  'fd000000-0000-0000-0000-000000000255': 'Certificate/ECT No. Date of Expiry',
  'fd000000-0000-0000-0000-000000000260': 'Bandwidth Unit',
  'fd000000-0000-0000-0000-000000000261': 'Preferred Call Sign/s',
  'fd000000-0000-0000-0000-000000000262': 'Number of Units',
  'fd000000-0000-0000-0000-000000000266': 'Amateur License No. / Permit to Possess No.',
  'fd000000-0000-0000-0000-000000000267': 'Particulars of Proposed Equipment',
  'fd000000-0000-0000-0000-000000000270': 'Make / Model',
  'fd000000-0000-0000-0000-000000000271': 'Officer / Technician Name',
  'fd000000-0000-0000-0000-000000000272': 'Certificate / Registration Number',
  'fd000000-0000-0000-0000-000000000273': 'Expiry Date',
  'fd000000-0000-0000-0000-000000000274': 'Citizenship',
  'fd000000-0000-0000-0000-000000000275': 'Station License No.',
  'fd000000-0000-0000-0000-000000000280': 'Class of Amateur',
  'fd000000-0000-0000-0000-000000000281': 'Handle Name',
  'fd000000-0000-0000-0000-000000000282': 'Club Name',
  'fd000000-0000-0000-0000-000000000283': 'Trustee Name',
  'fd000000-0000-0000-0000-000000000284': 'Trustee Call Sign',
  'fd000000-0000-0000-0000-000000000285': 'Trustee License No.',
  'fd000000-0000-0000-0000-000000000286': 'Club Address',
  'fd000000-0000-0000-0000-000000000287': 'Station Type',
  'fd000000-0000-0000-0000-000000000288': 'Authorized Power',
  'fd000000-0000-0000-0000-000000000289': 'Frequency Bands',
  'fd000000-0000-0000-0000-000000000290': 'Aircraft Registration No. (RP-)',
  'fd000000-0000-0000-0000-000000000291': 'Aircraft Make / Model',
  'fd000000-0000-0000-0000-000000000292': 'Aircraft Serial No.',
  'fd000000-0000-0000-0000-000000000293': 'Registered Owner',
  'fd000000-0000-0000-0000-000000000294': 'Base of Operation / Home Airport',
  'fd000000-0000-0000-0000-000000000295': 'Carrier Frequency',
  'fd000000-0000-0000-0000-000000000296': 'Channel Capacity',
  'fd000000-0000-0000-0000-000000000297': 'Azimuth Angle',
  'fd000000-0000-0000-0000-000000000298': 'Elevation Angle',
  'fd000000-0000-0000-0000-000000000307': 'Action Requested',
  'fd000000-0000-0000-0000-000000000308': 'Make / Model / Type',
  'fd000000-0000-0000-0000-000000000309': 'IMEI Number',
  'fd000000-0000-0000-0000-000000000310': 'SIM / Cell Phone Number',
  'fd000000-0000-0000-0000-000000000311': 'Government Identification Attached',
  'fd000000-0000-0000-0000-000000000312': 'Proof of Ownership',
  'fd000000-0000-0000-0000-000000000313': 'Incident Type',
  'fd000000-0000-0000-0000-000000000314': 'Age Group',
  'fd000000-0000-0000-0000-000000000315': 'Place of Incident',
  'fd000000-0000-0000-0000-000000000316': 'Date of Incident',
  'fd000000-0000-0000-0000-000000000317': 'Time of Incident',
  'fd000000-0000-0000-0000-000000000318': 'Please Specify',
  'fd000000-0000-0000-0000-000000000319': 'Date of Filing',
  'fd000000-0000-0000-0000-000000000320': 'Date of Recovery',
  'fd000000-0000-0000-0000-000000000321': 'Details',
  'fd000000-0000-0000-0000-000000000322': 'Program Name',
  'fd000000-0000-0000-0000-000000000323': 'Anchor / Commentator',
  'fd000000-0000-0000-0000-000000000324': 'Provider Business Name',
  'fd000000-0000-0000-0000-000000000325': 'Provider Business Address',
  'fd000000-0000-0000-0000-000000000326': 'Provider Contact Number',
  'fd000000-0000-0000-0000-000000000327': 'Nature of Complaint',
  'fd000000-0000-0000-0000-000000000328': 'If Others, Please Specify',
  'fd000000-0000-0000-0000-000000000329': 'Time of Incident / Transaction',
  'fd000000-0000-0000-0000-000000000330': 'Details of Complaint',
  'fd000000-0000-0000-0000-000000000331': 'Attached Proof / Supporting Documents',
  'fd000000-0000-0000-0000-000000000332': 'Device Particulars',
  'fd000000-0000-0000-0000-000000000333': 'SIM Card / Mobile Numbers',
  'fd000000-0000-0000-0000-000000000334': 'Broadcast Station',
  'fd000000-0000-0000-0000-000000000335': 'Time of Airing',
  'fd000000-0000-0000-0000-000000000340': 'Station / Class Particulars',
};

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuidString(value: string | undefined | null): boolean {
  if (!value) return false;
  return UUID_REGEX.test(value.trim());
}

/**
 * Resolves a human-readable field label for validation messages so raw UUIDs are never displayed to clients.
 */
export function resolveFriendlyFieldLabel(
  fieldIdOrKey: string,
  labelMap?: Map<string, string>,
  dynamicFieldLabels?: Record<string, string>
): string {
  const raw = (fieldIdOrKey || '').trim();
  const lower = raw.toLowerCase();

  const fromLabelMap = labelMap?.get(lower) || labelMap?.get(raw);
  if (fromLabelMap && !isUuidString(fromLabelMap)) {
    return fromLabelMap;
  }

  const fromDynamicLabels = dynamicFieldLabels?.[raw] || dynamicFieldLabels?.[lower];
  if (fromDynamicLabels && !isUuidString(fromDynamicLabels)) {
    return fromDynamicLabels;
  }

  const fromGuidLookup = FIELD_LABEL_BY_GUID[lower];
  if (fromGuidLookup) {
    return fromGuidLookup;
  }

  if (isUuidString(raw)) {
    return '';
  }

  return raw;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export interface SynthesizedFormFieldValue {
  fieldId: string;
  fieldLabel: string;
  value: string;
}

export interface SchemaFieldRef {
  id?: string;
  fieldId?: string;
  label?: string;
}

export interface SchemaSectionRef {
  id?: string;
  key?: string;
  title?: string;
  fields?: SchemaFieldRef[];
}

export interface SchemaRef {
  sections?: SchemaSectionRef[];
}

/**
 * Resolves a field ID by searching:
 * 1. The provided formFields array (exact label match)
 * 2. The static GUID map
 * 3. The provided formFields array (partial label match)
 * 4. Fallback to existing or deterministic slug
 */
export function resolveCanonicalFieldId(
  label: string,
  existingFieldId: string | undefined,
  formFields: SchemaFieldRef[] = []
): string {
  if (existingFieldId && existingFieldId.includes('-') && existingFieldId.length >= 32) {
    return existingFieldId;
  }

  const lowerLabel = label.toLowerCase().trim();

  // 1. Direct match in formFields
  const directMatch = formFields.find((f) => {
    const fl = (f.label || '').toLowerCase().trim();
    return fl === lowerLabel;
  });
  if (directMatch) {
    const fid = directMatch.fieldId || directMatch.id;
    if (fid) return fid;
  }

  // 2. Exact match in static GUID map
  const exactGuid = FIELD_GUID_MAP[lowerLabel];
  if (exactGuid) return exactGuid;

  // 3. Partial match in static GUID map
  for (const [key, guid] of Object.entries(FIELD_GUID_MAP)) {
    if (lowerLabel.includes(key) || key.includes(lowerLabel)) {
      return guid;
    }
  }

  // 4. Partial match in formFields
  const partialMatch = formFields.find((f) => {
    const fl = (f.label || '').toLowerCase().trim();
    return fl.length > 2 && (lowerLabel.includes(fl) || fl.includes(lowerLabel));
  });
  if (partialMatch) {
    const fid = partialMatch.fieldId || partialMatch.id;
    if (fid) return fid;
  }

  if (existingFieldId && existingFieldId.trim() !== '') {
    return existingFieldId;
  }

  return `f-${lowerLabel.replace(/[^a-z0-9]+/g, '-')}`;
}

/**
 * Synthesizes all filled fields from the applicant record (dynamic form fields,
 * standard applicant details, and specialized wizard models) into a unified,
 * deduplicated list of FormFieldValue objects.
 */
export function synthesizeAllApplicantFieldValues(
  applicant: Partial<GeneralApplicantData> | null | undefined,
  formOrFields?: SchemaRef | SchemaFieldRef[] | null
): SynthesizedFormFieldValue[] {
  if (!applicant) return [];

  const flatFormFields: SchemaFieldRef[] = Array.isArray(formOrFields)
    ? formOrFields
    : (formOrFields && Array.isArray(formOrFields.sections))
      ? formOrFields.sections.flatMap((s) => s.fields || [])
      : [];

  const result: SynthesizedFormFieldValue[] = [];
  const addedFieldIds = new Set<string>();
  const addedLabels = new Set<string>();

  const addField = (fieldId: string | undefined, label: string, val: string | null | undefined) => {
    if (val === null || val === undefined) return;
    const trimmedVal = typeof val === 'string' ? val.trim() : String(val).trim();
    if (trimmedVal === '' || isSuppressedValue(trimmedVal)) return;

    const labelKey = label.toLowerCase().trim();
    if (addedLabels.has(labelKey)) return;

    const resolvedId = resolveCanonicalFieldId(label, fieldId, flatFormFields);
    const idKey = resolvedId.toLowerCase().trim();

    if (addedFieldIds.has(idKey)) return;

    addedLabels.add(labelKey);
    addedFieldIds.add(idKey);
    result.push({
      fieldId: resolvedId,
      fieldLabel: label,
      value: trimmedVal,
    });
  };

  // ── 0. Pre-synthesize locked / auto-determined fields ─────────────────────
  // NTC 1-24 Blocking / Unblocking: "Action Requested" is locked by application type / variant
  const varDesc = (applicant.selectedVariantName || "").toLowerCase();
  const varId = (applicant.selectedVariantId || "").toLowerCase();
  const isReqUnblocking = varDesc.includes("unblock") || varId.includes("402");
  const isReqBlocking = (varDesc.includes("block") || varId.includes("401")) && !isReqUnblocking;

  if (isReqBlocking || isReqUnblocking) {
    const actionRequestedVal = isReqUnblocking ? "UNBLOCK GSM Handset" : "BLOCK GSM Handset";
    addField("fd000000-0000-0000-0000-000000000307", "Action Requested", actionRequestedVal);
    addField("action_requested", "Action Requested", actionRequestedVal);
  }

  // ── 1. Ingest existing dynamic formFieldValues ──────────────────────────────
  if (applicant.formFieldValues && Array.isArray(applicant.formFieldValues)) {
    applicant.formFieldValues.forEach((fv) => {
      if (fv.fieldLabel && fv.value) {
        addField(fv.fieldId, fv.fieldLabel, fv.value);
      }
    });
  }

  // ── 2. Specialized Models ──────────────────────────────────────────────────
  // 2a. Permit Data (NTC 1-09)
  const hasDynamicFieldValues = Boolean(
    applicant.formFieldValues &&
    applicant.formFieldValues.length > 0 &&
    applicant.formFieldValues.some((fv) => fv.value && !isSuppressedValue(fv.value))
  );
  const pData = hasDynamicFieldValues ? null : applicant.permitData;
  if (pData) {
    addField(undefined, 'Application Type', pData.applicationType);
    addField(undefined, 'Call Sign', pData.callSign);
    addField(undefined, 'Station Class', pData.stationClass);
    addField(undefined, 'Service Area', pData.serviceArea);
    addField(undefined, 'Assigned Frequency', pData.frequency);
    addField(undefined, 'Bandwidth', pData.bandwidth ? `${pData.bandwidth} ${pData.unit || ''}`.trim() : null);
    addField(undefined, 'Emission', pData.emission);
    addField(undefined, 'Power Output', pData.powerOutput);
    addField(undefined, 'Hours of Operation', pData.hoursOfOperation);
    addField(undefined, 'Configuration', pData.configuration);
    addField(undefined, 'Data Rate', pData.dataRate);
    addField(undefined, 'Remarks', pData.remarks);
    addField(undefined, 'Name of Dealer / Seller', pData.nameOfDealer || pData.nameOfDealerOrSeller);
    addField(undefined, 'Authorized Seller / Buyer', pData.authorizedSellerBuyer);
    addField(undefined, 'OR / Invoice No', pData.orInvoiceNo);
    addField(undefined, 'Permit / RSL No', pData.permitRslNo);
    addField(undefined, 'Seller Address', pData.sellerAddress);
    addField(undefined, 'Amateur License No', pData.amateurLicenseNoOrPermitToPossessNo);

    if (Array.isArray(pData.purchaseEquipments)) {
      pData.purchaseEquipments.forEach((peq, idx) => {
        addField(undefined, `Purchase Equipment #${idx + 1} Class of Station`, peq.classOfStation);
      });
    }

    if (Array.isArray(pData.equipments)) {
      pData.equipments.forEach((eq, idx) => {
        addField(undefined, `Equipment #${idx + 1} Serial Number`, eq.serialNumber);
        addField(undefined, `Equipment #${idx + 1} Frequency Range`, eq.frequencyRange);
      });
    }

    if (Array.isArray(pData.stationParticulars)) {
      pData.stationParticulars.forEach((sp, idx) => {
        addField(undefined, `Station #${idx + 1} Class`, sp.stationClass);
        addField(undefined, `Station #${idx + 1} Location`, sp.exactLocation);
        addField(undefined, `Station #${idx + 1} Longitude`, sp.longitude);
        addField(undefined, `Station #${idx + 1} Latitude`, sp.latitude);
        addField(undefined, `Station #${idx + 1} Configuration`, sp.configuration);
        addField(undefined, `Station #${idx + 1} Data Rate`, sp.dataRate);
        addField(undefined, `Station #${idx + 1} Remarks`, sp.remarks);
        if (Array.isArray(sp.equipments)) {
          sp.equipments.forEach((eq, eIdx) => {
            addField(undefined, `Station #${idx + 1} Equipment #${eIdx + 1} Serial Number`, eq.serialNumber);
            addField(undefined, `Station #${idx + 1} Equipment #${eIdx + 1} Frequency Range`, eq.frequencyRange);
          });
        }
        if (sp.antenna) {
          addField(undefined, `Station #${idx + 1} Antenna Type`, sp.antenna.type);
          addField(undefined, `Station #${idx + 1} Antenna Height (cm)`, sp.antenna.heightCm);
          addField(undefined, `Station #${idx + 1} Antenna Gain (dB)`, sp.antenna.gainDb);
          addField(undefined, `Station #${idx + 1} Antenna Directivity`, sp.antenna.directivity);
          addField(undefined, `Station #${idx + 1} Antenna Diameter`, sp.antenna.diameter);
          addField(undefined, `Station #${idx + 1} Antenna Polarization`, sp.antenna.polarization);
          addField(undefined, `Station #${idx + 1} Antenna Beamwidth`, sp.antenna.beamwidth);
        }
      });
    }

    const intendedUses: string[] = [];
    if (pData.intendedUseStorageAt) intendedUses.push(`Storage At (${pData.storageAtSpecify || 'Specified Location'})`);
    if (pData.intendedUseAdditionalRadioEquipment) intendedUses.push('Additional Radio Equipment');
    if (pData.intendedUseNewRadioStation) intendedUses.push(`New Radio Station (${pData.newRadioStationSpecify || 'Specified Details'})`);
    if (pData.intendedUseChangeOfEquipment) intendedUses.push('Change of Equipment');
    if (pData.intendedUseOthers) intendedUses.push(`Others (${pData.othersSpecify || 'Specified Details'})`);
    if (intendedUses.length > 0) addField(undefined, 'Intended Use', intendedUses.join(', '));
  }

  // 2b. Radio Operator Cert Data (NTC 1-02 / 1-03)
  const rData = applicant.radioCertData;
  if (rData) {
    addField(undefined, 'Application Type', rData.appType);
    addField(undefined, 'Number of Years', rData.years);
    addField(undefined, 'Type of Certificate', rData.typeOfCertificate || rData.classOfStation);
    addField(undefined, 'Certificate Number', rData.certificateNo);
    addField(undefined, 'Date of Expiry', rData.dateOfExpiry);
    addField(undefined, 'Modification Due To', rData.modificationDueTo);
    addField(undefined, 'Employment Status', rData.employmentStatus);
    addField(undefined, 'Employment Type', rData.employmentType);
    addField(undefined, 'Employment Location', rData.employmentLocation);
    addField(undefined, 'Weight (kg)', rData.weightKg);
    addField(undefined, 'Height (cm)', rData.heightCm);
    addField(undefined, 'Place of Exam / Seminar', rData.placeOfExamSeminar);
    addField(undefined, 'Date of Exam / Seminar', rData.examDate);
    addField(undefined, 'Ratings', rData.ratings);
  }

  // 2c. Amateur License Data (NTC_AMA_STATION_LICENSE)
  const aData = applicant.amateurLicenseData;
  if (aData) {
    addField(undefined, 'Application Type', aData.appType);
    addField(undefined, 'Class of Station', aData.classOfStation);
    addField(undefined, 'Number of Years', aData.noOfYears);
    addField(undefined, 'Existing License No', aData.licenseNo);
    addField(undefined, 'License Expiry Date', aData.dateOfExpiry);
    addField(undefined, 'Modification Due To', aData.modificationDueTo);
    addField(undefined, 'Call Sign', aData.callSign);
    addField(undefined, 'Station Location / Coordinates', aData.location);
    addField(undefined, 'Place of Exam / Seminar', aData.placeOfExamSeminar);
    addField(undefined, 'Date of Exam / Seminar', aData.dateOfExamSeminar);
    addField(undefined, 'Ratings', aData.ratings);
    if (Array.isArray(aData.particularsEquipment)) {
      aData.particularsEquipment.forEach((grp, idx) => {
        addField(undefined, `Equipment Group #${idx + 1} Make / Type / Model`, grp.makeTypeModel);
        if (Array.isArray(grp.equipments)) {
          grp.equipments.forEach((eq, eIdx) => {
            addField(undefined, `Equipment Group #${idx + 1} Unit #${eIdx + 1} Serial Number`, eq.serialNo);
            addField(undefined, `Equipment Group #${idx + 1} Unit #${eIdx + 1} Frequency Range`, eq.frequencyRange);
            addField(undefined, `Equipment Group #${idx + 1} Unit #${eIdx + 1} Power Output`, eq.powerOutput);
          });
        }
      });
    }
  }

  // 2d. Lifetime Amateur License Data
  const lData = applicant.lifetimeLicenseData;
  if (lData) {
    addField(undefined, 'Application Type', 'LIFETIME');
    addField(undefined, 'Call Sign', lData.callSign);
    addField(undefined, 'Years of Active Service', lData.yearsOfAmateurService);
    addField(undefined, 'Existing Class A License No', lData.existingClassALicenseNo);
    addField(undefined, 'License Expiry Date', lData.licenseExpiryDate);
    addField(undefined, 'Registered Amateur Club', lData.memberClubName);
    addField(undefined, 'Cert of Good Standing Control No', lData.certOfGoodStandingNo);
    addField(undefined, 'Station Location / Coordinates', lData.location);
  }

  // 2e. Device Registration Data (NTC 1-19)
  const dData = applicant.deviceRegData;
  if (dData) {
    addField(undefined, 'Registration Type', dData.registrationType);
    addField(undefined, 'Invoice Number', dData.invoiceNo);
    addField(undefined, 'Company / Business Name', dData.businessName);
    addField(undefined, 'Type of Entity', dData.entityType);
    addField(undefined, 'SEC / DTI Registration Number', dData.dtiSecNo);
    if (Array.isArray(dData.particulars)) {
      dData.particulars.forEach((p, idx) => {
        addField(undefined, `Device #${idx + 1} Type`, p.typeOfEquipmentDevice);
        addField(undefined, `Device #${idx + 1} Name / Type / Model`, p.nameTypeModel);
        if (Array.isArray(p.equipmentSerials)) {
          p.equipmentSerials.forEach((s, sIdx) => {
            addField(undefined, `Device #${idx + 1} Serial #${sIdx + 1}`, s.serialNumber);
          });
        }
      });
    }
  }

  // 2f. TVRO Registration Data (NTC 1-22)
  const tData = applicant.tvroRegData;
  if (tData) {
    addField(undefined, 'Classification', tData.classification);
    addField(undefined, 'Service Area', tData.serviceArea);
    addField(undefined, 'Exact Location of TVRO System', tData.exactLocation);
    addField(undefined, 'Longitude', tData.longitude);
    addField(undefined, 'Latitude', tData.latitude);
    addField(undefined, 'BSD No.', tData.bsdNumber);
    if (Array.isArray(tData.particularsEquipment)) {
      tData.particularsEquipment.forEach((eq, idx) => {
        addField(undefined, `TVRO Equipment #${idx + 1} Type`, eq.type);
        addField(undefined, `TVRO Equipment #${idx + 1} Make / Model`, eq.makeTypeModel);
        addField(undefined, `TVRO Equipment #${idx + 1} Serial Number`, eq.serialNo);
        addField(undefined, `TVRO Equipment #${idx + 1} Frequency Range`, eq.frequencyRange);
      });
    }
  }


  // 2g. VAS Provider Data (NTC 1-20)
  const vData = applicant.vasData;
  if (vData) {
    addField(undefined, 'Application Type', vData.appType);
    addField(undefined, 'Number of Years', vData.years);
    addField(undefined, 'Type of Entity', vData.serviceType);
    addField(undefined, 'CPCN / PA / CA No.', vData.serviceNo);
    addField(undefined, 'CPCN / PA / CA No. Date of Expiry', vData.cpcnPaCaDateOfExpiry);
    addField(undefined, 'COR / VAS No.', vData.certificateNumber);
    addField(undefined, 'COR / VAS No. Date of Expiry', vData.expiryDate);
    addField(undefined, 'Operating Trade Name', vData.isKnownByOtherName ? vData.otherTradeName : 'N/A');
    if (Array.isArray(vData.valueAddedServices) && vData.valueAddedServices.length > 0) {
      addField(undefined, 'Value-Added Services Scope', vData.valueAddedServices.join(', '));
    }
  }

  // 2h. Copy of Certificate Data (NTC 1-21)
  const cData = applicant.copyOfCertData;
  if (cData) {
    addField(undefined, 'Copy Type', cData.copyType);
    addField(undefined, 'Target Service', cData.targetService);
    addField(undefined, 'Target Certificate Type', cData.targetCertificateType);
    addField(undefined, 'Certificate Number', cData.certificateNo);
    addField(undefined, 'Number of Copies', cData.numberOfCopies);
  }

  // 2i. Copy of Permit Data
  const cpData = applicant.copyOfPermitData;
  if (cpData) {
    addField('copyType', 'Copy Type', cpData.copyType);
    addField('detailsService', 'DetailsService', cpData.detailsService);
    addField('targetPermitType', 'Type', cpData.targetPermitType);
    addField('permitNo', 'Permit no.', cpData.permitNo);
    addField('noOfCopies', 'No. of Copies', cpData.numberOfCopies);
    if (cpData.circumstances) {
      addField('circumstances', 'Circumstances Relating to Lost/Mutilation of Permit', cpData.circumstances);
    }
  }

  // ── 3. Standard Applicant Details ───────────────────────────────────────
  const fullName = [applicant.firstName, applicant.middleName, applicant.lastName, applicant.suffix]
    .filter(Boolean)
    .join(' ');
  if (fullName) addField(undefined, 'Full Legal Name', fullName);
  if (applicant.firstName) addField(undefined, 'First Name', applicant.firstName);
  if (applicant.middleName) addField(undefined, 'Middle Name', applicant.middleName);
  if (applicant.lastName) addField(undefined, 'Last Name', applicant.lastName);
  if (applicant.suffix) addField(undefined, 'Suffix', applicant.suffix);

  if (applicant.applicantType) addField(undefined, 'Applicant Type', applicant.applicantType);

  const isCompanyOrSponsored =
    (applicant.applicantType || '').toLowerCase() === 'company' ||
    Boolean(applicant.companyName && applicant.companyName.trim().length > 0);

  if (applicant.companyName) addField(undefined, 'Company / Business Name', applicant.companyName);

  const repFullName = applicant.representativeName || [
    applicant.representativeFirstName,
    applicant.representativeMiddleName,
    applicant.representativeLastName,
    applicant.representativeSuffix
  ].filter(Boolean).join(' ');
  if (isCompanyOrSponsored) {
    if (repFullName) addField(undefined, 'Authorized Representative Name', repFullName);
    if (applicant.representativePosition) addField(undefined, 'Representative Position', applicant.representativePosition);
    if (applicant.dtiSecRegistration) addField(undefined, 'SEC / DTI Registration Number', applicant.dtiSecRegistration);
  }
  if (applicant.signatureUrl) {
    addField('fd000000-0000-0000-0000-000000000012', 'Applicant Signature', applicant.signatureUrl);
  }

  if (applicant.email) addField(undefined, 'Email Address', applicant.email);
  if (applicant.contactNo) addField(undefined, 'Contact / Mobile Number', applicant.contactNo);
  if (applicant.sex) addField(undefined, 'Sex / Gender', applicant.sex);
  if (applicant.civilStatus) addField(undefined, 'Civil Status', applicant.civilStatus);
  if (applicant.nationality) addField(undefined, 'Nationality / Citizenship', applicant.nationality);

  const formattedBirthDate = applicant.birthMonth && applicant.birthDay && applicant.birthYear
    ? `${applicant.birthMonth} ${applicant.birthDay}, ${applicant.birthYear}`
    : applicant.birthDate;
  if (formattedBirthDate) addField(undefined, 'Date of Birth', formattedBirthDate);

  if (applicant.street) addField(undefined, 'Street Address / Unit / Building', applicant.street);
  if (applicant.barangay) addField(undefined, 'Barangay', applicant.barangay);
  if (applicant.city) addField(undefined, 'City / Municipality', applicant.city);
  if (applicant.province) addField(undefined, 'Province', applicant.province);
  if (applicant.region) addField(undefined, 'Region', applicant.region);
  if (applicant.zipCode) addField(undefined, 'Zip / Postal Code', applicant.zipCode);

  const compositeAddress = formatCompositeAddress({
    street: applicant.street || applicant.address,
    barangay: applicant.barangay,
    city: applicant.city,
    province: applicant.province,
    region: applicant.region,
    zipCode: applicant.zipCode,
  });
  if (compositeAddress) addField(undefined, 'Complete Address', compositeAddress);

  const schoolVal = applicant.schoolName || applicant.schoolAttended;
  if (schoolVal) addField(undefined, 'School / University Attended', schoolVal);
  const courseVal = applicant.courseDegree || applicant.courseTaken;
  if (courseVal) addField(undefined, 'Course / Degree Program', courseVal);
  if (applicant.yearGraduated) addField(undefined, 'Year Graduated', applicant.yearGraduated);
  if (applicant.specialOrderNo) addField(undefined, 'Special Order No', applicant.specialOrderNo);
  if (applicant.examineeType) addField(undefined, 'Examinee Type', applicant.examineeType);
  if (applicant.examType) addField(undefined, 'Exam Category', applicant.examType);
  if (applicant.notes) addField(undefined, 'Special Notes / Remarks', applicant.notes);

  // 3a. Exam / Service Variant & Element selections
  const elemVal = applicant.selectedElementTitle || applicant.selectedOption || applicant.element || applicant.elements;
  if (elemVal) {
    addField('fd000000-0000-0000-0000-000000000009', 'Selected Exam Elements', elemVal);
    addField('fd000000-0000-0000-0000-000000000025', 'Class of Station', elemVal);
    addField('fd000000-0000-0000-0000-000000000101', 'Station Class', elemVal);
    addField(undefined, 'Elements', elemVal);
  }

  const variantVal = applicant.selectedVariantName || applicant.examineeType || applicant.applicantType;
  if (variantVal) {
    addField('fd000000-0000-0000-0000-000000000008', 'Examinee Type', variantVal);
    addField('fd000000-0000-0000-0000-000000000024', 'Permit / License Type', variantVal);
    addField('fd000000-0000-0000-0000-000000000014', 'Type of Certificate', variantVal);
    addField(undefined, 'Service Variant', variantVal);
  }

  // ── 4. Align with DB Schema Fields if schema fields exist ───────────────────
  // If the schema defines specific fields, ensure any matching applicant values
  // are represented with the exact FieldId of the schema field so the backend saves them.
  flatFormFields.forEach((schemaField) => {
    const sId = schemaField.fieldId || schemaField.id;
    const sLabel = schemaField.label;
    if (!sId || !sLabel) return;

    const lowerLabel = sLabel.toLowerCase().trim();
    // Check if we already have this field in result
    const alreadyMapped = result.find((r) => r.fieldId.toLowerCase() === sId.toLowerCase());
    if (alreadyMapped) return;

    // Check if one of our synthesized results matches by label
    const labelMatch = result.find((r) => r.fieldLabel.toLowerCase().trim() === lowerLabel);
    if (labelMatch) {
      // Re-assign the canonical DB fieldId from the schema
      labelMatch.fieldId = sId;
      return;
    }

    // Try finding matching applicant value
    let fallbackVal: string | null = null;
    if (lowerLabel.includes('name') && !lowerLabel.includes('company') && !lowerLabel.includes('rep')) {
      fallbackVal = fullName || null;
    } else if (lowerLabel.includes('email')) {
      fallbackVal = applicant.email || null;
    } else if (lowerLabel.includes('contact') || lowerLabel.includes('phone') || lowerLabel.includes('mobile')) {
      fallbackVal = applicant.contactNo || null;
    } else if (lowerLabel.includes('birth') || lowerLabel === 'dob') {
      fallbackVal = formattedBirthDate || null;
    } else if (lowerLabel.includes('sex') || lowerLabel.includes('gender')) {
      fallbackVal = applicant.sex || null;
    } else if (lowerLabel.includes('civil') || lowerLabel.includes('marital')) {
      fallbackVal = applicant.civilStatus || null;
    } else if (lowerLabel.includes('nation') || lowerLabel.includes('citizen')) {
      fallbackVal = applicant.nationality || null;
    } else if (lowerLabel.includes('region')) {
      fallbackVal = applicant.region || null;
    } else if (lowerLabel.includes('province')) {
      fallbackVal = applicant.province || null;
    } else if (lowerLabel.includes('city') || lowerLabel.includes('municipality')) {
      fallbackVal = applicant.city || null;
    } else if (lowerLabel.includes('barangay')) {
      fallbackVal = applicant.barangay || null;
    } else if (
      lowerLabel.includes('street') &&
      !lowerLabel.includes('station') &&
      !lowerLabel.includes('seller') &&
      !lowerLabel.includes('dealer')
    ) {
      fallbackVal = applicant.street || null;
    } else if (lowerLabel.includes('zip') || lowerLabel.includes('postal')) {
      fallbackVal = applicant.zipCode || null;
    } else if (
      lowerLabel.includes('address') &&
      !lowerLabel.includes('station') &&
      !lowerLabel.includes('installation') &&
      !lowerLabel.includes('seller') &&
      !lowerLabel.includes('dealer') &&
      !lowerLabel.includes('exam') &&
      !lowerLabel.includes('seminar') &&
      !lowerLabel.includes('provider') &&
      !lowerLabel.includes('vessel') &&
      !lowerLabel.includes('aircraft')
    ) {
      fallbackVal = compositeAddress || null;
    } else if (lowerLabel.includes('company')) {
      fallbackVal = applicant.companyName || null;
    } else if (lowerLabel.includes('representative')) {
      fallbackVal = isCompanyOrSponsored ? (repFullName || null) : null;
    } else if (lowerLabel.includes('signature')) {
      fallbackVal = applicant.signatureUrl || null;
    } else if (lowerLabel.includes('element') || lowerLabel.includes('station class')) {
      fallbackVal = elemVal || null;
    } else if (lowerLabel.includes('variant')) {
      fallbackVal = variantVal || null;
    } else if (lowerLabel.includes('school') || lowerLabel.includes('university')) {
      fallbackVal = schoolVal || null;
    } else if (lowerLabel.includes('course') || lowerLabel.includes('degree') || lowerLabel.includes('program')) {
      fallbackVal = courseVal || null;
    } else if (lowerLabel.includes('graduat') || lowerLabel.includes('year graduated')) {
      fallbackVal = applicant.yearGraduated || null;
    } else if (lowerLabel.includes('special order')) {
      fallbackVal = applicant.specialOrderNo || null;
    }

    if (fallbackVal && !isSuppressedValue(fallbackVal)) {
      result.push({
        fieldId: sId,
        fieldLabel: sLabel,
        value: fallbackVal.trim(),
      });
    }
  });

  return result;
}
