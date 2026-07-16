const lodash = require('lodash');
const JSONfn = {
	stringify: (obj) => {
		return JSON.stringify(obj, function (key, value) {
			return typeof value === 'function' ? value.toString() : value;
		});
	},
	parse: (str) => {
		return JSON.parse(str, function (key, value) {
			if (typeof value !== 'string') return value;
			if (value.startsWith('function') || value.includes('=>')) {
				try { return new Function('return ' + value)(); } catch (e) { return value; }
			}
			return value;
		})
	}
};

const complexObj = {
    id: 'test',
    data: Array(50).fill(0).map((_, i) => ({
        id: 'f' + i,
        value: 'val' + i,
        validate: (v) => v.length > 0
    }))
};

console.time('JSONfn');
for(let i=0; i<100; i++) JSONfn.parse(JSONfn.stringify(complexObj));
console.timeEnd('JSONfn');

console.time('cloneDeep');
for(let i=0; i<100; i++) lodash.cloneDeep(complexObj);
console.timeEnd('cloneDeep');
