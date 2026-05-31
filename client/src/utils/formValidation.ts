/**
 * Utilità per validazione form avanzata con messaggi in italiano
 */

export interface ValidationError {
  field: string;
  message: string;
  type: "error" | "warning";
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Valida email
 */
export const validateEmail = (email: string): ValidationError | null => {
  if (!email || email.trim() === "") {
    return {
      field: "email",
      message: "L'email è obbligatorio",
      type: "error",
    };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      field: "email",
      message: "Inserisci un'email valida (es: nome@dominio.it)",
      type: "error",
    };
  }

  return null;
};

/**
 * Valida numero di telefono italiano
 */
export const validatePhoneNumber = (phone: string): ValidationError | null => {
  if (!phone || phone.trim() === "") {
    return null; // Telefono non obbligatorio
  }

  // Rimuovi spazi e caratteri speciali
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");

  // Verifica se è un numero italiano valido
  const phoneRegex = /^(?:(?:\+|00)39)?(?:0|3)\d{1,}$/;
  if (!phoneRegex.test(cleanPhone)) {
    return {
      field: "phone",
      message: "Inserisci un numero di telefono italiano valido",
      type: "error",
    };
  }

  // Verifica lunghezza (10-13 cifre)
  if (cleanPhone.length < 10 || cleanPhone.length > 13) {
    return {
      field: "phone",
      message: "Il numero di telefono deve avere tra 10 e 13 cifre",
      type: "error",
    };
  }

  return null;
};

/**
 * Valida importo (prezzo)
 */
export const validateAmount = (amount: string | number): ValidationError | null => {
  if (amount === "" || amount === null || amount === undefined) {
    return {
      field: "amount",
      message: "L'importo è obbligatorio",
      type: "error",
    };
  }

  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;

  if (isNaN(numAmount)) {
    return {
      field: "amount",
      message: "Inserisci un importo valido",
      type: "error",
    };
  }

  if (numAmount < 0) {
    return {
      field: "amount",
      message: "L'importo non può essere negativo",
      type: "error",
    };
  }

  if (numAmount === 0) {
    return {
      field: "amount",
      message: "L'importo deve essere maggiore di zero",
      type: "warning",
    };
  }

  // Verifica massimo 2 decimali
  if (!/^\d+(\.\d{1,2})?$/.test(numAmount.toString())) {
    return {
      field: "amount",
      message: "L'importo può avere massimo 2 decimali",
      type: "error",
    };
  }

  return null;
};

/**
 * Valida percentuale (sconto, IVA, etc.)
 */
export const validatePercentage = (percentage: string | number): ValidationError | null => {
  if (percentage === "" || percentage === null || percentage === undefined) {
    return null; // Percentuale non obbligatoria
  }

  const numPercentage = typeof percentage === "string" ? parseFloat(percentage) : percentage;

  if (isNaN(numPercentage)) {
    return {
      field: "percentage",
      message: "Inserisci una percentuale valida",
      type: "error",
    };
  }

  if (numPercentage < 0 || numPercentage > 100) {
    return {
      field: "percentage",
      message: "La percentuale deve essere tra 0 e 100",
      type: "error",
    };
  }

  return null;
};

/**
 * Valida nome cliente
 */
export const validateClientName = (name: string): ValidationError | null => {
  if (!name || name.trim() === "") {
    return {
      field: "clientName",
      message: "Il nome del cliente è obbligatorio",
      type: "error",
    };
  }

  if (name.trim().length < 2) {
    return {
      field: "clientName",
      message: "Il nome deve avere almeno 2 caratteri",
      type: "error",
    };
  }

  if (name.trim().length > 100) {
    return {
      field: "clientName",
      message: "Il nome non può superare 100 caratteri",
      type: "error",
    };
  }

  return null;
};

/**
 * Valida nome progetto
 */
export const validateProjectName = (name: string): ValidationError | null => {
  if (!name || name.trim() === "") {
    return {
      field: "projectName",
      message: "Il nome del progetto è obbligatorio",
      type: "error",
    };
  }

  if (name.trim().length < 3) {
    return {
      field: "projectName",
      message: "Il nome del progetto deve avere almeno 3 caratteri",
      type: "error",
    };
  }

  if (name.trim().length > 150) {
    return {
      field: "projectName",
      message: "Il nome del progetto non può superare 150 caratteri",
      type: "error",
    };
  }

  return null;
};

/**
 * Valida dimensioni (lunghezza, larghezza, altezza)
 */
export const validateDimension = (dimension: string | number, dimensionName: string = "Dimensione"): ValidationError | null => {
  if (dimension === "" || dimension === null || dimension === undefined) {
    return {
      field: "dimension",
      message: `${dimensionName} è obbligatorio`,
      type: "error",
    };
  }

  const numDimension = typeof dimension === "string" ? parseFloat(dimension) : dimension;

  if (isNaN(numDimension)) {
    return {
      field: "dimension",
      message: `Inserisci un valore valido per ${dimensionName}`,
      type: "error",
    };
  }

  if (numDimension <= 0) {
    return {
      field: "dimension",
      message: `${dimensionName} deve essere maggiore di zero`,
      type: "error",
    };
  }

  if (numDimension > 10000) {
    return {
      field: "dimension",
      message: `${dimensionName} non può superare 10000`,
      type: "warning",
    };
  }

  return null;
};

