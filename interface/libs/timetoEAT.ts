export function createISOStringInEAT(date: string, time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  const dt = new Date(date);
  dt.setHours(hours, minutes, 0, 0);

  // Get ISO string in local time
  const isoDate = dt.toISOString().split("T")[0];
  const isoTime = dt.toTimeString().split(" ")[0];

  // Append +03:00 for EAT
  return `${isoDate}T${isoTime}+03:00`;
}