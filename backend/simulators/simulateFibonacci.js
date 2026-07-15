function simulateFibonacciRecursiv(n) {
  const steps = [];
  let idCounter = 0;
  let root = null;
  const stivaNoduri = [];

  function cloneazaArbore(nod) {
    if (!nod) return null;
    return {
      id: nod.id,
      label: nod.label,
      explanation: nod.explanation,
      status: nod.status,
      children: nod.children.map(cloneazaArbore)
    };
  }

  function faSnapshot(explicatie) {
    steps.push({
      treeStructure: cloneazaArbore(root),
      explanation: explicatie
    });
  }

  function fib(k) {
    const nod = {
      id: idCounter++,
      label: `fib(${k})`,
      explanation: '',
      status: 'active',
      children: []
    };

    if (stivaNoduri.length === 0) {
      root = nod;
    } else {
      stivaNoduri[stivaNoduri.length - 1].children.push(nod);
    }
    stivaNoduri.push(nod);

    faSnapshot(`Apelăm fib(${k}).`);

    let rezultat;

    if (k <= 1) {
      rezultat = k;
      nod.status = 'solved';
      nod.explanation = `Caz de bază: fib(${k}) = ${k}`;
      stivaNoduri.pop();
      faSnapshot(`fib(${k}) este caz de bază și returnează direct ${k}.`);
      return rezultat;
    }

    faSnapshot(`fib(${k}) nu e caz de bază, apelăm mai întâi fib(${k - 1}).`);
    const stanga = fib(k - 1);

    faSnapshot(`fib(${k}) a primit fib(${k - 1}) = ${stanga}, acum apelăm fib(${k - 2}).`);
    const dreapta = fib(k - 2);

    rezultat = stanga + dreapta;
    nod.status = 'solved';
    nod.explanation = `fib(${k}) = fib(${k - 1}) + fib(${k - 2}) = ${stanga} + ${dreapta} = ${rezultat}`;
    stivaNoduri.pop();

    faSnapshot(`fib(${k}) = ${stanga} + ${dreapta} = ${rezultat}. Revenim la apelul părinte.`);

    return rezultat;
  }

  fib(n);

  return steps;
}

module.exports = { simulateFibonacciRecursiv };