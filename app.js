
/* =========================================================
   SUPABASE CONFIGURATION
   KERJIVA MALAYSIA
   ========================================================= */

const SUPABASE_URL = "https://akbgwhvgravpibiqsjub.supabase.co";

const SUPABASE_KEY = "sb_publishable_a5xJWrF-b0HcUwB0Pplfew_vhc-tGYx";

const SUPABASE_REST_URL = `${SUPABASE_URL}/rest/v1`;
const SUPABASE_AUTH_URL = `${SUPABASE_URL}/auth/v1`;

const supabaseAuth = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

/* =========================================================
   GLOBAL AUTHENTICATION
   ========================================================= */

window.supabaseAuth = supabaseAuth;

/* =========================================================
   INITIALIZATION CHECK
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  console.log("Supabase initialized successfully.");
});


/* =========================================================
   TEMPORARY DASHBOARD PREVIEW
   KERJIVA MALAYSIA
   REMOVE AFTER LOGIN SYSTEM IS COMPLETED
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

  const params = new URLSearchParams(window.location.search);
  const preview = params.get("preview");

  const mainHeader = document.querySelector(".main-header");
  const mainContent = document.querySelector("body > main");
  const mainFooter = document.querySelector(".main-footer");

  const jobseekerDashboard = document.getElementById("jobseekerDashboard");
  const companyDashboard = document.getElementById("companyDashboard");

  // Tidak melakukan apa pun jika bukan mode preview
  if (!preview) return;

  // Sembunyikan halaman utama
  if (mainHeader) mainHeader.hidden = true;
  if (mainContent) mainContent.hidden = true;
  if (mainFooter) mainFooter.hidden = true;

  // Preview Dashboard Pencari Kerja
  if (preview === "jobseeker" && jobseekerDashboard) {
    jobseekerDashboard.hidden = false;
    console.log("Jobseeker Dashboard Preview Active");
    return;
  }

  // Preview Company Dashboard
  if (preview === "company" && companyDashboard) {
    companyDashboard.hidden = false;
    console.log("Company Dashboard Preview Active");
    return;
  }

  console.warn("Invalid dashboard preview parameter.");
});

