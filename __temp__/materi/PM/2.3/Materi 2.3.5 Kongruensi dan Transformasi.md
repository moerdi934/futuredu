# SECTION 2: Geometri Spasial
## Topic 2.3: Transformasi Geometri

---


## Materi 2.3.5: Kongruensi dan Transformasi

### Transformasi yang Mempertahankan Kongruensi

**Apa Itu Kongruensi?**

Kongruensi artinya dua bangun punya **bentuk dan ukuran yang sama persis**. Bayangin kayak dua koin Rp500 – mereka kongruen karena identik dalam segala hal.

**Syarat Kongruen:**
- ✓ Semua sisi corresponding sama panjang
- ✓ Semua sudut corresponding sama besar
- ✓ Bentuk identical
- ✓ Ukuran identical

**Yang TIDAK harus sama:**
- ✗ Posisi (boleh beda tempat)
- ✗ Orientasi (boleh diputar)
- ✗ Direction (boleh di-flip)

**Notasi Kongruensi:**

△ABC ≅ △DEF

Artinya segitiga ABC kongruen dengan segitiga DEF, dengan:
- AB = DE
- BC = EF
- AC = DF
- ∠A = ∠D
- ∠B = ∠E
- ∠C = ∠F

### Isometri: Transformasi yang Preserve Kongruensi

**Apa Itu Isometri?**

Isometri adalah transformasi yang **mempertahankan jarak**. Makanya disebut "iso-metri" (equal-measure). Kalau ditransformasi pakai isometri, objek tetap kongruen dengan aslinya!

**Ada 3 Jenis Isometri Utama:**

**1. Translation (Geser/Translasi)**
- Memindahkan objek tanpa merotasi atau flip
- Semua titik bergerak sejajar dengan arah dan jarak yang sama
- **Preserves:** ukuran, bentuk, orientasi
- **Changes:** posisi

**Contoh Bacaan:**

Segitiga ABC digeser 3 cm ke kanan dan 2 cm ke atas:
- Bentuk tetap sama ✓
- Ukuran tetap sama ✓
- Orientasi tetap sama ✓
- Posisi berubah ✓
- Hasil: kongruen dengan aslinya ✓

**2. Rotation (Putar/Rotasi)**
- Memutar objek pada titik pusat dengan sudut tertentu
- Jarak setiap titik ke pusat rotasi tetap sama
- **Preserves:** ukuran, bentuk
- **Changes:** posisi, orientasi

**Contoh Bacaan:**

Persegi dirotasi 90° dengan pusat di tengahnya:
- Bentuk tetap persegi ✓
- Ukuran sisi tetap sama ✓
- Orientasi berubah (rotated) ✓
- Posisi relatif vertex berubah ✓
- Hasil: kongruen dengan aslinya ✓

**3. Reflection (Cermin/Refleksi)**
- Membalik objek terhadap garis cermin
- Jarak titik ke mirror line = jarak bayangan ke mirror line
- **Preserves:** ukuran, bentuk
- **Changes:** posisi, orientation (mirrored)

**Contoh Bacaan:**

Huruf "b" di-refleksi terhadap garis vertikal:
- Bentuk tetap sama (huruf dengan tangkai dan bulatan) ✓
- Ukuran tetap sama ✓
- Orientasi terbalik (jadi "d") ✓
- Hasil: kongruen dengan aslinya ✓

**Properties of Isometri:**

| Property | Translation | Rotation | Reflection |
|----------|-------------|----------|------------|
| Preserves distance | ✓ | ✓ | ✓ |
| Preserves angle | ✓ | ✓ | ✓ |
| Preserves area | ✓ | ✓ | ✓ |
| Preserves orientation | ✓ | ✓ | ✗ |
| Preserves collinearity | ✓ | ✓ | ✓ |
| Preserves parallelism | ✓ | ✓ | ✓ |

**Orientation:**
- Translation dan Rotation = **direct isometry** (orientation preserved)
- Reflection = **opposite isometry** (orientation reversed)

### Non-Isometri: Transformasi yang TIDAK Preserve Kongruensi

**Transformasi yang Mengubah Ukuran:**

**1. Dilation (Dilatasi/Perbesaran-Pengecilan)**
- Mengubah ukuran objek dengan faktor skala tertentu
- Bentuk tetap sama (similar), tapi ukuran berubah
- **Preserves:** bentuk, sudut
- **Changes:** ukuran, area
- **Result:** similar, NOT congruent

