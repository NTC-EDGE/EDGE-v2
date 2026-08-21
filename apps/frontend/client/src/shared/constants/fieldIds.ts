/**
 * Canonical field IDs sourced directly from CommonSeederData.cs GetFieldsPool().
 *
 * IMPORTANT: These values MUST be kept in sync with:
 *   apps/backend/EDGE.Infrastructure/Persistence/SeederData/CommonSeederData.cs
 *
 * Never hardcode these GUIDs inline in components — always import from this file.
 */

// --- Core Personal / Applicant -----------------------------------------------
export const FIELD_ID_FULL_NAME    = "fd000000-0000-0000-0000-000000000001"; // Full Legal Name
export const FIELD_ID_BIRTH_DATE   = "fd000000-0000-0000-0000-000000000002"; // Date of Birth
export const FIELD_ID_ADDRESS      = "fd000000-0000-0000-0000-000000000003"; // Complete Address
export const FIELD_ID_CONTACT_NO   = "fd000000-0000-0000-0000-000000000004"; // Contact / Mobile Number
export const FIELD_ID_EMAIL        = "fd000000-0000-0000-0000-000000000005"; // Email Address
export const FIELD_ID_EDUCATION    = "fd000000-0000-0000-0000-000000000006"; // Education / School Attended

// --- NTC 1-01 Exam Specific --------------------------------------------------
export const FIELD_ID_EXAM_CATEGORY  = "fd000000-0000-0000-0000-000000000007"; // Exam Category
export const FIELD_ID_EXAMINEE_TYPE  = "fd000000-0000-0000-0000-000000000008"; // Examinee Type
export const FIELD_ID_ELEMENTS       = "fd000000-0000-0000-0000-000000000009"; // Selected Exam Elements
export const FIELD_ID_SPECIAL_NEEDS  = "fd000000-0000-0000-0000-000000000010"; // Special Assistance Details
export const FIELD_ID_ADMISSION_NO   = "fd000000-0000-0000-0000-000000000011"; // Admission Slip Number

// --- Core Declarations & Payment ---------------------------------------------
export const FIELD_ID_SIGNATURE       = "fd000000-0000-0000-0000-000000000012"; // Applicant Signature
export const FIELD_ID_DECLARATION_CB  = "fd000000-0000-0000-0000-000000000013"; // Declaration Checkbox
export const FIELD_ID_TYPE_OF_CERT    = "fd000000-0000-0000-0000-000000000014"; // Type of Certificate

// --- NTC 1-02 Certificate Specific -------------------------------------------
export const FIELD_ID_WEIGHT             = "fd000000-0000-0000-0000-000000000015"; // Weight (kg)
export const FIELD_ID_HEIGHT             = "fd000000-0000-0000-0000-000000000016"; // Height (cm)
export const FIELD_ID_EMPLOYMENT_STATUS  = "fd000000-0000-0000-0000-000000000017"; // Status (employment)
export const FIELD_ID_EMPLOYMENT_TYPE    = "fd000000-0000-0000-0000-000000000018"; // Type (employment)
export const FIELD_ID_EXAM_DATE          = "fd000000-0000-0000-0000-000000000019"; // Date (exam/seminar)
export const FIELD_ID_EXAM_RATING        = "fd000000-0000-0000-0000-000000000020"; // Rating

// --- Payment -----------------------------------------------------------------
export const FIELD_ID_PAYMENT_OR_NO   = "fd000000-0000-0000-0000-000000000021"; // Official Receipt Number
export const FIELD_ID_PAYMENT_AMOUNT  = "fd000000-0000-0000-0000-000000000022"; // Amount Paid
export const FIELD_ID_PAYMENT_DATE    = "fd000000-0000-0000-0000-000000000023"; // Payment Date

// --- NTC 1-03 / Permit & Station ---------------------------------------------
export const FIELD_ID_PERMIT_TYPE      = "fd000000-0000-0000-0000-000000000024"; // Permit / License Type
export const FIELD_ID_CLASS_OF_STATION = "fd000000-0000-0000-0000-000000000025"; // Class of Station
export const FIELD_ID_CLUB_DETAILS     = "fd000000-0000-0000-0000-000000000026"; // Amateur Club Details

