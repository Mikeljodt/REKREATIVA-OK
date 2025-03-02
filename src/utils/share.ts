import type { CollectionDocument } from '../types';

interface ShareResult {
  success: boolean;
  error?: string;
}

export async function shareDocument(
  document: CollectionDocument,
  method: 'email' | 'whatsapp' | 'telegram'
): Promise<ShareResult> {
  const documentTitle = `${document.type === 'invoice' ? 'Factura' : 'Ticket'} #${document.number}`;
  const documentAmount = new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(document.totalAmount);

  const message = `${documentTitle}\nImporte: ${documentAmount}`;

  try {
    switch (method) {
      case 'email':
        // Usar mailto para emails
        window.location.href = `mailto:?subject=${encodeURIComponent(documentTitle)}&body=${encodeURIComponent(message)}`;
        break;

      case 'whatsapp':
        // Usar la API de WhatsApp
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
        break;

      case 'telegram':
        // Usar la API de Telegram
        window.open(`https://t.me/share/url?url=&text=${encodeURIComponent(message)}`, '_blank');
        break;
    }

    return { success: true };
  } catch (error) {
    console.error('Error sharing document:', error);
    return {
      success: false,
      error: 'Error al compartir el documento'
    };
  }
}
