// backend/simulators/cautareBinaraDivImpSim.js

function simulateCautareBinaraDivImpJS(arr, target) {
  let steps = [];
  
  // Algoritmul Divide et Impera (Căutare Binară) cere vector sortat
  let arrayCopy = [...arr].sort((a, b) => a - b);

  // Funcția recursivă propriu-zisă
  function divImpSearch(st, dr, depth) {
    if (st > dr) {
      steps.push({
        array: [...arrayCopy],
        highlights: [],
        explanation: `[Nivel Recursiv ${depth}] Interval invalid: stânga (${st}) > dreapta (${dr}). Elementul ${target} NU există!`,
        status: "active",
        apelCurent: `cauta(st=${st}, dr=${dr}) -> Nu există`
      });
      return -1;
    }

    let mij = Math.floor((st + dr) / 2);

    // Salvăm pasul în care intrăm în funcție și calculăm mijlocul
    steps.push({
      array: [...arrayCopy],
      highlights: [mij, st, dr], // Evidențiem mijlocul, stânga și dreapta
      explanation: `[Nivel Recursiv ${depth}] Apel: cauta(st=${st}, dr=${dr}). Mijlocul este la indexul ${mij} (valoare: ${arrayCopy[mij]}).`,
      status: "active",
      apelCurent: `cauta(st=${st}, dr=${dr})`
    });

    if (arrayCopy[mij] === target) {
      steps.push({
        array: [...arrayCopy],
        highlights: [mij],
        explanation: `[SUCCES] Elementul ${target} a fost găsit pe poziția ${mij}! Începe returnarea din recursivitate.`,
        status: "final",
        apelCurent: `cauta(st=${st}, dr=${dr}) -> Găsit!`
      });
      return mij;
    }

    if (arrayCopy[mij] > target) {
      steps.push({
        array: [...arrayCopy],
        highlights: [st, mij - 1],
        explanation: `Deoarece ${target} < ${arrayCopy[mij]}, atacăm subproblema din STÂNGA: [${st} ... ${mij - 1}].`,
        status: "active",
        apelCurent: `cauta(st=${st}, dr=${dr}) -> Mergem în Stânga`
      });
      // Apelul recursiv pentru jumătatea stângă
      return divImpSearch(st, mij - 1, depth + 1);
    } else {
      steps.push({
        array: [...arrayCopy],
        highlights: [mij + 1, dr],
        explanation: `Deoarece ${target} > ${arrayCopy[mij]}, atacăm subproblema din DREAPTA: [${mij + 1} ... ${dr}].`,
        status: "active",
        apelCurent: `cauta(st=${st}, dr=${dr}) -> Mergem în Dreapta`
      });
      // Apelul recursiv pentru jumătatea dreaptă
      return divImpSearch(mij + 1, dr, depth + 1);
    }
  }

  // Pornim primul apel (Rădăcina recursivității) de la nivelul 1
  divImpSearch(0, arrayCopy.length - 1, 1);

  return steps;
}

module.exports = { simulateCautareBinaraDivImpJS };