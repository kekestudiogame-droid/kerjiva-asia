/* =========================================================
   SUPABASE CONFIGURATION
   KERJIVA
   ========================================================= */

const SUPABASE_URL = "https://akbgwhvgravpibiqsjub.supabase.co";

const SUPABASE_KEY = "sb_publishable_a5xJWrF-b0HcUwB0Pplfew_vhc-tGYx";

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
