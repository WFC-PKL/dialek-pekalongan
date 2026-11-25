# Dialek Pekalongan

**Kamus terbuka dialek Jawa Pekalongan**, dengan padanan bahasa Indonesia dan Jawa umum. Dikelola komunitas WFC Pekalongan. Cakupan utamanya Kota dan Kabupaten Pekalongan. Batang dan Pemalang ditandai lewat label wilayah.

Yang dikumpulkan adalah kata yang bentuk, makna, atau lafalnya **berbeda dari Jawa umum**, serta partikel dan ungkapan khas. Kata yang sama persis dengan Jawa umum tidak dimasukkan.

> Kamus masih tahap awal dan belum berisi kata. Yuk bantu isi: lihat [cara berkontribusi](CONTRIBUTING.md) dan [100 makna pemancing](daftar-target.md).

## Isi repo

| Tempat | Isi |
| --- | --- |
| `entri/` | Satu berkas YAML untuk satu makna |
| `skrip/` | Pemeriksa dan pembangun data |
| `skill/dialek-pekalongan/` | Skill Claude |

## Memakai data

Setiap perubahan di `main` memperbarui rilis [`terbaru`](https://github.com/WFC-PKL/dialek-pekalongan/releases/tag/terbaru): `dialek.json` dan `skill-dialek-pekalongan.zip`. Hanya entri `terverifikasi` yang masuk.

Membangun sendiri (Node 22 ke atas):

    npm ci
    npm run periksa
    npm test
    npm run bangun

## Lisensi

Data kamus (`entri/` dan hasil bangunannya): [CC BY-SA 4.0](LICENSE-DATA). Kode: [MIT](LICENSE).
