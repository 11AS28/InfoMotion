function simulateStrlen(text) {
    let steps = [];
    let length = 0;

    for (let i = 0; i < text.length; i++) {
        steps.push({
            currentIndex: i,
            currentValue: text[i],
            currentLength: length,
            explanation: `Verificăm caracterul '${text[i]}' de la poziția ${i}. Nu este NULL, deci incrementăm lungimea.`,
            status: "active"
        });
        length++;
    }

    steps.push({
        currentIndex: text.length,
        currentValue: "\\0",
        currentLength: length,
        explanation: `Am întâlnit caracterul terminal (NULL). Șirul s-a terminat. Lungimea finală este ${length}.`,
        status: "final"
    });

    return steps;
}

module.exports = { simulateStrlen };