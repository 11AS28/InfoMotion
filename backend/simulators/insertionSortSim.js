// backend/simulators/insertionSortSim.js

function simulateInsertionSort(arr) {
  let steps = [];
  let currentArray = [...arr];
  let n = currentArray.length;

  steps.push({
    array: [...currentArray],
    highlights: [],
    explanation: "Pornim algoritmul de Sortare prin Inserție.",
    done: false
  });

  for (let i = 1; i < n; i++) {
    let key = currentArray[i];
    let j = i - 1;

    steps.push({
      array: [...currentArray],
      highlights: [i],
      explanation: `Luăm elementul de pe poziția ${i} (${key}) și îl inserăm în subtabloul sortat din stânga sa.`,
      done: false
    });

    while (j >= 0 && currentArray[j] > key) {
      steps.push({
        array: [...currentArray],
        highlights: [j, j + 1],
        explanation: `Deoarece ${currentArray[j]} > ${key}, mutăm elementul ${currentArray[j]} spre dreapta.`,
        done: false
      });

      currentArray[j + 1] = currentArray[j];
      j--;

      steps.push({
        array: [...currentArray],
        highlights: [j + 2], 
        explanation: `Elementul a fost deplasat cu o poziție la dreapta.`,
        done: false
      });
    }

    currentArray[j + 1] = key;
    steps.push({
      array: [...currentArray],
      highlights: [j + 1],
      explanation: `Am inserat valoarea ${key} pe poziția corectă: indexul ${j + 1}.`,
      done: false
    });
  }

  steps.push({
    array: [...currentArray],
    highlights: [],
    explanation: "Vectorul a fost complet sortat prin Inserție!",
    done: true
  });

  return steps;
}

module.exports = { simulateInsertionSort };