/** Angka semu-acak 0..1 yang sama di server dan browser (tidak memicu hydration mismatch). */
export function seeded(i: number, salt = 1): number {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453
  return x - Math.floor(x)
}
