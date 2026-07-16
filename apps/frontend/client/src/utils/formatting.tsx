import { Platform, Dimensions } from 'react-native';
import { cloneDeep } from 'lodash';
import { RFValue } from 'react-native-responsive-fontsize';
import moment from 'moment';
import { validateText } from './form-validations';
import DeviceInfo from 'react-native-device-info';

/**
 * Module-level cache for scaled values to avoid redundant RFValue calculations.
 * Cleared on dimension changes (e.g. orientation) to ensure accuracy.
 */
const rfCache = new Map<number, number>();
Dimensions.addEventListener('change', () => rfCache.clear());

export const RNValue = (number: number) => {
	if (Platform.OS !== 'ios' && Platform.OS !== 'android') return number;
	const cached = rfCache.get(number);
	if (cached !== undefined) return cached;

	const val = RFValue(number);
	rfCache.set(number, val);
	return val;
};
export const isMobile = Platform?.OS === 'ios' || Platform?.OS === 'android'
export const isTablet = (DeviceInfo.getDeviceType() == "Tablet")
/**
 * Efficiently extracts year, month, or day from a date.
 * Jan is '00', Dec is '11' to match the app's dropdown logic.
 */
export const extractDate = (date: any, d: 'year' | 'month' | 'date') => {
	if (!date) return '';
	const m = moment.isMoment(date) ? date : moment(date);
	if (!m.isValid()) return '';

	if (d === 'year') {
		const y = m.year().toString();
		return isNaN(Number(y)) ? '' : y;
	}
	if (d === 'month') {
		const mo = `0${m.month()}`.slice(-2);
		return isNaN(Number(mo)) ? '' : mo;
	}
	const da = `0${m.date()}`.slice(-2);
	return isNaN(Number(da)) ? '' : da;
};

/**
 * Parses a date once and returns all components.
 * This avoids redundant moment object creation in loops.
 */
export const extractDateFull = (date: any) => {
	if (!date) return { year: '', month: '', day: '' };
	const m = moment.isMoment(date) ? date : moment(date);
	if (!m.isValid()) return { year: '', month: '', day: '' };

	const y = m.year().toString();
	const mo = `0${m.month()}`.slice(-2);
	const da = `0${m.date()}`.slice(-2);

	return {
		year: isNaN(Number(y)) ? '' : y,
		month: isNaN(Number(mo)) ? '' : mo,
		day: isNaN(Number(da)) ? '' : da,
	};
};



export async function getCroppedImg(
	imageSrc: string,
	pixelCrop: { x: number; y: number; width: number; height: number },
	rotation = 0
) {
	const image = await createImage(imageSrc);
	const canvas = document.createElement("canvas");
	const ctx = canvas.getContext("2d");

	if (!ctx) throw new Error("No canvas context");

	const radians = (rotation * Math.PI) / 180;

	// compute rotated bounds
	const sin = Math.abs(Math.sin(radians));
	const cos = Math.abs(Math.cos(radians));
	const bW = image.width * cos + image.height * sin;
	const bH = image.width * sin + image.height * cos;

	canvas.width = pixelCrop.width;
	canvas.height = pixelCrop.height;

	// translate so crop area becomes (0,0) on output canvas
	ctx.translate(-pixelCrop.x, -pixelCrop.y);

	// move origin to center of rotated image
	ctx.translate(bW / 2, bH / 2);
	ctx.rotate(radians);
	ctx.translate(-image.width / 2, -image.height / 2);

	ctx.drawImage(image, 0, 0);

	return new Promise<string>((resolve, reject) => {
		canvas.toBlob((blob) => {
			if (!blob) return reject("Canvas is empty");
			resolve(URL.createObjectURL(blob));
		}, "image/jpeg");
	});
}

function createImage(url: string) {
	return new Promise<HTMLImageElement>((resolve, reject) => {
		const img = new Image();
		img.crossOrigin = "anonymous";
		img.onload = () => resolve(img);
		img.onerror = reject;
		img.src = url;
	});
}
export function onDownloadDocument(doc) {
	var link = document.createElement('a');
	link.href = doc;
	link.download = 'file.pdf';
	link.dispatchEvent(new MouseEvent('click'));
	link?.remove();
}

export function getDeviceType() {
	const ua = navigator.userAgent.toLowerCase();
	const isAndroid = ua.includes('android');
	const isIPad = /ipad/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
	const isIPhone = /iphone|ipod/i.test(navigator.userAgent);
	if (isIPad || (isAndroid && !ua.includes('mobile'))) return 'tablet';
	if (isIPhone || (isAndroid && ua.includes('mobile'))) return 'phone';
	return 'desktop';
}
export const JSONfn = {
	stringify: (obj: any): string => {
		return JSON.stringify(obj, function (key, value) {
			return typeof value === 'function' ? value.toString() : value;
		});
	},

	parse: (str: string): any => {
		return JSON.parse(str, function (key, value) {
			if (typeof value !== 'string') return value;

			if (
				value.startsWith('function') ||
				value.includes('=>')
			) {
				try {
					return new Function('return ' + value)();
				} catch (e) {
					console.error('Failed to parse function:', e);
					return value;
				}
			}
			return value;
		})
	}
};

/**
 * Hoisted Intl.NumberFormat instance for 'fil-PH' currency.
 * Avoiding redundant instantiation improves performance in lists and during re-renders.
 */
const currencyFormatter = new Intl.NumberFormat('fil-PH', {
	style: 'currency',
	currency: 'PHP',
});

export const currency = (number: number) => {
	return currencyFormatter.format(number);
};

const process = { nextTick: function (fn) { setTimeout(fn); } };
export const waterfall = (arr, cb, result = '') => { // result is the initial result
	var fns = arr.slice(1); // make a copy, apart from the first element
	if (!arr[0]) { // if there is something in the first position
		process.nextTick(function () { // don't cause race conditions
			cb(null, result); // we're done, nothing more to do
		});
		return;
	}
	var first = arr[0]; // get the first function
	first(function (err, data) { // invoke it
		// when it is done
		if (err) return cb(err); // early error, terminate entire call
		// perform the same call, but without the first function
		// and with its result as the result
		waterfall(fns, cb, data);
	});
};
export async function urlToBlob(url: string): Promise<Blob> {
	const resp = await fetch(url, { mode: 'cors' });
	if (!resp.ok) throw new Error(`Could not fetch ${url}: ${resp.status}`);
	return await resp.blob();
}

/**
 * Converts any URL, data‑URI, or Blob into a base64 Data‑URI.
 * - If it’s already data:* it returns it back.
 * - If it's a string URL (http: or blob:), it fetches it first.
 * - If it's a Blob, it converts it directly.
 */
export async function urlToDataURL(urlOrBlob: string | Blob): Promise<string> {
	if (typeof urlOrBlob === 'string' && urlOrBlob.startsWith('data:')) {
		return urlOrBlob;
	}

	const blob = urlOrBlob instanceof Blob
		? urlOrBlob
		: await urlToBlob(urlOrBlob as string);

	return await new Promise<string>((resolve, reject) => {
		const reader = new FileReader();
		reader.onloadend = () => resolve(reader.result as string);
		reader.onerror = reject;
		reader.readAsDataURL(blob);
	});
}
const deepClone = (x: any) => cloneDeep(x);

/**
 * Hoisted static specification for vehicle plate numbers.
 * Reuse prevents redundant allocations during form generation/comparison.
 */
const _specifyML = {
	id: 'vehiclePlateNo',
	label: 'Plate No.',
	placeholder: 'Plate No.',
	value: '',
	hasValidation: true,
	required: true,
	isValid: false,
	error: '',
	errorResponse: 'Please enter plate no.',
};

const titleCase = (s: string) =>
	s.replace(/[_-]/g, ' ')
		.replace(/([a-z])([A-Z])/g, '$1 $2')
		.replace(/\s+/g, ' ')
		.trim()
		.replace(/^./, c => c.toUpperCase());

const makeField = (id: string, value: any = '') => ({
	id,
	label: titleCase(id),
	placeholder: titleCase(id),
	value,
	hasValidation: true,
	required: false,
	isValid: String(value ?? '').length > 0,
	error: '',
	errorResponse: `Please enter ${titleCase(id).toLowerCase()}`,
});

type Section = { id: string; title?: string; isSet?: boolean; type?: string; showIndex?: number; data?: any; template?: any };

// Ensure a section exists; create if missing (non-list)
const ensureObjectSection = (row: Section[], sectionId: string, values: Record<string, any>) => {
	let idx = row.findIndex(s => s.id === sectionId);
	if (idx < 0) {
		row.push({
			id: sectionId,
			title: titleCase(sectionId),
			isSet: true,
			data: Object?.keys(values || {}).map(k => makeField(k, values[k])),
		});
		return row.length - 1;
	}
	// extend existing section with any missing fields
	const sec = row[idx];
	if (!Array.isArray(sec.data)) return idx;
	const have = new Set(sec.data.map((f: any) => f.id));
	Object.entries(values || {}).forEach(([k, v]) => {
		if (!have.has(k)) sec.data.push(makeField(k, v));
	});
	row[idx] = sec;
	return idx;
};

