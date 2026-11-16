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
     TRANSLATE TEXT WITHOUT REMOVING CHILD ELEMENTS
     ===================================================== */

  function translateTextElement(element, key, language) {

    if (!element.dataset.i18nOriginalText) {

      const textNode = Array.from(element.childNodes).find(function (node) {
        return node.nodeType === Node.TEXT_NODE &&
          node.nodeValue.trim() !== "";
      });

      element.dataset.i18nOriginalText = textNode
        ? textNode.nodeValue
        : element.textContent;
    }

    const translatedText = language === "ms"
      ? (translations[key] || element.dataset.i18nOriginalText)
      : element.dataset.i18nOriginalText;

    const textNode = Array.from(element.childNodes).find(function (node) {
      return node.nodeType === Node.TEXT_NODE &&
        node.nodeValue.trim() !== "";
    });

    if (textNode) {
      textNode.nodeValue = translatedText;
    } else {
      element.textContent = translatedText;
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

