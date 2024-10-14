export function tryDeleteFs(hex) {hex = hex.toUpperCase()
if (hex.length !== 10 && hex.length !== 5) {console.error('Invalid length hex for "Group colors":', hex)}
else if (hex.length === 10 && hex.slice(-4) === "FFFF") {return hex.slice(0, 6)}
else if (hex.length === 5 && hex.slice(-2) === "FF") {return hex.slice(0, 3)}
else {return hex}}