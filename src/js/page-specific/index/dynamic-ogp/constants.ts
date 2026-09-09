export { ACTIVE_FORMAT, CLOUDINARY_CONFIG };

// Configuration for Cloudinary
interface CloudinaryConfig {
  cloudName: string;
  uploadPreset: string;
  baseUploadUrl: string;
}

const CLOUDINARY_CONFIG: CloudinaryConfig = {
  cloudName: "ddoy3pmjg",
  uploadPreset: "pfpg_ogp_preset",
  baseUploadUrl: "https://api.cloudinary.com/v1_1",
};

/**
 * Image dimension configurations for different formats
 */
interface ImageConfig {
  /** Output image width */
  width: number;
  /** Output image height */
  height: number;
  /** Maximum size for the content image */
  maxImageSize: number;
  /** Whether to add background color */
  useBackground: boolean;
  /** Whether to center the content */
  centerContent: boolean;
}

const IMAGE_CONFIGS: Record<"squareFormat" | "ogFormat", ImageConfig> = {
  squareFormat: {
    width: 630,
    height: 630,
    maxImageSize: 630,
    useBackground: false,
    centerContent: true,
  },
  ogFormat: {
    width: 1200,
    height: 840,
    maxImageSize: 630,
    useBackground: true,
    centerContent: true,
  },
};

// Uncomment to select which format to use
// - IMAGE_CONFIGS.squareFormat  - Image only, keep alpha channel
// - IMAGE_CONFIGS.ogFormat      - Padded with opaque bg color (via themeColor)
const ACTIVE_FORMAT: ImageConfig = IMAGE_CONFIGS.squareFormat;
// const ACTIVE_FORMAT = IMAGE_CONFIGS.ogFormat;
