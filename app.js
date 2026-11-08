
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


/* =====================================================
   KERJIVA MALAYSIA
   REGISTER ROLE SWITCHING
   ===================================================== */

document.addEventListener("DOMContentLoaded", function () {

  const registerRole = document.getElementById("registerRole");
  const jobseekerFields = document.getElementById("jobseekerRegisterFields");
  const companyFields = document.getElementById("companyRegisterFields");

  if (!registerRole || !jobseekerFields || !companyFields) {
    return;
  }

  function toggleRegisterFields() {

    const selectedRole = registerRole.value;

    if (selectedRole === "company") {

      jobseekerFields.hidden = true;
      companyFields.hidden = false;

      jobseekerFields.querySelectorAll("input, textarea, select").forEach(input => {
        input.disabled = true;
      });

      companyFields.querySelectorAll("input, textarea, select").forEach(input => {
        input.disabled = false;
      });

    } else {

      jobseekerFields.hidden = false;
      companyFields.hidden = true;

      jobseekerFields.querySelectorAll("input, textarea, select").forEach(input => {
        input.disabled = false;
      });

      companyFields.querySelectorAll("input, textarea, select").forEach(input => {
        input.disabled = true;
      });

    }
  }

  registerRole.addEventListener("change", toggleRegisterFields);

  toggleRegisterFields();

});


/* =====================================================
   KERJIVA MALAYSIA
   USER REGISTRATION
   ===================================================== */

document.addEventListener("DOMContentLoaded", function () {

  const registerForm = document.getElementById("registerForm");

  if (!registerForm) return;

  const registerRole = document.getElementById("registerRole");
  const registerPassword = document.getElementById("registerPassword");
  const confirmPassword = document.getElementById("confirmRegisterPassword");
  const registerSubmitBtn = document.getElementById("registerSubmitBtn");
  const registerStatus = document.getElementById("registerStatus");

  if (
    !registerRole ||
    !registerPassword ||
    !confirmPassword ||
    !registerSubmitBtn ||
    !registerStatus
  ) return;

  registerForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    if (!registerForm.checkValidity()) {
      registerForm.reportValidity();
      return;
    }

    const role = registerRole.value;
    const password = registerPassword.value;
    const confirmPasswordValue = confirmPassword.value;

    registerStatus.textContent = "";

    if (password.length < 8) {
      registerStatus.textContent =
        "Password must contain at least 8 characters.";
      return;
    }

    if (password !== confirmPasswordValue) {
      registerStatus.textContent =
        "Password and Confirm Password do not match.";
      confirmPassword.focus();
      return;
    }

    let email = "";
    let metadata = {};

    // =========================================
    // JOBSEEKER REGISTRATION DATA
    // =========================================

    if (role === "jobseeker") {

      email = document
        .getElementById("jobseekerRegisterEmail")
        .value.trim();

      metadata = {
        role: "jobseeker",
        full_name: document
          .getElementById("registerFullName")
          .value.trim(),

        phone: document
          .getElementById("jobseekerRegisterPhone")
          .value.trim(),

        address: document
          .getElementById("jobseekerAddress")
          .value.trim()
      };

    }

    // =========================================
    // COMPANY REGISTRATION DATA
    // =========================================

    else if (role === "company") {

      email = document
        .getElementById("companyRegisterEmail")
        .value.trim();

      metadata = {
        role: "company",

        company_name: document
          .getElementById("registerCompanyName")
          .value.trim(),

        registration_number: document
          .getElementById("companyRegistrationNumber")
          .value.trim(),

        contact_person: document
          .getElementById("companyContactPerson")
          .value.trim(),

        company_phone: document
          .getElementById("companyRegisterPhone")
          .value.trim(),

        company_address: document
          .getElementById("companyAddress")
          .value.trim(),

        website: document
          .getElementById("companyWebsite")
          .value.trim()
      };

    }

    else {

      registerStatus.textContent =
        "Please select a valid account type.";
      return;

    }

    // =========================================
    // SUBMIT REGISTRATION TO SUPABASE
    // =========================================

    const originalButtonText = registerSubmitBtn.textContent;

    registerSubmitBtn.disabled = true;
    registerSubmitBtn.textContent = "Creating Account...";
    registerStatus.textContent = "Please wait...";

    try {

      const { data, error } = await supabaseAuth.auth.signUp({
        email: email,
        password: password,
        options: {
          data: metadata
        }
      });

      if (error) {
        throw error;
      }

      if (data.user) {

        registerStatus.textContent =
          "Registration successful! Please check your email and click the verification link before logging in.";

        registerForm.reset();

        // Restore the default Jobseeker form
        if (registerRole) {
          registerRole.value = "jobseeker";
          registerRole.dispatchEvent(new Event("change"));
        }

      }

    } catch (error) {

      console.error("Kerjiva Malaysia Registration Error:", error);

      registerStatus.textContent =
        error.message || "Registration failed. Please try again.";

    } finally {

      registerSubmitBtn.disabled = false;
      registerSubmitBtn.textContent = originalButtonText;

    }

  });

});



