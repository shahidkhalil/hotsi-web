import { useRef, useState } from 'react';
import { uploadMenuImage, isCloudinaryConfigured, cloudinaryThumb } from '../../utils/cloudinary';

export default function MenuImageUpload({ form, setForm, disabled }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const preview = form.imageUrl ? cloudinaryThumb(form.imageUrl, 320, 320) : null;

  const handleFile = async (file) => {
    if (!file || disabled) return;
    setError('');
    setUploading(true);
    try {
      const { url, publicId } = await uploadMenuImage(file);
      setForm((f) => ({ ...f, imageUrl: url, imagePublicId: publicId }));
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleRemove = () => {
    setForm((f) => ({ ...f, imageUrl: '', imagePublicId: '' }));
    setError('');
  };

  return (
    <div className="admin-field full admin-image-upload">
      <label className="admin-label">Product Photo</label>

      {!isCloudinaryConfigured && (
        <div className="admin-warn-box" style={{ marginBottom: 12 }}>
          Add <code>VITE_CLOUDINARY_CLOUD_NAME</code> and <code>VITE_CLOUDINARY_UPLOAD_PRESET</code> to <code>.env</code> to upload images.
        </div>
      )}

      <div className="admin-image-upload-box">
        {preview ? (
          <div className="admin-image-preview">
            <img src={preview} alt={form.name || 'Product'} />
            {!disabled && (
              <div className="admin-image-preview-actions">
                <button type="button" className="admin-btn-sm" onClick={() => inputRef.current?.click()} disabled={uploading}>
                  Replace
                </button>
                <button type="button" className="admin-btn-sm danger" onClick={handleRemove} disabled={uploading}>
                  Remove
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            className="admin-image-dropzone"
            onClick={() => !disabled && inputRef.current?.click()}
            disabled={disabled || uploading || !isCloudinaryConfigured}
          >
            <span className="admin-image-dropzone-icon">📷</span>
            <span>{uploading ? 'Uploading to Cloudinary…' : 'Click to upload photo'}</span>
            <span className="admin-image-dropzone-hint">JPG, PNG, WebP · max 5 MB</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        hidden
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {error && <p className="admin-image-error">{error}</p>}
      {form.imageUrl && isCloudinaryConfigured && (
        <p className="admin-image-saved">✓ Saved on Cloudinary</p>
      )}
    </div>
  );
}
