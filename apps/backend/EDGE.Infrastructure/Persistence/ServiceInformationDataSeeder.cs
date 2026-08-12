using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EDGE.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualBasic;

namespace EDGE.Infrastructure.Persistence;

public static class ServiceInformationDataSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context)
    {
        var existingServiceIds = await context.ServiceInformations
            .Select(x => x.ServiceId)
            .ToListAsync();

        var services = await context.Services.ToListAsync();
        if (!services.Any())
        {
            return;
        }

        Guid FindServiceId(params string[] titleKeywords)
        {
            foreach (var kw in titleKeywords)
            {
                var match = services.FirstOrDefault(s => s.Name.ToLower().Contains(kw.ToLower()) || kw.ToLower().Contains(s.Name.ToLower()));
                if (match != null) return match.Id;
            }
            return services.First().Id;
        }

        var seedList = new List<ServiceInformation>
        {
            // ACCREDITATION
            new ServiceInformation
            {
                Id = Guid.Parse("a1000000-0000-0000-0000-000000000001"),
                ServiceId = FindServiceId("Customer Premises Equipment", "Premises Equipment", "CPE"),
                Information = "Customer Premises Equipment Supplier Accreditation\n\nAn Accreditation for Customer Premises Equipment Supplier is a written authority issued by the Commission to a person, firm, company, association or corporation authorizing the holder thereof to engage in the acquisition, servicing, maintenance, purchase or sale of equipment located in the premises of a customer which is not part of but connected to the system or network of a public telecommunications entity.",
                WhoMayAvail = "WHO MAY AVAIL:\n\n1. Individuals and Private Entities"
            },

            // CERTIFICATES
            new ServiceInformation
            {
                Id = Guid.Parse("a1000000-0000-0000-0000-000000000002"),
                ServiceId = FindServiceId("RADIO OPERATOR CERTIFICATES", "ROC"),
                Information = "Radio Operator Certificates (ROC) excluding Amateur ROC\n\nA Radio Operator Certificate is a written authority issued by the Commission authorizing the holder thereof to operate a particular class of radio station under a specific radio service.\n\nThe RENEWAL of a Radio Operator Certificate is required for the continuous operation of a particular class of radio station under a specific radio service.\n\nThe MODIFICATION of a Radio Operator Certificate is required for changes in the particulars indicated in the Certificate.",
                WhoMayAvail = "WHO MAY AVAIL:\n\n1. Individuals who have passed the Commercial Radio Operator's Examination conducted by NTC\n2. Commercial pilots and student pilots\n3. Government radio operators who have completed the Government Radio Operator's Seminar conducted by NTC\n4. Individuals working in the maritime service who have completed the Special Radio Operator's Seminar conducted by NTC\n5. Individuals who have completed the Restricted Land Mobile Radiotelephone Operator's Seminar conducted by NTC\n6. Licensed pilots of foreign countries"
            },
            new ServiceInformation
            {
                Id = Guid.Parse("a1000000-0000-0000-0000-000000000003"),
                ServiceId = FindServiceId("CERTIFICATES IN THE AMATEUR SERVICE", "Amateur Certificate"),
                Information = "Certificates in the Amateur Service\n\nThe Amateur Radio Operator Certificate is a written authority issued by the Commission to a person or a club authorizing the holder thereof to operate a class of radio station in the Amateur Service.\n\nThe RENEWAL of Amateur Radio Operator Certificate is required for the continuous operation of any class of radio stations in the Amateur Service.\n\nThe MODIFICATION of Amateur Radio Operator Certificate is required for changes in the particulars indicated in the Certificate.",
                WhoMayAvail = "WHO MAY AVAIL:\n\n1. Individuals who have passed the Amateur Radio Operator Examination conducted by NTC\n2. Duly accredited amateur radio clubs\n3. Foreign amateurs qualified under the reciprocity agreement\n4. Licensed amateur radio operators"
            },
            new ServiceInformation
            {
                Id = Guid.Parse("a1000000-0000-0000-0000-000000000004"),
                ServiceId = FindServiceId("RFID", "Short Range Devices", "WDN"),
                Information = "Certificate of Registration for RFID, SRD, WDN Devices - Indoor\n\nA Certificate of Registration is a written authority issued by the Commission to an individual, accredited radio dealer/manufacturer, private and government entities for the registration of Radio Frequency Identification (RFID) Devices, Short Range Devices (SRD), or Wireless Data Network (WDN) Devices – Indoor.",
                WhoMayAvail = "WHO MAY AVAIL:\n\n1. Individuals, Accredited Radio Dealers/Manufacturers, and Private and Government Entities"
            },
            new ServiceInformation
            {
                Id = Guid.Parse("a1000000-0000-0000-0000-000000000005"),
                ServiceId = FindServiceId("TVRO REGISTRATION", "TVRO Certificate"),
                Information = "TVRO Registration Certificate\n\nA TVRO Registration Certificate is a certificate or a written authority issued by the Commission to a person, firm, company, association, or corporation authorizing the holder thereof to possess television receive-only equipment.",
                WhoMayAvail = "WHO MAY AVAIL:\n\n1. Cable TV Operators and Private and Government Entities"
            },
            new ServiceInformation
            {
                Id = Guid.Parse("a1000000-0000-0000-0000-000000000006"),
                ServiceId = FindServiceId("VALUE-ADDED SERVICE", "VAS Provider"),
                Information = "Certificate of Registration as a Value-Added Service (VAS) Provider\n\nThe Certificate of Registration as a VAS Provider is a written authority issued by the Commission to an individual, private and government entities authorizing the holder thereof to offer value added services.\n\nThe RENEWAL of a Certificate of Registration is required for the continuous operation as a VAS Provider.",
                WhoMayAvail = "WHO MAY AVAIL:\n\n1. Private Entities"
            },
            new ServiceInformation
            {
                Id = Guid.Parse("a1000000-0000-0000-0000-000000000007"),
                ServiceId = FindServiceId("COPY OF CERTIFICATES", "Duplicate Certificate"),
                Information = "Copy of Certificates\n\nA Certified True Copy of a Certificate is issued by the Commission to individuals, private and government entities upon request of the holder to authenticate copy of the same.\n\nA Duplicate Copy of a Certificate is issued by the Commission to individuals, private and government entities upon request of the holder for the re-issuance of the same.",
                WhoMayAvail = "WHO MAY AVAIL:\n\n1. Individuals\n2. Private and Government Entities"
            },

            // EXAM
            new ServiceInformation
            {
                Id = Guid.Parse("a1000000-0000-0000-0000-000000000008"),
                ServiceId = FindServiceId("Admission Slip", "Radio Operator Examination", "EXAM-101"),
                Information = "Admission Slip for Radio Operator Examination\n\nThe Admission Slip is a document issued by the Commission to a qualified applicant authorizing the holder thereof to take the commercial or non-commercial radio operator examination.",
                WhoMayAvail = "WHO MAY AVAIL:\n\n1. Restricted Radio Operator Certificate (RROC) - Aircraft\n• Commercial pilots\n• Student pilots\n\n2. Radiotelephone/Radiotelegraph\n• Graduates of General Radio Communication Operator (GRCO)\n• Graduates of Industrial Electronics Technician Course (IETC)\n• Graduates of Communications Technician Course (CTC)\n• Graduates of Bachelor of Science in Avionics Technology (BS AVTECH)\n• Graduates of Bachelor of Science in Electronics and Communications Engineering; Bachelor of Science in Electronics Engineering (BS ECE)\n\n3. Amateur\n• Radio enthusiasts\n• Licensed amateurs and commercial operators (for upgrading)\n• Registered ECE"
            },

            // LICENSES
            new ServiceInformation
            {
                Id = Guid.Parse("a1000000-0000-0000-0000-000000000009"),
                ServiceId = FindServiceId("LICENSE IN THE AMATEUR SERVICE", "Amateur License"),
                Information = "License in the Amateur Service\n\nThe Amateur Radio Station License is a written authority issued by the Commission to a person or a club authorizing the holder thereof to operate a class of radio station in the Amateur Service.\n\nThe RENEWAL of Amateur Radio Station License is required for the continuous operation of any class of radio stations in the Amateur Service.\n\nThe MODIFICATION of Amateur Radio Station License is required for changes in the particulars indicated in the License.",
                WhoMayAvail = "WHO MAY AVAIL:\n\n1. Individuals who have passed the Amateur Radio Operator Examination conducted by NTC\n2. Duly accredited amateur radio clubs\n3. Foreign amateurs qualified under the reciprocity agreement\n4. Licensed amateur radio operators"
            },
            new ServiceInformation
            {
                Id = Guid.Parse("a1000000-0000-0000-0000-000000000010"),
                ServiceId = FindServiceId("LICENSE IN THE AERONAUTICAL SERVICE", "Fixed Aeronautical"),
                Information = "Licenses in the Aeronautical Service\n\nA Fixed Aeronautical Station License is a written authority issued by the Commission to an individual, private and government entities authorizing the holder thereof to operate an aeronautical fixed station in the Aeronautical Fixed Service.\n\nAn Aircraft Station License is a written authority issued by the Commission to an individual or private or government entities authorizing the holder thereof to operate a mobile station installed onboard any type of aircraft.\n\nThe RENEWAL of Fixed Aeronautical Station License or Aircraft Station License is required for the continuous operation of an existing radio station.\n\nThe MODIFICATION of Fixed Aeronautical Station License or Aircraft Station License is required for changes in the particulars indicated in the License.",
                WhoMayAvail = "WHO MAY AVAIL:\n\n1. Individuals and Private and Government Entities"
            },
            new ServiceInformation
            {
                Id = Guid.Parse("a1000000-0000-0000-0000-000000000011"),
                ServiceId = FindServiceId("LICENSE IN THE MARITIME SERVICE", "Ship Station"),
                Information = "Licenses in the Maritime Service\n\nThe Ship Station License or Ship Earth Station License is a written authority issued by the Commission to an individual, private and government entities authorizing the holder thereof to operate ship radio station (radio and navigation equipment) in the Maritime Mobile Service.\n\nA Private Coastal Station License is a written authority issued by the Commission to an individual, private and government entities authorizing the holder thereof to operate a radio station in the Maritime Service.\n\nA Public Coastal Station License is a written authority issued by the Commission to a public telecommunications entity (PTEs) authorizing the holder thereof to operate a public coastal station in the Maritime Service.\n\nThe RENEWAL of a Ship Station License or Ship Earth Station License is required for the continuous operation of an existing radio stations.\n\nThe RENEWAL of a Private Coastal Station License is required for the continuous operation of a private coastal station.\n\nThe RENEWAL of Public Coastal Station License is required for the continuous operation of public coastal stations in the Maritime Service.\n\nThe MODIFICATION of a Ship Station License, Ship Earth Station License, or Private Coastal Radio Station License is required for changes in the particulars indicated in the License.\n\nThe MODIFICATION of Public Coastal Station License is required for changes in the particulars indicated in the License.",
                WhoMayAvail = "WHO MAY AVAIL:\n\n1. Individuals and Private and Government Entities\n2. Public Telecommunications Entities (PTEs) who are authorized to engage in public maritime communications service"
            },
            new ServiceInformation
            {
                Id = Guid.Parse("a1000000-0000-0000-0000-000000000012"),
                ServiceId = FindServiceId("LICENSES FOR GOVERNMENT AND PRIVATE RADIO STATIONS IN THE FIXED AND LAND MOBILE SERVICE", "Fixed Radio"),
                Information = "Licenses for Government and Private Radio Stations in the Fixed and Land Mobile Service\n\nA Radio Station License is a written authority issued by the Commission to an individual, private and government entities authorizing the holder thereof to operate a radio station.\n\nThe RENEWAL of a Radio Station License is required from an individual or private or government entities for the continuous operation of an existing radio station.\n\nThe MODIFICATION of a Radio Station License is required from the Commission to an individual, private and government entities for changes in the particulars indicated in the License.",
                WhoMayAvail = "WHO MAY AVAIL:\n\n1. Individuals and Private and Government Entities\n2. Public Telecommunications Entities (PTEs) who are authorized to engage in public maritime communications service"
            },
            new ServiceInformation
            {
                Id = Guid.Parse("a1000000-0000-0000-0000-000000000013"),
                ServiceId = FindServiceId("OTHER RADIO STATION", "Other License"),
                Information = "Radio Station License\n\nThe RENEWAL of a Radio Station License is required from the public telecommunications entity for the continuous operation of an existing radio station.\n\nThe MODIFICATION of a Radio Station License is required from the public telecommunications entity for changes in the particulars indicated in the License.",
                WhoMayAvail = "WHO MAY AVAIL:\n\n1. Public Telecommunications Entities (PTEs)\n2. Private and Government Entities"
            },
            new ServiceInformation
            {
                Id = Guid.Parse("a1000000-0000-0000-0000-000000000014"),
                ServiceId = FindServiceId("TVRO/CATV", "Cable TV License"),
                Information = "TVRO/CATV Station License\n\nA TVRO Station License or CATV Station License is a written authority issued by the Commission to cable TV operators, private and government entities authorizing the holder thereof to operate a TVRO for commercial purposes or operate a CATV system.\n\nThe RENEWAL of a TVRO Station License or CATV Station License is required for the continuous operation of the subject station.",
                WhoMayAvail = "WHO MAY AVAIL:\n\n1. Cable TV Operators and Private and Government Entities"
            },
            new ServiceInformation
            {
                Id = Guid.Parse("a1000000-0000-0000-0000-000000000015"),
                ServiceId = FindServiceId("COPY OF LICENSES", "Duplicate License"),
                Information = "Copy of Licenses\n\nA Certified True Copy of a License is issued by the Commission to individuals, private and government entities upon request of the holder to authenticate copy of the same.\n\nA Duplicate Copy of a License is issued by the Commission to individuals, private and government entities upon request of the holder for the re-issuance of the same.",
                WhoMayAvail = "WHO MAY AVAIL:\n\n1. Individuals\n2. Private and Government Entities"
            },

            // PERMITS
            new ServiceInformation
            {
                Id = Guid.Parse("a1000000-0000-0000-0000-000000000016"),
                ServiceId = FindServiceId("Permits in the Amateur Service", "Amateur Permit"),
                Information = "Permits in the Amateur Service\n\nThe Amateur Radio Station Permit is a written authority issued by the Commission to a person or a club authorizing the holder thereof to operate a class of radio station in the Amateur Service.\n\nThe RENEWAL of Amateur Radio Station Permit and/or Special Permit for the Use of Vanity Call Sign is/are required for the continuous operation of any class of radio stations in the Amateur Service.\n\nThe MODIFICATION of Amateur Radio Station Permit is required for changes in the particulars indicated in the Permit.",
                WhoMayAvail = "WHO MAY AVAIL:\n\n1. Individuals who have passed the Amateur Radio Operator Examination conducted by NTC\n2. Duly accredited amateur radio clubs\n3. Foreign amateurs qualified under the reciprocity agreement\n4. Licensed amateur radio operators"
            },
            new ServiceInformation
            {
                Id = Guid.Parse("a1000000-0000-0000-0000-000000000017"),
                ServiceId = FindServiceId("Permits in the Aeronautical Service", "Aeronautical Permit"),
                Information = "Permits in the Aeronautical Service\n\nA Permit to Purchase/Possess is a written authority issued by the Commission to an individual, private and government entities authorizing the holder thereof to purchase/acquire and/or possess/own a radio transceiver.",
                WhoMayAvail = "WHO MAY AVAIL:\n\n1. Individuals and Private and Government Entities"
            },
            new ServiceInformation
            {
                Id = Guid.Parse("a1000000-0000-0000-0000-000000000018"),
                ServiceId = FindServiceId("Permits in the Maritime Service", "Maritime Permit"),
                Information = "Permits in the Maritime Service\n\nA Permit to Purchase/Possess is a written authority issued by the Commission to a public telecommunications entity (PTEs) authorizing the holder thereof to purchase/acquire and/or possess/own a radio transceiver.",
                WhoMayAvail = "WHO MAY AVAIL:\n\n1. Individuals and Private and Government Entities\n2. Public Telecommunications Entities (PTEs) who are authorized to engage in public maritime communications service"
            },
            new ServiceInformation
            {
                Id = Guid.Parse("a1000000-0000-0000-0000-000000000019"),
                ServiceId = FindServiceId("Permits for Government and Private Radio Stations", "Permit to Purchase"),
                Information = "Permits for Government and Private Radio Stations in the Fixed and Land Mobile Service\n\nA Permit to Purchase/Possess is a written authority issued by the Commission to an individual or private or government entities authorizing the holder thereof to purchase/acquire and/or possess/own a radio transceiver.\n\nA Permit to Possess for Storage is a written authority issued by the Commission to an individual, private and government entities authorizing the storage of radio communications equipment.\n\nA Construction Permit is a written authority issued by the Commission to an individual, private and government entities authorizing the holder thereof to construct or install radio transceivers or radio station(s).",
                WhoMayAvail = "WHO MAY AVAIL:\n\n1. Individuals and Private and Government Entities\n2. Public Telecommunications Entities (PTEs) who are authorized to engage in public maritime communications service"
            },
            new ServiceInformation
            {
                Id = Guid.Parse("a1000000-0000-0000-0000-000000000020"),
                ServiceId = FindServiceId("Permits for Public Telecommunications Entities", "PTE Storage Permit"),
                Information = "Permits for Public Telecommunications Entities (PTEs)\n\nA Permit to Possess for Storage is a written authority issued by the Commission to public telecommunications entities authorizing the storage of radio communications equipment.",
                WhoMayAvail = "WHO MAY AVAIL:\n\n1. Public Telecommunications Entities (PTEs)"
            },
            new ServiceInformation
            {
                Id = Guid.Parse("a1000000-0000-0000-0000-000000000021"),
                ServiceId = FindServiceId("Radio Communications Equipment", "RCE Dealer"),
                Information = "Permits for Radio Communications Equipment\n\nA Permit to Transport is a written authority issued by the Commission to an individual, private and government entities authorizing the holder thereof to transport radio communications equipment.\n\nAn Accreditation for Radio Communications Equipment (RCE) Dealer or RCE Manufacturer or RCE Service Center is a written authority issued by the Commission to a person, firm, company, association or corporation authorizing the holder thereof to engage in the acquisition and purchase/sale, or manufacture, or servicing and maintenance of radio communications equipment.",
                WhoMayAvail = "WHO MAY AVAIL:\n\n1. Individuals and Private and Government Entities\n2. Public Telecommunications Entities (PTEs) who are authorized to engage in public maritime communications service"
            },
            new ServiceInformation
            {
                Id = Guid.Parse("a1000000-0000-0000-0000-000000000022"),
                ServiceId = FindServiceId("PERMITS FOR MOBILE PHONE", "PERMITS FOR MOBILE PHONE"),
                Information = "Permits for Mobile Phone\n\nAn Accreditation for Mobile Phone Dealer or Mobile Phone Retailer/Reseller or Mobile Phone Service Center is a written authority issued by the Commission to a person, firm, company, association or corporation authorizing the holder thereof to engage in the acquisition and purchase/sale, or servicing and maintenance of mobile phones.",
                WhoMayAvail = "WHO MAY AVAIL:\n\n1. Individuals and Private Entities"
            },
            new ServiceInformation
            {
                Id = Guid.Parse("a1000000-0000-0000-0000-000000000023"),
                ServiceId = FindServiceId("Copy of Permits", "Duplicate Permit"),
                Information = "Copy of Permits\n\nA Certified True Copy of a Permit is issued by the Commission to individuals, private and government entities upon request of the holder to authenticate copy of the same.\n\nA Duplicate Copy of a Permit is issued by the Commission to individuals, private and government entities upon request of the holder for the re-issuance of the same.",
                WhoMayAvail = "WHO MAY AVAIL:\n\n1. Individuals\n2. Private and Government Entities"
            },

            // REQUESTS AND COMPLAINTS
            new ServiceInformation
            {
                Id = Guid.Parse("a1000000-0000-0000-0000-000000000024"),
                ServiceId = FindServiceId("Requests and Complaints", "IMEI", "SIM Blocking"),
                Information = "Requests and Complaints of Consumers/Subscribers\n\nThe Commission acts on:\n\n(a) requests for blocking of mobile phone's IMEI (International Mobile Equipment Identity) and SIM (Subscriber Identity Module) due to lost/stolen cellphone units or unblocking of the same;\n\n(b) complaints of consumers/subscribers of telecommunications companies such as text scams, unwanted calls/texts and illegal/obscene/threat/other similar text messages; and\n\n(c) complaints of consumers/subscribers of telecommunications or broadcast Service Providers (i.e. Cable TV, DTH, etc.) such as billing complaint, poor customer service, poor technical service and fair usage issues.",
                WhoMayAvail = "WHO MAY AVAIL:\n\n1. Individuals\n2. Private and Government Entities"
            }
        };

        foreach (var item in seedList)
        {
            if (!existingServiceIds.Contains(item.ServiceId))
            {
                context.ServiceInformations.Add(item);
            }
        }

        await context.SaveChangesAsync();
    }
}
