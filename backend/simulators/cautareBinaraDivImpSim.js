function simulateCautareBinaraDivImpJS(arr, target) {
  let steps = [];
  let arrayCopy = [...arr].sort((a, b) => a - b);

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

  let rootNode = {
    id: `root-0-${arrayCopy.length - 1}`,
    label: `Interval inițial: [0...${arrayCopy.length - 1}]`,
    status: "active",
    explanation: `Căutăm valoarea ${target} în vectorul sortat: [${arrayCopy.join(", ")}]`,
    children: []
  };

  function divImpSearch(st, dr, currentNode) {
    if (st > dr) {
      currentNode.status = "failed";
      currentNode.explanation = `❌ Interval invalid (${st} > ${dr}). Nu s-a găsit.`;
      steps.push({
        treeStructure: cloneTree(rootNode),
        explanation: `S-a ajuns la un interval vid [${st}...${dr}]. Elementul ${target} NU există în această subproblemă.`
      });
      return -1;
    }

    let mij = Math.floor((st + dr) / 2);
    currentNode.label = `Mijloc: v[${mij}] = ${arrayCopy[mij]}`;
    currentNode.explanation = `Verificăm mijlocul intervalului [${st}...${dr}]`;

    steps.push({
      treeStructure: cloneTree(rootNode),
      explanation: `Calculăm mijlocul. Verificăm dacă v[${mij}] (${arrayCopy[mij]}) este egal cu ${target}.`
    });

    if (arrayCopy[mij] === target) {
      currentNode.status = "solved";
      currentNode.explanation = `🎉 Găsit la indexul ${mij}!`;
      steps.push({
        treeStructure: cloneTree(rootNode),
        explanation: `🎉 Succes! Elementul ${target} a fost găsit la indexul ${mij}. Algoritmul se oprește.`
      });
      return mij;
    }

    currentNode.status = "processed";

    if (arrayCopy[mij] > target) {
      let leftChild = {
        id: `node-${st}-${mij - 1}`,
        label: `Căutare stânga [${st}...${mij - 1}]`,
        status: "active",
        explanation: `Deoarece ${target} < ${arrayCopy[mij]}`,
        children: []
      };
      currentNode.children.push(leftChild);
      
      steps.push({
        treeStructure: cloneTree(rootNode),
        explanation: `Deoarece ${target} < ${arrayCopy[mij]}, coborâm în DREAPTA/STÂNGA recursiv pe sub-intervalul stâng [${st}...${mij - 1}].`
      });

      return divImpSearch(st, mij - 1, leftChild);
    } else {
      let rightChild = {
        id: `node-${mij + 1}-${dr}`,
        label: `Căutare dreapta [${mij + 1}...${dr}]`,
        status: "active",
        explanation: `Deoarece ${target} > ${arrayCopy[mij]}`,
        children: []
      };
      currentNode.children.push(rightChild);

      steps.push({
        treeStructure: cloneTree(rootNode),
        explanation: `Deoarece ${target} > ${arrayCopy[mij]}, coborâm recursiv pe sub-intervalul drept [${mij + 1}...${dr}].`
      });

      return divImpSearch(mij + 1, dr, rightChild);
    }
  }

  divImpSearch(0, arrayCopy.length - 1, rootNode);
  return steps;
}

// ATENȚIE: Exportă exact numele pe care îl folosești în server.js
module.exports = { simulateCautareBinaraDivImpJS };