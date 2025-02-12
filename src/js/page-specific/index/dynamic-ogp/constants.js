export
    { CLOUDINARY_CONFIG
    , ACTIVE_FORMAT
    }

// Configuration for Cloudinary
const CLOUDINARY_CONFIG = {
    cloudName: 'ddoy3pmjg',
    uploadPreset: 'pfpg_ogp_preset',
    baseUploadUrl: 'https://api.cloudinary.com/v1_1'
};

/**
 * Image dimension configurations for different formats
 * @typedef {Object} ImageConfig
 * @property {number} width - Output image width
 * @property {number} height - Output image height
 * @property {number} maxImageSize - Maximum size for the content image
 * @property {boolean} useBackground - Whether to add background color
 * @property {boolean} centerContent - Whether to center the content
 */
const IMAGE_CONFIGS = {
    squareFormat: {
        width: 630,
        height: 630,
        maxImageSize: 630,
        useBackground: false,
        centerContent: true
    },
    ogFormat: {
        width: 1200,
        height: 840,
        maxImageSize: 630,
        useBackground: true,
        centerContent: true
    }
};

// Uncomment to select which format to use
// - IMAGE_CONFIGS.squareFormat  - Image only, keep alpha channel
// - IMAGE_CONFIGS.ogFormat      - Padded with opaque bg color (via themeColor)
const ACTIVE_FORMAT = IMAGE_CONFIGS.squareFormat;
// const ACTIVE_FORMAT = IMAGE_CONFIGS.ogFormat;
