import { getStateUrlsAsMapExcludesSvgOptimization } from 'state/url-state-manager'
import { sha256HashHexFromMap }                     from 'utils/hashing'

export async function calculateConfigHash() {
    // Config Hash calculated from only the status related about visual effects.
    const configStatesAboutVisualEffects = getStateUrlsAsMapExcludesSvgOptimization()
    console.log("configStatesAboutVisualEffects: ", configStatesAboutVisualEffects)
    const { hashArray, hashHex } = await sha256HashHexFromMap(configStatesAboutVisualEffects)
    console.log("hashHex: ", hashHex)

    return hashHex
}