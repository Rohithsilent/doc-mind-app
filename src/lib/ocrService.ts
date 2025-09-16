import Tesseract from 'tesseract.js';

export class OCRService {
  static async extractText(imageFile: File): Promise<string> {
    try {
      console.log('Starting OCR processing...');
      
      const { data: { text } } = await Tesseract.recognize(
        imageFile,
        'eng',
        {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
            }
          }
        }
      );

      console.log('OCR completed successfully');
      return text.trim();
    } catch (error) {
      console.error('OCR Error:', error);
      throw new Error('Failed to extract text from image');
    }
  }

  static preprocessImage(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Set canvas dimensions
        canvas.width = img.width;
        canvas.height = img.height;

        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Draw the original image
        ctx.drawImage(img, 0, 0);

        // Apply image enhancements for better OCR
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Increase contrast and brightness
        for (let i = 0; i < data.length; i += 4) {
          // Increase contrast
          data[i] = Math.min(255, Math.max(0, (data[i] - 128) * 1.5 + 128));     // Red
          data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - 128) * 1.5 + 128)); // Green
          data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - 128) * 1.5 + 128)); // Blue
        }

        ctx.putImageData(imageData, 0, 0);

        canvas.toBlob((blob) => {
          if (blob) {
            const enhancedFile = new File([blob], file.name, { type: file.type });
            resolve(enhancedFile);
          } else {
            reject(new Error('Failed to create enhanced image'));
          }
        }, file.type);
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }
}