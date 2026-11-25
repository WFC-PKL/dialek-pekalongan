// Mencari kata di kamus: node cari.mjs <kata> [--arah indonesia|jawa|pekalongan]
import { readFileSync } from "node:fs"
import { pathToFileURL } from "node:url"

const rapikan = (s) => s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim()

function kolom(e) {
  return {
    indonesia: e.indonesia ?? [],
    jawa: [...(e.jawa?.ngoko ?? []), ...(e.jawa?.krama ?? [])],
    pekalongan: e.pekalongan.flatMap((p) => [p.kata, ...(p.variasi ?? [])]),
  }
}

// Cocok persis lebih dulu, lalu cocok sebagai kata di dalam frasa, lalu awalan.
export function cari(kamus, kueri, { arah, maks = 10 } = {}) {
  const q = rapikan(kueri)
  if (!q) return []
  const nilai = (s) => {
    const t = rapikan(s)
    if (t === q) return 3
    if (` ${t} `.includes(` ${q} `)) return 2
    return q.length >= 3 && t.startsWith(q) ? 1 : 0
  }
  return kamus.entri
    .map((e) => {
      const k = kolom(e)
      const isi = arah ? k[arah] : Object.values(k).flat()
      return { e, n: Math.max(0, ...isi.map(nilai)) }
    })
    .filter((x) => x.n > 0)
    .sort((a, b) => b.n - a.n)
    .slice(0, maks)
    .map((x) => x.e)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2)
  const i = args.indexOf("--arah")
  const arah = i >= 0 ? args.splice(i, 2)[1] : undefined
  if (!args.length || (i >= 0 && !["indonesia", "jawa", "pekalongan"].includes(arah))) {
    console.error("Pakai: node cari.mjs <kata> [--arah indonesia|jawa|pekalongan]")
    process.exit(2)
  }
  const kamus = JSON.parse(readFileSync(new URL("../data/dialek.json", import.meta.url), "utf8"))
  const hasil = cari(kamus, args.join(" "), { arah })
  console.log(hasil.length ? JSON.stringify(hasil, null, 1) : "Tidak ditemukan di kamus.")
}
