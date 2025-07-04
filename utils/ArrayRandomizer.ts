// utils/ArrayRandomizer.ts

// PRNG tanpa Math.random() sama sekali
function createLCG(seed: number): () => number {
  let m = 2 ** 31;
  let a = 1103515245;
  let c = 12345;

  let state = seed;

  return function (): number {
    state = (a * state + c) % m;
    // hasil dari 0 sampai m-1, kita normalisasi ke bilangan [0,1)
    return state / m;
  };
}

// Fisher-Yates Shuffle dengan PRNG custom
export function shuffleArray<T>(array: T[], seed: number = 1): T[] {
  const random = createLCG(seed);
  const result = array.slice(); // copy biar tidak mengubah original

  for (let i = result.length - 1; i > 0; i--) {
    const r = random(); // angka antara 0 dan <1
    const j = Math.floor(r * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}