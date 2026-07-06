
function simulateQuickSortJS(arr) {
  let steps = [];
  let arrayCopy = [...arr];

  function quickSort(st, dr) {
    if (st >= dr) return;

    let pivotValue = arrayCopy[dr];
    let i = st - 1;

    steps.push({
      array: [...arrayCopy],
      highlights: [dr], 
      explanation: `Subtabloul [${st}...${dr}]: Am ales pivotul cu valoarea ${pivotValue} (la indexul ${dr}). Începe partiționarea.`,
      status: "active"
    });

    for (let j = st; j < dr; j++) {
      steps.push({
        array: [...arrayCopy],
        highlights: [j, dr], 
        explanation: `Comparăm elementul de pe poziția ${j} (${arrayCopy[j]}) cu pivotul (${pivotValue}).`,
        status: "active"
      });

      if (arrayCopy[j] < pivotValue) {
        i++;
        let aux = arrayCopy[i];
        arrayCopy[i] = arrayCopy[j];
        arrayCopy[j] = aux;

        steps.push({
          array: [...arrayCopy],
          highlights: [i, j], 
          explanation: `${arrayCopy[i]} este mai mic decât pivotul (${pivotValue}). Îl mutăm în stânga, făcând swap cu ${arrayCopy[j]}.`,
          status: "active"
        });
      }
    }

    let aux = arrayCopy[i + 1];
    arrayCopy[i + 1] = arrayCopy[dr];
    arrayCopy[dr] = aux;
    
    let pivotIdx = i + 1;

    steps.push({
      array: [...arrayCopy],
      highlights: [pivotIdx],
      explanation: `Partiționare gata. Am așezat pivotul (${pivotValue}) pe poziția lui finală corectă: indexul ${pivotIdx}.`,
      status: "active"
    });

    quickSort(st, pivotIdx - 1);
    quickSort(pivotIdx + 1, dr);
  }

  quickSort(0, arrayCopy.length - 1);

  steps.push({
    array: [...arrayCopy],
    highlights: [],
    explanation: "Felicitări! Vectorul a fost sortat complet prin Quick Sort folosind Divide et Impera.",
    status: "final"
  });

  return steps;
}

module.exports = { simulateQuickSortJS };