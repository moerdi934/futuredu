# SECTION 2: Geometri Spasial
## Topic 2.3: Transformasi Geometri

---


## Materi 2.3.4: Pola Geometri

### Tessellation: Pola pada Ubin

**Apa Itu Tessellation?**

Tessellation (atau teselasi) adalah pola yang dibuat dengan menyusun bangun-bangun geometri tanpa ada celah dan tanpa tumpang tindih. Bayangin ubin lantai kamar mandi atau honeycomb lebah – itu tessellation!

**Nama lainnya:**
- Tiling (pemasangan ubin)
- Mosaic pattern
- Plane covering

**Syarat Tessellation:**

1. **No gaps (tidak ada celah)** - semua area tertutup sempurna
2. **No overlaps (tidak ada tumpang tindih)** - bangun tidak saling menutupi
3. **Pattern repeats (pola berulang)** - ada unit yang diulang-ulang
4. **Extends infinitely (teoritis tak terbatas)** - pola bisa diperluas terus

**Kenapa Penting?**

Tessellation ini muncul di mana-mana:
- Desain lantai dan dinding
- Karya seni (M.C. Escher terkenal banget dengan ini!)
- Nature (honeycomb, fish scales)
- Islamic art (pattern geometris kompleks)

Dan tentu saja... **sering keluar di SNBT!** 😄

### Regular Tessellation: Pola Beraturan

**Apa Itu Regular Tessellation?**

Regular tessellation adalah tessellation yang pakai bangun beraturan (regular polygon) yang sama, dan di setiap vertex (titik sudut), susunan sudutnya identik.

**Fun Fact:** Cuma ada **3 regular tessellation** di dunia ini!

**The Big Three:**

1. **Tessellation dengan Segitiga Sama Sisi**
   - Setiap sudut = 60°
   - Di setiap vertex: 6 segitiga ketemu
   - 6 × 60° = 360° ✓
   - Contoh: triangle grid

2. **Tessellation dengan Persegi**
   - Setiap sudut = 90°
   - Di setiap vertex: 4 persegi ketemu
   - 4 × 90° = 360° ✓
   - Contoh: ubin kamar mandi standar, papan catur

3. **Tessellation dengan Hexagon Beraturan**
   - Setiap sudut = 120°
   - Di setiap vertex: 3 hexagon ketemu
   - 3 × 120° = 360° ✓
   - Contoh: honeycomb, beberapa lantai mozaik

**Kenapa Cuma 3?**

Karena syaratnya:
- Harus regular polygon (sama sisi, sama sudut)
- Sudut di vertex harus genap 360°
- Semua vertex harus punya konfigurasi yang sama

**Contoh Bacaan:**

Pentagon beraturan (sudut dalam = 108°) nggak bisa tessellation:
- Kalau 3 pentagon ketemu: 3 × 108° = 324° (kurang!)
- Kalau 4 pentagon ketemu: 4 × 108° = 432° (lebih!)
- Nggak ada yang pas 360°

**Aturan Cepat:**

Bangun beraturan bisa tessellation kalau:
**360° ÷ sudut dalam = bilangan bulat**

Cek:
- Segitiga: 360° ÷ 60° = 6 ✓
- Persegi: 360° ÷ 90° = 4 ✓
- Hexagon: 360° ÷ 120° = 3 ✓
- Pentagon: 360° ÷ 108° = 3.33... ✗

### Semi-Regular Tessellation: Kombinasi Bangun

**Apa Itu Semi-Regular Tessellation?**

Semi-regular tessellation pakai 2 atau lebih jenis regular polygon, tapi setiap vertex punya konfigurasi yang sama.

**Ada 8 Semi-Regular Tessellation:**

Mari kita bahas yang sering muncul di soal:

1. **Square + Triangle (3.3.4.3.4)**
   - Pola: segitiga-segitiga-persegi-segitiga-persegi
   - Di setiap vertex: 60° + 60° + 90° + 60° + 90° = 360°

2. **Hexagon + Triangle (3.6.3.6)**
   - Pola: segitiga-hexagon-segitiga-hexagon
   - Di setiap vertex: 60° + 120° + 60° + 120° = 360°

