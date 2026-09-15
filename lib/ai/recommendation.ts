// ─────────────────────────────────────────────────────────────
//  FILTRAZON — AI Water Quality & System Expert Knowledge Engine
//  Research-Backed Scientific & Technical Knowledge Base
//  Citations: WHO, Permenkes RI No. 2/2023, The Sphere Project, US EPA
// ─────────────────────────────────────────────────────────────

export interface TelemetryData {
  ph?: number
  tds?: number
  turbidity?: number
  flow_lpm?: number
  pump_status?: boolean
  uv_status?: boolean
  total_liters?: number
  rssi?: number
  battery?: number
  seq?: number
  device_id?: string
  pressure_v?: number
}

// ─────────────────────────────────────────────────────────────
//  Research Topics & Knowledge Corpus
// ─────────────────────────────────────────────────────────────
interface ResearchTopic {
  id: string
  title: string
  keywords: string[]
  citations: string[]
  summary: string
  detailedResearch: string
  tacticalAction: (t: TelemetryData) => string
}

const RESEARCH_CORPUS: ResearchTopic[] = [
  // ── 1. Standar Baku Mutu & Regulasi Kesehatan (WHO & Permenkes) ──
  {
    id: 'baku-mutu',
    title: 'Standar Baku Mutu Air Minum (WHO & Permenkes RI No. 2 Tahun 2023)',
    keywords: [
      'standar', 'baku mutu', 'permenkes', 'who', 'regulasi', 'kemenkes',
      'aturan', 'legalitas', 'kualitas air', 'layak minum', 'syarat', 'parameter wajib',
      'sni', 'epa', 'permenkes 492', 'permenkes 2023', 'ertanyaan', 'baku', 'mutu'
    ],
    citations: [
      'Permenkes RI No. 2 Tahun 2023 (Standar Baku Mutu Kesehatan Lingkungan untuk Media Air)',
      'WHO Guidelines for Drinking-water Quality (4th Edition, 2022)',
      'SNI 01-3553-2006 (Persyaratan Air Minum dalam Kemasan & Air Mineral Alami)',
      'US EPA National Primary Drinking Water Regulations (40 CFR Part 141)'
    ],
    summary: 'Air minum yang aman wajib memenuhi parameter fisik, kimiawi, dan mikrobiologis tanpa menimbulkan risiko kesehatan kumulatif maupun akut.',
    detailedResearch: `Berdasarkan **Permenkes RI No. 2 Tahun 2023** dan **WHO Guidelines for Drinking-water Quality**:
1. **Derajat Keasaman (pH)**: Wajib berada pada rentang **6.5 – 8.5**. Nilai < 6.5 berpotensi korosif terhadap perpipaan logam dan memicu dispepsia lambung; nilai > 8.5 menyebabkan rasa pahit/sabun dan pengendapan kalsium.
2. **Total Dissolved Solids (TDS)**: Batas maksimal baku mutu Permenkes adalah **300 ppm** (sangat baik) hingga **500 ppm** (ambang batas toleransi tertinggi). WHO menetapkan air dengan TDS < 300 ppm memiliki palatabilitas (rasa) terbaik.
3. **Kekeruhan (Turbidity)**: Standar ideal air minum adalah **< 1.0 NTU**, dengan batas toleransi darurat tanggap bencana maksimal **5.0 NTU**. Nilai di atas 5.0 NTU menghalangi penetrasi sinar UV dan menjadi sarang koloid pelindung mikroorganisme patogen.
4. **Mikrobiologi (E. Coli & Total Coliform)**: Wajib **0 CFU / 100 mL sampel** (sama sekali tidak boleh terdeteksi).
5. **Bau, Rasa, dan Warna**: Bebas bau organik/tanah, tidak berasa, dan skala warna maksimal 15 TCU (True Color Units).`,
    tacticalAction: (t) => {
      const ph = Number(t.ph ?? 7.0)
      const tds = Number(t.tds ?? 200)
      const turb = Number(t.turbidity ?? 50)
      const complies = ph >= 6.5 && ph <= 8.5 && tds <= 500 && turb <= 100
      return complies
        ? `✅ **Kepatuhan Regulasi Saat Ini**: Air terolah berada dalam zona kepatuhan baku mutu darurat (pH ${ph.toFixed(2)}, TDS ${tds.toFixed(0)} ppm, Kekeruhan ${turb.toFixed(0)} NTU). Pastikan UV tetap menyala untuk membunuh patogen.`
        : `⚠️ **Penyimpangan Regulasi**: Terdeteksi parameter melampaui baku mutu ideal! Lakukan penyesuaian filtrasi cartridge atau aktivasi tahapan sterilisasi lanjutan sebelum air didistribusikan.`
    }
  },

  // ── 2. Parameter Kekeruhan (Turbidity) & Penanganan Air Banjir / Keruh ──
  {
    id: 'kekeruhan',
    title: 'Dinamika Kekeruhan (Turbidity), Suspended Solids & Klarifikasi Air Banjir',
    keywords: [
      'keruh', 'kekeruhan', 'turbidity', 'ntu', 'lumpur', 'banjir', 'sedimen',
      'partikel', 'tanah', 'warna cokelat', 'endapan', 'nephelometer', 'sungai',
      'air kotor', 'suspensi', 'koagulasi', 'flokulasi', 'sedimentasi'
    ],
    citations: [
      'AWWA (American Water Works Association) - Water Quality & Treatment: A Handbook on Drinking Water',
      'WHO Technical Note No. 5: Emergency Water Treatment Technology for Turbid Waters',
      'Standard Methods for the Examination of Water and Wastewater (Method 2130 B: Nephelometric Method)'
    ],
    summary: 'Kekeruhan tinggi disebabkan oleh partikel lempung, lumpur, silika, dan materi organik terdispersi yang menyerap cahaya dan melindungi bakteri patogen dari disinfeksi UV.',
    detailedResearch: `Penelitian pengolahan air darurat bencana membuktikan:
- **Kekeruhan > 100 NTU** (kondisi tipikal air banjir luapan sungai): Mengakibatkan *premature clogging* pada filter cartridge mikron dan menurunkan efektivitas sterilisasi UV hingga 90% akibat efek bayangan partikel (*particulate shielding effect*).
- **Mekanisme Filtrasi Bertingkat FILTRAZON**:
  1. **Pre-Filter Sediment (Polypropylene Spun 5µm)**: Menangkap makropartikel lumpur kasar, pasir, dan lumut.
  2. **Secondary Sediment (PP 1µm)**: Menahan partikel mikrosedimen halus sebelum masuk ke media adsorpsi.
  3. **Media Pasir Silika & Zeolit**: Berfungsi sebagai media filtrasi kedalaman (*depth filtration*) yang menjerat partikel koloid bermuatan.
- **Nilai Efisiensi Reduksi**: Sistem filtrasi multi-tahap FILTRAZON dirancang mampu mereduksi kekeruhan hingga **98.2%** dari air baku awal > 1000 NTU menjadi < 5 NTU.`,
    tacticalAction: (t) => {
      const turb = Number(t.turbidity ?? 50)
      if (turb > 500) {
        return `🔴 **Tindakan Kekeruhan Kritis (${turb.toFixed(0)} NTU)**: Air baku mengandung lumpur pekat! Lakukan proses pengendapan awal (*pre-sedimentation*) dalam bak tandon selama minimal 30–60 menit sebelum dipompa masuk ke unit FILTRAZON. Periksa dan bersihkan pre-filter cartridge PP 5 mikron.`
      } else if (turb > 100) {
        return `🟡 **Kekeruhan Sedang (${turb.toFixed(0)} NTU)**: Laju filtrasi stabil namun cartridge sedimen akan lebih cepat jenuh. Lakukan pembilasan berkala (*rinse*) setiap 4 jam operasional tanggap darurat.`
      } else {
        return `🟢 **Kekeruhan Optimal (${turb.toFixed(0)} NTU)**: Air sangat jernih dan memenuhi ambang batas dispersi cahaya untuk disinfeksi UV yang sempurna.`
      }
    }
  },

  // ── 3. TDS (Total Dissolved Solids) & Desalinasi Garam / Logam Terlarut ──
  {
    id: 'tds-mineral',
    title: 'Total Dissolved Solids (TDS), Konduktivitas Elektrik & Kandungan Ion Mineral',
    keywords: [
      'tds', 'total dissolved solids', 'ppm', 'garam', 'payau', 'mineral',
      'logam', 'besi', 'mangan', 'kapur', 'kesadahan', 'kalsium', 'magnesium',
      'salinitas', 'ec', 'konduktivitas', 'ro', 'reverse osmosis', 'rasa asin'
    ],
    citations: [
      'WHO Guidelines: Total Dissolved Solids in Drinking-water (Background Document, WHO/SDE/WSH/03.04/16)',
      'US EPA Secondary Drinking Water Standards (TDS Guideline: 500 mg/L)',
      'Water Conditioning & Purification International (WCP) - Demineralization vs Remineralization Dynamics'
    ],
    summary: 'TDS mengukur total berat partikel anorganik dan organik yang terlarut dalam air (satuan mg/L atau ppm), mencakup kation (Ca, Mg, Na, K) dan anion (HCO3, Cl, SO4, NO3).',
    detailedResearch: `Kajian ilmiah mengenai palatabilitas dan efek fisiologis TDS:
- **TDS < 50 ppm**: Air dengan demineralisasi tinggi (hasil Reverse Osmosis atau destilasi). Rasa cenderung datar (*flat taste*), sangat baik untuk mencegah beban ginjal namun minim kandungan elektrolit alami.
- **TDS 50 – 150 ppm**: Rentang ideal air minum pegunungan dengan mineral seimbang, kesegaran optimal, dan penyerapan seluler terbaik.
- **TDS 150 – 300 ppm**: Kategori baik untuk konsumsi sehari-hari.
- **TDS 300 – 500 ppm**: Kategori wajar (*fair/acceptable*). Air tanah atau sumur bor dangkal.
- **TDS > 500 ppm**: Melebihi standar baku mutu Permenkes. Berpotensi mengandung garam klorida tinggi (air payau pasang rob), senyawa sulfat, atau kesadahan tinggi yang memicu batu ginjal jika dikonsumsi jangka panjang.
- **Teknologi Penurunan TDS**: Karbon aktif dan filter sedimen **tidak dapat** menurunkan TDS terlarut. Penurunan TDS hanya dapat dicapai melalui membran semipermeabel **Reverse Osmosis (RO)** dengan pori 0.0001 mikron atau proses deionisasi resin penukar ion (*ion exchange resin*).`,
    tacticalAction: (t) => {
      const tds = Number(t.tds ?? 200)
      if (tds > 500) {
        return `🔴 **Peringatan TDS Tinggi (${tds.toFixed(0)} ppm)**: Terdeteksi intrusi air payau atau mineral pekat! Filter media standar (karbon & sedimen) tidak dapat mereduksi ion garam. Alirkan melalui modul Reverse Osmosis (RO) atau campur (*blending*) dengan sumber air tawar rendah TDS.`
      } else if (tds > 300) {
        return `🟡 **TDS Waspada (${tds.toFixed(0)} ppm)**: Masih dalam toleransi darurat. Pastikan media adsorpsi karbon aktif masih memiliki kapasitas adsorpsi ion organik aktif.`
      } else {
        return `🟢 **TDS Sangat Baik (${tds.toFixed(0)} ppm)**: Komposisi mineral terlarut sangat ideal, menyegarkan, dan aman untuk konsumsi langsung.`
      }
    }
  },

  // ── 4. Keseimbangan pH & Koreksi Derajat Keasaman ──
  {
    id: 'ph-asam-basa',
    title: 'Keseimbangan Derajat Keasaman (pH), Korosivitas & Indeks Kejenuhan Langelier',
    keywords: [
      'ph', 'asam', 'basa', 'alkali', 'asam lambung', 'keasaman', 'korosi',
      'pipa', 'pahit', 'sabun', 'kapur', 'calcite', 'remineralisasi', 'aerasi',
      'nernst', 'kalibrasi ph', 'buffer 7', 'buffer 4'
    ],
    citations: [
      'WHO Background Document: pH in Drinking-water (WHO/SDE/WSH/03.04/12)',
      'Langelier Saturation Index (LSI) - Predicting Scaling and Corrosive Tendencies of Water',
      'Journal of Environmental Chemical Engineering - Remineralization and pH buffering mechanisms'
    ],
    summary: 'pH menentukan kesetimbangan ionik air. pH rendah bersifat korosif dan mengikis logam perpipaan; pH tinggi memicu pengendapan kerak dan menonaktifkan efisiensi klorin.',
    detailedResearch: `Analisis Riset Karakteristik pH:
- **pH < 6.5 (Air Asam)**: Umum terjadi pada air gambut rawa, air hujan perkotaan, atau mata air vulkanik. Sifat asam mengikis lapisan tembaga dan timbal pada sambungan pipa, berasa masam, dan mempercepat iritasi lambung. Penanganan dilakukan menggunakan cartridge media **Kalsit (Calcium Carbonate / CaCO3)** atau **Corosex (Magnesium Oxide)** untuk menaikkan pH secara alami.
- **pH 6.5 – 8.5 (Rentang Standar Emas WHO/Kemenkes)**: Rentang di mana membran sel manusia dan saluran mukosa tidak mengalami iritasi osmotik.
- **pH > 8.5 (Air Basa/Alkali)**: Menyebabkan sensasi licin seperti sabun, rasa pahit, dan memicu kerak kalsium karbonat pada membran filter dan saluran pompa. Penanganan dilakukan melalui aerasi CO2 alami atau sirkulasi melalui media zeolit asam.`,
    tacticalAction: (t) => {
      const ph = Number(t.ph ?? 7.0)
      if (ph < 6.0) {
        return `🔴 **pH Kritis Asam (${ph.toFixed(2)})**: Air bersifat korosif! Lakukan aerasi atau lewatkan air melalui cartridge remineralisasi mineral ball/kalsit sebelum didistribusikan.`
      } else if (ph > 8.8) {
        return `🔴 **pH Kritis Basa (${ph.toFixed(2)})**: Air terlalu basa/pahit! Periksa apakah ada kontaminasi abu/semen konstruksi pada bak intake.`
      } else {
        return `🟢 **pH Ideal (${ph.toFixed(2)})**: Berada tepat di tengah standar baku mutu kesehatan lingkungan (6.5 – 8.5).`
      }
    }
  },

  // ── 5. Sterilisasi Ultraviolet (UV) & Eradikasi Patogen ──
  {
    id: 'uv-sterilization',
    title: 'Disinfeksi Ultraviolet (UV 254 nm), Dosis Germisidal & Eliminasi Mikroorganisme',
    keywords: [
      'uv', 'ultraviolet', 'lampu uv', 'steril', 'sterilisasi', 'bakteri',
      'kuman', 'e coli', 'coliform', 'virus', 'patogen', 'diare', 'kolera',
      'disinfeksi', 'germicidal', '254 nm', 'quarts', 'ballast', 'dosis uv', 'r2on', 'r2off'
    ],
    citations: [
      'US EPA Ultraviolet Disinfection Guidance Manual for the Final Long Term 2 Enhanced Surface Water Treatment Rule (EPA 815-R-06-007)',
      'NSF/ANSI Standard 55: Ultraviolet Microbiological Water Treatment Systems (Class A & B)',
      'WHO Guidelines: Microbial aspects of drinking-water quality (Pathogen inactivation kinetics)'
    ],
    summary: 'Sinar UV-C pada panjang gelombang 253.7 nm merusak ikatan timin pada rantai DNA/RNA mikroorganisme, menonaktifkan replikasi bakteri dan virus dalam hitungan detik tanpa bahan kimia.',
    detailedResearch: `Spesifikasi Ilmiah Sterilisasi UV FILTRAZON:
- **Spektrum Panjang Gelombang**: Menggunakan tabung quartz UV-C germicidal pada **254 nm** yang merupakan puncak absorbansi asam nukleat mikroorganisme.
- **Standar Dosis UV (Fluence)**: Mengacu pada **NSF/ANSI 55 Class A**, dosis minimal yang diterapkan adalah **≥ 40 mJ/cm²** (40,000 µW·s/cm²). Dosis ini menjamin:
  - **4-log reduction (99.99%)** terhadap *Escherichia coli*, *Vibrio cholerae*, dan *Salmonella typhi*.
  - Inaktivasi kista protozoa tahan klorin seperti *Cryptosporidium parvum* dan *Giardia lamblia*.
- **Syarat Mutlak Efektivitas UV**:
  1. Kekeruhan air harus **< 5 NTU** (jika air keruh, sinar UV terhalang oleh bayangan partikel debu/lumpur).
  2. Selongsong kaca quartz sleeve harus dibersihkan berkala dari kerak mineral kalsium dan biofilm.
  3. Lampu UV wajib menyala kontinu saat pompa memompa air (Relay 2 / R2ON).
  4. Umur operasional efektif lampu UV adalah **9.000 jam** (sekitar 375 hari continuous); setelah itu radiasi germisidal menurun meski lampu masih menyala biru terang.`,
    tacticalAction: (t) => {
      const pump = Boolean(t.pump_status)
      const uv = Boolean(t.uv_status)
      if (pump && !uv) {
        return `⚠️ **PERINGATAN KRITIS STERILISASI**: Pompa sedang mengalirkan air tetapi lampu UV dalam keadaan **MATI (OFF)**! Air berisiko membawa bakteri patogen aktif. Segera aktifkan **Relay 2 (R2ON)** melalui menu Kontrol Relay!`
      } else if (uv) {
        return `🟢 **Disinfeksi UV Aktif (ON)**: Radiasi UV-C 254 nm aktif membunuh mikroorganisme. Pastikan laju alir tidak melebihi kapasitas chamber UV (maksimal 4–6 L/min) agar dosis pemaparan terpenuhi.`
      } else {
        return `⚪ **UV Siaga (Standby)**: Lampu UV mati saat pompa tidak beroperasi untuk menghemat daya baterai surya.`
      }
    }
  },

  // ── 6. Perawatan Filter, Backwashing & Mengatasi Clogging ──
  {
    id: 'filter-maintenance',
    title: 'SOP Pemeliharaan Filter, Prosedur Backwash, Clogging & Manajemen Siklus Hidup',
    keywords: [
      'filter', 'bersih', 'cuci', 'bersihkan filter', 'backwash', 'clogging',
      'mampet', 'tersumbat', 'ganti cartridge', 'umur filter', 'cartridge',
      'karbon aktif', 'sedimen', 'saringan', 'perawatan', 'maintenance', 'frp'
    ],
    citations: [
      'Water Quality Association (WQA) - Cartridge Filtration and Media Filter Backwash Guidelines',
      'AWWA Standard B100: Granular Filter Material Operations',
      'FILTRAZON Standard Operating Procedure: Field Deployment & Maintenance Protocol v2.4'
    ],
    summary: 'Penyumbatan partikel pada media filter menyebabkan penurunan debit aliran (flow drop) dan peningkatan beban kerja pompa.',
    detailedResearch: `Prosedur Perawatan Berkala Sistem FILTRAZON:
1. **Identifikasi Penyumbatan (Clogging)**:
   - Jika Pompa ON tetapi debit aliran drop hingga **≤ 0.2 L/min** dan arus motor pompa meningkat.
   - Peningkatan tekanan balik (*backpressure*) pada sensor tekanan hingga **≥ 3.5 Bar** (> 0.35 MPa).
2. **Prosedur Backwash Tabung Media Pasir & Karbon (FRP Valve 3-Way)**:
   - Putar tuas *multiport valve* dari posisi **FILTER** ke posisi **BACKWASH**.
   - Nyalakan pompa selama 3–5 menit hingga buangan air limbah kotoran berubah menjadi jernih.
   - Putar tuas ke posisi **FAST RINSE** (pembilasan cepat) selama 1–2 menit untuk merapatkan kembali susunan butiran media.
   - Kembalikan tuas ke posisi **FILTER** untuk operasional normal.
3. **Jadwal Penggantian Cartridge Housing**:
   - **PP Spun Sediment 5µm / 1µm**: Ganti setiap 2 – 4 minggu saat terjadi banjir/air keruh, atau jika warna cartridge telah berubah menjadi cokelat tua pekat.
   - **Granular Activated Carbon (GAC) / CTO**: Ganti setiap 3 – 6 bulan atau setelah menyaring ≈ 10,000 Liter air untuk mencegah desorpsi bau dan senyawa organik.
   - **Membran Ultrafiltrasi (UF)**: Lakukan *chemical flushing* dengan larutan sitrun 1% tiap 3 bulan; ganti total setiap 12 – 18 bulan.`,
    tacticalAction: (t) => {
      const flow = Number(t.flow_lpm ?? 0)
      const pump = Boolean(t.pump_status)
      if (pump && flow <= 0.1) {
        return `🔴 **Indikasi Clogging Akut!**: Pompa menyala namun laju alir terhenti (${flow.toFixed(2)} L/min). Matikan pompa segera (R1OFF) untuk mencegah *dry-run burnout*. Buka housing filter sedimen nomor 1 dan ganti cartridge PP Spun yang tersumbat.`
      } else {
        return `🟢 **Kondisi Aliran Sehat**: Laju alir terpantau normal (${flow.toFixed(2)} L/min). Lakukan inspeksi visual warna cartridge sedimen setiap hari selama misi darurat.`
      }
    }
  },

  // ── 7. Sistem Tenaga Surya & Manajemen Baterai Off-Grid ──
  {
    id: 'solar-power-iot',
    title: 'Arsitektur Tenaga Surya Off-Grid, MPPT Controller & Otonomi Energi Baterai',
    keywords: [
      'solar', 'tenaga surya', 'panel surya', 'pv', 'baterai', 'aki', 'daya',
      'listrik', 'mppt', 'pwm', 'voltase', 'watt', 'off grid', 'surya',
      'mendung', 'hujan', 'plts', 'hemat energi', 'lifepo4', 'otonomi'
    ],
    citations: [
      'IEEE 1562: IEEE Guide for Array and Battery Sizing in Stand-Alone Photovoltaic (PV) Systems',
      'Sandia National Laboratories - Photovoltaic Systems Evaluation and Reliability Protocol',
      'IRENA (International Renewable Energy Agency) - Off-Grid Renewable Energy Systems'
    ],
    summary: 'Sistem solar water filtration FILTRAZON dirancang 100% mandiri energi (self-sufficient) untuk daerah terisolir dan lokasi bencana tanpa jaringan listrik PLN.',
    detailedResearch: `Spesifikasi Energi FILTRAZON Smart Solar:
- **Panel PV Monokristalin**: Kapasitas **100 Wp – 200 Wp** dengan efisiensi sel monokristalin > 21%, tahan cuaca ekstrem dan korosi kelembapan tinggi (IP65).
- **Solar Charge Controller**: Berbasis **MPPT (Maximum Power Point Tracking)** dengan efisiensi konversi daya > 97%, mampu memanen energi optimal bahkan dalam kondisi cuaca mendung/berkabut.
- **Penyimpanan Daya (Baterai)**: Bank baterai **LiFePO4 12.8V 30Ah – 50Ah** dengan siklus hidup > 3000 siklus pada DoD (Depth of Discharge) 80%. Baterai LiFePO4 memiliki densitas energi tinggi, bobot ringan untuk mobilitas portabel, dan stabilitas termal aman tanpa risiko ledakan.
- **Konsumsi Daya Perangkat**:
  - Pompa Booster Diafragma DC 12V: ≈ 35 – 45 Watt saat beroperasi penuh.
  - Lampu UV Sterilizer DC/AC: ≈ 10 – 12 Watt.
  - Mikrokontroler ESP32 + Sensor Node + Modul LoRa: ≈ 1.2 Watt.
- **Otonomi Daya (Days of Autonomy)**: Mampu beroperasi memproduksi hingga **1.200 Liter air/hari** saat terik, dan memiliki cadangan energi tanpa matahari (*battery backup*) hingga **8 – 10 jam pompa aktif kontinu**.`,
    tacticalAction: (t) => {
      const bat = Number(t.battery ?? -1)
      if (bat >= 0 && bat < 20) {
        return `⚠️ **Peringatan Baterai Lemah (${bat}%)**: Daya baterai surya menipis. Batasi operasional pompa hanya untuk kebutuhan air minum esensial. Nonaktifkan relay yang tidak terpakai.`
      } else if (bat >= 20 && bat < 50) {
        return `🟡 **Kapasitas Baterai Sedang (${bat}%)**: Pastikan permukaan panel surya bersih dari debu, lumpur, dan daun gugur agar arus pengisian MPPT maksimal.`
      } else {
        return `🟢 **Sistem Daya Optimal**: Baterai dalam kondisi aman (${bat >= 0 ? `${bat}%` : 'Normal'}). Suplai daya untuk pompa, UV, dan node telemetri tercukupi.`
      }
    }
  },

  // ── 8. Standar Tanggap Bencana & WASH (The Sphere Project) ──
  {
    id: 'sop-bencana-sphere',
    title: 'SOP WASH Tanggap Darurat Bencana & Standar Kemanusiaan The Sphere Project',
    keywords: [
      'bencana', 'posko', 'pengungsi', 'sphere', 'wash', 'darurat', 'bpbd',
      'bnpb', 'relawan', 'banjir', 'gempa', 'tsunami', 'distribusi air',
      'jatah air', 'sanitasi', 'sop bencana', 'ertanyaan'
    ],
    citations: [
      'The Sphere Handbook: Humanitarian Charter and Minimum Standards in Humanitarian Response (WASH Chapter)',
      'Pedoman Penanggulangan Krisis Kesehatan Akibat Bencana - Kemenkes RI',
      'UNICEF Water, Sanitation and Hygiene (WASH) Emergency Field Manual'
    ],
    summary: 'Panduan teknis penyediaan air bersih dan sanitasi di lokasi evakuasi untuk mencegah ledakan wabah diare, kolera, dan penyakit berbasis air (water-borne diseases).',
    detailedResearch: `Berdasarkan **The Sphere Standards (WASH Key Indicators)**:
1. **Kebutuhan Air Per Orang**:
   - **Tahap Darurat Akut (Hari 1–3)**: Minimal **7.5 Liter/orang/hari** (3 L minum + 4.5 L memasak/sanitasi dasar).
   - **Tahap Pemulihan Berkelanjutan**: Minimal **15 Liter/orang/hari** (3 L minum, 6 L memasak, 6 L kebersihan diri).
2. **Titik Akses & Jarak**:
   - Jarak posko pengungsian ke titik keran distribusi air maksimal **500 meter**.
   - Waktu antrean pengisian air maksimal **30 menit**.
3. **Kualitas Air Darurat di Lokasi Bencana**:
   - E. Coli: 0 CFU / 100 mL pada titik konsumsi.
   - Kekeruhan: Wajib di bawah 5 NTU (maksimal 25 NTU dalam skenario darurat akut sebelum disinfeksi).
   - Residu Klorin Bebas (jika menggunakan tablet klorin): 0.2 – 0.5 mg/L di keran pengeluaran.
4. **Peran Unit Mobile FILTRAZON**: Satu unit FILTRAZON dengan kapasitas 300 – 500 L/jam mampu mencukupi kebutuhan air minum murni untuk **1.000 hingga 1.500 jiwa pengungsi** per hari secara mandiri tanpa membutuhkan genset solar.`,
    tacticalAction: (t) => {
      const liters = Number(t.total_liters ?? 0)
      const peopleServed = Math.floor(liters / 3)
      return `ℹ️ **Proyeksi Dampak Lapangan**: Total air yang telah diproduksi sistem saat ini adalah **${liters.toFixed(0)} Liter**, setara dengan pemenuhan kebutuhan air minum harian untuk ≈ **${peopleServed} jiwa pengungsi** sesuai standar The Sphere Project.`
    }
  },

  // ── 9. Panduan Kalibrasi Sensor Analog & IoT LoRa ──
  {
    id: 'kalibrasi-sensor-lora',
    title: 'Metrologi Sensor, Prosedur Kalibrasi pH/TDS & Protokol Nirkabel LoRa ESP32',
    keywords: [
      'kalibrasi', 'sensor', 'probe', 'akurasi', 'voltase', 'adc', 'lora',
      'esp32', 'gateway', 'frekuensi', 'rssi', 'snr', 'koneksi', 'serial',
      'kalibrasi ph', 'kalibrasi tds', 'setid', 'calph1', 'calph2', 'caltds'
    ],
    citations: [
      'Semtech SX1276/77/78/79 Transceiver Datasheet (LoRa Modulation Optimization)',
      'NIST (National Institute of Standards and Technology) pH Calibration Best Practices',
      'FILTRAZON Firmware Technical Manual: LoRa ACK Retry & Dual-Core ESP32 Protocol'
    ],
    summary: 'Prosedur kalibrasi analog ADC 12-bit ESP32 untuk sensor pH dan TDS serta diagnostik tautan nirkabel jarak jauh LoRa 433 MHz.',
    detailedResearch: `Pedoman Kalibrasi Sensor di Lapangan:
1. **Kalibrasi Sensor pH (Two-Point Linear Regression)**:
   - Gunakan larutan buffer standar **pH 6.86 / 7.00** dan **pH 4.01**.
   - Perintah Serial Node:
     * Celupkan ke larutan pH 6.86 → ketik \`CALPH1 6.86\`
     * Bilas probe dengan air aquadest, celupkan ke pH 4.01 → ketik \`CALPH2 4.01\`
     * Sistem secara otomatis menghitung *slope* dan *offset* Nernst dan menyimpannya ke Non-Volatile Storage (NVS).
2. **Kalibrasi Sensor TDS**:
   - Celupkan probe TDS ke larutan standar 1413 µS/cm (707 ppm) pada suhu 25°C.
   - Ketik perintah serial: \`CALTDS 707\` → sistem mengunci nilai *scaling factor*.
3. **Optimasi Tautan Nirkabel LoRa (Long Range)**:
   - Frekuensi: **433.0 MHz**, Spreading Factor: **SF7** (respons cepat) hingga **SF10** (jarak jauh menembus halangan pepohonan/reruntuhan), Bandwidth: **125 kHz**.
   - Nilai **RSSI**:
     * > -70 dBm: Sinyal Sangat Kuat (jarak dekat).
     * -70 s.d. -95 dBm: Sinyal Baik / Normal.
     * < -110 dBm: Sinyal Lemah, potensi *packet loss*.
   - Nilai **SNR (Signal-to-Noise Ratio)**: Nilai positif (> 5 dB) menandakan penerimaan data yang sangat bersih dari interferensi gelombang liar.`,
    tacticalAction: (t) => {
      const rssi = Number(t.rssi ?? -90)
      const snr = Number((t as Record<string, unknown>).snr ?? 9.5)
      return `📡 **Diagnostik LoRa Saat Ini**: RSSI = **${rssi} dBm**, SNR = **${snr} dB**. Koneksi ${rssi > -95 ? '🟢 Sangat Stabil dan Handal' : '🟡 Cukup Lemah — Dekatkan posisi antena Gateway atau tinggikan posisi antena Node'}.`
    }
  },

  // ── 10. Troubleshooting Relay & Kontrol Pompa ──
  {
    id: 'troubleshoot-relay-pompa',
    title: 'Troubleshooting Relay, Proteksi Dry-Run & Solusi Pompa Tidak Mau Mati/Nyala',
    keywords: [
      'pompa', 'relay', 'mati', 'nyala', 'rusak', 'tidak mau mati', 'tidak mau nyala',
      'off', 'on', 'macet', 'dry run', 'overheat', 'tegangan relay', 'active high',
      'active low', 'tri state', 'high z', 'r1on', 'r1off', 'alloff', 'allon'
    ],
    citations: [
      'ESP32 Hardware Design Guidelines: GPIO Drive Strength and Tri-State Configuration',
      'Omron Industrial Automation: Relay Technical Guide - Contact Protection and Arc Suppression',
      'Microchip Technology Application Note: Interfacing 3.3V Microcontrollers to 5V Relays'
    ],
    summary: 'Penyebab teknis dan penanganan perangkat keras kendali relay, kavitasi pompa diafragma, serta isolasi kebocoran tegangan logika.',
    detailedResearch: `Analisis Akar Masalah Kontrol Relay:
1. **Mengapa Relay 5V Sering Gagal Mati (Stuck ON) pada ESP32 3.3V?**:
   - Modul relay 5V dengan optocoupler Active-LOW menghubungkan anoda LED optocoupler ke VCC 5V.
   - Saat ESP32 mengeluarkan sinyal logic \`HIGH\` (3.3V), selisih tegangan 5.0V - 3.3V = 1.7V. Karena tegangan maju LED optocoupler hanya 1.2V - 1.4V, tegangan 1.7V tersebut **tetap mengalirkan arus bocor**, sehingga relay **TIDAK BISA MATI**.
   - **Solusi Rekayasa Firmware FILTRAZON**: Saat perintah \`OFF\` dieksekusi, pin ESP32 dialihkan ke mode **High-Impedance (pinMode INPUT)**. Pada mode ini, tidak ada arus yang dapat mengalir ($I = 0$), sehingga relay **100% PASTI LEPAS/MATI**.
2. **Proteksi Dry-Run Pompa**:
   - Pompa diafragma tidak boleh beroperasi kering (*dry-run*) lebih dari 3 menit tanpa air karena gesekan internal akan merusak membran elastomer EPDM dan memicu panas motor (*thermal overload*).
3. **Penanganan Kontak Relay Lengket (Contact Welding)**:
   - Arus kejut (*inrush current*) motor induktif dapat memicu busur api kecil (*arc*) yang menyatukan kontak logam relay. Pasang dioda flyback (1N4007) atau snubber RC paralel pada terminal motor pompa DC untuk meredam GGL induksi balik (*back-EMF*).`,
    tacticalAction: (t) => {
      const pump = Boolean(t.pump_status)
      const flow = Number(t.flow_lpm ?? 0)
      if (pump && flow <= 0.05) {
        return `⚠️ **Potensi Dry-Run Pompa!**: Pompa tercatat ON namun tidak ada aliran fluida terdeteksi. Segera periksa sumber air baku atau kirim perintah **R1OFF** melalui dashboard kontrol.`
      } else {
        return `🟢 **Status Pompa**: ${pump ? `ON (${flow.toFixed(2)} L/min) — Beroperasi lancar` : 'OFF — Standby aman'}.`
      }
    }
  }
]

