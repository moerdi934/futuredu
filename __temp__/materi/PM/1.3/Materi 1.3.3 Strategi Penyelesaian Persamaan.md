  # SECTION 1: Aljabar - Topic 1.3: Aljabar


  ## Materi 1.3.3: Strategi Penyelesaian Persamaan

  ### The Art of Solving: Bukan Cuma Hitung, tapi Strategi! ⚔️

  Oke, sekarang kamu udah bisa bikin persamaan dari soal cerita. But here's the thing: **cara kamu solve itu sama pentingnya dengan persamaan itu sendiri**. 

  Di SNBT, waktu adalah segalanya. Ada soal yang kalau kamu pakai cara "textbook", bisa 3-5 menit. Tapi kalau kamu tahu trik dan pattern recognition, bisa 30 detik!

  This section will show you the **difference between a calculator and a strategist**.

  ### Anatomy of an Equation: Kenali Jenisnya Dulu!

  Sebelum solve, kamu harus tahu "musuh" yang kamu hadapi:

  #### **Tipe 1: Persamaan Linear Satu Variabel**

  Format: ax + b = c

  Contoh: 3x + 5 = 14

  **Strategi:** Isolasi variabel
  ```
  3x + 5 = 14
  3x = 14 - 5
  3x = 9
  x = 3
  ```

  **Tingkat Kesulitan:** ⭐☆☆☆☆ (mudah)
  **Waktu Target:** 10-15 detik

  #### **Tipe 2: Persamaan Kuadrat**

  Format: ax² + bx + c = 0

  Contoh: x² - 5x + 6 = 0

  **Strategi:** Faktorisasi (kalau bisa), rumus ABC (kalau nggak)

  **Tingkat Kesulitan:** ⭐⭐⭐☆☆ (sedang)
  **Waktu Target:** 30-60 detik

  #### **Tipe 3: Sistem Persamaan Linear (SPLDV)**

  Format: 
  ```
  ax + by = c
  dx + ey = f
  ```

  **Strategi:** Eliminasi, substitusi, atau kombinasi

  **Tingkat Kesulitan:** ⭐⭐⭐☆☆ (sedang)
  **Waktu Target:** 45-90 detik

  #### **Tipe 4: Persamaan Pecahan/Rasional**

  Format: (ax + b)/(cx + d) = e

  Contoh: (2x + 3)/(x - 1) = 5

  **Strategi:** Cross-multiply, lalu solve linear/kuadrat

  **Tingkat Kesulitan:** ⭐⭐⭐⭐☆ (lumayan challenging)
  **Waktu Target:** 60-120 detik

  #### **Tipe 5: Persamaan dengan Akar**

  Format: √(ax + b) = c

  Contoh: √(2x + 1) = 5

  **Strategi:** Kuadratkan kedua ruas, cek solusi

  **Tingkat Kesulitan:** ⭐⭐⭐⭐☆ 
  **Waktu Target:** 60-90 detik

  #### **Tipe 6: Persamaan Eksponen/Logaritma**

  Format: a^x = b atau log_a(x) = b

  **Strategi:** Samakan basis atau convert bentuk

  **Tingkat Kesulitan:** ⭐⭐⭐⭐⭐ (hard)
  **Waktu Target:** 90-180 detik

  ### Pattern Recognition: Lihat Dulu, Baru Hitung

  Ini adalah **skill paling penting** yang membedakan solver biasa dengan solver expert.

  #### **Pattern 1: Ada Faktor Persekutuan? Factor Out!**

  **Soal:** Tentukan x dari 37x + 37(5) = 37(12)

  **Cara Biasa:**
  ```
  37x + 185 = 444
  37x = 259
  x = 7
  ```

  **Cara Smart:**
  ```
  37x + 37(5) = 37(12)
  37(x + 5) = 37(12)   ← factor out 37
  x + 5 = 12           ← bagi kedua ruas dengan 37
  x = 7
  ```

  Hemat 2 langkah!

  #### **Pattern 2: Substitusi Cerdas untuk Bentuk Kompleks**

  **Soal:** (x² + 2x)² - 11(x² + 2x) + 24 = 0

  **Cara Biasa:** Ekspansi semua → Dapet persamaan derajat 4 → Ribet!

  **Cara Smart:** Misal u = x² + 2x
  ```
  u² - 11u + 24 = 0
  (u - 3)(u - 8) = 0
  u = 3 atau u = 8
  ```

  Lalu substitusi balik:
  - x² + 2x = 3 → x² + 2x - 3 = 0 → (x+3)(x-1) = 0 → x = -3 atau 1
  - x² + 2x = 8 → x² + 2x - 8 = 0 → (x+4)(x-2) = 0 → x = -4 atau 2

  Jadi ada 4 solusi: x = -4, -3, 1, atau 2

  **💡 INSIGHT:** Kalau ada ekspresi yang muncul berulang (kayak x² + 2x di sini), itu kandidat untuk substitusi!

  #### **Pattern 3: Identitas Aljabar = Shortcut**

  **Soal:** Jika x + y = 10 dan x² + y² = 58, berapakah xy?

  **Cara Biasa:** Cari x dan y satu-satu → Lama!

  **Cara Smart:** Pakai identitas (x + y)² = x² + 2xy + y²
  ```
  (10)² = 58 + 2xy
  100 = 58 + 2xy
  42 = 2xy
  xy = 21
  ```

  Done! Nggak perlu tahu nilai x atau y!

  **🎯 TRIK EMAS:** Kalau soal kasih sum dan sum of squares, hampir pasti ada cara langsung pakai identitas. Jangan langsung cari nilai individual!

  ### Metode Eliminasi: Menghilangkan yang Nggak Perlu

  Eliminasi = menghilangkan satu variabel dengan menjumlah/mengurangkan dua persamaan.

  **Kapan pakai:** Kalau koefisien salah satu variabel udah sama (atau bisa dibuat sama dengan perkalian sederhana).

  **Contoh:**

  Sistem:
  ```
  2x + 3y = 13  ... (1)
  3x - 3y = 2   ... (2)
  ```

  **Lihat:** Koefisien y udah sama (3 dan -3), tapi beda tanda. Perfect untuk eliminasi dengan PENJUMLAHAN!

  ```
    2x + 3y = 13
  + 3x - 3y = 2
  ─────────────
    5x      = 15
    x       = 3
  ```

  Substitusi x = 3 ke persamaan (1):
  ```
  2(3) + 3y = 13
  6 + 3y = 13
  3y = 7
  y = 7/3
  ```

  **🎯 TIPS ELIMINASI:**
  1. Pilih variabel yang koefisiennya paling mudah disamakan
  2. Kalau tandanya sama, KURANGI. Kalau beda, JUMLAHKAN.
  3. Setelah dapat satu variabel, langsung substitusi ke persamaan PALING SEDERHANA

  ### Metode Substitusi: Express dan Replace

  Substitusi = nyatakan satu variabel dalam bentuk variabel lain, terus ganti.

  **Kapan pakai:** Kalau salah satu persamaan udah "siap" untuk di-express (koefisiennya 1 atau bentuknya sederhana).

  **Contoh:**

  ```
  y = 2x + 1    ... (1)
  3x + 2y = 16  ... (2)
  ```

  Persamaan (1) udah express y dalam x. Tinggal substitusi ke (2):

  ```
  3x + 2(2x + 1) = 16
  3x + 4x + 2 = 16
  7x = 14
  x = 2
  ```

  Lalu: y = 2(2) + 1 = 5

  **🎯 KAPAN SUBSTITUSI LEBIH BAIK DARI ELIMINASI?**
  - Kalau salah satu persamaan koefisiennya 1 (udah "sendirian")
  - Kalau eliminasi butuh multiply dengan angka besar/ribet
  - Kalau kamu udah lihat shortcut dari bentuk persamaan

  ### Metode Kombinasi: Best of Both Worlds

  Kadang, kombinasi eliminasi-substitusi adalah cara tercepat.

  **Contoh:**

  ```
  2x + 3y = 12  ... (1)
  4x - y = 5    ... (2)
  ```

  **Strategi:** Eliminasi salah satu variabel yang gampang, terus substitusi.

  Dari (2): y = 4x - 5

  Substitusi ke (1):
  ```
  2x + 3(4x - 5) = 12
  2x + 12x - 15 = 12
  14x = 27
  x = 27/14
  ```

  Hmm, pecahan. Coba cara lain?

  **Alternatif:** Eliminasi y dengan multiply (2) dengan 3:

  ```
    2x + 3y = 12    → 2x + 3y = 12
  3(4x - y = 5)     → 12x - 3y = 15
  ─────────────────────────────────
                      14x = 27
                      x = 27/14
  ```

  Same result, tapi mungkin lebih jelas step-nya.

  **💡 LESSON:** Nggak ada "cara yang selalu benar". Pilih yang paling efisien untuk situasi spesifik!

  ### Cross-Multiplication: Senjata untuk Persamaan Rasional

  Kalau ada persamaan dengan pecahan, cross-multiply adalah teman terbaik kamu.

  **Contoh:**

  ```
  (2x + 1)/(x - 3) = 5
  ```

  **Cross-multiply:**
  ```
  2x + 1 = 5(x - 3)
  2x + 1 = 5x - 15
  1 + 15 = 5x - 2x
  16 = 3x
  x = 16/3
  ```

  **🚨 JANGAN LUPA:** Setelah dapat solusi, CEK apakah nilai itu membuat penyebut = 0!

  Misal kalau dapat x = 3, itu BUKAN solusi valid karena penyebut jadi 0.

  ### Kuadratkan dengan Hati-hati: Persamaan Akar

  **Contoh:**

  ```
  √(3x + 1) = x - 1
  ```

  **Kuadratkan kedua ruas:**
  ```
  3x + 1 = (x - 1)²
  3x + 1 = x² - 2x + 1
  0 = x² - 5x
  0 = x(x - 5)
  x = 0 atau x = 5
  ```

  **TAPI TUNGGU!** Harus cek kedua solusi:

  **x = 0:**
  √(3(0) + 1) = 0 - 1
  √1 = -1
  1 = -1 ❌ (salah!)

  **x = 5:**
  √(3(5) + 1) = 5 - 1
  √16 = 4
  4 = 4 ✓ (benar!)

  Jadi cuma x = 5 yang valid.

  **🎯 MENGAPA INI TERJADI?**

  Karena saat kamu kuadratkan, kamu "menghilangkan" informasi tentang tanda. Persamaan a = b dan a = -b akan sama-sama jadi a² = b² setelah dikuadratkan.

  **RULE:** Setiap kali kuadratkan persamaan, WAJIB cek solusi di persamaan asli!

  ### Sistem Persamaan Non-Linear: Kombinasi Strategi

  **Contoh:**

  ```
  x + y = 7      ... (1)
  xy = 12        ... (2)
  ```

  Ini adalah **sistem campuran**: linear dan non-linear.

  **Strategi:** Substitusi dari (1) ke (2):

  Dari (1): y = 7 - x

  Substitusi ke (2):
  ```
  x(7 - x) = 12
  7x - x² = 12
  x² - 7x + 12 = 0
  (x - 3)(x - 4) = 0
  x = 3 atau x = 4
  ```

  Kalau x = 3 → y = 4
  Kalau x = 4 → y = 3

  Jadi ada dua pasangan solusi: (3, 4) atau (4, 3).

  **💡 INSIGHT:** Sistem dengan xy = konstanta sering menghasilkan solusi "kembar" (x dan y tertukar).

  ### Persamaan dengan Parameter: Think Algebraically

  Kadang soal nggak kasih angka konkret, tapi pakai parameter (huruf lain selain variabel utama).

  **Contoh:**

  Tentukan x dalam bentuk a jika: 3x + 2a = 5a - x

  **Jangan panik melihat 'a'!** Treat it like a constant:

  ```
  3x + 2a = 5a - x
  3x + x = 5a - 2a
  4x = 3a
  x = 3a/4
  ```

  **🎯 TIPS:** Kalau ada parameter, group semua terms dengan x di satu sisi, semua terms tanpa x di sisi lain.

  ### Optimasi: Mencari Nilai Maksimum/Minimum

  Kadang soal minta nilai maksimum/minimum dengan batasan tertentu.

  **Contoh:**

  "Jumlah dua bilangan adalah 20. Berapa nilai maksimum dari hasil kali kedua bilangan itu?"

  **Setup:**
  Misal bilangan pertama = x
  Bilangan kedua = 20 - x

  Hasil kali: P = x(20 - x) = 20x - x²

  **Strategi:** Ini persamaan kuadrat! Grafiknya parabola terbuka ke bawah (karena koefisien x² negatif).

  Maksimum terjadi di titik puncak (vertex), yaitu di x = -b/(2a)

  ```
  P = -x² + 20x
  a = -1, b = 20
  x = -20/(2(-1)) = 10
  ```

  Jadi bilangan-bilangannya 10 dan 10, dengan hasil kali maksimum = 100.

  **💡 ALTERNATIVE:** Kalau nggak inget rumus vertex, pakai completing the square:

  ```
  P = -x² + 20x
    = -(x² - 20x)
    = -(x² - 20x + 100 - 100)
    = -(x - 10)² + 100
  ```

  Karena (x - 10)² ≥ 0, maka -(x - 10)² ≤ 0, jadi P ≤ 100.

  Maksimum P = 100 saat (x - 10)² = 0, yaitu x = 10.

  ### Checking Your Answer: Validasi yang Wajib

  Setelah dapat jawaban, JANGAN langsung pindah soal! Check dulu:

  #### **Check 1: Substitusi Balik**

  Masukin jawaban ke persamaan awal. Harusnya kedua ruas sama.

  #### **Check 2: Make Sense?**

  - Umur negatif? Nggak mungkin.
  - Harga negatif? (Kecuali context utang) Nggak masuk akal.
  - Kecepatan unrealistis? Cek lagi.
  - Persentase > 100%? (Kecuali pertumbuhan) Aneh.

  #### **Check 3: Satuan Consistent?**

  Kalau awal pake km, jangan tiba-tiba jadi meter di jawaban (kecuali diminta convert).

  #### **Check 4: Answer the Right Question**

  Soal tanya "berapa harga 2 buku" tapi kamu cuma kasih harga 1 buku. SALAH!

  Selalu baca ULANG pertanyaan sebelum finalize jawaban.

  ### Time Management: Kapan Skip, Kapan Lanjut

  Di SNBT, kadang kamu harus strategis: nggak semua soal harus diselesaikan dengan sempurna.

  **Tier Prioritas:**

  **Tier 1 (Must Answer - 30 sec to 1 min):**
  - Persamaan linear sederhana
  - Substitusi langsung
  - Identitas aljabar yang kamu recognize

  **Tier 2 (Should Answer - 1-2 min):**
  - SPLDV standar
  - Persamaan kuadrat yang bisa difaktorkan
  - Persamaan rasional sederhana

  **Tier 3 (Nice to Have - 2-3 min):**
  - Sistem non-linear
  - Persamaan dengan parameter kompleks
  - Optimasi dengan constraint rumit

  **Tier 4 (Skip if Pressed for Time):**
  - Persamaan derajat tinggi tanpa pattern jelas
  - Sistem dengan 3+ variabel
  - Persamaan trigonometri/logaritma super kompleks

  **🎯 STRATEGY:** Sapu semua Tier 1, baru balik ke Tier 2 dan 3. Jangan застряв di satu soal Tier 4 sampai 5 menit—better dapat 3 soal Tier 1 dengan benar!

  ### Advanced Techniques: For the Extra Edge

  #### **Teknik 1: Vieta's Formulas (Rumus Vieta)**

  Untuk x² + px + q = 0 dengan akar α dan β:
  - α + β = -p
  - αβ = q

  Ini powerful kalau soal nanya "jumlah akar" atau "hasil kali akar" tanpa minta akar individualnya!

  **Contoh:**

  Tanpa solve, tentukan jumlah dan hasil kali akar dari: x² - 7x + 10 = 0

  Jawab:
  - Jumlah akar = -(-7) = 7
  - Hasil kali akar = 10

  Done! Nggak perlu faktorisasi!

  #### **Teknik 2: Discriminant Check**

  Untuk ax² + bx + c = 0, diskriminan D = b² - 4ac

  - D > 0: Dua akar real berbeda
  - D = 0: Satu akar real (kembar)
  - D < 0: Tidak ada akar real

  Ini berguna kalau soal tanya "apakah persamaan ini punya solusi real?"

  #### **Teknik 3: Symmetry Exploitation**

  Kalau persamaan atau sistem punya simetri, exploit it!

  **Contoh:**

  ```
  x + y = 10
  x² + y² = 50
  ```

  Lihat simetrinya? Kamu bisa guess x = y tanpa hitung detail!

  Kalau x = y:
  ```
  2x = 10 → x = 5
  x² + x² = 50 → 2x² = 50 → x² = 25 → x = 5 ✓
  ```

  Match! Jadi x = y = 5.

  ### Error Patterns: Kesalahan yang Sering Terjadi

  #### **Error 1: Sign Mistakes saat Expand**

  ```
  (x - 3)(x + 2) = x² + 2x - 3x - 6 = x² - x - 6 ✓
  ```

  BUKAN:
  ```
  (x - 3)(x + 2) = x² + 2x - 3x + 6 = x² - x + 6 ❌
  ```

  **FIX:** Selalu double-check tanda saat distributif!

  #### **Error 2: Kuadrat Bentuk Beda**

  ```
  (x - 3)² = x² - 6x + 9 ✓
  ```

  BUKAN:
  ```
  (x - 3)² = x² - 9 ❌ ← lupa middle term!
  ```

  **FIX:** Hafal identitas (a ± b)² dengan SEMPURNA.

  #### **Error 3: Division by Variable (Bisa Bikin Lost Solution)**

  Jangan PERNAH bagi kedua ruas dengan variabel kecuali kamu TAHU variabel itu ≠ 0!

  **Contoh:**

  ```
  x² = 3x
  ```

  **SALAH:**
  ```
  x = 3  ← bagi dengan x
  ```
  **BENAR:**
  ```
  x² - 3x = 0
  x(x - 3) = 0
  x = 0 atau x = 3  ← ada dua solusi!
  ```

  **FIX:** Selalu pindahkan semua ke satu ruas, lalu faktorkan.

  #### **Error 4: Lupa Domain Restrictions**

  Untuk √x, harus x ≥ 0
  Untuk 1/x, harus x ≠ 0

  Kalau solusi kamu violate ini, itu BUKAN solusi valid!

  ### Rangkuman Power Points

  ✓ Pattern recognition > brute force calculation
  ✓ Kenali tipe persamaan sebelum solve
  ✓ Pilih metode tercepat (eliminasi vs substitusi vs kombinasi)
  ✓ Identitas aljabar = shortcut powerful
  ✓ Substitusi cerdas untuk bentuk berulang
  ✓ SELALU cek solusi setelah kuadratkan persamaan
  ✓ Validasi: substitusi balik, make sense, satuan, jawab pertanyaan yang benar
  ✓ Time management: prioritas soal by difficulty
  ✓ Watch out for sign errors, lost solutions, domain restrictions

  ---

