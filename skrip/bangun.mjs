// Membangun dist/kamus.json dan data untuk skill dari entri terverifikasi.
import { mkdirSync, writeFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { bacaKamus, susun } from "./kamus.mjs"

const akar = fileURLToPath(new URL("../", import.meta.url))
const { entri, masalah } = bacaKamus(`${akar}entri`)
if (masalah.length) {
  console.error(masalah.join("\n"))
  process.exit(1)
}
const hasil = susun(entri)
for (const folder of ["dist", "skill/kamus-pekalongan/data"]) {
  mkdirSync(akar + folder, { recursive: true })
  writeFileSync(`${akar}${folder}/kamus.json`, JSON.stringify(hasil, null, 1) + "\n")
}
console.log(`${hasil.jumlah} entri terverifikasi ditulis.`)
