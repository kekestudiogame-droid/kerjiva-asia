
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

   
/* =====================================================
   KERJIVA MALAYSIA
   USER LOGIN
   ===================================================== */

document.addEventListener("DOMContentLoaded", function () {

  const loginForm = document.getElementById("loginForm");

  if (!loginForm) return;

  const loginEmail = document.getElementById("loginEmail");
  const loginPassword = document.getElementById("loginPassword");
  const loginSubmitBtn = document.getElementById("loginSubmitBtn");
  const loginStatus = document.getElementById("loginStatus");

  if (!loginEmail || !loginPassword || !loginSubmitBtn || !loginStatus) {
    return;
  }

  loginForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    if (!loginForm.checkValidity()) {
      loginForm.reportValidity();
      return;
    }

    const email = loginEmail.value.trim();
    const password = loginPassword.value;

    const originalButtonText = loginSubmitBtn.textContent;

    loginSubmitBtn.disabled = true;
    loginSubmitBtn.textContent = "Signing In...";
    loginStatus.textContent = "Please wait...";

    try {

      const { data, error } = await supabaseAuth.auth.signInWithPassword({
        email: email,
        password: password
      });

      if (error) throw error;

      const user = data.user;

      if (!user) {
        throw new Error("Unable to identify your account.");
      }

      const { data: jobseeker, error: jobseekerError } =
        await supabaseAuth
          .from("jobseeker_profiles")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();

      if (jobseekerError) throw jobseekerError;

      const { data: company, error: companyError } =
        await supabaseAuth
          .from("companies")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();

      if (companyError) throw companyError;

      if (jobseeker && !company) {

        window.location.href = "index.html?dashboard=jobseeker";

      } else if (company && !jobseeker) {

        window.location.href = "index.html?dashboard=company";

      } else {

        await supabaseAuth.auth.signOut();

        throw new Error(
          "Your account profile could not be identified. Please contact support."
        );

      }

    } catch (error) {

      console.error("Kerjiva Malaysia Login Error:", error);

      loginStatus.textContent =
        error.message || "Login failed. Please try again.";

    } finally {

      loginSubmitBtn.disabled = false;
      loginSubmitBtn.textContent = originalButtonText;

    }

  });

});


/* =====================================================
   KERJIVA MALAYSIA
   AUTHENTICATED DASHBOARD ROUTING & LOGOUT
   ===================================================== */

document.addEventListener("DOMContentLoaded", async function () {
  const params = new URLSearchParams(window.location.search);

  // Jangan mengganggu fitur Dashboard Preview sementara.
  if (params.has("preview")) return;

  const requestedDashboard = params.get("dashboard");

  // =====================================================
  // DASHBOARD ROUTING
  // =====================================================

  if (requestedDashboard === "jobseeker" || requestedDashboard === "company") {
    const mainHeader = document.querySelector(".main-header");
    const mainContent = document.querySelector("body > main");
    const mainFooter = document.querySelector(".main-footer");

    const jobseekerDashboard = document.getElementById("jobseekerDashboard");
    const companyDashboard = document.getElementById("companyDashboard");

    try {
      const { data: sessionData, error: sessionError } =
        await supabaseAuth.auth.getSession();

      if (sessionError) throw sessionError;

      const session = sessionData.session;

      if (!session || !session.user) {
        window.location.href = "login.html";
        return;
      }

      const userId = session.user.id;

      const { data: jobseeker, error: jobseekerError } =
        await supabaseAuth
          .from("jobseeker_profiles")
          .select("id")
          .eq("user_id", userId)
          .maybeSingle();

      if (jobseekerError) throw jobseekerError;

      const { data: company, error: companyError } =
        await supabaseAuth
          .from("companies")
          .select("id")
          .eq("user_id", userId)
          .maybeSingle();

      if (companyError) throw companyError;

      let actualRole = null;

      if (jobseeker && !company) {
        actualRole = "jobseeker";
      } else if (company && !jobseeker) {
        actualRole = "company";
      }

      if (!actualRole) {
        await supabaseAuth.auth.signOut();
        window.location.href = "login.html";
        return;
      }

      // Sembunyikan homepage.
      if (mainHeader) mainHeader.hidden = true;
      if (mainContent) mainContent.hidden = true;
      if (mainFooter) mainFooter.hidden = true;

      // Pastikan hanya dashboard sesuai role yang ditampilkan.
      if (jobseekerDashboard) {
        jobseekerDashboard.hidden = actualRole !== "jobseeker";
      }

      if (companyDashboard) {
        companyDashboard.hidden = actualRole !== "company";
      }

      console.log("Kerjiva Malaysia Dashboard Active:", actualRole);

    } catch (error) {
      console.error("Kerjiva Malaysia Dashboard Routing Error:", error);
      alert("Unable to open your dashboard. Please sign in again.");
      window.location.href = "login.html";
      return;
    }
  }

  // =====================================================
  // JOBSEEKER LOGOUT
  // =====================================================

  const jobseekerLogoutBtn = document.getElementById("jobseekerLogoutBtn");

  if (jobseekerLogoutBtn) {
    jobseekerLogoutBtn.addEventListener("click", async function () {
      jobseekerLogoutBtn.disabled = true;

      try {
        const { error } = await supabaseAuth.auth.signOut();
        if (error) throw error;

        window.location.href = "login.html";
      } catch (error) {
        console.error("Jobseeker Logout Error:", error);
        alert("Unable to sign out. Please try again.");
        jobseekerLogoutBtn.disabled = false;
      }
    });
  }

  // =====================================================
  // COMPANY LOGOUT
  // =====================================================

  const companyLogoutBtn = document.getElementById("companyLogoutBtn");

  if (companyLogoutBtn) {
    companyLogoutBtn.addEventListener("click", async function () {
      companyLogoutBtn.disabled = true;

      try {
        const { error } = await supabaseAuth.auth.signOut();
        if (error) throw error;

        window.location.href = "login.html";
      } catch (error) {
        console.error("Company Logout Error:", error);
        alert("Unable to sign out. Please try again.");
        companyLogoutBtn.disabled = false;
      }
    });
  }
});


/* =====================================================
   KERJIVA MALAYSIA
   JOBSEEKER MY PROFILE
   LOAD, EDIT, SAVE & CANCEL
   ===================================================== */

