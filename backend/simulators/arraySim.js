function simulateBubbleSort(arr) {
  let steps = [];
  let n = arr.length;
  let currentArray = [...arr]; 

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
      steps.push({
        array: [...currentArray],
        highlights: [i, i + 1],
        explanation: `Comparăm elementele de pe pozițiile ${i} și ${i + 1}: (${currentArray[i]} > ${currentArray[i + 1]})`,
        done: false
      });

      if (currentArray[i] > currentArray[i + 1]) {
        let temp = currentArray[i];
        currentArray[i] = currentArray[i + 1];
        currentArray[i + 1] = temp;
        swapped = true;

        steps.push({
          array: [...currentArray],
          highlights: [i, i + 1],
          explanation: `Deoarece ${currentArray[i + 1]} > ${currentArray[i]}, le schimbăm locul între ele.`,
          done: false
        });
      }
    }
    n--;
  } while (swapped);

  steps.push({
    array: [...currentArray],
    highlights: [],
    explanation: "Vectorul a fost complet sortat!",
    done: true
  });

  return steps; 
}

module.exports = { simulateBubbleSort };