// Ensure a list section exists; create or extend template fields to include all keys (e.g., callSign)
const ensureListSection = (row: Section[], sectionId: string, items: Array<Record<string, any>>) => {
	let idx = row.findIndex(s => s.id === sectionId);
	const allKeys = Array.from(
		new Set(items.flatMap(obj => Object?.keys(obj || {})))
	);

	if (idx < 0) {
		row.push({
			id: sectionId,
			title: titleCase(sectionId),
			isSet: true,
			type: 'list',
			showIndex: 1,
			template: allKeys.map(k => makeField(k, '')),
			data: [],
		});
		idx = row.length - 1;
	} else {
		// extend template with any new keys
		const sec = row[idx];
		const have = new Set((sec.template || []).map((f: any) => f.id));
		const toAdd = allKeys.filter(k => !have.has(k));
		sec.template = (sec.template || []).concat(toAdd.map(k => makeField(k, '')));
		row[idx] = sec;
	}
	return idx;
};

// Fill a non-list section by matching field ids (adds missing fields if necessary)
const fillObjectSection = (row: Section[], idx: number, values: Record<string, any>) => {
	const sec = row[idx];
	if (!Array.isArray(sec.data)) return;
	const byId = new Map(sec.data.map((f: any, i: number) => [f.id, i]));
	Object.entries(values || {}).forEach(([k, v]) => {
		if (byId.has(k)) {
			const i = byId.get(k)!;
			sec.data[i] = { ...sec.data[i], value: v, isValid: true, error: '' };
		} else {
			sec.data.push(makeField(k, v));
		}
	});
	row[idx] = sec;
};

// Fill a list section from items[] using template ids
const fillListSection = (row: Section[], idx: number, items: Array<Record<string, any>>) => {
	const sec = row[idx];
	const ids = (sec.template || []).map((f: any) => f.id);
	sec.data = items.map(obj =>
		ids.map((id: string) => {
			const base = (sec.template || []).find((f: any) => f.id === id) || makeField(id, '');
			const val = Object.prototype.hasOwnProperty.call(obj, id) ? obj[id] : '';
			return { ...base, value: val, isValid: String(val ?? '').length > 0, error: '' };
		})
	);
	row[idx] = sec;
};

// Fallback: if a scalar like stationClass comes in, try to place it in an existing section that has a field with same id;
// otherwise create a new 1-field section.
const placeScalar = (row: Section[], key: string, value: any) => {
	for (let i = 0; i < row.length; i++) {
		const sec = row[i];
		if (Array.isArray(sec.data)) {
			const fIdx = sec.data.findIndex((f: any) => f.id === key);
			if (fIdx >= 0) {
				sec.data[fIdx] = { ...sec.data[fIdx], value, isValid: true, error: '' };
				row[i] = sec;
				return;
			}
		}
	}

};

