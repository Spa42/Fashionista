export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

// Maximum image size in bytes (5MB)
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

// Acceptable image MIME types
export const ACCEPTABLE_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Validates an image file for type and size constraints
 */
export function validateImage(file: File): ValidationResult {
  // Check file type
  if (!ACCEPTABLE_IMAGE_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: 'Invalid file type. Please upload a JPEG, PNG, or WebP image.',
    };
  }

  // Check file size
  if (file.size > MAX_IMAGE_SIZE) {
    return {
      isValid: false,
      error: `File too large. Maximum size is ${MAX_IMAGE_SIZE / 1024 / 1024}MB.`,
    };
  }

  return { isValid: true };
}

/**
 * Validates description text for skin concerns
 */
export function validateDescription(text: string): ValidationResult {
  // Description is optional, so empty is valid
  if (!text.trim()) {
    return { isValid: true };
  }

  // Check if description is too long (limit to 500 characters)
  if (text.length > 500) {
    return {
      isValid: false,
      error: 'Description is too long. Please limit to 500 characters.',
    };
  }

  return { isValid: true };
}

/**
 * Creates a form data object from the upload form fields
 */
export function createFormData(data: {
  photos: Record<'front' | 'side', File>;
  description: string;
}): FormData {
  const formData = new FormData();
  formData.append('front', data.photos.front);
  formData.append('side', data.photos.side);
  formData.append('description', data.description);
  
  return formData;
} 