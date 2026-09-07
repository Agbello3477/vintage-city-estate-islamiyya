export interface QuranSurah {
  number: number;
  name: string;
  nameArabic: string;
  englishName: string;
  numberOfAyahs: number;
  juz: number[];
  type: "Meccan" | "Medinan";
}

export interface JuzData {
  juzNumber: number;
  name: string;
  nameArabic: string;
  surahs: QuranSurah[];
  totalAyahs: number;
}

export const QURAN_SURAHS: QuranSurah[] = [
  { number: 1, name: "Al-Fatihah", nameArabic: "الفاتحة", englishName: "The Opening", numberOfAyahs: 7, juz: [1], type: "Meccan" },
  { number: 2, name: "Al-Baqarah", nameArabic: "البقرة", englishName: "The Cow", numberOfAyahs: 286, juz: [1, 2, 3], type: "Medinan" },
  { number: 3, name: "Ali 'Imran", nameArabic: "آل عمران", englishName: "Family of Imran", numberOfAyahs: 200, juz: [3, 4], type: "Medinan" },
  { number: 4, name: "An-Nisa", nameArabic: "النساء", englishName: "The Women", numberOfAyahs: 176, juz: [4, 5, 6], type: "Medinan" },
  { number: 5, name: "Al-Ma'idah", nameArabic: "المائدة", englishName: "The Table Spread", numberOfAyahs: 120, juz: [6, 7], type: "Medinan" },
  { number: 6, name: "Al-An'am", nameArabic: "الأنعام", englishName: "The Cattle", numberOfAyahs: 165, juz: [7, 8], type: "Meccan" },
  { number: 7, name: "Al-A'raf", nameArabic: "الأعراف", englishName: "The Heights", numberOfAyahs: 206, juz: [8, 9], type: "Meccan" },
  { number: 8, name: "Al-Anfal", nameArabic: "الأنفال", englishName: "The Spoils of War", numberOfAyahs: 75, juz: [9, 10], type: "Medinan" },
  { number: 9, name: "At-Tawbah", nameArabic: "التوبة", englishName: "The Repentance", numberOfAyahs: 129, juz: [10, 11], type: "Medinan" },
  { number: 10, name: "Yunus", nameArabic: "يونس", englishName: "Jonah", numberOfAyahs: 109, juz: [11], type: "Meccan" },
  { number: 11, name: "Hud", nameArabic: "هود", englishName: "Hud", numberOfAyahs: 123, juz: [11, 12], type: "Meccan" },
  { number: 12, name: "Yusuf", nameArabic: "يوسف", englishName: "Joseph", numberOfAyahs: 111, juz: [12, 13], type: "Meccan" },
  { number: 13, name: "Ar-Ra'd", nameArabic: "الرعد", englishName: "The Thunder", numberOfAyahs: 43, juz: [13], type: "Medinan" },
  { number: 14, name: "Ibrahim", nameArabic: "إبراهيم", englishName: "Abraham", numberOfAyahs: 52, juz: [13], type: "Meccan" },
  { number: 15, name: "Al-Hijr", nameArabic: "الحجر", englishName: "The Rocky Tract", numberOfAyahs: 99, juz: [14], type: "Meccan" },
  { number: 16, name: "An-Nahl", nameArabic: "النحل", englishName: "The Bee", numberOfAyahs: 128, juz: [14], type: "Meccan" },
  { number: 17, name: "Al-Isra", nameArabic: "الإسراء", englishName: "The Night Journey", numberOfAyahs: 111, juz: [15], type: "Meccan" },
  { number: 18, name: "Al-Kahf", nameArabic: "الكهف", englishName: "The Cave", numberOfAyahs: 110, juz: [15, 16], type: "Meccan" },
  { number: 19, name: "Maryam", nameArabic: "مريم", englishName: "Mary", numberOfAyahs: 98, juz: [16], type: "Meccan" },
  { number: 20, name: "Ta-Ha", nameArabic: "طه", englishName: "Ta-Ha", numberOfAyahs: 135, juz: [16], type: "Meccan" },
  { number: 21, name: "Al-Anbiya", nameArabic: "الأنبياء", englishName: "The Prophets", numberOfAyahs: 112, juz: [17], type: "Meccan" },
  { number: 22, name: "Al-Hajj", nameArabic: "الحج", englishName: "The Pilgrimage", numberOfAyahs: 78, juz: [17], type: "Medinan" },
  { number: 23, name: "Al-Mu'minun", nameArabic: "المؤمنون", englishName: "The Believers", numberOfAyahs: 118, juz: [18], type: "Meccan" },
  { number: 24, name: "An-Nur", nameArabic: "النور", englishName: "The Light", numberOfAyahs: 64, juz: [18], type: "Medinan" },
  { number: 25, name: "Al-Furqan", nameArabic: "الفرقان", englishName: "The Criterion", numberOfAyahs: 77, juz: [18, 19], type: "Meccan" },
  { number: 26, name: "Ash-Shu'ara", nameArabic: "الشعراء", englishName: "The Poets", numberOfAyahs: 227, juz: [19], type: "Meccan" },
  { number: 27, name: "An-Naml", nameArabic: "النمل", englishName: "The Ant", numberOfAyahs: 93, juz: [19, 20], type: "Meccan" },
  { number: 28, name: "Al-Qasas", nameArabic: "القصص", englishName: "The Stories", numberOfAyahs: 88, juz: [20], type: "Meccan" },
  { number: 29, name: "Al-'Ankabut", nameArabic: "العنكبوت", englishName: "The Spider", numberOfAyahs: 69, juz: [20, 21], type: "Meccan" },
  { number: 30, name: "Ar-Rum", nameArabic: "الروم", englishName: "The Romans", numberOfAyahs: 60, juz: [21], type: "Meccan" },
  { number: 31, name: "Luqman", nameArabic: "لقمان", englishName: "Luqman", numberOfAyahs: 34, juz: [21], type: "Meccan" },
  { number: 32, name: "As-Sajdah", nameArabic: "السجدة", englishName: "The Prostration", numberOfAyahs: 30, juz: [21], type: "Meccan" },
  { number: 33, name: "Al-Ahzab", nameArabic: "الأحزاب", englishName: "The Combined Forces", numberOfAyahs: 73, juz: [21, 22], type: "Medinan" },
  { number: 34, name: "Saba", nameArabic: "سبأ", englishName: "Sheba", numberOfAyahs: 54, juz: [22], type: "Meccan" },
  { number: 35, name: "Fatir", nameArabic: "فاطر", englishName: "Originator", numberOfAyahs: 45, juz: [22], type: "Meccan" },
  { number: 36, name: "Ya-Sin", nameArabic: "يس", englishName: "Ya-Sin", numberOfAyahs: 83, juz: [22, 23], type: "Meccan" },
  { number: 37, name: "As-Saffat", nameArabic: "الصافات", englishName: "Those Who Set the Ranks", numberOfAyahs: 182, juz: [23], type: "Meccan" },
  { number: 38, name: "Sad", nameArabic: "ص", englishName: "Sad", numberOfAyahs: 88, juz: [23], type: "Meccan" },
  { number: 39, name: "Az-Zumar", nameArabic: "الزمر", englishName: "The Troops", numberOfAyahs: 75, juz: [23, 24], type: "Meccan" },
  { number: 40, name: "Ghafir", nameArabic: "غافر", englishName: "The Forgiver", numberOfAyahs: 85, juz: [24], type: "Meccan" },
  { number: 41, name: "Fussilat", nameArabic: "فصلت", englishName: "Explained in Detail", numberOfAyahs: 54, juz: [24, 25], type: "Meccan" },
  { number: 42, name: "Ash-Shura", nameArabic: "الشورى", englishName: "The Consultation", numberOfAyahs: 53, juz: [25], type: "Meccan" },
  { number: 43, name: "Az-Zukhruf", nameArabic: "الزخرف", englishName: "The Ornaments of Gold", numberOfAyahs: 89, juz: [25], type: "Meccan" },
  { number: 44, name: "Ad-Dukhan", nameArabic: "الدخان", englishName: "The Smoke", numberOfAyahs: 59, juz: [25], type: "Meccan" },
  { number: 45, name: "Al-Jathiyah", nameArabic: "الجاثية", englishName: "The Crouching", numberOfAyahs: 37, juz: [25], type: "Meccan" },
  { number: 46, name: "Al-Ahqaf", nameArabic: "الأحقاف", englishName: "The Wind-Curved Sandhills", numberOfAyahs: 35, juz: [26], type: "Meccan" },
  { number: 47, name: "Muhammad", nameArabic: "محمد", englishName: "Muhammad", numberOfAyahs: 38, juz: [26], type: "Medinan" },
  { number: 48, name: "Al-Fath", nameArabic: "الفتح", englishName: "The Victory", numberOfAyahs: 29, juz: [26], type: "Medinan" },
  { number: 49, name: "Al-Hujurat", nameArabic: "الحجرات", englishName: "The Rooms", numberOfAyahs: 18, juz: [26], type: "Medinan" },
  { number: 50, name: "Qaf", nameArabic: "ق", englishName: "Qaf", numberOfAyahs: 45, juz: [26], type: "Meccan" },
  { number: 51, name: "Adh-Dhariyat", nameArabic: "الذاريات", englishName: "The Winnowing Winds", numberOfAyahs: 60, juz: [26, 27], type: "Meccan" },
  { number: 52, name: "At-Tur", nameArabic: "الطور", englishName: "The Mount", numberOfAyahs: 49, juz: [27], type: "Meccan" },
  { number: 53, name: "An-Najm", nameArabic: "النجم", englishName: "The Star", numberOfAyahs: 62, juz: [27], type: "Meccan" },
  { number: 54, name: "Al-Qamar", nameArabic: "القمر", englishName: "The Moon", numberOfAyahs: 55, juz: [27], type: "Meccan" },
  { number: 55, name: "Ar-Rahman", nameArabic: "الرحمن", englishName: "The Beneficent", numberOfAyahs: 78, juz: [27], type: "Medinan" },
  { number: 56, name: "Al-Waqi'ah", nameArabic: "الواقعة", englishName: "The Inevitable", numberOfAyahs: 96, juz: [27], type: "Meccan" },
  { number: 57, name: "Al-Hadid", nameArabic: "الحديد", englishName: "The Iron", numberOfAyahs: 29, juz: [27], type: "Medinan" },
  { number: 58, name: "Al-Mujadila", nameArabic: "المجادلة", englishName: "The Pleading Woman", numberOfAyahs: 22, juz: [28], type: "Medinan" },
  { number: 59, name: "Al-Hashr", nameArabic: "الحشر", englishName: "The Exile", numberOfAyahs: 24, juz: [28], type: "Medinan" },
  { number: 60, name: "Al-Mumtahanah", nameArabic: "الممتحنة", englishName: "She That Is to Be Examined", numberOfAyahs: 13, juz: [28], type: "Medinan" },
  { number: 61, name: "As-Saff", nameArabic: "الصف", englishName: "The Ranks", numberOfAyahs: 14, juz: [28], type: "Medinan" },
  { number: 62, name: "Al-Jumu'ah", nameArabic: "الجمعة", englishName: "The Congregation", numberOfAyahs: 11, juz: [28], type: "Medinan" },
  { number: 63, name: "Al-Munafiqun", nameArabic: "المنافقون", englishName: "The Hypocrites", numberOfAyahs: 11, juz: [28], type: "Medinan" },
  { number: 64, name: "At-Taghabun", nameArabic: "التغابن", englishName: "The Mutual Disillusion", numberOfAyahs: 18, juz: [28], type: "Medinan" },
  { number: 65, name: "At-Talaq", nameArabic: "الطلاق", englishName: "The Divorce", numberOfAyahs: 12, juz: [28], type: "Medinan" },
  { number: 66, name: "At-Tahrim", nameArabic: "التحريم", englishName: "The Prohibition", numberOfAyahs: 12, juz: [28], type: "Medinan" },
  { number: 67, name: "Al-Mulk", nameArabic: "الملك", englishName: "The Sovereignty", numberOfAyahs: 30, juz: [29], type: "Meccan" },
  { number: 68, name: "Al-Qalam", nameArabic: "القلم", englishName: "The Pen", numberOfAyahs: 52, juz: [29], type: "Meccan" },
  { number: 69, name: "Al-Haqqah", nameArabic: "الحاقة", englishName: "The Inevitable Truth", numberOfAyahs: 52, juz: [29], type: "Meccan" },
  { number: 70, name: "Al-Ma'arij", nameArabic: "المعارج", englishName: "The Ascending Stairways", numberOfAyahs: 44, juz: [29], type: "Meccan" },
  { number: 71, name: "Nuh", nameArabic: "نوح", englishName: "Noah", numberOfAyahs: 28, juz: [29], type: "Meccan" },
  { number: 72, name: "Al-Jinn", nameArabic: "الجن", englishName: "The Jinn", numberOfAyahs: 28, juz: [29], type: "Meccan" },
  { number: 73, name: "Al-Muzzammil", nameArabic: "المزمل", englishName: "The Enshrouded One", numberOfAyahs: 20, juz: [29], type: "Meccan" },
  { number: 74, name: "Al-Muddaththir", nameArabic: "المدثر", englishName: "The Cloaked One", numberOfAyahs: 56, juz: [29], type: "Meccan" },
  { number: 75, name: "Al-Qiyamah", nameArabic: "القيامة", englishName: "The Resurrection", numberOfAyahs: 40, juz: [29], type: "Meccan" },
  { number: 76, name: "Al-Insan", nameArabic: "الإنسان", englishName: "Man", numberOfAyahs: 31, juz: [29], type: "Medinan" },
  { number: 77, name: "Al-Mursalat", nameArabic: "المرسلات", englishName: "The Emissaries", numberOfAyahs: 50, juz: [29], type: "Meccan" },
  { number: 78, name: "An-Naba", nameArabic: "النبأ", englishName: "The Tidings", numberOfAyahs: 40, juz: [30], type: "Meccan" },
  { number: 79, name: "An-Nazi'at", nameArabic: "النازعات", englishName: "Those Who Drag Forth", numberOfAyahs: 46, juz: [30], type: "Meccan" },
  { number: 80, name: "'Abasa", nameArabic: "عبس", englishName: "He Frowned", numberOfAyahs: 42, juz: [30], type: "Meccan" },
  { number: 81, name: "At-Takwir", nameArabic: "التكوير", englishName: "The Overthrowing", numberOfAyahs: 29, juz: [30], type: "Meccan" },
  { number: 82, name: "Al-Infitar", nameArabic: "الانفطار", englishName: "The Cleaving", numberOfAyahs: 19, juz: [30], type: "Meccan" },
  { number: 83, name: "Al-Mutaffifin", nameArabic: "المطففين", englishName: "The Defrauding", numberOfAyahs: 36, juz: [30], type: "Meccan" },
  { number: 84, name: "Al-Inshiqaq", nameArabic: "الانشقاق", englishName: "The Splitting Open", numberOfAyahs: 25, juz: [30], type: "Meccan" },
  { number: 85, name: "Al-Buruj", nameArabic: "البروج", englishName: "The Mansions of the Stars", numberOfAyahs: 22, juz: [30], type: "Meccan" },
  { number: 86, name: "At-Tariq", nameArabic: "الطارق", englishName: "The Morning Star", numberOfAyahs: 17, juz: [30], type: "Meccan" },
  { number: 87, name: "Al-A'la", nameArabic: "الأعلى", englishName: "The Most High", numberOfAyahs: 19, juz: [30], type: "Meccan" },
  { number: 88, name: "Al-Ghashiyah", nameArabic: "الغاشية", englishName: "The Overwhelming", numberOfAyahs: 26, juz: [30], type: "Meccan" },
  { number: 89, name: "Al-Fajr", nameArabic: "الفجر", englishName: "The Dawn", numberOfAyahs: 30, juz: [30], type: "Meccan" },
  { number: 90, name: "Al-Balad", nameArabic: "البلد", englishName: "The City", numberOfAyahs: 20, juz: [30], type: "Meccan" },
  { number: 91, name: "Ash-Shams", nameArabic: "الشمس", englishName: "The Sun", numberOfAyahs: 15, juz: [30], type: "Meccan" },
  { number: 92, name: "Al-Layl", nameArabic: "الليل", englishName: "The Night", numberOfAyahs: 21, juz: [30], type: "Meccan" },
  { number: 93, name: "Ad-Duhaa", nameArabic: "الضحى", englishName: "The Morning Hours", numberOfAyahs: 11, juz: [30], type: "Meccan" },
  { number: 94, name: "Ash-Sharh", nameArabic: "الشرح", englishName: "The Relief", numberOfAyahs: 8, juz: [30], type: "Meccan" },
  { number: 95, name: "At-Tin", nameArabic: "التين", englishName: "The Fig", numberOfAyahs: 8, juz: [30], type: "Meccan" },
  { number: 96, name: "Al-'Alaq", nameArabic: "العلق", englishName: "The Clot", numberOfAyahs: 19, juz: [30], type: "Meccan" },
  { number: 97, name: "Al-Qadr", nameArabic: "القدر", englishName: "The Power", numberOfAyahs: 5, juz: [30], type: "Meccan" },
  { number: 98, name: "Al-Bayyinah", nameArabic: "البينة", englishName: "The Clear Proof", numberOfAyahs: 8, juz: [30], type: "Medinan" },
  { number: 99, name: "Az-Zalzalah", nameArabic: "الزلزلة", englishName: "The Earthquake", numberOfAyahs: 8, juz: [30], type: "Medinan" },
  { number: 100, name: "Al-'Adiyat", nameArabic: "العاديات", englishName: "The Courser", numberOfAyahs: 11, juz: [30], type: "Meccan" },
  { number: 101, name: "Al-Qari'ah", nameArabic: "القارعة", englishName: "The Calamity", numberOfAyahs: 11, juz: [30], type: "Meccan" },
  { number: 102, name: "At-Takathur", nameArabic: "التكاثر", englishName: "The Rivalry in World Increase", numberOfAyahs: 8, juz: [30], type: "Meccan" },
  { number: 103, name: "Al-'Asr", nameArabic: "العصر", englishName: "The Declining Day", numberOfAyahs: 3, juz: [30], type: "Meccan" },
  { number: 104, name: "Al-Humazah", nameArabic: "الهمزة", englishName: "The Traducer", numberOfAyahs: 9, juz: [30], type: "Meccan" },
  { number: 105, name: "Al-Fil", nameArabic: "الفيل", englishName: "The Elephant", numberOfAyahs: 5, juz: [30], type: "Meccan" },
  { number: 106, name: "Quraysh", nameArabic: "قريش", englishName: "Quraysh", numberOfAyahs: 4, juz: [30], type: "Meccan" },
  { number: 107, name: "Al-Ma'un", nameArabic: "الماعون", englishName: "The Small Kindnesses", numberOfAyahs: 7, juz: [30], type: "Meccan" },
  { number: 108, name: "Al-Kawthar", nameArabic: "الكوثر", englishName: "The Abundance", numberOfAyahs: 3, juz: [30], type: "Meccan" },
  { number: 109, name: "Al-Kafirun", nameArabic: "الكافرون", englishName: "The Disbelievers", numberOfAyahs: 6, juz: [30], type: "Meccan" },
  { number: 110, name: "An-Nasr", nameArabic: "النصر", englishName: "The Divine Support", numberOfAyahs: 3, juz: [30], type: "Medinan" },
  { number: 111, name: "Al-Masad", nameArabic: "المسد", englishName: "The Palm Fiber", numberOfAyahs: 5, juz: [30], type: "Meccan" },
  { number: 112, name: "Al-Ikhlas", nameArabic: "الإخلاص", englishName: "The Sincerity", numberOfAyahs: 4, juz: [30], type: "Meccan" },
  { number: 113, name: "Al-Falaq", nameArabic: "الفلق", englishName: "The Daybreak", numberOfAyahs: 5, juz: [30], type: "Meccan" },
  { number: 114, name: "An-Nas", nameArabic: "الناس", englishName: "Mankind", numberOfAyahs: 6, juz: [30], type: "Meccan" },
];