document.addEventListener("DOMContentLoaded", async function () {

  const params = new URLSearchParams(window.location.search);

  // Jalankan hanya pada dashboard Jobseeker yang sebenarnya.
  if (params.get("dashboard") !== "jobseeker" || params.has("preview")) {
    return;
  }

  const profileForm = document.getElementById("jobseekerProfileForm");

  if (!profileForm) return;

  const profileFields = profileForm.querySelectorAll("fieldset");
  const editBtn = document.getElementById("editJobseekerProfileBtn");
  const saveBtn = document.getElementById("saveJobseekerProfileBtn");
  const cancelBtn = document.getElementById("cancelJobseekerProfileBtn");
  const statusEl = document.getElementById("jobseekerProfileStatus");

  if (!editBtn || !saveBtn || !cancelBtn || !statusEl) return;

  let originalProfile = null;

  const profileInputs = {
    full_name: "profileFullNameInput",
    email: "profileEmailInput",
    phone: "profilePhoneInput",
    address: "profileAddressInput",
    state: "profileStateInput",
    city: "profileCityInput",
    headline: "profileHeadlineInput",
    about_me: "profileAboutInput",
    education_level: "profileEducationInput",
    field_of_study: "profileFieldOfStudyInput",
    institution: "profileInstitutionInput",
    graduation_year: "profileGraduationYearInput",
    experience_years: "profileExperienceInput",
    skills: "profileSkillsInput",
    employment_type: "profileEmploymentTypeInput",
    expected_salary_min: "profileSalaryMinInput",
    expected_salary_max: "profileSalaryMaxInput",
    linkedin_url: "profileLinkedinInput",
    portfolio_url: "profilePortfolioInput",
    salary_currency: "profileSalaryCurrencyInput"
  };

  function setProfileMode(editing) {

    profileFields.forEach(fieldset => {
      fieldset.disabled = !editing;
    });

    editBtn.hidden = editing;
    saveBtn.hidden = !editing;
    cancelBtn.hidden = !editing;

  }

  function fillProfile(profile) {

    Object.entries(profileInputs).forEach(([column, elementId]) => {

      const input = document.getElementById(elementId);

      if (!input) return;

      const value = profile[column];

      input.value = value === null || value === undefined
        ? (column === "salary_currency" ? "MYR" : "")
        : value;

    });

  }

  function getNumericValue(elementId) {

    const input = document.getElementById(elementId);

    if (!input || input.value.trim() === "") {
      return null;
    }

    const value = Number(input.value);

    return Number.isFinite(value) ? value : null;

  }

  // =========================================
  // LOAD PROFILE FROM SUPABASE
  // =========================================

  async function loadJobseekerProfile() {

    statusEl.textContent = "Loading profile...";

    try {

      const { data: sessionData, error: sessionError } =
        await supabaseAuth.auth.getSession();

      if (sessionError) throw sessionError;

      const session = sessionData.session;

      if (!session || !session.user) {
        throw new Error("Please sign in again to view your profile.");
      }

      const { data, error } = await supabaseAuth
        .from("jobseeker_profiles")
        .select(`
          full_name,
          email,
          phone,
          address,
          state,
          city,
          headline,
          about_me,
          education_level,
          field_of_study,
          institution,
          graduation_year,
          experience_years,
          skills,
          employment_type,
          expected_salary_min,
          expected_salary_max,
          salary_currency,
          linkedin_url,
          portfolio_url
        `)
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        throw new Error("Jobseeker profile was not found.");
      }

      originalProfile = { ...data };

      fillProfile(originalProfile);

      setProfileMode(false);

      statusEl.textContent = "";

    } catch (error) {

      console.error("Load Jobseeker Profile Error:", error);

      statusEl.textContent =
        error.message || "Unable to load your profile.";

    }

  }

  // =========================================
  // EDIT PROFILE
  // =========================================

  editBtn.addEventListener("click", function () {

    if (!originalProfile) return;

    setProfileMode(true);

    statusEl.textContent = "";

  });

  // =========================================
  // CANCEL PROFILE EDITING
  // =========================================

  cancelBtn.addEventListener("click", function () {

    if (!originalProfile) return;

    fillProfile(originalProfile);

    setProfileMode(false);

    statusEl.textContent = "Changes have been cancelled.";

  });

  // =========================================
  // SAVE PROFILE TO SUPABASE
  // =========================================

  profileForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    if (!profileForm.checkValidity()) {
      profileForm.reportValidity();
      return;
    }

    const minimumSalary = getNumericValue("profileSalaryMinInput");
    const maximumSalary = getNumericValue("profileSalaryMaxInput");

    if (
      minimumSalary !== null &&
      maximumSalary !== null &&
      minimumSalary > maximumSalary
    ) {

      statusEl.textContent =
        "Minimum salary cannot be greater than maximum salary.";

      return;

    }

    const updatedProfile = {

      full_name: document.getElementById("profileFullNameInput").value.trim(),

      phone: document.getElementById("profilePhoneInput").value.trim(),

      address: document.getElementById("profileAddressInput").value.trim(),

      state: document.getElementById("profileStateInput").value.trim(),

      city: document.getElementById("profileCityInput").value.trim(),

      headline: document.getElementById("profileHeadlineInput").value.trim(),

      about_me: document.getElementById("profileAboutInput").value.trim(),

      education_level: document.getElementById("profileEducationInput").value.trim(),

      field_of_study: document.getElementById("profileFieldOfStudyInput").value.trim(),

      institution: document.getElementById("profileInstitutionInput").value.trim(),

      graduation_year: getNumericValue("profileGraduationYearInput"),

      experience_years: getNumericValue("profileExperienceInput"),

      skills: document.getElementById("profileSkillsInput").value.trim(),

      employment_type: document.getElementById("profileEmploymentTypeInput").value,

      expected_salary_min: minimumSalary,

      expected_salary_max: maximumSalary,

      salary_currency: "MYR",

      linkedin_url: document.getElementById("profileLinkedinInput").value.trim(),

      portfolio_url: document.getElementById("profilePortfolioInput").value.trim()

    };

    const originalButtonText = saveBtn.textContent;

    saveBtn.disabled = true;
    cancelBtn.disabled = true;
    saveBtn.textContent = "Saving...";
    statusEl.textContent = "Saving your profile...";

    try {

      const { data: sessionData, error: sessionError } =
        await supabaseAuth.auth.getSession();

      if (sessionError) throw sessionError;

      const session = sessionData.session;

      if (!session || !session.user) {
        throw new Error("Your session has expired. Please sign in again.");
      }

      const { data, error } = await supabaseAuth
        .from("jobseeker_profiles")
        .update({
          ...updatedProfile,
          updated_at: new Date().toISOString()
        })
        .eq("user_id", session.user.id)
        .select()
        .single();

      if (error) throw error;

      originalProfile = {
        ...originalProfile,
        ...data
      };

      fillProfile(originalProfile);

      setProfileMode(false);

      statusEl.textContent = "Profile saved successfully.";

    } catch (error) {

      console.error("Save Jobseeker Profile Error:", error);

      statusEl.textContent =
        error.message || "Unable to save your profile.";

    } finally {

      saveBtn.disabled = false;
      cancelBtn.disabled = false;
      saveBtn.textContent = originalButtonText;

    }

  });

  // Load profile when Jobseeker Dashboard opens.
  await loadJobseekerProfile();

});


/* =====================================================
   KERJIVA MALAYSIA
   JOBSEEKER DASHBOARD NAVIGATION
   ===================================================== */

