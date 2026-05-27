// backend/simulators/cautareBinaraDivImpSim.js

function simulateCautareBinaraDivImpJS(arr, target) {
  let steps = [];
  let arrayCopy = [...arr].sort((a, b) => a - b);

  // Funcție helper care copiază starea curentă a arborelui pentru a fi salvată ca „screenshot” la un anumit pas
  function cloneTree(node) {
    if (!node) return null;
    return {
      id: node.id,
      label: node.label,
      status: node.status,
      explanation: node.explanation,
      children: node.children.map(cloneTree)
    };
  }

  // Obiectul global de referință pentru starea arborelui
  let rootNode = {
    id: `root-${0}-${arrayCopy.length - 1}`,
    label: `[${arrayCopy.join(", ")}] (st=0, dr=${arrayCopy.length - 1})`,
    status: "active",
    explanation: "Apelul inițial pe tot vectorul.",
    children: []
  };

  function divImpSearch(st, dr, currentNode) {
    if (st > dr) {
      currentNode.status = "failed";
      currentNode.explanation = `Interval invalid (${st} > ${dr}). Elementul nu există.`;
      steps.push({
        treeStructure: cloneTree(rootNode),
        explanation: `S-a ajuns la o subproblemă vidă la indicii [${st}...${dr}]. Elementul ${target} NU există pe această ramură.`
      });
      return -1;
    }

    let mij = Math.floor((st + dr) / 2);
    currentNode.label = `Mijloc: ${arrayCopy[mij]} | [${st}...${dr}]`;
    currentNode.explanation = `Se verifică mijlocul la index ${mij} (valoare: ${arrayCopy[mij]})`;

    steps.push({
      treeStructure: cloneTree(rootNode),
      explanation: `Calculăm mijlocul subproblemei curente. Verificăm dacă vector[${mij}] (${arrayCopy[mij]}) este egal cu ${target}.`
    });

    if (arrayCopy[mij] === target) {
      currentNode.status = "solved";
      steps.push({
        treeStructure: cloneTree(rootNode),
        explanation: `🎉 Succes! Elementul ${target} a fost găsit la indexul ${mij}. Algoritmul se oprește.`
      });
      return mij;
    }

    // Dacă nu a fost găsit, nodul devine „procesat/părinte” și creăm un copil
    currentNode.status = "processed";

    if (arrayCopy[mij] > target) {
      let leftChild = {
        id: `node-${st}-${mij - 1}`,
        label: `Așteaptă stânga [${st}...${mij - 1}]`,
        status: "active",
        explanation: `Căutăm în stânga deoarece ${target} < ${arrayCopy[mij]}`,
        children: []
      };
      currentNode.children.push(leftChild);
      
      steps.push({
        treeStructure: cloneTree(rootNode),
        explanation: `Deoarece ${target} < ${arrayCopy[mij]}, instanța curentă generează un sub-apel recursiv în STÂNGA pe intervalul [${st}...${mij - 1}].`
      });

      return divImpSearch(st, mij - 1, leftChild);
    } else {
      let rightChild = {
        id: `node-${mij + 1}-${dr}`,
        label: `Așteaptă dreapta [${mij + 1}...${dr}]`,
        status: "active",
        explanation: `Căutăm în dreapta deoarece ${target} > ${arrayCopy[mij]}`,
        children: []
      };
      currentNode.children.push(rightChild);

      steps.push({
        treeStructure: cloneTree(rootNode),
        explanation: `Deoarece ${target} > ${arrayCopy[mij]}, instanța curentă generează un sub-apel recursiv în DREAPTA pe intervalul [${mij + 1}...${dr}].`
      });

      return divImpSearch(mij + 1, dr, rightChild);
    }
  }

  // Pornim execuția
  divImpSearch(0, arrayCopy.length - 1, rootNode);
  return steps;
}

module.exports = { simulateCautareBinaraDivImpJS };