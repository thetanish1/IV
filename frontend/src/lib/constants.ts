/**
 * Global application constants and external asset links.
 */

export const CLOUDINARY_CLOUD_NAME =
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "zmeqoh4x";

export const BROCHURE_PUBLIC_ID = "Internvision_Tech-_Brochure";

// Cloudinary attachment download URL (triggers download dialog)
export const COMPANY_BROCHURE_URL =
  process.env.NEXT_PUBLIC_BROCHURE_URL ||
  `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/fl_attachment:Internvision_Tech_Brochure/${BROCHURE_PUBLIC_ID}.pdf`;

// View in browser / raw fallback URL
export const COMPANY_BROCHURE_VIEW_URL =
  `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${BROCHURE_PUBLIC_ID}.pdf`;
