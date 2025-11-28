import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ImageService {
  /**
   * Compresse une image pour qu'elle ne dépasse pas les dimensions spécifiées (demi carte postale)
   * @param file Fichier image à compresser
   * @param maxWidth Largeur maximale (défaut: 200px)
   * @param maxHeight Hauteur maximale (défaut: 150px)
   * @param quality Qualité JPEG (0-1, défaut: 0.8)
   * @returns Promise<string> Image compressée en base64
   */
  compressImage(
    file: File,
    maxWidth: number = 200,
    maxHeight: number = 150,
    quality: number = 0.8
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Calculer les nouvelles dimensions en conservant le ratio
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }

          // Créer un canvas pour redimensionner
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Impossible de créer le contexte canvas'));
            return;
          }

          // Dessiner l'image redimensionnée
          ctx.drawImage(img, 0, 0, width, height);

          // Convertir en base64 avec compression JPEG
          const base64 = canvas.toDataURL('image/jpeg', quality);
          resolve(base64);
        };
        img.onerror = () => reject(new Error("Erreur lors du chargement de l'image"));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Erreur lors de la lecture du fichier'));
      reader.readAsDataURL(file);
    });
  }
}
