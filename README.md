# Kamus Pekalongan

Kamus terbuka **bahasa Indonesia, Jawa umum, dan Jawa dialek Pekalongan**, dikelola komunitas WFC Pekalongan. Cakupan utamanya Kota dan Kabupaten Pekalongan. Batang dan Pemalang ditandai lewat label wilayah.

> Kamus masih tahap awal dan belum berisi kata. Yuk bantu isi: lihat [cara berkontribusi](CONTRIBUTING.md) dan [100 kata pertama](daftar-target.md).

## Isi repo

| Tempat | Isi |
| --- | --- |
| `entri/` | Satu berkas YAML untuk satu makna |
| `skrip/` | Pemeriksa dan pembangun data |
| `skill/kamus-pekalongan/` | Skill Claude |

## Memakai data

Setiap perubahan di `main` memperbarui rilis [`terbaru`](https://github.com/WFC-PKL/kamus-pekalongan/releases/tag/terbaru): `kamus.json` dan `skill-kamus-pekalongan.zip`. Hanya entri `terverifikasi` yang masuk.

Membangun sendiri (Node 22 ke atas):

    npm ci
    npm run periksa
    npm test
    npm run bangun

## Lisensi

Data kamus (`entri/` dan hasil bangunannya): [CC BY-SA 4.0](LICENSE-DATA). Kode: [MIT](LICENSE).
