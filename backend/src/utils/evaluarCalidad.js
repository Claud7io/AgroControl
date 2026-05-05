/**
 * Evaluación automática de calidad (RF4)
 * 
 * Criterios definidos:
 * - Defectos totales <= 12%
 * - Podridos <= 4%
 * - Brix >= 4.5
 * 
 * Si cumple los 3 → aprobado
 * Si falla alguno → rechazado
 */

const evaluarCalidad = (datosControl) => {
  const {
    kilos_total,
    kilos_verde,
    kilos_podridos,
    kilos_limitado,
    brix
  } = datosControl;

  // Validar que kilos_total sea mayor que 0
  if (kilos_total <= 0) {
    throw new Error('Los kilos totales deben ser mayor que 0');
  }

  // Calcular porcentajes
  const pctDefectosTotales = ((kilos_verde + kilos_podridos + kilos_limitado) / kilos_total) * 100;
  const pctPodridos = (kilos_podridos / kilos_total) * 100;

  // Aplicar criterios
  const cumpleDefectos = pctDefectosTotales <= 12;
  const cumplePodridos = pctPodridos <= 4;
  const cumpleBrix = brix >= 4.5;

  // Determinar resultado
  if (cumpleDefectos && cumplePodridos && cumpleBrix) {
    return 'aprobado';
  } else {
    return 'rechazado';
  }
};

module.exports = { evaluarCalidad };
