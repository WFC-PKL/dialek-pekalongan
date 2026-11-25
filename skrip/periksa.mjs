import { fileURLToPath } from "node:url"
import { bacaKamus } from "./kamus.mjs"

const { entri, masalah } = bacaKamus(fileURLToPath(new URL("../entri/", import.meta.url)))
if (masalah.length) {
  console.error(masalah.join("\n"))
  process.exit(1)
}
const siap = entri.filter((e) => e.status === "terverifikasi").length
console.log(`${entri.length} entri diperiksa (${siap} terverifikasi), tidak ada masalah.`)