3. **Triangle + Dodecagon (3.12.12)**
   - Pola: segitiga-dodecagon-dodecagon
   - Keliatan fancy, tapi tetap mengikuti rule 360°

**Notasi:**

Angka-angka itu menunjukkan jumlah sisi polygon di sekitar vertex, diurutkan searah atau berlawanan jarum jam.

Contoh: **3.3.4.3.4** artinya:
- Triangle (3 sisi)
- Triangle (3 sisi)
- Square (4 sisi)
- Triangle (3 sisi)
- Square (4 sisi)

### Irregular Tessellation: Pola Tidak Beraturan

**Apa Itu Irregular Tessellation?**

Tessellation dengan bangun nggak beraturan, atau konfigurasi vertex yang berbeda-beda.

**Fakta Menarik:**
- **Semua segitiga** bisa tessellation (nggak peduli bentuknya!)
- **Semua segiempat** bisa tessellation (nggak peduli bentuknya!)
- **Beberapa pentagon** bisa tessellation (ada 15 tipe khusus)
- **Nggak semua hexagon** bisa tessellation (harus memenuhi syarat tertentu)

**Contoh Bacaan:**

**Segitiga Sembarang:**
Ambil segitiga random, copy-paste, rotate 180°, tempel di salah satu sisinya → voila! Tessellation!

**Segiempat Sembarang:**
Ambil segiempat random (bahkan yang aneh bentuknya), susun dengan rotasi yang tepat → selalu bisa tessellation!

**Why?** Karena jumlah sudut dalam segitiga = 180° dan segiempat = 360°. Dengan rotasi yang tepat, sudut-sudut akan bertemu dan pas 360° di setiap vertex.

### Pola M.C. Escher: Tessellation Artistik

**Siapa M.C. Escher?**

Seniman Belanda yang famous banget dengan tessellation-nya yang mind-blowing. Dia bikin tessellation dengan bentuk-bentuk organik kayak burung, ikan, kadal, dll.

**Teknik Escher:**

1. **Start dengan regular tessellation** (usually square atau hexagon)
2. **Modify edges** dengan pattern yang sama
3. **Ensure interlocking** - edge yang dimodif harus bisa nyambung sempurna
4. **Add details** - bikin jadi bentuk recognizable (hewan, orang, dll)

**Prinsip Dasar:**

Yang diambil dari satu sisi, harus ditambahkan ke sisi yang berseberangan (atau adjacent dengan modifikasi yang tepat). Ini ensure pattern tetap bisa interlocking.

**Contoh Konseptual:**

Dari persegi → jadi bentuk ikan:
- Ambil "gigitan" dari sisi kiri
- Tambahkan "sirip" di sisi kanan (exact same shape)
- Ambil "gigitan" dari sisi atas
- Tambahkan "ekor" di sisi bawah
- Result: bentuk yang mirip ikan dan bisa tessellation!

**Di SNBT:**

Kadang muncul soal yang mirip konsep Escher – dikasih modified shape, terus ditanya apakah bisa tessellation atau gimana pola tessellation-nya.

**Tips:**
- Perhatikan edges yang saling "cocok"
- Bayangkan rotasi atau refleksi yang needed
- Check apakah bisa no-gap, no-overlap

### Simetri dalam Pola Tessellation

**Jenis-Jenis Simetri dalam Tessellation:**

1. **Translational Symmetry (Simetri Geser)**
   - Pola identik kalau digeser sejarak tertentu
   - Semua tessellation punya ini
   - Arah geseran bisa berbeda-beda

2. **Rotational Symmetry (Simetri Putar)**
   - Pola identik kalau diputar pada titik tertentu
   - Sudut rotasi tergantung tessellation-nya
   - Contoh: hexagon tessellation punya rotasi 60°, 120°, 180°, dll.

3. **Reflectional Symmetry (Simetri Cermin)**
   - Pola identik kalau di-refleksi terhadap garis tertentu
   - Nggak semua tessellation punya ini
   - Contoh: square tessellation punya banyak sumbu simetri

4. **Glide Reflection (Simetri Geser-Cermin)**
   - Kombinasi geseran dan refleksi
   - Lebih kompleks, sering di tessellation irregular
   - Pattern di batik/tekstil sering pakai ini

