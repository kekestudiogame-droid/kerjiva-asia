/* =====================================================
   KERJIVA MALAYSIA
   LANGUAGE SWITCHER & TRANSLATION
   ===================================================== */

(function () {
  "use strict";

  const LANGUAGE_STORAGE_KEY = "kerjivaMalaysiaLanguage";

  const SUPPORTED_LANGUAGES = ["en", "ms"];


  /* =====================================================
     MALAY TRANSLATIONS
     ===================================================== */

  const translations = {

    /* ================= HOMEPAGE ================= */

     
    /* ================= HAMBURGER MENU ================= */

    menuHome: "Laman Utama",
    menuFindJobs: "Cari Pekerjaan",
    menuCompanies: "Syarikat",
    menuAboutUs: "Mengenai Kami",
    menuLanguage: "Bahasa",
    menuJobseekerDashboard: "Papan Pemuka Pencari Kerja",
    menuCompanyDashboard: "Papan Pemuka Syarikat",  
    menuInformationCenter: "Pusat Maklumat Kerjiva",
    menuCommunity: "Komuniti Kerjiva Malaysia",
    menuJobs: "Pekerjaan",
    menuContactUs: "Hubungi Kami",
    menuCountry: "Negara",
    menuHelp: "Bantuan",
    menuSettings: "Tetapan",
    menuLogout: "Log Keluar",



    hero_label: "KERJAYA ANDA BERMULA DI SINI",
    hero_title: "Cari Pekerjaan yang Sesuai untuk Anda.",
    hero_description: "Temui peluang kerjaya baharu dan berhubung dengan syarikat di seluruh Malaysia.",
    hero_explore: "Lihat Pekerjaan",
    hero_register: "Daftar Akaun",

    search_job_title: "Jawatan atau Kata Kunci",
    search_job_placeholder: "Contoh: Eksekutif Pemasaran",
    search_location_label: "Negeri / Bandar",
    search_all_locations: "Semua Lokasi",
    search_category_label: "Kategori Pekerjaan",
    search_all_categories: "Semua Kategori",
    search_job_type_label: "Jenis Pekerjaan",
    search_all_job_types: "Semua Jenis Pekerjaan",
    search_button: "Cari Pekerjaan",

    category_accounting: "Perakaunan & Kewangan",
    category_administration: "Pentadbiran & Sokongan Pejabat",
    category_architecture: "Seni Bina & Reka Bentuk Dalaman",
    category_banking: "Perbankan & Perkhidmatan Kewangan",
    category_beauty: "Kecantikan, Kesihatan & Penjagaan Diri",
    category_construction: "Pembinaan & Bangunan",
    category_customer_service: "Khidmat Pelanggan",
    category_design: "Reka Bentuk & Kreatif",
    category_education: "Pendidikan & Latihan",
    category_engineering: "Kejuruteraan",
    category_food_beverage: "Makanan & Minuman",
    category_government: "Kerajaan & Perkhidmatan Awam",
    category_healthcare: "Penjagaan Kesihatan & Perubatan",
    category_hospitality: "Hospitaliti & Pelancongan",
    category_hr: "Sumber Manusia",
    category_it: "Teknologi Maklumat",
    category_insurance: "Insurans",
    category_legal: "Perundangan",
    category_logistics: "Logistik, Pengangkutan & Rantaian Bekalan",
    category_manufacturing: "Pembuatan & Pengeluaran",
    category_marketing: "Pemasaran & Komunikasi",
    category_media: "Media & Hiburan",
    category_energy: "Minyak, Gas & Tenaga",
    category_property: "Hartanah & Pemajuan",
    category_retail: "Peruncitan & Barangan Dagangan",
    category_sales: "Jualan & Pembangunan Perniagaan",
    category_science: "Sains & Penyelidikan",
    category_security: "Keselamatan",
    category_telecommunications: "Telekomunikasi",
    category_agriculture: "Pertanian & Perladangan",
    category_automotive: "Automotif",
    category_aviation: "Penerbangan",
    category_environmental: "Alam Sekitar & Kelestarian",
    category_ngo: "NGO & Perkhidmatan Sosial",
    category_others: "Lain-lain",

    jobtype_fulltime: "Sepenuh Masa",
    jobtype_parttime: "Separuh Masa",
    jobtype_contract: "Kontrak",
    jobtype_temporary: "Sementara",
    jobtype_internship: "Latihan Industri",
    jobtype_freelance: "Bebas",
    jobtype_casual: "Kasual",
    jobtype_apprenticeship: "Perantisan",
    jobtype_graduate: "Program Graduan",

    jobs_section_label: "PELUANG KERJAYA",
    jobs_section_title: "Peluang Pekerjaan Terkini",
    jobs_section_description: "Terokai peluang pekerjaan terkini daripada syarikat di Malaysia.",
    jobs_view_all: "Lihat Semua Pekerjaan",
    jobs_empty_title: "Tiada Pekerjaan Buat Masa Ini",
    jobs_empty_description: "Peluang pekerjaan baharu akan dipaparkan di sini tidak lama lagi.",

    jobseeker_section_label: "UNTUK PENCARI KERJA",
    jobseeker_section_title: "Bina Kerjaya Anda Bersama Kerjiva",
    jobseeker_section_description: "Cipta profil anda, terokai peluang pekerjaan dan berhubung dengan syarikat yang sepadan dengan matlamat kerjaya anda.",
    jobseeker_section_button: "Cari Pekerjaan Seterusnya",

    company_section_label: "UNTUK SYARIKAT",
    company_section_title: "Cari Bakat yang Sesuai untuk Perniagaan Anda",
    company_section_description: "Berhubung dengan calon yang berkelayakan dan temui bakat baharu untuk masa depan syarikat anda.",
    company_section_button: "Daftar Syarikat Anda",

    about_section_label: "MENGENAI KERJIVA",
    about_section_title: "Menghubungkan Orang Ramai dengan Peluang Kerjaya",
    about_section_description: "Kerjiva Malaysia ialah platform kerjaya yang direka untuk menghubungkan pencari kerja dengan syarikat serta memudahkan mereka mencari peluang kerjaya yang sesuai.",

    job_details_close: "Tutup butiran pekerjaan",
    job_details_apply: "Mohon Sekarang",

    apply_documents_close: "Tutup pemilihan dokumen",
    apply_documents_title: "Pilih Dokumen Permohonan",
    apply_documents_description: "Pilih dokumen yang ingin anda lampirkan pada permohonan anda.",
    apply_cover_letter_label: "Surat Iringan (Pilihan)",
    apply_cover_letter_placeholder: "Tulis surat iringan ringkas...",
    apply_submit_button: "Hantar Permohonan",

    footer_brand_description: "Cari Pekerjaan yang Sesuai untuk Anda.",
    footer_explore: "Terokai",
    footer_home: "Laman Utama",
    footer_find_jobs: "Cari Pekerjaan",
    footer_companies: "Syarikat",
    footer_about: "Mengenai Kami",
    footer_information: "Maklumat",
    footer_contact: "Hubungi Kami",
    footer_privacy: "Dasar Privasi",
    footer_terms: "Terma & Syarat",
    footer_copyright: "© 2026 Kerjiva Malaysia. Hak cipta terpelihara.",

     
    /* ================= PRIVACY POLICY ================= */

    privacy_back_home: "← Kembali ke Laman Utama",
    privacy_title: "Dasar Privasi",
    privacy_brand: "Kerjiva Malaysia",
    privacy_last_updated: "Kemas Kini Terakhir:",

    privacy_intro_1: "Kerjiva Malaysia (\"Kerjiva\", \"kami\" atau \"milik kami\") menghormati privasi anda dan komited untuk mengendalikan maklumat peribadi anda secara bertanggungjawab.",
    privacy_intro_2: "Kerjiva Malaysia kini dikendalikan secara persendirian dan bukan merupakan sebuah syarikat berdaftar.",
    privacy_intro_3: "Dasar Privasi ini menerangkan maklumat yang mungkin kami kumpulkan, cara kami menggunakannya, keadaan maklumat tersebut mungkin dikongsi, serta pilihan yang tersedia kepada anda apabila menggunakan laman web dan perkhidmatan Kerjiva Malaysia.",
    privacy_intro_4: "Dengan mengakses atau menggunakan Kerjiva Malaysia, anda mengakui bahawa anda telah membaca Dasar Privasi ini.",

    privacy_section_1: "1. Maklumat yang Kami Kumpulkan",
    privacy_section_1_intro: "Bergantung pada cara anda menggunakan platform kami, kami mungkin mengumpulkan maklumat berikut:",

    privacy_account_info: "Maklumat Akaun",
    privacy_account_1: "Nama dan alamat e-mel.",
    privacy_account_2: "Kelayakan akaun dan maklumat berkaitan pengesahan identiti.",
    privacy_account_3: "Jenis akaun, seperti Pencari Kerja atau Syarikat.",

    privacy_jobseeker_info: "Maklumat Pencari Kerja",
    privacy_jobseeker_1: "Maklumat peribadi dan butiran hubungan yang diberikan dalam profil anda.",
    privacy_jobseeker_2: "Pendidikan, sejarah pekerjaan, kemahiran dan maklumat profesional lain.",
    privacy_jobseeker_3: "Dokumen yang dimuat naik ke akaun anda, seperti CV, resume, sijil dan dokumen sokongan lain.",

    privacy_company_info: "Maklumat Syarikat",
    privacy_company_1: "Nama syarikat dan maklumat hubungan.",
    privacy_company_2: "Maklumat profil syarikat.",
    privacy_company_3: "Butiran kekosongan jawatan dan maklumat yang dihantar semasa mengurus iklan pekerjaan.",

    privacy_application_info: "Maklumat Permohonan",
    privacy_application_1: "Jawatan yang anda pohon.",
    privacy_application_2: "Maklumat dan dokumen yang dihantar sebagai sebahagian daripada permohonan pekerjaan anda.",
    privacy_application_3: "Rekod permohonan dan pengambilan pekerja yang berkaitan.",

    privacy_technical_info: "Maklumat Teknikal dan Penggunaan",
    privacy_technical_desc: "Kami mungkin memproses maklumat teknikal tertentu apabila anda menggunakan laman web ini, termasuk maklumat pelayar, peranti, data pengesahan dan maklumat penggunaan laman web.",

    privacy_section_2: "2. Cara Kami Menggunakan Maklumat Anda",
    privacy_section_2_intro: "Kami mungkin menggunakan maklumat yang dikumpulkan untuk:",

    privacy_use_1: "Mencipta dan mengurus akaun pengguna.",
    privacy_use_2: "Menyediakan perkhidmatan untuk Pencari Kerja dan Syarikat.",
    privacy_use_3: "Memaparkan dan mengurus kekosongan jawatan.",
    privacy_use_4: "Memproses permohonan pekerjaan.",
    privacy_use_5: "Membolehkan syarikat berkaitan menyemak permohonan dan dokumen yang dihantar untuk kekosongan jawatan mereka.",
    privacy_use_6: "Menyediakan sokongan pelanggan dan menjawab pertanyaan.",
    privacy_use_7: "Menyelenggara, mengendalikan dan menambah baik platform kami.",
    privacy_use_8: "Melindungi platform daripada penyalahgunaan, akses tanpa kebenaran dan isu keselamatan.",
    privacy_use_9: "Mematuhi keperluan undang-undang yang berkenaan.",

    privacy_section_3: "3. Akaun Pencari Kerja dan Syarikat",
    privacy_section_3_p1: "Kerjiva Malaysia menyediakan perkhidmatan akaun untuk Pencari Kerja dan Syarikat.",
    privacy_section_3_p2: "Pengguna bertanggungjawab untuk memberikan maklumat yang tepat dan menjaga kerahsiaan kelayakan akaun masing-masing.",
    privacy_section_3_p3: "Pencari Kerja hendaklah memastikan maklumat dalam profil, permohonan dan dokumen yang dimuat naik adalah tepat serta sesuai untuk tujuan pengambilan pekerja.",
    privacy_section_3_p4: "Syarikat hendaklah memastikan maklumat yang dihantar melalui akaun dan iklan pekerjaan mereka adalah tepat serta tidak mendedahkan maklumat peribadi orang lain secara tidak wajar.",

    privacy_section_4: "4. Permohonan Pekerjaan dan Dokumen yang Dimuat Naik",
    privacy_section_4_p1: "Apabila Pencari Kerja memohon sesuatu jawatan, maklumat dan dokumen yang dihantar bersama permohonan tersebut mungkin boleh diakses oleh Syarikat berkaitan untuk tujuan pengambilan pekerja dan semakan permohonan.",
    privacy_section_4_p2: "Sila semak maklumat dan dokumen yang anda hantar sebelum melengkapkan sesuatu permohonan.",
    privacy_section_4_p3: "Pengguna tidak seharusnya memuat naik dokumen yang mengandungi maklumat yang tidak diperlukan untuk proses pengambilan pekerja yang dimaksudkan.",

    privacy_section_5: "5. Kuki dan Storan Pelayar",
    privacy_section_5_p1: "Kerjiva Malaysia mungkin menggunakan teknologi storan pelayar untuk menyokong fungsi laman web.",
    privacy_section_5_p2: "Sebagai contoh, laman web ini menggunakan storan pelayar untuk mengingati pilihan bahasa anda dan mungkin menggunakannya untuk mengekalkan maklumat berkaitan sesi pengesahan akaun.",
    privacy_section_5_p3: "Anda boleh mengurus atau memadam storan pelayar melalui tetapan pelayar anda. Walau bagaimanapun, pemadaman maklumat tertentu mungkin menjejaskan fungsi laman web atau memerlukan anda log masuk semula.",

    privacy_section_6: "6. Perkhidmatan Pihak Ketiga",
    privacy_section_6_intro: "Kerjiva Malaysia menggunakan perkhidmatan pihak ketiga untuk mengendalikan ciri tertentu dalam platform.",
    privacy_section_6_services_intro: "Perkhidmatan ini mungkin termasuk:",
    privacy_supabase_desc: "Digunakan untuk pangkalan data, pengesahan akaun dan perkhidmatan backend yang berkaitan.",
    privacy_gemini_desc: "Digunakan untuk menyediakan respons chatbot berasaskan kecerdasan buatan (AI).",
    privacy_section_6_p1: "Maklumat yang diproses oleh perkhidmatan ini mungkin tertakluk kepada dasar privasi, terma dan amalan pengendalian data penyedia masing-masing.",
    privacy_section_6_p2: "Kami menggalakkan pengguna untuk menyemak maklumat privasi daripada penyedia perkhidmatan pihak ketiga tersebut.",

    privacy_section_7: "7. Chatbot AI",
    privacy_section_7_p1: "Kerjiva Malaysia menyediakan chatbot berasaskan kecerdasan buatan (AI) untuk membantu pengguna mendapatkan maklumat dan bantuan umum.",
    privacy_section_7_p2: "Mesej yang dihantar kepada chatbot mungkin diproses oleh penyedia perkhidmatan AI luaran untuk menghasilkan respons.",
    privacy_section_7_p3: "Jangan hantar kata laluan, maklumat pembayaran, maklumat perniagaan sulit, dokumen pengenalan diri atau maklumat peribadi sensitif lain melalui chatbot.",
    privacy_section_7_p4: "Respons yang dijana oleh AI mungkin tidak sentiasa tepat atau lengkap. Pengguna hendaklah menyemak sendiri maklumat penting.",

    privacy_section_8: "8. Keselamatan dan Penyimpanan Data",
    privacy_section_8_p1: "Kami mengambil langkah yang munasabah untuk melindungi maklumat yang dikendalikan melalui Kerjiva Malaysia daripada akses tanpa kebenaran, kehilangan, penyalahgunaan, pengubahan atau pendedahan.",
    privacy_section_8_p2: "Maklumat peribadi hanya bertujuan untuk disimpan selama yang diperlukan bagi tujuan pengumpulannya atau sebagaimana yang dikehendaki oleh undang-undang yang berkenaan.",
    privacy_section_8_p3: "Tiada kaedah penyimpanan atau penghantaran elektronik yang boleh dijamin selamat sepenuhnya.",

    privacy_section_9: "9. Hak Privasi Anda",
    privacy_section_9_intro: "Tertakluk kepada undang-undang yang berkenaan, termasuk Akta Perlindungan Data Peribadi 2010 Malaysia (Akta 709), sebagaimana yang dipinda, anda mungkin mempunyai hak berkaitan maklumat peribadi anda, termasuk:",
    privacy_right_1: "Memohon akses kepada maklumat peribadi anda yang disimpan oleh kami.",
    privacy_right_2: "Memohon pembetulan terhadap maklumat yang tidak tepat atau tidak lengkap.",
    privacy_right_3: "Mengemukakan pertanyaan tentang cara maklumat anda diproses.",
    privacy_right_4: "Menarik balik persetujuan apabila berkenaan dan tertakluk kepada keperluan undang-undang.",
    privacy_section_9_p1: "Untuk membuat pertanyaan atau permintaan berkaitan privasi, sila hubungi kami melalui maklumat yang disediakan dalam bahagian Hubungi Kami.",

    privacy_section_10: "10. Privasi Kanak-kanak",
    privacy_section_10_p1: "Kerjiva Malaysia ditujukan kepada individu yang layak di sisi undang-undang untuk menggunakan perkhidmatan pekerjaan dan pengambilan pekerja.",
    privacy_section_10_p2: "Kami tidak dengan sengaja berusaha mengumpulkan maklumat peribadi daripada kanak-kanak dengan cara yang melanggar undang-undang yang berkenaan.",

    privacy_section_11: "11. Perubahan kepada Dasar Privasi Ini",
    privacy_section_11_p1: "Kami mungkin mengemas kini Dasar Privasi ini dari semasa ke semasa untuk mencerminkan perubahan kepada perkhidmatan, amalan atau keperluan undang-undang yang berkenaan.",
    privacy_section_11_p2: "Versi yang dikemas kini akan diterbitkan pada halaman ini bersama tarikh \"Kemas Kini Terakhir\" yang baharu.",
    privacy_section_11_p3: "Kami menggalakkan pengguna untuk menyemak halaman ini dari semasa ke semasa.",

    privacy_section_12: "12. Hubungi Kami",
    privacy_section_12_intro: "Jika anda mempunyai soalan, kebimbangan atau permintaan berkaitan Dasar Privasi ini atau pengendalian maklumat peribadi anda, sila hubungi kami:",

    privacy_customer_support: "Sokongan Pelanggan",
    privacy_official_email: "E-mel Rasmi Kerjiva",
    privacy_website: "Laman Web",

    privacy_thank_you: "Terima kasih kerana menggunakan Kerjiva Malaysia.",

     
/* ================= CONTACT US PAGE ================= */

contact_title: "Hubungi Kami",
contact_brand: "Kerjiva Malaysia",
contact_intro: "Kami sedia membantu anda. Jika anda mempunyai sebarang pertanyaan, maklum balas atau memerlukan bantuan, sila hubungi kami melalui maklumat di bawah.",

contact_phone_title: "Nombor Telefon Rasmi",
contact_support_title: "Khidmat Sokongan Pelanggan",
contact_official_title: "E-mel Rasmi Kerjiva",

contact_thank_you: "Terima kasih kerana menjadi sebahagian daripada Kerjiva Malaysia.",
contact_back_home: "← Kembali ke Laman Utama",

     
/* ================= HELP PAGE ================= */

help_title: "Pusat Bantuan",
help_brand: "Kerjiva Malaysia",
help_intro: "Cari jawapan kepada soalan lazim dan pelajari cara menggunakan Kerjiva Malaysia.",
     
help_general_title: "1. Soalan Umum",
help_general_q1: "Apakah itu Kerjiva Malaysia?",
help_general_a1: "Kerjiva Malaysia ialah platform kerjaya yang menghubungkan pencari kerja dengan syarikat serta membantu pengguna mencari peluang pekerjaan yang sesuai.",
help_general_q2: "Adakah Kerjiva Malaysia percuma untuk digunakan?",
help_general_a2: "Pengguna boleh membuat akaun dan meneroka peluang pekerjaan yang tersedia melalui platform ini.",

help_jobseeker_title: "2. Bantuan Pencari Kerja",
help_jobseeker_q1: "Bagaimanakah saya boleh membuat akaun pencari kerja?",
help_jobseeker_a1: "Pilih pilihan pendaftaran, lengkapkan maklumat yang diperlukan dan sahkan alamat e-mel anda.",
help_jobseeker_q2: "Bagaimanakah saya boleh memohon pekerjaan?",
help_jobseeker_a2: "Terokai pekerjaan yang tersedia, buka iklan pekerjaan yang dipilih dan klik Mohon Sekarang. Ikuti arahan untuk menghantar permohonan serta dokumen yang diperlukan.",
help_jobseeker_q3: "Bolehkah saya mengemas kini profil dan dokumen saya?",
help_jobseeker_a3: "Ya. Anda boleh mengurus profil dan dokumen yang telah dimuat naik melalui Papan Pemuka Pencari Kerja.",

help_company_title: "3. Bantuan Syarikat",
help_company_q1: "Bagaimanakah saya boleh mendaftar sebagai syarikat?",
help_company_a1: "Pilih pendaftaran syarikat, lengkapkan maklumat yang diperlukan dan sahkan alamat e-mel anda.",
help_company_q2: "Bagaimanakah saya boleh menerbitkan iklan jawatan kosong?",
help_company_a2: "Log masuk ke Papan Pemuka Syarikat, cipta dan simpan iklan pekerjaan sebagai draf, kemudian pilih pilihan Terbitkan apabila iklan tersebut sudah sedia.",
help_company_q3: "Bagaimanakah saya boleh mengurus permohonan pekerjaan?",
help_company_a3: "Anda boleh menyemak dan mengurus permohonan melalui Papan Pemuka Syarikat.",

help_account_title: "4. Akaun & Log Masuk",
help_account_q1: "Saya belum menerima e-mel pengesahan. Apakah yang perlu saya lakukan?",
help_account_a1: "Semak peti masuk dan folder spam anda. Pastikan alamat e-mel yang dimasukkan adalah betul. Jika masalah masih berterusan, hubungi pasukan sokongan kami.",
help_account_q2: "Bagaimanakah jika saya terlupa kata laluan?",
help_account_a2: "Gunakan pilihan Lupa Kata Laluan pada halaman log masuk dan ikuti arahan yang dihantar ke alamat e-mel berdaftar anda.",

help_support_title: "5. Hubungi Sokongan",
help_support_description: "Jika anda memerlukan bantuan lanjut atau mempunyai pertanyaan yang tidak dibincangkan di sini, sila hubungi kami.",
help_support_email_label: "Khidmat Sokongan Pelanggan:",
help_official_email_label: "E-mel Rasmi Kerjiva:",

help_thank_you: "Terima kasih kerana menggunakan Kerjiva Malaysia.",
help_back_home: "← Kembali ke Laman Utama",
     
/* ================= TERMS & CONDITIONS PAGE ================= */

terms_title: "Terma & Syarat",
terms_brand: "Kerjiva Malaysia",
terms_last_updated: "Dikemas Kini Pada:",
terms_intro_1: "Selamat datang ke Kerjiva Malaysia. Terma dan Syarat ini mengawal akses dan penggunaan anda terhadap laman web serta perkhidmatan Kerjiva Malaysia.",
terms_intro_2: "Dengan mengakses atau menggunakan Kerjiva Malaysia, anda bersetuju untuk mematuhi Terma dan Syarat ini. Jika anda tidak bersetuju, sila hentikan penggunaan platform ini.",

terms_section_1: "1. Mengenai Kerjiva Malaysia",
terms_section_1_p1: "Kerjiva Malaysia ialah platform kerjaya yang dikendalikan secara persendirian untuk menghubungkan pencari kerja dengan syarikat serta menyediakan akses kepada peluang pekerjaan dan perkhidmatan berkaitan kerjaya.",
terms_section_1_p2: "Kerjiva Malaysia pada masa ini dikendalikan secara persendirian dan bukan sebuah syarikat berdaftar.",

terms_section_2: "2. Kelayakan dan Akaun Pengguna",
terms_section_2_p1: "Anda mesti memberikan maklumat yang tepat dan lengkap semasa membuat akaun.",
terms_section_2_p2: "Anda bertanggungjawab untuk menjaga kerahsiaan maklumat log masuk anda serta semua aktiviti yang dilakukan melalui akaun anda.",
terms_section_2_p3: "Anda mesti memaklumkan kepada kami sekiranya mengetahui bahawa akaun anda telah diakses tanpa kebenaran.",
terms_section_2_p4: "Pengesahan e-mel mungkin diperlukan untuk mengakses ciri akaun tertentu.",

terms_section_3: "3. Tanggungjawab Pencari Kerja",
terms_section_3_intro: "Jika anda menggunakan Kerjiva Malaysia sebagai pencari kerja, anda bersetuju untuk:",
terms_jobseeker_1: "Memberikan maklumat peribadi dan profesional yang benar serta tepat.",
terms_jobseeker_2: "Memastikan profil dan dokumen yang dimuat naik sentiasa dikemas kini.",
terms_jobseeker_3: "Menghantar permohonan yang sah bagi peluang pekerjaan yang tersedia.",
terms_jobseeker_4: "Memastikan dokumen yang dimuat naik adalah sesuai dan milik anda, atau anda mempunyai kebenaran untuk berkongsinya.",
terms_jobseeker_5: "Mengelakkan aktiviti yang mengelirukan, penipuan atau penyalahgunaan.",

terms_section_4: "4. Tanggungjawab Syarikat",
terms_section_4_intro: "Jika anda menggunakan Kerjiva Malaysia sebagai syarikat atau majikan, anda bersetuju untuk:",
terms_company_1: "Memberikan maklumat syarikat dan maklumat hubungan yang tepat.",
terms_company_2: "Menerbitkan peluang pekerjaan yang sah dan benar.",
terms_company_3: "Memastikan penerangan jawatan, syarat kelayakan dan butiran kekosongan kerja adalah tepat.",
terms_company_4: "Menggunakan maklumat dan dokumen pemohon hanya untuk tujuan pengambilan pekerja yang sah.",
terms_company_5: "Menghormati privasi dan hak pencari kerja.",
terms_company_6: "Mengelakkan iklan yang mengelirukan, penipuan atau amalan diskriminasi yang melanggar undang-undang yang berkuat kuasa.",

terms_section_5: "5. Iklan Jawatan dan Permohonan",
terms_section_5_p1: "Kerjiva Malaysia menyediakan platform untuk syarikat menerbitkan iklan jawatan kosong dan untuk pencari kerja menghantar permohonan.",
terms_section_5_p2: "Kerjiva Malaysia tidak menjamin bahawa mana-mana iklan jawatan akan menghasilkan temu duga, tawaran kerja atau pekerjaan.",
terms_section_5_p3: "Syarikat bertanggungjawab terhadap keputusan pengambilan pekerja mereka, manakala pencari kerja bertanggungjawab menyemak peluang pekerjaan sebelum memohon.",
terms_section_5_p4: "Kerjiva Malaysia berhak menyemak, mengehadkan atau membuang iklan jawatan yang didapati mengelirukan, tidak sesuai atau tidak mematuhi Terma dan Syarat ini.",

terms_section_6: "6. Kandungan Pengguna dan Dokumen yang Dimuat Naik",
terms_section_6_p1: "Anda bertanggungjawab terhadap kandungan, maklumat dan dokumen yang anda serahkan atau muat naik ke Kerjiva Malaysia.",
terms_section_6_p2: "Anda mesti mempunyai hak atau kebenaran yang diperlukan untuk memuat naik dan berkongsi sebarang kandungan atau dokumen.",
terms_section_6_p3: "Dengan menyerahkan kandungan, anda membenarkan Kerjiva Malaysia memproses dan memaparkan kandungan tersebut sebagaimana yang diperlukan untuk menyediakan perkhidmatan platform, tertakluk kepada Dasar Privasi.",
terms_section_6_p4: "Anda tidak dibenarkan memuat naik bahan yang menyalahi undang-undang, berbahaya, mengelirukan atau tanpa kebenaran.",

terms_section_7: "7. Aktiviti yang Dilarang",
terms_section_7_intro: "Pengguna tidak dibenarkan:",
terms_prohibited_1: "Menggunakan platform untuk tujuan penipuan, menyalahi undang-undang atau memperdaya pihak lain.",
terms_prohibited_2: "Menyamar sebagai individu, syarikat atau organisasi lain.",
terms_prohibited_3: "Memuat naik perisian berniat jahat atau cuba mengganggu operasi platform.",
terms_prohibited_4: "Cuba mengakses akaun, data atau sistem tanpa kebenaran.",
terms_prohibited_5: "Mengumpul atau menyalahgunakan maklumat peribadi pengguna lain.",
terms_prohibited_6: "Menggunakan platform dengan cara yang melanggar undang-undang yang berkuat kuasa atau Terma dan Syarat ini.",

terms_section_8: "8. Chatbot AI dan Maklumat",
terms_section_8_p1: "Kerjiva Malaysia mungkin menyediakan chatbot berasaskan AI untuk membantu pengguna dengan soalan umum dan maklumat.",
terms_section_8_p2: "Respons chatbot dijana secara automatik dan mungkin mengandungi maklumat yang tidak tepat, tidak lengkap atau sudah lapuk.",
terms_section_8_p3: "Respons chatbot tidak boleh dianggap sebagai nasihat profesional, undang-undang atau pekerjaan. Pengguna hendaklah menyemak sendiri maklumat penting.",
terms_section_8_p4: "Jangan masukkan kata laluan, maklumat pembayaran atau maklumat peribadi sensitif melalui chatbot.",

terms_section_9: "9. Perkhidmatan Pihak Ketiga",
terms_section_9_p1: "Kerjiva Malaysia mungkin menggunakan perkhidmatan pihak ketiga untuk menyokong operasi laman web, pengesahan akaun, penyimpanan data dan ciri platform yang lain.",
terms_section_9_p2: "Perkhidmatan pihak ketiga ini beroperasi mengikut terma, dasar dan amalan masing-masing. Kerjiva Malaysia tidak bertanggungjawab terhadap perkhidmatan atau laman web bebas yang tidak berada di bawah kawalan kami.",

terms_section_10: "10. Harta Intelek",
terms_section_10_p1: "Nama Kerjiva Malaysia, logo, reka bentuk laman web dan bahan asal platform dilindungi oleh undang-undang harta intelek yang berkuat kuasa.",
terms_section_10_p2: "Anda tidak dibenarkan menyalin, menghasilkan semula, mengedarkan atau menggunakan bahan Kerjiva Malaysia untuk tujuan komersial tanpa kebenaran terlebih dahulu, kecuali jika dibenarkan oleh undang-undang.",

terms_section_11: "11. Penafian dan Had Liabiliti",
terms_section_11_p1: "Kerjiva Malaysia disediakan atas dasar \"seadanya\" dan \"mengikut ketersediaan\". Kami tidak menjamin akses tanpa gangguan, operasi bebas ralat atau ketepatan semua maklumat yang dipaparkan pada platform.",
terms_section_11_p2: "Kerjiva Malaysia bukan majikan, agensi pengambilan pekerja atau pihak dalam perjanjian pekerjaan antara pencari kerja dengan syarikat.",
terms_section_11_p3: "Setakat yang dibenarkan oleh undang-undang yang berkuat kuasa, Kerjiva Malaysia tidak bertanggungjawab terhadap kerugian tidak langsung, keputusan pekerjaan, pertikaian antara pengguna atau tindakan yang diambil berdasarkan iklan jawatan atau maklumat pihak ketiga.",
terms_section_11_p4: "Tiada apa-apa dalam Terma ini mengecualikan liabiliti yang tidak boleh dikecualikan secara sah di bawah undang-undang yang berkuat kuasa.",

terms_section_12: "12. Penggantungan dan Penamatan",
terms_section_12_p1: "Kerjiva Malaysia boleh mengehadkan, menggantung atau menamatkan akses kepada akaun atau ciri platform sekiranya pengguna melanggar Terma ini, menyalahgunakan platform atau menimbulkan risiko keselamatan.",
terms_section_12_p2: "Pengguna boleh berhenti menggunakan platform pada bila-bila masa. Permintaan berkaitan maklumat akaun atau data peribadi adalah tertakluk kepada Dasar Privasi dan undang-undang yang berkuat kuasa.",

terms_section_13: "13. Perubahan kepada Terma Ini",
terms_section_13_p1: "Kerjiva Malaysia boleh mengemas kini Terma dan Syarat ini dari semasa ke semasa.",
terms_section_13_p2: "Terma yang dikemas kini akan diterbitkan pada halaman ini bersama tarikh Kemaskini Terakhir yang baharu.",
terms_section_13_p3: "Penggunaan platform yang berterusan selepas perubahan diterbitkan dianggap sebagai penerimaan terhadap Terma yang dikemas kini, setakat yang dibenarkan oleh undang-undang yang berkuat kuasa.",

terms_section_14: "14. Undang-undang yang Mentadbir",
terms_section_14_p1: "Terma dan Syarat ini hendaklah ditafsirkan mengikut undang-undang Malaysia, tertakluk kepada keperluan undang-undang yang berkuat kuasa.",

terms_section_15: "15. Hubungi Kami",
terms_section_15_intro: "Jika anda mempunyai sebarang pertanyaan mengenai Terma dan Syarat ini, sila hubungi kami:",
terms_customer_support: "Khidmat Sokongan Pelanggan:",
terms_official_email: "E-mel Rasmi Kerjiva:",
terms_website: "Laman Web:",

terms_thank_you: "Terima kasih kerana menggunakan Kerjiva Malaysia.",
terms_back_home: "← Kembali ke Laman Utama",

     
/* ================= ABOUT KERJIVA MALAYSIA PAGE ================= */

about_title: "Mengenai Kerjiva Malaysia",
about_tagline: "Kerjaya Anda, Masa Depan Anda.",

about_what_title: "Apakah itu Kerjiva Malaysia?",
about_what_p1: "Kerjiva Malaysia ialah platform kerjaya yang menghubungkan pencari kerja dengan syarikat dalam satu platform yang ringkas, moden dan mudah digunakan.",
about_what_p2: "Bagi pencari kerja, Kerjiva membantu pengguna mencari peluang pekerjaan, melihat maklumat kekosongan jawatan, menghantar permohonan dan mengikuti perkembangan permohonan mereka.",
about_what_p3: "Bagi syarikat, Kerjiva menyediakan platform untuk memperkenalkan perniagaan, menerbitkan iklan jawatan kosong, menyemak pemohon dan mengurus aktiviti pengambilan pekerja dengan lebih mudah.",

about_services_title: "Perkhidmatan Kerjiva",
about_services_intro: "Kerjiva menyediakan perkhidmatan yang direka untuk memenuhi keperluan pencari kerja dan syarikat dalam satu platform.",

about_jobseeker_title: "Untuk Pencari Kerja",
about_jobseeker_1: "Mencari jawatan kosong mengikut posisi dan lokasi.",
about_jobseeker_2: "Melihat maklumat kekosongan jawatan dengan lengkap.",
about_jobseeker_3: "Menghantar permohonan pekerjaan.",
about_jobseeker_4: "Mengurus profil dan dokumen yang telah dimuat naik.",
about_jobseeker_5: "Memantau perkembangan permohonan.",
about_jobseeker_6: "Melihat maklumat jadual temu duga.",

about_company_title: "Untuk Syarikat",
about_company_1: "Membuat profil syarikat.",
about_company_2: "Menerbitkan iklan jawatan kosong.",
about_company_3: "Mengurus iklan jawatan yang telah diterbitkan dan disimpan sebagai draf.",
about_company_4: "Menyemak dan mengurus permohonan yang diterima.",
about_company_5: "Menghubungi calon yang berpotensi.",
about_company_6: "Menjemput calon untuk temu duga.",

about_benefits_title: "Manfaat Kerjiva untuk Pencari Kerja dan Syarikat",
about_benefits_intro: "Kerjiva direka untuk membantu pencari kerja mencari peluang pekerjaan serta membantu syarikat mengurus keperluan pengambilan pekerja melalui satu platform. Setiap ciri bertujuan menjadikan proses pencarian kerja dan pengurusan permohonan lebih praktikal dan teratur.",

about_benefits_jobseeker_title: "Manfaat untuk Pencari Kerja",
about_benefits_jobseeker_intro: "Pencari kerja boleh menggunakan Kerjiva untuk mengurus langkah-langkah penting dalam perjalanan mencari kerjaya.",
about_benefits_jobseeker_1: "Mencari jawatan kosong mengikut posisi dan lokasi.",
about_benefits_jobseeker_2: "Menyemak syarat dan maklumat pekerjaan sebelum memohon.",
about_benefits_jobseeker_3: "Menghantar permohonan melalui ciri yang tersedia pada platform.",
about_benefits_jobseeker_4: "Melengkapkan dan mengemas kini maklumat profil serta dokumen.",
about_benefits_jobseeker_5: "Memantau maklumat perkembangan permohonan yang tersedia.",
about_benefits_jobseeker_6: "Menyemak maklumat jadual temu duga apabila tersedia.",

about_benefits_company_title: "Manfaat untuk Syarikat",
about_benefits_company_intro: "Kerjiva menyediakan kemudahan kepada syarikat untuk memaparkan maklumat perniagaan dan mengurus aktiviti pengambilan pekerja dengan lebih cekap.",
about_benefits_company_1: "Memperkenalkan profil dan maklumat syarikat kepada pencari kerja.",
about_benefits_company_2: "Membuat dan mengurus iklan jawatan kosong.",
about_benefits_company_3: "Menyemak permohonan yang dihantar melalui platform.",
about_benefits_company_4: "Mengurus maklumat calon dan proses permohonan.",
about_benefits_company_5: "Menggunakan ciri komunikasi yang tersedia untuk menghubungi calon.",
about_benefits_company_6: "Mengurus maklumat temu duga apabila ciri berkaitan digunakan.",

about_connecting_title: "Menghubungkan Bakat dengan Peluang",
about_connecting_description: "Kerjiva berusaha membantu pencari kerja dan syarikat mencari peluang serta maklumat yang bersesuaian dengan keperluan masing-masing. Melalui maklumat yang jelas dan ciri yang mudah difahami, Kerjiva terus membangunkan platformnya untuk menyokong perjalanan kerjaya dan keperluan pengambilan pekerja di Malaysia.",

about_different_title: "Pengalaman yang Berbeza",
about_different_p1: "Kerjiva bukan sekadar menumpukan kepada penyediaan jawatan kosong. Kami berhasrat menawarkan pengalaman yang berbeza melalui platform yang ringkas, moden dan mudah difahami.",
about_different_p2: "Kami mahu pencari kerja mencari maklumat yang diperlukan dengan lebih mudah, manakala syarikat dapat mengurus keperluan pengambilan pekerja tanpa proses yang rumit.",
about_different_highlight: "Mudah digunakan. Profesional untuk bekerja. Selesa untuk mencari peluang.",

about_vision_title: "Visi Kami",
about_vision_description: "Menjadi platform kerjaya dan pengambilan pekerja yang dipercayai, mudah diakses dan mesra pengguna, serta membantu menghubungkan bakat dengan peluang pekerjaan yang tepat.",

about_mission_title: "Misi Kami",
about_mission_1: "Memudahkan pencari kerja mencari peluang pekerjaan yang bersesuaian.",
about_mission_2: "Membantu syarikat mendapatkan calon yang berpotensi.",
about_mission_3: "Menyediakan pengalaman pencarian kerja yang ringkas dan moden.",
about_mission_4: "Terus membangunkan perkhidmatan mengikut perubahan keperluan dunia pekerjaan.",
about_mission_5: "Membangunkan platform yang memberikan manfaat kepada pencari kerja dan syarikat.",

about_future_title: "Kerjiva untuk Masa Depan Kerjaya Anda",
about_future_description: "Setiap orang mempunyai perjalanan kerjaya masing-masing. Kerjiva hadir untuk membantu menghubungkan kemahiran, peluang dan masa depan melalui satu platform.",
about_final_tagline: "Kerjiva — Kerjaya Anda, Masa Depan Anda.",

about_back_home: "← Kembali ke Laman Utama",
     safe_job_menu_title: "Panduan Mencari Pekerjaan dengan Selamat",

     cv_menu_title: "Cara Menghasilkan CV yang Menarik",
     interview_menu_title: "Cara Membuat Persediaan untuk Temu Duga Kerja",
     
// ================= INFORMATION CENTER - ARTICLE 1 =================

safe_job_category: "TIPS KERJAYA",

safe_job_title: "Panduan Mencari Pekerjaan dengan Selamat",
     
     safe_job_back_home: "← Kembali ke Laman Utama",

safe_job_subtitle: "Cari pekerjaan dengan bijak, selamat dan yakin bersama Kerjiva.",

safe_job_intro_1: "Mencari pekerjaan merupakan langkah penting untuk membina masa depan anda. Namun begitu, pencari kerja perlu berhati-hati kerana iklan jawatan kosong palsu dan pelbagai penipuan pekerjaan masih boleh menyebabkan kerugian kewangan serta masalah peribadi.",

safe_job_intro_2: "Untuk menjadikan pencarian kerja anda lebih selamat, berikut ialah beberapa panduan berguna yang boleh anda ikuti.",

safe_job_section_1: "1. Gunakan Platform Carian Kerja yang Dipercayai",

safe_job_text_1: "Cari peluang pekerjaan melalui platform yang menyediakan maklumat jelas tentang jawatan kosong dan syarikat. Baca keseluruhan penerangan kerja sebelum menghantar permohonan.",

safe_job_section_2: "2. Sahkan Maklumat Syarikat",

safe_job_text_2: "Pastikan nama syarikat, alamat, laman web dan maklumat perhubungannya boleh ditemui serta disahkan. Jika anda mempunyai keraguan, hubungi syarikat melalui saluran komunikasi rasmi yang disenaraikan di laman webnya.",

safe_job_section_3: "3. Berhati-hati dengan Permintaan Bayaran",

safe_job_text_3: "Berhati-hati jika ada pihak yang meminta bayaran pendaftaran, temu duga, latihan atau pentadbiran, atau menjanjikan pekerjaan sebagai balasan kepada bayaran. Jangan terburu-buru membuat sebarang pemindahan wang.",

safe_job_section_4: "4. Lindungi Maklumat Peribadi Anda",

safe_job_text_4: "Jangan sekali-kali berkongsi kata laluan, PIN, kod OTP atau maklumat perbankan dengan pihak yang tidak dibenarkan. Serahkan dokumen peribadi hanya apabila benar-benar diperlukan melalui proses pengambilan pekerja yang boleh dipercayai.",

safe_job_section_5: "5. Sahkan Maklumat Sebelum Menghadiri Temu Duga",

safe_job_text_5: "Pastikan lokasi dan jadual temu duga adalah betul. Maklumkan kepada keluarga atau seseorang yang anda percayai jika perlu menghadiri temu duga secara bersemuka, terutamanya di lokasi yang tidak dikenali.",

safe_job_section_6: "6. Jangan Mudah Terpengaruh dengan Tawaran yang Tidak Munasabah",

safe_job_text_6: "Berhati-hati dengan tawaran gaji yang luar biasa tinggi tetapi syaratnya tidak jelas, proses pengambilan pekerja yang kelihatan terlalu mudah atau tekanan untuk membuat keputusan dengan segera.",

safe_job_reminder_title: "Ingat!",

safe_job_reminder_text: "Peluang pekerjaan yang tulen tidak sepatutnya meminta pencari kerja menyerahkan wang atau berkongsi maklumat sulit secara sembarangan. Sentiasa sahkan maklumat sebelum membuat keputusan.",

safe_job_closing: "Kerjiva — Temui peluang kerjaya dengan lebih mudah dan bijak.",

   
// ================= INFORMATION CENTER - ARTICLE 2 =================

cv_back_home: "Kembali ke Kerjiva",

cv_category: "TIPS KERJAYA",

cv_title: "Cara Membuat CV yang Menarik",

cv_subtitle: "Tonjolkan kelebihan diri anda dengan CV yang tersusun rapi dan profesional.",

cv_intro_1: "CV (Curriculum Vitae) ialah salah satu dokumen terpenting semasa memohon pekerjaan. CV membolehkan majikan mengetahui latar belakang, pengalaman kerja, pendidikan dan kemahiran anda.",

cv_intro_2: "CV yang disediakan dengan baik dapat membantu anda memberikan tanggapan pertama yang positif. Berikut ialah beberapa panduan mudah untuk membantu anda menghasilkan CV yang menarik.",

cv_section_1: "1. Masukkan Maklumat Peribadi yang Tepat",

cv_section_1_text: "Sertakan nama penuh, nombor telefon yang aktif dan alamat e-mel profesional anda. Pastikan maklumat perhubungan mudah dibaca supaya majikan boleh menghubungi anda apabila diperlukan.",

cv_section_2: "2. Tulis Profil Peribadi yang Ringkas",

cv_section_2_text: "Tulis pengenalan ringkas tentang diri, latar belakang dan kemahiran utama anda yang berkaitan dengan jawatan yang dipohon. Gunakan ayat yang jelas dan padat.",

cv_section_3: "3. Sertakan Pengalaman Kerja dan Pendidikan",

cv_section_3_text: "Senaraikan pengalaman kerja, pendidikan, aktiviti sukarelawan, projek atau aktiviti lain yang berkaitan. Jika anda belum mempunyai pengalaman kerja, anda masih boleh menyertakan latihan industri, projek universiti, kerja sukarelawan atau aktiviti persatuan pelajar.",

cv_section_4: "4. Tonjolkan Kemahiran yang Berkaitan",

cv_section_4_text: "Sertakan kemahiran yang sepadan dengan keperluan pekerjaan, seperti kemahiran teknikal, komunikasi dan kerja berpasukan. Pilih kemahiran yang benar-benar anda miliki dan boleh dibuktikan.",

cv_section_5: "5. Gunakan Format yang Kemas dan Profesional",

cv_section_5_text: "Pilih reka bentuk yang ringkas, fon yang mudah dibaca dan susun atur yang jelas. Elakkan penggunaan terlalu banyak warna atau elemen hiasan yang menjadikan CV kelihatan sesak. Susun maklumat dengan teratur dan mudah difahami.",

cv_section_6: "6. Semak CV Sebelum Menghantarnya",

cv_section_6_text: "Semak ejaan, nombor telefon, alamat e-mel dan semua maklumat yang dimasukkan dalam CV anda. Pastikan CV tersebut sesuai dengan jawatan yang dipohon dan tidak mengandungi maklumat yang tidak tepat.",

cv_reminder_title: "Ingat!",

cv_reminder_text: "Sediakan CV anda dengan jujur dan tonjolkan kemahiran yang benar-benar anda miliki. CV yang jelas, tersusun dan relevan dapat membantu majikan memahami potensi anda dengan lebih baik.",

cv_closing: "Kerjiva — Temui peluang kerjaya dan tonjolkan potensi terbaik anda.",

cv_footer: "© Kerjiva - Platform Kerjaya Malaysia",

     
// ================= INFORMATION CENTER - ARTICLE 3 =================

interview_back_home: "Kembali ke Kerjiva",

interview_banner_alt: "Cara Membuat Persediaan untuk Temu Duga Kerja bersama Kerjiva",

interview_category: "TIPS KERJAYA",

interview_title: "Cara Membuat Persediaan untuk Temu Duga Kerja",

interview_subtitle: "Yakinlah, tonjolkan kelebihan diri anda dan berikan tanggapan yang baik.",

interview_intro_1: "Temu duga kerja merupakan salah satu peringkat penting dalam proses pengambilan pekerja. Melalui temu duga, majikan berpeluang mengenali personaliti, pengalaman dan kebolehan anda dengan lebih mendalam.",

interview_intro_2: "Persediaan yang baik dapat membantu anda berasa lebih yakin semasa temu duga. Berikut ialah beberapa panduan berguna untuk membantu anda membuat persediaan.",

interview_section_1: "1. Kenali Syarikat yang Dipohon",

interview_section_1_text: "Dapatkan maklumat tentang bidang perniagaan, produk, perkhidmatan dan latar belakang syarikat sebelum menghadiri temu duga. Ini akan membantu anda memahami organisasi tersebut dan menunjukkan minat anda untuk menyertai syarikat berkenaan.",

interview_section_2: "2. Fahami Jawatan yang Dipohon",

interview_section_2_text: "Teliti huraian kerja dan syarat kelayakan dengan baik. Fahami tanggungjawab serta kemahiran yang diperlukan supaya anda dapat menerangkan bagaimana pengalaman dan kebolehan anda sesuai dengan jawatan tersebut.",

interview_section_3: "3. Berlatih Menjawab Soalan Temu Duga",

interview_section_3_text: "Berlatih menjawab soalan lazim tentang diri, pengalaman, kekuatan dan matlamat kerjaya anda. Berikan jawapan yang jelas, jujur dan berdasarkan pengalaman sebenar anda.",

interview_section_4: "4. Tonjolkan Kemahiran dan Pengalaman",

interview_section_4_text: "Ketengahkan kemahiran, pencapaian dan pengalaman kerja yang berkaitan. Terangkan bagaimana kebolehan anda dapat menyumbang kepada jawatan dan syarikat tersebut.",

interview_section_5: "5. Ajukan Soalan yang Bersesuaian",

interview_section_5_text: "Apabila diberi peluang, ajukan soalan yang berkaitan dengan jawatan, tanggungjawab, pasukan atau proses pengambilan pekerja. Ini menunjukkan minat dan kesungguhan anda untuk mengetahui lebih lanjut tentang jawatan tersebut.",

interview_section_6: "6. Buat Susulan Selepas Temu Duga",

interview_section_6_text: "Selepas temu duga, anda boleh menghantar mesej ringkas sebagai tanda penghargaan kepada penemu duga. Kekalkan sikap profesional dan bersabar sementara menunggu keputusan daripada pihak syarikat.",

interview_reminder_title: "Ingat!",

interview_reminder_text: "Bersikap jujur dan jadilah diri sendiri semasa temu duga. Persediaan yang rapi, sikap positif dan komunikasi yang jelas dapat membantu anda memberikan tanggapan yang baik kepada majikan.",

interview_closing: "Kerjiva — Rakan Kerjaya Anda untuk Masa Depan yang Lebih Cerah.",

interview_footer: "© Kerjiva - Platform Kerjaya Malaysia",

     
// ================= INFORMATION CENTER - ARTICLE 4 =================

company_guide_menu_title: "Panduan Syarikat: Cara Mengiklankan Jawatan di Kerjiva",

company_guide_back_home: "← Kembali ke Laman Utama",

company_guide_banner_alt: "Panduan Syarikat: Cara Mengiklankan Jawatan di Kerjiva",

company_guide_category: "PANDUAN SYARIKAT",

company_guide_title: "Panduan Syarikat: Cara Mengiklankan Jawatan di Kerjiva",

company_guide_subtitle: "Mudah, percuma dan menjangkau lebih ramai calon berbakat bersama Kerjiva.",

company_guide_intro: "Kerjiva membantu syarikat mencari calon yang sesuai dengan keperluan pengambilan pekerja. Melalui platform Kerjiva, syarikat boleh mengiklankan kekosongan jawatan dan menguruskan permohonan calon dengan lebih mudah.",

company_guide_section_1: "1. Daftar sebagai Syarikat",

company_guide_section_1_text: "Layari laman web Kerjiva Malaysia di",

company_guide_section_1_text_2: ", kemudian pilih menu Daftar. Pilih jenis akaun Syarikat dan lengkapkan maklumat pendaftaran yang diperlukan.",

company_guide_section_1_text_3: "Pastikan anda menggunakan alamat e-mel yang aktif untuk proses pengesahan akaun.",

company_guide_section_2: "2. Lengkapkan Profil Syarikat",

company_guide_section_2_text: "Selepas berjaya log masuk, lengkapkan profil syarikat supaya pencari kerja dapat mengenali organisasi anda dengan lebih baik.",

company_guide_section_2_text_2: "Gunakan maklumat syarikat yang tepat dan jelas, termasuk nama syarikat serta maklumat sokongan yang berkaitan.",

company_guide_section_3: "3. Iklankan Kekosongan Jawatan",

company_guide_section_3_text: "Buka papan pemuka syarikat, kemudian pilih ciri untuk membuat iklan kekosongan jawatan.",

company_guide_section_3_text_2: "Lengkapkan maklumat jawatan seperti berikut:",

company_guide_job_item_1: "Nama atau jawatan pekerjaan.",

company_guide_job_item_2: "Lokasi pekerjaan.",

company_guide_job_item_3: "Jenis pekerjaan.",

company_guide_job_item_4: "Julat gaji, jika tersedia.",

company_guide_job_item_5: "Penerangan dan syarat pekerjaan.",

company_guide_section_3_text_3: "Pastikan semua maklumat yang dipaparkan jelas dan bersesuaian dengan keperluan syarikat.",

company_guide_section_4: "4. Terbitkan Iklan Jawatan",

company_guide_section_4_text: "Semak semula semua maklumat sebelum menerbitkan iklan jawatan. Jika semuanya betul, teruskan proses penerbitan supaya kekosongan tersebut dapat dipaparkan kepada pencari kerja di Kerjiva.",

company_guide_section_5: "5. Urus Permohonan Calon",

company_guide_section_5_text: "Syarikat boleh memantau permohonan yang diterima melalui papan pemuka syarikat. Semak profil dan dokumen calon untuk membantu proses pemilihan mengikut keperluan pengambilan pekerja.",

company_guide_tips_title: "Tips Mengiklankan Jawatan dengan Baik",

company_guide_tip_1: "Gunakan tajuk jawatan yang jelas.",

company_guide_tip_2: "Tulis penerangan pekerjaan dengan lengkap.",

company_guide_tip_3: "Nyatakan syarat pekerjaan yang berkaitan.",

company_guide_tip_4: "Sertakan maklumat gaji dan lokasi jika tersedia.",

company_guide_tip_5: "Pastikan maklumat kekosongan jawatan sentiasa tepat.",

company_guide_start_title: "Mulakan Pengambilan Pekerja Bersama Kerjiva",

company_guide_start_text: "Temui calon berpotensi dan permudahkan proses pengambilan pekerja syarikat anda melalui Kerjiva.",

company_guide_closing: "Kerjiva — Penyelesaian Pengambilan Pekerja yang Dipercayai untuk Syarikat Anda.",

company_guide_footer: "© Kerjiva - Platform Kerjaya Malaysia",

     

// ================= INFORMATION CENTER - ARTICLE 5 =================

rights_menu_title: "Hak dan Tanggungjawab Pencari Kerja",

rights_back_home: "← Kembali ke Kerjiva",

rights_banner_alt: "Hak dan Tanggungjawab Pencari Kerja - Kerjiva",

rights_category: "PANDUAN PENCARI KERJA",

rights_title: "Hak dan Tanggungjawab Pencari Kerja",

rights_subtitle: "Fahami hak dan tanggungjawab anda agar proses mencari pekerjaan lebih selamat, selesa dan profesional.",

rights_intro: "Mencari pekerjaan bukan sekadar menemukan jawatan kosong yang sesuai, tetapi juga memahami hak dan tanggungjawab anda sebagai pencari kerja. Dengan memahami kedua-duanya, anda dapat melalui proses pengambilan pekerja dengan lebih bijak dan yakin.",

rights_section_1: "1. Hak Pencari Kerja",

rights_section_1_text: "Setiap pencari kerja berhak mendapat proses pengambilan pekerja yang adil, telus dan profesional. Berikut ialah beberapa perkara penting yang perlu diketahui:",

rights_right_1: "<strong>Maklumat jawatan yang jelas:</strong> Mendapatkan maklumat tentang jawatan, tanggungjawab kerja, lokasi dan syarat kelayakan.",

rights_right_2: "<strong>Layanan yang adil:</strong> Mendapat peluang untuk menyertai proses pemilihan tanpa diskriminasi.",

rights_right_3: "<strong>Maklumat proses pemilihan:</strong> Mendapat penjelasan tentang peringkat pengambilan pekerja mengikut dasar syarikat.",

rights_right_4: "<strong>Perlindungan data peribadi:</strong> Maklumat peribadi dan dokumen yang diberikan semasa proses permohonan hendaklah dirahsiakan.",

rights_section_2: "2. Tanggungjawab Pencari Kerja",

rights_section_2_text: "Selain mempunyai hak, pencari kerja juga perlu melaksanakan tanggungjawab sepanjang proses memohon pekerjaan:",

rights_duty_1: "<strong>Memberikan maklumat yang benar:</strong> Pastikan CV, pengalaman kerja, pendidikan dan kemahiran anda menggambarkan keadaan sebenar.",

rights_duty_2: "<strong>Menyediakan dokumen yang diperlukan:</strong> Sediakan dokumen yang diminta oleh syarikat mengikut keperluan jawatan.",

rights_duty_3: "<strong>Mengekalkan komunikasi profesional:</strong> Gunakan bahasa yang sopan dan berikan maklum balas sewajarnya ketika berkomunikasi dengan wakil syarikat.",

rights_duty_4: "<strong>Mematuhi proses pemilihan:</strong> Hadir tepat pada masanya dan hormati jadual temu duga serta peringkat pemilihan yang lain.",

rights_section_3: "3. Tips Mencari Kerja dengan Lebih Bijak",

rights_section_3_text: "Untuk mengelakkan pengalaman yang tidak menyenangkan atau boleh mendatangkan kerugian, ambil perhatian terhadap beberapa tips berikut:",

rights_tip_1: "Semak identiti dan maklumat syarikat sebelum memohon pekerjaan.",

rights_tip_2: "Baca huraian kerja dan syarat kelayakan dengan teliti.",

rights_tip_3: "Berhati-hati dengan permintaan bayaran yang tidak jelas semasa proses pengambilan pekerja.",

rights_tip_4: "Jangan berkongsi maklumat peribadi atau dokumen penting secara sembarangan.",

rights_tip_5: "Gunakan platform pencarian kerja yang menyediakan maklumat kekosongan jawatan dengan jelas dan boleh dipercayai.",

rights_section_4: "4. Peranan Kerjiva",

rights_section_4_text: "Kerjiva merupakan platform kerjaya yang membantu pencari kerja menemukan maklumat kekosongan jawatan dan peluang kerjaya. Kami menggalakkan pengguna supaya sentiasa peka, melindungi data peribadi dan menggunakan platform dengan bertanggungjawab.",

rights_conclusion_title: "Penutup",

rights_conclusion: "Memahami hak dan tanggungjawab merupakan langkah penting untuk menjalani proses pencarian kerja yang selamat dan profesional. Jadilah pencari kerja yang aktif, jujur dan bertanggungjawab ketika meneroka peluang kerjaya.",

rights_closing: "Kerjiva — Kerjaya Anda, Masa Depan Anda.",

rights_footer: "© Kerjiva - Platform Kerjaya Malaysia",
     
// ================= INFORMATION CENTER - ARTICLE 6 =================

scam_menu_title: "Panduan Mengelakkan Penipuan Pekerjaan",
     
scam_back_home: "← Kembali ke Kerjiva",

scam_banner_alt: "Panduan Mengelakkan Penipuan Pekerjaan - Kerjiva",

scam_category: "PANDUAN PENCARI KERJA",

scam_title: "Cara Mengelakkan Penipuan Pekerjaan",

scam_subtitle: "Ketahui cara mengenal pasti iklan jawatan kosong palsu dan melindungi diri anda sepanjang proses pencarian kerja.",

scam_intro: "Mencari pekerjaan memerlukan pertimbangan yang teliti. Dengan banyaknya peluang pekerjaan yang tersedia, pencari kerja perlu berhati-hati terhadap tawaran yang tidak jelas atau berkemungkinan merupakan penipuan. Dengan mengenali tanda-tanda amaran, anda dapat melindungi diri dan meneroka peluang kerjaya dengan lebih selamat.",

scam_section_1: "1. Kenali Tanda-tanda Iklan Jawatan Kosong Palsu",

scam_section_1_text: "Berhati-hati apabila menemui iklan pekerjaan yang menunjukkan tanda-tanda mencurigakan seperti berikut:",

scam_sign_1: "<strong>Identiti syarikat atau perekrut tidak jelas:</strong> Nama syarikat, alamat atau maklumat pihak yang mengiklankan jawatan sukar dikenal pasti.",

scam_sign_2: "<strong>Maklumat pekerjaan tidak lengkap:</strong> Huraian tugas, tanggungjawab dan syarat kelayakan tidak dinyatakan dengan jelas.",

scam_sign_3: "<strong>Gaji atau faedah tidak munasabah:</strong> Tawaran gaji terlalu tinggi atau faedah yang luar biasa tanpa penjelasan yang meyakinkan.",

scam_sign_4: "<strong>Jaminan diterima bekerja dengan mudah:</strong> Menjanjikan pekerjaan tanpa proses temu duga atau penilaian yang sewajarnya.",

scam_sign_5: "<strong>Maklumat hubungan sukar disahkan:</strong> Nombor telefon, alamat e-mel atau akaun media sosial perekrut tidak dapat disahkan.",

scam_section_2: "2. Berhati-hati dengan Permintaan Bayaran",

scam_payment_1: "Elakkan tawaran pekerjaan yang meminta anda membayar yuran pentadbiran, latihan, pakaian seragam, perjalanan atau bayaran lain sebagai syarat untuk mendapatkan pekerjaan.",

scam_payment_2: "Sebelum membuat sebarang pembayaran, semak kesahihan syarikat dan maklumat pengambilan pekerja melalui saluran rasmi. Jangan terburu-buru membuat pembayaran hanya kerana dijanjikan peluang pekerjaan.",

scam_section_3: "3. Lindungi Maklumat Peribadi Anda",

scam_section_3_text: "Maklumat peribadi dan dokumen penting perlu dilindungi daripada pihak yang tidak dikenali atau tidak dapat disahkan. Amalkan langkah berikut:",

scam_data_1: "Jangan sesekali berkongsi kata laluan atau kod OTP dengan sesiapa.",

scam_data_2: "Jangan menghantar dokumen peribadi kepada pihak yang identitinya belum disahkan.",

scam_data_3: "Pastikan anda memahami tujuan sesuatu dokumen atau maklumat diminta sebelum memberikannya.",

scam_data_4: "Elakkan menekan pautan yang mencurigakan atau berasal daripada sumber yang tidak dipercayai.",

scam_section_4: "4. Sahkan Identiti Syarikat",

scam_section_4_text: "Sebelum memohon pekerjaan, luangkan masa untuk menyemak latar belakang syarikat dan kesahihan jawatan yang ditawarkan:",

scam_verify_1: "Semak laman web rasmi dan profil media sosial syarikat.",

scam_verify_2: "Pastikan alamat dan maklumat perhubungan syarikat dapat disahkan.",

scam_verify_3: "Semak sama ada jawatan yang diiklankan benar-benar ditawarkan oleh syarikat tersebut.",

scam_verify_4: "Hubungi syarikat melalui saluran rasmi jika anda mempunyai sebarang keraguan.",

scam_section_5: "5. Apakah yang Perlu Dilakukan Jika Menemui Penipuan Pekerjaan?",

scam_section_5_text: "Jika anda mengesyaki sesuatu tawaran pekerjaan merupakan penipuan, ambil tindakan berikut dengan segera:",

scam_action_1: "Hentikan komunikasi dengan pihak yang mencurigakan.",

scam_action_2: "Jangan hantar wang atau berkongsi maklumat peribadi dan dokumen tambahan.",

scam_action_3: "Simpan bukti komunikasi seperti mesej, e-mel, nombor telefon dan maklumat transaksi jika ada.",

scam_action_4: "Laporkan kejadian tersebut kepada platform berkaitan atau pihak berkuasa melalui saluran rasmi.",

scam_section_6: "6. Peranan Kerjiva",

scam_section_6_text: "Kerjiva merupakan platform kerjaya yang membantu pencari kerja menemukan maklumat jawatan kosong dan peluang kerjaya. Kami menggalakkan pengguna supaya sentiasa menyemak kesahihan maklumat pekerjaan, melindungi data peribadi dan berhati-hati sebelum membuat sebarang keputusan. Pengguna juga bertanggungjawab untuk mengesahkan maklumat syarikat dan tawaran pekerjaan sebelum memohon.",

scam_conclusion_title: "Penutup",

scam_conclusion: "Berhati-hati ketika mencari pekerjaan merupakan langkah penting untuk melindungi diri daripada penipuan. Sentiasa semak maklumat, sahkan identiti syarikat dan jangan mudah terpengaruh dengan tawaran yang kelihatan terlalu menarik untuk dipercayai.",

scam_closing: "Kerjiva — Kerjaya Anda, Masa Depan Anda.",

scam_footer: "© Kerjiva - Platform Kerjaya Malaysia",




    /* ================= JOBSEEKER DASHBOARD ================= */

    dashboard_notifications: "Pemberitahuan",
    dashboard_logout: "Log Keluar",
     jobseeker_welcome: "Selamat Datang",

    dashboard_jobseeker_account: "Akaun Pencari Kerja",
    dashboard_menu: "Papan Pemuka",
    dashboard_my_profile: "Profil Saya",
    dashboard_my_documents: "Dokumen Saya",
    dashboard_find_jobs: "Cari Pekerjaan",
    dashboard_my_applications: "Permohonan Saya",
    dashboard_interview_invitations: "Jemputan Temu Duga",
    dashboard_account_settings: "Tetapan Akaun",
    dashboard_career_partner: "Rakan Kerjaya Anda",

    jobseeker_portal_label: "PORTAL PENCARI KERJA",
    jobseeker_dashboard_title: "Papan Pemuka Saya",
    jobseeker_dashboard_description: "Urus kerjaya, permohonan dan peluang pekerjaan anda.",
    jobseeker_find_job_button: "Cari Pekerjaan",

    stats_total_applications: "Jumlah Permohonan",
    stats_applications_submitted: "Permohonan dihantar",
    stats_under_review: "Dalam Semakan",
    stats_applications_reviewed: "Permohonan sedang disemak",
    stats_interview_invitations: "Jemputan Temu Duga",
    stats_invitations_received: "Jemputan diterima",
    stats_saved_jobs: "Pekerjaan Disimpan",
    stats_jobs_saved: "Pekerjaan disimpan untuk kemudian",

    profile_completion_title: "Kelengkapan Profil",
    profile_completion_description: "Lengkapkan profil anda supaya syarikat dapat mengenali anda dengan lebih lanjut.",
    profile_completion_button: "Lengkapkan Profil Saya",

    recent_applications_title: "Permohonan Terkini",
    recent_applications_view_all: "Lihat Semua",
    recent_applications_empty_title: "Belum Ada Permohonan",
    recent_applications_empty_description: "Permohonan pekerjaan yang telah anda hantar akan dipaparkan di sini.",
    recent_applications_explore: "Terokai Pekerjaan",

    upcoming_interviews_title: "Temu Duga Akan Datang",
    upcoming_interviews_view_all: "Lihat Semua",
    upcoming_interviews_empty_title: "Tiada Temu Duga Akan Datang",
    upcoming_interviews_empty_description: "Jemputan temu duga anda akan dipaparkan di sini.",

    my_profile_title: "Profil Saya",
    my_profile_description: "Urus maklumat peribadi dan profesional anda di satu tempat.",

    profile_photo_alt: "Foto Profil Pencari Kerja",
    profile_photo_title: "Foto Profil",
    profile_photo_description: "Muat naik foto profil supaya syarikat lebih mudah mengenali anda.",
    profile_photo_requirements: "JPG, PNG atau WebP. Saiz fail maksimum: 2 MB.",
    profile_photo_choose: "Pilih Foto",
    profile_photo_upload: "Muat Naik Foto",
    profile_photo_remove: "Buang Foto",

    profile_information_title: "Maklumat Profil",
    profile_information_description: "Pastikan maklumat anda sentiasa dikemas kini untuk meningkatkan peluang kerjaya.",
    profile_edit_button: "Edit Profil",
    profile_full_name: "Nama Penuh",
    profile_email: "Alamat E-mel",
    profile_phone: "Nombor Telefon",
    profile_state: "Negeri",
    profile_city: "Bandar",
    profile_address: "Alamat",
    profile_headline: "Tajuk Profesional",
    profile_headline_placeholder: "Contoh: Eksekutif Pemasaran",
    profile_about: "Mengenai Saya",
    profile_education: "Tahap Pendidikan",
    profile_field_of_study: "Bidang Pengajian",
    profile_institution: "Institusi",
    profile_graduation_year: "Tahun Graduasi",
    profile_experience: "Tahun Pengalaman",
    profile_employment_type: "Jenis Pekerjaan Pilihan",
    profile_select_employment_type: "Pilih Jenis Pekerjaan",
    profile_skills: "Kemahiran",
    profile_skills_placeholder: "Contoh: Komunikasi, Microsoft Excel, Kepimpinan",
    profile_salary_min: "Gaji Minimum yang Dijangka (MYR)",
    profile_salary_max: "Gaji Maksimum yang Dijangka (MYR)",
    profile_linkedin: "Profil LinkedIn",
    profile_portfolio: "Laman Web Portfolio",
    profile_save_button: "Simpan Profil",
    profile_cancel_button: "Batal",

    my_documents_title: "Dokumen Saya",
    my_documents_description: "Muat naik dan urus dokumen peribadi serta kerjaya anda.",
    my_documents_collection: "Koleksi Dokumen Saya",
    my_documents_instruction: "Pastikan dokumen anda sentiasa dikemas kini supaya boleh digunakan semasa memohon pekerjaan.",
    my_documents_empty_title: "Tiada Dokumen Dimuat Naik",
    my_documents_empty_description: "Dokumen yang anda muat naik akan dipaparkan di sini.",

    document_upload_title: "Muat Naik Dokumen Baharu",
    document_type_label: "Jenis Dokumen",
    document_type_select: "Pilih Jenis Dokumen",
    document_type_cv: "CV / Resume",
    document_type_certificate: "Sijil",
    document_type_education: "Sijil Pendidikan",
    document_type_employment: "Surat Pengalaman Kerja",
    document_type_identity: "Kad Pengenalan (MyKad)",
    document_type_driving: "Lesen Memandu",
    document_type_other: "Dokumen Lain",
    document_select_file: "Pilih Fail",
    document_upload_button: "Muat Naik Dokumen",

    find_jobs_title: "Cari Pekerjaan",
    find_jobs_description: "Terokai peluang pekerjaan di seluruh Malaysia.",
    dashboard_category_job_type: "Kategori / Jenis Pekerjaan",
    dashboard_all_categories_job_types: "Semua Kategori & Jenis Pekerjaan",
    dashboard_job_keyword: "Jawatan atau Kata Kunci",
    dashboard_job_keyword_placeholder: "Contoh: Eksekutif Pemasaran",
    dashboard_job_location: "Negeri / Bandar",
    dashboard_job_location_placeholder: "Contoh: Kuala Lumpur",
    dashboard_search_jobs: "Cari Pekerjaan",
    dashboard_no_jobs: "Tiada Pekerjaan Buat Masa Ini",
    dashboard_no_jobs_description: "Peluang pekerjaan yang tersedia akan dipaparkan di sini.",

    my_applications_title: "Permohonan Saya",
    my_applications_description: "Jejaki status permohonan pekerjaan anda.",
    application_history_title: "Sejarah Permohonan",
    applications_empty_title: "Belum Ada Permohonan",
    applications_empty_description: "Anda belum menghantar sebarang permohonan pekerjaan.",

    interview_invitations_title: "Jemputan Temu Duga",
    interview_invitations_description: "Lihat jemputan temu duga daripada syarikat.",
    interviews_empty_title: "Tiada Jemputan Temu Duga",
    interviews_empty_description: "Jemputan temu duga daripada syarikat akan dipaparkan di sini.",

    account_settings_title: "Tetapan Akaun",
    account_settings_description: "Urus pilihan dan keselamatan akaun anda.",
    account_information_title: "Maklumat Akaun",
    account_email_label: "E-mel:",
    account_type_label: "Jenis Akaun:",
    account_jobseeker: "Pencari Kerja",
    account_country_label: "Negara:",
    account_country_malaysia: "Malaysia",
    account_security_title: "Keselamatan",
    account_change_password: "Tukar Kata Laluan",

     
    /* ================= REGISTER PAGE ================= */

    auth_tagline: "Kerjaya Anda Bermula Di Sini.",
    register_heading: "Cipta Akaun Anda",
    register_subheading: "Daftar untuk memulakan perjalanan anda bersama Kerjiva Malaysia.",
    register_account_type: "Jenis Akaun",
    role_jobseeker: "Pencari Kerja",
    role_company: "Syarikat",

    register_jobseeker_info: "Maklumat Pencari Kerja",
    register_full_name: "Nama Penuh",
    register_full_name_placeholder: "Masukkan nama penuh anda",
    register_email: "Alamat E-mel",
    register_email_placeholder: "Masukkan alamat e-mel anda",
    register_phone: "Nombor Telefon",
    register_phone_placeholder: "Masukkan nombor telefon anda",
    register_residential_address: "Alamat Kediaman",
    register_residential_address_placeholder: "Masukkan alamat kediaman anda",

    register_company_info: "Maklumat Syarikat",
    register_company_name: "Nama Syarikat",
    register_company_name_placeholder: "Masukkan nama syarikat yang berdaftar",
    register_ssm_number: "Nombor Pendaftaran SSM",
    register_ssm_number_placeholder: "Masukkan nombor pendaftaran SSM anda",
    register_contact_person: "Nama Pegawai Perhubungan",
    register_contact_person_placeholder: "Masukkan nama penuh pegawai perhubungan",
    register_company_email: "Alamat E-mel Syarikat",
    register_company_email_placeholder: "Masukkan alamat e-mel syarikat anda",
    register_company_phone: "Nombor Telefon Syarikat",
    register_company_phone_placeholder: "Masukkan nombor telefon syarikat anda",
    register_company_address: "Alamat Syarikat",
    register_company_address_placeholder: "Masukkan alamat pejabat syarikat anda",
    register_company_website: "Laman Web Syarikat (Pilihan)",

    register_account_security: "Keselamatan Akaun",
    register_password: "Kata Laluan",
    register_password_placeholder: "Cipta kata laluan anda",
    register_confirm_password: "Sahkan Kata Laluan",
    register_confirm_password_placeholder: "Masukkan semula kata laluan anda",
    auth_show_password: "Tunjukkan kata laluan",

    register_create_account: "Cipta Akaun",
    register_existing_account: "Sudah mempunyai akaun?",
    auth_login: "Log Masuk",
     auth_register: "Daftar",
    auth_back_home: "← Kembali ke Laman Utama",

     /* ================= LOGIN PAGE ================= */

    login_heading: "Selamat Kembali",
    login_subheading: "Log masuk untuk meneruskan ke akaun Kerjiva anda.",
    login_select_account_type: "Pilih jenis akaun",
    login_password_placeholder: "Masukkan kata laluan anda",
    login_forgot_password: "Lupa Kata Laluan?",
    login_no_account: "Belum mempunyai akaun?",
    login_create_account: "Cipta Akaun",

     
    /* ================= COMMUNITY PAGE ================= */

    community_back_home: "Kembali ke Laman Utama",
    community_title: "Komuniti Kerjiva Malaysia",
    community_intro: "Kongsi pengalaman, cerita, soalan atau idea anda tentang dunia pekerjaan bersama komuniti Kerjiva. Setiap cerita dan pandangan anda bermakna!",
    community_rating_title: "Penilaian Komuniti",
    community_rating_count: "Berdasarkan {count} penilaian",
    community_share_title: "Kongsi Pengalaman Anda",
    community_post_placeholder: "Kongsikan pengalaman, cerita, soalan atau idea anda...",
    community_your_rating: "Penilaian Anda",
    community_no_rating: "Belum Ada Penilaian",
    community_post_button: "Hantar Catatan",
    community_recent_posts: "Catatan Terkini",
    community_loading: "Memuatkan catatan...",
    community_footer: "© Kerjiva - Platform Kerjaya Malaysia",





    /* ================= COMPANY DASHBOARD ================= */

   company_welcome: "Selamat Datang, Syarikat",
   company_notifications: "Pemberitahuan",
   company_logout: "Log Keluar",
   company_account: "Akaun Syarikat",

    company_menu_dashboard: "Papan Pemuka",
    company_menu_profile: "Profil Syarikat",
    company_menu_post_job: "Siarkan Pekerjaan",
    company_menu_my_jobs: "Pekerjaan Saya",
    company_menu_applicants: "Pemohon Masuk",
    company_menu_interviews: "Jemputan Temu Duga",
    company_menu_settings: "Tetapan Akaun",

    company_overview_title: "Papan Pemuka Syarikat",
    company_back_home: "Kembali ke Laman Utama",
    company_overview_description: "Urus syarikat, iklan pekerjaan dan pemohon anda.",

    company_stats_total_jobs: "Jumlah Pekerjaan",
    company_stats_published_jobs: "Pekerjaan Disiarkan",
    company_stats_draft_jobs: "Draf Pekerjaan",
    company_stats_total_applicants: "Jumlah Pemohon",
    company_recent_applications: "Permohonan Pekerjaan Terkini",
    company_no_applications: "Belum Ada Permohonan",

    company_profile_title: "Profil Syarikat",
    company_profile_description: "Urus maklumat syarikat anda.",

    company_logo: "Logo Syarikat",
    company_logo_alt: "Logo Syarikat",
    company_logo_placeholder: "Logo Syarikat",
    company_logo_upload: "Muat Naik atau Tukar Logo",
    company_logo_requirements: "JPG, PNG atau WebP. Saiz fail maksimum: 2 MB.",

    company_name: "Nama Syarikat",
    company_registration_number: "Nombor Pendaftaran Syarikat (SSM)",
    company_industry: "Industri",
    company_email: "E-mel Syarikat",
    company_phone: "Nombor Telefon",
    company_website: "Laman Web",
    company_state: "Negeri",
    company_select_state: "Pilih Negeri",
    company_city: "Bandar",
    company_address: "Alamat Syarikat",
    company_about: "Mengenai Syarikat",

    company_edit_profile: "Edit Profil",
    company_save_profile: "Simpan Profil",
    company_cancel: "Batal",

    post_job_title: "Siarkan Pekerjaan",
    post_job_description: "Cipta iklan pekerjaan baharu untuk syarikat anda.",
    job_title_label: "Tajuk Pekerjaan",
    job_category_label: "Kategori Pekerjaan",
    job_category_select: "Pilih Kategori Pekerjaan",
    employment_type_label: "Jenis Pekerjaan",
    employment_type_select: "Pilih Jenis Pekerjaan",

    company_state_select: "Pilih Negeri",
    company_job_city: "Bandar",
    company_job_salary_min: "Gaji Minimum (RM)",
    company_job_salary_max: "Gaji Maksimum (RM)",
    company_job_education: "Pendidikan",
    company_job_experience: "Pengalaman",
    company_job_description_label: "Penerangan Pekerjaan",
    company_job_requirements: "Syarat Pekerjaan",
    company_job_deadline: "Tarikh Akhir Permohonan",
    company_job_save_draft: "Simpan sebagai Draf",
    company_job_send: "Hantar Pekerjaan",

    company_my_jobs_title: "Pekerjaan Saya",
    company_my_jobs_description: "Urus iklan pekerjaan anda.",
    company_no_jobs: "Tiada iklan pekerjaan buat masa ini.",

    company_incoming_applicants: "Pemohon Masuk",
    company_applicants_description: "Semak permohonan yang dihantar untuk pekerjaan anda.",
    company_no_applicants: "Belum Ada Pemohon",
    company_applicant_details: "Maklumat Pemohon",
    company_application_documents: "Dokumen Permohonan",
     company_view_details: "Lihat Butiran",
    company_invite_interview: "Jemput ke Temu Duga",

    company_interviews_title: "Jemputan Temu Duga",
    company_interviews_description: "Urus jemputan temu duga untuk pemohon.",
    company_no_interviews: "Tiada jemputan temu duga buat masa ini.",
    company_create_interview: "Cipta Jemputan Temu Duga",
    company_interview_type: "Jenis Temu Duga",
    company_interview_type_select: "Pilih Jenis Temu Duga",
    company_interview_online: "Dalam Talian",
    company_interview_in_person: "Bersemuka",
    company_interview_date: "Tarikh Temu Duga",
    company_interview_time: "Masa Temu Duga",
    company_interview_location: "Lokasi Temu Duga",
    company_online_meeting_link: "Pautan Mesyuarat Dalam Talian",
    company_interview_message: "Mesej",
    company_send_invitation: "Hantar Jemputan",

    company_settings_title: "Tetapan Akaun",
    company_settings_description: "Urus tetapan akaun anda.",
    company_account_email: "E-mel Akaun",
    company_change_password: "Tukar Kata Laluan"

  };


  /* =====================================================
     GET SAVED LANGUAGE
     ===================================================== */

  function getSavedLanguage() {
    const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);

    return SUPPORTED_LANGUAGES.includes(savedLanguage)
      ? savedLanguage
      : "en";
  }


  
  /* =====================================================
     LANGUAGE DROPDOWN
     ===================================================== */

  function setLanguageSelectValue(language) {
    const languageSelect = document.getElementById("languageSelect");

    if (languageSelect) {
      languageSelect.value = language;
    }
  }




  /* =====================================================
     TRANSLATE TEXT ELEMENTS
     ===================================================== */

  function translateTextElement(element, key, language) {

    if (!element.dataset.i18nOriginalHTML) {
      element.dataset.i18nOriginalHTML = element.innerHTML;
    }

    const translatedText = language === "ms"
      ? translations[key]
      : null;

    if (translatedText !== undefined && translatedText !== null) {
      element.innerHTML = translatedText;
    } else {
      element.innerHTML = element.dataset.i18nOriginalHTML;
    }
  }


  /* =====================================================
     TRANSLATE ATTRIBUTES
     ===================================================== */

  function translateAttribute(element, key, language, attribute) {

    const originalKey = "i18nOriginal" +
      attribute.charAt(0).toUpperCase() +
      attribute.slice(1).replace("-", "");

    if (!element.dataset[originalKey]) {
      element.dataset[originalKey] = element.getAttribute(attribute) || "";
    }

    const originalValue = element.dataset[originalKey];

    const translatedValue = language === "ms"
      ? (translations[key] || originalValue)
      : originalValue;

    element.setAttribute(attribute, translatedValue);
  }


  /* =====================================================
     APPLY TRANSLATIONS
     ===================================================== */

  function applyTranslations(language) {

    document.querySelectorAll("[data-i18n]").forEach(function (element) {
      translateTextElement(
        element,
        element.dataset.i18n,
        language
      );
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach(function (element) {
      translateAttribute(
        element,
        element.dataset.i18nPlaceholder,
        language,
        "placeholder"
      );
    });

    document.querySelectorAll("[data-i18n-aria-label]").forEach(function (element) {
      translateAttribute(
        element,
        element.dataset.i18nAriaLabel,
        language,
        "aria-label"
      );
    });

    document.querySelectorAll("[data-i18n-alt]").forEach(function (element) {
      translateAttribute(
        element,
        element.dataset.i18nAlt,
        language,
        "alt"
      );
    });

    document.documentElement.lang = language;
  }


  /* =====================================================
     CHANGE LANGUAGE
     ===================================================== */

  function changeLanguage(language) {

    if (!SUPPORTED_LANGUAGES.includes(language)) {
      return;
    }

    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);

    applyTranslations(language);

   setLanguageSelectValue(language);

    window.currentKerjivaLanguage = language;

    document.dispatchEvent(
      new CustomEvent("kerjivaLanguageChanged", {
        detail: { language: language }
      })
    );
  }
   // EXPOSE LANGUAGE FUNCTIONS FOR APP.JS
   
      window.applyKerjivaTranslations = function (language) {
      applyTranslations(language || getSavedLanguage());
 };


 
  /* =====================================================
     INITIALIZE
     ===================================================== */

  document.addEventListener("DOMContentLoaded", function () {

    const initialLanguage = getSavedLanguage();

    changeLanguage(initialLanguage);

    const languageSelect = document.getElementById("languageSelect");

    if (languageSelect) {
      languageSelect.addEventListener("change", function () {
        changeLanguage(languageSelect.value);
      });
    }

  });

})();

