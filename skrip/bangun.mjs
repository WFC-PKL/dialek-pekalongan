// Membangun dist/dialek.json dan data untuk skill dari entri terverifikasi.
import { mkdirSync, writeFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { bacaDialek, susun } from "./dialek.mjs"

const akar = fileURLToPath(new URL("../", import.meta.url))
const { entri, masalah } = bacaDialek(`${akar}entri`)
if (masalah.length) {
  console.error(masalah.join("\n"))
  process.exit(1)
}
const hasil = susun(entri)
for (const folder of ["dist", "skill/dialek-pekalongan/data"]) {
  mkdirSync(akar + folder, { recursive: true })
  writeFileSync(`${akar}${folder}/dialek.json`, JSON.stringify(hasil, null, 1) + "\n")
}
console.log(`${hasil.jumlah} entri terverifikasi ditulis.`)
