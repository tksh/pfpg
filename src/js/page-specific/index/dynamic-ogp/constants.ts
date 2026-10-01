export { CLOUDINARY_CONFIG };

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