/**
 * Valida area (m²)
 */
export const validateArea = (area: string | number): ValidationError | null => {
  if (area === "" || area === null || area === undefined) {
    return {
      field: "area",
      message: "L'area è obbligatoria",
      type: "error",
    };
  }

  const numArea = typeof area === "string" ? parseFloat(area) : area;

  if (isNaN(numArea)) {
    return {
      field: "area",
      message: "Inserisci un'area valida",
      type: "error",
    };
  }

  if (numArea <= 0) {
    return {
      field: "area",
      message: "L'area deve essere maggiore di zero",
      type: "error",
    };
  }

  if (numArea > 100000) {
    return {
      field: "area",
      message: "L'area non può superare 100000 m²",
      type: "warning",
    };
  }

  return null;
};

/**
 * Valida indirizzo
 */
export const validateAddress = (address: string): ValidationError | null => {
  if (!address || address.trim() === "") {
    return null; // Indirizzo non obbligatorio
  }

  if (address.trim().length < 5) {
    return {
      field: "address",
      message: "L'indirizzo deve avere almeno 5 caratteri",
      type: "error",
    };
  }

  if (address.trim().length > 200) {
    return {
      field: "address",
      message: "L'indirizzo non può superare 200 caratteri",
      type: "error",
    };
  }

  return null;
};

/**
 * Valida città
 */
export const validateCity = (city: string): ValidationError | null => {
  if (!city || city.trim() === "") {
    return null; // Città non obbligatoria
  }

  if (city.trim().length < 2) {
    return {
      field: "city",
      message: "La città deve avere almeno 2 caratteri",
      type: "error",
    };
  }

  if (city.trim().length > 50) {
    return {
      field: "city",
      message: "La città non può superare 50 caratteri",
      type: "error",
    };
  }

  return null;
};

/**
 * Valida CAP
 */
export const validateZipCode = (zipCode: string): ValidationError | null => {
  if (!zipCode || zipCode.trim() === "") {
    return null; // CAP non obbligatorio
  }

  const cleanZip = zipCode.replace(/[\s\-]/g, "");

  if (!/^\d{5}$/.test(cleanZip)) {
    return {
      field: "zipCode",
      message: "Inserisci un CAP valido (5 cifre)",
      type: "error",
    };
  }

  return null;
};

/**
 * Valida descrizione/note
 */
export const validateDescription = (description: string, maxLength: number = 1000): ValidationError | null => {
  if (!description || description.trim() === "") {
    return null; // Descrizione non obbligatoria
  }

  if (description.trim().length > maxLength) {
    return {
      field: "description",
      message: `La descrizione non può superare ${maxLength} caratteri`,
      type: "error",
    };
  }

  return null;
};

/**
 * Valida preventivo completo
 */
export interface PreventiveFormData {
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  projectName?: string;
  address?: string;
  city?: string;
  zipCode?: string;
  amount?: number | string;
  discount?: number | string;
  surcharge?: number | string;
  description?: string;
}

export const validatePreventiveForm = (data: PreventiveFormData): ValidationResult => {
  const errors: ValidationError[] = [];

  // Validazioni obbligatorie
  if (data.clientName) {
    const error = validateClientName(data.clientName);
    if (error) errors.push(error);
  }

  if (data.clientEmail) {
    const error = validateEmail(data.clientEmail);
    if (error) errors.push(error);
  }

  if (data.clientPhone) {
    const error = validatePhoneNumber(data.clientPhone);
    if (error) errors.push(error);
  }

  if (data.projectName) {
    const error = validateProjectName(data.projectName);
    if (error) errors.push(error);
  }

  if (data.amount !== undefined && data.amount !== null && data.amount !== "") {
    const error = validateAmount(data.amount);
    if (error) errors.push(error);
  }

  if (data.discount !== undefined && data.discount !== null && data.discount !== "") {
    const error = validatePercentage(data.discount);
    if (error) errors.push(error);
  }

  if (data.surcharge !== undefined && data.surcharge !== null && data.surcharge !== "") {
    const error = validatePercentage(data.surcharge);
    if (error) errors.push(error);
  }

  // Validazioni opzionali
  if (data.address) {
    const error = validateAddress(data.address);
    if (error) errors.push(error);
  }

  if (data.city) {
    const error = validateCity(data.city);
    if (error) errors.push(error);
  }

  if (data.zipCode) {
    const error = validateZipCode(data.zipCode);
    if (error) errors.push(error);
  }

  if (data.description) {
    const error = validateDescription(data.description);
    if (error) errors.push(error);
  }

  return {
    isValid: errors.filter((e) => e.type === "error").length === 0,
    errors,
  };
};
