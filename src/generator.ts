const capitalize = (str: string) => {
	if (str.length < 1) return str;
	return str[0].toUpperCase() + str.substring(1);
};

/**
 *
 * @param item
 * @returns "null" if null | 1 if array | 0 if object | -1 if primitive
 */
const checkIsArray = (item: any) =>
	item === null
		? 'null'
		: typeof item === 'object'
		? Array.isArray(item)
			? 1
			: 0
		: -1;

const generateObjectType = (item: any, exclude?: string[]) => {
	let text = '{\n';
	for (let i of Object.keys(item)) {
		if (exclude?.includes(i)) continue;
		text += `${i}: ` + generateType(item[i]) + ';\n';
	}

	return text + '}';
};

/**
 *
 * @param {Array} item
 */
const generateArrayType = (item: any) => {
	// package types into set for uniqueness
	const set = new Set();
	item.forEach((i: any) => {
		if (checkIsArray(i) == -1) {
			// Prims
			return set.add(typeof i);
		}
		if (checkIsArray(i) == 1) {
			// Arrays
			return set.add(generateArrayType(i));
		}

		// Objects
		return set.add(generateObjectType(i));
	});

	// return single string of types
	let types: any[] = [];
	set.forEach((t) => (t != undefined ? types.push(t) : null));
	return 'Array<' + types.join('|') + '>';
};

export const generateType = (item: any, exclude?: string) => {
	const isArray = checkIsArray(item);
	if (isArray == 1) {
		return generateArrayType(item);
	}

	if (isArray == 0) {
		return generateObjectType(item);
	}

	if (isArray === 'null') {
		return 'null';
	}

	return typeof item;
};

export class Typegen {
	private set: Set<unknown>;
	private map: Map<string, unknown>;

	private discoveredTypes: Set<{ name: string; t?: string; src?: any }> =
		new Set();

	constructor() {
		this.set = new Set();
		this.map = new Map();
	}

	private nestedObject(obj: any) {
		const c = checkIsArray(obj);
		if (c !== 0) {
			return false;
		}

		const nests = [];

		for (let i of Object.keys(obj)) {
			const c = checkIsArray(obj[i]);
			if (c == 0) nests.push(i);
		}

		return nests.length > 0 ? nests : false;
	}

	discovery(data: any, name?: string): any {
		let d: any = {};
		if (checkIsArray(data) === 1) {
			data.forEach((datum: any) => {
				d = { ...d, ...datum };
			});
			// this.discovery(data[0], name);
			// return;
		} else {
			d = data;
		}

		const nests = this.nestedObject(d);
		if (nests) {
			nests.forEach((nest) => {
				this.discovery(d[nest], nest);
				d[nest] = 'discovered:' + nest;
			});

			this.discovery(d, name);
		} else {
			this.discoveredTypes.add({
				name: name || String(this.discoveredTypes.size + 1),
				src: d,
			});
		}
	}

	generateFromObject(obj: { [key: string]: any }) {}

	generate(data: any, name?: string): any {
		// console.log(data, name);
		let t = '{\n';
		for (let i of Object.keys(data)) {
			// console.log(i);
			const cx = {
				name: i,
				src: data[i],
			};

			console.log(cx);

			console.log(this.discoveredTypes.has(cx));
		}
	}

	resolveTypes(data: any) {
		let t = '{\n';
		for (let i of Object.keys(data)) {
			if (typeof data[i] == 'string') {
				if (data[i].includes('discovered:')) {
					const rType = capitalize(data[i].split(':')[1]);
					t += `${i}: ${rType};\n`;
				} else {
					t += `${i}: ${generateType(data[i])};\n`;
				}
			}
		}
		t += '}';
		return t;
	}

	printTypes() {
		let t = '';
		this.discoveredTypes.forEach((d) => {
			t += `type ${capitalize(d.name)} = ${this.resolveTypes(d.src)}\n\n`;
		});

		return t;
	}

	resolve(data: any, name = 'Top') {
		this.discoveredTypes = new Set();
		this.discovery(data, name);

		console.log(`Discovered ${this.discoveredTypes.size} nested types`);
		return this.printTypes();
	}
}