**Contoh Bacaan:**

Segitiga dengan sisi 3-4-5 didilatasi dengan faktor 2:
- Sisi jadi 6-8-10
- Bentuk tetap segitiga siku-siku ✓
- Sudut-sudut tetap sama ✓
- Ukuran berubah (2x lipat) ✗
- Area berubah (4x lipat) ✗
- Hasil: similar tapi NOT congruen ✗

**2. Shear (Geser Sejajar)**
- "Mendorong" satu sisi objek parallel
- Kayak tumpukan kartu yang di-slide
- **Preserves:** area (surprisingly!)
- **Changes:** bentuk, sudut
- **Result:** NOT congruen

**Contoh Bacaan:**

Persegi di-shear horizontal:
- Jadi jajargenjang
- Tinggi tetap sama
- Alas tetap sama
- Area tetap (alas × tinggi) ✓
- Sudut berubah (bukan 90° lagi) ✗
- Bentuk berubah ✗
- Hasil: NOT kongruen ✗

**Kenapa Harus Tahu Ini?**

Di soal SNBT, sering ditanya:
- "Transformasi mana yang menghasilkan bangun kongruen?"
- "Setelah transformasi X, apakah bangun tetap kongruen?"

Jawabnya: **Cuma isometri yang preserve kongruensi!**

### Menentukan Jenis Transformasi

**Given: Objek Original dan Hasil Transformasi**

**Step-by-Step Identification:**

**Step 1: Check Ukuran**
- Ukuran sama? → bisa isometri
- Ukuran beda? → definitely dilation atau non-isometri lain

**Step 2: Check Orientasi**
- Orientasi sama? → translation atau rotation
- Orientasi terbalik? → reflection atau kombinasi

**Step 3: Check Posisi**
- Posisi parallel shift? → translation
- Posisi rotated? → rotation
- Posisi mirrored? → reflection

**Step 4: Verify**
- Check beberapa titik key
- Ensure consistent transformation

**Contoh Bacaan:**

Dua segitiga ABC dan A'B'C':
- Semua sisi sama panjang ✓
- Segitiga A'B'C' keliatan "terbalik"

**Analysis:**
1. Ukuran sama → isometri
2. Orientasi terbalik → likely reflection
3. Find mirror line: garis tegak lurus di tengah AA', BB', CC'
4. Verify: jarak A ke mirror line = jarak A' ke mirror line
5. **Conclusion:** Reflection!

**Tips Cepat:**

- **Translation:** Objek "geser" tanpa rotasi/flip
- **Rotation:** Objek "putar", semua titik rotasi around same center
- **Reflection:** Objek "flip", ada mirror line
- **Dilation:** Objek membesar/mengecil dari titik pusat

### Komposisi Transformasi

**Apa Itu Komposisi?**

Komposisi transformasi adalah melakukan dua atau lebih transformasi secara berturut-turut. Output transformasi pertama jadi input transformasi kedua.

**Notasi:**

T₂ ∘ T₁ = "T₁ dulu, baru T₂"

(Dibaca dari kanan ke kiri!)

**Contoh Bacaan:**

Reflection ∘ Rotation:
1. Rotasi dulu
2. Hasil rotasi di-refleksi

**Important Properties:**

**1. Komposisi Dua Translation = Translation**
- Geser 3 cm ke kanan, terus geser 2 cm ke kanan
- Hasil: geser 5 cm ke kanan
- Vector addition!

**2. Komposisi Dua Rotation (Same Center) = Rotation**
- Rotasi 30° CCW, terus rotasi 45° CCW
- Hasil: rotasi 75° CCW
- Angle addition!

**3. Komposisi Dua Reflection (Parallel Lines) = Translation**
- Refleksi terhadap garis A, terus garis B (parallel)
- Hasil: translasi tegak lurus kedua garis
- Distance = 2× (jarak antara kedua garis)

**4. Komposisi Dua Reflection (Intersecting Lines) = Rotation**
- Refleksi terhadap garis A, terus garis B (intersect)
- Hasil: rotasi di titik intersection
- Angle = 2× (sudut antara kedua garis)

**Contoh Bacaan:**