**Contoh Bacaan:**

**Square Tessellation:**
- Translasi: geser 1 kotak ke kanan/kiri/atas/bawah
- Rotasi: 90°, 180°, 270° di setiap vertex
- Refleksi: garis horizontal, vertikal, dan 2 diagonal

**Triangle Tessellation:**
- Translasi: geser sepanjang arah tertentu
- Rotasi: 60°, 120°, 180°, dll. di vertex tertentu
- Refleksi: ada beberapa sumbu tergantung orientasi

**Identifikasi Simetri:**

Untuk cari jenis simetri dalam tessellation:
1. **Cari unit yang berulang** - ini unit translasi
2. **Cari center of rotation** - titik yang kalau diputar, pola sama
3. **Cari mirror lines** - garis yang membagi pola jadi dua bagian identik
4. **Test glide reflection** - coba geser + flip

### Melanjutkan Pola Tessellation

**Tipe Soal SNBT:**

Dikasih sebagian pola tessellation, terus diminta:
1. Lengkapi pola yang hilang
2. Identifikasi bangun berikutnya
3. Tentukan berapa bangun tipe tertentu di area tertentu

**Strategi Solving:**

**Step 1: Identifikasi Unit Pattern**
- Cari bagian pola yang berulang (repeating unit)
- Bisa 1 bangun, bisa kombinasi beberapa bangun

**Step 2: Tentukan Arah Pengulangan**
- Horizontal? Vertikal? Diagonal?
- Bisa lebih dari 1 arah

**Step 3: Perhatikan Vertex Configuration**
- Bangun apa saja yang bertemu di titik sudut?
- Apakah semua vertex punya konfigurasi sama?

**Step 4: Extend Pattern**
- Lanjutkan pola sesuai aturan yang sudah diidentifikasi
- Check consistency

**Contoh Bacaan:**

Pola: △□△□△□...

Unit pattern: △□ (segitiga + persegi)  
Arah: horizontal  
Next: △□△□ (terus berulang)

**Pola Kompleks:**

```
Baris 1: △□△□△
Baris 2: □△□△□
Baris 3: △□△□△
```

Unit pattern: ada shifting antar baris  
Baris ganjil: mulai dari △  
Baris genap: mulai dari □  
Next row (baris 4): □△□△□

**Jebakan yang Sering Muncul:**

❌ **Jebakan 1:** Fokus cuma di satu arah, lupa cek arah lain  
💡 **Solusi:** Check horizontal DAN vertikal

❌ **Jebakan 2:** Assume pattern simple, padahal ada hidden complexity  
💡 **Solusi:** Trace beberapa cycle buat ensure pattern-nya bener

❌ **Jebakan 3:** Salah count di vertex configuration  
💡 **Solusi:** Highlight vertex dan count carefully

### Jenis-Jenis Simetri: Reflection, Rotation, Translation

**Recap: The Big 4 Symmetries**

**1. Reflection Symmetry (Simetri Cermin)**

Udah dibahas di materi sebelumnya, tapi dalam konteks pola:
- Pattern bisa di-mirror terhadap suatu garis
- Garis ini disebut **axis of symmetry** atau **mirror line**
- Kedua sisi mirror line identik

**Contoh dalam Pattern:**
```
Pattern: A B C | C B A
               ↑
         mirror line
```

**2. Rotation Symmetry (Simetri Putar)**

Pattern identik setelah dirotasi sudut tertentu:
- Ada **center of rotation** (titik pusat)
- Ada **angle of rotation** (sudut putar)
- **Order of symmetry** = berapa kali identik dalam 360°

**Contoh:**
- Bintang 5 sudut: order 5 (identik setiap 72°)
- Square pattern: order 4 (identik setiap 90°)
- Triangle pattern: order 3 (identik setiap 120°)

**3. Translation Symmetry (Simetri Geser)**

Pattern identik kalau digeser sejarak dan searah tertentu:
- Ada **translation vector** (arah dan jarak geseran)
- Bisa ada multiple translation vectors

**Contoh:**
```
Pattern: ○○○○○○○○
Geser 1 unit ke kanan → pattern sama
```

