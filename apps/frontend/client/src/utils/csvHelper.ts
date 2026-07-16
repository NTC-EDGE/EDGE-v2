import _ from 'lodash';

export const parseCSVRow = (text: string) => {
    let ret = [''], i = 0, p = '', s = true;
    for (let l = text.length; i < l; i++) {
        let char = text[i];
        if ('"' === char) {
            s = !s;
            if ('"' === p) {
                ret[ret.length - 1] += '"';
                char = '-';
            } else if ('' === p) {
                char = '-';
            }
        } else if (s && ',' === char) {
            char = ret[++ret.length - 1] = '';
        } else {
            ret[ret.length - 1] += char;
        }
        p = char;
    }
    return ret;
};

export const generateCSVTemplate = () => {
    const row1 = "Application Type,Examinee Type,Class/Element,Last Name,First Name,Middle Name,Suffix,Date of Birth (mm/dd/yyyy),Sex,Nationality,Region,Province,City,Barangay,Street/Zone,Unit/Rm./House/Bldg.No.,Zip Code,School Attended,Course Taken,Year Graduated,Contact Number,Email Address";
    const row2 = "applicationType.label,service.examineeType.examineeType,service.applicationType.element,service.basic.lastName,service.basic.firstName,service.basic.MiddleName,service.basic.Suffix,service.basic.dateOfBirth,service.basic.sex,service.basic.nationality,region,applicant.address.province,applicant.address.city,applicant.address.barangay,applicant.address.street,applicant.address.unit,applicant.address.zipCode,applicant.education.schoolAttended,applicant.education.courseTaken,applicant.education.yearGraduated,applicant.contact.contactNumber,applicant.contact.email";
    return `${row1}\n${row2}\n`;
};

export const setNestedValue = (obj: any, path: string, value: string) => {
    if (!path) return;
    
    // Special handling for Date of Birth
    if (path === 'service.basic.dateOfBirth.month/service.basic.dateOfBirth.day/service.basic.dateOfBirth.year' || path === 'service.basic.dateOfBirth') {
        if (!value) return;
        const parts = value.split(/[-/]/);
        if (parts.length === 3) {
            const m = parts[0].padStart(2, '0');
            const d = parts[1].padStart(2, '0');
            const y = parts[2];
            _.set(obj, 'service.basic.dateOfBirth.month', m);
            _.set(obj, 'service.basic.dateOfBirth.day', d);
            _.set(obj, 'service.basic.dateOfBirth.year', y);
        } else {
            _.set(obj, 'service.basic.dateOfBirth', value);
        }
        return;
    }

    _.set(obj, path, value);
};

export const HEADER_TO_PATH_MAP: Record<string, string> = {
    "Application Type": "applicationType.label",
    "Examinee Type": "service.examineeType.examineeType",
    "Class/Element": "service.applicationType.element",
    "Last Name": "service.basic.lastName",
    "First Name": "service.basic.firstName",
    "Middle Name": "service.basic.MiddleName",
    "Suffix": "service.basic.Suffix",
    "Date of Birth (mm/dd/yyyy)": "service.basic.dateOfBirth",
    "Sex": "service.basic.sex",
    "Nationality": "service.basic.nationality",
    "Region": "region",
    "Province": "applicant.address.province",
    "City": "applicant.address.city",
    "Barangay": "applicant.address.barangay",
    "Street/Zone": "applicant.address.street",
    "Unit/Rm./House/Bldg.No.": "applicant.address.unit",
    "Zip Code": "applicant.address.zipCode",
    "School Attended": "applicant.education.schoolAttended",
    "Course Taken": "applicant.education.courseTaken",
    "Year Graduated": "applicant.education.yearGraduated",
    "Contact Number": "applicant.contact.contactNumber",
    "Email Address": "applicant.contact.email"
};

export const parseCSV = (csvContent: string) => {
    const lines = csvContent.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) return { success: false, error: 'CSV must contain at least a header row and one data row.', data: [] };
    
    const displayHeaders = parseCSVRow(lines[0]).map(h => h.trim());
    
    let pathHeaders: string[] = [];
    let dataLines: string[] = [];
    
    // Check if the second row is actually the mapping row
    const row2Raw = lines[1];
    if (row2Raw.includes('applicationType.label') || row2Raw.includes('service.basic')) {
        pathHeaders = parseCSVRow(lines[1]).map(h => h.trim());
        dataLines = lines.slice(2);
    } else {
        // Fallback: the second row is data, so use the internal map
        pathHeaders = displayHeaders.map(h => HEADER_TO_PATH_MAP[h] || '');
        dataLines = lines.slice(1);
    }
    
    if (pathHeaders.length === 0 || !pathHeaders[0]) {
         return { success: false, error: 'Missing mapping row or unmapped headers.', data: [] };
    }

    const data = dataLines.map(line => {
        const values = parseCSVRow(line);
        const obj: any = {};
        
        // Also keep raw string values for validation/preview
        const rawRow: any = {};
        
        pathHeaders.forEach((path, index) => {
            const val = values[index]?.trim() || '';
            const label = displayHeaders[index] || path;
            rawRow[label] = val;
            if (path && val) {
                setNestedValue(obj, path, val);
            }
        });
        
        // Ensure structure exists even if empty
        if (!obj.service) obj.service = {};
        if (!obj.service.basic) obj.service.basic = {};
        if (!obj.service.examineeType) obj.service.examineeType = {};
        if (!obj.service.applicationType) obj.service.applicationType = {};
        if (!obj.applicationType) obj.applicationType = {};
        if (!obj.applicant) obj.applicant = { address: {}, education: {}, contact: {} };
        
        return { parsedObj: obj, rawRow };
    });
    
    return { success: true, data };
};
