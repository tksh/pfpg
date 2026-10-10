// Registers the only two color spaces this app converts between. Color.js's
// procedural API registers nothing by default, and using an unregistered space id
// throws. Side-effect import, exactly once per process.
import { ColorSpace, OKLCH, sRGB } from "colorjs.io/fn";

ColorSpace.register(sRGB);
ColorSpace.register(OKLCH);
