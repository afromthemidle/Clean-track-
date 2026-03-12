export const calculateNextDueDate = (frequency: string, completionDate: Date): Date => {
  const nextDate = new Date(completionDate);
  switch (frequency) {
    case 'Daily':
      nextDate.setDate(nextDate.getDate() + 1);
      break;
    case 'Weekly':
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    case 'Bi-Weekly':
      nextDate.setDate(nextDate.getDate() + 14);
      break;
    case 'Monthly':
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
    case 'Quarterly':
      nextDate.setMonth(nextDate.getMonth() + 3);
      break;
    default:
      nextDate.setDate(nextDate.getDate() + 7);
  }
  return nextDate;
};