// --- Technical: Vessel & Station ---------------------------------------------
export const FIELD_ID_VESSEL_NAME    = "fd000000-0000-0000-0000-000000000027"; // Vessel Name
export const FIELD_ID_CALL_SIGN      = "fd000000-0000-0000-0000-000000000028"; // Call Sign
export const FIELD_ID_IMO_NUMBER     = "fd000000-0000-0000-0000-000000000029"; // IMO Number / Gross Tonnage
export const FIELD_ID_EQUIPMENT      = "fd000000-0000-0000-0000-000000000030"; // Particulars of Equipment (repeater)
export const FIELD_ID_RADIO_OFFICERS = "fd000000-0000-0000-0000-000000000031"; // Radio Officers Details (repeater)
export const FIELD_ID_STATION_LOC    = "fd000000-0000-0000-0000-000000000032"; // Station Location / Coordinates
export const FIELD_ID_ANTENNA        = "fd000000-0000-0000-0000-000000000033"; // Antenna Technical Details (repeater)

// --- Accreditations & Regs ---------------------------------------------------
export const FIELD_ID_PERSONNEL      = "fd000000-0000-0000-0000-000000000034"; // ECE / Technician Personnel Details (repeater)
export const FIELD_ID_DEVICES        = "fd000000-0000-0000-0000-000000000035"; // Registered Devices Details (repeater)
export const FIELD_ID_VALUE_ADDED    = "fd000000-0000-0000-0000-000000000036"; // Value-Added Services / Category
export const FIELD_ID_CIRCUMSTANCES  = "fd000000-0000-0000-0000-000000000037"; // Circumstances (Lost/Mutilation)
export const FIELD_ID_TVRO           = "fd000000-0000-0000-0000-000000000038"; // TVRO / CATV Details (repeater)

// --- Sex / Civil Status / Nationality ----------------------------------------
export const FIELD_ID_SEX            = "fd000000-0000-0000-0000-000000000041"; // Sex / Gender
export const FIELD_ID_CIVIL_STATUS   = "fd000000-0000-0000-0000-000000000042"; // Civil Status
export const FIELD_ID_NATIONALITY    = "fd000000-0000-0000-0000-000000000043"; // Nationality / Citizenship
export const FIELD_ID_REG_TYPE       = "fd000000-0000-0000-0000-000000000045"; // Registration Type
export const FIELD_ID_EMP_LOCATION   = "fd000000-0000-0000-0000-000000000046"; // Employment Location
export const FIELD_ID_SEMINAR_ADDR   = "fd000000-0000-0000-0000-000000000047"; // Seminar / Exam Address

// --- Granular Address --------------------------------------------------------
export const FIELD_ID_REGION   = "fd000000-0000-0000-0000-000000000051"; // Region
export const FIELD_ID_PROVINCE = "fd000000-0000-0000-0000-000000000052"; // Province
export const FIELD_ID_CITY     = "fd000000-0000-0000-0000-000000000053"; // City / Municipality
export const FIELD_ID_BARANGAY = "fd000000-0000-0000-0000-000000000054"; // Barangay
export const FIELD_ID_STREET   = "fd000000-0000-0000-0000-000000000055"; // Street Address / Unit / Building
export const FIELD_ID_ZIP_CODE = "fd000000-0000-0000-0000-000000000056"; // Zip / Postal Code

// --- Education ---------------------------------------------------------------
export const FIELD_ID_SCHOOL_NAME   = "fd000000-0000-0000-0000-000000000061"; // School / University Attended
export const FIELD_ID_COURSE_DEGREE = "fd000000-0000-0000-0000-000000000062"; // Course / Degree Program
export const FIELD_ID_YEAR_GRAD     = "fd000000-0000-0000-0000-000000000063"; // Year Graduated

// --- Emergency Contact -------------------------------------------------------
export const FIELD_ID_EMERGENCY_PERSON = "fd000000-0000-0000-0000-000000000071"; // Emergency Contact Person
export const FIELD_ID_EMERGENCY_NO     = "fd000000-0000-0000-0000-000000000072"; // Emergency Contact Number