// --- main: schema-flexible row builder ---
const buildRowFromParentItem = (template: Section[], item: any): Section[] => {
	const row = deepClone(template);

	// Back-compat alias map (allow old -> new ids, or leave identity)
	// Adjust if you want to route certain keys into existing sections.
	const sectionIdForKey = (k: string) => k; // identity mapping by default

	Object.entries(item || {}).forEach(([key, val]) => {
		const targetId = sectionIdForKey(key);
		if (key === 'equipments' && Array.isArray(val)) {
			const listIdx = ensureListSection(row, targetId, val);
			fillListSection(row, listIdx, val);
			return;
		}

		if (val && typeof val === 'object' && !Array.isArray(val)) {
			const idx = ensureObjectSection(row, targetId, val);
			fillObjectSection(row, idx, val);
			return;
		}

		// scalar like stationClass
		placeScalar(row, targetId, val);
	});

	return row;
};
function setUnitComposite(
	Form: any,
	form_parentIndex: number,
	childIndex: number,
	grandchildIndex: number,
	subId: "frequency" | "unit",
	subValue: any
) {
	const parent =
		Form?.[form_parentIndex]?.data?.[childIndex]?.[grandchildIndex];

	if (!parent || parent.type !== "unit" || !Array.isArray(parent.value)) return;

	const idx = parent.value.findIndex((v: any) => v?.id === subId);
	if (idx === -1) return;

	// If setting the dropdown "unit"
	if (subId === "unit") {
		parent.value[idx] = {
			...parent.value[idx],
			value: subValue,
			isValid: !!subValue,
			error: !!subValue ? "" : "Please select a unit",
		};

		// (Optional) if you keep items’ selected state for the dropdown inside the parent:
		const itemIdx = parent.items?.findIndex((it: any) => it.value === subValue);
		if (itemIdx > -1) {
			parent.items = parent.items.map((it: any, i: number) => ({
				...it,
				selected: i === itemIdx,
			}));
		}
	} else {
		// setting the numeric "frequency"
		const numericOk =
			typeof subValue === "number" || /^[0-9]+(\.[0-9]+)?$/.test(String(subValue));
		parent.value[idx] = {
			...parent.value[idx],
			value: subValue,
			isValid: numericOk,
			error: numericOk ? "" : "Please enter a valid frequency",
		};
	}

	// Recompute parent validity if you need it:
	parent.isValid = parent.value.every((v: any) => v?.isValid);
}
export const generateForm = (savedApplication: any, form: any) => {
	const service = savedApplication?.service;
	const Form = cloneDeep(form);
	const gIndex = (d: string, v: any) => v?.findIndex((i: any) => i.id === d);
	if (service) {
		Object?.keys(service).forEach((parent, index) => {
			if (
				parent !== '_id' &&
				parent !== 'applicationType' &&
				parent !== 'name' &&
				parent !== 'serviceCode'
			) {
				const parentItem = service[parent];
				const form_parentIndex = Form.findIndex((i: any) => i.id === parent);

				if (parentItem.length > 0 && form_parentIndex > -1) { // parentList, particulars ex. && field exists on form
					parentItem.forEach((child: any, index: number) => {
						const childIndex = index;
						if (Form?.[form_parentIndex]?.data?.length < childIndex + 1) { // add another obj inside the array, ex. multiple equipments
							const _child = parentItem[index];
							const filledRow = buildRowFromParentItem(Form[form_parentIndex].template, _child);
							Form?.[form_parentIndex]?.data?.push(filledRow)
						}
						Object.keys(child)?.forEach((grandchild, index) => {
							var grandchildItem = child[grandchild];
							var grandchildIndex = index;
							const form_grandchildIndex = Form?.[form_parentIndex]?.data?.[childIndex]?.findIndex((i: any) => i.id === grandchild);
							if (typeof (grandchildItem) === 'string') { // stationClass ex.
								if (Form[form_parentIndex].data[childIndex][grandchildIndex]?.specification) grandchildIndex += 1;
								const formPath = Form?.[form_parentIndex]?.data?.[childIndex]?.[grandchildIndex];
								if (!!formPath) {
									let { type, value, validate, required, error } = formPath || {}, specValue = '';
									if (typeof (grandchildItem) === 'string') {
										specValue = grandchildItem?.split(' • ')?.[1];
										grandchildItem = grandchildItem?.split(' • ')?.[0];
									}

									if (type === 'date') {
										const { year: y, month: m, day: d } = extractDateFull(grandchildItem);

										Form[form_parentIndex].data[childIndex][grandchildIndex].value[gIndex('year', value)] = {
											id: 'year',
											value: y,
											isValid: !!y,
										};
										Form[form_parentIndex].data[childIndex][grandchildIndex].value[gIndex('month', value)] = {
											id: 'month',
											value: m,
											isValid: !!m,
										};
										Form[form_parentIndex].data[childIndex][grandchildIndex].value[gIndex('day', value)] = {
											id: 'day',
											value: d,
											isValid: !!d,
										};
									}
									else if (type === 'option') {
										/** no need to update since parent condition says "typeof(grandchildItem) === 'string'" and string can't be for-Eached */
									}
									else if (typeof (grandchildItem) === 'object') {
										/** no need to update since parent condition says "typeof(grandchildItem) === 'string'" and this condition says "typeof(grandchildItem) === 'object'" */
									}
									else {
										let isValid = validate ? validate(grandchildItem) : validateText(grandchildItem);
										Form[form_parentIndex].data[childIndex][grandchildIndex] = {
											...formPath,
											value: grandchildItem,
											isValid,
											error: required
												? isValid
													? ''
													: (error || 'Please enter a valid value')
												: ''
										};
									}

									var item = {};
									const itemIndex = formPath?.items?.findIndex((i: any) => i.value === grandchildItem);
									if (itemIndex > -1) {
										item = formPath?.items[itemIndex];
										if (item?.addSection) Form.splice(form_parentIndex + 1, 0, item?.section);
									}

									const hasSpecification = (formPath?.hasSpecification || item?.hasSpecification) && type !== 'option';
									const baseSpecification = Object.keys(item || {})?.length > 0 ? item : formPath;
									if (hasSpecification) {
										let _specify = baseSpecification?.specification || {
											id: `for-${formPath?.id}`,
											label: baseSpecification?.specificationLabel || 'Please specify',
											placeholder: baseSpecification?.specificationLabel || 'Please specify',
											value: specValue,
											hasValidation: true,
											required: true,
											isValid: !!specValue,
											error: '',
											errorResponse: `Please enter a valid ${(baseSpecification?.specificationLabel || 'specification')?.toLowerCase()}`,
											validate: baseSpecification?.validate || validateText,
											keyboardType: baseSpecification?.keyboardType || 'default',
											specification: true,
										};
										if (!_specify?.value && !!specValue) {
											_specify.value = specValue;
											_specify.isValid = !!specValue;
										}
										Form[form_parentIndex].data[childIndex][grandchildIndex] = { ...Form[form_parentIndex].data[childIndex][grandchildIndex], hasSpecification: true };
										Form[form_parentIndex].data[childIndex]?.splice(grandchildIndex + 1, 0, _specify);
									}
									if (grandchildItem === 'ML') {
										Form[form_parentIndex].data[childIndex]?.splice(grandchildIndex + (hasSpecification ? 2 : 1), 0, _specifyML);
									}

								}

							}

							else if (grandchildItem?.length > 0) { // equipments ex.
								grandchildItem?.forEach((ggrandchild: any, index: number) => {
									const ggrandchildIndex = index;
									if (Form?.[form_parentIndex]?.data?.[childIndex]?.[form_grandchildIndex]?.data?.length < ggrandchildIndex + 1) { // add another obj inside the array, ex. multiple equipments
										const child = grandchildItem[ggrandchildIndex];

										const filledRow = buildRowFromParentItem(Form?.[form_parentIndex]?.data?.[childIndex]?.[form_grandchildIndex]?.template, child);
										Form?.[form_parentIndex]?.data?.[childIndex]?.[form_grandchildIndex]?.data?.push(filledRow)
										//Form?.[form_parentIndex]?.data?.[childIndex]?.[form_grandchildIndex]?.data?.push(Form?.[form_parentIndex]?.data?.[childIndex]?.[form_grandchildIndex]?.template);

									}
									Object.keys(ggrandchild)?.forEach((gggrandchild: any, index: number) => {
										var gggrandchildItem = ggrandchild[gggrandchild];
										const form_gggrandchildIndex = Form?.[form_parentIndex]?.data?.[childIndex]?.[form_grandchildIndex]?.data?.[ggrandchildIndex]?.findIndex((i: any) => i.id === gggrandchild);
										const formPath = Form?.[form_parentIndex]?.data?.[childIndex]?.[form_grandchildIndex]?.data?.[ggrandchildIndex]?.[form_gggrandchildIndex];
										if (!!formPath) {
											let { type, value, validate, required, error } = formPath || {}, specValue = '';
											if (typeof (gggrandchildItem) === 'string') {
												specValue = gggrandchildItem?.split(' • ')?.[1];
												gggrandchildItem = gggrandchildItem?.split(' • ')?.[0];
											}

											if (type === 'date') {
												const { year: y, month: m, day: d } = extractDateFull(gggrandchildItem);
												Form[form_parentIndex].data[childIndex][form_grandchildIndex].data[ggrandchildIndex][form_gggrandchildIndex].value[gIndex('year', value)] = {
													id: 'year',
													value: y,
													isValid: !!y,
												};
												Form[form_parentIndex].data[childIndex][form_grandchildIndex].data[ggrandchildIndex][form_gggrandchildIndex].value[gIndex('month', value)] = {
													id: 'month',
													value: m,
													isValid: !!m,
												};
												Form[form_parentIndex].data[childIndex][form_grandchildIndex].data[ggrandchildIndex][form_gggrandchildIndex].value[gIndex('day', value)] = {
													id: 'day',
													value: d,
													isValid: !!d,
												};
											}
											else if (type === 'option') {
												gggrandchildItem?.forEach((ggggrandchildItem: any, index: number) => {


													//
													//
													// const filledRow = buildRowFromParentItem(Form?.[form_parentIndex]?.data?.[childIndex]?.[form_grandchildIndex]?.template, child);
													// Form?.[form_parentIndex]?.data?.[childIndex]?.[form_grandchildIndex]?.data?.push( filledRow)
													//
													const form_ggggrandchildIndex = Form[form_parentIndex].data[childIndex][form_grandchildIndex].data[ggrandchildIndex][form_gggrandchildIndex]?.items?.findIndex((i: any) => i.value === ggggrandchildItem?.value);
													Form[form_parentIndex].data[childIndex][form_grandchildIndex].data[ggrandchildIndex][form_gggrandchildIndex].items[form_ggggrandchildIndex].selected = true;
													const specification = ggggrandchildItem.specification;
													if (specification) {
														const formPath = Form?.[form_parentIndex]?.data?.[childIndex]?.[form_grandchildIndex]?.data?.[ggrandchildIndex]?.[form_gggrandchildIndex]?.items?.[form_ggggrandchildIndex]?.specification;
														if (!!formPath) {
															let { type, value, validate, required, error } = formPath || {};

															if (type === 'date') {
																const { year: y, month: m, day: d } = extractDateFull(specification);
																Form[form_parentIndex].data[childIndex][form_grandchildIndex].data[ggrandchildIndex][form_gggrandchildIndex].items[form_ggggrandchildIndex].specification.value[gIndex('year', value)] = {
																	id: 'year',
																	value: y,
																	isValid: !!y,
																};
																Form[form_parentIndex].data[childIndex][form_grandchildIndex].data[ggrandchildIndex][form_gggrandchildIndex].items[form_ggggrandchildIndex].specification.value[gIndex('month', value)] = {
																	id: 'month',
																	value: m,
																	isValid: !!m,
																};
																Form[form_parentIndex].data[childIndex][form_grandchildIndex].data[ggrandchildIndex][form_gggrandchildIndex].items[form_ggggrandchildIndex].specification.value[gIndex('day', value)] = {
																	id: 'day',
																	value: d,
																	isValid: !!d,
																};
															}
															else if (typeof (specification) === 'object') {
																Object.keys(specification)?.forEach((gggggrandchild, index) => {
																	const gggggrandchildItem = specification[gggggrandchild];
																	const form_gggggrandchildIndex = Form[form_parentIndex].data[childIndex][form_grandchildIndex].data[ggrandchildIndex][form_gggrandchildIndex].items[form_ggggrandchildIndex].specification.value?.findIndex((i: any) => i.id === gggggrandchild);
																	Form[form_parentIndex].data[childIndex][form_grandchildIndex].data[ggrandchildIndex][form_gggrandchildIndex].items[form_ggggrandchildIndex].specification.value[form_gggggrandchildIndex].value = gggggrandchildItem;
																});
															}
															else {
																let isValid = validate ? validate(specification) : validateText(specification);
																Form[form_parentIndex].data[childIndex][form_grandchildIndex].data[ggrandchildIndex][form_gggrandchildIndex].items[form_ggggrandchildIndex].specification = {
																	...formPath,
																	value: specification,
																	isValid,
																	error: required
																		? isValid
																			? ''
																			: (error || 'Please enter a valid value')
																		: ''
																};
															}
														}
													}
												});
											}
											else if (typeof (gggrandchildItem) === 'object') {
												Object.keys(gggrandchildItem)?.forEach((ggggrandchild, index) => {
													const ggggrandchildItem = gggrandchildItem[ggggrandchild];

													const form_ggggrandchildIndex = Form[form_parentIndex].data[childIndex][form_grandchildIndex].data[ggrandchildIndex][form_gggrandchildIndex]?.value?.findIndex((i: any) => i.id === gggrandchild);
													Form[form_parentIndex].data[childIndex][form_grandchildIndex].data[ggrandchildIndex][form_gggrandchildIndex].value[form_ggggrandchildIndex].value = ggggrandchildItem;
												});
											}
											else {
												let isValid = validate ? validate(gggrandchildItem) : validateText(gggrandchildItem);
												Form[form_parentIndex].data[childIndex][form_grandchildIndex].data[ggrandchildIndex][form_gggrandchildIndex] = {
													...formPath,
													value: gggrandchildItem,
													isValid,
													error: required
														? isValid
															? ''
															: (error || 'Please enter a valid value')
														: ''
												};
											}

											var item = {};
											const itemIndex = formPath?.items?.findIndex((i: any) => i.value === gggrandchildItem);
											if (itemIndex > -1) {
												item = formPath?.items[itemIndex];
												if (item?.addSection) Form.splice(form_parentIndex + 1, 0, item?.section);
											}

											const hasSpecification = (formPath?.hasSpecification || item?.hasSpecification) && type !== 'option';
											const baseSpecification = Object.keys(item || {})?.length > 0 ? item : formPath;
											if (hasSpecification) {
												let _specify = baseSpecification?.specification || {
													id: `for-${formPath?.id}`,
													label: baseSpecification?.specificationLabel || 'Please specify',
													placeholder: baseSpecification?.specificationLabel || 'Please specify',
													value: specValue,
													hasValidation: true,
													required: true,
													isValid: !!specValue,
													error: '',
													errorResponse: `Please enter a valid ${(baseSpecification?.specificationLabel || 'specification')?.toLowerCase()}`,
													validate: baseSpecification?.validate || validateText,
													keyboardType: baseSpecification?.keyboardType || 'default',
													specification: true,
												};
												if (!_specify?.value && !!specValue) {
													_specify.value = specValue;
													_specify.isValid = !!specValue;
												}
												Form[form_parentIndex].data[childIndex][grandchildIndex] = { ...Form[form_parentIndex].data[childIndex][grandchildIndex], hasSpecification: true };
												Form[form_parentIndex].data[childIndex]?.splice(grandchildIndex + 1, 0, _specify);
											}
											// if (grandchildItem === 'ML') Form[form_parentIndex].data[childIndex]?.splice(grandchildIndex + (hasSpecification ? 2 : 1), 0, _specifyML);
										}

									});
								});
							}

							else if (Object.keys(grandchildItem)?.length > 0) { // equipment ex.

								Object.keys(grandchildItem)?.forEach((ggrandchild, index) => {
									var ggrandchildItem = grandchildItem[ggrandchild];
									const _parentField =
										Form?.[form_parentIndex]?.data?.[childIndex]?.[grandchildIndex];
									if (_parentField?.specification) grandchildIndex += 1;
									const form_ggrandchildIndex = _parentField?.data?.findIndex((i: any) => i.id === ggrandchild);
									const formPath = _parentField?.data?.[form_ggrandchildIndex];
									if (!!formPath) {
										let { type, value, validate, required, error } = formPath || {}, specValue = '';
										if (typeof (ggrandchildItem) === 'string') {
											specValue = ggrandchildItem?.split(' • ')?.[1];
											ggrandchildItem = ggrandchildItem?.split(' • ')?.[0];
										}

										if (type === 'date') {
											const { year: y, month: m, day: d } = extractDateFull(ggrandchildItem);
											Form[form_parentIndex].data[childIndex][grandchildIndex].data[form_ggrandchildIndex].value[gIndex('year', value)] = {
												id: 'year',
												value: y,
												isValid: !!y,
											};
											Form[form_parentIndex].data[childIndex][grandchildIndex].data[form_ggrandchildIndex].value[gIndex('month', value)] = {
												id: 'month',
												value: m,
												isValid: !!m,
											};
											Form[form_parentIndex].data[childIndex][grandchildIndex].data[form_ggrandchildIndex].value[gIndex('day', value)] = {
												id: 'day',
												value: d,
												isValid: !!d,
											};
										}
										else if (type === 'option') {
											ggrandchildItem?.forEach((gggrandchildItem: any, index: number) => {
												const form_gggrandchildIndex = Form[form_parentIndex].data[childIndex][grandchildIndex].data[form_ggrandchildIndex]?.items?.findIndex((i: any) => i.value === gggrandchildItem?.value);
												Form[form_parentIndex].data[childIndex][grandchildIndex].data[form_ggrandchildIndex].items[form_gggrandchildIndex].selected = true;
												const specification = gggrandchildItem.specification;
												if (specification) {
													const formPath = Form?.[form_parentIndex]?.data?.[childIndex]?.[grandchildIndex]?.data?.[form_ggrandchildIndex]?.items?.[form_gggrandchildIndex]?.specification;
													if (!!formPath) {
														let { type, value, validate, required, error } = formPath || {};

														if (type === 'date') {
															const { year: y, month: m, day: d } = extractDateFull(specification);
															Form[form_parentIndex].data[childIndex][grandchildIndex].data[form_ggrandchildIndex].items[form_gggrandchildIndex].specification.value[gIndex('year', value)] = {
																id: 'year',
																value: y,
																isValid: !!y,
															};
															Form[form_parentIndex].data[childIndex][grandchildIndex].data[form_ggrandchildIndex].items[form_gggrandchildIndex].specification.value[gIndex('month', value)] = {
																id: 'month',
																value: m,
																isValid: !!m,
															};
															Form[form_parentIndex].data[childIndex][grandchildIndex].data[form_ggrandchildIndex].items[form_gggrandchildIndex].specification.value[gIndex('day', value)] = {
																id: 'day',
																value: d,
																isValid: !!d,
															};
														}
														else if (typeof (specification) === 'object') {
															Object?.keys(specification)?.forEach((ggggrandchild, index) => {
																const ggggrandchildItem = specification[ggggrandchild];
																const form_ggggrandchildIndex = Form[form_parentIndex].data[childIndex][grandchildIndex].data[form_ggrandchildIndex].items[form_gggrandchildIndex].specification.value?.findIndex((i: any) => i.id === ggggrandchild);
																Form[form_parentIndex].data[childIndex][grandchildIndex].data[form_ggrandchildIndex].items[form_gggrandchildIndex].specification.value[form_ggggrandchildIndex].value = ggggrandchildItem;
															});
														}
														else {
															let isValid = validate ? validate(specification) : validateText(specification);
															Form[form_parentIndex].data[childIndex][grandchildIndex].data[form_ggrandchildIndex].items[form_gggrandchildIndex].specification = {
																...formPath,
																value: specification,
																isValid,
																error: required
																	? isValid
																		? ''
																		: (error || 'Please enter a valid value')
																	: ''
															};
														}
													}
												}
											});
										}
										else if (typeof (ggrandchildItem) === 'object') {
											Object?.keys(ggrandchildItem)?.forEach((gggrandchild, index) => {
												const gggrandchildItem = ggrandchildItem[gggrandchild];
												const form_gggrandchildIndex = Form[form_parentIndex].data[childIndex][grandchildIndex].data[form_ggrandchildIndex]?.value?.findIndex((i: any) => i.id === gggrandchild);
												Form[form_parentIndex].data[childIndex][grandchildIndex].data[form_ggrandchildIndex].value[form_gggrandchildIndex].value = gggrandchildItem;
											});
										}
										else {
											let isValid = validate ? validate(ggrandchildItem) : validateText(ggrandchildItem);
											Form[form_parentIndex].data[childIndex][grandchildIndex].data[form_ggrandchildIndex] = {
												...formPath,
												value: ggrandchildItem,
												isValid,
												error: required
													? isValid
														? ''
														: (error || 'Please enter a valid value')
													: ''
											};
										}

										var item = {};
										const itemIndex = formPath?.items?.findIndex((i: any) => i.value === ggrandchildItem);
										if (itemIndex > -1) {
											item = formPath?.items[itemIndex];
											if (item?.addSection) Form.splice(form_parentIndex + 1, 0, item?.section);
										}

										const hasSpecification = (formPath?.hasSpecification || item?.hasSpecification) && type !== 'option';
										const baseSpecification = Object?.keys(item || {})?.length > 0 ? item : formPath;
										if (hasSpecification) {
											let _specify = baseSpecification?.specification || {
												id: `for-${formPath?.id}`,
												label: baseSpecification?.specificationLabel || 'Please specify',
												placeholder: baseSpecification?.specificationLabel || 'Please specify',
												value: specValue,
												hasValidation: true,
												required: true,
												isValid: !!specValue,
												error: '',
												errorResponse: `Please enter a valid ${(baseSpecification?.specificationLabel || 'specification')?.toLowerCase()}`,
												validate: baseSpecification?.validate || validateText,
												keyboardType: baseSpecification?.keyboardType || 'default',
												specification: true,
											};
											if (!_specify?.value && !!specValue) {
												_specify.value = specValue;
												_specify.isValid = !!specValue;
											}
											Form[form_parentIndex].data[childIndex][grandchildIndex] = { ...Form[form_parentIndex].data[childIndex][grandchildIndex], hasSpecification: true };
											Form[form_parentIndex].data[childIndex]?.splice(grandchildIndex + 1, 0, _specify);
										}
										// if (grandchildItem === 'ML') Form[form_parentIndex].data[childIndex]?.splice(grandchildIndex + (hasSpecification ? 2 : 1), 0, _specifyML);

									}
									if (_parentField?.type === "unit") {
										if (typeof ggrandchildItem === "string") {
											setUnitComposite(Form, form_parentIndex, childIndex, grandchildIndex, ggrandchild as any, ggrandchildItem);
										} else if (typeof ggrandchildItem === "number" || (typeof ggrandchildItem === "string" && ggrandchild === "frequency")) {
											setUnitComposite(Form, form_parentIndex, childIndex, grandchildIndex, "frequency", ggrandchildItem);
										}
										return;
									}

								});
							}

						});
					});
				}

				else if (Object?.keys(parentItem)?.length > 0 && form_parentIndex > -1) { // not parentList, stationEquipment ex. && field exists on form
					Object?.keys(parentItem)?.forEach((child, index) => {
						var childItem = parentItem[child];
						const form_childIndex = Form?.[form_parentIndex]?.data?.findIndex((i: any) => i.id === child);

						const formPath = Form?.[form_parentIndex]?.data?.[form_childIndex];
						if (!!formPath) {
							let { type, value, validate, required, error } = formPath || {}, specValue = '';
							if (typeof (childItem) === 'string') {
								specValue = childItem?.split(' • ')?.[1];
								childItem = childItem?.split(' • ')?.[0];
							}

							if (type === 'date') {
								const { year: y, month: m, day: d } = extractDateFull(childItem);
								Form[form_parentIndex].data[form_childIndex].value[gIndex('year', value)] = {
									id: 'year',
									value: y,
									isValid: !!y,
								};
								Form[form_parentIndex].data[form_childIndex].value[gIndex('month', value)] = {
									id: 'month',
									value: m,
									isValid: !!m,
								};
								Form[form_parentIndex].data[form_childIndex].value[gIndex('day', value)] = {
									id: 'day',
									value: d,
									isValid: !!d,
								};
							}
							else if (type === 'option') {
								childItem?.forEach((grandchildItem: any, index: number) => {
									const form_grandchildIndex = Form?.[form_parentIndex]?.data?.[form_childIndex]?.items?.findIndex((i: any) => i.value === grandchildItem?.value);
									Form[form_parentIndex].data[form_childIndex].items[form_grandchildIndex].selected = true;
									const specification = grandchildItem.specification;
									if (specification) {
										const formPath = Form?.[form_parentIndex]?.data?.[form_childIndex]?.items?.[form_grandchildIndex]?.specification;
										if (!!formPath) {
											let { type, value, validate, required, error } = formPath || {};

											if (type === 'date') {
												const { year: y, month: m, day: d } = extractDateFull(specification);
												Form[form_parentIndex].data[form_childIndex].items[form_grandchildIndex].specification.value[gIndex('year', value)] = {
													id: 'year',
													value: y,
													isValid: !!y,
												};
												Form[form_parentIndex].data[form_childIndex].items[form_grandchildIndex].specification.value[gIndex('month', value)] = {
													id: 'month',
													value: m,
													isValid: !!m,
												};
												Form[form_parentIndex].data[form_childIndex].items[form_grandchildIndex].specification.value[gIndex('day', value)] = {
													id: 'day',
													value: d,
													isValid: !!d,
												};
											}
											else if (typeof (specification) === 'object') {
												Object?.keys(specification)?.forEach((ggrandchild, index) => {
													const ggrandchildItem = specification[ggrandchild];
													const form_ggrandchildIndex = Form?.[form_parentIndex]?.data?.[form_childIndex]?.items?.[form_grandchildIndex]?.specification?.value?.findIndex((i: any) => i.id === ggrandchild);
													Form[form_parentIndex].data[form_childIndex].items[form_grandchildIndex].specification.value[form_ggrandchildIndex].value = ggrandchildItem;
												});
											}
											else {
												let isValid = validate ? validate(specification) : validateText(specification);
												Form[form_parentIndex].data[form_childIndex].items[form_grandchildIndex].specification = {
													...formPath,
													value: specification,
													isValid,
													error: required
														? isValid
															? ''
															: (error || 'Please enter a valid value')
														: ''
												};
											}
										}
									}
								});
							}
							else if (typeof (childItem) === 'object') {
								Object?.keys(childItem)?.forEach((grandchild, index) => {
									const grandchildItem = childItem[grandchild];
									const form_grandchildIndex = Form?.[form_parentIndex]?.data?.[form_childIndex]?.value?.findIndex((i: any) => i.id === grandchild);
									Form[form_parentIndex].data[form_childIndex].value[form_grandchildIndex].value = grandchildItem;
								});
							}
							else {
								let isValid = validate ? validate(childItem) : validateText(childItem);
								Form[form_parentIndex].data[form_childIndex] = {
									...formPath,
									value: childItem,
									isValid,
									error: required
										? isValid
											? ''
											: (error || 'Please enter a valid value')
										: ''
								};
							}

							var item = {};
							const itemIndex = formPath?.items?.findIndex((i: any) => i.value === childItem);
							if (itemIndex > -1) {
								item = formPath?.items[itemIndex];
								if (item?.addSection) Form.splice(form_parentIndex + 1, 0, item?.section);
							}

							const hasSpecification = (formPath?.hasSpecification || item?.hasSpecification) && type !== 'option';
							const baseSpecification = Object?.keys(item || {})?.length > 0 ? item : formPath;
							if (hasSpecification) {
								let _specify = baseSpecification?.specification || {
									id: `for-${formPath?.id}`,
									label: baseSpecification?.specificationLabel || 'Please specify',
									placeholder: baseSpecification?.specificationLabel || 'Please specify',
									value: specValue,
									hasValidation: true,
									required: true,
									isValid: !!specValue,
									error: '',
									errorResponse: `Please enter a valid ${(baseSpecification?.specificationLabel || 'specification')?.toLowerCase()}`,
									validate: baseSpecification?.validate || validateText,
									keyboardType: baseSpecification?.keyboardType || 'default',
									specification: true,
								};
								if (!_specify?.value && !!specValue) {
									_specify.value = specValue;
									_specify.isValid = !!specValue;
								}
								Form[form_parentIndex].data[form_childIndex] = { ...Form[form_parentIndex].data[form_childIndex], hasSpecification: true };
								Form[form_parentIndex].data?.splice(form_childIndex + 1, 0, _specify);
							}
							// if (childItem === 'ML') Form[form_parentIndex].data?.splice(form_childIndex + (hasSpecification ? 2 : 1), 0, _specifyML);

						}
					});
				}

			}
		});
		const getFieldIndex = (Form: any, docuId: number, fieldId: string, rowIdx = 0) => {
			const rows = Form?.[docuId]?.data;
			if (!Array.isArray(rows)) return -1;
			const fields = Array.isArray(rows[0]) ? rows[rowIdx] : rows;
			return Array.isArray(fields) ? fields.findIndex((f: any) => f.id === fieldId) : -1;
		};
		const fillDocu = (type: string, documenttype: string) => {
			const docuId = Form?.findIndex((i: any) => i.id === type);
			const idx = getFieldIndex(Form, docuId, 'dateOfExpiry')
			if (docuId > -1) {

				const noId = Form?.[docuId]?.data?.findIndex((i: any) => i.id === `${type}Number`);
				const expiryId = Form?.[docuId]?.data?.findIndex((i: any) => i.id === 'dateOfExpiry');
				const { documentNumber, validUntil, service } = savedApplication;
				if (noId > -1 && !!documentNumber) {
					Form[docuId].data[noId] = {
						...Form[docuId].data[noId],
						value: documentNumber,
						isValid: true,
					};
				}
				if (expiryId > -1 && !!validUntil) {
					const { year: y, month: m, day: d } = extractDateFull(validUntil);
					let val = Form[docuId].data[expiryId].value;
					Form[docuId].data[expiryId].value[gIndex('year', val)] = {
						id: 'year',
						value: y,
						isValid: !!y,
					};
					Form[docuId].data[expiryId].value[gIndex('month', val)] = {
						id: 'month',
						value: m,
						isValid: !!m,
					};
					Form[docuId].data[expiryId].value[gIndex('day', val)] = {
						id: 'day',
						value: d,
						isValid: !!d,
					};
				}
				else if (idx > -1 && Form[docuId].data?.[0]?.[idx]?.value) {

					const { year: y, month: m, day: d } = extractDateFull(service?.[documenttype]?.dateOfExpiry);
					let val = Form[docuId].data?.[0]?.[idx]?.value;
					const _idx = Array.isArray(Form[docuId].data?.[0]) ? Form[docuId].data?.[0]?.findIndex((i: any) => i.id === "dateOfExpiry") : -1
					if (y && m && d && _idx > -1 && Form[docuId].data?.[0]) {
						Form[docuId].data[0][_idx].value[gIndex('year', val)] = {
							id: 'year',
							value: y,
							isValid: !!y,
						};
						Form[docuId].data[0][_idx].value[gIndex('month', val)] = {
							id: 'month',
							value: m,
							isValid: !!m,
						};
						Form[docuId].data[0][_idx].value[gIndex('day', val)] = {
							id: 'day',
							value: d,
							isValid: !!d,
						};
					}


				}
			}
		};
		const AT = savedApplication?.renew?.applicationType || savedApplication?.service?.applicationType;
		if (AT?.label?.toLowerCase()?.includes('renew')) {
			fillDocu('certificate', 'certificate');
			fillDocu('license', 'license');
			fillDocu('permit', 'permit');
			fillDocu('accreditation', 'accreditation');
			fillDocu('document', 'document');
			fillDocu("radioOfficerOperator", "certificate");
			fillDocu("radioOfficerOperator", "license");
			fillDocu("radioOfficerOperator", "permit");
			fillDocu("radioOfficerOperator", "accreditation");
			fillDocu("radioOfficerOperator", "document");
		}
	}

	return Form;
};