document.addEventListener("DOMContentLoaded", function () {

  const params = new URLSearchParams(window.location.search);

  // Jalankan hanya pada dashboard Jobseeker sebenarnya.
  if (params.get("dashboard") !== "jobseeker" || params.has("preview")) {
    return;
  }

  const dashboard = document.getElementById("jobseekerDashboard");

  if (!dashboard) return;

  const menuLinks = dashboard.querySelectorAll(
    ".dashboard-menu .dashboard-menu-link"
  );

  const sections = dashboard.querySelectorAll(
    ".dashboard-content-section"
  );

  if (!menuLinks.length || !sections.length) return;

  function showSection(sectionId) {

    const targetSection = dashboard.querySelector(
      "#" + sectionId
    );

    if (!targetSection) return;

    // Sembunyikan semua section.
    sections.forEach(section => {
      section.style.display = "none";
    });

    // Tampilkan section yang dipilih.
    targetSection.style.display = "block";

    // Perbarui menu aktif.
    menuLinks.forEach(link => {
      link.classList.toggle(
        "active",
        link.getAttribute("href") === "#" + sectionId
      );
    });

  }

  // Navigasi ketika menu sidebar diklik.
  menuLinks.forEach(link => {

    link.addEventListener("click", function (event) {

      event.preventDefault();

      const sectionId = this.getAttribute("href").substring(1);

      showSection(sectionId);

    });

  });

  // Tampilkan Dashboard sebagai halaman awal.
  showSection("jobseekerOverview");

});


/* =====================================================
   KERJIVA MALAYSIA
   PASSWORD SHOW / HIDE
   ===================================================== */

document.addEventListener("DOMContentLoaded", function () {

  const toggleButtons = document.querySelectorAll(
    ".toggle-password-btn"
  );

  toggleButtons.forEach(button => {

    button.addEventListener("click", function () {

      const targetId = this.getAttribute("data-target");
      const passwordInput = document.getElementById(targetId);

      if (!passwordInput) return;

      const shouldShow = passwordInput.type === "password";

      passwordInput.type = shouldShow ? "text" : "password";

      this.setAttribute(
        "aria-pressed",
        String(shouldShow)
      );

      this.setAttribute(
        "aria-label",
        shouldShow ? "Hide password" : "Show password"
      );

    });

  });

});


/* =====================================================
   KERJIVA MALAYSIA
   JOBSEEKER PROFILE PHOTO
   PRIVATE SUPABASE STORAGE
   ===================================================== */

document.addEventListener("DOMContentLoaded", async function () {

  const params = new URLSearchParams(window.location.search);

  // Jalankan hanya pada dashboard Jobseeker sebenarnya.
  if (params.get("dashboard") !== "jobseeker" || params.has("preview")) {
    return;
  }

  const photoFileInput = document.getElementById("jobseekerAvatarFile");
  const choosePhotoBtn = document.getElementById("chooseJobseekerAvatarBtn");
  const uploadPhotoBtn = document.getElementById("uploadJobseekerAvatarBtn");
  const removePhotoBtn = document.getElementById("removeJobseekerAvatarBtn");
  const photoStatus = document.getElementById("jobseekerAvatarStatus");

  const photoPreview = document.getElementById("jobseekerPhotoPreview");
  const photoImage = document.getElementById("jobseekerPhotoImage");
  const photoInitials = document.getElementById("jobseekerPhotoInitials");

  const sidebarAvatar = document.getElementById("jobseekerAvatar");
  const sidebarName = document.getElementById("jobseekerSidebarName");

  if (
    !photoFileInput ||
    !choosePhotoBtn ||
    !uploadPhotoBtn ||
    !removePhotoBtn ||
    !photoStatus ||
    !photoPreview ||
    !photoImage ||
    !photoInitials
  ) {
    return;
  }

  const BUCKET_NAME = "jobseeker-avatars";
  const MAX_FILE_SIZE = 2 * 1024 * 1024;

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp"
  ];

  let currentUser = null;
  let currentAvatarPath = null;
  let selectedPhoto = null;

  // =========================================
  // INITIALS
  // =========================================

  function getInitials(name) {

    const words = (name || "Job Seeker")
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    return words
      .slice(0, 2)
      .map(word => word.charAt(0).toUpperCase())
      .join("") || "JS";

  }

  function showInitials(name) {

    const initials = getInitials(name);

    photoInitials.textContent = initials;
    photoInitials.hidden = false;
    photoImage.hidden = true;
    photoImage.removeAttribute("src");

    if (sidebarAvatar) {

      sidebarAvatar.textContent = initials;

    }

  }

  // =========================================
  // DISPLAY PHOTO
  // =========================================

  function displayPhoto(signedUrl) {

    photoImage.src = signedUrl;
    photoImage.hidden = false;
    photoInitials.hidden = true;

    if (sidebarAvatar) {

      sidebarAvatar.textContent = "";

      const sidebarImage = document.createElement("img");

      sidebarImage.src = signedUrl;
      sidebarImage.alt = "Jobseeker Profile Photo";

      sidebarImage.style.width = "100%";
      sidebarImage.style.height = "100%";
      sidebarImage.style.objectFit = "cover";
      sidebarImage.style.borderRadius = "50%";

      sidebarAvatar.appendChild(sidebarImage);

    }

  }

  // =========================================
  // LOAD CURRENT PHOTO
  // =========================================

  async function loadJobseekerPhoto() {

    photoStatus.textContent = "Loading profile photo...";

    try {

      const { data: sessionData, error: sessionError } =
        await supabaseAuth.auth.getSession();

      if (sessionError) throw sessionError;

      const session = sessionData.session;

      if (!session || !session.user) {
        throw new Error("Please sign in again.");
      }

      currentUser = session.user;

      const { data: profile, error: profileError } =
        await supabaseAuth
          .from("jobseeker_profiles")
          .select("full_name, avatar_url")
          .eq("user_id", currentUser.id)
          .maybeSingle();

      if (profileError) throw profileError;

      if (!profile) {
        throw new Error("Jobseeker profile was not found.");
      }

      if (sidebarName && profile.full_name) {
        sidebarName.textContent = profile.full_name;
      }

      showInitials(profile.full_name);

      currentAvatarPath = profile.avatar_url || null;

      if (currentAvatarPath) {

        const { data: signedData, error: signedError } =
          await supabaseAuth.storage
            .from(BUCKET_NAME)
            .createSignedUrl(currentAvatarPath, 3600);

        if (signedError) throw signedError;

        if (signedData && signedData.signedUrl) {
          displayPhoto(signedData.signedUrl);
          removePhotoBtn.hidden = false;
        }

      } else {

        removePhotoBtn.hidden = true;

      }

      photoStatus.textContent = "";

    } catch (error) {

      console.error("Load Jobseeker Photo Error:", error);

      photoStatus.textContent =
        error.message || "Unable to load profile photo.";

    }

  }

  // =========================================
  // CHOOSE PHOTO
  // =========================================

  choosePhotoBtn.addEventListener("click", function () {

    photoFileInput.click();

  });

  photoFileInput.addEventListener("change", function () {

    const file = photoFileInput.files[0];

    selectedPhoto = null;
    uploadPhotoBtn.disabled = true;

    if (!file) return;

    if (!allowedTypes.includes(file.type)) {

      photoStatus.textContent =
        "Please select a JPG, PNG, or WebP image.";

      photoFileInput.value = "";
      return;

    }

    if (file.size > MAX_FILE_SIZE) {

      photoStatus.textContent =
        "Photo size must not exceed 2 MB.";

      photoFileInput.value = "";
      return;

    }

    selectedPhoto = file;
    uploadPhotoBtn.disabled = false;

    photoStatus.textContent = "Photo selected. Click Upload Photo to continue.";

  });

  // =========================================
  // UPLOAD PHOTO
  // =========================================

  uploadPhotoBtn.addEventListener("click", async function () {

    if (!selectedPhoto || !currentUser) return;

    const originalButtonText = uploadPhotoBtn.textContent;

    uploadPhotoBtn.disabled = true;
    choosePhotoBtn.disabled = true;
    removePhotoBtn.disabled = true;

    uploadPhotoBtn.textContent = "Uploading...";
    photoStatus.textContent = "Uploading profile photo...";

    try {

      const avatarPath = `${currentUser.id}/profile`;

      const { error: uploadError } =
        await supabaseAuth.storage
          .from(BUCKET_NAME)
          .upload(avatarPath, selectedPhoto, {
            cacheControl: "3600",
            upsert: true,
            contentType: selectedPhoto.type
          });

      if (uploadError) throw uploadError;

      const { error: updateError } =
        await supabaseAuth
          .from("jobseeker_profiles")
          .update({
            avatar_url: avatarPath,
            updated_at: new Date().toISOString()
          })
          .eq("user_id", currentUser.id);

      if (updateError) throw updateError;

      currentAvatarPath = avatarPath;

      const { data: signedData, error: signedError } =
        await supabaseAuth.storage
          .from(BUCKET_NAME)
          .createSignedUrl(avatarPath, 3600);

      if (signedError) throw signedError;

      displayPhoto(signedData.signedUrl);

      removePhotoBtn.hidden = false;

      selectedPhoto = null;
      photoFileInput.value = "";

      photoStatus.textContent = "Profile photo uploaded successfully.";

    } catch (error) {

      console.error("Upload Jobseeker Photo Error:", error);

      photoStatus.textContent =
        error.message || "Unable to upload profile photo.";

    } finally {

      uploadPhotoBtn.disabled = true;
      choosePhotoBtn.disabled = false;
      removePhotoBtn.disabled = false;
      uploadPhotoBtn.textContent = originalButtonText;

    }

  });

  // =========================================
  // REMOVE PHOTO
  // =========================================

  removePhotoBtn.addEventListener("click", async function () {

    if (!currentAvatarPath || !currentUser) return;

    const confirmed = window.confirm(
      "Are you sure you want to remove your profile photo?"
    );

    if (!confirmed) return;

    removePhotoBtn.disabled = true;
    choosePhotoBtn.disabled = true;

    photoStatus.textContent = "Removing profile photo...";

    try {

      const { error: deleteError } =
        await supabaseAuth.storage
          .from(BUCKET_NAME)
          .remove([currentAvatarPath]);

      if (deleteError) throw deleteError;

      const { error: updateError } =
        await supabaseAuth
          .from("jobseeker_profiles")
          .update({
            avatar_url: null,
            updated_at: new Date().toISOString()
          })
          .eq("user_id", currentUser.id);

      if (updateError) throw updateError;

      currentAvatarPath = null;

      showInitials(
        sidebarName ? sidebarName.textContent : "Job Seeker"
      );

      removePhotoBtn.hidden = true;

      photoStatus.textContent = "Profile photo removed successfully.";

    } catch (error) {

      console.error("Remove Jobseeker Photo Error:", error);

      photoStatus.textContent =
        error.message || "Unable to remove profile photo.";

    } finally {

      removePhotoBtn.disabled = false;
      choosePhotoBtn.disabled = false;

    }

  });

  // Load photo when Jobseeker Dashboard opens.
  await loadJobseekerPhoto();

});


