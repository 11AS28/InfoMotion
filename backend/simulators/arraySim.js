// backend/simulators/arraySim.js
function simulateBubbleSort(arr) {
  let steps = [];
  let n = arr.length;
  let currentArray = [...arr]; 

  // Adăugăm pasul inițial
  steps.push({
    array: [...currentArray],
    highlights: [],
    explanation: "Pornim algoritmul Bubble Sort cu vectorul introdus.",
    done: false
  });

  let swapped;
  do {
    swapped = false;
    for (let i = 0; i < n - 1; i++) {
      // Pasul 1: Evidențiem elementele pe care le comparăm
      steps.push({
        array: [...currentArray],
        highlights: [i, i + 1],
        explanation: `Comparăm elementele de pe pozițiile ${i} și ${i + 1}: (${currentArray[i]} > ${currentArray[i + 1]})`,
        done: false
      });

      if (currentArray[i] > currentArray[i + 1]) {
        // Facem swap
        let temp = currentArray[i];
        currentArray[i] = currentArray[i + 1];
        currentArray[i + 1] = temp;
        swapped = true;

        // Pasul 2: Adăugăm starea după swap
        steps.push({
          array: [...currentArray],
          highlights: [i, i + 1],
          explanation: `Deoarece ${currentArray[i + 1]} > ${currentArray[i]}, le schimbăm locul între ele.`,
          done: false
        });
      }
    }
    n--; // Ultimul element este deja pe poziția lui corectă
  } while (swapped);

  // Pasul final: Vectorul este sortat
  steps.push({
    array: [...currentArray],
    highlights: [],
    explanation: "Vectorul a fost complet sortat!",
    done: true
  });

  return steps; 
}

module.exports = { simulateBubbleSort };