/**
 * Returns today's date as a YYYY-MM-DD string (local timezone).
 */
export const getTodayString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Converts a YYYY-MM-DD string to a Date object (local midnight).
 */
export const parseDate = (dateStr) => {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

/**
 * Formats a YYYY-MM-DD string for display, e.g. "Mon, 15 Jun 2026"
 */
export const formatDateDisplay = (dateStr) => {
  const d = parseDate(dateStr);
  if (!d || isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Checks if a date string is valid and not in the past.
 */
export const isValidFutureDate = (dateStr) => {
  const d = parseDate(dateStr);
  if (!d) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d >= today;
};