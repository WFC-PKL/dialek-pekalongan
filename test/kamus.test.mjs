// Semua kata di tes ini rekaan, bukan kata Pekalongan.
import assert from "node:assert/strict"
import { mkdtempSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import test from "node:test"
import { cari } from "../skill/kamus-pekalongan/skrip/cari.mjs"
import { bacaKamus, periksaEntri, susun } from "../skrip/kamus.mjs"

const contoh = (ubah = {}) => ({
  id: "uji", jenis: "kata", indonesia: ["artiuji"], jawa: { ngoko: ["ngokouji"] },
  pekalongan: [{ kata: "xyzuji", wilayah: ["kota-pekalongan"], ragam: "netral" }],
  status: "usulan", sumber: "penutur", ...ubah,
})
const salah = (ubah, pola, nama = "uji.yaml") => assert.match(periksaEntri(contoh(ubah), nama).join("\n"), pola)
const dua = [{ oleh: "a", wilayah: "batang" }, { oleh: "b", wilayah: "batang" }]

test("entri sah", () => assert.deepEqual(periksaEntri(contoh(), "uji.yaml"), []))
test("nama berkas harus sama dengan id", () => salah({}, /nama berkas/, "lain.yaml"))
test("ngoko wajib, krama opsional", () => salah({ jawa: { krama: ["x"] } }, /jawa\.ngoko/))
test("kunci asing ditolak", () => salah({ asing: 1 }, /tidak dikenal/))
test("wilayah dan ragam dibatasi", () => {
  salah({ pekalongan: [{ kata: "x", wilayah: ["mars"], ragam: "netral" }] }, /wilayah/)
  salah({ pekalongan: [{ kata: "x", wilayah: ["batang"] }] }, /ragam/)
})
test("teks berbahaya ditolak", () => {
  for (const t of ["a\nb", "<b>", "https://x.id", "a@b.id", "0812 3456 7890", "x".repeat(201), "a\u200bb"]) {
    assert.ok(periksaEntri(contoh({ indonesia: [t] }), "uji.yaml").length, JSON.stringify(t))
  }
})
test("partikel butuh penjelasan, bukan padanan", () => {
  const p = { jenis: "partikel", indonesia: undefined, jawa: undefined }
  salah(p, /penjelasan/)
  assert.deepEqual(periksaEntri(contoh({ ...p, penjelasan: "penegas" }), "uji.yaml"), [])
})
test("pustaka butuh rujukan", () => salah({ sumber: "pustaka" }, /rujukan/))
test("terverifikasi butuh dua orang berbeda", () => {
  salah({ status: "terverifikasi", verifikasi: [dua[0], dua[0]] }, /dua penutur/)
  assert.deepEqual(periksaEntri(contoh({ status: "terverifikasi", verifikasi: dua }), "uji.yaml"), [])
})
test("duplikat dan YAML rusak dilaporkan", () => {
  const d = mkdtempSync(join(tmpdir(), "kamus-"))
  for (const id of ["satu", "dua"]) writeFileSync(join(d, `${id}.yaml`), JSON.stringify(contoh({ id })))
  writeFileSync(join(d, "rusak.yaml"), "a: [")
  const { masalah } = bacaKamus(d)
  assert.match(masalah.join("\n"), /duplikat/)
  assert.match(masalah.join("\n"), /rusak\.yaml: YAML/)
})
test("hanya entri terverifikasi yang dibangun", () => {
  const k = susun([contoh(), contoh({ id: "ok", status: "terverifikasi", verifikasi: dua })])
  assert.deepEqual(k.entri.map((e) => e.id), ["ok"])
  assert.equal(k.entri[0].verifikasi, undefined)
})
test("pencarian: persis lebih dulu, diakritik diabaikan, arah dibatasi", () => {
  const k = { entri: [contoh({ id: "a", indonesia: ["artiuji besar"] }), contoh({ id: "b", indonesia: ["artiuji"] })] }
  assert.deepEqual(cari(k, "ARTIUJÍ").map((e) => e.id), ["b", "a"])
  assert.equal(cari(k, "artiuji", { arah: "pekalongan" }).length, 0)
  assert.equal(cari(k, "xyzuji", { arah: "pekalongan" }).length, 2)
  assert.equal(cari(k, "").length, 0)
})
