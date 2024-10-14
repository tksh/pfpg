import { SETTINGS_DEFAULTS } from 'constants'
import { getStateUrl
       , updateStateUrl}     from 'state/url-state-manager'
export
    { resvgOption
    , updateState
    , getState
    }


// Resvg Option: Argument for rendering
const resvgOption = {
    fitTo: {
        mode: 'height',
        value: 256
    }
}


// URL状態パラメータから値を取得し、無ければデフォルト値を返す
function getState(key) {
    const stateValue = getStateUrl(key)
    return stateValue !== undefined ? stateValue : SETTINGS_DEFAULTS.get(key)
}

function updateState(key, value) {
    updateStateUrl({ [key]: value })
}
