# Burgerash: audit design + listă de poze și video (2026-11-27)

Doar analiză, fără cod schimbat. Verificat pe build-ul de producție local de pe `main` (commit 50bc2f0),
iPhone 13 (390 px) și desktop 1440 px. Site-ul live nu se poate deschide din mediul de test.
Surse: docs/DESIGN.md ("Later ideas"), docs/DESIGN_IDEAS.md, docs/PHOTOS.md,
`homepage/photo-guideline.md`, thread-ul "Research top burger website designs" (le-smash, maijard, skinnylouie).

---

## 1. Pe scurt

Site-ul arată deja coerent: hero, stickere, carusel, meniu, locație, FAQ, Despre, Instagram. Fundația e bună.
Ce îl ține pe loc acum nu e codul, ci **pozele**: toate sunt copii WhatsApp (853 × 1280), toate verticale,
și toate arată același lucru (burger pe tavă, pe faianță roșie). Lipsesc **locul, oamenii și procesul**.
Shoot-ul următor rezolvă cel mai mult (secțiunea 3).

---

## 2. Ce mai trebuie, în ordinea impactului

| # | Ce | De ce contează | Depinde de |
|---|---|---|---|
| 1 | **Poze originale, rezoluție mare** în loc de copiile WhatsApp | Pe ecrane retina hero-ul și caruselul ies moi. Înlocuirea se face fără cod (aceleași nume de fișier, vezi PHOTOS.md). | Fotograf |
| 2 | **Poze cu locul și oamenii**: geamul, fațada, mâinile la plită, predarea la geam | Toate cele 13 poze sunt produs pe tavă. "Din cartier" și "Treci pe la geam" nu au nicio imagine care să le dovedească. | Shoot nou |
| 3 | **Un singur mesaj "Opening soon"** | Pe telefon apare de 4 ori: header, hero, banda roșie "Deschidem în curând", cardul "AZI LA BURGERASH". Plus amestec EN/RO ("Opening soon" lângă texte românești). Păstrăm banda + cardul, scoatem restul, totul în română. | Nimic (task mic, Sonnet) |
| 4 | **Harta**: înlocuită cu imagine statică a zonei de 1 km (decizia ta din 25.11) | Pe telefon harta e un pătrat mare gol cu o casetă albă de atribuire peste ea. Arată neterminat și e cea mai grea bucată de JS. | Task separat |
| 5 | **Rânduri orfane în meniu pe desktop** | "Water" și "Sauces" stau singure pe ultimul rând (4 băuturi, 4 sides în grilă de 3). Plus mult spațiu gol bej în jurul stickerelor. Variante: grilă de 4 la băuturi/sides sau carduri mai joase. | Nimic (task mic) |
| 6 | **Poza din Locație e prea mică** (thumbnail lângă "LIVRARE PROPRIE & PICKUP") | E cea mai "umană" poză, dar pe telefon abia se vede. Merită înlocuită cu poza geamului (shot S3) și mărită. | Shoot nou |
| 7 | **Pictogramele ANPC** | În footer avem butoane text "ANPC SAL / SOL". Ordinul ANPC 449/2022 cere pictogramele oficiale (imagini). De verificat înainte de lansare, mai ales pentru Netopia, care verifică paginile legale. | Task mic |
| 8 | **Recenzii reale + buton de apel** | Din "Later ideas". Ambele așteaptă date reale (recenzii Google, număr de telefon). Nu inventăm nimic. | Google, telefon |

Lucruri care merg bine și nu le-aș atinge: hero-ul cu stickerele pe colț, banda care curge, caruselul fără autoplay,
bara de jos pe telefon (Acasă / Meniu / Coș / Locație), tonul textelor, frame-ul pozelor (bordură + umbră).

---

## 3. Idei rămase (ce era în notițe)

Din docs/DESIGN.md "Later ideas" și din research. ✅ = gata, ⏳ = așteaptă ceva, 💡 = se poate face.