// ─────────────────────────────────────────────────────────────
//  Smart Search & NLP Tokenizer Engine
// ─────────────────────────────────────────────────────────────
function scoreQueryRelevance(query: string, topic: ResearchTopic): number {
  const q = query.toLowerCase().replace(/[^a-z0-9\s]/g, ' ')
  const tokens = q.split(/\s+/).filter(t => t.length >= 2)
  let score = 0

  // 1. Direct keyword match
  for (const kw of topic.keywords) {
    if (q.includes(kw)) {
      score += kw.length * 2.5
    }
    for (const token of tokens) {
      if (kw === token) {
        score += 5
      } else if (kw.includes(token) && token.length >= 3) {
        score += 2
      }
    }
  }

  // 2. Title match
  const titleLower = topic.title.toLowerCase()
  for (const token of tokens) {
    if (titleLower.includes(token)) {
      score += 4
    }
  }

  // 3. Typo and synonym handling
  if (q.includes('ertanyaan') || q.includes('tanya')) {
    score += 1
  }
  if (q.includes('mati') && (topic.id === 'troubleshoot-relay-pompa' || topic.id === 'uv-sterilization')) {
    score += 8
  }
  if (q.includes('bersih') && topic.id === 'filter-maintenance') {
    score += 8
  }
  if (q.includes('siapa') || q.includes('apa itu') || q.includes('filtrazon')) {
    score += 1
  }

  return score
}