/* =====================================================
   KERJIVA MALAYSIA
   JOBSEEKER MY DOCUMENTS
   LOAD, VIEW & UPLOAD DOCUMENTS
   PRIVATE SUPABASE STORAGE
   ===================================================== */

document.addEventListener("DOMContentLoaded", async function () {

  const params = new URLSearchParams(window.location.search);

  // Jalankan hanya pada dashboard Jobseeker sebenarnya.
  if (params.get("dashboard") !== "jobseeker" || params.has("preview")) {
    return;
  }

  const documentList = document.getElementById("jobseekerDocumentList");
  const documentType = document.getElementById("jobseekerDocumentType");
  const documentFile = document.getElementById("jobseekerDocumentFile");
  const uploadBtn = document.getElementById("uploadJobseekerDocumentBtn");
  const statusEl = document.getElementById("jobseekerDocumentStatus");

  if (
    !documentList ||
    !documentType ||
    !documentFile ||
    !uploadBtn ||
    !statusEl
  ) {
    return;
  }

  const BUCKET_NAME = "jobseeker-documents";
  const MAX_FILE_SIZE = 10 * 1024 * 1024;

  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/jpeg",
    "image/png"
  ];

  const documentTypeLabels = {
    cv: "CV / Resume",
    certificate: "Certificate",
    education: "Education Certificate",
    experience: "Work Experience Letter",
    mykad: "MyKad",
    passport: "Passport",
    driving_license: "Driving Licence",
    other: "Other Documents"
  };

  let currentUser = null;
  let selectedFile = null;

  // =========================================
  // FORMAT FILE SIZE
  // =========================================

  function formatFileSize(bytes) {

    if (!bytes) return "Unknown size";

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;

  }

  // =========================================
  // DISPLAY EMPTY STATE
  // =========================================

  function showEmptyState() {

    documentList.replaceChildren();

    const emptyState = document.createElement("div");
    emptyState.className = "dashboard-empty-state";

    const heading = document.createElement("h3");
    heading.textContent = "No Documents Uploaded";

    const description = document.createElement("p");
    description.textContent =
      "Your uploaded documents will appear here.";

    emptyState.append(heading, description);
    documentList.appendChild(emptyState);

  }

  // =========================================
  // LOAD DOCUMENTS FROM SUPABASE
  // =========================================

  async function loadJobseekerDocuments() {

    documentList.textContent = "Loading documents...";

    try {

      const { data, error } = await supabaseAuth
        .from("jobseeker_documents")
        .select(`
          id,
          document_type,
          file_name,
          storage_path,
          file_size,
          mime_type,
          created_at
        `)
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        showEmptyState();
        return;
      }

      documentList.replaceChildren();

      for (const item of data) {

        const card = document.createElement("div");
        card.className = "jobseeker-document-card";

        const heading = document.createElement("h3");
        heading.textContent =
          documentTypeLabels[item.document_type] ||
          item.document_type;

        const fileName = document.createElement("p");
        fileName.textContent = item.file_name;

        const fileInfo = document.createElement("p");
        fileInfo.textContent = formatFileSize(item.file_size);

        const date = document.createElement("p");
        date.textContent = item.created_at
          ? new Date(item.created_at).toLocaleDateString("en-MY")
          : "";

        const viewLink = document.createElement("a");
        viewLink.textContent = "View Document";
        viewLink.target = "_blank";
        viewLink.rel = "noopener noreferrer";

        const { data: signedData, error: signedError } =
          await supabaseAuth.storage
            .from(BUCKET_NAME)
            .createSignedUrl(item.storage_path, 3600);

        if (!signedError && signedData?.signedUrl) {

          viewLink.href = signedData.signedUrl;

        } else {

          viewLink.textContent = "Document unavailable";
          viewLink.removeAttribute("target");

        }

     
     
        const editBtn = document.createElement("button");
        editBtn.type = "button";
        editBtn.className = "document-edit-btn";
        editBtn.textContent = "Edit";

        // =========================================
        // OPEN DOCUMENT EDIT FORM
        // =========================================

        editBtn.addEventListener("click", function () {

          if (card.querySelector(".document-edit-form")) return;

          const editForm = document.createElement("div");
          editForm.className = "document-edit-form";

          const typeLabel = document.createElement("label");
          typeLabel.textContent = "Document Type";

          const typeSelect = document.createElement("select");

          Object.entries(documentTypeLabels).forEach(
            ([value, label]) => {

              const option = document.createElement("option");
              option.value = value;
              option.textContent = label;

              typeSelect.appendChild(option);

            }
          );

          typeSelect.value = item.document_type;

          // CURRENT FILE
          const currentFileLabel = document.createElement("label");
          currentFileLabel.textContent = "Current File";

          const currentFileInfo = document.createElement("p");
          currentFileInfo.textContent = item.file_name;

          // CHOOSE REPLACEMENT FILE
          const fileLabel = document.createElement("label");
          fileLabel.textContent = "Choose Replacement File";

          const fileInput = document.createElement("input");
          fileInput.type = "file";
          fileInput.accept = ".pdf,.doc,.docx,.jpg,.jpeg,.png";

          let replacementFile = null;

          const fileNote = document.createElement("p");
          fileNote.textContent =
            "PDF, DOC, DOCX, JPG, PNG. Maximum file size: 10 MB.";

          const formStatus = document.createElement("p");
          formStatus.className = "document-edit-status";

          fileInput.addEventListener("change", function () {

            replacementFile = fileInput.files[0] || null;

            if (!replacementFile) {
              fileNote.textContent =
                "PDF, DOC, DOCX, JPG, PNG. Maximum file size: 10 MB.";
              return;
            }

            if (!allowedTypes.includes(replacementFile.type)) {

              formStatus.textContent =
                "Please select a PDF, DOC, DOCX, JPG, or PNG file.";

              replacementFile = null;
              fileInput.value = "";

              return;

            }

            if (replacementFile.size > MAX_FILE_SIZE) {

              formStatus.textContent =
                "Document size must not exceed 10 MB.";

              replacementFile = null;
              fileInput.value = "";

              return;

            }

            formStatus.textContent = "";
            fileNote.textContent =
              "Selected: " + replacementFile.name;

          });

          const saveBtn = document.createElement("button");
          saveBtn.type = "button";
          saveBtn.className = "document-edit-save-btn";
          saveBtn.textContent = "Save Changes";

          const cancelBtn = document.createElement("button");
          cancelBtn.type = "button";
          cancelBtn.textContent = "Cancel";

          cancelBtn.addEventListener("click", function () {
            editForm.remove();
          });

          // =========================================
          // SAVE DOCUMENT CHANGES
          // =========================================

          saveBtn.addEventListener("click", async function () {

            if (!currentUser) {
              formStatus.textContent =
                "Your session has expired. Please sign in again.";
              return;
            }

            const selectedType = typeSelect.value;

            if (!selectedType) {
              formStatus.textContent =
                "Please select a document type.";
              return;
            }

            const originalButtonText = saveBtn.textContent;

            saveBtn.disabled = true;
            cancelBtn.disabled = true;
            typeSelect.disabled = true;
            fileInput.disabled = true;

            saveBtn.textContent = "Saving...";
            formStatus.textContent = "Saving document changes...";

          
let replacementPath = null;
const oldStoragePath = item.storage_path;

try {

  // Upload replacement file if selected.
  if (replacementFile) {

    const safeFileName = replacementFile.name
      .replace(/[^a-zA-Z0-9._-]/g, "_");

    replacementPath =
      `${currentUser.id}/${crypto.randomUUID()}-${safeFileName}`;

    const { error: uploadError } =
      await supabaseAuth.storage
        .from(BUCKET_NAME)
        .upload(replacementPath, replacementFile, {
          cacheControl: "3600",
          upsert: false,
          contentType: replacementFile.type
        });

    if (uploadError) throw uploadError;

  }

  const updateData = {
    document_type: selectedType,
    updated_at: new Date().toISOString()
  };

  if (replacementFile) {
    updateData.file_name = replacementFile.name;
    updateData.storage_path = replacementPath;
    updateData.file_size = replacementFile.size;
    updateData.mime_type = replacementFile.type;
  }

  const { data, error } = await supabaseAuth
    .from("jobseeker_documents")
    .update(updateData)
    .eq("id", item.id)
    .eq("user_id", currentUser.id)
    .select("id")
    .single();

  if (error) throw error;

  if (!data) {
    throw new Error(
      "Document was not found or could not be updated."
    );
  }

  // Database update succeeded.
  // New file is now the active source document.
  replacementPath = null;

  // Remove old Storage file only after successful replacement.
  if (replacementFile && oldStoragePath) {

    const { error: deleteError } =
      await supabaseAuth.storage
        .from(BUCKET_NAME)
        .remove([oldStoragePath]);

    if (deleteError) {
      console.error(
        "Old Document Cleanup Error:",
        deleteError
      );

      statusEl.textContent =
        "Document updated successfully, but the old file could not be removed.";
    } else {
      statusEl.textContent =
        "Document updated successfully.";
    }

  } else {

    statusEl.textContent =
      "Document updated successfully.";

  }

  await loadJobseekerDocuments();

} catch (error) {

  console.error(
    "Update Jobseeker Document Error:",
    error
  );

  // Remove replacement upload if database update failed.
  if (replacementPath) {

    const { error: cleanupError } =
      await supabaseAuth.storage
        .from(BUCKET_NAME)
        .remove([replacementPath]);

    if (cleanupError) {
      console.error(
        "Replacement File Cleanup Error:",
        cleanupError
      );
    }

  }

  formStatus.textContent =
    error.message || "Unable to update document.";

} finally {

  saveBtn.disabled = false;
  cancelBtn.disabled = false;
  typeSelect.disabled = false;
  fileInput.disabled = false;
  saveBtn.textContent = originalButtonText;

}

          });

          editForm.append(
            typeLabel,
            typeSelect,
            currentFileLabel,
            currentFileInfo,
            fileLabel,
            fileInput,
            fileNote,
            formStatus,
            saveBtn,
            cancelBtn
          );

          card.appendChild(editForm);

        });

        card.append(
          heading,
          fileName,
          fileInfo,
          date,
          viewLink,
          editBtn
        );

        documentList.appendChild(card);

      }

    } catch (error) {

      console.error("Load Jobseeker Documents Error:", error);

      documentList.textContent =
        "Unable to load your documents. Please try again.";

      throw error;

    }

  }
  // =========================================
  // SELECT DOCUMENT FILE
  // =========================================

  documentFile.addEventListener("change", function () {

    selectedFile = documentFile.files[0] || null;

    if (!selectedFile) {
      statusEl.textContent = "";
      return;
    }

    if (!allowedTypes.includes(selectedFile.type)) {

      statusEl.textContent =
        "Please select a PDF, DOC, DOCX, JPG, or PNG file.";

      selectedFile = null;
      documentFile.value = "";

      return;

    }

    if (selectedFile.size > MAX_FILE_SIZE) {

      statusEl.textContent =
        "Document size must not exceed 10 MB.";

      selectedFile = null;
      documentFile.value = "";

      return;

    }

    statusEl.textContent = "File selected successfully.";

  });

  // =========================================
  // UPLOAD DOCUMENT
  // =========================================

  uploadBtn.addEventListener("click", async function () {

    const selectedType = documentType.value;

    if (!currentUser) {
      statusEl.textContent =
        "Your session has expired. Please sign in again.";
      return;
    }

    if (!selectedType) {
      statusEl.textContent = "Please select a document type.";
      return;
    }

    if (!selectedFile) {
      statusEl.textContent = "Please select a file first.";
      return;
    }

    const file = selectedFile;

    const originalButtonText = uploadBtn.textContent;

    uploadBtn.disabled = true;
    documentType.disabled = true;
    documentFile.disabled = true;

    uploadBtn.textContent = "Uploading...";
    statusEl.textContent = "Uploading your document...";

    let uploadedPath = null;

    try {

      const safeFileName = file.name
        .replace(/[^a-zA-Z0-9._-]/g, "_");

      uploadedPath =
        `${currentUser.id}/${crypto.randomUUID()}-${safeFileName}`;

      // Upload to private Storage.
      const { error: uploadError } =
        await supabaseAuth.storage
          .from(BUCKET_NAME)
          .upload(uploadedPath, file, {
            cacheControl: "3600",
            upsert: false,
            contentType: file.type
          });

      if (uploadError) throw uploadError;

      // Save document metadata.
      const { error: insertError } =
        await supabaseAuth
          .from("jobseeker_documents")
          .insert({
            user_id: currentUser.id,
            document_type: selectedType,
            file_name: file.name,
            storage_path: uploadedPath,
            file_size: file.size,
            mime_type: file.type
          });

      if (insertError) throw insertError;

      uploadedPath = null;

      selectedFile = null;
      documentFile.value = "";
      documentType.value = "";

      await loadJobseekerDocuments();

      statusEl.textContent =
        "Document uploaded successfully.";

    } catch (error) {

      console.error("Upload Jobseeker Document Error:", error);

      // Remove newly uploaded file if database insertion failed.
      if (uploadedPath) {

        const { error: cleanupError } =
          await supabaseAuth.storage
            .from(BUCKET_NAME)
            .remove([uploadedPath]);

        if (cleanupError) {
          console.error(
            "Document Upload Cleanup Error:",
            cleanupError
          );
        }

      }

      statusEl.textContent =
        error.message || "Unable to upload your document.";

    } finally {

      uploadBtn.disabled = false;
      documentType.disabled = false;
      documentFile.disabled = false;
      uploadBtn.textContent = originalButtonText;

    }

  });

  // =========================================
  // INITIALIZE MY DOCUMENTS
  // =========================================

  try {

    const { data: sessionData, error: sessionError } =
      await supabaseAuth.auth.getSession();

    if (sessionError) throw sessionError;

    const session = sessionData.session;

    if (!session || !session.user) {
      throw new Error("Please sign in again.");
    }

    currentUser = session.user;

    await loadJobseekerDocuments();

  } catch (error) {

    console.error("Initialize My Documents Error:", error);

    statusEl.textContent =
      error.message || "Unable to initialize My Documents.";

  }

});

