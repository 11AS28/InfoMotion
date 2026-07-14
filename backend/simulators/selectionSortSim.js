// backend/simulators/selectionSortSim.js

function simulateSelectionSort(arr) {
  let steps = [];
  let currentArray = [...arr];
  let n = currentArray.length;

  steps.push({
    array: [...currentArray],
    highlights: [],
    explanation: "Pornim algoritmul de Sortare prin Selecție.",
    done: false
  });

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    steps.push({
      array: [...currentArray],
      highlights: [i],
      explanation: `Considerăm inițial elementul de pe poziția ${i} (${currentArray[i]}) ca fiind minimul curent.`,
      done: false
    });

    for (let j = i + 1; j < n; j++) {
      steps.push({
        array: [...currentArray],
        highlights: [j, minIdx],
        explanation: `Comparăm elementul curent de pe poziția ${j} (${currentArray[j]}) cu minimul actual (${currentArray[minIdx]}).`,
        done: false
      });

      if (currentArray[j] < currentArray[minIdx]) {
        minIdx = j;
        steps.push({
          array: [...currentArray],
          highlights: [minIdx],
          explanation: `Am găsit un element mai mic! Noul minim se află la poziția ${minIdx} (valoare: ${currentArray[minIdx]}).`,
          done: false
        });
      }
    }

    if (minIdx !== i) {
      let temp = currentArray[i];
      currentArray[i] = currentArray[minIdx];
      currentArray[minIdx] = temp;

      steps.push({
        array: [...currentArray],
        highlights: [i, minIdx],
        explanation: `Facem swap între elementul de pe poziția ${i} și minimul găsit pe poziția ${minIdx}.`,
        done: false
      });
    } else {
      steps.push({
        array: [...currentArray],
        highlights: [i],
        explanation: `Minimul este deja pe poziția corectă ${i}, nu este nevoie de swap.`,
        done: false
      });
    }
  }

  steps.push({
    array: [...currentArray],
    highlights: [],
    explanation: "Vectorul a fost complet sortat prin Selecție!",
    done: true
  });

  return steps;
}

module.exports = { simulateSelectionSort };