// --- NTC 1-09 Permit Fields --------------------------------------------------
export const FIELD_ID_STATION_CLASS  = "fd000000-0000-0000-0000-000000000101"; // Station Class
export const FIELD_ID_SERVICE_AREA   = "fd000000-0000-0000-0000-000000000102"; // Service Area
export const FIELD_ID_FREQUENCY      = "fd000000-0000-0000-0000-000000000103"; // Frequency / Frequencies
export const FIELD_ID_BANDWIDTH      = "fd000000-0000-0000-0000-000000000104"; // Bandwidth
export const FIELD_ID_EMISSION       = "fd000000-0000-0000-0000-000000000105"; // Emission
export const FIELD_ID_POWER_OUTPUT   = "fd000000-0000-0000-0000-000000000106"; // Power Output
export const FIELD_ID_HOURS_OP       = "fd000000-0000-0000-0000-000000000107"; // Hours of Operation
export const FIELD_ID_CONFIGURATION  = "fd000000-0000-0000-0000-000000000108"; // Configuration
export const FIELD_ID_DATA_RATE      = "fd000000-0000-0000-0000-000000000109"; // Data Rate
export const FIELD_ID_REMARKS        = "fd000000-0000-0000-0000-000000000110"; // Remarks
export const FIELD_ID_SERIAL_NO      = "fd000000-0000-0000-0000-000000000111"; // Serial Number
export const FIELD_ID_FREQ_RANGE     = "fd000000-0000-0000-0000-000000000112"; // Frequency Range
export const FIELD_ID_ANTENNA_TYPE   = "fd000000-0000-0000-0000-000000000113"; // Antenna Type
export const FIELD_ID_ANT_HEIGHT     = "fd000000-0000-0000-0000-000000000114"; // Antenna Height
export const FIELD_ID_ANT_GAIN       = "fd000000-0000-0000-0000-000000000115"; // Antenna Gain
export const FIELD_ID_ANT_DIR        = "fd000000-0000-0000-0000-000000000116"; // Antenna Directivity
export const FIELD_ID_ANT_DIAMETER   = "fd000000-0000-0000-0000-000000000117"; // Antenna Diameter
export const FIELD_ID_ANT_POL        = "fd000000-0000-0000-0000-000000000118"; // Antenna Polarization
export const FIELD_ID_ANT_BEAM       = "fd000000-0000-0000-0000-000000000119"; // Antenna Beamwidth
export const FIELD_ID_DEALER_NAME    = "fd000000-0000-0000-0000-000000000120"; // Dealer Name
export const FIELD_ID_AUTH_SELLER    = "fd000000-0000-0000-0000-000000000121"; // Authorized Seller / Buyer
export const FIELD_ID_OR_INVOICE     = "fd000000-0000-0000-0000-000000000122"; // OR / Invoice No
export const FIELD_ID_PERMIT_RSL     = "fd000000-0000-0000-0000-000000000123"; // Permit / RSL No
export const FIELD_ID_SELLER_ADDR    = "fd000000-0000-0000-0000-000000000124"; // Seller Address
export const FIELD_ID_AMATEUR_LIC    = "fd000000-0000-0000-0000-000000000125"; // Amateur License No
export const FIELD_ID_INTENDED_USE   = "fd000000-0000-0000-0000-000000000126"; // Intended Use Type
export const FIELD_ID_SPECIFY        = "fd000000-0000-0000-0000-000000000127"; // Specify Details

// --- Amateur Radio Station License (NTC_AMA_LICENSES) ------------------------
export const FIELD_ID_APP_TYPE        = "fd000000-0000-0000-0000-000000000200"; // Application Type (dropdown)
export const FIELD_ID_NO_OF_YEARS     = "fd000000-0000-0000-0000-000000000201"; // Number of Years
export const FIELD_ID_LICENSE_NO      = "fd000000-0000-0000-0000-000000000202"; // Existing License No
export const FIELD_ID_DATE_OF_EXPIRY  = "fd000000-0000-0000-0000-000000000203"; // License Expiry Date
export const FIELD_ID_MOD_DUE_TO      = "fd000000-0000-0000-0000-000000000204"; // Modification Due To
export const FIELD_ID_PLACE_EXAM      = "fd000000-0000-0000-0000-000000000205"; // Place of Exam / Seminar
export const FIELD_ID_DATE_EXAM       = "fd000000-0000-0000-0000-000000000206"; // Date of Exam / Seminar
export const FIELD_ID_RATINGS         = "fd000000-0000-0000-0000-000000000207"; // Ratings / Exam Score Details
export const FIELD_ID_PARTICULARS_EQ  = "fd000000-0000-0000-0000-000000000208"; // Particulars of Radio Equipment (JSON)
export const FIELD_ID_LOCATION        = "fd000000-0000-0000-0000-000000000209"; // Station Location / Installation Address
export const FIELD_ID_MIDDLE_NAME     = "fd000000-0000-0000-0000-000000000210"; // Middle Name
export const FIELD_ID_SUFFIX          = "fd000000-0000-0000-0000-000000000211"; // Suffix

// --- Invoice Fields (NTC 1-19 / Non-Dealer Registrations) --------------------
export const FIELD_ID_INVOICE_NUMBER  = "fd000000-0000-0000-0000-000000000228"; // Invoice Number
