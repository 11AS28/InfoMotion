// backend/simulators/quickSortSim.js

function simulateQuickSortJS(arr) {
  let steps = [];
  // Lucrăm pe o copie ca să nu stricăm vectorul original trimis de utilizator
  let arrayCopy = [...arr];

  function quickSort(st, dr) {
    if (st >= dr) return;

    // Alegem pivotul (de exemplu, ultimul element din intervalul curent)
    let pivotValue = arrayCopy[dr];
    let i = st - 1;

    // Adăugăm un pas pentru faza în care se alege pivotul curent
    steps.push({
      array: [...arrayCopy],
      highlights: [dr], // Evidențiem poziția pivotului
      explanation: `Subtabloul [${st}...${dr}]: Am ales pivotul cu valoarea ${pivotValue} (la indexul ${dr}). Începe partiționarea.`,
      status: "active"
    });

    for (let j = st; j < dr; j++) {
      // Pas de comparare
      steps.push({
        array: [...arrayCopy],
        highlights: [j, dr], // Evidențiem elementul curent parcurs și pivotul
        explanation: `Comparăm elementul de pe poziția ${j} (${arrayCopy[j]}) cu pivotul (${pivotValue}).`,
        status: "active"
      });

      if (arrayCopy[j] < pivotValue) {
        i++;
        // Facem swap
        let aux = arrayCopy[i];
        arrayCopy[i] = arrayCopy[j];
        arrayCopy[j] = aux;

        steps.push({
          array: [...arrayCopy],
          highlights: [i, j], // Evidențiem elementele care tocmai s-au schimbat
          explanation: `${arrayCopy[i]} este mai mic decât pivotul (${pivotValue}). Îl mutăm în stânga, făcând swap cu ${arrayCopy[j]}.`,
          status: "active"
        });
      }
    }

    // Punem pivotul la locul lui final în siguranță
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

    // Împărțim recursiv
    quickSort(st, pivotIdx - 1);
    quickSort(pivotIdx + 1, dr);
  }

  // Pornim algoritmul pe tot vectorul
  quickSort(0, arrayCopy.length - 1);

  // Adăugăm pasul de final în care totul e sortat perfect
  steps.push({
    array: [...arrayCopy],
    highlights: [],
    explanation: "Felicitări! Vectorul a fost sortat complet prin Quick Sort folosind Divide et Impera.",
    status: "final"
  });

  return steps;
}

module.exports = { simulateQuickSortJS };