export const numberToWords = (number: number): string => {
    const ones = [
        "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
        "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
        "Seventeen", "Eighteen", "Nineteen",
    ];
    const tens = [
        "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety",
    ];

    // Base case: If the number is 0
    if (number === 0) return "Zero";

    // Convert numbers less than 20
    if (number < 20) return ones[number];

    // Convert numbers less than 100
    if (number < 100) {
        return tens[Math.floor(number / 10)] + (number % 10 ? " " + ones[number % 10] : "");
    }

    // Convert numbers less than 1000
    if (number < 1000) {
        return (
            ones[Math.floor(number / 100)] +
            " Hundred" +
            (number % 100 ? " and " + numberToWords(number % 100) : "")
        );
    }

    // Convert numbers less than 1,000,000
    if (number < 1000000) {
        return (
            numberToWords(Math.floor(number / 1000)) +
            " Thousand" +
            (number % 1000 ? " " + numberToWords(number % 1000) : "")
        );
    }

    // Convert numbers less than 1,000,000,000
    if (number < 1000000000) {
        return (
            numberToWords(Math.floor(number / 1000000)) +
            " Million" +
            (number % 1000000 ? " " + numberToWords(number % 1000000) : "")
        );
    }

    // Convert numbers up to 1,000,000,000,000 (1 trillion)
    if (number < 1000000000000) {
        return (
            numberToWords(Math.floor(number / 1000000000)) +
            " Billion" +
            (number % 1000000000 ? " " + numberToWords(number % 1000000000) : "")
        );
    }

    // Convert very large numbers
    return "Number too large";
};