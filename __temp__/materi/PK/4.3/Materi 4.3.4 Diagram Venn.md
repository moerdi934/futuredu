# SECTION 4: Statistika dan Peluang
## Topic 4.3: Himpunan

---


### Materi 4.3.4: Diagram Venn

#### Apa Itu Diagram Venn?

**Diagram Venn** adalah representasi visual dari himpunan menggunakan lingkaran (atau bentuk tertutup lainnya) dalam sebuah persegi panjang yang merepresentasikan himpunan semesta.

Bayangin kayak kamu lagi lihat peta wilayah: ada area A, area B, area yang overlap (tumpang tindih), dan area di luar semuanya.

**Kenapa Penting?**
- Mempermudah visualisasi operasi himpunan
- Membantu menyelesaikan soal yang kompleks
- Soal SNBT SERING banget kasih diagram Venn!

#### Komponen Diagram Venn

**1. Persegi Panjang = Himpunan Semesta (S)**
- Ini batas "jagat raya" kita

**2. Lingkaran = Himpunan**
- Setiap himpunan digambar sebagai lingkaran
- Bisa overlap (tumpang tindih) atau tidak

**3. Daerah dalam Lingkaran = Anggota Himpunan**
- Titik atau angka dalam lingkaran = anggota himpunan tersebut

**4. Daerah di Luar Lingkaran tapi di Dalam Persegi = Komplemen**

#### Diagram Venn Satu Himpunan

Paling sederhana: cuma ada 1 himpunan A.

```
┌─────────────────────┐
│  S                  │
│     ┌─────────┐     │
│     │    A    │     │
│     │         │     │
│     └─────────┘     │
│                     │
│        A'           │
└─────────────────────┘
```

**Daerah-daerah:**
- Dalam lingkaran A = anggota A
- Di luar lingkaran A (tapi dalam persegi) = A' (komplemen A)

**Contoh:**
S = {1, 2, 3, 4, 5, 6, 7, 8}
A = {2, 4, 6, 8}

Diagram:
- Dalam A: 2, 4, 6, 8
- Di luar A (A'): 1, 3, 5, 7

#### Diagram Venn Dua Himpunan

Ini yang paling sering keluar di SNBT!

```
┌────────────────────────────┐
│  S                         │
│    ┌──────┐    ┌──────┐    │
│    │  A   │    │   B  │    │
│    │      │    │      │    │
│    │   ┌──┴────┴──┐   │    │
│    │   │  A ∩ B  │   │    │
│    └───┴─────────┴───┘    │
│                            │
│         (A ∪ B)'           │
└────────────────────────────┘
```

**Daerah-daerah Penting:**

1. **A saja** (A - B)
   - Yang di A tapi nggak di B

2. **B saja** (B - A)
   - Yang di B tapi nggak di A

3. **A ∩ B** (irisan)
   - Yang di A DAN di B (daerah overlap)

4. **A ∪ B** (gabungan)
   - Semua yang di A atau B (termasuk irisan)

5. **(A ∪ B)'** (komplemen gabungan)
   - Yang di luar A dan B

**Contoh:**
S = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10}
A = {1, 2, 3, 4, 5}
B = {4, 5, 6, 7, 8}

Breakdown:
- A saja (A - B): {1, 2, 3}
- A ∩ B: {4, 5}
- B saja (B - A): {6, 7, 8}
- (A ∪ B)': {9, 10}

#### Diagram Venn Tiga Himpunan

Nah, ini levelnya naik! Tiga himpunan = lebih banyak daerah = lebih kompleks.

```
┌──────────────────────────────────┐
│  S                               │
│       ┌─────────────┐             │
│       │      A      │             │
│       │   ┌─────────┼────────┐    │
│       │   │    ┌────┼────┐   │    │
│       └───┼────┤  X │    ├───┘    │
│           │    └────┼────┘        │
│           │    B    │      C      │
│           └─────────┴────────┘    │
│                                   │
└──────────────────────────────────┘

X = A ∩ B ∩ C (irisan ketiga-tiganya)
```

**8 Daerah dalam Diagram Venn 3 Himpunan:**

1. **A saja**: (A - B - C)
2. **B saja**: (B - A - C)
3. **C saja**: (C - A - B)
4. **A ∩ B (tapi bukan C)**: (A ∩ B) - C
5. **A ∩ C (tapi bukan B)**: (A ∩ C) - B
6. **B ∩ C (tapi bukan A)**: (B ∩ C) - A
7. **A ∩ B ∩ C**: Irisan ketiganya
8. **(A ∪ B ∪ C)'**: Di luar semua himpunan

**Tips SNBT:** Untuk 3 himpunan, selalu gambar diagram dulu! Kalau langsung ngitung tanpa diagram, gampang banget salah.

#### Menentukan Kardinalitas dengan Diagram Venn

Ini skill WAJIB buat SNBT! Soal tipe ini hampir selalu keluar.

**Rumus untuk 2 Himpunan:**

**n(A ∪ B) = n(A) + n(B) - n(A ∩ B)**

Kenapa kurangi n(A ∩ B)? Karena kalau cuma dijumlahin, irisan ke-itung 2 kali!

**Contoh:**
- n(A) = 20
- n(B) = 15
- n(A ∩ B) = 5
- n(A ∪ B) = 20 + 15 - 5 = 30

**Variasi Rumus:**
- **n(A - B) = n(A) - n(A ∩ B)**
  - Yang di A aja = semua A dikurangi yang irisan

- **n(B - A) = n(B) - n(A ∩ B)**

