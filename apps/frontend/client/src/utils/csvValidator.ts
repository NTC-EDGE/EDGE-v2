import { validateEmail, validateYear, validateZipCode } from './form-validations';
import { region_list, loadCities, loadProvinces } from './ntc';


const REQUIRED_FIELDS = [
    'Application Type',
    'Examinee Type',
    'Class/Element',
    'Last Name',
    'First Name',
    'Date of Birth (mm/dd/yyyy)',
    'Sex',
    'Nationality',
    'Region',
    'Province',
    'City',
    'Contact Number',
    'Email Address'
];

const normalize = (value: any) =>
    String(value || '')
        .normalize('NFKC')
        .trim()
        .toLowerCase();

const looseKey = (value: any) =>
    normalize(value)
        .replace(/region/g, '')
        .replace(/[^a-z0-9]/g, '');

const findMatchingRegion = (regionValue: string) => {
    const input = normalize(regionValue);
    const inputLoose = looseKey(regionValue);

    return region_list.find((region: any) => {
        const label = normalize(region?.label);
        const value = normalize(region?.value);
        const code = normalize(region?.code);

        return (
            input === label ||
            input === value ||
            input === code ||
            inputLoose === looseKey(region?.label) ||
            inputLoose === looseKey(region?.value) ||
            inputLoose === looseKey(region?.code)
        );
    }) || null;
};

export const validateCSVRow = async (rawRow: Record<string, string>) => {
    const errors: string[] = [];

    // 1. Check required fields
    REQUIRED_FIELDS.forEach(field => {
        if (!rawRow[field] || rawRow[field].trim() === '') {
            errors.push(`${field} is required.`);
        }
    });

    // 2. Validate Email
    const email = rawRow['Email Address'];
    if (email && !validateEmail(email)) {
        errors.push(`Invalid Email Address format.`);
    }

    // 3. Validate Contact Number
    const contact = rawRow['Contact Number'];
    if (contact) {
        const cleanContact = contact.replace(/[\s-]/g, '');
        const phoneRegex = /^\+?\d{10,12}$/;

        if (!phoneRegex.test(cleanContact)) {
            errors.push(`Invalid Contact Number format.`);
        }
    }

    // 4. Validate Date of Birth
    const dob = rawRow['Date of Birth (mm/dd/yyyy)'];
    if (dob) {
        const dobRegex = /^(0?[1-9]|1[0-2])[-/](0?[1-9]|[12]\d|3[01])[-/]\d{4}$/;

        if (!dobRegex.test(dob)) {
            errors.push(`Date of Birth must be mm/dd/yyyy.`);
        }
    }

    // 5. Validate Sex: M/F or Male/Female, but save as Male/Female
    const sex = rawRow['Sex'];

    if (sex) {
        const normalizedSex = sex.trim().toLowerCase();

        if (!['m', 'f', 'male', 'female'].includes(normalizedSex)) {
            errors.push(`Sex must be M, F, Male, or Female only.`);
        } else {
            rawRow['Sex'] =
                normalizedSex === 'm' || normalizedSex === 'male'
                    ? 'Male'
                    : 'Female';
        }
    }

    // 6. Validate and map Region
    const region = rawRow['Region'];
    const matchingRegion = region ? findMatchingRegion(region) : null;

    if (region && !matchingRegion) {
        errors.push(`Invalid Region. Please use a valid region code or region name.`);
    }

    if (matchingRegion) {
        // keep raw row readable
        rawRow['Region'] = matchingRegion.label;

        const looseKey = (str: string) => String(str || '').replace(/\([^)]*\)/g, '').replace(/[\W_]+/g, "").toLowerCase();
        const rawProvince = rawRow['Province'];
        const rawCity = rawRow['City'];

        const provinces = await loadProvinces();
        const cities = await loadCities();

        let matchingProvince: any = null;

        // 1. Identify the province first, if provided
        if (rawProvince) {
            const rawProvLoose = looseKey(rawProvince);
            matchingProvince = provinces.find((p: any) => p.regionCode === matchingRegion.value && (p.name.toLowerCase() === rawProvince.toLowerCase() || p.provinceCode.toLowerCase() === rawProvince.toLowerCase()))
                || provinces.find((p: any) => p.regionCode === matchingRegion.value && (looseKey(p.name) === rawProvLoose || looseKey(p.provinceCode) === rawProvLoose))
                || provinces.find((p: any) => p.regionCode === matchingRegion.value && (looseKey(p.name).includes(rawProvLoose) || rawProvLoose.includes(looseKey(p.name))));
        }

        // 2. Validate and correct city, and auto-correct province if city is found elsewhere
        if (rawCity) {
            const rawCityLoose = looseKey(rawCity);
            let matchingCity: any = null;

            // Try finding city within the identified province first
            if (matchingProvince) {
                matchingCity = cities.find((c: any) => c.provinceCode === matchingProvince.provinceCode && (c.name.toLowerCase() === rawCity.toLowerCase() || c.cityCode.toLowerCase() === rawCity.toLowerCase()))
                    || cities.find((c: any) => c.provinceCode === matchingProvince.provinceCode && (looseKey(c.name) === rawCityLoose || looseKey(c.cityCode) === rawCityLoose))
                    || cities.find((c: any) => c.provinceCode === matchingProvince.provinceCode && (looseKey(c.name).includes(rawCityLoose) || rawCityLoose.includes(looseKey(c.name))));
            }

            // If not found in the province (or no province was provided), search globally
            if (!matchingCity) {
                matchingCity = cities.find((c: any) => c.name.toLowerCase() === rawCity.toLowerCase() || c.cityCode.toLowerCase() === rawCity.toLowerCase())
                    || cities.find((c: any) => looseKey(c.name) === rawCityLoose || looseKey(c.cityCode) === rawCityLoose)
                    || cities.find((c: any) => looseKey(c.name).includes(rawCityLoose) || rawCityLoose.includes(looseKey(c.name)));

                if (matchingCity) {
                    // Automatically correct the province to match the city's true province
                    matchingProvince = provinces.find((p: any) => p.provinceCode === matchingCity.provinceCode);
                }
            }

            if (matchingCity) {
                rawRow['City'] = matchingCity.name;
            } else {
                errors.push(`Invalid City: ${rawCity}.`);
            }
        }

        // 3. Finalize Province
        if (matchingProvince) {
            rawRow['Province'] = matchingProvince.name;
        } else if (rawProvince && !matchingProvince) {
            errors.push(`Invalid Province for Region ${matchingRegion.label}.`);
        }
    }

    // 7. Validate Year Graduated
    const yearGraduated = rawRow['Year Graduated'];
    if (yearGraduated && !validateYear(yearGraduated)) {
        errors.push(`Invalid Year Graduated.`);
    }

    // 8. Validate Zip Code
    const zipCode = rawRow['Zip Code'];
    if (zipCode && !validateZipCode(zipCode)) {
        errors.push(`Invalid Zip Code.`);
    }

    return {
        isValid: errors.length === 0,
        errors,
        region: matchingRegion
    };
};