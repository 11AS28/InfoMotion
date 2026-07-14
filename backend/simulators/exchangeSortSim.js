// backend/simulators/exchangeSortSim.js

function simulateExchangeSort(arr) {
  let steps = [];
  let currentArray = [...arr];
  let n = currentArray.length;

  steps.push({
    array: [...currentArray],
    highlights: [],
    explanation: "Pornim algoritmul de Sortare prin Interschimbare.",
    done: false
  });

  for (let i = 0; i < n - 1; i++) {
    for (let j = i + 1; j < n; j++) {
      steps.push({
        array: [...currentArray],
        highlights: [i, j],
        explanation: `Comparăm elementul de pe poziția ${i} (${currentArray[i]}) cu cel de pe poziția ${j} (${currentArray[j]}).`,
        done: false
      });

      if (currentArray[i] > currentArray[j]) {
        let temp = currentArray[i];
        currentArray[i] = currentArray[j];
        currentArray[j] = temp;

        steps.push({
          array: [...currentArray],
          highlights: [i, j],
          explanation: `Deoarece ${currentArray[j]} < ${currentArray[i]}, le schimbăm locul între ele.`,
          done: false
        });
      }
    }
  }

  steps.push({
    array: [...currentArray],
    highlights: [],
    explanation: "Vectorul a fost complet sortat prin Interschimbare!",
    done: true
  });

  return steps;
}

module.exports = { simulateExchangeSort };