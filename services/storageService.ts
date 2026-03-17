export const calculateNextDueDate = (frequency: string, completionDate: Date): Date => {
  const nextDate = new Date(completionDate);
  switch (frequency) {
    case 'Diario':
      nextDate.setDate(nextDate.getDate() + 1);
      break;
    case 'Semanal':
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    case 'Quincenal':
      nextDate.setDate(nextDate.getDate() + 14);
      break;
    case 'Mensual':
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
    case 'Trimestral':
      nextDate.setMonth(nextDate.getMonth() + 3);
      break;
    case 'Semestral':
      nextDate.setMonth(nextDate.getMonth() + 6);
      break;
    case 'Anual':
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      break;
    default:
      nextDate.setDate(nextDate.getDate() + 7);
  }
  return nextDate;
};