/* =====================================================
   KERJIVA MALAYSIA
   JOBSEEKER MY APPLICATIONS
   LOAD APPLICATION HISTORY
   SUPABASE REALTIME
   ===================================================== */

document.addEventListener("DOMContentLoaded", async function () {

  const params = new URLSearchParams(window.location.search);

  // Jalankan hanya pada dashboard Jobseeker sebenarnya.
  if (
    params.get("dashboard") !== "jobseeker" ||
    params.has("preview")
  ) {
    return;
  }

  const dashboard = document.getElementById("jobseekerDashboard");
  const applicationList = document.getElementById(
    "jobseekerApplicationsList"
  );

  if (!dashboard || !applicationList) return;

  let currentUser = null;
  let applicationChannel = null;
  let isLoading = false;
  let loadRequestId = 0;

  // =========================================
  // EMPTY STATE
  // =========================================

  function showEmptyState() {

    applicationList.replaceChildren();

    const emptyState = document.createElement("div");
    emptyState.className = "dashboard-empty-state";

    const heading = document.createElement("h3");
    heading.textContent = "No Applications Yet";

    const description = document.createElement("p");
    description.textContent =
      "You have not submitted any job applications.";

    emptyState.append(heading, description);
    applicationList.appendChild(emptyState);

  }

  // =========================================
  // FORMAT APPLICATION STATUS
  // =========================================

  function formatApplicationStatus(status) {

    if (!status) return "Status not set";

    return String(status)
      .replace(/[_-]+/g, " ")
      .replace(/\b\w/g, character => character.toUpperCase());

  }

  // =========================================
  // LOAD APPLICATIONS
  // =========================================

  async function loadJobseekerApplications() {

    if (!currentUser || isLoading) return;

    isLoading = true;

    const requestId = ++loadRequestId;

    applicationList.textContent = "Loading applications...";

    try {

      // 1. Get applications belonging to this Jobseeker.
      const { data: applications, error: applicationError } =
        await supabaseAuth
          .from("applications")
          .select(`
            id,
            job_id,
            status,
            applied_at
          `)
          .eq("user_id", currentUser.id)
          .order("applied_at", { ascending: false });

      if (applicationError) throw applicationError;

      if (requestId !== loadRequestId) return;

      if (!applications || applications.length === 0) {
        showEmptyState();
        return;
      }

      // 2. Get related job information.
      const jobIds = [
        ...new Set(applications.map(item => item.job_id))
      ];

      const { data: jobs, error: jobsError } =
        await supabaseAuth
          .from("jobs")
          .select(`
            id,
            title,
            job_type,
            category,
            city,
            state,
            company_id
          `)
          .in("id", jobIds);

      if (jobsError) throw jobsError;

      if (requestId !== loadRequestId) return;

      const jobMap = new Map(
        (jobs || []).map(job => [job.id, job])
      );

      // 3. Get related company information.
      const companyIds = [
        ...new Set(
          (jobs || [])
            .map(job => job.company_id)
            .filter(Boolean)
        )
      ];

      let companies = [];

      if (companyIds.length > 0) {

        const { data: companyData, error: companyError } =
          await supabaseAuth
            .from("companies")
            .select("id, company_name")
            .in("id", companyIds);

        if (companyError) throw companyError;

        companies = companyData || [];

      }

      if (requestId !== loadRequestId) return;

      const companyMap = new Map(
        companies.map(company => [company.id, company])
      );

      // 4. Display application history.
      applicationList.replaceChildren();

      for (const application of applications) {

        const job = jobMap.get(application.job_id);
        const company = job
          ? companyMap.get(job.company_id)
          : null;

        const card = document.createElement("div");
        card.className = "jobseeker-application-card";

        const heading = document.createElement("h3");
        heading.textContent = job
          ? job.title
          : "Job details unavailable";

        const companyName = document.createElement("p");
        companyName.textContent = company
          ? company.company_name
          : "Company information unavailable";

        const status = document.createElement("p");
        status.className = "application-status";
        status.textContent =
          "Status: " +
          formatApplicationStatus(application.status);

        const jobType = document.createElement("p");
        jobType.textContent = job?.job_type || "";

        const category = document.createElement("p");
        category.textContent = job?.category || "";

        const location = document.createElement("p");

        const locationParts = [
          job?.city,
          job?.state
        ].filter(Boolean);

        location.textContent = locationParts.join(", ");

        const appliedDate = document.createElement("p");
        appliedDate.textContent = application.applied_at
          ? "Applied on: " +
            new Date(application.applied_at).toLocaleDateString("en-MY")
          : "Application date unavailable";

        card.append(
          heading,
          companyName,
          status
        );

        if (jobType.textContent) card.appendChild(jobType);
        if (category.textContent) card.appendChild(category);
        if (location.textContent) card.appendChild(location);

        card.appendChild(appliedDate);

        applicationList.appendChild(card);

      }

    } catch (error) {

      console.error(
        "Load Jobseeker Applications Error:",
        error
      );

      if (requestId === loadRequestId) {

        applicationList.textContent =
          "Unable to load your applications. Please try again.";

      }

    } finally {

      isLoading = false;

    }

  }

  // =========================================
  // REFRESH WHEN OPENING MY APPLICATIONS
  // =========================================

  const menuLinks = dashboard.querySelectorAll(
    ".dashboard-menu .dashboard-menu-link"
  );

  menuLinks.forEach(link => {

    link.addEventListener("click", function () {

      if (
        this.getAttribute("href") === "#jobseekerApplications"
      ) {
        loadJobseekerApplications();
      }

    });

  });

  // =========================================
  // INITIALIZE SESSION
  // =========================================

  try {

    const { data: sessionData, error: sessionError } =
      await supabaseAuth.auth.getSession();

    if (sessionError) throw sessionError;

    if (!sessionData.session?.user) {
      throw new Error("Please sign in again.");
    }

    currentUser = sessionData.session.user;

    // Load application history when dashboard opens.
    await loadJobseekerApplications();

    // =========================================
    // SUPABASE REALTIME SUBSCRIPTION
    // =========================================

    applicationChannel = supabaseAuth
      .channel("jobseeker-applications-" + currentUser.id)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "applications",
          filter: "user_id=eq." + currentUser.id
        },
        function () {
          loadJobseekerApplications();
        }
      )
      .subscribe(function (status) {

        if (status === "CHANNEL_ERROR" ||
            status === "TIMED_OUT") {

          console.warn(
            "My Applications Realtime is unavailable:",
            status
          );

        }

      });

  } catch (error) {

    console.error(
      "Initialize My Applications Error:",
      error
    );

    applicationList.textContent =
      error.message || "Unable to initialize My Applications.";

  }

});


