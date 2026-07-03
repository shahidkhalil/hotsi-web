const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export const isCloudinaryConfigured = Boolean(CLOUD_NAME && UPLOAD_PRESET);

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

/** Upload image to Cloudinary (unsigned preset) */
export async function uploadMenuImage(file) {
  if (!isCloudinaryConfigured) {
    throw new Error('Cloudinary not configured. Add VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET to .env');
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Use JPG, PNG, WebP, or GIF');
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('Image must be under 5 MB');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', 'hotsi-menu');

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || 'Cloudinary upload failed');
  }

  return {
    url: data.secure_url,
    publicId: data.public_id,
  };
}

/** Optimized Cloudinary thumbnail URL */
export function cloudinaryThumb(url, width = 400, height = 400) {
  if (!url || !url.includes('res.cloudinary.com')) return url;
  if (url.includes('/upload/')) {
    return url.replace('/upload/', `/upload/c_fill,w_${width},h_${height},q_auto,f_auto/`);
  }
  return url;
}

/** Menu card image — Cloudinary URL or loremflickr fallback */
export function getMenuImageSrc(item, kw, seed, size = 400) {
  if (item?.imageUrl) return cloudinaryThumb(item.imageUrl, size, size);
  return `https://loremflickr.com/${size}/${size}/${encodeURIComponent(kw || 'food')}?lock=${seed}`;
}

/** Large product modal image */
export function getProductImageSrc(imageUrl, kw, seed) {
  if (imageUrl) return cloudinaryThumb(imageUrl, 640, 520);
  return `https://loremflickr.com/640/520/${encodeURIComponent(kw || 'food')}?lock=${seed}`;
}
