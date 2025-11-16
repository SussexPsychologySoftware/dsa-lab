export function getNestedValue<T, P extends string>(obj: T, path: P): any {
    return path.split('.').reduce((acc, key) => acc?.[key], obj as any);
}

export function hasNestedKey(obj: any, path: string): boolean {
    return path.split('.').every(key => {
        if (obj != null && key in obj) {
            obj = obj[key];
            return true;
        }
        return false;
    });
}

export function setNestedValue<T extends object>(obj: T, path: string, value: any): T {
    const keys = path.split('.');
    keys.reduce((acc: any, key: string, index: number) => {
        // On last key set value
        if (index === keys.length - 1) {
            acc[key] = value;
            return;
        }

        // If key doesn't exist or is set to a 'value' and we have more keys to loop, then create new object/array
        // Consider this is dangerous and should maybe return error if incorrect key passed in?
        // Note that if trying to access an array item with a number and already an object there, numeric key in object would be set...
        if (acc[key] == null || typeof acc[key] !== 'object') { // Note loose == null check works for undefined too
            const nextKey = keys[index + 1]; // look up next key
            const isNextKeyNumeric = /^\d+$/.test(nextKey);  // Create array if number
            acc[key] = isNextKeyNumeric ? [] : {};
        }

        // Return the next level
        return acc[key];

    }, obj); // Accumulator starts with base object so it is mutated by reference

    return obj; // Return the mutated object
}