| Idee | Stare | Ce îi trebuie |
|---|---|---|
| "Burgerul vedetă" decupat în hero | ⏳ | Poză decupată (shot S2) |
| "Cum se face un burger" în 5 pași | ⏳ | 5 poze la fel încadrate (shot S5) |
| Recenzii reale | ⏳ | Recenzii pe Google Business Profile |
| Buton de apel lângă "Du-mă acolo" | ⏳ | Număr de telefon |
| Parallax în rame (Despre / Locație), doar desktop | 💡 | Merge cu pozele noi orizontale |
| Coș în stil bon | 💡 | Nimic |
| Pick Up / Delivery ca prim pas la comandă | 💡 | Când repornim comenzile |
| "S-a terminat" live pe produs | 💡 | Comenzi pornite |
| Apple Pay / Google Pay | ⏳ | Contul Netopia |
| Regulile casei | 💡 | Texte de la tine/șef |
| Card de fidelitate cu stickere | 💡 | Decizie de business |
| UTM pe Glovo / Wolt / Instagram | 💡 | Linkurile reale Glovo/Wolt |
| Hartă statică 1 km | 💡 | Task separat (vezi #4) |
| Imagine de share (Facebook/WhatsApp) | ⏳ | Shot S7 |
| Pagina de confirmare comandă cu poza "pachet gata" | ⏳ | Comenzi pornite + shot S6 |
| Video pe site ("Cum se face") | ❓ | **Decizie**: DESIGN.md spune "No video". Vezi secțiunea 5. |

Ce **nu** facem (rămâne valabil): poze la produse în meniu, cuvântul "smash", text peste poze, recenzii inventate,
animații care întârzie comanda, scroll "cinematic" tip Awwwards.

---

## 4. Shot list pentru fotograf: POZE

Toate sunt poze de **atmosferă**. Meniul rămâne cu stickere, nu cu poze.
Cele marcate ⭐ sunt cele care schimbă cel mai mult site-ul.

| Cod | Ce | Unde merge | Format |
|---|---|---|---|
| ⭐ S1 | **Hero nou**: CLASIC pe tavă cu cartofi, faianța roșie în spate, unghi ~45°, lumină caldă | Hero (desktop + telefon) | Vertical 4:5 **și** orizontal 3:2, cu loc liber în colțul stânga-jos pentru stickere |
| ⭐ S2 | **Burger decupabil**: CLASIC pe fundal simplu (alb sau bej plin), margini clare, o poză din lateral, una de la ~30° | "Burgerul vedetă" în hero (PNG transparent) | Orice ratio, fundal uniform, fără umbre mari |
| ⭐ S3 | **Geamul / fațada**: o dată ziua, o dată seara cu lumina aprinsă; cu și fără om la geam | Locație ("Vino să-l iei cald"), Google Business Profile | 3:2 orizontal + 4:5 vertical |
| ⭐ S4 | **Predarea la geam**: mâna care întinde punga/tava către client (fața clientului nu e necesară) | Locație, Despre | 4:5 |
| ⭐ S5 | **"Cum se face" în 5 pași**, același unghi și aceeași lumină la toate: (1) carnea proaspătă pe tocător, (2) pe plită, crusta, (3) cheddarul se topește, (4) asamblarea, (5) ambalat în hârtia burgerash | Secțiunea "Cum se face", FAQ "Carnea e congelată?" | 1:1 sau 4:5, toate la fel |
| S6 | **Comanda împachetată**: punga închisă cu sticker, gata de livrare | Confirmare comandă, "Livrare proprie" | 4:5 + 1:1 |
| S7 | **Flatlay de sus**: 2 burgeri + cartofi + 2 băuturi pe hârtia branded | Imagine de share, Instagram | 1:1 **și** 1,91:1 (pentru share 1200 × 630), loc liber pe margini |
| S8 | **Echipa** la lucru (mâini, șorț, plită), 1-2 portrete dacă vor | Despre ("Din cartier") | 4:5 + 3:2 |
| S9 | **Cartierul**: strada, colțul cu liceul, oameni care mănâncă afară | Despre, Instagram | 3:2 |
| S10 | **Detalii / texturi**: hârtia branded, foaia de stickere, faianța, punga | Fundaluri mici, Instagram, stories | 1:1 |
| S11 | Fiecare burger separat (CLASIC, HOT BOY, DOUBLE, CRISPY, HOT HONEY, CRISPY BACON), la fel încadrați | **Doar social media / Glovo / Wolt / Google**, nu în meniul site-ului | 1:1 + 4:5 |

**Note tehnice pentru fotograf**
- Trimite **originalele la rezoluție completă** (JPG, latura lungă 4000 px+, fără compresie WhatsApp). Pe WeTransfer / Google Drive, nu pe WhatsApp.
- Pozele importante (S1, S3, S4) în **ambele orientări**: vertical pentru telefon, orizontal pentru desktop.
- Lasă **spațiu în jurul subiectului**, ca să putem decupa 4:5, 1:1 și 3:2 din aceeași poză.
- Culori naturale, fără filtre puternice, fără text sau watermark pe poze.
- Burgeri reali din meniu, cu ingredientele de pe tablă (fără ingrediente care nu sunt în rețetă).
- Unghiul pe plită: arată **crusta**, nu presarea burgerului (nu ne promovăm ca "smash").
- Persoane cu fața vizibilă: **acord scris** de la fiecare (GDPR). Mâini fără față: nu trebuie.
- Un **OK scris** de la fotograf că pozele pot fi folosite pe site, social media, Google și aplicațiile de livrare.

---

## 5. Shot list: VIDEO

**Decizie de luat:** docs/DESIGN.md spune "No video" pe site (viteză pe 4G, calm).
Recomandarea mea: video-urile merg pe **Instagram, TikTok, Google și Glovo/Wolt**, unde aduc cei mai mulți oameni.
Pe site, cel mult **o buclă scurtă fără sunet** în "Cum se face", încărcată doar când ajungi la ea, cu poză de copertă.
Până nu decizi, pe site nu punem video.

| Cod | Ce | Lungime | Format |
|---|---|---|---|
| ⭐ V1 | **"De la plită la geam"**: carne pe plită, cheddar, asamblare, ambalare, predare la geam. Reel-ul principal | 15-25 s | Vertical 9:16 (1080 × 1920), 4K dacă se poate |
| ⭐ V2 | **Tăiat în două / cheese pull**, slow-motion | 5-8 s | 9:16 + 1:1, filmat la 60-120 fps |
| V3 | **Sunetul plitei** (sfârâit, aproape) | 6-10 s | 9:16, sunet curat, fără muzică |
| V4 | **Buclă fără cusătură** (ex. abur peste burger, cartofi care cad pe tavă) | 3-5 s | 16:9 **și** 9:16, fără text, fără sunet (candidat pentru site) |
| V5 | **Geamul seara**, time-lapse cu oameni care vin | 8-12 s | 9:16 + 16:9 |
| V6 | **Împachetare + lipit stickerul** pe pungă | 6-8 s | 9:16 |

**Note video**
- Telefonul ținut **vertical** pentru tot ce e de social; trepied sau gimbal, fără tremurat.
- Trimite **clipurile brute separat**, nu doar montajul final; fără muzică lipită (o punem noi pe Instagram, cu drepturi).
- Fără text pe video; subtitrările le adăugăm noi.
- Lumină naturală + lumina de la geam; aceeași temperatură de culoare ca pozele.

---

## 6. Ordinea de lucru propusă

1. Acum (fără poze): #3 un singur "Opening soon" în română, #5 rânduri orfane în meniu, #7 pictograme ANPC.
2. Când vin pozele: înlocuiești originalele (aceleași nume, zero cod), apoi hero cu S1, locație cu S3/S4.
3. Apoi: "Burgerul vedetă" (S2), "Cum se face" (S5), imaginea de share (S7).
4. Separat: harta statică de 1 km.
5. Decizia "video pe site: da/nu".
