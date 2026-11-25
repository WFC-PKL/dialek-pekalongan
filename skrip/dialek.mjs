// Membaca dan memeriksa entri kamus.
import { readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { parse } from "yaml"

export const WILAYAH = ["kota-pekalongan", "kabupaten-pekalongan", "batang", "pemalang"]
export const JENIS = ["kata", "partikel", "ungkapan"]
export const RAGAM = ["netral", "akrab", "kasar"]
const STATUS = ["usulan", "terverifikasi"]
const SUMBER = ["penutur", "pustaka"]
const KUNCI = ["id", "jenis", "indonesia", "penjelasan", "jawa", "pekalongan", "contoh", "status", "sumber", "rujukan", "verifikasi", "inti"]
const MAKS = 200
const MAKS_DAFTAR = 20

const objek = (x) => x !== null && typeof x === "object" && !Array.isArray(x)

// Isi kamus dibaca model AI, jadi teks dibatasi: satu baris, pendek, tanpa tautan dan markup.
function masalahTeks(x) {
  if (typeof x !== "string" || !x.trim()) return "harus teks dan tidak kosong (pakai tanda kutip bila perlu)"
  if (x !== x.trim()) return "ada spasi di awal atau akhir"
  if (x.length > MAKS) return `lebih dari ${MAKS} karakter`
  if (/[\p{Cc}\p{Cf}\p{Zl}\p{Zp}]/u.test(x)) return "ada karakter kendali atau baris baru"
  if (/[<>{}`]/.test(x)) return "ada karakter markup"
  if (/https?:|www\./i.test(x)) return "ada tautan"
  if (/[\w.+-]+@[\w-]+(\.[\w-]+)+/.test(x)) return "ada alamat email"
  if (/(?<!\d)(\+?62|0)[\s-]?8\d([\s-]?\d){7,11}(?!\d)/.test(x)) return "ada pola nomor HP"
  return null
}

export function periksaEntri(e, namaBerkas) {
  const m = []
  if (!objek(e)) return ["isi berkas harus berupa objek YAML"]

  const teks = (x, di) => {
    const p = masalahTeks(x)
    if (p) m.push(`${di}: ${p}`)
  }
  const daftar = (x, di, wajib = false) => {
    if (x === undefined && !wajib) return
    if (!Array.isArray(x) || (wajib && !x.length)) return void m.push(`${di}: harus daftar${wajib ? " berisi minimal satu" : ""}`)
    if (x.length > MAKS_DAFTAR) m.push(`${di}: lebih dari ${MAKS_DAFTAR} isi`)
    x.forEach((t, i) => teks(t, `${di}[${i}]`))
  }
  const pilihan = (x, boleh, di) => {
    if (!boleh.includes(x)) m.push(`${di}: harus salah satu dari ${boleh.join(", ")}`)
  }
  const kunci = (x, boleh, di) => {
    for (const k of Object.keys(x)) if (!boleh.includes(k)) m.push(`${di}: kunci "${k}" tidak dikenal`)
  }
  const tiap = (x, di, fn, wajib = false) => {
    if (x === undefined && !wajib) return
    if (!Array.isArray(x) || (wajib && !x.length)) return void m.push(`${di}: harus daftar${wajib ? " berisi minimal satu" : ""}`)
    if (x.length > MAKS_DAFTAR) m.push(`${di}: lebih dari ${MAKS_DAFTAR} isi`)
    x.forEach((o, i) => (objek(o) ? fn(o, `${di}[${i}]`) : m.push(`${di}[${i}]: harus objek`)))
  }

  kunci(e, KUNCI, "entri")
  if (typeof e.id !== "string" || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(e.id)) m.push("id: pakai huruf kecil, angka, dan tanda hubung")
  else if (namaBerkas !== `${e.id}.yaml`) m.push(`id: nama berkas harus ${e.id}.yaml`)
  pilihan(e.jenis, JENIS, "jenis")
  pilihan(e.status, STATUS, "status")
  pilihan(e.sumber, SUMBER, "sumber")

  // Partikel sering tidak punya padanan satu kata, jadi cukup dijelaskan.
  const kata = e.jenis === "kata"
  daftar(e.indonesia, "indonesia", e.jenis !== "partikel")
  if (e.penjelasan !== undefined || e.jenis === "partikel") teks(e.penjelasan, "penjelasan")

  if (e.jawa !== undefined || kata) {
    if (!objek(e.jawa)) m.push("jawa: wajib, berisi ngoko")
    else {
      kunci(e.jawa, ["ngoko", "krama"], "jawa")
      daftar(e.jawa.ngoko, "jawa.ngoko", kata)
      daftar(e.jawa.krama, "jawa.krama")
    }
  }

  tiap(e.pekalongan, "pekalongan", (p, di) => {
    kunci(p, ["kata", "variasi", "lafal", "wilayah", "ragam", "catatan"], di)
    teks(p.kata, `${di}.kata`)
    // Cakupan: hanya yang berbeda dari Jawa umum.
    const ngoko = Array.isArray(e.jawa?.ngoko) ? e.jawa.ngoko : []
    const sama = (n) => typeof n === "string" && typeof p.kata === "string" && n.toLowerCase() === p.kata.toLowerCase()
    if (ngoko.some(sama) && p.lafal === undefined && p.catatan === undefined) m.push(`${di}.kata: sama dengan Jawa ngoko, isi lafal atau catatan untuk menjelaskan bedanya`)
    daftar(p.variasi, `${di}.variasi`)
    for (const k of ["lafal", "catatan"]) if (p[k] !== undefined) teks(p[k], `${di}.${k}`)
    if (!Array.isArray(p.wilayah) || !p.wilayah.length) m.push(`${di}.wilayah: harus daftar berisi minimal satu`)
    else p.wilayah.forEach((w) => pilihan(w, WILAYAH, `${di}.wilayah`))
    pilihan(p.ragam, RAGAM, `${di}.ragam`)
  }, true)

  tiap(e.contoh, "contoh", (c, di) => {
    kunci(c, ["pekalongan", "indonesia"], di)
    teks(c.pekalongan, `${di}.pekalongan`)
    teks(c.indonesia, `${di}.indonesia`)
  })

  if (e.rujukan !== undefined || e.sumber === "pustaka") teks(e.rujukan, "rujukan")
  if (e.inti !== undefined && typeof e.inti !== "boolean") m.push("inti: harus true atau false")

  const oleh = new Set()
  tiap(e.verifikasi, "verifikasi", (v, di) => {
    kunci(v, ["oleh", "wilayah"], di)
    if (typeof v.oleh !== "string" || !/^[a-z0-9][a-z0-9-]{0,38}$/.test(v.oleh)) m.push(`${di}.oleh: pakai nama pengguna GitHub atau nama samaran, huruf kecil`)
    else oleh.add(v.oleh)
    pilihan(v.wilayah, WILAYAH, `${di}.wilayah`)
  })
  if (e.status === "terverifikasi" && oleh.size < 2) m.push("verifikasi: status terverifikasi butuh dua penutur berbeda")
  return m
}

export function bacaDialek(folder) {
  const entri = []
  const masalah = []
  const pernah = new Map()
  for (const nama of readdirSync(folder).sort()) {
    if (nama === ".gitkeep" || nama === ".DS_Store") continue
    if (!nama.endsWith(".yaml")) {
      masalah.push(`${nama}: hanya berkas .yaml yang boleh ada di folder entri`)
      continue
    }
    let e
    try {
      e = parse(readFileSync(join(folder, nama), "utf8"), { maxAliasCount: 0 })
    } catch (err) {
      masalah.push(`${nama}: YAML tidak terbaca (${err.message.split("\n")[0]})`)
      continue
    }
    const salah = periksaEntri(e, nama)
    if (salah.length) {
      masalah.push(...salah.map((s) => `${nama}: ${s}`))
      continue
    }
    // Duplikat: kata Pekalongan dan maknanya sama.
    for (const p of e.pekalongan) {
      for (const arti of e.indonesia ?? [e.penjelasan]) {
        const k = `${p.kata}|${arti}`.toLowerCase()
        const lama = pernah.get(k)
        if (lama && lama !== nama) masalah.push(`${nama}: duplikat dengan ${lama} (${p.kata})`)
        pernah.set(k, nama)
      }
    }
    entri.push(e)
  }
  return { entri, masalah }
}

export function susun(entri) {
  const pakai = entri
    .filter((e) => e.status === "terverifikasi")
    .map(({ status, verifikasi, ...sisa }) => sisa)
  return { versi: 1, lisensi: "CC-BY-SA-4.0", jumlah: pakai.length, entri: pakai }
}
