# Cara Berkontribusi

Tidak paham Git? Buka **Issues → New issue → Usul kata**, lalu isi formnya. Pengelola yang membuatkan berkasnya.

Paham Git? Salin kerangka ini ke `entri/<id>.yaml`, lalu buka Pull Request. `id` sebaiknya kata Indonesia-nya, ditambah angka atau keterangan bila sudah dipakai.

```yaml
id: ganti-ini
jenis: kata              # kata | partikel | ungkapan
indonesia: ["..."]       # untuk partikel boleh tidak ada
penjelasan: "..."        # wajib untuk partikel
jawa:                    # wajib untuk kata
  ngoko: ["..."]
  krama: ["..."]         # opsional
pekalongan:
  - kata: "..."
    variasi: ["..."]     # opsional: ejaan lain
    lafal: "..."         # opsional
    wilayah: [kota-pekalongan]  # kabupaten-pekalongan | batang | pemalang
    ragam: netral        # netral | akrab | kasar
    catatan: "..."       # opsional
contoh:                  # opsional
  - pekalongan: "..."
    indonesia: "..."
status: usulan
sumber: penutur          # penutur | pustaka
rujukan: "..."           # wajib bila pustaka
```

## Aturan

- Kata Pekalongan harus dari penutur asli atau pustaka yang disebut. Jangan memakai keluaran AI.
- Satu entri untuk satu makna. Beda wilayah dengan makna sama masuk satu entri, sebagai isi `pekalongan` yang terpisah.
- Kata kasar boleh masuk dengan `ragam: kasar`. Kata yang menyerang kelompok tertentu tidak diterima.
- Jangan menyalin isi kamus lain kecuali lisensinya mengizinkan.
- Jangan menulis data pribadi.

## Verifikasi

Entri baru berstatus `usulan`. Setelah dua penutur asli, idealnya dari wilayah berbeda, menyetujuinya di PR, pengelola menambahkan:

```yaml
status: terverifikasi
verifikasi:
  - oleh: nama-satu      # nama pengguna GitHub atau samaran
    wilayah: kota-pekalongan
  - oleh: nama-dua
    wilayah: kabupaten-pekalongan
inti: true               # opsional: kata dasar yang selalu dibawa bot
```
