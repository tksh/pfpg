//   null and undefined: value != null)。
//   empty string      : value !== '')。
export function isNonEmpty(value) {
    return value != null && value !== ''
}