export const JUZ_NAMES: { [key: number]: { name: string; nameArabic: string } } = {
  1: { name: "Alif-Lam-Meem", nameArabic: "آلم" },
  2: { name: "Sayaqool", nameArabic: "سَيَقُولُ" },
  3: { name: "Tilka 'r-Rusul", nameArabic: "تِلْكَ الرُّسُلُ" },
  4: { name: "Lan Tanaaloo", nameArabic: "لَنْ تَنَالُوا" },
  5: { name: "Wal-Muhsanat", nameArabic: "وَالْمُحْصَنَاتُ" },
  6: { name: "La Yuhibbullah", nameArabic: "لَا يُحِبُّ اللَّهُ" },
  7: { name: "Wa Iza Sami'oo", nameArabic: "وَإِذَا سَمِعُوا" },
  8: { name: "Wa Law Annana", nameArabic: "وَلَوْ أَنَّنَا" },
  9: { name: "Qal al-Mala'u", nameArabic: "قَالَ الْمَلَأُ" },
  10: { name: "Wa'lamoo", nameArabic: "وَاعْلَمُوا" },
  11: { name: "Ya'taziroon", nameArabic: "يَعْتَذِرُونَ" },
  12: { name: "Wa Ma Min Daabbah", nameArabic: "وَمَا مِنْ دَابَّةٍ" },
  13: { name: "Wa Ma Ubri'oo", nameArabic: "وَمَا أُبَرِّئُ" },
  14: { name: "Rubama", nameArabic: "رُبَمَا" },
  15: { name: "Subhana 'lladhi", nameArabic: "سُبْحَانَ الَّذِي" },
  16: { name: "Qala Alam", nameArabic: "قَالَ أَلَمْ" },
  17: { name: "Iqtaraba li'n-Nas", nameArabic: "اقْتَرَبَ لِلنَّاسِ" },
  18: { name: "Qad Aflaha", nameArabic: "قَدْ أَفْلَحَ" },
  19: { name: "Wa Qal alladhina", nameArabic: "وَقَالَ الَّذِينَ" },
  20: { name: "Amman Khalaqa", nameArabic: "أَمَّنْ خَلَقَ" },
  21: { name: "Utlu Ma Oohiya", nameArabic: "اتْلُ مَا أُوحِيَ" },
  22: { name: "Wa Man Yaqnut", nameArabic: "وَمَنْ يَقْنُتْ" },
  23: { name: "Wa Maliya", nameArabic: "وَمَا لِيَ" },
  24: { name: "Faman Azlamu", nameArabic: "فَمَنْ أَظْلَمُ" },
  25: { name: "Ilayhi Yuraddu", nameArabic: "إِلَيْهِ يُرَدُّ" },
  26: { name: "Ha-Meem", nameArabic: "حم" },
  27: { name: "Qala Fama Khatbukum", nameArabic: "قَالَ فَمَا خَطْبُكُمْ" },
  28: { name: "Qad Sami'allah", nameArabic: "قَدْ سَمِعَ اللَّهُ" },
  29: { name: "Tabarakalladhi", nameArabic: "تَبَارَكَ الَّذِي" },
  30: { name: "'Amma Yatasa'aloon (Juz 'Amma)", nameArabic: "عَمَّ يَتَسَاءَلُونَ" },
};

export function getSurahsForJuz(juzNumber: number): QuranSurah[] {
  return QURAN_SURAHS.filter((s) => s.juz.includes(juzNumber));
}

export function calculateJuzProgress(
  juzNumber: number,
  completedSurahNumbers: number[]
): {
  totalSurahs: number;
  completedCount: number;
  percentage: number;
} {
  const surahs = getSurahsForJuz(juzNumber);
  const completedCount = surahs.filter((s) => completedSurahNumbers.includes(s.number)).length;
  const percentage = surahs.length > 0 ? Math.round((completedCount / surahs.length) * 100) : 0;
  return {
    totalSurahs: surahs.length,
    completedCount,
    percentage,
  };
}