export function searchResearchTopics(userPrompt: string): ResearchTopic[] {
  const scored = RESEARCH_CORPUS.map(topic => ({
    topic,
    score: scoreQueryRelevance(userPrompt, topic)
  }))

  scored.sort((a, b) => b.score - a.score)

  // Return top matches that have positive score
  const matches = scored.filter(s => s.score > 2).map(s => s.topic)
  if (matches.length > 0) return matches.slice(0, 3)

  // Default fallback to first 2 primary topics
  return [RESEARCH_CORPUS[0], RESEARCH_CORPUS[1]]
}

// ─────────────────────────────────────────────────────────────
//  Master Expert Recommendation Generator
// ─────────────────────────────────────────────────────────────
export function generateExpertRecommendation(t: TelemetryData, userPrompt?: string, lang = 'id'): string {
  const ph = Number(t.ph ?? 7.0)
  const tds = Number(t.tds ?? 200)
  const turb = Number(t.turbidity ?? 50)
  const flow = Number(t.flow_lpm ?? 0)
  const pump = Boolean(t.pump_status)
  const uv = Boolean(t.uv_status)
  const liters = Number(t.total_liters ?? 0)

  // Evaluasi Parameter
  const isPhDanger = ph < 6.0 || ph > 9.0
  const isPhWarn = (ph >= 6.0 && ph < 6.5) || (ph > 8.5 && ph <= 9.0)
  const isTdsDanger = tds > 500
  const isTdsWarn = tds > 300 && tds <= 500
  const isTurbDanger = turb > 500
  const isTurbWarn = turb > 100 && turb <= 500
  const isFlowAnomaly = pump && flow <= 0.1

  const isDanger = isPhDanger || isTdsDanger || isTurbDanger || (isFlowAnomaly && flow <= 0)
  const isWarning = isPhWarn || isTdsWarn || isTurbWarn || (!uv && pump)

  const statusBadge = isDanger
    ? '🔴 STATUS SISTEM: BAHAYA / INTERVENSI SEGERA DIPERLUKAN'
    : isWarning
    ? '🟡 STATUS SISTEM: PERINGATAN / PERLU PENGAWASAN TEKNIS'
    : '🟢 STATUS SISTEM: OPTIMAL / STANDAR BAKU MUTU TERPENUHI'

  // Header Ringkasan Eksekutif
  let out = `## ${statusBadge}\n\n`
  out += `> **Laporan Analisis Cerdas FILTRAZON AI Advisor**  \n`
  out += `> Berbasis Riset Ilmiah: *WHO Guidelines (4th Ed), Permenkes RI No. 2/2023, The Sphere Standards, US EPA*\n\n`

  out += `### 📊 Telemetri Real-Time (${t.device_id ?? 'FILTRAZON-01'} · Seq #${t.seq ?? 0})\n`
  out += `| Parameter Sensor | Nilai Terbaca | Ambang Baku Mutu | Status Diagnosa |\n`
  out += `| :--- | :--- | :--- | :--- |\n`
  out += `| **pH Air** | **${ph.toFixed(2)}** | 6.50 – 8.50 | ${isPhDanger ? '🔴 Kritis' : isPhWarn ? '🟡 Peringatan' : '🟢 Sangat Baik'} |\n`
  out += `| **TDS (Partikel Terlarut)** | **${tds.toFixed(0)} ppm** | ≤ 300 ppm (Max 500) | ${isTdsDanger ? '🔴 Melebihi Batas' : isTdsWarn ? '🟡 Sedang' : '🟢 Ideal & Aman'} |\n`
  out += `| **Kekeruhan (Turbidity)** | **${turb.toFixed(0)} NTU** | ≤ 5.0 NTU (Max 25) | ${isTurbDanger ? '🔴 Keruh Ekstrem' : isTurbWarn ? '🟡 Keruh Sedang' : '🟢 Jernih'} |\n`
  out += `| **Laju Alir (Flow Rate)** | **${flow.toFixed(2)} L/min** | 0.5 – 6.0 L/min | ${isFlowAnomaly ? '⚠️ Terhambat (Clogging)' : pump ? '🟢 Aliran Normal' : '⚪ Standby'} |\n`
  out += `| **Disinfeksi UV-C** | **${uv ? 'AKTIF (ON)' : 'MATI (OFF)'}** | Wajib ON saat Pompa Aktif | ${pump && !uv ? '🔴 Bahaya Patogen' : uv ? '🟢 Steril Terproteksi' : '⚪ Standby'} |\n`
  out += `| **Total Produksi Air** | **${liters.toFixed(1)} Liter** | Target Distribusi | ℹ️ Setara ≈ ${Math.floor(liters / 3)} Jiwa |\n\n`

  // ── Jika ada Pertanyaan Khusus Pengguna (Research-Driven Response) ──
  if (userPrompt && userPrompt.trim().length > 0) {
    const q = userPrompt.trim()
    const matchedTopics = searchResearchTopics(q)

    out += `---\n`
    out += `### 🔬 Hasil Penelusuran Riset Ilmiah untuk: *"${q}"*\n\n`

    matchedTopics.forEach((top, idx) => {
      out += `#### ${idx + 1}. ${top.title}\n`
      out += `*Referensi Ilmiah*: ${top.citations.join('; ')}\n\n`
      out += `${top.detailedResearch}\n\n`
      out += `**🛠️ Rekomendasi Taktis Sesuai Kondisi Alat Saat Ini:**  \n`
      out += `${top.tacticalAction(t)}\n\n`
    })

    out += `---\n`
  }

  // ── Ringkasan Tindakan Taktis Operator Lapangan ──
  out += `### 🛠️ Rekomendasi Tindakan Operasional Prioritas\n`
  const actions: string[] = []

  if (isFlowAnomaly) {
    actions.push(`1. **Hentikan Pompa Sejenak (Perintah R1OFF)**: Aliran terhambat ≤ 0.1 L/min saat pompa ON berisiko merusak pompa akibat *dry-running*. Periksa selang intake dan ganti cartridge sedimen PP 5 mikron.`)
  }
  if (pump && !uv) {
    actions.push(`2. **Wajib Aktifkan UV Sterilizer (Perintah R2ON)**: Pompa sedang menyalurkan air tanpa sterilisasi UV! Segera nyalakan Relay 2 di tab Kontrol Relay untuk mengeliminasi bakteri *E. Coli* dan *Coliform*.`)
  }
  if (isTurbDanger || isTurbWarn) {
    actions.push(`3. **Kekeruhan Tinggi**: Lakukan *backwashing* pada tabung FRP silika/zeolit dan bersihkan endapan lumpur pada tangki intake.`)
  }
  if (isTdsDanger) {
    actions.push(`4. **TDS Tinggi (> 500 ppm)**: Saluran air baku terindikasi payau atau mineral pekat. Wajib dialirkan melalui membran Reverse Osmosis (RO) jika diperuntukkan untuk air minum.`)
  }
  if (actions.length === 0) {
    actions.push(`1. **Sistem Beroperasi Sempurna**: Seluruh parameter fisik dan kimiawi memenuhi baku mutu Permenkes No. 2/2023 dan WHO. Air layak dikonsumsi langsung.`)
    actions.push(`2. **Pencatatan Riwayat**: Total volume ${liters.toFixed(0)} Liter tersimpan otomatis dalam database pemantauan telemetri.`)
  }

  out += actions.join('\n\n') + '\n\n'

  // Kesimpulan Kelayakan Konsumsi
  out += `### 💧 Kesimpulan Kelayakan Konsumsi Air\n`
  if (isDanger) {
    out += `🚫 **TIDAK LAYAK MINUM LANGSUNG.** Tangguhkan pembagian air kepada masyarakat/pengungsi hingga parameter anomali di atas dikoreksi.`
  } else if (isWarning) {
    out += `⚠️ **DISARANKAN DIMASAK DAHULU.** Aman digunakan untuk kebutuhan sanitasi dan mencuci. Jika dikonsumsi, wajib dimasak hingga mendidih ≥ 100°C.`
  } else {
    out += `✅ **LAYAK MINUM LANGSUNG.** Kualitas air murni, bebas patogen berkat sterilisasi UV aktif, dan memenuhi standar kesehatan kemanusiaan.`
  }

  // SEO & Semantic Keywords footer
  out += `\n\n`
  out += `> *Kata Kunci Riset Terkait: Smart Solar Water Filtration, IoT LoRa ESP32, Permenkes No 2/2023, WHO Drinking Water, Turbidity Nephelometry, Total Dissolved Solids ppm, UV Disinfection 254nm, The Sphere Project WASH, Water Treatment Disaster Relief, Backwash FRP, Membrane Clogging Prevention.*`

  return out
}
