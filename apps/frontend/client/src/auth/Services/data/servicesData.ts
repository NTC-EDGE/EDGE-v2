export interface NTCService {
  title: string;
  description: string;
  requirements: string[];
  fee: string;
  time: string;
}

export interface NTCServiceCategory {
  id: string;
  title: string;
  icon: string;
  description: string;
  services: NTCService[];
}

export const servicesData: NTCServiceCategory[] = [
  {
    id: "accreditations",
    title: "Accreditations",
    icon: "award",
    description: "Official accreditation services for suppliers and manufacturers of telecommunications equipment.",
    services: [
      {
        title: "Customer Premises Equipment (CPE) Supplier Accreditation",
        description: "Official NTC accreditation required for suppliers, distributors, and dealers importing or selling Customer Premises Equipment in the Philippines.",
        requirements: [
          "Duly accomplished Application Form for CPE Supplier Accreditation",
          "SEC Registration (for corporations) or DTI Registration (for sole proprietorships)",
          "Mayor's Permit / Business Permit for the current year",
          "List of CPE to be imported, distributed, or sold",
          "Certificate of Type Approval/Acceptance of equipment (if applicable)",
          "Proof of payment of filing and accreditation fees"
        ],
        fee: "₱5,000.00",
        time: "3-5 Working Days"
      }
    ]
  },
  {
    id: "certificates",
    title: "Certificates",
    icon: "file-text",
    description: "Certification services for radio operators, value-added service providers, and special device registrations.",
    services: [
      {
        title: "Radio Operator Certificates (ROC) excluding Amateur ROC",
        description: "Certification issued to qualified radio operators in commercial, maritime, aeronautical, or industrial radio stations.",
        requirements: [
          "Duly accomplished ROC Application Form",
          "Original and photocopy of radio operator examination rating certificate",
          "Two (2) recent 1x1 ID pictures with white background",
          "Proof of completion of required training course",
          "NBI clearance or police clearance"
        ],
        fee: "₱1,200.00",
        time: "5 Working Days"
      },
      {
        title: "Certificates in the Amateur Service",
        description: "Certification issued to amateur radio operators who have passed the corresponding amateur examinations.",
        requirements: [
          "Duly accomplished Amateur ROC Application Form",
          "Result of amateur radio operator examination",
          "Two (2) recent 1x1 ID pictures",
          "Valid government-issued ID",
          "Proof of membership in an accredited amateur radio club (if applicable)"
        ],
        fee: "₱800.00",
        time: "3 Working Days"
      },
      {
        title: "Certificate of Registration for RFID, SRD, WDN Devices - Indoor",
        description: "Mandatory registration for low-power, short-range devices such as RFID, Short Range Devices (SRD), and Wireless Data Networks (WDN) operated indoors.",
        requirements: [
          "Duly accomplished Registration Form for Indoor RF Devices",
          "Technical specifications and brochure of the device",
          "FCC or CE type approval certificate",
          "Business Permit or DTI/SEC registration",
          "Filing fee receipt"
        ],
        fee: "₱1,500.00 per device type",
        time: "2-4 Working Days"
      },
      {
        title: "TVRO Registration Certificate",
        description: "Registration certificate for Television Receive-Only (TVRO) satellite dishes used for private reception.",
        requirements: [
          "Duly accomplished TVRO Application Form",
          "Technical specification sheet of the TVRO antenna and receiver",
          "Location plan / installation diagram showing antenna placement",
          "Proof of ownership or lease agreement of the premises"
        ],
        fee: "₱2,000.00",
        time: "3 Working Days"
      },
      {
        title: "Certificate of Registration as a Value-Added Service (VAS) Provider",
        description: "Registration certificate for companies offering value-added telecommunications services over existing network providers.",
        requirements: [
          "Duly accomplished Registration Form for VAS Providers",
          "SEC Certificate of Incorporation, Articles of Incorporation, and By-Laws",
          "Detailed description of the proposed value-added services",
          "Network diagram showing system connection to carriers",
          "Service Level Agreement (SLA) with partner network operators",
          "Filing fee and registration fee proof of payment"
        ],
        fee: "₱10,000.00",
        time: "7-10 Working Days"
      },
      {
        title: "Copy of Certificates",
        description: "Request for a duplicate or certified true copy of an existing NTC certificate.",
        requirements: [
          "Letter-request stating the reason for requesting a copy",
          "Affidavit of Loss (if original certificate is lost/destroyed)",
          "Photocopy of the original certificate (if available)",
          "Valid ID of the certificate holder"
        ],
        fee: "₱500.00",
        time: "1-2 Working Days"
      }
    ]
  },
  {
    id: "exams",
    title: "Exams",
    icon: "edit-3",
    description: "Application and scheduling for official radio operator examinations.",
    services: [
      {
        title: "Admission Slip for Radio Operator Examination",
        description: "Official permission and entry slip required to take the NTC Radio Operator licensure exams.",
        requirements: [
          "Duly accomplished Application for Examination Form",
          "Transcript of Records or Diploma (for education verification)",
          "Three (3) recent 1x1 ID pictures with name tag",
          "Birth certificate (PSA certified copy)",
          "Payment of examination fee"
        ],
        fee: "₱500.00",
        time: "2 Working Days"
      }
    ]
  },
  {
    id: "licenses",
    title: "Licenses",
    icon: "shield",
    description: "Licensing services for aeronautical, maritime, amateur, and private radio stations.",
    services: [
      {
        title: "Licenses in the Amateur Service",
        description: "Radio station licenses granted to licensed amateurs allowing them to operate amateur radio stations.",
        requirements: [
          "Duly accomplished Amateur Radio Station License Application",
          "Copy of valid Amateur Radio Operator Certificate (ROC)",
          "List of radio equipment with model, serial numbers, and type approvals",
          "Valid membership certificate from an accredited amateur radio club"
        ],
        fee: "₱1,000.00 per year",
        time: "4 Working Days"
      },
      {
        title: "Licenses in the Aeronautical Service",
        description: "Licensing of radio stations installed on board aircraft or in ground aeronautical stations.",
        requirements: [
          "Duly accomplished Application for Aeronautical Radio Station License",
          "Aircraft Registration Certificate (CAAP)",
          "Airworthiness Certificate (CAAP)",
          "List of avionics/radio equipment with technical specs",
          "Receipt of payment of aeronautical station license fees"
        ],
        fee: "₱4,500.00",
        time: "5-7 Working Days"
      },
      {
        title: "Licenses in the Maritime Service",
        description: "Licensing of radio stations installed on board commercial, fishing, or passenger ships.",
        requirements: [
          "Duly accomplished Application for Ship Radio Station License",
          "MARINA Certificate of Vessel Registry / Certificate of Ownership",
          "Inspection report by NTC maritime inspector",
          "List of shipboard radio equipment with type approval certificates",
          "Maritime Radio Operator Certificate of the designated crew member"
        ],
        fee: "₱3,500.00",
        time: "5 Working Days"
      },
      {
        title: "Licenses for Government and Private Radio Stations in the Fixed and Land Mobile Service",
        description: "Radio station licenses for land-mobile, base, and repeater stations operated by private corporations or government units.",
        requirements: [
          "Duly accomplished Application Form for Fixed/Mobile Radio Station License",
          "NTC Permit to Purchase and Permit to Possess equipment",
          "Technical plans showing radio frequencies, transmitter location, and antenna heights",
          "Filing fee and license fee payment receipts",
          "SEC/DTI Registration and Business Permit"
        ],
        fee: "₱2,500.00 per station",
        time: "5-7 Working Days"
      },
      {
        title: "Other Radio Station Licenses/Services",
        description: "Licensing for specialized and miscellaneous radio services not covered under standard categories.",
        requirements: [
          "Letter request describing the radio service / system",
          "Duly accomplished general application form",
          "Detailed system description and technical specifications",
          "Map showing target service coverage area"
        ],
        fee: "Varies by frequency & power output",
        time: "7 Working Days"
      },
      {
        title: "TVRO/CATV Station License",
        description: "Licensing for Cable Television (CATV) systems and headend stations.",
        requirements: [
          "Duly accomplished CATV Station License Application Form",
          "SEC Articles of Incorporation (showing telecommunications/CATV purpose)",
          "Provisional Authority or Certificate of Authority from NTC",
          "Approved technical plans and list of equipment",
          "Local government unit franchise or permit"
        ],
        fee: "₱15,000.00",
        time: "10-15 Working Days"
      },
      {
        title: "Copy of Licenses",
        description: "Certified true copy or duplicate print of a valid radio station license.",
        requirements: [
          "Letter request for duplicate license",
          "Affidavit of loss/damage of the original license",
          "Photocopy of the original license (if available)",
          "Copy of receipt of the latest license renewal fee"
        ],
        fee: "₱500.00",
        time: "2 Working Days"
      }
    ]
  },
  {
    id: "permits",
    title: "Permits",
    icon: "clipboard",
    description: "Temporary and purchase permits for radio equipment, mobile phones, and telecommunications entities.",
    services: [
      {
        title: "Permits in the Amateur Service",
        description: "Permit to purchase, import, or possess amateur radio transceiver equipment.",
        requirements: [
          "Duly accomplished Application for Permit to Purchase/Possess",
          "Valid Amateur Radio Station License (ARSL)",
          "Commercial invoice or receipt of purchase",
          "Import permit (if equipment is imported)"
        ],
        fee: "₱500.00",
        time: "2 Working Days"
      },
      {
        title: "Permits in the Aeronautical Service",
        description: "Permits to purchase or import aeronautical radio equipment.",
        requirements: [
          "Duly accomplished Application for Aeronautical Permit",
          "CAAP permit to install (if applicable)",
          "SEC/DTI registration and valid CAAP License to Operate",
          "Equipment technical specifications"
        ],
        fee: "₱1,200.00",
        time: "3 Working Days"
      },
      {
        title: "Permits in the Maritime Service",
        description: "Permits to purchase, import, or possess ship radio equipment.",
        requirements: [
          "Duly accomplished Application for Maritime Permit",
          "MARINA approval/permit for equipment installation",
          "Valid Ship Radio Station License or temporary authorization",
          "Equipment invoice or sales contract"
        ],
        fee: "₱1,200.00",
        time: "3 Working Days"
      },
      {
        title: "Permits for Government and Private Radio Stations in the Fixed and Land Mobile Service",
        description: "Permit to purchase or possess land mobile base, repeater, or mobile transceivers.",
        requirements: [
          "Duly accomplished Permit to Purchase/Possess Application",
          "Valid NTC Radio Frequency Allocation / Authority to Operate",
          "Supplier's invoice indicating equipment serial numbers",
          "Supplier's valid NTC dealer license"
        ],
        fee: "₱1,000.00",
        time: "3 Working Days"
      },
      {
        title: "Permits for Public Telecommunications Entities (PTEs)",
        description: "Special permits and provisional authorities granted to public telecommunications carriers.",
        requirements: [
          "Formal petition / application with the Commission",
          "Legislative Franchise Copy",
          "SEC Certificate and Articles of Incorporation",
          "Detailed financial and technical plans for the network expansion",
          "Filing fee and legal fee payments"
        ],
        fee: "₱25,000.00 + 1/10 of 1% of capitalization",
        time: "30-60 Working Days (subject to hearings)"
      },
      {
        title: "Permits for Radio Communications Equipment",
        description: "Permits to import, purchase, or sell radio transmitters and receivers.",
        requirements: [
          "Duly accomplished Application for Importation/Purchase Permit",
          "Technical specifications and type approval of equipment",
          "NTC Dealer, Manufacturer, or Service Center License",
          "Proforma invoice or sales contract"
        ],
        fee: "₱1,500.00",
        time: "3-5 Working Days"
      },
      {
        title: "Permits for Mobile Phone",
        description: "Permits for importation, distribution, or retail of mobile phone devices.",
        requirements: [
          "Duly accomplished Application Form for Mobile Phone Permit",
          "DTI or SEC Registration Certificate",
          "Current Mayor's/Business Permit",
          "Type Approval Certificate of mobile phone models",
          "Detailed manufacturer's invoice and airway bill (for importations)"
        ],
        fee: "₱3,000.00 per model list",
        time: "3 Working Days"
      },
      {
        title: "Copy of Permits",
        description: "Request for certified duplicate copies of active NTC permits.",
        requirements: [
          "Formal request letter",
          "Affidavit of loss for lost permit copies",
          "Valid ID and copy of original receipt of the permit fee"
        ],
        fee: "₱300.00",
        time: "1-2 Working Days"
      }
    ]
  },
  {
    id: "complaints",
    title: "Requests/Complaints",
    icon: "message-square",
    description: "Filing complaints or requesting consumer assistance regarding telecommunication and internet service providers.",
    services: [
      {
        title: "Requests and Complaints of Consumers/Subscribers",
        description: "Official filing of unresolved complaints against telecommunications service providers, internet providers, or CATV networks (e.g., poor signal, incorrect billing, poor customer service).",
        requirements: [
          "Duly accomplished NTC Consumer Complaint Form",
          "Copy of formal complaint sent to the service provider",
          "Service provider's reference number or reply (if any)",
          "Supporting evidence (bill copy, speed test results, logs)",
          "Valid government-issued ID of the complainant"
        ],
        fee: "Free / No Filing Fee",
        time: "5-15 Working Days (NTC Mediation)"
      }
    ]
  }
];
