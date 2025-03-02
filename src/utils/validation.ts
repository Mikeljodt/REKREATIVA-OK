export const validateMachine = (machine: any) => {
  const errors: Record<string, string> = {};

  if (!machine.type) {
    errors.type = 'El tipo de máquina es obligatorio';
  }

  if (!machine.model?.trim()) {
    errors.model = 'El modelo es obligatorio';
  }

  if (!machine.brand?.trim()) {
    errors.brand = 'La marca es obligatoria';
  }

  if (typeof machine.counter !== 'number' || machine.counter < 0) {
    errors.counter = 'El contador inicial debe ser un número positivo';
  }

  if (typeof machine.amortizationValue !== 'number' || machine.amortizationValue <= 0) {
    errors.amortizationValue = 'El valor de amortización debe ser mayor que 0';
  }

  if (!machine.registrationDate) {
    errors.registrationDate = 'La fecha de registro es obligatoria';
  }

  return errors;
};

export const validateClient = (client: any) => {
  const errors: Record<string, string> = {};

  if (!client.establishmentName?.trim()) {
    errors.establishmentName = 'El nombre del establecimiento es obligatorio';
  }

  if (!client.ownerFirstName?.trim()) {
    errors.ownerFirstName = 'El nombre es obligatorio';
  }

  if (!client.ownerLastName?.trim()) {
    errors.ownerLastName = 'Los apellidos son obligatorios';
  }

  if (!client.documentNumber?.trim()) {
    errors.documentNumber = 'El número de documento es obligatorio';
  }

  if (!client.phone?.trim()) {
    errors.phone = 'El teléfono es obligatorio';
  } else if (!/^\+34\d{9}$/.test(client.phone)) {
    errors.phone = 'El teléfono debe tener formato +34 seguido de 9 dígitos';
  }

  if (!client.email?.trim()) {
    errors.email = 'El email es obligatorio';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(client.email)) {
    errors.email = 'El email no es válido';
  }

  if (!client.fullAddress?.trim() && !client.formattedAddress?.street) {
    errors.address = 'La dirección es obligatoria';
  }

  if (!client.ownerFiscalAddress?.trim()) {
    errors.fiscalAddress = 'La dirección fiscal es obligatoria';
  }

  return errors;
};
