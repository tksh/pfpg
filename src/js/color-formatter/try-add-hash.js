export function tryAddHash(hexString) {
    if (!hexString.startsWith('#')) {
        return '#' + hexString;
    }
    return hexString;
}