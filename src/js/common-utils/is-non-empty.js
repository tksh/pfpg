//   null and undefined: (data[prop] != null)。
//   empty string      : (data[prop] !== '')。
export function isNonEmpty(value) {
    return value != null && value !== '';
}