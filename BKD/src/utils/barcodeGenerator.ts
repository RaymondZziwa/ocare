function calculateCheckDigit(baseBarcode) {
  const digits = baseBarcode.split('').map(Number);
  const oddSum = digits
    .filter((_, i) => i % 2 === 0)
    .reduce((acc, curr) => acc + curr, 0);
  const evenSum = digits
    .filter((_, i) => i % 2 !== 0)
    .reduce((acc, curr) => acc + curr * 3, 0);
  const totalSum = oddSum + evenSum;
  const checkDigit = (10 - (totalSum % 10)) % 10;
  return checkDigit;
}

// Function to generate a valid EAN-13 barcode number
export function generateEAN13() {
  // Generate a random 12-digit base
  const baseBarcode = Math.floor(Math.random() * 1000000000000)
    .toString()
    .padStart(12, '0'); // Ensure it's 12 digits

  if (calculateCheckDigit(baseBarcode)) {
    return baseBarcode;
  } else {
    generateEAN13();
  }
}
