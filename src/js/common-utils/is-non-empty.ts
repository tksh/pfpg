//   null and undefined: value != null)。
//   empty string      : value !== '')。
export function isNonEmpty(value: unknown): boolean {
    return value != null && value !== ''
}