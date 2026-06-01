/**
 * Formate une date provenant de l'API vers le format YYYY-MM-DD attendu par les inputs HTML5 type="date"
 * Gère différents formats de date possibles (ISO string, format français, etc.)
 */
export function formatDateForInput(dateValue: string | Date | null | undefined): string {
  if (!dateValue) return '';

  let date: Date;

  // Si c'est déjà une Date
  if (dateValue instanceof Date) {
    date = dateValue;
  }
  // Si c'est une chaîne
  else if (typeof dateValue === 'string') {
    // Essayer de parser la date
    date = new Date(dateValue);
    
    // Si la date est invalide, essayer de parser un format français (DD/MM/YYYY)
    if (isNaN(date.getTime())) {
      const parts = dateValue.split('/');
      if (parts.length === 3) {
        // Format DD/MM/YYYY ou DD-MM-YYYY
        const day = parts[0].padStart(2, '0');
        const month = parts[1].padStart(2, '0');
        const year = parts[2];
        date = new Date(`${year}-${month}-${day}`);
      }
    }
  } else {
    return '';
  }

  // Vérifier si la date est valide
  if (isNaN(date.getTime())) return '';

  // Formater en YYYY-MM-DD pour l'input HTML5
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * Formate une date pour l'affichage en français (DD/MM/YYYY)
 */
export function formatDateForDisplay(dateValue: string | Date | null | undefined): string {
  if (!dateValue) return '';

  const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
  
  if (isNaN(date.getTime())) return '';

  return date.toLocaleDateString('fr-FR');
}
