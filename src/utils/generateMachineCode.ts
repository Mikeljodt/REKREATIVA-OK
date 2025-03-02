export function generateMachineCode(type: string, brand: string, model: string): string {
  // Prefijos por tipo de máquina
  const typePrefixes: Record<string, string> = {
    pinball: 'PIN',
    darts: 'DAR',
    arcade: 'ARC',
    foosball: 'FOS'
  };

  // Prefijos por marca
  const brandPrefixes: Record<string, string> = {
    stern: 'ST',
    jersey_jack: 'JJ',
    chicago_gaming: 'CG',
    spooky: 'SP',
    american: 'AM',
    dutch: 'DU',
    raw_thrills: 'RT',
    sega: 'SE',
    namco: 'NA',
    default: 'XX'
  };

  // Obtener prefijo de tipo
  const typePrefix = typePrefixes[type.toLowerCase()] || 'XXX';
  
  // Obtener prefijo de marca
  const normalizedBrand = brand.toLowerCase().replace(/[^a-z]/g, '_');
  const brandPrefix = brandPrefixes[normalizedBrand] || brandPrefixes.default;

  // Generar código del modelo (primeras 3 letras + últimos 2 números si existen)
  let modelCode = model
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 3);
  
  const numbers = model.match(/\d+/);
  if (numbers) {
    modelCode += numbers[0].slice(-2);
  } else {
    // Si no hay números, usar las primeras 5 letras
    modelCode = model
      .toUpperCase()
      .replace(/[^A-Z]/g, '')
      .slice(0, 5);
  }

  // Generar número secuencial aleatorio de 3 dígitos
  const sequence = Math.floor(Math.random() * 1000).toString().padStart(3, '0');

  // Construir código final: TIPO-MARCA-MODELO-SECUENCIA
  return `${typePrefix}-${brandPrefix}-${modelCode}-${sequence}`;
}
