export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

// Maximum image size in bytes (5MB)
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

// Acceptable image MIME types
export const ACCEPTABLE_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
];

/**
 * Validates an image file for type and size constraints
 */
export function validateImage(file: File): ValidationResult {
  // Check file type
  if (!ACCEPTABLE_IMAGE_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: `Invalid file type. Only ${ACCEPTABLE_IMAGE_TYPES.map(type => type.split('/')[1]).join(', ')} are allowed.`
    };
  }

  // Check file size
  if (file.size > MAX_IMAGE_SIZE) {
    return {
      isValid: false,
      error: `File too large. Maximum size is ${MAX_IMAGE_SIZE / (1024 * 1024)}MB.`
    };
  }

  return { isValid: true };
}

/**
 * Validates description text for skin concerns
 */
export function validateDescription(description: string): ValidationResult {
  // Remove leading/trailing whitespace
  const trimmedDescription = description.trim();
  
  // Skip validation if empty (description is optional)
  if (!trimmedDescription) {
    return { isValid: true };
  }
  
  // Check minimum length
  if (trimmedDescription.length < 10) {
    return {
      isValid: false,
      error: 'Description should be at least 10 characters if provided.'
    };
  }
  
  // Check maximum length (though this should be handled by the UI maxLength)
  if (trimmedDescription.length > 500) {
    return {
      isValid: false,
      error: 'Description cannot exceed 500 characters.'
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