export { CLOUDINARY_CONFIG };

// Configuration for Cloudinary
interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  uploadPreset: string;
  baseUploadUrl: string;
  signEndpoint: string;
}

const CLOUDINARY_CONFIG: CloudinaryConfig = {
  cloudName: "ddoy3pmjg",
  apiKey: "919944758277722",
  uploadPreset: "pfpg-history-signed",
  baseUploadUrl: "https://api.cloudinary.com/v1_1",
  signEndpoint: "/api/sign-cloudinary-upload",
};
