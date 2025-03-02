import * as pdfjsLib from 'pdfjs-dist';
import type { Client } from '../types';

// Configure worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `${window.location.origin}/pdf.worker.min.js`;

interface ExtractedData {
  establishmentName?: string;
  ownerName?: string;
  nif?: string;
  address?: {
    street?: string;
    number?: string;
    postalCode?: string;
    city?: string;
    province?: string;
  };
  phone?: string;
  email?: string;
}

export async function extractClientFromPDF(file: File): Promise<Partial<Client>> {
  try {
    if (!file.type.includes('pdf')) {
      throw new Error('El archivo debe ser un PDF');
    }

    let arrayBuffer: ArrayBuffer;
    try {
      arrayBuffer = await file.arrayBuffer();
    } catch (error) {
      console.error('Error reading file:', error);
      throw new Error('Error al leer el archivo PDF');
    }

    if (!arrayBuffer || arrayBuffer.byteLength === 0) {
      throw new Error('El archivo PDF está vacío o dañado');
    }

    let pdf;
    try {
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      loadingTask.onPassword = () => {
        throw new Error('No se pueden procesar PDFs protegidos con contraseña');
      };
      
      pdf = await loadingTask.promise;
    } catch (error) {
      console.error('Error loading PDF:', error);
      throw new Error(
        error instanceof Error 
          ? `Error al cargar el PDF: ${error.message}`
          : 'Error al cargar el PDF. El archivo podría estar dañado.'
      );
    }

    if (!pdf || pdf.numPages === 0) {
      throw new Error('El PDF no contiene páginas');
    }

    const extractedData: ExtractedData = {
      address: {}
    };

    // Process each page
    for (let i = 1; i <= pdf.numPages; i++) {
      try {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const text = textContent.items
          .map((item: any) => item.str)
          .join(' ')
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');

        // Patrones mejorados para facturas
        // NIF/CIF con letras al principio o final
        const nifPatterns = [
          /[ABCDEFGHJKLMNPQRSUVW]\d{8}/i,  // CIF
          /[0-9]{8}[TRWAGMYFPDXBNJZSQVHLCKE]/i,  // NIF
          /[XYZ][0-9]{7}[TRWAGMYFPDXBNJZSQVHLCKE]/i  // NIE
        ];

        for (const pattern of nifPatterns) {
          const match = text.match(pattern);
          if (match && !extractedData.nif) {
            extractedData.nif = match[0].toUpperCase();
            break;
          }
        }

        // Nombre del establecimiento - buscar después de palabras clave
        const businessNamePatterns = [
          /FACTURAR? A:?\s*([^\n]+)/i,
          /CLIENTE:?\s*([^\n]+)/i,
          /RAZON SOCIAL:?\s*([^\n]+)/i,
          /EMPRESA:?\s*([^\n]+)/i
        ];

        for (const pattern of businessNamePatterns) {
          const match = text.match(pattern);
          if (match && !extractedData.establishmentName) {
            extractedData.establishmentName = match[1].trim();
            break;
          }
        }

        // Dirección con más variantes
        const addressPatterns = [
          /DIRECCION:?\s*([^,\n]+)/i,
          /DOMICILIO:?\s*([^,\n]+)/i,
          /C\/\s*([^,\n]+)/i,
          /CALLE\s*([^,\n]+)/i,
          /AVENIDA\s*([^,\n]+)/i,
          /AVDA\.\s*([^,\n]+)/i,
          /PLAZA\s*([^,\n]+)/i
        ];

        for (const pattern of addressPatterns) {
          const match = text.match(pattern);
          if (match && !extractedData.address.street) {
            let street = match[1].trim();
            
            // Extraer número si está en la misma línea
            const numberMatch = street.match(/\s+(\d+(?:[-\/]\d+)?)\s*$/);
            if (numberMatch) {
              extractedData.address.number = numberMatch[1];
              street = street.replace(/\s+\d+(?:[-\/]\d+)?\s*$/, '');
            }
            
            extractedData.address.street = street;
            break;
          }
        }

        // Código postal y ciudad mejorado
        const postalPatterns = [
          /C\.?P\.?\s*(\d{5})\s*([A-Z][a-zA-Z\s]+)/i,
          /(\d{5})\s*([A-Z][a-zA-Z\s]+)/
        ];

        for (const pattern of postalPatterns) {
          const match = text.match(pattern);
          if (match && !extractedData.address.postalCode) {
            extractedData.address.postalCode = match[1];
            extractedData.address.city = match[2].trim();
            break;
          }
        }

        // Teléfono con más formatos
        const phonePatterns = [
          /TLF:?\s*(?:\+34|0034)?\s?[6789]\d{8}/i,
          /TELEFONO:?\s*(?:\+34|0034)?\s?[6789]\d{8}/i,
          /TEL:?\s*(?:\+34|0034)?\s?[6789]\d{8}/i,
          /(?:\+34|0034)?\s?[6789]\d{8}/,
          /\b9\d{8}\b/,
          /\b[6789]\d{8}\b/
        ];

        for (const pattern of phonePatterns) {
          const match = text.match(pattern);
          if (match && !extractedData.phone) {
            extractedData.phone = match[0].replace(/[^\d+]/g, '');
            if (!extractedData.phone.startsWith('+')) {
              extractedData.phone = '+34' + extractedData.phone;
            }
            break;
          }
        }

        // Email mejorado
        const emailPatterns = [
          /EMAIL:?\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i,
          /CORREO:?\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i,
          /E-MAIL:?\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i,
          /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i
        ];

        for (const pattern of emailPatterns) {
          const match = text.match(pattern);
          if (match && !extractedData.email) {
            extractedData.email = (match[1] || match[0]).toLowerCase();
            break;
          }
        }

      } catch (pageError) {
        console.error('Error processing PDF page:', {
          page: i,
          error: pageError instanceof Error ? pageError.message : 'Unknown error'
        });
      }
    }

    // Validación de datos extraídos
    if (!extractedData.establishmentName && !extractedData.nif) {
      throw new Error('No se pudieron extraer datos suficientes del PDF. Asegúrate de que el documento contiene la información necesaria.');
    }

    return {
      establishmentName: extractedData.establishmentName || '',
      ownerName: extractedData.ownerName || '',
      address: {
        street: extractedData.address?.street || '',
        number: extractedData.address?.number || '',
        postalCode: extractedData.address?.postalCode || '',
        city: extractedData.address?.city || '',
        province: extractedData.address?.province || ''
      },
      phone: extractedData.phone || '',
      email: extractedData.email || '',
      nif: extractedData.nif || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      contractSigned: false
    };
  } catch (error) {
    console.error('Error processing PDF:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    throw new Error(
      error instanceof Error 
        ? error.message 
        : 'Error al procesar el PDF. Por favor, verifica que el archivo es válido.'
    );
  }
}