Dua mirror lines membentuk sudut 30°:
- Refleksi terhadap mirror 1
- Refleksi terhadap mirror 2
- **Result:** Rotasi 60° (2 × 30°) di titik intersection!

**Order Matters!**

**Counterexample:**
- Rotation → Reflection ≠ Reflection → Rotation

Mari buktikan:

**Case 1:** Rotasi 90° CW, terus refleksi horizontal
- Titik (1, 0) → rotasi → (0, -1) → refleksi → (0, 1)

**Case 2:** Refleksi horizontal, terus rotasi 90° CW
- Titik (1, 0) → refleksi → (1, 0) → rotasi → (0, -1)

Hasil beda! Order matters! 🎯

**Exception:**

Translation dan Translation bisa di-swap:
- Geser kanan → Geser atas = Geser atas → Geser kanan

Karena vector addition commutative!

### Isometri dan Matriks Transformasi (Bonus!)

**For Advanced Learners:**

Transformasi bisa direpresentasikan dengan matriks. Ini powerful banget karena komposisi transformasi = perkalian matriks!

**Reflection terhadap x-axis:**
```
[1   0]
[0  -1]
```

**Reflection terhadap y-axis:**
```
[-1  0]
[0   1]
```

**Rotation θ CCW:**
```
[cos θ  -sin θ]
[sin θ   cos θ]
```

**Translation:**
Perlu augmented matrix (3×3) atau vector addition

**Kenapa Penting?**

Dengan matriks, komposisi transformasi jadi gampang:
- Rotasi → Refleksi = Matriks Refleksi × Matriks Rotasi

**Contoh:**

Rotasi 90° CCW kemudian refleksi terhadap x-axis:

```
Refleksi × Rotasi = [1   0] × [0  -1] = [0  -1]
                     [0  -1]   [1   0]   [-1  0]
```

Result matrix ini equivalent dengan refleksi terhadap y = -x!

**Di SNBT:**

Matriks jarang muncul eksplisit, tapi understanding konsep komposisi transformasi penting banget!

### Aplikasi dalam Soal

**Tipe Soal Favorit SNBT:**

**1. Identifikasi Transformasi**
"Bangun B adalah hasil transformasi dari bangun A. Transformasi apa yang digunakan?"

**Strategy:**
- Check size: sama atau beda?
- Check orientation: sama, rotated, atau flipped?
- Determine exact transformation

**2. Komposisi Transformasi**
"Segitiga dirotasi 45° kemudian di-refleksi. Tentukan posisi akhirnya."

**Strategy:**
- Apply transformasi step by step
- Don't skip intermediate step!
- Verify final result

**3. Kongruensi vs Similarity**
"Manakah pasangan bangun yang kongruen?"

**Strategy:**
- Check ALL corresponding sides
- Check ALL corresponding angles
- Remember: size must be identical for congruence

**4. Finding Missing Transformation**
"Untuk transformasi A → B → C, jika A → B adalah rotasi 30°, transformasi apa yang diperlukan B → C?"

**Strategy:**
- Analyze overall transformation A → C
- Subtract known transformation A → B
- Remaining = B → C

**Jebakan yang Sering:**

❌ **Jebakan 1:** Assume kongruen cuma dari bentuk  
✅ **Fix:** Check size juga!

❌ **Jebakan 2:** Lupa bahwa reflection reverses orientation  
✅ **Fix:** Check handedness (left vs right)

❌ **Jebakan 3:** Salah urutan dalam komposisi  
✅ **Fix:** Apply dari kanan ke kiri in notation!

**Tips Sukses:**

✅ **Master isometri** - translation, rotation, reflection  
✅ **Understand properties** - apa yang preserved, apa yang berubah  
✅ **Practice komposisi** - combine different transformations  
✅ **Check congruence carefully** - size AND shape harus sama  
✅ **Visualize mentally** - latih bayangkan transformasi  

**Latihan Mental Cepat:**

1. Bayangkan huruf "F" dirotasi 180° → gimana?
2. Bayangkan angka "2" di-refleksi horizontal → gimana?
3. Bayangkan persegi dirotasi 45° terus didilatasi 2x → kongruen dengan aslinya?

*(Jawaban: 1. Terbalik total, 2. Jadi kayak "2" yang flipped, 3. Tidak, karena ada dilation!)*

Remember: **Kongruensi = Same size, same shape!** Cuma isometri yang bisa preserve ini! 🔄✨

---
