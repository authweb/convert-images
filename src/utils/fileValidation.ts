const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateFile = (file: File): ValidationResult => {
  // Проверка размера файла
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: 'app.validation.fileSize'
    };
  }

  // Проверка типа файла
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: 'app.validation.format'
    };
  }

  // Проверка имени файла на наличие вредоносных символов
  const sanitizedName = file.name.replace(/[^\w\s.-]/g, '_');
  if (sanitizedName !== file.name) {
    Object.defineProperty(file, 'name', {
      writable: true,
      value: sanitizedName
    });
  }

  return { isValid: true };
};

export const validateImageDimensions = (width: number, height: number): ValidationResult => {
  const MIN_DIMENSION = 10;
  const MAX_DIMENSION = 8000;
  const MAX_RESOLUTION = 32000000; // ~32MP

  if (width < MIN_DIMENSION || height < MIN_DIMENSION) {
    return {
      isValid: false,
      error: 'app.validation.dimensions.tooSmall',
    };
  }

  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    return {
      isValid: false,
      error: 'app.validation.dimensions.tooBig',
    };
  }

  if (width * height > MAX_RESOLUTION) {
    return {
      isValid: false,
      error: 'app.validation.dimensions.unusual',
    };
  }

  // Предупреждение о больших размерах для веба
  if (width > 2000 || height > 2000) {
    return {
      isValid: true,
      error: 'app.validation.dimensions.webSize',
    };
  }

  return { isValid: true };
}; 