**4. Glide Reflection (Simetri Geser-Cermin)**

Kombinasi translation + reflection:
- Geser dulu sepanjang suatu garis
- Terus refleksi terhadap garis yang sama
- Hasilnya identik dengan pattern awal

**Contoh:**
Pattern footprints di pasir – kaki kiri, kaki kanan, kaki kiri, dst.

### Grup Simetri dan Wallpaper Groups

**Apa Itu Wallpaper Groups?**

Dalam matematika, ada klasifikasi formal untuk semua possible symmetry patterns dalam 2D. Namanya **wallpaper groups** karena pertama kali distudi untuk pattern wallpaper.

**Fun Fact:** Ada **exactly 17** wallpaper groups. Nggak lebih, nggak kurang!

**Kenapa 17?**

Karena kombinasi possible dari 4 jenis simetri (reflection, rotation, translation, glide reflection) cuma bisa menghasilkan 17 pattern dasar yang berbeda.

**Di SNBT:**

Kamu nggak perlu hafal semua 17 groups (itu advanced banget!), tapi perlu tahu:
- Ada batasan dalam kombinasi simetri
- Pattern yang keliatan beda bisa punya struktur simetri yang sama
- Identifikasi simetri itu systematic, bukan asal tebak

**Identifikasi Simetri dalam Pola:**

**Checklist:**
1. ☐ Apakah ada mirror lines? Berapa banyak? Arahnya gimana?
2. ☐ Apakah ada rotational symmetry? Order berapa?
3. ☐ Translational symmetry-nya gimana? Ada berapa arah?
4. ☐ Apakah ada glide reflection?

**Contoh Analisis:**

**Square Grid Pattern:**
- ✓ 4 sets of parallel mirror lines (horizontal, vertical, 2 diagonal)
- ✓ Rotational symmetry order 4 (90°, 180°, 270°, 360°)
- ✓ Translational symmetry dalam 2 arah (horizontal dan vertikal)
- ✗ No glide reflection (karena udah ada refleksi biasa)

**Brick Pattern (Hexagonal Tessellation):**
- ✓ 3 sets of parallel mirror lines
- ✓ Rotational symmetry order 6 (60°, 120°, 180°, 240°, 300°, 360°)
- ✓ Translational symmetry dalam 3 arah
- ✗ No glide reflection

### Aplikasi Pola Geometri dalam SNBT

**Tipe Soal yang Muncul:**

**1. Identifikasi Tessellation**
"Manakah yang bisa mem-tessellate plane?"
- Check: gap? overlap? repeatable?

**2. Melanjutkan Pattern**
"Apa bangun ke-50 dalam pattern ini?"
- Find repeating unit
- Determine position in cycle

**3. Counting dalam Pattern**
"Berapa segitiga dalam 10 baris pertama pattern ini?"
- Identify growth pattern
- Use formula atau systematic counting

**4. Simetri Pattern**
"Pattern ini punya berapa sumbu simetri?"
- Check all possible mirror lines
- Don't miss diagonal ones!

**5. Missing Piece**
"Bangun apa yang hilang dari pattern ini?"
- Analyze surrounding pieces
- Apply pattern rule

**Tips Sukses:**

✅ **Visualize the whole pattern** - jangan cuma fokus di satu bagian  
✅ **Look for repeating units** - kunci memahami pattern  
✅ **Check multiple directions** - pattern bisa kompleks  
✅ **Use symmetry** - bisa shortcut counting  
✅ **Draw if needed** - extend pattern secara visual  

**Common Mistakes:**

❌ Assume pattern selalu simple  
❌ Lupa check edge cases  
❌ Miss hidden symmetry  
❌ Count carelessly (double count atau skip)  

**Practice Strategy:**

1. **Start dengan pattern sederhana** - master the basics
2. **Progress ke yang kompleks** - gradual difficulty increase
3. **Analyze real-world patterns** - lantai, dinding, batik, dll.
4. **Play pattern games** - banyak apps yang fun!

Remember: **Pattern recognition is a skill that improves with practice!** Makin banyak pattern yang kamu lihat, makin cepat otak kamu recognize pattern baru! 🎨🔄

---
