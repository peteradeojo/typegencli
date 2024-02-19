const checkIsArray = (item: any) =>
	item === null
		? 'null'
		: typeof item === 'object'
		? Array.isArray(item)
			? 1
			: 0
		: -1;

const generateObjectType = (item: any) => {
	let text = '{\n';
	for (let i of Object.keys(item)) {
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

export const generateType = (item: any) => {
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