- **n(A ∪ B)' = n(S) - n(A ∪ B)**
  - Yang di luar = semesta dikurangi gabungan

**Rumus untuk 3 Himpunan:**

**n(A ∪ B ∪ C) = n(A) + n(B) + n(C) - n(A ∩ B) - n(A ∩ C) - n(B ∩ C) + n(A ∩ B ∩ C)**

Rumus ini **WAJIB HAPAL**! Sering banget keluar di SNBT!

**Logikanya:**
1. Jumlahkan semua: n(A) + n(B) + n(C)
2. Kurangi irisan 2-2: - n(A ∩ B) - n(A ∩ C) - n(B ∩ C)
   - Kenapa? Karena udah ke-itung 2 kali di step 1
3. Tambahkan irisan ketiganya: + n(A ∩ B ∩ C)
   - Kenapa? Karena di step 2 kita ngurangin 3 kali, padahal seharusnya cuma sekali

**Contoh:**
- n(A) = 30
- n(B) = 25
- n(C) = 20
- n(A ∩ B) = 10
- n(A ∩ C) = 8
- n(B ∩ C) = 7
- n(A ∩ B ∩ C) = 3

n(A ∪ B ∪ C) = 30 + 25 + 20 - 10 - 8 - 7 + 3 = **53**

#### Daerah yang Diarsir

Soal SNBT suka banget kasih diagram Venn terus suruh cari "daerah yang diarsir".

**Tipe-tipe Arsiran yang Sering Keluar:**

**1. A ∩ B (irisan)**
- Daerah overlap A dan B

**2. A ∪ B (gabungan)**
- Semua yang ada di A atau B

**3. A - B (selisih)**
- Yang di A tapi nggak di B (A aja, nggak termasuk irisan)

**4. (A ∪ B)' (komplemen gabungan)**
- Yang di luar A dan di luar B

**5. A ∩ B' (irisan A dengan komplemen B)**
- Yang di A tapi nggak di B = sama dengan A - B

**6. (A ∩ B)' (komplemen irisan)**
- Yang BUKAN di irisan
- = A' ∪ B' (Hukum De Morgan!)

**Strategi Mengerjakan:**

1. **Identifikasi operasi**
   - Lihat simbol: ∩, ∪, ', -

2. **Kerjakan dari dalam ke luar**
   - Kalau ada kurung, kerjakan yang di dalam kurung dulu

3. **Arsir bertahap**
   - Arsir A dulu (misal garis horizontal)
   - Arsir B (misal garis vertikal)
   - Yang kena dua-duanya = irisan
   - Yang kena salah satu = gabungan

**Contoh Soal Tipe SNBT:**

"Daerah yang diarsir pada diagram Venn menyatakan..."

*[Diagram menunjukkan: daerah di A yang tidak overlap dengan B diarsir]*

Jawaban: **A - B** atau **A ∩ B'**

#### Mengisi Diagram Venn dari Soal Cerita

Ini skill yang HARUS dikuasai! Soal cerita → ubah ke diagram Venn.

**Langkah-langkah:**

**Step 1: Identifikasi himpunan semesta dan himpunan-himpunannya**
**Step 2: Tentukan irisan (overlap) terlebih dahulu**
**Step 3: Hitung "hanya A", "hanya B", dll**
**Step 4: Hitung yang di luar semua himpunan**

**Contoh Soal:**

Dalam sebuah kelas berisi 40 siswa:
- 25 siswa suka matematika (M)
- 20 siswa suka fisika (F)
- 8 siswa suka keduanya
- Berapa siswa yang tidak suka keduanya?

**Penyelesaian:**

S = 40 (total siswa)
n(M) = 25
n(F) = 20
n(M ∩ F) = 8

**Gambar diagram:**
- M ∩ F = 8 (tengah)
- M saja = 25 - 8 = 17
- F saja = 20 - 8 = 12
- Total yang suka salah satu/keduanya = 17 + 8 + 12 = 37
- Yang nggak suka keduanya = 40 - 37 = **3**

#### Tips & Trik SNBT untuk Diagram Venn

**1. Selalu Mulai dari Irisan Terkecil**
- Untuk 2 himpunan: mulai dari A ∩ B
- Untuk 3 himpunan: mulai dari A ∩ B ∩ C (tengah banget)

**2. Hafalkan Rumus Kardinalitas**
- 2 himpunan: n(A ∪ B) = n(A) + n(B) - n(A ∩ B)
- 3 himpunan: pake rumus panjang yang udah dijelasin di atas

**3. Cek dengan Total**
- Jumlahkan semua daerah, harus sama dengan n(S)
- Kalau beda, pasti ada yang salah!

**4. Diagram Venn itu Alat Bantu, Bukan Tujuan**
- Kalau soalnya simpel, langsung pakai rumus aja
- Tapi kalau kompleks, gambar diagram dulu baru ngitung

**5. Perhatikan Kata Kunci**
- "Hanya A" = A - B (bukan A secara keseluruhan!)
- "Paling sedikit A" = A ∪ B ∪ C (yang suka A atau lebih)
- "Keduanya" = A ∩ B
- "Tidak keduanya" = (A ∩ B)'

**6. Latihan Soal Tipe Survei**
- Ini tipe soal FAVORIT SNBT!
- Biasanya: "40 orang ditanya soal 3 produk, berapa yang suka ketiga-tiganya?"

**7. Jangan Lupa Himpunan Kosong**
- Kadang ada soal: "Tidak ada yang suka keduanya"
- Artinya A ∩ B = ∅ → n(A ∩ B) = 0

---