export const compareApplication = (savedApplication: any, form: any) => {
	const service = savedApplication?.service;
	const Form = cloneDeep(form);
	const gIndex = (d: string, v: any) => v?.findIndex((i: any) => i.id === d);
	var isModified = false;
	Object?.keys(service).forEach((parent, index) => {
		if (
			parent !== '_id' &&
			parent !== 'applicationType' &&
			parent !== 'name' &&
			parent !== 'serviceCode'
		) {
			const parentItem = service[parent];
			const form_parentIndex = Form.findIndex((i: any) => i.id === parent);

			if (parentItem.length > 0 && form_parentIndex > -1) { // parentList, particulars ex. && field exists on form
				parentItem.forEach((child: any, index: number) => {
					const childIndex = index;
					if (Form?.[form_parentIndex]?.data?.length < childIndex + 1) { // add another obj inside the array, ex. multiple equipments
						Form?.[form_parentIndex]?.data?.push(Form[form_parentIndex].template)
					}
					Object?.keys(child)?.forEach((grandchild, index) => {
						var grandchildItem = child[grandchild];
						var grandchildIndex = index;
						const form_grandchildIndex = Form?.[form_parentIndex]?.data?.[childIndex]?.findIndex((i: any) => i.id === grandchild);
						if (typeof (grandchildItem) === 'string') { // stationClass ex.
							if (Form[form_parentIndex].data[childIndex][grandchildIndex]?.specification) grandchildIndex += 1;
							const formPath = Form?.[form_parentIndex]?.data?.[childIndex]?.[grandchildIndex];
							if (!!formPath) {
								let { type, value, validate, required, error } = formPath || {}, specValue = '';
								if (typeof (grandchildItem) === 'string') {
									specValue = grandchildItem?.split(' • ')?.[1];
									grandchildItem = grandchildItem?.split(' • ')?.[0];
								}

								if (type === 'date') {
									const { year: y, month: m, day: d } = extractDateFull(grandchildItem);
									if (Form[form_parentIndex].data[childIndex][grandchildIndex].value[gIndex('year', value)]?.value !== y) {
										isModified = true;
									}
									if (Form[form_parentIndex].data[childIndex][grandchildIndex].value[gIndex('month', value)]?.value !== m) {
										isModified = true;
									}
									if (Form[form_parentIndex].data[childIndex][grandchildIndex].value[gIndex('day', value)]?.value !== d) {
										isModified = true;
									}
								}
								else if (type === 'option') {
									/** no need to update since parent condition says "typeof(grandchildItem) === 'string'" and string can't be for-Eached */
								}
								else if (typeof (grandchildItem) === 'object') {
									/** no need to update since parent condition says "typeof(grandchildItem) === 'string'" and this condition says "typeof(grandchildItem) === 'object'" */
								}
								else {
									let isValid = validate ? validate(grandchildItem) : validateText(grandchildItem);
									if (Form[form_parentIndex].data[childIndex][grandchildIndex]?.value !== grandchildItem) {
										isModified = true;
									}
								}

								var item = {};
								const itemIndex = formPath?.items?.findIndex((i: any) => i.value === grandchildItem);
								if (itemIndex > -1) {
									item = formPath?.items[itemIndex];
									if (item?.addSection) Form.splice(form_parentIndex + 1, 0, item?.section);
								}

								const hasSpecification = (formPath?.hasSpecification || item?.hasSpecification) && type !== 'option';
								const baseSpecification = Object?.keys(item || {})?.length > 0 ? item : formPath;
								if (hasSpecification) {
									let _specify = baseSpecification?.specification || {
										id: `for-${formPath?.id}`,
										label: baseSpecification?.specificationLabel || 'Please specify',
										placeholder: baseSpecification?.specificationLabel || 'Please specify',
										value: specValue,
										hasValidation: true,
										required: true,
										isValid: !!specValue,
										error: '',
										errorResponse: `Please enter a valid ${(baseSpecification?.specificationLabel || 'specification')?.toLowerCase()}`,
										validate: baseSpecification?.validate || validateText,
										keyboardType: baseSpecification?.keyboardType || 'default',
										specification: true,
									};
									if (!_specify?.value && !!specValue) {
										_specify.value = specValue;
										_specify.isValid = !!specValue;
									}
									Form[form_parentIndex].data[childIndex][grandchildIndex] = { ...Form[form_parentIndex].data[childIndex][grandchildIndex], hasSpecification: true };
									Form[form_parentIndex].data[childIndex]?.splice(grandchildIndex + 1, 0, _specify);
									if (Form[form_parentIndex].data[childIndex][grandchildIndex + 1]?.value !== _specify?.value) {
										isModified = true;
									}
								}
								if (grandchildItem === 'ML') {
									Form[form_parentIndex].data[childIndex]?.splice(grandchildIndex + (hasSpecification ? 2 : 1), 0, _specifyML);
									if (Form[form_parentIndex].data[childIndex][grandchildIndex + (hasSpecification ? 2 : 1)]?.value !== _specifyML?.value) {
										isModified = true;
									}
								}

							}

						}

						else if (grandchildItem?.length > 0) { // equipments ex.
							grandchildItem?.forEach((ggrandchild: any, index: number) => {
								const ggrandchildIndex = index;
								if (Form?.[form_parentIndex]?.data?.[childIndex]?.[form_grandchildIndex]?.data?.length < ggrandchildIndex + 1) { // add another obj inside the array, ex. multiple equipments
									Form?.[form_parentIndex]?.data?.[childIndex]?.[form_grandchildIndex]?.data?.push(Form?.[form_parentIndex]?.data?.[childIndex]?.[form_grandchildIndex]?.template);
								}
								Object?.keys(ggrandchild)?.forEach((gggrandchild: any, index: number) => {
									var gggrandchildItem = ggrandchild[gggrandchild];
									const form_gggrandchildIndex = Form?.[form_parentIndex]?.data?.[childIndex]?.[form_grandchildIndex]?.data?.[ggrandchildIndex]?.findIndex((i: any) => i.id === gggrandchild);
									const formPath = Form?.[form_parentIndex]?.data?.[childIndex]?.[form_grandchildIndex]?.data?.[ggrandchildIndex]?.[form_gggrandchildIndex];
									if (!!formPath) {
										let { type, value, validate, required, error } = formPath || {}, specValue = '';
										if (typeof (gggrandchildItem) === 'string') {
											specValue = gggrandchildItem?.split(' • ')?.[1];
											gggrandchildItem = gggrandchildItem?.split(' • ')?.[0];
										}

										if (type === 'date') {
											const { year: y, month: m, day: d } = extractDateFull(gggrandchildItem);
											if (Form[form_parentIndex].data[childIndex][form_grandchildIndex].data[ggrandchildIndex][form_gggrandchildIndex].value[gIndex('year', value)]?.value !== y) {
												isModified = true;
											}
											if (Form[form_parentIndex].data[childIndex][form_grandchildIndex].data[ggrandchildIndex][form_gggrandchildIndex].value[gIndex('month', value)]?.value !== m) {
												isModified = true;
											}
											if (Form[form_parentIndex].data[childIndex][form_grandchildIndex].data[ggrandchildIndex][form_gggrandchildIndex].value[gIndex('day', value)]?.value !== d) {
												isModified = true;
											}
										}
										else if (type === 'option') {
											gggrandchildItem?.forEach((ggggrandchildItem: any, index: number) => {
												const form_ggggrandchildIndex = Form[form_parentIndex].data[childIndex][form_grandchildIndex].data[ggrandchildIndex][form_gggrandchildIndex]?.items?.findIndex((i: any) => i.value === ggggrandchildItem?.value);
												Form[form_parentIndex].data[childIndex][form_grandchildIndex].data[ggrandchildIndex][form_gggrandchildIndex].items[form_ggggrandchildIndex].selected = true;
												const specification = ggggrandchildItem.specification;
												if (specification) {
													const formPath = Form?.[form_parentIndex]?.data?.[childIndex]?.[form_grandchildIndex]?.data?.[ggrandchildIndex]?.[form_gggrandchildIndex]?.items?.[form_ggggrandchildIndex]?.specification;
													if (!!formPath) {
														let { type, value, validate, required, error } = formPath || {};

														if (type === 'date') {
															const { year: y, month: m, day: d } = extractDateFull(specification);
															if (Form[form_parentIndex].data[childIndex][form_grandchildIndex].data[ggrandchildIndex][form_gggrandchildIndex].items[form_ggggrandchildIndex].specification.value[gIndex('year', value)]?.value !== y) {
																isModified = true;
															}
															if (Form[form_parentIndex].data[childIndex][form_grandchildIndex].data[ggrandchildIndex][form_gggrandchildIndex].items[form_ggggrandchildIndex].specification.value[gIndex('month', value)]?.value !== m) {
																isModified = true;
															}
															if (Form[form_parentIndex].data[childIndex][form_grandchildIndex].data[ggrandchildIndex][form_gggrandchildIndex].items[form_ggggrandchildIndex].specification.value[gIndex('day', value)]?.value !== d) {
																isModified = true;
															}
														}
														else if (typeof (specification) === 'object') {
															Object?.keys(specification)?.forEach((gggggrandchild, index) => {
																const gggggrandchildItem = specification[gggggrandchild];
																const form_gggggrandchildIndex = Form[form_parentIndex].data[childIndex][form_grandchildIndex].data[ggrandchildIndex][form_gggrandchildIndex].items[form_ggggrandchildIndex].specification.value?.findIndex((i: any) => i.id === gggggrandchild);
																if (Form[form_parentIndex].data[childIndex][form_grandchildIndex].data[ggrandchildIndex][form_gggrandchildIndex].items[form_ggggrandchildIndex].specification.value[form_gggggrandchildIndex].value !== gggggrandchildItem) {
																	isModified = true;
																}
															});
														}
														else {
															let isValid = validate ? validate(specification) : validateText(specification);
															if (Form[form_parentIndex].data[childIndex][form_grandchildIndex].data[ggrandchildIndex][form_gggrandchildIndex].items[form_ggggrandchildIndex].specification?.value !== specification) {
																isModified = true;
															}
														}
													}
												}
											});
										}
										else if (typeof (gggrandchildItem) === 'object') {
											Object?.keys(gggrandchildItem)?.forEach((ggggrandchild, index) => {
												const ggggrandchildItem = gggrandchildItem[ggggrandchild];
												const form_ggggrandchildIndex = Form[form_parentIndex].data[childIndex][form_grandchildIndex].data[ggrandchildIndex][form_gggrandchildIndex]?.value?.findIndex((i: any) => i.id === gggrandchild);
												if (Form[form_parentIndex].data[childIndex][form_grandchildIndex].data[ggrandchildIndex][form_gggrandchildIndex].value[form_ggggrandchildIndex].value !== ggggrandchildItem) {
													isModified = true;
												}
											});
										}
										else {
											let isValid = validate ? validate(gggrandchildItem) : validateText(gggrandchildItem);
											if (Form[form_parentIndex].data[childIndex][form_grandchildIndex].data[ggrandchildIndex][form_gggrandchildIndex]?.value !== gggrandchildItem) {
												isModified = true;
											}
										}

										var item = {};
										const itemIndex = formPath?.items?.findIndex((i: any) => i.value === gggrandchildItem);
										if (itemIndex > -1) {
											item = formPath?.items[itemIndex];
											if (item?.addSection) Form.splice(form_parentIndex + 1, 0, item?.section);
										}

										const hasSpecification = (formPath?.hasSpecification || item?.hasSpecification) && type !== 'option';
										const baseSpecification = Object?.keys(item || {})?.length > 0 ? item : formPath;
										if (hasSpecification) {
											let _specify = baseSpecification?.specification || {
												id: `for-${formPath?.id}`,
												label: baseSpecification?.specificationLabel || 'Please specify',
												placeholder: baseSpecification?.specificationLabel || 'Please specify',
												value: specValue,
												hasValidation: true,
												required: true,
												isValid: !!specValue,
												error: '',
												errorResponse: `Please enter a valid ${(baseSpecification?.specificationLabel || 'specification')?.toLowerCase()}`,
												validate: baseSpecification?.validate || validateText,
												keyboardType: baseSpecification?.keyboardType || 'default',
												specification: true,
											};
											if (!_specify?.value && !!specValue) {
												_specify.value = specValue;
												_specify.isValid = !!specValue;
											}
											Form[form_parentIndex].data[childIndex][grandchildIndex] = { ...Form[form_parentIndex].data[childIndex][grandchildIndex], hasSpecification: true };
											Form[form_parentIndex].data[childIndex]?.splice(grandchildIndex + 1, 0, _specify);
											if (Form[form_parentIndex].data[childIndex][grandchildIndex + 1]?.value !== _specify?.value) {
												isModified = true;
											}
										}
										// if (grandchildItem === 'ML') Form[form_parentIndex].data[childIndex]?.splice(grandchildIndex + (hasSpecification ? 2 : 1), 0, _specifyML);
									}

								});
							});
						}

						else if (Object?.keys(grandchildItem)?.length > 0) { // equipment ex.
							Object?.keys(grandchildItem)?.forEach((ggrandchild, index) => {
								var ggrandchildItem = grandchildItem[ggrandchild];

								if (Form?.[form_parentIndex]?.data?.[childIndex]?.[grandchildIndex]?.specification) grandchildIndex += 1;

								const form_ggrandchildIndex = Form?.[form_parentIndex]?.data?.[childIndex]?.[grandchildIndex]?.data?.findIndex((i: any) => i.id === ggrandchild);
								const formPath = Form?.[form_parentIndex]?.data?.[childIndex]?.[grandchildIndex]?.data?.[form_ggrandchildIndex];
								if (!!formPath) {
									let { type, value, validate, required, error } = formPath || {}, specValue = '';
									if (typeof (ggrandchildItem) === 'string') {
										specValue = ggrandchildItem?.split(' • ')?.[1];
										ggrandchildItem = ggrandchildItem?.split(' • ')?.[0];
									}

									if (type === 'date') {
										const { year: y, month: m, day: d } = extractDateFull(ggrandchildItem);
										if (Form[form_parentIndex].data[childIndex][grandchildIndex].data[form_ggrandchildIndex].value[gIndex('year', value)]?.value !== y) {
											isModified = true;
										}
										if (Form[form_parentIndex].data[childIndex][grandchildIndex].data[form_ggrandchildIndex].value[gIndex('month', value)]?.value !== m) {
											isModified = true;
										}
										if (Form[form_parentIndex].data[childIndex][grandchildIndex].data[form_ggrandchildIndex].value[gIndex('day', value)]?.value !== d) {
											isModified = true;
										}
									}
									else if (type === 'option') {
										ggrandchildItem?.forEach((gggrandchildItem: any, index: number) => {
											const form_gggrandchildIndex = Form[form_parentIndex].data[childIndex][grandchildIndex].data[form_ggrandchildIndex]?.items?.findIndex((i: any) => i.value === gggrandchildItem?.value);
											Form[form_parentIndex].data[childIndex][grandchildIndex].data[form_ggrandchildIndex].items[form_gggrandchildIndex].selected = true;
											const specification = gggrandchildItem.specification;
											if (specification) {
												const formPath = Form?.[form_parentIndex]?.data?.[childIndex]?.[grandchildIndex]?.data?.[form_ggrandchildIndex]?.items?.[form_gggrandchildIndex]?.specification;
												if (!!formPath) {
													let { type, value, validate, required, error } = formPath || {};

													if (type === 'date') {
														const { year: y, month: m, day: d } = extractDateFull(specification);
														if (Form[form_parentIndex].data[childIndex][grandchildIndex].data[form_ggrandchildIndex].items[form_gggrandchildIndex].specification.value[gIndex('year', value)]?.value !== y) {
															isModified = true;
														}
														if (Form[form_parentIndex].data[childIndex][grandchildIndex].data[form_ggrandchildIndex].items[form_gggrandchildIndex].specification.value[gIndex('month', value)]?.value !== m) {
															isModified = true;
														}
														if (Form[form_parentIndex].data[childIndex][grandchildIndex].data[form_ggrandchildIndex].items[form_gggrandchildIndex].specification.value[gIndex('day', value)]?.value !== d) {
															isModified = true;
														}
													}
													else if (typeof (specification) === 'object') {
														Object?.keys(specification)?.forEach((ggggrandchild, index) => {
															const ggggrandchildItem = specification[ggggrandchild];
															const form_ggggrandchildIndex = Form[form_parentIndex].data[childIndex][grandchildIndex].data[form_ggrandchildIndex].items[form_gggrandchildIndex].specification.value?.findIndex((i: any) => i.id === ggggrandchild);
															if (Form[form_parentIndex].data[childIndex][grandchildIndex].data[form_ggrandchildIndex].items[form_gggrandchildIndex].specification.value[form_ggggrandchildIndex].value !== ggggrandchildItem) {
																isModified = true;
															}
														});
													}
													else {
														let isValid = validate ? validate(specification) : validateText(specification);
														if (Form[form_parentIndex].data[childIndex][grandchildIndex].data[form_ggrandchildIndex].items[form_gggrandchildIndex].specification?.value !== specification) {
															isModified = true;
														}
													}
												}
											}
										});
									}
									else if (typeof (ggrandchildItem) === 'object') {
										Object?.keys(ggrandchildItem)?.forEach((gggrandchild, index) => {
											const gggrandchildItem = ggrandchildItem[gggrandchild];
											const form_gggrandchildIndex = Form[form_parentIndex].data[childIndex][grandchildIndex].data[form_ggrandchildIndex]?.value?.findIndex((i: any) => i.id === gggrandchild);
											if (Form[form_parentIndex].data[childIndex][grandchildIndex].data[form_ggrandchildIndex].value[form_gggrandchildIndex].value !== gggrandchildItem) {
												isModified = true;
											}
										});
									}
									else {
										let isValid = validate ? validate(ggrandchildItem) : validateText(ggrandchildItem);
										if (Form[form_parentIndex].data[childIndex][grandchildIndex].data[form_ggrandchildIndex]?.value !== ggrandchildItem) {
											isModified = true;
										}
									}

									var item = {};
									const itemIndex = formPath?.items?.findIndex((i: any) => i.value === ggrandchildItem);
									if (itemIndex > -1) {
										item = formPath?.items[itemIndex];
										if (item?.addSection) Form.splice(form_parentIndex + 1, 0, item?.section);
									}

									const hasSpecification = (formPath?.hasSpecification || item?.hasSpecification) && type !== 'option';
									const baseSpecification = Object?.keys(item || {})?.length > 0 ? item : formPath;
									if (hasSpecification) {
										let _specify = baseSpecification?.specification || {
											id: `for-${formPath?.id}`,
											label: baseSpecification?.specificationLabel || 'Please specify',
											placeholder: baseSpecification?.specificationLabel || 'Please specify',
											value: specValue,
											hasValidation: true,
											required: true,
											isValid: !!specValue,
											error: '',
											errorResponse: `Please enter a valid ${(baseSpecification?.specificationLabel || 'specification')?.toLowerCase()}`,
											validate: baseSpecification?.validate || validateText,
											keyboardType: baseSpecification?.keyboardType || 'default',
											specification: true,
										};
										if (!_specify?.value && !!specValue) {
											_specify.value = specValue;
											_specify.isValid = !!specValue;
										}
										Form[form_parentIndex].data[childIndex][grandchildIndex] = { ...Form[form_parentIndex].data[childIndex][grandchildIndex], hasSpecification: true };
										Form[form_parentIndex].data[childIndex]?.splice(grandchildIndex + 1, 0, _specify);
										if (Form[form_parentIndex].data[childIndex][grandchildIndex + 1]?.value !== _specify?.value) {
											isModified = true;
										}
									}
									// if (grandchildItem === 'ML') Form[form_parentIndex].data[childIndex]?.splice(grandchildIndex + (hasSpecification ? 2 : 1), 0, _specifyML);

								}

							});
						}

					});
				});
			}

			else if (Object?.keys(parentItem)?.length > 0 && form_parentIndex > -1) { // not parentList, stationEquipment ex. && field exists on form
				Object?.keys(parentItem)?.forEach((child, index) => {
					if (child !== 'noOfYears') { /**excempt noOfYears on isModified */
						var childItem = parentItem[child];
						const form_childIndex = Form?.[form_parentIndex]?.data?.findIndex((i: any) => i.id === child);

						const formPath = Form?.[form_parentIndex]?.data?.[form_childIndex];
						if (!!formPath) {
							let { type, value, validate, required, error } = formPath || {}, specValue = '';
							if (typeof (childItem) === 'string') {
								specValue = childItem?.split(' • ')?.[1];
								childItem = childItem?.split(' • ')?.[0];
							}

							if (type === 'date') {
								const { year: y, month: m, day: d } = extractDateFull(childItem);
								if (Form[form_parentIndex].data[form_childIndex].value[gIndex('year', value)]?.value !== y) {
									isModified = true;
								}
								if (Form[form_parentIndex].data[form_childIndex].value[gIndex('month', value)]?.value !== m) {
									isModified = true;
								}
								if (Form[form_parentIndex].data[form_childIndex].value[gIndex('day', value)]?.value !== d) {
									isModified = true;
								}
							}
							else if (type === 'option') {
								childItem?.forEach((grandchildItem: any, index: number) => {
									const form_grandchildIndex = Form?.[form_parentIndex]?.data?.[form_childIndex]?.items?.findIndex((i: any) => i.value === grandchildItem?.value);
									Form[form_parentIndex].data[form_childIndex].items[form_grandchildIndex].selected = true;
									const specification = grandchildItem.specification;
									if (specification) {
										const formPath = Form?.[form_parentIndex]?.data?.[form_childIndex]?.items?.[form_grandchildIndex]?.specification;
										if (!!formPath) {
											let { type, value, validate, required, error } = formPath || {};

											if (type === 'date') {
												const { year: y, month: m, day: d } = extractDateFull(specification);
												if (Form[form_parentIndex].data[form_childIndex].items[form_grandchildIndex].specification.value[gIndex('year', value)]?.value !== y) {
													isModified = true;
												}
												if (Form[form_parentIndex].data[form_childIndex].items[form_grandchildIndex].specification.value[gIndex('month', value)]?.value !== m) {
													isModified = true;
												}
												if (Form[form_parentIndex].data[form_childIndex].items[form_grandchildIndex].specification.value[gIndex('day', value)]?.value !== d) {
													isModified = true;
												}
											}
											else if (typeof (specification) === 'object') {
												Object?.keys(specification)?.forEach((ggrandchild, index) => {
													const ggrandchildItem = specification[ggrandchild];
													const form_ggrandchildIndex = Form?.[form_parentIndex]?.data?.[form_childIndex]?.items?.[form_grandchildIndex]?.specification?.value?.findIndex((i: any) => i.id === ggrandchild);
													if (Form[form_parentIndex].data[form_childIndex].items[form_grandchildIndex].specification.value[form_ggrandchildIndex].value !== ggrandchildItem) {
														isModified = true;
													}
												});
											}
											else {
												let isValid = validate ? validate(specification) : validateText(specification);
												if (Form[form_parentIndex].data[form_childIndex].items[form_grandchildIndex].specification?.value !== specification) {
													isModified = true;
												}
											}
										}
									}
								});
							}
							else if (typeof (childItem) === 'object') {
								Object?.keys(childItem)?.forEach((grandchild, index) => {
									const grandchildItem = childItem[grandchild];
									const form_grandchildIndex = Form?.[form_parentIndex]?.data?.[form_childIndex]?.value?.findIndex((i: any) => i.id === grandchild);
									if (Form[form_parentIndex].data[form_childIndex].value[form_grandchildIndex].value !== grandchildItem) {
										isModified = true;
									}
								});
							}
							else {
								let isValid = validate ? validate(childItem) : validateText(childItem);
								if (Form[form_parentIndex].data[form_childIndex]?.value !== childItem) {
									isModified = true;
								}
							}

							var item = {};
							const itemIndex = formPath?.items?.findIndex((i: any) => i.value === childItem);
							if (itemIndex > -1) {
								item = formPath?.items[itemIndex];
								if (item?.addSection) Form.splice(form_parentIndex + 1, 0, item?.section);
							}

							const hasSpecification = (formPath?.hasSpecification || item?.hasSpecification) && type !== 'option';
							const baseSpecification = Object?.keys(item || {})?.length > 0 ? item : formPath;
							if (hasSpecification) {
								let _specify = baseSpecification?.specification || {
									id: `for-${formPath?.id}`,
									label: baseSpecification?.specificationLabel || 'Please specify',
									placeholder: baseSpecification?.specificationLabel || 'Please specify',
									value: specValue,
									hasValidation: true,
									required: true,
									isValid: !!specValue,
									error: '',
									errorResponse: `Please enter a valid ${(baseSpecification?.specificationLabel || 'specification')?.toLowerCase()}`,
									validate: baseSpecification?.validate || validateText,
									keyboardType: baseSpecification?.keyboardType || 'default',
									specification: true,
								};
								if (!_specify?.value && !!specValue) {
									_specify.value = specValue;
									_specify.isValid = !!specValue;
								}
								Form[form_parentIndex].data[form_childIndex] = { ...Form[form_parentIndex].data[form_childIndex], hasSpecification: true };
								Form[form_parentIndex].data?.splice(form_childIndex + 1, 0, _specify);
								if (Form[form_parentIndex].data[form_childIndex + 1]?.value !== _specify?.value) {
									isModified = true;
								}
							}
							// if (childItem === 'ML') Form[form_parentIndex].data?.splice(form_childIndex + (hasSpecification ? 2 : 1), 0, _specifyML);

						}
					}
				});
			}

		}
	});
	const fillDocu = (type: string) => {
		const docuId = Form?.findIndex((i: any) => i.id === type);
		if (docuId > -1) {
			const noId = Form?.[docuId]?.data?.findIndex((i: any) => i.id === `${type}Number`);
			const expiryId = Form?.[docuId]?.data?.findIndex((i: any) => i.id === 'dateOfExpiry');
			const { documentNumber, validUntil } = savedApplication;
			if (noId > -1 && !!documentNumber) {
				if (Form[docuId].data[noId]?.value !== documentNumber) {
					isModified = true;
				}
			}
			if (expiryId > -1 && !!validUntil) {
				const { year: y, month: m, day: d } = extractDateFull(validUntil);
				let val = Form[docuId].data[expiryId].value;
				if (Form[docuId].data[expiryId].value[gIndex('year', val)]?.value !== y) {
					isModified = true;
				}
				if (Form[docuId].data[expiryId].value[gIndex('month', val)]?.value !== m) {
					isModified = true;
				}
				if (Form[docuId].data[expiryId].value[gIndex('day', val)]?.value !== d) {
					isModified = true;
				}
			}
		}
	};
	const AT = savedApplication?.renew?.applicationType || savedApplication?.service?.applicationType;
	if (AT?.label?.toLowerCase()?.match('renew')) {
		fillDocu('certificate');
		fillDocu('license');
		fillDocu('permit');
		fillDocu('accreditation');
		fillDocu('document');
	}
	return isModified;
};
