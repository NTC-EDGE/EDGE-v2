
import Moment from 'moment';
import { Alert, Linking, Platform } from "react-native";
import { AI_BASE_URL } from "@services/config";
export const normalizeRegionText = (value: any) =>
  String(value || '')
    .normalize('NFKC')
    .trim()
    .toLowerCase();

export const looseRegionKey = (value: any) =>
  normalizeRegionText(value)
    .replace(/region/g, '')
    .replace(/[^a-z0-9]/g, '');

export const findMatchingRegion = (regionValue: any) => {
  if (!regionValue) return null;

  if (typeof regionValue === 'object') {
    return regionValue;
  }

  return region_list.find((region: any) => {
    return (
      normalizeRegionText(region?.label) === normalizeRegionText(regionValue) ||
      normalizeRegionText(region?.value) === normalizeRegionText(regionValue) ||
      normalizeRegionText(region?.code) === normalizeRegionText(regionValue) ||
      looseRegionKey(region?.label) === looseRegionKey(regionValue) ||
      looseRegionKey(region?.value) === looseRegionKey(regionValue) ||
      looseRegionKey(region?.code) === looseRegionKey(regionValue)
    );
  }) || null;
};
const GUEST_USER = {
  email: 'guest.ntcedge@ustp.edu.ph',
  password: 'AZaz09!@',
};
function extractProxyText(json: any): string {
  return (json?.result?.response ?? json?.result?.choices?.[0]?.message?.content ?? "").toString().trim();
}
const TIMER_LOGOUT = 30 * 60 * 1000; // in seconds
export async function translateText(
  input: string
): Promise<string> {
  const hasText = !!input.trim();



  const prompt = hasText
    ? `Rewrite the remarks into ONE concise, professional sentence for declining an application, with a   angle. Keep neutral, respectful, and specific. Add one brief constructive suggestion if appropriate.

Remarks:


Output:`
    : `Write ONE concise, professional sentence to decline an application based on the category: , with a   angle. Keep neutral, respectful, and specific. Add one brief constructive suggestion if appropriate. Do NOT invent details.

Output:`;

  try {
    const res = await fetch(AI_BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "@cf/openai/gpt-oss-120b",
        instructions:
          "Write record-safe decline notes for government use. Output exactly ONE sentence. Use neutral tone. Do not add facts not present in the input. If giving a suggestion, keep it generic and non-committal.",
        input: prompt,
        max_output_tokens: 80,
      }),
    });

    const json = await res.json().catch(() => ({}));
    const out = extractProxyText(json);


    if (res.ok && out) return out;

    return "0";
  } catch (e) {
    return "0"
  }
}
const regionList = [
  {
    "label": "Region I - Ilocos Region",
    "value": "I"
  },
  {
    "label": "Region II - Cagayan Valley",
    "value": "II"
  },
  {
    "label": "Region III - Central Luzon",
    "value": "III"
  },
  {
    "label": "Region IV-A - CALABARZON",
    "value": "IV-A"
  },
  {
    "label": "MIMAROPA Region",
    "value": "IV-B"
  },
  {
    "label": "Region V - Bicol Region",
    "value": "V"
  },
  {
    "label": "Region VI - Western Visayas",
    "value": "VI"
  },
  {
    "label": "Region VII - Central Visayas",
    "value": "VII"
  },
  {
    "label": "Region VIII - Eastern Visayas",
    "value": "VIII"
  },
  {
    "label": "Region IX - Zamboanga Peninsula",
    "value": "IX"
  },
  {
    "label": "Region X - Northern Mindanao",
    "value": "X"
  },
  {
    "label": "Region XI - Davao Region",
    "value": "XI"
  },
  {
    "label": "Region XII - SOCCSKSARGEN",
    "value": "XII"
  },
  {
    "label": "Region XIII - Caraga",
    "value": "XIII"
  },
  {
    "label": "NCR - National Capital Region",
    "value": "NCR"
  },
  {
    "label": "CAR - Cordillera Administrative Region",
    "value": "CAR"
  },
  {
    "label": "BARMM - Bangsamoro Autonomous Region in Muslim Mindanao",
    "value": "BARMM"
  }, {
    "label": "Region XIV",
    "value": "XIV"
  }
];

let cachedBirthyearList: { label: string; value: string }[] | null = null;
const birthyearList = () => {
  if (cachedBirthyearList) return cachedBirthyearList;
  var presentYear = Moment().get('year');
  var startYear = Moment().subtract(120, 'years');
  var years = [];

  while (startYear.get('year') <= presentYear) {
    years.push({
      label: startYear.get('year').toString(),
      value: startYear.get('year').toString(),
    });
    startYear.add(1, 'years');
  }

  years = years.reverse();
  cachedBirthyearList = years;

  return years;
};

let cachedYearList: { label: string; value: string }[] | null = null;
const yearList = () => {
  if (cachedYearList) return cachedYearList;
  var presentYear = Moment().add(20, 'years').get('year');
  var startYear = Moment().subtract(50, 'years');
  var years = [];

  while (startYear.get('year') <= presentYear) {
    years.push({
      label: startYear.get('year').toString(),
      value: startYear.get('year').toString(),
    });
    startYear.add(1, 'years');
  }

  years = years.reverse();
  cachedYearList = years;

  return years;
};

const NTCPreview = (filename: string) => {
  const split = filename?.split('.');
  const ext = split?.[split?.length - 1];
  let pdf = require('@assets/preview/pdf.png');
  let docs = require('@assets/preview/docs.png');
  let excel = require('@assets/preview/excel.png');
  let slides = require('@assets/preview/slides.png');
  let file = require('@assets/preview/file.png');

  if (ext === 'pdf') return pdf;
  else if (
    ext === 'doc' ||
    ext === 'docx' ||
    ext === 'dotx'
  ) return docs;
  else if (
    ext === 'xls' ||
    ext === 'xlsx' ||
    ext === 'xltx'
  ) return excel;
  else if (
    ext === 'ppt' ||
    ext === 'pptx' ||
    ext === 'potx' ||
    ext === 'ppsx'
  ) return slides;
  else if (
    ext === 'jpg' ||
    ext === 'bmp' ||
    ext === 'BMP' ||
    ext === 'JPG' ||
    ext === 'jpeg' ||
    ext === 'JPEG' ||
    ext === 'png' ||
    ext === 'PNG' ||
    ext === 'webp' ||
    ext === 'WEBP'
  ) return 'image';



  else return file;
};
const isWeb = Platform.OS === 'web';

const getFileNameFromUrl = (url?: string, fallback = 'file.pdf') => {
  if (!url) return fallback;
  try {
    const clean = url.split('?')[0];
    const name = decodeURIComponent(clean.substring(clean.lastIndexOf('/') + 1));
    return name || fallback;
  } catch {
    return fallback;
  }
};
async function webDownload(url: string, filename: string) {
  try {
    // If CORS is enabled, this works and gives a proper filename
    const resp = await fetch(url, { credentials: 'include' });
    const blob = await resp.blob();
    const href = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = href;
    a.download = filename;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(href);
    return;
  } catch {
    // Fallback: best effort via anchor (download attr may be ignored cross-origin)
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.target = '_blank';
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
}

export async function downloadFile(url?: string, filename?: string) {
  if (!url) return;
  const name = filename || getFileNameFromUrl(url);

  if (isWeb) {
    await webDownload(url, name);
    return;
  }

}

export function viewFile(url?: string) {
  if (!url) return;
  // Web: open in new tab, Native: deep-link to viewer (or your own preview)
  if (isWeb) {
    // @ts-ignore
    window.open(url, '_blank', 'noopener');
  } else {
    Linking.openURL(url);
  }
}

/**
 * In-memory cache for transformText to avoid repeated expensive string operations
 * on long lists of labels in the Preview screens.
 */
const transformCache = new Map<string, string>();

const transformText = (text: string) => {
  if (!text) return text;
  if (transformCache.has(text)) return transformCache.get(text)!;

  let result = '';
  if (text === 'examSeminar') result = 'Exam/Seminar';
  else if (text === 'typeModel') result = 'Type/Model';
  else if (text === 'makeTypeModel') result = 'Make/Type/Model';
  else if (text === 'orInvoiceNumber') result = 'OR/Invoice No.';
  else if (text === 'permitRSLNumber') result = 'Permit/RSL No.';
  else if (text === 'pointsOfCommServiceArea') result = 'Points of Comm/Service Area';
  else if (text === 'authorizedSellerBuyer') result = 'Authorized Seller/Buyer';
  else if (text === 'shipVesselName') result = 'Ship/Vessel Name';
  else if (text === 'radioOfficerOperator') result = 'Radio Officer/Operator';
  else if (text === 'peceEceNumber') result = 'PECE/ECE No.';
  else if (text === 'certificateEctNumber') result = 'Certificate/ECT No.';
  else if (text === 'exactLocationOfTvroSystem') result = 'Exact Location of TVRO System';
  else if (text === 'cpcnPaCaNumber') result = 'CPCN/PA/CA No.';
  else if (text === 'certificateNumber') result = 'Certificate No.';
  else if (text === 'licenseNumber') result = 'License No.';
  else if (text === 'permitNumber') result = 'Permit No.';
  else if (text === 'lossMutilationDueTo') result = 'Loss/Mutilation due to';
  else if (text === 'cellphoneNumber') result = 'Cellphone No.';
  else if (text === 'typeOfEquipmentDevice') result = 'Type of Equipment/Device';
  else if (text === 'cpcnPaCaDateOfExpiry') result = 'CPCN/PA/CA Date of Expiry';
  else if (text === 'cellphoneNumberToBeBlocked') result = 'Cellphone No. to be Blocked';
  else if (text === 'streetZone') result = 'Street/Zone';
  else if (text === 'corVasNumber') result = 'COR/VAS No.';
  else if (text === 'corVasDateOfExpiry') result = 'COR/VAS Date of Expiry';
  else if (text === 'noOfCopies') result = 'No. of Copies';
  else if (text === 'dealerSellerName') result = 'Dealer/Seller Name';
  else if (text === 'amateurLicenseNumberPermitToPossessNumber') result = 'Amateur License No./Permit to Possess No.';
  else if (text === 'rocEctNumber') result = 'ROC/ECT No.';
  else if (text === 'stationEquipment') result = 'Station/Equipment';
  else if (text === 'proposedStationEquipment') result = 'Proposed Station/Equipment';
  else if (text === 'secDtiRegistationNumber') result = 'SEC/DTI Registration No.';
  else if (text === 'bsdNumber') result = 'BSD No.';
  else if (text === 'vasRegistrationNumber') result = 'VAS Registration No.';
  else if (text === 'anchorCommentator') result = 'Anchor/Commentator';
  else {
    result = text?.replace(/([a-z])([A-Z])/g, '$1 $2')?.split(' ')?.map((word: string) => word?.charAt(0)?.toUpperCase() + word?.substring?.(1))?.join(' ');
  }

  transformCache.set(text, result);
  return result;
};
const region_list = [
  {
    "_id": "d0fb9a9c-01af-45c1-a637-bb08c5807f68",
    "address": null,
    "label": "Region I - Ilocos Region",
    "value": "I",
    "code": "I",

  },
  {
    "_id": "9d15d4e6-ec3a-48eb-828a-8748174a9e16",
    "address": null,
    "label": "Region II - Cagayan Valley",
    "value": "II",
    "code": "II",

  },
  {
    "_id": "42013b7f-de24-4e63-84a0-a07219bbea63",
    "address": null,
    "label": "Region III - Central Luzon",
    "value": "III",
    "code": "III",

  },
  {
    "_id": "5841d4a5-e366-4d4d-9f14-b6fdce05ec99",
    "address": null,
    "label": "Region IV-A - CALABARZON",
    "value": "IV-A",
    "code": "IV-A",

  },
  {
    "_id": "1d9045b4-e335-4c21-836a-d27441c5f021",
    "address": null,
    "label": "MIMAROPA Region",
    "value": "IV-B",
    "code": "IV-B",

  },
  {
    "_id": "abfe1e30-f2f7-44b2-949a-6ab6d67c8bc7",
    "address": null,
    "label": "Region V - Bicol Region",
    "value": "V",
    "code": "V",

  },
  {
    "_id": "08ca7f03-4e94-4f8c-9025-879da749ffc6",
    "address": null,
    "label": "Region VI - Western Visayas",
    "value": "VI",
    "code": "VI",

  },
  {
    "_id": "1031830d-0a90-422a-918e-d497cb32381d",
    "address": null,
    "label": "Region VII - Central Visayas",
    "value": "VII",
    "code": "VII",

  },
  {
    "_id": "c661d393-fb39-4bd2-8fa0-7947760567c7",
    "address": null,
    "label": "Region VIII - Eastern Visayas",
    "value": "VIII",
    "code": "VIII",

  },
  {
    "_id": "87903b05-6b0e-46d9-9c19-e1b7b18b8179",
    "address": null,
    "label": "Region IX - Zamboanga Peninsula",
    "value": "IX",
    "code": "IX",

  },
  {
    "_id": "b7b01700-69d5-49af-b7ec-9a3e88f60278",
    "address": null,
    "label": "Region X - Northern Mindanao",
    "value": "X",
    "code": "X",
  },
  {
    "_id": "7567d000-05ae-456e-9a43-b0ad19f701df",
    "address": null,
    "label": "Region XI - Davao Region",
    "value": "XI",
    "code": "XI",

  },
  {
    "_id": "ba3e1387-b775-4ac0-a421-dbc06997bd81",
    "address": null,
    "label": "Region XII - SOCCSKSARGEN",
    "value": "XII",
    "code": "XII",

  },
  {
    "_id": "d38cfce3-ba9b-4273-b556-dbfbdd84a79b",
    "address": null,
    "label": "Region XIII - Caraga",
    "value": "XIII",
    "code": "XIII",

  },
  {
    "_id": "e4d1bf2a-0179-450c-8980-37dfa9ca43cd",
    "address": null,
    "label": "NCR - National Capital Region",
    "value": "NCR",
    "code": "NCR",

  },
  {
    "_id": "56aec340-14c3-418f-a55e-4c22c19bea4c",
    "address": null,
    "label": "Region XIV - CAR",
    "value": "XIV",
    "code": "XIV",

  }, {
    "_id": "56aec340-14c3-418f-a55e-4c22c19bea14",
    "address": null,
    "label": "Region XIV",
    "value": "XIV",
    "code": "XIV",

  },
]

async function loadProvinces() {
  return [
    {
      "id": "853d6889-70f6-4b28-be7b-35da55c30f6d",
      "name": "Basilan",
      "provinceCode": "BAS",
      "regionCode": "BARMM",
      "createdAt": "2025-10-04T03:28:39.615129Z",
      "updatedAt": "2025-10-04T03:28:39.61522Z",
      "_etag": "\"0300049d-0000-2400-0000-68e0946e0000\"",
      "_rid": "HdMlANfvmTgBAAAAAAAAAA==",
      "_self": "dbs/HdMlAA==/colls/HdMlANfvmTg=/docs/HdMlANfvmTgBAAAAAAAAAA==/",
      "_attachments": "attachments/",
      "_ts": 1759548526
    },
    {
      "id": "a065cf8e-0e30-4e1a-a8a6-4ee314c9534d",
      "name": "Lanao Del Sur",
      "provinceCode": "LAS",
      "regionCode": "BARMM",
      "createdAt": "2025-10-04T03:28:39.615306Z",
      "updatedAt": "2025-10-04T03:28:39.615306Z",
      "_etag": "\"0300619d-0000-2400-0000-68e094720000\"",
      "_rid": "HdMlANfvmTgCAAAAAAAAAA==",
      "_self": "dbs/HdMlAA==/colls/HdMlANfvmTg=/docs/HdMlANfvmTgCAAAAAAAAAA==/",
      "_attachments": "attachments/",
      "_ts": 1759548530
    },
    {
      "id": "0bc3ae41-fb8c-49e2-b4d2-a85641b00c4e",
      "name": "Maguindanao",
      "provinceCode": "MAG",
      "regionCode": "BARMM",
      "createdAt": "2025-10-04T03:28:39.615306Z",
      "updatedAt": "2025-10-04T03:28:39.615306Z",
      "_etag": "\"0300b49d-0000-2400-0000-68e094740000\"",
      "_rid": "HdMlANfvmTgDAAAAAAAAAA==",
      "_self": "dbs/HdMlAA==/colls/HdMlANfvmTg=/docs/HdMlANfvmTgDAAAAAAAAAA==/",
      "_attachments": "attachments/",
      "_ts": 1759548532
    },
    {
      "id": "95f8b807-c327-41b0-8770-a38eaec65b6f",
      "name": "Sulu",
      "provinceCode": "SUL",
      "regionCode": "BARMM",
      "createdAt": "2025-10-04T03:28:39.615307Z",
      "updatedAt": "2025-10-04T03:28:39.615307Z",
      "_etag": "\"0300329e-0000-2400-0000-68e094790000\"",
      "_rid": "HdMlANfvmTgEAAAAAAAAAA==",
      "_self": "dbs/HdMlAA==/colls/HdMlANfvmTg=/docs/HdMlANfvmTgEAAAAAAAAAA==/",
      "_attachments": "attachments/",
      "_ts": 1759548537
    },
    {
      "id": "0d303523-a059-4917-91af-e24a8996e403",
      "name": "Tawi-tawi",
      "provinceCode": "TAW",
      "regionCode": "BARMM",
      "createdAt": "2025-10-04T03:28:39.615307Z",
      "updatedAt": "2025-10-04T03:28:39.615307Z",
      "_etag": "\"0300a39e-0000-2400-0000-68e0947c0000\"",
      "_rid": "HdMlANfvmTgFAAAAAAAAAA==",
      "_self": "dbs/HdMlAA==/colls/HdMlANfvmTg=/docs/HdMlANfvmTgFAAAAAAAAAA==/",
      "_attachments": "attachments/",
      "_ts": 1759548540
    },
    {
      "id": "2116c217-aa02-4646-a699-94810469422d",
      "name": "Abra",
      "provinceCode": "ABR",
      "regionCode": "CAR",
      "createdAt": "2025-10-04T03:28:39.615308Z",
      "updatedAt": "2025-10-04T03:28:39.615309Z",
      "_etag": "\"0300ca9e-0000-2400-0000-68e0947e0000\"",
      "_rid": "HdMlANfvmTgGAAAAAAAAAA==",
      "_self": "dbs/HdMlAA==/colls/HdMlANfvmTg=/docs/HdMlANfvmTgGAAAAAAAAAA==/",
      "_attachments": "attachments/",
      "_ts": 1759548542
    },
    {
      "id": "eb34186b-832f-4f0f-9350-86f986a21ec3",
      "name": "Apayao",
      "provinceCode": "APA",
      "regionCode": "CAR",
      "createdAt": "2025-10-04T03:28:39.615309Z",
      "updatedAt": "2025-10-04T03:28:39.615309Z",
      "_etag": "\"0300139f-0000-2400-0000-68e094800000\"",
      "_rid": "HdMlANfvmTgHAAAAAAAAAA==",
      "_self": "dbs/HdMlAA==/colls/HdMlANfvmTg=/docs/HdMlANfvmTgHAAAAAAAAAA==/",
      "_attachments": "attachments/",
      "_ts": 1759548544
    },
    {
      "id": "f6ea3954-da3b-4374-908b-4409f36ab47a",
      "name": "Benguet",
      "provinceCode": "BEN",
      "regionCode": "CAR",
      "createdAt": "2025-10-04T03:28:39.615309Z",
      "updatedAt": "2025-10-04T03:28:39.615309Z",
      "_etag": "\"03003a9f-0000-2400-0000-68e094820000\"",
      "_rid": "HdMlANfvmTgIAAAAAAAAAA==",
      "_self": "dbs/HdMlAA==/colls/HdMlANfvmTg=/docs/HdMlANfvmTgIAAAAAAAAAA==/",
      "_attachments": "attachments/",
      "_ts": 1759548546
    },
    {
      "id": "61254bf6-7d1d-4a06-8b9c-d0c4a3b3d927",
      "name": "Kalinga",
      "provinceCode": "KAL",
      "regionCode": "CAR",
      "createdAt": "2025-10-04T03:28:39.615309Z",
      "updatedAt": "2025-10-04T03:28:39.615309Z",
      "_etag": "\"0300719f-0000-2400-0000-68e094840000\"",
      "_rid": "HdMlANfvmTgJAAAAAAAAAA==",
      "_self": "dbs/HdMlAA==/colls/HdMlANfvmTg=/docs/HdMlANfvmTgJAAAAAAAAAA==/",
      "_attachments": "attachments/",
      "_ts": 1759548548
    },
    {
      "id": "3370bb7a-8fce-423f-a40f-fff55d9f5c9d",
      "name": "Mountain Province",
      "provinceCode": "MOU",
      "regionCode": "CAR",
      "createdAt": "2025-10-04T03:28:39.61531Z",
      "updatedAt": "2025-10-04T03:28:39.61531Z",
      "_etag": "\"0300c69f-0000-2400-0000-68e094870000\"",
      "_rid": "HdMlANfvmTgKAAAAAAAAAA==",
      "_self": "dbs/HdMlAA==/colls/HdMlANfvmTg=/docs/HdMlANfvmTgKAAAAAAAAAA==/",
      "_attachments": "attachments/",
      "_ts": 1759548551
    },
    {
      "id": "7d4bdebc-50a4-423b-8e92-5e88dcd3da71",
      "name": "Ifugao",
      "provinceCode": "IFU",
      "regionCode": "CAR",
      "createdAt": "2025-10-04T03:28:39.61531Z",
      "updatedAt": "2025-10-04T03:28:39.61531Z",
      "_etag": "\"0300fb9f-0000-2400-0000-68e0948a0000\"",
      "_rid": "HdMlANfvmTgLAAAAAAAAAA==",
      "_self": "dbs/HdMlAA==/colls/HdMlANfvmTg=/docs/HdMlANfvmTgLAAAAAAAAAA==/",
      "_attachments": "attachments/",
      "_ts": 1759548554
    },
    {
      "id": "98b46af1-0f00-4152-b107-c0252826dbea",
      "name": "Ilocos Norte",
      "provinceCode": "ILN",
      "regionCode": "I",
      "createdAt": "2025-10-04T03:28:39.61531Z",
      "updatedAt": "2025-10-04T03:28:39.61531Z",
      "_etag": "\"030060a0-0000-2400-0000-68e0948d0000\"",
      "_rid": "HdMlANfvmTgMAAAAAAAAAA==",
      "_self": "dbs/HdMlAA==/colls/HdMlANfvmTg=/docs/HdMlANfvmTgMAAAAAAAAAA==/",
      "_attachments": "attachments/",
      "_ts": 1759548557
    },
    {
      "id": "3f21846e-f122-4edb-bdbc-3f45ec29120b",
      "name": "La Union",
      "provinceCode": "LAU",
      "regionCode": "I",
      "createdAt": "2025-10-04T03:28:39.615324Z",
      "updatedAt": "2025-10-04T03:28:39.615324Z",
      "_etag": "\"0300e9a0-0000-2400-0000-68e094920000\"",
      "_rid": "HdMlANfvmTgNAAAAAAAAAA==",
      "_self": "dbs/HdMlAA==/colls/HdMlANfvmTg=/docs/HdMlANfvmTgNAAAAAAAAAA==/",
      "_attachments": "attachments/",
      "_ts": 1759548562
    },
    {
      "id": "8d9f793f-41e1-4ccd-9b74-2ff7a4f29aee",
      "name": "Ilocos Sur",
      "provinceCode": "ILS",
      "regionCode": "I",
      "createdAt": "2025-10-04T03:28:39.615325Z",
      "updatedAt": "2025-10-04T03:28:39.615325Z",
      "_etag": "\"0300c4a1-0000-2400-0000-68e0949a0000\"",
      "_rid": "HdMlANfvmTgOAAAAAAAAAA==",
      "_self": "dbs/HdMlAA==/colls/HdMlANfvmTg=/docs/HdMlANfvmTgOAAAAAAAAAA==/",
      "_attachments": "attachments/",
      "_ts": 1759548570
    },
    {
      "id": "c86fc9d0-59fb-43cb-b726-ba82187df94a",
      "name": "Pangasinan",
      "provinceCode": "PAN",
      "regionCode": "I",
      "createdAt": "2025-10-04T03:28:39.615325Z",
      "updatedAt": "2025-10-04T03:28:39.615325Z",
      "_etag": "\"030047a2-0000-2400-0000-68e0949e0000\"",
      "_rid": "HdMlANfvmTgPAAAAAAAAAA==",
      "_self": "dbs/HdMlAA==/colls/HdMlANfvmTg=/docs/HdMlANfvmTgPAAAAAAAAAA==/",
      "_attachments": "attachments/",
      "_ts": 1759548574
    },
    {
      "id": "329d7a7d-c588-4586-997b-7c51e1688e5b",
      "name": "Cagayan",
      "provinceCode": "CAG",
      "regionCode": "II",
      "createdAt": "2025-10-04T03:28:39.615325Z",
      "updatedAt": "2025-10-04T03:28:39.615325Z",
      "_etag": "\"0300a8a2-0000-2400-0000-68e094a20000\"",
      "_rid": "HdMlANfvmTgQAAAAAAAAAA==",
      "_self": "dbs/HdMlAA==/colls/HdMlANfvmTg=/docs/HdMlANfvmTgQAAAAAAAAAA==/",
      "_attachments": "attachments/",
      "_ts": 1759548578
    },
    {
      "id": "79e8a087-414d-48af-bb94-b683a75512ef",
      "name": "Isabela",
      "provinceCode": "ISA",
      "regionCode": "II",
      "createdAt": "2025-10-04T03:28:39.615325Z",
      "updatedAt": "2025-10-04T03:28:39.615325Z",
      "_etag": "\"0300eaa2-0000-2400-0000-68e094a40000\"",
      "_rid": "HdMlANfvmTgRAAAAAAAAAA==",
      "_self": "dbs/HdMlAA==/colls/HdMlANfvmTg=/docs/HdMlANfvmTgRAAAAAAAAAA==/",
      "_attachments": "attachments/",
      "_ts": 1759548580
    },
    {
      "id": "45db20c7-43bf-47a1-8bd5-9ede80649a33",
      "name": "Nueva Vizcaya",
      "provinceCode": "NUV",
      "regionCode": "II",
      "createdAt": "2025-10-04T03:28:39.615326Z",
      "updatedAt": "2025-10-04T03:28:39.615326Z",
      "_etag": "\"03002fa3-0000-2400-0000-68e094a70000\"",
      "_rid": "HdMlANfvmTgSAAAAAAAAAA==",
      "_self": "dbs/HdMlAA==/colls/HdMlANfvmTg=/docs/HdMlANfvmTgSAAAAAAAAAA==/",
      "_attachments": "attachments/",
      "_ts": 1759548583
    },
    {
      "id": "70847fdf-3498-45f3-904d-392b9f66c78b",
      "name": "Quirino",
      "provinceCode": "QUI",
      "regionCode": "II",
      "createdAt": "2025-10-04T03:28:39.615326Z",
      "updatedAt": "2025-10-04T03:28:39.615326Z",
      "_etag": "\"03008ba3-0000-2400-0000-68e094aa0000\"",
      "_rid": "HdMlANfvmTgTAAAAAAAAAA==",
      "_self": "dbs/HdMlAA==/colls/HdMlANfvmTg=/docs/HdMlANfvmTgTAAAAAAAAAA==/",
      "_attachments": "attachments/",
      "_ts": 1759548586
    },
    {
      "id": "ea4e3ed1-bce0-4572-949b-ae51bd3a4167",
      "name": "Bataan",
      "provinceCode": "BAT",
      "regionCode": "III",
      "createdAt": "2025-10-04T03:28:39.615326Z",
      "updatedAt": "2025-10-04T03:28:39.615326Z",
      "_etag": "\"0300eda3-0000-2400-0000-68e094ae0000\"",
      "_rid": "HdMlANfvmTgUAAAAAAAAAA==",
      "_self": "dbs/HdMlAA==/colls/HdMlANfvmTg=/docs/HdMlANfvmTgUAAAAAAAAAA==/",
      "_attachments": "attachments/",
      "_ts": 1759548590
    },
    {
      "id": "9d914e1d-b309-4401-a448-9cfc421af463",
      "name": "Bulacan",
      "provinceCode": "BUL",
      "regionCode": "III",
      "createdAt": "2025-10-04T03:28:39.615326Z",
      "updatedAt": "2025-10-04T03:28:39.615326Z",
      "_etag": "\"030040a4-0000-2400-0000-68e094b10000\"",
      "_rid": "HdMlANfvmTgVAAAAAAAAAA==",
      "_self": "dbs/HdMlAA==/colls/HdMlANfvmTg=/docs/HdMlANfvmTgVAAAAAAAAAA==/",
      "_attachments": "attachments/",
      "_ts": 1759548593
    },
    {
      "id": "20adb970-9e44-485f-a047-2660ff4a34e6",
      "name": "Nueva Ecija",
      "provinceCode": "NUE",
      "regionCode": "III",
      "createdAt": "2025-10-04T03:28:39.615326Z",
      "updatedAt": "2025-10-04T03:28:39.615326Z",
      "_etag": "\"030087a4-0000-2400-0000-68e094b40000\"",
      "_rid": "HdMlANfvmTgWAAAAAAAAAA==",
      "_self": "dbs/HdMlAA==/colls/HdMlANfvmTg=/docs/HdMlANfvmTgWAAAAAAAAAA==/",
      "_attachments": "attachments/",
      "_ts": 1759548596
    },
    {
      "id": "936745db-0fdc-45bc-9970-126fdc9b073b",
      "name": "Pampanga",
      "provinceCode": "PAM",
      "regionCode": "III",
      "createdAt": "2025-10-04T03:28:39.615326Z",
      "updatedAt": "2025-10-04T03:28:39.615327Z",
      "_etag": "\"0300f7a4-0000-2400-0000-68e094b80000\"",
      "_rid": "HdMlANfvmTgXAAAAAAAAAA==",
      "_self": "dbs/HdMlAA==/colls/HdMlANfvmTg=/docs/HdMlANfvmTgXAAAAAAAAAA==/",
      "_attachments": "attachments/",
      "_ts": 1759548600
    },
    {
      "id": "312baa48-e764-43a0-b753-e3736dd6c4ad",
      "name": "Tarlac",
      "provinceCode": "TAR",
      "regionCode": "III",
      "createdAt": "2025-10-04T03:28:39.615327Z",
      "updatedAt": "2025-10-04T03:28:39.615327Z",
      "_etag": "\"03005fa5-0000-2400-0000-68e094bc0000\"",
      "_rid": "HdMlANfvmTgYAAAAAAAAAA==",
      "_self": "dbs/HdMlAA==/colls/HdMlANfvmTg=/docs/HdMlANfvmTgYAAAAAAAAAA==/",
      "_attachments": "attachments/",
      "_ts": 1759548604
    },
    {
      "id": "656b768a-cbf9-40bc-869a-30e2ad0ca22f",
      "name": "Batangas",
      "provinceCode": "BTG",
      "regionCode": "IV-A",
      "createdAt": "2025-10-04T03:28:39.615327Z",
      "updatedAt": "2025-10-04T03:28:39.615327Z",
      "_etag": "\"0300d1a5-0000-2400-0000-68e094c00000\"",
      "_rid": "HdMlANfvmTgZAAAAAAAAAA==",
      "_self": "dbs/HdMlAA==/colls/HdMlANfvmTg=/docs/HdMlANfvmTgZAAAAAAAAAA==/",
      "_attachments": "attachments/",
      "_ts": 1759548608
    },
    {
      "id": "24dab47e-475f-4a1f-8249-2efd53a8aa2c",
      "name": "Cavite",
      "provinceCode": "CAV",
      "regionCode": "IV-A",
      "createdAt": "2025-10-04T03:28:39.615327Z",
      "updatedAt": "2025-10-04T03:28:39.615327Z",
      "_etag": "\"030035a6-0000-2400-0000-68e094c40000\"",
      "_rid": "HdMlANfvmTgaAAAAAAAAAA==",
      "_self": "dbs/HdMlAA==/colls/HdMlANfvmTg=/docs/HdMlANfvmTgaAAAAAAAAAA==/",
      "_attachments": "attachments/",
      "_ts": 1759548612
    },
    {
      "id": "674a4437-c041-4182-b824-f997e6fdcc88",
      "name": "Laguna",
      "provinceCode": "LAG",
      "regionCode": "IV-A",
      "createdAt": "2025-10-04T03:28:39.615327Z",
      "updatedAt": "2025-10-04T03:28:39.615327Z",
      "_etag": "\"0300bba6-0000-2400-0000-68e094c80000\"",
      "_rid": "HdMlANfvmTgbAAAAAAAAAA==",
      "_self": "dbs/HdMlAA==/colls/HdMlANfvmTg=/docs/HdMlANfvmTgbAAAAAAAAAA==/",
      "_attachments": "attachments/",
      "_ts": 1759548616
    },
    {
      "id": "f8dbb150-8b8f-40aa-a465-2b1127000447",
      "name": "Quezon",
      "provinceCode": "QUE",
      "regionCode": "IV-A",
      "createdAt": "2025-10-04T03:28:39.615328Z",
      "updatedAt": "2025-10-04T03:28:39.615328Z",
      "_etag": "\"0300fda6-0000-2400-0000-68e094cc0000\"",
      "_rid": "HdMlANfvmTgcAAAAAAAAAA==",
      "_self": "dbs/HdMlAA==/colls/HdMlANfvmTg=/docs/HdMlANfvmTgcAAAAAAAAAA==/",
      "_attachments": "attachments/",
      "_ts": 1759548620
    },
    {
      "id": "92e8de46-df8a-4ff6-8363-3e6eb8b53af2",
      "name": "Rizal",
      "provinceCode": "RIZ",
      "regionCode": "IV-A",
      "createdAt": "2025-10-04T03:28:39.615328Z",
      "updatedAt": "2025-10-04T03:28:39.615328Z",
      "_etag": "\"030074a7-0000-2400-0000-68e094d00000\"",
      "_rid": "HdMlANfvmTgdAAAAAAAAAA==",
      "_self": "dbs/HdMlAA==/colls/HdMlANfvmTg=/docs/HdMlANfvmTgdAAAAAAAAAA==/",
      "_attachments": "attachments/",
      "_ts": 1759548624
    },
    {
      "id": "66fc28ee-bfb1-40e3-897b-c1db4eb20473",
      "name": "Occidental Mindoro",
      "provinceCode": "MNC",
      "regionCode": "IV-B",
      "createdAt": "2025-10-04T03:43:46.469542Z",
      "updatedAt": "2025-10-04T03:43:46.469542Z",
      "_etag": "\"03007dfd-0000-2400-0000-68e098280000\"",
      "_rid": "HdMlANfvmTgeAAAAAAAAAA==",
      "_self": "dbs/HdMlAA==/colls/HdMlANfvmTg=/docs/HdMlANfvmTgeAAAAAAAAAA==/",
      "_attachments": "attachments/",
      "_ts": 1759549480
    },
    {
      "id": "f71bf65e-1d25-4a84-9594-fe6c5a3a137e",
      "name": "Palawan",
      "provinceCode": "PAL",
      "regionCode": "IV-B",
      "createdAt": "2025-10-04T03:43:46.469542Z",
      "updatedAt": "2025-10-04T03:43:46.469542Z",
      "_etag": "\"0300c5fd-0000-2400-0000-68e0982a0000\"",
      "_rid": "HdMlANfvmTgfAAAAAAAAAA==",
      "_self": "dbs/HdMlAA==/colls/HdMlANfvmTg=/docs/HdMlANfvmTgfAAAAAAAAAA==/",
      "_attachments": "attachments/",
      "_ts": 1759549482
    },
    {
      "id": "07733d55-d623-49ee-8166-74a5b34104af",
      "name": "Marinduque",
      "provinceCode": "MAD",
      "regionCode": "IV-B",
      "createdAt": "2025-10-04T03:43:46.469542Z",
      "updatedAt": "2025-10-04T03:43:46.469542Z",
      "_etag": "\"030022fe-0000-2400-0000-68e0982e0000\"",
      "_rid": "HdMlANfvmTggAAAAAAAAAA==",
      "_self": "dbs/HdMlAA==/colls/HdMlANfvmTg=/docs/HdMlANfvmTggAAAAAAAAAA==/",
      "_attachments": "attachments/",
      "_ts": 1759549486
    },
    {
      "id": "5cf0aff7-d1e1-4da8-886f-b1a1698ef4df",
      "name": "Oriental Mindoro",
      "provinceCode": "MNR",
      "regionCode": "IV-B",
      "createdAt": "2025-10-04T03:43:46.469542Z",
      "updatedAt": "2025-10-04T03:43:46.469542Z",
      "_etag": "\"03007dfe-0000-2400-0000-68e098320000\"",
      "_rid": "HdMlANfvmTghAAAAAAAAAA==",
      "_self": "dbs/HdMlAA==/colls/HdMlANfvmTg=/docs/HdMlANfvmTghAAAAAAAAAA==/",
      "_attachments": "attachments/",
      "_ts": 1759549490
    },
    {
      "id": "772a5dcf-b8e7-4eb5-8d29-1624c5b623ac",
      "name": "Romblon",
      "provinceCode": "ROM",
      "regionCode": "IV-B",
      "createdAt": "2025-10-04T03:43:46.469542Z",
      "updatedAt": "2025-10-04T03:43:46.469543Z",
      "_etag": "\"0300affe-0000-2400-0000-68e098340000\"",
      "_rid": "HdMlANfvmTgiAAAAAAAAAA==",
      "_self": "dbs/HdMlAA==/colls/HdMlANfvmTg=/docs/HdMlANfvmTgiAAAAAAAAAA==/",
      "_attachments": "attachments/",
      "_ts": 1759549492
    },
    {
      "id": "0847b896-b5dd-4a89-81fd-c044eee80d3e",
      "name": "City Of Isabela",
      "provinceCode": "ISB",
      "regionCode": "IX",
      "createdAt": "2025-10-04T03:43:46.469543Z",
      "updatedAt": "2025-10-04T03:43:46.469543Z",
      "_etag": "\"030006ff-0000-2400-0000-68e098370000\"",
      "_rid": "HdMlANfvmTgjAAAAAAAAAA==",
      "_self": "dbs/HdMlAA==/colls/HdMlANfvmTg=/docs/HdMlANfvmTgjAAAAAAAAAA==/",
      "_attachments": "attachments/",
      "_ts": 1759549495
    },
    {
      "id": "9b1c5bc9-3737-4246-8499-92edaf1684bb",
      "name": "Zamboanga Del Sur",
      "provinceCode": "ZAS",
      "regionCode": "IX",
      "createdAt": "2025-10-04T03:43:46.469543Z",
      "updatedAt": "2025-10-04T03:43:46.469543Z",
      "_etag": "\"030053ff-0000-2400-0000-68e0983a0000\"",
      "_rid": "HdMlANfvmTgkAAAAAAAAAA==",
      "_self": "dbs/HdMlAA==/colls/HdMlANfvmTg=/docs/HdMlANfvmTgkAAAAAAAAAA==/",
      "_attachments": "attachments/",
      "_ts": 1759549498
    },
    {
      "id": "b2d2a360-1549-4dd6-8857-1ee11a39cefa",
      "name": "Zamboanga Del Norte",
      "provinceCode": "ZAN",
      "regionCode": "IX",
      "createdAt": "2025-10-04T03:43:46.469543Z",
      "updatedAt": "2025-10-04T03:43:46.469543Z",
      "_etag": "\"030088ff-0000-2400-0000-68e0983c0000\"",
      "_rid": "HdMlANfvmTglAAAAAAAAAA==",
      "_self": "dbs/HdMlAA==/colls/HdMlANfvmTg=/docs/HdMlANfvmTglAAAAAAAAAA==/",
      "_attachments": "attachments/",
      "_ts": 1759549500
    },
    {
      "id": "59c59691-d351-49b5-979b-c6009c0c3620",
      "name": "Zamboanga Sibugay",
      "provinceCode": "ZSI",
      "regionCode": "IX",
      "createdAt": "2025-10-04T03:43:46.469543Z",
      "updatedAt": "2025-10-04T03:43:46.469543Z",
      "_etag": "\"0300c2ff-0000-2400-0000-68e0983e0000\"",
      "_rid": "HdMlANfvmTgmAAAAAAAAAA==",
      "_self": "dbs/HdMlAA==/colls/HdMlANfvmTg=/docs/HdMlANfvmTgmAAAAAAAAAA==/",
      "_attachments": "attachments/",
      "_ts": 1759549502
    },
    {
      "id": "fb05c593-012b-4557-87da-a73fa0709a4e",
      "name": "NCR, Second District",
      "provinceCode": "NCR2",
      "regionCode": "NCR",
      "createdAt": "2025-10-04T03:43:46.469543Z",
      "updatedAt": "2025-10-04T03:43:46.469543Z",
      "_etag": "\"0300e3ff-0000-2400-0000-68e098400000\"",
      "_rid": "HdMlANfvmTgnAAAAAAAAAA==",
      "_self": "dbs/HdMlAA==/colls/HdMlANfvmTg=/docs/HdMlANfvmTgnAAAAAAAAAA==/",
      "_attachments": "attachments/",
      "_ts": 1759549504
    },
    {
      "id": "31c7e9ca-f031-4b1b-b4a3-d0fbc9560372",
      "name": "NCR, Fourth District",
      "provinceCode": "NCR4",
      "regionCode": "NCR",
      "createdAt": "2025-10-04T03:43:46.469543Z",
      "updatedAt": "2025-10-04T03:43:46.469543Z",
      "_etag": "\"04003600-0000-2400-0000-68e098430000\"",
      "_rid": "HdMlANfvmTgoAAAAAAAAAA==",
      "_self": "dbs/HdMlAA==/colls/HdMlANfvmTg=/docs/HdMlANfvmTgoAAAAAAAAAA==/",
      "_attachments": "attachments/",
      "_ts": 1759549507
    },
    {
      "id": "b22c7045-bf2d-4dad-8fcd-64669adef07b",
      "name": "Metro Manila",
      "provinceCode": "NCR2",
      "regionCode": "NCR",
      "createdAt": "2025-10-04T03:43:46.469544Z",
      "updatedAt": "2025-10-04T03:43:46.469544Z",
      "_etag": "\"04008800-0000-2400-0000-68e098460000\"",
      "_rid": "HdMlANfvmTgpAAAAAAAAAA==",
      "_self": "dbs/HdMlAA==/colls/HdMlANfvmTg=/docs/HdMlANfvmTgpAAAAAAAAAA==/",
      "_attachments": "attachments/",
      "_ts": 1759549510
    },
    {
      "id": "2a79dc98-9dd6-4f79-af67-b34c8c69a763",
      "name": "NCR, Third District",
      "provinceCode": "NCR3",
      "regionCode": "NCR",
      "createdAt": "2025-10-04T03:43:46.469544Z",
      "updatedAt": "2025-10-04T03:43:46.469544Z",
      "_etag": "\"0400e300-0000-2400-0000-68e0984a0000\"",
      "_rid": "HdMlANfvmTgqAAAAAAAAAA==",
      "_self": "dbs/HdMlAA==/colls/HdMlANfvmTg=/docs/HdMlANfvmTgqAAAAAAAAAA==/",
      "_attachments": "attachments/",
      "_ts": 1759549514
    },
    {
      "id": "8ff05f58-afca-4fb1-98e9-24a4823c8060",
      "name": "Albay",
      "provinceCode": "ALB",
      "regionCode": "V",
      "createdAt": "2025-10-04T03:43:46.469544Z",
      "updatedAt": "2025-10-04T03:43:46.469544Z",
      "_etag": "\"04004401-0000-2400-0000-68e0984e0000\"",
      "_rid": "HdMlANfvmTgrAAAAAAAAAA==",
      "_self": "dbs/HdMlAA==/colls/HdMlANfvmTg=/docs/HdMlANfvmTgrAAAAAAAAAA==/",
      "_attachments": "attachments/",
      "_ts": 1759549518
    },
    {
      "id": "030e511e-6164-44c4-b5a6-0904bc236695",
      "name": "Camarines Norte",
      "provinceCode": "CAN",
      "regionCode": "V",
      "createdAt": "2025-10-04T03:43:46.469544Z",
      "updatedAt": "2025-10-04T03:43:46.469544Z",
      "_etag": "\"04008101-0000-2400-0000-68e098520000\"",
      "_rid": "HdMlANfvmTgsAAAAAAAAAA==",
      "_self": "dbs/HdMlAA==/colls/HdMlANfvmTg=/docs/HdMlANfvmTgsAAAAAAAAAA==/",
      "_attachments": "attachments/",
      "_ts": 1759549522
    },
    {
      "id": "cde329f5-ed19-4fde-a5d2-a7394b55d051",
      "name": "Camarines Sur",
      "provinceCode": "CAS",
      "regionCode": "V",
      "createdAt": "2025-10-04T03:43:46.469544Z",
      "updatedAt": "2025-10-04T03:43:46.469544Z",
      "_etag": "\"0400a701-0000-2400-0000-68e098540000\"",
      "_rid": "HdMlANfvmTgtAAAAAAAAAA==",
      "_self": "dbs/HdMlAA==/colls/HdMlANfvmTg=/docs/HdMlANfvmTgtAAAAAAAAAA==/",
      "_attachments": "attachments/",
      "_ts": 1759549524
    },
    {
      "id": "abccd953-f52b-4fc4-97f9-11542a511f4c",
      "name": "Catanduanes",
      "provinceCode": "CAT",
      "regionCode": "V",
      "createdAt": "2025-10-04T03:43:46.469544Z",
      "updatedAt": "2025-10-04T03:43:46.469544Z",
      "_etag": "\"0400ff01-0000-2400-0000-68e098580000\"",
      "_rid": "HdMlANfvmTguAAAAAAAAAA==",
      "_self": "dbs/HdMlAA==/colls/HdMlANfvmTg=/docs/HdMlANfvmTguAAAAAAAAAA==/",
      "_attachments": "attachments/",
      "_ts": 1759549528
    },
    {
      "id": "a660086b-a591-496e-8af5-1749aa94e47a",
      "name": "Masbate",
      "provinceCode": "MAS",
      "regionCode": "V",
      "createdAt": "2025-10-04T03:43:46.469544Z",
      "updatedAt": "2025-10-04T03:43:46.469544Z",
      "_etag": "\"04003b02-0000-2400-0000-68e0985a0000\"",
      "_rid": "HdMlANfvmTgvAAAAAAAAAA==",
      "_self": "dbs/HdMlAA==/colls/HdMlANfvmTg=/docs/HdMlANfvmTgvAAAAAAAAAA==/",
      "_attachments": "attachments/",
      "_ts": 1759549530
    },
    {
      "id": "e32d4f76-e7d9-40e2-9a4c-dd66f3256493",
      "name": "Sorsogon",
      "provinceCode": "SOR",
      "regionCode": "V",
      "createdAt": "2025-10-04T03:43:46.469545Z",
      "updatedAt": "2025-10-04T03:43:46.469545Z",
      "_etag": "\"04009302-0000-2400-0000-68e0985d0000\"",
      "_rid": "HdMlANfvmTgwAAAAAAAAAA==",
      "_self": "dbs/HdMlAA==/colls/HdMlANfvmTg=/docs/HdMlANfvmTgwAAAAAAAAAA==/",
      "_attachments": "attachments/",
      "_ts": 1759549533
    },
    {
      "id": "369b6fc0-17e5-412b-a3ac-8dd7a151edfc",
      "name": "Aklan",
      "provinceCode": "AKL",
      "regionCode": "VI",
      "createdAt": "2025-10-04T03:43:46.469545Z",
      "updatedAt": "2025-10-04T03:43:46.469545Z",
      "_etag": "\"0400ef02-0000-2400-0000-68e098600000\"",
      "_rid": "HdMlANfvmTgxAAAAAAAAAA==",
      "_self": "dbs/HdMlAA==/colls/HdMlANfvmTg=/docs/HdMlANfvmTgxAAAAAAAAAA==/",
      "_attachments": "attachments/",
      "_ts": 1759549536
    },
    {
      "id": "a18acf20-f144-48a1-9cd0-5dd0c2d842ed",
      "name": "Antique",
      "provinceCode": "ANT",
      "regionCode": "VI",
      "createdAt": "2025-10-04T03:43:46.469545Z",
      "updatedAt": "2025-10-04T03:43:46.469545Z",
      "_etag": "\"04004a03-0000-2400-0000-68e098640000\"",
      "_rid": "HdMlANfvmTgyAAAAAAAAAA==",
      "_self": "dbs/HdMlAA==/colls/HdMlANfvmTg=/docs/HdMlANfvmTgyAAAAAAAAAA==/",
      "_attachments": "attachments/",
      "_ts": 1759549540
    },
    {
      "id": "cecc42dd-91d0-42ac-8807-fcd36143bbf7",
      "name": "Capiz",
      "provinceCode": "CAP",
      "regionCode": "VI",
      "createdAt": "2025-10-04T03:43:46.469545Z",
      "updatedAt": "2025-10-04T03:43:46.469545Z",
      "_etag": "\"0400b903-0000-2400-0000-68e098680000\"",
      "_rid": "HdMlANfvmTgzAAAAAAAAAA==",
      "_self": "dbs/HdMlAA==/colls/HdMlANfvmTg=/docs/HdMlANfvmTgzAAAAAAAAAA==/",
      "_attachments": "attachments/",
      "_ts": 1759549544
    },
    {
      "id": "0ed287cb-c6af-487e-bd2f-46a327a69f5f",
      "name": "Guimaras",
      "provinceCode": "GUI",
      "regionCode": "VI",
      "createdAt": "2025-10-04T03:43:46.469545Z",
      "updatedAt": "2025-10-04T03:43:46.469545Z",
      "_etag": "\"04001f04-0000-2400-0000-68e0986c0000\"",
      "_rid": "HdMlANfvmTg0AAAAAAAAAA==",
      "_self": "dbs/HdMlAA==/colls/HdMlANfvmTg=/docs/HdMlANfvmTg0AAAAAAAAAA==/",
      "_attachments": "attachments/",
      "_ts": 1759549548
    },
    {
      "id": "b1f9ff39-906b-4138-a3d0-71a5ec2255ce",
      "name": "Iloilo",
      "provinceCode": "ILO",
      "regionCode": "VI",
      "createdAt": "2025-10-04T03:43:46.469545Z",
      "updatedAt": "2025-10-04T03:43:46.469545Z",
      "_etag": "\"04005a04-0000-2400-0000-68e0986f0000\"",
      "_rid": "HdMlANfvmTg1AAAAAAAAAA==",
      "_self": "dbs/HdMlAA==/colls/HdMlANfvmTg=/docs/HdMlANfvmTg1AAAAAAAAAA==/",
      "_attachments": "attachments/",
      "_ts": 1759549551
    },
    {
      "id": "848f5a85-5d80-4f47-b368-a502418b315f",
      "name": "Negros Occidental",
      "provinceCode": "NEC",
      "regionCode": "VI",
      "createdAt": "2025-10-04T03:43:46.469546Z",
      "updatedAt": "2025-10-04T03:43:46.469546Z",
      "_etag": "\"0400ad04-0000-2400-0000-68e098720000\"",
      "_rid": "HdMlANfvmTg2AAAAAAAAAA==",
      "_self": "dbs/HdMlAA==/colls/HdMlANfvmTg=/docs/HdMlANfvmTg2AAAAAAAAAA==/",
      "_attachments": "attachments/",
      "_ts": 1759549554
    },
    {
      "id": "b0ca7103-abff-4d87-bbe6-3e3f2b4b1a31",
      "name": "Bohol",
      "provinceCode": "BOH",
      "regionCode": "VII",
      "createdAt": "2025-10-04T03:43:46.469546Z",
      "updatedAt": "2025-10-04T03:43:46.469546Z",
      "_etag": "\"0400e604-0000-2400-0000-68e098750000\"",
      "_rid": "HdMlANfvmTg3AAAAAAAAAA==",
      "_self": "dbs/HdMlAA==/colls/HdMlANfvmTg=/docs/HdMlANfvmTg3AAAAAAAAAA==/",
      "_attachments": "attachments/",
      "_ts": 1759549557
    },
    {
      "id": "95d5f31c-cb95-4002-90b0-aa103eb920bc",
      "name": "Cebu",
      "provinceCode": "CEB",
      "regionCode": "VII",
      "createdAt": "2025-10-04T03:43:46.469546Z",
      "updatedAt": "2025-10-04T03:43:46.469546Z",
      "_etag": "\"04003405-0000-2400-0000-68e098790000\"",
      "_rid": "HdMlANfvmTg4AAAAAAAAAA==",
      "_self": "dbs/HdMlAA==/colls/HdMlANfvmTg=/docs/HdMlANfvmTg4AAAAAAAAAA==/",
      "_attachments": "attachments/",
      "_ts": 1759549561
    },
    {
      "id": "858bfeb6-f182-4938-a472-b89ff3be91b9",
      "name": "Negros Oriental",
      "provinceCode": "NER",
      "regionCode": "VII",
      "createdAt": "2025-10-04T03:43:46.469546Z",
      "updatedAt": "2025-10-04T03:43:46.469546Z",
      "_etag": "\"04009805-0000-2400-0000-68e0987d0000\"",
      "_rid": "HdMlANfvmTg5AAAAAAAAAA==",
      "_self": "dbs/HdMlAA==/colls/HdMlANfvmTg=/docs/HdMlANfvmTg5AAAAAAAAAA==/",
      "_attachments": "attachments/",
      "_ts": 1759549565
    },
    {
      "id": "af92cf99-ba6b-45f4-8662-ca5db801d0af",
      "name": "Siquijor",
      "provinceCode": "SIQ",
      "regionCode": "VII",
      "createdAt": "2025-10-04T03:43:46.469546Z",
      "updatedAt": "2025-10-04T03:43:46.469546Z",
      "_etag": "\"0400fe05-0000-2400-0000-68e098810000\"",
      "_rid": "HdMlANfvmTg6AAAAAAAAAA==",
      "_self": "dbs/HdMlAA==/colls/HdMlANfvmTg=/docs/HdMlANfvmTg6AAAAAAAAAA==/",
      "_attachments": "attachments/",
      "_ts": 1759549569
    },
    {
      "id": "4d0f381a-d284-4dff-b2f4-80cf63062381",
      "name": "Biliran",
      "provinceCode": "BIL",
      "regionCode": "VIII",
      "createdAt": "2025-10-04T03:43:46.469546Z",
      "updatedAt": "2025-10-04T03:43:46.469546Z",
      "_etag": "\"04004906-0000-2400-0000-68e098840000\"",
      "_rid": "HdMlANfvmTg7AAAAAAAAAA==",
      "_self": "dbs/HdMlAA==/colls/HdMlANfvmTg=/docs/HdMlANfvmTg7AAAAAAAAAA==/",
      "_attachments": "attachments/",
      "_ts": 1759549572
    },
    {
      "id": "196787f7-6915-4272-9d0a-8c72c1534272",
      "name": "Eastern Samar",
      "provinceCode": "EAS",
      "regionCode": "VIII",
      "createdAt": "2025-10-04T03:43:46.469547Z",
      "updatedAt": "2025-10-04T03:43:46.469547Z",
      "_etag": "\"04009006-0000-2400-0000-68e098870000\"",
      "_rid": "HdMlANfvmTg8AAAAAAAAAA==",
      "_self": "dbs/HdMlAA==/colls/HdMlANfvmTg=/docs/HdMlANfvmTg8AAAAAAAAAA==/",
      "_attachments": "attachments/",
      "_ts": 1759549575
    },
    {
      "id": "00a065a8-1ae4-43fa-9fdf-3cbd568f9c79",
      "name": "Leyte",
      "provinceCode": "LEY",
      "regionCode": "VIII",
      "createdAt": "2025-10-04T03:43:46.469547Z",
      "updatedAt": "2025-10-04T03:43:46.469547Z",
      "_etag": "\"0400f006-0000-2400-0000-68e0988a0000\"",
      "_rid": "HdMlANfvmTg9AAAAAAAAAA==",
      "_self": "dbs/HdMlAA==/colls/HdMlANfvmTg=/docs/HdMlANfvmTg9AAAAAAAAAA==/",
      "_attachments": "attachments/",
      "_ts": 1759549578
    },
    {
      "id": "f445c872-2ae8-4cf6-86c7-5da139300a59",
      "name": "Northern Samar",
      "provinceCode": "NSA",
      "regionCode": "VIII",
      "createdAt": "2025-10-04T03:43:46.469547Z",
      "updatedAt": "2025-10-04T03:43:46.469547Z",
      "_etag": "\"04005407-0000-2400-0000-68e0988d0000\"",
      "_rid": "HdMlANfvmTg+AAAAAAAAAA==",
      "_self": "dbs/HdMlAA==/colls/HdMlANfvmTg=/docs/HdMlANfvmTg+AAAAAAAAAA==/",
      "_attachments": "attachments/",
      "_ts": 1759549581
    },
    {
      "id": "2777f4c4-a0b5-4b78-a9ff-7dcb292783c9",
      "name": "Southern Leyte",
      "provinceCode": "SLE",
      "regionCode": "VIII",
      "createdAt": "2025-10-04T03:43:46.469547Z",
      "updatedAt": "2025-10-04T03:43:46.469547Z",
      "_etag": "\"0400d107-0000-2400-0000-68e098920000\"",
      "_rid": "HdMlANfvmTg-AAAAAAAAAA==",
      "_self": "dbs/HdMlAA==/colls/HdMlANfvmTg=/docs/HdMlANfvmTg-AAAAAAAAAA==/",
      "_attachments": "attachments/",
      "_ts": 1759549586
    },
    {
      "id": "48cc48ba-d3dc-455b-aada-f4c5533c0745",
      "name": "Western Samar",
      "provinceCode": "WSA",
      "regionCode": "VIII",
      "createdAt": "2025-10-04T03:43:46.469547Z",
      "updatedAt": "2025-10-04T03:43:46.469547Z",
      "_etag": "\"04002708-0000-2400-0000-68e098950000\"",
      "_rid": "HdMlANfvmThAAAAAAAAAAA==",
      "_self": "dbs/HdMlAA==/colls/HdMlANfvmTg=/docs/HdMlANfvmThAAAAAAAAAAA==/",
      "_attachments": "attachments/",
      "_ts": 1759549589
    },
    {
      "id": "a17f3c05-b267-414b-9dcf-9b535e5c48a7",
      "name": "Bukidnon",
      "provinceCode": "BUK",
      "regionCode": "X",
      "createdAt": "2025-10-04T03:43:46.469547Z",
      "updatedAt": "2025-10-04T03:43:46.469547Z",
      "_etag": "\"04009e08-0000-2400-0000-68e0989a0000\"",
      "_rid": "HdMlANfvmThBAAAAAAAAAA==",
      "_self": "dbs/HdMlAA==/colls/HdMlANfvmTg=/docs/HdMlANfvmThBAAAAAAAAAA==/",
      "_attachments": "attachments/",
      "_ts": 1759549594
    },
    {
      "id": "8e8117c0-996f-4833-a130-f9d88ffed150",
      "name": "Camiguin",
      "provinceCode": "CAM",
      "regionCode": "X",
      "createdAt": "2025-10-04T03:43:46.469548Z",
      "updatedAt": "2025-10-04T03:43:46.469548Z",
      "_etag": "\"04000b09-0000-2400-0000-68e0989d0000\"",
      "_rid": "HdMlANfvmThCAAAAAAAAAA==",
      "_self": "dbs/HdMlAA==/colls/HdMlANfvmTg=/docs/HdMlANfvmThCAAAAAAAAAA==/",
      "_attachments": "attachments/",
      "_ts": 1759549597
    },
    {
      "id": "12108ebc-dee3-4b9c-a591-056bfd2395cf",
      "name": "Misamis Occidental",
      "provinceCode": "MSC",
      "regionCode": "X",
      "createdAt": "2025-10-04T03:43:46.469548Z",
      "updatedAt": "2025-10-04T03:43:46.469548Z",
      "_etag": "\"04005a09-0000-2400-0000-68e098a10000\"",
      "_rid": "HdMlANfvmThDAAAAAAAAAA==",
      "_self": "dbs/HdMlAA==/colls/HdMlANfvmTg=/docs/HdMlANfvmThDAAAAAAAAAA==/",
      "_attachments": "attachments/",
      "_ts": 1759549601
    },
    {
      "id": "d93db65b-a3a3-4018-adf1-d78a4e0ec870",
      "name": "Lanao Del Norte",
      "provinceCode": "LAN",
      "regionCode": "X",
      "createdAt": "2025-10-04T03:43:46.469548Z",
      "updatedAt": "2025-10-04T03:43:46.469548Z",
      "_etag": "\"0400b709-0000-2400-0000-68e098a40000\"",
      "_rid": "HdMlANfvmThEAAAAAAAAAA==",
      "_self": "dbs/HdMlAA==/colls/HdMlANfvmTg=/docs/HdMlANfvmThEAAAAAAAAAA==/",
      "_attachments": "attachments/",
      "_ts": 1759549604
    },
    {
      "id": "eb4713f5-022d-46de-a2b2-9848418260d6",
      "name": "Misamis Oriental",
      "provinceCode": "MSR",
      "regionCode": "X",
      "createdAt": "2025-10-04T03:43:46.469548Z",
      "updatedAt": "2025-10-04T03:43:46.469548Z",
      "_etag": "\"0400330a-0000-2400-0000-68e098a70000\"",
      "_rid": "HdMlANfvmThFAAAAAAAAAA==",
      "_self": "dbs/HdMlAA==/colls/HdMlANfvmTg=/docs/HdMlANfvmThFAAAAAAAAAA==/",
      "_attachments": "attachments/",
      "_ts": 1759549607
    },
    {
      "id": "35b72e0e-5ad7-4975-997c-dfdeda918aeb",
      "name": "Compostela Valley",
      "provinceCode": "COM",
      "regionCode": "XI",
      "createdAt": "2025-10-04T03:43:46.469548Z",
      "updatedAt": "2025-10-04T03:43:46.469548Z",
      "_etag": "\"04009f0a-0000-2400-0000-68e098ac0000\"",
      "_rid": "HdMlANfvmThGAAAAAAAAAA==",
      "_self": "dbs/HdMlAA==/colls/HdMlANfvmTg=/docs/HdMlANfvmThGAAAAAAAAAA==/",
      "_attachments": "attachments/",
      "_ts": 1759549612
    },
    {
      "id": "2fa3921f-7777-42e9-923c-6f99e4e6f55f",
      "name": "Davao Del Norte",
      "provinceCode": "DAN",
      "regionCode": "XI",
      "createdAt": "2025-10-04T03:43:46.469549Z",
      "updatedAt": "2025-10-04T03:43:46.469549Z",
      "_etag": "\"0400f00a-0000-2400-0000-68e098b00000\"",
      "_rid": "HdMlANfvmThHAAAAAAAAAA==",
      "_self": "dbs/HdMlAA==/colls/HdMlANfvmTg=/docs/HdMlANfvmThHAAAAAAAAAA==/",
      "_attachments": "attachments/",
      "_ts": 1759549616
    },
    {
      "id": "9637466c-f432-49ca-9cf6-c56e383020ae",
      "name": "Davao Del Sur",
      "provinceCode": "DAS",
      "regionCode": "XI",
      "createdAt": "2025-10-04T03:43:46.469549Z",
      "updatedAt": "2025-10-04T03:43:46.469549Z",
      "_etag": "\"0400480b-0000-2400-0000-68e098b20000\"",
      "_rid": "HdMlANfvmThIAAAAAAAAAA==",
      "_self": "dbs/HdMlAA==/colls/HdMlANfvmTg=/docs/HdMlANfvmThIAAAAAAAAAA==/",
      "_attachments": "attachments/",
      "_ts": 1759549618
    },
    {
      "id": "8ebdd1a0-a1fb-48fa-a0de-0cb4dd030709",
      "name": "Davao Occidental",
      "provinceCode": "DAC",
      "regionCode": "XI",
      "createdAt": "2025-10-04T03:43:46.469549Z",
      "updatedAt": "2025-10-04T03:43:46.469549Z",
      "_etag": "\"04008c0b-0000-2400-0000-68e098b50000\"",
      "_rid": "HdMlANfvmThJAAAAAAAAAA==",
      "_self": "dbs/HdMlAA==/colls/HdMlANfvmTg=/docs/HdMlANfvmThJAAAAAAAAAA==/",
      "_attachments": "attachments/",
      "_ts": 1759549621
    },
    {
      "id": "50c8803a-cf3c-4cd5-8699-733b2940ddeb",
      "name": "Davao Oriental",
      "provinceCode": "DAR",
      "regionCode": "XI",
      "createdAt": "2025-10-04T03:43:46.469549Z",
      "updatedAt": "2025-10-04T03:43:46.469549Z",
      "_etag": "\"0400ff0b-0000-2400-0000-68e098b90000\"",
      "_rid": "HdMlANfvmThKAAAAAAAAAA==",
      "_self": "dbs/HdMlAA==/colls/HdMlANfvmTg=/docs/HdMlANfvmThKAAAAAAAAAA==/",
      "_attachments": "attachments/",
      "_ts": 1759549625
    },
    {
      "id": "7bfb3e78-0423-4c0b-874c-6b6cb4264332",
      "name": "Sultan Kudarat",
      "provinceCode": "SUK",
      "regionCode": "XII",
      "createdAt": "2025-10-04T03:43:46.469549Z",
      "updatedAt": "2025-10-04T03:43:46.469549Z",
      "_etag": "\"04006a0c-0000-2400-0000-68e098bd0000\"",
      "_rid": "HdMlANfvmThLAAAAAAAAAA==",
      "_self": "dbs/HdMlAA==/colls/HdMlANfvmTg=/docs/HdMlANfvmThLAAAAAAAAAA==/",
      "_attachments": "attachments/",
      "_ts": 1759549629
    },
    {
      "id": "7bfb3e78-0423-4c0b-874c-6b6cb4264331",
      "name": "Cotabato City",
      "provinceCode": "COT",
      "regionCode": "XII",
      "createdAt": "2025-10-04T03:43:46.469549Z",
      "updatedAt": "2025-10-04T03:43:46.469549Z",
      "_etag": "\"04006a0c-0000-2400-0000-68e098bd0000\"",
      "_rid": "HdMlANfvmThLAAAAAAAAAA==",
      "_self": "dbs/HdMlAA==/colls/HdMlANfvmTg=/docs/HdMlANfvmThLAAAAAAAAAA==/",
      "_attachments": "attachments/",
      "_ts": 1759549629
    },
    {
      "id": "dc1734f0-18c2-4a42-8209-326c932c1994",
      "name": "North Cotabato",
      "provinceCode": "NCO",
      "regionCode": "XII",
      "createdAt": "2025-10-04T03:43:46.46955Z",
      "updatedAt": "2025-10-04T03:43:46.46955Z",
      "_etag": "\"0400c70c-0000-2400-0000-68e098c10000\"",
      "_rid": "HdMlANfvmThMAAAAAAAAAA==",
      "_self": "dbs/HdMlAA==/colls/HdMlANfvmTg=/docs/HdMlANfvmThMAAAAAAAAAA==/",
      "_attachments": "attachments/",
      "_ts": 1759549633
    },
    {
      "id": "03eb8b17-e25b-443b-b4b6-595ebc0d11f4",
      "name": "Sarangani",
      "provinceCode": "SAR",
      "regionCode": "XII",
      "createdAt": "2025-10-04T03:43:46.46955Z",
      "updatedAt": "2025-10-04T03:43:46.46955Z",
      "_etag": "\"0400100d-0000-2400-0000-68e098c40000\"",
      "_rid": "HdMlANfvmThNAAAAAAAAAA==",
      "_self": "dbs/HdMlAA==/colls/HdMlANfvmTg=/docs/HdMlANfvmThNAAAAAAAAAA==/",
      "_attachments": "attachments/",
      "_ts": 1759549636
    },
    {
      "id": "bb85c475-e72f-4003-b960-9cb2a1a3b205",
      "name": "South Cotabato",
      "provinceCode": "SCO",
      "regionCode": "XII",
      "createdAt": "2025-10-04T03:43:46.46955Z",
      "updatedAt": "2025-10-04T03:43:46.46955Z",
      "_etag": "\"0400750d-0000-2400-0000-68e098c80000\"",
      "_rid": "HdMlANfvmThOAAAAAAAAAA==",
      "_self": "dbs/HdMlAA==/colls/HdMlANfvmTg=/docs/HdMlANfvmThOAAAAAAAAAA==/",
      "_attachments": "attachments/",
      "_ts": 1759549640
    },
    {
      "id": "082b599c-c089-4043-b5f6-fee6fc1d0823",
      "name": "Agusan Del Norte",
      "provinceCode": "AGN",
      "regionCode": "XIII",
      "createdAt": "2025-10-04T03:43:46.46955Z",
      "updatedAt": "2025-10-04T03:43:46.46955Z",
      "_etag": "\"0400410e-0000-2400-0000-68e098cf0000\"",
      "_rid": "HdMlANfvmThPAAAAAAAAAA==",
      "_self": "dbs/HdMlAA==/colls/HdMlANfvmTg=/docs/HdMlANfvmThPAAAAAAAAAA==/",
      "_attachments": "attachments/",
      "_ts": 1759549647
    },
    {
      "id": "c8764438-1451-40e1-a225-10a453c3e898",
      "name": "Agusan Del Sur",
      "provinceCode": "AGS",
      "regionCode": "XIII",
      "createdAt": "2025-10-04T03:43:46.469551Z",
      "updatedAt": "2025-10-04T03:43:46.469551Z",
      "_etag": "\"0400970e-0000-2400-0000-68e098d20000\"",
      "_rid": "HdMlANfvmThQAAAAAAAAAA==",
      "_self": "dbs/HdMlAA==/colls/HdMlANfvmTg=/docs/HdMlANfvmThQAAAAAAAAAA==/",
      "_attachments": "attachments/",
      "_ts": 1759549650
    },
    {
      "id": "76817133-6e94-487b-8d03-59d464cba6d9",
      "name": "Dinagat Islands",
      "provinceCode": "DIN",
      "regionCode": "XIII",
      "createdAt": "2025-10-04T03:43:46.469551Z",
      "updatedAt": "2025-10-04T03:43:46.469551Z",
      "_etag": "\"0400e50e-0000-2400-0000-68e098d50000\"",
      "_rid": "HdMlANfvmThRAAAAAAAAAA==",
      "_self": "dbs/HdMlAA==/colls/HdMlANfvmTg=/docs/HdMlANfvmThRAAAAAAAAAA==/",
      "_attachments": "attachments/",
      "_ts": 1759549653
    },
    {
      "id": "5e44a04b-fc1a-4b43-a7d6-0382d9a985d3",
      "name": "Surigao Del Sur",
      "provinceCode": "SUR",
      "regionCode": "XIII",
      "createdAt": "2025-10-04T04:02:20.756431Z",
      "updatedAt": "2025-10-04T04:02:20.756431Z",
      "_etag": "\"04003a75-0000-2400-0000-68e09ce40000\"",
      "_rid": "HdMlANfvmThSAAAAAAAAAA==",
      "_self": "dbs/HdMlAA==/colls/HdMlANfvmTg=/docs/HdMlANfvmThSAAAAAAAAAA==/",
      "_attachments": "attachments/",
      "_ts": 1759550692
    },
    {
      "id": "a9f61e7c-f7c5-4759-a8e3-2d4b4fa8bd33",
      "name": "Surigao Del Norte",
      "provinceCode": "SUN",
      "regionCode": "XIII",
      "createdAt": "2025-10-04T04:02:20.756431Z",
      "updatedAt": "2025-10-04T04:02:20.756431Z",
      "_etag": "\"0400a475-0000-2400-0000-68e09ce80000\"",
      "_rid": "HdMlANfvmThTAAAAAAAAAA==",
      "_self": "dbs/HdMlAA==/colls/HdMlANfvmTg=/docs/HdMlANfvmThTAAAAAAAAAA==/",
      "_attachments": "attachments/",
      "_ts": 1759550696
    }
  ];
}



function getOfficeType(label) {
  const match = label.match(/^(Branch Office|Main Office)/i);
  return match ? match[1] : "";
}
const transformToFeePayload = (application: any) => {

  let { service = {}, isModified } = application;
  let {
    applicationDetails,
    applicationType,
    stationEquipment,
    particulars,
    valueAddedServices,
    transmissionType,
    certificate,
    license,
    permit,
    details,
    natureOfService,
    business
  } = service;




  var typeOfBranch = "";

  if (business?.typeOfBranch) {
    typeOfBranch = getOfficeType(business.typeOfBranch);
  }


  let label = applicationType?.label?.toLowerCase();

  let typeFn = () => {
    let _label = applicationType?.type || '';
    let _isRenewal = label?.match('renewal');
    if (label?.match('new') && !_isRenewal) _label = 'new';
    else if (_isRenewal) _label = 'renew';
    else if (label?.match('modification') || label?.match('modify')) _label = 'modification';
    else if (label?.match('permit')) {
      if (label?.match('possess') && label?.match('purchase')) _label = 'purchase/possess';
      else if (label?.match('possess')) {
        _label = 'possess';
        if (label?.match('storage')) _label += 'forstorage';
      }
      else if (label?.match('purchase')) _label = 'purchase';
      else if (label?.match('sell') || label?.match('transfer')) _label = 'sell/transfer';
    }
    return _label;
  };
  let boundaryFn = () => {
    if (label?.match('domestic')) return 'domestic';
    else if (label?.match('international')) return 'international';
    else return '';
  };
  let installedEquipmentFn = () => {
    let _label = '';
    if (label?.match('installed equipment')) {
      if (label?.match('with')) _label = 'with';
      if (label?.match('without')) _label = 'without';
    }
    return _label;
  };
  let categoryFn = () => {
    let _category = '';
    if (applicationType?.serviceCode === 'ROC') _category = applicationType?.element || '';
    else _category = applicationType?.category || '';
    if (applicationDetails?.variation) _category += `${_category ? '-' : ''}${applicationDetails?.variation?.toLowerCase()}`;
    _category = _category?.replace(' ', '');
    return _category;
  };
  let frequencyFn = () => {
    /**
     * frequency that is a section
     * array
     * [{tx: 1, rx: 1}]
     *
     * frequency that is a section
     * [{frequency: 1}]
     *
     * frequency that is inside stationEquipment.stationKind specification
     * could be string (pre-filled) or number
     *
     * frequency that is inside stationEquipment
     * [{frequency: 1}]
     */
    let _frequencies = [];
    if (service?.frequency) _frequencies?.push(...(typeof service?.frequency === 'number' ? service.frequency : service?.frequency.map((c: any) => c.frequency)));
    if (service?.stationEquipment?.stationKind?.split(' • ')?.[1]) _frequencies?.push({ frequency: service?.stationEquipment?.stationKind?.split(' • ')?.[1] });
    if (service.proposedStationEquipment?.frequency) _frequencies?.push({ frequency: service.proposedStationEquipment?.frequency });
    if (service.stationEquipment?.frequency) _frequencies?.push({ frequency: service.stationEquipment?.frequency });

    return _frequencies;
  };
  let frequencyTXFn = () => {
    let f = Number(frequencyFn()?.[0]?.tx || frequencyFn()?.[0]?.frequency);
    return (isNaN(f)) ? 0 : f;
  };
  let tranmissionFn = () => {
    let _t = stationEquipment?.transmission?.split(' • ');
    return {
      transmission: _t?.[0]?.toLowerCase() || '',
      frequency: _t?.[1]?.toLowerCase()?.replace(' frequency', '')?.replace(' ', '') || '',
    };
  };
  let channelFn = () => {
    let frequencies = frequencyFn();
    let _frequencies = [];
    if (frequencies?.length > 0) {
      frequencies?.forEach((f: any) => {
        if (f?.tx > -1) _frequencies?.push(f?.tx);
        if (f?.rx > -1) _frequencies?.push(f?.rx);
        if (f?.frequency > -1) _frequencies?.push(f?.frequency);
      });
    }
    _frequencies = [...new Set(_frequencies)];
    return _frequencies;
  };
  let classOfStation = (forChannel = false) => {
    let _csObj = {};

    if (label?.match('public trunked') && forChannel) {
      _csObj = {
        publicTrunked: channelFn()?.length || 0,
      };
    }
    else if (particulars?.length > 0) {
      particulars?.forEach((c: any) => {
        let _split = c?.stationClass?.split?.(' • ');
        let _equipments = c?.equipments || c?.proposedEquipments;
        let _unit = Number(_split?.[1] || (_equipments?.length || 0));
        let _class = _split?.[0];
        _csObj = {
          ..._csObj,
          [_class]: forChannel ? (channelFn()?.length || 0) : _csObj.hasOwnProperty(_class) ? (_csObj[_class] + _unit) || 0 : _unit || 0,
        };
      });
    }

    return _csObj;
  };


  const RATES: Record<string, number> = {
    VHF: 120,
    HF: 240,
  };


  const POSSESSRATES: Record<string, number> = {
    VHF: 96,
    HF: 120,
  };


  const parseUnits = (stationClass: any): number => {
    if (typeof stationClass !== "string") return 0;

    // supports: "Others • 5", "Others • 12"
    const m = stationClass.match(/•\s*(\d+)/);
    return m ? Number(m[1]) : 0;
  };

  const getFrequencySummary = (particulars: any[] = []) => {
    const ranges = Array.from(
      new Set(
        particulars
          .map((p) => p?.frequencyRange)
          .filter((fr) => fr != null && String(fr).trim() !== "")
          .map((fr) => String(fr).trim().toUpperCase())
      )
    );

    const total = particulars.reduce((sum, p) => {
      const fr = String(p?.frequencyRange ?? "").trim().toUpperCase();
      const rate = RATES[fr] ?? 0;

      const units = parseUnits(p?.stationClass);

      return sum + units * rate;
    }, 0);


    const possesstotal = particulars.reduce((sum, p) => {
      const fr = String(p?.frequencyRange ?? "").trim().toUpperCase();
      const rate = POSSESSRATES[fr] ?? 0;

      const units = parseUnits(p?.stationClass);

      return sum + units * rate;
    }, 0);

    return { ranges, total, possesstotal };
  };
  const frequencyRangeValue = () => {
    if (!particulars?.length) return 0;
    return getFrequencySummary(particulars)?.total
  };


  const possessValue = () => {
    if (!particulars?.length) return 0;
    return getFrequencySummary(particulars)?.possesstotal
  };
  const frequencyRange = () => {
    if (!particulars?.length) return [];

    return [...new Set(
      particulars
        .map((c: any) => c?.frequencyRange)
        .filter((fr: any) => fr != null && String(fr).trim() !== "")
        .map((fr: any) => String(fr).trim())
    )];
  };


  let noOfYears = () => {
    let no = Number(applicationDetails?.noOfYears || 0);
    if (isNaN(no)) return 0;
    else return no;
  };
  let classFn = () => {
    let _e = applicationType?.element || '';
    let _split = _e?.split(' ');
    let _ndx = _split?.findIndex((s: string) => s === 'Class');
    if (_ndx > -1) return _split[_ndx + 1];
    else return '';
  };
  let expirationDateFn = () => {
    let { dateOfExpiry = {} } = certificate || (license || (permit || (details || {})));
    let { year, month, day } = dateOfExpiry;
    let expirationDate = year && month && day ? Moment(new Date()).set({ year, month, date: day }) : new Date()?.toISOString();
    return expirationDate;
  };
  let typeOfEquipmentDeviceFn = () => {
    let tedObj = {};
    if (particulars?.length > 0) {
      particulars?.forEach((c: any) => {
        let _equipments = c?.equipments || c?.proposedEquipments;
        let _unit = _equipments?.length || 0;

        let _t = c?.typeOfEquipmentDevice?.toLowerCase();
        let _class = _t?.match('wdn')
          ? 'wdn'
          : _t?.match('srd')
            ? 'srd'
            : _t?.match('rfid') && _t?.match('low')
              ? 'rfidlow'
              : _t?.match('rfid') && _t?.match('high')
                ? 'rfidhigh'
                : _t?.match('srrs')
                  ? 'srrs'
                  : _t?.match('public trunk')
                    ? 'publictrunk'
                    : 'others';
        tedObj = {
          ...tedObj,
          [_class]: tedObj.hasOwnProperty(_class) ? tedObj[_class] + _unit : _unit,
        };
      });
    }
    return tedObj;
  };
  let unitsFn = () => {
    let _no = 0;
    let _classOfStation = classOfStation();
    if (Object?.keys(_classOfStation)?.length > 0) Object?.keys(_classOfStation)?.map(c => _no += _classOfStation[c]);
    return _no;
  };

  type ParsedBandwidth = { bandwidth: number; unit: "kHz"; source: "itu" | "default" | "assumed" };

  const DEFAULT_BW_KHZ: Record<string, number> = {
    F3E: 16.0,
    G3E: 6.0,
    F1D: 3.0,
    F2D: 6.0,
    F7W: 25.0,
  };

  function parseITUFormattedBandwidth(raw: string): ParsedBandwidth | null {
    if (!raw) return null;
    const s = raw.trim().toUpperCase();

    // Case 1: ITU bandwidth designator at start (e.g., 12K5, 16K0F3E, 2M50, 500H0)
    const m = s.match(/^(\d{1,4})([HKMG])(\d{1,3})/);
    if (m) {
      const whole = parseInt(m[1], 10);
      const letter = m[2] as "H" | "K" | "M" | "G";
      const fracStr = m[3];
      const frac = parseInt(fracStr, 10) / Math.pow(10, fracStr.length);

      let value = whole + frac;
      switch (letter) {
        case "H": value = value / 1000; break;         // Hz -> kHz
        case "K": break;                               // kHz
        case "M": value = value * 1000; break;         // MHz -> kHz
        case "G": value = value * 1_000_000; break;    // GHz -> kHz
      }

      const bandwidth = Math.round(value * 1e6) / 1e6;
      return { bandwidth, unit: "kHz", source: "itu" };
    }

    // Case 1b: numeric-only input (assume kHz), e.g., "12" => 12 kHz
    if (/^\d+(\.\d+)?$/.test(s)) {
      return { bandwidth: parseFloat(s), unit: "kHz", source: "assumed" };
    }

    // Case 2: emission-only (default bandwidth table)
    // match any of the keys in the string (e.g., "xxx F3E xxx", "F3E")
    for (const [emission, bw] of Object.entries(DEFAULT_BW_KHZ)) {
      const re = new RegExp(`\\b${emission}\\b`);
      if (s === emission || re.test(s)) {
        return { bandwidth: bw, unit: "kHz", source: "default" };
      }
    }
    return null;
  }

  const bandwidthFn = () => {
    const raw = stationEquipment?.bandwidth?.bandwidth || 0;
    const unit = stationEquipment?.bandwidth?.unit || '';
    const emission = stationEquipment?.bandwidth?.emission || stationEquipment?.emission || '';





    if (typeof raw === 'string') {
      let parsed = parseITUFormattedBandwidth(raw);
      if (emission == "F3E") {
        if (parsed?.bandwidth) {
          parsed.bandwidth = parsed.bandwidth * 0.7
        }
      }

      if (parsed) return parsed;
      // fallback if parsing fails
      return { bandwidth: 0, unit: unit || '', emission: emission || '' };
    }

    // raw is already numeric
    return { bandwidth: raw, unit: unit || 'kHz', emission: emission || '' };
  };

  /*
  let stationDetailsFn = () => {
    let radioStationLicense = '';
    let spectrum = '';
    let _station = '';
    if (
      label?.match('bwa') ||
      label?.match('wdn') ||
      label?.match('microwave')
    ) {
      _station = 'fixed';
      radioStationLicense = 'FX';
    }
    else if (
      label?.match('wdn') ||
      label?.match('wll') ||
      label?.match('bts')
    ) {
      _station = 'landbase';
      radioStationLicense = 'FB';
    }
    else if (label?.match('public trunked')) {
      _station = 'publictrunked'
      radioStationLicense = 'Public Trunked';
    }
    else if (label?.match('vsat')) {
      _station = 'TC-VSAT';
      radioStationLicense = 'VSAT';
    }
    else radioStationLicense = '';

    if (radioStationLicense === 'FB') {
      if (bandwidth < 1) {}
      else if (bandwidth > 0 && bandwidth < 10) spectrum = '1-10';
      else if (bandwidth > 9 && bandwidth < 20) spectrum = '10-20';
      else if (bandwidth > 19) spectrum = '20above';
    }
    else if (radioStationLicense === 'VSAT') spectrum = 'satelliteservice';
    // publicradio
    else if (radioStationLicense === 'Public Trunked') spectrum = 'publictrunked';
    // wll
    // pointtomultipoint
    else if (radioStationLicense === 'FX') spectrum = 'pointtopoint';

    if (stationClass?.RT > 0) _station = 'repeater';
    else if (stationClass?.FX > 0) _station = 'fixed';
    else if (stationClass?.FB > 0) _station = 'landbase';
    else if (stationClass?.ML > 0) _station = 'landmobile';
    else if (stationClass?.P > 0) _station = 'portable';
    // BC
    // FC
    // FA
    // MA
    else if (stationClass?.TC > 0) _station = 'TC-VSAT';

    return {
      spectrum,
      station: _station,
    };
  };
  */
  let simplexCount = 0;
  let duplexCount = 0;
  let channelCount = 0;

  if (service?.frequency && Array.isArray(service.frequency)) {
    for (const pair of service.frequency) {
      if (pair.tx === pair.rx) {
        simplexCount++;
      } else {
        duplexCount++;
      }
    }

    channelCount = simplexCount + (duplexCount * 2);
  }





  let feePayload = {
    typeOfBranch: typeOfBranch ?? "",
    channels: applicationType?.serviceCode != "AT-CLUB-RSL" ? channelCount : 0,
    simplex: simplexCount,
    duplex: duplexCount,
    service: service?.serviceCode?.split('-')?.[1] || '', //
    subService: applicationType?.serviceCode || '', //
    types: typeFn(), //
    category: categoryFn(), //
    classes: classFn(), //
    noOfYears: noOfYears(), //
    units: unitsFn(), //
    nos: valueAddedServices?.service?.length || 0, //
    noOfCopies: Number(details?.noOfCopies || 0), //
    boundary: boundaryFn(), //
    location: 'HighlyUrbanizedAreas', //region, //
    installedEquipment: installedEquipmentFn(), //
    power: Number(stationEquipment?.powerOutput || 0), //
    transmission: tranmissionFn()?.transmission, //
    frequency: tranmissionFn()?.frequency, //
    frequencyTX: frequencyTXFn(), //
    bandwidth: bandwidthFn(), //
    mode: transmissionType?.transmissionType?.toLowerCase() || '', //
    frequencyRange: frequencyRange(),
    frequencyRangeTotal: frequencyRangeValue(),
    possessTotal: possessValue(),
    stationClassUnits: classOfStation(), //
    stationClassChannels: classOfStation(true), //
    dateOfExpiry: expirationDateFn(), //
    stationCount: particulars?.length || 0,
    updatedAt: new Date()?.toISOString(),
    typeOfEquipmentDevice: typeOfEquipmentDeviceFn(),
    natureOfService: natureOfService?.type || '',
    isModified,
  };

  return feePayload;
};

// Services 5, 6, and 7 are merged in Service 5
// Service 9, 10, 11, 12, and 13 are merged in Service 9
// Some permits of Service 15 are merged in Service 14
// Service 17 and 18 are merged in Service 17
// on application type -> requirements -> id: "document", this is where the output PDF will be pre-filled during renewal
const link = "https://raw.githubusercontent.com/edward1986/edge-document/refs/heads/main/Sworn%20Statement%20and%20Declaration%20Form.pdf";
const NTCServices = [
  {
    title: 'Accreditations',
    key: 'accreditations',
    logo: require('@assets/services/certificate.png'),
    data: [
      {
        "_id": "61c400e8ad8d7afe8ee5f627",
        "createdAt": "2021-12-09T08:41:51.626Z",
        "name": "Customer Premises Equipment Supplier Accreditation",
        "serviceCode": "service-15",
        "about": {
          "heading": "Customer Premises Equipment Supplier Accreditation",
          "description": "An Accreditation for Customer Premises Equipment Supplier is a written authority issued by the Commission to a person, firm, company, association or corporation authorizing the holder thereof to engage in the acquisition, servicing, maintenance, purchase or sale of equipment located in the premises of a customer which is not part of but connected to the system or network of a public telecommunications entity.",
          "whoMayAvail": [
            {
              "title": "Individuals and Private Entities"
            },
          ]
        },
        "applicationTypes": [
          {
            "label": "NEW",
            "elements": [
            ],
            "formCode": "ntc1-18",
            "requirements": [
              {
                "key": "registration-id",
                "title": "Copy of ANY of the following:",
                "description": "• SEC Registration\n• DTI Registration\n• Business/Mayor's Permit\n\nNote : The purpose of the company as indicated in its registration document must include information related to the accreditation applied for.",
                "required": true
              },
              {
                "key": "paid-up-capital",
                "title": "Proof of Paid-Up Capital",
                "description": "Minimum of PHP 250,000.00, duly certified by the Treasurer of the Corporation or by the partners in a partnership or by the owner in a sole proprietorship",
                "required": true
              },
              {
                "key": "distributorship-or-representation-agreement",
                "title": "Distributorship OR Representation Agreement on products to be sold",
                "required": true,
              },
              {
                "key": "type-approval-certificate-or-grant-of-equipment-conformity",
                "title": "Type Approval Certificate OR Copy of Grant of Equipment Conformity for CPE to be sold",
                "required": true,
              },
              {
                "key": "technician-documents",
                "title": "Copy of the following:",
                "description": "Certificate of Employment AND copy of valid ROC/license of two (2) qualified radio technicians (i.e. Radio Communications Technician OR Electronics Technician) employed on a full-time basis",
                "required": true,
              },
              {
                "key": "engineer-documents",
                "title": "Copy of the following:",
                "description": "Certificate of Employment and copy of valid license of supervising Electronics Engineer (ECE) OR Professional Electronics Engineer (PECE)",
                "required": true,
              }
            ],
            "serviceCode": "CPE",
            "sequenceCode": "CPE"
          },
          {
            "label": "RENEWAL",
            "elements": [
            ],
            "formCode": "ntc1-18",
            "requirements": [
              {
                "key": "CPE-supplier-accreditation",
                "title": "CPE Supplier Accreditation",
                "required": true
              },
              {
                "key": "business-or-mayors-permit",
                "title": "Business/Mayor's Permit",
                "required": true
              },
              {
                "key": "distributorship-or-representation-agreement",
                "title": "Distributorship OR Representation Agreement on products to be sold",
                "required": true,
              },
              {
                "key": "technician-documents",
                "title": "Copy of the following:",
                "description": "Certificate of Employment AND copy of valid ROC/license of two (2) qualified radio technicians (i.e. Radio Communications Technician OR Electronics Technician) employed on a full-time basis",
                "required": true,
              },
              {
                "key": "engineer-documents",
                "title": "Copy of the following:",
                "description": "Certificate of Employment and copy of valid license of supervising Electronics Engineer (ECE) OR Professional Electronics Engineer (PECE)",
                "required": true,
              }
            ],
            "serviceCode": "CPE",
            "sequenceCode": "CPE"
          },
          {
            "label": "MODIFICATION",
            "elements": [
            ],
            "formCode": "ntc1-18",
            "requirements": [
              {
                "key": "CPE-supplier-accreditation",
                "title": "CPE Supplier Accreditation",
                "required": true
              },
              {
                "key": "type-approval-certificate-or-grant-of-equipment",
                "title": "For equipment not previously indicated in the CPE Supplier Accreditation:",
                "description": "Copy of Type Approval Certificate OR Copy of Grant of Equipment Conformity for CPE to be sold",
              },
            ],
            "modificationDueTos": [
              {
                "label": "Change of name",
                "value": "Change of name",
                "requirements": [
                  {
                    "key": "CPE-supplier-accreditation",
                    "title": "CPE Supplier Accreditation",
                    "required": true
                  },
                  {
                    "key": "type-approval-certificate-or-grant-of-equipment",
                    "title": "For equipment not previously indicated in the CPE Supplier Accreditation:",
                    "description": "Copy of Type Approval Certificate OR Copy of Grant of Equipment Conformity for CPE to be sold",
                  },
                  {
                    "key": "registration-document",
                    "title": "Copy of ANY of the following:",
                    "description": "• SEC Registration\n• DTI Registration\n• Valid Business/Mayor's Permit",
                    "required": true
                  },
                ],
              },
              {
                "label": "Change of company address",
                "value": "Change of company address",
                "requirements": [
                  {
                    "key": "CPE-supplier-accreditation",
                    "title": "CPE Supplier Accreditation",
                    "required": true
                  },
                  {
                    "key": "type-approval-certificate-or-grant-of-equipment",
                    "title": "For equipment not previously indicated in the CPE Supplier Accreditation:",
                    "description": "Copy of Type Approval Certificate OR Copy of Grant of Equipment Conformity for CPE to be sold",
                  },
                  {
                    "key": "business-or-mayors-permit",
                    "title": "Business/Mayor's Permit",
                    "required": true
                  },
                ],
              },
            ],
            "serviceCode": "CPE",
            "sequenceCode": "CPE"
          },
        ]
      },
    ],
  },
  {
    title: 'Certificates',
    key: 'certificates',
    logo: require('@assets/services/certificate.png'),
    data: [
      {
        "_id": "61c400d8ad8d7afe9ee5f617",
        "createdAt": "2021-12-09T08:40:51.621Z",
        "name": "Radio Operator Certificates (ROC) excluding Amateur ROC",
        "serviceCode": "service-2",
        "about": {
          "heading": "Radio Operator Certificates (ROC) excluding Amateur ROC",
          "description": "A Radio Operator Certificate is a written authority issued by the Commission authorizing the holder thereof to operate a particular class of radio station under a specific radio service.\n\nThe RENEWAL of a Radio Operator Certificate is required for the continuous operation of a particular class of radio station under a specific radio service.\n\nThe MODIFICATION of a Radio Operator Certificate is required for changes in the particulars indicated in the Certificate.",
          "whoMayAvail": [
            {
              "title": "Individuals who have passed the Commercial Radio Operator's Examination conducted by NTC"
            },
            {
              "title": "Commercial pilots and student pilots"
            },
            {
              "title": "Government radio operators who have completed the Government Radio Operator's Seminar conducted by NTC"
            },
            {
              "title": "Individuals working in the maritime service who have completed the Special Radio Operator's Seminar conducted by NTC"
            },
            {
              "title": "Individuals who have completed the Restricted Land Mobile Radiotelephone Operator's Seminar conducted by NTC"
            },
            {
              "title": "Licensed pilots of foreign countries"
            }
          ]
        },
        "applicationTypes": [
          {
            "label": "Commercial Radio Operator Certificate (NEW)",
            "elements": [
              "1RTG",
              "2RTG",
              "3RTG",
              "1PHN",
              "2PHN",
              "3PHN"
            ],
            "formCode": "ntc1-02",
            "requirements": [
              {
                "key": "report-of-rating",
                "title": "Original valid Report of Rating",
                "description": "Note 1: Apply for Duplicate Copy if Original is lost/mutilated/destroyed or not available.",
                "required": true
              },
              {
                "key": "id-picture",
                "title": "Please provide a clear 1x1 ID picture taken within the last six (6) months.",
                "required": true
              },
              {
                "key": "roc",
                "title": "For upgrade to higher class, Radio Operator Certificate"
              }
            ],
            "serviceCode": "ROC",
            "sequenceCode": "ROC"
          },
          {
            "label": "Commercial Radio Operator Certificate (RENEWAL)",
            "elements": [
              "1RTG",
              "2RTG",
              "3RTG",
              "1PHN",
              "2PHN",
              "3PHN"
            ],
            "formCode": "ntc1-02",
            "requirements": [
              {
                "key": "document",
                "title": "Radio Operator Certificate",
                "required": true
              },
              {
                "key": "id-picture",
                "title": "Please provide a clear 1x1 ID picture taken within the last six (6) months.",
                "required": true
              }
            ],
            "serviceCode": "ROC",
            "sequenceCode": "ROC"
          },
          {
            "label": "Commercial Radio Operator Certificate (MODIFICATION)",
            "elements": [
              "1RTG",
              "2RTG",
              "3RTG",
              "1PHN",
              "2PHN",
              "3PHN"
            ],
            "formCode": "ntc1-02",
            "requirements": [
              {
                "key": "roc",
                "title": "Radio Operator Certificate",
                "required": true
              },
              {
                "key": "id-picture",
                "title": "Please provide a clear 1x1 ID picture taken within the last six (6) months.",
                "required": true
              },
              {
                "key": "id",
                "title": "For correction of name, ANY of the following:",
                "description": "• Valid government ID\n• Birth Certificate\n• Marriage Certificate"
              }
            ],
            "modificationDueTos": [
              {
                "label": "Others",
                "value": "Others",
                "hasSpecification": true,
              },
            ],
            "serviceCode": "ROC",
            "sequenceCode": "ROC"
          },
          {
            "label": "Restricted Radiotelephone Operator's Certificate - Aircraft (NEW)",
            "elements": [
            ],
            "formCode": "ntc1-02",
            "requirements": [
              {
                "key": "report-of-rating",
                "title": "Original valid Report of Rating",
                "description": "Note 1: Apply for Duplicate Copy if Original is lost/mutilated/destroyed or not available.",
                "required": true
              },
              {
                "key": "id-picture",
                "title": "Please provide a clear 1x1 ID picture taken within the last six (6) months.",
                "required": true
              },
            ],
            "serviceCode": "RROC-AIRCRAFT",
            "sequenceCode": "RMAP"
          },
          {
            "label": "Restricted Radiotelephone Operator's Certificate - Aircraft (RENEWAL)",
            "elements": [
            ],
            "formCode": "ntc1-02",
            "requirements": [
              {
                "key": "document",
                "title": "Radio Operator Certificate",
                "required": true
              },
              {
                "key": "id-picture",
                "title": "Please provide a clear 1x1 ID picture taken within the last six (6) months.",
                "required": true
              }
            ],
            "serviceCode": "RROC-AIRCRAFT",
            "sequenceCode": "RMAP"
          },
          {
            "label": "Restricted Radiotelephone Operator's Certificate - Aircraft (MODIFICATION)",
            "elements": [
            ],
            "formCode": "ntc1-02",
            "requirements": [
              {
                "key": "roc",
                "title": "Radio Operator Certificate",
                "required": true
              },
              {
                "key": "id-picture",
                "title": "Please provide a clear 1x1 ID picture taken within the last six (6) months.",
                "required": true
              },
              {
                "key": "id",
                "title": "For correction of name, ANY of the following:",
                "description": "• Valid government ID\n• Birth Certificate\n• Marriage Certificate"
              }
            ],
            "modificationDueTos": [
              {
                "label": "Others",
                "value": "Others",
                "hasSpecification": true,
              },
            ],
            "serviceCode": "RROC-AIRCRAFT",
            "sequenceCode": "RMAP"
          },
          {
            "label": "Temporary Radio Operator Certificate for Foreign Pilot (NEW)",
            "elements": [
            ],
            "formCode": "ntc1-02",
            "requirements": [
              {
                "key": "pilot-license",
                "title": "Pilot license issued from country of origin",
                "description": "Note 1: The applicant has to show the original.",
                "required": true
              },
              {
                "key": "id-picture",
                "title": "Please provide a clear 1x1 ID picture taken within the last six (6) months.",
                "required": true
              },
            ],
            "serviceCode": "ROC",
            "sequenceCode": "ROC"
          },
          {
            "label": "Temporary Radio Operator Certificate for Foreign Pilot (MODIFICATION)",
            "elements": [
            ],
            "formCode": "ntc1-02",
            "requirements": [
              {
                "key": "roc",
                "title": "Radio Operator Certificate",
                "required": true
              },
              {
                "key": "id-picture",
                "title": "Please provide a clear 1x1 ID picture taken within the last six (6) months.",
                "required": true
              },
              {
                "key": "id",
                "title": "For correction of name, ANY of the following:",
                "description": "• Valid government ID\n• Birth Certificate\n• Marriage Certificate"
              }
            ],
            "modificationDueTos": [
              {
                "label": "Others",
                "value": "Others",
                "hasSpecification": true,
              },
            ],
            "serviceCode": "ROC-TEMPORARY",
            "sequenceCode": "ROC-TEMPORARY"
          },
          {
            "label": "Government Radio Operator Certificate (NEW)",
            "elements": [
            ],
            "formCode": "ntc1-02",
            "requirements": [
              {
                "key": "service-record",
                "title": "Service Record",
                "required": true
              },
              {
                "key": "good-moral-certificate",
                "title": "Certificate of Good Moral Character",
                "required": true
              },
              {
                "key": "roc",
                "title": "Certification that the applicant is in the government service as a radio operator for at least six (6) months and duly certified by the Head of Office",
                "required": true
              },
              {
                "key": "seminar-completion-certificate",
                "title": "Certificate of Completion of Seminar",
                "required": false
              },
              {
                "key": "id-picture",
                "title": "Please provide a clear 1x1 ID picture taken within the last six (6) months.",
                "required": true
              },
            ],
            "serviceCode": "GROC",
            "sequenceCode": "GOV"
          },
          {
            "label": "Government Radio Operator Certificate (RENEWAL)",
            "elements": [
            ],
            "formCode": "ntc1-02",
            "requirements": [
              {
                "key": "document",
                "title": "Radio Operator Certificate",
                "required": true
              },
              {
                "key": "certificate-of-employment",
                "title": "Certificate of Employment",
                "required": true
              },
              {
                "key": "id-picture",
                "title": "Please provide a clear 1x1 ID picture taken within the last six (6) months.",
                "required": true
              },
            ],
            "serviceCode": "GROC",
            "sequenceCode": "GOV"
          },
          {
            "label": "Government Radio Operator Certificate (MODIFICATION)",
            "elements": [
            ],
            "formCode": "ntc1-02",
            "requirements": [
              {
                "key": "roc",
                "title": "Radio Operator Certificate",
                "required": true
              },
              {
                "key": "id-picture",
                "title": "Please provide a clear 1x1 ID picture taken within the last six (6) months.",
                "required": true
              },
              {
                "key": "id",
                "title": "For correction of name, ANY of the following:",
                "description": "• Valid government ID\n• Birth Certificate\n• Marriage Certificate"
              }
            ],
            "modificationDueTos": [
              {
                "label": "Others",
                "value": "Others",
                "hasSpecification": true,
              },
            ],
            "serviceCode": "GROC",
            "sequenceCode": "GOV"
          },
          {
            "label": "Restricted Radiotelephone Operator's Certificate for Land Mobile Station (NEW)",
            "elements": [
            ],
            "formCode": "ntc1-02",
            "requirements": [
              {
                "key": "seminar-completion-certificate",
                "title": "Certificate of Completion of Seminar",
                "required": false
              },
              {
                "key": "id-picture",
                "title": "Please provide a clear 1x1 ID picture taken within the last six (6) months.",
                "required": true
              },
            ],
            "serviceCode": "RROC-RLM",
            "sequenceCode": "RLM"
          },
          {
            "label": "Restricted Radiotelephone Operator's Certificate for Land Mobile Station (RENEWAL)",
            "elements": [
            ],
            "formCode": "ntc1-02",
            "requirements": [
              {
                "key": "document",
                "title": "Radio Operator Certificate",
                "required": true
              },
              {
                "key": "id-picture",
                "title": "Please provide a clear 1x1 ID picture taken within the last six (6) months.",
                "required": true
              },
            ],
            "serviceCode": "RROC-RLM",
            "sequenceCode": "RLM"
          },
          {
            "label": "Restricted Radiotelephone Operator's Certificate for Land Mobile Station (MODIFICATION)",
            "elements": [
            ],
            "formCode": "ntc1-02",
            "requirements": [
              {
                "key": "roc",
                "title": "Radio Operator Certificate",
                "required": true
              },
              {
                "key": "id-picture",
                "title": "Please provide a clear 1x1 ID picture taken within the last six (6) months.",
                "required": true
              },
              {
                "key": "id",
                "title": "For correction of name, ANY of the following:",
                "description": "• Valid government ID\n• Birth Certificate\n• Marriage Certificate"
              }
            ],
            "modificationDueTos": [
              {
                "label": "Others",
                "value": "Others",
                "hasSpecification": true,
              },
            ],
            "serviceCode": "RROC-RLM",
            "sequenceCode": "RLM"
          },
          {
            "label": "Special Radio Operator Certificate (NEW)",
            "elements": [
            ],
            "formCode": "ntc1-02",
            "requirements": [
              {
                "key": "seminar-completion-certificate",
                "title": "Certificate of Completion of Seminar",
                "required": false
              },
              {
                "key": "id-picture",
                "title": "Please provide a clear 1x1 ID picture taken within the last six (6) months.",
                "required": true
              },
            ],
            "serviceCode": "SROP",
            "sequenceCode": "SROP"
          },
          {
            "label": "Special Radio Operator Certificate (RENEWAL)",
            "elements": [
            ],
            "formCode": "ntc1-02",
            "requirements": [
              {
                "key": "document",
                "title": "Radio Operator Certificate",
                "required": true
              },
              {
                "key": "id-picture",
                "title": "Please provide a clear 1x1 ID picture taken within the last six (6) months.",
                "required": true
              },
            ],
            "serviceCode": "SROP",
            "sequenceCode": "SROP"
          },
          {
            "label": "Special Radio Operator Certificate (MODIFICATION)",
            "elements": [
            ],
            "formCode": "ntc1-02",
            "requirements": [
              {
                "key": "roc",
                "title": "Radio Operator Certificate",
                "required": true
              },
              {
                "key": "id-picture",
                "title": "Please provide a clear 1x1 ID picture taken within the last six (6) months.",
                "required": true
              },
              {
                "key": "id",
                "title": "For correction of name, ANY of the following:",
                "description": "• Valid government ID\n• Birth Certificate\n• Marriage Certificate"
              }
            ],
            "modificationDueTos": [
              {
                "label": "Others",
                "value": "Others",
                "hasSpecification": true,
              },
            ],
            "serviceCode": "SROP",
            "sequenceCode": "SROP"
          },
        ]
      },
      {
        "_id": "61c400d8ad8d7afe9ee6f617",
        "createdAt": "2021-12-09T09:40:51.621Z",
        "name": "Certificates in the Amateur Service",
        "serviceCode": "service-3",
        "about": {
          "heading": "Certificates in the Amateur Service",
          "description": "The Amateur Radio Operator Certificate is a written authority issued by the Commission to a person or a club authorizing the holder thereof to operate a class of radio station in the Amateur Service.\n\nThe RENEWAL of Amateur Radio Operator Certificate is required for the continuous operation of any class of radio stations in the Amateur Service.\n\nThe MODIFICATION of Amateur Radio Operator Certificate is required for changes in the particulars indicated in the Certificate.",
          "whoMayAvail": [
            {
              "title": "Individuals who have passed the Amateur Radio Operator Examination conducted by NTC"
            },
            {
              "title": "Duly accredited amateur radio clubs"
            },
            {
              "title": "Foreign amateurs qualified under the reciprocity agreement"
            },
            {
              "title": "Licensed amateur radio operators"
            },
          ]
        },
        "applicationTypes": [
          {
            "label": "Amateur Radio Operator Certificate (NEW)",
            "elements": [],
            "formCode": "ntc1-03-AT-ROC",
            "requirements": [
              {
                "key": "report-of-rating",
                "title": "Valid Report of Rating",
                "required": true
              },
              {
                "key": "id-picture",
                "title": "Please provide a clear 1x1 ID picture taken within the last six (6) months.",
                "required": true
              },
            ],
            "serviceCode": "AT-ROC"
          },
          {
            "label": "Amateur Radio Operator Certificate (RENEWAL)",
            "elements": [],
            "formCode": "ntc1-03-AT-ROC",
            "requirements": [
              {
                "key": "document",
                "title": "Amateur Radio Operator Certificate",
                "required": true
              },
              {
                "key": "amateur-activities-proof",
                "title": "Proof of Amateur Activities",
                "required": true
              },
              {
                "key": "id-picture",
                "title": "Please provide a clear 1x1 ID picture taken within the last six (6) months.",
                "required": true
              }
            ],
            "serviceCode": "AT-ROC"
          },
          {
            "label": "Amateur Radio Operator Certificate (MODIFICATION)",
            "elements": [],
            "formCode": "ntc1-03-AT-ROC",
            "requirements": [
              {
                "key": "amateur-roc",
                "title": "Amateur Radio Operator Certificate",
                "required": true
              },
              {
                "key": "id-picture",
                "title": "Please provide a clear 1x1 ID picture taken within the last six (6) months.",
                "required": true
              },
              {
                "key": "report-of-rating",
                "title": "For upgrade to higher class, valid Report of Rating"
              }
            ],
            "modificationDueTos": [
              {
                "label": "Others",
                "value": "Others",
                "hasSpecification": true,
              },
            ],
            "serviceCode": "AT-ROC"
          },
          {
            "label": "Lifetime Amateur Radio Station Supplementary Certificate (MODIFICATION)",
            "elements": [],
            "formCode": "ntc1-03-AT-ROC",
            "requirements": [
              {
                "key": "supplementary-certificate",
                "title": "Supplementary Certificate",
                "required": true
              },
            ],
            "modificationDueTos": [
              {
                "label": "Additional Equipment",
                "value": "Additional Equipment",
                "requirements": [
                  {
                    "key": "supplementary-certificate",
                    "title": "Supplementary Certificate",
                    "required": true
                  },
                  {
                    "key": "purchase-possess-permit",
                    "title": "Permit to Purchase/Possess",
                    "required": true
                  },
                  {
                    "key": "source-of-equipment-proof",
                    "title": "Copy of document indicating source of equipment:",
                    "description": "(a) For locally-sourced equipment, Official Receipt or Sales Invoice from authorized Radio Dealer, OR\n(b) For imported equipment, Copy of Invoice from the supplier AND Copy of Permit to Import, OR\n(c) For equipment from licensed Amateur, Permit to Sell/Transfer",
                    "required": true
                  },
                ],
              }, {
                "label": "Others",
                "value": "Others",
                "hasSpecification": true,
              },
              {
                "label": "Deletion of Equipment",
                "value": "Deletion of Equipment",
                "requirements": [
                  {
                    "key": "supplementary-certificate",
                    "title": "Supplementary Certificate",
                    "required": true
                  },
                  {
                    "key": "equipment-deletion-proof",
                    "title": "If deletion of equipment is due to:",
                    "description": "(a) Lost, Original Affidavit of Loss of Equipment\n(b) Storage, Permit to Purchase/Possess\n(c) Sell/Transfer, Permit to Sell/Transfer",
                    "required": true
                  },
                ],
              },
            ],
            "serviceCode": "AT-LIFETIME",
          },
        ],
      },
      {
        "_id": "61c400d8ad8e7afe9ee6f617",
        "createdAt": "2021-12-09T09:40:51.721Z",
        "name": "Certificate of Registration for RFID, SRD, WDN Devices - Indoor",
        "serviceCode": "service-16",
        "about": {
          "heading": "Certificate of Registration for RFID, SRD, WDN Devices - Indoor",
          "description": "A Certificate of Registration is a written authority issued by the Commission to an individual, accredited radio dealer/manufacturer, private and government entities for the registration of Radio Frequency Identification (RFID) Devices, Short Range Devices (SRD), or Wireless Data Network (WDN) Devices – Indoor.",
          "whoMayAvail": [
            {
              "title": "Individuals, Accredited Radio Dealers/Manufacturers, and Private and Government Entities"
            },
          ]
        },
        "applicationTypes": [
          {
            "label": "For Dealers",
            "elements": [],
            "formCode": "ntc1-19",
            "requirements": [
              {
                "key": "dealer-manufacturer-permit",
                "title": "Dealer Permit OR Manufacturer Permit",
                "required": true,
              },
              {
                "key": "imported-equipment-documents",
                "title": "For imported equipment:",
                "description": "(a) Permit to Import\n(b) Invoice\n(c) Bureau of Customs (BOC) Release Clearance and Import Entry Declaration",
              },
              {
                "key": "sales-stocks-report",
                "title": "For locally-manufactured equipment:",
                "description": "Sales and Stocks Report",
              },
            ],
            "serviceCode": "REG",
          },
          {
            "label": "For Non-Dealers",
            "elements": [],
            "formCode": "ntc1-19",
            "requirements": [
              {
                "key": "imported-equipment-documents",
                "title": "For imported equipment:",
                "description": "(a) Permit to Import\n(b) Invoice\n(c) Bureau of Customs (BOC) Release Clearance and Import Entry Declaration",
              },
              {
                "key": "sales-stocks-report",
                "title": "For locally-manufactured equipment:",
                "description": "Sales and Stocks Report",
              },
            ],
            "serviceCode": "REG"
          },
        ],
      },
      {
        "_id": "61c400d8ad8e7afe9ee6f627",
        "createdAt": "2021-12-09T09:51:51.721Z",
        "name": "TVRO Registration Certificate",
        "serviceCode": "service-17",
        "about": {
          "heading": "TVRO Registration Certificate",
          "description": "A TVRO Registration Certificate is a certificate or a written authority issued by the Commission to a person, firm, company, association, or corporation authorizing the holder thereof to possess television receive-only equipment.",
          "whoMayAvail": [
            {
              "title": "Cable TV Operators and Private and Government Entities"
            },
          ]
        },
        "applicationTypes": [
          {
            "label": "TVRO Registration Certificate (Commercial)",
            "elements": [],
            "formCode": "ntc1-22-certificate",
            "requirements": [
              {
                "key": "provisional-authority",
                "title": "Provisional Authority (PA) OR duly received Motion for Renewal of PA",
                "required": true,
              },
              {
                "key": "head-end-equipment-list",
                "title": "List of Combiner, Satellite Receivers, Modulators, LNA/LNB and other Head-End Equipment",
                "description": "Prepared and signed by a duly licensed Professional Electronics Engineer (PECE) / Electronics Engineer (ECE)",
                "required": true,
              },
            ],
            "serviceCode": "TVRO-REG",
            "category": "commercial",
            "sequenceCode": "TVROCERT",
          },
          {
            "label": "TVRO Registration Certificate (Non-Commercial)",
            "elements": [],
            "formCode": "ntc1-22-certificate",
            "requirements": [
              {
                "key": "head-end-equipment-list",
                "title": "List of Combiner, Satellite Receivers, Modulators, LNA/LNB and other Head-End Equipment",
                "description": "Prepared and signed by a duly licensed Professional Electronics Engineer (PECE) / Electronics Engineer (ECE)",
                "required": true,
              },
            ],
            "serviceCode": "TVRO-REG",
            "category": "non-commercial",
            "sequenceCode": "TVROCERT",
          },
        ],
      },
      {
        "_id": "61c400d8ad8e7afe9ee6f628",
        "createdAt": "2021-12-09T09:51:51.821Z",
        "name": "Certificate of Registration as a Value-Added Service (VAS) Provider",
        "serviceCode": "service-19",
        "about": {
          "heading": "Certificate of Registration as a Value-Added Service (VAS) Provider",
          "description": "The Certificate of Registration as a VAS Provider is a written authority issued by the Commission to an individual, private and government entities authorizing the holder thereof to offer value added services.\n\nThe RENEWAL of a Certificate of Registration is required for the continuous operation as a VAS Provider.",
          "whoMayAvail": [
            {
              "title": "Private Entities"
            },
          ]
        },
        "applicationTypes": [
          {
            "label": "RENEWAL",
            "elements": [],
            "formCode": "ntc1-20",
            "requirements": [
              {
                "key": "certificate-of-registration",
                "title": "Certificate of Registration",
                "required": true,
              },
              {
                "key": "lease-agreement",
                "title": "Facilities/network lease agreement with duly authorized facilities/network providers",
                "required": true,
              },
              {
                "key": "vas-provider-quaterly-report",
                "title": "Quarterly Report(s) of VAS Provider",
                "required": true,
              }
            ],
            "serviceCode": "VAS"
          },
        ],
      },

      /*
      {
        "_id": "61c500e8ad8d7afe8ee5f629",
        "createdAt": "2021-12-09T09:40:51.656Z",
        "name": "Certificates thru the Philippine National Single Window",
        "serviceCode": "service-20",
        "about": {
          "heading": "Certificates thru the Philippine National Single Window",
          "description": "A Certificate of Exemption is a written authority issued by the Commission to an individual, accredited CPE supplier, and private and government entities for the importation of non-customer premises equipment (CPE).",
          "whoMayAvail": [
            {
              "title": "Individuals"
            },
            {
              "title": "Accredited CPE Suppliers"
            },
            {
              "title": "Private and Government Entities"
            },
          ]
        },
        "applicationTypes": [
          {
            "label": "Certificate of Exemption for Non-Customer Premises Equipment",
            "elements": [
            ],
            "formCode": "ntc1-00",
            "requirements": [
              {
                "key": "proforma-or-commercial-invoice",
                "title": "Proforma/Commercial Invoice",
                "required": true
              },
              {
                "key": "approval-certificate",
                "title": "For CPE Supplier OR Personal/Company Use, ANY of the following:",
                "description": "• Type Approval Certificate\n• Type Acceptance Certificate\n• Grant of Equipment Conformity\n\nNote 1: CPE includes Indoor WDN equipment and Short Range Devices(SRD)",
                "required": true
              },
              {
                "key": "equipment-datasheet",
                "title": "For Demonstration and/or Testing:",
                "description": "Datasheet of proposed equipment",
              },
            ],
            "serviceCode": "CERT",
          },
        ]
      },
      */

      {
        "_id": "71c500e8ad8d7afe8ee5f629",
        "createdAt": "2021-12-09T09:41:51.656Z",
        "name": "Copy of Certificates",
        "serviceCode": "service-21",
        "about": {
          "heading": "Copy of Certificates",
          "description": "A Certified True Copy of a Certificate is issued by the Commission to individuals, private and government entities upon request of the holder to authenticate copy of the same.\n\nA Duplicate Copy of a Certificate is issued by the Commission to individuals, private and government entities upon request of the holder for the re-issuance of the same.",
          "whoMayAvail": [
            {
              "title": "Individuals"
            },
            {
              "title": "Private and Government Entities"
            },
          ]
        },
        "applicationTypes": [
          {
            "label": "Certified True Copy",
            "elements": [
            ],
            "formCode": "ntc1-ctc-certificate",
            "requirements": [
              {
                "key": "document",
                "title": "Copy of document to be authenticated",
                "required": true
              },
            ],
            "serviceCode": "CTC",
            "category": "certificate",
          },
          {
            "label": "Duplicate Copy",
            "elements": [
            ],
            "formCode": "ntc1-21-certificate",
            "requirements": [
              {
                "key": "copy-of-certificate",
                "title": "Copy of Certificate:",
                "description": "A scanned or photocopied copy of the original Radio Operator Certificate."
              },
              {
                "key": "id-picture",
                "title": "For Radio Operator Certificate:",
                "description": "Please provide a clear 1x1 ID picture taken within the last six (6) months.",
              },
            ],
            "serviceCode": "DUP",
            "category": "certificate",
          },
        ]
      },
    ],
  },
  {
    title: 'Exams',
    key: 'exams',
    logo: require('@assets/services/exam.png'),
    data: [
      {
        "_id": "61c400d8ad8d7afe9ee5f616",
        "createdAt": "2021-12-09T08:40:51.620Z",
        "name": "Admission Slip for Radio Operator Examination",
        "serviceCode": "service-1",
        "about": {
          "heading": "Admission Slip for Radio Operator Examination",
          "description": "The Admission Slip is a document issued by the Commission to a qualified applicant authorizing the holder thereof to take the commercial or non-commercial radio operator examination.",
          "whoMayAvail": [
            {
              "title": "Restricted Radio Operator Certificate (RROC) - Aircraft",
              "list": [
                "Commercial pilots",
                "Student pilots"
              ]
            },
            {
              "title": "Radiotelephone/Radiotelegraph",
              "list": [
                "Graduates of General Radio Communication Operator (GRCO)",
                "Graduates of Industrial Electronics Technician Course (IETC)",
                "Graduates of Communications Technician Course (CTC)",
                "Graduates of Bachelor of Science in Avionics Technology (BS AVTECH)",
                "Graduates of Bachelor of Science in Electronics and Communications Engineering; Bachelor of Science in Electronics Engineering (BS ECE)"
              ]
            },
            {
              "title": "Amateur",
              "list": [
                "Radio enthusiasts",
                "Licensed amateurs and commercial operators (for upgrading)",
                "Registered ECE"
              ]
            }
          ]
        },
        "examineeType": [
          {
            "key": "first-taker",
            "label": "First Taker",
            "requirements": [
              {
                "key": "id",
                "title": "ANY of the following:",
                "description": "• Birth Certificate\n• Baptismal Certificate\n• Passport\n• PRC License\n• Driver's License\n• any document which can serve as the basis for age requirement",
                "required": true
              },
              {
                "key": "tor",
                "title": "Transcript of Records with Special Order (SO)",
                "description": "Note 1: The applicant has to show the original copy.\nNote 2: SO is not required for State Universities/Colleges",
                "required": true
              },
              {
                "key": "id-picture",
                "title": "Please provide a clear 1x1 ID picture taken within the last six (6) months.",
                "required": true
              },
              {
                "key": "roc",
                "title": "For upgrade to higher class, Radio Operator Certificate"
              }
            ],
          },
          {
            "key": "re-taker",
            "label": "Re-taker",
            "requirements": [
              {
                "key": "id-picture",
                "title": "Please provide a clear 1x1 ID picture taken within the last six (6) months.",
                "required": true
              },
              {
                "key": "proof-of-rating",
                "title": "Proof of Rating",
                "required": true
              }
            ],
          }
        ],
        "applicationTypes": [
          {
            "label": "Radiotelegraphy",
            "elements": [
              "1RTG - Elements 1, 2, 5, 6 & Code (25/20 wpm)",
              "1RTG - For removal , Code (25/20 wpm)",
              "1RTG - For upgrade (2RTG Holder) & Code (25/20 wpm)",
              "2RTG - Elements 1, 2, 5, 6 & Code (16 wpm)",
              "2RTG - For removal, Code (16 wpm)",
              "2RTG - For upgrade (3RTG Holder) , Element 6"
            ],
            "formCode": "ntc1-01",
            "requirements": [
              {
                "key": "id",
                "title": "ANY of the following:",
                "description": "• Birth Certificate\n• Baptismal Certificate\n• Passport\n• PRC License\n• Driver's License\n• any document which can serve as the basis for age requirement",
                "required": true
              },
              {
                "key": "tor",
                "title": "Transcript of Records with Special Order (SO)",
                "description": "Note 1: The applicant has to show the original copy.\nNote 2: SO is not required for State Universities/Colleges",
                "required": true
              },
              {
                "key": "id-picture",
                "title": "Please provide a clear 1x1 ID picture taken within the last six (6) months.",
                "required": true
              },
              {
                "key": "roc",
                "title": "For upgrade to higher class, Radio Operator Certificate"
              }
            ],
          },
          {
            "label": "Radiotelephony",
            "elements": [
              "1PHN - Elements 1, 2, 3 & 4",
              "1PHN - For upgrade (2PHN Holder) , Element 4",
              "1PHN - For upgrade (3PHN Holder), Element 3 & 4"
            ],
            "formCode": "ntc1-01",
            "requirements": [
              {
                "key": "id",
                "title": "ANY of the following:",
                "description": "• Birth Certificate\n• Baptismal Certificate\n• Passport\n• PRC License\n• Driver's License\n• any document which can serve as the basis for age requirement",
                "required": true
              },
              {
                "key": "tor",
                "title": "Transcript of Records with Special Order (SO)",
                "description": "Note 1: The applicant has to show the original copy.\nNote 2: SO is not required for State Universities/Colleges",
                "required": true
              },
              {
                "key": "id-picture",
                "title": "Please provide a clear 1x1 ID picture taken within the last six (6) months.",
                "required": true
              },
              {
                "key": "roc",
                "title": "For upgrade to higher class, Radio Operator Certificate"
              }
            ]
          },
          {
            "label": "Amateur",
            "elements": [
              "Class A - Elements 8, 9, 10 & Code (5 wpm)",
              "Class A - For removal, Code (5 wmp)",
              "Class B - Elements 5, 6 & 7",
              "Class B - For Registered ECE, 1PHN, 1RTG & 2RTG , Element 2",
              "Class C - Elements 2, 3 & 4",
              "Class C - For Class D Holder, Elements 3 & 4",
              "Class D - Element 2"
            ],
            "formCode": "ntc1-01",
            "requirements": [
              {
                "key": "id",
                "title": "ANY of the following:",
                "description": "• Birth Certificate\n• Baptismal Certificate\n• Passport\n• PRC License\n• Driver's License\n• any document which can serve as the basis for age requirement",
                "required": true
              },
              {
                "key": "attendance",
                "title": "Proof of attendance of seminar conducted by NTC accredited Amateur Radio Club",
                "required": true
              },
              {
                "key": "id-picture",
                "title": "Please provide a clear 1x1 ID picture taken within the last six (6) months.",
                "required": true
              },
              {
                "key": "roc",
                "title": "For upgrade to higher class, Radio Operator Certificate"
              }
            ]
          },
          {
            "label": "Restricted Radio Operator Certificate - Aircraft",
            "elements": [
              "RROC - Aircraft - Element 1"
            ],
            "formCode": "ntc1-01",
            "requirements": [
              {
                "key": "pilot-license",
                "title": "Aircraft pilot's license or student pilot's license issued by the Civil Aviation Authority of the Philippines (CAAP) / Pilot license issued by the aviation authority of the Administration for foreign applicants",
                "required": true
              },
              {
                "key": "id-picture",
                "title": "Please provide a clear 1x1 ID picture taken within the last six (6) months.",
                "required": true
              }
            ]
          }
        ]
      },
    ],
  },
  {
    title: 'Licenses',
    key: 'licenses',
    logo: require('@assets/services/license.png'),
    data: [
      {
        "_id": "61c400d8ad8d7afe8ee5f617",
        "createdAt": "2021-12-09T08:40:51.621Z",
        "name": "Licenses in the Amateur Service",
        "serviceCode": "service-3",
        "about": {
          "heading": "Licenses in the Amateur Service",
          "description": "The Amateur Radio Station License is a written authority issued by the Commission to a person or a club authorizing the holder thereof to operate a class of radio station in the Amateur Service.\n\nThe RENEWAL of Amateur Radio Station License is required for the continuous operation of any class of radio stations in the Amateur Service.\n\nThe MODIFICATION of Amateur Radio Station License is required for changes in the particulars indicated in the License.",
          "whoMayAvail": [
            {
              "title": "Individuals who have passed the Amateur Radio Operator Examination conducted by NTC"
            },
            {
              "title": "Duly accredited amateur radio clubs"
            },
            {
              "title": "Foreign amateurs qualified under the reciprocity agreement"
            },
            {
              "title": "Licensed amateur radio operators"
            },
          ]
        },
        "applicationTypes": [
          {
            "label": "Amateur Radio Station License (NEW)",
            "elements": [
              "Class A",
              "Class B",
              "Class C",
              "Class D",
            ],
            "formCode": "ntc1-03-AT-RSL",
            "requirements": [
              {
                "key": "purchase-possess-permit",
                "title": "Permit to Purchase/Possess",
                "required": true
              },
              {
                "key": "amateur-roc",
                "title": "For Amateur Radio Operator Certificate (AT-ROC) holders:",
                "description": "Valid AT-ROC"
              },
              {
                "key": "source-of-equipment-proof",
                "title": "Copy of document indicating source of equipment:",
                "description": "(a) For locally-sourced equipment, Official Receipt or Sales Invoice from authorized Radio Dealer, OR\n(b) For imported equipment, Copy of Invoice from the supplier AND Copy of Permit to Import, OR\n(c) For equipment from licensed Amateur, Permit to Sell/Transfer AND Original AT-RSL of the Seller\nNote 1: Apply for Duplicate Copy if Original is lost/mutilated/destroyed or not available.",
                "required": true
              },
              {
                "key": "id-picture",
                "title": "Please provide a clear 1x1 ID picture taken within the last six (6) months.",
                "required": true
              },
            ],
            "serviceCode": "AT-RSL",
            "sequenceCode": "AT",
          },
          {
            "label": "Amateur Radio Station License (RENEWAL)",
            "elements": [
              "Class A",
              "Class B",
              "Class C",
              "Class D",
            ],
            "formCode": "ntc1-03-AT-RSL",
            "requirements": [
              // {
              //   "key": "document",
              //   "title": "Valid Amateur Radio Station License",
              //   //r7
              //   //"required": true
              // },
              {
                "key": "photocopy-of-at-rsl",
                "title": "Photocopy of AT-RSL",
                "required": true
              },
              {
                "key": "amateur-activities-proof",
                "title": "Proof of Amateur Activities",
                "required": true
              },
              {
                "key": "id-picture",
                "title": "Please provide a clear 1x1 ID picture taken within the last six (6) months.",
                "required": true
              }
            ],
            "serviceCode": "AT-RSL",
            "sequenceCode": "AT",
          },
          {
            "label": "Amateur Radio Station License (MODIFICATION)",
            "elements": [
            ],
            "formCode": "ntc1-03-AT-RSL",
            "modificationDueTos": [
              {
                "label": "Change of Equipment and/or Additional Equipment",
                "value": "Change of Equipment and/or Additional Equipment",
                "requirements": [
                  {
                    "key": "amateur-rsl",
                    "title": "Valid Amateur Radio Station License",
                    //"required": true
                  },
                  {
                    "key": "id-picture",
                    "title": "Please provide a clear 1x1 ID picture taken within the last six (6) months.",
                    "required": true
                  },
                  {
                    "key": "purchase-possess-permit",
                    "title": "Permit to Purchase/Possess",
                    "required": true
                  },
                  {
                    "key": "source-of-equipment-proof",
                    "title": "Copy of document indicating source of equipment:",
                    "description": "(a) For locally-sourced equipment, Official Receipt or Sales Invoice from authorized Radio Dealer, OR\n(b) For imported equipment, Copy of Invoice from the supplier AND Copy of Permit to Import, OR\n(c) For equipment from licensed Amateur, Permit to Sell/Transfer",
                    "required": true
                  },
                ],
              },
              {
                "label": "Upgrading",
                "value": "Upgrading",
                "requirements": [
                  {
                    "key": "amateur-rsl",
                    "title": "Valid Amateur Radio Station License",
                    //"required": true
                  },
                  {
                    "key": "id-picture",
                    "title": "Please provide a clear 1x1 ID picture taken within the last six (6) months.",
                    "required": true
                  },
                  {
                    "key": "report-of-rating",
                    "title": "Valid Report of Rating",
                    "required": true
                  },
                ],
              },
              {
                "label": "Deletion of Equipment",
                "value": "Deletion of Equipment",
                "requirements": [
                  {
                    "key": "amateur-rsl",
                    "title": "Valid Amateur Radio Station License",
                    //"required": true
                  },
                  {
                    "key": "id-picture",
                    "title": "Please provide a clear 1x1 ID picture taken within the last six (6) months.",
                    "required": true
                  },
                  {
                    "key": "equipment-deletion-proof",
                    "title": "If deletion of equipment is due to:",
                    "description": "(a) Lost, Original Affidavit of Loss of Equipment\n(b) Storage, Permit to Purchase/Possess\n(c) Sell/Transfer, Permit to Sell/Transfer",
                    "required": true
                  },
                ],
              }, {
                "label": "Others",
                "value": "Others",
                "hasSpecification": true,
              },
            ],
            "requirements": [
              // {
              //   "key": "amateur-rsl",
              //   "title": "Valid Amateur Radio Station License",
              //   //"required": true
              // },
              {
                "key": "id-picture",
                "title": "Please provide a clear 1x1 ID picture taken within the last six (6) months.",
                "required": true
              },
            ],
            "serviceCode": "AT-RSL",
            "sequenceCode": "AT",
          },
          {
            "label": "Lifetime Amateur Radio Station License for Class A",
            "elements": [
            ],
            "formCode": "ntc1-00",
            "requirements": [
              {
                "key": "letter-request",
                "title": "Letter request for Issuance of a Lifetime Radio Station License",
                "required": true
              },
              {
                "key": "good-standing-certificate",
                "title": "Certificate of Good Standing as a Member from a registered amateur club or association with the NTC",
                "required": true
              },
              {
                "key": "id",
                "title": "Copy of ANY of the following:",
                "description": "• Birth Certificate\n• Passport\n• PRC License\n• Driver's License\nNote 1: The applicant has to show the Original.\nNote 2: Applicant must be at least 60 years of age.",
                "required": true
              },
              {
                "key": "rsl",
                "title": "Amateur Class 'A' Radio Station License",
                "required": true
              },
              {
                "key": "amateur-service-proof",
                "title": "Proof of amateur service of at least fifteen (15) consecutive years",
                "required": true
              },
              {
                "key": "id-picture",
                "title": "Please provide a clear 1x1 ID picture taken within the last six (6) months.",
                "required": true
              },
            ],
            "serviceCode": "AT-LIFETIME",
            "sequenceCode": "AT",
          },
          {
            "label": "Amateur Club Radio Station License (NEW)",
            "elements": [],
            "formCode": "ntc1-03-AT-CLUB-RSL",
            "requirements": [
              {
                "key": "purchase-possess-permit",
                "title": "Permit to Purchase/Possess",
                "required": true
              },
              {
                "key": "source-of-equipment-proof",
                "title": "Copy of document indicating source of equipment:",
                "description": "(a) For locally-sourced equipment, Official Receipt or Sales Invoice from authorized Radio Dealer, OR\n(b) For imported equipment, Copy of Invoice from the supplier AND Copy of Permit to Import, OR\n(c) For equipment from licensed Amateur, Permit to Sell/Transfer",
                "required": true
              },
            ],
            "serviceCode": "AT-CLUB-RSL",
            "sequenceCode": "AT",
          },
          {
            "label": "Amateur Club Radio Station License (RENEWAL)",
            "elements": [],
            "formCode": "ntc1-03-AT-CLUB-RSL",
            "requirements": [
              {
                "key": "document",
                "title": "Amateur Club Radio Station License",
                "required": true
              },
              {
                "key": "organization-list",
                "title": "List providing the licensed Amateur Club Trustee, Officers and Members of the organization",
                "description": "Note 1: List must contain a minimum membership of twenty-five (25) duly licensed amateur radio operators.\nNote 2: The licenses of prospective members shall be validated.\nNote 3: The Amateur Club Trustee designated by the Club must be a licensed Class A for at least five (5) years.\nNote 4: The Amateur Fixed Station shall be issued only to the Club Trustee",
                "required": true,
              },
            ],
            "serviceCode": "AT-CLUB-RSL",
            "sequenceCode": "AT",
          },
          {
            "label": "Amateur Club Radio Station License (MODIFICATION)",
            "elements": [
            ],
            "formCode": "ntc1-03-AT-CLUB-RSL",
            "modificationDueTos": [
              {
                "label": "Change of Equipment and/or Additional Equipment",
                "value": "Change of Equipment and/or Additional Equipment",
                "requirements": [
                  {
                    "key": "amateur-club-rsl",
                    "title": "Amateur Club Radio Station License",
                    "required": true
                  },
                  {
                    "key": "purchase-possess-permit",
                    "title": "Permit to Purchase/Possess",
                    "required": true
                  },
                  {
                    "key": "source-of-equipment-proof",
                    "title": "Copy of document indicating source of equipment:",
                    "description": "(a) For locally-sourced equipment, Official Receipt or Sales Invoice from authorized Radio Dealer, OR\n(b) For imported equipment, Copy of Invoice from the supplier AND Copy of Permit to Import, OR\n(c) For equipment from licensed Amateur, Permit to Sell/Transfer",
                    "required": true
                  },
                ],
              },
              {
                "label": "Deletion of Equipment",
                "value": "Deletion of Equipment",
                "requirements": [
                  {
                    "key": "amateur-club-rsl",
                    "title": "Amateur Club Radio Station License",
                    "required": true
                  },
                  {
                    "key": "equipment-deletion-proof",
                    "title": "If deletion of equipment is due to:",
                    "description": "(a) Lost, Original Affidavit of Loss of Equipment\n(b) Storage, Permit to Purchase/Possess\n(c) Sell/Transfer, Permit to Sell/Transfer",
                    "required": true
                  },
                ],
              },
              {
                "label": "Change of Club Trustee",
                "value": "Change of Club Trustee",
                "requirements": [
                  {
                    "key": "amateur-club-rsl",
                    "title": "Amateur Club Radio Station License",
                    "required": true
                  },
                ],
              },
              {
                "label": "Change of station location",
                "value": "Change of station location",
                "requirements": [
                  {
                    "key": "amateur-club-rsl",
                    "title": "Amateur Club Radio Station License",
                    "required": true
                  },
                  {
                    "key": "map",
                    "title": "Map showing the location with geographical coordinates, as applicable",
                    "required": true
                  },
                ],
              },
            ],
            "requirements": [
              {
                "key": "amateur-club-rsl",
                "title": "Amateur Club Radio Station License",
                "required": true
              },
            ],
            "serviceCode": "AT-CLUB-RSL",
            "sequenceCode": "AT",
          },
        ]
      },
      {
        "_id": "61c400d8ad8d7afe9ee5f617",
        "createdAt": "2021-12-09T08:40:51.622Z",
        "name": "Licenses in the Aeronautical Service",
        "serviceCode": "service-4",
        "about": {
          "heading": "Licenses in the Aeronautical Service",
          "description": "A Fixed Aeronautical Station License is a written authority issued by the Commission to an individual, private and government entities authorizing the holder thereof to operate an aeronautical fixed station in the Aeronautical Fixed Service.\n\nAn Aircraft Station License is a written authority issued by the Commission to an individual or private or government entities authorizing the holder thereof to operate a mobile station installed onboard any type of aircraft.\n\nThe RENEWAL of Fixed Aeronautical Station License or Aircraft Station License is required for the continuous operation of an existing radio station.\n\nThe MODIFICATION of Fixed Aeronautical Station License or Aircraft Station License is required for changes in the particulars indicated in the License.",
          "whoMayAvail": [
            {
              "title": "Individuals and Private and Government Entities"
            },
          ]
        },
        "applicationTypes": [
          {
            "label": "Fixed Aeronautical Station License (NEW)",
            "elements": [
            ],
            "formCode": "ntc1-11-ASL",
            "requirements": [
              {
                "key": "aircraft-rsl",
                "title": "Authenticated copy of existing aircraft station license",
                "required": true,
              },
              {
                "key": "purchase-possess-permit",
                "title": "Permit to Purchase/Possess",
                "required": true
              },
              {
                "key": "source-of-equipment-proof",
                "title": "Copy of document indicating source of equipment:",
                "description": "(a) For locally-sourced equipment, Official Receipt or Sales Invoice from authorized Radio Dealer, OR\n(b) For imported equipment, Copy of Invoice from the supplier AND Copy of Permit to Import",
                "required": true,
              },
              {
                "key": "roc",
                "title": "Valid Radio Operator Certificate (at least 2PHN)",
                "required": true,
              },
              {
                "key": "certificate-of-employment",
                "title": "Certificate of Employment",
                "required": true,
              },
              {
                "key":
                  "ntc-inspection-report",
                "title": "NTC Inspection Report of the subject radio station",
                "link": link, "description": 'Download the "SWORN STATEMENT and DECLARATION" Form',

                // "required": true,
              }
            ],
            "serviceCode": "FASL",
            "sequenceCode": "FA",
          },
          {
            "label": "Fixed Aeronautical Station License (RENEWAL)",
            "elements": [
            ],
            "formCode": "ntc1-11-ASL",
            "requirements": [
              // {
              //   "key": "document",
              //   "title": "Valid Radio Station License",
              //   "required": true,
              // },
              {
                "key": "roc",
                "title": "Valid Radio Operator Certificate (at least 2PHN)",
                "required": true,
              },
              {
                "key": "certificate-of-employment",
                "title": "Certificate of Employment",
                "required": true,
              },
              {
                "key": "ntc-inspection-report",
                "title": "NTC Inspection Report of the subject radio station",
                "link": "https://raw.githubusercontent.com/edward1986/edge-document/refs/heads/main/Sworn%20Statement%20and%20Declaration%20Form.pdf",
                "description": "",

                // "required": true,
              },
              {
                "key": "photocopy-of-rsl",
                "title": "Photocopy of RSL",
                "description": "Upload a clear photocopy of your RSL in JPG/PNG/PDF format",
                "required": true
              }
            ],
            "serviceCode": "FASL",
            "sequenceCode": "FA",
          },
          {
            "label": "Fixed Aeronautical Station License (MODIFICATION)",
            "elements": [
            ],
            "formCode": "ntc1-11-ASL",
            "requirements": [
              {
                "key": "rsl",
                "title": "Radio Station License",
                "required": true,
              },
              {
                "key": "roc",
                "title": "Radio Operator Certificate (at least 2PHN)",
                "required": true,
              },
              {
                "key": "certificate-of-employment",
                "title": "Certificate of Employment",
                "required": true,
              }, {
                "key": "photocopy-of-rsl",
                "title": "Photocopy of RSL",
                "description": "Upload a clear photocopy of your RSL in JPG/PNG/PDF format",
                "required": true
              }
            ],
            "modificationDueTos": [
              {
                "label": "Change of Licensee",
                "value": "Change of Licensee",
                "requirements": [
                  {
                    "key": "rsl",
                    "title": "Valid Radio Station License",
                    "required": true,
                  },
                  {
                    "key": "roc",
                    "title": "Valid Radio Operator Certificate (at least 2PHN)",
                    "required": true,
                  },
                  {
                    "key": "certificate-of-employment",
                    "title": "Certificate of Employment",
                    "required": true,
                  },
                  {
                    "key": "registration-document",
                    "title": "Copy of ANY of the following:",
                    "description": "• SEC Registration\n• DTI Registration\n• Valid Business/Mayor's Permit",
                    "required": true
                  },
                ],
              },
              {
                "label": "Change of Equipment and/or Additional Equipment",
                "value": "Change of Equipment and/or Additional Equipment",
                "requirements": [
                  {
                    "key": "rsl",
                    "title": "Valid Radio Station License",
                    "required": true,
                  },
                  {
                    "key": "roc",
                    "title": "Valid Radio Operator Certificate (at least 2PHN)",
                    "required": true,
                  },
                  {
                    "key": "certificate-of-employment",
                    "title": "Certificate of Employment",
                    "required": true,
                  },
                  {
                    "key": "purchase-possess-permit",
                    "title": "Permit to Purchase/Possess",
                    "required": true
                  },
                  {
                    "key": "source-of-equipment-proof",
                    "title": "Copy of document indicating source of equipment:",
                    "description": "(a) For locally-sourced equipment, Official Receipt or Sales Invoice from authorized Radio Dealer, OR\n(b) For imported equipment, Copy of Invoice from the supplier AND Copy of Permit to Import",
                    "required": true
                  },
                ],
              },
            ],
            "serviceCode": "FASL",
            "sequenceCode": "FA",
          },
          {
            "label": "Aircraft Station License (NEW)",
            "elements": [
            ],
            "formCode": "ntc1-11-and-09",
            "requirements": [
              {
                "key": "certificate-of-registration",
                "title": "Valid Certificate of Registration issued by the Civil Aviation Authority of the Philippines (CAAP)",
                "required": true,
              },
              {
                "key": "rei-inspection-report",
                "title": "Valid latest Radio, Electronics and Instruments (REI) Inspection Report duly signed by the authorized Technician of the Civil Aviation Authority of the Philippines (CAAP)",
                // "required": true
              },
              {
                "key": "restricted-roc-aircraft",
                "title": "Restricted Radio Operator Certificate - Aircraft",
                "required": true,
              },
              {
                "key": "certificate-of-employment",
                "title": "Certificate of Employment",
                "required": true,
              },
              {
                "key": "ntc-inspection-report",
                "title": "NTC Inspection Report of the subject radio station", "link": "https://raw.githubusercontent.com/edward1986/edge-document/refs/heads/main/Sworn%20Statement%20and%20Declaration%20Form.pdf", "description": 'Download the "SWORN STATEMENT and DECLARATION" Form',
                // "required": true,
              }
            ],
            "serviceCode": "ASL",
            "sequenceCode": "MA",
          },
          {
            "label": "Aircraft Station License (RENEWAL)",
            "elements": [
            ],
            "formCode": "ntc1-11-ASL",
            "requirements": [
              {
                "key": "document",
                "title": "Aircraft Station License",
                "required": true,
              },
              {
                "key": "certificate-of-registration",
                "title": "Valid Certificate of Registration issued by the Civil Aviation Authority of the Philippines (CAAP)",
                "required": true,
              },
              {
                "key": "rei-inspection-report",
                "title": "Valid latest Radio, Electronics and Instruments (REI) Inspection Report duly signed by the authorized Technician of the Civil Aviation Authority of the Philippines (CAAP)",
                // "required": true
              },
              {
                "key": "restricted-roc-aircraft",
                "title": "Restricted Radio Operator Certificate - Aircraft",
                "required": true,
              },
              {
                "key": "certificate-of-employment",
                "title": "Certificate of Employment",
                "required": true,
              },
              {
                "key": "ntc-inspection-report",
                "title": "NTC Inspection Report of the subject radio station", "link": "https://raw.githubusercontent.com/edward1986/edge-document/refs/heads/main/Sworn%20Statement%20and%20Declaration%20Form.pdf", "description": 'Download the "SWORN STATEMENT and DECLARATION" Form',
                "additional": {
                  "VII": { "required": true }
                }
                // "required": true,
              }
            ],
            "serviceCode": "ASL",
            "sequenceCode": "MA",
          },
          {
            "label": "Aircraft Station License (MODIFICATION)",
            "elements": [
            ],
            "formCode": "ntc1-11-ASL",
            "requirements": [
              {
                "key": "aircraft-rsl",
                "title": "Aircraft Station License",
                "required": true,
              },
            ],
            "modificationDueTos": [
              {
                "label": "Change of Licensee",
                "value": "Change of Licensee",
                "requirements": [
                  {
                    "key": "aircraft-rsl",
                    "title": "Aircraft Station License",
                    "required": true,
                  },
                  {
                    "key": "certificate-of-registration",
                    "title": "Valid Certificate of Registration issued by the Civil Aviation Authority of the Philippines (CAAP)",
                    "required": true,
                  },
                ],
              },
              {
                "label": "Change of Equipment and/or Additional Equipment",
                "value": "Change of Equipment and/or Additional Equipment",
                "requirements": [
                  {
                    "key": "aircraft-rsl",
                    "title": "Aircraft Station License",
                    "required": true,
                  },
                  {
                    "key": "source-of-equipment-proof",
                    "title": "Copy of document indicating source of equipment:",
                    "description": "(a) For locally-sourced equipment, Official Receipt or Sales Invoice from authorized Radio Dealer, OR\n(b) For registered equipment, Copy of Permit to Possess",
                    "required": true
                  },
                ],
              },
            ],
            "serviceCode": "ASL",
            "sequenceCode": "MA",
          },
        ]
      },
      {
        "_id": "61d400d8ad8d7afe9ee5f617",
        "createdAt": "2021-12-09T08:40:51.623Z",
        "name": "Licenses in the Maritime Service",
        "serviceCode": "service-5",
        "about": {
          "heading": "Licenses in the Maritime Service",
          "description": "The Ship Station License or Ship Earth Station License is a written authority issued by the Commission to an individual, private and government entities authorizing the holder thereof to operate ship radio station (radio and navigation equipment) in the Maritime Mobile Service.\n\nA Private Coastal Station License is a written authority issued by the Commission to an individual, private and government entities authorizing the holder thereof to operate a radio station in the Maritime Service.\n\nA Public Coastal Station License is a written authority issued by the Commission to a public telecommunications entity (PTEs) authorizing the holder thereof to operate a public coastal station in the Maritime Service.\n\nThe RENEWAL of a Ship Station License or Ship Earth Station License is required for the continuous operation of an existing radio stations.\n\nThe RENEWAL of a Private Coastal Station License is required for the continuous operation of a private coastal station.\n\nThe RENEWAL of Public Coastal Station License is required for the continuous operation of public coastal stations in the Maritime Service.\n\nThe MODIFICATION of a Ship Station License, Ship Earth Station License, or Private Coastal Radio Station License is required for changes in the particulars indicated in the License.\n\nThe MODIFICATION of Public Coastal Station License is required for changes in the particulars indicated in the License.",
          "whoMayAvail": [
            {
              "title": "Individuals and Private and Government Entities"
            },
            {
              "title": "Public Telecommunications Entities (PTEs) who are authorized to engage in public maritime communications service"
            }
          ]
        },
        "applicationTypes": [
          {
            "label": "Ship Station License DOMESTIC Trade (NEW) (WITHOUT originally-installed equipment)",
            "elements": [
            ],
            "formCode": "ntc1-04-SSL",
            "requirements": [
              {
                "key": "ship-id",
                "title": "Copy of ANY of the following:",
                "description": "• Certificate of Vessel Registry and Certificate of Ownership issued by the Maritime Industry Authority (MARINA)\n• Permit issued by the Local Government Unit (LGU)",
                "required": true,
              },
              {
                "key": "roc",
                "title": "Radio Operator Certificate",
                "description": "(at least 2nd Class Radiotelephone Operator)",
                "required": true,
              },
              {
                "key": "certificate-of-employment",
                "title": "Certificate of Employment",
                "required": true,
              },
              {
                "key": "purchase-possess-permit",
                "title": "Permit to Purchase/Possess",
                "required": true,
              },
              {
                "key": "source-of-equipment-proof",
                "title": "Copy of document indicating source of equipment:",
                "description": "(a) For locally-sourced equipment, Official Receipt or Sales Invoice from authorized Radio Dealer, OR\n(b)For imported equipment, Copy of Invoice from the supplier AND Copy of Permit to Import\n(c) For registered equipment, Copy of Permit to Possess",
                "required": true, // region 9 need required
              },
              {
                "key": "ntc-inspection-report",
                "title": "NTC Inspection Report of the subject radio station",
                "link": "https://raw.githubusercontent.com/edward1986/edge-document/refs/heads/main/Sworn%20Statement%20and%20Declaration%20Form.pdf",
                "description": 'Download the "SWORN STATEMENT and DECLARATION" Form',
                // "required": true,
              },
            ],
            "serviceCode": "SSL",
            "sequenceCode": "MS",
          },
          {
            "label": "Ship Station License DOMESTIC Trade (NEW) (WITH originally-installed equipment)",
            "elements": [
            ],
            "formCode": "ntc1-04-and-09-SSL",
            "requirements": [
              {
                "key": "ship-id",
                "title": "Copy of ANY of the following:",
                "description": "• Copy of Certificate of Vessel Registry and Certificate of Ownership issued by the Maritime Industry Authority (MARINA)\n• Permit issued by the Local Government Unit (LGU)",
                "required": true,
              },
              {
                "key": "roc",
                "title": "Radio Operator Certificate",
                "description": "(at least 2nd Class Radiotelephone Operator)",
                "required": true,
              },
              {
                "key": "certificate-of-employment",
                "title": "Certificate of Employment",
                "required": true,
              },
              {
                "key": "ntc-inspection-report",
                "title": "NTC Inspection Report of the subject radio station",
                "link": "https://raw.githubusercontent.com/edward1986/edge-document/refs/heads/main/Sworn%20Statement%20and%20Declaration%20Form.pdf",
                "description": 'Download the "SWORN STATEMENT and DECLARATION" Form',
                // "required": true,
              },
            ],
            "serviceCode": "SSL",
            "sequenceCode": "MS",
          },
          {
            "label": "Ship Station License DOMESTIC Trade (RENEWAL)",
            "elements": [
            ],
            "formCode": "ntc1-04-SSL",
            "requirements": [
              {
                "key": "document",
                "title": "Ship Station License",
                "required": true,
              },
              {
                "key": "roc",
                "title": "Radio Operator Certificate",
                "description": "(at least 2nd Class Radiotelephone Operator)",
                "required": true,
              },
              {
                "key": "certificate-of-employment",
                "title": "Certificate of Employment",
                "required": true,
              },
              {
                "key": "ntc-inspection-report",
                "title": "NTC Inspection Report of the subject radio station",
                "link": "https://raw.githubusercontent.com/edward1986/edge-document/refs/heads/main/Sworn%20Statement%20and%20Declaration%20Form.pdf",
                "description": 'Download the "SWORN STATEMENT and DECLARATION" Form',
                "additional": {
                  "VII": { "required": true }
                }
              },
            ],
            "serviceCode": "SSL",
            "sequenceCode": "MS",
          },
          {
            "label": "Ship Station License DOMESTIC Trade (MODIFICATION)",
            "elements": [
            ],
            "formCode": "ntc1-04-SSL",
            "requirements": [
              {
                "key": "ship-station-license",
                "title": "Ship Station License",
                "required": true,
              },
            ],
            "modificationDueTos": [
              {
                "label": "Change of Licensee",
                "value": "Change of Licensee",
                "requirements": [
                  {
                    "key": "ship-station-license",
                    "title": "Ship Station License",
                    "required": true,
                  },
                  {
                    "key": "ship-id",
                    "title": "Copy of ANY of the following:",
                    "description": "• Copy of Certificate of Philippine Registry and Certificate of Ownership issued by the Maritime Industry Authority (MARINA)\n• Permit issued by the Local Government Unit (LGU)",
                    "required": true,
                  },
                ],
              },
              {
                "label": "Change of Equipment and/or Additional Equipment",
                "value": "Change of Equipment and/or Additional Equipment",
                "requirements": [
                  {
                    "key": "ship-station-license",
                    "title": "Ship Station License",
                    "required": true,
                  },
                  {
                    "key": "purchase-possess-permit",
                    "title": "Permit to Purchase/Possess",
                    "required": true
                  },
                  {
                    "key": "source-of-equipment-proof",
                    "title": "Copy of document indicating source of equipment:",
                    "description": "(a) For locally-sourced equipment, Official Receipt or Sales Invoice from authorized Radio Dealer, OR\n(b) For imported equipment, Copy of Invoice from the supplier AND Copy of Permit to Import, OR\n(c) For registered equipment, Copy of Permit to Possess",
                    "required": true
                  },
                ],
              },
            ],
            "serviceCode": "SSL",
            "sequenceCode": "MS",
          },
          {
            "label": "Ship Station License INTERNATIONAL Trade (RENEWAL)",
            "elements": [
            ],
            "formCode": "ntc1-04-SSL",
            "requirements": [
              {
                "key": "document",
                "title": "Ship Station License",
                "required": true,
              },
              {
                "key": "certificate-of-philippine-registry",
                "title": "Certificate of Philippine Registry (CPR) issued by the Maritime Industry Authority (MARINA)",
                "required": true,
              },
              {
                "key": "certificate-of-inclusion",
                "title": "Certificate of Inclusion from a Recognized Private Operating Agency or Accounting Authority (AA)",
                "required": true,
              },
              {
                "key": "maintenance-entity",
                "title": "Shore-Based Maintenance Entity (SBME) Agreement from duly accredited SBME",
                "required": true,
              },
              {
                "key": "general-operator-certificate",
                "title": "General Operator Certificate (GOC) of two (2) deck officers (i.e. First Officer, or Second Officer, or Third Officer)",
                "required": true,
              },
              {
                "key": "contract-of-employment",
                "title": "Copy of ANY of the following:",
                "description": "• Contract of Employment of the deck officers issued by the Philippine Overseas Employment Administration (POEA), OR\n• Certificate of Employment issued by Shipping Company",
                "required": true,
              },
            ],
            "serviceCode": "SSL",
            "sequenceCode": "MS",
          },
          {
            "label": "Ship Earth Station License INTERNATIONAL Trade (RENEWAL)",
            "elements": [
            ],
            "formCode": "ntc1-04-SSL",
            "requirements": [
              {
                "key": "document",
                "title": "Ship Earth Station License",
                "required": true,
              },
              {
                "key": "certificate-of-philippine-registry",
                "title": "Certificate of Philippine Registry (CPR) issued by the Maritime Industry Authority (MARINA)",
                "required": true,
              },
              {
                "key": "certificate-of-inclusion",
                "title": "Certificate of Inclusion from a Recognized Private Operating Agency or Accounting Authority (AA)",
                "required": true,
              },
              {
                "key": "maintenance-entity",
                "title": "Shore-Based Maintenance Entity (SBME) Agreement from duly accredited SBME",
                "required": true,
              },
              {
                "key": "general-operator-certificate",
                "title": "General Operator Certificate (GOC) of two (2) deck officers (i.e. First Officer, or Second Officer, or Third Officer)",
                "required": true,
              },
              {
                "key": "contract-of-employment",
                "title": "Copy of ANY of the following:",
                "description": "• Contract of Employment of the deck officers issued by the Philippine Overseas Employment Administration (POEA), OR\n• Certificate of Employment issued by Shipping Company",
                "required": true,
              },
            ],
            "serviceCode": "SSL",
            "sequenceCode": "MS",
          },
          {
            "label": "Ship Station License INTERNATIONAL Trade (MODIFICATION)",
            "elements": [
            ],
            "formCode": "ntc1-04-SSL",
            "requirements": [
              {
                "key": "ship-station-license",
                "title": "Ship Station License",
                "required": true,
              },
            ],
            "modificationDueTos": [
              {
                "label": "Others",
                "value": "Others",
                "hasSpecification": true,
              },
            ],
            "serviceCode": "SSL",
            "sequenceCode": "MS",
          },
          {
            "label": "Ship Earth Station License INTERNATIONAL Trade (MODIFICATION)",
            "elements": [
            ],
            "formCode": "ntc1-04-SSL",
            "requirements": [
              {
                "key": "ship-earth-station-license",
                "title": "Ship Station License",
                "required": true,
              },
            ],
            "modificationDueTos": [
              {
                "label": "Others",
                "value": "Others",
                "hasSpecification": true,
              },
            ],
            "serviceCode": "SSL",
            "sequenceCode": "MS",
          },
          {
            "label": "Private Coastal Station License (NEW)",
            "elements": [
            ],
            "formCode": "ntc1-11-coastal",
            "requirements": [
              {
                "key": "purchase-possess-permit",
                "title": "Permit to Purchase/Possess",
                "required": true,
              },
              {
                "key": "roc",
                "title": "Radio Operator Certificate",
                "description": "(at least 2nd Class Radiotelephone Operator)",
                "required": true,
              },
              {
                "key": "certificate-of-employment",
                "title": "Certificate of Employment",
                "required": true,
              },
              {
                "key": "source-of-equipment-proof",
                "title": "Copy of document indicating source of equipment:",
                "description": "(a) For locally-sourced equipment, Official Receipt or Sales Invoice from authorized Radio Dealer, OR\n(b)For imported equipment, Copy of Invoice from the supplier AND Copy of Permit to Import\n(c) For registered equipment, Copy of Permit to Possess",
                "required": true,
              },
              {
                "key": "ntc-inspection-report",
                "title": "NTC Inspection Report of the subject radio station", "link": "https://raw.githubusercontent.com/edward1986/edge-document/refs/heads/main/Sworn%20Statement%20and%20Declaration%20Form.pdf", "description": 'Download the "SWORN STATEMENT and DECLARATION" Form',
                // "required": true,
              },
            ],
            "serviceCode": "COASTAL",
            "sequenceCode": "MS",
          },
          {
            "label": "Private Coastal Station License (RENEWAL)",
            "elements": [
            ],
            "formCode": "ntc1-11-coastal",
            "requirements": [
              {
                "key": "document",
                "title": "Radio Station License",
                "required": true,
              },
              {
                "key": "roc",
                "title": "Radio Operator Certificate",
                "description": "(at least 2nd Class Radiotelephone Operator)",
                "required": true,
              },
              {
                "key": "certificate-of-employment",
                "title": "Certificate of Employment",
                "required": true,
              },
              {
                "key": "ntc-inspection-report",
                "title": "NTC Inspection Report of the subject radio station", "link": "https://raw.githubusercontent.com/edward1986/edge-document/refs/heads/main/Sworn%20Statement%20and%20Declaration%20Form.pdf", "description": 'Download the "SWORN STATEMENT and DECLARATION" Form',
                // "required": true,
              },
            ],
            "serviceCode": "COASTAL",
            "sequenceCode": "MS",
          },
          {
            "label": "Private Coastal Station License (MODIFICATION)",
            "elements": [
            ],
            "formCode": "ntc1-11-coastal",
            "requirements": [
              {
                "key": "rsl",
                "title": "Radio Station License",
                "required": true,
              },
              {
                "key": "ntc-inspection-report",
                "title": "NTC Inspection Report of the subject radio station", "link": "https://raw.githubusercontent.com/edward1986/edge-document/refs/heads/main/Sworn%20Statement%20and%20Declaration%20Form.pdf", "description": 'Download the "SWORN STATEMENT and DECLARATION" Form',
                // "required": true,
              }
            ],
            "modificationDueTos": [
              {
                "label": "Change of Licensee",
                "value": "Change of Licensee",
                "requirements": [
                  {
                    "key": "rsl",
                    "title": "Radio Station License",
                    "required": true,
                  },
                  {
                    "key": "registration-id",
                    "title": "Copy of ANY of the following:",
                    "description": "• SEC Registration\n• DTI Registration\n• Business/Mayor's Permit",
                    "required": true,
                  },
                  {
                    "key": "ntc-inspection-report",
                    "title": "NTC Inspection Report of the subject radio station", "link": "https://raw.githubusercontent.com/edward1986/edge-document/refs/heads/main/Sworn%20Statement%20and%20Declaration%20Form.pdf", "description": 'Download the "SWORN STATEMENT and DECLARATION" Form',
                    // "required": true,
                  }
                ],
              },
              {
                "label": "Change of Equipment and/or Additional Equipment",
                "value": "Change of Equipment and/or Additional Equipment",
                "requirements": [
                  {
                    "key": "rsl",
                    "title": "Radio Station License",
                    "required": true,
                  },
                  {
                    "key": "purchase-possess-permit",
                    "title": "Permit to Purchase/Possess",
                    "required": true
                  },
                  {
                    "key": "source-of-equipment-proof",
                    "title": "Copy of document indicating source of equipment:",
                    "description": "(a) For locally-sourced equipment, Official Receipt or Sales Invoice from authorized Radio Dealer, OR\n(b) For imported equipment, Copy of Invoice from the supplier AND Copy of Permit to Import, OR\n(c) For registered equipment, Copy of Permit to Possess",
                    "required": true
                  },
                  {
                    "key": "ntc-inspection-report",
                    "title": "NTC Inspection Report of the subject radio station", "link": "https://raw.githubusercontent.com/edward1986/edge-document/refs/heads/main/Sworn%20Statement%20and%20Declaration%20Form.pdf", "description": 'Download the "SWORN STATEMENT and DECLARATION" Form',
                    // "required": true,
                  }
                ],
              },
            ],
            "serviceCode": "COASTAL",
            "sequenceCode": "MS",
          },
          {
            "label": "Public Coastal Station License (NEW)",
            "elements": [
            ],
            "formCode": "ntc1-11-coastal",
            "requirements": [
              {
                "key": "purchase-possess-permit",
                "title": "Permit to Purchase/Possess",
                "required": true,
              },
              {
                "key": "source-of-equipment-proof",
                "title": "Copy of document indicating source of equipment:",
                "description": "(a) For locally-sourced equipment, Official Receipt or Sales Invoice from authorized Radio Dealer, OR\n(b)For imported equipment, Copy of Invoice from the supplier AND Copy of Permit to Import\n(c) For registered equipment, Copy of Permit to Possess",
                "required": true,
              },
              {
                "key": "roc",
                "title": "Radio Operator Certificate",
                "description": "(at least 2nd Class Radiotelephone Operator)",
                "required": true,
              },
              {
                "key": "certificate-of-employment",
                "title": "Certificate of Employment",
                "required": true,
              },
            ],
            "serviceCode": "PUB-COASTAL",
            "sequenceCode": "MS",
          },
          {
            "label": "Public Coastal Station License (RENEWAL)",
            "elements": [
            ],
            "formCode": "ntc1-11-coastal",
            "requirements": [
              {
                "key": "document",
                "title": "Radio Station License",
                "required": true,
              },
              {
                "key": "roc",
                "title": "Radio Operator Certificate",
                "description": "(at least 2nd Class Radiotelephone Operator)",
                "required": true,
              },
              {
                "key": "certificate-of-employment",
                "title": "Certificate of Employment",
                "required": true,
              },
            ],
            "serviceCode": "PUB-COASTAL",
            "sequenceCode": "MS",
          },
          {
            "label": "Public Coastal Station License (MODIFICATION)",
            "elements": [
            ],
            "formCode": "ntc1-11-coastal",
            "requirements": [
              {
                "key": "rsl",
                "title": "Radio Station License",
                "required": true,
              },
            ],
            "modificationDueTos": [
              {
                "label": "Change of Licensee",
                "value": "Change of Licensee",
                "requirements": [
                  {
                    "key": "rsl",
                    "title": "Radio Station License",
                    "required": true,
                  },
                  {
                    "key": "registration-id",
                    "title": "Copy of ANY of the following:",
                    "description": "• SEC Registration\n• DTI Registration\n• Business/Mayor's Permit",
                    "required": true,
                  },
                ],
              },
              {
                "label": "Change of Equipment and/or Additional Equipment",
                "value": "Change of Equipment and/or Additional Equipment",
                "requirements": [
                  {
                    "key": "rsl",
                    "title": "Radio Station License",
                    "required": true,
                  },
                  {
                    "key": "purchase-possess-permit",
                    "title": "Permit to Purchase/Possess",
                    "required": true
                  },
                  {
                    "key": "source-of-equipment-proof",
                    "title": "Copy of document indicating source of equipment:",
                    "description": "(a) For locally-sourced equipment, Official Receipt or Sales Invoice from authorized Radio Dealer, OR\n(b) For imported equipment, Copy of Invoice from the supplier AND Copy of Permit to Import, OR\n(c) For registered equipment, Copy of Permit to Possess",
                    "required": true
                  },
                ],
              },
              {
                "label": "Change of Location",
                "value": "Change of Location",
                "requirements": [
                  {
                    "key": "rsl",
                    "title": "Radio Station License",
                    "required": true,
                  },
                  {
                    "key": "engineering-plans",
                    "title": "Engineering Plans signed and sealed by a duly licensed Professional Electronics Engineer (PECE), to wit:",
                    "description": "1. Network Diagram indicating locations of all stations and the proposed frequency band\n2. Map showing exact location (Region, Province, City/Municipality, Barangay) of all stations with geographical coordinates (Longitude/Latitude in Degrees/Minutes/Seconds)\n3. Antenna System Plan (Type, Gain, Diameter, Beamwidth, Azimuth, Height Above Ground, Polarization)",
                    "required": true,
                  },
                ],
              },
            ],
            "serviceCode": "PUB-COASTAL",
            "sequenceCode": "MS",
          },
        ]
      },
      {
        "_id": "61d400d8ad8d7aee9ee5f617",
        "createdAt": "2021-12-09T08:40:51.624Z",
        "name": "Licenses for Government and Private Radio Stations in the Fixed and Land Mobile Service",
        "serviceCode": "service-9",
        "about": {
          "heading": "Licenses for Government and Private Radio Stations in the Fixed and Land Mobile Service",
          "description": "A Radio Station License is a written authority issued by the Commission to an individual, private and government entities authorizing the holder thereof to operate a radio station.\n\nThe RENEWAL of a Radio Station License is required from an individual or private or government entities for the continuous operation of an existing radio station.\n\nThe MODIFICATION of a Radio Station License is required from the Commission to an individual, private and government entities for changes in the particulars indicated in the License.",
          "whoMayAvail": [
            {
              "title": "Individuals and Private and Government Entities"
            },
          ]
        },
        "applicationTypes": [
          {
            "label": "Radio Station License (NEW)",
            "elements": [
            ],
            "formCode": "ntc1-11-RSL",
            "requirements": [
              {
                "key": "purchase-possess-permit",
                "title": "Permit to Purchase/Possess",
                "required": true
              },
              {
                "key": "roc",
                "title": "Appropriate and valid Radio Operator Certificate",
                "required": false,
              },
              {
                "key": "engineering-plans",
                "title": "Engineering Plans signed and sealed by a duly licensed Professional Electronics Engineer (PECE), to wit:",
                "description": "1. Network Diagram indicating locations of all stations and the proposed frequency band\n2. Map showing exact location (Region, Province, City/Municipality, Barangay) of all stations with geographical coordinates (Longitude/Latitude in Degrees/Minutes/Seconds)\n3. Antenna System Plan (Type, Gain, Diameter, Beamwidth, Azimuth, Height Above Ground, Polarization)",
                "required": true,
              },
              {
                "key": "source-of-equipment-proof",
                "title": "Copy of document indicating source of equipment:",
                "description": "(a) For locally-sourced equipment, Official Receipt or Sales Invoice from authorized Radio Dealer, OR\n(b) For imported equipment, Copy of Invoice from the supplier AND Copy of Permit to Import, OR\n(c) For registered equipment, Copy of Permit to Possess",
                "required": true
              },
              {
                "key": "official-receipt",
                "title": "For land mobile station:",
                "description": "Vehicle's valid OR/CR",
              },
            ],
            "serviceCode": "RSL",
            "sequenceCode": "FX",
          },
          {
            "label": "Radio Station License (RENEWAL)",
            "elements": [
            ],
            "formCode": "ntc1-11-RSL",
            "requirements": [
              {
                "key": "document",
                "title": "Radio Station License",
                "required": true
              },
              {
                "key": "roc",
                "title": "Appropriate and valid Radio Operator Certificate",
                "required": false,
              },
            ],
            "serviceCode": "RSL",
            "sequenceCode": "FX",
          },
          {
            "label": "Radio Station License (MODIFICATION)",
            "elements": [
            ],
            "formCode": "ntc1-11-RSL",
            "requirements": [
              {
                "key": "rsl",
                "title": "Radio Station License",
                "required": true
              },
            ],
            "modificationDueTos": [
              {
                "label": "Change of Location beyond 500 meters from the original location",
                "value": "Change of Location beyond 500 meters from the original location",
                "requirements": [
                  {
                    "key": "rsl",
                    "title": "Radio Station License",
                    "required": true
                  },
                  {
                    "key": "engineering-plans",
                    "title": "Engineering Plans signed and sealed by a duly licensed Professional Electronics",
                    "required": true
                  },
                ],
              },
              {
                "label": "Change of Mode of Transmission",
                "value": "Change of Mode of Transmission",
                "requirements": [
                  {
                    "key": "rsl",
                    "title": "Radio Station License",
                    "required": true
                  },
                  {
                    "key": "engineering-plans",
                    "title": "Engineering Plans signed and sealed by a duly licensed Professional Electronics",
                    "required": true
                  },
                ],
              },
              {
                "label": "Change of Point(s) of Communications and Service Area",
                "value": "Change of Point(s) of Communications and Service Area",
                "requirements": [
                  {
                    "key": "rsl",
                    "title": "Radio Station License",
                    "required": true
                  },
                  {
                    "key": "engineering-plans",
                    "title": "Engineering Plans signed and sealed by a duly licensed Professional Electronics",
                    "required": true
                  },
                ],
              },
              {
                "label": "Additional Base Station(s)",
                "value": "Additional Base Station(s)",
                "requirements": [
                  {
                    "key": "rsl",
                    "title": "Radio Station License",
                    "required": true
                  },
                  {
                    "key": "engineering-plans",
                    "title": "Engineering Plans signed and sealed by a duly licensed Professional Electronics",
                    "required": true
                  },
                ],
              },
              {
                "label": "Change of Vehicle",
                "value": "Change of Vehicle",
                "requirements": [
                  {
                    "key": "rsl",
                    "title": "Radio Station License",
                    "required": true
                  },
                  {
                    "key": "official-receipt",
                    "title": "Copy of valid OR/CR",
                    "required": true
                  },
                ],
              },
              {
                "label": "Change of Equipment and/or Additional Equipment",
                "value": "Change of Equipment and/or Additional Equipment",
                "requirements": [
                  {
                    "key": "rsl",
                    "title": "Radio Station License",
                    "required": true
                  },
                  {
                    "key": "purchase-possess-permit",
                    "title": "Permit to Purchase/Possess",
                    "required": true
                  },
                  {
                    "key": "source-of-equipment-proof",
                    "title": "Copy of document indicating source of equipment:",
                    "description": "(a) For locally-sourced equipment, Official Receipt or Sales Invoice from authorized Radio Dealer, OR\n(b) For imported equipment, Copy of Invoice from the supplier AND Copy of Permit to Import, OR\n(c) For registered equipment, Copy of Permit to Possess",
                    "required": true
                  },
                ],
              },
            ],
            "serviceCode": "RSL",
            "sequenceCode": "FX",
          },
        ]
      },
      {
        "_id": "61c400d8ad8d7afe8ee5f627",
        "createdAt": "2021-12-09T08:40:51.622Z",
        "name": "Other Radio Station Licenses/Services",
        "serviceCode": "service-8",
        "about": {
          "heading": "Radio Station License",
          "description": "The RENEWAL of a Radio Station License is required from the public telecommunications entity for the continuous operation of an existing radio station.\n\nThe MODIFICATION of a Radio Station License is required from the public telecommunications entity for changes in the particulars indicated in the License.",
          "whoMayAvail": [
            {
              "title": "Public Telecommunications Entities (PTEs)",
            },
            {
              "title": "Private and Government Entities",
            }
          ]
        },
        "applicationTypes": [
          {
            "label": "Radio Station License - Microwave (RENEWAL)",
            "elements": [
            ],
            "formCode": "ntc1-11-microwave",
            "requirements": [
              {
                "key": "document",
                "title": "Radio Station License",
                "required": true
              },
            ],
            "serviceCode": "RSL",
            "sequenceCode": "FX",
          },
          {
            "label": "Radio Station License - Microwave (MODIFICATION)",
            "elements": [
            ],
            "formCode": "ntc1-11-microwave",
            "requirements": [
              {
                "key": "rsl",
                "title": "Radio Station License",
                "required": true
              },
            ],
            "serviceCode": "RSL",
            "modificationDueTos": [
              {
                "label": "Others",
                "value": "Others",
                "hasSpecification": true,
              },
            ],
            "sequenceCode": "FX",
          },
          {
            "label": "Radio Station License - VSAT (RENEWAL)",
            "elements": [
            ],
            "formCode": "ntc1-11-vsat",
            "requirements": [
              {
                "key": "document",
                "title": "Radio Station License",
                "required": true
              },
            ],
            "serviceCode": "RSL",
            "sequenceCode": "FX",
          },
          {
            "label": "Radio Station License - VSAT (MODIFICATION)",
            "elements": [
            ],
            "formCode": "ntc1-11-vsat",
            "requirements": [
              {
                "key": "rsl",
                "title": "Radio Station License",
                "required": true
              },
            ],
            "modificationDueTos": [
              {
                "label": "Others",
                "value": "Others",
                "hasSpecification": true,
              },
            ],
            "serviceCode": "RSL",
            "sequenceCode": "FX",
          },
          {
            "label": "Radio Station License - Public Trunked (RENEWAL)",
            "elements": [
            ],
            "formCode": "ntc1-11-public-trunked",
            "requirements": [
              {
                "key": "document",
                "title": "Radio Station License",
                "required": true
              },
            ],
            "serviceCode": "RSL",
            "sequenceCode": "FX",
          },
          {
            "label": "Radio Station License - Public Trunked (MODIFICATION)",
            "elements": [
            ],
            "formCode": "ntc1-11-public-trunked",
            "requirements": [
              {
                "key": "rsl",
                "title": "Radio Station License",
                "required": true
              },
            ],
            "modificationDueTos": [
              {
                "label": "Others",
                "value": "Others",
                "hasSpecification": true,
              },
            ],
            "serviceCode": "RSL",
            "sequenceCode": "FX",
          },
          {
            "label": "Radio Station License - BWA (RENEWAL)",
            "elements": [
            ],
            "formCode": "ntc1-11-bwa",
            "requirements": [
              {
                "key": "document",
                "title": "Radio Station License",
                "required": true
              },
            ],
            "serviceCode": "RSL",
            "sequenceCode": "FX",
          },
          {
            "label": "Radio Station License - BWA (MODIFICATION)",
            "elements": [
            ],
            "formCode": "ntc1-11-bwa",
            "requirements": [
              {
                "key": "rsl",
                "title": "Radio Station License",
                "required": true
              },
            ],
            "modificationDueTos": [
              {
                "label": "Others",
                "value": "Others",
                "hasSpecification": true,
              },
            ],
            "serviceCode": "RSL",
            "sequenceCode": "FX",
          },
          {
            "label": "Radio Station License - WDN (NEW)",
            "elements": [
            ],
            "formCode": "ntc1-11-wdn",
            "requirements": [
              {
                "key": "rsl",
                "title": "Radio Station License",
                "required": true
              },
            ],
            "serviceCode": "RSL",
            "sequenceCode": "FX",
          },
          {
            "label": "Radio Station License - WDN (RENEWAL)",
            "elements": [
            ],
            "formCode": "ntc1-11-wdn",
            "requirements": [
              {
                "key": "document",
                "title": "Radio Station License",
                "required": true
              },
            ],
            "serviceCode": "RSL",
            "sequenceCode": "FX",
          },
          {
            "label": "Radio Station License - WDN (MODIFICATION)",
            "elements": [
            ],
            "formCode": "ntc1-11-wdn",
            "requirements": [
              {
                "key": "rsl",
                "title": "Radio Station License",
                "required": true
              },
            ],
            "modificationDueTos": [
              {
                "label": "Others",
                "value": "Others",
                "hasSpecification": true,
              },
            ],
            "serviceCode": "RSL",
            "sequenceCode": "FX",
          },
          {
            "label": "Radio Station License - BTS (RENEWAL)",
            "elements": [
            ],
            "formCode": "ntc1-11-bts",
            "requirements": [
              {
                "key": "document",
                "title": "Radio Station License",
                "required": true
              },
            ],
            "serviceCode": "RSL",
            "sequenceCode": "FX",
          },
          {
            "label": "Radio Station License - BTS (MODIFICATION)",
            "elements": [
            ],
            "formCode": "ntc1-11-bts",
            "requirements": [
              {
                "key": "rsl",
                "title": "Radio Station License",
                "required": true
              },
            ],
            "modificationDueTos": [
              {
                "label": "Change of Equipment and/or Additional Equipment",
                "value": "Change of Equipment and/or Additional Equipment",
                "requirements": [
                  {
                    "key": "rsl",
                    "title": "Radio Station License",
                    "required": true
                  },
                  {
                    "key": "permit",
                    "title": "Copy of ANY of the following:",
                    "description": "• Permit to Purchase/Possess\n• Permit to Possess for Storage",
                  },
                ],
              },
            ],
            "serviceCode": "RSL",
            "sequenceCode": "FX",
          },
        ]
      },
      {
        "_id": "61c400d8ad8e7afe9ee6f627",
        "createdAt": "2021-12-09T09:51:51.721Z",
        "name": "TVRO/CATV Station License",
        "serviceCode": "service-17",
        "about": {
          "heading": "TVRO/CATV Station License",
          "description": "A TVRO Station License or CATV Station License is a written authority issued by the Commission to cable TV operators, private and government entities authorizing the holder thereof to operate a TVRO for commercial purposes or operate a CATV system.\n\nThe RENEWAL of a TVRO Station License or CATV Station License is required for the continuous operation of the subject station.",
          "whoMayAvail": [
            {
              "title": "Cable TV Operators and Private and Government Entities"
            },
          ]
        },
        "applicationTypes": [
          {
            "label": "TVRO Station License (NEW)",
            "elements": [],
            "formCode": "ntc1-22-license",
            "requirements": [
              {
                "key": "provisional-authority",
                "title": "Provisional Authority (PA) OR duly received Motion for Renewal of PA",
                "required": true,
              },
              {
                "key": "engineering-plans-and-diagrams",
                "title": "Engineering Plans and Diagrams signed and sealed by a duly licensed Professional Electronics Engineer (PECE), to wit:",
                "description": "Plan 1: Map showing the exact location of the TVRO station with geographical coordinates\nPlan 2: Block Diagram of the proposed TVRO system\nPlan 3: Antenna System (Type, Gain, Azimuth, Height Above Ground)",
                "required": true,
              },
              {
                "key": "head-end-equipment-list",
                "title": "List of Combiner, Satellite Receivers, Modulators, LNA/LNB and other Head-End Equipment",
                "description": "Prepared and signed by a duly licensed Professional Electronics Engineer (PECE) / Electronics Engineer (ECE)",
                "required": true,
              },
              {
                "key": "engineer-documents",
                "title": "Copy of the following:",
                "description": "Certificate of Employment and license of the Supervising PECE/ECE",
                "required": true,
              },
              {
                "key": "technician-documents",
                "title": "Copy of the following:",
                "description": "Certificate of Employment and ROC of radio technician",
                "required": true,
              },
            ],
            "serviceCode": "TVRO-RSL",
            "sequenceCode": "TVRO",
          },
          {
            "label": "TVRO Station License (RENEWAL)",
            "elements": [],
            "formCode": "ntc1-22-license",
            "requirements": [
              {
                "key": "document",
                "title": "TVRO Station License",
                "required": true,
              },
              {
                "key": "provisional-authority",
                "title": "Provisional Authority (PA) OR duly received Motion for Renewal of PA",
                "required": true,
              },
              {
                "key": "head-end-equipment-list",
                "title": "List of Combiner, Satellite Receivers, Modulators, LNA/LNB and other Head-End Equipment",
                "description": "Prepared and signed by a duly licensed Professional Electronics Engineer (PECE) / Electronics Engineer (ECE)",
                "required": true,
              },
              {
                "key": "engineer-documents",
                "title": "Copy of the following:",
                "description": "Certificate of Employment and license of the Supervising PECE/ECE",
                "required": true,
              },
              {
                "key": "technician-documents",
                "title": "Copy of the following:",
                "description": "Certificate of Employment and ROC of radio technician",
                "required": true,
              },
            ],
            "serviceCode": "TVRO-RSL",
            "sequenceCode": "TVRO",
          },
          {
            "label": "CATV Station License (NEW)",
            "elements": [],
            "formCode": "ntc1-22-license",
            "requirements": [
              {
                "key": "authority-certificate",
                "title": "Certificate of Authority (CA) OR duly received Motion for Renewal of CA",
                "required": true,
              },
              {
                "key": "engineering-plans",
                "title": "Engineering Plans",
                "description": "Signed and sealed by a duly licensed Professional Electronics Engineer (PECE)",
                "required": true,
              },
              {
                "key": "head-end-equipment-list",
                "title": "List of Combiner, Satellite Receivers, Modulators, LNA/LNB and other Head-End Equipment",
                "description": "Prepared and signed by a duly licensed Professional Electronics Engineer (PECE) / Electronics Engineer (ECE)",
                "required": true,
              },
              {
                "key": "engineer-documents",
                "title": "Copy of the following:",
                "description": "Certificate of Employment and license of the Supervising PECE/ECE",
                "required": true,
              },
              {
                "key": "technician-documents",
                "title": "Copy of the following:",
                "description": "Certificate of Employment and ROC of radio technician",
                "required": true,
              },
              {
                "key": "programs",
                "title": "List of Programs Offered - Channel, Program, and Signal Source",
                "required": true,
              }
            ],
            "serviceCode": "CATV",
          },
          {
            "label": "CATV Station License (RENEWAL)",
            "elements": [],
            "formCode": "ntc1-22-license",
            "requirements": [
              {
                "key": "document",
                "title": "CATV Station License",
                "required": true,
              },
              {
                "key": "authority-certificate",
                "title": "Certificate of Authority (CA) OR duly received Motion for Renewal of CA",
                "required": true,
              },
              {
                "key": "head-end-equipment-list",
                "title": "List of Combiner, Satellite Receivers, Modulators, LNA/LNB and other Head-End Equipment",
                "description": "Prepared and signed by a duly licensed Professional Electronics Engineer (PECE) / Electronics Engineer (ECE)",
                "required": true,
              },
              {
                "key": "engineer-documents",
                "title": "Copy of the following:",
                "description": "Certificate of Employment and license of the Supervising PECE/ECE",
                "required": true,
              },
              {
                "key": "technician-documents",
                "title": "Copy of the following:",
                "description": "Certificate of Employment and ROC of radio technician",
                "required": true,
              },
              {
                "key": "programs",
                "title": "List of Programs Offered - Channel, Program, and Signal Source",
                "required": true,
              }
            ],
            "serviceCode": "CATV",
          },
        ],
      },
      {
        "_id": "71c500e8ad8d7afe8ee5f629",
        "createdAt": "2021-12-09T09:41:51.656Z",
        "name": "Copy of Licenses",
        "serviceCode": "service-21",
        "about": {
          "heading": "Copy of Licenses",
          "description": "A Certified True Copy of a License is issued by the Commission to individuals, private and government entities upon request of the holder to authenticate copy of the same.\n\nA Duplicate Copy of a License is issued by the Commission to individuals, private and government entities upon request of the holder for the re-issuance of the same.",
          "whoMayAvail": [
            {
              "title": "Individuals"
            },
            {
              "title": "Private and Government Entities"
            },
          ]
        },
        "applicationTypes": [
          {
            "label": "Certified True Copy",
            "elements": [
            ],
            "formCode": "ntc1-ctc-license",
            "requirements": [
              {
                "key": "document",
                "title": "Copy of document to be authenticated",
                "required": true
              },
            ],
            "serviceCode": "CTC",
            "category": "license",
          },
          {
            "label": "Duplicate Copy",
            "elements": [
            ],
            "formCode": "ntc1-21-license",
            "requirements": [
              {
                "key": "copy-of-license",
                "title": "Copy of Permit:",
                "description": "A scanned or photocopied copy of the original Radio Operator Certificate."
              },
              {
                "key": "id-picture",
                "title": "For Radio Operator Certificate:",
                "description": "Please provide a clear 1x1 ID picture taken within the last six (6) months.",
              },
            ],
            "serviceCode": "DUP",
            "category": "license",
          },
        ]
      },
    ]
  },
  {
    title: 'Permits',
    key: 'permits',
    logo: require('@assets/services/permit.png'),
    data: [
      {
        "_id": "61c400d8ad8d7afe8ee5f617",
        "createdAt": "2021-12-09T08:40:51.621Z",
        "name": "Permits in the Amateur Service",
        "serviceCode": "service-3",
        "about": {
          "heading": "Permits in the Amateur Service",
          "description": "The Amateur Radio Station Permit is a written authority issued by the Commission to a person or a club authorizing the holder thereof to operate a class of radio station in the Amateur Service.\n\nThe RENEWAL of Amateur Radio Station Permit and/or Special Permit for the Use of Vanity Call Sign is/are required for the continuous operation of any class of radio stations in the Amateur Service.\n\nThe MODIFICATION of Amateur Radio Station Permit is required for changes in the particulars indicated in the Permit.",
          "whoMayAvail": [
            {
              "title": "Individuals who have passed the Amateur Radio Operator Examination conducted by NTC"
            },
            {
              "title": "Duly accredited amateur radio clubs"
            },
            {
              "title": "Foreign amateurs qualified under the reciprocity agreement"
            },
            {
              "title": "Licensed amateur radio operators"
            },
          ]
        },
        "applicationTypes": [
          {
            "label": "Amateur Radio Station Permit to PURCHASE",
            "elements": [
            ],
            "formCode": "ntc1-09-AT-pur",
            "requirements": [
              {
                "key": "amateur-roc-or-report-of-rating",
                "title": "For new Amateur Radio Station License:",
                "description": "(a) Valid Report of Rating, OR\n(b) Valid Amateur Radio Operator Certificate",
              },
              {
                "key": "amateur-rsl",
                "title": "For Change of Equipment and/or Additional Equipment:",
                "description": "Valid Amateur Radio Station License"
              },
            ],
            "serviceCode": "AT-RSL",
            "sequenceCode": "P/PUR",
          },
          {
            "label": "Amateur Radio Station Permit to POSSESS for STORAGE",
            "elements": [
            ],
            "formCode": "ntc1-09-AT",
            "requirements": [
              {
                "key": "amateur-roc-or-report-of-rating",
                "title": "For new Amateur Radio Station License:",
                "description": "(a) Valid Report of Rating, OR\n(b) Valid Amateur Radio Operator Certificate",
              },
              {
                "key": "amateur-rsl",
                "title": "For Change of Equipment and/or Additional Equipment:",
                "description": "Valid Amateur Radio Station License"
              },
            ],
            "serviceCode": "AT-RSL",
            "sequenceCode": "P/POS",
          },
          {
            "label": "Amateur Radio Station Permit to PURCHASE/POSSESS",
            "elements": [
            ],
            "formCode": "ntc1-09-AT-pur",
            "requirements": [
              {
                "key": "amateur-roc-or-report-of-rating",
                "title": "For new Amateur Radio Station License:",
                "description": "(a) Valid Report of Rating, OR\n(b) Valid Amateur Radio Operator Certificate",
              },
              {
                "key": "amateur-rsl",
                "title": "For Change of Equipment and/or Additional Equipment:",
                "description": "Valid Amateur Radio Station License"
              },
            ],
            "serviceCode": "AT-RSL"
          },
          {
            "label": "Amateur Radio Station Permit to SELL/TRANSFER",
            "elements": [
            ],
            "formCode": "ntc1-09-AT-Sell-Transfer",
            "requirements": [
              {
                "key": "seller-amateur-rsl",
                "title": "Amateur Radio Station License of the Seller"
              },
            ],
            "serviceCode": "AT-RSL"
          },
          {
            "label": "Temporary Permit to Operate an Amateur Radio Station - Foreign Visitor",
            "elements": [
              "Class A",
              "Class B",
              "Class C",
            ],
            "formCode": "ntc1-03-and-09",
            "requirements": [
              {
                "key": "letter-of-intent",
                "title": "Letter of Intent",
                "required": true,
              },
              {
                "key": "amateur-roc",
                "title": "Copy of valid Amateur Radio Operator Certificate issued by the country of citizenship",
                "required": true,
              },
              {
                "key": "same-privilige-amateur-country-proof",
                "title": "Any proof that his/her country provides the same privilege with the Filipino Amateurs",
                "required": true,
              },
              {
                "key": "endorsement",
                "title": "Endorsement from recognized national organization (i.e. Philippine Amateur Radio Association (PARA), Inc.)",
                "required": true,
              },
              {
                "key": "id-picture",
                "title": "Please provide a clear 1x1 ID picture taken within the last six (6) months.",
                "required": true
              },
            ],
            "serviceCode": "AT-TEMPORARY",
          },
          {
            "label": "Special Permit for the Use of Vanity Call Sign (NEW)",
            "elements": [],
            "formCode": "ntc1-03",
            "requirements": [
              {
                "key": "amateur-roc-or-license",
                "title": "Copy of valid Amateur Radio Operator Certificate or Amateur Radio Station License",
                "required": true,
              },
              {
                "key": "endorsement-or-ameteur-activities",
                "title": "ANY of the following:",
                "description": "• Endorsement from the Philippine Amateur Radio Association (PARA), Inc.; OR\n• Proof of ANY of the following radio amateur activities:\n   • DXCentury Club (DXCC) 5B awards\n   • Continental Champion for three (3) consecutive years of a major amateur radio contest\n   • DXpedition in any of the top twenty (20) Most Wanted DXCC entities",
                "required": true,
              },
            ],
            "serviceCode": "VANITY-AT"
          },
          {
            "label": "Special Permit for the Use of Vanity Call Sign (RENEWAL)",
            "elements": [],
            "formCode": "ntc1-03",
            "requirements": [
              {
                "key": "document",
                "title": "Copy of valid Amateur Radio Operator Certificate or Amateur Radio Station License",
                "required": true,
              },
              {
                "key": "special-permit",
                "title": "Special Permit",
                "required": true,
              },
            ],
            "serviceCode": "VANITY-AT"
          },
          {
            "label": "Special Permit for the Use of Special Event Call Sign",
            "elements": [],
            "formCode": "ntc1-03",
            "requirements": [
              {
                "key": "letter-request",
                "title": "Letter Request stating, among others, nature of event, duration of event, etc.",
                "required": true,
              },
              {
                "key": "amateur-roc-or-license",
                "title": "Copy of valid Amateur Radio Operator Certificate or Amateur Radio Station License",
                "required": true,
              },
            ],
            "serviceCode": "SPECIAL-EVENT-AT"
          },
        ]
      },
      {
        "_id": "61c400d8ad8d7afe9ee5f617",
        "createdAt": "2021-12-09T08:40:51.622Z",
        "name": "Permits in the Aeronautical Service",
        "serviceCode": "service-4",
        "about": {
          "heading": "Permits in the Aeronautical Service",
          "description": "A Permit to Purchase/Possess is a written authority issued by the Commission to an individual, private and government entities authorizing the holder thereof to purchase/acquire and/or possess/own a radio transceiver.",
          "whoMayAvail": [
            {
              "title": "Individuals and Private and Government Entities"
            },
          ]
        },
        "applicationTypes": [
          {
            "label": "Aeronautical Station Permit to PURCHASE",
            "elements": [
            ],
            "formCode": "ntc1-09-ASL-pur",
            "requirements": [
              // {
              //   "key": "aircraft-rsls",
              //   "title": "Valid Aircraft Station License(s)",
              // },
              {
                "key": "frequency-assignment-allocation",
                "title": "For new Aeronautical Fixed Station:",
                "description": "Frequency assignment/allocation issued by the Civil Aviation Authority of the Philippines (CAAP)",
              },
              // {
              //   "key": "rsl",
              //   "title": "For Change of Equipment and/or Additional Equipment for Fixed Aeronautical Station:",
              //   "description": "Valid Radio Station License",
              // },
            ],
            "serviceCode": "ASL",
            "sequenceCode": "P/PUR",
          },
          {
            "label": "Aeronautical Station Permit to POSSESS",
            "elements": [
            ],
            "formCode": "ntc1-09-ASL",
            "requirements": [
              {
                "key": "aircraft-rsls",
                "title": "Valid Aircraft Station License(s)",
              },
              {
                "key": "frequency-assignment-allocation",
                "title": "For new Aeronautical Fixed Station:",
                "description": "Frequency assignment/allocation issued by the Civil Aviation Authority of the Philippines (CAAP)",
              },
              // {
              //   "key": "rsl",
              //   "title": "For Change of Equipment and/or Additional Equipment for Fixed Aeronautical Station:",
              //   "description": "Valid Radio Station License",
              // },
            ],
            "serviceCode": "ASL",
            "sequenceCode": "P/POS",
          },
          {
            "label": "Aeronautical Station Permit to PURCHASE/POSSESS",
            "elements": [
            ],
            "formCode": "ntc1-09-ASL-pur",
            "requirements": [
              {
                "key": "aircraft-rsls",
                "title": "Valid Aircraft Station License(s)",
              },
              {
                "key": "frequency-assignment-allocation",
                "title": "For new Aeronautical Fixed Station:",
                "description": "Frequency assignment/allocation issued by the Civil Aviation Authority of the Philippines (CAAP)",
              },
              {
                "key": "rsl",
                "title": "For Change of Equipment and/or Additional Equipment for Fixed Aeronautical Station:",
                "description": "Valid Radio Station License",
              },
            ],
            "serviceCode": "ASL"
          },
          {
            "label": "Aeronautical Station Permit to SELL/TRANSFER",
            "elements": [
            ],
            "formCode": "ntc1-09-AT-Sell-Transfer",
            "requirements": [
              {
                "key": "seller-amateur-rsl",
                "title": "Aeronautical Station License of the Seller"
              },
            ],
            "serviceCode": "AT-RSL"
          },

          {
            "label": "Aircraft Station Permit to PURCHASE",
            "elements": [
            ],
            "formCode": "ntc1-09-ASL-pur",
            "requirements": [
              // {
              //   "key": "aircraft-rsls",
              //   "title": "Valid Aircraft Station License(s)",
              // },
              {
                "key": "frequency-assignment-allocation",
                "title": "For new Aeronautical Fixed Station:",
                "description": "Frequency assignment/allocation issued by the Civil Aviation Authority of the Philippines (CAAP)",
              },
              // {
              //   "key": "rsl",
              //   "title": "For Change of Equipment and/or Additional Equipment for Fixed Aeronautical Station:",
              //   "description": "Valid Radio Station License",
              // },
            ],
            "serviceCode": "ASL",
            "sequenceCode": "P/PUR",
          },
          {
            "label": "Aircraft Station Permit to POSSESS",
            "elements": [
            ],
            "formCode": "ntc1-09-ASL",
            "requirements": [
              {
                "key": "aircraft-rsls",
                "title": "Valid Aircraft Station License(s)",
              },
              {
                "key": "frequency-assignment-allocation",
                "title": "For new Aeronautical Fixed Station:",
                "description": "Frequency assignment/allocation issued by the Civil Aviation Authority of the Philippines (CAAP)",
              },
              // {
              //   "key": "rsl",
              //   "title": "For Change of Equipment and/or Additional Equipment for Fixed Aeronautical Station:",
              //   "description": "Valid Radio Station License",
              // },
            ],
            "serviceCode": "ASL",
            "sequenceCode": "P/POS",
          },
          {
            "label": "Aircraft Station Permit to PURCHASE/POSSESS",
            "elements": [
            ],
            "formCode": "ntc1-09-ASL-pur",
            "requirements": [
              {
                "key": "aircraft-rsls",
                "title": "Valid Aircraft Station License(s)",
              },
              {
                "key": "frequency-assignment-allocation",
                "title": "For new Aeronautical Fixed Station:",
                "description": "Frequency assignment/allocation issued by the Civil Aviation Authority of the Philippines (CAAP)",
              },
              {
                "key": "rsl",
                "title": "For Change of Equipment and/or Additional Equipment for Fixed Aeronautical Station:",
                "description": "Valid Radio Station License",
              },
            ],
            "serviceCode": "ASL"
          },
          {
            "label": "Aircraft Station Permit to SELL/TRANSFER",
            "elements": [
            ],
            "formCode": "ntc1-09-AT-Sell-Transfer",
            "requirements": [
              {
                "key": "seller-amateur-rsl",
                "title": "Aeronautical Station License of the Seller"
              },
            ],
            "serviceCode": "AT-RSL"
          },
        ]
      },
      {
        "_id": "61d400d8ad8d7afe9ee5f617",
        "createdAt": "2021-12-09T08:40:51.623Z",
        "name": "Permits in the Maritime Service",
        "serviceCode": "service-5",
        "about": {
          "heading": "Permits in the Maritime Service",
          "description": "A Permit to Purchase/Possess is a written authority issued by the Commission to a public telecommunications entity (PTEs) authorizing the holder thereof to purchase/acquire and/or possess/own a radio transceiver.",
          "whoMayAvail": [
            {
              "title": "Individuals and Private and Government Entities"
            },
            {
              "title": "Public Telecommunications Entities (PTEs) who are authorized to engage in public maritime communications service"
            }
          ]
        },
        "applicationTypes": [
          {
            "label": "Ship Station Permit to PURCHASE (DOMESTIC Trade)",
            "elements": [
            ],
            "formCode": "ntc1-09-MS-pur",
            "requirements": [
              {
                "key": "ship-id",
                "title": "Copy of ANY of the following:",
                "description": "• Certificate of Vessel Registry and Certificate of Ownership issued by the Maritime Industry Authority (MARINA)\n• Permit issued by the Local Government Unit (LGU)\n• Ship Station License",
                "required": true,
              },
            ],
            "serviceCode": "SSL",
            "sequenceCode": "P/PUR",
          },
          {
            "label": "Ship Station Permit to POSSESS (DOMESTIC Trade)",
            "elements": [
            ],
            "formCode": "ntc1-09-MS-pos",
            "requirements": [
              {
                "key": "ship-id",
                "title": "Copy of ANY of the following:",
                "description": "• Certificate of Vessel Registry and Certificate of Ownership issued by the Maritime Industry Authority (MARINA)\n• Permit issued by the Local Government Unit (LGU)\n• Ship Station License",
                "required": true,
              },
            ],
            "serviceCode": "SSL",
            "sequenceCode": "P/POS",
          },
          {
            "label": "Ship Station Permit to POSSESS (Storage)",
            "elements": [
            ],
            "formCode": "ntc1-09-GOVTPVT-pos-storage",
            "requirements": [
              {
                "key": "rsl",
                "title": "Radio Station Permit",
                "required": true,
              },
            ],
            "serviceCode": "RS-SRO",
            "sequenceCode": "P/POS",
          },
          {
            "label": "Ship Station Permit to PURCHASE/POSSESS (DOMESTIC Trade)",
            "elements": [
            ],
            "formCode": "ntc1-09-MS-pur",
            "requirements": [
              {
                "key": "ship-id",
                "title": "Copy of ANY of the following:",
                "description": "• Certificate of Vessel Registry and Certificate of Ownership issued by the Maritime Industry Authority (MARINA)\n• Permit issued by the Local Government Unit (LGU)\n• Ship Station License",
                "required": true,
              },
            ],
            "serviceCode": "SSL",
          },
          {
            "label": "Ship Station Permit to SELL/TRANSFER",
            "elements": [
            ],
            "formCode": "ntc1-09-AT-Sell-Transfer",
            "requirements": [
              {
                "key": "seller-amateur-rsl",
                "title": "Ship Station License of the Seller"
              },
            ],
            "serviceCode": "AT-RSL"
          },
          {
            "label": "Private Coastal Station Permit to PURCHASE",
            "elements": [
            ],
            "formCode": "ntc1-09-MS-pur",
            "requirements": [
              {
                "key": "ship-station-license",
                "title": "Ship Station License(s) for ship(s) engaged in Domestic Trade",
                "required": true,
              },
            ],
            "serviceCode": "COASTAL",
            "sequenceCode": "P/PUR",
          },
          {
            "label": "Private Coastal Station Permit to POSSESS",
            "elements": [
            ],
            "formCode": "ntc1-09-MS-pos",
            "requirements": [
              {
                "key": "ship-station-license",
                "title": "Ship Station License(s) for ship(s) engaged in Domestic Trade",
                "required": true,
              },
            ],
            "serviceCode": "COASTAL",
            "sequenceCode": "P/POS",
          },
          {
            "label": "Private Coastal Station Permit to PURCHASE/POSSESS",
            "elements": [
            ],
            "formCode": "ntc1-09-MS-pur",
            "requirements": [
              {
                "key": "ship-station-license",
                "title": "Ship Station License(s) for ship(s) engaged in Domestic Trade",
                "required": true,
              },
            ],
            "serviceCode": "COASTAL",
          },
          {
            "label": "Public Coastal Station Permit to PURCHASE",
            "elements": [
            ],
            "formCode": "ntc1-09-MS-pur",
            "requirements": [
              {
                "key": "engineering-plans",
                "title": "Engineering Plans signed and sealed by a duly licensed Professional Electronics Engineer (PECE), to wit:",
                "description": "1. Network Diagram indicating locations of all stations and the proposed frequency band\n2. Map showing exact location (Region, Province, City/Municipality, Barangay) of all stations with geographical coordinates (Longitude/Latitude in Degrees/Minutes/Seconds)\n3. Antenna System Plan (Type, Gain, Diameter, Beamwidth, Azimuth, Height Above Ground, Polarization)",
                "required": true,
              },
              {
                "key": "provisional-authority-or-certificate-of-public-convenience-and-necessity",
                "title": "Copy of ANY of the following:",
                "description": "• Provisional Authority\n• Certificate of Public Convenience and Necessity",
                "required": true,
              },
            ],
            "serviceCode": "PUB-COASTAL",
            "sequenceCode": "P/PUR",
          },
          {
            "label": "Public Coastal Station Permit to POSSESS",
            "elements": [
            ],
            "formCode": "ntc1-09-MS-pos",
            "requirements": [
              {
                "key": "engineering-plans",
                "title": "Engineering Plans signed and sealed by a duly licensed Professional Electronics Engineer (PECE), to wit:",
                "description": "1. Network Diagram indicating locations of all stations and the proposed frequency band\n2. Map showing exact location (Region, Province, City/Municipality, Barangay) of all stations with geographical coordinates (Longitude/Latitude in Degrees/Minutes/Seconds)\n3. Antenna System Plan (Type, Gain, Diameter, Beamwidth, Azimuth, Height Above Ground, Polarization)",
                "required": true,
              },
              {
                "key": "provisional-authority-or-certificate-of-public-convenience-and-necessity",
                "title": "Copy of ANY of the following:",
                "description": "• Provisional Authority\n• Certificate of Public Convenience and Necessity",
                "required": true,
              },
            ],
            "serviceCode": "PUB-COASTAL",
            "sequenceCode": "P/POS",
          },
          {
            "label": "Public Coastal Station Permit to PURCHASE/POSSESS",
            "elements": [
            ],
            "formCode": "ntc1-09-MS-pur",
            "requirements": [
              {
                "key": "engineering-plans",
                "title": "Engineering Plans signed and sealed by a duly licensed Professional Electronics Engineer (PECE), to wit:",
                "description": "1. Network Diagram indicating locations of all stations and the proposed frequency band\n2. Map showing exact location (Region, Province, City/Municipality, Barangay) of all stations with geographical coordinates (Longitude/Latitude in Degrees/Minutes/Seconds)\n3. Antenna System Plan (Type, Gain, Diameter, Beamwidth, Azimuth, Height Above Ground, Polarization)",
                "required": true,
              },
              {
                "key": "provisional-authority-or-certificate-of-public-convenience-and-necessity",
                "title": "Copy of ANY of the following:",
                "description": "• Provisional Authority\n• Certificate of Public Convenience and Necessity",
                "required": true,
              },
            ],
            "serviceCode": "PUB-COASTAL",
          },
          {
            "label": "Public Coastal Station Permit to SELL/TRANSFER",
            "elements": [
            ],
            "formCode": "ntc1-09-AT-Sell-Transfer",
            "requirements": [
              {
                "key": "seller-amateur-rsl",
                "title": "Public Coastal Station License of the Seller"
              },
            ],
            "serviceCode": "AT-RSL"
          },
        ]
      },
      {
        "_id": "61d400d8ad8d7aee9ee5f617",
        "createdAt": "2021-12-09T08:40:51.624Z",
        "name": "Permits for Government and Private Radio Stations in the Fixed and Land Mobile Service",
        "serviceCode": "service-9",
        "about": {
          "heading": "Permits for Government and Private Radio Stations in the Fixed and Land Mobile Service",
          "description": "A Permit to Purchase/Possess is a written authority issued by the Commission to an individual or private or government entities authorizing the holder thereof to purchase/acquire and/or possess/own a radio transceiver.\n\nA Permit to Possess for Storage is a written authority issued by the Commission to an individual, private and government entities authorizing the storage of radio communications equipment.\n\nA Construction Permit is a written authority issued by the Commission to an individual, private and government entities authorizing the holder thereof to construct or install radio transceivers or radio station(s).",
          "whoMayAvail": [
            {
              "title": "Individuals and Private and Government Entities"
            },
          ]
        },
        "entityTypes": [

          {
            "key": "transponder-lease-agreement-or-certificate",
            "label": "VSAT",
            "requirements": [
              {
                "key": "engineering-plans",
                "title": "Engineering Plans signed and sealed by a duly licensed Professional Electronics Engineer (PECE), to wit:",
                "description": "1. Network Diagram indicating locations of all stations and the proposed frequency band\n2. Map showing exact location (Region, Province, City/Municipality, Barangay) of all stations with geographical coordinates (Longitude/Latitude in Degrees/Minutes/Seconds)\n3. Antenna System Plan (Type, Gain, Diameter, Beamwidth, Azimuth, Height Above Ground, Polarization)",
                "required": true,
              },
              {
                "key": "link-budget-analysis",
                "title": "For Microwave Radio Link:",
                "description": "Link Budget Analysis",
                "required": true,
              },
              {
                "key": "proposed-radio-equipment-datasheet",
                "title": "For applications requiring new frequency assignment:",
                "description": "Datasheet of proposed radio equipment",
              },
              {
                "key": "transponder-lease-agreement-or-certificate",
                "title": "For VSAT, ANY of the following:", "required": true,
                "description": "• Copy of valid Transponder Lease Agreement (TLA) with any Philippine or International Satellite Operator\n• Certification of assigned transponder(s) with the following parameters: (i) Transponder ID/Number (ii) Center Frequency (Uplink/Downlink), (iii) Bandwidth, (iv) Polarization (Uplink/Downlink)",
              },
            ],
          },
          {
            "key": "registration-id",
            "label": "Private Entities",
            "requirements": [
              {
                "key": "engineering-plans",
                "title": "Engineering Plans signed and sealed by a duly licensed Professional Electronics Engineer (PECE), to wit:",
                "description": "1. Network Diagram indicating locations of all stations and the proposed frequency band\n2. Map showing exact location (Region, Province, City/Municipality, Barangay) of all stations with geographical coordinates (Longitude/Latitude in Degrees/Minutes/Seconds)\n3. Antenna System Plan (Type, Gain, Diameter, Beamwidth, Azimuth, Height Above Ground, Polarization)",
                "required": true,
              },
              {
                "key": "link-budget-analysis",
                "title": "For Microwave Radio Link:",
                "description": "Link Budget Analysis",
                //"required": true,
              },
              {
                "key": "proposed-radio-equipment-datasheet",
                "title": "For applications requiring new frequency assignment:",
                "description": "Datasheet of proposed radio equipment",
              },
              {
                "key": "registration-id", "required": true,
                "title": "For Private Entities, ANY of the following:",
                "description": "• SEC Registration\n• DTI Registration\n• Business/Mayor's Permit",
              },
            ],
          },
          {
            "key": "civic-action-group-documents",
            "label": "Civic Action Groups",
            "requirements": [
              {
                "key": "engineering-plans",
                "title": "Engineering Plans signed and sealed by a duly licensed Professional Electronics Engineer (PECE), to wit:",
                "description": "1. Network Diagram indicating locations of all stations and the proposed frequency band\n2. Map showing exact location (Region, Province, City/Municipality, Barangay) of all stations with geographical coordinates (Longitude/Latitude in Degrees/Minutes/Seconds)\n3. Antenna System Plan (Type, Gain, Diameter, Beamwidth, Azimuth, Height Above Ground, Polarization)",
                "required": true,
              },
              {
                "key": "link-budget-analysis",
                "title": "For Microwave Radio Link:",
                "description": "Link Budget Analysis",
                "required": true,
              },
              {
                "key": "proposed-radio-equipment-datasheet",
                "title": "For applications requiring new frequency assignment:",
                "description": "Datasheet of proposed radio equipment",
              },
              {
                "required": true,
                "key": "civic-action-group-documents",
                "title": "For Civic Action Groups:",
                "description": "(a) Copy of SEC Registration, OR Copy of DTI Registration, OR Copy of valid Business/Mayor's Permit OR Copy of existing Radio Station License from national office of the Civic Action Group\n(b) List of Officers and at least 50 active Members\n(c) Copy of Memorandum of Agreement with the government & non-government organizations",
              },
            ],
          },
          {
            "key": "letter-of-intent",
            "label": "Government Entities",
            "requirements": [
              {
                "key": "engineering-plans",
                "title": "Engineering Plans signed and sealed by a duly licensed Professional Electronics Engineer (PECE), to wit:",
                "description": "1. Network Diagram indicating locations of all stations and the proposed frequency band\n2. Map showing exact location (Region, Province, City/Municipality, Barangay) of all stations with geographical coordinates (Longitude/Latitude in Degrees/Minutes/Seconds)\n3. Antenna System Plan (Type, Gain, Diameter, Beamwidth, Azimuth, Height Above Ground, Polarization)",
                "required": true,
              },
              {
                "key": "link-budget-analysis",
                "title": "For Microwave Radio Link:",
                "description": "Link Budget Analysis",
                //"required": true,
              },
              {
                "key": "proposed-radio-equipment-datasheet",
                "title": "For applications requiring new frequency assignment:",
                "description": "Datasheet of proposed radio equipment",
              },
              {
                "required": true,
                "key": "letter-of-intent",
                "title": "For Government Entities:",
                "description": "Letter of Intent duly signed by the head of the agency or his duly authorized representative stating, among others, the technical information and availability of funds to support the proposal",
              },
            ],
          },
        ],
        "applicationTypes": [
          {
            "label": "Permit to PURCHASE",
            "elements": [
            ],
            "formCode": "ntc1-09-GOVTPVT-pur",
            "requirements": [
              {
                "key": "engineering-plans",
                "title": "Engineering Plans signed and sealed by a duly licensed Professional Electronics Engineer (PECE), to wit:",
                "description": "1. Network Diagram indicating locations of all stations and the proposed frequency band\n2. Map showing exact location (Region, Province, City/Municipality, Barangay) of all stations with geographical coordinates (Longitude/Latitude in Degrees/Minutes/Seconds)\n3. Antenna System Plan (Type, Gain, Diameter, Beamwidth, Azimuth, Height Above Ground, Polarization)",
                "required": true,
              },
              {
                "key": "proposed-radio-equipment-datasheet",
                "title": "For applications requiring new frequency assignment:",
                "description": "Datasheet of proposed radio equipment",
              },
              {
                "key": "link-budget-analysis",
                "title": "For Microwave Radio Link:",
                "description": "Link Budget Analysis",
              },
              {
                "key": "transponder-lease-agreement-or-certificate",
                "title": "For VSAT, ANY of the following:",
                "description": "• Copy of valid Transponder Lease Agreement (TLA) with any Philippine or International Satellite Operator\n• Certification of assigned transponder(s) with the following parameters: (i) Transponder ID/Number (ii) Center Frequency (Uplink/Downlink), (iii) Bandwidth, (iv) Polarization (Uplink/Downlink)",
              },
              {
                "key": "registration-id",
                "title": "For Private Entities, ANY of the following:",
                "description": "• SEC Registration\n• DTI Registration\n• Business/Mayor's Permit",
              },
              {
                "key": "civic-action-group-documents",
                "title": "For Civic Action Groups:",
                "description": "(a) Copy of SEC Registration, OR Copy of DTI Registration, OR Copy of valid Business/Mayor's Permit OR Copy of existing Radio Station License from national office of the Civic Action Group\n(b) List of Officers and at least 50 active Members\n(c) Copy of Memorandum of Agreement with the government & non-government organizations",
              },
              {
                "key": "letter-of-intent",
                "title": "For Government Entities:",
                "description": "Letter of Intent duly signed by the head of the agency or his duly authorized representative stating, among others, the technical information and availability of funds to support the proposal",
              },
            ],
            "serviceCode": "RSL",
            "sequenceCode": "P/PUR",
          },
          {
            "label": "Permit to POSSESS",
            "elements": [
            ],
            "formCode": "ntc1-09-GOVTPVT-pos",

            "requirements": [
              {
                "key": "engineering-plans",
                "title": "Engineering Plans signed and sealed by a duly licensed Professional Electronics Engineer (PECE), to wit:",
                "description": "1. Network Diagram indicating locations of all stations and the proposed frequency band\n2. Map showing exact location (Region, Province, City/Municipality, Barangay) of all stations with geographical coordinates (Longitude/Latitude in Degrees/Minutes/Seconds)\n3. Antenna System Plan (Type, Gain, Diameter, Beamwidth, Azimuth, Height Above Ground, Polarization)",
                "required": true,
              },
              {
                "key": "proposed-radio-equipment-datasheet",
                "title": "For applications requiring new frequency assignment:",
                "description": "Datasheet of proposed radio equipment",
              },
              {
                "key": "link-budget-analysis",
                "title": "For Microwave Radio Link:",
                "description": "Link Budget Analysis",
              },
              {
                "key": "transponder-lease-agreement-or-certificate",
                "title": "For VSAT, ANY of the following:",
                "description": "• Copy of valid Transponder Lease Agreement (TLA) with any Philippine or International Satellite Operator\n• Certification of assigned transponder(s) with the following parameters: (i) Transponder ID/Number (ii) Center Frequency (Uplink/Downlink), (iii) Bandwidth, (iv) Polarization (Uplink/Downlink)",
              },
              {
                "key": "registration-id",
                "title": "For Private Entities, ANY of the following:",
                "description": "• SEC Registration\n• DTI Registration\n• Business/Mayor's Permit",
              },
              {
                "key": "civic-action-group-documents",
                "title": "For Civic Action Groups:",
                "description": "(a) Copy of SEC Registration, OR Copy of DTI Registration, OR Copy of valid Business/Mayor's Permit OR Copy of existing Radio Station License from national office of the Civic Action Group\n(b) List of Officers and at least 50 active Members\n(c) Copy of Memorandum of Agreement with the government & non-government organizations",
              },
              {
                "key": "letter-of-intent",
                "title": "For Government Entities:",
                "description": "Letter of Intent duly signed by the head of the agency or his duly authorized representative stating, among others, the technical information and availability of funds to support the proposal",
              },
            ],
            "serviceCode": "RSL",
            "sequenceCode": "P/POS",
          },
          {
            "label": "Permit to PURCHASE/POSSESS",
            "elements": [
            ],
            "formCode": "ntc1-09-GOVTPVT-pur-pos",
            "requirements": [
              {
                "key": "engineering-plans",
                "title": "Engineering Plans signed and sealed by a duly licensed Professional Electronics Engineer (PECE), to wit:",
                "description": "1. Network Diagram indicating locations of all stations and the proposed frequency band\n2. Map showing exact location (Region, Province, City/Municipality, Barangay) of all stations with geographical coordinates (Longitude/Latitude in Degrees/Minutes/Seconds)\n3. Antenna System Plan (Type, Gain, Diameter, Beamwidth, Azimuth, Height Above Ground, Polarization)",
                "required": true,
              },
              {
                "key": "proposed-radio-equipment-datasheet",
                "title": "For applications requiring new frequency assignment:",
                "description": "Datasheet of proposed radio equipment",
              },
              {
                "key": "link-budget-analysis",
                "title": "For Microwave Radio Link:",
                "description": "Link Budget Analysis",
              },
              {
                "key": "transponder-lease-agreement-or-certificate",
                "title": "For VSAT, ANY of the following:",
                "description": "• Copy of valid Transponder Lease Agreement (TLA) with any Philippine or International Satellite Operator\n• Certification of assigned transponder(s) with the following parameters: (i) Transponder ID/Number (ii) Center Frequency (Uplink/Downlink), (iii) Bandwidth, (iv) Polarization (Uplink/Downlink)",
              },
              {
                "key": "registration-id",
                "title": "For Private Entities, ANY of the following:",
                "description": "• SEC Registration\n• DTI Registration\n• Business/Mayor's Permit",
              },
              {
                "key": "civic-action-group-documents",
                "title": "For Civic Action Groups:",
                "description": "(a) Copy of SEC Registration, OR Copy of DTI Registration, OR Copy of valid Business/Mayor's Permit OR Copy of existing Radio Station License from national office of the Civic Action Group\n(b) List of Officers and at least 50 active Members\n(c) Copy of Memorandum of Agreement with the government & non-government organizations",
              },
              {
                "key": "letter-of-intent",
                "title": "For Government Entities:",
                "description": "Letter of Intent duly signed by the head of the agency or his duly authorized representative stating, among others, the technical information and availability of funds to support the proposal",
              },
            ],
            "serviceCode": "RSL",
          },
          {
            "label": "Permit to POSSESS for Storage",
            "elements": [
            ],
            "formCode": "ntc1-09-GOVTPVT-pos-storage",
            "requirements": [
              {
                "key": "rsl",
                "title": "Radio Station License",
                "required": true,
              },
            ],
            "serviceCode": "RS-SRO",
            "sequenceCode": "P/POS",
          },
          {
            "label": "Permit to SELL/TRANSFER",
            "elements": [
            ],
            "formCode": "ntc1-09-AT-Sell-Transfer",
            "requirements": [
              {
                "key": "seller-amateur-rsl",
                "title": "License of the Seller"
              },
            ],
            "serviceCode": "AT-RSL"
          },
          {
            "label": "Construction Permit (NEW)",
            "elements": [
            ],
            "formCode": "ntc1-11",
            "requirements": [
              {
                "key": "purchase-possess-permit",
                "title": "Permit to Purchase/Possess",
                "required": true
              },
              {
                "key": "roc",
                "title": "Appropriate and valid Radio Operator Certificate",
                "required": true,
              },
              {
                "key": "engineering-plans",
                "title": "Engineering Plans signed and sealed by a duly licensed Professional Electronics Engineer (PECE), to wit:",
                "description": "1. Network Diagram indicating locations of all stations and the proposed frequency band\n2. Map showing exact location (Region, Province, City/Municipality, Barangay) of all stations with geographical coordinates (Longitude/Latitude in Degrees/Minutes/Seconds)\n3. Antenna System Plan (Type, Gain, Diameter, Beamwidth, Azimuth, Height Above Ground, Polarization)",
                "required": true,
              },
              {
                "key": "source-of-equipment-proof",
                "title": "Copy of document indicating source of equipment:",
                "description": "(a) For locally-sourced equipment, Official Receipt or Sales Invoice from authorized Radio Dealer, OR\n(b) For imported equipment, Copy of Invoice from the supplier AND Copy of Permit to Import, OR\n(c) For registered equipment, Copy of Permit to Possess",
                "required": true
              },
              {
                "key": "official-receipt",
                "title": "For land mobile station:",
                "description": "Vehicle's valid OR/CR",
              },
            ],
            "serviceCode": "CP",
          },
          {
            "label": "Construction Permit (MODIFICATION)",
            "elements": [
            ],
            "formCode": "ntc1-13",
            "requirements": [
              {
                "key": "rsl",
                "title": "Radio Station License",
                "required": true
              },
            ],
            "modificationDueTos": [
              {
                "label": "Change of Location beyond 500 meters from the original location",
                "value": "Change of Location beyond 500 meters from the original location",
                "requirements": [
                  {
                    "key": "rsl",
                    "title": "Radio Station License",
                    "required": true
                  },
                  {
                    "key": "engineering-plans",
                    "title": "Engineering Plans signed and sealed by a duly licensed Professional Electronics",
                    "required": true
                  },
                ],
              },
              {
                "label": "Change of Mode of Transmission",
                "value": "Change of Mode of Transmission",
                "requirements": [
                  {
                    "key": "rsl",
                    "title": "Radio Station License",
                    "required": true
                  },
                  {
                    "key": "engineering-plans",
                    "title": "Engineering Plans signed and sealed by a duly licensed Professional Electronics",
                    "required": true
                  },
                ],
              },
              {
                "label": "Change of Point(s) of Communications and Service Area",
                "value": "Change of Point(s) of Communications and Service Area",
                "requirements": [
                  {
                    "key": "rsl",
                    "title": "Radio Station License",
                    "required": true
                  },
                  {
                    "key": "engineering-plans",
                    "title": "Engineering Plans signed and sealed by a duly licensed Professional Electronics",
                    "required": true
                  },
                ],
              },
              {
                "label": "Additional Base Station(s)",
                "value": "Additional Base Station(s)",
                "requirements": [
                  {
                    "key": "rsl",
                    "title": "Radio Station License",
                    "required": true
                  },
                  {
                    "key": "engineering-plans",
                    "title": "Engineering Plans signed and sealed by a duly licensed Professional Electronics",
                    "required": true
                  },
                ],
              },
              {
                "label": "Change of Vehicle",
                "value": "Change of Vehicle",
                "requirements": [
                  {
                    "key": "rsl",
                    "title": "Radio Station License",
                    "required": true
                  },
                  {
                    "key": "official-receipt",
                    "title": "Copy of valid OR/CR",
                    "required": true
                  },
                ],
              },
              {
                "label": "Change of Equipment and/or Additional Equipment",
                "value": "Change of Equipment and/or Additional Equipment",
                "requirements": [
                  {
                    "key": "rsl",
                    "title": "Radio Station License",
                    "required": true
                  },
                  {
                    "key": "purchase-possess-permit",
                    "title": "Permit to Purchase/Possess",
                    "required": true
                  },
                  {
                    "key": "source-of-equipment-proof",
                    "title": "Copy of document indicating source of equipment:",
                    "description": "(a) For locally-sourced equipment, Official Receipt or Sales Invoice from authorized Radio Dealer, OR\n(b) For imported equipment, Copy of Invoice from the supplier AND Copy of Permit to Import, OR\n(c) For registered equipment, Copy of Permit to Possess",
                    "required": true
                  },
                ],
              },
            ],
            "serviceCode": "CP",
          },
          {
            "label": "Temporary Permit to Demonstrate and Propagate",
            "elements": [
            ],
            "formCode": "ntc1-14",
            "requirements": [
              {
                "key": "engineering-plans",
                "title": "Engineering Plans signed and sealed by a duly licensed Professional Electronics Engineer (PECE), to wit:",
                "description": "1.Network Diagram indicating locations of all stations and the proposed frequency band\n2. Map showing exact location (Region, Province, City/ Municipality, Barangay) of all stations with geographical coordinates (Longitude/Latitude in Degrees/Minutes/Seconds)",
                "required": true
              },
              {
                "key": "datasheet",
                "title": "Datasheet of proposed radio equipment",
                "required": true
              },
              {
                "key": "transponder-lease-agreement",
                "title": "If VSAT Outdoor Unit will be utilized in the Demo:",
                "description": "Transponder Lease Agreement (TLA) with any satellite operator",
                // "required": true
              },
            ],
            "serviceCode": "RS-DEMO",
          },

        ]
      },
      {
        "_id": "61c400d8ad8d7afe8ee5f627",
        "createdAt": "2021-12-09T08:40:51.622Z",
        "name": "Permits for Public Telecommunications Entities (PTEs)",
        "serviceCode": "service-8",
        "about": {
          "heading": "Permits for Public Telecommunications Entities (PTEs)",
          "description": "A Permit to Possess for Storage is a written authority issued by the Commission to public telecommunications entities authorizing the storage of radio communications equipment.",
          "whoMayAvail": [
            {
              "title": "Public Telecommunications Entities (PTEs)"
            },
          ]
        },
        "applicationTypes": [
          {
            "label": "Permit to Possess for Storage (PTEs)",
            "elements": [
            ],
            "formCode": "ntc1-09-PTEs",
            "requirements": [
              {
                "key": "rsl",
                "title": "Radio Station License",
                "required": true
              },
            ],
            "serviceCode": "RSL"
          },
        ]
      },
      {
        "_id": "61c400e8ad8d7afe8ee5f627",
        "createdAt": "2021-12-09T08:40:51.626Z",
        "name": "Permits for Radio Communications Equipment",
        "serviceCode": "service-14",
        "about": {
          "heading": "Permits for Radio Communications Equipment",
          "description": "A Permit to Transport is a written authority issued by the Commission to an individual, private and government entities authorizing the holder thereof to transport radio communications equipment.\n\nAn Accreditation for Radio Communications Equipment (RCE) Dealer or RCE Manufacturer or RCE Service Center is a written authority issued by the Commission to a person, firm, company, association or corporation authorizing the holder thereof to engage in the acquisition and purchase/sale, or manufacture, or servicing and maintenance of radio communications equipment.",
          "whoMayAvail": [
            {
              "title": "Individuals and Private and Government Entities"
            },
          ]
        },
        "applicationTypes": [
          {
            "label": "Permit to Transport",
            "elements": [
            ],
            "formCode": "ntc1-16",
            "requirements": [
              {
                "key": "radio-communications-equipment-registration",
                "title": "Copy of ANY of the following:",
                "description": "• Permit to Purchase\n• Permit to Possess\n• Construction Permit/Radio Station License\n• Permit to Transfer\n• Radio Communication Equipment Dealer Permit",
                "required": true
              },
            ],
            "serviceCode": "RCE-PTR",
          },
          {
            "label": "Dealer Permit (NEW)",
            "elements": [
            ],
            "formCode": "ntc1-18-RCE",
            "requirements": [
              {
                "key": "registration-id",
                "title": "Copy of ANY of the following:",
                "description": "• SEC Registration\n• DTI Registration\n• Business/Mayor's Permit\n\nNote : The purpose of the company as indicated in its registration document must include information related to the accreditation applied for.",
                "required": true
              },
              {
                "key": "paid-up-capital",
                "title": "Proof of Paid-Up Capital",
                "description": "Minimum of PHP350,000",
                "required": true
              },
              {
                "key": "instruments",
                "title": "List of Test Equipment and Measuring Instruments",
                "description": "Refer to Section 6.1, M.C. No. 2-05-88\n\nNote: This requirement does not apply to WDN Indoor/SRD/RFID Dealers",
              },
              {
                "key": "technician-documents",
                "title": "Copy of the following:",
                "description": "Certificate of Employment and copy of valid license/ROC of at least one (1) qualified Radio Technician (Electronics Technician duly licensed by the Professional Regulation Commission OR a holder of a First Class Radiotelephone/ Radiotelegraph Certificate) employed on a full time basis\n\nNote: This requirement does not apply to WDN Indoor/SRD/RFID Dealers"
              },
              {
                "key": "engineer-documents",
                "title": "Copy of the following:",
                "description": "Certificate of Employment and copy of valid license of Supervising Electronics Engineer (ECE) or Professional Electronics Engineer (PECE)\n\nNote: This requirement does not apply to WDN Indoor/SRD/RFID Dealers",
              },
            ],
            "serviceCode": "RCE",
            "category": "dealer",
            "sequenceCode": "MP",
          },
          {
            "label": "Dealer Permit (RENEWAL)",
            "elements": [
            ],
            "formCode": "ntc1-18-RCE",
            "requirements": [
              {
                "key": "document",
                "title": "Radio Communication Equipment Dealer Permit",
                "required": true
              },
              {
                "key": "business-or-mayors-permit",
                "title": "Business/Mayor's Permit",
                "required": true
              },
              {
                "key": "technician-documents",
                "title": "Copy of the following:",
                "description": "Certificate of Employment and copy of valid license/ROC of at least one (1) qualified Radio Technician (Electronics Technician duly licensed by the Professional Regulation Commission OR a holder of a First Class Radiotelephone/ Radiotelegraph Certificate) employed on a full time basis\n\nNote: This requirement does not apply to WDN Indoor/SRD/RFID Dealers"
              },
              {
                "key": "engineer-documents",
                "title": "Copy of the following:",
                "description": "Certificate of Employment and copy of valid license of Supervising Electronics Engineer (ECE) or Professional Electronics Engineer (PECE)\n\nNote: This requirement does not apply to WDN Indoor/SRD/RFID Dealers",
              },
            ],
            "serviceCode": "RCE",
            "category": "dealer",
            "sequenceCode": "MP",
          },
          {
            "label": "Dealer Permit (MODIFICATION)",
            "elements": [
            ],
            "formCode": "ntc1-18-RCE",
            "requirements": [
              {
                "key": "radio-communication-equipment-permit",
                "title": "Radio Communication Equipment Dealer Permit",
                "required": true
              },
            ],
            "modificationDueTos": [
              {
                "label": "Change of Permittee",
                "value": "Change of Permittee",
                "requirements": [
                  {
                    "key": "radio-communication-equipment-permit",
                    "title": "Radio Communication Equipment Dealer Permit",
                    "required": true
                  },
                  {
                    "key": "registration-id",
                    "title": "Copy of ANY of the following:",
                    "description": "• SEC Registration\n• DTI Registration\n• Business/Mayor's Permit\n\nNote : The purpose of the company as indicated in its registration document must include information related to the accreditation applied for.",
                    "required": true
                  },
                ],
              },
              {
                "label": "Change of company address",
                "value": "Change of company address",
                "requirements": [
                  {
                    "key": "radio-communication-equipment-permit",
                    "title": "Radio Communication Equipment Dealer Permit",
                    "required": true
                  },
                  {
                    "key": "business-or-mayors-permit",
                    "title": "Business/Mayor's Permit",
                    "required": true
                  },
                ],
              },
            ],
            "serviceCode": "RCE",
            "category": "dealer",
            "sequenceCode": "MP",
          },
          {
            "label": "Manufacturer Permit (NEW)",
            "elements": [
            ],
            "formCode": "ntc1-18-RCE",
            "requirements": [
              {
                "key": "registration-id",
                "title": "Copy of ANY of the following:",
                "description": "• SEC Registration\n• DTI Registration\n• Business/Mayor's Permit\n\nNote : The purpose of the company as indicated in its registration document must include information related to the accreditation applied for.",
                "required": true
              },
              {
                "key": "paid-up-capital",
                "title": "Proof of Paid-Up Capital",
                "description": "Minimum of PHP1,000,000",
                "required": true
              },
              {
                "key": "instruments",
                "title": "List of Test Equipment and Measuring Instruments",
                "description": "Refer to Section 6.2, M.C. No. 2-05-88",
                "required": true,
              },
              {
                "key": "technician-documents",
                "title": "Copy of the following:",
                "description": "Certificate of Employment and copy of valid license/ROC of at least one (1) qualified Radio Technician (Electronics Technician duly licensed by the Professional Regulation Commission OR a holder of a First Class Radiotelephone/ Radiotelegraph Certificate) employed on a full time basis",
                "required": true,
              },
              {
                "key": "engineer-documents",
                "title": "Copy of the following:",
                "description": "Certificate of Employment and copy of valid license of supervising Professional Electronics Engineer (PECE)",
                "required": true,
              },
            ],
            "serviceCode": "RCE",
            "category": "manufacturer",
          },
          {
            "label": "Manufacturer Permit (RENEWAL)",
            "elements": [
            ],
            "formCode": "ntc1-18-RCE",
            "requirements": [
              {
                "key": "document",
                "title": "Radio Communication Equipment Manufacturer Permit",
                "required": true
              },
              {
                "key": "business-or-mayors-permit",
                "title": "Business/Mayor's Permit",
                "required": true
              },
              {
                "key": "technician-documents",
                "title": "Copy of the following:",
                "description": "Certificate of Employment and copy of valid license/ROC of at least one (1) qualified Radio Technician (Electronics Technician duly licensed by the Professional Regulation Commission OR a holder of a First Class Radiotelephone/ Radiotelegraph Certificate) employed on a full time basis",
                "required": true,
              },
              {
                "key": "engineer-documents",
                "title": "Copy of the following:",
                "description": "Certificate of Employment and copy of valid license of supervising Professional Electronics Engineer (PECE)",
                "required": true,
              },
            ],
            "serviceCode": "RCE",
            "category": "manufacturer",
          },
          {
            "label": "Manufacturer Permit (MODIFICATION)",
            "elements": [
            ],
            "formCode": "ntc1-18-RCE",
            "requirements": [
              {
                "key": "radio-communication-equipment-permit",
                "title": "Radio Communication Equipment Manufacturer Permit",
                "required": true
              },
            ],
            "modificationDueTos": [
              {
                "label": "Change of Permittee",
                "value": "Change of Permittee",
                "requirements": [
                  {
                    "key": "radio-communication-equipment-permit",
                    "title": "Radio Communication Equipment Manufacturer Permit",
                    "required": true
                  },
                  {
                    "key": "registration-id",
                    "title": "Copy of ANY of the following:",
                    "description": "• SEC Registration\n• DTI Registration\n• Business/Mayor's Permit\n\nNote : The purpose of the company as indicated in its registration document must include information related to the accreditation applied for.",
                    "required": true
                  },
                ],
              },
              {
                "label": "Change of company address",
                "value": "Change of company address",
                "requirements": [
                  {
                    "key": "radio-communication-equipment-permit",
                    "title": "Radio Communication Equipment Manufacturer Permit",
                    "required": true
                  },
                  {
                    "key": "business-or-mayors-permit",
                    "title": "Business/Mayor's Permit",
                    "required": true
                  },
                ],
              },
            ],
            "serviceCode": "RCE",
            "category": "manufacturer",
          },
          {
            "label": "Service Center Permit (NEW)",
            "elements": [
            ],
            "formCode": "ntc1-18",
            "requirements": [
              {
                "key": "registration-id",
                "title": "Copy of ANY of the following:",
                "description": "• SEC Registration\n• DTI Registration\n• Business/Mayor's Permit\n\nNote : The purpose of the company as indicated in its registration document must include information related to the accreditation applied for.",
                "required": true
              },
              {
                "key": "paid-up-capital",
                "title": "Proof of Paid-Up Capital",
                "description": "Minimum of PHP100,000",
                "required": true
              },
              {
                "key": "instruments",
                "title": "List of Test Equipment and Measuring Instruments",
                "description": "Refer to Section 6.1, M.C. No. 2-05-88",
                "required": true
              },
              {
                "key": "technician-documents",
                "title": "Copy of the following:",
                "description": "Certificate of Employment and copy of valid license/ROC of at least one (1) qualified Radio Technician (Electronics Technician duly licensed by the Professional Regulation Commission OR a holder of a First Class Radiotelephone/ Radiotelegraph Certificate) employed on a full time basis"
              },
              {
                "key": "engineer-documents",
                "title": "Copy of the following:",
                "description": "Certificate of Employment and copy of valid license of Supervising Electronics Engineer (ECE) or Professional Electronics Engineer (PECE)",
              },
            ],
            "serviceCode": "RCE",
            "category": "service center",
            "sequenceCode": "SC",
          },
          {
            "label": "Service Center Permit (RENEWAL)",
            "elements": [
            ],
            "formCode": "ntc1-18-RCE",
            "requirements": [
              {
                "key": "document",
                "title": "Radio Communication Equipment Service Center Permit",
                "required": true
              },
              {
                "key": "business-or-mayors-permit",
                "title": "Business/Mayor's Permit",
                "required": true
              },
              {
                "key": "technician-documents",
                "title": "Copy of the following:",
                "description": "Certificate of Employment and copy of valid license/ROC of at least one (1) qualified Radio Technician (Electronics Technician duly licensed by the Professional Regulation Commission OR a holder of a First Class Radiotelephone/ Radiotelegraph Certificate) employed on a full time basis"
              },
              {
                "key": "engineer-documents",
                "title": "Copy of the following:",
                "description": "Certificate of Employment and copy of valid license of Supervising Electronics Engineer (ECE) or Professional Electronics Engineer (PECE)",
              },
            ],
            "serviceCode": "RCE",
            "category": "service center",
            "sequenceCode": "SC",
          },
          {
            "label": "Service Center Permit (MODIFICATION)",
            "elements": [
            ],
            "formCode": "ntc1-18-RCE",
            "requirements": [
              {
                "key": "radio-communication-equipment-permit",
                "title": "Radio Communication Equipment Service Center Permit",
                "required": true
              },
            ],
            "modificationDueTos": [
              {
                "label": "Change of Permittee",
                "value": "Change of Permittee",
                "requirements": [
                  {
                    "key": "radio-communication-equipment-permit",
                    "title": "Radio Communication Equipment Service Center Permit",
                    "required": true
                  },
                  {
                    "key": "registration-id",
                    "title": "Copy of ANY of the following:",
                    "description": "• SEC Registration\n• DTI Registration\n• Business/Mayor's Permit\n\nNote : The purpose of the company as indicated in its registration document must include information related to the accreditation applied for.",
                    "required": true
                  },
                ],
              },
              {
                "label": "Change of company address",
                "value": "Change of company address",
                "requirements": [
                  {
                    "key": "radio-communication-equipment-permit",
                    "title": "Radio Communication Equipment Service Center Permit",
                    "required": true
                  },
                  {
                    "key": "business-or-mayors-permit",
                    "title": "Business/Mayor's Permit",
                    "required": true
                  },
                ],
              },
            ],
            "serviceCode": "RCE",
            "category": "service center",
            "sequenceCode": "SC",
          },
        ]
      },
      {
        "_id": "61c500e8ad8d7afe8ee5f625",
        "createdAt": "2021-12-09T09:40:51.636Z",
        "name": "Permits for Mobile Phone",
        "serviceCode": "service-15",
        "about": {
          "heading": "Permits for Mobile Phone",
          "description": "An Accreditation for Mobile Phone Dealer or Mobile Phone Retailer/Reseller or Mobile Phone Service Center is a written authority issued by the Commission to a person, firm, company, association or corporation authorizing the holder thereof to engage in the acquisition and purchase/sale, or servicing and maintenance of mobile phones.",
          "whoMayAvail": [
            {
              "title": "Individuals and Private Entities"
            },
          ]
        },
        "applicationTypes": [
          {
            "label": "Dealer Permit (NEW)",
            "elements": [
            ],
            "formCode": "ntc1-18-MP",
            "requirements": [
              {
                "key": "registration-id",
                "title": "Copy of ANY of the following:",
                "description": "• SEC Registration\n• DTI Registration\n• Business/Mayor's Permit",
                "required": true
              },
              {
                "key": "dealership-agreement",
                "title": "Dealership agreement from Mobile Phone Distributor/Supplier duly accredited by the NTC",
                // "required": true
              },
              {
                "key": "paid-up-capital",
                "title": "Proof of Paid-Up Capitalization",
                "description": "Minimum of PHP 100,000.00, duly certified by the Treasurer of the Corporation or by the partners in a partnership or by the owner in a sole proprietorship\n\nNote: List of stocks of spare parts and accessories sufficient enough to cover the warranty of mobile phone units for at least six (6) months, or in accordance with dealership agreement with the NTC accredited supplier/distributor",
                "required": true
              },
            ],
            "serviceCode": "MPDP",
            "category": "dealer",
            "sequenceCode": "MPDP",
          },
          {
            "label": "Dealer Permit (RENEWAL)",
            "elements": [
            ],
            "formCode": "ntc1-18-MP",
            "requirements": [
              {
                "key": "document",
                "title": "Mobile Phone Dealer Permit",
                "required": true
              },
              {
                "key": "business-or-mayors-permit",
                "title": "Business/Mayor's Permit",
                "required": true
              },
              {
                "key": "dealership-agreement",
                "title": "Dealership agreement from Mobile Phone Distributor/Supplier duly accredited by the NTC",
                "description": "𝐍𝐨𝐭𝐞: 𝘚𝘢𝘭𝘦𝘴 𝘢𝘯𝘥 𝘚𝘵𝘰𝘤𝘬𝘴 𝘙𝘦𝘱𝘰𝘳𝘵(𝘴) 𝘴𝘩𝘢𝘭𝘭 𝘣𝘦 𝘴𝘶𝘣𝘮𝘪𝘵𝘵𝘦𝘥 𝘪𝘯 𝘵𝘩𝘦 𝘱𝘳𝘦𝘴𝘤𝘳𝘪𝘣𝘦𝘥 𝘧𝘰𝘳𝘮 𝘯𝘰𝘵 𝘭𝘢𝘵𝘦𝘳 𝘵𝘩𝘢𝘯 𝘴𝘦𝘷𝘦𝘯 (7) 𝘥𝘢𝘺𝘴 𝘢𝘧𝘵𝘦𝘳 𝘵𝘩𝘦 𝘦𝘯𝘥 𝘰𝘧 𝘦𝘢𝘤𝘩 𝘲𝘶𝘢𝘳𝘵𝘦𝘳 𝘵𝘰 𝘵𝘩𝘦 𝘙𝘦𝘨𝘪𝘰𝘯𝘢𝘭 𝘖𝘧𝘧𝘪𝘤𝘦",
                "required": true, //region 9
              },

            ],
            "serviceCode": "MPDP",
            "category": "dealer",
            "sequenceCode": "MPDP",
          },
          {
            "label": "Dealer Permit (MODIFICATION)",
            "elements": [
            ],
            "formCode": "ntc1-18-MP",
            "requirements": [
              {
                "key": "letter-of-intent",
                "title": "Letter of Intent",
                "required": true
              },
              {
                "key": "mobile-phone-dealer-permit",
                "title": "Mobile Phone Dealer Permit",
                "required": true
              },
            ],
            "modificationDueTos": [
              {
                "label": "Change of Permittee",
                "value": "Change of Permittee",
                "requirements": [
                  {
                    "key": "letter-of-intent",
                    "title": "Letter of Intent",
                    "required": true
                  },
                  {
                    "key": "mobile-phone-dealer-permit",
                    "title": "Mobile Phone Dealer Permit",
                    "required": true
                  },
                  {
                    "key": "registration-document",
                    "title": "Copy of ANY of the following:",
                    "description": "• SEC Registration\n• DTI Registration\n• Valid Business/Mayor's Permit",
                    "required": true
                  },
                ],
              },
              {
                "label": "Change of company address",
                "value": "Change of company address",
                "requirements": [
                  {
                    "key": "letter-of-intent",
                    "title": "Letter of Intent",
                    "required": true
                  },
                  {
                    "key": "mobile-phone-dealer-permit",
                    "title": "Mobile Phone Dealer Permit",
                    "required": true
                  },
                  {
                    "key": "business-or-mayors-permit",
                    "title": "Business/Mayor's Permit",
                    "required": true
                  },
                ],
              },
            ],
            "serviceCode": "MPDP",
            "category": "dealer",
            "sequenceCode": "MPDP",
          },
          {
            "label": "Retailer/Reseller Permit (NEW)",
            "elements": [
            ],
            "formCode": "ntc1-18-MP",
            "requirements": [
              {
                "key": "registration-id",
                "title": "Copy of ANY of the following:",
                "description": "• SEC Registration\n• DTI Registration\n• Business/Mayor's Permit",
                "required": true
              },
              {
                "key": "paid-up-capital",
                "title": "Proof of Paid-Up Capitalization",
                "description": "Minimum of PHP 50,000.00, duly certified by the Treasurer of the Corporation or by the partners in a partnership or by the owner in a sole proprietorship",
                "required": true
              },
              //region 9 request
              /* {
                 "key": "stall-lease-certificate",
                 "title": "Certificate of Stall Lease Agreement for the conduct of its business activity",
                 "required": true
               },*/
            ],
            "serviceCode": "MPRRP",
            "category": "retailer/reseller",
            "sequenceCode": "MPRRP",
          },
          {
            "label": "Retailer/Reseller Permit (RENEWAL)",
            "elements": [
            ],
            "formCode": "ntc1-18-MP",
            "requirements": [
              {
                "key": "document",
                "title": "Mobile Phone Retailer/Reseller Permit",
                "required": true
              },
              {
                "key": "registration-id",
                "title": "Copy of ANY of the following:",
                "description": "• Business/Mayor's Permit",
                "required": true
              },
              /*{
                "key": "stall-lease-certificate",
                "title": "Certificate of Stall Lease Agreement for the conduct of its business activity",
                "required": true
              },*/
            ],
            "serviceCode": "MPRRP",
            "category": "retailer/reseller",
            "sequenceCode": "MPRRP",
          },
          {
            "label": "Retailer/Reseller Permit (MODIFICATION)",
            "elements": [
            ],
            "formCode": "ntc1-18-MP",
            "requirements": [
              {
                "key": "mobile-phone-dealer-permit",
                "title": "Mobile Phone Retailer/Reseller Permit",
                "required": true
              },
              {
                "key": "change-of-name-of-permittee",
                "title": "If modification is due to:",
                "description": "2.1 𝘾𝙝𝙖𝙣𝙜𝙚 𝙤𝙛 𝙉𝙖𝙢𝙚 𝙤𝙛 𝙋𝙚𝙧𝙢𝙞𝙩𝙩𝙚𝙚, Photocopy of SEC Registration, OR Photocopy of DTI Registration, OR Photocopy of valid Business/Mayor’s Permit \n\n2.2 𝘾𝙝𝙖𝙣𝙜𝙚 𝙤𝙛 𝘾𝙤𝙢𝙥𝙖𝙣𝙮 𝘼𝙙𝙙𝙧𝙚𝙨𝙨, Photocopy of valid Business/Mayor’s Permit",
                "required": true
              }
            ],
            "modificationDueTos": [
              {
                "label": "Change of Permittee",
                "value": "Change of Permittee",
                "requirements": [
                  {
                    "key": "mobile-phone-dealer-permit",
                    "title": "Mobile Phone Retailer/Reseller Permit",
                    "required": true
                  },
                  {
                    "key": "registration-document",
                    "title": "Copy of ANY of the following:",
                    "description": "• SEC Registration\n• DTI Registration\n• Valid Business/Mayor's Permit",
                    "required": true
                  },
                ],
              },
              {
                "label": "Change of company address",
                "value": "Change of company address",
                "requirements": [
                  {
                    "key": "mobile-phone-dealer-permit",
                    "title": "Mobile Phone Retailer/Reseller Permit",
                    "required": true
                  },
                  {
                    "key": "business-or-mayors-permit",
                    "title": "Business/Mayor's Permit",
                    "required": true
                  },
                ],
              },
            ],
            "serviceCode": "MPRRP",
            "category": "retailer/reseller",
            "sequenceCode": "MPRRP",
          },
          {
            "label": "Service Center Permit (NEW)",
            "elements": [
            ],
            "formCode": "ntc1-18-MP",
            "requirements": [
              {
                "key": "registration-id",
                "title": "Copy of ANY of the following:",
                "description": "• SEC Registration\n• DTI Registration\n• Business/Mayor's Permit",
                "required": true
              },
              {
                "key": "instruments",
                "title": "List of Test Equipment and Measuring Instruments",
                "required": true
              },
              {
                "key": "certificate-of-employment",
                "title": "Certificate of employment of qualified electronic technician who has completed a formal training course in the repair, servicing and maintenance of mobile phone",
                "required": true
              },
            ],
            "serviceCode": "MPSCP",
            "category": "service center",
            "sequenceCode": "MPSCP",
          },
          {
            "label": "Service Center Permit (RENEWAL)",
            "elements": [
            ],
            "formCode": "ntc1-18-MP",
            "requirements": [
              {
                "key": "document",
                "title": "Mobile Phone Service Center Permit",
                "required": true
              },
              {
                "key": "business-or-mayors-permit",
                "title": "Business/Mayor's Permit",
                "required": true
              },
              {
                "key": "instruments",
                "title": "List of Test Equipment and Measuring Instruments",
                "required": true
              },
              {
                "key": "certificate-of-employment",
                "title": "Certificate of employment of qualified electronic technician who has completed a formal training course in the repair, servicing and maintenance of mobile phone",
                "required": true
              },

            ],
            "serviceCode": "MPSCP",
            "category": "service center",
            "sequenceCode": "MPSCP",
          },
          {
            "label": "Service Center Permit (MODIFICATION)",
            "elements": [
            ],
            "formCode": "ntc1-18-MP",
            "requirements": [
              {
                "key": "mobile-phone-service-center-permit",
                "title": "Mobile Phone Service Center Permit",
                "required": true
              },
            ],
            "modificationDueTos": [
              {
                "label": "Change of Permittee",
                "value": "Change of Permittee",
                "requirements": [
                  {
                    "key": "mobile-phone-service-center-permit",
                    "title": "Mobile Phone Service Center Permit",
                    "required": true
                  },
                  {
                    "key": "registration-document",
                    "title": "Copy of ANY of the following:",
                    "description": "• SEC Registration\n• DTI Registration\n• Valid Business/Mayor's Permit",
                    "required": true
                  },
                ],
              },
              {
                "label": "Change of company address",
                "value": "Change of company address",
                "requirements": [
                  {
                    "key": "mobile-phone-service-center-permit",
                    "title": "Mobile Phone Service Center Permit",
                    "required": true
                  },
                  {
                    "key": "business-or-mayors-permit",
                    "title": "Business/Mayor's Permit",
                    "required": true
                  },
                ],
              },
            ],
            "serviceCode": "MPSCP",
            "category": "service center",
            "sequenceCode": "MPSCP",
          },
        ]
      },

      /*
      {
        "_id": "61c500e8ad8d7afe8ee5f629",
        "createdAt": "2021-12-09T09:40:51.656Z",
        "name": "Permits thru the Philippine National Single Window",
        "serviceCode": "service-20",
        "about": {
          "heading": "Permits thru the Philippine National Single Window",
          "description": "A Permit to Import is a written authority issued by the Commission to an individual, accredited CPE supplier, and private and government entities for the importation of type- approved/type-accepted customer premises equipment (CPE).",
          "whoMayAvail": [
            {
              "title": "Individuals"
            },
            {
              "title": "Accredited CPE Suppliers"
            },
            {
              "title": "Private and Government Entities"
            },
          ]
        },
        "applicationTypes": [
          {
            "label": "Permit to Import for Customer Premises Equipment",
            "elements": [
            ],
            "formCode": "ntc1-00",
            "requirements": [
              {
                "key": "proforma-or-commercial-invoice",
                "title": "Proforma/Commercial Invoice",
                "required": true
              },
              {
                "key": "approval-certificate",
                "title": "For CPE Supplier OR Personal/Company Use, ANY of the following:",
                "description": "• Type Approval Certificate\n• Type Acceptance Certificate\n• Grant of Equipment Conformity\n\nNote 1: CPE includes Indoor WDN equipment and Short Range Devices(SRD)",
                "required": true
              },
              {
                "key": "equipment-datasheet",
                "title": "For Demonstration and/or Testing:",
                "description": "Datasheet of proposed equipment",
              },
            ],
            "serviceCode": "IMPORT"
          },
        ]
      },
      */

      {
        "_id": "71c500e8ad8d7afe8ee5f629",
        "createdAt": "2021-12-09T09:41:51.656Z",
        "name": "Copy of Permits",
        "serviceCode": "service-21",
        "about": {
          "heading": "Copy of Permits",
          "description": "A Certified True Copy of a Permit is issued by the Commission to individuals, private and government entities upon request of the holder to authenticate copy of the same.\n\nA Duplicate Copy of a Permit is issued by the Commission to individuals, private and government entities upon request of the holder for the re-issuance of the same.",
          "whoMayAvail": [
            {
              "title": "Individuals"
            },
            {
              "title": "Private and Government Entities"
            },
          ]
        },
        "applicationTypes": [
          {
            "label": "Certified True Copy",
            "elements": [
            ],
            "formCode": "ntc1-ctc-permit",
            "requirements": [
              {
                "key": "document",
                "title": "Copy of document to be authenticated",
                "required": true
              },
            ],
            "serviceCode": "CTC",
            "category": "permit",
          },
          {
            "label": "Duplicate Copy",
            "elements": [
            ],
            "formCode": "ntc1-21-permit",
            "requirements": [
              {
                "key": "copy-of-permit",
                "title": "Copy of Permit:",
                "description": "A scanned or photocopied copy of the original Radio Operator Certificate."
              },
              {
                "key": "id-picture",
                "title": "For Radio Operator Certificate:",
                "description": "Please provide a clear 1x1 ID picture taken within the last six (6) months.",
              },
            ],
            "serviceCode": "DUP",
            "category": "permit",
          },
        ]
      },

    ],
  },
  {
    title: 'Requests/Complaints',
    key: 'complaints-requests',
    logo: require('@assets/services/complaint-request.png'),
    data: [
      {
        "_id": "71c500e8ad8d7afe8ee5f729",
        "createdAt": "2021-12-09T09:41:51.658Z",
        "name": "Requests and Complaints of Consumers/Subscribers",
        "serviceCode": "service-22",
        "about": {
          "heading": "Requests and Complaints of Consumers/Subscribers",
          "description": "The Commission acts on:\n\n(a) requests for blocking of mobile phone's IMEI (International Mobile Equipment Identity) and SIM (Subscriber Identity Module) due to lost/stolen cellphone units or unblocking of the same;\n\n(b) complaints of consumers/subscribers of telecommunications companies such as text scams, unwanted calls/texts and illegal/obscene/threat/other similar text messages; and\n\n(c) complaints of consumers/subscribers of telecommunications or broadcast Service Providers (i.e. Cable TV, DTH, etc.) such as billing complaint, poor customer service, poor technical service and fair usage issues.",
          "whoMayAvail": [
            {
              "title": "Individuals"
            },
            {
              "title": "Private and Government Entities"
            },
          ]
        },
        "applicationTypes": [
          {
            "label": "Request for Blocking of IMEI and SIM of Lost/Stolen Mobile Phone",
            "elements": [
            ],
            "formCode": "ntc1-24",
            "requirements": [
              {
                "key": "proof-of-ownership",
                "title": "Proof of ownership, ANY of the following:",
                "description": "• Official Receipt of the mobile phone\n• Box of the mobile phone with International Mobile Equipment Identity (IMEI)\n• Police Blotter",
                "required": true
              },
              {
                "key": "id",
                "title": "Copy of valid Identification",
                "description": "• Any government-issued ID OR Passport\n• For students, School ID\n• For cases when ID is not available, Birth Certificate OR NBI Clearance",
                "required": true,
              }
            ],
            "isDirectProcess": true,
          },
          {
            "label": "Request for Unblocking of IMEI and SIM of Lost/Stolen Mobile Phone",
            "elements": [
            ],
            "formCode": "ntc1-unblock",
            "requirements": [
              {
                "key": "proof-of-blocking",
                "title": "ANY of the following:",
                "description": "• Blocking Form\n• Proof of Blocking",
                "required": true,
              },
              {
                "key": "id",
                "title": "Valid ID",
                "required": true,
              },
            ],
            "isDirectProcess": true,
          },
          {
            "label": "Complaint on Text Spam, Text Scam, or Illegal/Obscene/Threat/Other Similar Text Messages",
            "elements": [
            ],
            "formCode": "ntc1-25-sms",
            "requirements": [
              {
                "key": "id",
                "title": "Copy of valid Identification",
                "description": "• Any government-issued ID OR Passport\n• For students, School ID\n• For cases when ID is not available, Birth Certificate OR NBI Clearance",
                "required": true,
              },
              {
                "key": "screenshot",
                "title": "Screenshot of text message",
                "required": true,
              },
              {
                "key": "notarized-complaint",
                "title": "If complaint proceeds to administrative case:",
                "description": "Copy of duly notarized Complaint",
              },
            ],
            "isDirectProcess": true,
          },
          {
            "label": "Complaint on Services offered by Telecommunications or Broadcast Service Providers",
            "elements": [
            ],
            "formCode": "ntc1-25-telco",
            "requirements": [
              {
                "key": "id",
                "title": "Copy of valid Identification",
                "description": "• Any government-issued ID OR Passport\n• For students, School ID\n• For cases when ID is not available, Birth Certificate OR NBI Clearance",
                "required": true,
              },
              {
                "key": "services-complained",
                "title": "ANY of the following:",
                "description": "• Service Contract\n• Billing Statement\n• Document indicating services availed by the complainant",
                "required": true,
              },
              {
                "key": "notarized-complaint",
                "title": "If complaint proceeds to administrative case:",
                "description": "Copy of duly notarized Complaint",
              },
            ],
            "isDirectProcess": true,
          },
          {
            "label": "Request for Mandatory Tape Preservation",
            "elements": [
            ],
            "formCode": "ntc1-toa",
            "requirements": [
              {
                "key": "letter-request",
                "title": "Letter Request",
                "required": true,
              },
            ],
            "isDirectProcess": true,
          },
        ]
      },
    ]
  },
];
async function loadCities() {
  return [
    {
      "id": "0bb5c3d2-dfaf-425d-bcc7-1d3076f1d129",
      "name": "Aborlan",
      "cityCode": "PAL-01",
      "provinceCode": "PAL",
      "createdAt": "2025-10-04T03:28:39.609361Z",
      "updatedAt": "2025-10-04T03:28:39.609449Z",
      "_etag": "\"0300f59c-0000-2400-0000-68e0946e0000\""
    },
    {
      "id": "f4dba358-8570-4a32-9d36-0df6e492ae0c",
      "name": "Abra De Ilog",
      "cityCode": "MNC-01",
      "provinceCode": "MNC",
      "createdAt": "2025-10-04T03:28:39.609537Z",
      "updatedAt": "2025-10-04T03:28:39.609537Z",
      "_etag": "\"0300b09d-0000-2400-0000-68e094740000\""
    },
    {
      "id": "4db4d70f-47d4-4528-a5ed-320cbc363555",
      "name": "Abucay",
      "cityCode": "BAT-01",
      "provinceCode": "BAT",
      "createdAt": "2025-10-04T03:28:39.609537Z",
      "updatedAt": "2025-10-04T03:28:39.609537Z",
      "_etag": "\"0300fd9d-0000-2400-0000-68e094770000\""
    },
    {
      "id": "d38bd9e4-25c5-4878-979f-d8a3acb1965e",
      "name": "Abulug",
      "cityCode": "CAG-01",
      "provinceCode": "CAG",
      "createdAt": "2025-10-04T03:28:39.609537Z",
      "updatedAt": "2025-10-04T03:28:39.609537Z",
      "_etag": "\"0300449e-0000-2400-0000-68e0947a0000\""
    },
    {
      "id": "3a3d280a-bcda-48d6-a3fb-708a6dfbb14a",
      "name": "Abuyog",
      "cityCode": "LEY-01",
      "provinceCode": "LEY",
      "createdAt": "2025-10-04T03:28:39.609537Z",
      "updatedAt": "2025-10-04T03:28:39.609537Z",
      "_etag": "\"0300ae9e-0000-2400-0000-68e0947d0000\""
    },
    {
      "id": "38c6feed-82c2-4745-8c0b-43dc901ceb39",
      "name": "Adams",
      "cityCode": "ILN-01",
      "provinceCode": "ILN",
      "createdAt": "2025-10-04T03:28:39.609539Z",
      "updatedAt": "2025-10-04T03:28:39.609539Z",
      "_etag": "\"0300e19e-0000-2400-0000-68e0947f0000\""
    },
    {
      "id": "309afcf4-ce7e-4d25-a8a9-2495df022026",
      "name": "Agdangan",
      "cityCode": "QUE-01",
      "provinceCode": "QUE",
      "createdAt": "2025-10-04T03:28:39.609539Z",
      "updatedAt": "2025-10-04T03:28:39.609539Z",
      "_etag": "\"0300049f-0000-2400-0000-68e094800000\""
    },
    {
      "id": "584a8cc5-61cd-416f-8c66-fefe95cdbb59",
      "name": "Aglipay",
      "cityCode": "QUI-01",
      "provinceCode": "QUI",
      "createdAt": "2025-10-04T03:28:39.60954Z",
      "updatedAt": "2025-10-04T03:28:39.60954Z",
      "_etag": "\"0300369f-0000-2400-0000-68e094820000\""
    },
    {
      "id": "47ed9a23-cb3f-4d31-87a6-5973bb10aa00",
      "name": "Agno",
      "cityCode": "PAN-01",
      "provinceCode": "PAN",
      "createdAt": "2025-10-04T03:28:39.60954Z",
      "updatedAt": "2025-10-04T03:28:39.60954Z",
      "_etag": "\"0300879f-0000-2400-0000-68e094850000\""
    },
    {
      "id": "9e231fb9-cd4f-48d4-925d-564a7997f75b",
      "name": "Agoncillo",
      "cityCode": "BTG-01",
      "provinceCode": "BTG",
      "createdAt": "2025-10-04T03:28:39.60954Z",
      "updatedAt": "2025-10-04T03:28:39.60954Z",
      "_etag": "\"0300d89f-0000-2400-0000-68e094880000\""
    },
    {
      "id": "0f6d6d1d-b62a-484e-b1c1-c55c381a5884",
      "name": "Agoo",
      "cityCode": "LAU-01",
      "provinceCode": "LAU",
      "createdAt": "2025-10-04T03:28:39.60954Z",
      "updatedAt": "2025-10-04T03:28:39.60954Z",
      "_etag": "\"030045a0-0000-2400-0000-68e0948c0000\""
    },
    {
      "id": "77ea868b-3b29-4306-ba30-a9f35d09334f",
      "name": "Aguilar",
      "cityCode": "PAN-02",
      "provinceCode": "PAN",
      "createdAt": "2025-10-04T03:28:39.60954Z",
      "updatedAt": "2025-10-04T03:28:39.60954Z",
      "_etag": "\"03009fa0-0000-2400-0000-68e0948f0000\""
    },
    {
      "id": "ddf9dabd-129f-4143-b8c9-9952b4efe0fd",
      "name": "Aguinaldo",
      "cityCode": "IFU-08",
      "provinceCode": "IFU",
      "createdAt": "2025-10-04T03:28:39.60954Z",
      "updatedAt": "2025-10-04T03:28:39.609541Z",
      "_etag": "\"030008a1-0000-2400-0000-68e094940000\""
    },
    {
      "id": "1e6ba5c1-10a8-496b-9e92-b43c3d3629d0",
      "name": "Agutaya",
      "cityCode": "PAL-02",
      "provinceCode": "PAL",
      "createdAt": "2025-10-04T03:28:39.609541Z",
      "updatedAt": "2025-10-04T03:28:39.609541Z",
      "_etag": "\"0300cba1-0000-2400-0000-68e0949a0000\""
    },
    {
      "id": "4246440f-5ea0-4d68-86ce-33400283c7b3",
      "name": "Ajuy",
      "cityCode": "ILO-01",
      "provinceCode": "ILO",
      "createdAt": "2025-10-04T03:28:39.609541Z",
      "updatedAt": "2025-10-04T03:28:39.609541Z",
      "_etag": "\"03003ba2-0000-2400-0000-68e0949e0000\""
    },
    {
      "id": "fb0a6970-9297-4f47-9c5a-c75ff6e2df34",
      "name": "Akbar",
      "cityCode": "BAS-08",
      "provinceCode": "BAS",
      "createdAt": "2025-10-04T03:28:39.609541Z",
      "updatedAt": "2025-10-04T03:28:39.609541Z",
      "_etag": "\"0300a9a2-0000-2400-0000-68e094a20000\""
    },
    {
      "id": "3dfa9a4c-fc1e-4bc3-84a9-d05044ffe53f",
      "name": "Al-barka",
      "cityCode": "BAS-09",
      "provinceCode": "BAS",
      "createdAt": "2025-10-04T03:28:39.609552Z",
      "updatedAt": "2025-10-04T03:28:39.609553Z",
      "_etag": "\"0300f2a2-0000-2400-0000-68e094a50000\""
    },
    {
      "id": "852b3225-2ef6-4df3-910e-720a18d3b674",
      "name": "Alabat",
      "cityCode": "QUE-02",
      "provinceCode": "QUE",
      "createdAt": "2025-10-04T03:28:39.609553Z",
      "updatedAt": "2025-10-04T03:28:39.609553Z",
      "_etag": "\"030041a3-0000-2400-0000-68e094a70000\""
    },
    {
      "id": "cc67b09e-4c4e-4f2c-a2eb-c0585f98cddb",
      "name": "Alabel (Capital)",
      "cityCode": "SAR-01",
      "provinceCode": "SAR",
      "createdAt": "2025-10-04T03:28:39.609553Z",
      "updatedAt": "2025-10-04T03:28:39.609553Z",
      "_etag": "\"030095a3-0000-2400-0000-68e094ab0000\""
    },
    {
      "id": "f23d5a09-755e-4c71-9362-d2c5e92f4fee",
      "name": "Alaminos",
      "cityCode": "LAG-01",
      "provinceCode": "LAG",
      "createdAt": "2025-10-04T03:28:39.609553Z",
      "updatedAt": "2025-10-04T03:28:39.609553Z",
      "_etag": "\"0300eaa3-0000-2400-0000-68e094ae0000\""
    },
    {
      "id": "cfa694c5-01e9-49f5-a205-3564f504eb95",
      "name": "Alangalang",
      "cityCode": "LEY-02",
      "provinceCode": "LEY",
      "createdAt": "2025-10-04T03:28:39.609553Z",
      "updatedAt": "2025-10-04T03:28:39.609553Z",
      "_etag": "\"030037a4-0000-2400-0000-68e094b10000\""
    },
    {
      "id": "5b1c9317-9180-4731-93ef-71bc1f4bca02",
      "name": "Albuera",
      "cityCode": "LEY-03",
      "provinceCode": "LEY",
      "createdAt": "2025-10-04T03:28:39.609553Z",
      "updatedAt": "2025-10-04T03:28:39.609553Z",
      "_etag": "\"0300a0a4-0000-2400-0000-68e094b50000\""
    },
    {
      "id": "ad86baf2-7b08-4323-ae14-32d956a6c3c5",
      "name": "Alburquerque",
      "cityCode": "BOH-01",
      "provinceCode": "BOH",
      "createdAt": "2025-10-04T03:28:39.609553Z",
      "updatedAt": "2025-10-04T03:28:39.609554Z",
      "_etag": "\"0300fda4-0000-2400-0000-68e094b80000\""
    },
    {
      "id": "1ff1654e-0ea5-426e-983c-f6aa3752c604",
      "name": "Alcala",
      "cityCode": "PAN-04",
      "provinceCode": "PAN",
      "createdAt": "2025-10-04T03:28:39.609554Z",
      "updatedAt": "2025-10-04T03:28:39.609554Z",
      "_etag": "\"030085a5-0000-2400-0000-68e094bd0000\""
    },
    {
      "id": "573e5928-bb69-497a-82c1-e6954e715824",
      "name": "Alcala",
      "cityCode": "CAG-02",
      "provinceCode": "CAG",
      "createdAt": "2025-10-04T03:28:39.609554Z",
      "updatedAt": "2025-10-04T03:28:39.609554Z",
      "_etag": "\"0300f8a5-0000-2400-0000-68e094c10000\""
    },
    {
      "id": "049e66a7-1c79-44e8-9671-1def3bf44ed2",
      "name": "Alcantara",
      "cityCode": "CEB-01",
      "provinceCode": "CEB",
      "createdAt": "2025-10-04T03:28:39.609554Z",
      "updatedAt": "2025-10-04T03:28:39.609554Z",
      "_etag": "\"030063a6-0000-2400-0000-68e094c50000\""
    },
    {
      "id": "7bec3343-ae6b-448b-97fb-bed82f167f23",
      "name": "Alcantara",
      "cityCode": "ROM-01",
      "provinceCode": "ROM",
      "createdAt": "2025-10-04T03:28:39.609554Z",
      "updatedAt": "2025-10-04T03:28:39.609554Z",
      "_etag": "\"0300cfa6-0000-2400-0000-68e094c90000\""
    },
    {
      "id": "f7af78ad-d497-4690-b37c-64a089e31653",
      "name": "Alcoy",
      "cityCode": "CEB-02",
      "provinceCode": "CEB",
      "createdAt": "2025-10-04T03:28:39.609554Z",
      "updatedAt": "2025-10-04T03:28:39.609554Z",
      "_etag": "\"03001ba7-0000-2400-0000-68e094cd0000\""
    },
    {
      "id": "84d92615-55ca-48cf-998d-04c22bf834f9",
      "name": "Alegria",
      "cityCode": "CEB-03",
      "provinceCode": "CEB",
      "createdAt": "2025-10-04T03:28:39.609554Z",
      "updatedAt": "2025-10-04T03:28:39.609554Z",
      "_etag": "\"03007ba7-0000-2400-0000-68e094d00000\""
    },
    {
      "id": "ae96e39b-bdb1-4c3d-85d2-8c2d3476080d",
      "name": "Alegria",
      "cityCode": "SUN-01",
      "provinceCode": "SUN",
      "createdAt": "2025-10-04T03:43:46.464392Z",
      "updatedAt": "2025-10-04T03:43:46.464393Z",
      "_etag": "\"0300f0f9-0000-2400-0000-68e098010000\""
    },
    {
      "id": "24c1646c-b913-43b5-85d7-e09948d41310",
      "name": "Aleosan",
      "cityCode": "NCO-17",
      "provinceCode": "NCO",
      "createdAt": "2025-10-04T04:02:20.747809Z",
      "updatedAt": "2025-10-04T04:02:20.747809Z",
      "_etag": "\"0400dc79-0000-2400-0000-68e09d0e0000\""
    },
    {
      "id": "9078d286-960b-4ef4-ad84-c1c9fbabc62d",
      "name": "Alfonso",
      "cityCode": "CAV-01",
      "provinceCode": "CAV",
      "createdAt": "2025-10-04T03:43:46.464393Z",
      "updatedAt": "2025-10-04T03:43:46.464393Z",
      "_etag": "\"03002dfa-0000-2400-0000-68e098030000\""
    },
    {
      "id": "1c0a9436-fe52-4984-814d-3aa8905c3fe2",
      "name": "Alfonso Castaneda",
      "cityCode": "NUV-15",
      "provinceCode": "NUV",
      "createdAt": "2025-10-04T04:02:20.747809Z",
      "updatedAt": "2025-10-04T04:02:20.747809Z",
      "_etag": "\"0400fe79-0000-2400-0000-68e09d100000\""
    },
    {
      "id": "37b41b52-7c75-477e-a665-17997a5ec33a",
      "name": "Alfonso Lista (Potia)",
      "cityCode": "IFU-07",
      "provinceCode": "IFU",
      "createdAt": "2025-10-04T03:43:46.464393Z",
      "updatedAt": "2025-10-04T03:43:46.464393Z",
      "_etag": "\"03005ffa-0000-2400-0000-68e098050000\""
    },
    {
      "id": "59615c3b-7f72-47ec-ad31-98ec8a143550",
      "name": "Aliaga",
      "cityCode": "NUE-01",
      "provinceCode": "NUE",
      "createdAt": "2025-10-04T04:02:20.74781Z",
      "updatedAt": "2025-10-04T04:02:20.74781Z",
      "_etag": "\"0400357a-0000-2400-0000-68e09d120000\""
    },
    {
      "id": "a0f4c9d0-ffff-4312-9329-8e98e8fbd0ce",
      "name": "Alicia",
      "cityCode": "BOH-02",
      "provinceCode": "BOH",
      "createdAt": "2025-10-04T03:43:46.464394Z",
      "updatedAt": "2025-10-04T03:43:46.464394Z",
      "_etag": "\"030090fa-0000-2400-0000-68e098070000\""
    },
    {
      "id": "b220c969-9fdf-44eb-a0b4-9c0dbe1c0874",
      "name": "Alicia",
      "cityCode": "ZSI-01",
      "provinceCode": "ZSI",
      "createdAt": "2025-10-04T03:43:46.464394Z",
      "updatedAt": "2025-10-04T03:43:46.464395Z",
      "_etag": "\"0300cdfa-0000-2400-0000-68e0980a0000\""
    },
    {
      "id": "fabf4614-10d4-43dc-add0-662a05f2f65a",
      "name": "Alicia",
      "cityCode": "ISA-01",
      "provinceCode": "ISA",
      "createdAt": "2025-10-04T04:02:20.747811Z",
      "updatedAt": "2025-10-04T04:02:20.747811Z",
      "_etag": "\"0400587b-0000-2400-0000-68e09d1d0000\""
    },
    {
      "id": "49351b99-679f-47fb-a61b-bdd78ee8e613",
      "name": "Alilem",
      "cityCode": "ILS-01",
      "provinceCode": "ILS",
      "createdAt": "2025-10-04T04:02:20.74781Z",
      "updatedAt": "2025-10-04T04:02:20.74781Z",
      "_etag": "\"0400b57a-0000-2400-0000-68e09d170000\""
    },
    {
      "id": "244c2cb2-d21a-4deb-ba81-a237c08c15b3",
      "name": "Alimodian",
      "cityCode": "ILO-02",
      "provinceCode": "ILO",
      "createdAt": "2025-10-04T03:43:46.464395Z",
      "updatedAt": "2025-10-04T03:43:46.464395Z",
      "_etag": "\"03000afb-0000-2400-0000-68e0980c0000\""
    },
    {
      "id": "a8570cc2-7713-4cab-8a31-331e4fba4240",
      "name": "Alitagtag",
      "cityCode": "BTG-02",
      "provinceCode": "BTG",
      "createdAt": "2025-10-04T04:02:20.747812Z",
      "updatedAt": "2025-10-04T04:02:20.747812Z",
      "_etag": "\"04007c7d-0000-2400-0000-68e09d310000\""
    },
    {
      "id": "f0c0e7ee-60e9-4b22-9ac6-06676f092213",
      "name": "Allacapan",
      "cityCode": "CAG-03",
      "provinceCode": "CAG",
      "createdAt": "2025-10-04T03:43:46.464395Z",
      "updatedAt": "2025-10-04T03:43:46.464395Z",
      "_etag": "\"030021fb-0000-2400-0000-68e0980e0000\""
    },
    {
      "id": "17b5fee6-f1e8-4088-babb-c2789794a99c",
      "name": "Allen",
      "cityCode": "NSA-01",
      "provinceCode": "NSA",
      "createdAt": "2025-10-04T04:02:20.747812Z",
      "updatedAt": "2025-10-04T04:02:20.747812Z",
      "_etag": "\"04004b7d-0000-2400-0000-68e09d2e0000\""
    },
    {
      "id": "258879b7-6f83-4bd5-8021-99d21cc78554",
      "name": "Almagro",
      "cityCode": "WSA-01",
      "provinceCode": "WSA",
      "createdAt": "2025-10-04T03:43:46.464395Z",
      "updatedAt": "2025-10-04T03:43:46.464395Z",
      "_etag": "\"030062fb-0000-2400-0000-68e098100000\""
    },
    {
      "id": "2f8b63f0-1667-4884-b39d-d9a8ffd6d33d",
      "name": "Almeria",
      "cityCode": "BIL-01",
      "provinceCode": "BIL",
      "createdAt": "2025-10-04T04:02:20.747811Z",
      "updatedAt": "2025-10-04T04:02:20.747811Z",
      "_etag": "\"04004b7c-0000-2400-0000-68e09d260000\""
    },
    {
      "id": "36313041-04d4-4f21-b7bb-228a492d947f",
      "name": "Aloguinsan",
      "cityCode": "CEB-04",
      "provinceCode": "CEB",
      "createdAt": "2025-10-04T03:43:46.464395Z",
      "updatedAt": "2025-10-04T03:43:46.464395Z",
      "_etag": "\"030081fb-0000-2400-0000-68e098120000\""
    },
    {
      "id": "a8b6d7d7-0748-4efc-a76d-23eed2eba396",
      "name": "Aloran",
      "cityCode": "MSC-01",
      "provinceCode": "MSC",
      "createdAt": "2025-10-04T04:02:20.747811Z",
      "updatedAt": "2025-10-04T04:02:20.747811Z",
      "_etag": "\"0400cb7b-0000-2400-0000-68e09d210000\""
    },
    {
      "id": "e37a817e-c022-40ef-a6f2-e59c9d8bb94e",
      "name": "Altavas",
      "cityCode": "AKL-01",
      "provinceCode": "AKL",
      "createdAt": "2025-10-04T03:43:46.464395Z",
      "updatedAt": "2025-10-04T03:43:46.464395Z",
      "_etag": "\"0300c3fb-0000-2400-0000-68e098140000\""
    },
    {
      "id": "43383dac-0803-4573-be1a-074b33b1972d",
      "name": "Alubijid",
      "cityCode": "MSR-01",
      "provinceCode": "MSR",
      "createdAt": "2025-10-04T04:02:20.747811Z",
      "updatedAt": "2025-10-04T04:02:20.747811Z",
      "_etag": "\"04008b7c-0000-2400-0000-68e09d280000\""
    },
    {
      "id": "e5c8339f-af22-4164-83b5-4e5335fd843b",
      "name": "Amadeo",
      "cityCode": "CAV-02",
      "provinceCode": "CAV",
      "createdAt": "2025-10-04T03:43:46.464396Z",
      "updatedAt": "2025-10-04T03:43:46.464396Z",
      "_etag": "\"0300f7fb-0000-2400-0000-68e098160000\""
    },
    {
      "id": "0feb5a8e-537c-47e4-a633-a4f57179f9ee",
      "name": "Ambaguio",
      "cityCode": "NUV-01",
      "provinceCode": "NUV",
      "createdAt": "2025-10-04T04:02:20.747812Z",
      "updatedAt": "2025-10-04T04:02:20.747812Z",
      "_etag": "\"04000e7d-0000-2400-0000-68e09d2d0000\""
    },
    {
      "id": "1a79db48-127d-4e89-a5aa-91f7c379521a",
      "name": "Amlan (Ayuquitan)",
      "cityCode": "NER-01",
      "provinceCode": "NER",
      "createdAt": "2025-10-04T03:43:46.464396Z",
      "updatedAt": "2025-10-04T03:43:46.464396Z",
      "_etag": "\"030021fc-0000-2400-0000-68e098180000\""
    },
    {
      "id": "95dae88d-4c6c-4875-ba6c-b788ea9fa7df",
      "name": "Ampatuan",
      "cityCode": "MAG-01",
      "provinceCode": "MAG",
      "createdAt": "2025-10-04T04:02:20.747812Z",
      "updatedAt": "2025-10-04T04:02:20.747812Z",
      "_etag": "\"0400c07c-0000-2400-0000-68e09d2a0000\""
    },
    {
      "id": "d3a532bf-45a9-42ab-a3e9-f1ccb48946d0",
      "name": "Amulung",
      "cityCode": "CAG-04",
      "provinceCode": "CAG",
      "createdAt": "2025-10-04T03:43:46.464396Z",
      "updatedAt": "2025-10-04T03:43:46.464396Z",
      "_etag": "\"030045fc-0000-2400-0000-68e0981a0000\""
    },
    {
      "id": "b5529598-79f0-4669-b478-e032abe05d41",
      "name": "Anahawan",
      "cityCode": "SLE-01",
      "provinceCode": "SLE",
      "createdAt": "2025-10-04T04:02:20.747812Z",
      "updatedAt": "2025-10-04T04:02:20.747812Z",
      "_etag": "\"0400c87d-0000-2400-0000-68e09d340000\""
    },
    {
      "id": "aa2bd163-7f95-46ae-9d76-c5bb7ffc0b9f",
      "name": "Anao",
      "cityCode": "TAR-01",
      "provinceCode": "TAR",
      "createdAt": "2025-10-04T03:43:46.464396Z",
      "updatedAt": "2025-10-04T03:43:46.464396Z",
      "_etag": "\"030073fc-0000-2400-0000-68e0981b0000\""
    },
    {
      "id": "7361bd0a-0180-4d8a-ac24-afc52e76adff",
      "name": "Anda",
      "cityCode": "PAN-05",
      "provinceCode": "PAN",
      "createdAt": "2025-10-04T03:43:46.464396Z",
      "updatedAt": "2025-10-04T03:43:46.464396Z",
      "_etag": "\"0300abfc-0000-2400-0000-68e0981e0000\""
    },
    {
      "id": "015f77ac-3ff5-41a5-b79b-704c172b0d93",
      "name": "Anda",
      "cityCode": "BOH-03",
      "provinceCode": "BOH",
      "createdAt": "2025-10-04T04:02:20.747812Z",
      "updatedAt": "2025-10-04T04:02:20.747812Z",
      "_etag": "\"04000a7e-0000-2400-0000-68e09d360000\""
    },
    {
      "id": "76ccebe6-04eb-43a5-b93e-425398f8ea76",
      "name": "Angadanan",
      "cityCode": "ISA-02",
      "provinceCode": "ISA",
      "createdAt": "2025-10-04T04:02:20.747813Z",
      "updatedAt": "2025-10-04T04:02:20.747813Z",
      "_etag": "\"04003a7e-0000-2400-0000-68e09d380000\""
    },
    {
      "id": "392e0c0d-5d50-4d31-99cb-9fed2275585e",
      "name": "Angat",
      "cityCode": "BUL-01",
      "provinceCode": "BUL",
      "createdAt": "2025-10-04T03:43:46.464397Z",
      "updatedAt": "2025-10-04T03:43:46.464397Z",
      "_etag": "\"0300d2fc-0000-2400-0000-68e098200000\""
    },
    {
      "id": "2ac4fbdd-aa56-4019-aaf0-ceadb126ca70",
      "name": "Angeles City",
      "cityCode": "PAM-01",
      "provinceCode": "PAM",
      "createdAt": "2025-10-04T04:02:20.747813Z",
      "updatedAt": "2025-10-04T04:02:20.747813Z",
      "_etag": "\"0400627e-0000-2400-0000-68e09d390000\""
    },
    {
      "id": "a786d461-d22f-4039-8e82-fdfc92d9eef1",
      "name": "Angono",
      "cityCode": "RIZ-01",
      "provinceCode": "RIZ",
      "createdAt": "2025-10-04T04:02:20.747813Z",
      "updatedAt": "2025-10-04T04:02:20.747813Z",
      "_etag": "\"0400727e-0000-2400-0000-68e09d3a0000\""
    },
    {
      "id": "7d62f41d-10e1-4293-a119-2201f6c0adbb",
      "name": "Anilao",
      "cityCode": "ILO-03",
      "provinceCode": "ILO",
      "createdAt": "2025-10-04T04:07:39.91517Z",
      "updatedAt": "2025-10-04T04:07:39.91517Z",
      "_etag": "\"0400ff93-0000-2400-0000-68e09e200000\""
    },
    {
      "id": "4f7849d3-316a-4a50-aad1-5ccb8632d35e",
      "name": "Anini-y",
      "cityCode": "ANT-01",
      "provinceCode": "ANT",
      "createdAt": "2025-10-04T04:07:39.915165Z",
      "updatedAt": "2025-10-04T04:07:39.915165Z",
      "_etag": "\"0400478e-0000-2400-0000-68e09de40000\""
    },
    {
      "id": "48404da0-0e05-44bb-a4b5-09eb004e7f79",
      "name": "Antequera",
      "cityCode": "BOH-04",
      "provinceCode": "BOH",
      "createdAt": "2025-10-04T04:07:39.915159Z",
      "updatedAt": "2025-10-04T04:07:39.915159Z",
      "_etag": "\"04006e8b-0000-2400-0000-68e09dc80000\""
    },
    {
      "id": "1cabd75f-6ceb-4f34-9351-0b794f461bdb",
      "name": "Antipas",
      "cityCode": "NCO-15",
      "provinceCode": "NCO",
      "createdAt": "2025-10-04T04:07:39.915165Z",
      "updatedAt": "2025-10-04T04:07:39.915165Z",
      "_etag": "\"0400d78d-0000-2400-0000-68e09ddf0000\""
    },
    {
      "id": "a1309815-a35f-47da-afec-ec3a566009ab",
      "name": "Apalit",
      "cityCode": "PAM-02",
      "provinceCode": "PAM",
      "createdAt": "2025-10-04T03:43:46.464397Z",
      "updatedAt": "2025-10-04T03:43:46.464397Z",
      "_etag": "\"030007fd-0000-2400-0000-68e098230000\""
    },
    {
      "id": "9831e902-ad3f-4348-99e5-147bca6c818a",
      "name": "Aparri",
      "cityCode": "CAG-05",
      "provinceCode": "CAG",
      "createdAt": "2025-10-04T04:07:39.915164Z",
      "updatedAt": "2025-10-04T04:07:39.915164Z",
      "_etag": "\"0400248c-0000-2400-0000-68e09dd00000\""
    },
    {
      "id": "82bec138-dfff-4f86-9e7e-7c862ac06219",
      "name": "Araceli",
      "cityCode": "PAL-03",
      "provinceCode": "PAL",
      "createdAt": "2025-10-04T03:43:46.464397Z",
      "updatedAt": "2025-10-04T03:43:46.464397Z",
      "_etag": "\"03002afd-0000-2400-0000-68e098240000\""
    },
    {
      "id": "896ea709-7d4c-4c25-9be4-28ab3439adad",
      "name": "Arakan",
      "cityCode": "NCO-18",
      "provinceCode": "NCO",
      "createdAt": "2025-10-04T04:07:39.915164Z",
      "updatedAt": "2025-10-04T04:07:39.915164Z",
      "_etag": "\"04006e8c-0000-2400-0000-68e09dd20000\""
    },
    {
      "id": "c3da3930-40e8-4ce9-aeb6-c4f6aa277c4d",
      "name": "Arayat",
      "cityCode": "PAM-03",
      "provinceCode": "PAM",
      "createdAt": "2025-10-04T03:43:46.464397Z",
      "updatedAt": "2025-10-04T03:43:46.464397Z",
      "_etag": "\"030064fd-0000-2400-0000-68e098270000\""
    },
    {
      "id": "9bc1cd8a-bfa5-475c-a45b-7b23666525b3",
      "name": "Argao",
      "cityCode": "CEB-05",
      "provinceCode": "CEB",
      "createdAt": "2025-10-04T04:07:39.91517Z",
      "updatedAt": "2025-10-04T04:07:39.91517Z",
      "_etag": "\"0400d494-0000-2400-0000-68e09e2b0000\""
    },
    {
      "id": "249f0ab0-f5a4-4b9a-80ca-92f21572c4b4",
      "name": "Aringay",
      "cityCode": "LAU-02",
      "provinceCode": "LAU",
      "createdAt": "2025-10-04T03:43:46.464398Z",
      "updatedAt": "2025-10-04T03:43:46.464398Z",
      "_etag": "\"030083fd-0000-2400-0000-68e098280000\""
    },
    {
      "id": "5cf78988-e390-43ab-9808-fadcb12ea711",
      "name": "Aritao",
      "cityCode": "NUV-02",
      "provinceCode": "NUV",
      "createdAt": "2025-10-04T04:07:39.915159Z",
      "updatedAt": "2025-10-04T04:07:39.915159Z",
      "_etag": "\"0400a38b-0000-2400-0000-68e09dca0000\""
    },
    {
      "id": "c719b0f2-5af2-425b-8b0f-aa1396a7ca51",
      "name": "Aroroy",
      "cityCode": "MAS-01",
      "provinceCode": "MAS",
      "createdAt": "2025-10-04T03:43:46.464398Z",
      "updatedAt": "2025-10-04T03:43:46.464398Z",
      "_etag": "\"0300d3fd-0000-2400-0000-68e0982b0000\""
    },
    {
      "id": "3911319e-c76e-4783-bf19-84a73328e73f",
      "name": "Arteche",
      "cityCode": "EAS-01",
      "provinceCode": "EAS",
      "createdAt": "2025-10-04T04:07:39.91516Z",
      "updatedAt": "2025-10-04T04:07:39.91516Z",
      "_etag": "\"0400b48b-0000-2400-0000-68e09dca0000\""
    },
    {
      "id": "b093536c-b631-4a2b-a90f-0b6e0252eeb3",
      "name": "Asingan",
      "cityCode": "PAN-06",
      "provinceCode": "PAN",
      "createdAt": "2025-10-04T03:43:46.464398Z",
      "updatedAt": "2025-10-04T03:43:46.464398Z",
      "_etag": "\"030028fe-0000-2400-0000-68e0982e0000\""
    },
    {
      "id": "8b55fbdf-488a-4f0b-b16b-0e675a4630e8",
      "name": "Asipulo",
      "cityCode": "IFU-11",
      "provinceCode": "IFU",
      "createdAt": "2025-10-04T04:07:39.91517Z",
      "updatedAt": "2025-10-04T04:07:39.91517Z",
      "_etag": "\"0400b394-0000-2400-0000-68e09e290000\""
    },
    {
      "id": "748c78cd-c118-42a0-8ccb-22d67eb0d198",
      "name": "Asturias",
      "cityCode": "CEB-06",
      "provinceCode": "CEB",
      "createdAt": "2025-10-04T03:43:46.464398Z",
      "updatedAt": "2025-10-04T03:43:46.464398Z",
      "_etag": "\"03007cfe-0000-2400-0000-68e098320000\""
    },
    {
      "id": "36d49694-b603-46e8-89ea-51d65c382f60",
      "name": "Asuncion (Saug)",
      "cityCode": "DAN-01",
      "provinceCode": "DAN",
      "createdAt": "2025-10-04T04:07:39.91517Z",
      "updatedAt": "2025-10-04T04:07:39.91517Z",
      "_etag": "\"04007194-0000-2400-0000-68e09e250000\""
    },
    {
      "id": "f4ba4550-a5ca-45ef-bd60-8fc04f6b0318",
      "name": "Atimonan",
      "cityCode": "QUE-03",
      "provinceCode": "QUE",
      "createdAt": "2025-10-04T03:43:46.464398Z",
      "updatedAt": "2025-10-04T03:43:46.464399Z",
      "_etag": "\"0300c7fe-0000-2400-0000-68e098350000\""
    },
    {
      "id": "329a7064-c057-4d93-8caa-6f71fca26d6a",
      "name": "Atok",
      "cityCode": "BEN-01",
      "provinceCode": "BEN",
      "createdAt": "2025-10-04T04:07:39.91517Z",
      "updatedAt": "2025-10-04T04:07:39.91517Z",
      "_etag": "\"04004994-0000-2400-0000-68e09e230000\""
    },
    {
      "id": "4828e19d-f584-49dc-a01b-40365cd3ba66",
      "name": "Aurora",
      "cityCode": "ZAS-02",
      "provinceCode": "ZAS",
      "createdAt": "2025-10-04T03:43:46.464399Z",
      "updatedAt": "2025-10-04T03:43:46.464399Z",
      "_etag": "\"0300f3fe-0000-2400-0000-68e098370000\""
    },
    {
      "id": "effda3b3-8180-4690-bcec-0d9829a988ea",
      "name": "Aurora",
      "cityCode": "ISA-03",
      "provinceCode": "ISA",
      "createdAt": "2025-10-04T04:07:39.91517Z",
      "updatedAt": "2025-10-04T04:07:39.91517Z",
      "_etag": "\"04008c94-0000-2400-0000-68e09e270000\""
    },
    {
      "id": "8a55f96c-4de4-4e0b-8dc6-2440a2f6662a",
      "name": "Ayungon",
      "cityCode": "NER-02",
      "provinceCode": "NER",
      "createdAt": "2025-10-04T03:43:46.464399Z",
      "updatedAt": "2025-10-04T03:43:46.464399Z",
      "_etag": "\"030051ff-0000-2400-0000-68e0983a0000\""
    },
    {
      "id": "660d429d-1c1f-4d7f-a66f-74295ea96bba",
      "name": "Baao",
      "cityCode": "CAS-01",
      "provinceCode": "CAS",
      "createdAt": "2025-10-04T03:43:46.464399Z",
      "updatedAt": "2025-10-04T03:43:46.464399Z",
      "_etag": "\"030086ff-0000-2400-0000-68e0983c0000\""
    },
    {
      "id": "480ffb32-165d-402f-9b2e-1f48774fe9fb",
      "name": "Babatngon",
      "cityCode": "LEY-05",
      "provinceCode": "LEY",
      "createdAt": "2025-10-04T03:43:46.4644Z",
      "updatedAt": "2025-10-04T03:43:46.4644Z",
      "_etag": "\"0300d0ff-0000-2400-0000-68e0983f0000\""
    },
    {
      "id": "2975c7b4-b5b6-4421-8720-a1666b5022a8",
      "name": "Bacacay",
      "cityCode": "ALB-01",
      "provinceCode": "ALB",
      "createdAt": "2025-10-04T03:43:46.4644Z",
      "updatedAt": "2025-10-04T03:43:46.4644Z",
      "_etag": "\"04000400-0000-2400-0000-68e098410000\""
    },
    {
      "id": "9715faee-5aa1-4d50-8cab-b8274f8a34ea",
      "name": "Bacarra",
      "cityCode": "ILN-02",
      "provinceCode": "ILN",
      "createdAt": "2025-10-04T03:43:46.4644Z",
      "updatedAt": "2025-10-04T03:43:46.4644Z",
      "_etag": "\"04005600-0000-2400-0000-68e098440000\""
    },
    {
      "id": "ab42eedb-1596-49f8-8133-f770ad61e56b",
      "name": "Baclayon",
      "cityCode": "BOH-05",
      "provinceCode": "BOH",
      "createdAt": "2025-10-04T03:43:46.4644Z",
      "updatedAt": "2025-10-04T03:43:46.4644Z",
      "_etag": "\"0400c400-0000-2400-0000-68e098480000\""
    },
    {
      "id": "7a96a9bd-eeb4-47b1-80f2-c48f077873a1",
      "name": "Bacnotan",
      "cityCode": "LAU-03",
      "provinceCode": "LAU",
      "createdAt": "2025-10-04T03:43:46.4644Z",
      "updatedAt": "2025-10-04T03:43:46.4644Z",
      "_etag": "\"04001d01-0000-2400-0000-68e0984d0000\""
    },
    {
      "id": "52a60c8f-e4df-4536-87f9-daffbd5cf019",
      "name": "Baco",
      "cityCode": "MNR-01",
      "provinceCode": "MNR",
      "createdAt": "2025-10-04T03:43:46.464401Z",
      "updatedAt": "2025-10-04T03:43:46.464401Z",
      "_etag": "\"04005201-0000-2400-0000-68e0984f0000\""
    },
    {
      "id": "ecc72c72-48fc-44f0-af21-6ac75b42f602",
      "name": "Bacolod",
      "cityCode": "LAN-01",
      "provinceCode": "LAN",
      "createdAt": "2025-10-04T03:43:46.464401Z",
      "updatedAt": "2025-10-04T03:43:46.464401Z",
      "_etag": "\"04009f01-0000-2400-0000-68e098530000\""
    },
    {
      "id": "95d64593-5778-47b9-b4e7-3f2699ea9e85",
      "name": "Bacolod City (Capital)",
      "cityCode": "NEC-01",
      "provinceCode": "NEC",
      "createdAt": "2025-10-04T03:43:46.464401Z",
      "updatedAt": "2025-10-04T03:43:46.464401Z",
      "_etag": "\"04000502-0000-2400-0000-68e098580000\""
    },
    {
      "id": "265af075-98b6-4541-a97b-2245a1e4d938",
      "name": "Bacolod-kalawi (Bacolod Grande)",
      "cityCode": "LAN-01",
      "provinceCode": "LAN",
      "createdAt": "2025-10-04T03:43:46.464402Z",
      "updatedAt": "2025-10-04T03:43:46.464402Z",
      "_etag": "\"04006602-0000-2400-0000-68e0985b0000\""
    },
    {
      "id": "de79f509-dffa-4084-9606-ba2d47dd1740",
      "name": "Bacolor",
      "cityCode": "PAM-04",
      "provinceCode": "PAM",
      "createdAt": "2025-10-04T03:43:46.464402Z",
      "updatedAt": "2025-10-04T03:43:46.464402Z",
      "_etag": "\"0400bb02-0000-2400-0000-68e0985e0000\""
    },
    {
      "id": "2cb27c66-262b-4a29-b153-bbab19de4b7e",
      "name": "Bacong",
      "cityCode": "NER-03",
      "provinceCode": "NER",
      "createdAt": "2025-10-04T03:43:46.464402Z",
      "updatedAt": "2025-10-04T03:43:46.464402Z",
      "_etag": "\"04001e03-0000-2400-0000-68e098620000\""
    },
    {
      "id": "ceaaba13-d036-4c18-a5eb-599196739d88",
      "name": "Bacoor City",
      "cityCode": "CAV-03",
      "provinceCode": "CAV",
      "createdAt": "2025-10-04T03:43:46.464403Z",
      "updatedAt": "2025-10-04T03:43:46.464403Z",
      "_etag": "\"04006303-0000-2400-0000-68e098650000\""
    },
    {
      "id": "4ef1dce1-5a98-462f-8ba2-ba7ff483859a",
      "name": "Bacuag",
      "cityCode": "SUN-02",
      "provinceCode": "SUN",
      "createdAt": "2025-10-04T03:43:46.464403Z",
      "updatedAt": "2025-10-04T03:43:46.464403Z",
      "_etag": "\"0400cc03-0000-2400-0000-68e098690000\""
    },
    {
      "id": "1bfe4b7d-7c21-4e63-bfb2-c0f9c84d37a0",
      "name": "Bacungan (Leon T. Postigo)",
      "cityCode": "ZAN-26",
      "provinceCode": "ZAN",
      "createdAt": "2025-10-04T03:43:46.464403Z",
      "updatedAt": "2025-10-04T03:43:46.464403Z",
      "_etag": "\"04001804-0000-2400-0000-68e0986c0000\""
    },
    {
      "id": "66f55adb-64ad-4deb-bdcd-e5cb6f39a019",
      "name": "Badian",
      "cityCode": "CEB-07",
      "provinceCode": "CEB",
      "createdAt": "2025-10-04T03:43:46.464403Z",
      "updatedAt": "2025-10-04T03:43:46.464403Z",
      "_etag": "\"04005304-0000-2400-0000-68e0986f0000\""
    },
    {
      "id": "becb7e8b-d042-4bb3-9e8a-f6723a863cc3",
      "name": "Badiangan",
      "cityCode": "ILO-04",
      "provinceCode": "ILO",
      "createdAt": "2025-10-04T03:43:46.464403Z",
      "updatedAt": "2025-10-04T03:43:46.464403Z",
      "_etag": "\"04009b04-0000-2400-0000-68e098720000\""
    },
    {
      "id": "46b095a7-ad63-4134-b29f-4f1519adde3f",
      "name": "Badoc",
      "cityCode": "ILN-03",
      "provinceCode": "ILN",
      "createdAt": "2025-10-04T03:43:46.464404Z",
      "updatedAt": "2025-10-04T03:43:46.464404Z",
      "_etag": "\"0400da04-0000-2400-0000-68e098740000\""
    },
    {
      "id": "75470d7f-5b18-48d8-ab53-da01c0f5313d",
      "name": "Bagabag",
      "cityCode": "NUV-03",
      "provinceCode": "NUV",
      "createdAt": "2025-10-04T03:43:46.464404Z",
      "updatedAt": "2025-10-04T03:43:46.464404Z",
      "_etag": "\"04000b05-0000-2400-0000-68e098770000\""
    },
    {
      "id": "3e5c2582-36dd-41ae-bb27-e2cffbb31f27",
      "name": "Bagac",
      "cityCode": "BAT-02",
      "provinceCode": "BAT",
      "createdAt": "2025-10-04T03:43:46.464404Z",
      "updatedAt": "2025-10-04T03:43:46.464404Z",
      "_etag": "\"04005205-0000-2400-0000-68e0987a0000\""
    },
    {
      "id": "c3870013-a724-4203-8070-22d482dbf26f",
      "name": "Bagamanoc",
      "cityCode": "CAT-01",
      "provinceCode": "CAT",
      "createdAt": "2025-10-04T03:43:46.464404Z",
      "updatedAt": "2025-10-04T03:43:46.464404Z",
      "_etag": "\"0400a005-0000-2400-0000-68e0987d0000\""
    },
    {
      "id": "e9981f58-2148-43ad-8ebd-e2093d9ba056",
      "name": "Baganga",
      "cityCode": "DAR-01",
      "provinceCode": "DAR",
      "createdAt": "2025-10-04T03:43:46.464404Z",
      "updatedAt": "2025-10-04T03:43:46.464405Z",
      "_etag": "\"0400f205-0000-2400-0000-68e098800000\""
    },
    {
      "id": "322ca8e3-3e81-4219-b61a-de449332b9bc",
      "name": "Baggao",
      "cityCode": "CAG-06",
      "provinceCode": "CAG",
      "createdAt": "2025-10-04T03:43:46.464405Z",
      "updatedAt": "2025-10-04T03:43:46.464405Z",
      "_etag": "\"04004806-0000-2400-0000-68e098840000\""
    },
    {
      "id": "389399d7-c6b1-461a-b152-eeedd9b6d119",
      "name": "Bago City",
      "cityCode": "NEC-02",
      "provinceCode": "NEC",
      "createdAt": "2025-10-04T03:43:46.464405Z",
      "updatedAt": "2025-10-04T03:43:46.464405Z",
      "_etag": "\"04008206-0000-2400-0000-68e098860000\""
    },
    {
      "id": "ed4d3bf3-0b1b-4af4-8f84-8abf4aa92126",
      "name": "Baguio City",
      "cityCode": "BEN-02",
      "provinceCode": "BEN",
      "createdAt": "2025-10-04T03:43:46.464405Z",
      "updatedAt": "2025-10-04T03:43:46.464405Z",
      "_etag": "\"0400d206-0000-2400-0000-68e098880000\""
    },
    {
      "id": "b35f3942-fc1f-4c51-8354-8fb98fd199fa",
      "name": "Bagulin",
      "cityCode": "LAU-04",
      "provinceCode": "LAU",
      "createdAt": "2025-10-04T03:43:46.464406Z",
      "updatedAt": "2025-10-04T03:43:46.464406Z",
      "_etag": "\"04002207-0000-2400-0000-68e0988b0000\""
    },
    {
      "id": "43655987-d52b-45a7-837f-026ed2cecfd3",
      "name": "Bagumbayan",
      "cityCode": "SUK-01",
      "provinceCode": "SUK",
      "createdAt": "2025-10-04T03:43:46.464408Z",
      "updatedAt": "2025-10-04T03:43:46.464408Z",
      "_etag": "\"0400e70b-0000-2400-0000-68e098b80000\""
    },
    {
      "id": "44431149-6628-4e9d-9e2b-6cbf2b9fd7ec",
      "name": "Bais City",
      "cityCode": "NER-04",
      "provinceCode": "NER",
      "createdAt": "2025-10-04T04:02:20.74774Z",
      "updatedAt": "2025-10-04T04:02:20.74774Z",
      "_etag": "\"04007769-0000-2400-0000-68e09c720000\""
    },
    {
      "id": "cb5dab58-6315-4f19-ba85-e00117badf9d",
      "name": "Bakun",
      "cityCode": "BEN-03",
      "provinceCode": "BEN",
      "createdAt": "2025-10-04T03:43:46.464408Z",
      "updatedAt": "2025-10-04T03:43:46.464408Z",
      "_etag": "\"0400490c-0000-2400-0000-68e098bc0000\""
    },
    {
      "id": "e4b2ed4f-38fe-49f3-81f9-2ae00431456e",
      "name": "Balabac",
      "cityCode": "PAL-04",
      "provinceCode": "PAL",
      "createdAt": "2025-10-04T03:43:46.46441Z",
      "updatedAt": "2025-10-04T03:43:46.46441Z",
      "_etag": "\"0400ef0d-0000-2400-0000-68e098cc0000\""
    },
    {
      "id": "0e34ecae-e2a3-4358-8881-ff3acefefa1a",
      "name": "Balabagan",
      "cityCode": "LAN-02",
      "provinceCode": "LAN",
      "createdAt": "2025-10-04T03:43:46.464406Z",
      "updatedAt": "2025-10-04T03:43:46.464406Z",
      "_etag": "\"04007407-0000-2400-0000-68e0988e0000\""
    },
    {
      "id": "04dffbc5-c325-46b6-aea0-70ad4810bc58",
      "name": "Balagtas (Bigaa)",
      "cityCode": "BUL-02",
      "provinceCode": "BUL",
      "createdAt": "2025-10-04T03:43:46.464409Z",
      "updatedAt": "2025-10-04T03:43:46.464409Z",
      "_etag": "\"0400090d-0000-2400-0000-68e098c40000\""
    },
    {
      "id": "c1b963d7-0817-493f-a389-21d77bc32040",
      "name": "Balamban",
      "cityCode": "CEB-08",
      "provinceCode": "CEB",
      "createdAt": "2025-10-04T03:43:46.464406Z",
      "updatedAt": "2025-10-04T03:43:46.464406Z",
      "_etag": "\"0400d407-0000-2400-0000-68e098920000\""
    },
    {
      "id": "054086f9-b390-424c-b7ea-7ddaa5eb7945",
      "name": "Balangiga",
      "cityCode": "EAS-02",
      "provinceCode": "EAS",
      "createdAt": "2025-10-04T04:02:20.747741Z",
      "updatedAt": "2025-10-04T04:02:20.747741Z",
      "_etag": "\"04001e6a-0000-2400-0000-68e09c780000\""
    },
    {
      "id": "51bc6c3a-d4a1-4db6-a422-3377459f2c8e",
      "name": "Balangkayan",
      "cityCode": "EAS-03",
      "provinceCode": "EAS",
      "createdAt": "2025-10-04T03:43:46.464406Z",
      "updatedAt": "2025-10-04T03:43:46.464406Z",
      "_etag": "\"04001c08-0000-2400-0000-68e098950000\""
    },
    {
      "id": "cc70188b-18c8-440a-9a5b-329668f23f55",
      "name": "Balaoan",
      "cityCode": "LAU-05",
      "provinceCode": "LAU",
      "createdAt": "2025-10-04T04:02:20.747741Z",
      "updatedAt": "2025-10-04T04:02:20.747741Z",
      "_etag": "\"0400b46a-0000-2400-0000-68e09c7e0000\""
    },
    {
      "id": "d85f602c-1d69-4dd0-bdc3-eb5cbcffd98e",
      "name": "Balasan",
      "cityCode": "ILO-05",
      "provinceCode": "ILO",
      "createdAt": "2025-10-04T03:43:46.464406Z",
      "updatedAt": "2025-10-04T03:43:46.464406Z",
      "_etag": "\"04005608-0000-2400-0000-68e098970000\""
    },
    {
      "id": "1d84dfa9-8c7c-46db-974f-19938884c018",
      "name": "Balatan",
      "cityCode": "CAS-02",
      "provinceCode": "CAS",
      "createdAt": "2025-10-04T04:02:20.747741Z",
      "updatedAt": "2025-10-04T04:02:20.747741Z",
      "_etag": "\"04004f6a-0000-2400-0000-68e09c7a0000\""
    },
    {
      "id": "ddf528bc-5d23-42f5-8788-baea39fb5d18",
      "name": "Balayan",
      "cityCode": "BTG-03",
      "provinceCode": "BTG",
      "createdAt": "2025-10-04T03:43:46.464406Z",
      "updatedAt": "2025-10-04T03:43:46.464407Z",
      "_etag": "\"0400c708-0000-2400-0000-68e0989b0000\""
    },
    {
      "id": "898ff4fd-df8b-416d-9e81-41cdfd952877",
      "name": "Balbalan",
      "cityCode": "KAL-01",
      "provinceCode": "KAL",
      "createdAt": "2025-10-04T04:02:20.747741Z",
      "updatedAt": "2025-10-04T04:02:20.747741Z",
      "_etag": "\"0400e66a-0000-2400-0000-68e09c800000\""
    },
    {
      "id": "896bd73c-ca92-418c-9cbc-7aee5e11a553",
      "name": "Baleno",
      "cityCode": "MAS-02",
      "provinceCode": "MAS",
      "createdAt": "2025-10-04T03:43:46.464407Z",
      "updatedAt": "2025-10-04T03:43:46.464407Z",
      "_etag": "\"04003d09-0000-2400-0000-68e0989f0000\""
    },
    {
      "id": "aecd8680-7c50-4b7f-846d-5992ab0df71d",
      "name": "Baler (Capital)",
      "cityCode": "AUR-01",
      "provinceCode": "AUR",
      "createdAt": "2025-10-04T04:02:20.74774Z",
      "updatedAt": "2025-10-04T04:02:20.74774Z",
      "_etag": "\"04003b69-0000-2400-0000-68e09c700000\""
    },
    {
      "id": "064220ca-b66b-4f3a-9691-bf0590ebed0d",
      "name": "Balete",
      "cityCode": "BTG-04",
      "provinceCode": "BTG",
      "createdAt": "2025-10-04T03:43:46.464407Z",
      "updatedAt": "2025-10-04T03:43:46.464407Z",
      "_etag": "\"04008409-0000-2400-0000-68e098a20000\""
    },
    {
      "id": "7243ffe9-9093-4744-9173-2e5b2c66a02e",
      "name": "Balete",
      "cityCode": "AKL-02",
      "provinceCode": "AKL",
      "createdAt": "2025-10-04T03:43:46.464409Z",
      "updatedAt": "2025-10-04T03:43:46.464409Z",
      "_etag": "\"0400820d-0000-2400-0000-68e098c80000\""
    },
    {
      "id": "9fa48f81-02d1-485f-a234-f43ff6cd8db8",
      "name": "Baliangao",
      "cityCode": "MSC-02",
      "provinceCode": "MSC",
      "createdAt": "2025-10-04T03:43:46.464407Z",
      "updatedAt": "2025-10-04T03:43:46.464407Z",
      "_etag": "\"0400e909-0000-2400-0000-68e098a60000\""
    },
    {
      "id": "05e96502-3e27-471c-8d02-cfff3a334dd7",
      "name": "Baliguian",
      "cityCode": "ZAN-24",
      "provinceCode": "ZAN",
      "createdAt": "2025-10-04T03:43:46.46441Z",
      "updatedAt": "2025-10-04T03:43:46.46441Z",
      "_etag": "\"0400b10e-0000-2400-0000-68e098d30000\""
    },
    {
      "id": "c7dcfdc7-948b-476b-8bc2-bec6cd96c416",
      "name": "Balilihan",
      "cityCode": "BOH-06",
      "provinceCode": "BOH",
      "createdAt": "2025-10-04T03:43:46.464407Z",
      "updatedAt": "2025-10-04T03:43:46.464407Z",
      "_etag": "\"04006a0a-0000-2400-0000-68e098a90000\""
    },
    {
      "id": "6363ed8e-2dd1-4eef-9f2e-6c5b82011106",
      "name": "Balindong (Watu)",
      "cityCode": "LAN-03",
      "provinceCode": "LAN",
      "createdAt": "2025-10-04T04:02:20.747741Z",
      "updatedAt": "2025-10-04T04:02:20.747741Z",
      "_etag": "\"04008c6a-0000-2400-0000-68e09c7d0000\""
    },
    {
      "id": "b2e853b6-07c8-425b-980f-e11793294690",
      "name": "Balingasag",
      "cityCode": "MSR-02",
      "provinceCode": "MSR",
      "createdAt": "2025-10-04T03:43:46.464407Z",
      "updatedAt": "2025-10-04T03:43:46.464408Z",
      "_etag": "\"0400b80a-0000-2400-0000-68e098ad0000\""
    },
    {
      "id": "6ee247af-8933-4dbf-b515-2ee0d8d0da80",
      "name": "Balingoan",
      "cityCode": "MSR-03",
      "provinceCode": "MSR",
      "createdAt": "2025-10-04T04:02:20.747741Z",
      "updatedAt": "2025-10-04T04:02:20.747741Z",
      "_etag": "\"0400156b-0000-2400-0000-68e09c830000\""
    },
    {
      "id": "7c6acc67-8206-4147-afd8-31cecc33f308",
      "name": "Baliuag",
      "cityCode": "BUL-03",
      "provinceCode": "BUL",
      "createdAt": "2025-10-04T03:43:46.464408Z",
      "updatedAt": "2025-10-04T03:43:46.464408Z",
      "_etag": "\"0400040b-0000-2400-0000-68e098b00000\""
    },
    {
      "id": "25bcb6f9-61cd-43c9-896d-f7c075491425",
      "name": "Ballesteros",
      "cityCode": "CAG-07",
      "provinceCode": "CAG",
      "createdAt": "2025-10-04T04:02:20.747742Z",
      "updatedAt": "2025-10-04T04:02:20.747742Z",
      "_etag": "\"0400426b-0000-2400-0000-68e09c850000\""
    },
    {
      "id": "d0f630df-951e-4c80-b5a9-14b530e75386",
      "name": "Baloi",
      "cityCode": "LAN-02",
      "provinceCode": "LAN",
      "createdAt": "2025-10-04T03:43:46.464408Z",
      "updatedAt": "2025-10-04T03:43:46.464408Z",
      "_etag": "\"04005c0b-0000-2400-0000-68e098b30000\""
    },
    {
      "id": "575a6048-14f1-45b2-8a59-09955cbeab61",
      "name": "Balud",
      "cityCode": "MAS-03",
      "provinceCode": "MAS",
      "createdAt": "2025-10-04T04:02:20.747742Z",
      "updatedAt": "2025-10-04T04:02:20.747742Z",
      "_etag": "\"0400076c-0000-2400-0000-68e09c8d0000\""
    },
    {
      "id": "3f6c384c-1a31-4ddd-9c2e-e981843258f6",
      "name": "Balungao",
      "cityCode": "PAN-07",
      "provinceCode": "PAN",
      "createdAt": "2025-10-04T03:43:46.464408Z",
      "updatedAt": "2025-10-04T03:43:46.464408Z",
      "_etag": "\"04008b0b-0000-2400-0000-68e098b50000\""
    },
    {
      "id": "5055e2aa-42f9-4c26-8bfe-3ba3beb8ab72",
      "name": "Bamban",
      "cityCode": "TAR-02",
      "provinceCode": "TAR",
      "createdAt": "2025-10-04T04:02:20.747742Z",
      "updatedAt": "2025-10-04T04:02:20.747742Z",
      "_etag": "\"0400836b-0000-2400-0000-68e09c870000\""
    },
    {
      "id": "723c7db6-63c9-45b3-a24d-47903c23bf17",
      "name": "Bambang",
      "cityCode": "NUV-04",
      "provinceCode": "NUV",
      "createdAt": "2025-10-04T03:43:46.464409Z",
      "updatedAt": "2025-10-04T03:43:46.464409Z",
      "_etag": "\"04009f0c-0000-2400-0000-68e098bf0000\""
    },
    {
      "id": "55468c71-9ed1-49f9-ac65-3fda1654321e",
      "name": "Banate",
      "cityCode": "ILO-06",
      "provinceCode": "ILO",
      "createdAt": "2025-10-04T04:02:20.747743Z",
      "updatedAt": "2025-10-04T04:02:20.747743Z",
      "_etag": "\"0400386c-0000-2400-0000-68e09c8f0000\""
    },
    {
      "id": "f3a589bd-9d79-4e23-b7ad-580971ea0d32",
      "name": "Banaue",
      "cityCode": "IFU-01",
      "provinceCode": "IFU",
      "createdAt": "2025-10-04T03:43:46.46441Z",
      "updatedAt": "2025-10-04T03:43:46.46441Z",
      "_etag": "\"0400520e-0000-2400-0000-68e098cf0000\""
    },
    {
      "id": "2b50bff8-e5d4-40f4-9923-7b4f99421b5a",
      "name": "Banaybanay",
      "cityCode": "DAR-02",
      "provinceCode": "DAR",
      "createdAt": "2025-10-04T04:02:20.747743Z",
      "updatedAt": "2025-10-04T04:02:20.747743Z",
      "_etag": "\"0400a36c-0000-2400-0000-68e09c940000\""
    },
    {
      "id": "63432e5e-104f-40eb-ad82-268ad7d3e93d",
      "name": "Banayoyo",
      "cityCode": "ILS-02",
      "provinceCode": "ILS",
      "createdAt": "2025-10-04T04:02:20.74774Z",
      "updatedAt": "2025-10-04T04:02:20.74774Z",
      "_etag": "\"04006169-0000-2400-0000-68e09c720000\""
    },
    {
      "id": "528d9cd1-8cdc-4377-950b-4b99432f271d",
      "name": "Banga",
      "cityCode": "AKL-03",
      "provinceCode": "AKL",
      "createdAt": "2025-10-04T04:02:20.747741Z",
      "updatedAt": "2025-10-04T04:02:20.747741Z",
      "_etag": "\"0400c069-0000-2400-0000-68e09c740000\""
    },
    {
      "id": "b0c82d60-909a-41dd-a46a-0816d8d414dd",
      "name": "Banga",
      "cityCode": "SCO-02",
      "provinceCode": "SCO",
      "createdAt": "2025-10-04T04:02:20.747744Z",
      "updatedAt": "2025-10-04T04:02:20.747744Z",
      "_etag": "\"0400196d-0000-2400-0000-68e09c980000\""
    },
    {
      "id": "13397e15-19f5-42dc-b1c8-64da5062496b",
      "name": "Bangar",
      "cityCode": "LAU-06",
      "provinceCode": "LAU",
      "createdAt": "2025-10-04T04:02:20.747744Z",
      "updatedAt": "2025-10-04T04:02:20.747744Z",
      "_etag": "\"0400476d-0000-2400-0000-68e09c9a0000\""
    },
    {
      "id": "16e9ce2d-12e6-4f1a-a9e3-fb59b8792f35",
      "name": "Bangued (Capital)",
      "cityCode": "ABR-01",
      "provinceCode": "ABR",
      "createdAt": "2025-10-04T04:02:20.747742Z",
      "updatedAt": "2025-10-04T04:02:20.747742Z",
      "_etag": "\"0400c66b-0000-2400-0000-68e09c8a0000\""
    },
    {
      "id": "e07d5b69-4d26-49a0-8496-4f86deec1b6a",
      "name": "Bangui",
      "cityCode": "ILN-04",
      "provinceCode": "ILN",
      "createdAt": "2025-10-04T04:02:20.747744Z",
      "updatedAt": "2025-10-04T04:02:20.747744Z",
      "_etag": "\"0400e56d-0000-2400-0000-68e09c9f0000\""
    },
    {
      "id": "f7145e85-cdca-4eb8-a6f4-71a9aeef4942",
      "name": "Bani",
      "cityCode": "PAN-08",
      "provinceCode": "PAN",
      "createdAt": "2025-10-04T04:02:20.747743Z",
      "updatedAt": "2025-10-04T04:02:20.747743Z",
      "_etag": "\"0400726c-0000-2400-0000-68e09c920000\""
    },
    {
      "id": "e737cc3d-1d45-4a87-bbc8-6cf8abf9374c",
      "name": "Banisilan",
      "cityCode": "NCO-16",
      "provinceCode": "NCO",
      "createdAt": "2025-10-04T04:02:20.747744Z",
      "updatedAt": "2025-10-04T04:02:20.747744Z",
      "_etag": "\"0400146e-0000-2400-0000-68e09ca10000\""
    },
    {
      "id": "b1e02ded-59f2-4ace-bc6a-e2a094a2da89",
      "name": "Banna (Espiritu)",
      "cityCode": "ILN-11",
      "provinceCode": "ILN",
      "createdAt": "2025-10-04T04:02:20.747743Z",
      "updatedAt": "2025-10-04T04:02:20.747743Z",
      "_etag": "\"0400da6c-0000-2400-0000-68e09c960000\""
    },
    {
      "id": "064c8b3c-ab6a-4aa2-ae0d-ff4087101802",
      "name": "Bansalan",
      "cityCode": "DAS-01",
      "provinceCode": "DAS",
      "createdAt": "2025-10-04T04:02:20.747744Z",
      "updatedAt": "2025-10-04T04:02:20.747744Z",
      "_etag": "\"0400996e-0000-2400-0000-68e09ca60000\""
    },
    {
      "id": "f7c7efed-1165-4878-990f-96ac2a70dbaf",
      "name": "Bansud",
      "cityCode": "MNR-02",
      "provinceCode": "MNR",
      "createdAt": "2025-10-04T04:02:20.747744Z",
      "updatedAt": "2025-10-04T04:02:20.747744Z",
      "_etag": "\"0400726d-0000-2400-0000-68e09c9c0000\""
    },
    {
      "id": "44e31426-ebaf-4d76-8a93-a9e22e053e12",
      "name": "Bantay",
      "cityCode": "ILS-03",
      "provinceCode": "ILS",
      "createdAt": "2025-10-04T04:02:20.747745Z",
      "updatedAt": "2025-10-04T04:02:20.747745Z",
      "_etag": "\"0400d26e-0000-2400-0000-68e09ca80000\""
    },
    {
      "id": "9707a6c3-3a78-47d1-aa3d-60e669a29f41",
      "name": "Bantayan",
      "cityCode": "CEB-09",
      "provinceCode": "CEB",
      "createdAt": "2025-10-04T04:02:20.747744Z",
      "updatedAt": "2025-10-04T04:02:20.747744Z",
      "_etag": "\"0400616e-0000-2400-0000-68e09ca30000\""
    },
    {
      "id": "886c7b89-7720-4f51-a9f7-49c6c9c20972",
      "name": "Banton",
      "cityCode": "ROM-02",
      "provinceCode": "ROM",
      "createdAt": "2025-10-04T04:02:20.747801Z",
      "updatedAt": "2025-10-04T04:02:20.747801Z",
      "_etag": "\"04003c6f-0000-2400-0000-68e09cac0000\""
    },
    {
      "id": "9d7caff3-aecc-45df-8d24-e17515a5bc38",
      "name": "Baras",
      "cityCode": "CAT-02",
      "provinceCode": "CAT",
      "createdAt": "2025-10-04T04:02:20.747745Z",
      "updatedAt": "2025-10-04T04:02:20.747745Z",
      "_etag": "\"04000b6f-0000-2400-0000-68e09caa0000\""
    },
    {
      "id": "c8692d61-f8d8-42f1-bee9-bdc2b24f2235",
      "name": "Baras",
      "cityCode": "RIZ-03",
      "provinceCode": "RIZ",
      "createdAt": "2025-10-04T04:02:20.747801Z",
      "updatedAt": "2025-10-04T04:02:20.747801Z",
      "_etag": "\"04007a6f-0000-2400-0000-68e09cae0000\""
    },
    {
      "id": "076ea093-73ab-4448-a263-67ddc55aca75",
      "name": "Barbaza",
      "cityCode": "ANT-02",
      "provinceCode": "ANT",
      "createdAt": "2025-10-04T04:02:20.747802Z",
      "updatedAt": "2025-10-04T04:02:20.747802Z",
      "_etag": "\"0400b56f-0000-2400-0000-68e09cb00000\""
    },
    {
      "id": "25e7dde9-321c-49e8-9591-6f9b7e0bda8c",
      "name": "Barcelona",
      "cityCode": "SOR-02",
      "provinceCode": "SOR",
      "createdAt": "2025-10-04T04:02:20.747802Z",
      "updatedAt": "2025-10-04T04:02:20.747802Z",
      "_etag": "\"0400db6f-0000-2400-0000-68e09cb20000\""
    },
    {
      "id": "378c8875-a1c5-48ae-ba65-c15414f24e1c",
      "name": "Barili",
      "cityCode": "CEB-10",
      "provinceCode": "CEB",
      "createdAt": "2025-10-04T04:02:20.747802Z",
      "updatedAt": "2025-10-04T04:02:20.747802Z",
      "_etag": "\"04000470-0000-2400-0000-68e09cb40000\""
    },
    {
      "id": "ce349208-236b-48ed-ae50-4363b1cc5d7e",
      "name": "Barira",
      "cityCode": "MAG-18",
      "provinceCode": "MAG",
      "createdAt": "2025-10-04T04:02:20.747802Z",
      "updatedAt": "2025-10-04T04:02:20.747802Z",
      "_etag": "\"04004770-0000-2400-0000-68e09cb60000\""
    },
    {
      "id": "be8b0190-92e4-48f6-b624-0f2a1dd99cfc",
      "name": "Barlig",
      "cityCode": "MOU-01",
      "provinceCode": "MOU",
      "createdAt": "2025-10-04T04:02:20.747802Z",
      "updatedAt": "2025-10-04T04:02:20.747802Z",
      "_etag": "\"04007370-0000-2400-0000-68e09cb80000\""
    },
    {
      "id": "074078b8-648d-4fdd-a2a2-cf206b63b901",
      "name": "Barobo",
      "cityCode": "SUR-01",
      "provinceCode": "SUR",
      "createdAt": "2025-10-04T04:02:20.747805Z",
      "updatedAt": "2025-10-04T04:02:20.747805Z",
      "_etag": "\"0400e372-0000-2400-0000-68e09cd10000\""
    },
    {
      "id": "189bd0ed-9a25-4fcc-9137-2ed094de0182",
      "name": "Barotac Nuevo",
      "cityCode": "ILO-07",
      "provinceCode": "ILO",
      "createdAt": "2025-10-04T04:02:20.747805Z",
      "updatedAt": "2025-10-04T04:02:20.747805Z",
      "_etag": "\"04001773-0000-2400-0000-68e09cd30000\""
    },
    {
      "id": "7e867159-f530-4edb-8432-f66394aefea4",
      "name": "Barotac Viejo",
      "cityCode": "ILO-08",
      "provinceCode": "ILO",
      "createdAt": "2025-10-04T04:02:20.747805Z",
      "updatedAt": "2025-10-04T04:02:20.747805Z",
      "_etag": "\"04005d73-0000-2400-0000-68e09cd50000\""
    },
    {
      "id": "096cea0b-d399-4f80-a4dd-e5e05b423fac",
      "name": "Baroy",
      "cityCode": "LAN-03",
      "provinceCode": "LAN",
      "createdAt": "2025-10-04T04:02:20.747805Z",
      "updatedAt": "2025-10-04T04:02:20.747805Z",
      "_etag": "\"0400ab73-0000-2400-0000-68e09cd80000\""
    },
    {
      "id": "318804ed-c918-4f38-a556-f67518c008ef",
      "name": "Barugo",
      "cityCode": "LEY-06",
      "provinceCode": "LEY",
      "createdAt": "2025-10-04T04:02:20.747805Z",
      "updatedAt": "2025-10-04T04:02:20.747805Z",
      "_etag": "\"0400f873-0000-2400-0000-68e09cdb0000\""
    },
    {
      "id": "f30b10dc-54d1-4741-af8c-50a2a6157c27",
      "name": "Basay",
      "cityCode": "NER-05",
      "provinceCode": "NER",
      "createdAt": "2025-10-04T04:02:20.747806Z",
      "updatedAt": "2025-10-04T04:02:20.747806Z",
      "_etag": "\"04007674-0000-2400-0000-68e09cdf0000\""
    },
    {
      "id": "fc9792a9-02f2-4f08-b2ba-d7985f3cead4",
      "name": "Basco (Capital)",
      "cityCode": "BTN-01",
      "provinceCode": "BTN",
      "createdAt": "2025-10-04T04:02:20.747806Z",
      "updatedAt": "2025-10-04T04:02:20.747806Z",
      "_etag": "\"0400a374-0000-2400-0000-68e09ce10000\""
    },
    {
      "id": "61dda90b-afb8-44aa-9095-32786d80e267",
      "name": "Basey",
      "cityCode": "WSA-02",
      "provinceCode": "WSA",
      "createdAt": "2025-10-04T04:02:20.747806Z",
      "updatedAt": "2025-10-04T04:02:20.747806Z",
      "_etag": "\"04003c75-0000-2400-0000-68e09ce40000\""
    },
    {
      "id": "e702d3a8-cd6e-40fb-b103-daf6441bde9f",
      "name": "Basilisa (Rizal)",
      "cityCode": "DIN-01",
      "provinceCode": "DIN",
      "createdAt": "2025-10-04T04:02:20.747802Z",
      "updatedAt": "2025-10-04T04:02:20.747803Z",
      "_etag": "\"0400ad70-0000-2400-0000-68e09cba0000\""
    },
    {
      "id": "fd6537a0-8c19-4e74-acba-4b252b3603a0",
      "name": "Basista",
      "cityCode": "PAN-09",
      "provinceCode": "PAN",
      "createdAt": "2025-10-04T04:02:20.747806Z",
      "updatedAt": "2025-10-04T04:02:20.747806Z",
      "_etag": "\"0400e174-0000-2400-0000-68e09ce20000\""
    },
    {
      "id": "a17dbc0c-fd21-4058-9fac-f36eeb0f55e3",
      "name": "Basud",
      "cityCode": "CAN-01",
      "provinceCode": "CAN",
      "createdAt": "2025-10-04T04:02:20.747803Z",
      "updatedAt": "2025-10-04T04:02:20.747803Z",
      "_etag": "\"0400de70-0000-2400-0000-68e09cbc0000\""
    },
    {
      "id": "896332cf-a13b-4df2-804d-4559c2082c3f",
      "name": "Batad",
      "cityCode": "ILO-09",
      "provinceCode": "ILO",
      "createdAt": "2025-10-04T04:02:20.747807Z",
      "updatedAt": "2025-10-04T04:02:20.747807Z",
      "_etag": "\"04001776-0000-2400-0000-68e09cec0000\""
    },
    {
      "id": "8594f91e-9873-48f3-8d2a-60779979f3d8",
      "name": "Batan",
      "cityCode": "AKL-04",
      "provinceCode": "AKL",
      "createdAt": "2025-10-04T04:02:20.747803Z",
      "updatedAt": "2025-10-04T04:02:20.747803Z",
      "_etag": "\"04000771-0000-2400-0000-68e09cbe0000\""
    },
    {
      "id": "9d07a0d2-5aec-46a7-a3e5-1f6c93953ae4",
      "name": "Batangas City (Capital)",
      "cityCode": "BTG-05",
      "provinceCode": "BTG",
      "createdAt": "2025-10-04T04:02:20.747807Z",
      "updatedAt": "2025-10-04T04:02:20.747807Z",
      "_etag": "\"04007f76-0000-2400-0000-68e09cee0000\""
    },
    {
      "id": "d899d842-6bfc-4edf-b9bc-5d77888041d4",
      "name": "Bataraza",
      "cityCode": "PAL-05",
      "provinceCode": "PAL",
      "createdAt": "2025-10-04T04:02:20.747803Z",
      "updatedAt": "2025-10-04T04:02:20.747803Z",
      "_etag": "\"04003271-0000-2400-0000-68e09cc00000\""
    },
    {
      "id": "c3bd511b-c7c4-4420-a8d5-4defe658841e",
      "name": "Bato",
      "cityCode": "CAT-03",
      "provinceCode": "CAT",
      "createdAt": "2025-10-04T04:02:20.747803Z",
      "updatedAt": "2025-10-04T04:02:20.747803Z",
      "_etag": "\"04006d71-0000-2400-0000-68e09cc20000\""
    },
    {
      "id": "736d066d-57a2-49ca-b144-d9a6ceac5de1",
      "name": "Bato",
      "cityCode": "CAS-03",
      "provinceCode": "CAS",
      "createdAt": "2025-10-04T04:02:20.747807Z",
      "updatedAt": "2025-10-04T04:02:20.747807Z",
      "_etag": "\"0400dc76-0000-2400-0000-68e09cf20000\""
    },
    {
      "id": "865656ec-aa83-42ba-93bc-7a652a34bebf",
      "name": "Bato",
      "cityCode": "LEY-07",
      "provinceCode": "LEY",
      "createdAt": "2025-10-04T04:02:20.747807Z",
      "updatedAt": "2025-10-04T04:02:20.747807Z",
      "_etag": "\"0400fb76-0000-2400-0000-68e09cf30000\""
    },
    {
      "id": "2904cd39-543a-4f12-b7d5-d1376fafaec5",
      "name": "Batuan",
      "cityCode": "BOH-07",
      "provinceCode": "BOH",
      "createdAt": "2025-10-04T04:02:20.747803Z",
      "updatedAt": "2025-10-04T04:02:20.747803Z",
      "_etag": "\"0400a171-0000-2400-0000-68e09cc40000\""
    },
    {
      "id": "4eb9b936-e61d-42c1-9db4-7159d8737c12",
      "name": "Batuan",
      "cityCode": "MAS-04",
      "provinceCode": "MAS",
      "createdAt": "2025-10-04T04:02:20.747808Z",
      "updatedAt": "2025-10-04T04:02:20.747808Z",
      "_etag": "\"04003077-0000-2400-0000-68e09cf50000\""
    },
    {
      "id": "29132cee-3e85-455c-965c-985d3bd7204e",
      "name": "Bauan",
      "cityCode": "BTG-06",
      "provinceCode": "BTG",
      "createdAt": "2025-10-04T04:02:20.747803Z",
      "updatedAt": "2025-10-04T04:02:20.747804Z",
      "_etag": "\"0400db71-0000-2400-0000-68e09cc60000\""
    },
    {
      "id": "e7121122-5651-41e1-adfa-1224ff300b5b",
      "name": "Bauang",
      "cityCode": "LAU-07",
      "provinceCode": "LAU",
      "createdAt": "2025-10-04T04:02:20.747806Z",
      "updatedAt": "2025-10-04T04:02:20.747806Z",
      "_etag": "\"04008275-0000-2400-0000-68e09ce70000\""
    },
    {
      "id": "bd2a4634-232f-4a94-97a0-776a3fa106b0",
      "name": "Bauko",
      "cityCode": "MOU-02",
      "provinceCode": "MOU",
      "createdAt": "2025-10-04T04:02:20.747804Z",
      "updatedAt": "2025-10-04T04:02:20.747804Z",
      "_etag": "\"04000772-0000-2400-0000-68e09cc80000\""
    },
    {
      "id": "78dbe442-7b24-44d1-819b-e2d01d5713d3",
      "name": "Baungon",
      "cityCode": "BUK-01",
      "provinceCode": "BUK",
      "createdAt": "2025-10-04T04:02:20.747804Z",
      "updatedAt": "2025-10-04T04:02:20.747804Z",
      "_etag": "\"04003372-0000-2400-0000-68e09cca0000\""
    },
    {
      "id": "40cfb228-03f1-4afd-988d-b951f70ed575",
      "name": "Bautista",
      "cityCode": "PAN-10",
      "provinceCode": "PAN",
      "createdAt": "2025-10-04T04:02:20.747805Z",
      "updatedAt": "2025-10-04T04:02:20.747805Z",
      "_etag": "\"04002b74-0000-2400-0000-68e09cdd0000\""
    },
    {
      "id": "dd226b1e-7888-4026-8778-cccbb7cc3f3e",
      "name": "Bay",
      "cityCode": "LAG-02",
      "provinceCode": "LAG",
      "createdAt": "2025-10-04T04:02:20.747804Z",
      "updatedAt": "2025-10-04T04:02:20.747804Z",
      "_etag": "\"04006472-0000-2400-0000-68e09ccc0000\""
    },
    {
      "id": "4823702e-bb69-4b8b-a0eb-46d907685686",
      "name": "Bayabas",
      "cityCode": "SUR-02",
      "provinceCode": "SUR",
      "createdAt": "2025-10-04T04:02:20.747804Z",
      "updatedAt": "2025-10-04T04:02:20.747805Z",
      "_etag": "\"0400ad72-0000-2400-0000-68e09ccf0000\""
    },
    {
      "id": "3c6d2be5-48da-4812-a76a-b2ec71577cd8",
      "name": "Bayambang",
      "cityCode": "PAN-11",
      "provinceCode": "PAN",
      "createdAt": "2025-10-04T04:02:20.747806Z",
      "updatedAt": "2025-10-04T04:02:20.747806Z",
      "_etag": "\"0400d875-0000-2400-0000-68e09ce90000\""
    },
    {
      "id": "b9a9e059-a4c0-408f-b0c8-7e1149af66ee",
      "name": "Bayang",
      "cityCode": "LAN-04",
      "provinceCode": "LAN",
      "createdAt": "2025-10-04T04:02:20.747808Z",
      "updatedAt": "2025-10-04T04:02:20.747808Z",
      "_etag": "\"04007977-0000-2400-0000-68e09cf80000\""
    },
    {
      "id": "b9601fa0-d190-4567-994a-f37d7abf4323",
      "name": "Bayog",
      "cityCode": "ZAS-03",
      "provinceCode": "ZAS",
      "createdAt": "2025-10-04T04:02:20.747808Z",
      "updatedAt": "2025-10-04T04:02:20.747808Z",
      "_etag": "\"0400bb77-0000-2400-0000-68e09cfa0000\""
    },
    {
      "id": "3834204c-d7c6-4188-9f09-44d97dcc758f",
      "name": "Bayombong (Capital)",
      "cityCode": "NUV-05",
      "provinceCode": "NUV",
      "createdAt": "2025-10-04T04:02:20.747808Z",
      "updatedAt": "2025-10-04T04:02:20.747808Z",
      "_etag": "\"04003878-0000-2400-0000-68e09cfe0000\""
    },
    {
      "id": "5c963f87-f1ce-49ad-8a0e-a37ec9c48787",
      "name": "Belison",
      "cityCode": "ANT-03",
      "provinceCode": "ANT",
      "createdAt": "2025-10-04T04:02:20.747808Z",
      "updatedAt": "2025-10-04T04:02:20.747808Z",
      "_etag": "\"04008278-0000-2400-0000-68e09d000000\""
    },
    {
      "id": "ce2a4091-f6dc-4451-86ff-5aae077ee337",
      "name": "Benito Soliven",
      "cityCode": "ISA-04",
      "provinceCode": "ISA",
      "createdAt": "2025-10-04T04:02:20.747808Z",
      "updatedAt": "2025-10-04T04:02:20.747808Z",
      "_etag": "\"0400b878-0000-2400-0000-68e09d030000\""
    },
    {
      "id": "b071c836-4c33-49b2-8968-9006cc34737b",
      "name": "Besao",
      "cityCode": "MOU-03",
      "provinceCode": "MOU",
      "createdAt": "2025-10-04T04:02:20.747809Z",
      "updatedAt": "2025-10-04T04:02:20.747809Z",
      "_etag": "\"0400f578-0000-2400-0000-68e09d050000\""
    },
    {
      "id": "cc1e7dc5-e29d-4989-8407-36579d13a4dd",
      "name": "Bien Unido",
      "cityCode": "BOH-48",
      "provinceCode": "BOH",
      "createdAt": "2025-10-04T04:02:20.747809Z",
      "updatedAt": "2025-10-04T04:02:20.747809Z",
      "_etag": "\"04003479-0000-2400-0000-68e09d080000\""
    },
    {
      "id": "adb95e23-e33c-4b92-ba50-507a3518bd61",
      "name": "Bilar",
      "cityCode": "BOH-08",
      "provinceCode": "BOH",
      "createdAt": "2025-10-04T04:02:20.747809Z",
      "updatedAt": "2025-10-04T04:02:20.747809Z",
      "_etag": "\"04006579-0000-2400-0000-68e09d090000\""
    },
    {
      "id": "24a701d1-e4d4-42e6-8bda-29331daff52e",
      "name": "Biliran",
      "cityCode": "BIL-02",
      "provinceCode": "BIL",
      "createdAt": "2025-10-04T04:02:20.747809Z",
      "updatedAt": "2025-10-04T04:02:20.747809Z",
      "_etag": "\"04008c79-0000-2400-0000-68e09d0b0000\""
    },
    {
      "id": "b7530fc2-707b-4f12-bf3a-51d0ea713a5c",
      "name": "Binalbagan",
      "cityCode": "NEC-03",
      "provinceCode": "NEC",
      "createdAt": "2025-10-04T04:02:20.74781Z",
      "updatedAt": "2025-10-04T04:02:20.74781Z",
      "_etag": "\"04007f7a-0000-2400-0000-68e09d150000\""
    },
    {
      "id": "806197df-fc5d-47ea-a3ac-bfa07ce5f2e6",
      "name": "Binalonan",
      "cityCode": "PAN-12",
      "provinceCode": "PAN",
      "createdAt": "2025-10-04T04:02:20.74781Z",
      "updatedAt": "2025-10-04T04:02:20.74781Z",
      "_etag": "\"0400f87a-0000-2400-0000-68e09d1a0000\""
    },
    {
      "id": "7d7af482-4e43-4133-a76f-7ffb1386531d",
      "name": "Binangonan",
      "cityCode": "RIZ-04",
      "provinceCode": "RIZ",
      "createdAt": "2025-10-04T04:02:20.747811Z",
      "updatedAt": "2025-10-04T04:02:20.747811Z",
      "_etag": "\"0400887b-0000-2400-0000-68e09d1f0000\""
    },
    {
      "id": "7cfa4d4a-9e03-4ee0-a8e5-d3de0d5fb9c2",
      "name": "Bindoy (Payabon)",
      "cityCode": "NER-07",
      "provinceCode": "NER",
      "createdAt": "2025-10-04T04:02:20.747811Z",
      "updatedAt": "2025-10-04T04:02:20.747811Z",
      "_etag": "\"0400137c-0000-2400-0000-68e09d230000\""
    },
    {
      "id": "a53130e9-3203-4d6b-9c60-d542103cb190",
      "name": "Bingawan",
      "cityCode": "ILO-10",
      "provinceCode": "ILO",
      "createdAt": "2025-10-04T04:07:39.91516Z",
      "updatedAt": "2025-10-04T04:07:39.91516Z",
      "_etag": "\"0400e78b-0000-2400-0000-68e09dcd0000\""
    },
    {
      "id": "59e86390-57bb-4e68-a7c6-9e054e019152",
      "name": "Binidayan",
      "cityCode": "LAN-05",
      "provinceCode": "LAN",
      "createdAt": "2025-10-04T04:07:39.915164Z",
      "updatedAt": "2025-10-04T04:07:39.915164Z",
      "_etag": "\"0400988c-0000-2400-0000-68e09dd40000\""
    },
    {
      "id": "99ddd177-5884-4f23-9a31-8742f5b4e4fb",
      "name": "Binmaley",
      "cityCode": "PAN-13",
      "provinceCode": "PAN",
      "createdAt": "2025-10-04T04:07:39.915164Z",
      "updatedAt": "2025-10-04T04:07:39.915164Z",
      "_etag": "\"0400e28c-0000-2400-0000-68e09dd60000\""
    },
    {
      "id": "645f39b9-270a-4166-80c2-a6648f87dba0",
      "name": "Binondo",
      "cityCode": "NCR1-02",
      "provinceCode": "NCR1",
      "createdAt": "2025-10-04T04:07:39.915165Z",
      "updatedAt": "2025-10-04T04:07:39.915165Z",
      "_etag": "\"0400218d-0000-2400-0000-68e09dd90000\""
    },
    {
      "id": "d7578f02-c7f7-4c89-9f43-3aaf2939a5f9",
      "name": "Binuangan",
      "cityCode": "MSR-04",
      "provinceCode": "MSR",
      "createdAt": "2025-10-04T04:07:39.915165Z",
      "updatedAt": "2025-10-04T04:07:39.915165Z",
      "_etag": "\"0400688d-0000-2400-0000-68e09ddb0000\""
    },
    {
      "id": "e78639b6-8ee5-4bcd-8fe0-66203351cdb3",
      "name": "Biri",
      "cityCode": "NSA-02",
      "provinceCode": "NSA",
      "createdAt": "2025-10-04T04:07:39.915165Z",
      "updatedAt": "2025-10-04T04:07:39.915165Z",
      "_etag": "\"04009e8d-0000-2400-0000-68e09ddd0000\""
    },
    {
      "id": "003e7254-f4ef-4156-b63d-1a403a0c0ebe",
      "name": "Boac (Capital)",
      "cityCode": "MAD-01",
      "provinceCode": "MAD",
      "createdAt": "2025-10-04T04:07:39.915165Z",
      "updatedAt": "2025-10-04T04:07:39.915165Z",
      "_etag": "\"04000b8e-0000-2400-0000-68e09de20000\""
    },
    {
      "id": "40bc76b7-f66f-48a0-ad88-b44c865302ba",
      "name": "Bobon",
      "cityCode": "NSA-03",
      "provinceCode": "NSA",
      "createdAt": "2025-10-04T04:07:39.915165Z",
      "updatedAt": "2025-10-04T04:07:39.915165Z",
      "_etag": "\"0400778e-0000-2400-0000-68e09de60000\""
    },
    {
      "id": "b20a3511-bdd9-452b-b003-31a32192fee1",
      "name": "Bocaue",
      "cityCode": "BUL-04",
      "provinceCode": "BUL",
      "createdAt": "2025-10-04T04:07:39.915165Z",
      "updatedAt": "2025-10-04T04:07:39.915166Z",
      "_etag": "\"0400a18e-0000-2400-0000-68e09de90000\""
    },
    {
      "id": "08e19437-7910-42b4-b936-16526a6857de",
      "name": "Bokod",
      "cityCode": "BEN-04",
      "provinceCode": "BEN",
      "createdAt": "2025-10-04T04:07:39.915166Z",
      "updatedAt": "2025-10-04T04:07:39.915166Z",
      "_etag": "\"0400d18e-0000-2400-0000-68e09deb0000\""
    },
    {
      "id": "c61fd2a1-fa50-4e5b-88af-1b8218eb746a",
      "name": "Bolinao",
      "cityCode": "PAN-14",
      "provinceCode": "PAN",
      "createdAt": "2025-10-04T04:07:39.915166Z",
      "updatedAt": "2025-10-04T04:07:39.915166Z",
      "_etag": "\"0400088f-0000-2400-0000-68e09ded0000\""
    },
    {
      "id": "272d1e0c-c4b2-4e77-ba75-38ce376799ae",
      "name": "Boliney",
      "cityCode": "ABR-02",
      "provinceCode": "ABR",
      "createdAt": "2025-10-04T04:07:39.915166Z",
      "updatedAt": "2025-10-04T04:07:39.915166Z",
      "_etag": "\"04004f8f-0000-2400-0000-68e09df00000\""
    },
    {
      "id": "bacc3a03-e8b9-4696-827e-f1293dae7403",
      "name": "Boljoon",
      "cityCode": "CEB-12",
      "provinceCode": "CEB",
      "createdAt": "2025-10-04T04:07:39.91517Z",
      "updatedAt": "2025-10-04T04:07:39.91517Z",
      "_etag": "\"04000c95-0000-2400-0000-68e09e2e0000\""
    },
    {
      "id": "7fb0b933-3c7b-4af2-a2ef-c08bf6dea429",
      "name": "Bombon",
      "cityCode": "CAS-04",
      "provinceCode": "CAS",
      "createdAt": "2025-10-04T04:07:39.915166Z",
      "updatedAt": "2025-10-04T04:07:39.915166Z",
      "_etag": "\"04008f8f-0000-2400-0000-68e09df20000\""
    },
    {
      "id": "8f981178-ec64-488c-9bf2-444612017598",
      "name": "Bongabon",
      "cityCode": "NUE-02",
      "provinceCode": "NUE",
      "createdAt": "2025-10-04T04:07:39.915166Z",
      "updatedAt": "2025-10-04T04:07:39.915167Z",
      "_etag": "\"0400cf8f-0000-2400-0000-68e09df40000\""
    },
    {
      "id": "69b10a3d-7261-48de-a127-a5a9864acb0c",
      "name": "Bongabong",
      "cityCode": "MNR-03",
      "provinceCode": "MNR",
      "createdAt": "2025-10-04T04:07:39.915167Z",
      "updatedAt": "2025-10-04T04:07:39.915167Z",
      "_etag": "\"04000590-0000-2400-0000-68e09df60000\""
    },
    {
      "id": "a0ae627c-5394-4143-a115-3b22dc3269ce",
      "name": "Bongao (Capital)",
      "cityCode": "TAW-02",
      "provinceCode": "TAW",
      "createdAt": "2025-10-04T04:07:39.915167Z",
      "updatedAt": "2025-10-04T04:07:39.915167Z",
      "_etag": "\"04004190-0000-2400-0000-68e09df80000\""
    },
    {
      "id": "95262343-49b9-4ce8-ba2c-5a8bdc8b939f",
      "name": "Bonifacio",
      "cityCode": "MSC-03",
      "provinceCode": "MSC",
      "createdAt": "2025-10-04T04:07:39.915167Z",
      "updatedAt": "2025-10-04T04:07:39.915167Z",
      "_etag": "\"04006e90-0000-2400-0000-68e09dfa0000\""
    },
    {
      "id": "90ae2b98-6e59-4544-9191-6504e4e51167",
      "name": "Bontoc",
      "cityCode": "SLE-02",
      "provinceCode": "SLE",
      "createdAt": "2025-10-04T04:07:39.915167Z",
      "updatedAt": "2025-10-04T04:07:39.915167Z",
      "_etag": "\"0400a690-0000-2400-0000-68e09dfc0000\""
    },
    {
      "id": "78f90439-d7a4-4fa9-8e99-e0f16fdb2c92",
      "name": "Bontoc (Capital)",
      "cityCode": "MOU-04",
      "provinceCode": "MOU",
      "createdAt": "2025-10-04T04:07:39.915167Z",
      "updatedAt": "2025-10-04T04:07:39.915167Z",
      "_etag": "\"0400e790-0000-2400-0000-68e09dfe0000\""
    },
    {
      "id": "2ee89653-aa83-4808-b699-dc0334d147c1",
      "name": "Borbon",
      "cityCode": "CEB-13",
      "provinceCode": "CEB",
      "createdAt": "2025-10-04T04:07:39.915167Z",
      "updatedAt": "2025-10-04T04:07:39.915167Z",
      "_etag": "\"04001e91-0000-2400-0000-68e09e000000\""
    },
    {
      "id": "37b453a2-8a9a-42c9-aadf-6cf5b55a78e4",
      "name": "Boston",
      "cityCode": "DAR-03",
      "provinceCode": "DAR",
      "createdAt": "2025-10-04T04:07:39.915167Z",
      "updatedAt": "2025-10-04T04:07:39.915167Z",
      "_etag": "\"04004e91-0000-2400-0000-68e09e020000\""
    },
    {
      "id": "72982aa1-3b39-486e-a0cd-eccd0b2bf872",
      "name": "Botolan",
      "cityCode": "ZAM-01",
      "provinceCode": "ZAM",
      "createdAt": "2025-10-04T04:07:39.915168Z",
      "updatedAt": "2025-10-04T04:07:39.915168Z",
      "_etag": "\"04007f91-0000-2400-0000-68e09e040000\""
    },
    {
      "id": "ff31a19c-e58b-4779-ae07-bbb0f81c4394",
      "name": "Braulio E. Dujali",
      "cityCode": "DAN-23",
      "provinceCode": "DAN",
      "createdAt": "2025-10-04T04:07:39.915168Z",
      "updatedAt": "2025-10-04T04:07:39.915168Z",
      "_etag": "\"0400b591-0000-2400-0000-68e09e070000\""
    },
    {
      "id": "07ad021e-a71f-44a1-bff4-6ddd9a81cc86",
      "name": "Brooke's Point",
      "cityCode": "PAL-06",
      "provinceCode": "PAL",
      "createdAt": "2025-10-04T04:07:39.915168Z",
      "updatedAt": "2025-10-04T04:07:39.915168Z",
      "_etag": "\"0400e791-0000-2400-0000-68e09e090000\""
    },
    {
      "id": "020b1a59-f045-4fa7-a4aa-63252dd14e12",
      "name": "Buadiposo-buntong",
      "cityCode": "LAN-33",
      "provinceCode": "LAN",
      "createdAt": "2025-10-04T04:07:39.915168Z",
      "updatedAt": "2025-10-04T04:07:39.915168Z",
      "_etag": "\"04002e92-0000-2400-0000-68e09e0b0000\""
    },
    {
      "id": "43efab2a-8c90-4905-8f10-56e08a862e6e",
      "name": "Bubong",
      "cityCode": "LAN-06",
      "provinceCode": "LAN",
      "createdAt": "2025-10-04T04:07:39.915168Z",
      "updatedAt": "2025-10-04T04:07:39.915168Z",
      "_etag": "\"04006392-0000-2400-0000-68e09e0e0000\""
    },
    {
      "id": "36485bc1-ffd1-4c8e-8971-ecb24a694e2d",
      "name": "Bucay",
      "cityCode": "ABR-03",
      "provinceCode": "ABR",
      "createdAt": "2025-10-04T04:07:39.915169Z",
      "updatedAt": "2025-10-04T04:07:39.915169Z",
      "_etag": "\"04009192-0000-2400-0000-68e09e100000\""
    },
    {
      "id": "4fd1018e-6459-42f2-acdc-e1296a13f7be",
      "name": "Bucloc",
      "cityCode": "ABR-04",
      "provinceCode": "ABR",
      "createdAt": "2025-10-04T04:07:39.915169Z",
      "updatedAt": "2025-10-04T04:07:39.915169Z",
      "_etag": "\"0400cb92-0000-2400-0000-68e09e120000\""
    },
    {
      "id": "8a8da757-03bc-472d-bbc2-99149f4bbbc4",
      "name": "Buenavista",
      "cityCode": "GUI-01",
      "provinceCode": "GUI",
      "createdAt": "2025-10-04T04:07:39.915169Z",
      "updatedAt": "2025-10-04T04:07:39.915169Z",
      "_etag": "\"0400fe92-0000-2400-0000-68e09e150000\""
    },
    {
      "id": "83103912-ccc6-4722-aa7a-d0caa03f09b3",
      "name": "Buenavista",
      "cityCode": "AGN-01",
      "provinceCode": "AGN",
      "createdAt": "2025-10-04T04:07:39.915169Z",
      "updatedAt": "2025-10-04T04:07:39.915169Z",
      "_etag": "\"04002693-0000-2400-0000-68e09e160000\""
    },
    {
      "id": "f4312826-644e-4bbd-823f-f4b07d18e7f9",
      "name": "Buenavista",
      "cityCode": "BOH-09",
      "provinceCode": "BOH",
      "createdAt": "2025-10-04T04:07:39.915169Z",
      "updatedAt": "2025-10-04T04:07:39.915169Z",
      "_etag": "\"04005493-0000-2400-0000-68e09e190000\""
    },
    {
      "id": "48802466-9bea-4d4b-87ea-6b54210eb027",
      "name": "Buenavista",
      "cityCode": "MAD-02",
      "provinceCode": "MAD",
      "createdAt": "2025-10-04T04:07:39.915169Z",
      "updatedAt": "2025-10-04T04:07:39.915169Z",
      "_etag": "\"04007393-0000-2400-0000-68e09e1a0000\""
    },
    {
      "id": "54866498-4839-4ac3-914e-84998afb82e3",
      "name": "Buenavista",
      "cityCode": "QUE-05",
      "provinceCode": "QUE",
      "createdAt": "2025-10-04T04:07:39.915169Z",
      "updatedAt": "2025-10-04T04:07:39.915169Z",
      "_etag": "\"0400b993-0000-2400-0000-68e09e1d0000\""
    },
    {
      "id": "db29f2bd-9209-4e3d-9217-71a90a408ffd",
      "name": "Bugallon",
      "cityCode": "PAN-15",
      "provinceCode": "PAN",
      "createdAt": "2025-10-04T04:07:39.915169Z",
      "updatedAt": "2025-10-04T04:07:39.91517Z",
      "_etag": "\"0400db93-0000-2400-0000-68e09e1e0000\""
    },
    {
      "id": "e6d4cca4-6ad7-4cf6-ba9e-30f5a8953832",
      "name": "Bugasong",
      "cityCode": "ANT-04",
      "provinceCode": "ANT",
      "createdAt": "2025-10-04T04:07:39.915171Z",
      "updatedAt": "2025-10-04T04:07:39.915171Z",
      "_etag": "\"04002e95-0000-2400-0000-68e09e300000\""
    },
    {
      "id": "82c8829e-c6f8-45d4-ae91-484f85a4a47c",
      "name": "Buguey",
      "cityCode": "CAG-08",
      "provinceCode": "CAG",
      "createdAt": "2025-10-04T04:07:39.915171Z",
      "updatedAt": "2025-10-04T04:07:39.915171Z",
      "_etag": "\"04005f95-0000-2400-0000-68e09e320000\""
    },
    {
      "id": "444088f0-0a47-4305-a9de-c16b7d452ba7",
      "name": "Buguias",
      "cityCode": "BEN-05",
      "provinceCode": "BEN",
      "createdAt": "2025-10-04T04:07:39.915171Z",
      "updatedAt": "2025-10-04T04:07:39.915171Z",
      "_etag": "\"0400a195-0000-2400-0000-68e09e350000\""
    },
    {
      "id": "177c3efd-a73d-4846-a96b-31a33e923978",
      "name": "Buhi",
      "cityCode": "CAS-05",
      "provinceCode": "CAS",
      "createdAt": "2025-10-04T04:07:39.915172Z",
      "updatedAt": "2025-10-04T04:07:39.915172Z",
      "_etag": "\"0400df95-0000-2400-0000-68e09e370000\""
    },
    {
      "id": "43249c7b-69e2-41f6-b747-ae4a33e47575",
      "name": "Bula",
      "cityCode": "CAS-06",
      "provinceCode": "CAS",
      "createdAt": "2025-10-04T04:07:39.915172Z",
      "updatedAt": "2025-10-04T04:07:39.915172Z",
      "_etag": "\"04002096-0000-2400-0000-68e09e3a0000\""
    },
    {
      "id": "be3a4e8d-4524-41cf-b977-fabfe6ee6370",
      "name": "Bulacan",
      "cityCode": "BUL-05",
      "provinceCode": "BUL",
      "createdAt": "2025-10-04T04:07:39.915172Z",
      "updatedAt": "2025-10-04T04:07:39.915172Z",
      "_etag": "\"04005c96-0000-2400-0000-68e09e3c0000\""
    },
    {
      "id": "37cd0461-cdec-4973-8e8d-598fbd4b9c34",
      "name": "Bulalacao (San Pedro)",
      "cityCode": "MNR-04",
      "provinceCode": "MNR",
      "createdAt": "2025-10-04T04:07:39.915172Z",
      "updatedAt": "2025-10-04T04:07:39.915172Z",
      "_etag": "\"04009b96-0000-2400-0000-68e09e3e0000\""
    },
    {
      "id": "ae609e74-3286-4868-9f5d-9a588a0c21d3",
      "name": "Bulan",
      "cityCode": "SOR-03",
      "provinceCode": "SOR",
      "createdAt": "2025-10-04T04:07:39.915172Z",
      "updatedAt": "2025-10-04T04:07:39.915172Z",
      "_etag": "\"0400c996-0000-2400-0000-68e09e400000\""
    },
    {
      "id": "5ae7b622-7c8a-4815-92f0-096ba640eabb",
      "name": "Buldon",
      "cityCode": "MAG-02",
      "provinceCode": "MAG",
      "createdAt": "2025-10-04T04:07:39.915172Z",
      "updatedAt": "2025-10-04T04:07:39.915172Z",
      "_etag": "\"0400e296-0000-2400-0000-68e09e410000\""
    },
    {
      "id": "b43a2375-1812-42e3-b9d7-caf41e2a0a11",
      "name": "Buluan",
      "cityCode": "MAG-03",
      "provinceCode": "MAG",
      "createdAt": "2025-10-04T04:07:39.915172Z",
      "updatedAt": "2025-10-04T04:07:39.915172Z",
      "_etag": "\"04001b97-0000-2400-0000-68e09e440000\""
    },
    {
      "id": "b21225e7-5dde-4ccd-9e50-3488ff64c37e",
      "name": "Bulusan",
      "cityCode": "SOR-04",
      "provinceCode": "SOR",
      "createdAt": "2025-10-04T04:07:39.915172Z",
      "updatedAt": "2025-10-04T04:07:39.915172Z",
      "_etag": "\"04002597-0000-2400-0000-68e09e450000\""
    },
    {
      "id": "4f24f43b-155e-4436-b455-d27949b056f5",
      "name": "Bumbaran",
      "cityCode": "LAN-37",
      "provinceCode": "LAN",
      "createdAt": "2025-10-04T04:07:39.915173Z",
      "updatedAt": "2025-10-04T04:07:39.915173Z",
      "_etag": "\"04006b97-0000-2400-0000-68e09e480000\""
    },
    {
      "id": "f2fc934f-1814-4294-94e3-6cbff4d0d3e9",
      "name": "Bunawan",
      "cityCode": "AGS-02",
      "provinceCode": "AGS",
      "createdAt": "2025-10-04T04:07:39.915173Z",
      "updatedAt": "2025-10-04T04:07:39.915173Z",
      "_etag": "\"0400a197-0000-2400-0000-68e09e4a0000\""
    },
    {
      "id": "52ce9831-01bb-4d1e-957e-11f95995087b",
      "name": "Burauen",
      "cityCode": "LEY-10",
      "provinceCode": "LEY",
      "createdAt": "2025-10-04T04:07:39.915173Z",
      "updatedAt": "2025-10-04T04:07:39.915173Z",
      "_etag": "\"0400d897-0000-2400-0000-68e09e4d0000\""
    },
    {
      "id": "436bebb4-744d-459d-9cc3-b9cabab2d52e",
      "name": "Burdeos",
      "cityCode": "QUE-06",
      "provinceCode": "QUE",
      "createdAt": "2025-10-04T04:07:39.915173Z",
      "updatedAt": "2025-10-04T04:07:39.915173Z",
      "_etag": "\"04003998-0000-2400-0000-68e09e500000\""
    },
    {
      "id": "0f46a71c-e181-48bd-8ca7-b1d6ea2cd15a",
      "name": "Burgos",
      "cityCode": "ILS-04",
      "provinceCode": "ILS",
      "createdAt": "2025-10-04T04:07:39.915197Z",
      "updatedAt": "2025-10-04T04:07:39.915197Z",
      "_etag": "\"04005298-0000-2400-0000-68e09e510000\""
    },
    {
      "id": "c03357ea-6457-401b-8f25-3e787e72bce0",
      "name": "Burgos",
      "cityCode": "ILN-06",
      "provinceCode": "ILN",
      "createdAt": "2025-10-04T04:07:39.915198Z",
      "updatedAt": "2025-10-04T04:07:39.915198Z",
      "_etag": "\"04009398-0000-2400-0000-68e09e530000\""
    },
    {
      "id": "7287c31c-1a26-4c12-8061-3b1b2a641a86",
      "name": "Burgos",
      "cityCode": "LAU-08",
      "provinceCode": "LAU",
      "createdAt": "2025-10-04T04:07:39.915198Z",
      "updatedAt": "2025-10-04T04:07:39.915198Z",
      "_etag": "\"0400d198-0000-2400-0000-68e09e560000\""
    },
    {
      "id": "3a290715-c22b-4949-bebc-3e858e5c6947",
      "name": "Burgos",
      "cityCode": "PAN-16",
      "provinceCode": "PAN",
      "createdAt": "2025-10-04T04:07:39.915198Z",
      "updatedAt": "2025-10-04T04:07:39.915198Z",
      "_etag": "\"04000799-0000-2400-0000-68e09e590000\""
    },
    {
      "id": "cfd220c4-5e93-4959-8881-460454bcb0d6",
      "name": "Burgos",
      "cityCode": "ISA-05",
      "provinceCode": "ISA",
      "createdAt": "2025-10-04T04:07:39.915198Z",
      "updatedAt": "2025-10-04T04:07:39.915198Z",
      "_etag": "\"04004099-0000-2400-0000-68e09e5c0000\""
    },
    {
      "id": "76c32283-3eca-4221-bfea-60feaa2b8920",
      "name": "Burgos",
      "cityCode": "SUN-04",
      "provinceCode": "SUN",
      "createdAt": "2025-10-04T04:07:39.915198Z",
      "updatedAt": "2025-10-04T04:07:39.915198Z",
      "_etag": "\"04006e99-0000-2400-0000-68e09e5d0000\""
    },
    {
      "id": "59b547fb-7dd7-4b3b-a694-128bd6bd9f8b",
      "name": "Buruanga",
      "cityCode": "AKL-05",
      "provinceCode": "AKL",
      "createdAt": "2025-10-04T04:07:39.915198Z",
      "updatedAt": "2025-10-04T04:07:39.915199Z",
      "_etag": "\"0400a099-0000-2400-0000-68e09e600000\""
    },
    {
      "id": "0693b1bc-bc2b-4103-9475-e57935cbf37b",
      "name": "Bustos",
      "cityCode": "BUL-06",
      "provinceCode": "BUL",
      "createdAt": "2025-10-04T04:07:39.915199Z",
      "updatedAt": "2025-10-04T04:07:39.915199Z",
      "_etag": "\"0400cc99-0000-2400-0000-68e09e620000\""
    },
    {
      "id": "644b02b8-068c-49a2-b94e-0e8682537f68",
      "name": "Busuanga",
      "cityCode": "PAL-07",
      "provinceCode": "PAL",
      "createdAt": "2025-10-04T04:07:39.915199Z",
      "updatedAt": "2025-10-04T04:07:39.915199Z",
      "_etag": "\"0400fc99-0000-2400-0000-68e09e640000\""
    },
    {
      "id": "e1535626-4d24-4dbd-8178-b6c02f87b19c",
      "name": "Butig",
      "cityCode": "LAN-07",
      "provinceCode": "LAN",
      "createdAt": "2025-10-04T04:07:39.915199Z",
      "updatedAt": "2025-10-04T04:07:39.915199Z",
      "_etag": "\"0400389a-0000-2400-0000-68e09e670000\""
    },
    {
      "id": "60e32597-29df-426b-af4f-41b3a872f0af",
      "name": "Butuan City (Capital)",
      "cityCode": "AGN-02",
      "provinceCode": "AGN",
      "createdAt": "2025-10-04T04:07:39.915199Z",
      "updatedAt": "2025-10-04T04:07:39.915199Z",
      "_etag": "\"0400709a-0000-2400-0000-68e09e690000\""
    },
    {
      "id": "c6933f8e-6f37-4a25-bf79-6e6304922ed8",
      "name": "Buug",
      "cityCode": "ZSI-02",
      "provinceCode": "ZSI",
      "createdAt": "2025-10-04T04:07:39.915199Z",
      "updatedAt": "2025-10-04T04:07:39.915199Z",
      "_etag": "\"0400a29a-0000-2400-0000-68e09e6b0000\""
    },
    {
      "id": "8d769555-bda5-4682-88de-86e709d500b8",
      "name": "Caba",
      "cityCode": "LAU-09",
      "provinceCode": "LAU",
      "createdAt": "2025-10-04T04:07:39.915199Z",
      "updatedAt": "2025-10-04T04:07:39.9152Z",
      "_etag": "\"04000d9b-0000-2400-0000-68e09e6e0000\""
    },
    {
      "id": "2db1669f-3c9a-4b38-b083-b634f1d86b0b",
      "name": "Cabagan",
      "cityCode": "ISA-06",
      "provinceCode": "ISA",
      "createdAt": "2025-10-04T04:07:39.915199Z",
      "updatedAt": "2025-10-04T04:07:39.915199Z",
      "_etag": "\"0400d59a-0000-2400-0000-68e09e6c0000\""
    },
    {
      "id": "74b931c2-50b5-40d6-bafd-008bb0304c78",
      "name": "Cabanatuan City",
      "cityCode": "NUE-03",
      "provinceCode": "NUE",
      "createdAt": "2025-10-04T04:07:39.915209Z",
      "updatedAt": "2025-10-04T04:07:39.915209Z",
      "_etag": "\"0400bea1-0000-2400-0000-68e09eb60000\""
    },
    {
      "id": "a99c5b3d-92e5-4563-8a81-3ba5265c7683",
      "name": "Cabangan",
      "cityCode": "ZAM-02",
      "provinceCode": "ZAM",
      "createdAt": "2025-10-04T04:07:39.915201Z",
      "updatedAt": "2025-10-04T04:07:39.915201Z",
      "_etag": "\"0400f19c-0000-2400-0000-68e09e810000\""
    },
    {
      "id": "2fe1de4e-12b1-46a4-9a94-244950d3c2fe",
      "name": "Cabanglasan",
      "cityCode": "BUK-22",
      "provinceCode": "BUK",
      "createdAt": "2025-10-04T04:07:39.915201Z",
      "updatedAt": "2025-10-04T04:07:39.915201Z",
      "_etag": "\"0400ba9c-0000-2400-0000-68e09e7f0000\""
    },
    {
      "id": "237ec60c-ea0e-4857-8a51-343e25db2354",
      "name": "Cabarroguis (Capital)",
      "cityCode": "QUI-02",
      "provinceCode": "QUI",
      "createdAt": "2025-10-04T04:07:39.915212Z",
      "updatedAt": "2025-10-04T04:07:39.915212Z",
      "_etag": "\"0400d1a2-0000-2400-0000-68e09ec10000\""
    },
    {
      "id": "39f13e54-bb43-4320-a119-0cafb898bd2b",
      "name": "Cabatuan",
      "cityCode": "ISA-07",
      "provinceCode": "ISA",
      "createdAt": "2025-10-04T04:07:39.915201Z",
      "updatedAt": "2025-10-04T04:07:39.915201Z",
      "_etag": "\"0400b19d-0000-2400-0000-68e09e880000\""
    },
    {
      "id": "c2b29036-239a-4652-a402-84fd28695e6c",
      "name": "Cabatuan",
      "cityCode": "ILO-12",
      "provinceCode": "ILO",
      "createdAt": "2025-10-04T04:07:39.915203Z",
      "updatedAt": "2025-10-04T04:07:39.915203Z",
      "_etag": "\"0400059f-0000-2400-0000-68e09e980000\""
    },
    {
      "id": "aa8461ae-2109-40fc-848c-1ac948deed5e",
      "name": "Cabiao",
      "cityCode": "NUE-04",
      "provinceCode": "NUE",
      "createdAt": "2025-10-04T04:07:39.915212Z",
      "updatedAt": "2025-10-04T04:07:39.915212Z",
      "_etag": "\"0400f4a2-0000-2400-0000-68e09ec30000\""
    },
    {
      "id": "08fa8560-456f-48fa-b602-88b1bcc7a695",
      "name": "Cabucgayan",
      "cityCode": "BIL-03",
      "provinceCode": "BIL",
      "createdAt": "2025-10-04T04:07:39.915203Z",
      "updatedAt": "2025-10-04T04:07:39.915203Z",
      "_etag": "\"0400119f-0000-2400-0000-68e09e990000\""
    },
    {
      "id": "ea3d5789-5c67-4f7b-8df0-d97f83b57789",
      "name": "Cabugao",
      "cityCode": "ILS-05",
      "provinceCode": "ILS",
      "createdAt": "2025-10-04T04:07:39.915201Z",
      "updatedAt": "2025-10-04T04:07:39.915201Z",
      "_etag": "\"0400e39d-0000-2400-0000-68e09e8b0000\""
    },
    {
      "id": "30dc912d-5271-4e04-bccc-0eb4d33be3ee",
      "name": "Cabusao",
      "cityCode": "CAS-07",
      "provinceCode": "CAS",
      "createdAt": "2025-10-04T04:07:39.915261Z",
      "updatedAt": "2025-10-04T04:07:39.915261Z",
      "_etag": "\"04004da7-0000-2400-0000-68e09ef00000\""
    },
    {
      "id": "7cfcdf46-a07d-4837-83a0-c5ef53242ef8",
      "name": "Cabuyao City",
      "cityCode": "LAG-04",
      "provinceCode": "LAG",
      "createdAt": "2025-10-04T04:07:39.915204Z",
      "updatedAt": "2025-10-04T04:07:39.915204Z",
      "_etag": "\"0400489f-0000-2400-0000-68e09e9b0000\""
    },
    {
      "id": "0adda697-8bbb-42c5-8c98-7437de64752b",
      "name": "Cadiz City",
      "cityCode": "NEC-04",
      "provinceCode": "NEC",
      "createdAt": "2025-10-04T04:07:39.915202Z",
      "updatedAt": "2025-10-04T04:07:39.915202Z",
      "_etag": "\"0400269e-0000-2400-0000-68e09e8f0000\""
    },
    {
      "id": "752c9360-400c-4321-b2ea-13787b848b6f",
      "name": "Cagayan De Oro City (Capital)",
      "cityCode": "MSR-05",
      "provinceCode": "MSR",
      "createdAt": "2025-10-04T04:07:39.915261Z",
      "updatedAt": "2025-10-04T04:07:39.915261Z",
      "_etag": "\"040031a7-0000-2400-0000-68e09eef0000\""
    },
    {
      "id": "cd9096d9-e729-45ae-b8ce-041833e291e6",
      "name": "Cagayancillo",
      "cityCode": "PAL-08",
      "provinceCode": "PAL",
      "createdAt": "2025-10-04T04:07:39.915204Z",
      "updatedAt": "2025-10-04T04:07:39.915204Z",
      "_etag": "\"04003e9f-0000-2400-0000-68e09e9b0000\""
    },
    {
      "id": "25cb2f2b-f869-4f4d-af50-590f5a3a789a",
      "name": "Cagdianao",
      "cityCode": "DIN-02",
      "provinceCode": "DIN",
      "createdAt": "2025-10-04T04:07:39.915202Z",
      "updatedAt": "2025-10-04T04:07:39.915202Z",
      "_etag": "\"04006f9e-0000-2400-0000-68e09e920000\""
    },
    {
      "id": "b7cefd85-606b-48f3-8286-8905887169d5",
      "name": "Cagwait",
      "cityCode": "SUR-04",
      "provinceCode": "SUR",
      "createdAt": "2025-10-04T04:07:39.915262Z",
      "updatedAt": "2025-10-04T04:07:39.915262Z",
      "_etag": "\"0400d0a7-0000-2400-0000-68e09ef50000\""
    },
    {
      "id": "27fdb1d7-2f0e-4916-b52f-d44014d02937",
      "name": "Caibiran",
      "cityCode": "BIL-04",
      "provinceCode": "BIL",
      "createdAt": "2025-10-04T04:07:39.915204Z",
      "updatedAt": "2025-10-04T04:07:39.915204Z",
      "_etag": "\"0400899f-0000-2400-0000-68e09e9d0000\""
    },
    {
      "id": "8543b266-1b70-42ab-8599-bdd0210c8e72",
      "name": "Cainta",
      "cityCode": "RIZ-05",
      "provinceCode": "RIZ",
      "createdAt": "2025-10-04T04:07:39.915202Z",
      "updatedAt": "2025-10-04T04:07:39.915202Z",
      "_etag": "\"0400079e-0000-2400-0000-68e09e8d0000\""
    },
    {
      "id": "be333cbc-c53b-4843-9be8-284b4916285d",
      "name": "Cajidiocan",
      "cityCode": "ROM-03",
      "provinceCode": "ROM",
      "createdAt": "2025-10-04T04:07:39.915261Z",
      "updatedAt": "2025-10-04T04:07:39.915261Z",
      "_etag": "\"040041a7-0000-2400-0000-68e09ef00000\""
    },
    {
      "id": "36f990b0-8a97-4875-9da4-aeb6adbc0e50",
      "name": "Calabanga",
      "cityCode": "CAS-08",
      "provinceCode": "CAS",
      "createdAt": "2025-10-04T04:07:39.915209Z",
      "updatedAt": "2025-10-04T04:07:39.915209Z",
      "_etag": "\"04005aa1-0000-2400-0000-68e09eb20000\""
    },
    {
      "id": "3e3145c8-6e49-4bd1-b2ea-b5b8676173df",
      "name": "Calaca",
      "cityCode": "BTG-07",
      "provinceCode": "BTG",
      "createdAt": "2025-10-04T04:07:39.915202Z",
      "updatedAt": "2025-10-04T04:07:39.915202Z",
      "_etag": "\"0400b79e-0000-2400-0000-68e09e950000\""
    },
    {
      "id": "78b3138d-9b3f-4ad1-9f51-bdfffa86116e",
      "name": "Calamba",
      "cityCode": "MSC-04",
      "provinceCode": "MSC",
      "createdAt": "2025-10-04T04:07:39.915261Z",
      "updatedAt": "2025-10-04T04:07:39.915261Z",
      "_etag": "\"04007ca7-0000-2400-0000-68e09ef20000\""
    },
    {
      "id": "8630e81a-5559-4158-8228-8f9be3b13bbe",
      "name": "Calanasan (Bayag)",
      "cityCode": "APA-01",
      "provinceCode": "APA",
      "createdAt": "2025-10-04T04:07:39.915204Z",
      "updatedAt": "2025-10-04T04:07:39.915204Z",
      "_etag": "\"0400759f-0000-2400-0000-68e09e9d0000\""
    },
    {
      "id": "31accb57-b805-4085-b041-24f2b2f0f32c",
      "name": "Calanogas",
      "cityCode": "LAN-32",
      "provinceCode": "LAN",
      "createdAt": "2025-10-04T04:07:39.915202Z",
      "updatedAt": "2025-10-04T04:07:39.915202Z",
      "_etag": "\"0400539e-0000-2400-0000-68e09e910000\""
    },
    {
      "id": "bdd6e9c7-de6d-45f0-b48e-69ed2866b89e",
      "name": "Calape",
      "cityCode": "BOH-10",
      "provinceCode": "BOH",
      "createdAt": "2025-10-04T04:07:39.915209Z",
      "updatedAt": "2025-10-04T04:07:39.915209Z",
      "_etag": "\"04006aa1-0000-2400-0000-68e09eb30000\""
    },
    {
      "id": "6b51d0d0-45e3-40b7-824a-1e1185fa60be",
      "name": "Calasiao",
      "cityCode": "PAN-17",
      "provinceCode": "PAN",
      "createdAt": "2025-10-04T04:07:39.915211Z",
      "updatedAt": "2025-10-04T04:07:39.915211Z",
      "_etag": "\"040056a2-0000-2400-0000-68e09ebc0000\""
    },
    {
      "id": "ec34c202-d16c-4fc6-9c47-2580f140836b",
      "name": "Calatagan",
      "cityCode": "BTG-08",
      "provinceCode": "BTG",
      "createdAt": "2025-10-04T04:07:39.91521Z",
      "updatedAt": "2025-10-04T04:07:39.91521Z",
      "_etag": "\"0400dba1-0000-2400-0000-68e09eb80000\""
    },
    {
      "id": "c6d871c5-0cd2-434c-a451-a8b5bb9a0858",
      "name": "Calatrava",
      "cityCode": "ROM-04",
      "provinceCode": "ROM",
      "createdAt": "2025-10-04T04:07:39.915206Z",
      "updatedAt": "2025-10-04T04:07:39.915206Z",
      "_etag": "\"040037a0-0000-2400-0000-68e09ea50000\""
    },
    {
      "id": "7c3c2db4-b941-4e58-8825-236d38f0637a",
      "name": "Calatrava",
      "cityCode": "NEC-05",
      "provinceCode": "NEC",
      "createdAt": "2025-10-04T04:07:39.91521Z",
      "updatedAt": "2025-10-04T04:07:39.91521Z",
      "_etag": "\"040024a2-0000-2400-0000-68e09eba0000\""
    },
    {
      "id": "07bff262-72c9-4d2c-9bc5-52c878954a9e",
      "name": "Calauag",
      "cityCode": "QUE-07",
      "provinceCode": "QUE",
      "createdAt": "2025-10-04T04:07:39.915212Z",
      "updatedAt": "2025-10-04T04:07:39.915212Z",
      "_etag": "\"0400c5a2-0000-2400-0000-68e09ec10000\""
    },
    {
      "id": "6408f4fd-887f-4d92-af2d-3fbc7df54560",
      "name": "Calauan",
      "cityCode": "LAG-06",
      "provinceCode": "LAG",
      "createdAt": "2025-10-04T04:07:39.915211Z",
      "updatedAt": "2025-10-04T04:07:39.915211Z",
      "_etag": "\"04008ca2-0000-2400-0000-68e09ebf0000\""
    },
    {
      "id": "061ab37e-3700-40ef-a863-0d93f5c02a5d",
      "name": "Calayan",
      "cityCode": "CAG-09",
      "provinceCode": "CAG",
      "createdAt": "2025-10-04T04:07:39.915211Z",
      "updatedAt": "2025-10-04T04:07:39.915211Z",
      "_etag": "\"040060a2-0000-2400-0000-68e09ebd0000\""
    },
    {
      "id": "0adda5ad-3b58-4e51-a8f1-85e4c407c39f",
      "name": "Calbayog City",
      "cityCode": "WSA-03",
      "provinceCode": "WSA",
      "createdAt": "2025-10-04T04:07:39.915209Z",
      "updatedAt": "2025-10-04T04:07:39.915209Z",
      "_etag": "\"0400aea1-0000-2400-0000-68e09eb60000\""
    },
    {
      "id": "a89037be-3b68-4477-b4c4-f15b6aec0f86",
      "name": "Calbiga",
      "cityCode": "WSA-04",
      "provinceCode": "WSA",
      "createdAt": "2025-10-04T04:07:39.91521Z",
      "updatedAt": "2025-10-04T04:07:39.91521Z",
      "_etag": "\"040040a2-0000-2400-0000-68e09ebb0000\""
    },
    {
      "id": "8ed94e33-bf94-484f-9318-16ddb91f6fd8",
      "name": "Calinog",
      "cityCode": "ILO-13",
      "provinceCode": "ILO",
      "createdAt": "2025-10-04T04:07:39.915209Z",
      "updatedAt": "2025-10-04T04:07:39.915209Z",
      "_etag": "\"04007da1-0000-2400-0000-68e09eb40000\""
    },
    {
      "id": "bc5ac87a-c19b-48f9-acb7-91a42c35225a",
      "name": "Calintaan",
      "cityCode": "MNC-02",
      "provinceCode": "MNC",
      "createdAt": "2025-10-04T04:07:39.91521Z",
      "updatedAt": "2025-10-04T04:07:39.91521Z",
      "_etag": "\"04002da2-0000-2400-0000-68e09eba0000\""
    },
    {
      "id": "700be12e-dc87-4193-895e-ba33d64ea124",
      "name": "Caloocan City",
      "cityCode": "NCR3-01",
      "provinceCode": "NCR3",
      "createdAt": "2025-10-04T04:07:39.91521Z",
      "updatedAt": "2025-10-04T04:07:39.91521Z",
      "_etag": "\"0400eda1-0000-2400-0000-68e09eb80000\""
    },
    {
      "id": "3fc73aed-44b8-44f2-8906-596103e86e27",
      "name": "Calubian",
      "cityCode": "LEY-13",
      "provinceCode": "LEY",
      "createdAt": "2025-10-04T04:07:39.915211Z",
      "updatedAt": "2025-10-04T04:07:39.915211Z",
      "_etag": "\"040073a2-0000-2400-0000-68e09ebd0000\""
    },
    {
      "id": "768dcfe4-f91c-4b99-a480-34280ae954d7",
      "name": "Calumpit",
      "cityCode": "BUL-07",
      "provinceCode": "BUL",
      "createdAt": "2025-10-04T04:07:39.91521Z",
      "updatedAt": "2025-10-04T04:07:39.91521Z",
      "_etag": "\"0400fca1-0000-2400-0000-68e09eb90000\""
    },
    {
      "id": "1e346629-0786-4d7c-a97b-67e0b36efc0c",
      "name": "Caluya",
      "cityCode": "ANT-05",
      "provinceCode": "ANT",
      "createdAt": "2025-10-04T04:07:39.915211Z",
      "updatedAt": "2025-10-04T04:07:39.915211Z",
      "_etag": "\"040080a2-0000-2400-0000-68e09ebe0000\""
    },
    {
      "id": "dde09d8d-42e4-48d8-8b21-7024f15abf35",
      "name": "Camalaniugan",
      "cityCode": "CAG-10",
      "provinceCode": "CAG",
      "createdAt": "2025-10-04T04:07:39.91521Z",
      "updatedAt": "2025-10-04T04:07:39.91521Z",
      "_etag": "\"040031a2-0000-2400-0000-68e09ebb0000\""
    },
    {
      "id": "699949f4-8d04-478c-a9f0-6b9f15e076b9",
      "name": "Camalig",
      "cityCode": "ALB-02",
      "provinceCode": "ALB",
      "createdAt": "2025-10-04T04:07:39.915211Z",
      "updatedAt": "2025-10-04T04:07:39.915211Z",
      "_etag": "\"0400b0a2-0000-2400-0000-68e09ec00000\""
    },
    {
      "id": "885646de-46b4-4112-8e7f-69d011b24063",
      "name": "Camaligan",
      "cityCode": "CAS-09",
      "provinceCode": "CAS",
      "createdAt": "2025-10-04T04:07:39.915209Z",
      "updatedAt": "2025-10-04T04:07:39.915209Z",
      "_etag": "\"040093a1-0000-2400-0000-68e09eb50000\""
    },
    {
      "id": "947a7e83-3652-4164-900b-df27c913dc64",
      "name": "Camiling",
      "cityCode": "TAR-03",
      "provinceCode": "TAR",
      "createdAt": "2025-10-04T04:07:39.915212Z",
      "updatedAt": "2025-10-04T04:07:39.915212Z",
      "_etag": "\"0400eda2-0000-2400-0000-68e09ec20000\""
    },
    {
      "id": "f0eab023-c2ae-4069-bbc0-5ac3e2f5ac22",
      "name": "Can-avid",
      "cityCode": "EAS-05",
      "provinceCode": "EAS",
      "createdAt": "2025-10-04T04:07:39.915212Z",
      "updatedAt": "2025-10-04T04:07:39.915212Z",
      "_etag": "\"040016a3-0000-2400-0000-68e09ec40000\""
    },
    {
      "id": "e685db21-6d2a-4098-b343-0bba31772805",
      "name": "Canaman",
      "cityCode": "CAS-10",
      "provinceCode": "CAS",
      "createdAt": "2025-10-04T04:07:39.915201Z",
      "updatedAt": "2025-10-04T04:07:39.915201Z",
      "_etag": "\"0400859d-0000-2400-0000-68e09e860000\""
    },
    {
      "id": "fd2ed89c-8b00-42ac-a80c-71d054516524",
      "name": "Candaba",
      "cityCode": "PAM-05",
      "provinceCode": "PAM",
      "createdAt": "2025-10-04T04:07:39.915203Z",
      "updatedAt": "2025-10-04T04:07:39.915203Z",
      "_etag": "\"0400e19e-0000-2400-0000-68e09e970000\""
    },
    {
      "id": "1c1633f9-3fe7-4e61-b31d-d752ccaaed2e",
      "name": "Candelaria",
      "cityCode": "QUE-08",
      "provinceCode": "QUE",
      "createdAt": "2025-10-04T04:07:39.9152Z",
      "updatedAt": "2025-10-04T04:07:39.9152Z",
      "_etag": "\"04005f9b-0000-2400-0000-68e09e710000\""
    },
    {
      "id": "77d1fa21-ec60-4521-8021-cd275d3db659",
      "name": "Candelaria",
      "cityCode": "ZAM-03",
      "provinceCode": "ZAM",
      "createdAt": "2025-10-04T04:07:39.9152Z",
      "updatedAt": "2025-10-04T04:07:39.9152Z",
      "_etag": "\"0400b09b-0000-2400-0000-68e09e740000\""
    },
    {
      "id": "6faa28b4-9491-4fcc-bc04-325315ab783e",
      "name": "Candijay",
      "cityCode": "BOH-11",
      "provinceCode": "BOH",
      "createdAt": "2025-10-04T04:07:39.915202Z",
      "updatedAt": "2025-10-04T04:07:39.915202Z",
      "_etag": "\"0400d19e-0000-2400-0000-68e09e960000\""
    },
    {
      "id": "e73e68e8-ca90-4266-9292-4367506f7ffc",
      "name": "Candoni",
      "cityCode": "NEC-06",
      "provinceCode": "NEC",
      "createdAt": "2025-10-04T04:07:39.9152Z",
      "updatedAt": "2025-10-04T04:07:39.9152Z",
      "_etag": "\"0400de9b-0000-2400-0000-68e09e760000\""
    },
    {
      "id": "7d30848a-f55f-43b1-9cf3-08b566dec696",
      "name": "Canlaon City",
      "cityCode": "NER-08",
      "provinceCode": "NER",
      "createdAt": "2025-10-04T04:07:39.9152Z",
      "updatedAt": "2025-10-04T04:07:39.915201Z",
      "_etag": "\"0400489c-0000-2400-0000-68e09e7a0000\""
    },
    {
      "id": "51458efa-9f05-4215-bb4b-a5b3fccfc3fe",
      "name": "Cantilan",
      "cityCode": "SUR-05",
      "provinceCode": "SUR",
      "createdAt": "2025-10-04T04:07:39.915202Z",
      "updatedAt": "2025-10-04T04:07:39.915202Z",
      "_etag": "\"0400979e-0000-2400-0000-68e09e940000\""
    },
    {
      "id": "2d373ef8-6b18-400d-95a1-8b7c66f21ded",
      "name": "Caoayan",
      "cityCode": "ILS-07",
      "provinceCode": "ILS",
      "createdAt": "2025-10-04T04:07:39.9152Z",
      "updatedAt": "2025-10-04T04:07:39.9152Z",
      "_etag": "\"0400299c-0000-2400-0000-68e09e790000\""
    },
    {
      "id": "147fc13a-b9ac-4abb-87d4-338b7d7392d0",
      "name": "Capalonga",
      "cityCode": "CAN-02",
      "provinceCode": "CAN",
      "createdAt": "2025-10-04T04:07:39.915201Z",
      "updatedAt": "2025-10-04T04:07:39.915201Z",
      "_etag": "\"0400699c-0000-2400-0000-68e09e7c0000\""
    },
    {
      "id": "456b2e36-f7fe-4e34-9204-7513d30b449c",
      "name": "Capas",
      "cityCode": "TAR-04",
      "provinceCode": "TAR",
      "createdAt": "2025-10-04T04:07:39.915202Z",
      "updatedAt": "2025-10-04T04:07:39.915202Z",
      "_etag": "\"0400839e-0000-2400-0000-68e09e930000\""
    },
    {
      "id": "1c5e24d9-0d64-42dc-9539-0f5f8c081d9d",
      "name": "Capoocan",
      "cityCode": "LEY-14",
      "provinceCode": "LEY",
      "createdAt": "2025-10-04T04:07:39.915201Z",
      "updatedAt": "2025-10-04T04:07:39.915201Z",
      "_etag": "\"04003f9d-0000-2400-0000-68e09e830000\""
    },
    {
      "id": "49e570e6-45c0-41b1-bfe3-dbb3b8d5812e",
      "name": "Capul",
      "cityCode": "NSA-04",
      "provinceCode": "NSA",
      "createdAt": "2025-10-04T04:07:39.915203Z",
      "updatedAt": "2025-10-04T04:07:39.915203Z",
      "_etag": "\"0400f69e-0000-2400-0000-68e09e980000\""
    },
    {
      "id": "cfc22002-f04e-4b52-9d8c-fdb7ebe28688",
      "name": "Caraga",
      "cityCode": "DAR-04",
      "provinceCode": "DAR",
      "createdAt": "2025-10-04T04:07:39.915204Z",
      "updatedAt": "2025-10-04T04:07:39.915204Z",
      "_etag": "\"04002e9f-0000-2400-0000-68e09e9a0000\""
    },
    {
      "id": "d739186d-2259-4823-ba32-0e8cc34fac1c",
      "name": "Caramoan",
      "cityCode": "CAS-11",
      "provinceCode": "CAS",
      "createdAt": "2025-10-04T04:07:39.915204Z",
      "updatedAt": "2025-10-04T04:07:39.915204Z",
      "_etag": "\"04009e9f-0000-2400-0000-68e09e9e0000\""
    },
    {
      "id": "417bc784-d3e5-443b-a9f6-8b4bd6e53e8a",
      "name": "Caramoran",
      "cityCode": "CAT-04",
      "provinceCode": "CAT",
      "createdAt": "2025-10-04T04:07:39.915204Z",
      "updatedAt": "2025-10-04T04:07:39.915204Z",
      "_etag": "\"0400b99f-0000-2400-0000-68e09e9e0000\""
    },
    {
      "id": "7533578f-7802-4ab2-b717-bfea6ff91f7a",
      "name": "Carasi",
      "cityCode": "ILN-07",
      "provinceCode": "ILN",
      "createdAt": "2025-10-04T04:07:39.915205Z",
      "updatedAt": "2025-10-04T04:07:39.915205Z",
      "_etag": "\"0400ca9f-0000-2400-0000-68e09e9f0000\""
    },
    {
      "id": "18bd5d50-6898-40b2-8647-d2f1631d9997",
      "name": "Cardona",
      "cityCode": "RIZ-06",
      "provinceCode": "RIZ",
      "createdAt": "2025-10-04T04:07:39.915205Z",
      "updatedAt": "2025-10-04T04:07:39.915205Z",
      "_etag": "\"0400dd9f-0000-2400-0000-68e09ea00000\""
    },
    {
      "id": "613f49ce-7bb1-421b-b71b-35e450dab224",
      "name": "Carigara",
      "cityCode": "LEY-15",
      "provinceCode": "LEY",
      "createdAt": "2025-10-04T04:07:39.915205Z",
      "updatedAt": "2025-10-04T04:07:39.915205Z",
      "_etag": "\"0400e49f-0000-2400-0000-68e09ea10000\""
    },
    {
      "id": "bd38bf13-0c89-4706-9c5a-8d491b208459",
      "name": "Carles",
      "cityCode": "ILO-14",
      "provinceCode": "ILO",
      "createdAt": "2025-10-04T04:07:39.915205Z",
      "updatedAt": "2025-10-04T04:07:39.915205Z",
      "_etag": "\"0400ea9f-0000-2400-0000-68e09ea10000\""
    },
    {
      "id": "a2e26a31-8160-4593-9d67-6098242902be",
      "name": "Carmen",
      "cityCode": "SUR-06",
      "provinceCode": "SUR",
      "createdAt": "2025-10-04T04:07:39.915205Z",
      "updatedAt": "2025-10-04T04:07:39.915205Z",
      "_etag": "\"0400fe9f-0000-2400-0000-68e09ea20000\""
    },
    {
      "id": "186f6c4e-76b8-4d59-96c9-4b1ba7a9a8c7",
      "name": "Carmen",
      "cityCode": "AGN-04",
      "provinceCode": "AGN",
      "createdAt": "2025-10-04T04:07:39.915206Z",
      "updatedAt": "2025-10-04T04:07:39.915206Z",
      "_etag": "\"04000ca0-0000-2400-0000-68e09ea30000\""
    },
    {
      "id": "8c232689-95ef-4aaf-bf27-5f88e4a3bf32",
      "name": "Carmen",
      "cityCode": "CEB-15",
      "provinceCode": "CEB",
      "createdAt": "2025-10-04T04:07:39.915206Z",
      "updatedAt": "2025-10-04T04:07:39.915206Z",
      "_etag": "\"040012a0-0000-2400-0000-68e09ea40000\""
    },
    {
      "id": "e9c4748b-ded7-4499-bdb5-3c3173480209",
      "name": "Carmen",
      "cityCode": "NCO-02",
      "provinceCode": "NCO",
      "createdAt": "2025-10-04T04:07:39.915206Z",
      "updatedAt": "2025-10-04T04:07:39.915206Z",
      "_etag": "\"04001ba0-0000-2400-0000-68e09ea40000\""
    },
    {
      "id": "0e76decd-1cef-44c1-b1de-aead2ed6c377",
      "name": "Carmen",
      "cityCode": "DAN-03",
      "provinceCode": "DAN",
      "createdAt": "2025-10-04T04:07:39.915206Z",
      "updatedAt": "2025-10-04T04:07:39.915206Z",
      "_etag": "\"04002da0-0000-2400-0000-68e09ea50000\""
    },
    {
      "id": "486a4dc5-af92-41ef-9576-52efa7ccab46",
      "name": "Carmen",
      "cityCode": "BOH-12",
      "provinceCode": "BOH",
      "createdAt": "2025-10-04T04:07:39.915206Z",
      "updatedAt": "2025-10-04T04:07:39.915206Z",
      "_etag": "\"040042a0-0000-2400-0000-68e09ea60000\""
    },
    {
      "id": "f3dfc75d-b7f5-4786-8f7c-d009ea3b3bc2",
      "name": "Carmona",
      "cityCode": "CAV-04",
      "provinceCode": "CAV",
      "createdAt": "2025-10-04T04:07:39.915206Z",
      "updatedAt": "2025-10-04T04:07:39.915207Z",
      "_etag": "\"04004ca0-0000-2400-0000-68e09ea70000\""
    },
    {
      "id": "d1037f87-20da-4f83-ac13-b717e61c007f",
      "name": "Carranglan",
      "cityCode": "NUE-05",
      "provinceCode": "NUE",
      "createdAt": "2025-10-04T04:07:39.915207Z",
      "updatedAt": "2025-10-04T04:07:39.915207Z",
      "_etag": "\"040054a0-0000-2400-0000-68e09ea70000\""
    },
    {
      "id": "589e5be7-2498-4dff-9509-361a66360472",
      "name": "Carrascal",
      "cityCode": "SUR-07",
      "provinceCode": "SUR",
      "createdAt": "2025-10-04T04:07:39.915207Z",
      "updatedAt": "2025-10-04T04:07:39.915207Z",
      "_etag": "\"04005ea0-0000-2400-0000-68e09ea70000\""
    },
    {
      "id": "0d22bf8b-ed29-4d07-bd81-8a20eaeb91f9",
      "name": "Casiguran",
      "cityCode": "AUR-02",
      "provinceCode": "AUR",
      "createdAt": "2025-10-04T04:07:39.915207Z",
      "updatedAt": "2025-10-04T04:07:39.915207Z",
      "_etag": "\"040076a0-0000-2400-0000-68e09ea80000\""
    },
    {
      "id": "3026c1d8-1654-4ba2-9f00-72486d3092e4",
      "name": "Casiguran",
      "cityCode": "SOR-05",
      "provinceCode": "SOR",
      "createdAt": "2025-10-04T04:07:39.915207Z",
      "updatedAt": "2025-10-04T04:07:39.915207Z",
      "_etag": "\"040086a0-0000-2400-0000-68e09ea90000\""
    },
    {
      "id": "10010604-1017-4629-b8d6-3d8e21628860",
      "name": "Castilla",
      "cityCode": "SOR-06",
      "provinceCode": "SOR",
      "createdAt": "2025-10-04T04:07:39.915207Z",
      "updatedAt": "2025-10-04T04:07:39.915207Z",
      "_etag": "\"04009ea0-0000-2400-0000-68e09eaa0000\""
    },
    {
      "id": "e92214f9-9f36-4707-9392-21a04bc5afda",
      "name": "Castillejos",
      "cityCode": "ZAM-04",
      "provinceCode": "ZAM",
      "createdAt": "2025-10-04T04:07:39.915207Z",
      "updatedAt": "2025-10-04T04:07:39.915207Z",
      "_etag": "\"0400a8a0-0000-2400-0000-68e09eaa0000\""
    },
    {
      "id": "21302109-37ec-404e-9ee7-95209f181185",
      "name": "Cataingan",
      "cityCode": "MAS-05",
      "provinceCode": "MAS",
      "createdAt": "2025-10-04T04:07:39.915207Z",
      "updatedAt": "2025-10-04T04:07:39.915207Z",
      "_etag": "\"0400b8a0-0000-2400-0000-68e09eab0000\""
    },
    {
      "id": "8dd818cd-f3cb-4cfe-89dc-c4d4c2032cc9",
      "name": "Catanauan",
      "cityCode": "QUE-10",
      "provinceCode": "QUE",
      "createdAt": "2025-10-04T04:07:39.915208Z",
      "updatedAt": "2025-10-04T04:07:39.915208Z",
      "_etag": "\"0400cba0-0000-2400-0000-68e09eac0000\""
    },
    {
      "id": "2b9e435d-d11e-4462-8d4a-fe76cac331d4",
      "name": "Catarman",
      "cityCode": "CAM-01",
      "provinceCode": "CAM",
      "createdAt": "2025-10-04T04:07:39.915208Z",
      "updatedAt": "2025-10-04T04:07:39.915208Z",
      "_etag": "\"0400e0a0-0000-2400-0000-68e09ead0000\""
    },
    {
      "id": "6f8042bd-7ab1-40a9-ae7a-c4be14042ef3",
      "name": "Catarman (Capital)",
      "cityCode": "NSA-05",
      "provinceCode": "NSA",
      "createdAt": "2025-10-04T04:07:39.915208Z",
      "updatedAt": "2025-10-04T04:07:39.915208Z",
      "_etag": "\"0400f4a0-0000-2400-0000-68e09ead0000\""
    },
    {
      "id": "e911b089-295c-46a8-822a-b38de1848bdb",
      "name": "Cateel",
      "cityCode": "DAR-05",
      "provinceCode": "DAR",
      "createdAt": "2025-10-04T04:07:39.915208Z",
      "updatedAt": "2025-10-04T04:07:39.915208Z",
      "_etag": "\"040001a1-0000-2400-0000-68e09eae0000\""
    },
    {
      "id": "fc7055d8-4d44-4aff-b85a-22bc3f558252",
      "name": "Catigbian",
      "cityCode": "BOH-13",
      "provinceCode": "BOH",
      "createdAt": "2025-10-04T04:07:39.915208Z",
      "updatedAt": "2025-10-04T04:07:39.915208Z",
      "_etag": "\"040016a1-0000-2400-0000-68e09eaf0000\""
    },
    {
      "id": "5a451ce3-06a1-4eea-b037-e54db923968b",
      "name": "Catmon",
      "cityCode": "CEB-16",
      "provinceCode": "CEB",
      "createdAt": "2025-10-04T04:07:39.915208Z",
      "updatedAt": "2025-10-04T04:07:39.915208Z",
      "_etag": "\"04001ea1-0000-2400-0000-68e09eaf0000\""
    },
    {
      "id": "4bcaa01e-9471-4f34-86f0-a9964064d62e",
      "name": "Catubig",
      "cityCode": "NSA-06",
      "provinceCode": "NSA",
      "createdAt": "2025-10-04T04:07:39.915208Z",
      "updatedAt": "2025-10-04T04:07:39.915208Z",
      "_etag": "\"040028a1-0000-2400-0000-68e09eb00000\""
    },
    {
      "id": "aabe1ac9-dddc-4a86-b540-bbf195edd327",
      "name": "Cauayan",
      "cityCode": "NEC-07",
      "provinceCode": "NEC",
      "createdAt": "2025-10-04T04:07:39.915208Z",
      "updatedAt": "2025-10-04T04:07:39.915209Z",
      "_etag": "\"040039a1-0000-2400-0000-68e09eb10000\""
    },
    {
      "id": "b3a0d3de-8c3a-47cc-a54e-873423febbcf",
      "name": "Cavinti",
      "cityCode": "LAG-07",
      "provinceCode": "LAG",
      "createdAt": "2025-10-04T04:07:39.915209Z",
      "updatedAt": "2025-10-04T04:07:39.915209Z",
      "_etag": "\"040049a1-0000-2400-0000-68e09eb20000\""
    },
    {
      "id": "d784c3e8-0c60-4096-8ed9-cc9ecfa70952",
      "name": "Cavite City",
      "cityCode": "CAV-05",
      "provinceCode": "CAV",
      "createdAt": "2025-10-04T04:07:39.91521Z",
      "updatedAt": "2025-10-04T04:07:39.91521Z",
      "_etag": "\"0400caa1-0000-2400-0000-68e09eb70000\""
    },
    {
      "id": "41a2a90a-31b1-4f95-950c-613a8eccb221",
      "name": "Cawayan",
      "cityCode": "MAS-06",
      "provinceCode": "MAS",
      "createdAt": "2025-10-04T04:07:39.915211Z",
      "updatedAt": "2025-10-04T04:07:39.915211Z",
      "_etag": "\"040097a2-0000-2400-0000-68e09ebf0000\""
    },
    {
      "id": "15f3e60f-09ad-4c71-830a-d17802549ddc",
      "name": "Cebu City (Capital)",
      "cityCode": "CEB-17",
      "provinceCode": "CEB",
      "createdAt": "2025-10-04T04:07:39.915212Z",
      "updatedAt": "2025-10-04T04:07:39.915212Z",
      "_etag": "\"0400dda2-0000-2400-0000-68e09ec20000\""
    },
    {
      "id": "77fb0f82-16ae-47d3-946c-56f5acfd287e",
      "name": "Cervantes",
      "cityCode": "ILS-08",
      "provinceCode": "ILS",
      "createdAt": "2025-10-04T04:07:39.915212Z",
      "updatedAt": "2025-10-04T04:07:39.915212Z",
      "_etag": "\"04001fa3-0000-2400-0000-68e09ec40000\""
    },
    {
      "id": "3aeaa2ad-0f2c-4a83-992c-5210ce4191d5",
      "name": "City Of Alaminos",
      "cityCode": "PAN-03",
      "provinceCode": "PAN",
      "createdAt": "2025-10-04T04:07:39.915212Z",
      "updatedAt": "2025-10-04T04:07:39.915213Z",
      "_etag": "\"04002aa3-0000-2400-0000-68e09ec50000\""
    },
    {
      "id": "593a3f66-26cf-48be-87af-295e18e702c5",
      "name": "City Of Antipolo",
      "cityCode": "RIZ-02",
      "provinceCode": "RIZ",
      "createdAt": "2025-10-04T04:07:39.915213Z",
      "updatedAt": "2025-10-04T04:07:39.915213Z",
      "_etag": "\"040041a3-0000-2400-0000-68e09ec50000\""
    },
    {
      "id": "7938876f-1936-4d4f-a91d-baa4761caabe",
      "name": "City Of Balanga (Capital)",
      "cityCode": "BAT-03",
      "provinceCode": "BAT",
      "createdAt": "2025-10-04T04:07:39.915213Z",
      "updatedAt": "2025-10-04T04:07:39.915213Z",
      "_etag": "\"04004aa3-0000-2400-0000-68e09ec60000\""
    },
    {
      "id": "95d8675d-c8d0-45ce-911e-59386f56c4d2",
      "name": "City Of Batac",
      "cityCode": "ILN-05",
      "provinceCode": "ILN",
      "createdAt": "2025-10-04T04:07:39.915213Z",
      "updatedAt": "2025-10-04T04:07:39.915213Z",
      "_etag": "\"040056a3-0000-2400-0000-68e09ec70000\""
    },
    {
      "id": "327b0b10-6032-48ec-82d8-5026267f820e",
      "name": "City Of Bayawan (Tulong)",
      "cityCode": "NER-06",
      "provinceCode": "NER",
      "createdAt": "2025-10-04T04:07:39.915213Z",
      "updatedAt": "2025-10-04T04:07:39.915213Z",
      "_etag": "\"040065a3-0000-2400-0000-68e09ec70000\""
    },
    {
      "id": "93a5feb5-1dc8-47f3-b4ec-2a75d274e2b7",
      "name": "City Of Baybay",
      "cityCode": "LEY-08",
      "provinceCode": "LEY",
      "createdAt": "2025-10-04T04:07:39.915213Z",
      "updatedAt": "2025-10-04T04:07:39.915213Z",
      "_etag": "\"040077a3-0000-2400-0000-68e09ec80000\""
    },
    {
      "id": "f2b56ae6-8731-42cc-8695-b931f00576bb",
      "name": "City Of Bayugan",
      "cityCode": "AGS-01",
      "provinceCode": "AGS",
      "createdAt": "2025-10-04T04:07:39.915213Z",
      "updatedAt": "2025-10-04T04:07:39.915213Z",
      "_etag": "\"040087a3-0000-2400-0000-68e09ec80000\""
    },
    {
      "id": "ee6c9b47-7152-4a7b-b5d8-ce0fe807c726",
      "name": "City Of Bislig",
      "cityCode": "SUR-03",
      "provinceCode": "SUR",
      "createdAt": "2025-10-04T04:07:39.915213Z",
      "updatedAt": "2025-10-04T04:07:39.915213Z",
      "_etag": "\"0400a6a3-0000-2400-0000-68e09ec90000\""
    },
    {
      "id": "cfeb8aea-85c5-46ef-a736-989d06806603",
      "name": "City Of Biñan",
      "cityCode": "LAG-03",
      "provinceCode": "LAG",
      "createdAt": "2025-10-04T04:07:39.915214Z",
      "updatedAt": "2025-10-04T04:07:39.915214Z",
      "_etag": "\"0400bda3-0000-2400-0000-68e09eca0000\""
    },
    {
      "id": "26810a0d-a9d4-47ec-adeb-fed3b9deb78e",
      "name": "City Of Bogo",
      "cityCode": "CEB-11",
      "provinceCode": "CEB",
      "createdAt": "2025-10-04T04:07:39.915214Z",
      "updatedAt": "2025-10-04T04:07:39.915214Z",
      "_etag": "\"0400c6a3-0000-2400-0000-68e09ecb0000\""
    },
    {
      "id": "023098ed-484b-4103-a157-bd671d6889fd",
      "name": "City Of Borongan (Capital)",
      "cityCode": "EAS-04",
      "provinceCode": "EAS",
      "createdAt": "2025-10-04T04:07:39.915252Z",
      "updatedAt": "2025-10-04T04:07:39.915252Z",
      "_etag": "\"0400d3a3-0000-2400-0000-68e09ecb0000\""
    },
    {
      "id": "ebe73157-9652-4ab2-bc9d-f5fb64e58c97",
      "name": "City Of Cabadbaran",
      "cityCode": "AGN-03",
      "provinceCode": "AGN",
      "createdAt": "2025-10-04T04:07:39.915252Z",
      "updatedAt": "2025-10-04T04:07:39.915252Z",
      "_etag": "\"0400e1a3-0000-2400-0000-68e09ecc0000\""
    },
    {
      "id": "acad9857-6918-42e8-b973-b6ac93c90251",
      "name": "City Of Calamba",
      "cityCode": "LAG-05",
      "provinceCode": "LAG",
      "createdAt": "2025-10-04T04:07:39.915252Z",
      "updatedAt": "2025-10-04T04:07:39.915252Z",
      "_etag": "\"0400eaa3-0000-2400-0000-68e09ecc0000\""
    },
    {
      "id": "26d3152b-3d27-41ea-a2a9-edf3d2cb3cde",
      "name": "City Of Calapan (Capital)",
      "cityCode": "MNR-05",
      "provinceCode": "MNR",
      "createdAt": "2025-10-04T04:07:39.915252Z",
      "updatedAt": "2025-10-04T04:07:39.915252Z",
      "_etag": "\"0400f4a3-0000-2400-0000-68e09ecd0000\""
    },
    {
      "id": "5ec02413-fde1-4e23-95c2-3d790be8ca0b",
      "name": "City Of Candon",
      "cityCode": "ILS-06",
      "provinceCode": "ILS",
      "createdAt": "2025-10-04T04:07:39.915252Z",
      "updatedAt": "2025-10-04T04:07:39.915252Z",
      "_etag": "\"040005a4-0000-2400-0000-68e09ecd0000\""
    },
    {
      "id": "0c5117c1-4ce9-45bf-b922-6c585d98aa74",
      "name": "City Of Carcar",
      "cityCode": "CEB-14",
      "provinceCode": "CEB",
      "createdAt": "2025-10-04T04:07:39.915252Z",
      "updatedAt": "2025-10-04T04:07:39.915252Z",
      "_etag": "\"040016a4-0000-2400-0000-68e09ece0000\""
    },
    {
      "id": "d8aa9e68-02cf-447a-b482-f020367eb436",
      "name": "City Of Catbalogan (Capital)",
      "cityCode": "WSA-05",
      "provinceCode": "WSA",
      "createdAt": "2025-10-04T04:07:39.915252Z",
      "updatedAt": "2025-10-04T04:07:39.915252Z",
      "_etag": "\"04002ca4-0000-2400-0000-68e09ece0000\""
    },
    {
      "id": "4400e5be-6f54-4c24-86d2-1e28dfb97c7f",
      "name": "City Of Cauayan",
      "cityCode": "ISA-08",
      "provinceCode": "ISA",
      "createdAt": "2025-10-04T04:07:39.915253Z",
      "updatedAt": "2025-10-04T04:07:39.915253Z",
      "_etag": "\"040037a4-0000-2400-0000-68e09ecf0000\""
    },
    {
      "id": "4433c5b5-b4b3-4a99-bda7-9bd7450427c9",
      "name": "City Of Dasmariñas",
      "cityCode": "CAV-06",
      "provinceCode": "CAV",
      "createdAt": "2025-10-04T04:07:39.915253Z",
      "updatedAt": "2025-10-04T04:07:39.915253Z",
      "_etag": "\"04003ea4-0000-2400-0000-68e09ecf0000\""
    },
    {
      "id": "be8c2bcc-7dda-44b5-b397-83de6b75a139",
      "name": "City Of Digos (Capital)",
      "cityCode": "DAS-03",
      "provinceCode": "DAS",
      "createdAt": "2025-10-04T04:07:39.915253Z",
      "updatedAt": "2025-10-04T04:07:39.915253Z",
      "_etag": "\"040058a4-0000-2400-0000-68e09ed00000\""
    },
    {
      "id": "970c5cf9-f081-43e3-8fcf-8814fcac8b2b",
      "name": "City Of El Salvador",
      "cityCode": "MSR-07",
      "provinceCode": "MSR",
      "createdAt": "2025-10-04T04:07:39.915253Z",
      "updatedAt": "2025-10-04T04:07:39.915253Z",
      "_etag": "\"040076a4-0000-2400-0000-68e09ed10000\""
    },
    {
      "id": "71330204-a994-439d-81e1-40eb76077f64",
      "name": "City Of Escalante",
      "cityCode": "NEC-09",
      "provinceCode": "NEC",
      "createdAt": "2025-10-04T04:07:39.915253Z",
      "updatedAt": "2025-10-04T04:07:39.915253Z",
      "_etag": "\"040086a4-0000-2400-0000-68e09ed20000\""
    },
    {
      "id": "24663860-5eb5-47d5-ba6c-5f87b10bea02",
      "name": "City Of Gapan",
      "cityCode": "NUE-08",
      "provinceCode": "NUE",
      "createdAt": "2025-10-04T04:07:39.915253Z",
      "updatedAt": "2025-10-04T04:07:39.915253Z",
      "_etag": "\"040098a4-0000-2400-0000-68e09ed20000\""
    },
    {
      "id": "63e07036-6080-45c3-a62c-51a9a7434d01",
      "name": "City Of Guihulngan",
      "cityCode": "NER-11",
      "provinceCode": "NER",
      "createdAt": "2025-10-04T04:07:39.915253Z",
      "updatedAt": "2025-10-04T04:07:39.915253Z",
      "_etag": "\"0400a9a4-0000-2400-0000-68e09ed20000\""
    },
    {
      "id": "b0c1872a-0932-4a02-99f6-5943431a07dc",
      "name": "City Of Himamaylan",
      "cityCode": "NEC-10",
      "provinceCode": "NEC",
      "createdAt": "2025-10-04T04:07:39.915254Z",
      "updatedAt": "2025-10-04T04:07:39.915254Z",
      "_etag": "\"0400b5a4-0000-2400-0000-68e09ed30000\""
    },
    {
      "id": "2260a8e3-625e-4f2e-8f52-810cad4a9535",
      "name": "City Of Isabela",
      "cityCode": "ISB-01",
      "provinceCode": "ISB",
      "createdAt": "2025-10-04T04:07:39.915254Z",
      "updatedAt": "2025-10-04T04:07:39.915254Z",
      "_etag": "\"0400cba4-0000-2400-0000-68e09ed40000\""
    },
    {
      "id": "03d818c1-6f06-42d0-980b-6f98238f829f",
      "name": "City Of Kabankalan",
      "cityCode": "NEC-15",
      "provinceCode": "NEC",
      "createdAt": "2025-10-04T04:07:39.915254Z",
      "updatedAt": "2025-10-04T04:07:39.915254Z",
      "_etag": "\"0400daa4-0000-2400-0000-68e09ed40000\""
    },
    {
      "id": "0dbe6038-f7e0-47ca-906a-8b80bb406abc",
      "name": "City Of Kidapawan (Capital)",
      "cityCode": "NCO-04",
      "provinceCode": "NCO",
      "createdAt": "2025-10-04T04:07:39.915254Z",
      "updatedAt": "2025-10-04T04:07:39.915254Z",
      "_etag": "\"0400e4a4-0000-2400-0000-68e09ed50000\""
    },
    {
      "id": "94016f20-4c6d-41f4-b94f-f9dbc027f1a1",
      "name": "City Of Koronadal (Capital)",
      "cityCode": "SCO-06",
      "provinceCode": "SCO",
      "createdAt": "2025-10-04T04:07:39.915254Z",
      "updatedAt": "2025-10-04T04:07:39.915254Z",
      "_etag": "\"0400f4a4-0000-2400-0000-68e09ed60000\""
    },
    {
      "id": "e4ef2a30-4fa9-466e-b587-334e1ef92dad",
      "name": "City Of Lamitan",
      "cityCode": "BAS-02",
      "provinceCode": "BAS",
      "createdAt": "2025-10-04T04:07:39.915254Z",
      "updatedAt": "2025-10-04T04:07:39.915254Z",
      "_etag": "\"040002a5-0000-2400-0000-68e09ed60000\""
    },
    {
      "id": "69bc400d-1da2-449f-ab20-6eb50b69b817",
      "name": "City Of Las Piñas",
      "cityCode": "NCR4-01",
      "provinceCode": "NCR4",
      "createdAt": "2025-10-04T04:07:39.915254Z",
      "updatedAt": "2025-10-04T04:07:39.915254Z",
      "_etag": "\"040010a5-0000-2400-0000-68e09ed70000\""
    },
    {
      "id": "0d374210-2c33-4d5f-b894-bb0f8a2d8f1b",
      "name": "City Of Ligao",
      "cityCode": "ALB-08",
      "provinceCode": "ALB",
      "createdAt": "2025-10-04T04:07:39.915255Z",
      "updatedAt": "2025-10-04T04:07:39.915255Z",
      "_etag": "\"040017a5-0000-2400-0000-68e09ed70000\""
    },
    {
      "id": "8852fcf9-e201-4a9f-98db-d8bb0583d373",
      "name": "City Of Maasin (Capital)",
      "cityCode": "SLE-07",
      "provinceCode": "SLE",
      "createdAt": "2025-10-04T04:07:39.915255Z",
      "updatedAt": "2025-10-04T04:07:39.915255Z",
      "_etag": "\"040026a5-0000-2400-0000-68e09ed80000\""
    },
    {
      "id": "856c61c2-9524-4143-83bb-f2671c8a188f",
      "name": "City Of Makati",
      "cityCode": "NCR4-02",
      "provinceCode": "NCR4",
      "createdAt": "2025-10-04T04:07:39.915255Z",
      "updatedAt": "2025-10-04T04:07:39.915255Z",
      "_etag": "\"04002ea5-0000-2400-0000-68e09ed80000\""
    },
    {
      "id": "fed43678-8f04-49c0-813a-39819679e27f",
      "name": "City Of Malabon",
      "cityCode": "NCR3-02",
      "provinceCode": "NCR3",
      "createdAt": "2025-10-04T04:07:39.915255Z",
      "updatedAt": "2025-10-04T04:07:39.915255Z",
      "_etag": "\"04003ba5-0000-2400-0000-68e09ed90000\""
    },
    {
      "id": "e6687f84-8f7f-40ec-a704-147e575b937b",
      "name": "City Of Malaybalay (Capital)",
      "cityCode": "BUK-12",
      "provinceCode": "BUK",
      "createdAt": "2025-10-04T04:07:39.915255Z",
      "updatedAt": "2025-10-04T04:07:39.915255Z",
      "_etag": "\"040053a5-0000-2400-0000-68e09eda0000\""
    },
    {
      "id": "fe8ebfc3-dd6e-4c33-a37a-45cb5493d20f",
      "name": "City Of Malolos (Capital)",
      "cityCode": "BUL-10",
      "provinceCode": "BUL",
      "createdAt": "2025-10-04T04:07:39.915255Z",
      "updatedAt": "2025-10-04T04:07:39.915255Z",
      "_etag": "\"04005fa5-0000-2400-0000-68e09eda0000\""
    },
    {
      "id": "9cda510e-63d2-41bc-9aef-6e20d6348113",
      "name": "City Of Mandaluyong",
      "cityCode": "NCR2-01",
      "provinceCode": "NCR2",
      "createdAt": "2025-10-04T04:07:39.915255Z",
      "updatedAt": "2025-10-04T04:07:39.915255Z",
      "_etag": "\"040074a5-0000-2400-0000-68e09edb0000\""
    },
    {
      "id": "9e2a23ce-a05d-4d0b-b47a-fe2a79ff850a",
      "name": "City Of Marikina",
      "cityCode": "NCR2-02",
      "provinceCode": "NCR2",
      "createdAt": "2025-10-04T04:07:39.915256Z",
      "updatedAt": "2025-10-04T04:07:39.915256Z",
      "_etag": "\"040085a5-0000-2400-0000-68e09edb0000\""
    },
    {
      "id": "972dd4c6-f016-4141-af9f-9acd8ebdc9da",
      "name": "City Of Masbate (Capital)",
      "cityCode": "MAS-11",
      "provinceCode": "MAS",
      "createdAt": "2025-10-04T04:07:39.915256Z",
      "updatedAt": "2025-10-04T04:07:39.915256Z",
      "_etag": "\"04009ca5-0000-2400-0000-68e09edc0000\""
    },
    {
      "id": "519980f4-8d78-4ec4-bfcc-79fbedaa1a32",
      "name": "City Of Mati (Capital)",
      "cityCode": "DAR-09",
      "provinceCode": "DAR",
      "createdAt": "2025-10-04T04:07:39.915256Z",
      "updatedAt": "2025-10-04T04:07:39.915256Z",
      "_etag": "\"0400a7a5-0000-2400-0000-68e09edd0000\""
    },
    {
      "id": "f5fe5898-9306-4c8d-b81e-c2324e56c6b4",
      "name": "City Of Meycauayan",
      "cityCode": "BUL-12",
      "provinceCode": "BUL",
      "createdAt": "2025-10-04T04:07:39.915256Z",
      "updatedAt": "2025-10-04T04:07:39.915256Z",
      "_etag": "\"0400afa5-0000-2400-0000-68e09edd0000\""
    },
    {
      "id": "d2edde38-e353-4ccf-a4d6-2796fd865821",
      "name": "City Of Muntinlupa",
      "cityCode": "NCR4-03",
      "provinceCode": "NCR4",
      "createdAt": "2025-10-04T04:07:39.915256Z",
      "updatedAt": "2025-10-04T04:07:39.915256Z",
      "_etag": "\"0400bca5-0000-2400-0000-68e09ede0000\""
    },
    {
      "id": "f10042ac-b386-42fe-87b2-f7b2017f9d35",
      "name": "City Of Naga",
      "cityCode": "CEB-34",
      "provinceCode": "CEB",
      "createdAt": "2025-10-04T04:07:39.915256Z",
      "updatedAt": "2025-10-04T04:07:39.915256Z",
      "_etag": "\"0400caa5-0000-2400-0000-68e09edf0000\""
    },
    {
      "id": "70aa7f17-332f-42c8-912d-be52d0fe6b84",
      "name": "City Of Navotas",
      "cityCode": "NCR3-03",
      "provinceCode": "NCR3",
      "createdAt": "2025-10-04T04:07:39.915256Z",
      "updatedAt": "2025-10-04T04:07:39.915256Z",
      "_etag": "\"0400d1a5-0000-2400-0000-68e09edf0000\""
    },
    {
      "id": "db28701f-5396-4979-b905-8d699d8832bf",
      "name": "City Of Panabo",
      "cityCode": "DAN-15",
      "provinceCode": "DAN",
      "createdAt": "2025-10-04T04:07:39.915256Z",
      "updatedAt": "2025-10-04T04:07:39.915257Z",
      "_etag": "\"0400e5a5-0000-2400-0000-68e09ee00000\""
    },
    {
      "id": "080ba2a9-4214-4930-8f52-70201b3cee68",
      "name": "City Of Parañaque",
      "cityCode": "NCR4-04",
      "provinceCode": "NCR4",
      "createdAt": "2025-10-04T04:07:39.915257Z",
      "updatedAt": "2025-10-04T04:07:39.915257Z",
      "_etag": "\"0400f2a5-0000-2400-0000-68e09ee10000\""
    },
    {
      "id": "66b6042e-3de1-4fd1-a5c8-b643ee9072bb",
      "name": "City Of Pasig",
      "cityCode": "NCR2-03",
      "provinceCode": "NCR2",
      "createdAt": "2025-10-04T04:07:39.915257Z",
      "updatedAt": "2025-10-04T04:07:39.915257Z",
      "_etag": "\"0400fda5-0000-2400-0000-68e09ee10000\""
    },
    {
      "id": "f994124e-b29d-4c04-8a26-c830e5be2043",
      "name": "City Of Passi",
      "cityCode": "ILO-35",
      "provinceCode": "ILO",
      "createdAt": "2025-10-04T04:07:39.915257Z",
      "updatedAt": "2025-10-04T04:07:39.915257Z",
      "_etag": "\"04000aa6-0000-2400-0000-68e09ee20000\""
    },
    {
      "id": "140afad7-4b05-4185-b37b-efa439362deb",
      "name": "City Of San Fernando (Capital)",
      "cityCode": "PAM-16",
      "provinceCode": "PAM",
      "createdAt": "2025-10-04T04:07:39.915257Z",
      "updatedAt": "2025-10-04T04:07:39.915257Z",
      "_etag": "\"040019a6-0000-2400-0000-68e09ee20000\""
    },
    {
      "id": "c0e94753-2e56-470f-abbe-bb16fecfe06f",
      "name": "City Of San Fernando (Capital)",
      "cityCode": "LAU-14",
      "provinceCode": "LAU",
      "createdAt": "2025-10-04T04:07:39.915258Z",
      "updatedAt": "2025-10-04T04:07:39.915258Z",
      "_etag": "\"040021a6-0000-2400-0000-68e09ee30000\""
    },
    {
      "id": "8f28436a-0079-426c-8afc-b2b39bce4c07",
      "name": "City Of San Jose Del Monte",
      "cityCode": "BUL-20",
      "provinceCode": "BUL",
      "createdAt": "2025-10-04T04:07:39.915258Z",
      "updatedAt": "2025-10-04T04:07:39.915258Z",
      "_etag": "\"040029a6-0000-2400-0000-68e09ee30000\""
    },
    {
      "id": "48e71dd9-c90d-4206-b10e-f3372a2795b0",
      "name": "City Of San Juan",
      "cityCode": "NCR2-05",
      "provinceCode": "NCR2",
      "createdAt": "2025-10-04T04:07:39.915258Z",
      "updatedAt": "2025-10-04T04:07:39.915258Z",
      "_etag": "\"04002fa6-0000-2400-0000-68e09ee40000\""
    },
    {
      "id": "26ae2143-e030-43a3-9a20-5ea18d2e5556",
      "name": "City Of San Pedro",
      "cityCode": "LAG-25",
      "provinceCode": "LAG",
      "createdAt": "2025-10-04T04:07:39.915258Z",
      "updatedAt": "2025-10-04T04:07:39.915258Z",
      "_etag": "\"04004ea6-0000-2400-0000-68e09ee50000\""
    },
    {
      "id": "f17b5d30-701f-434c-8837-249823d2dd12",
      "name": "City Of Santa Rosa",
      "cityCode": "LAG-28",
      "provinceCode": "LAG",
      "createdAt": "2025-10-04T04:07:39.915258Z",
      "updatedAt": "2025-10-04T04:07:39.915258Z",
      "_etag": "\"040063a6-0000-2400-0000-68e09ee50000\""
    },
    {
      "id": "a34376a2-a443-4fd8-b769-a8494e6fad40",
      "name": "City Of Santiago",
      "cityCode": "ISA-35",
      "provinceCode": "ISA",
      "createdAt": "2025-10-04T04:07:39.915258Z",
      "updatedAt": "2025-10-04T04:07:39.915258Z",
      "_etag": "\"04006da6-0000-2400-0000-68e09ee60000\""
    },
    {
      "id": "1f2501dd-e0f5-4307-a1ba-ed9829bb580c",
      "name": "City Of Sipalay",
      "cityCode": "NEC-27",
      "provinceCode": "NEC",
      "createdAt": "2025-10-04T04:07:39.915258Z",
      "updatedAt": "2025-10-04T04:07:39.915258Z",
      "_etag": "\"04007ea6-0000-2400-0000-68e09ee60000\""
    },
    {
      "id": "0aeecfb0-c5a4-4ef0-9f11-54ec623f66e8",
      "name": "City Of Sorsogon (Capital)",
      "cityCode": "SOR-16",
      "provinceCode": "SOR",
      "createdAt": "2025-10-04T04:07:39.915259Z",
      "updatedAt": "2025-10-04T04:07:39.915259Z",
      "_etag": "\"040093a6-0000-2400-0000-68e09ee70000\""
    },
    {
      "id": "975fd7e7-fbdf-4b98-a23e-d707e9c93f30",
      "name": "City Of Tabaco",
      "cityCode": "ALB-17",
      "provinceCode": "ALB",
      "createdAt": "2025-10-04T04:07:39.915259Z",
      "updatedAt": "2025-10-04T04:07:39.915259Z",
      "_etag": "\"04009ea6-0000-2400-0000-68e09ee80000\""
    },
    {
      "id": "8fbe12c3-99ce-4723-aa52-8c83ce30b81f",
      "name": "City Of Tabuk (Capital)",
      "cityCode": "KAL-13",
      "provinceCode": "KAL",
      "createdAt": "2025-10-04T04:07:39.915259Z",
      "updatedAt": "2025-10-04T04:07:39.915259Z",
      "_etag": "\"0400b2a6-0000-2400-0000-68e09ee90000\""
    },
    {
      "id": "9cc84e15-424e-4078-b4ca-03dc53693b3e",
      "name": "City Of Tacurong",
      "cityCode": "SUK-11",
      "provinceCode": "SUK",
      "createdAt": "2025-10-04T04:07:39.915259Z",
      "updatedAt": "2025-10-04T04:07:39.915259Z",
      "_etag": "\"0400b7a6-0000-2400-0000-68e09ee90000\""
    },
    {
      "id": "a2f3ac7a-8d5f-492f-9358-99319e3c9281",
      "name": "City Of Tagum (Capital)",
      "cityCode": "DAN-19",
      "provinceCode": "DAN",
      "createdAt": "2025-10-04T04:07:39.915259Z",
      "updatedAt": "2025-10-04T04:07:39.915259Z",
      "_etag": "\"0400c0a6-0000-2400-0000-68e09eea0000\""
    },
    {
      "id": "fb7259f8-4913-40f3-9a9c-a3bb7cd29a15",
      "name": "City Of Talisay",
      "cityCode": "CEB-50",
      "provinceCode": "CEB",
      "createdAt": "2025-10-04T04:07:39.91526Z",
      "updatedAt": "2025-10-04T04:07:39.91526Z",
      "_etag": "\"0400c6a6-0000-2400-0000-68e09eea0000\""
    },
    {
      "id": "35e9bf2d-6ba1-4fe0-82fa-4498cff5342c",
      "name": "City Of Talisay",
      "cityCode": "NEC-28",
      "provinceCode": "NEC",
      "createdAt": "2025-10-04T04:07:39.91526Z",
      "updatedAt": "2025-10-04T04:07:39.91526Z",
      "_etag": "\"0400cfa6-0000-2400-0000-68e09eeb0000\""
    },
    {
      "id": "cb3387a0-fa4f-460b-859c-c07addbcdcf2",
      "name": "City Of Tanauan",
      "cityCode": "BTG-31",
      "provinceCode": "BTG",
      "createdAt": "2025-10-04T04:07:39.91526Z",
      "updatedAt": "2025-10-04T04:07:39.91526Z",
      "_etag": "\"0400daa6-0000-2400-0000-68e09eeb0000\""
    },
    {
      "id": "3b5a4f56-d137-4249-b70c-2370ed57d678",
      "name": "City Of Tandag (Capital)",
      "cityCode": "SUR-19",
      "provinceCode": "SUR",
      "createdAt": "2025-10-04T04:07:39.91526Z",
      "updatedAt": "2025-10-04T04:07:39.91526Z",
      "_etag": "\"04000ca7-0000-2400-0000-68e09eed0000\""
    },
    {
      "id": "2f98fc55-bb73-43f8-9498-ca77b294d830",
      "name": "City Of Tanjay",
      "cityCode": "NER-21",
      "provinceCode": "NER",
      "createdAt": "2025-10-04T04:07:39.91526Z",
      "updatedAt": "2025-10-04T04:07:39.91526Z",
      "_etag": "\"0400f9a6-0000-2400-0000-68e09eed0000\""
    },
    {
      "id": "68a8db4a-2b53-435f-b48a-3dd4a0482e77",
      "name": "City Of Tarlac (Capital)",
      "cityCode": "TAR-16",
      "provinceCode": "TAR",
      "createdAt": "2025-10-04T04:07:39.91526Z",
      "updatedAt": "2025-10-04T04:07:39.91526Z",
      "_etag": "\"0400eea6-0000-2400-0000-68e09eec0000\""
    },
    {
      "id": "b29c308b-948e-4265-8a0d-50fba7226ef5",
      "name": "City Of Tayabas",
      "cityCode": "QUE-47",
      "provinceCode": "QUE",
      "createdAt": "2025-10-04T04:07:39.91526Z",
      "updatedAt": "2025-10-04T04:07:39.91526Z",
      "_etag": "\"040019a7-0000-2400-0000-68e09eee0000\""
    },
    {
      "id": "b6bb8316-40e8-46c9-8344-75b2eaf2bdab",
      "name": "City Of Urdaneta",
      "cityCode": "PAN-46",
      "provinceCode": "PAN",
      "createdAt": "2025-10-04T04:07:39.91526Z",
      "updatedAt": "2025-10-04T04:07:39.91526Z",
      "_etag": "\"040025a7-0000-2400-0000-68e09eee0000\""
    },
    {
      "id": "fc4581f4-20fe-425e-8209-0156d4051fa3",
      "name": "City Of Valencia",
      "cityCode": "BUK-21",
      "provinceCode": "BUK",
      "createdAt": "2025-10-04T04:07:39.915261Z",
      "updatedAt": "2025-10-04T04:07:39.915261Z",
      "_etag": "\"040068a7-0000-2400-0000-68e09ef10000\""
    },
    {
      "id": "73b3f7ba-9e8f-4496-9f1e-8ce213b90be9",
      "name": "City Of Valenzuela",
      "cityCode": "NCR3-04",
      "provinceCode": "NCR3",
      "createdAt": "2025-10-04T04:07:39.915261Z",
      "updatedAt": "2025-10-04T04:07:39.915261Z",
      "_etag": "\"04008fa7-0000-2400-0000-68e09ef20000\""
    },
    {
      "id": "bb1d98a0-fdea-4b8b-977f-06c1d442f29b",
      "name": "City Of Victorias",
      "cityCode": "NEC-31",
      "provinceCode": "NEC",
      "createdAt": "2025-10-04T04:07:39.915262Z",
      "updatedAt": "2025-10-04T04:07:39.915262Z",
      "_etag": "\"0400a7a7-0000-2400-0000-68e09ef30000\""
    },
    {
      "id": "11f05c10-1041-43f3-bfd6-a5d4057a300c",
      "name": "City Of Vigan (Capital)",
      "cityCode": "ILS-34",
      "provinceCode": "ILS",
      "createdAt": "2025-10-04T04:07:39.915262Z",
      "updatedAt": "2025-10-04T04:07:39.915262Z",
      "_etag": "\"0400b1a7-0000-2400-0000-68e09ef40000\""
    },
    {
      "id": "3a08fec5-b0ea-40e0-9f9e-130ebdabbf84",
      "name": "Clarin",
      "cityCode": "MSC-05",
      "provinceCode": "MSC",
      "createdAt": "2025-10-04T04:07:39.915262Z",
      "updatedAt": "2025-10-04T04:07:39.915262Z",
      "_etag": "\"0400bea7-0000-2400-0000-68e09ef50000\""
    },
    {
      "id": "d3fe6965-51dd-4923-a3be-82204c2ce379",
      "name": "Clarin",
      "cityCode": "BOH-14",
      "provinceCode": "BOH",
      "createdAt": "2025-10-04T04:07:39.915263Z",
      "updatedAt": "2025-10-04T04:07:39.915263Z",
      "_etag": "\"0400e2a7-0000-2400-0000-68e09ef60000\""
    },
    {
      "id": "46df0931-2397-4a6e-9042-d0db4a4ab0f4",
      "name": "Claver",
      "cityCode": "SUN-06",
      "provinceCode": "SUN",
      "createdAt": "2025-10-04T04:07:39.915263Z",
      "updatedAt": "2025-10-04T04:07:39.915263Z",
      "_etag": "\"0400f5a7-0000-2400-0000-68e09ef60000\""
    },
    {
      "id": "b71b6df3-28be-44fe-9b23-03add630f053",
      "name": "Claveria",
      "cityCode": "MSR-06",
      "provinceCode": "MSR",
      "createdAt": "2025-10-04T04:07:39.915263Z",
      "updatedAt": "2025-10-04T04:07:39.915263Z",
      "_etag": "\"040005a8-0000-2400-0000-68e09ef70000\""
    },
    {
      "id": "70421541-8e27-4a85-adef-b532a6444ff8",
      "name": "Claveria",
      "cityCode": "MAS-07",
      "provinceCode": "MAS",
      "createdAt": "2025-10-04T04:07:39.915263Z",
      "updatedAt": "2025-10-04T04:07:39.915263Z",
      "_etag": "\"04000ca8-0000-2400-0000-68e09ef70000\""
    },
    {
      "id": "3d3530bb-7404-4fb2-97ea-d7d18b75ace6",
      "name": "Claveria",
      "cityCode": "CAG-11",
      "provinceCode": "CAG",
      "createdAt": "2025-10-04T04:07:39.915263Z",
      "updatedAt": "2025-10-04T04:07:39.915263Z",
      "_etag": "\"040017a8-0000-2400-0000-68e09ef80000\""
    },
    {
      "id": "4d082fb5-50fd-4cba-901c-788ac0fcaede",
      "name": "Columbio",
      "cityCode": "SUK-02",
      "provinceCode": "SUK",
      "createdAt": "2025-10-04T04:07:39.915263Z",
      "updatedAt": "2025-10-04T04:07:39.915263Z",
      "_etag": "\"040024a8-0000-2400-0000-68e09ef80000\""
    },
    {
      "id": "8adede61-c924-40c4-97b1-21b50fdf1d0a",
      "name": "Compostela",
      "cityCode": "CEB-18",
      "provinceCode": "CEB",
      "createdAt": "2025-10-04T04:07:39.915263Z",
      "updatedAt": "2025-10-04T04:07:39.915263Z",
      "_etag": "\"04002ca8-0000-2400-0000-68e09ef90000\""
    },
    {
      "id": "2d38f3af-a852-4687-8e9c-c6cc2738fefc",
      "name": "Compostela",
      "cityCode": "COM-01",
      "provinceCode": "COM",
      "createdAt": "2025-10-04T04:07:39.915263Z",
      "updatedAt": "2025-10-04T04:07:39.915264Z",
      "_etag": "\"040036a8-0000-2400-0000-68e09ef90000\""
    },
    {
      "id": "f7be9cbe-d873-4cfa-b971-a005844d26d9",
      "name": "Concepcion",
      "cityCode": "ILO-15",
      "provinceCode": "ILO",
      "createdAt": "2025-10-04T04:07:39.915264Z",
      "updatedAt": "2025-10-04T04:07:39.915264Z",
      "_etag": "\"040041a8-0000-2400-0000-68e09efa0000\""
    },
    {
      "id": "393649dc-e5ab-4a7c-a1ec-262f708ce319",
      "name": "Concepcion",
      "cityCode": "MSC-06",
      "provinceCode": "MSC",
      "createdAt": "2025-10-04T04:07:39.915274Z",
      "updatedAt": "2025-10-04T04:07:39.915274Z",
      "_etag": "\"0400a5aa-0000-2400-0000-68e09f150000\""
    },
    {
      "id": "fc98c9f1-74f5-4f9c-adf2-02c8c83e702e",
      "name": "Concepcion",
      "cityCode": "ROM-05",
      "provinceCode": "ROM",
      "createdAt": "2025-10-04T04:07:39.915275Z",
      "updatedAt": "2025-10-04T04:07:39.915275Z",
      "_etag": "\"0400ebaa-0000-2400-0000-68e09f180000\""
    },
    {
      "id": "c6e2525f-e632-4447-9053-83ae3c8d6def",
      "name": "Concepcion",
      "cityCode": "TAR-05",
      "provinceCode": "TAR",
      "createdAt": "2025-10-04T04:07:39.915373Z",
      "updatedAt": "2025-10-04T04:07:39.915373Z",
      "_etag": "\"0400b1b3-0000-2400-0000-68e09f750000\""
    },
    {
      "id": "e6de0fc6-30cf-498b-9f7b-b9939a7748ee",
      "name": "Conner",
      "cityCode": "APA-02",
      "provinceCode": "APA",
      "createdAt": "2025-10-04T04:07:39.915394Z",
      "updatedAt": "2025-10-04T04:07:39.915394Z",
      "_etag": "\"04005ab6-0000-2400-0000-68e09f8e0000\""
    },
    {
      "id": "da59010e-53f3-42dc-ad83-947658f7fdfb",
      "name": "Consolacion",
      "cityCode": "CEB-19",
      "provinceCode": "CEB",
      "createdAt": "2025-10-04T04:07:39.915264Z",
      "updatedAt": "2025-10-04T04:07:39.915264Z",
      "_etag": "\"040054a8-0000-2400-0000-68e09efb0000\""
    },
    {
      "id": "b1f853f6-dede-4b53-9700-07fe137cab39",
      "name": "Corcuera",
      "cityCode": "ROM-06",
      "provinceCode": "ROM",
      "createdAt": "2025-10-04T04:07:39.915275Z",
      "updatedAt": "2025-10-04T04:07:39.915275Z",
      "_etag": "\"0400d8aa-0000-2400-0000-68e09f170000\""
    },
    {
      "id": "d7d62b06-e694-4865-81c4-5e84b350206f",
      "name": "Cordon",
      "cityCode": "ISA-09",
      "provinceCode": "ISA",
      "createdAt": "2025-10-04T04:07:39.915275Z",
      "updatedAt": "2025-10-04T04:07:39.915275Z",
      "_etag": "\"0400c7aa-0000-2400-0000-68e09f160000\""
    },
    {
      "id": "fd4bee09-5dde-4eba-b3a2-0afbe5e4e54b",
      "name": "Cordova",
      "cityCode": "CEB-20",
      "provinceCode": "CEB",
      "createdAt": "2025-10-04T04:07:39.915275Z",
      "updatedAt": "2025-10-04T04:07:39.915275Z",
      "_etag": "\"0400bbaa-0000-2400-0000-68e09f160000\""
    },
    {
      "id": "09f99041-9f34-4bcb-8335-488d68991911",
      "name": "Corella",
      "cityCode": "BOH-15",
      "provinceCode": "BOH",
      "createdAt": "2025-10-04T04:07:39.915276Z",
      "updatedAt": "2025-10-04T04:07:39.915276Z",
      "_etag": "\"04004fab-0000-2400-0000-68e09f1c0000\""
    },
    {
      "id": "6cdeda0f-f592-40e4-8f8c-5971be24c08e",
      "name": "Coron",
      "cityCode": "PAL-09",
      "provinceCode": "PAL",
      "createdAt": "2025-10-04T04:07:39.915276Z",
      "updatedAt": "2025-10-04T04:07:39.915276Z",
      "_etag": "\"040046ab-0000-2400-0000-68e09f1c0000\""
    },
    {
      "id": "afe6f367-3a62-4a8b-9bde-8c77d82f85d1",
      "name": "Cortes",
      "cityCode": "BOH-16",
      "provinceCode": "BOH",
      "createdAt": "2025-10-04T04:07:39.915275Z",
      "updatedAt": "2025-10-04T04:07:39.915275Z",
      "_etag": "\"0400f5aa-0000-2400-0000-68e09f180000\""
    },
    {
      "id": "6fb0cdf5-d4aa-48b7-9fa6-fc44327ffa38",
      "name": "Cortes",
      "cityCode": "SUR-08",
      "provinceCode": "SUR",
      "createdAt": "2025-10-04T04:07:39.915276Z",
      "updatedAt": "2025-10-04T04:07:39.915276Z",
      "_etag": "\"04006bab-0000-2400-0000-68e09f1e0000\""
    },
    {
      "id": "0081091b-ac72-410e-a7c7-88e1b4288040",
      "name": "Cotabato City",
      "cityCode": "COT-04",
      "provinceCode": "COT",
      "createdAt": "2025-10-04T04:07:39.915276Z",
      "updatedAt": "2025-10-04T04:07:39.915276Z",
      "_etag": "\"040015ab-0000-2400-0000-68e09f1a0000\""
    },
    {
      "id": "eb37a98a-a59f-4d9a-a8fc-0a09757f1ca6",
      "name": "Cuartero",
      "cityCode": "CAP-01",
      "provinceCode": "CAP",
      "createdAt": "2025-10-04T04:07:39.915275Z",
      "updatedAt": "2025-10-04T04:07:39.915275Z",
      "_etag": "\"040009ab-0000-2400-0000-68e09f190000\""
    },
    {
      "id": "7889c65d-66e6-4c3d-a20c-422168fb1fe7",
      "name": "Cuenca",
      "cityCode": "BTG-09",
      "provinceCode": "BTG",
      "createdAt": "2025-10-04T04:07:39.915277Z",
      "updatedAt": "2025-10-04T04:07:39.915277Z",
      "_etag": "\"040075ab-0000-2400-0000-68e09f1e0000\""
    },
    {
      "id": "676294c3-f55d-434d-98d3-30c52df32ec6",
      "name": "Culaba",
      "cityCode": "BIL-05",
      "provinceCode": "BIL",
      "createdAt": "2025-10-04T04:07:39.915277Z",
      "updatedAt": "2025-10-04T04:07:39.915278Z",
      "_etag": "\"0400ecab-0000-2400-0000-68e09f230000\""
    },
    {
      "id": "62e89ba4-89e9-47b2-9fa1-231c223ad673",
      "name": "Culasi",
      "cityCode": "ANT-06",
      "provinceCode": "ANT",
      "createdAt": "2025-10-04T04:07:39.915277Z",
      "updatedAt": "2025-10-04T04:07:39.915277Z",
      "_etag": "\"0400e2ab-0000-2400-0000-68e09f220000\""
    },
    {
      "id": "7bf89165-e6d0-4979-8e26-e7f30e361c68",
      "name": "Culion",
      "cityCode": "PAL-22",
      "provinceCode": "PAL",
      "createdAt": "2025-10-04T04:07:39.915277Z",
      "updatedAt": "2025-10-04T04:07:39.915277Z",
      "_etag": "\"04008eab-0000-2400-0000-68e09f1f0000\""
    },
    {
      "id": "71c808ae-4cc2-42a9-8f33-b9ddb4c5f727",
      "name": "Currimao",
      "cityCode": "ILN-08",
      "provinceCode": "ILN",
      "createdAt": "2025-10-04T04:07:39.915277Z",
      "updatedAt": "2025-10-04T04:07:39.915277Z",
      "_etag": "\"0400b6ab-0000-2400-0000-68e09f210000\""
    },
    {
      "id": "e6794cb2-e82a-4328-92e7-697436f65046",
      "name": "Cuyapo",
      "cityCode": "NUE-06",
      "provinceCode": "NUE",
      "createdAt": "2025-10-04T04:07:39.915277Z",
      "updatedAt": "2025-10-04T04:07:39.915277Z",
      "_etag": "\"0400ceab-0000-2400-0000-68e09f220000\""
    },
    {
      "id": "33962cc2-f68f-4882-aabe-0d4b6d538345",
      "name": "Cuyo",
      "cityCode": "PAL-10",
      "provinceCode": "PAL",
      "createdAt": "2025-10-04T04:07:39.915277Z",
      "updatedAt": "2025-10-04T04:07:39.915277Z",
      "_etag": "\"0400a5ab-0000-2400-0000-68e09f200000\""
    },
    {
      "id": "d1015137-7bf0-494c-9278-3c643a3d6850",
      "name": "Daanbantayan",
      "cityCode": "CEB-21",
      "provinceCode": "CEB",
      "createdAt": "2025-10-04T04:07:39.915276Z",
      "updatedAt": "2025-10-04T04:07:39.915276Z",
      "_etag": "\"040024ab-0000-2400-0000-68e09f1a0000\""
    },
    {
      "id": "650891a7-0d90-4179-8014-08cfcb252422",
      "name": "Daet (Capital)",
      "cityCode": "CAN-03",
      "provinceCode": "CAN",
      "createdAt": "2025-10-04T04:07:39.915276Z",
      "updatedAt": "2025-10-04T04:07:39.915276Z",
      "_etag": "\"040035ab-0000-2400-0000-68e09f1b0000\""
    },
    {
      "id": "e8403a75-07fc-4b91-ae40-6b1ecb434a95",
      "name": "Dagami",
      "cityCode": "LEY-17",
      "provinceCode": "LEY",
      "createdAt": "2025-10-04T04:07:39.915277Z",
      "updatedAt": "2025-10-04T04:07:39.915277Z",
      "_etag": "\"04007bab-0000-2400-0000-68e09f1f0000\""
    },
    {
      "id": "ef21752e-9ed1-4b1f-8d8e-3876e9c6652c",
      "name": "Dagohoy",
      "cityCode": "BOH-17",
      "provinceCode": "BOH",
      "createdAt": "2025-10-04T04:07:39.915345Z",
      "updatedAt": "2025-10-04T04:07:39.915345Z",
      "_etag": "\"040056af-0000-2400-0000-68e09f480000\""
    },
    {
      "id": "e7f9569c-5eda-41ba-8c63-1c0196d35faf",
      "name": "Daguioman",
      "cityCode": "ABR-05",
      "provinceCode": "ABR",
      "createdAt": "2025-10-04T04:07:39.915349Z",
      "updatedAt": "2025-10-04T04:07:39.915349Z",
      "_etag": "\"0400a2b0-0000-2400-0000-68e09f560000\""
    },
    {
      "id": "c697fb31-fec7-4c22-80f2-eab11606d2c1",
      "name": "Dagupan City",
      "cityCode": "PAN-18",
      "provinceCode": "PAN",
      "createdAt": "2025-10-04T04:07:39.91535Z",
      "updatedAt": "2025-10-04T04:07:39.91535Z",
      "_etag": "\"0400f4b0-0000-2400-0000-68e09f5a0000\""
    },
    {
      "id": "40e635c5-64de-4e46-8e04-50505a7dfd3b",
      "name": "Dalaguete",
      "cityCode": "CEB-22",
      "provinceCode": "CEB",
      "createdAt": "2025-10-04T04:07:39.91535Z",
      "updatedAt": "2025-10-04T04:07:39.91535Z",
      "_etag": "\"040015b1-0000-2400-0000-68e09f5b0000\""
    },
    {
      "id": "feb58c46-a030-440d-a04d-85530dffa9b1",
      "name": "Damulog",
      "cityCode": "BUK-02",
      "provinceCode": "BUK",
      "createdAt": "2025-10-04T04:07:39.91535Z",
      "updatedAt": "2025-10-04T04:07:39.91535Z",
      "_etag": "\"040005b1-0000-2400-0000-68e09f5a0000\""
    },
    {
      "id": "8f0283f4-b26f-46a0-81e9-5465b8f16c00",
      "name": "Danao",
      "cityCode": "BOH-18",
      "provinceCode": "BOH",
      "createdAt": "2025-10-04T04:07:39.915349Z",
      "updatedAt": "2025-10-04T04:07:39.915349Z",
      "_etag": "\"0400acb0-0000-2400-0000-68e09f560000\""
    },
    {
      "id": "651f3336-02f7-438a-8546-fb531aa656c7",
      "name": "Danao City",
      "cityCode": "CEB-23",
      "provinceCode": "CEB",
      "createdAt": "2025-10-04T04:07:39.915367Z",
      "updatedAt": "2025-10-04T04:07:39.915367Z",
      "_etag": "\"0400acb1-0000-2400-0000-68e09f610000\""
    },
    {
      "id": "3ca9a3c8-03fe-4dd7-8376-2e077ef7209e",
      "name": "Dangcagan",
      "cityCode": "BUK-03",
      "provinceCode": "BUK",
      "createdAt": "2025-10-04T04:07:39.915376Z",
      "updatedAt": "2025-10-04T04:07:39.915376Z",
      "_etag": "\"0400d6b4-0000-2400-0000-68e09f7f0000\""
    },
    {
      "id": "98a1cccf-352a-478c-9a51-e34342652cac",
      "name": "Danglas",
      "cityCode": "ABR-06",
      "provinceCode": "ABR",
      "createdAt": "2025-10-04T04:07:39.91535Z",
      "updatedAt": "2025-10-04T04:07:39.91535Z",
      "_etag": "\"040023b1-0000-2400-0000-68e09f5b0000\""
    },
    {
      "id": "9f8e0ff7-5a26-4094-82b3-9cb058c1f34c",
      "name": "Dao",
      "cityCode": "CAP-02",
      "provinceCode": "CAP",
      "createdAt": "2025-10-04T04:07:39.915365Z",
      "updatedAt": "2025-10-04T04:07:39.915366Z",
      "_etag": "\"040038b1-0000-2400-0000-68e09f5c0000\""
    },
    {
      "id": "355f74df-a193-4e79-adc0-2e16d59d66f7",
      "name": "Dapa",
      "cityCode": "SUN-07",
      "provinceCode": "SUN",
      "createdAt": "2025-10-04T04:07:39.915366Z",
      "updatedAt": "2025-10-04T04:07:39.915366Z",
      "_etag": "\"040040b1-0000-2400-0000-68e09f5c0000\""
    },
    {
      "id": "79e32435-25cf-4653-bca4-1708b9c0daff",
      "name": "Dapitan City",
      "cityCode": "ZAN-01",
      "provinceCode": "ZAN",
      "createdAt": "2025-10-04T04:07:39.915367Z",
      "updatedAt": "2025-10-04T04:07:39.915367Z",
      "_etag": "\"0400c7b1-0000-2400-0000-68e09f630000\""
    },
    {
      "id": "2f842e27-3534-4dbb-aef4-2b2b97eacdaf",
      "name": "Daraga (Locsin)",
      "cityCode": "ALB-03",
      "provinceCode": "ALB",
      "createdAt": "2025-10-04T04:07:39.915366Z",
      "updatedAt": "2025-10-04T04:07:39.915366Z",
      "_etag": "\"04004bb1-0000-2400-0000-68e09f5d0000\""
    },
    {
      "id": "a835e91d-7acb-4e58-a4a6-5c80c3e5720a",
      "name": "Daram",
      "cityCode": "WSA-06",
      "provinceCode": "WSA",
      "createdAt": "2025-10-04T04:07:39.91537Z",
      "updatedAt": "2025-10-04T04:07:39.91537Z",
      "_etag": "\"04009cb2-0000-2400-0000-68e09f6b0000\""
    },
    {
      "id": "dddf6130-71a0-43d3-8869-a65bb48f95c6",
      "name": "Dasol",
      "cityCode": "PAN-19",
      "provinceCode": "PAN",
      "createdAt": "2025-10-04T04:07:39.915368Z",
      "updatedAt": "2025-10-04T04:07:39.915368Z",
      "_etag": "\"0400d8b1-0000-2400-0000-68e09f630000\""
    },
    {
      "id": "bdf27842-e52b-43cf-81ce-5bdadc91a49b",
      "name": "Datu Abdullah Sangki",
      "cityCode": "MAG-28",
      "provinceCode": "MAG",
      "createdAt": "2025-10-04T04:07:39.915366Z",
      "updatedAt": "2025-10-04T04:07:39.915366Z",
      "_etag": "\"040061b1-0000-2400-0000-68e09f5e0000\""
    },
    {
      "id": "c9ccfc76-9a03-4a71-9190-0a8a52465893",
      "name": "Datu Anggal Midtimbang",
      "cityCode": "MAG-31",
      "provinceCode": "MAG",
      "createdAt": "2025-10-04T04:07:39.915368Z",
      "updatedAt": "2025-10-04T04:07:39.915368Z",
      "_etag": "\"0400e4b1-0000-2400-0000-68e09f640000\""
    },
    {
      "id": "a8866f5a-de37-43da-a876-c70e75b79927",
      "name": "Datu Blah T. Sinsuat",
      "cityCode": "MAG-30",
      "provinceCode": "MAG",
      "createdAt": "2025-10-04T04:07:39.915264Z",
      "updatedAt": "2025-10-04T04:07:39.915264Z",
      "_etag": "\"040064a8-0000-2400-0000-68e09efb0000\""
    },
    {
      "id": "a68a486f-900c-4455-95c1-bb769fe25dc4",
      "name": "Datu Hoffer Ampatuan",
      "cityCode": "MAG-35",
      "provinceCode": "MAG",
      "createdAt": "2025-10-04T04:07:39.915264Z",
      "updatedAt": "2025-10-04T04:07:39.915264Z",
      "_etag": "\"040075a8-0000-2400-0000-68e09efc0000\""
    },
    {
      "id": "fdfa6c55-875c-4289-b3e0-8ce6b3133d54",
      "name": "Datu Odin Sinsuat (Dinaig)",
      "cityCode": "MAG-07",
      "provinceCode": "MAG",
      "createdAt": "2025-10-04T04:07:39.915264Z",
      "updatedAt": "2025-10-04T04:07:39.915264Z",
      "_etag": "\"040087a8-0000-2400-0000-68e09efc0000\""
    },
    {
      "id": "fdf69226-aa9e-4fdc-ac84-d1f1e30e9020",
      "name": "Datu Paglas",
      "cityCode": "MAG-05",
      "provinceCode": "MAG",
      "createdAt": "2025-10-04T04:07:39.91537Z",
      "updatedAt": "2025-10-04T04:07:39.91537Z",
      "_etag": "\"040045b2-0000-2400-0000-68e09f690000\""
    },
    {
      "id": "cfa5892a-d8c2-45c3-97eb-21895325c92a",
      "name": "Datu Piang",
      "cityCode": "MAG-06",
      "provinceCode": "MAG",
      "createdAt": "2025-10-04T04:07:39.915264Z",
      "updatedAt": "2025-10-04T04:07:39.915264Z",
      "_etag": "\"04009ca8-0000-2400-0000-68e09efd0000\""
    },
    {
      "id": "7db38cee-9d58-498f-b1dc-78cb75277b69",
      "name": "Datu Salibo",
      "cityCode": "MAG-36",
      "provinceCode": "MAG",
      "createdAt": "2025-10-04T04:07:39.915264Z",
      "updatedAt": "2025-10-04T04:07:39.915265Z",
      "_etag": "\"0400b6a8-0000-2400-0000-68e09efe0000\""
    },
    {
      "id": "8542e816-2599-40df-a5e9-f7b9f84af7c9",
      "name": "Datu Saudi-ampatuan",
      "cityCode": "MAG-26",
      "provinceCode": "MAG",
      "createdAt": "2025-10-04T04:07:39.915265Z",
      "updatedAt": "2025-10-04T04:07:39.915265Z",
      "_etag": "\"0400c7a8-0000-2400-0000-68e09eff0000\""
    },
    {
      "id": "0d0a033f-6664-4289-b3f6-04544df046e8",
      "name": "Datu Unsay",
      "cityCode": "MAG-27",
      "provinceCode": "MAG",
      "createdAt": "2025-10-04T04:07:39.915372Z",
      "updatedAt": "2025-10-04T04:07:39.915372Z",
      "_etag": "\"040031b3-0000-2400-0000-68e09f710000\""
    },
    {
      "id": "7d42210a-e090-48f3-926c-eb906d446d78",
      "name": "Dauin",
      "cityCode": "NER-09",
      "provinceCode": "NER",
      "createdAt": "2025-10-04T04:07:39.915265Z",
      "updatedAt": "2025-10-04T04:07:39.915265Z",
      "_etag": "\"0400dda8-0000-2400-0000-68e09eff0000\""
    },
    {
      "id": "e1811e14-d6f3-48cd-9065-ac17e6728b33",
      "name": "Dauis",
      "cityCode": "BOH-19",
      "provinceCode": "BOH",
      "createdAt": "2025-10-04T04:07:39.915265Z",
      "updatedAt": "2025-10-04T04:07:39.915265Z",
      "_etag": "\"0400f2a8-0000-2400-0000-68e09f000000\""
    },
    {
      "id": "7187ba54-4627-4d76-8775-96875eb9ee59",
      "name": "Davao City",
      "cityCode": "DAS-02",
      "provinceCode": "DAS",
      "createdAt": "2025-10-04T04:07:39.915374Z",
      "updatedAt": "2025-10-04T04:07:39.915374Z",
      "_etag": "\"04002db4-0000-2400-0000-68e09f790000\""
    },
    {
      "id": "0026ea2b-020c-4073-b60f-1c4b3093774c",
      "name": "Del Carmen",
      "cityCode": "SUN-08",
      "provinceCode": "SUN",
      "createdAt": "2025-10-04T04:07:39.915265Z",
      "updatedAt": "2025-10-04T04:07:39.915265Z",
      "_etag": "\"040005a9-0000-2400-0000-68e09f010000\""
    },
    {
      "id": "92dc766a-01f4-4172-b03b-e5956ca5b7bd",
      "name": "Del Gallego",
      "cityCode": "CAS-12",
      "provinceCode": "CAS",
      "createdAt": "2025-10-04T04:07:39.915265Z",
      "updatedAt": "2025-10-04T04:07:39.915265Z",
      "_etag": "\"04001da9-0000-2400-0000-68e09f020000\""
    },
    {
      "id": "ae77e1d6-7b25-4b76-9d24-76a92c57511d",
      "name": "Delfin Albano (Magsaysay)",
      "cityCode": "ISA-18",
      "provinceCode": "ISA",
      "createdAt": "2025-10-04T04:07:39.915266Z",
      "updatedAt": "2025-10-04T04:07:39.915266Z",
      "_etag": "\"040029a9-0000-2400-0000-68e09f030000\""
    },
    {
      "id": "7b054cad-a7ba-45ce-bd3c-f9480949cec8",
      "name": "Diadi",
      "cityCode": "NUV-06",
      "provinceCode": "NUV",
      "createdAt": "2025-10-04T04:07:39.915375Z",
      "updatedAt": "2025-10-04T04:07:39.915375Z",
      "_etag": "\"04008fb4-0000-2400-0000-68e09f7c0000\""
    },
    {
      "id": "446859b6-da71-45df-91ff-eb5c90a1ecb8",
      "name": "Diffun",
      "cityCode": "QUI-03",
      "provinceCode": "QUI",
      "createdAt": "2025-10-04T04:07:39.915266Z",
      "updatedAt": "2025-10-04T04:07:39.915266Z",
      "_etag": "\"040037a9-0000-2400-0000-68e09f040000\""
    },
    {
      "id": "e8f74c37-0fde-41a2-b5fa-94a33a69d89a",
      "name": "Dilasag",
      "cityCode": "AUR-03",
      "provinceCode": "AUR",
      "createdAt": "2025-10-04T04:07:39.915266Z",
      "updatedAt": "2025-10-04T04:07:39.915266Z",
      "_etag": "\"04004ca9-0000-2400-0000-68e09f050000\""
    },
    {
      "id": "692fca71-6020-4b70-9708-1201bc130f83",
      "name": "Dimasalang",
      "cityCode": "MAS-08",
      "provinceCode": "MAS",
      "createdAt": "2025-10-04T04:07:39.915266Z",
      "updatedAt": "2025-10-04T04:07:39.915266Z",
      "_etag": "\"04005ba9-0000-2400-0000-68e09f050000\""
    },
    {
      "id": "ce75f285-a3d3-4cfd-9893-c5490aea78ff",
      "name": "Dimataling",
      "cityCode": "ZAS-05",
      "provinceCode": "ZAS",
      "createdAt": "2025-10-04T04:07:39.915394Z",
      "updatedAt": "2025-10-04T04:07:39.915394Z",
      "_etag": "\"040078b6-0000-2400-0000-68e09f8f0000\""
    },
    {
      "id": "2db6af06-eb1a-4507-b8d3-2189dd704e44",
      "name": "Dimiao",
      "cityCode": "BOH-20",
      "provinceCode": "BOH",
      "createdAt": "2025-10-04T04:07:39.915266Z",
      "updatedAt": "2025-10-04T04:07:39.915266Z",
      "_etag": "\"040070a9-0000-2400-0000-68e09f060000\""
    },
    {
      "id": "b0a9d7b8-19a0-440c-85d2-12dd5faab2b6",
      "name": "Dinagat",
      "cityCode": "DIN-03",
      "provinceCode": "DIN",
      "createdAt": "2025-10-04T04:07:39.915266Z",
      "updatedAt": "2025-10-04T04:07:39.915266Z",
      "_etag": "\"040083a9-0000-2400-0000-68e09f070000\""
    },
    {
      "id": "19640d92-dad9-466d-9999-d03db14ad0de",
      "name": "Dinalungan",
      "cityCode": "AUR-04",
      "provinceCode": "AUR",
      "createdAt": "2025-10-04T04:07:39.915266Z",
      "updatedAt": "2025-10-04T04:07:39.915266Z",
      "_etag": "\"040090a9-0000-2400-0000-68e09f070000\""
    },
    {
      "id": "27301cc8-7f12-4c46-ac64-b394fffcec99",
      "name": "Dinalupihan",
      "cityCode": "BAT-04",
      "provinceCode": "BAT",
      "createdAt": "2025-10-04T04:07:39.915372Z",
      "updatedAt": "2025-10-04T04:07:39.915372Z",
      "_etag": "\"04001cb3-0000-2400-0000-68e09f700000\""
    },
    {
      "id": "032f6516-17d9-4843-aa9b-30a832eef1ee",
      "name": "Dinapigue",
      "cityCode": "ISA-10",
      "provinceCode": "ISA",
      "createdAt": "2025-10-04T04:07:39.915267Z",
      "updatedAt": "2025-10-04T04:07:39.915267Z",
      "_etag": "\"040099a9-0000-2400-0000-68e09f080000\""
    },
    {
      "id": "b5cb7fdd-9ae9-4eb4-a33a-ae57031d712c",
      "name": "Dinas",
      "cityCode": "ZAS-06",
      "provinceCode": "ZAS",
      "createdAt": "2025-10-04T04:07:39.915267Z",
      "updatedAt": "2025-10-04T04:07:39.915267Z",
      "_etag": "\"04009ea9-0000-2400-0000-68e09f090000\""
    },
    {
      "id": "a1f4819c-b1e9-4a24-9ae2-5e7d0863aed6",
      "name": "Dingalan",
      "cityCode": "AUR-05",
      "provinceCode": "AUR",
      "createdAt": "2025-10-04T04:07:39.915267Z",
      "updatedAt": "2025-10-04T04:07:39.915267Z",
      "_etag": "\"0400aaa9-0000-2400-0000-68e09f090000\""
    },
    {
      "id": "db6bd32a-bca2-483b-ac59-781bbb3b5b93",
      "name": "Dingle",
      "cityCode": "ILO-16",
      "provinceCode": "ILO",
      "createdAt": "2025-10-04T04:07:39.915394Z",
      "updatedAt": "2025-10-04T04:07:39.915394Z",
      "_etag": "\"04006ab6-0000-2400-0000-68e09f8e0000\""
    },
    {
      "id": "46fc2b87-fc68-4264-8ae4-583f1604d219",
      "name": "Dingras",
      "cityCode": "ILN-09",
      "provinceCode": "ILN",
      "createdAt": "2025-10-04T04:07:39.915267Z",
      "updatedAt": "2025-10-04T04:07:39.915267Z",
      "_etag": "\"0400c0a9-0000-2400-0000-68e09f0a0000\""
    },
    {
      "id": "c993f731-621a-4cb1-9bc9-1e3754d87c9c",
      "name": "Dipaculao",
      "cityCode": "AUR-06",
      "provinceCode": "AUR",
      "createdAt": "2025-10-04T04:07:39.915267Z",
      "updatedAt": "2025-10-04T04:07:39.915267Z",
      "_etag": "\"0400cba9-0000-2400-0000-68e09f0b0000\""
    },
    {
      "id": "10b854df-30c1-4515-a1ce-2e37ae1236e1",
      "name": "Diplahan",
      "cityCode": "ZSI-03",
      "provinceCode": "ZSI",
      "createdAt": "2025-10-04T04:07:39.915268Z",
      "updatedAt": "2025-10-04T04:07:39.915268Z",
      "_etag": "\"0400d7a9-0000-2400-0000-68e09f0c0000\""
    },
    {
      "id": "cf4d74f5-10de-4880-ab4c-fe5aa878dc75",
      "name": "Dipolog City (Capital)",
      "cityCode": "ZAN-02",
      "provinceCode": "ZAN",
      "createdAt": "2025-10-04T04:07:39.915393Z",
      "updatedAt": "2025-10-04T04:07:39.915393Z",
      "_etag": "\"0400d8b5-0000-2400-0000-68e09f890000\""
    },
    {
      "id": "63818c6f-ea16-4144-a1bb-0442f6d5945f",
      "name": "Ditsaan-ramain",
      "cityCode": "LAN-24",
      "provinceCode": "LAN",
      "createdAt": "2025-10-04T04:07:39.915268Z",
      "updatedAt": "2025-10-04T04:07:39.915268Z",
      "_etag": "\"0400e2a9-0000-2400-0000-68e09f0c0000\""
    },
    {
      "id": "25ae9842-3b77-4d27-abb8-de4b3599804a",
      "name": "Divilacan",
      "cityCode": "ISA-11",
      "provinceCode": "ISA",
      "createdAt": "2025-10-04T04:07:39.915268Z",
      "updatedAt": "2025-10-04T04:07:39.915268Z",
      "_etag": "\"0400fba9-0000-2400-0000-68e09f0d0000\""
    },
    {
      "id": "b7dd5da0-3e70-4a81-b10f-d786dff82725",
      "name": "Dolores",
      "cityCode": "QUE-15",
      "provinceCode": "QUE",
      "createdAt": "2025-10-04T04:07:39.915268Z",
      "updatedAt": "2025-10-04T04:07:39.915268Z",
      "_etag": "\"040004aa-0000-2400-0000-68e09f0e0000\""
    },
    {
      "id": "b9cabfb4-a09e-4329-aeda-13d2226da046",
      "name": "Dolores",
      "cityCode": "ABR-07",
      "provinceCode": "ABR",
      "createdAt": "2025-10-04T04:07:39.915268Z",
      "updatedAt": "2025-10-04T04:07:39.915268Z",
      "_etag": "\"04000daa-0000-2400-0000-68e09f0f0000\""
    },
    {
      "id": "e71080ba-bc0f-41e8-a6a8-e320944679f7",
      "name": "Dolores",
      "cityCode": "EAS-06",
      "provinceCode": "EAS",
      "createdAt": "2025-10-04T04:07:39.915394Z",
      "updatedAt": "2025-10-04T04:07:39.915394Z",
      "_etag": "\"04003cb6-0000-2400-0000-68e09f8d0000\""
    },
    {
      "id": "d89bc25a-7a69-493c-ab35-1e30d56c3d3e",
      "name": "Don Carlos",
      "cityCode": "BUK-04",
      "provinceCode": "BUK",
      "createdAt": "2025-10-04T04:07:39.915268Z",
      "updatedAt": "2025-10-04T04:07:39.915268Z",
      "_etag": "\"040021aa-0000-2400-0000-68e09f0f0000\""
    },
    {
      "id": "7823aac5-6f91-471b-9b31-5546591680db",
      "name": "Don Marcelino",
      "cityCode": "DAC-01",
      "provinceCode": "DAC",
      "createdAt": "2025-10-04T04:07:39.915269Z",
      "updatedAt": "2025-10-04T04:07:39.915269Z",
      "_etag": "\"04002caa-0000-2400-0000-68e09f100000\""
    },
    {
      "id": "1410d05f-42ae-4450-b0ad-fdf1c65bf85c",
      "name": "Don Victoriano Chiongbian  (Don Mariano Marcos)",
      "cityCode": "MSC-17",
      "provinceCode": "MSC",
      "createdAt": "2025-10-04T04:07:39.915378Z",
      "updatedAt": "2025-10-04T04:07:39.915378Z",
      "_etag": "\"0400ccb5-0000-2400-0000-68e09f890000\""
    },
    {
      "id": "9d101c80-d5c9-471e-9452-b4745e46977b",
      "name": "Donsol",
      "cityCode": "SOR-07",
      "provinceCode": "SOR",
      "createdAt": "2025-10-04T04:07:39.915269Z",
      "updatedAt": "2025-10-04T04:07:39.915269Z",
      "_etag": "\"04003eaa-0000-2400-0000-68e09f110000\""
    },
    {
      "id": "f32bac69-34ec-4eec-8b4c-51c0ff2e160c",
      "name": "Doña Remedios Trinidad",
      "cityCode": "BUL-24",
      "provinceCode": "BUL",
      "createdAt": "2025-10-04T04:07:39.915269Z",
      "updatedAt": "2025-10-04T04:07:39.915269Z",
      "_etag": "\"040052aa-0000-2400-0000-68e09f120000\""
    },
    {
      "id": "da67104b-3eb9-45c2-bed6-d6bd0f675e9e",
      "name": "Duero",
      "cityCode": "BOH-21",
      "provinceCode": "BOH",
      "createdAt": "2025-10-04T04:07:39.915269Z",
      "updatedAt": "2025-10-04T04:07:39.915269Z",
      "_etag": "\"04005aaa-0000-2400-0000-68e09f120000\""
    },
    {
      "id": "7ab8e062-06e0-4732-abb5-9064c4b578b9",
      "name": "Dueñas",
      "cityCode": "ILO-17",
      "provinceCode": "ILO",
      "createdAt": "2025-10-04T04:07:39.915377Z",
      "updatedAt": "2025-10-04T04:07:39.915377Z",
      "_etag": "\"04002db5-0000-2400-0000-68e09f830000\""
    },
    {
      "id": "d44a8818-da35-493e-aa95-40b5b8dda89c",
      "name": "Dulag",
      "cityCode": "LEY-18",
      "provinceCode": "LEY",
      "createdAt": "2025-10-04T04:07:39.915269Z",
      "updatedAt": "2025-10-04T04:07:39.915269Z",
      "_etag": "\"040064aa-0000-2400-0000-68e09f120000\""
    },
    {
      "id": "a6871d7d-5c5d-460a-bed3-1df4c9ef55e0",
      "name": "Dumaguete City (Capital)",
      "cityCode": "NER-10",
      "provinceCode": "NER",
      "createdAt": "2025-10-04T04:07:39.915274Z",
      "updatedAt": "2025-10-04T04:07:39.915274Z",
      "_etag": "\"040078aa-0000-2400-0000-68e09f130000\""
    },
    {
      "id": "10e4e2b1-5960-4b20-aba9-bec0917dda4c",
      "name": "Dumalag",
      "cityCode": "CAP-03",
      "provinceCode": "CAP",
      "createdAt": "2025-10-04T04:07:39.915274Z",
      "updatedAt": "2025-10-04T04:07:39.915274Z",
      "_etag": "\"040089aa-0000-2400-0000-68e09f140000\""
    },
    {
      "id": "1bcdbe5e-d841-4bcb-8421-10999a1428a3",
      "name": "Dumalinao",
      "cityCode": "ZAS-07",
      "provinceCode": "ZAS",
      "createdAt": "2025-10-04T04:07:39.915393Z",
      "updatedAt": "2025-10-04T04:07:39.915393Z",
      "_etag": "\"040016b6-0000-2400-0000-68e09f8c0000\""
    },
    {
      "id": "83413356-cdf5-4b87-8b36-57679468b584",
      "name": "Dumalneg",
      "cityCode": "ILN-10",
      "provinceCode": "ILN",
      "createdAt": "2025-10-04T04:07:39.915274Z",
      "updatedAt": "2025-10-04T04:07:39.915274Z",
      "_etag": "\"040091aa-0000-2400-0000-68e09f140000\""
    },
    {
      "id": "0d6836b3-fdc3-435a-9ff7-32a0c874d2ee",
      "name": "Dumangas",
      "cityCode": "ILO-18",
      "provinceCode": "ILO",
      "createdAt": "2025-10-04T04:07:39.915275Z",
      "updatedAt": "2025-10-04T04:07:39.915275Z",
      "_etag": "\"0400afaa-0000-2400-0000-68e09f160000\""
    },
    {
      "id": "73754b0a-935d-4cfe-8867-cad0d0d736fc",
      "name": "Dumanjug",
      "cityCode": "CEB-24",
      "provinceCode": "CEB",
      "createdAt": "2025-10-04T04:07:39.915393Z",
      "updatedAt": "2025-10-04T04:07:39.915393Z",
      "_etag": "\"0400f3b5-0000-2400-0000-68e09f8a0000\""
    },
    {
      "id": "d111fc9b-0833-4cd0-a9ab-687aec347408",
      "name": "Dumaran",
      "cityCode": "PAL-11",
      "provinceCode": "PAL",
      "createdAt": "2025-10-04T04:07:39.915276Z",
      "updatedAt": "2025-10-04T04:07:39.915276Z",
      "_etag": "\"04005fab-0000-2400-0000-68e09f1d0000\""
    },
    {
      "id": "f8f59492-b262-4524-9f8b-c5280ad67a57",
      "name": "Dumarao",
      "cityCode": "CAP-04",
      "provinceCode": "CAP",
      "createdAt": "2025-10-04T04:07:39.915278Z",
      "updatedAt": "2025-10-04T04:07:39.915278Z",
      "_etag": "\"0400f4ab-0000-2400-0000-68e09f230000\""
    },
    {
      "id": "b839905f-af25-4604-90b0-3446b4887a8c",
      "name": "Dumingag",
      "cityCode": "ZAS-08",
      "provinceCode": "ZAS",
      "createdAt": "2025-10-04T04:07:39.915278Z",
      "updatedAt": "2025-10-04T04:07:39.915278Z",
      "_etag": "\"040000ac-0000-2400-0000-68e09f240000\""
    },
    {
      "id": "6ba38101-50ef-4bcf-9e49-6a27ac213635",
      "name": "Dupax Del Norte",
      "cityCode": "NUV-07",
      "provinceCode": "NUV",
      "createdAt": "2025-10-04T04:07:39.915317Z",
      "updatedAt": "2025-10-04T04:07:39.915317Z",
      "_etag": "\"0400f4ac-0000-2400-0000-68e09f2e0000\""
    },
    {
      "id": "9b25e108-d1ba-4951-817e-92b680f82676",
      "name": "Dupax Del Sur",
      "cityCode": "NUV-08",
      "provinceCode": "NUV",
      "createdAt": "2025-10-04T04:07:39.915278Z",
      "updatedAt": "2025-10-04T04:07:39.915278Z",
      "_etag": "\"04003dac-0000-2400-0000-68e09f260000\""
    },
    {
      "id": "a9954e84-7667-4cf9-a8a1-17a6aac84ae6",
      "name": "Echague",
      "cityCode": "ISA-12",
      "provinceCode": "ISA",
      "createdAt": "2025-10-04T04:07:39.915278Z",
      "updatedAt": "2025-10-04T04:07:39.915278Z",
      "_etag": "\"040010ac-0000-2400-0000-68e09f250000\""
    },
    {
      "id": "bf94894f-0e62-4093-ad2b-7fcc3711a216",
      "name": "El Nido (Bacuit)",
      "cityCode": "PAL-12",
      "provinceCode": "PAL",
      "createdAt": "2025-10-04T04:07:39.915278Z",
      "updatedAt": "2025-10-04T04:07:39.915278Z",
      "_etag": "\"040027ac-0000-2400-0000-68e09f260000\""
    },
    {
      "id": "f4a16c66-7c38-4670-a9c7-aee1832ff551",
      "name": "Enrile",
      "cityCode": "CAG-12",
      "provinceCode": "CAG",
      "createdAt": "2025-10-04T04:07:39.915318Z",
      "updatedAt": "2025-10-04T04:07:39.915318Z",
      "_etag": "\"04002ead-0000-2400-0000-68e09f300000\""
    },
    {
      "id": "b927ab12-f992-4c92-8dd9-dce7ab0a13a9",
      "name": "Enrique B. Magalona (Saravia)",
      "cityCode": "NEC-08",
      "provinceCode": "NEC",
      "createdAt": "2025-10-04T04:07:39.915316Z",
      "updatedAt": "2025-10-04T04:07:39.915316Z",
      "_etag": "\"040060ac-0000-2400-0000-68e09f280000\""
    },
    {
      "id": "bce0c278-5bc9-4dc4-8367-f9a4560417ae",
      "name": "Enrique Villanueva",
      "cityCode": "SIQ-01",
      "provinceCode": "SIQ",
      "createdAt": "2025-10-04T04:07:39.915278Z",
      "updatedAt": "2025-10-04T04:07:39.915278Z",
      "_etag": "\"040044ac-0000-2400-0000-68e09f270000\""
    },
    {
      "id": "0b18920c-f183-45c1-9c73-0dbf96a8dbec",
      "name": "Ermita",
      "cityCode": "NCR1-08",
      "provinceCode": "NCR1",
      "createdAt": "2025-10-04T04:07:39.915316Z",
      "updatedAt": "2025-10-04T04:07:39.915316Z",
      "_etag": "\"040058ac-0000-2400-0000-68e09f270000\""
    },
    {
      "id": "167a12b7-2ede-4b5f-8c35-2f9b0e40476d",
      "name": "Esperanza",
      "cityCode": "AGS-03",
      "provinceCode": "AGS",
      "createdAt": "2025-10-04T04:07:39.915316Z",
      "updatedAt": "2025-10-04T04:07:39.915316Z",
      "_etag": "\"04007aac-0000-2400-0000-68e09f290000\""
    },
    {
      "id": "33e70688-a6bc-4242-9ef9-d8713287c017",
      "name": "Esperanza",
      "cityCode": "SUK-03",
      "provinceCode": "SUK",
      "createdAt": "2025-10-04T04:07:39.915316Z",
      "updatedAt": "2025-10-04T04:07:39.915316Z",
      "_etag": "\"04008fac-0000-2400-0000-68e09f2a0000\""
    },
    {
      "id": "6f7accec-7c92-4d4a-8b2c-a1e0a6710209",
      "name": "Esperanza",
      "cityCode": "MAS-09",
      "provinceCode": "MAS",
      "createdAt": "2025-10-04T04:07:39.915318Z",
      "updatedAt": "2025-10-04T04:07:39.915318Z",
      "_etag": "\"040065ad-0000-2400-0000-68e09f330000\""
    },
    {
      "id": "bb872f8a-1f1a-4105-94b1-5aaabb9bc5dd",
      "name": "Estancia",
      "cityCode": "ILO-19",
      "provinceCode": "ILO",
      "createdAt": "2025-10-04T04:07:39.915316Z",
      "updatedAt": "2025-10-04T04:07:39.915316Z",
      "_etag": "\"040082ac-0000-2400-0000-68e09f290000\""
    },
    {
      "id": "e7ae0e85-de1c-4545-afae-25758c5eb69f",
      "name": "Famy",
      "cityCode": "LAG-08",
      "provinceCode": "LAG",
      "createdAt": "2025-10-04T04:07:39.915319Z",
      "updatedAt": "2025-10-04T04:07:39.915319Z",
      "_etag": "\"04009bad-0000-2400-0000-68e09f350000\""
    },
    {
      "id": "46a7cc3d-5593-429d-be14-3650bee0af28",
      "name": "Ferrol",
      "cityCode": "ROM-16",
      "provinceCode": "ROM",
      "createdAt": "2025-10-04T04:07:39.915317Z",
      "updatedAt": "2025-10-04T04:07:39.915317Z",
      "_etag": "\"0400b8ac-0000-2400-0000-68e09f2b0000\""
    },
    {
      "id": "0fb80d99-4746-4287-a58f-29a0ca73588a",
      "name": "Flora",
      "cityCode": "APA-03",
      "provinceCode": "APA",
      "createdAt": "2025-10-04T04:07:39.915317Z",
      "updatedAt": "2025-10-04T04:07:39.915317Z",
      "_etag": "\"0400a6ac-0000-2400-0000-68e09f2b0000\""
    },
    {
      "id": "aa623b5f-d93f-4303-bd38-6e9dff5eba61",
      "name": "Floridablanca",
      "cityCode": "PAM-06",
      "provinceCode": "PAM",
      "createdAt": "2025-10-04T04:07:39.915316Z",
      "updatedAt": "2025-10-04T04:07:39.915316Z",
      "_etag": "\"04009aac-0000-2400-0000-68e09f2a0000\""
    },
    {
      "id": "f7baf8fd-dd59-4eac-9042-09ef084b1088",
      "name": "Gabaldon (Bitulok & Sabani)",
      "cityCode": "NUE-07",
      "provinceCode": "NUE",
      "createdAt": "2025-10-04T04:07:39.915319Z",
      "updatedAt": "2025-10-04T04:07:39.915319Z",
      "_etag": "\"0400d8ad-0000-2400-0000-68e09f380000\""
    },
    {
      "id": "37667ffe-5190-4aa9-984a-5e63284699dc",
      "name": "Gainza",
      "cityCode": "CAS-13",
      "provinceCode": "CAS",
      "createdAt": "2025-10-04T04:07:39.915317Z",
      "updatedAt": "2025-10-04T04:07:39.915317Z",
      "_etag": "\"0400ecac-0000-2400-0000-68e09f2d0000\""
    },
    {
      "id": "6489bffb-7578-4475-a882-1481bbfce01c",
      "name": "Galimuyod",
      "cityCode": "ILS-09",
      "provinceCode": "ILS",
      "createdAt": "2025-10-04T04:07:39.915317Z",
      "updatedAt": "2025-10-04T04:07:39.915317Z",
      "_etag": "\"0400deac-0000-2400-0000-68e09f2d0000\""
    },
    {
      "id": "a718ffbc-0d5e-4d77-b2f3-35d146500412",
      "name": "Gamay",
      "cityCode": "NSA-07",
      "provinceCode": "NSA",
      "createdAt": "2025-10-04T04:07:39.915317Z",
      "updatedAt": "2025-10-04T04:07:39.915317Z",
      "_etag": "\"0400c5ac-0000-2400-0000-68e09f2c0000\""
    },
    {
      "id": "c8e41390-48c7-4071-8989-7fd152e9fc79",
      "name": "Gamu",
      "cityCode": "ISA-13",
      "provinceCode": "ISA",
      "createdAt": "2025-10-04T04:07:39.91532Z",
      "updatedAt": "2025-10-04T04:07:39.91532Z",
      "_etag": "\"040001ae-0000-2400-0000-68e09f3a0000\""
    },
    {
      "id": "8cf59578-f791-4b69-842d-47362d50b23c",
      "name": "Ganassi",
      "cityCode": "LAN-09",
      "provinceCode": "LAN",
      "createdAt": "2025-10-04T04:07:39.915318Z",
      "updatedAt": "2025-10-04T04:07:39.915318Z",
      "_etag": "\"040021ad-0000-2400-0000-68e09f300000\""
    },
    {
      "id": "7c975ee2-54c8-414f-a1e9-7f688babf18c",
      "name": "Gandara",
      "cityCode": "WSA-07",
      "provinceCode": "WSA",
      "createdAt": "2025-10-04T04:07:39.915318Z",
      "updatedAt": "2025-10-04T04:07:39.915318Z",
      "_etag": "\"040010ad-0000-2400-0000-68e09f2f0000\""
    },
    {
      "id": "36a1e80d-2c8d-412b-87bf-7734086c448d",
      "name": "Garchitorena",
      "cityCode": "CAS-14",
      "provinceCode": "CAS",
      "createdAt": "2025-10-04T04:07:39.915317Z",
      "updatedAt": "2025-10-04T04:07:39.915317Z",
      "_etag": "\"0400feac-0000-2400-0000-68e09f2f0000\""
    },
    {
      "id": "f58d8232-722b-4ff4-a8a5-67710922cd30",
      "name": "Garcia Hernandez",
      "cityCode": "BOH-22",
      "provinceCode": "BOH",
      "createdAt": "2025-10-04T04:07:39.915321Z",
      "updatedAt": "2025-10-04T04:07:39.915321Z",
      "_etag": "\"040047ae-0000-2400-0000-68e09f3c0000\""
    },
    {
      "id": "819d64b3-b057-4071-b39d-483710cbe8a8",
      "name": "Gasan",
      "cityCode": "MAD-03",
      "provinceCode": "MAD",
      "createdAt": "2025-10-04T04:07:39.915318Z",
      "updatedAt": "2025-10-04T04:07:39.915318Z",
      "_etag": "\"04005cad-0000-2400-0000-68e09f330000\""
    },
    {
      "id": "50e7aec1-e803-4d73-b685-80bf0a06ea9b",
      "name": "Gattaran",
      "cityCode": "CAG-13",
      "provinceCode": "CAG",
      "createdAt": "2025-10-04T04:07:39.915318Z",
      "updatedAt": "2025-10-04T04:07:39.915318Z",
      "_etag": "\"04004bad-0000-2400-0000-68e09f320000\""
    },
    {
      "id": "55fa254d-6c2e-4e28-b594-8e0da1715bb7",
      "name": "Gen. Mariano Alvarez",
      "cityCode": "CAV-23",
      "provinceCode": "CAV",
      "createdAt": "2025-10-04T04:07:39.915318Z",
      "updatedAt": "2025-10-04T04:07:39.915318Z",
      "_etag": "\"040039ad-0000-2400-0000-68e09f310000\""
    },
    {
      "id": "2a4e034c-2040-4201-bde1-00c3c9c083e4",
      "name": "Gen. S. K. Pendatun",
      "cityCode": "MAG-19",
      "provinceCode": "MAG",
      "createdAt": "2025-10-04T04:07:39.915321Z",
      "updatedAt": "2025-10-04T04:07:39.915321Z",
      "_etag": "\"040055ae-0000-2400-0000-68e09f3d0000\""
    },
    {
      "id": "9a6d6400-6c1a-4342-bd24-0e135d2b627d",
      "name": "General Emilio Aguinaldo",
      "cityCode": "CAV-07",
      "provinceCode": "CAV",
      "createdAt": "2025-10-04T04:07:39.915319Z",
      "updatedAt": "2025-10-04T04:07:39.915319Z",
      "_etag": "\"040088ad-0000-2400-0000-68e09f350000\""
    },
    {
      "id": "6caed9fb-69d4-4510-b025-0552608e09d5",
      "name": "General Luna",
      "cityCode": "SUN-10",
      "provinceCode": "SUN",
      "createdAt": "2025-10-04T04:07:39.915318Z",
      "updatedAt": "2025-10-04T04:07:39.915318Z",
      "_etag": "\"04006cad-0000-2400-0000-68e09f330000\""
    },
    {
      "id": "25fc4987-dc52-4bf8-bf92-a9bd0db70c54",
      "name": "General Luna",
      "cityCode": "QUE-16",
      "provinceCode": "QUE",
      "createdAt": "2025-10-04T04:07:39.915319Z",
      "updatedAt": "2025-10-04T04:07:39.915319Z",
      "_etag": "\"04007ead-0000-2400-0000-68e09f340000\""
    },
    {
      "id": "9070f1cb-d713-4a1d-9451-1ff5f01b5f33",
      "name": "General Macarthur",
      "cityCode": "EAS-07",
      "provinceCode": "EAS",
      "createdAt": "2025-10-04T04:07:39.915321Z",
      "updatedAt": "2025-10-04T04:07:39.915321Z",
      "_etag": "\"040069ae-0000-2400-0000-68e09f3e0000\""
    },
    {
      "id": "cd6a4c33-e635-40ec-bf4e-54c7fa4abe59",
      "name": "General Mamerto Natividad",
      "cityCode": "NUE-09",
      "provinceCode": "NUE",
      "createdAt": "2025-10-04T04:07:39.915319Z",
      "updatedAt": "2025-10-04T04:07:39.915319Z",
      "_etag": "\"0400cbad-0000-2400-0000-68e09f370000\""
    },
    {
      "id": "8359daea-22fe-4bcd-bd86-a74c69836fc5",
      "name": "General Nakar",
      "cityCode": "QUE-17",
      "provinceCode": "QUE",
      "createdAt": "2025-10-04T04:07:39.915319Z",
      "updatedAt": "2025-10-04T04:07:39.915319Z",
      "_etag": "\"0400b6ad-0000-2400-0000-68e09f370000\""
    },
    {
      "id": "6f152961-7547-4417-b6bb-1af75f10cfd6",
      "name": "General Santos City (Dadiangas)",
      "cityCode": "SCO-03",
      "provinceCode": "SCO",
      "createdAt": "2025-10-04T04:07:39.915319Z",
      "updatedAt": "2025-10-04T04:07:39.915319Z",
      "_etag": "\"0400aaad-0000-2400-0000-68e09f360000\""
    },
    {
      "id": "a1271a96-de9e-4a02-a402-c005b61e3167",
      "name": "General Tinio (Papaya)",
      "cityCode": "NUE-10",
      "provinceCode": "NUE",
      "createdAt": "2025-10-04T04:07:39.915321Z",
      "updatedAt": "2025-10-04T04:07:39.915321Z",
      "_etag": "\"040070ae-0000-2400-0000-68e09f3e0000\""
    },
    {
      "id": "04daaab9-ae3b-452b-a1d5-113d120e3f53",
      "name": "General Trias",
      "cityCode": "CAV-08",
      "provinceCode": "CAV",
      "createdAt": "2025-10-04T04:07:39.91532Z",
      "updatedAt": "2025-10-04T04:07:39.91532Z",
      "_etag": "\"0400f3ad-0000-2400-0000-68e09f390000\""
    },
    {
      "id": "78d70d9e-e473-43db-84ac-24681b6fdab5",
      "name": "Gerona",
      "cityCode": "TAR-06",
      "provinceCode": "TAR",
      "createdAt": "2025-10-04T04:07:39.91532Z",
      "updatedAt": "2025-10-04T04:07:39.91532Z",
      "_etag": "\"0400eaad-0000-2400-0000-68e09f380000\""
    },
    {
      "id": "89dfa0b6-8375-48c5-b295-2b2f878dc476",
      "name": "Gigaquit",
      "cityCode": "SUN-11",
      "provinceCode": "SUN",
      "createdAt": "2025-10-04T04:07:39.91532Z",
      "updatedAt": "2025-10-04T04:07:39.91532Z",
      "_etag": "\"0400e3ad-0000-2400-0000-68e09f380000\""
    },
    {
      "id": "0fd20eec-f33a-40eb-aeb5-0bd299ad0122",
      "name": "Gigmoto",
      "cityCode": "CAT-05",
      "provinceCode": "CAT",
      "createdAt": "2025-10-04T04:07:39.915321Z",
      "updatedAt": "2025-10-04T04:07:39.915321Z",
      "_etag": "\"040081ae-0000-2400-0000-68e09f3f0000\""
    },
    {
      "id": "0b94b0d3-cbe8-449a-88ae-9c536c38a55b",
      "name": "Ginatilan",
      "cityCode": "CEB-25",
      "provinceCode": "CEB",
      "createdAt": "2025-10-04T04:07:39.91532Z",
      "updatedAt": "2025-10-04T04:07:39.91532Z",
      "_etag": "\"040038ae-0000-2400-0000-68e09f3c0000\""
    },
    {
      "id": "5455e5e2-ae98-48cf-bc5e-de75f3b49f1a",
      "name": "Gingoog City",
      "cityCode": "MSR-08",
      "provinceCode": "MSR",
      "createdAt": "2025-10-04T04:07:39.91532Z",
      "updatedAt": "2025-10-04T04:07:39.91532Z",
      "_etag": "\"040030ae-0000-2400-0000-68e09f3b0000\""
    },
    {
      "id": "b6662bd5-b01f-47ad-8fa3-dd532d19d3de",
      "name": "Giporlos",
      "cityCode": "EAS-08",
      "provinceCode": "EAS",
      "createdAt": "2025-10-04T04:07:39.91532Z",
      "updatedAt": "2025-10-04T04:07:39.91532Z",
      "_etag": "\"04000eae-0000-2400-0000-68e09f3a0000\""
    },
    {
      "id": "6d587088-84ff-4ef2-b955-bd4e8bd35466",
      "name": "Gitagum",
      "cityCode": "MSR-09",
      "provinceCode": "MSR",
      "createdAt": "2025-10-04T04:07:39.915321Z",
      "updatedAt": "2025-10-04T04:07:39.915321Z",
      "_etag": "\"040091ae-0000-2400-0000-68e09f400000\""
    },
    {
      "id": "f16ebc03-e739-42f6-a4d4-f3581af9b3fd",
      "name": "Glan",
      "cityCode": "SAR-02",
      "provinceCode": "SAR",
      "createdAt": "2025-10-04T04:07:39.915343Z",
      "updatedAt": "2025-10-04T04:07:39.915343Z",
      "_etag": "\"0400a5ae-0000-2400-0000-68e09f410000\""
    },
    {
      "id": "d6836dd0-8aff-427d-870b-3e6e2a7643a0",
      "name": "Gloria",
      "cityCode": "MNR-06",
      "provinceCode": "MNR",
      "createdAt": "2025-10-04T04:07:39.915343Z",
      "updatedAt": "2025-10-04T04:07:39.915344Z",
      "_etag": "\"0400c7ae-0000-2400-0000-68e09f420000\""
    },
    {
      "id": "c4b67dd6-f0a6-4e3d-83ba-16e55da1aa44",
      "name": "Goa",
      "cityCode": "CAS-15",
      "provinceCode": "CAS",
      "createdAt": "2025-10-04T04:07:39.915345Z",
      "updatedAt": "2025-10-04T04:07:39.915345Z",
      "_etag": "\"040046af-0000-2400-0000-68e09f470000\""
    },
    {
      "id": "71fa4023-c6f0-41ec-9a6c-5f7896cb6aab",
      "name": "Godod",
      "cityCode": "ZAN-25",
      "provinceCode": "ZAN",
      "createdAt": "2025-10-04T04:07:39.915346Z",
      "updatedAt": "2025-10-04T04:07:39.915346Z",
      "_etag": "\"0400a7af-0000-2400-0000-68e09f4b0000\""
    },
    {
      "id": "b165c084-1687-4d7f-9463-39da3eb9bb26",
      "name": "Gonzaga",
      "cityCode": "CAG-14",
      "provinceCode": "CAG",
      "createdAt": "2025-10-04T04:07:39.915344Z",
      "updatedAt": "2025-10-04T04:07:39.915344Z",
      "_etag": "\"0400ddae-0000-2400-0000-68e09f430000\""
    },
    {
      "id": "74a85799-e97a-4712-83ef-b4ff42ad03a8",
      "name": "Governor Generoso",
      "cityCode": "DAR-06",
      "provinceCode": "DAR",
      "createdAt": "2025-10-04T04:07:39.915344Z",
      "updatedAt": "2025-10-04T04:07:39.915344Z",
      "_etag": "\"0400e4ae-0000-2400-0000-68e09f430000\""
    },
    {
      "id": "98223f5e-7c4b-41d7-9569-5343aa9d0114",
      "name": "Gregorio Del Pilar (Concepcion)",
      "cityCode": "ILS-10",
      "provinceCode": "ILS",
      "createdAt": "2025-10-04T04:07:39.915345Z",
      "updatedAt": "2025-10-04T04:07:39.915345Z",
      "_etag": "\"040074af-0000-2400-0000-68e09f490000\""
    },
    {
      "id": "70e9993e-7720-4c23-a056-55aa15f57fd1",
      "name": "Guagua",
      "cityCode": "PAM-07",
      "provinceCode": "PAM",
      "createdAt": "2025-10-04T04:07:39.915346Z",
      "updatedAt": "2025-10-04T04:07:39.915346Z",
      "_etag": "\"0400e2af-0000-2400-0000-68e09f4d0000\""
    },
    {
      "id": "1ee16a12-151f-4a17-b4ea-de366ef2f566",
      "name": "Gubat",
      "cityCode": "SOR-08",
      "provinceCode": "SOR",
      "createdAt": "2025-10-04T04:07:39.915344Z",
      "updatedAt": "2025-10-04T04:07:39.915344Z",
      "_etag": "\"0400f4ae-0000-2400-0000-68e09f440000\""
    },
    {
      "id": "64d5df3f-a3b3-49b0-8e72-676ca2ebc9f5",
      "name": "Guiguinto",
      "cityCode": "BUL-08",
      "provinceCode": "BUL",
      "createdAt": "2025-10-04T04:07:39.915346Z",
      "updatedAt": "2025-10-04T04:07:39.915346Z",
      "_etag": "\"0400c2af-0000-2400-0000-68e09f4c0000\""
    },
    {
      "id": "2b26b634-3a9e-4dab-b45d-70bc75a392cb",
      "name": "Guimba",
      "cityCode": "NUE-11",
      "provinceCode": "NUE",
      "createdAt": "2025-10-04T04:07:39.915347Z",
      "updatedAt": "2025-10-04T04:07:39.915347Z",
      "_etag": "\"04000fb0-0000-2400-0000-68e09f500000\""
    },
    {
      "id": "9e180a98-431f-4fa1-ac37-bafe19c9f01b",
      "name": "Guimbal",
      "cityCode": "ILO-20",
      "provinceCode": "ILO",
      "createdAt": "2025-10-04T04:07:39.915344Z",
      "updatedAt": "2025-10-04T04:07:39.915344Z",
      "_etag": "\"04000faf-0000-2400-0000-68e09f450000\""
    },
    {
      "id": "7943a9e6-ad45-456c-ba15-ac3dd24dcfb1",
      "name": "Guinayangan",
      "cityCode": "QUE-18",
      "provinceCode": "QUE",
      "createdAt": "2025-10-04T04:07:39.915346Z",
      "updatedAt": "2025-10-04T04:07:39.915346Z",
      "_etag": "\"0400eaaf-0000-2400-0000-68e09f4e0000\""
    },
    {
      "id": "4351f026-02d9-44c6-b115-cb47663dbf8a",
      "name": "Guindulman",
      "cityCode": "BOH-23",
      "provinceCode": "BOH",
      "createdAt": "2025-10-04T04:07:39.915347Z",
      "updatedAt": "2025-10-04T04:07:39.915347Z",
      "_etag": "\"040033b0-0000-2400-0000-68e09f520000\""
    },
    {
      "id": "79c24119-2651-4eae-abfd-a9eea9673a75",
      "name": "Guindulungan",
      "cityCode": "MAG-25",
      "provinceCode": "MAG",
      "createdAt": "2025-10-04T04:07:39.915344Z",
      "updatedAt": "2025-10-04T04:07:39.915344Z",
      "_etag": "\"040024af-0000-2400-0000-68e09f460000\""
    },
    {
      "id": "bd2e937a-9e27-4573-b534-db3ebcf80eb9",
      "name": "Guinobatan",
      "cityCode": "ALB-04",
      "provinceCode": "ALB",
      "createdAt": "2025-10-04T04:07:39.915347Z",
      "updatedAt": "2025-10-04T04:07:39.915347Z",
      "_etag": "\"04001cb0-0000-2400-0000-68e09f510000\""
    },
    {
      "id": "205db304-45d8-410e-a748-e49851ede1cc",
      "name": "Guinsiliban",
      "cityCode": "CAM-02",
      "provinceCode": "CAM",
      "createdAt": "2025-10-04T04:07:39.915348Z",
      "updatedAt": "2025-10-04T04:07:39.915348Z",
      "_etag": "\"04003eb0-0000-2400-0000-68e09f520000\""
    },
    {
      "id": "bba1d49a-7d1f-4e20-b523-472b99d99518",
      "name": "Guipos",
      "cityCode": "ZAS-43",
      "provinceCode": "ZAS",
      "createdAt": "2025-10-04T04:07:39.915345Z",
      "updatedAt": "2025-10-04T04:07:39.915345Z",
      "_etag": "\"04003aaf-0000-2400-0000-68e09f460000\""
    },
    {
      "id": "5e36186a-232c-4144-82a3-62ee77bb9999",
      "name": "Guiuan",
      "cityCode": "EAS-09",
      "provinceCode": "EAS",
      "createdAt": "2025-10-04T04:07:39.915349Z",
      "updatedAt": "2025-10-04T04:07:39.915349Z",
      "_etag": "\"0400bbb0-0000-2400-0000-68e09f570000\""
    },
    {
      "id": "4008bab9-7d97-4eaa-b0b0-08d82dfb9f43",
      "name": "Gumaca",
      "cityCode": "QUE-19",
      "provinceCode": "QUE",
      "createdAt": "2025-10-04T04:07:39.915348Z",
      "updatedAt": "2025-10-04T04:07:39.915348Z",
      "_etag": "\"040049b0-0000-2400-0000-68e09f530000\""
    },
    {
      "id": "04056369-0129-4f80-86cf-8346d725d693",
      "name": "Gutalac",
      "cityCode": "ZAN-23",
      "provinceCode": "ZAN",
      "createdAt": "2025-10-04T04:07:39.915345Z",
      "updatedAt": "2025-10-04T04:07:39.915345Z",
      "_etag": "\"040067af-0000-2400-0000-68e09f480000\""
    },
    {
      "id": "8c183498-dbf7-45bf-b9dd-af1e15490682",
      "name": "Hadji Mohammad Ajul",
      "cityCode": "BAS-10",
      "provinceCode": "BAS",
      "createdAt": "2025-10-04T04:07:39.915349Z",
      "updatedAt": "2025-10-04T04:07:39.915349Z",
      "_etag": "\"0400c7b0-0000-2400-0000-68e09f580000\""
    },
    {
      "id": "5bdf2ee0-d242-432a-8895-bead4a8c87de",
      "name": "Hadji Muhtamad",
      "cityCode": "BAS-12",
      "provinceCode": "BAS",
      "createdAt": "2025-10-04T04:07:39.915348Z",
      "updatedAt": "2025-10-04T04:07:39.915348Z",
      "_etag": "\"040058b0-0000-2400-0000-68e09f530000\""
    },
    {
      "id": "9c9ab30f-25c8-4c43-a7c6-46fdcf6b119c",
      "name": "Hadji Panglima Tahil (Marunggas)",
      "cityCode": "SUL-06",
      "provinceCode": "SUL",
      "createdAt": "2025-10-04T04:07:39.915345Z",
      "updatedAt": "2025-10-04T04:07:39.915346Z",
      "_etag": "\"040097af-0000-2400-0000-68e09f4a0000\""
    },
    {
      "id": "56872c04-04c1-4aa1-a820-a10d2f91d72d",
      "name": "Hagonoy",
      "cityCode": "DAS-04",
      "provinceCode": "DAS",
      "createdAt": "2025-10-04T04:07:39.915348Z",
      "updatedAt": "2025-10-04T04:07:39.915348Z",
      "_etag": "\"04006eb0-0000-2400-0000-68e09f540000\""
    },
    {
      "id": "53da6c52-d15a-4daf-a10a-1caf7f066a7b",
      "name": "Hagonoy",
      "cityCode": "BUL-09",
      "provinceCode": "BUL",
      "createdAt": "2025-10-04T04:07:39.915349Z",
      "updatedAt": "2025-10-04T04:07:39.915349Z",
      "_etag": "\"0400dab0-0000-2400-0000-68e09f580000\""
    },
    {
      "id": "73081db6-dada-49e2-944a-4f6493a9a4fd",
      "name": "Hamtic",
      "cityCode": "ANT-08",
      "provinceCode": "ANT",
      "createdAt": "2025-10-04T04:07:39.915346Z",
      "updatedAt": "2025-10-04T04:07:39.915346Z",
      "_etag": "\"0400d1af-0000-2400-0000-68e09f4d0000\""
    },
    {
      "id": "52f2f67a-cb82-47ea-bc1a-62a6c00027d4",
      "name": "Hermosa",
      "cityCode": "BAT-05",
      "provinceCode": "BAT",
      "createdAt": "2025-10-04T04:07:39.915349Z",
      "updatedAt": "2025-10-04T04:07:39.915349Z",
      "_etag": "\"0400e9b0-0000-2400-0000-68e09f590000\""
    },
    {
      "id": "c5a3441d-b91b-4643-907e-e8d7f357f25e",
      "name": "Hernani",
      "cityCode": "EAS-10",
      "provinceCode": "EAS",
      "createdAt": "2025-10-04T04:07:39.915348Z",
      "updatedAt": "2025-10-04T04:07:39.915348Z",
      "_etag": "\"040082b0-0000-2400-0000-68e09f550000\""
    },
    {
      "id": "d0af4c03-f279-4c7d-a921-90cda170e9a0",
      "name": "Hilongos",
      "cityCode": "LEY-19",
      "provinceCode": "LEY",
      "createdAt": "2025-10-04T04:07:39.915347Z",
      "updatedAt": "2025-10-04T04:07:39.915347Z",
      "_etag": "\"0400feaf-0000-2400-0000-68e09f4f0000\""
    },
    {
      "id": "87232bf2-5cb7-4ef8-b76f-7cc8236ab5c9",
      "name": "Hinabangan",
      "cityCode": "WSA-08",
      "provinceCode": "WSA",
      "createdAt": "2025-10-04T04:07:39.91535Z",
      "updatedAt": "2025-10-04T04:07:39.91535Z",
      "_etag": "\"0400ffb0-0000-2400-0000-68e09f5a0000\""
    },
    {
      "id": "2e35cab4-39fe-4919-92c1-4ea1ca794ea8",
      "name": "Hinatuan",
      "cityCode": "SUR-09",
      "provinceCode": "SUR",
      "createdAt": "2025-10-04T04:07:39.915348Z",
      "updatedAt": "2025-10-04T04:07:39.915348Z",
      "_etag": "\"040094b0-0000-2400-0000-68e09f550000\""
    },
    {
      "id": "8cfed2ea-4336-4f38-b424-3c55d17e6b28",
      "name": "Hindang",
      "cityCode": "LEY-20",
      "provinceCode": "LEY",
      "createdAt": "2025-10-04T04:07:39.915347Z",
      "updatedAt": "2025-10-04T04:07:39.915347Z",
      "_etag": "\"040028b0-0000-2400-0000-68e09f510000\""
    },
    {
      "id": "7671d7af-dea8-44c8-a4fc-7a9e73497576",
      "name": "Hingyon",
      "cityCode": "IFU-09",
      "provinceCode": "IFU",
      "createdAt": "2025-10-04T04:07:39.915375Z",
      "updatedAt": "2025-10-04T04:07:39.915375Z",
      "_etag": "\"040084b4-0000-2400-0000-68e09f7c0000\""
    },
    {
      "id": "6447b0d0-ef58-41b7-957b-b073c6ac17b1",
      "name": "Hinigaran",
      "cityCode": "NEC-11",
      "provinceCode": "NEC",
      "createdAt": "2025-10-04T04:07:39.91537Z",
      "updatedAt": "2025-10-04T04:07:39.91537Z",
      "_etag": "\"040082b2-0000-2400-0000-68e09f6a0000\""
    },
    {
      "id": "c1d0506e-a374-4856-bacd-f9c3cf084b05",
      "name": "Hinoba-an (Asia)",
      "cityCode": "NEC-12",
      "provinceCode": "NEC",
      "createdAt": "2025-10-04T04:07:39.91537Z",
      "updatedAt": "2025-10-04T04:07:39.91537Z",
      "_etag": "\"04006fb2-0000-2400-0000-68e09f6a0000\""
    },
    {
      "id": "fd788912-cf13-4f33-a5f0-5029d2b7b38b",
      "name": "Hinunangan",
      "cityCode": "SLE-03",
      "provinceCode": "SLE",
      "createdAt": "2025-10-04T04:07:39.915377Z",
      "updatedAt": "2025-10-04T04:07:39.915377Z",
      "_etag": "\"04000eb5-0000-2400-0000-68e09f820000\""
    },
    {
      "id": "0345ca80-de12-4d67-8b70-60a12c55d83e",
      "name": "Hinundayan",
      "cityCode": "SLE-04",
      "provinceCode": "SLE",
      "createdAt": "2025-10-04T04:07:39.915395Z",
      "updatedAt": "2025-10-04T04:07:39.915395Z",
      "_etag": "\"0400a8b6-0000-2400-0000-68e09f910000\""
    },
    {
      "id": "a0224bf0-2e54-4de8-975f-5bf164e359dc",
      "name": "Hungduan",
      "cityCode": "IFU-02",
      "provinceCode": "IFU",
      "createdAt": "2025-10-04T04:07:39.915372Z",
      "updatedAt": "2025-10-04T04:07:39.915372Z",
      "_etag": "\"040022b3-0000-2400-0000-68e09f700000\""
    },
    {
      "id": "ac4022f6-ecab-42c5-9806-9d3a3d658c49",
      "name": "Iba (Capital)",
      "cityCode": "ZAM-05",
      "provinceCode": "ZAM",
      "createdAt": "2025-10-04T04:07:39.91537Z",
      "updatedAt": "2025-10-04T04:07:39.91537Z",
      "_etag": "\"04005fb2-0000-2400-0000-68e09f690000\""
    },
    {
      "id": "0e075fde-b2c8-4d6d-a139-673fd155644c",
      "name": "Ibaan",
      "cityCode": "BTG-10",
      "provinceCode": "BTG",
      "createdAt": "2025-10-04T04:07:39.915369Z",
      "updatedAt": "2025-10-04T04:07:39.915369Z",
      "_etag": "\"04002eb2-0000-2400-0000-68e09f680000\""
    },
    {
      "id": "51546fc9-3236-4b61-8026-2446fe6fc28f",
      "name": "Ibajay",
      "cityCode": "AKL-06",
      "provinceCode": "AKL",
      "createdAt": "2025-10-04T04:07:39.915396Z",
      "updatedAt": "2025-10-04T04:07:39.915396Z",
      "_etag": "\"040009b7-0000-2400-0000-68e09f950000\""
    },
    {
      "id": "738ff26b-cd29-4bc4-ae4f-161d4f12b14d",
      "name": "Igbaras",
      "cityCode": "ILO-21",
      "provinceCode": "ILO",
      "createdAt": "2025-10-04T04:07:39.915369Z",
      "updatedAt": "2025-10-04T04:07:39.915369Z",
      "_etag": "\"04003cb2-0000-2400-0000-68e09f680000\""
    },
    {
      "id": "0a4610b1-1b4d-44ef-9562-68f146c61ded",
      "name": "Iguig",
      "cityCode": "CAG-15",
      "provinceCode": "CAG",
      "createdAt": "2025-10-04T04:07:39.915368Z",
      "updatedAt": "2025-10-04T04:07:39.915368Z",
      "_etag": "\"0400f6b1-0000-2400-0000-68e09f650000\""
    },
    {
      "id": "598b0207-b591-4e41-9fa9-5147015b8007",
      "name": "Ilagan City (Capital)",
      "cityCode": "ISA-14",
      "provinceCode": "ISA",
      "createdAt": "2025-10-04T04:07:39.915397Z",
      "updatedAt": "2025-10-04T04:07:39.915397Z",
      "_etag": "\"0400bcb7-0000-2400-0000-68e09f9c0000\""
    },
    {
      "id": "941d97ca-3cd9-4c49-8f12-4fc1b8664dfd",
      "name": "Iligan City",
      "cityCode": "LAN-04",
      "provinceCode": "LAN",
      "createdAt": "2025-10-04T04:07:39.915369Z",
      "updatedAt": "2025-10-04T04:07:39.915369Z",
      "_etag": "\"040022b2-0000-2400-0000-68e09f670000\""
    },
    {
      "id": "23b6a33c-bd34-40e8-9386-952c8e56c095",
      "name": "Ilog",
      "cityCode": "NEC-13",
      "provinceCode": "NEC",
      "createdAt": "2025-10-04T04:07:39.915371Z",
      "updatedAt": "2025-10-04T04:07:39.915371Z",
      "_etag": "\"0400b4b2-0000-2400-0000-68e09f6c0000\""
    },
    {
      "id": "b29b61a1-d444-490c-bc0b-2f0f302195da",
      "name": "Iloilo City (Capital)",
      "cityCode": "ILO-22",
      "provinceCode": "ILO",
      "createdAt": "2025-10-04T04:07:39.915397Z",
      "updatedAt": "2025-10-04T04:07:39.915397Z",
      "_etag": "\"0400b1b7-0000-2400-0000-68e09f9b0000\""
    },
    {
      "id": "da3a3467-9ea5-4357-9c73-0e5043b4e623",
      "name": "Imelda",
      "cityCode": "ZSI-04",
      "provinceCode": "ZSI",
      "createdAt": "2025-10-04T04:07:39.915368Z",
      "updatedAt": "2025-10-04T04:07:39.915369Z",
      "_etag": "\"040000b2-0000-2400-0000-68e09f650000\""
    },
    {
      "id": "c1d800bb-2a38-4bb9-a2e6-0005ed654e09",
      "name": "Impasug-ong",
      "cityCode": "BUK-05",
      "provinceCode": "BUK",
      "createdAt": "2025-10-04T04:07:39.915371Z",
      "updatedAt": "2025-10-04T04:07:39.915371Z",
      "_etag": "\"0400bdb2-0000-2400-0000-68e09f6d0000\""
    },
    {
      "id": "2b8afdbf-fc1f-45b1-bc03-62cb9da685ce",
      "name": "Imus City",
      "cityCode": "CAV-09",
      "provinceCode": "CAV",
      "createdAt": "2025-10-04T04:07:39.915397Z",
      "updatedAt": "2025-10-04T04:07:39.915397Z",
      "_etag": "\"040095b7-0000-2400-0000-68e09f9a0000\""
    },
    {
      "id": "9ead84cf-4cd0-4035-9990-f4a23fedbfdf",
      "name": "Inabanga",
      "cityCode": "BOH-24",
      "provinceCode": "BOH",
      "createdAt": "2025-10-04T04:07:39.915372Z",
      "updatedAt": "2025-10-04T04:07:39.915372Z",
      "_etag": "\"040053b3-0000-2400-0000-68e09f720000\""
    },
    {
      "id": "a02d6329-a5ae-4808-a4c6-b050e3211370",
      "name": "Indanan",
      "cityCode": "SUL-01",
      "provinceCode": "SUL",
      "createdAt": "2025-10-04T04:07:39.915371Z",
      "updatedAt": "2025-10-04T04:07:39.915371Z",
      "_etag": "\"0400deb2-0000-2400-0000-68e09f6e0000\""
    },
    {
      "id": "a78a7877-71da-4d35-af9b-fff738348b52",
      "name": "Indang",
      "cityCode": "CAV-10",
      "provinceCode": "CAV",
      "createdAt": "2025-10-04T04:07:39.915396Z",
      "updatedAt": "2025-10-04T04:07:39.915396Z",
      "_etag": "\"040070b7-0000-2400-0000-68e09f990000\""
    },
    {
      "id": "95b6284e-d110-44e3-bfbe-646c8406f1b3",
      "name": "Infanta",
      "cityCode": "QUE-20",
      "provinceCode": "QUE",
      "createdAt": "2025-10-04T04:07:39.915371Z",
      "updatedAt": "2025-10-04T04:07:39.915371Z",
      "_etag": "\"0400d5b2-0000-2400-0000-68e09f6e0000\""
    },
    {
      "id": "98e964c9-f515-4b03-bd5d-f03b86f8bd5f",
      "name": "Infanta",
      "cityCode": "PAN-20",
      "provinceCode": "PAN",
      "createdAt": "2025-10-04T04:07:39.915375Z",
      "updatedAt": "2025-10-04T04:07:39.915375Z",
      "_etag": "\"04005ab4-0000-2400-0000-68e09f7a0000\""
    },
    {
      "id": "9c1979d0-ce8d-4304-a1dd-2a58c50785a5",
      "name": "Initao",
      "cityCode": "MSR-10",
      "provinceCode": "MSR",
      "createdAt": "2025-10-04T04:07:39.915396Z",
      "updatedAt": "2025-10-04T04:07:39.915396Z",
      "_etag": "\"04005cb7-0000-2400-0000-68e09f980000\""
    },
    {
      "id": "1814890b-5c3f-4a52-8356-44fb24029d4c",
      "name": "Inopacan",
      "cityCode": "LEY-21",
      "provinceCode": "LEY",
      "createdAt": "2025-10-04T04:07:39.915374Z",
      "updatedAt": "2025-10-04T04:07:39.915374Z",
      "_etag": "\"0400e8b3-0000-2400-0000-68e09f760000\""
    },
    {
      "id": "f9cff75e-5f82-479b-900e-a97dd73aeb72",
      "name": "Intramuros",
      "cityCode": "NCR1-09",
      "provinceCode": "NCR1",
      "createdAt": "2025-10-04T04:07:39.915366Z",
      "updatedAt": "2025-10-04T04:07:39.915366Z",
      "_etag": "\"040077b1-0000-2400-0000-68e09f5e0000\""
    },
    {
      "id": "cdfc7747-95bb-4a63-babe-9b3834d75112",
      "name": "Ipil (Capital)",
      "cityCode": "ZSI-05",
      "provinceCode": "ZSI",
      "createdAt": "2025-10-04T04:07:39.915395Z",
      "updatedAt": "2025-10-04T04:07:39.915395Z",
      "_etag": "\"0400c6b6-0000-2400-0000-68e09f920000\""
    },
    {
      "id": "a6658cf9-86d1-4a3d-a2c1-fa0ef399bc99",
      "name": "Iriga City",
      "cityCode": "CAS-16",
      "provinceCode": "CAS",
      "createdAt": "2025-10-04T04:07:39.915372Z",
      "updatedAt": "2025-10-04T04:07:39.915372Z",
      "_etag": "\"04000fb3-0000-2400-0000-68e09f6f0000\""
    },
    {
      "id": "6734ef1a-3f1c-4c24-88c6-2b064aca7efa",
      "name": "Irosin",
      "cityCode": "SOR-09",
      "provinceCode": "SOR",
      "createdAt": "2025-10-04T04:07:39.915378Z",
      "updatedAt": "2025-10-04T04:07:39.915378Z",
      "_etag": "\"0400b2b5-0000-2400-0000-68e09f880000\""
    },
    {
      "id": "be5630bc-752a-4c43-b23c-6e042e842cca",
      "name": "Isabel",
      "cityCode": "LEY-22",
      "provinceCode": "LEY",
      "createdAt": "2025-10-04T04:07:39.915395Z",
      "updatedAt": "2025-10-04T04:07:39.915395Z",
      "_etag": "\"0400d4b6-0000-2400-0000-68e09f930000\""
    },
    {
      "id": "e91425f8-3b3c-4605-bebc-58c1b79e87dd",
      "name": "Isabela",
      "cityCode": "NEC-14",
      "provinceCode": "NEC",
      "createdAt": "2025-10-04T04:07:39.915378Z",
      "updatedAt": "2025-10-04T04:07:39.915378Z",
      "_etag": "\"04009db5-0000-2400-0000-68e09f870000\""
    },
    {
      "id": "affa12d1-59ca-4ac8-8136-e22eeeed8140",
      "name": "Island Garden City Of Samal",
      "cityCode": "DAN-17",
      "provinceCode": "DAN",
      "createdAt": "2025-10-04T04:07:39.915394Z",
      "updatedAt": "2025-10-04T04:07:39.915394Z",
      "_etag": "\"040088b6-0000-2400-0000-68e09f900000\""
    },
    {
      "id": "66e3b48e-c8a4-45fe-bb3a-01a6e51426de",
      "name": "Isulan (Capital)",
      "cityCode": "SUK-04",
      "provinceCode": "SUK",
      "createdAt": "2025-10-04T04:07:39.915396Z",
      "updatedAt": "2025-10-04T04:07:39.915396Z",
      "_etag": "\"040045b7-0000-2400-0000-68e09f970000\""
    },
    {
      "id": "e864871a-afff-4c88-a27a-06b3ced7540c",
      "name": "Itbayat",
      "cityCode": "BTN-02",
      "provinceCode": "BTN",
      "createdAt": "2025-10-04T04:07:39.915377Z",
      "updatedAt": "2025-10-04T04:07:39.915377Z",
      "_etag": "\"040072b5-0000-2400-0000-68e09f850000\""
    },
    {
      "id": "e66ab2b0-4a17-42fd-b36b-ef1f6b1794c1",
      "name": "Itogon",
      "cityCode": "BEN-06",
      "provinceCode": "BEN",
      "createdAt": "2025-10-04T04:07:39.915394Z",
      "updatedAt": "2025-10-04T04:07:39.915394Z",
      "_etag": "\"040098b6-0000-2400-0000-68e09f900000\""
    },
    {
      "id": "7a33e765-6ec9-45cc-9b05-a0287cf9eb6e",
      "name": "Ivana",
      "cityCode": "BTN-03",
      "provinceCode": "BTN",
      "createdAt": "2025-10-04T04:07:39.915397Z",
      "updatedAt": "2025-10-04T04:07:39.915397Z",
      "_etag": "\"0400a0b7-0000-2400-0000-68e09f9b0000\""
    },
    {
      "id": "6f40bbd8-9757-44ca-ae25-342961347750",
      "name": "Ivisan",
      "cityCode": "CAP-05",
      "provinceCode": "CAP",
      "createdAt": "2025-10-04T04:07:39.915376Z",
      "updatedAt": "2025-10-04T04:07:39.915376Z",
      "_etag": "\"0400d1b4-0000-2400-0000-68e09f7f0000\""
    },
    {
      "id": "0f04f48c-8f2b-473b-beea-f8ce2e38198c",
      "name": "Jabonga",
      "cityCode": "AGN-05",
      "provinceCode": "AGN",
      "createdAt": "2025-10-04T04:07:39.915393Z",
      "updatedAt": "2025-10-04T04:07:39.915394Z",
      "_etag": "\"04002eb6-0000-2400-0000-68e09f8c0000\""
    },
    {
      "id": "42e7deef-3197-4895-8f46-ddbc2eb25286",
      "name": "Jaen",
      "cityCode": "NUE-12",
      "provinceCode": "NUE",
      "createdAt": "2025-10-04T04:07:39.915397Z",
      "updatedAt": "2025-10-04T04:07:39.915397Z",
      "_etag": "\"0400ccb7-0000-2400-0000-68e09f9c0000\""
    },
    {
      "id": "ab1d3e2d-20e2-4648-981c-1af6b2e30a51",
      "name": "Jagna",
      "cityCode": "BOH-25",
      "provinceCode": "BOH",
      "createdAt": "2025-10-04T04:07:39.915377Z",
      "updatedAt": "2025-10-04T04:07:39.915377Z",
      "_etag": "\"04005eb5-0000-2400-0000-68e09f850000\""
    },
    {
      "id": "c9ac319a-8fa8-4d4a-8e3d-5359bcaf911e",
      "name": "Jala-jala",
      "cityCode": "RIZ-07",
      "provinceCode": "RIZ",
      "createdAt": "2025-10-04T04:07:39.915398Z",
      "updatedAt": "2025-10-04T04:07:39.915398Z",
      "_etag": "\"0400f7b7-0000-2400-0000-68e09f9e0000\""
    },
    {
      "id": "f9a1e678-524a-4a45-aa4f-670b0b0e2c87",
      "name": "Jamindan",
      "cityCode": "CAP-06",
      "provinceCode": "CAP",
      "createdAt": "2025-10-04T04:07:39.915377Z",
      "updatedAt": "2025-10-04T04:07:39.915377Z",
      "_etag": "\"040040b5-0000-2400-0000-68e09f830000\""
    },
    {
      "id": "d96dccdb-0833-46d5-9561-fcab48ccb84d",
      "name": "Janiuay",
      "cityCode": "ILO-23",
      "provinceCode": "ILO",
      "createdAt": "2025-10-04T04:07:39.915397Z",
      "updatedAt": "2025-10-04T04:07:39.915397Z",
      "_etag": "\"0400d7b7-0000-2400-0000-68e09f9d0000\""
    },
    {
      "id": "c54a57de-cc43-4543-8d5b-205765953a46",
      "name": "Jaro",
      "cityCode": "LEY-23",
      "provinceCode": "LEY",
      "createdAt": "2025-10-04T04:07:39.915375Z",
      "updatedAt": "2025-10-04T04:07:39.915376Z",
      "_etag": "\"0400a1b4-0000-2400-0000-68e09f7d0000\""
    },
    {
      "id": "94a9713d-e840-466c-bce3-aeacd49e3634",
      "name": "Jasaan",
      "cityCode": "MSR-11",
      "provinceCode": "MSR",
      "createdAt": "2025-10-04T04:07:39.915375Z",
      "updatedAt": "2025-10-04T04:07:39.915375Z",
      "_etag": "\"040068b4-0000-2400-0000-68e09f7b0000\""
    },
    {
      "id": "33e8c955-1462-4a35-94c2-525d7063b6af",
      "name": "Javier (Bugho)",
      "cityCode": "LEY-24",
      "provinceCode": "LEY",
      "createdAt": "2025-10-04T04:07:39.915369Z",
      "updatedAt": "2025-10-04T04:07:39.915369Z",
      "_etag": "\"04000cb2-0000-2400-0000-68e09f660000\""
    },
    {
      "id": "6a6c6609-74d6-4d5b-85bc-0061ef41c4d0",
      "name": "Jetafe",
      "cityCode": "BOH-26",
      "provinceCode": "BOH",
      "createdAt": "2025-10-04T04:07:39.91537Z",
      "updatedAt": "2025-10-04T04:07:39.91537Z",
      "_etag": "\"0400abb2-0000-2400-0000-68e09f6c0000\""
    },
    {
      "id": "4c4d87ef-b30f-445c-8905-9c0500cf6a4b",
      "name": "Jiabong",
      "cityCode": "WSA-09",
      "provinceCode": "WSA",
      "createdAt": "2025-10-04T04:07:39.915366Z",
      "updatedAt": "2025-10-04T04:07:39.915366Z",
      "_etag": "\"040085b1-0000-2400-0000-68e09f5f0000\""
    },
    {
      "id": "b6a15ed9-c53f-48a3-9902-e4bfd3f7912e",
      "name": "Jimalalud",
      "cityCode": "NER-12",
      "provinceCode": "NER",
      "createdAt": "2025-10-04T04:07:39.915373Z",
      "updatedAt": "2025-10-04T04:07:39.915373Z",
      "_etag": "\"040094b3-0000-2400-0000-68e09f740000\""
    },
    {
      "id": "ebe22930-d7d3-4a72-abe3-c0688f8c9d6c",
      "name": "Jimenez",
      "cityCode": "MSC-07",
      "provinceCode": "MSC",
      "createdAt": "2025-10-04T04:07:39.915373Z",
      "updatedAt": "2025-10-04T04:07:39.915373Z",
      "_etag": "\"0400d3b3-0000-2400-0000-68e09f750000\""
    },
    {
      "id": "6758f6bf-79b6-4d2f-9dc1-048d7eb09467",
      "name": "Jipapad",
      "cityCode": "EAS-11",
      "provinceCode": "EAS",
      "createdAt": "2025-10-04T04:07:39.915374Z",
      "updatedAt": "2025-10-04T04:07:39.915374Z",
      "_etag": "\"0400efb3-0000-2400-0000-68e09f760000\""
    },
    {
      "id": "f7c89fd5-4b82-4dc3-980c-f89e271763a4",
      "name": "Jolo (Capital)",
      "cityCode": "SUL-02",
      "provinceCode": "SUL",
      "createdAt": "2025-10-04T04:07:39.915374Z",
      "updatedAt": "2025-10-04T04:07:39.915374Z",
      "_etag": "\"040000b4-0000-2400-0000-68e09f770000\""
    },
    {
      "id": "b70ece73-9908-4054-b99d-617e1c6628d5",
      "name": "Jomalig",
      "cityCode": "QUE-21",
      "provinceCode": "QUE",
      "createdAt": "2025-10-04T04:07:39.915375Z",
      "updatedAt": "2025-10-04T04:07:39.915375Z",
      "_etag": "\"040077b4-0000-2400-0000-68e09f7b0000\""
    },
    {
      "id": "09d56cc5-0665-4683-9ca1-85a1fc724fdc",
      "name": "Jones",
      "cityCode": "ISA-15",
      "provinceCode": "ISA",
      "createdAt": "2025-10-04T04:07:39.915367Z",
      "updatedAt": "2025-10-04T04:07:39.915367Z",
      "_etag": "\"040097b1-0000-2400-0000-68e09f600000\""
    },
    {
      "id": "316176b0-d79c-41f8-b586-7ce635de5f7f",
      "name": "Jordan (Capital)",
      "cityCode": "GUI-02",
      "provinceCode": "GUI",
      "createdAt": "2025-10-04T04:07:39.915376Z",
      "updatedAt": "2025-10-04T04:07:39.915376Z",
      "_etag": "\"0400edb4-0000-2400-0000-68e09f800000\""
    },
    {
      "id": "a83a8f36-d889-45ef-bb73-2b2931d0b0eb",
      "name": "Jose Abad Santos (Trinidad)",
      "cityCode": "DAC-02",
      "provinceCode": "DAC",
      "createdAt": "2025-10-04T04:07:39.915367Z",
      "updatedAt": "2025-10-04T04:07:39.915367Z",
      "_etag": "\"0400a1b1-0000-2400-0000-68e09f600000\""
    },
    {
      "id": "8483bb18-375e-4a61-a49a-d61298aca557",
      "name": "Jose Dalman (Ponot)",
      "cityCode": "ZAN-22",
      "provinceCode": "ZAN",
      "createdAt": "2025-10-04T04:07:39.915376Z",
      "updatedAt": "2025-10-04T04:07:39.915376Z",
      "_etag": "\"0400feb4-0000-2400-0000-68e09f810000\""
    },
    {
      "id": "d7e0e0da-f8ba-4e7d-8f1a-3cfa13f10958",
      "name": "Jose Panganiban",
      "cityCode": "CAN-05",
      "provinceCode": "CAN",
      "createdAt": "2025-10-04T04:07:39.915377Z",
      "updatedAt": "2025-10-04T04:07:39.915377Z",
      "_etag": "\"040088b5-0000-2400-0000-68e09f860000\""
    },
    {
      "id": "90437e1c-1e40-4d7b-b9cc-4ef3c276c5af",
      "name": "Josefina",
      "cityCode": "ZAS-37",
      "provinceCode": "ZAS",
      "createdAt": "2025-10-04T04:07:39.915374Z",
      "updatedAt": "2025-10-04T04:07:39.915374Z",
      "_etag": "\"040041b4-0000-2400-0000-68e09f790000\""
    },
    {
      "id": "3d62fa8d-a660-449e-8233-5c5a57669a22",
      "name": "Jovellar",
      "cityCode": "ALB-05",
      "provinceCode": "ALB",
      "createdAt": "2025-10-04T04:07:39.915373Z",
      "updatedAt": "2025-10-04T04:07:39.915373Z",
      "_etag": "\"04009db3-0000-2400-0000-68e09f740000\""
    },
    {
      "id": "f72d07ed-8f33-47de-8a20-e3eccff3961e",
      "name": "Juban",
      "cityCode": "SOR-10",
      "provinceCode": "SOR",
      "createdAt": "2025-10-04T04:07:39.915373Z",
      "updatedAt": "2025-10-04T04:07:39.915373Z",
      "_etag": "\"040083b3-0000-2400-0000-68e09f730000\""
    },
    {
      "id": "fc2ec249-d13a-4160-a4b0-6d367cd6771a",
      "name": "Julita",
      "cityCode": "LEY-25",
      "provinceCode": "LEY",
      "createdAt": "2025-10-04T04:07:39.915373Z",
      "updatedAt": "2025-10-04T04:07:39.915373Z",
      "_etag": "\"04006ab3-0000-2400-0000-68e09f730000\""
    },
    {
      "id": "0eda24c1-6c46-44f1-9cf5-0b26051094a8",
      "name": "Kabacan",
      "cityCode": "NCO-03",
      "provinceCode": "NCO",
      "createdAt": "2025-10-04T04:07:39.915372Z",
      "updatedAt": "2025-10-04T04:07:39.915372Z",
      "_etag": "\"040040b3-0000-2400-0000-68e09f710000\""
    },
    {
      "id": "4b33149e-d560-407a-b8f2-6f8bfb1dc9d7",
      "name": "Kabasalan",
      "cityCode": "ZSI-06",
      "provinceCode": "ZSI",
      "createdAt": "2025-10-04T04:07:39.915367Z",
      "updatedAt": "2025-10-04T04:07:39.915367Z",
      "_etag": "\"0400aeb1-0000-2400-0000-68e09f620000\""
    },
    {
      "id": "b1eb4408-e497-4244-9501-b2aff6ba9b18",
      "name": "Kabayan",
      "cityCode": "BEN-07",
      "provinceCode": "BEN",
      "createdAt": "2025-10-04T04:07:39.915367Z",
      "updatedAt": "2025-10-04T04:07:39.915367Z",
      "_etag": "\"0400beb1-0000-2400-0000-68e09f620000\""
    },
    {
      "id": "523a70a6-7fd1-4a69-a73a-08a9a40a0284",
      "name": "Kabugao (Capital)",
      "cityCode": "APA-04",
      "provinceCode": "APA",
      "createdAt": "2025-10-04T04:07:39.915369Z",
      "updatedAt": "2025-10-04T04:07:39.915369Z",
      "_etag": "\"040016b2-0000-2400-0000-68e09f670000\""
    },
    {
      "id": "14dc385d-15b1-496c-baeb-cba859507fd3",
      "name": "Kabuntalan (Tumbao)",
      "cityCode": "MAG-14",
      "provinceCode": "MAG",
      "createdAt": "2025-10-04T04:07:39.915371Z",
      "updatedAt": "2025-10-04T04:07:39.915371Z",
      "_etag": "\"0400ffb2-0000-2400-0000-68e09f6f0000\""
    },
    {
      "id": "8fc7f005-8760-4970-8ba0-d77de38b5a92",
      "name": "Kadingilan",
      "cityCode": "BUK-06",
      "provinceCode": "BUK",
      "createdAt": "2025-10-04T04:07:39.915374Z",
      "updatedAt": "2025-10-04T04:07:39.915374Z",
      "_etag": "\"04001cb4-0000-2400-0000-68e09f780000\""
    },
    {
      "id": "e2c40ab2-ebf2-4135-a32b-ebb45166e72b",
      "name": "Kalamansig",
      "cityCode": "SUK-05",
      "provinceCode": "SUK",
      "createdAt": "2025-10-04T04:07:39.915376Z",
      "updatedAt": "2025-10-04T04:07:39.915376Z",
      "_etag": "\"0400b9b4-0000-2400-0000-68e09f7e0000\""
    },
    {
      "id": "6c3d90f5-cde3-47c0-8b6f-4210c47455ed",
      "name": "Kalawit",
      "cityCode": "ZAN-27",
      "provinceCode": "ZAN",
      "createdAt": "2025-10-04T04:07:39.915378Z",
      "updatedAt": "2025-10-04T04:07:39.915378Z",
      "_etag": "\"040095b5-0000-2400-0000-68e09f860000\""
    },
    {
      "id": "e2d598ff-8d63-4e10-b295-fc4be7ba05a0",
      "name": "Kalayaan",
      "cityCode": "LAG-09",
      "provinceCode": "LAG",
      "createdAt": "2025-10-04T04:07:39.915393Z",
      "updatedAt": "2025-10-04T04:07:39.915393Z",
      "_etag": "\"040006b6-0000-2400-0000-68e09f8b0000\""
    },
    {
      "id": "b2ca32a4-58b8-4bb7-8180-f60c58ae55d5",
      "name": "Kalayaan",
      "cityCode": "PAL-21",
      "provinceCode": "PAL",
      "createdAt": "2025-10-04T04:07:39.915394Z",
      "updatedAt": "2025-10-04T04:07:39.915395Z",
      "_etag": "\"0400a1b6-0000-2400-0000-68e09f910000\""
    },
    {
      "id": "1ad78478-b100-4301-b21e-e04dcb86a540",
      "name": "Kalibo (Capital)",
      "cityCode": "AKL-07",
      "provinceCode": "AKL",
      "createdAt": "2025-10-04T04:07:39.915395Z",
      "updatedAt": "2025-10-04T04:07:39.915395Z",
      "_etag": "\"0400b7b6-0000-2400-0000-68e09f920000\""
    },
    {
      "id": "eb1963d3-9b0c-410d-a755-20a381d5edf8",
      "name": "Kalilangan",
      "cityCode": "BUK-07",
      "provinceCode": "BUK",
      "createdAt": "2025-10-04T04:07:39.915395Z",
      "updatedAt": "2025-10-04T04:07:39.915395Z",
      "_etag": "\"0400e1b6-0000-2400-0000-68e09f940000\""
    },
    {
      "id": "b00129d0-850b-4538-978b-e17569aae820",
      "name": "Kalingalan Caluang",
      "cityCode": "SUL-03",
      "provinceCode": "SUL",
      "createdAt": "2025-10-04T04:07:39.915395Z",
      "updatedAt": "2025-10-04T04:07:39.915395Z",
      "_etag": "\"0400ebb6-0000-2400-0000-68e09f940000\""
    },
    {
      "id": "5c2f0bea-ed3d-4ac6-ba73-aaeac2ce271c",
      "name": "Kananga",
      "cityCode": "LEY-26",
      "provinceCode": "LEY",
      "createdAt": "2025-10-04T04:07:39.915396Z",
      "updatedAt": "2025-10-04T04:07:39.915396Z",
      "_etag": "\"0400f6b6-0000-2400-0000-68e09f950000\""
    },
    {
      "id": "f1c82467-b875-45e4-ba7c-502b074b1281",
      "name": "Kapai",
      "cityCode": "LAN-10",
      "provinceCode": "LAN",
      "createdAt": "2025-10-04T04:07:39.915396Z",
      "updatedAt": "2025-10-04T04:07:39.915396Z",
      "_etag": "\"040013b7-0000-2400-0000-68e09f960000\""
    },
    {
      "id": "f8c9b42a-8f97-4a04-8b49-893f49751429",
      "name": "Kapalong",
      "cityCode": "DAN-05",
      "provinceCode": "DAN",
      "createdAt": "2025-10-04T04:07:39.915396Z",
      "updatedAt": "2025-10-04T04:07:39.915396Z",
      "_etag": "\"040028b7-0000-2400-0000-68e09f960000\""
    },
    {
      "id": "59017e3b-fa32-464c-8c41-2639af094a16",
      "name": "Kapangan",
      "cityCode": "BEN-08",
      "provinceCode": "BEN",
      "createdAt": "2025-10-04T04:07:39.915397Z",
      "updatedAt": "2025-10-04T04:07:39.915397Z",
      "_etag": "\"04007fb7-0000-2400-0000-68e09f990000\""
    },
    {
      "id": "3736102b-06bd-40df-809e-e6110ba01916",
      "name": "Kapatagan",
      "cityCode": "LAN-05",
      "provinceCode": "LAN",
      "createdAt": "2025-10-04T04:07:39.915398Z",
      "updatedAt": "2025-10-04T04:07:39.915398Z",
      "_etag": "\"0400efb7-0000-2400-0000-68e09f9e0000\""
    },
    {
      "id": "86adb224-57d8-4110-993e-6cb474a9f5f8",
      "name": "Kapatagan",
      "cityCode": "LAN-39",
      "provinceCode": "LAN",
      "createdAt": "2025-10-04T04:07:39.915398Z",
      "updatedAt": "2025-10-04T04:07:39.915398Z",
      "_etag": "\"040005b8-0000-2400-0000-68e09f9f0000\""
    },
    {
      "id": "efa8cf7f-ee20-4fd9-8b71-83191b2ff2c5",
      "name": "Kasibu",
      "cityCode": "NUV-09",
      "provinceCode": "NUV",
      "createdAt": "2025-10-04T04:07:39.915398Z",
      "updatedAt": "2025-10-04T04:07:39.915398Z",
      "_etag": "\"040017b8-0000-2400-0000-68e09fa00000\""
    },
    {
      "id": "54145b66-71d3-4396-a6f9-75a1ed8ba1bc",
      "name": "Katipunan",
      "cityCode": "ZAN-03",
      "provinceCode": "ZAN",
      "createdAt": "2025-10-04T04:07:39.915398Z",
      "updatedAt": "2025-10-04T04:07:39.915398Z",
      "_etag": "\"04001eb8-0000-2400-0000-68e09fa00000\""
    },
    {
      "id": "3cca022e-eb72-40e4-b573-3ab4eef1ad83",
      "name": "Kauswagan",
      "cityCode": "LAN-07",
      "provinceCode": "LAN",
      "createdAt": "2025-10-04T04:07:39.915398Z",
      "updatedAt": "2025-10-04T04:07:39.915398Z",
      "_etag": "\"04002bb8-0000-2400-0000-68e09fa10000\""
    },
    {
      "id": "10bac875-d7ad-468f-9eb3-52a114f74d0d",
      "name": "Kawayan",
      "cityCode": "BIL-06",
      "provinceCode": "BIL",
      "createdAt": "2025-10-04T04:07:39.915398Z",
      "updatedAt": "2025-10-04T04:07:39.915398Z",
      "_etag": "\"04003bb8-0000-2400-0000-68e09fa20000\""
    },
    {
      "id": "784a5fe3-f2e8-44e5-8c78-a0c1287aa999",
      "name": "Kawit",
      "cityCode": "CAV-11",
      "provinceCode": "CAV",
      "createdAt": "2025-10-04T04:07:39.915398Z",
      "updatedAt": "2025-10-04T04:07:39.915399Z",
      "_etag": "\"040046b8-0000-2400-0000-68e09fa20000\""
    },
    {
      "id": "80556b66-6b7b-4075-9374-9f54c3624ff4",
      "name": "Kayapa",
      "cityCode": "NUV-10",
      "provinceCode": "NUV",
      "createdAt": "2025-10-04T04:07:39.915399Z",
      "updatedAt": "2025-10-04T04:07:39.915399Z",
      "_etag": "\"040051b8-0000-2400-0000-68e09fa30000\""
    },
    {
      "id": "ad6000ea-fdde-49fc-bb58-cb08135af6d5",
      "name": "Kiamba",
      "cityCode": "SAR-03",
      "provinceCode": "SAR",
      "createdAt": "2025-10-04T04:07:39.915399Z",
      "updatedAt": "2025-10-04T04:07:39.915399Z",
      "_etag": "\"040062b8-0000-2400-0000-68e09fa30000\""
    },
    {
      "id": "41103bb9-049d-44d8-be06-9b0ea7d4a7c1",
      "name": "Kiangan",
      "cityCode": "IFU-03",
      "provinceCode": "IFU",
      "createdAt": "2025-10-04T04:07:39.915399Z",
      "updatedAt": "2025-10-04T04:07:39.915399Z",
      "_etag": "\"040081b8-0000-2400-0000-68e09fa40000\""
    },
    {
      "id": "a6c69f1d-f79f-4470-a826-082c36969359",
      "name": "Kibawe",
      "cityCode": "BUK-08",
      "provinceCode": "BUK",
      "createdAt": "2025-10-04T04:07:39.915408Z",
      "updatedAt": "2025-10-04T04:07:39.915408Z",
      "_etag": "\"040089b8-0000-2400-0000-68e09fa50000\""
    },
    {
      "id": "0522107e-cefe-4cd6-85d4-22de0e97ab62",
      "name": "Kiblawan",
      "cityCode": "DAS-06",
      "provinceCode": "DAS",
      "createdAt": "2025-10-04T04:07:39.915409Z",
      "updatedAt": "2025-10-04T04:07:39.915409Z",
      "_etag": "\"040098b8-0000-2400-0000-68e09fa50000\""
    },
    {
      "id": "2cec9574-4702-4e2d-9579-d67360b03925",
      "name": "Kibungan",
      "cityCode": "BEN-09",
      "provinceCode": "BEN",
      "createdAt": "2025-10-04T04:07:39.915409Z",
      "updatedAt": "2025-10-04T04:07:39.915409Z",
      "_etag": "\"0400a4b8-0000-2400-0000-68e09fa60000\""
    },
    {
      "id": "0956840b-8641-4e1b-bd84-496b369b8f35",
      "name": "Kinoguitan",
      "cityCode": "MSR-12",
      "provinceCode": "MSR",
      "createdAt": "2025-10-04T04:07:39.915409Z",
      "updatedAt": "2025-10-04T04:07:39.915409Z",
      "_etag": "\"0400acb8-0000-2400-0000-68e09fa60000\""
    },
    {
      "id": "4e702b72-47e1-4098-8b6f-71fcaaaa8051",
      "name": "Kitaotao",
      "cityCode": "BUK-09",
      "provinceCode": "BUK",
      "createdAt": "2025-10-04T04:07:39.915409Z",
      "updatedAt": "2025-10-04T04:07:39.915409Z",
      "_etag": "\"0400b8b8-0000-2400-0000-68e09fa70000\""
    },
    {
      "id": "39b4cf4f-f678-4b94-9c12-7060aff4e997",
      "name": "Kitcharao",
      "cityCode": "AGN-06",
      "provinceCode": "AGN",
      "createdAt": "2025-10-04T04:07:39.915409Z",
      "updatedAt": "2025-10-04T04:07:39.915409Z",
      "_etag": "\"0400c3b8-0000-2400-0000-68e09fa70000\""
    },
    {
      "id": "fe2307e0-4da0-4b85-b43f-fbbf42247c2f",
      "name": "Kolambugan",
      "cityCode": "LAN-08",
      "provinceCode": "LAN",
      "createdAt": "2025-10-04T04:07:39.915409Z",
      "updatedAt": "2025-10-04T04:07:39.915409Z",
      "_etag": "\"0400d9b8-0000-2400-0000-68e09fa80000\""
    },
    {
      "id": "9748e9d7-2dd4-464c-b471-ed9e3b50d388",
      "name": "Kumalarang",
      "cityCode": "ZAS-11",
      "provinceCode": "ZAS",
      "createdAt": "2025-10-04T04:07:39.915409Z",
      "updatedAt": "2025-10-04T04:07:39.91541Z",
      "_etag": "\"0400e8b8-0000-2400-0000-68e09fa80000\""
    },
    {
      "id": "ccb16e61-f595-488b-bfdb-bb41cf05ca7f",
      "name": "La Carlota City",
      "cityCode": "NEC-16",
      "provinceCode": "NEC",
      "createdAt": "2025-10-04T04:07:39.91541Z",
      "updatedAt": "2025-10-04T04:07:39.91541Z",
      "_etag": "\"0400f9b8-0000-2400-0000-68e09fa90000\""
    },
    {
      "id": "f99e9b8d-2c6c-4d48-8e51-e2d2791b4d78",
      "name": "La Castellana",
      "cityCode": "NEC-17",
      "provinceCode": "NEC",
      "createdAt": "2025-10-04T04:07:39.91541Z",
      "updatedAt": "2025-10-04T04:07:39.91541Z",
      "_etag": "\"040002b9-0000-2400-0000-68e09fa90000\""
    },
    {
      "id": "cb470633-3b85-416e-87e4-b6c20ddd9896",
      "name": "La Libertad",
      "cityCode": "NER-13",
      "provinceCode": "NER",
      "createdAt": "2025-10-04T04:07:39.91541Z",
      "updatedAt": "2025-10-04T04:07:39.91541Z",
      "_etag": "\"040010b9-0000-2400-0000-68e09faa0000\""
    },
    {
      "id": "04739b5f-6146-4332-b4ef-b8c6796e093c",
      "name": "La Libertad",
      "cityCode": "ZAN-04",
      "provinceCode": "ZAN",
      "createdAt": "2025-10-04T04:07:39.91541Z",
      "updatedAt": "2025-10-04T04:07:39.91541Z",
      "_etag": "\"040021b9-0000-2400-0000-68e09faa0000\""
    },
    {
      "id": "dd4a1ac2-e9f4-4b06-8906-f09523a25b49",
      "name": "La Paz",
      "cityCode": "TAR-07",
      "provinceCode": "TAR",
      "createdAt": "2025-10-04T04:07:39.91541Z",
      "updatedAt": "2025-10-04T04:07:39.91541Z",
      "_etag": "\"04003db9-0000-2400-0000-68e09fab0000\""
    },
    {
      "id": "16d14226-8235-4af6-b7b0-9ad1054a8741",
      "name": "La Paz",
      "cityCode": "LEY-28",
      "provinceCode": "LEY",
      "createdAt": "2025-10-04T04:07:39.91541Z",
      "updatedAt": "2025-10-04T04:07:39.91541Z",
      "_etag": "\"04004bb9-0000-2400-0000-68e09fac0000\""
    },
    {
      "id": "ea4a9d40-cca7-4672-aa8b-f99eec9491ab",
      "name": "La Paz",
      "cityCode": "AGS-04",
      "provinceCode": "AGS",
      "createdAt": "2025-10-04T04:07:39.91541Z",
      "updatedAt": "2025-10-04T04:07:39.915411Z",
      "_etag": "\"040054b9-0000-2400-0000-68e09fac0000\""
    },
    {
      "id": "6abbe603-fab5-4db7-90c6-b36c8f21474c",
      "name": "La Paz",
      "cityCode": "ABR-08",
      "provinceCode": "ABR",
      "createdAt": "2025-10-04T04:07:39.915411Z",
      "updatedAt": "2025-10-04T04:07:39.915411Z",
      "_etag": "\"04005fb9-0000-2400-0000-68e09fac0000\""
    },
    {
      "id": "24d6286a-61ca-45ba-915f-656db2fcd55e",
      "name": "La Trinidad (Capital)",
      "cityCode": "BEN-10",
      "provinceCode": "BEN",
      "createdAt": "2025-10-04T04:07:39.915411Z",
      "updatedAt": "2025-10-04T04:07:39.915411Z",
      "_etag": "\"04006ab9-0000-2400-0000-68e09fad0000\""
    },
    {
      "id": "7792e0ee-b35c-4df4-bda9-dcacc2ce78db",
      "name": "Laak (San Vicente)",
      "cityCode": "COM-02",
      "provinceCode": "COM",
      "createdAt": "2025-10-04T04:07:39.915411Z",
      "updatedAt": "2025-10-04T04:07:39.915411Z",
      "_etag": "\"040078b9-0000-2400-0000-68e09fad0000\""
    },
    {
      "id": "4eb41892-5dad-4ee0-a157-a27e5b61f86a",
      "name": "Labangan",
      "cityCode": "ZAS-12",
      "provinceCode": "ZAS",
      "createdAt": "2025-10-04T04:07:39.915411Z",
      "updatedAt": "2025-10-04T04:07:39.915411Z",
      "_etag": "\"040081b9-0000-2400-0000-68e09fae0000\""
    },
    {
      "id": "6427fc07-3838-483d-be6f-fdc609eba853",
      "name": "Labason",
      "cityCode": "ZAN-05",
      "provinceCode": "ZAN",
      "createdAt": "2025-10-04T04:07:39.915411Z",
      "updatedAt": "2025-10-04T04:07:39.915411Z",
      "_etag": "\"04008fb9-0000-2400-0000-68e09fae0000\""
    },
    {
      "id": "42ce7311-fff0-4534-94b1-fa5f64b2bb8d",
      "name": "Labo",
      "cityCode": "CAN-06",
      "provinceCode": "CAN",
      "createdAt": "2025-10-04T04:07:39.915411Z",
      "updatedAt": "2025-10-04T04:07:39.915411Z",
      "_etag": "\"04009eb9-0000-2400-0000-68e09faf0000\""
    },
    {
      "id": "71281a45-7775-4b70-adc6-577aef47af73",
      "name": "Labrador",
      "cityCode": "PAN-21",
      "provinceCode": "PAN",
      "createdAt": "2025-10-04T04:07:39.915411Z",
      "updatedAt": "2025-10-04T04:07:39.915411Z",
      "_etag": "\"0400b2b9-0000-2400-0000-68e09fb00000\""
    },
    {
      "id": "67cc3c55-1cb0-47fb-af99-c6d6e5081944",
      "name": "Lacub",
      "cityCode": "ABR-09",
      "provinceCode": "ABR",
      "createdAt": "2025-10-04T04:07:39.915412Z",
      "updatedAt": "2025-10-04T04:07:39.915412Z",
      "_etag": "\"0400ccb9-0000-2400-0000-68e09fb00000\""
    },
    {
      "id": "ac063857-bf8b-4295-8bed-ccedacfdd217",
      "name": "Lagangilang",
      "cityCode": "ABR-10",
      "provinceCode": "ABR",
      "createdAt": "2025-10-04T04:07:39.915412Z",
      "updatedAt": "2025-10-04T04:07:39.915412Z",
      "_etag": "\"0400deb9-0000-2400-0000-68e09fb10000\""
    },
    {
      "id": "b54641e6-3869-4704-a8ea-3dac73f2c52f",
      "name": "Lagawe (Capital)",
      "cityCode": "IFU-04",
      "provinceCode": "IFU",
      "createdAt": "2025-10-04T04:07:39.915412Z",
      "updatedAt": "2025-10-04T04:07:39.915412Z",
      "_etag": "\"0400efb9-0000-2400-0000-68e09fb10000\""
    },
    {
      "id": "d0c21f88-ed33-4e46-a890-8955f819ce2b",
      "name": "Lagayan",
      "cityCode": "ABR-11",
      "provinceCode": "ABR",
      "createdAt": "2025-10-04T04:07:39.915412Z",
      "updatedAt": "2025-10-04T04:07:39.915412Z",
      "_etag": "\"04000aba-0000-2400-0000-68e09fb20000\""
    },
    {
      "id": "1ed1520b-184e-4331-9366-55fc8e1e16be",
      "name": "Lagonglong",
      "cityCode": "MSR-13",
      "provinceCode": "MSR",
      "createdAt": "2025-10-04T04:07:39.915412Z",
      "updatedAt": "2025-10-04T04:07:39.915412Z",
      "_etag": "\"04001dba-0000-2400-0000-68e09fb30000\""
    },
    {
      "id": "859a124b-8e06-4d57-b223-ebed20544ac1",
      "name": "Lagonoy",
      "cityCode": "CAS-17",
      "provinceCode": "CAS",
      "createdAt": "2025-10-04T04:07:39.915412Z",
      "updatedAt": "2025-10-04T04:07:39.915412Z",
      "_etag": "\"04003aba-0000-2400-0000-68e09fb30000\""
    },
    {
      "id": "94da6230-b204-4092-bd1c-ffd008069801",
      "name": "Laguindingan",
      "cityCode": "MSR-14",
      "provinceCode": "MSR",
      "createdAt": "2025-10-04T04:07:39.915412Z",
      "updatedAt": "2025-10-04T04:07:39.915412Z",
      "_etag": "\"040047ba-0000-2400-0000-68e09fb40000\""
    },
    {
      "id": "717ce24e-638c-454a-b4c8-eb12f5dbe28d",
      "name": "Lake Sebu",
      "cityCode": "SCO-19",
      "provinceCode": "SCO",
      "createdAt": "2025-10-04T04:07:39.915413Z",
      "updatedAt": "2025-10-04T04:07:39.915413Z",
      "_etag": "\"04005aba-0000-2400-0000-68e09fb50000\""
    },
    {
      "id": "f2538404-85fa-42a0-8770-f94e56c3ec1f",
      "name": "Lakewood",
      "cityCode": "ZAS-33",
      "provinceCode": "ZAS",
      "createdAt": "2025-10-04T04:07:39.915413Z",
      "updatedAt": "2025-10-04T04:07:39.915413Z",
      "_etag": "\"040064ba-0000-2400-0000-68e09fb50000\""
    },
    {
      "id": "5a493a89-248a-4010-b33d-fb640e42607d",
      "name": "Lal-lo",
      "cityCode": "CAG-16",
      "provinceCode": "CAG",
      "createdAt": "2025-10-04T04:07:39.915413Z",
      "updatedAt": "2025-10-04T04:07:39.915413Z",
      "_etag": "\"040081ba-0000-2400-0000-68e09fb70000\""
    },
    {
      "id": "4e00200a-e6f8-441a-91cd-626429652ed6",
      "name": "Lala",
      "cityCode": "LAN-09",
      "provinceCode": "LAN",
      "createdAt": "2025-10-04T04:07:39.915413Z",
      "updatedAt": "2025-10-04T04:07:39.915413Z",
      "_etag": "\"04006cba-0000-2400-0000-68e09fb60000\""
    },
    {
      "id": "25070b7e-c0e7-43dd-a4ca-b317d140f547",
      "name": "Lambayong (Mariano Marcos)",
      "cityCode": "SUK-08",
      "provinceCode": "SUK",
      "createdAt": "2025-10-04T04:07:39.915413Z",
      "updatedAt": "2025-10-04T04:07:39.915413Z",
      "_etag": "\"040091ba-0000-2400-0000-68e09fb70000\""
    },
    {
      "id": "5cfa61dc-03f6-4bee-b270-00c02e74fc5f",
      "name": "Lambunao",
      "cityCode": "ILO-25",
      "provinceCode": "ILO",
      "createdAt": "2025-10-04T04:07:39.915413Z",
      "updatedAt": "2025-10-04T04:07:39.915413Z",
      "_etag": "\"0400a0ba-0000-2400-0000-68e09fb80000\""
    },
    {
      "id": "3dd6e9ae-5580-48d4-8d52-dbf98b513f12",
      "name": "Lamut",
      "cityCode": "IFU-05",
      "provinceCode": "IFU",
      "createdAt": "2025-10-04T04:07:39.915413Z",
      "updatedAt": "2025-10-04T04:07:39.915414Z",
      "_etag": "\"0400b3ba-0000-2400-0000-68e09fb90000\""
    },
    {
      "id": "dc13db2a-78e7-4a67-9663-51d35f5f0198",
      "name": "Langiden",
      "cityCode": "ABR-12",
      "provinceCode": "ABR",
      "createdAt": "2025-10-04T04:07:39.915414Z",
      "updatedAt": "2025-10-04T04:07:39.915414Z",
      "_etag": "\"0400beba-0000-2400-0000-68e09fba0000\""
    },
    {
      "id": "9a73dd9a-406c-4e93-9d85-c19653933e9b",
      "name": "Languyan",
      "cityCode": "TAW-09",
      "provinceCode": "TAW",
      "createdAt": "2025-10-04T04:07:39.915414Z",
      "updatedAt": "2025-10-04T04:07:39.915414Z",
      "_etag": "\"0400dcba-0000-2400-0000-68e09fba0000\""
    },
    {
      "id": "4735fdde-e751-4e3b-a1ee-9b2de061aaa0",
      "name": "Lantapan",
      "cityCode": "BUK-10",
      "provinceCode": "BUK",
      "createdAt": "2025-10-04T04:07:39.915414Z",
      "updatedAt": "2025-10-04T04:07:39.915414Z",
      "_etag": "\"0400ffba-0000-2400-0000-68e09fbb0000\""
    },
    {
      "id": "18cd1c41-3216-4741-b548-c3fa1ef8fc72",
      "name": "Lantawan",
      "cityCode": "BAS-03",
      "provinceCode": "BAS",
      "createdAt": "2025-10-04T04:07:39.915414Z",
      "updatedAt": "2025-10-04T04:07:39.915414Z",
      "_etag": "\"040012bb-0000-2400-0000-68e09fbc0000\""
    },
    {
      "id": "e64e00cb-595b-423f-8a70-436a27cad230",
      "name": "Lanuza",
      "cityCode": "SUR-10",
      "provinceCode": "SUR",
      "createdAt": "2025-10-04T04:07:39.915414Z",
      "updatedAt": "2025-10-04T04:07:39.915414Z",
      "_etag": "\"04001cbb-0000-2400-0000-68e09fbc0000\""
    },
    {
      "id": "d90d469b-5a8e-4895-abfd-91a21de8e88b",
      "name": "Laoac",
      "cityCode": "PAN-48",
      "provinceCode": "PAN",
      "createdAt": "2025-10-04T04:07:39.915414Z",
      "updatedAt": "2025-10-04T04:07:39.915415Z",
      "_etag": "\"040031bb-0000-2400-0000-68e09fbd0000\""
    },
    {
      "id": "25e22193-8867-4cc7-8589-14a2dd676a4a",
      "name": "Laoag City (Capital)",
      "cityCode": "ILN-12",
      "provinceCode": "ILN",
      "createdAt": "2025-10-04T04:07:39.915415Z",
      "updatedAt": "2025-10-04T04:07:39.915415Z",
      "_etag": "\"040042bb-0000-2400-0000-68e09fbe0000\""
    },
    {
      "id": "11f38055-d019-40e6-b919-3f7550e76cff",
      "name": "Laoang",
      "cityCode": "NSA-08",
      "provinceCode": "NSA",
      "createdAt": "2025-10-04T04:07:39.915415Z",
      "updatedAt": "2025-10-04T04:07:39.915415Z",
      "_etag": "\"04005cbb-0000-2400-0000-68e09fbf0000\""
    },
    {
      "id": "ce118e18-1a70-48f2-8f4e-423d30d4de5d",
      "name": "Lapinig",
      "cityCode": "NSA-09",
      "provinceCode": "NSA",
      "createdAt": "2025-10-04T04:07:39.915415Z",
      "updatedAt": "2025-10-04T04:07:39.915415Z",
      "_etag": "\"040067bb-0000-2400-0000-68e09fbf0000\""
    },
    {
      "id": "5eddd1a4-86a9-4d72-b64d-b3695f4ac90f",
      "name": "Lapu-lapu City (Opon)",
      "cityCode": "CEB-26",
      "provinceCode": "CEB",
      "createdAt": "2025-10-04T04:07:39.915415Z",
      "updatedAt": "2025-10-04T04:07:39.915415Z",
      "_etag": "\"040079bb-0000-2400-0000-68e09fc00000\""
    },
    {
      "id": "231f77c4-020a-4291-aaa1-e4ffbe05fb7f",
      "name": "Lapuyan",
      "cityCode": "ZAS-13",
      "provinceCode": "ZAS",
      "createdAt": "2025-10-04T04:07:39.915415Z",
      "updatedAt": "2025-10-04T04:07:39.915415Z",
      "_etag": "\"040083bb-0000-2400-0000-68e09fc00000\""
    },
    {
      "id": "fecadeaa-1a0e-4597-a09f-f5e9d88aa5d6",
      "name": "Larena",
      "cityCode": "SIQ-02",
      "provinceCode": "SIQ",
      "createdAt": "2025-10-04T04:07:39.915415Z",
      "updatedAt": "2025-10-04T04:07:39.915415Z",
      "_etag": "\"04008fbb-0000-2400-0000-68e09fc10000\""
    },
    {
      "id": "bca3c041-d9c1-4388-a457-73de2860b434",
      "name": "Las Navas",
      "cityCode": "NSA-10",
      "provinceCode": "NSA",
      "createdAt": "2025-10-04T04:07:39.915415Z",
      "updatedAt": "2025-10-04T04:07:39.915415Z",
      "_etag": "\"04009bbb-0000-2400-0000-68e09fc10000\""
    },
    {
      "id": "c16a749e-f3b5-4151-a504-67a697c093d1",
      "name": "Las Nieves",
      "cityCode": "AGN-07",
      "provinceCode": "AGN",
      "createdAt": "2025-10-04T04:07:39.915416Z",
      "updatedAt": "2025-10-04T04:07:39.915416Z",
      "_etag": "\"0400a9bb-0000-2400-0000-68e09fc20000\""
    },
    {
      "id": "1cc54249-fe19-4ab0-af83-0732341e327e",
      "name": "Lasam",
      "cityCode": "CAG-17",
      "provinceCode": "CAG",
      "createdAt": "2025-10-04T04:07:39.915416Z",
      "updatedAt": "2025-10-04T04:07:39.915416Z",
      "_etag": "\"0400b9bb-0000-2400-0000-68e09fc30000\""
    },
    {
      "id": "f382a2ae-68a3-434a-8cc9-86e0fe46778c",
      "name": "Laua-an",
      "cityCode": "ANT-09",
      "provinceCode": "ANT",
      "createdAt": "2025-10-04T04:07:39.915416Z",
      "updatedAt": "2025-10-04T04:07:39.915416Z",
      "_etag": "\"0400c3bb-0000-2400-0000-68e09fc30000\""
    },
    {
      "id": "826d010e-6dd1-4061-810d-06fd2a5eaa75",
      "name": "Laur",
      "cityCode": "NUE-13",
      "provinceCode": "NUE",
      "createdAt": "2025-10-04T04:07:39.915416Z",
      "updatedAt": "2025-10-04T04:07:39.915417Z",
      "_etag": "\"0400d5bb-0000-2400-0000-68e09fc40000\""
    },
    {
      "id": "1ad430e3-2a59-4625-9e9b-44f09b11a53e",
      "name": "Laurel",
      "cityCode": "BTG-11",
      "provinceCode": "BTG",
      "createdAt": "2025-10-04T04:07:39.915417Z",
      "updatedAt": "2025-10-04T04:07:39.915417Z",
      "_etag": "\"0400e1bb-0000-2400-0000-68e09fc50000\""
    },
    {
      "id": "5c84b1b1-171b-40fb-8577-19874d850268",
      "name": "Lavezares",
      "cityCode": "NSA-11",
      "provinceCode": "NSA",
      "createdAt": "2025-10-04T04:07:39.915417Z",
      "updatedAt": "2025-10-04T04:07:39.915417Z",
      "_etag": "\"040002bc-0000-2400-0000-68e09fc70000\""
    },
    {
      "id": "19faf177-420d-47ce-9d13-a4a7e76beeb3",
      "name": "Lawaan",
      "cityCode": "EAS-12",
      "provinceCode": "EAS",
      "createdAt": "2025-10-04T04:07:39.915417Z",
      "updatedAt": "2025-10-04T04:07:39.915417Z",
      "_etag": "\"0400efbb-0000-2400-0000-68e09fc60000\""
    },
    {
      "id": "66b827d1-441f-4c47-8757-ca2b5bcd021d",
      "name": "Lazi",
      "cityCode": "SIQ-03",
      "provinceCode": "SIQ",
      "createdAt": "2025-10-04T04:07:39.915417Z",
      "updatedAt": "2025-10-04T04:07:39.915417Z",
      "_etag": "\"040006bc-0000-2400-0000-68e09fc70000\""
    },
    {
      "id": "f5e5d8a3-cf9c-463a-b597-f2c65c2ca4ef",
      "name": "Lebak",
      "cityCode": "SUK-06",
      "provinceCode": "SUK",
      "createdAt": "2025-10-04T04:07:39.915417Z",
      "updatedAt": "2025-10-04T04:07:39.915417Z",
      "_etag": "\"04001fbc-0000-2400-0000-68e09fc80000\""
    },
    {
      "id": "bb895f40-049a-4252-b315-f387b0403079",
      "name": "Leganes",
      "cityCode": "ILO-26",
      "provinceCode": "ILO",
      "createdAt": "2025-10-04T04:07:39.915417Z",
      "updatedAt": "2025-10-04T04:07:39.915417Z",
      "_etag": "\"040033bc-0000-2400-0000-68e09fc90000\""
    },
    {
      "id": "3d25918b-3f2c-47dc-89ae-9ec7248d9f76",
      "name": "Legazpi City (Capital)",
      "cityCode": "ALB-06",
      "provinceCode": "ALB",
      "createdAt": "2025-10-04T04:07:39.915417Z",
      "updatedAt": "2025-10-04T04:07:39.915418Z",
      "_etag": "\"04003dbc-0000-2400-0000-68e09fc90000\""
    },
    {
      "id": "53ab793c-f121-4387-9d7f-e30813c697b2",
      "name": "Lemery",
      "cityCode": "BTG-12",
      "provinceCode": "BTG",
      "createdAt": "2025-10-04T04:07:39.915418Z",
      "updatedAt": "2025-10-04T04:07:39.915418Z",
      "_etag": "\"040048bc-0000-2400-0000-68e09fca0000\""
    },
    {
      "id": "af18a396-0c1a-47d7-859f-ed6869548698",
      "name": "Lemery",
      "cityCode": "ILO-27",
      "provinceCode": "ILO",
      "createdAt": "2025-10-04T04:07:39.915418Z",
      "updatedAt": "2025-10-04T04:07:39.915418Z",
      "_etag": "\"040075bc-0000-2400-0000-68e09fcb0000\""
    },
    {
      "id": "d0ffd23e-b8ef-4093-9552-b3bcfbdfad7b",
      "name": "Leon",
      "cityCode": "ILO-28",
      "provinceCode": "ILO",
      "createdAt": "2025-10-04T04:07:39.915418Z",
      "updatedAt": "2025-10-04T04:07:39.915418Z",
      "_etag": "\"040055bc-0000-2400-0000-68e09fca0000\""
    },
    {
      "id": "dd33cb7f-1762-4f19-b3ab-68af4ca052f4",
      "name": "Leyte",
      "cityCode": "LEY-29",
      "provinceCode": "LEY",
      "createdAt": "2025-10-04T04:07:39.915418Z",
      "updatedAt": "2025-10-04T04:07:39.915418Z",
      "_etag": "\"040082bc-0000-2400-0000-68e09fcc0000\""
    },
    {
      "id": "dff87873-049f-4831-af5f-7d8803296ea9",
      "name": "Lezo",
      "cityCode": "AKL-08",
      "provinceCode": "AKL",
      "createdAt": "2025-10-04T04:07:39.915418Z",
      "updatedAt": "2025-10-04T04:07:39.915418Z",
      "_etag": "\"040096bc-0000-2400-0000-68e09fcc0000\""
    },
    {
      "id": "91302901-cfeb-437a-86c6-4b874ba99851",
      "name": "Lian",
      "cityCode": "BTG-13",
      "provinceCode": "BTG",
      "createdAt": "2025-10-04T04:07:39.915418Z",
      "updatedAt": "2025-10-04T04:07:39.915418Z",
      "_etag": "\"0400a9bc-0000-2400-0000-68e09fcd0000\""
    },
    {
      "id": "f7ef0303-719a-4db1-8f09-59097b4f341b",
      "name": "Lianga",
      "cityCode": "SUR-11",
      "provinceCode": "SUR",
      "createdAt": "2025-10-04T04:07:39.915418Z",
      "updatedAt": "2025-10-04T04:07:39.915419Z",
      "_etag": "\"0400b6bc-0000-2400-0000-68e09fcd0000\""
    },
    {
      "id": "db5b8e52-1ab2-4302-b5bb-66dc743b1721",
      "name": "Libacao",
      "cityCode": "AKL-09",
      "provinceCode": "AKL",
      "createdAt": "2025-10-04T04:07:39.915419Z",
      "updatedAt": "2025-10-04T04:07:39.915419Z",
      "_etag": "\"0400c3bc-0000-2400-0000-68e09fcd0000\""
    },
    {
      "id": "a687b2a0-63f2-4423-8e66-1125b185a46a",
      "name": "Libagon",
      "cityCode": "SLE-05",
      "provinceCode": "SLE",
      "createdAt": "2025-10-04T04:07:39.915419Z",
      "updatedAt": "2025-10-04T04:07:39.915419Z",
      "_etag": "\"0400d0bc-0000-2400-0000-68e09fce0000\""
    },
    {
      "id": "ce1cbfcb-23d8-43ce-991d-101b1c7c80b2",
      "name": "Libertad",
      "cityCode": "MSR-15",
      "provinceCode": "MSR",
      "createdAt": "2025-10-04T04:07:39.915419Z",
      "updatedAt": "2025-10-04T04:07:39.915419Z",
      "_etag": "\"0400e9bc-0000-2400-0000-68e09fcf0000\""
    },
    {
      "id": "a6edbf9f-3d9d-4b05-9f88-de6acf6c3832",
      "name": "Libertad",
      "cityCode": "ANT-10",
      "provinceCode": "ANT",
      "createdAt": "2025-10-04T04:07:39.915419Z",
      "updatedAt": "2025-10-04T04:07:39.915419Z",
      "_etag": "\"040006bd-0000-2400-0000-68e09fd00000\""
    },
    {
      "id": "03a7b273-9ce9-495d-9ee8-e824b998e4d1",
      "name": "Libjo (Albor)",
      "cityCode": "DIN-04",
      "provinceCode": "DIN",
      "createdAt": "2025-10-04T04:07:39.91542Z",
      "updatedAt": "2025-10-04T04:07:39.91542Z",
      "_etag": "\"040017bd-0000-2400-0000-68e09fd00000\""
    },
    {
      "id": "16de3505-913b-4f5d-a731-e426213e6b1e",
      "name": "Libmanan",
      "cityCode": "CAS-18",
      "provinceCode": "CAS",
      "createdAt": "2025-10-04T04:07:39.91542Z",
      "updatedAt": "2025-10-04T04:07:39.91542Z",
      "_etag": "\"040025bd-0000-2400-0000-68e09fd10000\""
    },
    {
      "id": "d8460323-5d2b-48c8-b335-9ea530f9eec3",
      "name": "Libon",
      "cityCode": "ALB-07",
      "provinceCode": "ALB",
      "createdAt": "2025-10-04T04:07:39.91542Z",
      "updatedAt": "2025-10-04T04:07:39.91542Z",
      "_etag": "\"040033bd-0000-2400-0000-68e09fd10000\""
    },
    {
      "id": "42bf2314-f63a-4d27-8124-34ead2e8c996",
      "name": "Libona",
      "cityCode": "BUK-11",
      "provinceCode": "BUK",
      "createdAt": "2025-10-04T04:07:39.91542Z",
      "updatedAt": "2025-10-04T04:07:39.91542Z",
      "_etag": "\"040047bd-0000-2400-0000-68e09fd20000\""
    },
    {
      "id": "d8e89b17-acdf-476a-99f5-65ce42f778bb",
      "name": "Libungan",
      "cityCode": "NCO-05",
      "provinceCode": "NCO",
      "createdAt": "2025-10-04T04:07:39.915421Z",
      "updatedAt": "2025-10-04T04:07:39.915421Z",
      "_etag": "\"040073bd-0000-2400-0000-68e09fd30000\""
    },
    {
      "id": "0af62312-a6ce-4be0-8e7f-2c2201eb46f1",
      "name": "Licab",
      "cityCode": "NUE-14",
      "provinceCode": "NUE",
      "createdAt": "2025-10-04T04:07:39.91542Z",
      "updatedAt": "2025-10-04T04:07:39.915421Z",
      "_etag": "\"040057bd-0000-2400-0000-68e09fd20000\""
    },
    {
      "id": "882a9c83-6961-4099-b133-5207a1edb84d",
      "name": "Licuan-baay (Licuan)",
      "cityCode": "ABR-13",
      "provinceCode": "ABR",
      "createdAt": "2025-10-04T04:07:39.915421Z",
      "updatedAt": "2025-10-04T04:07:39.915421Z",
      "_etag": "\"04007dbd-0000-2400-0000-68e09fd30000\""
    },
    {
      "id": "a5086ab3-ce69-4f6a-85b5-8cfb8b3ee09f",
      "name": "Lidlidda",
      "cityCode": "ILS-11",
      "provinceCode": "ILS",
      "createdAt": "2025-10-04T04:07:39.915421Z",
      "updatedAt": "2025-10-04T04:07:39.915421Z",
      "_etag": "\"04008bbd-0000-2400-0000-68e09fd40000\""
    },
    {
      "id": "6a2b53c4-eec1-40f6-aec2-639ea51c2cdb",
      "name": "Lila",
      "cityCode": "BOH-27",
      "provinceCode": "BOH",
      "createdAt": "2025-10-04T04:07:39.915421Z",
      "updatedAt": "2025-10-04T04:07:39.915421Z",
      "_etag": "\"040082bd-0000-2400-0000-68e09fd40000\""
    },
    {
      "id": "32219faf-8d82-42fd-a400-3891ad65f0c0",
      "name": "Liliw",
      "cityCode": "LAG-10",
      "provinceCode": "LAG",
      "createdAt": "2025-10-04T04:07:39.915421Z",
      "updatedAt": "2025-10-04T04:07:39.915421Z",
      "_etag": "\"04009bbd-0000-2400-0000-68e09fd50000\""
    },
    {
      "id": "1919d16d-1e8a-4324-a674-a161d0607dfc",
      "name": "Liloan",
      "cityCode": "CEB-27",
      "provinceCode": "CEB",
      "createdAt": "2025-10-04T04:07:39.915421Z",
      "updatedAt": "2025-10-04T04:07:39.915421Z",
      "_etag": "\"0400a7bd-0000-2400-0000-68e09fd60000\""
    },
    {
      "id": "4ae13008-92c3-49df-a3a2-c14166d534e6",
      "name": "Liloan",
      "cityCode": "SLE-06",
      "provinceCode": "SLE",
      "createdAt": "2025-10-04T04:07:39.915421Z",
      "updatedAt": "2025-10-04T04:07:39.915421Z",
      "_etag": "\"0400b1bd-0000-2400-0000-68e09fd60000\""
    },
    {
      "id": "465cb8a4-4348-401f-afb1-d0fd90e9440e",
      "name": "Liloy",
      "cityCode": "ZAN-06",
      "provinceCode": "ZAN",
      "createdAt": "2025-10-04T04:07:39.915422Z",
      "updatedAt": "2025-10-04T04:07:39.915422Z",
      "_etag": "\"0400b7bd-0000-2400-0000-68e09fd70000\""
    },
    {
      "id": "bfffb111-7b38-45ae-a64d-119f0c0e6f2f",
      "name": "Limasawa",
      "cityCode": "SLE-19",
      "provinceCode": "SLE",
      "createdAt": "2025-10-04T04:07:39.915422Z",
      "updatedAt": "2025-10-04T04:07:39.915422Z",
      "_etag": "\"0400c6bd-0000-2400-0000-68e09fd70000\""
    },
    {
      "id": "866c7dff-9b56-49e2-9df2-f613667db77b",
      "name": "Limay",
      "cityCode": "BAT-06",
      "provinceCode": "BAT",
      "createdAt": "2025-10-04T04:07:39.915422Z",
      "updatedAt": "2025-10-04T04:07:39.915422Z",
      "_etag": "\"0400dabd-0000-2400-0000-68e09fd80000\""
    },
    {
      "id": "f4e07f50-820e-464a-bd2a-d18f0eb3ec1d",
      "name": "Linamon",
      "cityCode": "LAN-10",
      "provinceCode": "LAN",
      "createdAt": "2025-10-04T04:07:39.915422Z",
      "updatedAt": "2025-10-04T04:07:39.915422Z",
      "_etag": "\"0400e8bd-0000-2400-0000-68e09fd90000\""
    },
    {
      "id": "143a9089-5460-46b3-b560-e08d2437c217",
      "name": "Linapacan",
      "cityCode": "PAL-13",
      "provinceCode": "PAL",
      "createdAt": "2025-10-04T04:07:39.915423Z",
      "updatedAt": "2025-10-04T04:07:39.915423Z",
      "_etag": "\"040001be-0000-2400-0000-68e09fda0000\""
    },
    {
      "id": "8b8787eb-5648-41c8-8a16-c7055d343aad",
      "name": "Lingayen (Capital)",
      "cityCode": "PAN-22",
      "provinceCode": "PAN",
      "createdAt": "2025-10-04T04:07:39.915423Z",
      "updatedAt": "2025-10-04T04:07:39.915423Z",
      "_etag": "\"0400f5bd-0000-2400-0000-68e09fd90000\""
    },
    {
      "id": "760e0816-04bb-4544-96ad-f9b2806b2ca3",
      "name": "Lingig",
      "cityCode": "SUR-12",
      "provinceCode": "SUR",
      "createdAt": "2025-10-04T04:07:39.915423Z",
      "updatedAt": "2025-10-04T04:07:39.915423Z",
      "_etag": "\"04000bbe-0000-2400-0000-68e09fda0000\""
    },
    {
      "id": "e81905d2-e340-4f94-8afc-bc3f3cbd6f07",
      "name": "Lipa City",
      "cityCode": "BTG-14",
      "provinceCode": "BTG",
      "createdAt": "2025-10-04T04:07:39.915423Z",
      "updatedAt": "2025-10-04T04:07:39.915423Z",
      "_etag": "\"040022be-0000-2400-0000-68e09fdb0000\""
    },
    {
      "id": "e457d2a2-873c-4215-af0f-3c5688fccb3c",
      "name": "Llanera",
      "cityCode": "NUE-15",
      "provinceCode": "NUE",
      "createdAt": "2025-10-04T04:07:39.915423Z",
      "updatedAt": "2025-10-04T04:07:39.915423Z",
      "_etag": "\"04002cbe-0000-2400-0000-68e09fdb0000\""
    },
    {
      "id": "a42c869d-e329-4531-a4b2-785bc0900986",
      "name": "Llorente",
      "cityCode": "EAS-13",
      "provinceCode": "EAS",
      "createdAt": "2025-10-04T04:07:39.915423Z",
      "updatedAt": "2025-10-04T04:07:39.915423Z",
      "_etag": "\"040054be-0000-2400-0000-68e09fdd0000\""
    },
    {
      "id": "4b09840b-f324-4079-88b0-e28756da5a26",
      "name": "Loay",
      "cityCode": "BOH-28",
      "provinceCode": "BOH",
      "createdAt": "2025-10-04T04:07:39.915423Z",
      "updatedAt": "2025-10-04T04:07:39.915423Z",
      "_etag": "\"040042be-0000-2400-0000-68e09fdc0000\""
    },
    {
      "id": "e4a3b149-126c-49a9-95bd-e077f5eae9c3",
      "name": "Lobo",
      "cityCode": "BTG-15",
      "provinceCode": "BTG",
      "createdAt": "2025-10-04T04:07:39.915423Z",
      "updatedAt": "2025-10-04T04:07:39.915423Z",
      "_etag": "\"040065be-0000-2400-0000-68e09fdd0000\""
    },
    {
      "id": "5c6eed48-0b45-4dd0-9d11-74076516e8d2",
      "name": "Loboc",
      "cityCode": "BOH-29",
      "provinceCode": "BOH",
      "createdAt": "2025-10-04T04:07:39.915424Z",
      "updatedAt": "2025-10-04T04:07:39.915424Z",
      "_etag": "\"040075be-0000-2400-0000-68e09fde0000\""
    },
    {
      "id": "11394c5e-4c36-4397-b0e3-4839e63e654e",
      "name": "Looc",
      "cityCode": "MNC-03",
      "provinceCode": "MNC",
      "createdAt": "2025-10-04T04:07:39.915424Z",
      "updatedAt": "2025-10-04T04:07:39.915424Z",
      "_etag": "\"040087be-0000-2400-0000-68e09fde0000\""
    },
    {
      "id": "020f058e-17bd-49ee-beb7-407a9f4a1f95",
      "name": "Looc",
      "cityCode": "ROM-07",
      "provinceCode": "ROM",
      "createdAt": "2025-10-04T04:07:39.915424Z",
      "updatedAt": "2025-10-04T04:07:39.915424Z",
      "_etag": "\"0400a2be-0000-2400-0000-68e09fdf0000\""
    },
    {
      "id": "e123a48a-5306-4da4-a789-53853c7f48b9",
      "name": "Loon",
      "cityCode": "BOH-30",
      "provinceCode": "BOH",
      "createdAt": "2025-10-04T04:07:39.915424Z",
      "updatedAt": "2025-10-04T04:07:39.915424Z",
      "_etag": "\"0400aebe-0000-2400-0000-68e09fe00000\""
    },
    {
      "id": "6de1d83d-845e-4653-81e3-c7c89c2b4a80",
      "name": "Lope De Vega",
      "cityCode": "NSA-24",
      "provinceCode": "NSA",
      "createdAt": "2025-10-04T04:07:39.915424Z",
      "updatedAt": "2025-10-04T04:07:39.915424Z",
      "_etag": "\"0400b8be-0000-2400-0000-68e09fe00000\""
    },
    {
      "id": "de4a048c-ed2e-4542-a34c-60ce1d3de361",
      "name": "Lopez",
      "cityCode": "QUE-22",
      "provinceCode": "QUE",
      "createdAt": "2025-10-04T04:07:39.915424Z",
      "updatedAt": "2025-10-04T04:07:39.915424Z",
      "_etag": "\"040096be-0000-2400-0000-68e09fdf0000\""
    },
    {
      "id": "88ad00aa-6b75-4341-abed-9afdbfb85c9c",
      "name": "Lopez Jaena",
      "cityCode": "MSC-08",
      "provinceCode": "MSC",
      "createdAt": "2025-10-04T04:07:39.915425Z",
      "updatedAt": "2025-10-04T04:07:39.915425Z",
      "_etag": "\"0400bebe-0000-2400-0000-68e09fe10000\""
    },
    {
      "id": "79d6db7b-9843-4c2e-8bb2-c6de051e4fbc",
      "name": "Loreto",
      "cityCode": "AGS-05",
      "provinceCode": "AGS",
      "createdAt": "2025-10-04T04:07:39.915425Z",
      "updatedAt": "2025-10-04T04:07:39.915425Z",
      "_etag": "\"0400ccbe-0000-2400-0000-68e09fe10000\""
    },
    {
      "id": "f75d39b3-4533-48bd-b620-76379fb29b04",
      "name": "Loreto",
      "cityCode": "DIN-05",
      "provinceCode": "DIN",
      "createdAt": "2025-10-04T04:07:39.915425Z",
      "updatedAt": "2025-10-04T04:07:39.915425Z",
      "_etag": "\"0400dcbe-0000-2400-0000-68e09fe20000\""
    },
    {
      "id": "fc696f6b-fc50-42a8-9511-c30b3f77d0fb",
      "name": "Los Baños",
      "cityCode": "LAG-11",
      "provinceCode": "LAG",
      "createdAt": "2025-10-04T04:07:39.915425Z",
      "updatedAt": "2025-10-04T04:07:39.915425Z",
      "_etag": "\"0400efbe-0000-2400-0000-68e09fe30000\""
    },
    {
      "id": "7271a92a-d357-4c80-a9ab-619850c08a73",
      "name": "Luba",
      "cityCode": "ABR-14",
      "provinceCode": "ABR",
      "createdAt": "2025-10-04T04:07:39.915425Z",
      "updatedAt": "2025-10-04T04:07:39.915425Z",
      "_etag": "\"0400f8be-0000-2400-0000-68e09fe30000\""
    },
    {
      "id": "8d0eeef2-64f8-4e69-8e37-c9a5fbdb9cb4",
      "name": "Lubang",
      "cityCode": "MNC-04",
      "provinceCode": "MNC",
      "createdAt": "2025-10-04T04:07:39.915425Z",
      "updatedAt": "2025-10-04T04:07:39.915426Z",
      "_etag": "\"040009bf-0000-2400-0000-68e09fe40000\""
    },
    {
      "id": "a1743300-6248-4502-a860-0d1c865caee5",
      "name": "Lubao",
      "cityCode": "PAM-08",
      "provinceCode": "PAM",
      "createdAt": "2025-10-04T04:07:39.915426Z",
      "updatedAt": "2025-10-04T04:07:39.915426Z",
      "_etag": "\"040018bf-0000-2400-0000-68e09fe40000\""
    },
    {
      "id": "1ea7a59d-1c62-411e-a77a-845c9aa908a7",
      "name": "Lubuagan",
      "cityCode": "KAL-06",
      "provinceCode": "KAL",
      "createdAt": "2025-10-04T04:07:39.915426Z",
      "updatedAt": "2025-10-04T04:07:39.915426Z",
      "_etag": "\"04003cbf-0000-2400-0000-68e09fe60000\""
    },
    {
      "id": "7dc3db9a-9041-44db-a830-d44fe8e6658c",
      "name": "Lucban",
      "cityCode": "QUE-23",
      "provinceCode": "QUE",
      "createdAt": "2025-10-04T04:07:39.915426Z",
      "updatedAt": "2025-10-04T04:07:39.915426Z",
      "_etag": "\"040023bf-0000-2400-0000-68e09fe50000\""
    },
    {
      "id": "3450f5f4-6a33-45dd-b2f3-7f55abf24246",
      "name": "Lucena City (Capital)",
      "cityCode": "QUE-24",
      "provinceCode": "QUE",
      "createdAt": "2025-10-04T04:07:39.915426Z",
      "updatedAt": "2025-10-04T04:07:39.915426Z",
      "_etag": "\"040032bf-0000-2400-0000-68e09fe60000\""
    },
    {
      "id": "868d67f2-1194-4d70-b5a4-026fadf98d2d",
      "name": "Lugait",
      "cityCode": "MSR-16",
      "provinceCode": "MSR",
      "createdAt": "2025-10-04T04:07:39.915426Z",
      "updatedAt": "2025-10-04T04:07:39.915426Z",
      "_etag": "\"04005fbf-0000-2400-0000-68e09fe70000\""
    },
    {
      "id": "825380ae-9bfe-4d6d-a90d-b7d8d286c683",
      "name": "Lugus",
      "cityCode": "SUL-17",
      "provinceCode": "SUL",
      "createdAt": "2025-10-04T04:07:39.915451Z",
      "updatedAt": "2025-10-04T04:07:39.915451Z",
      "_etag": "\"04007bbf-0000-2400-0000-68e09fe80000\""
    },
    {
      "id": "93a7790e-d4cc-45e8-9805-f85b0373cd77",
      "name": "Luisiana",
      "cityCode": "LAG-12",
      "provinceCode": "LAG",
      "createdAt": "2025-10-04T04:07:39.915456Z",
      "updatedAt": "2025-10-04T04:07:39.915456Z",
      "_etag": "\"040091bf-0000-2400-0000-68e09fe90000\""
    },
    {
      "id": "8b5ba9db-eb67-4412-9ecf-c093e00baeb8",
      "name": "Lumba-bayabao (Maguing)",
      "cityCode": "LAN-11",
      "provinceCode": "LAN",
      "createdAt": "2025-10-04T04:07:39.915456Z",
      "updatedAt": "2025-10-04T04:07:39.915456Z",
      "_etag": "\"0400a0bf-0000-2400-0000-68e09fe90000\""
    },
    {
      "id": "d97c3c48-baf4-4bf8-846e-a121514fbfe8",
      "name": "Lumbaca-unayan",
      "cityCode": "LAN-41",
      "provinceCode": "LAN",
      "createdAt": "2025-10-04T04:07:39.915456Z",
      "updatedAt": "2025-10-04T04:07:39.915456Z",
      "_etag": "\"0400b2bf-0000-2400-0000-68e09fea0000\""
    },
    {
      "id": "ad7daa94-5646-4fdf-af8f-5fd34dce0046",
      "name": "Lumban",
      "cityCode": "LAG-13",
      "provinceCode": "LAG",
      "createdAt": "2025-10-04T04:07:39.915456Z",
      "updatedAt": "2025-10-04T04:07:39.915456Z",
      "_etag": "\"0400c2bf-0000-2400-0000-68e09feb0000\""
    },
    {
      "id": "2becd640-2a40-41ca-85c5-5fe82993a3d8",
      "name": "Lumbatan",
      "cityCode": "LAN-12",
      "provinceCode": "LAN",
      "createdAt": "2025-10-04T04:07:39.915457Z",
      "updatedAt": "2025-10-04T04:07:39.915457Z",
      "_etag": "\"0400cfbf-0000-2400-0000-68e09feb0000\""
    },
    {
      "id": "9effd2b1-8f67-4399-a890-59f6f7101219",
      "name": "Lumbayanague",
      "cityCode": "LAN-36",
      "provinceCode": "LAN",
      "createdAt": "2025-10-04T04:07:39.915457Z",
      "updatedAt": "2025-10-04T04:07:39.915457Z",
      "_etag": "\"0400debf-0000-2400-0000-68e09fec0000\""
    },
    {
      "id": "849acb26-f2c1-4df8-9c9d-fe28eebf3e59",
      "name": "Luna",
      "cityCode": "LAU-10",
      "provinceCode": "LAU",
      "createdAt": "2025-10-04T04:07:39.915457Z",
      "updatedAt": "2025-10-04T04:07:39.915457Z",
      "_etag": "\"0400f0bf-0000-2400-0000-68e09fec0000\""
    },
    {
      "id": "e88d5a88-419a-4f4d-afb7-2acb7b69b76e",
      "name": "Luna",
      "cityCode": "ISA-16",
      "provinceCode": "ISA",
      "createdAt": "2025-10-04T04:07:39.915457Z",
      "updatedAt": "2025-10-04T04:07:39.915457Z",
      "_etag": "\"040003c0-0000-2400-0000-68e09fed0000\""
    },
    {
      "id": "b3db9590-5e4f-4a91-a2f1-83e5b9a8a234",
      "name": "Luna",
      "cityCode": "APA-05",
      "provinceCode": "APA",
      "createdAt": "2025-10-04T04:07:39.915457Z",
      "updatedAt": "2025-10-04T04:07:39.915458Z",
      "_etag": "\"040017c0-0000-2400-0000-68e09fee0000\""
    },
    {
      "id": "6ddaede3-d465-4c58-8f52-bc0ca7adbb84",
      "name": "Lupao",
      "cityCode": "NUE-16",
      "provinceCode": "NUE",
      "createdAt": "2025-10-04T04:07:39.915458Z",
      "updatedAt": "2025-10-04T04:07:39.915458Z",
      "_etag": "\"04001fc0-0000-2400-0000-68e09fee0000\""
    },
    {
      "id": "10a4a47b-abe9-425e-a681-85cb50a5dba2",
      "name": "Lupi",
      "cityCode": "CAS-19",
      "provinceCode": "CAS",
      "createdAt": "2025-10-04T04:07:39.915458Z",
      "updatedAt": "2025-10-04T04:07:39.915458Z",
      "_etag": "\"040032c0-0000-2400-0000-68e09fef0000\""
    },
    {
      "id": "206fa60d-418a-4a7c-8f46-8426c00a5bb0",
      "name": "Lupon",
      "cityCode": "DAR-07",
      "provinceCode": "DAR",
      "createdAt": "2025-10-04T04:07:39.915458Z",
      "updatedAt": "2025-10-04T04:07:39.915458Z",
      "_etag": "\"040043c0-0000-2400-0000-68e09ff00000\""
    },
    {
      "id": "a4409db6-8f6c-43ca-9cbb-fbb55d92b715",
      "name": "Lutayan",
      "cityCode": "SUK-07",
      "provinceCode": "SUK",
      "createdAt": "2025-10-04T04:07:39.915458Z",
      "updatedAt": "2025-10-04T04:07:39.915458Z",
      "_etag": "\"04004fc0-0000-2400-0000-68e09ff00000\""
    },
    {
      "id": "8e140f0f-9603-4c43-8a2e-c25b27377f83",
      "name": "Luuk",
      "cityCode": "SUL-04",
      "provinceCode": "SUL",
      "createdAt": "2025-10-04T04:07:39.915458Z",
      "updatedAt": "2025-10-04T04:07:39.915458Z",
      "_etag": "\"040056c0-0000-2400-0000-68e09ff10000\""
    },
    {
      "id": "1fe79d90-b138-4948-a4fa-4e9bee5cfed4",
      "name": "M'lang",
      "cityCode": "NCO-10",
      "provinceCode": "NCO",
      "createdAt": "2025-10-04T04:07:39.915459Z",
      "updatedAt": "2025-10-04T04:07:39.915459Z",
      "_etag": "\"040080c0-0000-2400-0000-68e09ff20000\""
    },
    {
      "id": "c6a21af9-1459-4fa7-b0f9-83f2230ef6fb",
      "name": "Ma-ayon",
      "cityCode": "CAP-07",
      "provinceCode": "CAP",
      "createdAt": "2025-10-04T04:07:39.915458Z",
      "updatedAt": "2025-10-04T04:07:39.915458Z",
      "_etag": "\"04006ac0-0000-2400-0000-68e09ff10000\""
    },
    {
      "id": "a3a340cc-5662-4653-8dff-04f25125f507",
      "name": "Maasim",
      "cityCode": "SAR-04",
      "provinceCode": "SAR",
      "createdAt": "2025-10-04T04:07:39.915461Z",
      "updatedAt": "2025-10-04T04:07:39.915461Z",
      "_etag": "\"040098c1-0000-2400-0000-68e09ffb0000\""
    },
    {
      "id": "6cc3876d-3a50-4c87-b1e1-da3fcd1ab253",
      "name": "Maasin",
      "cityCode": "ILO-29",
      "provinceCode": "ILO",
      "createdAt": "2025-10-04T04:07:39.915463Z",
      "updatedAt": "2025-10-04T04:07:39.915463Z",
      "_etag": "\"0400b7c2-0000-2400-0000-68e0a0050000\""
    },
    {
      "id": "43a6126e-34dc-46b7-8cda-14a1aca89a5f",
      "name": "Mabalacat City",
      "cityCode": "PAM-09",
      "provinceCode": "PAM",
      "createdAt": "2025-10-04T04:07:39.91546Z",
      "updatedAt": "2025-10-04T04:07:39.91546Z",
      "_etag": "\"0400e4c0-0000-2400-0000-68e09ff50000\""
    },
    {
      "id": "0406e11a-1c30-42cd-8053-3befe3235b10",
      "name": "Mabinay",
      "cityCode": "NER-14",
      "provinceCode": "NER",
      "createdAt": "2025-10-04T04:07:39.915516Z",
      "updatedAt": "2025-10-04T04:07:39.915516Z",
      "_etag": "\"0400cec9-0000-2400-0000-68e0a04b0000\""
    },
    {
      "id": "6a6e1592-d16e-4ef4-bbaf-9a23e1f31540",
      "name": "Mabini",
      "cityCode": "PAN-23",
      "provinceCode": "PAN",
      "createdAt": "2025-10-04T04:07:39.915459Z",
      "updatedAt": "2025-10-04T04:07:39.915459Z",
      "_etag": "\"04008bc0-0000-2400-0000-68e09ff20000\""
    },
    {
      "id": "a111fe83-9bc0-4862-af44-a3ba82c919b6",
      "name": "Mabini",
      "cityCode": "BTG-16",
      "provinceCode": "BTG",
      "createdAt": "2025-10-04T04:07:39.915459Z",
      "updatedAt": "2025-10-04T04:07:39.915459Z",
      "_etag": "\"04009dc0-0000-2400-0000-68e09ff30000\""
    },
    {
      "id": "cb14d347-d0b7-41dc-9bbf-c082695740b1",
      "name": "Mabini",
      "cityCode": "BOH-31",
      "provinceCode": "BOH",
      "createdAt": "2025-10-04T04:07:39.91546Z",
      "updatedAt": "2025-10-04T04:07:39.91546Z",
      "_etag": "\"04001dc1-0000-2400-0000-68e09ff70000\""
    },
    {
      "id": "676783f2-50aa-4a55-ac07-0eb41b50c73e",
      "name": "Mabini (Doña Alicia)",
      "cityCode": "COM-03",
      "provinceCode": "COM",
      "createdAt": "2025-10-04T04:07:39.915459Z",
      "updatedAt": "2025-10-04T04:07:39.915459Z",
      "_etag": "\"0400b2c0-0000-2400-0000-68e09ff40000\""
    },
    {
      "id": "a9e399d8-8b8f-4b39-bf57-e1f382f0cc30",
      "name": "Mabitac",
      "cityCode": "LAG-14",
      "provinceCode": "LAG",
      "createdAt": "2025-10-04T04:07:39.915459Z",
      "updatedAt": "2025-10-04T04:07:39.915459Z",
      "_etag": "\"0400bac0-0000-2400-0000-68e09ff40000\""
    },
    {
      "id": "b165d1d5-289c-48ca-b01f-01e7ef3a329e",
      "name": "Mabuhay",
      "cityCode": "ZSI-07",
      "provinceCode": "ZSI",
      "createdAt": "2025-10-04T04:07:39.91546Z",
      "updatedAt": "2025-10-04T04:07:39.91546Z",
      "_etag": "\"0400fbc0-0000-2400-0000-68e09ff60000\""
    },
    {
      "id": "d9651418-7c82-40eb-a4f4-09cbe7841aa9",
      "name": "Macabebe",
      "cityCode": "PAM-10",
      "provinceCode": "PAM",
      "createdAt": "2025-10-04T04:07:39.91546Z",
      "updatedAt": "2025-10-04T04:07:39.91546Z",
      "_etag": "\"040030c1-0000-2400-0000-68e09ff70000\""
    },
    {
      "id": "035afb84-9569-4ac5-a7da-7e9542fd4dc4",
      "name": "Macalelon",
      "cityCode": "QUE-25",
      "provinceCode": "QUE",
      "createdAt": "2025-10-04T04:07:39.91546Z",
      "updatedAt": "2025-10-04T04:07:39.91546Z",
      "_etag": "\"04004cc1-0000-2400-0000-68e09ff80000\""
    },
    {
      "id": "16a75f55-7758-4af3-b8a9-6000cf315227",
      "name": "Macarthur",
      "cityCode": "LEY-30",
      "provinceCode": "LEY",
      "createdAt": "2025-10-04T04:07:39.91546Z",
      "updatedAt": "2025-10-04T04:07:39.91546Z",
      "_etag": "\"040065c1-0000-2400-0000-68e09ff90000\""
    },
    {
      "id": "de16e84c-1c0c-4318-9a13-0d2aea0a7095",
      "name": "Maco",
      "cityCode": "COM-04",
      "provinceCode": "COM",
      "createdAt": "2025-10-04T04:07:39.91546Z",
      "updatedAt": "2025-10-04T04:07:39.91546Z",
      "_etag": "\"040073c1-0000-2400-0000-68e09ff90000\""
    },
    {
      "id": "cc568933-dfeb-4f5a-9662-8cdcd86304bd",
      "name": "Maconacon",
      "cityCode": "ISA-17",
      "provinceCode": "ISA",
      "createdAt": "2025-10-04T04:07:39.915461Z",
      "updatedAt": "2025-10-04T04:07:39.915461Z",
      "_etag": "\"040082c1-0000-2400-0000-68e09ffa0000\""
    },
    {
      "id": "974a2263-cda7-4b91-ba70-100c9d98abac",
      "name": "Macrohon",
      "cityCode": "SLE-08",
      "provinceCode": "SLE",
      "createdAt": "2025-10-04T04:07:39.915461Z",
      "updatedAt": "2025-10-04T04:07:39.915461Z",
      "_etag": "\"0400b4c1-0000-2400-0000-68e09ffc0000\""
    },
    {
      "id": "7f3c8098-a6c5-4fc0-9610-7da444eb8f5c",
      "name": "Madalag",
      "cityCode": "AKL-10",
      "provinceCode": "AKL",
      "createdAt": "2025-10-04T04:07:39.915461Z",
      "updatedAt": "2025-10-04T04:07:39.915461Z",
      "_etag": "\"0400c4c1-0000-2400-0000-68e09ffc0000\""
    },
    {
      "id": "9b35ff96-9002-4804-b29f-1f7af9a66f5e",
      "name": "Madalum",
      "cityCode": "LAN-13",
      "provinceCode": "LAN",
      "createdAt": "2025-10-04T04:07:39.915461Z",
      "updatedAt": "2025-10-04T04:07:39.915461Z",
      "_etag": "\"0400d3c1-0000-2400-0000-68e09ffd0000\""
    },
    {
      "id": "6089fea4-8323-4261-9292-fb6bb46700ea",
      "name": "Madamba",
      "cityCode": "LAN-14",
      "provinceCode": "LAN",
      "createdAt": "2025-10-04T04:07:39.915461Z",
      "updatedAt": "2025-10-04T04:07:39.915461Z",
      "_etag": "\"0400e9c1-0000-2400-0000-68e09ffe0000\""
    },
    {
      "id": "549e0667-c022-4539-b2fb-381cf64a23b2",
      "name": "Maddela",
      "cityCode": "QUI-04",
      "provinceCode": "QUI",
      "createdAt": "2025-10-04T04:07:39.915461Z",
      "updatedAt": "2025-10-04T04:07:39.915461Z",
      "_etag": "\"0400fec1-0000-2400-0000-68e09ffe0000\""
    },
    {
      "id": "62da3008-c0d0-4c7e-ad2d-7878e57b80a3",
      "name": "Madrid",
      "cityCode": "SUR-13",
      "provinceCode": "SUR",
      "createdAt": "2025-10-04T04:07:39.915462Z",
      "updatedAt": "2025-10-04T04:07:39.915462Z",
      "_etag": "\"04000dc2-0000-2400-0000-68e09fff0000\""
    },
    {
      "id": "857d69a2-4dca-43a8-b97c-bcb4d5f71cc4",
      "name": "Madridejos",
      "cityCode": "CEB-28",
      "provinceCode": "CEB",
      "createdAt": "2025-10-04T04:07:39.915462Z",
      "updatedAt": "2025-10-04T04:07:39.915462Z",
      "_etag": "\"04001cc2-0000-2400-0000-68e09fff0000\""
    },
    {
      "id": "c98ba5a9-83ac-4dde-bedd-a40bf5cbf617",
      "name": "Magalang",
      "cityCode": "PAM-11",
      "provinceCode": "PAM",
      "createdAt": "2025-10-04T04:07:39.915462Z",
      "updatedAt": "2025-10-04T04:07:39.915462Z",
      "_etag": "\"040029c2-0000-2400-0000-68e0a0000000\""
    },
    {
      "id": "fb6c75ad-9dfb-4ceb-b292-627296b2aa91",
      "name": "Magallanes",
      "cityCode": "CAV-12",
      "provinceCode": "CAV",
      "createdAt": "2025-10-04T04:07:39.915462Z",
      "updatedAt": "2025-10-04T04:07:39.915462Z",
      "_etag": "\"040046c2-0000-2400-0000-68e0a0010000\""
    },
    {
      "id": "3d6030d6-d9f7-4e9b-a79c-17f09696cfc1",
      "name": "Magallanes",
      "cityCode": "SOR-11",
      "provinceCode": "SOR",
      "createdAt": "2025-10-04T04:07:39.915462Z",
      "updatedAt": "2025-10-04T04:07:39.915463Z",
      "_etag": "\"040052c2-0000-2400-0000-68e0a0010000\""
    },
    {
      "id": "3bc02098-14ff-44af-9184-23fac9d3e533",
      "name": "Magallanes",
      "cityCode": "AGN-08",
      "provinceCode": "AGN",
      "createdAt": "2025-10-04T04:07:39.915463Z",
      "updatedAt": "2025-10-04T04:07:39.915463Z",
      "_etag": "\"040072c2-0000-2400-0000-68e0a0020000\""
    },
    {
      "id": "1f2d1294-7abf-4cd8-a714-ef0b6794f065",
      "name": "Magarao",
      "cityCode": "CAS-20",
      "provinceCode": "CAS",
      "createdAt": "2025-10-04T04:07:39.915463Z",
      "updatedAt": "2025-10-04T04:07:39.915463Z",
      "_etag": "\"040085c2-0000-2400-0000-68e0a0030000\""
    },
    {
      "id": "55eb78d1-d897-44f8-834b-c077f1f63ea8",
      "name": "Magdalena",
      "cityCode": "LAG-15",
      "provinceCode": "LAG",
      "createdAt": "2025-10-04T04:07:39.915463Z",
      "updatedAt": "2025-10-04T04:07:39.915463Z",
      "_etag": "\"040095c2-0000-2400-0000-68e0a0040000\""
    },
    {
      "id": "53d8e367-a8e6-4b3c-9067-94d3eb965715",
      "name": "Magdiwang",
      "cityCode": "ROM-08",
      "provinceCode": "ROM",
      "createdAt": "2025-10-04T04:07:39.915463Z",
      "updatedAt": "2025-10-04T04:07:39.915463Z",
      "_etag": "\"0400a7c2-0000-2400-0000-68e0a0040000\""
    },
    {
      "id": "139a886f-c3b6-45f6-946b-a2e096de5a6c",
      "name": "Magpet",
      "cityCode": "NCO-06",
      "provinceCode": "NCO",
      "createdAt": "2025-10-04T04:07:39.915463Z",
      "updatedAt": "2025-10-04T04:07:39.915463Z",
      "_etag": "\"0400c4c2-0000-2400-0000-68e0a0060000\""
    },
    {
      "id": "08b0e249-859f-45c3-826f-ec0778bc45d7",
      "name": "Magsaysay",
      "cityCode": "LAN-11",
      "provinceCode": "LAN",
      "createdAt": "2025-10-04T04:07:39.915463Z",
      "updatedAt": "2025-10-04T04:07:39.915464Z",
      "_etag": "\"0400d6c2-0000-2400-0000-68e0a0060000\""
    },
    {
      "id": "9787e287-71fe-49ae-8201-4d24b91bf39c",
      "name": "Magsaysay",
      "cityCode": "MNC-05",
      "provinceCode": "MNC",
      "createdAt": "2025-10-04T04:07:39.915464Z",
      "updatedAt": "2025-10-04T04:07:39.915464Z",
      "_etag": "\"0400e5c2-0000-2400-0000-68e0a0070000\""
    },
    {
      "id": "48c69845-691e-47b3-b19e-e1f36cbb6cd5",
      "name": "Magsaysay",
      "cityCode": "PAL-14",
      "provinceCode": "PAL",
      "createdAt": "2025-10-04T04:07:39.915464Z",
      "updatedAt": "2025-10-04T04:07:39.915464Z",
      "_etag": "\"0400f4c2-0000-2400-0000-68e0a0080000\""
    },
    {
      "id": "363e9d35-54c5-4da5-b537-707db4a51c49",
      "name": "Magsaysay",
      "cityCode": "DAS-07",
      "provinceCode": "DAS",
      "createdAt": "2025-10-04T04:07:39.915464Z",
      "updatedAt": "2025-10-04T04:07:39.915464Z",
      "_etag": "\"0400fdc2-0000-2400-0000-68e0a0080000\""
    },
    {
      "id": "d3829ca1-243f-490f-a60d-9fe21f74e13e",
      "name": "Magsaysay (Linugos)",
      "cityCode": "MSR-17",
      "provinceCode": "MSR",
      "createdAt": "2025-10-04T04:07:39.915464Z",
      "updatedAt": "2025-10-04T04:07:39.915464Z",
      "_etag": "\"040003c3-0000-2400-0000-68e0a0090000\""
    },
    {
      "id": "7b2d6cdc-c999-4b8e-9afa-f55ee533cb13",
      "name": "Magsingal",
      "cityCode": "ILS-12",
      "provinceCode": "ILS",
      "createdAt": "2025-10-04T04:07:39.915464Z",
      "updatedAt": "2025-10-04T04:07:39.915464Z",
      "_etag": "\"04001cc3-0000-2400-0000-68e0a0090000\""
    },
    {
      "id": "38655d81-adef-4eb6-a879-ea61012bbcb2",
      "name": "Maguing",
      "cityCode": "LAN-34",
      "provinceCode": "LAN",
      "createdAt": "2025-10-04T04:07:39.915464Z",
      "updatedAt": "2025-10-04T04:07:39.915464Z",
      "_etag": "\"040030c3-0000-2400-0000-68e0a00a0000\""
    },
    {
      "id": "a2f3d1e0-d1a0-44cf-9ad5-49b234aa590e",
      "name": "Mahaplag",
      "cityCode": "LEY-31",
      "provinceCode": "LEY",
      "createdAt": "2025-10-04T04:07:39.915464Z",
      "updatedAt": "2025-10-04T04:07:39.915465Z",
      "_etag": "\"04003ac3-0000-2400-0000-68e0a00a0000\""
    },
    {
      "id": "dadd1a89-1b9d-4f00-81d9-adc76055cfde",
      "name": "Mahatao",
      "cityCode": "BTN-04",
      "provinceCode": "BTN",
      "createdAt": "2025-10-04T04:07:39.915465Z",
      "updatedAt": "2025-10-04T04:07:39.915465Z",
      "_etag": "\"040043c3-0000-2400-0000-68e0a00b0000\""
    },
    {
      "id": "f3ccd49a-b28d-4a22-97a0-ad6235fffe28",
      "name": "Mahayag",
      "cityCode": "ZAS-15",
      "provinceCode": "ZAS",
      "createdAt": "2025-10-04T04:07:39.915465Z",
      "updatedAt": "2025-10-04T04:07:39.915465Z",
      "_etag": "\"04004ac3-0000-2400-0000-68e0a00b0000\""
    },
    {
      "id": "067046e0-4ead-45b1-81b0-6641852fc67a",
      "name": "Mahinog",
      "cityCode": "CAM-03",
      "provinceCode": "CAM",
      "createdAt": "2025-10-04T04:07:39.915465Z",
      "updatedAt": "2025-10-04T04:07:39.915465Z",
      "_etag": "\"040056c3-0000-2400-0000-68e0a00c0000\""
    },
    {
      "id": "2e384fcf-08dd-4b58-be03-3dd3fa1e5ea3",
      "name": "Maigo",
      "cityCode": "LAN-12",
      "provinceCode": "LAN",
      "createdAt": "2025-10-04T04:07:39.915465Z",
      "updatedAt": "2025-10-04T04:07:39.915465Z",
      "_etag": "\"040062c3-0000-2400-0000-68e0a00c0000\""
    },
    {
      "id": "9ffccee6-3e3c-4a62-a2c4-8c7f8857f89b",
      "name": "Maimbung",
      "cityCode": "SUL-05",
      "provinceCode": "SUL",
      "createdAt": "2025-10-04T04:07:39.915466Z",
      "updatedAt": "2025-10-04T04:07:39.915466Z",
      "_etag": "\"040072c3-0000-2400-0000-68e0a00d0000\""
    },
    {
      "id": "0db87211-3220-413c-b3e0-b195641481f3",
      "name": "Mainit",
      "cityCode": "SUN-14",
      "provinceCode": "SUN",
      "createdAt": "2025-10-04T04:07:39.915466Z",
      "updatedAt": "2025-10-04T04:07:39.915466Z",
      "_etag": "\"040087c3-0000-2400-0000-68e0a00e0000\""
    },
    {
      "id": "8266c987-98ed-48a5-ba70-e508d7a28971",
      "name": "Maitum",
      "cityCode": "SAR-05",
      "provinceCode": "SAR",
      "createdAt": "2025-10-04T04:07:39.915466Z",
      "updatedAt": "2025-10-04T04:07:39.915466Z",
      "_etag": "\"040095c3-0000-2400-0000-68e0a00e0000\""
    },
    {
      "id": "2f3a6755-2cb0-4514-bc01-3879fd843460",
      "name": "Majayjay",
      "cityCode": "LAG-16",
      "provinceCode": "LAG",
      "createdAt": "2025-10-04T04:07:39.915466Z",
      "updatedAt": "2025-10-04T04:07:39.915466Z",
      "_etag": "\"04009cc3-0000-2400-0000-68e0a00f0000\""
    },
    {
      "id": "77b3d851-8615-4644-9132-320ba7800c9f",
      "name": "Makato",
      "cityCode": "AKL-11",
      "provinceCode": "AKL",
      "createdAt": "2025-10-04T04:07:39.915466Z",
      "updatedAt": "2025-10-04T04:07:39.915466Z",
      "_etag": "\"0400a7c3-0000-2400-0000-68e0a00f0000\""
    },
    {
      "id": "10257f95-f204-47cc-8575-97e4386a266b",
      "name": "Makilala",
      "cityCode": "NCO-07",
      "provinceCode": "NCO",
      "createdAt": "2025-10-04T04:07:39.915466Z",
      "updatedAt": "2025-10-04T04:07:39.915466Z",
      "_etag": "\"0400b3c3-0000-2400-0000-68e0a0100000\""
    },
    {
      "id": "297e8536-3664-4e61-b4ff-30d4c233118e",
      "name": "Malabang",
      "cityCode": "LAN-15",
      "provinceCode": "LAN",
      "createdAt": "2025-10-04T04:07:39.915466Z",
      "updatedAt": "2025-10-04T04:07:39.915466Z",
      "_etag": "\"0400c2c3-0000-2400-0000-68e0a0100000\""
    },
    {
      "id": "f4448e66-424b-4107-9a90-bf9b8eb543f7",
      "name": "Malabuyoc",
      "cityCode": "CEB-29",
      "provinceCode": "CEB",
      "createdAt": "2025-10-04T04:07:39.915466Z",
      "updatedAt": "2025-10-04T04:07:39.915467Z",
      "_etag": "\"0400d1c3-0000-2400-0000-68e0a0110000\""
    },
    {
      "id": "d8b6a2a3-f5e9-4ad8-9e70-cfbe9cef844c",
      "name": "Malalag",
      "cityCode": "DAS-08",
      "provinceCode": "DAS",
      "createdAt": "2025-10-04T04:07:39.915467Z",
      "updatedAt": "2025-10-04T04:07:39.915467Z",
      "_etag": "\"0400e1c3-0000-2400-0000-68e0a0110000\""
    },
    {
      "id": "99cd2d7e-6999-4965-90fe-ea0c3dc64643",
      "name": "Malangas",
      "cityCode": "ZSI-08",
      "provinceCode": "ZSI",
      "createdAt": "2025-10-04T04:07:39.915467Z",
      "updatedAt": "2025-10-04T04:07:39.915467Z",
      "_etag": "\"0400f5c3-0000-2400-0000-68e0a0120000\""
    },
    {
      "id": "0399bc2a-4555-406f-b440-c2235f0580fa",
      "name": "Malapatan",
      "cityCode": "SAR-06",
      "provinceCode": "SAR",
      "createdAt": "2025-10-04T04:07:39.915467Z",
      "updatedAt": "2025-10-04T04:07:39.915467Z",
      "_etag": "\"04000dc4-0000-2400-0000-68e0a0130000\""
    },
    {
      "id": "b282446e-91fe-45e8-89c3-04edb3c0ba96",
      "name": "Malasiqui",
      "cityCode": "PAN-24",
      "provinceCode": "PAN",
      "createdAt": "2025-10-04T04:07:39.915467Z",
      "updatedAt": "2025-10-04T04:07:39.915467Z",
      "_etag": "\"04001ac4-0000-2400-0000-68e0a0130000\""
    },
    {
      "id": "ad58ef4d-6f9c-417f-be6c-6ac10ba78e8f",
      "name": "Malate",
      "cityCode": "NCR1-10",
      "provinceCode": "NCR1",
      "createdAt": "2025-10-04T04:07:39.915468Z",
      "updatedAt": "2025-10-04T04:07:39.915468Z",
      "_etag": "\"040037c4-0000-2400-0000-68e0a0140000\""
    },
    {
      "id": "fbdca18b-269f-418d-be12-8487149e644c",
      "name": "Malay",
      "cityCode": "AKL-12",
      "provinceCode": "AKL",
      "createdAt": "2025-10-04T04:07:39.915468Z",
      "updatedAt": "2025-10-04T04:07:39.915468Z",
      "_etag": "\"040056c4-0000-2400-0000-68e0a0150000\""
    },
    {
      "id": "c2235b1f-1c33-468e-9c7e-21260be5f6dc",
      "name": "Malibcong",
      "cityCode": "ABR-15",
      "provinceCode": "ABR",
      "createdAt": "2025-10-04T04:07:39.915468Z",
      "updatedAt": "2025-10-04T04:07:39.915468Z",
      "_etag": "\"04005fc4-0000-2400-0000-68e0a0160000\""
    },
    {
      "id": "2c8d0c8f-8097-49c0-9e1b-ab48481994be",
      "name": "Malilipot",
      "cityCode": "ALB-09",
      "provinceCode": "ALB",
      "createdAt": "2025-10-04T04:07:39.915468Z",
      "updatedAt": "2025-10-04T04:07:39.915468Z",
      "_etag": "\"040067c4-0000-2400-0000-68e0a0160000\""
    },
    {
      "id": "306e4867-bf85-4872-8503-c78d2b0eac82",
      "name": "Malimono",
      "cityCode": "SUN-15",
      "provinceCode": "SUN",
      "createdAt": "2025-10-04T04:07:39.915468Z",
      "updatedAt": "2025-10-04T04:07:39.915468Z",
      "_etag": "\"040072c4-0000-2400-0000-68e0a0170000\""
    },
    {
      "id": "98986721-e268-401a-833a-7731cb8d8e52",
      "name": "Malinao",
      "cityCode": "ALB-10",
      "provinceCode": "ALB",
      "createdAt": "2025-10-04T04:07:39.915468Z",
      "updatedAt": "2025-10-04T04:07:39.915468Z",
      "_etag": "\"04007ec4-0000-2400-0000-68e0a0170000\""
    },
    {
      "id": "e60ca3c1-be99-43d4-8279-a55fe8ab2817",
      "name": "Malinao",
      "cityCode": "AKL-13",
      "provinceCode": "AKL",
      "createdAt": "2025-10-04T04:07:39.915468Z",
      "updatedAt": "2025-10-04T04:07:39.915468Z",
      "_etag": "\"04008bc4-0000-2400-0000-68e0a0180000\""
    },
    {
      "id": "ce5ec07c-3001-48f6-82fa-749c6927d8d9",
      "name": "Malita",
      "cityCode": "DAC-03",
      "provinceCode": "DAC",
      "createdAt": "2025-10-04T04:07:39.915469Z",
      "updatedAt": "2025-10-04T04:07:39.915469Z",
      "_etag": "\"040095c4-0000-2400-0000-68e0a0180000\""
    },
    {
      "id": "7adf93ce-5f1e-4554-aef6-e9a6b913355e",
      "name": "Malitbog",
      "cityCode": "BUK-13",
      "provinceCode": "BUK",
      "createdAt": "2025-10-04T04:07:39.915469Z",
      "updatedAt": "2025-10-04T04:07:39.915469Z",
      "_etag": "\"04009fc4-0000-2400-0000-68e0a0190000\""
    },
    {
      "id": "f04b91f4-1e05-4738-b6a7-35765cecb84e",
      "name": "Malitbog",
      "cityCode": "SLE-09",
      "provinceCode": "SLE",
      "createdAt": "2025-10-04T04:07:39.915469Z",
      "updatedAt": "2025-10-04T04:07:39.915469Z",
      "_etag": "\"0400afc4-0000-2400-0000-68e0a0190000\""
    },
    {
      "id": "76df3ab0-2c73-44b1-991e-5f8813b7d453",
      "name": "Mallig",
      "cityCode": "ISA-19",
      "provinceCode": "ISA",
      "createdAt": "2025-10-04T04:07:39.915469Z",
      "updatedAt": "2025-10-04T04:07:39.915469Z",
      "_etag": "\"0400c8c4-0000-2400-0000-68e0a01a0000\""
    },
    {
      "id": "525417cf-6964-4da5-953f-961ca03f1ee0",
      "name": "Malungon",
      "cityCode": "SAR-07",
      "provinceCode": "SAR",
      "createdAt": "2025-10-04T04:07:39.915469Z",
      "updatedAt": "2025-10-04T04:07:39.915469Z",
      "_etag": "\"0400ddc4-0000-2400-0000-68e0a01b0000\""
    },
    {
      "id": "358a46fe-d6ee-41d6-870d-4337f5df57f6",
      "name": "Maluso",
      "cityCode": "BAS-04",
      "provinceCode": "BAS",
      "createdAt": "2025-10-04T04:07:39.915469Z",
      "updatedAt": "2025-10-04T04:07:39.915469Z",
      "_etag": "\"0400edc4-0000-2400-0000-68e0a01c0000\""
    },
    {
      "id": "db2cc582-8a9e-45ba-a4c2-e49f8ff66613",
      "name": "Malvar",
      "cityCode": "BTG-17",
      "provinceCode": "BTG",
      "createdAt": "2025-10-04T04:07:39.91547Z",
      "updatedAt": "2025-10-04T04:07:39.91547Z",
      "_etag": "\"040035c5-0000-2400-0000-68e0a01e0000\""
    },
    {
      "id": "f15331c9-12bb-4536-ba8f-ac6280d04eb7",
      "name": "Mamasapano",
      "cityCode": "MAG-20",
      "provinceCode": "MAG",
      "createdAt": "2025-10-04T04:07:39.915469Z",
      "updatedAt": "2025-10-04T04:07:39.915469Z",
      "_etag": "\"0400f9c4-0000-2400-0000-68e0a01c0000\""
    },
    {
      "id": "c6742f20-2fb5-4e72-bc23-df8483ed1fdc",
      "name": "Mambajao (Capital)",
      "cityCode": "CAM-04",
      "provinceCode": "CAM",
      "createdAt": "2025-10-04T04:07:39.91547Z",
      "updatedAt": "2025-10-04T04:07:39.91547Z",
      "_etag": "\"040021c5-0000-2400-0000-68e0a01d0000\""
    },
    {
      "id": "89ef73a7-73e0-4764-ad80-a849179ba030",
      "name": "Mamburao (Capital)",
      "cityCode": "MNC-06",
      "provinceCode": "MNC",
      "createdAt": "2025-10-04T04:07:39.915469Z",
      "updatedAt": "2025-10-04T04:07:39.915469Z",
      "_etag": "\"04000ec5-0000-2400-0000-68e0a01d0000\""
    },
    {
      "id": "65d3cf94-ce83-412f-acba-e275f82decb9",
      "name": "Mambusao",
      "cityCode": "CAP-08",
      "provinceCode": "CAP",
      "createdAt": "2025-10-04T04:07:39.91547Z",
      "updatedAt": "2025-10-04T04:07:39.91547Z",
      "_etag": "\"040044c5-0000-2400-0000-68e0a01e0000\""
    },
    {
      "id": "d5e23cac-0a95-4393-b0a8-b83ea89098e4",
      "name": "Manabo",
      "cityCode": "ABR-16",
      "provinceCode": "ABR",
      "createdAt": "2025-10-04T04:07:39.91547Z",
      "updatedAt": "2025-10-04T04:07:39.91547Z",
      "_etag": "\"04005bc5-0000-2400-0000-68e0a01f0000\""
    },
    {
      "id": "eb16306b-d3ee-4bb9-bf0f-0af57b610aa0",
      "name": "Manaoag",
      "cityCode": "PAN-25",
      "provinceCode": "PAN",
      "createdAt": "2025-10-04T04:07:39.915471Z",
      "updatedAt": "2025-10-04T04:07:39.915471Z",
      "_etag": "\"04006ec5-0000-2400-0000-68e0a0200000\""
    },
    {
      "id": "0d441544-11b7-4361-8bb2-3ebaaffaf705",
      "name": "Manapla",
      "cityCode": "NEC-18",
      "provinceCode": "NEC",
      "createdAt": "2025-10-04T04:07:39.915471Z",
      "updatedAt": "2025-10-04T04:07:39.915471Z",
      "_etag": "\"04007fc5-0000-2400-0000-68e0a0210000\""
    },
    {
      "id": "6817c7db-8e1b-488c-97f2-15c658116285",
      "name": "Manay",
      "cityCode": "DAR-08",
      "provinceCode": "DAR",
      "createdAt": "2025-10-04T04:07:39.915471Z",
      "updatedAt": "2025-10-04T04:07:39.915471Z",
      "_etag": "\"040092c5-0000-2400-0000-68e0a0210000\""
    },
    {
      "id": "7fa05976-19ba-43fa-bc2a-3275baeda9cd",
      "name": "Mandaon",
      "cityCode": "MAS-10",
      "provinceCode": "MAS",
      "createdAt": "2025-10-04T04:07:39.915471Z",
      "updatedAt": "2025-10-04T04:07:39.915471Z",
      "_etag": "\"0400a1c5-0000-2400-0000-68e0a0220000\""
    },
    {
      "id": "7c72b20c-9214-44b4-8ed4-31e20147bb6e",
      "name": "Mandaue City",
      "cityCode": "CEB-30",
      "provinceCode": "CEB",
      "createdAt": "2025-10-04T04:07:39.915471Z",
      "updatedAt": "2025-10-04T04:07:39.915471Z",
      "_etag": "\"0400a7c5-0000-2400-0000-68e0a0230000\""
    },
    {
      "id": "1c72d2b5-d8de-4a36-b4df-c8c7606751e1",
      "name": "Mangaldan",
      "cityCode": "PAN-26",
      "provinceCode": "PAN",
      "createdAt": "2025-10-04T04:07:39.915471Z",
      "updatedAt": "2025-10-04T04:07:39.915471Z",
      "_etag": "\"0400b9c5-0000-2400-0000-68e0a0230000\""
    },
    {
      "id": "b50c64d0-7b8c-45e3-845e-81b8a28142c0",
      "name": "Mangatarem",
      "cityCode": "PAN-27",
      "provinceCode": "PAN",
      "createdAt": "2025-10-04T04:07:39.915471Z",
      "updatedAt": "2025-10-04T04:07:39.915471Z",
      "_etag": "\"0400c8c5-0000-2400-0000-68e0a0240000\""
    },
    {
      "id": "b95a2707-b0b6-4901-b607-9e3f5ac75898",
      "name": "Mangudadatu",
      "cityCode": "MAG-32",
      "provinceCode": "MAG",
      "createdAt": "2025-10-04T04:07:39.915472Z",
      "updatedAt": "2025-10-04T04:07:39.915472Z",
      "_etag": "\"0400d5c5-0000-2400-0000-68e0a0240000\""
    },
    {
      "id": "834592d9-4237-4f57-8da4-37cae1a334d8",
      "name": "Manito",
      "cityCode": "ALB-11",
      "provinceCode": "ALB",
      "createdAt": "2025-10-04T04:07:39.915472Z",
      "updatedAt": "2025-10-04T04:07:39.915472Z",
      "_etag": "\"0400ebc5-0000-2400-0000-68e0a0250000\""
    },
    {
      "id": "b4aeab03-b404-46ca-9e39-436584248eea",
      "name": "Manjuyod",
      "cityCode": "NER-15",
      "provinceCode": "NER",
      "createdAt": "2025-10-04T04:07:39.915472Z",
      "updatedAt": "2025-10-04T04:07:39.915472Z",
      "_etag": "\"040002c6-0000-2400-0000-68e0a0260000\""
    },
    {
      "id": "89b8349f-6861-4121-bb37-6d06cf052528",
      "name": "Mankayan",
      "cityCode": "BEN-11",
      "provinceCode": "BEN",
      "createdAt": "2025-10-04T04:07:39.915472Z",
      "updatedAt": "2025-10-04T04:07:39.915472Z",
      "_etag": "\"040010c6-0000-2400-0000-68e0a0270000\""
    },
    {
      "id": "a71e42bc-3e10-4354-a2c4-f0e706af4294",
      "name": "Manolo Fortich",
      "cityCode": "BUK-14",
      "provinceCode": "BUK",
      "createdAt": "2025-10-04T04:07:39.915472Z",
      "updatedAt": "2025-10-04T04:07:39.915472Z",
      "_etag": "\"04001bc6-0000-2400-0000-68e0a0270000\""
    },
    {
      "id": "70f43c71-b8b1-496c-9640-854928d73520",
      "name": "Mansalay",
      "cityCode": "MNR-07",
      "provinceCode": "MNR",
      "createdAt": "2025-10-04T04:07:39.915472Z",
      "updatedAt": "2025-10-04T04:07:39.915472Z",
      "_etag": "\"040030c6-0000-2400-0000-68e0a0280000\""
    },
    {
      "id": "1b501621-5cdd-401e-829f-8205f61926fd",
      "name": "Manticao",
      "cityCode": "MSR-18",
      "provinceCode": "MSR",
      "createdAt": "2025-10-04T04:07:39.915473Z",
      "updatedAt": "2025-10-04T04:07:39.915473Z",
      "_etag": "\"040045c6-0000-2400-0000-68e0a0280000\""
    },
    {
      "id": "b13b3cf1-01de-4260-a392-efe947b9d6f6",
      "name": "Manukan",
      "cityCode": "ZAN-07",
      "provinceCode": "ZAN",
      "createdAt": "2025-10-04T04:07:39.915473Z",
      "updatedAt": "2025-10-04T04:07:39.915473Z",
      "_etag": "\"04004fc6-0000-2400-0000-68e0a0290000\""
    },
    {
      "id": "a1d3618b-eb56-41aa-a884-bf016bad4867",
      "name": "Mapanas",
      "cityCode": "NSA-12",
      "provinceCode": "NSA",
      "createdAt": "2025-10-04T04:07:39.915473Z",
      "updatedAt": "2025-10-04T04:07:39.915473Z",
      "_etag": "\"04005dc6-0000-2400-0000-68e0a02a0000\""
    },
    {
      "id": "6a55bce5-fd5d-4951-98ba-0dca2b89ae10",
      "name": "Mapandan",
      "cityCode": "PAN-28",
      "provinceCode": "PAN",
      "createdAt": "2025-10-04T04:07:39.915473Z",
      "updatedAt": "2025-10-04T04:07:39.915473Z",
      "_etag": "\"040067c6-0000-2400-0000-68e0a02a0000\""
    },
    {
      "id": "e712a1a4-60d2-4928-821f-606a961368da",
      "name": "Mapun (Cagayan De Tawi-tawi)",
      "cityCode": "TAW-03",
      "provinceCode": "TAW",
      "createdAt": "2025-10-04T04:07:39.915473Z",
      "updatedAt": "2025-10-04T04:07:39.915473Z",
      "_etag": "\"04006dc6-0000-2400-0000-68e0a02b0000\""
    },
    {
      "id": "8f510758-56dc-415f-be70-6b09c070c1b3",
      "name": "Marabut",
      "cityCode": "WSA-10",
      "provinceCode": "WSA",
      "createdAt": "2025-10-04T04:07:39.915473Z",
      "updatedAt": "2025-10-04T04:07:39.915473Z",
      "_etag": "\"04007ac6-0000-2400-0000-68e0a02b0000\""
    },
    {
      "id": "80135f79-8664-45c7-8030-fe8411b5cd50",
      "name": "Maragondon",
      "cityCode": "CAV-13",
      "provinceCode": "CAV",
      "createdAt": "2025-10-04T04:07:39.915473Z",
      "updatedAt": "2025-10-04T04:07:39.915474Z",
      "_etag": "\"04008cc6-0000-2400-0000-68e0a02c0000\""
    },
    {
      "id": "1087ff48-dfe6-4c75-8575-90f422e562da",
      "name": "Maragusan (San Mariano)",
      "cityCode": "COM-05",
      "provinceCode": "COM",
      "createdAt": "2025-10-04T04:07:39.915474Z",
      "updatedAt": "2025-10-04T04:07:39.915474Z",
      "_etag": "\"040096c6-0000-2400-0000-68e0a02d0000\""
    },
    {
      "id": "98c51d76-9004-4792-9452-f63edecb21c3",
      "name": "Maramag",
      "cityCode": "BUK-15",
      "provinceCode": "BUK",
      "createdAt": "2025-10-04T04:07:39.915474Z",
      "updatedAt": "2025-10-04T04:07:39.915474Z",
      "_etag": "\"0400a3c6-0000-2400-0000-68e0a02d0000\""
    },
    {
      "id": "d876ad0c-eb5c-465e-bc85-4f24b35535e6",
      "name": "Marantao",
      "cityCode": "LAN-16",
      "provinceCode": "LAN",
      "createdAt": "2025-10-04T04:07:39.915474Z",
      "updatedAt": "2025-10-04T04:07:39.915474Z",
      "_etag": "\"0400aec6-0000-2400-0000-68e0a02e0000\""
    },
    {
      "id": "946fc6e1-e5d0-4fa6-bde8-5da78ff8d953",
      "name": "Marawi City (Capital)",
      "cityCode": "LAN-17",
      "provinceCode": "LAN",
      "createdAt": "2025-10-04T04:07:39.915474Z",
      "updatedAt": "2025-10-04T04:07:39.915474Z",
      "_etag": "\"0400c2c6-0000-2400-0000-68e0a02f0000\""
    },
    {
      "id": "bad5c020-ec93-4ad6-a8e0-e16ec6a2b48b",
      "name": "Marcos",
      "cityCode": "ILN-13",
      "provinceCode": "ILN",
      "createdAt": "2025-10-04T04:07:39.915474Z",
      "updatedAt": "2025-10-04T04:07:39.915474Z",
      "_etag": "\"0400cdc6-0000-2400-0000-68e0a02f0000\""
    },
    {
      "id": "074f8382-471a-4cb7-9dac-ed7ba4c172b2",
      "name": "Margosatubig",
      "cityCode": "ZAS-17",
      "provinceCode": "ZAS",
      "createdAt": "2025-10-04T04:07:39.915474Z",
      "updatedAt": "2025-10-04T04:07:39.915474Z",
      "_etag": "\"0400e5c6-0000-2400-0000-68e0a0300000\""
    },
    {
      "id": "0856e72d-7b67-48aa-afee-a66516850a51",
      "name": "Maria",
      "cityCode": "SIQ-04",
      "provinceCode": "SIQ",
      "createdAt": "2025-10-04T04:07:39.915477Z",
      "updatedAt": "2025-10-04T04:07:39.915477Z",
      "_etag": "\"0400f1c6-0000-2400-0000-68e0a0310000\""
    },
    {
      "id": "6ad0a522-a76e-436f-aeef-8708b21257fd",
      "name": "Maria Aurora",
      "cityCode": "AUR-07",
      "provinceCode": "AUR",
      "createdAt": "2025-10-04T04:07:39.915477Z",
      "updatedAt": "2025-10-04T04:07:39.915477Z",
      "_etag": "\"040005c7-0000-2400-0000-68e0a0310000\""
    },
    {
      "id": "8d3f5a6c-35b1-4d5b-9153-fc44194317ef",
      "name": "Maribojoc",
      "cityCode": "BOH-32",
      "provinceCode": "BOH",
      "createdAt": "2025-10-04T04:07:39.915478Z",
      "updatedAt": "2025-10-04T04:07:39.915478Z",
      "_etag": "\"04003cc7-0000-2400-0000-68e0a0330000\""
    },
    {
      "id": "2a0c2965-71b2-4390-b63a-1fac7f3ee25f",
      "name": "Marihatag",
      "cityCode": "SUR-14",
      "provinceCode": "SUR",
      "createdAt": "2025-10-04T04:07:39.915478Z",
      "updatedAt": "2025-10-04T04:07:39.915478Z",
      "_etag": "\"040081c7-0000-2400-0000-68e0a0360000\""
    },
    {
      "id": "7c8f7bba-653e-482f-8489-e0d8ffaea4af",
      "name": "Marilao",
      "cityCode": "BUL-11",
      "provinceCode": "BUL",
      "createdAt": "2025-10-04T04:07:39.915477Z",
      "updatedAt": "2025-10-04T04:07:39.915477Z",
      "_etag": "\"040015c7-0000-2400-0000-68e0a0320000\""
    },
    {
      "id": "4b2eac5d-d783-4da3-9119-d011c4163124",
      "name": "Maripipi",
      "cityCode": "BIL-07",
      "provinceCode": "BIL",
      "createdAt": "2025-10-04T04:07:39.915478Z",
      "updatedAt": "2025-10-04T04:07:39.915478Z",
      "_etag": "\"04006ac7-0000-2400-0000-68e0a0350000\""
    },
    {
      "id": "be3e55c1-8af6-4bab-b6a6-bf03d98e60b8",
      "name": "Mariveles",
      "cityCode": "BAT-07",
      "provinceCode": "BAT",
      "createdAt": "2025-10-04T04:07:39.915478Z",
      "updatedAt": "2025-10-04T04:07:39.915478Z",
      "_etag": "\"040026c7-0000-2400-0000-68e0a0330000\""
    },
    {
      "id": "e8d3eda6-ac9c-4279-b85b-993b35876cbf",
      "name": "Marogong",
      "cityCode": "LAN-31",
      "provinceCode": "LAN",
      "createdAt": "2025-10-04T04:07:39.915479Z",
      "updatedAt": "2025-10-04T04:07:39.915479Z",
      "_etag": "\"040091c7-0000-2400-0000-68e0a0360000\""
    },
    {
      "id": "4c64a29c-cee2-43bb-9fd7-4b4d55a893e9",
      "name": "Masantol",
      "cityCode": "PAM-12",
      "provinceCode": "PAM",
      "createdAt": "2025-10-04T04:07:39.915478Z",
      "updatedAt": "2025-10-04T04:07:39.915478Z",
      "_etag": "\"04005ec7-0000-2400-0000-68e0a0340000\""
    },
    {
      "id": "5c0ed825-3db0-4eb3-9a64-ca9e00451bef",
      "name": "Masinloc",
      "cityCode": "ZAM-06",
      "provinceCode": "ZAM",
      "createdAt": "2025-10-04T04:07:39.915479Z",
      "updatedAt": "2025-10-04T04:07:39.915479Z",
      "_etag": "\"0400b4c7-0000-2400-0000-68e0a0380000\""
    },
    {
      "id": "58d087a5-4503-4695-a727-91dd13633bba",
      "name": "Masiu",
      "cityCode": "LAN-18",
      "provinceCode": "LAN",
      "createdAt": "2025-10-04T04:07:39.915479Z",
      "updatedAt": "2025-10-04T04:07:39.915479Z",
      "_etag": "\"0400ebc7-0000-2400-0000-68e0a03a0000\""
    },
    {
      "id": "a2b9ca03-0eca-4307-be99-87c55bb5e5e1",
      "name": "Maslog",
      "cityCode": "EAS-14",
      "provinceCode": "EAS",
      "createdAt": "2025-10-04T04:07:39.915479Z",
      "updatedAt": "2025-10-04T04:07:39.915479Z",
      "_etag": "\"04009ec7-0000-2400-0000-68e0a0370000\""
    },
    {
      "id": "dc119b67-2ee8-4a88-950c-91a1ee38e672",
      "name": "Mataasnakahoy",
      "cityCode": "BTG-18",
      "provinceCode": "BTG",
      "createdAt": "2025-10-04T04:07:39.915479Z",
      "updatedAt": "2025-10-04T04:07:39.915479Z",
      "_etag": "\"0400dac7-0000-2400-0000-68e0a0390000\""
    },
    {
      "id": "c7f20e20-be8e-45b5-a28e-8002009f2967",
      "name": "Matag-ob",
      "cityCode": "LEY-33",
      "provinceCode": "LEY",
      "createdAt": "2025-10-04T04:07:39.915479Z",
      "updatedAt": "2025-10-04T04:07:39.915479Z",
      "_etag": "\"0400ccc7-0000-2400-0000-68e0a0380000\""
    },
    {
      "id": "6767277c-e13e-49d3-95b5-96510a1cb031",
      "name": "Matalam",
      "cityCode": "NCO-08",
      "provinceCode": "NCO",
      "createdAt": "2025-10-04T04:07:39.915479Z",
      "updatedAt": "2025-10-04T04:07:39.915479Z",
      "_etag": "\"0400fbc7-0000-2400-0000-68e0a03a0000\""
    },
    {
      "id": "e94dfb9d-7468-4a75-b908-bd03aa2ce41f",
      "name": "Matalom",
      "cityCode": "LEY-34",
      "provinceCode": "LEY",
      "createdAt": "2025-10-04T04:07:39.915523Z",
      "updatedAt": "2025-10-04T04:07:39.915523Z",
      "_etag": "\"040058cc-0000-2400-0000-68e0a0640000\""
    },
    {
      "id": "07050f44-efb4-4f6a-b541-e32c6dc1eaef",
      "name": "Matanao",
      "cityCode": "DAS-10",
      "provinceCode": "DAS",
      "createdAt": "2025-10-04T04:07:39.91548Z",
      "updatedAt": "2025-10-04T04:07:39.91548Z",
      "_etag": "\"04001bc8-0000-2400-0000-68e0a03b0000\""
    },
    {
      "id": "e703a6d6-17a2-4764-9e9a-b3d4037dc709",
      "name": "Matanog",
      "cityCode": "MAG-09",
      "provinceCode": "MAG",
      "createdAt": "2025-10-04T04:07:39.915512Z",
      "updatedAt": "2025-10-04T04:07:39.915512Z",
      "_etag": "\"040042c8-0000-2400-0000-68e0a03d0000\""
    },
    {
      "id": "04d428df-c26a-47f3-bf19-e78c7c5b7f4d",
      "name": "Matnog",
      "cityCode": "SOR-12",
      "provinceCode": "SOR",
      "createdAt": "2025-10-04T04:07:39.91548Z",
      "updatedAt": "2025-10-04T04:07:39.91548Z",
      "_etag": "\"04000cc8-0000-2400-0000-68e0a03b0000\""
    },
    {
      "id": "69747923-688f-48e1-8faf-c5afa324322a",
      "name": "Matuguinao",
      "cityCode": "WSA-11",
      "provinceCode": "WSA",
      "createdAt": "2025-10-04T04:07:39.915513Z",
      "updatedAt": "2025-10-04T04:07:39.915513Z",
      "_etag": "\"040070c8-0000-2400-0000-68e0a03e0000\""
    },
    {
      "id": "d7cd1a80-41ec-4b0f-a5e9-e48054c7af30",
      "name": "Matungao",
      "cityCode": "LAN-13",
      "provinceCode": "LAN",
      "createdAt": "2025-10-04T04:07:39.915512Z",
      "updatedAt": "2025-10-04T04:07:39.915512Z",
      "_etag": "\"04002fc8-0000-2400-0000-68e0a03c0000\""
    },
    {
      "id": "851571ac-ce93-4c0f-aceb-c7f7b8d96c5a",
      "name": "Mauban",
      "cityCode": "QUE-27",
      "provinceCode": "QUE",
      "createdAt": "2025-10-04T04:07:39.915513Z",
      "updatedAt": "2025-10-04T04:07:39.915513Z",
      "_etag": "\"04005bc8-0000-2400-0000-68e0a03e0000\""
    },
    {
      "id": "688a5bdc-645d-4c1b-8c16-ef6407557b42",
      "name": "Mawab",
      "cityCode": "COM-06",
      "provinceCode": "COM",
      "createdAt": "2025-10-04T04:07:39.915522Z",
      "updatedAt": "2025-10-04T04:07:39.915522Z",
      "_etag": "\"0400f7cb-0000-2400-0000-68e0a0610000\""
    },
    {
      "id": "b55460ed-5f1a-4d79-9626-4bc0b70c316d",
      "name": "Mayantoc",
      "cityCode": "TAR-08",
      "provinceCode": "TAR",
      "createdAt": "2025-10-04T04:07:39.915513Z",
      "updatedAt": "2025-10-04T04:07:39.915513Z",
      "_etag": "\"04008dc8-0000-2400-0000-68e0a03f0000\""
    },
    {
      "id": "44688b81-7454-4a58-aee4-66bde25db19b",
      "name": "Maydolong",
      "cityCode": "EAS-15",
      "provinceCode": "EAS",
      "createdAt": "2025-10-04T04:07:39.915514Z",
      "updatedAt": "2025-10-04T04:07:39.915514Z",
      "_etag": "\"04009fc8-0000-2400-0000-68e0a0400000\""
    },
    {
      "id": "1bc8cb84-ca15-4fb1-b6fb-f308decd01c5",
      "name": "Mayorga",
      "cityCode": "LEY-35",
      "provinceCode": "LEY",
      "createdAt": "2025-10-04T04:07:39.915513Z",
      "updatedAt": "2025-10-04T04:07:39.915513Z",
      "_etag": "\"04007cc8-0000-2400-0000-68e0a03f0000\""
    },
    {
      "id": "ad75d238-7623-46ac-89c7-da05d1167a0c",
      "name": "Mayoyao",
      "cityCode": "IFU-06",
      "provinceCode": "IFU",
      "createdAt": "2025-10-04T04:07:39.915514Z",
      "updatedAt": "2025-10-04T04:07:39.915514Z",
      "_etag": "\"0400bcc8-0000-2400-0000-68e0a0420000\""
    },
    {
      "id": "5ebc051d-38c3-4ff7-be65-3ee7d742109c",
      "name": "Medellin",
      "cityCode": "CEB-31",
      "provinceCode": "CEB",
      "createdAt": "2025-10-04T04:07:39.915513Z",
      "updatedAt": "2025-10-04T04:07:39.915513Z",
      "_etag": "\"040095c8-0000-2400-0000-68e0a0400000\""
    },
    {
      "id": "2b29317d-5eb5-49ca-aaac-ab2070ee9f79",
      "name": "Medina",
      "cityCode": "MSR-19",
      "provinceCode": "MSR",
      "createdAt": "2025-10-04T04:07:39.915514Z",
      "updatedAt": "2025-10-04T04:07:39.915514Z",
      "_etag": "\"0400abc8-0000-2400-0000-68e0a0410000\""
    },
    {
      "id": "9e6038e4-ecf2-430f-9d96-bc711f24b0b6",
      "name": "Mendez (Mendez-nuñez)",
      "cityCode": "CAV-14",
      "provinceCode": "CAV",
      "createdAt": "2025-10-04T04:07:39.915521Z",
      "updatedAt": "2025-10-04T04:07:39.915521Z",
      "_etag": "\"0400c7cb-0000-2400-0000-68e0a05e0000\""
    },
    {
      "id": "f3806f89-fd85-435d-bc96-31226151525a",
      "name": "Mercedes",
      "cityCode": "CAN-07",
      "provinceCode": "CAN",
      "createdAt": "2025-10-04T04:07:39.915514Z",
      "updatedAt": "2025-10-04T04:07:39.915514Z",
      "_etag": "\"0400dec8-0000-2400-0000-68e0a0430000\""
    },
    {
      "id": "f486eca8-ec4f-4eee-bb57-05289b73d858",
      "name": "Mercedes",
      "cityCode": "EAS-16",
      "provinceCode": "EAS",
      "createdAt": "2025-10-04T04:07:39.915514Z",
      "updatedAt": "2025-10-04T04:07:39.915514Z",
      "_etag": "\"040009c9-0000-2400-0000-68e0a0440000\""
    },
    {
      "id": "908bd573-81af-4604-8fb1-2a5984c6b206",
      "name": "Merida",
      "cityCode": "LEY-36",
      "provinceCode": "LEY",
      "createdAt": "2025-10-04T04:07:39.915514Z",
      "updatedAt": "2025-10-04T04:07:39.915514Z",
      "_etag": "\"0400d2c8-0000-2400-0000-68e0a0420000\""
    },
    {
      "id": "866dc65e-54c0-4716-b7e8-9db9d185edfd",
      "name": "Mexico",
      "cityCode": "PAM-13",
      "provinceCode": "PAM",
      "createdAt": "2025-10-04T04:07:39.915515Z",
      "updatedAt": "2025-10-04T04:07:39.915515Z",
      "_etag": "\"04001ec9-0000-2400-0000-68e0a0450000\""
    },
    {
      "id": "c3019816-f78a-4ca7-bf48-619735447fa9",
      "name": "Miagao",
      "cityCode": "ILO-30",
      "provinceCode": "ILO",
      "createdAt": "2025-10-04T04:07:39.915514Z",
      "updatedAt": "2025-10-04T04:07:39.915514Z",
      "_etag": "\"0400edc8-0000-2400-0000-68e0a0430000\""
    },
    {
      "id": "4924e66d-37cf-4b2e-b270-4c8630347093",
      "name": "Midsalip",
      "cityCode": "ZAS-18",
      "provinceCode": "ZAS",
      "createdAt": "2025-10-04T04:07:39.915514Z",
      "updatedAt": "2025-10-04T04:07:39.915515Z",
      "_etag": "\"040013c9-0000-2400-0000-68e0a0440000\""
    },
    {
      "id": "c6f40470-8eb2-467c-a48e-d2a22a34a27c",
      "name": "Midsayap",
      "cityCode": "NCO-09",
      "provinceCode": "NCO",
      "createdAt": "2025-10-04T04:07:39.915522Z",
      "updatedAt": "2025-10-04T04:07:39.915522Z",
      "_etag": "\"040003cc-0000-2400-0000-68e0a0610000\""
    },
    {
      "id": "0380e10e-ac72-4a4f-8578-c95693c21af8",
      "name": "Milagros",
      "cityCode": "MAS-12",
      "provinceCode": "MAS",
      "createdAt": "2025-10-04T04:07:39.915515Z",
      "updatedAt": "2025-10-04T04:07:39.915515Z",
      "_etag": "\"04003fc9-0000-2400-0000-68e0a0460000\""
    },
    {
      "id": "081413a9-aa00-4165-93ad-806a1cb8c786",
      "name": "Milaor",
      "cityCode": "CAS-21",
      "provinceCode": "CAS",
      "createdAt": "2025-10-04T04:07:39.915516Z",
      "updatedAt": "2025-10-04T04:07:39.915516Z",
      "_etag": "\"040065c9-0000-2400-0000-68e0a0470000\""
    },
    {
      "id": "456487fc-93cc-4167-9f8d-256a29497d3e",
      "name": "Mina",
      "cityCode": "ILO-31",
      "provinceCode": "ILO",
      "createdAt": "2025-10-04T04:07:39.915515Z",
      "updatedAt": "2025-10-04T04:07:39.915515Z",
      "_etag": "\"04002bc9-0000-2400-0000-68e0a0460000\""
    },
    {
      "id": "baa6cf64-3652-4311-a01e-b42f3d0b21d5",
      "name": "Minalabac",
      "cityCode": "CAS-22",
      "provinceCode": "CAS",
      "createdAt": "2025-10-04T04:07:39.915516Z",
      "updatedAt": "2025-10-04T04:07:39.915516Z",
      "_etag": "\"040082c9-0000-2400-0000-68e0a0490000\""
    },
    {
      "id": "02b4fab6-4270-49f4-b2a7-26bc7429cd79",
      "name": "Minalin",
      "cityCode": "PAM-14",
      "provinceCode": "PAM",
      "createdAt": "2025-10-04T04:07:39.915515Z",
      "updatedAt": "2025-10-04T04:07:39.915515Z",
      "_etag": "\"040055c9-0000-2400-0000-68e0a0470000\""
    },
    {
      "id": "fcf7596a-90c6-4d21-9a45-c91affffb496",
      "name": "Minglanilla",
      "cityCode": "CEB-32",
      "provinceCode": "CEB",
      "createdAt": "2025-10-04T04:07:39.915516Z",
      "updatedAt": "2025-10-04T04:07:39.915516Z",
      "_etag": "\"040077c9-0000-2400-0000-68e0a0480000\""
    },
    {
      "id": "10d1098e-a017-4912-8e2a-88e144717bf4",
      "name": "Moalboal",
      "cityCode": "CEB-33",
      "provinceCode": "CEB",
      "createdAt": "2025-10-04T04:07:39.915524Z",
      "updatedAt": "2025-10-04T04:07:39.915524Z",
      "_etag": "\"040095cc-0000-2400-0000-68e0a0670000\""
    },
    {
      "id": "1489f162-d351-4da6-b64c-3e89098a42ad",
      "name": "Mobo",
      "cityCode": "MAS-13",
      "provinceCode": "MAS",
      "createdAt": "2025-10-04T04:07:39.915516Z",
      "updatedAt": "2025-10-04T04:07:39.915516Z",
      "_etag": "\"0400a7c9-0000-2400-0000-68e0a04a0000\""
    },
    {
      "id": "2e45a02e-aa36-481d-b532-d937b750a780",
      "name": "Mogpog",
      "cityCode": "MAD-04",
      "provinceCode": "MAD",
      "createdAt": "2025-10-04T04:07:39.915516Z",
      "updatedAt": "2025-10-04T04:07:39.915516Z",
      "_etag": "\"040095c9-0000-2400-0000-68e0a0490000\""
    },
    {
      "id": "da2c4b2b-c34e-44c2-a3b6-b6713670a809",
      "name": "Moises Padilla (Magallon)",
      "cityCode": "NEC-19",
      "provinceCode": "NEC",
      "createdAt": "2025-10-04T04:07:39.915517Z",
      "updatedAt": "2025-10-04T04:07:39.915517Z",
      "_etag": "\"0400ecc9-0000-2400-0000-68e0a04c0000\""
    },
    {
      "id": "ab248068-1810-4d8c-8684-10cff64d5ae3",
      "name": "Molave",
      "cityCode": "ZAS-19",
      "provinceCode": "ZAS",
      "createdAt": "2025-10-04T04:07:39.915516Z",
      "updatedAt": "2025-10-04T04:07:39.915516Z",
      "_etag": "\"0400bec9-0000-2400-0000-68e0a04a0000\""
    },
    {
      "id": "f7269805-6ec3-45fd-8800-3b2251532f4f",
      "name": "Moncada",
      "cityCode": "TAR-09",
      "provinceCode": "TAR",
      "createdAt": "2025-10-04T04:07:39.915516Z",
      "updatedAt": "2025-10-04T04:07:39.915516Z",
      "_etag": "\"0400ddc9-0000-2400-0000-68e0a04c0000\""
    },
    {
      "id": "d4061f99-7dcf-46fa-8956-f0e4336d539e",
      "name": "Mondragon",
      "cityCode": "NSA-13",
      "provinceCode": "NSA",
      "createdAt": "2025-10-04T04:07:39.915575Z",
      "updatedAt": "2025-10-04T04:07:39.915576Z",
      "_etag": "\"04002bcd-0000-2400-0000-68e0a06d0000\""
    },
    {
      "id": "374aa961-2201-4d46-adcc-d12a52bfb55e",
      "name": "Monkayo",
      "cityCode": "COM-07",
      "provinceCode": "COM",
      "createdAt": "2025-10-04T04:07:39.915517Z",
      "updatedAt": "2025-10-04T04:07:39.915517Z",
      "_etag": "\"040009ca-0000-2400-0000-68e0a04d0000\""
    },
    {
      "id": "5bae600a-b692-4073-8b19-06886d95fe54",
      "name": "Monreal",
      "cityCode": "MAS-14",
      "provinceCode": "MAS",
      "createdAt": "2025-10-04T04:07:39.915517Z",
      "updatedAt": "2025-10-04T04:07:39.915517Z",
      "_etag": "\"040029ca-0000-2400-0000-68e0a04f0000\""
    },
    {
      "id": "5616151b-eb65-4344-879b-4898cfe7ca8c",
      "name": "Montevista",
      "cityCode": "COM-08",
      "provinceCode": "COM",
      "createdAt": "2025-10-04T04:07:39.915517Z",
      "updatedAt": "2025-10-04T04:07:39.915517Z",
      "_etag": "\"0400fbc9-0000-2400-0000-68e0a04d0000\""
    },
    {
      "id": "08335758-b3a0-43aa-8272-ab225bf2519a",
      "name": "Morong",
      "cityCode": "RIZ-09",
      "provinceCode": "RIZ",
      "createdAt": "2025-10-04T04:07:39.915517Z",
      "updatedAt": "2025-10-04T04:07:39.915517Z",
      "_etag": "\"040016ca-0000-2400-0000-68e0a04e0000\""
    },
    {
      "id": "3b5d4efd-d353-49f0-8de8-7b9f9c0f851c",
      "name": "Morong",
      "cityCode": "BAT-08",
      "provinceCode": "BAT",
      "createdAt": "2025-10-04T04:07:39.915517Z",
      "updatedAt": "2025-10-04T04:07:39.915517Z",
      "_etag": "\"040038ca-0000-2400-0000-68e0a04f0000\""
    },
    {
      "id": "3089c6cd-aeb3-4752-a613-c53c8039b6a9",
      "name": "Motiong",
      "cityCode": "WSA-12",
      "provinceCode": "WSA",
      "createdAt": "2025-10-04T04:07:39.915523Z",
      "updatedAt": "2025-10-04T04:07:39.915523Z",
      "_etag": "\"04006ecc-0000-2400-0000-68e0a0650000\""
    },
    {
      "id": "c92b8706-5fb4-45ff-b7e7-ac1461238158",
      "name": "Mulanay",
      "cityCode": "QUE-28",
      "provinceCode": "QUE",
      "createdAt": "2025-10-04T04:07:39.915517Z",
      "updatedAt": "2025-10-04T04:07:39.915518Z",
      "_etag": "\"04005bca-0000-2400-0000-68e0a0500000\""
    },
    {
      "id": "cce6f5db-f07b-4f08-a7ee-28a2a5ab816b",
      "name": "Mulondo",
      "cityCode": "LAN-19",
      "provinceCode": "LAN",
      "createdAt": "2025-10-04T04:07:39.915518Z",
      "updatedAt": "2025-10-04T04:07:39.915518Z",
      "_etag": "\"04006eca-0000-2400-0000-68e0a0510000\""
    },
    {
      "id": "a252e634-4d09-4aed-831c-1a7d2f57155d",
      "name": "Munai",
      "cityCode": "LAN-14",
      "provinceCode": "LAN",
      "createdAt": "2025-10-04T04:07:39.915517Z",
      "updatedAt": "2025-10-04T04:07:39.915517Z",
      "_etag": "\"040045ca-0000-2400-0000-68e0a0500000\""
    },
    {
      "id": "60309950-17c2-4e69-858d-4ef2abd3e9cc",
      "name": "Murcia",
      "cityCode": "NEC-20",
      "provinceCode": "NEC",
      "createdAt": "2025-10-04T04:07:39.915518Z",
      "updatedAt": "2025-10-04T04:07:39.915518Z",
      "_etag": "\"040082ca-0000-2400-0000-68e0a0520000\""
    },
    {
      "id": "7bb3a629-ebde-4f29-bb4a-ecdfa2fe2b6b",
      "name": "Mutia",
      "cityCode": "ZAN-08",
      "provinceCode": "ZAN",
      "createdAt": "2025-10-04T04:07:39.915518Z",
      "updatedAt": "2025-10-04T04:07:39.915518Z",
      "_etag": "\"040064ca-0000-2400-0000-68e0a0510000\""
    },
    {
      "id": "88fdd89e-d69b-442c-bb45-9fb7a1f24728",
      "name": "Naawan",
      "cityCode": "MSR-20",
      "provinceCode": "MSR",
      "createdAt": "2025-10-04T04:07:39.915524Z",
      "updatedAt": "2025-10-04T04:07:39.915524Z",
      "_etag": "\"0400a4cc-0000-2400-0000-68e0a0670000\""
    },
    {
      "id": "2aa3b18d-03c1-4673-b7c1-88f4965b1e38",
      "name": "Nabas",
      "cityCode": "AKL-14",
      "provinceCode": "AKL",
      "createdAt": "2025-10-04T04:07:39.915519Z",
      "updatedAt": "2025-10-04T04:07:39.915519Z",
      "_etag": "\"0400b3ca-0000-2400-0000-68e0a0530000\""
    },
    {
      "id": "2efef26b-6b0f-4ed0-9e85-e82a926dbedb",
      "name": "Nabua",
      "cityCode": "CAS-23",
      "provinceCode": "CAS",
      "createdAt": "2025-10-04T04:07:39.915519Z",
      "updatedAt": "2025-10-04T04:07:39.915519Z",
      "_etag": "\"0400dfca-0000-2400-0000-68e0a0540000\""
    },
    {
      "id": "a4db01b7-600b-4054-abcc-cc54308d5941",
      "name": "Nabunturan (Capital)",
      "cityCode": "COM-09",
      "provinceCode": "COM",
      "createdAt": "2025-10-04T04:07:39.915518Z",
      "updatedAt": "2025-10-04T04:07:39.915518Z",
      "_etag": "\"04009bca-0000-2400-0000-68e0a0530000\""
    },
    {
      "id": "218ee015-e8c1-4315-9903-e81aba02272e",
      "name": "Naga",
      "cityCode": "ZSI-09",
      "provinceCode": "ZSI",
      "createdAt": "2025-10-04T04:07:39.915519Z",
      "updatedAt": "2025-10-04T04:07:39.915519Z",
      "_etag": "\"0400eeca-0000-2400-0000-68e0a0550000\""
    },
    {
      "id": "643c56f2-90c3-4b2d-9f16-92dfec2a886f",
      "name": "Naga City",
      "cityCode": "CAS-24",
      "provinceCode": "CAS",
      "createdAt": "2025-10-04T04:07:39.915519Z",
      "updatedAt": "2025-10-04T04:07:39.915519Z",
      "_etag": "\"0400cdca-0000-2400-0000-68e0a0540000\""
    },
    {
      "id": "5f927158-7ab2-4f62-9df4-f85ea459ff6d",
      "name": "Nagbukel",
      "cityCode": "ILS-13",
      "provinceCode": "ILS",
      "createdAt": "2025-10-04T04:07:39.915522Z",
      "updatedAt": "2025-10-04T04:07:39.915522Z",
      "_etag": "\"040046cc-0000-2400-0000-68e0a0630000\""
    },
    {
      "id": "29c21fb1-f25b-48ae-ab18-f7835a558f99",
      "name": "Nagcarlan",
      "cityCode": "LAG-17",
      "provinceCode": "LAG",
      "createdAt": "2025-10-04T04:07:39.915519Z",
      "updatedAt": "2025-10-04T04:07:39.915519Z",
      "_etag": "\"040010cb-0000-2400-0000-68e0a0560000\""
    },
    {
      "id": "a2d3dc43-c4a7-4298-847a-40e916fe843b",
      "name": "Nagtipunan",
      "cityCode": "QUI-06",
      "provinceCode": "QUI",
      "createdAt": "2025-10-04T04:07:39.915519Z",
      "updatedAt": "2025-10-04T04:07:39.91552Z",
      "_etag": "\"040030cb-0000-2400-0000-68e0a0570000\""
    },
    {
      "id": "9691fca4-99bc-406a-a86a-6327f6744631",
      "name": "Naguilian",
      "cityCode": "LAU-11",
      "provinceCode": "LAU",
      "createdAt": "2025-10-04T04:07:39.915519Z",
      "updatedAt": "2025-10-04T04:07:39.915519Z",
      "_etag": "\"0400fcca-0000-2400-0000-68e0a0550000\""
    },
    {
      "id": "a160473e-03a3-4ebf-a07a-ba5535e63615",
      "name": "Naguilian",
      "cityCode": "ISA-20",
      "provinceCode": "ISA",
      "createdAt": "2025-10-04T04:07:39.91552Z",
      "updatedAt": "2025-10-04T04:07:39.91552Z",
      "_etag": "\"040046cb-0000-2400-0000-68e0a0580000\""
    },
    {
      "id": "d1fddc9b-c5f4-4010-b598-25a4ae164a22",
      "name": "Naic",
      "cityCode": "CAV-15",
      "provinceCode": "CAV",
      "createdAt": "2025-10-04T04:07:39.915519Z",
      "updatedAt": "2025-10-04T04:07:39.915519Z",
      "_etag": "\"04001fcb-0000-2400-0000-68e0a0570000\""
    },
    {
      "id": "f8e6d61f-7b8e-4a4d-900c-7423e218f0b0",
      "name": "Nampicuan",
      "cityCode": "NUE-18",
      "provinceCode": "NUE",
      "createdAt": "2025-10-04T04:07:39.915522Z",
      "updatedAt": "2025-10-04T04:07:39.915522Z",
      "_etag": "\"040035cc-0000-2400-0000-68e0a0630000\""
    },
    {
      "id": "4cdc9501-2f7c-49d3-9ca7-5af6c75e4bd2",
      "name": "Narra",
      "cityCode": "PAL-15",
      "provinceCode": "PAL",
      "createdAt": "2025-10-04T04:07:39.915584Z",
      "updatedAt": "2025-10-04T04:07:39.915584Z",
      "_etag": "\"0400a5ce-0000-2400-0000-68e0a07b0000\""
    },
    {
      "id": "d89b6a16-b159-4daf-a0e4-fefd2b65df9f",
      "name": "Narvacan",
      "cityCode": "ILS-14",
      "provinceCode": "ILS",
      "createdAt": "2025-10-04T04:07:39.915593Z",
      "updatedAt": "2025-10-04T04:07:39.915593Z",
      "_etag": "\"040063d2-0000-2400-0000-68e0a09f0000\""
    },
    {
      "id": "b658d430-c24c-4d2b-b45e-545fb71a89ae",
      "name": "Nasipit",
      "cityCode": "AGN-09",
      "provinceCode": "AGN",
      "createdAt": "2025-10-04T04:07:39.91552Z",
      "updatedAt": "2025-10-04T04:07:39.91552Z",
      "_etag": "\"040053cb-0000-2400-0000-68e0a0590000\""
    },
    {
      "id": "31b5b83c-8f03-4881-a54a-4cb26ba58dfe",
      "name": "Nasugbu",
      "cityCode": "BTG-19",
      "provinceCode": "BTG",
      "createdAt": "2025-10-04T04:07:39.91552Z",
      "updatedAt": "2025-10-04T04:07:39.91552Z",
      "_etag": "\"04006ccb-0000-2400-0000-68e0a05a0000\""
    },
    {
      "id": "bff852b2-f87c-40d0-bf16-7eecaf2e254a",
      "name": "Natividad",
      "cityCode": "PAN-29",
      "provinceCode": "PAN",
      "createdAt": "2025-10-04T04:07:39.915584Z",
      "updatedAt": "2025-10-04T04:07:39.915584Z",
      "_etag": "\"040009cf-0000-2400-0000-68e0a07e0000\""
    },
    {
      "id": "de595dfa-e747-468a-9c83-7539235eb759",
      "name": "Natonin",
      "cityCode": "MOU-05",
      "provinceCode": "MOU",
      "createdAt": "2025-10-04T04:07:39.915591Z",
      "updatedAt": "2025-10-04T04:07:39.915591Z",
      "_etag": "\"0400a9d1-0000-2400-0000-68e0a0980000\""
    },
    {
      "id": "751445a3-0787-41bf-897a-a06507c4c53c",
      "name": "Naujan",
      "cityCode": "MNR-08",
      "provinceCode": "MNR",
      "createdAt": "2025-10-04T04:07:39.915577Z",
      "updatedAt": "2025-10-04T04:07:39.915577Z",
      "_etag": "\"04009acd-0000-2400-0000-68e0a0710000\""
    },
    {
      "id": "636a7e19-2eec-4a7c-9bb8-f660b8c5c2d0",
      "name": "Naval (Capital)",
      "cityCode": "BIL-08",
      "provinceCode": "BIL",
      "createdAt": "2025-10-04T04:07:39.915594Z",
      "updatedAt": "2025-10-04T04:07:39.915594Z",
      "_etag": "\"0400a2d2-0000-2400-0000-68e0a0a20000\""
    },
    {
      "id": "7090e752-c9ed-4102-b4f9-c431faeab78b",
      "name": "New Bataan",
      "cityCode": "COM-10",
      "provinceCode": "COM",
      "createdAt": "2025-10-04T04:07:39.915586Z",
      "updatedAt": "2025-10-04T04:07:39.915586Z",
      "_etag": "\"0400cbcf-0000-2400-0000-68e0a0850000\""
    },
    {
      "id": "9ed90a16-3279-4c43-b246-edbcbb4a98b3",
      "name": "New Corella",
      "cityCode": "DAN-14",
      "provinceCode": "DAN",
      "createdAt": "2025-10-04T04:07:39.915521Z",
      "updatedAt": "2025-10-04T04:07:39.915521Z",
      "_etag": "\"040078cb-0000-2400-0000-68e0a05b0000\""
    },
    {
      "id": "2c77837c-8793-4e0f-9eaf-965952549f7c",
      "name": "New Lucena",
      "cityCode": "ILO-32",
      "provinceCode": "ILO",
      "createdAt": "2025-10-04T04:07:39.915523Z",
      "updatedAt": "2025-10-04T04:07:39.915523Z",
      "_etag": "\"04007acc-0000-2400-0000-68e0a0660000\""
    },
    {
      "id": "ad8688b6-3936-4589-b0d4-482fb2a03f2a",
      "name": "New Washington",
      "cityCode": "AKL-15",
      "provinceCode": "AKL",
      "createdAt": "2025-10-04T04:07:39.91559Z",
      "updatedAt": "2025-10-04T04:07:39.91559Z",
      "_etag": "\"040064d1-0000-2400-0000-68e0a0960000\""
    },
    {
      "id": "d73915f6-67bf-44a3-a6aa-bb14c99de128",
      "name": "Norala",
      "cityCode": "SCO-11",
      "provinceCode": "SCO",
      "createdAt": "2025-10-04T04:07:39.91559Z",
      "updatedAt": "2025-10-04T04:07:39.91559Z",
      "_etag": "\"040037d1-0000-2400-0000-68e0a0930000\""
    },
    {
      "id": "1e8594fa-cd14-464a-9548-bd52715d1d87",
      "name": "Northern Kabuntalan",
      "cityCode": "MAG-34",
      "provinceCode": "MAG",
      "createdAt": "2025-10-04T04:07:39.915594Z",
      "updatedAt": "2025-10-04T04:07:39.915594Z",
      "_etag": "\"0400cdd2-0000-2400-0000-68e0a0a30000\""
    },
    {
      "id": "97c95518-f1c7-46f2-b04d-06e5ba9d8d65",
      "name": "Norzagaray",
      "cityCode": "BUL-13",
      "provinceCode": "BUL",
      "createdAt": "2025-10-04T04:07:39.915583Z",
      "updatedAt": "2025-10-04T04:07:39.915583Z",
      "_etag": "\"04007bce-0000-2400-0000-68e0a0790000\""
    },
    {
      "id": "948135bc-e1dc-48fe-8eca-288c9db53885",
      "name": "Noveleta",
      "cityCode": "CAV-16",
      "provinceCode": "CAV",
      "createdAt": "2025-10-04T04:07:39.915521Z",
      "updatedAt": "2025-10-04T04:07:39.915521Z",
      "_etag": "\"0400b9cb-0000-2400-0000-68e0a05e0000\""
    },
    {
      "id": "58e7f2a0-c90e-46be-98cd-95db2666ab68",
      "name": "Nueva Era",
      "cityCode": "ILN-14",
      "provinceCode": "ILN",
      "createdAt": "2025-10-04T04:07:39.915576Z",
      "updatedAt": "2025-10-04T04:07:39.915576Z",
      "_etag": "\"04003ccd-0000-2400-0000-68e0a06d0000\""
    },
    {
      "id": "71cb3ff9-ac8c-48de-ba49-5e04af4a1c75",
      "name": "Nueva Valencia",
      "cityCode": "GUI-03",
      "provinceCode": "GUI",
      "createdAt": "2025-10-04T04:07:39.91559Z",
      "updatedAt": "2025-10-04T04:07:39.91559Z",
      "_etag": "\"04004fd1-0000-2400-0000-68e0a0940000\""
    },
    {
      "id": "16d362a7-9bdc-4ea7-aed1-2bd3ddf67041",
      "name": "Numancia",
      "cityCode": "AKL-16",
      "provinceCode": "AKL",
      "createdAt": "2025-10-04T04:07:39.915587Z",
      "updatedAt": "2025-10-04T04:07:39.915587Z",
      "_etag": "\"0400ffcf-0000-2400-0000-68e0a0870000\""
    },
    {
      "id": "691cb827-7d95-42b2-87ab-fee0b88e91aa",
      "name": "Nunungan",
      "cityCode": "LAN-15",
      "provinceCode": "LAN",
      "createdAt": "2025-10-04T04:07:39.915594Z",
      "updatedAt": "2025-10-04T04:07:39.915594Z",
      "_etag": "\"040099d2-0000-2400-0000-68e0a0a20000\""
    },
    {
      "id": "16b0ff5e-fd44-4ba7-8a7d-bdf73561586d",
      "name": "Oas",
      "cityCode": "ALB-12",
      "provinceCode": "ALB",
      "createdAt": "2025-10-04T04:07:39.915592Z",
      "updatedAt": "2025-10-04T04:07:39.915592Z",
      "_etag": "\"0400c0d1-0000-2400-0000-68e0a0990000\""
    },
    {
      "id": "2214e4da-6c85-452a-bea0-314a65648631",
      "name": "Obando",
      "cityCode": "BUL-14",
      "provinceCode": "BUL",
      "createdAt": "2025-10-04T04:07:39.915521Z",
      "updatedAt": "2025-10-04T04:07:39.915521Z",
      "_etag": "\"040094cb-0000-2400-0000-68e0a05c0000\""
    },
    {
      "id": "cb663485-90f7-487b-b204-4510156d96cf",
      "name": "Ocampo",
      "cityCode": "CAS-25",
      "provinceCode": "CAS",
      "createdAt": "2025-10-04T04:07:39.915575Z",
      "updatedAt": "2025-10-04T04:07:39.915575Z",
      "_etag": "\"0400decc-0000-2400-0000-68e0a06a0000\""
    },
    {
      "id": "770d5609-dd25-44f0-a08c-728c6ef7825e",
      "name": "Odiongan",
      "cityCode": "ROM-09",
      "provinceCode": "ROM",
      "createdAt": "2025-10-04T04:07:39.91559Z",
      "updatedAt": "2025-10-04T04:07:39.91559Z",
      "_etag": "\"040025d1-0000-2400-0000-68e0a0920000\""
    },
    {
      "id": "1f07f212-18d2-4f83-9b86-ed238be243ef",
      "name": "Old Panamao",
      "cityCode": "SUL-07",
      "provinceCode": "SUL",
      "createdAt": "2025-10-04T04:07:39.915586Z",
      "updatedAt": "2025-10-04T04:07:39.915586Z",
      "_etag": "\"0400d6cf-0000-2400-0000-68e0a0850000\""
    },
    {
      "id": "85954062-3612-455d-969f-5abc70c3e438",
      "name": "Olongapo City",
      "cityCode": "ZAM-07",
      "provinceCode": "ZAM",
      "createdAt": "2025-10-04T04:07:39.915595Z",
      "updatedAt": "2025-10-04T04:07:39.915595Z",
      "_etag": "\"04000cd3-0000-2400-0000-68e0a0a50000\""
    },
    {
      "id": "4f69db47-35e1-48e1-940b-de28e8f713e4",
      "name": "Olutanga",
      "cityCode": "ZSI-10",
      "provinceCode": "ZSI",
      "createdAt": "2025-10-04T04:07:39.915592Z",
      "updatedAt": "2025-10-04T04:07:39.915592Z",
      "_etag": "\"0400b0d1-0000-2400-0000-68e0a0990000\""
    },
    {
      "id": "3bfae1a8-a60e-4c88-8edc-2241cacec8be",
      "name": "Omar",
      "cityCode": "SUL-19",
      "provinceCode": "SUL",
      "createdAt": "2025-10-04T04:07:39.915575Z",
      "updatedAt": "2025-10-04T04:07:39.915575Z",
      "_etag": "\"0400e7cc-0000-2400-0000-68e0a06a0000\""
    },
    {
      "id": "17d380c4-f15f-4ffc-8d5e-561a74572d0f",
      "name": "Opol",
      "cityCode": "MSR-21",
      "provinceCode": "MSR",
      "createdAt": "2025-10-04T04:07:39.915523Z",
      "updatedAt": "2025-10-04T04:07:39.915523Z",
      "_etag": "\"040086cc-0000-2400-0000-68e0a0670000\""
    },
    {
      "id": "9fbdd938-d188-49cd-ad03-ca61a5247b25",
      "name": "Orani",
      "cityCode": "BAT-09",
      "provinceCode": "BAT",
      "createdAt": "2025-10-04T04:07:39.915589Z",
      "updatedAt": "2025-10-04T04:07:39.915589Z",
      "_etag": "\"04000ed1-0000-2400-0000-68e0a0910000\""
    },
    {
      "id": "c182ab92-325d-47ff-910d-c2c3d6510d1c",
      "name": "Oras",
      "cityCode": "EAS-17",
      "provinceCode": "EAS",
      "createdAt": "2025-10-04T04:07:39.915584Z",
      "updatedAt": "2025-10-04T04:07:39.915584Z",
      "_etag": "\"0400d9ce-0000-2400-0000-68e0a07c0000\""
    },
    {
      "id": "24ae71b4-4299-4d54-8bf1-22904f5b99b8",
      "name": "Orion",
      "cityCode": "BAT-10",
      "provinceCode": "BAT",
      "createdAt": "2025-10-04T04:07:39.915594Z",
      "updatedAt": "2025-10-04T04:07:39.915594Z",
      "_etag": "\"0400b6d2-0000-2400-0000-68e0a0a30000\""
    },
    {
      "id": "53016df2-e4c8-41b2-ac18-4eea72e14b70",
      "name": "Ormoc City",
      "cityCode": "LEY-38",
      "provinceCode": "LEY",
      "createdAt": "2025-10-04T04:07:39.915591Z",
      "updatedAt": "2025-10-04T04:07:39.915591Z",
      "_etag": "\"04007fd1-0000-2400-0000-68e0a0960000\""
    },
    {
      "id": "74dd77f6-8b8a-4cda-9b66-791845e6b684",
      "name": "Oroquieta City (Capital)",
      "cityCode": "MSC-09",
      "provinceCode": "MSC",
      "createdAt": "2025-10-04T04:07:39.915521Z",
      "updatedAt": "2025-10-04T04:07:39.915521Z",
      "_etag": "\"0400a0cb-0000-2400-0000-68e0a05c0000\""
    },
    {
      "id": "a12c7da4-ed76-4703-b32d-7ff3ad791b73",
      "name": "Oslob",
      "cityCode": "CEB-35",
      "provinceCode": "CEB",
      "createdAt": "2025-10-04T04:07:39.915575Z",
      "updatedAt": "2025-10-04T04:07:39.915575Z",
      "_etag": "\"0400d6cc-0000-2400-0000-68e0a0690000\""
    },
    {
      "id": "4f347485-c25c-4495-8104-5f0bc63df642",
      "name": "Oton",
      "cityCode": "ILO-34",
      "provinceCode": "ILO",
      "createdAt": "2025-10-04T04:07:39.915589Z",
      "updatedAt": "2025-10-04T04:07:39.915589Z",
      "_etag": "\"0400f8d0-0000-2400-0000-68e0a0910000\""
    },
    {
      "id": "c06e507a-5409-4e2b-991f-764818c3c18b",
      "name": "Ozamis City",
      "cityCode": "MSC-10",
      "provinceCode": "MSC",
      "createdAt": "2025-10-04T04:07:39.915592Z",
      "updatedAt": "2025-10-04T04:07:39.915592Z",
      "_etag": "\"040003d2-0000-2400-0000-68e0a09c0000\""
    },
    {
      "id": "8aa71024-8967-4793-a35e-124c607fb7d8",
      "name": "Paco",
      "cityCode": "NCR1-11",
      "provinceCode": "NCR1",
      "createdAt": "2025-10-04T04:07:39.915595Z",
      "updatedAt": "2025-10-04T04:07:39.915595Z",
      "_etag": "\"0400ead2-0000-2400-0000-68e0a0a40000\""
    },
    {
      "id": "9b4c51a3-7563-467e-a7a3-a1ff5f4b7444",
      "name": "Padada",
      "cityCode": "DAS-11",
      "provinceCode": "DAS",
      "createdAt": "2025-10-04T04:07:39.915591Z",
      "updatedAt": "2025-10-04T04:07:39.915591Z",
      "_etag": "\"0400a5d1-0000-2400-0000-68e0a0980000\""
    },
    {
      "id": "9648b0a8-b9c3-42d5-9506-1cb7086de862",
      "name": "Padre Burgos",
      "cityCode": "QUE-29",
      "provinceCode": "QUE",
      "createdAt": "2025-10-04T04:07:39.915521Z",
      "updatedAt": "2025-10-04T04:07:39.915521Z",
      "_etag": "\"04008ccb-0000-2400-0000-68e0a05b0000\""
    },
    {
      "id": "c4d57ed4-68a2-4a3e-9ed5-36b6b64f0f05",
      "name": "Padre Burgos",
      "cityCode": "SLE-10",
      "provinceCode": "SLE",
      "createdAt": "2025-10-04T04:07:39.915575Z",
      "updatedAt": "2025-10-04T04:07:39.915575Z",
      "_etag": "\"04000bcd-0000-2400-0000-68e0a06c0000\""
    },
    {
      "id": "5f4ffbf5-ac50-4608-889b-e471b4982f69",
      "name": "Padre Garcia",
      "cityCode": "BTG-20",
      "provinceCode": "BTG",
      "createdAt": "2025-10-04T04:07:39.915589Z",
      "updatedAt": "2025-10-04T04:07:39.915589Z",
      "_etag": "\"0400e8d0-0000-2400-0000-68e0a0900000\""
    },
    {
      "id": "5529b495-f625-410b-936e-9343894c6db4",
      "name": "Paete",
      "cityCode": "LAG-18",
      "provinceCode": "LAG",
      "createdAt": "2025-10-04T04:07:39.915592Z",
      "updatedAt": "2025-10-04T04:07:39.915593Z",
      "_etag": "\"040010d2-0000-2400-0000-68e0a09d0000\""
    },
    {
      "id": "e74b43a2-f649-45e2-8316-aee0740e099d",
      "name": "Pagadian City (Capital)",
      "cityCode": "ZAS-22",
      "provinceCode": "ZAS",
      "createdAt": "2025-10-04T04:07:39.915594Z",
      "updatedAt": "2025-10-04T04:07:39.915594Z",
      "_etag": "\"0400ddd2-0000-2400-0000-68e0a0a40000\""
    },
    {
      "id": "b7f02633-2911-484d-b4bf-39dea4f15c5b",
      "name": "Pagagawan",
      "cityCode": "MAG-22",
      "provinceCode": "MAG",
      "createdAt": "2025-10-04T04:07:39.915584Z",
      "updatedAt": "2025-10-04T04:07:39.915584Z",
      "_etag": "\"0400bece-0000-2400-0000-68e0a07c0000\""
    },
    {
      "id": "9f20f58d-996d-42c4-b8fe-737567762b8c",
      "name": "Pagalungan",
      "cityCode": "MAG-10",
      "provinceCode": "MAG",
      "createdAt": "2025-10-04T04:07:39.915521Z",
      "updatedAt": "2025-10-04T04:07:39.915521Z",
      "_etag": "\"0400accb-0000-2400-0000-68e0a05d0000\""
    },
    {
      "id": "0fbfee4b-b1b4-460b-a7bf-b6ef8ed038ad",
      "name": "Pagayawan (Tatarikan)",
      "cityCode": "LAN-20",
      "provinceCode": "LAN",
      "createdAt": "2025-10-04T04:07:39.915589Z",
      "updatedAt": "2025-10-04T04:07:39.915589Z",
      "_etag": "\"0400bcd0-0000-2400-0000-68e0a08f0000\""
    },
    {
      "id": "f0048404-2acd-4075-a6cb-620271cbe2d8",
      "name": "Pagbilao",
      "cityCode": "QUE-30",
      "provinceCode": "QUE",
      "createdAt": "2025-10-04T04:07:39.915583Z",
      "updatedAt": "2025-10-04T04:07:39.915583Z",
      "_etag": "\"040086ce-0000-2400-0000-68e0a0790000\""
    },
    {
      "id": "4563241d-9f9c-43e6-82b9-1cc2f064da08",
      "name": "Paglat",
      "cityCode": "MAG-23",
      "provinceCode": "MAG",
      "createdAt": "2025-10-04T04:07:39.915592Z",
      "updatedAt": "2025-10-04T04:07:39.915592Z",
      "_etag": "\"0400c8d1-0000-2400-0000-68e0a09a0000\""
    },
    {
      "id": "4505c82d-9fd7-40f3-b26f-c17f08d1febd",
      "name": "Pagsanghan",
      "cityCode": "WSA-26",
      "provinceCode": "WSA",
      "createdAt": "2025-10-04T04:07:39.915595Z",
      "updatedAt": "2025-10-04T04:07:39.915595Z",
      "_etag": "\"040022d3-0000-2400-0000-68e0a0a60000\""
    },
    {
      "id": "841daceb-b3db-40e7-8775-f075be4bdf3a",
      "name": "Pagsanjan",
      "cityCode": "LAG-19",
      "provinceCode": "LAG",
      "createdAt": "2025-10-04T04:07:39.915592Z",
      "updatedAt": "2025-10-04T04:07:39.915592Z",
      "_etag": "\"0400eed1-0000-2400-0000-68e0a09b0000\""
    },
    {
      "id": "f1fe75e0-48f4-4de2-a2d1-8cdd574cb25f",
      "name": "Pagudpud",
      "cityCode": "ILN-15",
      "provinceCode": "ILN",
      "createdAt": "2025-10-04T04:07:39.915522Z",
      "updatedAt": "2025-10-04T04:07:39.915522Z",
      "_etag": "\"0400e4cb-0000-2400-0000-68e0a0600000\""
    },
    {
      "id": "1100574b-7075-4da3-9fb6-ab1f07790537",
      "name": "Pakil",
      "cityCode": "LAG-20",
      "provinceCode": "LAG",
      "createdAt": "2025-10-04T04:07:39.915589Z",
      "updatedAt": "2025-10-04T04:07:39.915589Z",
      "_etag": "\"0400c8d0-0000-2400-0000-68e0a08f0000\""
    },
    {
      "id": "3b0c14c0-64f5-4660-b33f-90a43b651a95",
      "name": "Palanan",
      "cityCode": "ISA-21",
      "provinceCode": "ISA",
      "createdAt": "2025-10-04T04:07:39.915577Z",
      "updatedAt": "2025-10-04T04:07:39.915577Z",
      "_etag": "\"0400efcd-0000-2400-0000-68e0a0740000\""
    },
    {
      "id": "c7865457-3809-4231-aa64-d0db92a45c66",
      "name": "Palanas",
      "cityCode": "MAS-15",
      "provinceCode": "MAS",
      "createdAt": "2025-10-04T04:07:39.915591Z",
      "updatedAt": "2025-10-04T04:07:39.915591Z",
      "_etag": "\"04008dd1-0000-2400-0000-68e0a0970000\""
    },
    {
      "id": "940be06b-085a-41d2-9246-20386a5f7a8f",
      "name": "Palapag",
      "cityCode": "NSA-14",
      "provinceCode": "NSA",
      "createdAt": "2025-10-04T04:07:39.915597Z",
      "updatedAt": "2025-10-04T04:07:39.915597Z",
      "_etag": "\"0400b0d3-0000-2400-0000-68e0a0ac0000\""
    },
    {
      "id": "eaf6bf5f-f070-43b9-b961-06645f4163c7",
      "name": "Palauig",
      "cityCode": "ZAM-08",
      "provinceCode": "ZAM",
      "createdAt": "2025-10-04T04:07:39.915593Z",
      "updatedAt": "2025-10-04T04:07:39.915593Z",
      "_etag": "\"040031d2-0000-2400-0000-68e0a09e0000\""
    },
    {
      "id": "d39311fc-dcbe-4e19-9e93-f9af0afc106a",
      "name": "Palayan City (Capital)",
      "cityCode": "NUE-19",
      "provinceCode": "NUE",
      "createdAt": "2025-10-04T04:07:39.915576Z",
      "updatedAt": "2025-10-04T04:07:39.915576Z",
      "_etag": "\"04006ecd-0000-2400-0000-68e0a06f0000\""
    },
    {
      "id": "68564c56-eb04-4d00-b98b-d3da0ba3e60d",
      "name": "Palimbang",
      "cityCode": "SUK-09",
      "provinceCode": "SUK",
      "createdAt": "2025-10-04T04:07:39.915589Z",
      "updatedAt": "2025-10-04T04:07:39.915589Z",
      "_etag": "\"0400b1d0-0000-2400-0000-68e0a08e0000\""
    },
    {
      "id": "0eb1c4ab-be97-408b-9d94-c30ca8f51181",
      "name": "Palo",
      "cityCode": "LEY-39",
      "provinceCode": "LEY",
      "createdAt": "2025-10-04T04:07:39.915588Z",
      "updatedAt": "2025-10-04T04:07:39.915588Z",
      "_etag": "\"04007cd0-0000-2400-0000-68e0a08c0000\""
    },
    {
      "id": "cc2405c7-9411-41c1-a901-97a2a96a7d3e",
      "name": "Palompon",
      "cityCode": "LEY-40",
      "provinceCode": "LEY",
      "createdAt": "2025-10-04T04:07:39.915591Z",
      "updatedAt": "2025-10-04T04:07:39.915591Z",
      "_etag": "\"040099d1-0000-2400-0000-68e0a0970000\""
    },
    {
      "id": "af5ba797-7de9-4ae9-a536-1e3d4a7e7cf9",
      "name": "Paluan",
      "cityCode": "MNC-07",
      "provinceCode": "MNC",
      "createdAt": "2025-10-04T04:07:39.915595Z",
      "updatedAt": "2025-10-04T04:07:39.915595Z",
      "_etag": "\"04002cd3-0000-2400-0000-68e0a0a70000\""
    },
    {
      "id": "ebd6b410-87e8-47dd-b84a-773761f91e96",
      "name": "Pambujan",
      "cityCode": "NSA-15",
      "provinceCode": "NSA",
      "createdAt": "2025-10-04T04:07:39.915593Z",
      "updatedAt": "2025-10-04T04:07:39.915593Z",
      "_etag": "\"04004ed2-0000-2400-0000-68e0a09f0000\""
    },
    {
      "id": "38ba04ff-6e1a-45cf-b92f-81d51367fc92",
      "name": "Pamplona",
      "cityCode": "NER-16",
      "provinceCode": "NER",
      "createdAt": "2025-10-04T04:07:39.915578Z",
      "updatedAt": "2025-10-04T04:07:39.915578Z",
      "_etag": "\"040022ce-0000-2400-0000-68e0a0760000\""
    },
    {
      "id": "3f9a4e84-ac36-448c-bdb2-d55d9dd86666",
      "name": "Pamplona",
      "cityCode": "CAG-18",
      "provinceCode": "CAG",
      "createdAt": "2025-10-04T04:07:39.915587Z",
      "updatedAt": "2025-10-04T04:07:39.915587Z",
      "_etag": "\"040046d0-0000-2400-0000-68e0a08a0000\""
    },
    {
      "id": "19d5cef4-121c-4b95-b9af-c720f8c05769",
      "name": "Pamplona",
      "cityCode": "CAS-26",
      "provinceCode": "CAS",
      "createdAt": "2025-10-04T04:07:39.915588Z",
      "updatedAt": "2025-10-04T04:07:39.915588Z",
      "_etag": "\"040093d0-0000-2400-0000-68e0a08d0000\""
    },
    {
      "id": "4d3530ba-8370-4c20-a693-9831cb401180",
      "name": "Panaon",
      "cityCode": "MSC-11",
      "provinceCode": "MSC",
      "createdAt": "2025-10-04T04:07:39.915595Z",
      "updatedAt": "2025-10-04T04:07:39.915595Z",
      "_etag": "\"04003dd3-0000-2400-0000-68e0a0a70000\""
    },
    {
      "id": "31e3c7c4-4686-44f7-aba0-c4d6ec6eb1ba",
      "name": "Panay",
      "cityCode": "CAP-09",
      "provinceCode": "CAP",
      "createdAt": "2025-10-04T04:07:39.915594Z",
      "updatedAt": "2025-10-04T04:07:39.915594Z",
      "_etag": "\"04007bd2-0000-2400-0000-68e0a0a00000\""
    },
    {
      "id": "32b3bbba-3f22-4cb0-b46e-43878c7f162e",
      "name": "Pandacan",
      "cityCode": "NCR1-12",
      "provinceCode": "NCR1",
      "createdAt": "2025-10-04T04:07:39.915586Z",
      "updatedAt": "2025-10-04T04:07:39.915586Z",
      "_etag": "\"0400f6cf-0000-2400-0000-68e0a0860000\""
    },
    {
      "id": "3aa1672c-4af9-42c1-a3fa-4c1e9a9de17f",
      "name": "Pandag",
      "cityCode": "MAG-33",
      "provinceCode": "MAG",
      "createdAt": "2025-10-04T04:07:39.915584Z",
      "updatedAt": "2025-10-04T04:07:39.915584Z",
      "_etag": "\"0400ebce-0000-2400-0000-68e0a07d0000\""
    },
    {
      "id": "f5085911-1f24-4ab6-932e-dcca671d1e8e",
      "name": "Pandami",
      "cityCode": "SUL-18",
      "provinceCode": "SUL",
      "createdAt": "2025-10-04T04:07:39.915588Z",
      "updatedAt": "2025-10-04T04:07:39.915588Z",
      "_etag": "\"04005ed0-0000-2400-0000-68e0a08b0000\""
    },
    {
      "id": "4ba25920-4a89-4057-bdd9-da354f507bc2",
      "name": "Pandan",
      "cityCode": "ANT-11",
      "provinceCode": "ANT",
      "createdAt": "2025-10-04T04:07:39.915585Z",
      "updatedAt": "2025-10-04T04:07:39.915585Z",
      "_etag": "\"04007dcf-0000-2400-0000-68e0a0820000\""
    },
    {
      "id": "d5819416-3aaa-4de3-81f3-e7d083b5b216",
      "name": "Pandan",
      "cityCode": "CAT-06",
      "provinceCode": "CAT",
      "createdAt": "2025-10-04T04:07:39.915595Z",
      "updatedAt": "2025-10-04T04:07:39.915595Z",
      "_etag": "\"040048d3-0000-2400-0000-68e0a0a80000\""
    },
    {
      "id": "1e46c17f-a3a1-4d7b-bd08-15bb251d1818",
      "name": "Pandi",
      "cityCode": "BUL-15",
      "provinceCode": "BUL",
      "createdAt": "2025-10-04T04:07:39.915577Z",
      "updatedAt": "2025-10-04T04:07:39.915577Z",
      "_etag": "\"040087cd-0000-2400-0000-68e0a0700000\""
    },
    {
      "id": "2574afe9-329e-48aa-b56f-b3f6a4b5276c",
      "name": "Panganiban",
      "cityCode": "CAT-07",
      "provinceCode": "CAT",
      "createdAt": "2025-10-04T04:07:39.915587Z",
      "updatedAt": "2025-10-04T04:07:39.915587Z",
      "_etag": "\"04003ad0-0000-2400-0000-68e0a08a0000\""
    },
    {
      "id": "8b5c4bbe-21b2-4381-9280-7f00d4049f97",
      "name": "Pangantucan",
      "cityCode": "BUK-16",
      "provinceCode": "BUK",
      "createdAt": "2025-10-04T04:07:39.915596Z",
      "updatedAt": "2025-10-04T04:07:39.915596Z",
      "_etag": "\"04007bd3-0000-2400-0000-68e0a0aa0000\""
    },
    {
      "id": "66dc2a98-bff7-46cf-9aed-e9a2204e37b9",
      "name": "Pangil",
      "cityCode": "LAG-21",
      "provinceCode": "LAG",
      "createdAt": "2025-10-04T04:07:39.915584Z",
      "updatedAt": "2025-10-04T04:07:39.915584Z",
      "_etag": "\"040027cf-0000-2400-0000-68e0a07f0000\""
    },
    {
      "id": "dcbf65ac-12cc-46f7-b077-9928522e1531",
      "name": "Panglao",
      "cityCode": "BOH-33",
      "provinceCode": "BOH",
      "createdAt": "2025-10-04T04:07:39.915577Z",
      "updatedAt": "2025-10-04T04:07:39.915577Z",
      "_etag": "\"0400dfcd-0000-2400-0000-68e0a0730000\""
    },
    {
      "id": "16f706b1-eae9-4015-9f0c-7f77fe200dce",
      "name": "Panglima Estino (New Panamao)",
      "cityCode": "SUL-16",
      "provinceCode": "SUL",
      "createdAt": "2025-10-04T04:07:39.915588Z",
      "updatedAt": "2025-10-04T04:07:39.915588Z",
      "_etag": "\"04006dd0-0000-2400-0000-68e0a08c0000\""
    },
    {
      "id": "06e3a01b-67f4-4c0d-9fca-e07f8c5d9ac5",
      "name": "Panglima Sugala (Balimbing)",
      "cityCode": "TAW-01",
      "provinceCode": "TAW",
      "createdAt": "2025-10-04T04:07:39.915596Z",
      "updatedAt": "2025-10-04T04:07:39.915596Z",
      "_etag": "\"040051d3-0000-2400-0000-68e0a0a80000\""
    },
    {
      "id": "a83cd924-6d37-4781-b23a-84f5e2c15893",
      "name": "Pangutaran",
      "cityCode": "SUL-08",
      "provinceCode": "SUL",
      "createdAt": "2025-10-04T04:07:39.915583Z",
      "updatedAt": "2025-10-04T04:07:39.915583Z",
      "_etag": "\"040094ce-0000-2400-0000-68e0a07a0000\""
    },
    {
      "id": "7d69358d-a60a-4529-aba2-9ca70846562f",
      "name": "Paniqui",
      "cityCode": "TAR-10",
      "provinceCode": "TAR",
      "createdAt": "2025-10-04T04:07:39.915577Z",
      "updatedAt": "2025-10-04T04:07:39.915578Z",
      "_etag": "\"04000ace-0000-2400-0000-68e0a0750000\""
    },
    {
      "id": "0ac965db-579b-4771-af24-995396638fcf",
      "name": "Panitan",
      "cityCode": "CAP-10",
      "provinceCode": "CAP",
      "createdAt": "2025-10-04T04:07:39.915587Z",
      "updatedAt": "2025-10-04T04:07:39.915587Z",
      "_etag": "\"040022d0-0000-2400-0000-68e0a0890000\""
    },
    {
      "id": "aaac46ff-0744-4274-9f2c-6f96be664d29",
      "name": "Pantabangan",
      "cityCode": "NUE-20",
      "provinceCode": "NUE",
      "createdAt": "2025-10-04T04:07:39.915597Z",
      "updatedAt": "2025-10-04T04:07:39.915597Z",
      "_etag": "\"04008fd3-0000-2400-0000-68e0a0ab0000\""
    },
    {
      "id": "4cc79992-65a0-4e51-98d5-5c34f09dda4c",
      "name": "Pantao Ragat",
      "cityCode": "LAN-16",
      "provinceCode": "LAN",
      "createdAt": "2025-10-04T04:07:39.915578Z",
      "updatedAt": "2025-10-04T04:07:39.915578Z",
      "_etag": "\"04002dce-0000-2400-0000-68e0a0760000\""
    },
    {
      "id": "ca771df5-ebc0-4452-9f1e-3ca22a18b128",
      "name": "Pantar",
      "cityCode": "LAN-23",
      "provinceCode": "LAN",
      "createdAt": "2025-10-04T04:07:39.915578Z",
      "updatedAt": "2025-10-04T04:07:39.915578Z",
      "_etag": "\"040037ce-0000-2400-0000-68e0a0770000\""
    },
    {
      "id": "b1f68677-04d0-4163-b338-3b0c0154f349",
      "name": "Pantukan",
      "cityCode": "COM-11",
      "provinceCode": "COM",
      "createdAt": "2025-10-04T04:07:39.915585Z",
      "updatedAt": "2025-10-04T04:07:39.915585Z",
      "_etag": "\"040093cf-0000-2400-0000-68e0a0820000\""
    },
    {
      "id": "76ab44ec-2da0-4007-9245-c17c61292dda",
      "name": "Panukulan",
      "cityCode": "QUE-31",
      "provinceCode": "QUE",
      "createdAt": "2025-10-04T04:07:39.915596Z",
      "updatedAt": "2025-10-04T04:07:39.915596Z",
      "_etag": "\"040088d3-0000-2400-0000-68e0a0aa0000\""
    },
    {
      "id": "577ff72b-9a42-4596-a7d1-361321fc878f",
      "name": "Paoay",
      "cityCode": "ILN-16",
      "provinceCode": "ILN",
      "createdAt": "2025-10-04T04:07:39.915577Z",
      "updatedAt": "2025-10-04T04:07:39.915577Z",
      "_etag": "\"0400a6cd-0000-2400-0000-68e0a0710000\""
    },
    {
      "id": "e431ff24-c46d-4478-bf1e-9593e2ca0ea2",
      "name": "Paombong",
      "cityCode": "BUL-16",
      "provinceCode": "BUL",
      "createdAt": "2025-10-04T04:07:39.915585Z",
      "updatedAt": "2025-10-04T04:07:39.915585Z",
      "_etag": "\"0400a1cf-0000-2400-0000-68e0a0830000\""
    },
    {
      "id": "50773564-9411-4586-9e45-bac6c79466d7",
      "name": "Paracale",
      "cityCode": "CAN-08",
      "provinceCode": "CAN",
      "createdAt": "2025-10-04T04:07:39.915585Z",
      "updatedAt": "2025-10-04T04:07:39.915585Z",
      "_etag": "\"04005dcf-0000-2400-0000-68e0a0800000\""
    },
    {
      "id": "84bbcab8-e611-44cc-8e8f-b5de356c80f3",
      "name": "Paracelis",
      "cityCode": "MOU-06",
      "provinceCode": "MOU",
      "createdAt": "2025-10-04T04:07:39.915606Z",
      "updatedAt": "2025-10-04T04:07:39.915606Z",
      "_etag": "\"040084d5-0000-2400-0000-68e0a0bf0000\""
    },
    {
      "id": "162162ac-09aa-488b-a22f-dec08172a6b6",
      "name": "Paranas (Wright)",
      "cityCode": "WSA-22",
      "provinceCode": "WSA",
      "createdAt": "2025-10-04T04:07:39.915594Z",
      "updatedAt": "2025-10-04T04:07:39.915594Z",
      "_etag": "\"040090d2-0000-2400-0000-68e0a0a10000\""
    },
    {
      "id": "66322962-6c36-47dc-a3bb-cf1c33e76bd2",
      "name": "Parang",
      "cityCode": "MAG-11",
      "provinceCode": "MAG",
      "createdAt": "2025-10-04T04:07:39.915576Z",
      "updatedAt": "2025-10-04T04:07:39.915576Z",
      "_etag": "\"04004ecd-0000-2400-0000-68e0a06e0000\""
    },
    {
      "id": "9b5e010a-fbbc-48a0-90d9-7660ac571593",
      "name": "Parang",
      "cityCode": "SUL-09",
      "provinceCode": "SUL",
      "createdAt": "2025-10-04T04:07:39.915589Z",
      "updatedAt": "2025-10-04T04:07:39.91559Z",
      "_etag": "\"04001bd1-0000-2400-0000-68e0a0920000\""
    },
    {
      "id": "cca19410-7886-4536-ab80-1cf5c638ede7",
      "name": "Pasacao",
      "cityCode": "CAS-27",
      "provinceCode": "CAS",
      "createdAt": "2025-10-04T04:07:39.915577Z",
      "updatedAt": "2025-10-04T04:07:39.915577Z",
      "_etag": "\"0400e8cd-0000-2400-0000-68e0a0730000\""
    },
    {
      "id": "636e5f46-928b-4606-a066-adbc8405d9a1",
      "name": "Pasay City",
      "cityCode": "NCR4-05",
      "provinceCode": "NCR4",
      "createdAt": "2025-10-04T04:07:39.915606Z",
      "updatedAt": "2025-10-04T04:07:39.915606Z",
      "_etag": "\"040073d5-0000-2400-0000-68e0a0bf0000\""
    },
    {
      "id": "e16b1f35-e278-4198-a50b-25e89ab18eda",
      "name": "Pasil",
      "cityCode": "KAL-08",
      "provinceCode": "KAL",
      "createdAt": "2025-10-04T04:07:39.915597Z",
      "updatedAt": "2025-10-04T04:07:39.915597Z",
      "_etag": "\"0400a6d3-0000-2400-0000-68e0a0ac0000\""
    },
    {
      "id": "38e95266-04fc-44b7-b4ee-3ef1ad9bcc5f",
      "name": "Pastrana",
      "cityCode": "LEY-41",
      "provinceCode": "LEY",
      "createdAt": "2025-10-04T04:07:39.915575Z",
      "updatedAt": "2025-10-04T04:07:39.915575Z",
      "_etag": "\"0400bdcc-0000-2400-0000-68e0a0690000\""
    },
    {
      "id": "bd9a3faa-4a19-447d-8563-82d23b48f5ce",
      "name": "Pasuquin",
      "cityCode": "ILN-17",
      "provinceCode": "ILN",
      "createdAt": "2025-10-04T04:07:39.915576Z",
      "updatedAt": "2025-10-04T04:07:39.915576Z",
      "_etag": "\"040065cd-0000-2400-0000-68e0a06f0000\""
    },
    {
      "id": "4f9aa2f8-3bb1-4c98-9b81-eb7d378fd5eb",
      "name": "Pata",
      "cityCode": "SUL-10",
      "provinceCode": "SUL",
      "createdAt": "2025-10-04T04:07:39.915582Z",
      "updatedAt": "2025-10-04T04:07:39.915583Z",
      "_etag": "\"040046ce-0000-2400-0000-68e0a0770000\""
    },
    {
      "id": "26aec7b7-8946-4519-beaf-4ee700afab25",
      "name": "Pateros",
      "cityCode": "NCR4-06",
      "provinceCode": "NCR4",
      "createdAt": "2025-10-04T04:07:39.915522Z",
      "updatedAt": "2025-10-04T04:07:39.915522Z",
      "_etag": "\"04001bcc-0000-2400-0000-68e0a0620000\""
    },
    {
      "id": "1cfdf83b-f3a8-417d-9e1f-57e45c690f26",
      "name": "Patikul",
      "cityCode": "SUL-11",
      "provinceCode": "SUL",
      "createdAt": "2025-10-04T04:07:39.915585Z",
      "updatedAt": "2025-10-04T04:07:39.915585Z",
      "_etag": "\"0400adcf-0000-2400-0000-68e0a0840000\""
    },
    {
      "id": "8e4b32b2-5a3f-4ca9-9ab9-cf45ca91eaee",
      "name": "Patnanungan",
      "cityCode": "QUE-32",
      "provinceCode": "QUE",
      "createdAt": "2025-10-04T04:07:39.915522Z",
      "updatedAt": "2025-10-04T04:07:39.915522Z",
      "_etag": "\"0400eccb-0000-2400-0000-68e0a0600000\""
    },
    {
      "id": "e3bb0f1b-8f59-4a7b-802e-958724e28d14",
      "name": "Patnongon",
      "cityCode": "ANT-12",
      "provinceCode": "ANT",
      "createdAt": "2025-10-04T04:07:39.915585Z",
      "updatedAt": "2025-10-04T04:07:39.915585Z",
      "_etag": "\"04006fcf-0000-2400-0000-68e0a0810000\""
    },
    {
      "id": "5a1034a1-2ef4-4ad4-a3fd-9d4bd3c956b4",
      "name": "Pavia",
      "cityCode": "ILO-36",
      "provinceCode": "ILO",
      "createdAt": "2025-10-04T04:07:39.915593Z",
      "updatedAt": "2025-10-04T04:07:39.915593Z",
      "_etag": "\"040021d2-0000-2400-0000-68e0a09d0000\""
    },
    {
      "id": "93408e35-7c53-4e18-9331-fc6f4629fe54",
      "name": "Payao",
      "cityCode": "ZSI-11",
      "provinceCode": "ZSI",
      "createdAt": "2025-10-04T04:07:39.915592Z",
      "updatedAt": "2025-10-04T04:07:39.915592Z",
      "_etag": "\"0400e4d1-0000-2400-0000-68e0a09b0000\""
    },
    {
      "id": "0b185643-5c5a-4082-8dd0-976f77ccbcc2",
      "name": "Perez",
      "cityCode": "QUE-33",
      "provinceCode": "QUE",
      "createdAt": "2025-10-04T04:07:39.91559Z",
      "updatedAt": "2025-10-04T04:07:39.91559Z",
      "_etag": "\"04004dd1-0000-2400-0000-68e0a0940000\""
    },
    {
      "id": "51391e1b-e89a-4d0f-a50a-81cd23b0014d",
      "name": "Peñablanca",
      "cityCode": "CAG-19",
      "provinceCode": "CAG",
      "createdAt": "2025-10-04T04:07:39.915588Z",
      "updatedAt": "2025-10-04T04:07:39.915588Z",
      "_etag": "\"0400a3d0-0000-2400-0000-68e0a08e0000\""
    },
    {
      "id": "f7dc6344-ea0b-4f65-b870-1a729b767f5c",
      "name": "Peñaranda",
      "cityCode": "NUE-21",
      "provinceCode": "NUE",
      "createdAt": "2025-10-04T04:07:39.915587Z",
      "updatedAt": "2025-10-04T04:07:39.915587Z",
      "_etag": "\"040018d0-0000-2400-0000-68e0a0880000\""
    },
    {
      "id": "f2265c23-e589-47a4-a9d4-2a6f0f33129d",
      "name": "Peñarrubia",
      "cityCode": "ABR-17",
      "provinceCode": "ABR",
      "createdAt": "2025-10-04T04:07:39.915586Z",
      "updatedAt": "2025-10-04T04:07:39.915586Z",
      "_etag": "\"0400e4cf-0000-2400-0000-68e0a0860000\""
    },
    {
      "id": "eb9e4afe-c96e-48c0-ac86-cb254296dd65",
      "name": "Piagapo",
      "cityCode": "LAN-21",
      "provinceCode": "LAN",
      "createdAt": "2025-10-04T04:07:39.915585Z",
      "updatedAt": "2025-10-04T04:07:39.915585Z",
      "_etag": "\"040063cf-0000-2400-0000-68e0a0810000\""
    },
    {
      "id": "1d8d3a8c-13d1-446e-a424-bb11762c2930",
      "name": "Piat",
      "cityCode": "CAG-20",
      "provinceCode": "CAG",
      "createdAt": "2025-10-04T04:07:39.915574Z",
      "updatedAt": "2025-10-04T04:07:39.915575Z",
      "_etag": "\"0400b2cc-0000-2400-0000-68e0a0680000\""
    },
    {
      "id": "a6ae44f0-7d4e-4299-8a56-a75150abd942",
      "name": "Picong (Sultan Gumander)",
      "cityCode": "LAN-35",
      "provinceCode": "LAN",
      "createdAt": "2025-10-04T04:07:39.91552Z",
      "updatedAt": "2025-10-04T04:07:39.91552Z",
      "_etag": "\"04005dcb-0000-2400-0000-68e0a0590000\""
    },
    {
      "id": "6c79d1f8-ddab-47a5-b221-c3e59b8e77ba",
      "name": "Piddig",
      "cityCode": "ILN-18",
      "provinceCode": "ILN",
      "createdAt": "2025-10-04T04:07:39.915584Z",
      "updatedAt": "2025-10-04T04:07:39.915584Z",
      "_etag": "\"04003acf-0000-2400-0000-68e0a07f0000\""
    },
    {
      "id": "a04ab99e-34b7-4cb9-87ac-c65d1e9e86a6",
      "name": "Pidigan",
      "cityCode": "ABR-18",
      "provinceCode": "ABR",
      "createdAt": "2025-10-04T04:07:39.915521Z",
      "updatedAt": "2025-10-04T04:07:39.915521Z",
      "_etag": "\"0400d4cb-0000-2400-0000-68e0a05f0000\""
    },
    {
      "id": "c9b1bba6-1d92-4b46-a7a0-5d0b3f4d2a4d",
      "name": "Pigkawayan",
      "cityCode": "NCO-11",
      "provinceCode": "NCO",
      "createdAt": "2025-10-04T04:07:39.915523Z",
      "updatedAt": "2025-10-04T04:07:39.915523Z",
      "_etag": "\"040067cc-0000-2400-0000-68e0a0650000\""
    },
    {
      "id": "336268f8-4332-464b-92c6-f6cd921f8107",
      "name": "Pikit",
      "cityCode": "NCO-12",
      "provinceCode": "NCO",
      "createdAt": "2025-10-04T04:07:39.915575Z",
      "updatedAt": "2025-10-04T04:07:39.915575Z",
      "_etag": "\"0400f7cc-0000-2400-0000-68e0a06b0000\""
    },
    {
      "id": "8bfb121d-abff-4cb4-8084-cf378cd49478",
      "name": "Pila",
      "cityCode": "LAG-22",
      "provinceCode": "LAG",
      "createdAt": "2025-10-04T04:07:39.915577Z",
      "updatedAt": "2025-10-04T04:07:39.915577Z",
      "_etag": "\"0400cdcd-0000-2400-0000-68e0a0720000\""
    },
    {
      "id": "8a062f52-0c11-4e47-9b77-f5e80b3d13a5",
      "name": "Pilar",
      "cityCode": "BOH-34",
      "provinceCode": "BOH",
      "createdAt": "2025-10-04T04:07:39.915583Z",
      "updatedAt": "2025-10-04T04:07:39.915583Z",
      "_etag": "\"04005ece-0000-2400-0000-68e0a0780000\""
    },
    {
      "id": "4a14b29f-4ce1-470b-a958-7e03037c060d",
      "name": "Pilar",
      "cityCode": "CEB-36",
      "provinceCode": "CEB",
      "createdAt": "2025-10-04T04:07:39.915584Z",
      "updatedAt": "2025-10-04T04:07:39.915585Z",
      "_etag": "\"04004ecf-0000-2400-0000-68e0a0800000\""
    },
    {
      "id": "d8ad6cbd-0d64-496c-b205-da6164e67d5c",
      "name": "Pilar",
      "cityCode": "BAT-11",
      "provinceCode": "BAT",
      "createdAt": "2025-10-04T04:07:39.915586Z",
      "updatedAt": "2025-10-04T04:07:39.915586Z",
      "_etag": "\"0400bdcf-0000-2400-0000-68e0a0840000\""
    },
    {
      "id": "83f843b2-5dde-4cac-87e7-53e84290bb04",
      "name": "Pilar",
      "cityCode": "SOR-13",
      "provinceCode": "SOR",
      "createdAt": "2025-10-04T04:07:39.915587Z",
      "updatedAt": "2025-10-04T04:07:39.915587Z",
      "_etag": "\"04000fd0-0000-2400-0000-68e0a0880000\""
    },
    {
      "id": "850e688c-f599-4d25-972e-021fd7153698",
      "name": "Pilar",
      "cityCode": "CAP-11",
      "provinceCode": "CAP",
      "createdAt": "2025-10-04T04:07:39.915587Z",
      "updatedAt": "2025-10-04T04:07:39.915587Z",
      "_etag": "\"040033d0-0000-2400-0000-68e0a0890000\""
    },
    {
      "id": "3d8e5d68-c5a2-4550-9179-8783847f95e2",
      "name": "Pilar",
      "cityCode": "SUN-16",
      "provinceCode": "SUN",
      "createdAt": "2025-10-04T04:07:39.915589Z",
      "updatedAt": "2025-10-04T04:07:39.915589Z",
      "_etag": "\"0400d5d0-0000-2400-0000-68e0a0900000\""
    },
    {
      "id": "b8afcfc0-5418-432e-8db7-b3f5b704b9fe",
      "name": "Pilar",
      "cityCode": "ABR-19",
      "provinceCode": "ABR",
      "createdAt": "2025-10-04T04:07:39.91559Z",
      "updatedAt": "2025-10-04T04:07:39.91559Z",
      "_etag": "\"040042d1-0000-2400-0000-68e0a0930000\""
    },
    {
      "id": "202cd136-b352-45cb-a6c9-3494b2ae5d8c",
      "name": "Pili (Capital)",
      "cityCode": "CAS-28",
      "provinceCode": "CAS",
      "createdAt": "2025-10-04T04:07:39.91559Z",
      "updatedAt": "2025-10-04T04:07:39.91559Z",
      "_etag": "\"040056d1-0000-2400-0000-68e0a0950000\""
    },
    {
      "id": "6a209ac1-7e9d-4831-afbb-b4999e878759",
      "name": "Pililla",
      "cityCode": "RIZ-10",
      "provinceCode": "RIZ",
      "createdAt": "2025-10-04T04:07:39.915592Z",
      "updatedAt": "2025-10-04T04:07:39.915592Z",
      "_etag": "\"0400d7d1-0000-2400-0000-68e0a09a0000\""
    },
    {
      "id": "1f48802b-9c76-44b3-aa0c-2f6c20907a48",
      "name": "Pinabacdao",
      "cityCode": "WSA-13",
      "provinceCode": "WSA",
      "createdAt": "2025-10-04T04:07:39.915594Z",
      "updatedAt": "2025-10-04T04:07:39.915594Z",
      "_etag": "\"04006ed2-0000-2400-0000-68e0a0a00000\""
    },
    {
      "id": "ab43bdbd-89c9-4fa9-82b4-a921da0f5b1a",
      "name": "Pinamalayan",
      "cityCode": "MNR-09",
      "provinceCode": "MNR",
      "createdAt": "2025-10-04T04:07:39.915595Z",
      "updatedAt": "2025-10-04T04:07:39.915595Z",
      "_etag": "\"040015d3-0000-2400-0000-68e0a0a50000\""
    },
    {
      "id": "648cc366-326c-424d-9482-92afb52cff72",
      "name": "Pinamungahan",
      "cityCode": "CEB-37",
      "provinceCode": "CEB",
      "createdAt": "2025-10-04T04:07:39.915597Z",
      "updatedAt": "2025-10-04T04:07:39.915597Z",
      "_etag": "\"04009ad3-0000-2400-0000-68e0a0ab0000\""
    },
    {
      "id": "f5136961-0065-460d-8930-9af0bb479e5d",
      "name": "Pinili",
      "cityCode": "ILN-19",
      "provinceCode": "ILN",
      "createdAt": "2025-10-04T04:07:39.915597Z",
      "updatedAt": "2025-10-04T04:07:39.915597Z",
      "_etag": "\"0400c1d3-0000-2400-0000-68e0a0ad0000\""
    },
    {
      "id": "7dad69f1-ad10-4af2-8ed7-be287de361d1",
      "name": "Pintuyan",
      "cityCode": "SLE-11",
      "provinceCode": "SLE",
      "createdAt": "2025-10-04T04:07:39.915597Z",
      "updatedAt": "2025-10-04T04:07:39.915597Z",
      "_etag": "\"0400ced3-0000-2400-0000-68e0a0ae0000\""
    },
    {
      "id": "9351ecdb-0f3c-4ade-abc3-21b1acb6d769",
      "name": "Pinukpuk",
      "cityCode": "KAL-09",
      "provinceCode": "KAL",
      "createdAt": "2025-10-04T04:07:39.915597Z",
      "updatedAt": "2025-10-04T04:07:39.915597Z",
      "_etag": "\"0400ecd3-0000-2400-0000-68e0a0af0000\""
    },
    {
      "id": "3d1dfd02-4502-4749-a7b8-399f8aa2fa19",
      "name": "Pio Duran",
      "cityCode": "ALB-13",
      "provinceCode": "ALB",
      "createdAt": "2025-10-04T04:07:39.915598Z",
      "updatedAt": "2025-10-04T04:07:39.915598Z",
      "_etag": "\"0400f7d3-0000-2400-0000-68e0a0af0000\""
    },
    {
      "id": "1276595b-70dd-40dd-8fbb-0a43b3a9e9c9",
      "name": "Pio V. Corpuz (Limbuhan)",
      "cityCode": "MAS-16",
      "provinceCode": "MAS",
      "createdAt": "2025-10-04T04:07:39.915598Z",
      "updatedAt": "2025-10-04T04:07:39.915598Z",
      "_etag": "\"040005d4-0000-2400-0000-68e0a0b00000\""
    },
    {
      "id": "2968709b-206e-4a33-a42b-9368b64550c4",
      "name": "Pitogo",
      "cityCode": "QUE-34",
      "provinceCode": "QUE",
      "createdAt": "2025-10-04T04:07:39.915598Z",
      "updatedAt": "2025-10-04T04:07:39.915598Z",
      "_etag": "\"040018d4-0000-2400-0000-68e0a0b10000\""
    },
    {
      "id": "165ca4f1-c788-44ae-80c2-f2b1c1a7e592",
      "name": "Pitogo",
      "cityCode": "ZAS-38",
      "provinceCode": "ZAS",
      "createdAt": "2025-10-04T04:07:39.915598Z",
      "updatedAt": "2025-10-04T04:07:39.915598Z",
      "_etag": "\"040021d4-0000-2400-0000-68e0a0b10000\""
    },
    {
      "id": "5f67ab9b-f5d7-4c77-940f-b2af9b679bd2",
      "name": "Piñan (New Piñan)",
      "cityCode": "ZAN-09",
      "provinceCode": "ZAN",
      "createdAt": "2025-10-04T04:07:39.915598Z",
      "updatedAt": "2025-10-04T04:07:39.915598Z",
      "_etag": "\"040033d4-0000-2400-0000-68e0a0b20000\""
    },
    {
      "id": "41146e02-e99c-455b-953a-5524c345f035",
      "name": "Placer",
      "cityCode": "MAS-17",
      "provinceCode": "MAS",
      "createdAt": "2025-10-04T04:07:39.915598Z",
      "updatedAt": "2025-10-04T04:07:39.915598Z",
      "_etag": "\"040043d4-0000-2400-0000-68e0a0b20000\""
    },
    {
      "id": "00395f4c-304a-419f-8207-381ccf60b27b",
      "name": "Placer",
      "cityCode": "SUN-17",
      "provinceCode": "SUN",
      "createdAt": "2025-10-04T04:07:39.915598Z",
      "updatedAt": "2025-10-04T04:07:39.915598Z",
      "_etag": "\"040050d4-0000-2400-0000-68e0a0b30000\""
    },
    {
      "id": "9ef1b802-1e21-4153-9744-f91fdbe6dfae",
      "name": "Plaridel",
      "cityCode": "MSC-12",
      "provinceCode": "MSC",
      "createdAt": "2025-10-04T04:07:39.915599Z",
      "updatedAt": "2025-10-04T04:07:39.915599Z",
      "_etag": "\"040061d4-0000-2400-0000-68e0a0b40000\""
    },
    {
      "id": "cab4ea8f-0295-4af9-b8bf-45f71125622c",
      "name": "Plaridel",
      "cityCode": "BUL-17",
      "provinceCode": "BUL",
      "createdAt": "2025-10-04T04:07:39.915599Z",
      "updatedAt": "2025-10-04T04:07:39.915599Z",
      "_etag": "\"040071d4-0000-2400-0000-68e0a0b40000\""
    },
    {
      "id": "2e1eb150-a38e-4b4a-afd6-0265b386560b",
      "name": "Plaridel",
      "cityCode": "QUE-35",
      "provinceCode": "QUE",
      "createdAt": "2025-10-04T04:07:39.915599Z",
      "updatedAt": "2025-10-04T04:07:39.915599Z",
      "_etag": "\"04007ad4-0000-2400-0000-68e0a0b50000\""
    },
    {
      "id": "962aba65-5220-4aaf-adfa-55617dc3d5a8",
      "name": "Pola",
      "cityCode": "MNR-10",
      "provinceCode": "MNR",
      "createdAt": "2025-10-04T04:07:39.915599Z",
      "updatedAt": "2025-10-04T04:07:39.915599Z",
      "_etag": "\"04008ad4-0000-2400-0000-68e0a0b60000\""
    },
    {
      "id": "217db491-764e-4c6a-b423-e0309728a597",
      "name": "Polanco",
      "cityCode": "ZAN-10",
      "provinceCode": "ZAN",
      "createdAt": "2025-10-04T04:07:39.915599Z",
      "updatedAt": "2025-10-04T04:07:39.915599Z",
      "_etag": "\"040094d4-0000-2400-0000-68e0a0b60000\""
    },
    {
      "id": "bcee5ae2-c66d-4a24-bab0-a527196d41db",
      "name": "Polangui",
      "cityCode": "ALB-14",
      "provinceCode": "ALB",
      "createdAt": "2025-10-04T04:07:39.9156Z",
      "updatedAt": "2025-10-04T04:07:39.9156Z",
      "_etag": "\"0400a4d4-0000-2400-0000-68e0a0b70000\""
    },
    {
      "id": "451854e5-778f-4848-ba48-f443da7c6359",
      "name": "Polillo",
      "cityCode": "QUE-36",
      "provinceCode": "QUE",
      "createdAt": "2025-10-04T04:07:39.9156Z",
      "updatedAt": "2025-10-04T04:07:39.9156Z",
      "_etag": "\"0400b3d4-0000-2400-0000-68e0a0b70000\""
    },
    {
      "id": "ee55cf60-fb9c-4bd7-870d-e686536cf934",
      "name": "Polomolok",
      "cityCode": "SCO-12",
      "provinceCode": "SCO",
      "createdAt": "2025-10-04T04:07:39.9156Z",
      "updatedAt": "2025-10-04T04:07:39.9156Z",
      "_etag": "\"0400d3d4-0000-2400-0000-68e0a0b90000\""
    },
    {
      "id": "acba8004-30a1-4d8c-96b1-e6d0840e354c",
      "name": "Pontevedra",
      "cityCode": "CAP-12",
      "provinceCode": "CAP",
      "createdAt": "2025-10-04T04:07:39.9156Z",
      "updatedAt": "2025-10-04T04:07:39.9156Z",
      "_etag": "\"0400dfd4-0000-2400-0000-68e0a0b90000\""
    },
    {
      "id": "03ae0d46-861c-4832-830e-0f01ec44bd6d",
      "name": "Pontevedra",
      "cityCode": "NEC-21",
      "provinceCode": "NEC",
      "createdAt": "2025-10-04T04:07:39.9156Z",
      "updatedAt": "2025-10-04T04:07:39.9156Z",
      "_etag": "\"0400edd4-0000-2400-0000-68e0a0ba0000\""
    },
    {
      "id": "71f49093-4bd9-42bd-a5b1-57c417449de6",
      "name": "Poona Bayabao (Gata)",
      "cityCode": "LAN-22",
      "provinceCode": "LAN",
      "createdAt": "2025-10-04T04:07:39.9156Z",
      "updatedAt": "2025-10-04T04:07:39.9156Z",
      "_etag": "\"0400ffd4-0000-2400-0000-68e0a0bb0000\""
    },
    {
      "id": "0244e6f2-ec20-466f-80e8-fb6ee4bae482",
      "name": "Poona Piagapo",
      "cityCode": "LAN-17",
      "provinceCode": "LAN",
      "createdAt": "2025-10-04T04:07:39.915601Z",
      "updatedAt": "2025-10-04T04:07:39.915601Z",
      "_etag": "\"040012d5-0000-2400-0000-68e0a0bb0000\""
    },
    {
      "id": "f087d58d-945e-4324-a98f-9cbd986e248d",
      "name": "Porac",
      "cityCode": "PAM-15",
      "provinceCode": "PAM",
      "createdAt": "2025-10-04T04:07:39.915605Z",
      "updatedAt": "2025-10-04T04:07:39.915605Z",
      "_etag": "\"040023d5-0000-2400-0000-68e0a0bc0000\""
    },
    {
      "id": "5a184c68-8fdf-4120-84d1-6a4d51d3248e",
      "name": "Poro",
      "cityCode": "CEB-38",
      "provinceCode": "CEB",
      "createdAt": "2025-10-04T04:07:39.915605Z",
      "updatedAt": "2025-10-04T04:07:39.915605Z",
      "_etag": "\"040036d5-0000-2400-0000-68e0a0bd0000\""
    },
    {
      "id": "965ac727-12ee-404e-b8d8-80ed92241887",
      "name": "Port Area",
      "cityCode": "NCR1-13",
      "provinceCode": "NCR1",
      "createdAt": "2025-10-04T04:07:39.915605Z",
      "updatedAt": "2025-10-04T04:07:39.915605Z",
      "_etag": "\"040043d5-0000-2400-0000-68e0a0bd0000\""
    },
    {
      "id": "932cc255-3986-4026-81cf-f5049baead60",
      "name": "Pototan",
      "cityCode": "ILO-37",
      "provinceCode": "ILO",
      "createdAt": "2025-10-04T04:07:39.915605Z",
      "updatedAt": "2025-10-04T04:07:39.915606Z",
      "_etag": "\"040051d5-0000-2400-0000-68e0a0be0000\""
    },
    {
      "id": "1cca5bb2-583a-4c07-b170-58780931812e",
      "name": "Pozorrubio",
      "cityCode": "PAN-30",
      "provinceCode": "PAN",
      "createdAt": "2025-10-04T04:07:39.915606Z",
      "updatedAt": "2025-10-04T04:07:39.915606Z",
      "_etag": "\"04005cd5-0000-2400-0000-68e0a0be0000\""
    },
    {
      "id": "f97588ab-5c3d-49ea-8ee0-c81636f70932",
      "name": "Pres. Carlos P. Garcia (Pitogo)",
      "cityCode": "BOH-35",
      "provinceCode": "BOH",
      "createdAt": "2025-10-04T04:07:39.915606Z",
      "updatedAt": "2025-10-04T04:07:39.915606Z",
      "_etag": "\"04008ed5-0000-2400-0000-68e0a0c00000\""
    },
    {
      "id": "2f8eff69-06cf-4e7b-8754-483615495641",
      "name": "Pres. Manuel A. Roxas",
      "cityCode": "ZAN-11",
      "provinceCode": "ZAN",
      "createdAt": "2025-10-04T04:07:39.915607Z",
      "updatedAt": "2025-10-04T04:07:39.915607Z",
      "_etag": "\"040093d5-0000-2400-0000-68e0a0c00000\""
    },
    {
      "id": "4ea6b035-8874-4e7d-a382-bd64bea27aec",
      "name": "Presentacion (Parubcan)",
      "cityCode": "CAS-29",
      "provinceCode": "CAS",
      "createdAt": "2025-10-04T04:07:39.915607Z",
      "updatedAt": "2025-10-04T04:07:39.915607Z",
      "_etag": "\"04009ed5-0000-2400-0000-68e0a0c10000\""
    },
    {
      "id": "1434fd0d-41b2-4280-a3f2-8981ad5a9d53",
      "name": "President Quirino",
      "cityCode": "SUK-10",
      "provinceCode": "SUK",
      "createdAt": "2025-10-04T04:07:39.915607Z",
      "updatedAt": "2025-10-04T04:07:39.915607Z",
      "_etag": "\"0400a7d5-0000-2400-0000-68e0a0c20000\""
    },
    {
      "id": "b0e10d3e-aaa2-4836-abd4-1ccdac79e4f3",
      "name": "President Roxas",
      "cityCode": "CAP-13",
      "provinceCode": "CAP",
      "createdAt": "2025-10-04T04:07:39.915607Z",
      "updatedAt": "2025-10-04T04:07:39.915607Z",
      "_etag": "\"0400c2d5-0000-2400-0000-68e0a0c20000\""
    },
    {
      "id": "cab13f21-b6cf-4598-b307-b86995384ba5",
      "name": "President Roxas",
      "cityCode": "NCO-13",
      "provinceCode": "NCO",
      "createdAt": "2025-10-04T04:07:39.915607Z",
      "updatedAt": "2025-10-04T04:07:39.915607Z",
      "_etag": "\"0400cbd5-0000-2400-0000-68e0a0c30000\""
    },
    {
      "id": "fd563c94-ef43-44f8-b306-7616494248a9",
      "name": "Prieto Diaz",
      "cityCode": "SOR-14",
      "provinceCode": "SOR",
      "createdAt": "2025-10-04T04:07:39.915607Z",
      "updatedAt": "2025-10-04T04:07:39.915607Z",
      "_etag": "\"0400dcd5-0000-2400-0000-68e0a0c30000\""
    },
    {
      "id": "6691dc26-2d3f-48c1-9593-7a5f404e1660",
      "name": "Prosperidad (Capital)",
      "cityCode": "AGS-06",
      "provinceCode": "AGS",
      "createdAt": "2025-10-04T04:07:39.915607Z",
      "updatedAt": "2025-10-04T04:07:39.915607Z",
      "_etag": "\"0400f0d5-0000-2400-0000-68e0a0c40000\""
    },
    {
      "id": "28dfff66-068d-4f61-86f2-f71513b8d419",
      "name": "Pualas",
      "cityCode": "LAN-23",
      "provinceCode": "LAN",
      "createdAt": "2025-10-04T04:07:39.915607Z",
      "updatedAt": "2025-10-04T04:07:39.915608Z",
      "_etag": "\"040002d6-0000-2400-0000-68e0a0c50000\""
    },
    {
      "id": "9c4f62de-e95c-4142-addc-8d27bef25d27",
      "name": "Pudtol",
      "cityCode": "APA-06",
      "provinceCode": "APA",
      "createdAt": "2025-10-04T04:07:39.915608Z",
      "updatedAt": "2025-10-04T04:07:39.915608Z",
      "_etag": "\"040011d6-0000-2400-0000-68e0a0c50000\""
    },
    {
      "id": "111eb9cc-182e-4ddb-a0fd-8a418d713aed",
      "name": "Puerto Galera",
      "cityCode": "MNR-11",
      "provinceCode": "MNR",
      "createdAt": "2025-10-04T04:07:39.915608Z",
      "updatedAt": "2025-10-04T04:07:39.915608Z",
      "_etag": "\"040020d6-0000-2400-0000-68e0a0c60000\""
    },
    {
      "id": "dfd7a0bc-fb46-49b5-abb0-4384a8da1934",
      "name": "Puerto Princesa City (Capital)",
      "cityCode": "PAL-16",
      "provinceCode": "PAL",
      "createdAt": "2025-10-04T04:07:39.915608Z",
      "updatedAt": "2025-10-04T04:07:39.915608Z",
      "_etag": "\"04002fd6-0000-2400-0000-68e0a0c60000\""
    },
    {
      "id": "dc7a7289-e5de-44b6-b81d-f0c5efa28547",
      "name": "Pugo",
      "cityCode": "LAU-12",
      "provinceCode": "LAU",
      "createdAt": "2025-10-04T04:07:39.915608Z",
      "updatedAt": "2025-10-04T04:07:39.915608Z",
      "_etag": "\"040036d6-0000-2400-0000-68e0a0c70000\""
    },
    {
      "id": "8f7ea595-918a-4630-a3a3-327ade83c6db",
      "name": "Pulilan",
      "cityCode": "BUL-18",
      "provinceCode": "BUL",
      "createdAt": "2025-10-04T04:07:39.915609Z",
      "updatedAt": "2025-10-04T04:07:39.915609Z",
      "_etag": "\"040040d6-0000-2400-0000-68e0a0c70000\""
    },
    {
      "id": "ddc5fa7d-4da9-4f05-bf61-b9320be06124",
      "name": "Pulupandan",
      "cityCode": "NEC-22",
      "provinceCode": "NEC",
      "createdAt": "2025-10-04T04:07:39.915609Z",
      "updatedAt": "2025-10-04T04:07:39.915609Z",
      "_etag": "\"04004ad6-0000-2400-0000-68e0a0c80000\""
    },
    {
      "id": "3fe1b779-b670-498a-97f1-034e614e5189",
      "name": "Pura",
      "cityCode": "TAR-11",
      "provinceCode": "TAR",
      "createdAt": "2025-10-04T04:07:39.915609Z",
      "updatedAt": "2025-10-04T04:07:39.915609Z",
      "_etag": "\"040059d6-0000-2400-0000-68e0a0c80000\""
    },
    {
      "id": "da6e77d0-e3bc-4ecc-8d0c-4412b47c15fc",
      "name": "Quezon",
      "cityCode": "BUK-17",
      "provinceCode": "BUK",
      "createdAt": "2025-10-04T04:07:39.915609Z",
      "updatedAt": "2025-10-04T04:07:39.915609Z",
      "_etag": "\"040068d6-0000-2400-0000-68e0a0c90000\""
    },
    {
      "id": "499d8905-3ca0-4b0e-b710-daa2c382d1f6",
      "name": "Quezon",
      "cityCode": "ISA-22",
      "provinceCode": "ISA",
      "createdAt": "2025-10-04T04:07:39.915609Z",
      "updatedAt": "2025-10-04T04:07:39.915609Z",
      "_etag": "\"040081d6-0000-2400-0000-68e0a0c90000\""
    },
    {
      "id": "7fa74460-dc6e-468b-abb8-9e55f025f0b6",
      "name": "Quezon",
      "cityCode": "NUV-11",
      "provinceCode": "NUV",
      "createdAt": "2025-10-04T04:07:39.915609Z",
      "updatedAt": "2025-10-04T04:07:39.915609Z",
      "_etag": "\"04008bd6-0000-2400-0000-68e0a0ca0000\""
    },
    {
      "id": "6b864a3f-6556-49b6-a9d1-0a8cf202f1f4",
      "name": "Quezon",
      "cityCode": "NUE-22",
      "provinceCode": "NUE",
      "createdAt": "2025-10-04T04:07:39.915609Z",
      "updatedAt": "2025-10-04T04:07:39.915609Z",
      "_etag": "\"0400aad6-0000-2400-0000-68e0a0cb0000\""
    },
    {
      "id": "df5e24ca-14ab-4d01-aad0-87c21caf8ba5",
      "name": "Quezon",
      "cityCode": "QUE-37",
      "provinceCode": "QUE",
      "createdAt": "2025-10-04T04:07:39.91561Z",
      "updatedAt": "2025-10-04T04:07:39.91561Z",
      "_etag": "\"0400b7d6-0000-2400-0000-68e0a0cb0000\""
    },
    {
      "id": "475dcb0e-6dfa-4e6e-a98d-0957cf3e7482",
      "name": "Quezon",
      "cityCode": "PAL-17",
      "provinceCode": "PAL",
      "createdAt": "2025-10-04T04:07:39.91561Z",
      "updatedAt": "2025-10-04T04:07:39.91561Z",
      "_etag": "\"0400c9d6-0000-2400-0000-68e0a0cc0000\""
    },
    {
      "id": "a86bb2da-7685-4ca4-9a24-3aaca0a37c55",
      "name": "Quezon City",
      "cityCode": "NCR2-04",
      "provinceCode": "NCR2",
      "createdAt": "2025-10-04T04:07:39.91561Z",
      "updatedAt": "2025-10-04T04:07:39.91561Z",
      "_etag": "\"0400d6d6-0000-2400-0000-68e0a0cc0000\""
    },
    {
      "id": "639c3a52-dcd6-4ecc-8c2b-c0886b176109",
      "name": "Quiapo",
      "cityCode": "NCR1-03",
      "provinceCode": "NCR1",
      "createdAt": "2025-10-04T04:07:39.91561Z",
      "updatedAt": "2025-10-04T04:07:39.91561Z",
      "_etag": "\"0400e1d6-0000-2400-0000-68e0a0cd0000\""
    },
    {
      "id": "ba2515a6-da3d-4e4d-bfef-34cfbf91cc89",
      "name": "Quinapondan",
      "cityCode": "EAS-18",
      "provinceCode": "EAS",
      "createdAt": "2025-10-04T04:07:39.91561Z",
      "updatedAt": "2025-10-04T04:07:39.91561Z",
      "_etag": "\"0400eed6-0000-2400-0000-68e0a0cd0000\""
    },
    {
      "id": "73f0b0ee-599d-48da-a683-a1f1c054f4de",
      "name": "Quirino",
      "cityCode": "ISA-23",
      "provinceCode": "ISA",
      "createdAt": "2025-10-04T04:07:39.91561Z",
      "updatedAt": "2025-10-04T04:07:39.91561Z",
      "_etag": "\"0400fcd6-0000-2400-0000-68e0a0ce0000\""
    },
    {
      "id": "257eb43d-b12f-4b7e-9025-40a1132c5db7",
      "name": "Quirino (Angkaki)",
      "cityCode": "ILS-15",
      "provinceCode": "ILS",
      "createdAt": "2025-10-04T04:07:39.91561Z",
      "updatedAt": "2025-10-04T04:07:39.91561Z",
      "_etag": "\"040000d7-0000-2400-0000-68e0a0ce0000\""
    },
    {
      "id": "8d2d1ea8-40df-4249-88c2-820bb31f5633",
      "name": "Ragay",
      "cityCode": "CAS-30",
      "provinceCode": "CAS",
      "createdAt": "2025-10-04T04:07:39.91561Z",
      "updatedAt": "2025-10-04T04:07:39.915611Z",
      "_etag": "\"040017d7-0000-2400-0000-68e0a0cf0000\""
    },
    {
      "id": "d4733f66-12f4-4837-99a9-3fd4c08e7e95",
      "name": "Rajah Buayan",
      "cityCode": "MAG-29",
      "provinceCode": "MAG",
      "createdAt": "2025-10-04T04:07:39.915611Z",
      "updatedAt": "2025-10-04T04:07:39.915611Z",
      "_etag": "\"040029d7-0000-2400-0000-68e0a0d00000\""
    },
    {
      "id": "086b958b-e865-45ba-a927-87551cc0f483",
      "name": "Ramon",
      "cityCode": "ISA-24",
      "provinceCode": "ISA",
      "createdAt": "2025-10-04T04:07:39.915611Z",
      "updatedAt": "2025-10-04T04:07:39.915611Z",
      "_etag": "\"04003cd7-0000-2400-0000-68e0a0d00000\""
    },
    {
      "id": "8abdb317-f8b6-47b9-952e-b0b2283b51b6",
      "name": "Ramon Magsaysay (Liargo)",
      "cityCode": "ZAS-23",
      "provinceCode": "ZAS",
      "createdAt": "2025-10-04T04:07:39.915611Z",
      "updatedAt": "2025-10-04T04:07:39.915611Z",
      "_etag": "\"04004ed7-0000-2400-0000-68e0a0d10000\""
    },
    {
      "id": "e15de8f0-5df1-442d-a48c-e98697bdc277",
      "name": "Ramos",
      "cityCode": "TAR-12",
      "provinceCode": "TAR",
      "createdAt": "2025-10-04T04:07:39.915611Z",
      "updatedAt": "2025-10-04T04:07:39.915611Z",
      "_etag": "\"040058d7-0000-2400-0000-68e0a0d10000\""
    },
    {
      "id": "f62691e2-fbd2-4891-9e49-cc3b95ab4539",
      "name": "Rapu-rapu",
      "cityCode": "ALB-15",
      "provinceCode": "ALB",
      "createdAt": "2025-10-04T04:07:39.915612Z",
      "updatedAt": "2025-10-04T04:07:39.915612Z",
      "_etag": "\"040065d7-0000-2400-0000-68e0a0d20000\""
    },
    {
      "id": "11733264-9ad4-4e39-87d5-cfe9eb34f4fa",
      "name": "Real",
      "cityCode": "QUE-38",
      "provinceCode": "QUE",
      "createdAt": "2025-10-04T04:07:39.915612Z",
      "updatedAt": "2025-10-04T04:07:39.915612Z",
      "_etag": "\"040070d7-0000-2400-0000-68e0a0d20000\""
    },
    {
      "id": "3ad19ee1-1451-4325-8aaf-75282adfcf71",
      "name": "Reina Mercedes",
      "cityCode": "ISA-25",
      "provinceCode": "ISA",
      "createdAt": "2025-10-04T04:07:39.915612Z",
      "updatedAt": "2025-10-04T04:07:39.915612Z",
      "_etag": "\"040080d7-0000-2400-0000-68e0a0d30000\""
    },
    {
      "id": "ef98cddd-e411-4f91-a2a8-c58bfdd5aaca",
      "name": "Remedios T. Romualdez",
      "cityCode": "AGN-12",
      "provinceCode": "AGN",
      "createdAt": "2025-10-04T04:07:39.915612Z",
      "updatedAt": "2025-10-04T04:07:39.915612Z",
      "_etag": "\"040084d7-0000-2400-0000-68e0a0d40000\""
    },
    {
      "id": "d35b7e01-c8f0-4765-b4a0-0e848e907af7",
      "name": "Rizal",
      "cityCode": "CAG-21",
      "provinceCode": "CAG",
      "createdAt": "2025-10-04T04:07:39.915612Z",
      "updatedAt": "2025-10-04T04:07:39.915612Z",
      "_etag": "\"04008bd7-0000-2400-0000-68e0a0d40000\""
    },
    {
      "id": "d0900ebc-5871-4a9c-8c38-221296136108",
      "name": "Rizal",
      "cityCode": "NUE-23",
      "provinceCode": "NUE",
      "createdAt": "2025-10-04T04:07:39.915612Z",
      "updatedAt": "2025-10-04T04:07:39.915612Z",
      "_etag": "\"040096d7-0000-2400-0000-68e0a0d50000\""
    },
    {
      "id": "20342a2b-393d-4ffc-b564-2faa192b6f1a",
      "name": "Rizal",
      "cityCode": "LAG-23",
      "provinceCode": "LAG",
      "createdAt": "2025-10-04T04:07:39.915612Z",
      "updatedAt": "2025-10-04T04:07:39.915612Z",
      "_etag": "\"0400a7d7-0000-2400-0000-68e0a0d50000\""
    },
    {
      "id": "3ad3b8c3-2ff4-4a7f-8949-c999c867cbf5",
      "name": "Rizal",
      "cityCode": "MNC-08",
      "provinceCode": "MNC",
      "createdAt": "2025-10-04T04:07:39.915612Z",
      "updatedAt": "2025-10-04T04:07:39.915613Z",
      "_etag": "\"0400b5d7-0000-2400-0000-68e0a0d60000\""
    },
    {
      "id": "08aac03f-63e4-49dd-ba6f-435aa4b4fc5c",
      "name": "Rizal",
      "cityCode": "ZAN-12",
      "provinceCode": "ZAN",
      "createdAt": "2025-10-04T04:07:39.915613Z",
      "updatedAt": "2025-10-04T04:07:39.915613Z",
      "_etag": "\"0400bbd7-0000-2400-0000-68e0a0d60000\""
    },
    {
      "id": "7766aaf3-a100-4439-b566-bdb46344a10b",
      "name": "Rizal (Liwan)",
      "cityCode": "KAL-11",
      "provinceCode": "KAL",
      "createdAt": "2025-10-04T04:07:39.915613Z",
      "updatedAt": "2025-10-04T04:07:39.915613Z",
      "_etag": "\"0400c5d7-0000-2400-0000-68e0a0d70000\""
    },
    {
      "id": "748180d9-ed16-49df-a792-2537af2d0a45",
      "name": "Rizal (Marcos)",
      "cityCode": "PAL-23",
      "provinceCode": "PAL",
      "createdAt": "2025-10-04T04:07:39.915613Z",
      "updatedAt": "2025-10-04T04:07:39.915613Z",
      "_etag": "\"0400d4d7-0000-2400-0000-68e0a0d70000\""
    },
    {
      "id": "b7cf125d-d858-49d7-8add-d67cdc8eec41",
      "name": "Rodriguez (Montalban)",
      "cityCode": "RIZ-08",
      "provinceCode": "RIZ",
      "createdAt": "2025-10-04T04:07:39.915613Z",
      "updatedAt": "2025-10-04T04:07:39.915613Z",
      "_etag": "\"0400e2d7-0000-2400-0000-68e0a0d80000\""
    },
    {
      "id": "47d5eac7-9e3c-46d6-b896-98a929895a50",
      "name": "Romblon (Capital)",
      "cityCode": "ROM-10",
      "provinceCode": "ROM",
      "createdAt": "2025-10-04T04:07:39.915613Z",
      "updatedAt": "2025-10-04T04:07:39.915614Z",
      "_etag": "\"0400f6d7-0000-2400-0000-68e0a0d90000\""
    },
    {
      "id": "8c320b9a-295c-4e61-b96a-0f20b519f38d",
      "name": "Ronda",
      "cityCode": "CEB-39",
      "provinceCode": "CEB",
      "createdAt": "2025-10-04T04:07:39.915613Z",
      "updatedAt": "2025-10-04T04:07:39.915613Z",
      "_etag": "\"0400efd7-0000-2400-0000-68e0a0d80000\""
    },
    {
      "id": "7ec79ca5-1fc4-40b6-bdb1-e49ea8e7ef30",
      "name": "Rosales",
      "cityCode": "PAN-31",
      "provinceCode": "PAN",
      "createdAt": "2025-10-04T04:07:39.915614Z",
      "updatedAt": "2025-10-04T04:07:39.915614Z",
      "_etag": "\"0400fed7-0000-2400-0000-68e0a0da0000\""
    },
    {
      "id": "e1be12d5-d814-42db-aede-41778fe62b2b",
      "name": "Rosario",
      "cityCode": "LAU-13",
      "provinceCode": "LAU",
      "createdAt": "2025-10-04T04:07:39.915614Z",
      "updatedAt": "2025-10-04T04:07:39.915614Z",
      "_etag": "\"04000dd8-0000-2400-0000-68e0a0da0000\""
    },
    {
      "id": "59d9d29b-5db8-4024-bab8-5a53c3c6129c",
      "name": "Rosario",
      "cityCode": "CAV-17",
      "provinceCode": "CAV",
      "createdAt": "2025-10-04T04:07:39.915614Z",
      "updatedAt": "2025-10-04T04:07:39.915614Z",
      "_etag": "\"04002ed8-0000-2400-0000-68e0a0db0000\""
    },
    {
      "id": "80e7be83-9221-4f7b-8eaf-6654d524e691",
      "name": "Rosario",
      "cityCode": "BTG-21",
      "provinceCode": "BTG",
      "createdAt": "2025-10-04T04:07:39.915614Z",
      "updatedAt": "2025-10-04T04:07:39.915614Z",
      "_etag": "\"040044d8-0000-2400-0000-68e0a0db0000\""
    },
    {
      "id": "8fe29fe9-956e-4022-b175-e096692a8d57",
      "name": "Rosario",
      "cityCode": "NSA-16",
      "provinceCode": "NSA",
      "createdAt": "2025-10-04T04:07:39.915614Z",
      "updatedAt": "2025-10-04T04:07:39.915614Z",
      "_etag": "\"040055d8-0000-2400-0000-68e0a0dc0000\""
    },
    {
      "id": "6975939d-5ef1-4a36-bd1e-0a81b76541fa",
      "name": "Rosario",
      "cityCode": "AGS-07",
      "provinceCode": "AGS",
      "createdAt": "2025-10-04T04:07:39.915614Z",
      "updatedAt": "2025-10-04T04:07:39.915615Z",
      "_etag": "\"04005bd8-0000-2400-0000-68e0a0dc0000\""
    },
    {
      "id": "e483d103-1ced-43a0-a58e-eaa4bace5830",
      "name": "Roseller Lim",
      "cityCode": "ZSI-12",
      "provinceCode": "ZSI",
      "createdAt": "2025-10-04T04:07:39.915615Z",
      "updatedAt": "2025-10-04T04:07:39.915615Z",
      "_etag": "\"04006ad8-0000-2400-0000-68e0a0dd0000\""
    },
    {
      "id": "e4c9d40d-5f6a-4450-9947-8c6f58f094f1",
      "name": "Roxas",
      "cityCode": "ISA-26",
      "provinceCode": "ISA",
      "createdAt": "2025-10-04T04:07:39.915615Z",
      "updatedAt": "2025-10-04T04:07:39.915615Z",
      "_etag": "\"040080d8-0000-2400-0000-68e0a0de0000\""
    },
    {
      "id": "331dab4e-b270-4013-9e96-c232b893b281",
      "name": "Roxas",
      "cityCode": "MNR-12",
      "provinceCode": "MNR",
      "createdAt": "2025-10-04T04:07:39.915615Z",
      "updatedAt": "2025-10-04T04:07:39.915615Z",
      "_etag": "\"040094d8-0000-2400-0000-68e0a0df0000\""
    },
    {
      "id": "92e87d7f-c74c-4a62-b4a4-64649f79783d",
      "name": "Roxas",
      "cityCode": "PAL-18",
      "provinceCode": "PAL",
      "createdAt": "2025-10-04T04:07:39.915615Z",
      "updatedAt": "2025-10-04T04:07:39.915615Z",
      "_etag": "\"0400a9d8-0000-2400-0000-68e0a0df0000\""
    },
    {
      "id": "1c45e0f6-92fc-4aae-b642-93be22b9de47",
      "name": "Roxas City (Capital)",
      "cityCode": "CAP-14",
      "provinceCode": "CAP",
      "createdAt": "2025-10-04T04:07:39.915615Z",
      "updatedAt": "2025-10-04T04:07:39.915615Z",
      "_etag": "\"0400bbd8-0000-2400-0000-68e0a0e00000\""
    },
    {
      "id": "c611a284-cd17-4b14-bd0c-2d243e2841fd",
      "name": "Sabangan",
      "cityCode": "MOU-07",
      "provinceCode": "MOU",
      "createdAt": "2025-10-04T04:07:39.915615Z",
      "updatedAt": "2025-10-04T04:07:39.915615Z",
      "_etag": "\"0400c9d8-0000-2400-0000-68e0a0e10000\""
    },
    {
      "id": "71914585-b3d9-4d67-80aa-a6d1154605b5",
      "name": "Sablan",
      "cityCode": "BEN-12",
      "provinceCode": "BEN",
      "createdAt": "2025-10-04T04:07:39.915615Z",
      "updatedAt": "2025-10-04T04:07:39.915615Z",
      "_etag": "\"0400dbd8-0000-2400-0000-68e0a0e10000\""
    },
    {
      "id": "813b717a-869b-4164-890f-43430c82a3ea",
      "name": "Sablayan",
      "cityCode": "MNC-09",
      "provinceCode": "MNC",
      "createdAt": "2025-10-04T04:07:39.915616Z",
      "updatedAt": "2025-10-04T04:07:39.915616Z",
      "_etag": "\"0400ebd8-0000-2400-0000-68e0a0e20000\""
    },
    {
      "id": "f055b73c-b8e8-4089-9bcb-d3ab558f4ce4",
      "name": "Sabtang",
      "cityCode": "BTN-05",
      "provinceCode": "BTN",
      "createdAt": "2025-10-04T04:07:39.915616Z",
      "updatedAt": "2025-10-04T04:07:39.915616Z",
      "_etag": "\"0400f8d8-0000-2400-0000-68e0a0e20000\""
    },
    {
      "id": "32568169-c620-409e-8df7-eb2c46cbf204",
      "name": "Sadanga",
      "cityCode": "MOU-08",
      "provinceCode": "MOU",
      "createdAt": "2025-10-04T04:07:39.915616Z",
      "updatedAt": "2025-10-04T04:07:39.915616Z",
      "_etag": "\"04000fd9-0000-2400-0000-68e0a0e30000\""
    },
    {
      "id": "f0f71414-6e46-4995-9761-8f64e600785f",
      "name": "Sagada",
      "cityCode": "MOU-09",
      "provinceCode": "MOU",
      "createdAt": "2025-10-04T04:07:39.915616Z",
      "updatedAt": "2025-10-04T04:07:39.915616Z",
      "_etag": "\"040027d9-0000-2400-0000-68e0a0e40000\""
    },
    {
      "id": "3fcf0f24-bd7e-47af-bdf8-35bf69b23cdc",
      "name": "Sagay",
      "cityCode": "CAM-05",
      "provinceCode": "CAM",
      "createdAt": "2025-10-04T04:07:39.915616Z",
      "updatedAt": "2025-10-04T04:07:39.915616Z",
      "_etag": "\"040035d9-0000-2400-0000-68e0a0e40000\""
    },
    {
      "id": "040898ff-753d-4a69-9317-8eec24b933e5",
      "name": "Sagay City",
      "cityCode": "NEC-23",
      "provinceCode": "NEC",
      "createdAt": "2025-10-04T04:07:39.915617Z",
      "updatedAt": "2025-10-04T04:07:39.915617Z",
      "_etag": "\"040049d9-0000-2400-0000-68e0a0e50000\""
    },
    {
      "id": "54a1785a-4433-4797-b239-d6b492c190ef",
      "name": "Sagbayan (Borja)",
      "cityCode": "BOH-36",
      "provinceCode": "BOH",
      "createdAt": "2025-10-04T04:07:39.915617Z",
      "updatedAt": "2025-10-04T04:07:39.915617Z",
      "_etag": "\"040053d9-0000-2400-0000-68e0a0e60000\""
    },
    {
      "id": "44e7438f-6dea-42f1-8c38-63319fab2dcb",
      "name": "Saguday",
      "cityCode": "QUI-05",
      "provinceCode": "QUI",
      "createdAt": "2025-10-04T04:07:39.915617Z",
      "updatedAt": "2025-10-04T04:07:39.915617Z",
      "_etag": "\"040065d9-0000-2400-0000-68e0a0e60000\""
    },
    {
      "id": "594e3549-1ca5-4cd5-85c3-ebec53a1bd41",
      "name": "Saguiaran",
      "cityCode": "LAN-25",
      "provinceCode": "LAN",
      "createdAt": "2025-10-04T04:07:39.915617Z",
      "updatedAt": "2025-10-04T04:07:39.915617Z",
      "_etag": "\"040076d9-0000-2400-0000-68e0a0e70000\""
    },
    {
      "id": "274a3c64-e158-4fd7-825d-6510c3220378",
      "name": "Sagñay",
      "cityCode": "CAS-31",
      "provinceCode": "CAS",
      "createdAt": "2025-10-04T04:07:39.915617Z",
      "updatedAt": "2025-10-04T04:07:39.915617Z",
      "_etag": "\"040089d9-0000-2400-0000-68e0a0e80000\""
    },
    {
      "id": "6eee81ee-f877-4661-94f4-5793f4b6e302",
      "name": "Saint Bernard",
      "cityCode": "SLE-12",
      "provinceCode": "SLE",
      "createdAt": "2025-10-04T04:07:39.915617Z",
      "updatedAt": "2025-10-04T04:07:39.915617Z",
      "_etag": "\"04008fd9-0000-2400-0000-68e0a0e80000\""
    },
    {
      "id": "cf1408fa-c394-4b3c-8562-db43c03cefe4",
      "name": "Salay",
      "cityCode": "MSR-22",
      "provinceCode": "MSR",
      "createdAt": "2025-10-04T04:07:39.915617Z",
      "updatedAt": "2025-10-04T04:07:39.915617Z",
      "_etag": "\"0400a2d9-0000-2400-0000-68e0a0e90000\""
    },
    {
      "id": "0fb8cf76-f18d-4072-b1e9-bd154692e0d6",
      "name": "Salcedo",
      "cityCode": "EAS-19",
      "provinceCode": "EAS",
      "createdAt": "2025-10-04T04:07:39.915618Z",
      "updatedAt": "2025-10-04T04:07:39.915618Z",
      "_etag": "\"0400d0d9-0000-2400-0000-68e0a0eb0000\""
    },
    {
      "id": "a78806c4-e980-4eae-860b-fd0d877a7cc6",
      "name": "Salcedo (Baugen)",
      "cityCode": "ILS-16",
      "provinceCode": "ILS",
      "createdAt": "2025-10-04T04:07:39.915618Z",
      "updatedAt": "2025-10-04T04:07:39.915618Z",
      "_etag": "\"0400ded9-0000-2400-0000-68e0a0eb0000\""
    },
    {
      "id": "17e84799-0b70-40b1-b9e4-b0e01c623b18",
      "name": "Sallapadan",
      "cityCode": "ABR-20",
      "provinceCode": "ABR",
      "createdAt": "2025-10-04T04:07:39.915618Z",
      "updatedAt": "2025-10-04T04:07:39.915618Z",
      "_etag": "\"0400f2d9-0000-2400-0000-68e0a0eb0000\""
    },
    {
      "id": "1fd8f009-cd72-48b5-bc18-b59e9836d9bb",
      "name": "Salug",
      "cityCode": "ZAN-13",
      "provinceCode": "ZAN",
      "createdAt": "2025-10-04T04:07:39.915618Z",
      "updatedAt": "2025-10-04T04:07:39.915618Z",
      "_etag": "\"04000bda-0000-2400-0000-68e0a0ed0000\""
    },
    {
      "id": "3251cec9-12a8-43b6-bc8a-01b38c787bbe",
      "name": "Salvador",
      "cityCode": "LAN-18",
      "provinceCode": "LAN",
      "createdAt": "2025-10-04T04:07:39.915618Z",
      "updatedAt": "2025-10-04T04:07:39.915618Z",
      "_etag": "\"040016da-0000-2400-0000-68e0a0ed0000\""
    },
    {
      "id": "5721ea7a-34a5-49a5-82c4-5104cf78fd22",
      "name": "Salvador Benedicto",
      "cityCode": "NEC-32",
      "provinceCode": "NEC",
      "createdAt": "2025-10-04T04:07:39.915618Z",
      "updatedAt": "2025-10-04T04:07:39.915618Z",
      "_etag": "\"040028da-0000-2400-0000-68e0a0ee0000\""
    },
    {
      "id": "d3b0c35f-3b44-40a0-ab27-943853d871b7",
      "name": "Samal",
      "cityCode": "BAT-12",
      "provinceCode": "BAT",
      "createdAt": "2025-10-04T04:07:39.915618Z",
      "updatedAt": "2025-10-04T04:07:39.915618Z",
      "_etag": "\"04003bda-0000-2400-0000-68e0a0ee0000\""
    },
    {
      "id": "5fc3e077-65fd-40b3-98bf-824ec6bb2127",
      "name": "Samboan",
      "cityCode": "CEB-40",
      "provinceCode": "CEB",
      "createdAt": "2025-10-04T04:07:39.915619Z",
      "updatedAt": "2025-10-04T04:07:39.915619Z",
      "_etag": "\"04004eda-0000-2400-0000-68e0a0ef0000\""
    },
    {
      "id": "600fbde9-4abb-4548-b6fb-cccc9252d3e3",
      "name": "Sampaloc",
      "cityCode": "QUE-39",
      "provinceCode": "QUE",
      "createdAt": "2025-10-04T04:07:39.915619Z",
      "updatedAt": "2025-10-04T04:07:39.915619Z",
      "_etag": "\"040058da-0000-2400-0000-68e0a0f00000\""
    },
    {
      "id": "20b7bd31-f2b8-4c92-a741-03cfef5ecf6c",
      "name": "Sampaloc",
      "cityCode": "NCR1-06",
      "provinceCode": "NCR1",
      "createdAt": "2025-10-04T04:07:39.915619Z",
      "updatedAt": "2025-10-04T04:07:39.915619Z",
      "_etag": "\"040067da-0000-2400-0000-68e0a0f00000\""
    },
    {
      "id": "c86fc856-38bc-4ba6-b7e4-97309a66f558",
      "name": "San Agustin",
      "cityCode": "ISA-27",
      "provinceCode": "ISA",
      "createdAt": "2025-10-04T04:07:39.915619Z",
      "updatedAt": "2025-10-04T04:07:39.915619Z",
      "_etag": "\"04007bda-0000-2400-0000-68e0a0f10000\""
    },
    {
      "id": "79a882d8-ba80-4614-b1ac-eda418edd6ae",
      "name": "San Agustin",
      "cityCode": "ROM-11",
      "provinceCode": "ROM",
      "createdAt": "2025-10-04T04:07:39.915619Z",
      "updatedAt": "2025-10-04T04:07:39.915619Z",
      "_etag": "\"040098da-0000-2400-0000-68e0a0f20000\""
    },
    {
      "id": "2ae355aa-7722-49b5-b2ac-ead7d69e6baa",
      "name": "San Agustin",
      "cityCode": "SUR-15",
      "provinceCode": "SUR",
      "createdAt": "2025-10-04T04:07:39.91562Z",
      "updatedAt": "2025-10-04T04:07:39.91562Z",
      "_etag": "\"0400aada-0000-2400-0000-68e0a0f20000\""
    },
    {
      "id": "c062dfbb-1b3a-426c-a5b3-a9506a286731",
      "name": "San Andres",
      "cityCode": "QUE-40",
      "provinceCode": "QUE",
      "createdAt": "2025-10-04T04:07:39.91562Z",
      "updatedAt": "2025-10-04T04:07:39.91562Z",
      "_etag": "\"0400bbda-0000-2400-0000-68e0a0f30000\""
    },
    {
      "id": "c95fea54-3fcf-4bfa-8953-9ad9589b9821",
      "name": "San Andres",
      "cityCode": "ROM-12",
      "provinceCode": "ROM",
      "createdAt": "2025-10-04T04:07:39.91562Z",
      "updatedAt": "2025-10-04T04:07:39.91562Z",
      "_etag": "\"0400c6da-0000-2400-0000-68e0a0f40000\""
    },
    {
      "id": "d2c27e8f-0699-4813-99b7-10df885ef4c2",
      "name": "San Andres",
      "cityCode": "CAT-08",
      "provinceCode": "CAT",
      "createdAt": "2025-10-04T04:07:39.91562Z",
      "updatedAt": "2025-10-04T04:07:39.91562Z",
      "_etag": "\"0400d9da-0000-2400-0000-68e0a0f50000\""
    },
    {
      "id": "1ed751ff-e3f6-4911-97cd-5cbd2a8008be",
      "name": "San Antonio",
      "cityCode": "NUE-24",
      "provinceCode": "NUE",
      "createdAt": "2025-10-04T04:07:39.91562Z",
      "updatedAt": "2025-10-04T04:07:39.91562Z",
      "_etag": "\"0400f0da-0000-2400-0000-68e0a0f50000\""
    },
    {
      "id": "5b7f7888-4481-4bda-aebf-7f3b8dac4b29",
      "name": "San Antonio",
      "cityCode": "ZAM-09",
      "provinceCode": "ZAM",
      "createdAt": "2025-10-04T04:07:39.91562Z",
      "updatedAt": "2025-10-04T04:07:39.91562Z",
      "_etag": "\"04000bdb-0000-2400-0000-68e0a0f60000\""
    },
    {
      "id": "962d09cc-03dd-4d5a-bc3b-ff348971e8d6",
      "name": "San Antonio",
      "cityCode": "QUE-41",
      "provinceCode": "QUE",
      "createdAt": "2025-10-04T04:07:39.91562Z",
      "updatedAt": "2025-10-04T04:07:39.91562Z",
      "_etag": "\"040023db-0000-2400-0000-68e0a0f70000\""
    },
    {
      "id": "ec39a40b-27f7-432d-94cf-45d65d1fa2f9",
      "name": "San Antonio",
      "cityCode": "NSA-17",
      "provinceCode": "NSA",
      "createdAt": "2025-10-04T04:07:39.91562Z",
      "updatedAt": "2025-10-04T04:07:39.91562Z",
      "_etag": "\"04003adb-0000-2400-0000-68e0a0f80000\""
    },
    {
      "id": "b64ac7fc-6a8d-4538-aa92-77422bf90005",
      "name": "San Benito",
      "cityCode": "SUN-18",
      "provinceCode": "SUN",
      "createdAt": "2025-10-04T04:07:39.915621Z",
      "updatedAt": "2025-10-04T04:07:39.915621Z",
      "_etag": "\"04006edb-0000-2400-0000-68e0a0f90000\""
    },
    {
      "id": "bb8ecd95-d8bd-427d-a47b-484f2785bcaa",
      "name": "San Carlos City",
      "cityCode": "PAN-32",
      "provinceCode": "PAN",
      "createdAt": "2025-10-04T04:07:39.915621Z",
      "updatedAt": "2025-10-04T04:07:39.915621Z",
      "_etag": "\"040046db-0000-2400-0000-68e0a0f80000\""
    },
    {
      "id": "40eb2f0d-bc42-40fe-bbdc-d8e4bf158623",
      "name": "San Carlos City",
      "cityCode": "NEC-24",
      "provinceCode": "NEC",
      "createdAt": "2025-10-04T04:07:39.915621Z",
      "updatedAt": "2025-10-04T04:07:39.915621Z",
      "_etag": "\"040060db-0000-2400-0000-68e0a0f90000\""
    },
    {
      "id": "d3b97a06-a867-4361-a4b8-1b7774e97842",
      "name": "San Clemente",
      "cityCode": "TAR-13",
      "provinceCode": "TAR",
      "createdAt": "2025-10-04T04:07:39.915621Z",
      "updatedAt": "2025-10-04T04:07:39.915621Z",
      "_etag": "\"04007bdb-0000-2400-0000-68e0a0fa0000\""
    },
    {
      "id": "308fbaa1-da92-4784-b91b-00714b1f6bcc",
      "name": "San Dionisio",
      "cityCode": "ILO-38",
      "provinceCode": "ILO",
      "createdAt": "2025-10-04T04:07:39.915621Z",
      "updatedAt": "2025-10-04T04:07:39.915622Z",
      "_etag": "\"04008cdb-0000-2400-0000-68e0a0fb0000\""
    },
    {
      "id": "557a603b-ce85-4a13-9ae0-5d134c3dfe2a",
      "name": "San Emilio",
      "cityCode": "ILS-17",
      "provinceCode": "ILS",
      "createdAt": "2025-10-04T04:07:39.915622Z",
      "updatedAt": "2025-10-04T04:07:39.915622Z",
      "_etag": "\"04009cdb-0000-2400-0000-68e0a0fb0000\""
    },
    {
      "id": "b68e7bcf-267a-4d6d-8938-45734cbb4c61",
      "name": "San Enrique",
      "cityCode": "ILO-39",
      "provinceCode": "ILO",
      "createdAt": "2025-10-04T04:07:39.915622Z",
      "updatedAt": "2025-10-04T04:07:39.915622Z",
      "_etag": "\"0400acdb-0000-2400-0000-68e0a0fc0000\""
    },
    {
      "id": "a35cd863-cef2-481e-b34b-bde4ef117e69",
      "name": "San Enrique",
      "cityCode": "NEC-25",
      "provinceCode": "NEC",
      "createdAt": "2025-10-04T04:07:39.915622Z",
      "updatedAt": "2025-10-04T04:07:39.915622Z",
      "_etag": "\"0400bbdb-0000-2400-0000-68e0a0fd0000\""
    },
    {
      "id": "9e9f5b2e-3a70-4e2f-8096-9a40ffded159",
      "name": "San Esteban",
      "cityCode": "ILS-18",
      "provinceCode": "ILS",
      "createdAt": "2025-10-04T04:07:39.915622Z",
      "updatedAt": "2025-10-04T04:07:39.915622Z",
      "_etag": "\"0400cddb-0000-2400-0000-68e0a0fd0000\""
    },
    {
      "id": "0d6ef410-574c-4b32-8bcd-e87e72cf811e",
      "name": "San Fabian",
      "cityCode": "PAN-33",
      "provinceCode": "PAN",
      "createdAt": "2025-10-04T04:07:39.915622Z",
      "updatedAt": "2025-10-04T04:07:39.915622Z",
      "_etag": "\"0400dbdb-0000-2400-0000-68e0a0fe0000\""
    },
    {
      "id": "11876354-9d7f-457c-8a37-c4c5ebbf473c",
      "name": "San Felipe",
      "cityCode": "ZAM-10",
      "provinceCode": "ZAM",
      "createdAt": "2025-10-04T04:07:39.915622Z",
      "updatedAt": "2025-10-04T04:07:39.915622Z",
      "_etag": "\"0400eedb-0000-2400-0000-68e0a0fe0000\""
    },
    {
      "id": "14be679a-814c-4f42-bdac-61f52929b639",
      "name": "San Fernando",
      "cityCode": "BUK-18",
      "provinceCode": "BUK",
      "createdAt": "2025-10-04T04:07:39.915622Z",
      "updatedAt": "2025-10-04T04:07:39.915622Z",
      "_etag": "\"0400f4db-0000-2400-0000-68e0a0ff0000\""
    },
    {
      "id": "2dfb8264-3a34-4f3c-a652-4cd902813969",
      "name": "San Fernando",
      "cityCode": "CEB-41",
      "provinceCode": "CEB",
      "createdAt": "2025-10-04T04:07:39.915623Z",
      "updatedAt": "2025-10-04T04:07:39.915623Z",
      "_etag": "\"0400fddb-0000-2400-0000-68e0a0ff0000\""
    },
    {
      "id": "0d795e30-df02-4035-9c80-2593be7d57eb",
      "name": "San Fernando",
      "cityCode": "ROM-13",
      "provinceCode": "ROM",
      "createdAt": "2025-10-04T04:07:39.915623Z",
      "updatedAt": "2025-10-04T04:07:39.915623Z",
      "_etag": "\"040007dc-0000-2400-0000-68e0a1000000\""
    },
    {
      "id": "38fcb0e2-328c-47d9-90df-15f91b03ceec",
      "name": "San Fernando",
      "cityCode": "CAS-32",
      "provinceCode": "CAS",
      "createdAt": "2025-10-04T04:07:39.915623Z",
      "updatedAt": "2025-10-04T04:07:39.915623Z",
      "_etag": "\"040015dc-0000-2400-0000-68e0a1000000\""
    },
    {
      "id": "c8ec08d7-f25b-4cc9-a6ff-0bfb7e959fbb",
      "name": "San Fernando",
      "cityCode": "MAS-18",
      "provinceCode": "MAS",
      "createdAt": "2025-10-04T04:07:39.915628Z",
      "updatedAt": "2025-10-04T04:07:39.915628Z",
      "_etag": "\"040051dc-0000-2400-0000-68e0a1020000\""
    },
    {
      "id": "059b5c8a-724c-4bf4-bb06-d6e4fcd2850b",
      "name": "San Francisco",
      "cityCode": "SLE-13",
      "provinceCode": "SLE",
      "createdAt": "2025-10-04T04:07:39.915628Z",
      "updatedAt": "2025-10-04T04:07:39.915628Z",
      "_etag": "\"040029dc-0000-2400-0000-68e0a1010000\""
    },
    {
      "id": "70c3aa14-e254-4813-89f5-51a85499a20e",
      "name": "San Francisco",
      "cityCode": "AGS-08",
      "provinceCode": "AGS",
      "createdAt": "2025-10-04T04:07:39.915628Z",
      "updatedAt": "2025-10-04T04:07:39.915628Z",
      "_etag": "\"040034dc-0000-2400-0000-68e0a1010000\""
    },
    {
      "id": "75e6a7cf-52bc-46ab-b7e7-620c6dee2d62",
      "name": "San Francisco",
      "cityCode": "CEB-42",
      "provinceCode": "CEB",
      "createdAt": "2025-10-04T04:07:39.915628Z",
      "updatedAt": "2025-10-04T04:07:39.915628Z",
      "_etag": "\"040061dc-0000-2400-0000-68e0a1030000\""
    },
    {
      "id": "30e09af2-69e8-4466-b03a-6f443b40fb3e",
      "name": "San Francisco (Anao-aon)",
      "cityCode": "SUN-19",
      "provinceCode": "SUN",
      "createdAt": "2025-10-04T04:07:39.915629Z",
      "updatedAt": "2025-10-04T04:07:39.915629Z",
      "_etag": "\"040088dc-0000-2400-0000-68e0a1040000\""
    },
    {
      "id": "fd61673f-e869-4fb3-9959-4d8fda2c75c7",
      "name": "San Francisco (Aurora)",
      "cityCode": "QUE-42",
      "provinceCode": "QUE",
      "createdAt": "2025-10-04T04:07:39.915628Z",
      "updatedAt": "2025-10-04T04:07:39.915628Z",
      "_etag": "\"040071dc-0000-2400-0000-68e0a1030000\""
    },
    {
      "id": "09a9cb45-9024-44c5-b3b3-1fd29e201186",
      "name": "San Gabriel",
      "cityCode": "LAU-15",
      "provinceCode": "LAU",
      "createdAt": "2025-10-04T04:07:39.915629Z",
      "updatedAt": "2025-10-04T04:07:39.915629Z",
      "_etag": "\"040097dc-0000-2400-0000-68e0a1050000\""
    },
    {
      "id": "a2fff349-f7ee-4186-b7bc-84edccaa5c13",
      "name": "San Guillermo",
      "cityCode": "ISA-28",
      "provinceCode": "ISA",
      "createdAt": "2025-10-04T04:07:39.915629Z",
      "updatedAt": "2025-10-04T04:07:39.915629Z",
      "_etag": "\"0400a8dc-0000-2400-0000-68e0a1050000\""
    },
    {
      "id": "a08752d7-66bf-4b40-947b-49ad4e5afbaf",
      "name": "San Ildefonso",
      "cityCode": "ILS-19",
      "provinceCode": "ILS",
      "createdAt": "2025-10-04T04:07:39.915629Z",
      "updatedAt": "2025-10-04T04:07:39.915629Z",
      "_etag": "\"0400badc-0000-2400-0000-68e0a1060000\""
    },
    {
      "id": "b4996054-182e-4fe1-9ec7-8bfd7e35ee53",
      "name": "San Ildefonso",
      "cityCode": "BUL-19",
      "provinceCode": "BUL",
      "createdAt": "2025-10-04T04:07:39.915629Z",
      "updatedAt": "2025-10-04T04:07:39.915629Z",
      "_etag": "\"0400ccdc-0000-2400-0000-68e0a1060000\""
    },
    {
      "id": "e545b804-da9a-418b-a196-5038f073e26d",
      "name": "San Isidro",
      "cityCode": "BOH-37",
      "provinceCode": "BOH",
      "createdAt": "2025-10-04T04:07:39.915629Z",
      "updatedAt": "2025-10-04T04:07:39.915629Z",
      "_etag": "\"0400d4dc-0000-2400-0000-68e0a1070000\""
    },
    {
      "id": "786f2ba1-01ad-4583-9287-59d372bec4e8",
      "name": "San Isidro",
      "cityCode": "ISA-29",
      "provinceCode": "ISA",
      "createdAt": "2025-10-04T04:07:39.915629Z",
      "updatedAt": "2025-10-04T04:07:39.915629Z",
      "_etag": "\"0400dfdc-0000-2400-0000-68e0a1070000\""
    },
    {
      "id": "0c6885af-dc59-4742-9d7d-c637bc90bcd6",
      "name": "San Isidro",
      "cityCode": "NUE-25",
      "provinceCode": "NUE",
      "createdAt": "2025-10-04T04:07:39.91563Z",
      "updatedAt": "2025-10-04T04:07:39.91563Z",
      "_etag": "\"0400f3dc-0000-2400-0000-68e0a1080000\""
    },
    {
      "id": "f5ee98b8-2878-467e-a7d5-cead21d19ace",
      "name": "San Isidro",
      "cityCode": "LEY-42",
      "provinceCode": "LEY",
      "createdAt": "2025-10-04T04:07:39.91563Z",
      "updatedAt": "2025-10-04T04:07:39.91563Z",
      "_etag": "\"040005dd-0000-2400-0000-68e0a1090000\""
    },
    {
      "id": "960ef829-e0a5-4331-90a9-a8cec1580262",
      "name": "San Isidro",
      "cityCode": "NSA-18",
      "provinceCode": "NSA",
      "createdAt": "2025-10-04T04:07:39.91563Z",
      "updatedAt": "2025-10-04T04:07:39.91563Z",
      "_etag": "\"040015dd-0000-2400-0000-68e0a1090000\""
    },
    {
      "id": "bb01a775-f3ae-4f7d-a90f-b933428590a1",
      "name": "San Isidro",
      "cityCode": "DAN-24",
      "provinceCode": "DAN",
      "createdAt": "2025-10-04T04:07:39.91563Z",
      "updatedAt": "2025-10-04T04:07:39.91563Z",
      "_etag": "\"04002add-0000-2400-0000-68e0a10a0000\""
    },
    {
      "id": "755ecba2-762a-4eee-a725-a8a6c05e7ee7",
      "name": "San Isidro",
      "cityCode": "ABR-21",
      "provinceCode": "ABR",
      "createdAt": "2025-10-04T04:07:39.91563Z",
      "updatedAt": "2025-10-04T04:07:39.91563Z",
      "_etag": "\"04003edd-0000-2400-0000-68e0a10a0000\""
    },
    {
      "id": "f293c79f-a663-49da-929e-814f9bbeaaed",
      "name": "San Isidro",
      "cityCode": "DAR-10",
      "provinceCode": "DAR",
      "createdAt": "2025-10-04T04:07:39.91563Z",
      "updatedAt": "2025-10-04T04:07:39.915631Z",
      "_etag": "\"040068dd-0000-2400-0000-68e0a10c0000\""
    },
    {
      "id": "2aefe7c9-910b-4824-b3d6-570dc5d834a9",
      "name": "San Isidro",
      "cityCode": "SUN-20",
      "provinceCode": "SUN",
      "createdAt": "2025-10-04T04:07:39.915631Z",
      "updatedAt": "2025-10-04T04:07:39.915631Z",
      "_etag": "\"040071dd-0000-2400-0000-68e0a10d0000\""
    },
    {
      "id": "07b0ccdd-b8c7-4c5f-94a0-4c02e8869c4a",
      "name": "San Jacinto",
      "cityCode": "PAN-34",
      "provinceCode": "PAN",
      "createdAt": "2025-10-04T04:07:39.915631Z",
      "updatedAt": "2025-10-04T04:07:39.915631Z",
      "_etag": "\"04007add-0000-2400-0000-68e0a10d0000\""
    },
    {
      "id": "f4ddf91f-6c45-46ce-88a9-1c3e07e388ac",
      "name": "San Jacinto",
      "cityCode": "MAS-19",
      "provinceCode": "MAS",
      "createdAt": "2025-10-04T04:07:39.915631Z",
      "updatedAt": "2025-10-04T04:07:39.915631Z",
      "_etag": "\"040089dd-0000-2400-0000-68e0a10e0000\""
    },
    {
      "id": "627213b2-5229-41b2-819d-ce7235c560d1",
      "name": "San Joaquin",
      "cityCode": "ILO-40",
      "provinceCode": "ILO",
      "createdAt": "2025-10-04T04:07:39.91563Z",
      "updatedAt": "2025-10-04T04:07:39.91563Z",
      "_etag": "\"040050dd-0000-2400-0000-68e0a10b0000\""
    },
    {
      "id": "f7ffb5fc-1e71-4b07-98f4-fc47c151dac5",
      "name": "San Jorge",
      "cityCode": "WSA-25",
      "provinceCode": "WSA",
      "createdAt": "2025-10-04T04:07:39.915631Z",
      "updatedAt": "2025-10-04T04:07:39.915631Z",
      "_etag": "\"04009cdd-0000-2400-0000-68e0a10f0000\""
    },
    {
      "id": "72d41b91-f733-4546-9f1f-ee1945e41b7d",
      "name": "San Jose",
      "cityCode": "NER-17",
      "provinceCode": "NER",
      "createdAt": "2025-10-04T04:07:39.91563Z",
      "updatedAt": "2025-10-04T04:07:39.91563Z",
      "_etag": "\"04005cdd-0000-2400-0000-68e0a10c0000\""
    },
    {
      "id": "e26e98b6-929c-4121-9799-cdc6824c2053",
      "name": "San Jose",
      "cityCode": "BTG-22",
      "provinceCode": "BTG",
      "createdAt": "2025-10-04T04:07:39.915632Z",
      "updatedAt": "2025-10-04T04:07:39.915632Z",
      "_etag": "\"0400a4dd-0000-2400-0000-68e0a10f0000\""
    },
    {
      "id": "fa1988e8-d492-4416-b950-e8780157687b",
      "name": "San Jose",
      "cityCode": "TAR-18",
      "provinceCode": "TAR",
      "createdAt": "2025-10-04T04:07:39.915632Z",
      "updatedAt": "2025-10-04T04:07:39.915632Z",
      "_etag": "\"0400b3dd-0000-2400-0000-68e0a1100000\""
    },
    {
      "id": "9a95fe8d-94d3-43bb-9c3f-e3ca93462680",
      "name": "San Jose",
      "cityCode": "MNC-10",
      "provinceCode": "MNC",
      "createdAt": "2025-10-04T04:07:39.915632Z",
      "updatedAt": "2025-10-04T04:07:39.915632Z",
      "_etag": "\"0400c5dd-0000-2400-0000-68e0a1110000\""
    },
    {
      "id": "766b95df-ad05-4397-bfe2-57ad1648c0e2",
      "name": "San Jose",
      "cityCode": "ROM-14",
      "provinceCode": "ROM",
      "createdAt": "2025-10-04T04:07:39.915632Z",
      "updatedAt": "2025-10-04T04:07:39.915632Z",
      "_etag": "\"0400dbdd-0000-2400-0000-68e0a1110000\""
    },
    {
      "id": "2f5666a8-bc82-4c15-94eb-f6fd88d2fd75",
      "name": "San Jose",
      "cityCode": "CAS-33",
      "provinceCode": "CAS",
      "createdAt": "2025-10-04T04:07:39.915632Z",
      "updatedAt": "2025-10-04T04:07:39.915632Z",
      "_etag": "\"0400eedd-0000-2400-0000-68e0a1120000\""
    },
    {
      "id": "a2a27dbf-8503-4f4a-b6e1-71a6cf041016",
      "name": "San Jose",
      "cityCode": "NSA-19",
      "provinceCode": "NSA",
      "createdAt": "2025-10-04T04:07:39.915632Z",
      "updatedAt": "2025-10-04T04:07:39.915632Z",
      "_etag": "\"0400fedd-0000-2400-0000-68e0a1120000\""
    },
    {
      "id": "ade61865-e104-4e79-8b51-44e607150387",
      "name": "San Jose (Capital)",
      "cityCode": "ANT-13",
      "provinceCode": "ANT",
      "createdAt": "2025-10-04T04:07:39.915632Z",
      "updatedAt": "2025-10-04T04:07:39.915632Z",
      "_etag": "\"040007de-0000-2400-0000-68e0a1130000\""
    },
    {
      "id": "2990b03d-d983-4a20-81a2-02d3bc2bfdc3",
      "name": "San Jose (Capital)",
      "cityCode": "DIN-06",
      "provinceCode": "DIN",
      "createdAt": "2025-10-04T04:07:39.915633Z",
      "updatedAt": "2025-10-04T04:07:39.915633Z",
      "_etag": "\"04001bde-0000-2400-0000-68e0a1140000\""
    },
    {
      "id": "aa3ab271-4710-47ce-8bbc-0909fffedc9c",
      "name": "San Jose City",
      "cityCode": "NUE-26",
      "provinceCode": "NUE",
      "createdAt": "2025-10-04T04:07:39.915633Z",
      "updatedAt": "2025-10-04T04:07:39.915633Z",
      "_etag": "\"04002fde-0000-2400-0000-68e0a1140000\""
    },
    {
      "id": "4058ecc7-5fa0-4054-a395-54ae491fdf1b",
      "name": "San Jose De Buan",
      "cityCode": "WSA-14",
      "provinceCode": "WSA",
      "createdAt": "2025-10-04T04:07:39.915633Z",
      "updatedAt": "2025-10-04T04:07:39.915633Z",
      "_etag": "\"040048de-0000-2400-0000-68e0a1150000\""
    },
    {
      "id": "074aefb9-8d9b-4a15-854f-35541adc8c6d",
      "name": "San Juan",
      "cityCode": "SIQ-05",
      "provinceCode": "SIQ",
      "createdAt": "2025-10-04T04:07:39.915633Z",
      "updatedAt": "2025-10-04T04:07:39.915633Z",
      "_etag": "\"040055de-0000-2400-0000-68e0a1160000\""
    },
    {
      "id": "56ab2dca-d69a-40aa-873e-a6429466d915",
      "name": "San Juan",
      "cityCode": "LAU-16",
      "provinceCode": "LAU",
      "createdAt": "2025-10-04T04:07:39.915633Z",
      "updatedAt": "2025-10-04T04:07:39.915633Z",
      "_etag": "\"040077de-0000-2400-0000-68e0a1170000\""
    },
    {
      "id": "f8a5c0c6-d13d-4cf6-b8fa-79ef067f9faa",
      "name": "San Juan",
      "cityCode": "BTG-23",
      "provinceCode": "BTG",
      "createdAt": "2025-10-04T04:07:39.915633Z",
      "updatedAt": "2025-10-04T04:07:39.915634Z",
      "_etag": "\"040095de-0000-2400-0000-68e0a1170000\""
    },
    {
      "id": "415186cb-31ad-48a4-9cbb-80641c1676df",
      "name": "San Juan",
      "cityCode": "ABR-22",
      "provinceCode": "ABR",
      "createdAt": "2025-10-04T04:07:39.915634Z",
      "updatedAt": "2025-10-04T04:07:39.915634Z",
      "_etag": "\"0400a1de-0000-2400-0000-68e0a1180000\""
    },
    {
      "id": "9298205d-01aa-4a9d-9fcf-e3e318e28575",
      "name": "San Juan (Cabalian)",
      "cityCode": "SLE-14",
      "provinceCode": "SLE",
      "createdAt": "2025-10-04T04:07:39.915634Z",
      "updatedAt": "2025-10-04T04:07:39.915634Z",
      "_etag": "\"0400b2de-0000-2400-0000-68e0a1190000\""
    },
    {
      "id": "717d64d1-e02d-4db3-9974-b0708440db16",
      "name": "San Juan (Lapog)",
      "cityCode": "ILS-20",
      "provinceCode": "ILS",
      "createdAt": "2025-10-04T04:07:39.915634Z",
      "updatedAt": "2025-10-04T04:07:39.915634Z",
      "_etag": "\"0400bfde-0000-2400-0000-68e0a1190000\""
    },
    {
      "id": "fdbbaecc-a131-49e0-8bf9-682d118c8d7a",
      "name": "San Julian",
      "cityCode": "EAS-20",
      "provinceCode": "EAS",
      "createdAt": "2025-10-04T04:07:39.915634Z",
      "updatedAt": "2025-10-04T04:07:39.915634Z",
      "_etag": "\"0400c6de-0000-2400-0000-68e0a11a0000\""
    },
    {
      "id": "3a73a53a-9a95-4b10-9c2e-7d281bedbb13",
      "name": "San Leonardo",
      "cityCode": "NUE-27",
      "provinceCode": "NUE",
      "createdAt": "2025-10-04T04:07:39.915634Z",
      "updatedAt": "2025-10-04T04:07:39.915634Z",
      "_etag": "\"0400cdde-0000-2400-0000-68e0a11a0000\""
    },
    {
      "id": "c1d02016-a9f4-45bb-8a22-8a0064a29526",
      "name": "San Lorenzo",
      "cityCode": "GUI-04",
      "provinceCode": "GUI",
      "createdAt": "2025-10-04T04:07:39.915634Z",
      "updatedAt": "2025-10-04T04:07:39.915634Z",
      "_etag": "\"0400dade-0000-2400-0000-68e0a11b0000\""
    },
    {
      "id": "d3bb4cac-e6b1-4fb9-aa2d-e2f3529eaf41",
      "name": "San Lorenzo Ruiz (Imelda)",
      "cityCode": "CAN-04",
      "provinceCode": "CAN",
      "createdAt": "2025-10-04T04:07:39.915634Z",
      "updatedAt": "2025-10-04T04:07:39.915635Z",
      "_etag": "\"0400e7de-0000-2400-0000-68e0a11b0000\""
    },
    {
      "id": "385f1e15-7063-419e-981c-e19ebb59c039",
      "name": "San Luis",
      "cityCode": "AUR-08",
      "provinceCode": "AUR",
      "createdAt": "2025-10-04T04:07:39.915635Z",
      "updatedAt": "2025-10-04T04:07:39.915635Z",
      "_etag": "\"0400efde-0000-2400-0000-68e0a11c0000\""
    },
    {
      "id": "45b17a85-c53f-43c5-99a2-b6dfbec88f84",
      "name": "San Luis",
      "cityCode": "PAM-17",
      "provinceCode": "PAM",
      "createdAt": "2025-10-04T04:07:39.915635Z",
      "updatedAt": "2025-10-04T04:07:39.915635Z",
      "_etag": "\"040000df-0000-2400-0000-68e0a11c0000\""
    },
    {
      "id": "d14d5e1c-c784-4aa3-b6a7-42c391dc0bcc",
      "name": "San Luis",
      "cityCode": "BTG-24",
      "provinceCode": "BTG",
      "createdAt": "2025-10-04T04:07:39.915635Z",
      "updatedAt": "2025-10-04T04:07:39.915635Z",
      "_etag": "\"040015df-0000-2400-0000-68e0a11d0000\""
    },
    {
      "id": "ca0ec2bc-ab17-47fe-8758-a90f16765449",
      "name": "San Luis",
      "cityCode": "AGS-09",
      "provinceCode": "AGS",
      "createdAt": "2025-10-04T04:07:39.915635Z",
      "updatedAt": "2025-10-04T04:07:39.915635Z",
      "_etag": "\"040022df-0000-2400-0000-68e0a11e0000\""
    },
    {
      "id": "af436819-1022-499d-8eda-ab8c1ccfed18",
      "name": "San Manuel",
      "cityCode": "PAN-35",
      "provinceCode": "PAN",
      "createdAt": "2025-10-04T04:07:39.915635Z",
      "updatedAt": "2025-10-04T04:07:39.915635Z",
      "_etag": "\"040028df-0000-2400-0000-68e0a11e0000\""
    },
    {
      "id": "fac2d4bd-0f7d-4b82-9975-2a28bb49c2b3",
      "name": "San Manuel",
      "cityCode": "ISA-30",
      "provinceCode": "ISA",
      "createdAt": "2025-10-04T04:07:39.915635Z",
      "updatedAt": "2025-10-04T04:07:39.915635Z",
      "_etag": "\"040030df-0000-2400-0000-68e0a11e0000\""
    },
    {
      "id": "16d2158e-7d27-4c23-93e8-c380fe064986",
      "name": "San Manuel",
      "cityCode": "TAR-14",
      "provinceCode": "TAR",
      "createdAt": "2025-10-04T04:07:39.915635Z",
      "updatedAt": "2025-10-04T04:07:39.915635Z",
      "_etag": "\"040039df-0000-2400-0000-68e0a11f0000\""
    },
    {
      "id": "ee7f7c98-d3dd-4d26-b398-6ffa8abfe58a",
      "name": "San Marcelino",
      "cityCode": "ZAM-11",
      "provinceCode": "ZAM",
      "createdAt": "2025-10-04T04:07:39.915636Z",
      "updatedAt": "2025-10-04T04:07:39.915636Z",
      "_etag": "\"040046df-0000-2400-0000-68e0a11f0000\""
    },
    {
      "id": "6901a37b-bc3b-4138-966f-b1594a2713b1",
      "name": "San Mariano",
      "cityCode": "ISA-31",
      "provinceCode": "ISA",
      "createdAt": "2025-10-04T04:07:39.915636Z",
      "updatedAt": "2025-10-04T04:07:39.915636Z",
      "_etag": "\"040054df-0000-2400-0000-68e0a1200000\""
    },
    {
      "id": "8b9aa630-adc4-4e29-8446-8ed139a27bfa",
      "name": "San Mateo",
      "cityCode": "ISA-32",
      "provinceCode": "ISA",
      "createdAt": "2025-10-04T04:07:39.915636Z",
      "updatedAt": "2025-10-04T04:07:39.915636Z",
      "_etag": "\"040063df-0000-2400-0000-68e0a1210000\""
    },
    {
      "id": "51ff9f34-6889-4dc2-a7bf-801f20150b09",
      "name": "San Mateo",
      "cityCode": "RIZ-11",
      "provinceCode": "RIZ",
      "createdAt": "2025-10-04T04:07:39.915637Z",
      "updatedAt": "2025-10-04T04:07:39.915637Z",
      "_etag": "\"04006cdf-0000-2400-0000-68e0a1210000\""
    },
    {
      "id": "f9126c9e-5093-4316-996f-9371f6d20c05",
      "name": "San Miguel",
      "cityCode": "BOH-38",
      "provinceCode": "BOH",
      "createdAt": "2025-10-04T04:07:39.915637Z",
      "updatedAt": "2025-10-04T04:07:39.915637Z",
      "_etag": "\"040075df-0000-2400-0000-68e0a1220000\""
    },
    {
      "id": "0c447688-7ab0-4f2e-a265-c179bdba2e52",
      "name": "San Miguel",
      "cityCode": "BUL-21",
      "provinceCode": "BUL",
      "createdAt": "2025-10-04T04:07:39.915637Z",
      "updatedAt": "2025-10-04T04:07:39.915637Z",
      "_etag": "\"04007cdf-0000-2400-0000-68e0a1220000\""
    },
    {
      "id": "811ddab6-2971-4a43-9002-7973c7876818",
      "name": "San Miguel",
      "cityCode": "CAT-09",
      "provinceCode": "CAT",
      "createdAt": "2025-10-04T04:07:39.915637Z",
      "updatedAt": "2025-10-04T04:07:39.915637Z",
      "_etag": "\"040098df-0000-2400-0000-68e0a1230000\""
    },
    {
      "id": "37db3b04-8e91-4ea5-8e01-068f534373dd",
      "name": "San Miguel",
      "cityCode": "ILO-41",
      "provinceCode": "ILO",
      "createdAt": "2025-10-04T04:07:39.915637Z",
      "updatedAt": "2025-10-04T04:07:39.915637Z",
      "_etag": "\"0400b2df-0000-2400-0000-68e0a1230000\""
    },
    {
      "id": "c384df69-6ae1-4bdd-be4d-5c6bbe53e1b6",
      "name": "San Miguel",
      "cityCode": "LEY-43",
      "provinceCode": "LEY",
      "createdAt": "2025-10-04T04:07:39.915637Z",
      "updatedAt": "2025-10-04T04:07:39.915637Z",
      "_etag": "\"0400c8df-0000-2400-0000-68e0a1240000\""
    },
    {
      "id": "8317f506-6f3e-44d1-9c5d-cf5a1ffe273c",
      "name": "San Miguel",
      "cityCode": "ZAS-24",
      "provinceCode": "ZAS",
      "createdAt": "2025-10-04T04:07:39.915637Z",
      "updatedAt": "2025-10-04T04:07:39.915637Z",
      "_etag": "\"0400d7df-0000-2400-0000-68e0a1250000\""
    },
    {
      "id": "d2cca003-6897-4fea-85f2-01ed0b118e87",
      "name": "San Miguel",
      "cityCode": "SUR-16",
      "provinceCode": "SUR",
      "createdAt": "2025-10-04T04:07:39.915638Z",
      "updatedAt": "2025-10-04T04:07:39.915638Z",
      "_etag": "\"0400e3df-0000-2400-0000-68e0a1260000\""
    },
    {
      "id": "ee2ff824-b41c-4c3f-89ca-df2926fb38f2",
      "name": "San Miguel",
      "cityCode": "NCR1-07",
      "provinceCode": "NCR1",
      "createdAt": "2025-10-04T04:07:39.915638Z",
      "updatedAt": "2025-10-04T04:07:39.915638Z",
      "_etag": "\"040004e0-0000-2400-0000-68e0a1270000\""
    },
    {
      "id": "20ffadf2-2ca8-4c48-8dda-3ff2d012b284",
      "name": "San Narciso",
      "cityCode": "ZAM-12",
      "provinceCode": "ZAM",
      "createdAt": "2025-10-04T04:07:39.915638Z",
      "updatedAt": "2025-10-04T04:07:39.915638Z",
      "_etag": "\"04001ae0-0000-2400-0000-68e0a1270000\""
    },
    {
      "id": "a1314731-9436-450d-bf71-153c2b15e85d",
      "name": "San Narciso",
      "cityCode": "QUE-44",
      "provinceCode": "QUE",
      "createdAt": "2025-10-04T04:07:39.915638Z",
      "updatedAt": "2025-10-04T04:07:39.915638Z",
      "_etag": "\"040022e0-0000-2400-0000-68e0a1280000\""
    },
    {
      "id": "c26e3d45-a7d5-4b4c-a7bb-f190056cfaa7",
      "name": "San Nicolas",
      "cityCode": "ILN-20",
      "provinceCode": "ILN",
      "createdAt": "2025-10-04T04:07:39.915638Z",
      "updatedAt": "2025-10-04T04:07:39.915638Z",
      "_etag": "\"040034e0-0000-2400-0000-68e0a1280000\""
    },
    {
      "id": "2aad18a9-7f0a-4886-9287-c4d0726c3a11",
      "name": "San Nicolas",
      "cityCode": "PAN-36",
      "provinceCode": "PAN",
      "createdAt": "2025-10-04T04:07:39.915638Z",
      "updatedAt": "2025-10-04T04:07:39.915638Z",
      "_etag": "\"040045e0-0000-2400-0000-68e0a1290000\""
    },
    {
      "id": "61eeac21-b827-4caf-a98b-dd5c71c3331e",
      "name": "San Nicolas",
      "cityCode": "BTG-25",
      "provinceCode": "BTG",
      "createdAt": "2025-10-04T04:07:39.915638Z",
      "updatedAt": "2025-10-04T04:07:39.915638Z",
      "_etag": "\"040052e0-0000-2400-0000-68e0a1290000\""
    },
    {
      "id": "b5c3fb0f-ba30-4cd4-9c69-da0bd38138e2",
      "name": "San Nicolas",
      "cityCode": "NCR1-04",
      "provinceCode": "NCR1",
      "createdAt": "2025-10-04T04:07:39.915638Z",
      "updatedAt": "2025-10-04T04:07:39.915639Z",
      "_etag": "\"04005ae0-0000-2400-0000-68e0a12a0000\""
    },
    {
      "id": "34e34cd5-acc0-4cb0-8427-840f446bf5a7",
      "name": "San Pablo",
      "cityCode": "ISA-33",
      "provinceCode": "ISA",
      "createdAt": "2025-10-04T04:07:39.915639Z",
      "updatedAt": "2025-10-04T04:07:39.915639Z",
      "_etag": "\"040067e0-0000-2400-0000-68e0a12a0000\""
    },
    {
      "id": "7879633d-e425-479d-8779-359974074519",
      "name": "San Pablo",
      "cityCode": "ZAS-25",
      "provinceCode": "ZAS",
      "createdAt": "2025-10-04T04:07:39.915639Z",
      "updatedAt": "2025-10-04T04:07:39.915639Z",
      "_etag": "\"04007de0-0000-2400-0000-68e0a12b0000\""
    },
    {
      "id": "56970f57-51e1-4c61-8a97-d1b9df35e0b6",
      "name": "San Pablo City",
      "cityCode": "LAG-24",
      "provinceCode": "LAG",
      "createdAt": "2025-10-04T04:07:39.915641Z",
      "updatedAt": "2025-10-04T04:07:39.915641Z",
      "_etag": "\"040096e1-0000-2400-0000-68e0a1340000\""
    },
    {
      "id": "6ca28979-537d-41bf-b49b-09c6fe9b69ed",
      "name": "San Pascual",
      "cityCode": "BTG-26",
      "provinceCode": "BTG",
      "createdAt": "2025-10-04T04:07:39.915641Z",
      "updatedAt": "2025-10-04T04:07:39.915641Z",
      "_etag": "\"0400aae1-0000-2400-0000-68e0a1340000\""
    },
    {
      "id": "2d1cefd4-1378-462b-b509-c4aea83a3e7f",
      "name": "San Pascual",
      "cityCode": "MAS-20",
      "provinceCode": "MAS",
      "createdAt": "2025-10-04T04:07:39.915654Z",
      "updatedAt": "2025-10-04T04:07:39.915654Z",
      "_etag": "\"04007ae4-0000-2400-0000-68e0a14e0000\""
    },
    {
      "id": "97a3ea8c-dd82-4194-b921-d5234f53b82d",
      "name": "San Policarpo",
      "cityCode": "EAS-21",
      "provinceCode": "EAS",
      "createdAt": "2025-10-04T04:07:39.915653Z",
      "updatedAt": "2025-10-04T04:07:39.915653Z",
      "_etag": "\"040007e4-0000-2400-0000-68e0a14a0000\""
    },
    {
      "id": "d8062242-0b6c-41e5-9308-f2ae5c84149f",
      "name": "San Quintin",
      "cityCode": "ABR-23",
      "provinceCode": "ABR",
      "createdAt": "2025-10-04T04:07:39.915639Z",
      "updatedAt": "2025-10-04T04:07:39.915639Z",
      "_etag": "\"0400a4e0-0000-2400-0000-68e0a12c0000\""
    },
    {
      "id": "fd7432e8-df23-4be2-9568-b389156f18cf",
      "name": "San Quintin",
      "cityCode": "PAN-37",
      "provinceCode": "PAN",
      "createdAt": "2025-10-04T04:07:39.915643Z",
      "updatedAt": "2025-10-04T04:07:39.915643Z",
      "_etag": "\"040065e2-0000-2400-0000-68e0a13a0000\""
    },
    {
      "id": "fb9546d5-3c4b-4671-b2bd-e8809fea66f0",
      "name": "San Rafael",
      "cityCode": "BUL-22",
      "provinceCode": "BUL",
      "createdAt": "2025-10-04T04:07:39.915639Z",
      "updatedAt": "2025-10-04T04:07:39.915639Z",
      "_etag": "\"0400b6e0-0000-2400-0000-68e0a12d0000\""
    },
    {
      "id": "2dbffe73-4ef4-4e10-8f13-b0c46002c645",
      "name": "San Rafael",
      "cityCode": "ILO-42",
      "provinceCode": "ILO",
      "createdAt": "2025-10-04T04:07:39.91564Z",
      "updatedAt": "2025-10-04T04:07:39.91564Z",
      "_etag": "\"0400c3e0-0000-2400-0000-68e0a12d0000\""
    },
    {
      "id": "60713e00-08ac-4d02-8995-96e2da794e47",
      "name": "San Remigio",
      "cityCode": "CEB-43",
      "provinceCode": "CEB",
      "createdAt": "2025-10-04T04:07:39.91564Z",
      "updatedAt": "2025-10-04T04:07:39.91564Z",
      "_etag": "\"0400cee0-0000-2400-0000-68e0a12e0000\""
    },
    {
      "id": "9abb551d-f734-4555-b815-afc411fc8a1c",
      "name": "San Remigio",
      "cityCode": "ANT-14",
      "provinceCode": "ANT",
      "createdAt": "2025-10-04T04:07:39.91564Z",
      "updatedAt": "2025-10-04T04:07:39.91564Z",
      "_etag": "\"0400e7e0-0000-2400-0000-68e0a12f0000\""
    },
    {
      "id": "b1807964-6727-41cb-8dfa-16eaa6790ff9",
      "name": "San Ricardo",
      "cityCode": "SLE-15",
      "provinceCode": "SLE",
      "createdAt": "2025-10-04T04:07:39.91564Z",
      "updatedAt": "2025-10-04T04:07:39.91564Z",
      "_etag": "\"04001be1-0000-2400-0000-68e0a1300000\""
    },
    {
      "id": "a66fb39b-5e9f-4fba-877c-a57e76f86af0",
      "name": "San Roque",
      "cityCode": "NSA-20",
      "provinceCode": "NSA",
      "createdAt": "2025-10-04T04:07:39.91564Z",
      "updatedAt": "2025-10-04T04:07:39.91564Z",
      "_etag": "\"040007e1-0000-2400-0000-68e0a12f0000\""
    },
    {
      "id": "1bc24652-d4ca-4f0f-908c-0404d6697499",
      "name": "San Sebastian",
      "cityCode": "WSA-15",
      "provinceCode": "WSA",
      "createdAt": "2025-10-04T04:07:39.91564Z",
      "updatedAt": "2025-10-04T04:07:39.91564Z",
      "_etag": "\"040030e1-0000-2400-0000-68e0a1310000\""
    },
    {
      "id": "eb456e73-d979-4d23-8a6b-5266b054b493",
      "name": "San Simon",
      "cityCode": "PAM-18",
      "provinceCode": "PAM",
      "createdAt": "2025-10-04T04:07:39.91564Z",
      "updatedAt": "2025-10-04T04:07:39.91564Z",
      "_etag": "\"040046e1-0000-2400-0000-68e0a1310000\""
    },
    {
      "id": "7a68329b-42c4-45a2-a748-2890ddd6a65e",
      "name": "San Teodoro",
      "cityCode": "MNR-13",
      "provinceCode": "MNR",
      "createdAt": "2025-10-04T04:07:39.91564Z",
      "updatedAt": "2025-10-04T04:07:39.91564Z",
      "_etag": "\"040053e1-0000-2400-0000-68e0a1320000\""
    },
    {
      "id": "ab4715e4-0703-4dc2-8608-eb95663c406d",
      "name": "San Vicente",
      "cityCode": "ILS-21",
      "provinceCode": "ILS",
      "createdAt": "2025-10-04T04:07:39.915641Z",
      "updatedAt": "2025-10-04T04:07:39.915641Z",
      "_etag": "\"040066e1-0000-2400-0000-68e0a1330000\""
    },
    {
      "id": "4f95ac44-d018-4595-bc2a-531c3b86f632",
      "name": "San Vicente",
      "cityCode": "PAL-19",
      "provinceCode": "PAL",
      "createdAt": "2025-10-04T04:07:39.915641Z",
      "updatedAt": "2025-10-04T04:07:39.915641Z",
      "_etag": "\"04007be1-0000-2400-0000-68e0a1330000\""
    },
    {
      "id": "f05eafc9-f041-46fb-9659-7d5e6add2d7f",
      "name": "San Vicente",
      "cityCode": "CAN-09",
      "provinceCode": "CAN",
      "createdAt": "2025-10-04T04:07:39.915641Z",
      "updatedAt": "2025-10-04T04:07:39.915642Z",
      "_etag": "\"0400bce1-0000-2400-0000-68e0a1350000\""
    },
    {
      "id": "9342b2b1-8cf8-4a93-b225-5856c67aee93",
      "name": "San Vicente",
      "cityCode": "NSA-21",
      "provinceCode": "NSA",
      "createdAt": "2025-10-04T04:07:39.915642Z",
      "updatedAt": "2025-10-04T04:07:39.915642Z",
      "_etag": "\"0400cfe1-0000-2400-0000-68e0a1360000\""
    },
    {
      "id": "0ed0b415-c5f7-4323-8bd1-d48a14f48846",
      "name": "Sanchez-mira",
      "cityCode": "CAG-22",
      "provinceCode": "CAG",
      "createdAt": "2025-10-04T04:07:39.915642Z",
      "updatedAt": "2025-10-04T04:07:39.915642Z",
      "_etag": "\"0400e1e1-0000-2400-0000-68e0a1360000\""
    },
    {
      "id": "fc5cc390-8df8-4d33-bbbc-ebcd61277542",
      "name": "Santa",
      "cityCode": "ILS-22",
      "provinceCode": "ILS",
      "createdAt": "2025-10-04T04:07:39.915642Z",
      "updatedAt": "2025-10-04T04:07:39.915642Z",
      "_etag": "\"0400f9e1-0000-2400-0000-68e0a1370000\""
    },
    {
      "id": "f23c732b-ad9a-44c9-9395-98844b4e3846",
      "name": "Santa Ana",
      "cityCode": "CAG-23",
      "provinceCode": "CAG",
      "createdAt": "2025-10-04T04:07:39.915642Z",
      "updatedAt": "2025-10-04T04:07:39.915642Z",
      "_etag": "\"04000ee2-0000-2400-0000-68e0a1370000\""
    },
    {
      "id": "cd3f52b6-508e-4beb-abac-fc853bba43c7",
      "name": "Santa Ana",
      "cityCode": "PAM-19",
      "provinceCode": "PAM",
      "createdAt": "2025-10-04T04:07:39.915642Z",
      "updatedAt": "2025-10-04T04:07:39.915642Z",
      "_etag": "\"04001fe2-0000-2400-0000-68e0a1380000\""
    },
    {
      "id": "881d7967-3fa6-49a0-9935-6acb9b98da0f",
      "name": "Santa Ana",
      "cityCode": "NCR1-14",
      "provinceCode": "NCR1",
      "createdAt": "2025-10-04T04:07:39.915642Z",
      "updatedAt": "2025-10-04T04:07:39.915642Z",
      "_etag": "\"040033e2-0000-2400-0000-68e0a1390000\""
    },
    {
      "id": "324815e2-ad29-423a-b7c2-c98795e0d81a",
      "name": "Santa Barbara",
      "cityCode": "PAN-38",
      "provinceCode": "PAN",
      "createdAt": "2025-10-04T04:07:39.915642Z",
      "updatedAt": "2025-10-04T04:07:39.915642Z",
      "_etag": "\"040050e2-0000-2400-0000-68e0a1390000\""
    },
    {
      "id": "f8519a6e-1706-4a47-b10c-6ece5b1fb747",
      "name": "Santa Barbara",
      "cityCode": "ILO-43",
      "provinceCode": "ILO",
      "createdAt": "2025-10-04T04:07:39.915643Z",
      "updatedAt": "2025-10-04T04:07:39.915643Z",
      "_etag": "\"0400b7e2-0000-2400-0000-68e0a13d0000\""
    },
    {
      "id": "806b3782-3d11-4666-b49b-ca282596d549",
      "name": "Santa Catalina",
      "cityCode": "NER-18",
      "provinceCode": "NER",
      "createdAt": "2025-10-04T04:07:39.915643Z",
      "updatedAt": "2025-10-04T04:07:39.915643Z",
      "_etag": "\"04007ce2-0000-2400-0000-68e0a13b0000\""
    },
    {
      "id": "cbbaae32-5ad9-48a1-996c-58a969b850af",
      "name": "Santa Catalina",
      "cityCode": "ILS-23",
      "provinceCode": "ILS",
      "createdAt": "2025-10-04T04:07:39.915643Z",
      "updatedAt": "2025-10-04T04:07:39.915643Z",
      "_etag": "\"04008ee2-0000-2400-0000-68e0a13b0000\""
    },
    {
      "id": "9fb979cc-f564-4434-8f02-3681cca7c4d6",
      "name": "Santa Cruz",
      "cityCode": "MNC-11",
      "provinceCode": "MNC",
      "createdAt": "2025-10-04T04:07:39.915645Z",
      "updatedAt": "2025-10-04T04:07:39.915645Z",
      "_etag": "\"04008de3-0000-2400-0000-68e0a1450000\""
    },
    {
      "id": "23f94875-264b-47a6-8bc6-f809cda5ea92",
      "name": "Santa Cruz",
      "cityCode": "ILS-24",
      "provinceCode": "ILS",
      "createdAt": "2025-10-04T04:07:39.915652Z",
      "updatedAt": "2025-10-04T04:07:39.915652Z",
      "_etag": "\"0400cbe3-0000-2400-0000-68e0a1470000\""
    },
    {
      "id": "06e87c18-b569-4e64-bf1c-8744a1172422",
      "name": "Santa Cruz",
      "cityCode": "MAD-05",
      "provinceCode": "MAD",
      "createdAt": "2025-10-04T04:07:39.915653Z",
      "updatedAt": "2025-10-04T04:07:39.915653Z",
      "_etag": "\"040039e4-0000-2400-0000-68e0a14c0000\""
    },
    {
      "id": "5b087cab-4887-4be6-9ecc-118d157dbd01",
      "name": "Santa Cruz",
      "cityCode": "NCR1-05",
      "provinceCode": "NCR1",
      "createdAt": "2025-10-04T04:07:39.915654Z",
      "updatedAt": "2025-10-04T04:07:39.915654Z",
      "_etag": "\"040087e4-0000-2400-0000-68e0a14f0000\""
    },
    {
      "id": "9bae5350-55d6-4d72-8bd4-d91522a60664",
      "name": "Santa Cruz",
      "cityCode": "DAS-12",
      "provinceCode": "DAS",
      "createdAt": "2025-10-04T04:07:39.915692Z",
      "updatedAt": "2025-10-04T04:07:39.915692Z",
      "_etag": "\"040094e6-0000-2400-0000-68e0a1650000\""
    },
    {
      "id": "76e7750d-d4d1-4494-97f4-8946f6ec6deb",
      "name": "Santa Cruz",
      "cityCode": "ZAM-13",
      "provinceCode": "ZAM",
      "createdAt": "2025-10-04T04:07:39.9157Z",
      "updatedAt": "2025-10-04T04:07:39.9157Z",
      "_etag": "\"040073e9-0000-2400-0000-68e0a1840000\""
    },
    {
      "id": "9326b302-bfad-4139-baad-5cb1a15b170c",
      "name": "Santa Cruz (Capital)",
      "cityCode": "LAG-26",
      "provinceCode": "LAG",
      "createdAt": "2025-10-04T04:07:39.915644Z",
      "updatedAt": "2025-10-04T04:07:39.915644Z",
      "_etag": "\"0400cae2-0000-2400-0000-68e0a13e0000\""
    },
    {
      "id": "3edab795-ba02-4548-9315-6902b82d539f",
      "name": "Santa Elena",
      "cityCode": "CAN-10",
      "provinceCode": "CAN",
      "createdAt": "2025-10-04T04:07:39.915646Z",
      "updatedAt": "2025-10-04T04:07:39.915646Z",
      "_etag": "\"040099e3-0000-2400-0000-68e0a1460000\""
    },
    {
      "id": "6896550f-5f35-4cad-8027-7f7c915d36e9",
      "name": "Santa Fe",
      "cityCode": "LEY-44",
      "provinceCode": "LEY",
      "createdAt": "2025-10-04T04:07:39.915653Z",
      "updatedAt": "2025-10-04T04:07:39.915653Z",
      "_etag": "\"040025e4-0000-2400-0000-68e0a14b0000\""
    },
    {
      "id": "cb2762f0-54eb-4904-9d7e-877adf84ba78",
      "name": "Santa Fe",
      "cityCode": "ROM-15",
      "provinceCode": "ROM",
      "createdAt": "2025-10-04T04:07:39.915654Z",
      "updatedAt": "2025-10-04T04:07:39.915654Z",
      "_etag": "\"040067e4-0000-2400-0000-68e0a14d0000\""
    },
    {
      "id": "bd50c60d-ef67-4744-a647-6b11338eede4",
      "name": "Santa Fe",
      "cityCode": "CEB-44",
      "provinceCode": "CEB",
      "createdAt": "2025-10-04T04:07:39.915655Z",
      "updatedAt": "2025-10-04T04:07:39.915655Z",
      "_etag": "\"0400cce4-0000-2400-0000-68e0a1520000\""
    },
    {
      "id": "a96e7736-0655-4a41-96ff-7ab1294e128e",
      "name": "Santa Fe",
      "cityCode": "NUV-12",
      "provinceCode": "NUV",
      "createdAt": "2025-10-04T04:07:39.915697Z",
      "updatedAt": "2025-10-04T04:07:39.915697Z",
      "_etag": "\"0400a7e8-0000-2400-0000-68e0a17a0000\""
    },
    {
      "id": "d87e3010-8373-4723-971f-1687b62ffe5f",
      "name": "Santa Ignacia",
      "cityCode": "TAR-15",
      "provinceCode": "TAR",
      "createdAt": "2025-10-04T04:07:39.915695Z",
      "updatedAt": "2025-10-04T04:07:39.915695Z",
      "_etag": "\"0400c7e7-0000-2400-0000-68e0a1710000\""
    },
    {
      "id": "665f81a8-2afb-411c-afc3-dfad3b7ce4c8",
      "name": "Santa Josefa",
      "cityCode": "AGS-10",
      "provinceCode": "AGS",
      "createdAt": "2025-10-04T04:07:39.915655Z",
      "updatedAt": "2025-10-04T04:07:39.915656Z",
      "_etag": "\"0400dfe4-0000-2400-0000-68e0a1530000\""
    },
    {
      "id": "118a79d6-1ed6-4df0-ac70-bff844032b3b",
      "name": "Santa Lucia",
      "cityCode": "ILS-25",
      "provinceCode": "ILS",
      "createdAt": "2025-10-04T04:07:39.915653Z",
      "updatedAt": "2025-10-04T04:07:39.915653Z",
      "_etag": "\"0400e1e3-0000-2400-0000-68e0a1490000\""
    },
    {
      "id": "baa574c4-b982-4ed3-83ea-9d8cd497412f",
      "name": "Santa Magdalena",
      "cityCode": "SOR-15",
      "provinceCode": "SOR",
      "createdAt": "2025-10-04T04:07:39.915652Z",
      "updatedAt": "2025-10-04T04:07:39.915652Z",
      "_etag": "\"0400a9e3-0000-2400-0000-68e0a1460000\""
    },
    {
      "id": "eebb9f80-fa18-4c3e-9797-9ab1e0901f88",
      "name": "Santa Marcela",
      "cityCode": "APA-07",
      "provinceCode": "APA",
      "createdAt": "2025-10-04T04:07:39.915656Z",
      "updatedAt": "2025-10-04T04:07:39.915656Z",
      "_etag": "\"0400eae4-0000-2400-0000-68e0a1530000\""
    },
    {
      "id": "f2f1f237-e54b-447a-8d4b-a1aabcb25253",
      "name": "Santa Margarita",
      "cityCode": "WSA-16",
      "provinceCode": "WSA",
      "createdAt": "2025-10-04T04:07:39.915696Z",
      "updatedAt": "2025-10-04T04:07:39.915697Z",
      "_etag": "\"040085e8-0000-2400-0000-68e0a1780000\""
    },
    {
      "id": "8d40f477-da8e-4cf8-aaf8-fd3013ffb249",
      "name": "Santa Maria",
      "cityCode": "DAC-04",
      "provinceCode": "DAC",
      "createdAt": "2025-10-04T04:07:39.915652Z",
      "updatedAt": "2025-10-04T04:07:39.915653Z",
      "_etag": "\"0400d6e3-0000-2400-0000-68e0a1480000\""
    },
    {
      "id": "32aa3d83-2d03-4588-9215-d7f701cfe91f",
      "name": "Santa Maria",
      "cityCode": "LAG-27",
      "provinceCode": "LAG",
      "createdAt": "2025-10-04T04:07:39.915653Z",
      "updatedAt": "2025-10-04T04:07:39.915653Z",
      "_etag": "\"0400f8e3-0000-2400-0000-68e0a1490000\""
    },
    {
      "id": "a7f5c6da-5bb7-47eb-a10e-eaf444d4b6c2",
      "name": "Santa Maria",
      "cityCode": "PAN-39",
      "provinceCode": "PAN",
      "createdAt": "2025-10-04T04:07:39.915653Z",
      "updatedAt": "2025-10-04T04:07:39.915653Z",
      "_etag": "\"04001be4-0000-2400-0000-68e0a14a0000\""
    },
    {
      "id": "10fd2bc7-ce11-4eb9-a607-46c3bde8afb2",
      "name": "Santa Maria",
      "cityCode": "ILS-26",
      "provinceCode": "ILS",
      "createdAt": "2025-10-04T04:07:39.915654Z",
      "updatedAt": "2025-10-04T04:07:39.915654Z",
      "_etag": "\"040047e4-0000-2400-0000-68e0a14c0000\""
    },
    {
      "id": "ffcbf201-0ba9-491e-9d90-55b7d90bee73",
      "name": "Santa Maria",
      "cityCode": "BUL-23",
      "provinceCode": "BUL",
      "createdAt": "2025-10-04T04:07:39.915656Z",
      "updatedAt": "2025-10-04T04:07:39.915656Z",
      "_etag": "\"0400f5e4-0000-2400-0000-68e0a1540000\""
    },
    {
      "id": "833b9047-ee4e-43a1-b987-3b86b911d9bc",
      "name": "Santa Maria",
      "cityCode": "ISA-34",
      "provinceCode": "ISA",
      "createdAt": "2025-10-04T04:07:39.915692Z",
      "updatedAt": "2025-10-04T04:07:39.915692Z",
      "_etag": "\"0400afe6-0000-2400-0000-68e0a1660000\""
    },
    {
      "id": "437640f7-c844-4edb-8bd5-43df7a856cff",
      "name": "Santa Maria (Imelda)",
      "cityCode": "ROM-17",
      "provinceCode": "ROM",
      "createdAt": "2025-10-04T04:07:39.915643Z",
      "updatedAt": "2025-10-04T04:07:39.915643Z",
      "_etag": "\"040071e2-0000-2400-0000-68e0a13a0000\""
    },
    {
      "id": "02f127c7-e86f-4cbf-ac6c-72b05a41a91b",
      "name": "Santa Monica (Sapao)",
      "cityCode": "SUN-21",
      "provinceCode": "SUN",
      "createdAt": "2025-10-04T04:07:39.915643Z",
      "updatedAt": "2025-10-04T04:07:39.915643Z",
      "_etag": "\"04009ce2-0000-2400-0000-68e0a13c0000\""
    },
    {
      "id": "b64a60e2-68a9-40e1-a265-7420811f1b3b",
      "name": "Santa Praxedes",
      "cityCode": "CAG-24",
      "provinceCode": "CAG",
      "createdAt": "2025-10-04T04:07:39.915643Z",
      "updatedAt": "2025-10-04T04:07:39.915643Z",
      "_etag": "\"0400bfe2-0000-2400-0000-68e0a13d0000\""
    },
    {
      "id": "0ec4afbf-d01c-45c5-9550-8d1277062ab1",
      "name": "Santa Rita",
      "cityCode": "PAM-20",
      "provinceCode": "PAM",
      "createdAt": "2025-10-04T04:07:39.915644Z",
      "updatedAt": "2025-10-04T04:07:39.915644Z",
      "_etag": "\"0400d9e2-0000-2400-0000-68e0a13e0000\""
    },
    {
      "id": "4c0db5f1-2287-4d3d-ae0b-de36edf1c486",
      "name": "Santa Rita",
      "cityCode": "WSA-17",
      "provinceCode": "WSA",
      "createdAt": "2025-10-04T04:07:39.915644Z",
      "updatedAt": "2025-10-04T04:07:39.915644Z",
      "_etag": "\"0400e2e2-0000-2400-0000-68e0a13f0000\""
    },
    {
      "id": "3f89ed99-4c2f-4e0c-acfd-4775818a6dfb",
      "name": "Santa Rosa",
      "cityCode": "NUE-28",
      "provinceCode": "NUE",
      "createdAt": "2025-10-04T04:07:39.915644Z",
      "updatedAt": "2025-10-04T04:07:39.915644Z",
      "_etag": "\"0400eee2-0000-2400-0000-68e0a13f0000\""
    },
    {
      "id": "596fa0a9-c08f-4d65-8a1d-7d334b995922",
      "name": "Santa Teresita",
      "cityCode": "CAG-25",
      "provinceCode": "CAG",
      "createdAt": "2025-10-04T04:07:39.915644Z",
      "updatedAt": "2025-10-04T04:07:39.915644Z",
      "_etag": "\"040004e3-0000-2400-0000-68e0a1400000\""
    },
    {
      "id": "9e8991a9-72bc-4818-8eed-1bd096d61c40",
      "name": "Santa Teresita",
      "cityCode": "BTG-27",
      "provinceCode": "BTG",
      "createdAt": "2025-10-04T04:07:39.915644Z",
      "updatedAt": "2025-10-04T04:07:39.915645Z",
      "_etag": "\"04001de3-0000-2400-0000-68e0a1410000\""
    },
    {
      "id": "03236e31-238c-4546-8ba0-18bd7346c73e",
      "name": "Santander",
      "cityCode": "CEB-45",
      "provinceCode": "CEB",
      "createdAt": "2025-10-04T04:07:39.915645Z",
      "updatedAt": "2025-10-04T04:07:39.915645Z",
      "_etag": "\"040028e3-0000-2400-0000-68e0a1410000\""
    },
    {
      "id": "8a187a6c-ce1f-49a5-ad06-f0537836d69c",
      "name": "Santiago",
      "cityCode": "ILS-27",
      "provinceCode": "ILS",
      "createdAt": "2025-10-04T04:07:39.915645Z",
      "updatedAt": "2025-10-04T04:07:39.915645Z",
      "_etag": "\"040045e3-0000-2400-0000-68e0a1420000\""
    },
    {
      "id": "20b3e3aa-7a03-4ab7-981a-8226ff0772df",
      "name": "Santiago",
      "cityCode": "AGN-10",
      "provinceCode": "AGN",
      "createdAt": "2025-10-04T04:07:39.915645Z",
      "updatedAt": "2025-10-04T04:07:39.915645Z",
      "_etag": "\"040054e3-0000-2400-0000-68e0a1430000\""
    },
    {
      "id": "207bf6a2-2c38-43e5-adfa-8ebdc96c0394",
      "name": "Santo Domingo",
      "cityCode": "ILS-28",
      "provinceCode": "ILS",
      "createdAt": "2025-10-04T04:07:39.915645Z",
      "updatedAt": "2025-10-04T04:07:39.915645Z",
      "_etag": "\"040061e3-0000-2400-0000-68e0a1440000\""
    },
    {
      "id": "f75bc63d-a17e-410a-ad00-9dd58a458e54",
      "name": "Santo Domingo",
      "cityCode": "NUE-29",
      "provinceCode": "NUE",
      "createdAt": "2025-10-04T04:07:39.915645Z",
      "updatedAt": "2025-10-04T04:07:39.915645Z",
      "_etag": "\"04006fe3-0000-2400-0000-68e0a1440000\""
    },
    {
      "id": "72b58416-8eec-4ad2-ba23-2ae8e5eb3f54",
      "name": "Santo Domingo (Libog)",
      "cityCode": "ALB-16",
      "provinceCode": "ALB",
      "createdAt": "2025-10-04T04:07:39.915645Z",
      "updatedAt": "2025-10-04T04:07:39.915645Z",
      "_etag": "\"040078e3-0000-2400-0000-68e0a1450000\""
    },
    {
      "id": "e26481e5-5f18-46a4-b168-dcbf1e80d93c",
      "name": "Santo Niño",
      "cityCode": "WSA-18",
      "provinceCode": "WSA",
      "createdAt": "2025-10-04T04:07:39.915652Z",
      "updatedAt": "2025-10-04T04:07:39.915652Z",
      "_etag": "\"0400bfe3-0000-2400-0000-68e0a1470000\""
    },
    {
      "id": "6d4932db-d560-42fd-b71d-255e177346e1",
      "name": "Santo Niño",
      "cityCode": "SCO-18",
      "provinceCode": "SCO",
      "createdAt": "2025-10-04T04:07:39.915654Z",
      "updatedAt": "2025-10-04T04:07:39.915654Z",
      "_etag": "\"040056e4-0000-2400-0000-68e0a14d0000\""
    },
    {
      "id": "5687c03f-f440-4275-b720-4596c3d8a953",
      "name": "Santo Niño (Faire)",
      "cityCode": "CAG-26",
      "provinceCode": "CAG",
      "createdAt": "2025-10-04T04:07:39.915654Z",
      "updatedAt": "2025-10-04T04:07:39.915654Z",
      "_etag": "\"040096e4-0000-2400-0000-68e0a14f0000\""
    },
    {
      "id": "1dfdce96-c31b-4f25-a028-47ff894e4d65",
      "name": "Santo Tomas",
      "cityCode": "LAU-17",
      "provinceCode": "LAU",
      "createdAt": "2025-10-04T04:07:39.915654Z",
      "updatedAt": "2025-10-04T04:07:39.915654Z",
      "_etag": "\"0400a4e4-0000-2400-0000-68e0a1500000\""
    },
    {
      "id": "cfa5a671-a2d9-4954-92e4-ab98a386cbb3",
      "name": "Santo Tomas",
      "cityCode": "PAN-40",
      "provinceCode": "PAN",
      "createdAt": "2025-10-04T04:07:39.915655Z",
      "updatedAt": "2025-10-04T04:07:39.915655Z",
      "_etag": "\"0400b3e4-0000-2400-0000-68e0a1500000\""
    },
    {
      "id": "dead14a0-3722-4f8e-a417-300f04b9acb6",
      "name": "Santo Tomas",
      "cityCode": "ISA-36",
      "provinceCode": "ISA",
      "createdAt": "2025-10-04T04:07:39.915655Z",
      "updatedAt": "2025-10-04T04:07:39.915655Z",
      "_etag": "\"0400c0e4-0000-2400-0000-68e0a1510000\""
    },
    {
      "id": "c7beb0c9-cc76-42de-8122-18609bfed33b",
      "name": "Santo Tomas",
      "cityCode": "PAM-21",
      "provinceCode": "PAM",
      "createdAt": "2025-10-04T04:07:39.915655Z",
      "updatedAt": "2025-10-04T04:07:39.915655Z",
      "_etag": "\"0400d3e4-0000-2400-0000-68e0a1520000\""
    },
    {
      "id": "cd61eace-c8dc-4967-8769-54a1abfa8626",
      "name": "Santo Tomas",
      "cityCode": "BTG-28",
      "provinceCode": "BTG",
      "createdAt": "2025-10-04T04:07:39.915656Z",
      "updatedAt": "2025-10-04T04:07:39.915656Z",
      "_etag": "\"040003e5-0000-2400-0000-68e0a1540000\""
    },
    {
      "id": "3f166ebb-357d-4ab8-af84-4cab50843444",
      "name": "Santo Tomas",
      "cityCode": "DAN-18",
      "provinceCode": "DAN",
      "createdAt": "2025-10-04T04:07:39.915656Z",
      "updatedAt": "2025-10-04T04:07:39.915656Z",
      "_etag": "\"040015e5-0000-2400-0000-68e0a1550000\""
    },
    {
      "id": "3de212c0-ad10-42ee-9028-841755209feb",
      "name": "Santol",
      "cityCode": "LAU-18",
      "provinceCode": "LAU",
      "createdAt": "2025-10-04T04:07:39.915656Z",
      "updatedAt": "2025-10-04T04:07:39.915656Z",
      "_etag": "\"040020e5-0000-2400-0000-68e0a1550000\""
    },
    {
      "id": "22f7e552-5267-4016-85d9-2aabce0fa5f1",
      "name": "Sapa-sapa",
      "cityCode": "TAW-10",
      "provinceCode": "TAW",
      "createdAt": "2025-10-04T04:07:39.915656Z",
      "updatedAt": "2025-10-04T04:07:39.915656Z",
      "_etag": "\"040032e5-0000-2400-0000-68e0a1560000\""
    },
    {
      "id": "38c67001-664f-4707-b691-e3dbceac2cb1",
      "name": "Sapad",
      "cityCode": "LAN-19",
      "provinceCode": "LAN",
      "createdAt": "2025-10-04T04:07:39.915656Z",
      "updatedAt": "2025-10-04T04:07:39.915656Z",
      "_etag": "\"04003ee5-0000-2400-0000-68e0a1560000\""
    },
    {
      "id": "2fe0c710-9b1e-41fe-b5ee-6367109fda2b",
      "name": "Sapang Dalaga",
      "cityCode": "MSC-13",
      "provinceCode": "MSC",
      "createdAt": "2025-10-04T04:07:39.915657Z",
      "updatedAt": "2025-10-04T04:07:39.915657Z",
      "_etag": "\"040052e5-0000-2400-0000-68e0a1570000\""
    },
    {
      "id": "df4e6599-9e3f-4703-81b0-d3ca667241e3",
      "name": "Sapi-an",
      "cityCode": "CAP-15",
      "provinceCode": "CAP",
      "createdAt": "2025-10-04T04:07:39.915657Z",
      "updatedAt": "2025-10-04T04:07:39.915657Z",
      "_etag": "\"04005de5-0000-2400-0000-68e0a1570000\""
    },
    {
      "id": "4f1100ac-9c42-424c-9f27-9af9a776a889",
      "name": "Sara",
      "cityCode": "ILO-44",
      "provinceCode": "ILO",
      "createdAt": "2025-10-04T04:07:39.915657Z",
      "updatedAt": "2025-10-04T04:07:39.915657Z",
      "_etag": "\"04006ce5-0000-2400-0000-68e0a1580000\""
    },
    {
      "id": "4ef43d14-f84a-441a-9a05-f07b6eeeba71",
      "name": "Sarangani",
      "cityCode": "DAC-05",
      "provinceCode": "DAC",
      "createdAt": "2025-10-04T04:07:39.915657Z",
      "updatedAt": "2025-10-04T04:07:39.915657Z",
      "_etag": "\"040076e5-0000-2400-0000-68e0a1590000\""
    },
    {
      "id": "908e81ac-e86e-428b-b71d-5e4918e4be4d",
      "name": "Sariaya",
      "cityCode": "QUE-45",
      "provinceCode": "QUE",
      "createdAt": "2025-10-04T04:07:39.915657Z",
      "updatedAt": "2025-10-04T04:07:39.915657Z",
      "_etag": "\"040087e5-0000-2400-0000-68e0a1590000\""
    },
    {
      "id": "1a20f371-e284-436c-8b63-9035ab67371a",
      "name": "Sarrat",
      "cityCode": "ILN-21",
      "provinceCode": "ILN",
      "createdAt": "2025-10-04T04:07:39.915657Z",
      "updatedAt": "2025-10-04T04:07:39.915657Z",
      "_etag": "\"04008fe5-0000-2400-0000-68e0a15a0000\""
    },
    {
      "id": "dad6e5ae-45f9-4c4c-b988-470ad179cfaf",
      "name": "Sasmuan (Sexmoan)",
      "cityCode": "PAM-22",
      "provinceCode": "PAM",
      "createdAt": "2025-10-04T04:07:39.915658Z",
      "updatedAt": "2025-10-04T04:07:39.915658Z",
      "_etag": "\"0400cde5-0000-2400-0000-68e0a15c0000\""
    },
    {
      "id": "8bdc182c-443c-4a6e-ad66-79deb1b8adaa",
      "name": "Science City Of Muñoz",
      "cityCode": "NUE-17",
      "provinceCode": "NUE",
      "createdAt": "2025-10-04T04:07:39.915657Z",
      "updatedAt": "2025-10-04T04:07:39.915657Z",
      "_etag": "\"04009be5-0000-2400-0000-68e0a15a0000\""
    },
    {
      "id": "d9128ea1-ba3f-4206-90a6-0f7d494103e5",
      "name": "Sebaste",
      "cityCode": "ANT-15",
      "provinceCode": "ANT",
      "createdAt": "2025-10-04T04:07:39.915658Z",
      "updatedAt": "2025-10-04T04:07:39.915658Z",
      "_etag": "\"0400a7e5-0000-2400-0000-68e0a15b0000\""
    },
    {
      "id": "33345966-5a2c-400f-9941-b1392fa96a6b",
      "name": "Sen. Ninoy Aquino",
      "cityCode": "SUK-12",
      "provinceCode": "SUK",
      "createdAt": "2025-10-04T04:07:39.915658Z",
      "updatedAt": "2025-10-04T04:07:39.915658Z",
      "_etag": "\"0400dce5-0000-2400-0000-68e0a15d0000\""
    },
    {
      "id": "54827871-c59a-4eae-b2f5-0c8a7895a28e",
      "name": "Sergio Osmeña Sr.",
      "cityCode": "ZAN-14",
      "provinceCode": "ZAN",
      "createdAt": "2025-10-04T04:07:39.915658Z",
      "updatedAt": "2025-10-04T04:07:39.915659Z",
      "_etag": "\"0400f5e5-0000-2400-0000-68e0a15e0000\""
    },
    {
      "id": "ef0db287-653a-48f4-83ec-779ec9bd8284",
      "name": "Sevilla",
      "cityCode": "BOH-39",
      "provinceCode": "BOH",
      "createdAt": "2025-10-04T04:07:39.915658Z",
      "updatedAt": "2025-10-04T04:07:39.915658Z",
      "_etag": "\"0400b2e5-0000-2400-0000-68e0a15b0000\""
    },
    {
      "id": "f6b73ef9-586c-4810-90bc-6250394532ed",
      "name": "Shariff Aguak (Maganoy) (Capital)",
      "cityCode": "MAG-08",
      "provinceCode": "MAG",
      "createdAt": "2025-10-04T04:07:39.915658Z",
      "updatedAt": "2025-10-04T04:07:39.915658Z",
      "_etag": "\"0400e6e5-0000-2400-0000-68e0a15d0000\""
    },
    {
      "id": "f4ca916c-7d4e-4013-8fe1-6ec242d755c6",
      "name": "Shariff Saydona Mustapha",
      "cityCode": "MAG-37",
      "provinceCode": "MAG",
      "createdAt": "2025-10-04T04:07:39.915659Z",
      "updatedAt": "2025-10-04T04:07:39.915659Z",
      "_etag": "\"040008e6-0000-2400-0000-68e0a15e0000\""
    },
    {
      "id": "4213e3f8-96a9-421d-835f-e1c3e47f9051",
      "name": "Siasi",
      "cityCode": "SUL-12",
      "provinceCode": "SUL",
      "createdAt": "2025-10-04T04:07:39.91569Z",
      "updatedAt": "2025-10-04T04:07:39.91569Z",
      "_etag": "\"040021e6-0000-2400-0000-68e0a15f0000\""
    },
    {
      "id": "c7e29c53-f5ad-4cbf-9230-9f1c7bfce8df",
      "name": "Siaton",
      "cityCode": "NER-19",
      "provinceCode": "NER",
      "createdAt": "2025-10-04T04:07:39.91569Z",
      "updatedAt": "2025-10-04T04:07:39.91569Z",
      "_etag": "\"04000fe6-0000-2400-0000-68e0a15f0000\""
    },
    {
      "id": "f80bbb88-d917-4fa0-93ea-4dd653d05127",
      "name": "Siay",
      "cityCode": "ZSI-13",
      "provinceCode": "ZSI",
      "createdAt": "2025-10-04T04:07:39.91569Z",
      "updatedAt": "2025-10-04T04:07:39.91569Z",
      "_etag": "\"040033e6-0000-2400-0000-68e0a1600000\""
    },
    {
      "id": "760241fd-4e76-4dc5-a4d7-e9975e66ff3c",
      "name": "Siayan",
      "cityCode": "ZAN-15",
      "provinceCode": "ZAN",
      "createdAt": "2025-10-04T04:07:39.915691Z",
      "updatedAt": "2025-10-04T04:07:39.915691Z",
      "_etag": "\"040041e6-0000-2400-0000-68e0a1610000\""
    },
    {
      "id": "279f0789-d4a8-4ae2-a67b-96fa7bd75233",
      "name": "Sibagat",
      "cityCode": "AGS-14",
      "provinceCode": "AGS",
      "createdAt": "2025-10-04T04:07:39.915691Z",
      "updatedAt": "2025-10-04T04:07:39.915691Z",
      "_etag": "\"04004be6-0000-2400-0000-68e0a1610000\""
    },
    {
      "id": "7f62345d-4a5c-4041-995c-eac6c044a798",
      "name": "Sibalom",
      "cityCode": "ANT-16",
      "provinceCode": "ANT",
      "createdAt": "2025-10-04T04:07:39.915691Z",
      "updatedAt": "2025-10-04T04:07:39.915691Z",
      "_etag": "\"040056e6-0000-2400-0000-68e0a1620000\""
    },
    {
      "id": "b5c47ea5-5adc-48af-b110-dff142001bb3",
      "name": "Sibonga",
      "cityCode": "CEB-46",
      "provinceCode": "CEB",
      "createdAt": "2025-10-04T04:07:39.915691Z",
      "updatedAt": "2025-10-04T04:07:39.915691Z",
      "_etag": "\"040064e6-0000-2400-0000-68e0a1630000\""
    },
    {
      "id": "d92036da-bb4e-4c18-82d2-487861f1a466",
      "name": "Sibuco",
      "cityCode": "ZAN-16",
      "provinceCode": "ZAN",
      "createdAt": "2025-10-04T04:07:39.915691Z",
      "updatedAt": "2025-10-04T04:07:39.915691Z",
      "_etag": "\"040079e6-0000-2400-0000-68e0a1630000\""
    },
    {
      "id": "7d32b230-c106-43ad-8cd9-318537597e17",
      "name": "Sibulan",
      "cityCode": "NER-20",
      "provinceCode": "NER",
      "createdAt": "2025-10-04T04:07:39.915691Z",
      "updatedAt": "2025-10-04T04:07:39.915691Z",
      "_etag": "\"04008be6-0000-2400-0000-68e0a1640000\""
    },
    {
      "id": "08c384dd-e894-44a2-af22-f8208254389b",
      "name": "Sibunag",
      "cityCode": "GUI-05",
      "provinceCode": "GUI",
      "createdAt": "2025-10-04T04:07:39.915698Z",
      "updatedAt": "2025-10-04T04:07:39.915698Z",
      "_etag": "\"040009e9-0000-2400-0000-68e0a17e0000\""
    },
    {
      "id": "a2fa784e-c55e-4e26-8b76-bf0091fa7594",
      "name": "Sibutad",
      "cityCode": "ZAN-17",
      "provinceCode": "ZAN",
      "createdAt": "2025-10-04T04:07:39.915692Z",
      "updatedAt": "2025-10-04T04:07:39.915692Z",
      "_etag": "\"0400dfe6-0000-2400-0000-68e0a1680000\""
    },
    {
      "id": "7c0afed1-4664-44d2-9a46-a38922af1491",
      "name": "Sibutu",
      "cityCode": "TAW-11",
      "provinceCode": "TAW",
      "createdAt": "2025-10-04T04:07:39.9157Z",
      "updatedAt": "2025-10-04T04:07:39.9157Z",
      "_etag": "\"040084e9-0000-2400-0000-68e0a1850000\""
    },
    {
      "id": "ba9670f3-35e7-4443-81b8-04b75bd8f110",
      "name": "Sierra Bullones",
      "cityCode": "BOH-40",
      "provinceCode": "BOH",
      "createdAt": "2025-10-04T04:07:39.9157Z",
      "updatedAt": "2025-10-04T04:07:39.9157Z",
      "_etag": "\"0400afe9-0000-2400-0000-68e0a1860000\""
    },
    {
      "id": "c28cf3e8-a215-4131-8b36-bdc788a8358e",
      "name": "Sigay",
      "cityCode": "ILS-29",
      "provinceCode": "ILS",
      "createdAt": "2025-10-04T04:07:39.915697Z",
      "updatedAt": "2025-10-04T04:07:39.915698Z",
      "_etag": "\"0400bde8-0000-2400-0000-68e0a17b0000\""
    },
    {
      "id": "ad3f7791-510b-4809-87ba-b8bb9223775c",
      "name": "Sigma",
      "cityCode": "CAP-16",
      "provinceCode": "CAP",
      "createdAt": "2025-10-04T04:07:39.915693Z",
      "updatedAt": "2025-10-04T04:07:39.915693Z",
      "_etag": "\"0400eae6-0000-2400-0000-68e0a1680000\""
    },
    {
      "id": "c4504196-19fa-4959-be21-deb15bb91d94",
      "name": "Sikatuna",
      "cityCode": "BOH-41",
      "provinceCode": "BOH",
      "createdAt": "2025-10-04T04:07:39.915693Z",
      "updatedAt": "2025-10-04T04:07:39.915693Z",
      "_etag": "\"040027e7-0000-2400-0000-68e0a16a0000\""
    },
    {
      "id": "180e1415-2661-4c5e-bc56-9f259dfd7de3",
      "name": "Silago",
      "cityCode": "SLE-16",
      "provinceCode": "SLE",
      "createdAt": "2025-10-04T04:07:39.915695Z",
      "updatedAt": "2025-10-04T04:07:39.915696Z",
      "_etag": "\"04003ce8-0000-2400-0000-68e0a1750000\""
    },
    {
      "id": "43741964-5615-4964-a44c-fcd323c3aeff",
      "name": "Silang",
      "cityCode": "CAV-18",
      "provinceCode": "CAV",
      "createdAt": "2025-10-04T04:07:39.915759Z",
      "updatedAt": "2025-10-04T04:07:39.915759Z",
      "_etag": "\"0400bfea-0000-2400-0000-68e0a1930000\""
    },
    {
      "id": "e5082ced-2f14-4bfb-9e36-a548d79016e6",
      "name": "Silay City",
      "cityCode": "NEC-26",
      "provinceCode": "NEC",
      "createdAt": "2025-10-04T04:07:39.915694Z",
      "updatedAt": "2025-10-04T04:07:39.915694Z",
      "_etag": "\"040088e7-0000-2400-0000-68e0a16e0000\""
    },
    {
      "id": "a104961e-1043-4fa0-abf4-99eeefaeb305",
      "name": "Silvino Lobos",
      "cityCode": "NSA-22",
      "provinceCode": "NSA",
      "createdAt": "2025-10-04T04:07:39.915698Z",
      "updatedAt": "2025-10-04T04:07:39.915698Z",
      "_etag": "\"040025e9-0000-2400-0000-68e0a1800000\""
    },
    {
      "id": "03df5345-4ce4-4b44-bbf4-78f3ef8b8539",
      "name": "Simunul",
      "cityCode": "TAW-04",
      "provinceCode": "TAW",
      "createdAt": "2025-10-04T04:07:39.915698Z",
      "updatedAt": "2025-10-04T04:07:39.915698Z",
      "_etag": "\"0400ede8-0000-2400-0000-68e0a17d0000\""
    },
    {
      "id": "6afa261e-c80b-4eac-84bc-5cc659cee541",
      "name": "Sinacaban",
      "cityCode": "MSC-14",
      "provinceCode": "MSC",
      "createdAt": "2025-10-04T04:07:39.915699Z",
      "updatedAt": "2025-10-04T04:07:39.915699Z",
      "_etag": "\"040037e9-0000-2400-0000-68e0a1800000\""
    },
    {
      "id": "3337e2a3-eb47-4887-b089-cefcdcad7d98",
      "name": "Sinait",
      "cityCode": "ILS-30",
      "provinceCode": "ILS",
      "createdAt": "2025-10-04T04:07:39.915693Z",
      "updatedAt": "2025-10-04T04:07:39.915693Z",
      "_etag": "\"040032e7-0000-2400-0000-68e0a16b0000\""
    },
    {
      "id": "0dbf3241-552c-4b7f-b57b-818635c5587d",
      "name": "Sindangan",
      "cityCode": "ZAN-18",
      "provinceCode": "ZAN",
      "createdAt": "2025-10-04T04:07:39.915693Z",
      "updatedAt": "2025-10-04T04:07:39.915693Z",
      "_etag": "\"0400fde6-0000-2400-0000-68e0a1690000\""
    },
    {
      "id": "a396357c-f626-49bd-9eba-8bbe49a47737",
      "name": "Siniloan",
      "cityCode": "LAG-29",
      "provinceCode": "LAG",
      "createdAt": "2025-10-04T04:07:39.915696Z",
      "updatedAt": "2025-10-04T04:07:39.915696Z",
      "_etag": "\"040067e8-0000-2400-0000-68e0a1770000\""
    },
    {
      "id": "2669fd8f-c66a-412b-aab1-c4d97c0724d3",
      "name": "Siocon",
      "cityCode": "ZAN-19",
      "provinceCode": "ZAN",
      "createdAt": "2025-10-04T04:07:39.915757Z",
      "updatedAt": "2025-10-04T04:07:39.915757Z",
      "_etag": "\"040035ea-0000-2400-0000-68e0a18d0000\""
    },
    {
      "id": "0d13fb00-a06e-4210-9bb5-f40df761f38c",
      "name": "Sipocot",
      "cityCode": "CAS-34",
      "provinceCode": "CAS",
      "createdAt": "2025-10-04T04:07:39.915694Z",
      "updatedAt": "2025-10-04T04:07:39.915694Z",
      "_etag": "\"040070e7-0000-2400-0000-68e0a16d0000\""
    },
    {
      "id": "ad1faebe-2e9a-407c-98cb-a7a8d6a9f9ef",
      "name": "Siquijor (Capital)",
      "cityCode": "SIQ-06",
      "provinceCode": "SIQ",
      "createdAt": "2025-10-04T04:07:39.915698Z",
      "updatedAt": "2025-10-04T04:07:39.915698Z",
      "_etag": "\"0400dde8-0000-2400-0000-68e0a17d0000\""
    },
    {
      "id": "bb4b5ea5-8d61-41fb-990c-e863edf01247",
      "name": "Sirawai",
      "cityCode": "ZAN-20",
      "provinceCode": "ZAN",
      "createdAt": "2025-10-04T04:07:39.915696Z",
      "updatedAt": "2025-10-04T04:07:39.915696Z",
      "_etag": "\"04005be8-0000-2400-0000-68e0a1760000\""
    },
    {
      "id": "0ffd6dec-ee8e-4204-badb-bec851480039",
      "name": "Siruma",
      "cityCode": "CAS-35",
      "provinceCode": "CAS",
      "createdAt": "2025-10-04T04:07:39.915696Z",
      "updatedAt": "2025-10-04T04:07:39.915696Z",
      "_etag": "\"04007ce8-0000-2400-0000-68e0a1780000\""
    },
    {
      "id": "4dd77644-545c-464d-b424-fe288552bd1b",
      "name": "Sison",
      "cityCode": "PAN-41",
      "provinceCode": "PAN",
      "createdAt": "2025-10-04T04:07:39.915693Z",
      "updatedAt": "2025-10-04T04:07:39.915693Z",
      "_etag": "\"040056e7-0000-2400-0000-68e0a16c0000\""
    },
    {
      "id": "b74f0ced-cc70-4403-98ec-6a9a63cc4318",
      "name": "Sison",
      "cityCode": "SUN-22",
      "provinceCode": "SUN",
      "createdAt": "2025-10-04T04:07:39.915695Z",
      "updatedAt": "2025-10-04T04:07:39.915695Z",
      "_etag": "\"0400ffe7-0000-2400-0000-68e0a1730000\""
    },
    {
      "id": "0aa89f42-ff4f-45f3-bd08-2ade2ecb65b7",
      "name": "Sitangkai",
      "cityCode": "TAW-05",
      "provinceCode": "TAW",
      "createdAt": "2025-10-04T04:07:39.915758Z",
      "updatedAt": "2025-10-04T04:07:39.915758Z",
      "_etag": "\"040043ea-0000-2400-0000-68e0a18d0000\""
    },
    {
      "id": "91df423a-3df5-4553-9b20-d68e9a1f1906",
      "name": "Socorro",
      "cityCode": "SUN-23",
      "provinceCode": "SUN",
      "createdAt": "2025-10-04T04:07:39.915695Z",
      "updatedAt": "2025-10-04T04:07:39.915695Z",
      "_etag": "\"0400b8e7-0000-2400-0000-68e0a1700000\""
    },
    {
      "id": "93499789-8f58-4774-9d36-130ca1c323ad",
      "name": "Socorro",
      "cityCode": "MNR-14",
      "provinceCode": "MNR",
      "createdAt": "2025-10-04T04:07:39.915759Z",
      "updatedAt": "2025-10-04T04:07:39.915759Z",
      "_etag": "\"0400f0ea-0000-2400-0000-68e0a1950000\""
    },
    {
      "id": "4292a4b4-6f55-4c15-a0b2-99f1528b8697",
      "name": "Sofronio Española",
      "cityCode": "PAL-24",
      "provinceCode": "PAL",
      "createdAt": "2025-10-04T04:07:39.915698Z",
      "updatedAt": "2025-10-04T04:07:39.915698Z",
      "_etag": "\"0400cfe8-0000-2400-0000-68e0a17c0000\""
    },
    {
      "id": "4d9356f6-42d6-4a94-b444-f137908b2673",
      "name": "Sogod",
      "cityCode": "SLE-17",
      "provinceCode": "SLE",
      "createdAt": "2025-10-04T04:07:39.915697Z",
      "updatedAt": "2025-10-04T04:07:39.915697Z",
      "_etag": "\"040093e8-0000-2400-0000-68e0a1790000\""
    },
    {
      "id": "00717a0b-9b40-4d0e-aac6-83de50eafefb",
      "name": "Sogod",
      "cityCode": "CEB-47",
      "provinceCode": "CEB",
      "createdAt": "2025-10-04T04:07:39.915757Z",
      "updatedAt": "2025-10-04T04:07:39.915757Z",
      "_etag": "\"040011ea-0000-2400-0000-68e0a18b0000\""
    },
    {
      "id": "ba9892b0-9ecd-4404-9ba2-d5b4f1bc30b9",
      "name": "Solana",
      "cityCode": "CAG-27",
      "provinceCode": "CAG",
      "createdAt": "2025-10-04T04:07:39.915693Z",
      "updatedAt": "2025-10-04T04:07:39.915693Z",
      "_etag": "\"04000de7-0000-2400-0000-68e0a16a0000\""
    },
    {
      "id": "b0010868-5c3a-47be-bc25-aa08ae1b503e",
      "name": "Solano",
      "cityCode": "NUV-13",
      "provinceCode": "NUV",
      "createdAt": "2025-10-04T04:07:39.915695Z",
      "updatedAt": "2025-10-04T04:07:39.915695Z",
      "_etag": "\"0400d6e7-0000-2400-0000-68e0a1710000\""
    },
    {
      "id": "5cb47636-ac03-4417-a17b-8cee416e9bd6",
      "name": "Solsona",
      "cityCode": "ILN-22",
      "provinceCode": "ILN",
      "createdAt": "2025-10-04T04:07:39.915757Z",
      "updatedAt": "2025-10-04T04:07:39.915757Z",
      "_etag": "\"04002fea-0000-2400-0000-68e0a18c0000\""
    },
    {
      "id": "afe8dc9d-7d68-4dc9-aa77-06a22d6a597e",
      "name": "Sominot (Don Mariano Marcos)",
      "cityCode": "ZAS-40",
      "provinceCode": "ZAS",
      "createdAt": "2025-10-04T04:07:39.91576Z",
      "updatedAt": "2025-10-04T04:07:39.91576Z",
      "_etag": "\"040004eb-0000-2400-0000-68e0a1960000\""
    },
    {
      "id": "de9dc7ff-7681-4bdd-ad49-8cba40062a32",
      "name": "South Ubian",
      "cityCode": "TAW-06",
      "provinceCode": "TAW",
      "createdAt": "2025-10-04T04:07:39.915694Z",
      "updatedAt": "2025-10-04T04:07:39.915694Z",
      "_etag": "\"0400a7e7-0000-2400-0000-68e0a16f0000\""
    },
    {
      "id": "14634952-7019-43cc-97f3-71ac95a86298",
      "name": "South Upi",
      "cityCode": "MAG-17",
      "provinceCode": "MAG",
      "createdAt": "2025-10-04T04:07:39.915697Z",
      "updatedAt": "2025-10-04T04:07:39.915697Z",
      "_etag": "\"04009ae8-0000-2400-0000-68e0a1790000\""
    },
    {
      "id": "94af87c7-d28b-433a-a49f-c6779e5199ad",
      "name": "Sual",
      "cityCode": "PAN-42",
      "provinceCode": "PAN",
      "createdAt": "2025-10-04T04:07:39.9157Z",
      "updatedAt": "2025-10-04T04:07:39.9157Z",
      "_etag": "\"0400bce9-0000-2400-0000-68e0a1870000\""
    },
    {
      "id": "9a4e7070-68b9-4d28-ab2b-3abf21d91242",
      "name": "Subic",
      "cityCode": "ZAM-14",
      "provinceCode": "ZAM",
      "createdAt": "2025-10-04T04:07:39.915758Z",
      "updatedAt": "2025-10-04T04:07:39.915758Z",
      "_etag": "\"040061ea-0000-2400-0000-68e0a18f0000\""
    },
    {
      "id": "f41f8b55-3372-40bd-8c34-d88a9fde40b9",
      "name": "Sudipen",
      "cityCode": "LAU-19",
      "provinceCode": "LAU",
      "createdAt": "2025-10-04T04:07:39.915694Z",
      "updatedAt": "2025-10-04T04:07:39.915694Z",
      "_etag": "\"04009fe7-0000-2400-0000-68e0a16f0000\""
    },
    {
      "id": "9554e351-5332-45be-a10b-0705d89fb5d6",
      "name": "Sugbongcogon",
      "cityCode": "MSR-23",
      "provinceCode": "MSR",
      "createdAt": "2025-10-04T04:07:39.915695Z",
      "updatedAt": "2025-10-04T04:07:39.915695Z",
      "_etag": "\"0400eae7-0000-2400-0000-68e0a1720000\""
    },
    {
      "id": "33d57c8f-f5ca-4c34-92ae-e5fdd494f5cd",
      "name": "Sugpon",
      "cityCode": "ILS-31",
      "provinceCode": "ILS",
      "createdAt": "2025-10-04T04:07:39.915699Z",
      "updatedAt": "2025-10-04T04:07:39.915699Z",
      "_etag": "\"040048e9-0000-2400-0000-68e0a1810000\""
    },
    {
      "id": "9008ca8d-666a-4857-bf4b-86807b5ec5f2",
      "name": "Sulat",
      "cityCode": "EAS-22",
      "provinceCode": "EAS",
      "createdAt": "2025-10-04T04:07:39.915759Z",
      "updatedAt": "2025-10-04T04:07:39.91576Z",
      "_etag": "\"0400fdea-0000-2400-0000-68e0a1960000\""
    },
    {
      "id": "e43b01d2-7f9c-4654-be20-96f7775d4ed7",
      "name": "Sulop",
      "cityCode": "DAS-14",
      "provinceCode": "DAS",
      "createdAt": "2025-10-04T04:07:39.915695Z",
      "updatedAt": "2025-10-04T04:07:39.915695Z",
      "_etag": "\"040026e8-0000-2400-0000-68e0a1740000\""
    },
    {
      "id": "3ca6156a-43ca-4d67-a7c5-223fcdaffe43",
      "name": "Sultan Dumalondong",
      "cityCode": "LAN-40",
      "provinceCode": "LAN",
      "createdAt": "2025-10-04T04:07:39.915696Z",
      "updatedAt": "2025-10-04T04:07:39.915696Z",
      "_etag": "\"040070e8-0000-2400-0000-68e0a1770000\""
    },
    {
      "id": "c317b5b6-8b29-4f2c-8a17-a9c567c1f67a",
      "name": "Sultan Kudarat (Nuling)",
      "cityCode": "MAG-12",
      "provinceCode": "MAG",
      "createdAt": "2025-10-04T04:07:39.9157Z",
      "updatedAt": "2025-10-04T04:07:39.9157Z",
      "_etag": "\"0400a4e9-0000-2400-0000-68e0a1860000\""
    },
    {
      "id": "0c28fe53-89b6-4801-ba56-f55c4ee1e8c3",
      "name": "Sultan Mastura",
      "cityCode": "MAG-24",
      "provinceCode": "MAG",
      "createdAt": "2025-10-04T04:07:39.915759Z",
      "updatedAt": "2025-10-04T04:07:39.915759Z",
      "_etag": "\"0400ddea-0000-2400-0000-68e0a1940000\""
    },
    {
      "id": "f6223b36-fd77-4ea3-a531-9f9e19b24660",
      "name": "Sultan Naga Dimaporo (Karomatan)",
      "cityCode": "LAN-06",
      "provinceCode": "LAN",
      "createdAt": "2025-10-04T04:07:39.915694Z",
      "updatedAt": "2025-10-04T04:07:39.915694Z",
      "_etag": "\"04005ee7-0000-2400-0000-68e0a16c0000\""
    },
    {
      "id": "af76bd0d-143a-437e-a307-66408f10f047",
      "name": "Sultan Sa Barongis (Lambayong)",
      "cityCode": "MAG-13",
      "provinceCode": "MAG",
      "createdAt": "2025-10-04T04:07:39.915695Z",
      "updatedAt": "2025-10-04T04:07:39.915695Z",
      "_etag": "\"040012e8-0000-2400-0000-68e0a1730000\""
    },
    {
      "id": "5be58333-e34e-4709-baf6-ed77b075cdcb",
      "name": "Sumilao",
      "cityCode": "BUK-19",
      "provinceCode": "BUK",
      "createdAt": "2025-10-04T04:07:39.915698Z",
      "updatedAt": "2025-10-04T04:07:39.915698Z",
      "_etag": "\"040014e9-0000-2400-0000-68e0a17f0000\""
    },
    {
      "id": "08073674-b445-415a-8fca-b644109c4256",
      "name": "Sumisip",
      "cityCode": "BAS-05",
      "provinceCode": "BAS",
      "createdAt": "2025-10-04T04:07:39.91576Z",
      "updatedAt": "2025-10-04T04:07:39.91576Z",
      "_etag": "\"04000feb-0000-2400-0000-68e0a1970000\""
    },
    {
      "id": "3283a2ba-95a6-40a0-a07c-b0b4289a26cd",
      "name": "Surallah",
      "cityCode": "SCO-13",
      "provinceCode": "SCO",
      "createdAt": "2025-10-04T04:07:39.915696Z",
      "updatedAt": "2025-10-04T04:07:39.915696Z",
      "_etag": "\"04004de8-0000-2400-0000-68e0a1760000\""
    },
    {
      "id": "06e6d712-c211-478e-9e17-6a77644414eb",
      "name": "Surigao City (Capital)",
      "cityCode": "SUN-24",
      "provinceCode": "SUN",
      "createdAt": "2025-10-04T04:07:39.915692Z",
      "updatedAt": "2025-10-04T04:07:39.915692Z",
      "_etag": "\"0400bae6-0000-2400-0000-68e0a1660000\""
    },
    {
      "id": "46ab28d0-8a28-4701-b53f-30dd1187b691",
      "name": "Suyo",
      "cityCode": "ILS-32",
      "provinceCode": "ILS",
      "createdAt": "2025-10-04T04:07:39.915692Z",
      "updatedAt": "2025-10-04T04:07:39.915692Z",
      "_etag": "\"0400c9e6-0000-2400-0000-68e0a1670000\""
    },
    {
      "id": "b438d98d-ab34-4be5-98dd-2f32ba399a69",
      "name": "T'boli",
      "cityCode": "SCO-16",
      "provinceCode": "SCO",
      "createdAt": "2025-10-04T04:07:39.915693Z",
      "updatedAt": "2025-10-04T04:07:39.915693Z",
      "_etag": "\"040049e7-0000-2400-0000-68e0a16b0000\""
    },
    {
      "id": "580f8426-8cae-4e84-a1e9-123dd154884c",
      "name": "Taal",
      "cityCode": "BTG-29",
      "provinceCode": "BTG",
      "createdAt": "2025-10-04T04:07:39.915696Z",
      "updatedAt": "2025-10-04T04:07:39.915696Z",
      "_etag": "\"040048e8-0000-2400-0000-68e0a1750000\""
    },
    {
      "id": "47ea0d06-75ce-45ee-b44c-dc8cd1f627f5",
      "name": "Tabango",
      "cityCode": "LEY-45",
      "provinceCode": "LEY",
      "createdAt": "2025-10-04T04:07:39.915697Z",
      "updatedAt": "2025-10-04T04:07:39.915697Z",
      "_etag": "\"0400b1e8-0000-2400-0000-68e0a17a0000\""
    },
    {
      "id": "ecdcae11-586a-47ce-9543-aef97c5b4003",
      "name": "Tabina",
      "cityCode": "ZAS-27",
      "provinceCode": "ZAS",
      "createdAt": "2025-10-04T04:07:39.915698Z",
      "updatedAt": "2025-10-04T04:07:39.915698Z",
      "_etag": "\"04001ee9-0000-2400-0000-68e0a17f0000\""
    },
    {
      "id": "4a62cfbd-f5bc-4b0e-a544-c6705f4d28bf",
      "name": "Tabogon",
      "cityCode": "CEB-48",
      "provinceCode": "CEB",
      "createdAt": "2025-10-04T04:07:39.915699Z",
      "updatedAt": "2025-10-04T04:07:39.915699Z",
      "_etag": "\"040042e9-0000-2400-0000-68e0a1810000\""
    },
    {
      "id": "002fc4ad-a3c7-4b2d-820e-d814dc0dc820",
      "name": "Tabontabon",
      "cityCode": "LEY-46",
      "provinceCode": "LEY",
      "createdAt": "2025-10-04T04:07:39.915699Z",
      "updatedAt": "2025-10-04T04:07:39.915699Z",
      "_etag": "\"040055e9-0000-2400-0000-68e0a1820000\""
    },
    {
      "id": "1c084fdb-649e-4a20-b68b-5e85cf7a48f5",
      "name": "Tabuan-lasa",
      "cityCode": "BAS-13",
      "provinceCode": "BAS",
      "createdAt": "2025-10-04T04:07:39.915699Z",
      "updatedAt": "2025-10-04T04:07:39.915699Z",
      "_etag": "\"040060e9-0000-2400-0000-68e0a1830000\""
    },
    {
      "id": "35acb20c-33b5-4c7d-bae6-22fbc66432bd",
      "name": "Tabuelan",
      "cityCode": "CEB-49",
      "provinceCode": "CEB",
      "createdAt": "2025-10-04T04:07:39.9157Z",
      "updatedAt": "2025-10-04T04:07:39.9157Z",
      "_etag": "\"040069e9-0000-2400-0000-68e0a1830000\""
    },
    {
      "id": "82c02991-cbf1-4927-b606-4f27b763a946",
      "name": "Tacloban City (Capital)",
      "cityCode": "LEY-47",
      "provinceCode": "LEY",
      "createdAt": "2025-10-04T04:07:39.9157Z",
      "updatedAt": "2025-10-04T04:07:39.9157Z",
      "_etag": "\"04008de9-0000-2400-0000-68e0a1850000\""
    },
    {
      "id": "b29e5bf8-e280-468a-bea9-422e3880c9e0",
      "name": "Tadian",
      "cityCode": "MOU-10",
      "provinceCode": "MOU",
      "createdAt": "2025-10-04T04:07:39.915701Z",
      "updatedAt": "2025-10-04T04:07:39.915701Z",
      "_etag": "\"0400c9e9-0000-2400-0000-68e0a1880000\""
    },
    {
      "id": "c072ec86-9864-427b-b21a-4e00e49887dd",
      "name": "Taft",
      "cityCode": "EAS-23",
      "provinceCode": "EAS",
      "createdAt": "2025-10-04T04:07:39.915701Z",
      "updatedAt": "2025-10-04T04:07:39.915701Z",
      "_etag": "\"0400d3e9-0000-2400-0000-68e0a1890000\""
    },
    {
      "id": "09252cd1-56cb-43a6-b8f3-6643d0824262",
      "name": "Tagana-an",
      "cityCode": "SUN-25",
      "provinceCode": "SUN",
      "createdAt": "2025-10-04T04:07:39.915701Z",
      "updatedAt": "2025-10-04T04:07:39.915701Z",
      "_etag": "\"0400d8e9-0000-2400-0000-68e0a1890000\""
    },
    {
      "id": "c46db8b5-3444-4d29-b630-71b29952628a",
      "name": "Tagapul-an",
      "cityCode": "WSA-24",
      "provinceCode": "WSA",
      "createdAt": "2025-10-04T04:07:39.915701Z",
      "updatedAt": "2025-10-04T04:07:39.915701Z",
      "_etag": "\"0400e7e9-0000-2400-0000-68e0a1890000\""
    },
    {
      "id": "bd3897b3-0189-40b6-a381-92f24bf99f73",
      "name": "Tagaytay City",
      "cityCode": "CAV-19",
      "provinceCode": "CAV",
      "createdAt": "2025-10-04T04:07:39.915701Z",
      "updatedAt": "2025-10-04T04:07:39.915701Z",
      "_etag": "\"0400f4e9-0000-2400-0000-68e0a18a0000\""
    },
    {
      "id": "619eae74-0306-4124-b119-358dd0b34541",
      "name": "Tagbilaran City (Capital)",
      "cityCode": "BOH-42",
      "provinceCode": "BOH",
      "createdAt": "2025-10-04T04:07:39.915756Z",
      "updatedAt": "2025-10-04T04:07:39.915756Z",
      "_etag": "\"040003ea-0000-2400-0000-68e0a18b0000\""
    },
    {
      "id": "47eec1e8-3546-4c19-ad78-f76f2cd02326",
      "name": "Tagbina",
      "cityCode": "SUR-17",
      "provinceCode": "SUR",
      "createdAt": "2025-10-04T04:07:39.915757Z",
      "updatedAt": "2025-10-04T04:07:39.915757Z",
      "_etag": "\"040021ea-0000-2400-0000-68e0a18c0000\""
    },
    {
      "id": "4f23a99c-021b-486d-8c93-b4fbbc29338f",
      "name": "Tagkawayan",
      "cityCode": "QUE-46",
      "provinceCode": "QUE",
      "createdAt": "2025-10-04T04:07:39.915758Z",
      "updatedAt": "2025-10-04T04:07:39.915758Z",
      "_etag": "\"040076ea-0000-2400-0000-68e0a1900000\""
    },
    {
      "id": "abe0c017-43bb-4c46-ad61-cc7e83de7907",
      "name": "Tago",
      "cityCode": "SUR-18",
      "provinceCode": "SUR",
      "createdAt": "2025-10-04T04:07:39.915758Z",
      "updatedAt": "2025-10-04T04:07:39.915758Z",
      "_etag": "\"040049ea-0000-2400-0000-68e0a18e0000\""
    },
    {
      "id": "03ee3839-ec1b-4d48-99f5-a068dce32b42",
      "name": "Tagoloan",
      "cityCode": "LAN-20",
      "provinceCode": "LAN",
      "createdAt": "2025-10-04T04:07:39.915758Z",
      "updatedAt": "2025-10-04T04:07:39.915758Z",
      "_etag": "\"04005aea-0000-2400-0000-68e0a18f0000\""
    },
    {
      "id": "299255de-aab7-4f55-9df9-a770eba1f2e4",
      "name": "Tagoloan",
      "cityCode": "MSR-24",
      "provinceCode": "MSR",
      "createdAt": "2025-10-04T04:07:39.915758Z",
      "updatedAt": "2025-10-04T04:07:39.915758Z",
      "_etag": "\"04007cea-0000-2400-0000-68e0a1900000\""
    },
    {
      "id": "06a09051-c6ff-466e-a8ef-6cc65f9041b5",
      "name": "Tagoloan Ii",
      "cityCode": "LAN-38",
      "provinceCode": "LAN",
      "createdAt": "2025-10-04T04:07:39.915758Z",
      "updatedAt": "2025-10-04T04:07:39.915758Z",
      "_etag": "\"040094ea-0000-2400-0000-68e0a1910000\""
    },
    {
      "id": "e9adc7c5-3f28-47c6-af92-8efa9ee4e6ca",
      "name": "Tagudin",
      "cityCode": "ILS-33",
      "provinceCode": "ILS",
      "createdAt": "2025-10-04T04:07:39.915759Z",
      "updatedAt": "2025-10-04T04:07:39.915759Z",
      "_etag": "\"0400e9ea-0000-2400-0000-68e0a1950000\""
    },
    {
      "id": "ae691e9f-ecd1-4f47-9ea6-723f1b5f4221",
      "name": "Taguig City",
      "cityCode": "NCR4-07",
      "provinceCode": "NCR4",
      "createdAt": "2025-10-04T04:07:39.915759Z",
      "updatedAt": "2025-10-04T04:07:39.915759Z",
      "_etag": "\"0400a1ea-0000-2400-0000-68e0a1910000\""
    },
    {
      "id": "438eaee9-6763-49e6-879d-f7dee4f93192",
      "name": "Talacogon",
      "cityCode": "AGS-11",
      "provinceCode": "AGS",
      "createdAt": "2025-10-04T04:07:39.915759Z",
      "updatedAt": "2025-10-04T04:07:39.915759Z",
      "_etag": "\"0400b4ea-0000-2400-0000-68e0a1920000\""
    },
    {
      "id": "5bb5339b-c5e0-4077-ac4a-31fad5f0fa26",
      "name": "Talaingod",
      "cityCode": "DAN-22",
      "provinceCode": "DAN",
      "createdAt": "2025-10-04T04:07:39.915759Z",
      "updatedAt": "2025-10-04T04:07:39.915759Z",
      "_etag": "\"0400ceea-0000-2400-0000-68e0a1930000\""
    },
    {
      "id": "82d09aed-2d3d-46bd-8560-db6932d9eb1f",
      "name": "Talakag",
      "cityCode": "BUK-20",
      "provinceCode": "BUK",
      "createdAt": "2025-10-04T04:07:39.91576Z",
      "updatedAt": "2025-10-04T04:07:39.91576Z",
      "_etag": "\"04001aeb-0000-2400-0000-68e0a1970000\""
    },
    {
      "id": "1fbbdaff-9aac-41a6-8ae6-a84c7a8cb42a",
      "name": "Talalora",
      "cityCode": "WSA-19",
      "provinceCode": "WSA",
      "createdAt": "2025-10-04T04:07:39.91576Z",
      "updatedAt": "2025-10-04T04:07:39.915761Z",
      "_etag": "\"04002feb-0000-2400-0000-68e0a1990000\""
    },
    {
      "id": "7e162f21-6411-47a6-9ab8-0a214c3556a0",
      "name": "Talavera",
      "cityCode": "NUE-30",
      "provinceCode": "NUE",
      "createdAt": "2025-10-04T04:07:39.915761Z",
      "updatedAt": "2025-10-04T04:07:39.915761Z",
      "_etag": "\"040039eb-0000-2400-0000-68e0a1990000\""
    },
    {
      "id": "0c08ab1c-70e3-493b-bb67-80d379a981c4",
      "name": "Talayan",
      "cityCode": "MAG-16",
      "provinceCode": "MAG",
      "createdAt": "2025-10-04T04:07:39.91576Z",
      "updatedAt": "2025-10-04T04:07:39.91576Z",
      "_etag": "\"040027eb-0000-2400-0000-68e0a1980000\""
    },
    {
      "id": "be7225c0-c35d-40b6-ae60-47e2e517ee7f",
      "name": "Talibon",
      "cityCode": "BOH-43",
      "provinceCode": "BOH",
      "createdAt": "2025-10-04T04:07:39.915761Z",
      "updatedAt": "2025-10-04T04:07:39.915761Z",
      "_etag": "\"040062eb-0000-2400-0000-68e0a19b0000\""
    },
    {
      "id": "291493d6-3069-48b7-98de-510aa6603a95",
      "name": "Talipao",
      "cityCode": "SUL-13",
      "provinceCode": "SUL",
      "createdAt": "2025-10-04T04:07:39.915761Z",
      "updatedAt": "2025-10-04T04:07:39.915761Z",
      "_etag": "\"040086eb-0000-2400-0000-68e0a19d0000\""
    },
    {
      "id": "dadf5751-829e-4a9e-82db-f64541ee5d62",
      "name": "Talisay",
      "cityCode": "CAN-11",
      "provinceCode": "CAN",
      "createdAt": "2025-10-04T04:07:39.915766Z",
      "updatedAt": "2025-10-04T04:07:39.915766Z",
      "_etag": "\"0400abed-0000-2400-0000-68e0a1b30000\""
    },
    {
      "id": "f7dcd229-cb0f-4d4f-9b9f-1c2d93e32c62",
      "name": "Talisay",
      "cityCode": "BTG-30",
      "provinceCode": "BTG",
      "createdAt": "2025-10-04T04:07:39.915768Z",
      "updatedAt": "2025-10-04T04:07:39.915768Z",
      "_etag": "\"040011ee-0000-2400-0000-68e0a1b70000\""
    },
    {
      "id": "c7f91c94-cd44-4fd1-97cf-720f5f414389",
      "name": "Talisayan",
      "cityCode": "MSR-25",
      "provinceCode": "MSR",
      "createdAt": "2025-10-04T04:07:39.915761Z",
      "updatedAt": "2025-10-04T04:07:39.915761Z",
      "_etag": "\"040097eb-0000-2400-0000-68e0a19d0000\""
    },
    {
      "id": "dbb456a4-d6f1-4bd1-b324-8af9955231ae",
      "name": "Talitay",
      "cityCode": "MAG-21",
      "provinceCode": "MAG",
      "createdAt": "2025-10-04T04:07:39.915761Z",
      "updatedAt": "2025-10-04T04:07:39.915761Z",
      "_etag": "\"040043eb-0000-2400-0000-68e0a19a0000\""
    },
    {
      "id": "f97da5df-0327-43e1-af04-58d56efcea4c",
      "name": "Talugtug",
      "cityCode": "NUE-31",
      "provinceCode": "NUE",
      "createdAt": "2025-10-04T04:07:39.915761Z",
      "updatedAt": "2025-10-04T04:07:39.915761Z",
      "_etag": "\"040057eb-0000-2400-0000-68e0a19a0000\""
    },
    {
      "id": "085a4003-211f-4a82-8c12-57765c3e6831",
      "name": "Talusan",
      "cityCode": "ZSI-14",
      "provinceCode": "ZSI",
      "createdAt": "2025-10-04T04:07:39.915761Z",
      "updatedAt": "2025-10-04T04:07:39.915761Z",
      "_etag": "\"040079eb-0000-2400-0000-68e0a19c0000\""
    },
    {
      "id": "893c65ac-aeb0-4ca2-a806-74cc30d18a67",
      "name": "Tambulig",
      "cityCode": "ZAS-28",
      "provinceCode": "ZAS",
      "createdAt": "2025-10-04T04:07:39.915762Z",
      "updatedAt": "2025-10-04T04:07:39.915762Z",
      "_etag": "\"0400f1eb-0000-2400-0000-68e0a1a00000\""
    },
    {
      "id": "4509e490-6d8a-47b2-a522-c243984cb01e",
      "name": "Tampakan",
      "cityCode": "SCO-14",
      "provinceCode": "SCO",
      "createdAt": "2025-10-04T04:07:39.915762Z",
      "updatedAt": "2025-10-04T04:07:39.915763Z",
      "_etag": "\"040011ec-0000-2400-0000-68e0a1a10000\""
    },
    {
      "id": "975f1d77-035e-4104-8f9e-da3fa273f55f",
      "name": "Tamparan",
      "cityCode": "LAN-26",
      "provinceCode": "LAN",
      "createdAt": "2025-10-04T04:07:39.91577Z",
      "updatedAt": "2025-10-04T04:07:39.91577Z",
      "_etag": "\"040006ef-0000-2400-0000-68e0a1bf0000\""
    },
    {
      "id": "737d2150-0ceb-485e-a115-b13553d44122",
      "name": "Tampilisan",
      "cityCode": "ZAN-21",
      "provinceCode": "ZAN",
      "createdAt": "2025-10-04T04:07:39.915767Z",
      "updatedAt": "2025-10-04T04:07:39.915767Z",
      "_etag": "\"040007ee-0000-2400-0000-68e0a1b60000\""
    },
    {
      "id": "f3147133-3478-4471-891a-6833dcb7eace",
      "name": "Tanauan",
      "cityCode": "LEY-48",
      "provinceCode": "LEY",
      "createdAt": "2025-10-04T04:07:39.915763Z",
      "updatedAt": "2025-10-04T04:07:39.915763Z",
      "_etag": "\"04002cec-0000-2400-0000-68e0a1a20000\""
    },
    {
      "id": "36f4a8f3-f0dc-4755-8b1f-596383d7af60",
      "name": "Tanay",
      "cityCode": "RIZ-12",
      "provinceCode": "RIZ",
      "createdAt": "2025-10-04T04:07:39.915762Z",
      "updatedAt": "2025-10-04T04:07:39.915762Z",
      "_etag": "\"0400b5eb-0000-2400-0000-68e0a19e0000\""
    },
    {
      "id": "fd4afa0a-76ff-4130-8d31-7d2506599697",
      "name": "Tandubas",
      "cityCode": "TAW-07",
      "provinceCode": "TAW",
      "createdAt": "2025-10-04T04:07:39.915762Z",
      "updatedAt": "2025-10-04T04:07:39.915762Z",
      "_etag": "\"0400e6eb-0000-2400-0000-68e0a1a00000\""
    },
    {
      "id": "f7d6d103-adc5-4b7c-9195-340b3fab520d",
      "name": "Tangalan",
      "cityCode": "AKL-17",
      "provinceCode": "AKL",
      "createdAt": "2025-10-04T04:07:39.915762Z",
      "updatedAt": "2025-10-04T04:07:39.915762Z",
      "_etag": "\"040008ec-0000-2400-0000-68e0a1a10000\""
    },
    {
      "id": "6d8a9f60-294c-48c8-8cdd-395f2a1b034d",
      "name": "Tangcal",
      "cityCode": "LAN-21",
      "provinceCode": "LAN",
      "createdAt": "2025-10-04T04:07:39.915763Z",
      "updatedAt": "2025-10-04T04:07:39.915763Z",
      "_etag": "\"04006aec-0000-2400-0000-68e0a1a50000\""
    },
    {
      "id": "ba66b34d-90e0-44dd-aef0-9fbda308ff03",
      "name": "Tangub City",
      "cityCode": "MSC-15",
      "provinceCode": "MSC",
      "createdAt": "2025-10-04T04:07:39.915763Z",
      "updatedAt": "2025-10-04T04:07:39.915763Z",
      "_etag": "\"040095ec-0000-2400-0000-68e0a1a70000\""
    },
    {
      "id": "75050ca7-ed48-49ee-a25a-73906f4254d8",
      "name": "Tantangan",
      "cityCode": "SCO-15",
      "provinceCode": "SCO",
      "createdAt": "2025-10-04T04:07:39.915773Z",
      "updatedAt": "2025-10-04T04:07:39.915773Z",
      "_etag": "\"04003af0-0000-2400-0000-68e0a1cc0000\""
    },
    {
      "id": "994108e3-ee9f-4a5c-81cc-9946cfdbc081",
      "name": "Tanudan",
      "cityCode": "KAL-14",
      "provinceCode": "KAL",
      "createdAt": "2025-10-04T04:07:39.915768Z",
      "updatedAt": "2025-10-04T04:07:39.915768Z",
      "_etag": "\"040051ee-0000-2400-0000-68e0a1b90000\""
    },
    {
      "id": "00903e65-9bb9-4bd0-906b-216a9b5ec8f5",
      "name": "Tanza",
      "cityCode": "CAV-20",
      "provinceCode": "CAV",
      "createdAt": "2025-10-04T04:07:39.915763Z",
      "updatedAt": "2025-10-04T04:07:39.915763Z",
      "_etag": "\"04009fec-0000-2400-0000-68e0a1a80000\""
    },
    {
      "id": "21f7e4f8-a03e-4ad6-b9d2-488a775e3ad7",
      "name": "Tapaz",
      "cityCode": "CAP-17",
      "provinceCode": "CAP",
      "createdAt": "2025-10-04T04:07:39.915763Z",
      "updatedAt": "2025-10-04T04:07:39.915763Z",
      "_etag": "\"040040ec-0000-2400-0000-68e0a1a30000\""
    },
    {
      "id": "7b8e45cb-e984-4fe5-80c1-0176a8341556",
      "name": "Tapul",
      "cityCode": "SUL-14",
      "provinceCode": "SUL",
      "createdAt": "2025-10-04T04:07:39.915763Z",
      "updatedAt": "2025-10-04T04:07:39.915763Z",
      "_etag": "\"04004dec-0000-2400-0000-68e0a1a40000\""
    },
    {
      "id": "cbf69b7e-02c3-4db3-a717-2396113715a9",
      "name": "Taraka",
      "cityCode": "LAN-27",
      "provinceCode": "LAN",
      "createdAt": "2025-10-04T04:07:39.915763Z",
      "updatedAt": "2025-10-04T04:07:39.915763Z",
      "_etag": "\"040082ec-0000-2400-0000-68e0a1a60000\""
    },
    {
      "id": "01214dfb-c9d8-43b5-9f2e-2bb411454dda",
      "name": "Tarangnan",
      "cityCode": "WSA-20",
      "provinceCode": "WSA",
      "createdAt": "2025-10-04T04:07:39.915764Z",
      "updatedAt": "2025-10-04T04:07:39.915764Z",
      "_etag": "\"0400dbec-0000-2400-0000-68e0a1aa0000\""
    },
    {
      "id": "c51e5d25-4985-435f-82ac-f21bcaf58797",
      "name": "Tarragona",
      "cityCode": "DAR-11",
      "provinceCode": "DAR",
      "createdAt": "2025-10-04T04:07:39.915764Z",
      "updatedAt": "2025-10-04T04:07:39.915764Z",
      "_etag": "\"0400fbec-0000-2400-0000-68e0a1ab0000\""
    },
    {
      "id": "e39ea15b-904f-42b1-947a-82699d4a2558",
      "name": "Tayasan",
      "cityCode": "NER-22",
      "provinceCode": "NER",
      "createdAt": "2025-10-04T04:07:39.915773Z",
      "updatedAt": "2025-10-04T04:07:39.915773Z",
      "_etag": "\"040050f0-0000-2400-0000-68e0a1cd0000\""
    },
    {
      "id": "dce73c00-c46c-4104-9a16-477ca1053080",
      "name": "Taysan",
      "cityCode": "BTG-32",
      "provinceCode": "BTG",
      "createdAt": "2025-10-04T04:07:39.915769Z",
      "updatedAt": "2025-10-04T04:07:39.915769Z",
      "_etag": "\"0400a9ee-0000-2400-0000-68e0a1bc0000\""
    },
    {
      "id": "c4ff7377-6914-48e2-876f-b37ff2120be3",
      "name": "Taytay",
      "cityCode": "PAL-20",
      "provinceCode": "PAL",
      "createdAt": "2025-10-04T04:07:39.915764Z",
      "updatedAt": "2025-10-04T04:07:39.915764Z",
      "_etag": "\"0400b7ec-0000-2400-0000-68e0a1a90000\""
    },
    {
      "id": "6ca4fdc4-1555-4edf-88e8-7ee1f67b9d47",
      "name": "Taytay",
      "cityCode": "RIZ-13",
      "provinceCode": "RIZ",
      "createdAt": "2025-10-04T04:07:39.915764Z",
      "updatedAt": "2025-10-04T04:07:39.915764Z",
      "_etag": "\"040008ed-0000-2400-0000-68e0a1ab0000\""
    },
    {
      "id": "44decbc8-3ee0-41d7-b30d-475eb212b7de",
      "name": "Tayug",
      "cityCode": "PAN-43",
      "provinceCode": "PAN",
      "createdAt": "2025-10-04T04:07:39.915764Z",
      "updatedAt": "2025-10-04T04:07:39.915764Z",
      "_etag": "\"0400cbec-0000-2400-0000-68e0a1a90000\""
    },
    {
      "id": "d0734008-4f9d-442c-b259-0f7e575809e4",
      "name": "Tayum",
      "cityCode": "ABR-24",
      "provinceCode": "ABR",
      "createdAt": "2025-10-04T04:07:39.915764Z",
      "updatedAt": "2025-10-04T04:07:39.915764Z",
      "_etag": "\"0400f2ec-0000-2400-0000-68e0a1aa0000\""
    },
    {
      "id": "a5070ff9-0553-4f89-9de4-b18b85d450ec",
      "name": "Teresa",
      "cityCode": "RIZ-14",
      "provinceCode": "RIZ",
      "createdAt": "2025-10-04T04:07:39.915764Z",
      "updatedAt": "2025-10-04T04:07:39.915764Z",
      "_etag": "\"040015ed-0000-2400-0000-68e0a1ac0000\""
    },
    {
      "id": "d7e6b9ae-b1d6-4a29-b480-9074207cd0c0",
      "name": "Ternate",
      "cityCode": "CAV-21",
      "provinceCode": "CAV",
      "createdAt": "2025-10-04T04:07:39.915765Z",
      "updatedAt": "2025-10-04T04:07:39.915765Z",
      "_etag": "\"04002ded-0000-2400-0000-68e0a1ad0000\""
    },
    {
      "id": "11e574d5-a551-476f-b84a-375a7e3dcfe1",
      "name": "Tiaong",
      "cityCode": "QUE-48",
      "provinceCode": "QUE",
      "createdAt": "2025-10-04T04:07:39.915778Z",
      "updatedAt": "2025-10-04T04:07:39.915778Z",
      "_etag": "\"04009cf0-0000-2400-0000-68e0a1d10000\""
    },
    {
      "id": "83f8fdc0-a3b7-430c-a51a-45395d6a2f3f",
      "name": "Tibiao",
      "cityCode": "ANT-17",
      "provinceCode": "ANT",
      "createdAt": "2025-10-04T04:07:39.91577Z",
      "updatedAt": "2025-10-04T04:07:39.91577Z",
      "_etag": "\"040023ef-0000-2400-0000-68e0a1c00000\""
    },
    {
      "id": "ef21511c-90d5-47c7-bc73-d8faea0e6772",
      "name": "Tigaon",
      "cityCode": "CAS-36",
      "provinceCode": "CAS",
      "createdAt": "2025-10-04T04:07:39.915765Z",
      "updatedAt": "2025-10-04T04:07:39.915765Z",
      "_etag": "\"040039ed-0000-2400-0000-68e0a1ae0000\""
    },
    {
      "id": "dab72cef-0b38-47f9-9783-0d2d3d1eadcc",
      "name": "Tigbao",
      "cityCode": "ZAS-44",
      "provinceCode": "ZAS",
      "createdAt": "2025-10-04T04:07:39.915764Z",
      "updatedAt": "2025-10-04T04:07:39.915765Z",
      "_etag": "\"040023ed-0000-2400-0000-68e0a1ad0000\""
    },
    {
      "id": "48e11ac9-05f3-403a-99db-4bcf2225c86a",
      "name": "Tigbauan",
      "cityCode": "ILO-45",
      "provinceCode": "ILO",
      "createdAt": "2025-10-04T04:07:39.915765Z",
      "updatedAt": "2025-10-04T04:07:39.915765Z",
      "_etag": "\"040049ed-0000-2400-0000-68e0a1af0000\""
    },
    {
      "id": "69eb45e1-aed0-4038-acbd-84a7338dc30e",
      "name": "Tinambac",
      "cityCode": "CAS-37",
      "provinceCode": "CAS",
      "createdAt": "2025-10-04T04:07:39.915765Z",
      "updatedAt": "2025-10-04T04:07:39.915765Z",
      "_etag": "\"040051ed-0000-2400-0000-68e0a1af0000\""
    },
    {
      "id": "2d76b6f0-b19b-41f3-b3f2-a8536f63d7b8",
      "name": "Tineg",
      "cityCode": "ABR-25",
      "provinceCode": "ABR",
      "createdAt": "2025-10-04T04:07:39.915765Z",
      "updatedAt": "2025-10-04T04:07:39.915765Z",
      "_etag": "\"040056ed-0000-2400-0000-68e0a1b00000\""
    },
    {
      "id": "7392f167-d650-45df-bfee-ec2ddc6ecd2b",
      "name": "Tinglayan",
      "cityCode": "KAL-15",
      "provinceCode": "KAL",
      "createdAt": "2025-10-04T04:07:39.915766Z",
      "updatedAt": "2025-10-04T04:07:39.915766Z",
      "_etag": "\"040061ed-0000-2400-0000-68e0a1b10000\""
    },
    {
      "id": "dbc351b9-ed95-461a-88d4-93fb709cb24e",
      "name": "Tingloy",
      "cityCode": "BTG-33",
      "provinceCode": "BTG",
      "createdAt": "2025-10-04T04:07:39.915768Z",
      "updatedAt": "2025-10-04T04:07:39.915768Z",
      "_etag": "\"04002bee-0000-2400-0000-68e0a1b80000\""
    },
    {
      "id": "d68611a1-d5a1-400a-9806-5386a6941270",
      "name": "Tinoc",
      "cityCode": "IFU-10",
      "provinceCode": "IFU",
      "createdAt": "2025-10-04T04:07:39.915769Z",
      "updatedAt": "2025-10-04T04:07:39.915769Z",
      "_etag": "\"0400e1ee-0000-2400-0000-68e0a1be0000\""
    },
    {
      "id": "b6a8f908-2145-4d2d-ba91-3e838bc171b7",
      "name": "Tipo-tipo",
      "cityCode": "BAS-06",
      "provinceCode": "BAS",
      "createdAt": "2025-10-04T04:07:39.915766Z",
      "updatedAt": "2025-10-04T04:07:39.915766Z",
      "_etag": "\"04007aed-0000-2400-0000-68e0a1b10000\""
    },
    {
      "id": "42790c9e-6182-4c8a-b91f-2e7bc2a01883",
      "name": "Titay",
      "cityCode": "ZSI-15",
      "provinceCode": "ZSI",
      "createdAt": "2025-10-04T04:07:39.915766Z",
      "updatedAt": "2025-10-04T04:07:39.915766Z",
      "_etag": "\"040082ed-0000-2400-0000-68e0a1b20000\""
    },
    {
      "id": "347182f3-1306-49f3-ab37-a08cc9d5dc64",
      "name": "Tiwi",
      "cityCode": "ALB-18",
      "provinceCode": "ALB",
      "createdAt": "2025-10-04T04:07:39.915766Z",
      "updatedAt": "2025-10-04T04:07:39.915766Z",
      "_etag": "\"04008ded-0000-2400-0000-68e0a1b20000\""
    },
    {
      "id": "591dc1aa-0295-4674-896a-011c0431e4a2",
      "name": "Tobias Fornier (Dao)",
      "cityCode": "ANT-07",
      "provinceCode": "ANT",
      "createdAt": "2025-10-04T04:07:39.915766Z",
      "updatedAt": "2025-10-04T04:07:39.915766Z",
      "_etag": "\"0400a3ed-0000-2400-0000-68e0a1b30000\""
    },
    {
      "id": "2a25b043-d609-4afe-8faa-5121fb1cf9a0",
      "name": "Toboso",
      "cityCode": "NEC-29",
      "provinceCode": "NEC",
      "createdAt": "2025-10-04T04:07:39.915766Z",
      "updatedAt": "2025-10-04T04:07:39.915766Z",
      "_etag": "\"0400baed-0000-2400-0000-68e0a1b40000\""
    },
    {
      "id": "ccfe1514-b72e-4f28-9f44-dfb16baa691d",
      "name": "Toledo City",
      "cityCode": "CEB-51",
      "provinceCode": "CEB",
      "createdAt": "2025-10-04T04:07:39.915767Z",
      "updatedAt": "2025-10-04T04:07:39.915767Z",
      "_etag": "\"0400caed-0000-2400-0000-68e0a1b50000\""
    },
    {
      "id": "07474970-1c27-47c5-923b-b287f165a715",
      "name": "Tolosa",
      "cityCode": "LEY-49",
      "provinceCode": "LEY",
      "createdAt": "2025-10-04T04:07:39.915768Z",
      "updatedAt": "2025-10-04T04:07:39.915768Z",
      "_etag": "\"040043ee-0000-2400-0000-68e0a1b90000\""
    },
    {
      "id": "062ee0e5-1421-4e32-b910-13ad90272e8f",
      "name": "Tomas Oppus",
      "cityCode": "SLE-18",
      "provinceCode": "SLE",
      "createdAt": "2025-10-04T04:07:39.91577Z",
      "updatedAt": "2025-10-04T04:07:39.91577Z",
      "_etag": "\"040019ef-0000-2400-0000-68e0a1c00000\""
    },
    {
      "id": "f00289ab-82f3-4ede-a417-abd231e4171c",
      "name": "Tondo I / II",
      "cityCode": "NCR1-01",
      "provinceCode": "NCR1",
      "createdAt": "2025-10-04T04:07:39.915767Z",
      "updatedAt": "2025-10-04T04:07:39.915767Z",
      "_etag": "\"0400d7ed-0000-2400-0000-68e0a1b50000\""
    },
    {
      "id": "cf436738-bcb6-4e6d-9000-8d9dcb01dc8e",
      "name": "Tongkil",
      "cityCode": "SUL-15",
      "provinceCode": "SUL",
      "createdAt": "2025-10-04T04:07:39.915767Z",
      "updatedAt": "2025-10-04T04:07:39.915767Z",
      "_etag": "\"0400e4ed-0000-2400-0000-68e0a1b50000\""
    },
    {
      "id": "ed4c17cf-099c-4a3a-8795-510eec020244",
      "name": "Torrijos",
      "cityCode": "MAD-06",
      "provinceCode": "MAD",
      "createdAt": "2025-10-04T04:07:39.915767Z",
      "updatedAt": "2025-10-04T04:07:39.915767Z",
      "_etag": "\"0400f7ed-0000-2400-0000-68e0a1b60000\""
    },
    {
      "id": "c0e28f20-81ba-4d3b-b280-dbc18b8be2f8",
      "name": "Trece Martires City (Capital)",
      "cityCode": "CAV-22",
      "provinceCode": "CAV",
      "createdAt": "2025-10-04T04:07:39.915771Z",
      "updatedAt": "2025-10-04T04:07:39.915771Z",
      "_etag": "\"040079ef-0000-2400-0000-68e0a1c40000\""
    },
    {
      "id": "53a74225-17de-40f5-b717-6521d0ed9106",
      "name": "Trento",
      "cityCode": "AGS-12",
      "provinceCode": "AGS",
      "createdAt": "2025-10-04T04:07:39.915768Z",
      "updatedAt": "2025-10-04T04:07:39.915768Z",
      "_etag": "\"04001cee-0000-2400-0000-68e0a1b70000\""
    },
    {
      "id": "bbb591ef-ce15-4ece-a582-a27a3023a5a5",
      "name": "Trinidad",
      "cityCode": "BOH-44",
      "provinceCode": "BOH",
      "createdAt": "2025-10-04T04:07:39.915779Z",
      "updatedAt": "2025-10-04T04:07:39.915779Z",
      "_etag": "\"040026f1-0000-2400-0000-68e0a1d70000\""
    },
    {
      "id": "ffb78fcd-9a2d-44b6-b0a0-c8a63290de7b",
      "name": "Tuao",
      "cityCode": "CAG-28",
      "provinceCode": "CAG",
      "createdAt": "2025-10-04T04:07:39.915768Z",
      "updatedAt": "2025-10-04T04:07:39.915768Z",
      "_etag": "\"040060ee-0000-2400-0000-68e0a1ba0000\""
    },
    {
      "id": "98a9232c-fb7d-445b-a9d1-a1f1dba84525",
      "name": "Tuba",
      "cityCode": "BEN-13",
      "provinceCode": "BEN",
      "createdAt": "2025-10-04T04:07:39.915768Z",
      "updatedAt": "2025-10-04T04:07:39.915768Z",
      "_etag": "\"040081ee-0000-2400-0000-68e0a1bb0000\""
    },
    {
      "id": "93ef83f2-9ecd-42be-b100-3d479a727f54",
      "name": "Tubajon",
      "cityCode": "DIN-07",
      "provinceCode": "DIN",
      "createdAt": "2025-10-04T04:07:39.915768Z",
      "updatedAt": "2025-10-04T04:07:39.915768Z",
      "_etag": "\"040071ee-0000-2400-0000-68e0a1ba0000\""
    },
    {
      "id": "6e10d5fe-4e40-4eb6-9a64-15417a988fb6",
      "name": "Tubao",
      "cityCode": "LAU-20",
      "provinceCode": "LAU",
      "createdAt": "2025-10-04T04:07:39.915769Z",
      "updatedAt": "2025-10-04T04:07:39.915769Z",
      "_etag": "\"040095ee-0000-2400-0000-68e0a1bb0000\""
    },
    {
      "id": "9033de1d-584a-432d-8b40-770c7154f2f4",
      "name": "Tubaran",
      "cityCode": "LAN-28",
      "provinceCode": "LAN",
      "createdAt": "2025-10-04T04:07:39.915769Z",
      "updatedAt": "2025-10-04T04:07:39.915769Z",
      "_etag": "\"0400b4ee-0000-2400-0000-68e0a1bc0000\""
    },
    {
      "id": "92b13446-ee56-4a77-8810-573c2bfd4b2d",
      "name": "Tubay",
      "cityCode": "AGN-11",
      "provinceCode": "AGN",
      "createdAt": "2025-10-04T04:07:39.915769Z",
      "updatedAt": "2025-10-04T04:07:39.915769Z",
      "_etag": "\"0400c3ee-0000-2400-0000-68e0a1bd0000\""
    },
    {
      "id": "e76c78dc-2f0d-4f2f-b1b7-20abc88c013f",
      "name": "Tubigon",
      "cityCode": "BOH-45",
      "provinceCode": "BOH",
      "createdAt": "2025-10-04T04:07:39.915769Z",
      "updatedAt": "2025-10-04T04:07:39.915769Z",
      "_etag": "\"0400cdee-0000-2400-0000-68e0a1bd0000\""
    },
    {
      "id": "dda40ea6-743b-44c2-8a9a-25148e52548f",
      "name": "Tublay",
      "cityCode": "BEN-14",
      "provinceCode": "BEN",
      "createdAt": "2025-10-04T04:07:39.915771Z",
      "updatedAt": "2025-10-04T04:07:39.915771Z",
      "_etag": "\"040086ef-0000-2400-0000-68e0a1c50000\""
    },
    {
      "id": "1e149b9e-d56b-4dcd-be86-c038ff50bac7",
      "name": "Tubo",
      "cityCode": "ABR-26",
      "provinceCode": "ABR",
      "createdAt": "2025-10-04T04:07:39.915769Z",
      "updatedAt": "2025-10-04T04:07:39.915769Z",
      "_etag": "\"0400f3ee-0000-2400-0000-68e0a1be0000\""
    },
    {
      "id": "9b92b585-8e30-4d61-9d13-87884b13fb0e",
      "name": "Tubod",
      "cityCode": "SUN-27",
      "provinceCode": "SUN",
      "createdAt": "2025-10-04T04:07:39.91577Z",
      "updatedAt": "2025-10-04T04:07:39.91577Z",
      "_etag": "\"040035ef-0000-2400-0000-68e0a1c10000\""
    },
    {
      "id": "aa771961-619e-4e1f-8fe9-32755c9ed709",
      "name": "Tubod (Capital)",
      "cityCode": "LAN-22",
      "provinceCode": "LAN",
      "createdAt": "2025-10-04T04:07:39.91577Z",
      "updatedAt": "2025-10-04T04:07:39.91577Z",
      "_etag": "\"04003eef-0000-2400-0000-68e0a1c10000\""
    },
    {
      "id": "5f891daa-3042-4f04-b21b-5920555f966a",
      "name": "Tubungan",
      "cityCode": "ILO-46",
      "provinceCode": "ILO",
      "createdAt": "2025-10-04T04:07:39.915771Z",
      "updatedAt": "2025-10-04T04:07:39.915771Z",
      "_etag": "\"04004bef-0000-2400-0000-68e0a1c20000\""
    },
    {
      "id": "0a203ccf-9b95-4926-9c28-c7241da634e7",
      "name": "Tuburan",
      "cityCode": "CEB-52",
      "provinceCode": "CEB",
      "createdAt": "2025-10-04T04:07:39.915771Z",
      "updatedAt": "2025-10-04T04:07:39.915771Z",
      "_etag": "\"04005cef-0000-2400-0000-68e0a1c20000\""
    },
    {
      "id": "9a3d28ea-8f53-4708-ae0c-13d4649051fe",
      "name": "Tuburan",
      "cityCode": "BAS-07",
      "provinceCode": "BAS",
      "createdAt": "2025-10-04T04:07:39.915771Z",
      "updatedAt": "2025-10-04T04:07:39.915771Z",
      "_etag": "\"040066ef-0000-2400-0000-68e0a1c30000\""
    },
    {
      "id": "259c283d-bc2d-42ab-be4b-b08b7a00b1a6",
      "name": "Tudela",
      "cityCode": "MSC-16",
      "provinceCode": "MSC",
      "createdAt": "2025-10-04T04:07:39.915771Z",
      "updatedAt": "2025-10-04T04:07:39.915771Z",
      "_etag": "\"040070ef-0000-2400-0000-68e0a1c30000\""
    },
    {
      "id": "08640bbb-8a1a-4606-a762-bd15e83bb8ca",
      "name": "Tudela",
      "cityCode": "CEB-53",
      "provinceCode": "CEB",
      "createdAt": "2025-10-04T04:07:39.915773Z",
      "updatedAt": "2025-10-04T04:07:39.915773Z",
      "_etag": "\"0400fdef-0000-2400-0000-68e0a1c90000\""
    },
    {
      "id": "bf47afdc-ba03-45ae-ac0f-3f0f371adcba",
      "name": "Tugaya",
      "cityCode": "LAN-29",
      "provinceCode": "LAN",
      "createdAt": "2025-10-04T04:07:39.915771Z",
      "updatedAt": "2025-10-04T04:07:39.915771Z",
      "_etag": "\"040090ef-0000-2400-0000-68e0a1c50000\""
    },
    {
      "id": "fd6f597c-e940-4633-9912-243978a74d73",
      "name": "Tuguegarao City (Capital)",
      "cityCode": "CAG-29",
      "provinceCode": "CAG",
      "createdAt": "2025-10-04T04:07:39.915771Z",
      "updatedAt": "2025-10-04T04:07:39.915771Z",
      "_etag": "\"04009def-0000-2400-0000-68e0a1c60000\""
    },
    {
      "id": "de64dd15-2964-4929-8a1b-1f5603178075",
      "name": "Tukuran",
      "cityCode": "ZAS-30",
      "provinceCode": "ZAS",
      "createdAt": "2025-10-04T04:07:39.915772Z",
      "updatedAt": "2025-10-04T04:07:39.915772Z",
      "_etag": "\"0400a5ef-0000-2400-0000-68e0a1c60000\""
    },
    {
      "id": "a916a9e3-bea7-4e61-8ca0-39c7953a3109",
      "name": "Tulunan",
      "cityCode": "NCO-14",
      "provinceCode": "NCO",
      "createdAt": "2025-10-04T04:07:39.915772Z",
      "updatedAt": "2025-10-04T04:07:39.915772Z",
      "_etag": "\"0400b9ef-0000-2400-0000-68e0a1c70000\""
    },
    {
      "id": "d7ad226a-b711-4b77-8f62-f4c96bba83a9",
      "name": "Tumauini",
      "cityCode": "ISA-37",
      "provinceCode": "ISA",
      "createdAt": "2025-10-04T04:07:39.915773Z",
      "updatedAt": "2025-10-04T04:07:39.915773Z",
      "_etag": "\"040028f0-0000-2400-0000-68e0a1cb0000\""
    },
    {
      "id": "bb06ee8e-02d9-4d80-b8f8-64fa49519593",
      "name": "Tunga",
      "cityCode": "LEY-50",
      "provinceCode": "LEY",
      "createdAt": "2025-10-04T04:07:39.915772Z",
      "updatedAt": "2025-10-04T04:07:39.915772Z",
      "_etag": "\"0400caef-0000-2400-0000-68e0a1c80000\""
    },
    {
      "id": "684be49a-3357-4c96-8faa-682be5c2b32a",
      "name": "Tungawan",
      "cityCode": "ZSI-16",
      "provinceCode": "ZSI",
      "createdAt": "2025-10-04T04:07:39.915772Z",
      "updatedAt": "2025-10-04T04:07:39.915772Z",
      "_etag": "\"0400dbef-0000-2400-0000-68e0a1c80000\""
    },
    {
      "id": "176b4b5f-e0a2-405b-85e4-12108d398f93",
      "name": "Tupi",
      "cityCode": "SCO-17",
      "provinceCode": "SCO",
      "createdAt": "2025-10-04T04:07:39.91578Z",
      "updatedAt": "2025-10-04T04:07:39.91578Z",
      "_etag": "\"040045f1-0000-2400-0000-68e0a1d80000\""
    },
    {
      "id": "170a9713-7854-4026-af53-acd31f59b27d",
      "name": "Turtle Islands",
      "cityCode": "TAW-08",
      "provinceCode": "TAW",
      "createdAt": "2025-10-04T04:07:39.915773Z",
      "updatedAt": "2025-10-04T04:07:39.915773Z",
      "_etag": "\"0400eeef-0000-2400-0000-68e0a1c90000\""
    },
    {
      "id": "2cdc4435-9cd7-46db-8ae8-825bd0cf3965",
      "name": "Tuy",
      "cityCode": "BTG-34",
      "provinceCode": "BTG",
      "createdAt": "2025-10-04T04:07:39.915773Z",
      "updatedAt": "2025-10-04T04:07:39.915773Z",
      "_etag": "\"040007f0-0000-2400-0000-68e0a1ca0000\""
    },
    {
      "id": "df9a34c1-8f7b-4337-9cbc-e28218c3315e",
      "name": "Ubay",
      "cityCode": "BOH-46",
      "provinceCode": "BOH",
      "createdAt": "2025-10-04T04:07:39.915773Z",
      "updatedAt": "2025-10-04T04:07:39.915773Z",
      "_etag": "\"040017f0-0000-2400-0000-68e0a1cb0000\""
    },
    {
      "id": "89117dda-4eb1-473c-8801-c686317e9f7e",
      "name": "Umingan",
      "cityCode": "PAN-44",
      "provinceCode": "PAN",
      "createdAt": "2025-10-04T04:07:39.91578Z",
      "updatedAt": "2025-10-04T04:07:39.91578Z",
      "_etag": "\"04008bf1-0000-2400-0000-68e0a1db0000\""
    },
    {
      "id": "126924d3-4725-4774-aa1a-1bc19496b596",
      "name": "Ungkaya Pukan",
      "cityCode": "BAS-11",
      "provinceCode": "BAS",
      "createdAt": "2025-10-04T04:07:39.915779Z",
      "updatedAt": "2025-10-04T04:07:39.915779Z",
      "_etag": "\"04001ef1-0000-2400-0000-68e0a1d60000\""
    },
    {
      "id": "c997a511-bd04-436f-9d50-0b693dd56be4",
      "name": "Unisan",
      "cityCode": "QUE-49",
      "provinceCode": "QUE",
      "createdAt": "2025-10-04T04:07:39.91578Z",
      "updatedAt": "2025-10-04T04:07:39.91578Z",
      "_etag": "\"04009af1-0000-2400-0000-68e0a1dc0000\""
    },
    {
      "id": "5e1fef52-aca9-425f-afd9-460ca119680d",
      "name": "Upi",
      "cityCode": "MAG-15",
      "provinceCode": "MAG",
      "createdAt": "2025-10-04T04:07:39.915778Z",
      "updatedAt": "2025-10-04T04:07:39.915778Z",
      "_etag": "\"0400a7f0-0000-2400-0000-68e0a1d20000\""
    },
    {
      "id": "9f1c774d-05c4-4353-b3d3-655ad0a4c606",
      "name": "Urbiztondo",
      "cityCode": "PAN-45",
      "provinceCode": "PAN",
      "createdAt": "2025-10-04T04:07:39.915781Z",
      "updatedAt": "2025-10-04T04:07:39.915781Z",
      "_etag": "\"0400f5f1-0000-2400-0000-68e0a1e00000\""
    },
    {
      "id": "2b8cac3d-2425-4b33-a126-09aa86eac622",
      "name": "Uson",
      "cityCode": "MAS-21",
      "provinceCode": "MAS",
      "createdAt": "2025-10-04T04:07:39.915778Z",
      "updatedAt": "2025-10-04T04:07:39.915778Z",
      "_etag": "\"0400c1f0-0000-2400-0000-68e0a1d30000\""
    },
    {
      "id": "a43f8195-fc89-48af-9850-f7bdbb972429",
      "name": "Uyugan",
      "cityCode": "BTN-06",
      "provinceCode": "BTN",
      "createdAt": "2025-10-04T04:07:39.915773Z",
      "updatedAt": "2025-10-04T04:07:39.915773Z",
      "_etag": "\"040044f0-0000-2400-0000-68e0a1cd0000\""
    },
    {
      "id": "2fddcb99-84dc-4181-a4a6-0bd8051e4a2e",
      "name": "Valderrama",
      "cityCode": "ANT-18",
      "provinceCode": "ANT",
      "createdAt": "2025-10-04T04:07:39.915779Z",
      "updatedAt": "2025-10-04T04:07:39.915779Z",
      "_etag": "\"04000ef1-0000-2400-0000-68e0a1d60000\""
    },
    {
      "id": "a96fa97b-443c-4e5b-ab70-6426b3a0534a",
      "name": "Valencia",
      "cityCode": "BOH-47",
      "provinceCode": "BOH",
      "createdAt": "2025-10-04T04:07:39.91578Z",
      "updatedAt": "2025-10-04T04:07:39.91578Z",
      "_etag": "\"040069f1-0000-2400-0000-68e0a1da0000\""
    },
    {
      "id": "c33506ce-cf8f-4daa-a7ee-eaed8ce140c0",
      "name": "Valencia (Luzurriaga)",
      "cityCode": "NER-23",
      "provinceCode": "NER",
      "createdAt": "2025-10-04T04:07:39.915779Z",
      "updatedAt": "2025-10-04T04:07:39.91578Z",
      "_etag": "\"040038f1-0000-2400-0000-68e0a1d70000\""
    },
    {
      "id": "1f7a45f4-e4d9-4050-a768-bad8f326d5b7",
      "name": "Valladolid",
      "cityCode": "NEC-30",
      "provinceCode": "NEC",
      "createdAt": "2025-10-04T04:07:39.915781Z",
      "updatedAt": "2025-10-04T04:07:39.915781Z",
      "_etag": "\"040002f2-0000-2400-0000-68e0a1e10000\""
    },
    {
      "id": "fe96d5dd-175e-4e34-affe-e16a2521258a",
      "name": "Vallehermoso",
      "cityCode": "NER-24",
      "provinceCode": "NER",
      "createdAt": "2025-10-04T04:07:39.915774Z",
      "updatedAt": "2025-10-04T04:07:39.915774Z",
      "_etag": "\"040095f0-0000-2400-0000-68e0a1d10000\""
    },
    {
      "id": "fbae9879-782e-43f6-954f-099cf040e1b0",
      "name": "Veruela",
      "cityCode": "AGS-13",
      "provinceCode": "AGS",
      "createdAt": "2025-10-04T04:07:39.915781Z",
      "updatedAt": "2025-10-04T04:07:39.915781Z",
      "_etag": "\"0400d0f1-0000-2400-0000-68e0a1df0000\""
    },
    {
      "id": "e0eba4fb-2677-407a-a03c-687f8a919657",
      "name": "Victoria",
      "cityCode": "LAG-30",
      "provinceCode": "LAG",
      "createdAt": "2025-10-04T04:07:39.915774Z",
      "updatedAt": "2025-10-04T04:07:39.915774Z",
      "_etag": "\"040061f0-0000-2400-0000-68e0a1ce0000\""
    },
    {
      "id": "3154200b-80f9-4c78-9a07-8770e0276b26",
      "name": "Victoria",
      "cityCode": "MNR-15",
      "provinceCode": "MNR",
      "createdAt": "2025-10-04T04:07:39.915774Z",
      "updatedAt": "2025-10-04T04:07:39.915774Z",
      "_etag": "\"040076f0-0000-2400-0000-68e0a1d00000\""
    },
    {
      "id": "237d5eb9-3829-4b0e-853a-b8d4ae7fc4a1",
      "name": "Victoria",
      "cityCode": "TAR-17",
      "provinceCode": "TAR",
      "createdAt": "2025-10-04T04:07:39.915779Z",
      "updatedAt": "2025-10-04T04:07:39.915779Z",
      "_etag": "\"0400d5f0-0000-2400-0000-68e0a1d30000\""
    },
    {
      "id": "1c6b2255-9953-4dea-8fa5-d110f2b39bc9",
      "name": "Victoria",
      "cityCode": "NSA-23",
      "provinceCode": "NSA",
      "createdAt": "2025-10-04T04:07:39.915781Z",
      "updatedAt": "2025-10-04T04:07:39.915781Z",
      "_etag": "\"0400b9f1-0000-2400-0000-68e0a1dd0000\""
    },
    {
      "id": "d9c86f6f-d4a0-4273-80d5-93a2ceca2b02",
      "name": "Viga",
      "cityCode": "CAT-10",
      "provinceCode": "CAT",
      "createdAt": "2025-10-04T04:07:39.915782Z",
      "updatedAt": "2025-10-04T04:07:39.915782Z",
      "_etag": "\"040031f2-0000-2400-0000-68e0a1e30000\""
    },
    {
      "id": "4bc2e3c3-ddbb-4362-835a-ce11d1551f0d",
      "name": "Villaba",
      "cityCode": "LEY-51",
      "provinceCode": "LEY",
      "createdAt": "2025-10-04T04:07:39.915782Z",
      "updatedAt": "2025-10-04T04:07:39.915782Z",
      "_etag": "\"04000ef2-0000-2400-0000-68e0a1e10000\""
    },
    {
      "id": "b92ca7c5-fed0-47f4-85e6-7c8a4fda98e3",
      "name": "Villanueva",
      "cityCode": "MSR-26",
      "provinceCode": "MSR",
      "createdAt": "2025-10-04T04:07:39.915779Z",
      "updatedAt": "2025-10-04T04:07:39.915779Z",
      "_etag": "\"0400f8f0-0000-2400-0000-68e0a1d40000\""
    },
    {
      "id": "2219aa05-355d-47f0-b098-172da777f8ef",
      "name": "Villareal",
      "cityCode": "WSA-21",
      "provinceCode": "WSA",
      "createdAt": "2025-10-04T04:07:39.915781Z",
      "updatedAt": "2025-10-04T04:07:39.915781Z",
      "_etag": "\"0400c1f1-0000-2400-0000-68e0a1de0000\""
    },
    {
      "id": "5939adb5-771f-40b6-bd90-19caa01d37d7",
      "name": "Villasis",
      "cityCode": "PAN-47",
      "provinceCode": "PAN",
      "createdAt": "2025-10-04T04:07:39.915778Z",
      "updatedAt": "2025-10-04T04:07:39.915778Z",
      "_etag": "\"0400b2f0-0000-2400-0000-68e0a1d20000\""
    },
    {
      "id": "55b6461a-b94c-479f-9865-ed316ce4a5f2",
      "name": "Villaverde",
      "cityCode": "NUV-14",
      "provinceCode": "NUV",
      "createdAt": "2025-10-04T04:07:39.915774Z",
      "updatedAt": "2025-10-04T04:07:39.915774Z",
      "_etag": "\"04006bf0-0000-2400-0000-68e0a1cf0000\""
    },
    {
      "id": "d5ce5001-221e-4cfd-a1cd-c2dcacf717f8",
      "name": "Villaviciosa",
      "cityCode": "ABR-27",
      "provinceCode": "ABR",
      "createdAt": "2025-10-04T04:07:39.91578Z",
      "updatedAt": "2025-10-04T04:07:39.91578Z",
      "_etag": "\"040061f1-0000-2400-0000-68e0a1d90000\""
    },
    {
      "id": "dc5e51e0-d804-4bb9-a48d-441c1561d62f",
      "name": "Vincenzo A. Sagun",
      "cityCode": "ZAS-41",
      "provinceCode": "ZAS",
      "createdAt": "2025-10-04T04:07:39.915781Z",
      "updatedAt": "2025-10-04T04:07:39.915781Z",
      "_etag": "\"0400a7f1-0000-2400-0000-68e0a1dd0000\""
    },
    {
      "id": "395590b1-1344-41d2-886e-bd381c6ba7e5",
      "name": "Vintar",
      "cityCode": "ILN-23",
      "provinceCode": "ILN",
      "createdAt": "2025-10-04T04:07:39.915782Z",
      "updatedAt": "2025-10-04T04:07:39.915782Z",
      "_etag": "\"04003ef2-0000-2400-0000-68e0a1e40000\""
    },
    {
      "id": "992266d4-4a31-4095-8c6a-e01f61fc8513",
      "name": "Vinzons",
      "cityCode": "CAN-12",
      "provinceCode": "CAN",
      "createdAt": "2025-10-04T04:07:39.915782Z",
      "updatedAt": "2025-10-04T04:07:39.915782Z",
      "_etag": "\"040021f2-0000-2400-0000-68e0a1e20000\""
    },
    {
      "id": "a87780fa-723d-418e-b2de-f91595fc3495",
      "name": "Virac",
      "cityCode": "CAT-11",
      "provinceCode": "CAT",
      "createdAt": "2025-10-04T04:07:39.915779Z",
      "updatedAt": "2025-10-04T04:07:39.915779Z",
      "_etag": "\"0400eef0-0000-2400-0000-68e0a1d40000\""
    },
    {
      "id": "7381632b-afc0-489f-98ff-32888f0a716e",
      "name": "Wao",
      "cityCode": "LAN-30",
      "provinceCode": "LAN",
      "createdAt": "2025-10-04T04:07:39.915781Z",
      "updatedAt": "2025-10-04T04:07:39.915781Z",
      "_etag": "\"0400e4f1-0000-2400-0000-68e0a1e00000\""
    },
    {
      "id": "76abcade-6b0f-4e3e-b732-92a17f16a228",
      "name": "Zamboanga City",
      "cityCode": "ZAS-32",
      "provinceCode": "ZAS",
      "createdAt": "2025-10-04T04:07:39.915779Z",
      "updatedAt": "2025-10-04T04:07:39.915779Z",
      "_etag": "\"0400fdf0-0000-2400-0000-68e0a1d50000\""
    },
    {
      "id": "f4dae90c-f697-4df0-9b61-f6b5912d21b3",
      "name": "Zamboanguita",
      "cityCode": "NER-25",
      "provinceCode": "NER",
      "createdAt": "2025-10-04T04:07:39.915774Z",
      "updatedAt": "2025-10-04T04:07:39.915774Z",
      "_etag": "\"040084f0-0000-2400-0000-68e0a1d00000\""
    },
    {
      "id": "618a59ac-9eef-40ed-b486-9e5ff69d8b6d",
      "name": "Zaragoza",
      "cityCode": "NUE-32",
      "provinceCode": "NUE",
      "createdAt": "2025-10-04T04:07:39.91578Z",
      "updatedAt": "2025-10-04T04:07:39.91578Z",
      "_etag": "\"040058f1-0000-2400-0000-68e0a1d90000\""
    },
    {
      "id": "1a28fc2f-9200-4752-97d4-c0e626013c96",
      "name": "Zarraga",
      "cityCode": "ILO-47",
      "provinceCode": "ILO",
      "createdAt": "2025-10-04T04:07:39.91578Z",
      "updatedAt": "2025-10-04T04:07:39.91578Z",
      "_etag": "\"0400a0f1-0000-2400-0000-68e0a1dc0000\""
    },
    {
      "id": "e51d506f-4a9e-44d1-8bcb-2ca7e8f025b0",
      "name": "Zumarraga",
      "cityCode": "WSA-23",
      "provinceCode": "WSA",
      "createdAt": "2025-10-04T04:07:39.915782Z",
      "updatedAt": "2025-10-04T04:07:39.915782Z",
      "_etag": "\"04002cf2-0000-2400-0000-68e0a1e30000\""
    }
  ]
}

export {
  TIMER_LOGOUT,
  GUEST_USER,
  regionList,
  birthyearList,
  yearList,
  NTCPreview,
  NTCServices,
  transformText,
  transformToFeePayload,
  region_list,
  loadProvinces, loadCities
}