/* =====================================================
   KERJIVA MALAYSIA
   JOBSEEKER FIND JOBS
   LOAD PUBLISHED JOBS
   SEARCH AND FILTER
   ===================================================== */

document.addEventListener("DOMContentLoaded", async function () {

  const params = new URLSearchParams(window.location.search);

  // Run only on the actual Jobseeker dashboard.
  if (
    params.get("dashboard") !== "jobseeker" ||
    params.has("preview")
  ) {
    return;
  }

  const dashboard = document.getElementById("jobseekerDashboard");
  const resultsContainer = document.getElementById(
    "jobseekerJobResults"
  );

  const keywordInput = document.getElementById(
    "dashboardJobKeyword"
  );

  const locationInput = document.getElementById(
    "dashboardJobLocation"
  );

  const categorySelect = document.getElementById(
    "dashboardJobCategory"
  );

  const jobTypeSelect = document.getElementById(
    "dashboardJobType"
  );

  const searchButton = document.getElementById(
    "dashboardJobSearchBtn"
  );

  if (
    !dashboard ||
    !resultsContainer ||
    !keywordInput ||
    !locationInput ||
    !categorySelect ||
    !jobTypeSelect ||
    !searchButton
  ) {
    return;
  }

  let publishedJobs = [];
  let companyMap = new Map();
  let isLoading = false;

  // =========================================
  // EMPTY STATE
  // =========================================

  function showJobEmptyState(
    headingText,
    descriptionText
  ) {

    resultsContainer.replaceChildren();

    const emptyState = document.createElement("div");
    emptyState.className = "empty-jobs";

    const heading = document.createElement("h3");
    heading.textContent = headingText;

    const description = document.createElement("p");
    description.textContent = descriptionText;

    emptyState.append(heading, description);
    resultsContainer.appendChild(emptyState);

  }

  // =========================================
  // FORMAT SALARY
  // =========================================

  function formatJobSalary(job) {

    const minimum = Number(job.salary_min);
    const maximum = Number(job.salary_max);

    const hasMinimum =
      job.salary_min !== null &&
      job.salary_min !== undefined &&
      job.salary_min !== "";

    const hasMaximum =
      job.salary_max !== null &&
      job.salary_max !== undefined &&
      job.salary_max !== "";

    if (!hasMinimum && !hasMaximum) {
      return "Salary not specified";
    }

    const currency = job.salary_currency || "MYR";

    function formatAmount(amount) {

      return new Intl.NumberFormat("en-MY", {
        maximumFractionDigits: 0
      }).format(amount);

    }

    if (hasMinimum && hasMaximum) {

      return currency + " " +
        formatAmount(minimum) +
        " - " +
        formatAmount(maximum);

    }

    if (hasMinimum) {
      return currency + " " + formatAmount(minimum);
    }

    return "Up to " + currency + " " + formatAmount(maximum);

  }

  // =========================================
  // POPULATE FILTER OPTIONS
  // =========================================

  function populateJobFilters() {

    const categories = [
      ...new Set(
        publishedJobs
          .map(job => String(job.category || "").trim())
          .filter(Boolean)
      )
    ].sort((a, b) => a.localeCompare(b));

    const jobTypes = [
      ...new Set(
        publishedJobs
          .map(job => String(job.job_type || "").trim())
          .filter(Boolean)
      )
    ].sort((a, b) => a.localeCompare(b));

    categorySelect.replaceChildren();

    const allCategories = document.createElement("option");
    allCategories.value = "";
    allCategories.textContent = "All Categories";
    categorySelect.appendChild(allCategories);

    categories.forEach(category => {

      const option = document.createElement("option");
      option.value = category;
      option.textContent = category;

      categorySelect.appendChild(option);

    });

    jobTypeSelect.replaceChildren();

    const allJobTypes = document.createElement("option");
    allJobTypes.value = "";
    allJobTypes.textContent = "All Job Types";
    jobTypeSelect.appendChild(allJobTypes);

    jobTypes.forEach(jobType => {

      const option = document.createElement("option");
      option.value = jobType;
      option.textContent = jobType;

      jobTypeSelect.appendChild(option);

    });

  }

  // =========================================
  // DISPLAY JOB CARDS
  // =========================================

  function displayJobs(jobsToDisplay) {

    resultsContainer.replaceChildren();

    if (!jobsToDisplay.length) {

      showJobEmptyState(
        "No Matching Jobs",
        "Try changing your search keywords or filters."
      );

      return;
    }

    jobsToDisplay.forEach(job => {

      const card = document.createElement("article");
      card.className = "find-job-card";

      const title = document.createElement("h3");
      title.textContent = job.title || "Untitled Job";

      const company = document.createElement("p");
      company.className = "find-job-company";

      const companyData = companyMap.get(job.company_id);

      company.textContent = companyData
        ? companyData.company_name
        : "Company information unavailable";

      const details = document.createElement("div");
      details.className = "find-job-details";

      const locationParts = [
        job.city,
        job.state
      ].filter(Boolean);

      const location = document.createElement("p");
      location.textContent = locationParts.length
        ? "Location: " + locationParts.join(", ")
        : "Location not specified";

      const category = document.createElement("p");
      category.textContent = job.category
        ? "Category: " + job.category
        : "Category not specified";

      const jobType = document.createElement("p");
      jobType.textContent = job.job_type
        ? "Job Type: " + job.job_type
        : "Job Type not specified";

      const salary = document.createElement("p");
      salary.textContent =
        "Salary: " + formatJobSalary(job);

      details.append(
        location,
        category,
        jobType,
        salary
      );

      const description = document.createElement("p");
      description.className = "find-job-description";

      const descriptionText = String(
        job.description || ""
      ).trim();

      description.textContent = descriptionText.length > 180
        ? descriptionText.substring(0, 180) + "..."
        : descriptionText || "No job description available.";

      card.append(
        title,
        company,
        details,
        description
      );

      resultsContainer.appendChild(card);

    });

  }

  // =========================================
  // SEARCH AND FILTER JOBS
  // =========================================

  function searchJobs() {

    const keyword = keywordInput.value
      .trim()
      .toLowerCase();

    const location = locationInput.value
      .trim()
      .toLowerCase();

    const selectedCategory = categorySelect.value
      .trim()
      .toLowerCase();

    const selectedJobType = jobTypeSelect.value
      .trim()
      .toLowerCase();

    const filteredJobs = publishedJobs.filter(job => {

      const keywordContent = [
        job.title,
        job.description,
        job.requirements
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const locationContent = [
        job.city,
        job.state
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesKeyword =
        !keyword || keywordContent.includes(keyword);

      const matchesLocation =
        !location || locationContent.includes(location);

      const matchesCategory =
        !selectedCategory ||
        String(job.category || "").trim().toLowerCase() ===
          selectedCategory;

      const matchesJobType =
        !selectedJobType ||
        String(job.job_type || "").trim().toLowerCase() ===
          selectedJobType;

      return (
        matchesKeyword &&
        matchesLocation &&
        matchesCategory &&
        matchesJobType
      );

    });

    displayJobs(filteredJobs);

  }

  // =========================================
  // LOAD PUBLISHED JOBS FROM SUPABASE
  // =========================================

  async function loadPublishedJobs() {

    if (isLoading) return;

    isLoading = true;

    resultsContainer.textContent = "Loading jobs...";

    try {

      const { data: jobs, error: jobsError } =
        await supabaseAuth
          .from("jobs")
          .select(`
            id,
            title,
            description,
            requirements,
            job_type,
            category,
            salary_min,
            salary_max,
            salary_currency,
            experience,
            education,
            city,
            state,
            application_deadline,
            created_at,
            company_id
          `)
          .eq("status", "published")
          .order("created_at", { ascending: false });

      if (jobsError) throw jobsError;

      publishedJobs = jobs || [];

      // Load company names belonging to published jobs.
      const companyIds = [
        ...new Set(
          publishedJobs
            .map(job => job.company_id)
            .filter(Boolean)
        )
      ];

      companyMap = new Map();

      if (companyIds.length > 0) {

        const { data: companies, error: companyError } =
          await supabaseAuth
            .from("companies")
            .select("id, company_name")
            .in("id", companyIds);

        if (companyError) throw companyError;

        companyMap = new Map(
          (companies || []).map(company => [
            company.id,
            company
          ])
        );

      }

      populateJobFilters();

      if (publishedJobs.length === 0) {

        showJobEmptyState(
          "No Jobs Available",
          "Available job opportunities will appear here."
        );

        return;
      }

      searchJobs();

    } catch (error) {

      console.error(
        "Load Find Jobs Error:",
        error
      );

      showJobEmptyState(
        "Unable to Load Jobs",
        "Please refresh the page and try again."
      );

    } finally {

      isLoading = false;

    }

  }

  // =========================================
  // SEARCH BUTTON
  // =========================================

  searchButton.addEventListener("click", searchJobs);

  // Press Enter to search from the text fields.
  [keywordInput, locationInput].forEach(input => {

    input.addEventListener("keydown", function (event) {

      if (event.key === "Enter") {
        event.preventDefault();
        searchJobs();
      }

    });

  });

  // Update results when filters change.
  categorySelect.addEventListener("change", searchJobs);
  jobTypeSelect.addEventListener("change", searchJobs);

  // =========================================
  // LOAD JOBS WHEN OPENING FIND JOBS
  // =========================================

  const menuLinks = dashboard.querySelectorAll(
    ".dashboard-menu .dashboard-menu-link"
  );

  menuLinks.forEach(link => {

    link.addEventListener("click", function () {

      if (
        this.getAttribute("href") === "#jobseekerFindJobs"
      ) {
        loadPublishedJobs();
      }

    });

  });

  // =========================================
  // INITIALIZE SESSION
  // =========================================

  try {

    const { data: sessionData, error: sessionError } =
      await supabaseAuth.auth.getSession();

    if (sessionError) throw sessionError;

    if (!sessionData.session?.user) {
      throw new Error("Please sign in again.");
    }

    // Load jobs when the dashboard opens.
    await loadPublishedJobs();

  } catch (error) {

    console.error(
      "Initialize Find Jobs Error:",
      error
    );

    showJobEmptyState(
      "Unable to Load Jobs",
      error.message || "Please sign in again."
    );

  }

});













