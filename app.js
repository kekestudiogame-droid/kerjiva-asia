
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
   KERJIVA MALAYSIA
   CENTRAL DATA SYNCHRONIZER
   ========================================================= */

(function () {
  "use strict";

  if (window.kerjivaMalaysiaSync) {
    console.warn("Kerjiva Malaysia Sync already initialized.");
    return;
  }

  const supabase = window.supabaseAuth;

  if (!supabase) {
    console.error("Kerjiva Malaysia Sync: Supabase is unavailable.");
    return;
  }

  // =========================================
  // INTERNAL STORAGE
  // =========================================

  const cache = new Map();
  const pendingRequests = new Map();

  let sessionRequest = null;
  let currentUserId = null;
  let revision = 0;

  const DEFAULT_TTL = 30000;

  // =========================================
  // SESSION MANAGER
  // =========================================

  async function getSession() {

    if (sessionRequest) {
      return sessionRequest;
    }

    sessionRequest = (async function () {

      const { data, error } =
        await supabase.auth.getSession();

      if (error) throw error;

      const session = data?.session || null;
      const userId = session?.user?.id || null;

      if (currentUserId !== userId) {
        currentUserId = userId;
        clear();
      }

      return {
        session,
        user: session?.user || null,
        userId
      };

    })();

    try {
      return await sessionRequest;
    } finally {
      sessionRequest = null;
    }

  }

  // =========================================
  // CACHE KEY
  // =========================================

  function createCacheKey(key, scope, userId) {

    return [
      scope,
      scope === "user" ? userId : "public",
      key
    ].join(":");

  }

  // =========================================
  // GET DATA
  // REUSE VALID CACHE OR FETCH FROM SUPABASE
  // =========================================

  async function get(key, loader, options = {}) {

    if (typeof key !== "string" || !key.trim()) {
      throw new Error("Sync key is required.");
    }

    if (typeof loader !== "function") {
      throw new Error("Sync loader must be a function.");
    }

    const scope = options.scope || "user";

    if (!["user", "public"].includes(scope)) {
      throw new Error("Invalid sync scope.");
    }

    let identity = {
      session: null,
      user: null,
      userId: null
    };

    if (scope === "user") {

      identity = await getSession();

      if (!identity.userId) {
        throw new Error("User session is required.");
      }

    }

    const cacheKey = createCacheKey(
      key,
      scope,
      identity.userId
    );

    const ttl = options.ttl ?? DEFAULT_TTL;

    // REUSE VALID DATA
    if (!options.force) {

      const cached = cache.get(cacheKey);

      if (
        cached &&
        Date.now() < cached.expiresAt
      ) {
        return cached.data;
      }

    }

    // PREVENT DUPLICATE REQUESTS
    if (pendingRequests.has(cacheKey)) {
      return pendingRequests.get(cacheKey);
    }

    const requestRevision = revision;

    const request = (async function () {

      const data = await loader({
        supabase,
        session: identity.session,
        user: identity.user,
        userId: identity.userId
      });

      // SAVE ONLY IF CACHE WAS NOT CLEARED
      if (requestRevision === revision && ttl > 0) {

        cache.set(cacheKey, {
          data,
          expiresAt: Date.now() + ttl
        });

        window.dispatchEvent(
          new CustomEvent("kerjivaMalaysiaSyncUpdated", {
            detail: {
              key,
              scope,
              userId: identity.userId
            }
          })
        );

      }

      return data;

    })();

    pendingRequests.set(cacheKey, request);

    try {
      return await request;
    } finally {

      if (pendingRequests.get(cacheKey) === request) {
        pendingRequests.delete(cacheKey);
      }

    }

  }

  // =========================================
  // SAVE DATA TO CACHE
  // =========================================

  async function set(key, data, options = {}) {

    const scope = options.scope || "user";

    let userId = null;

    if (scope === "user") {

      const identity = await getSession();

      if (!identity.userId) {
        throw new Error("User session is required.");
      }

      userId = identity.userId;

    }

    const cacheKey = createCacheKey(
      key,
      scope,
      userId
    );

    const ttl = options.ttl ?? DEFAULT_TTL;

    if (ttl <= 0) {
      cache.delete(cacheKey);
      return data;
    }

    cache.set(cacheKey, {
      data,
      expiresAt: Date.now() + ttl
    });

    window.dispatchEvent(
      new CustomEvent("kerjivaMalaysiaSyncUpdated", {
        detail: { key, scope, userId }
      })
    );

    return data;

  }


  // =========================================
  // INVALIDATE DATA
  // =========================================

  function invalidate(key, options = {}) {

    const prefix = options.prefix === true;

    // Prevent in-flight requests from saving stale data
    revision++;

    function isTarget(cacheKey) {

      const logicalKey = cacheKey.split(":").slice(2).join(":");

      return (
        key === undefined ||
        logicalKey === key ||
        (prefix && logicalKey.startsWith(key))
      );

    }

    // Remove matching cached data
    for (const cacheKey of cache.keys()) {

      if (isTarget(cacheKey)) {
        cache.delete(cacheKey);
      }

    }

    // Remove matching pending requests
    for (const cacheKey of pendingRequests.keys()) {

      if (isTarget(cacheKey)) {
        pendingRequests.delete(cacheKey);
      }

    }

    window.dispatchEvent(
      new CustomEvent("kerjivaMalaysiaSyncInvalidated", {
        detail: { key: key || null }
      })
    );

  }


  // =========================================
  // REFRESH DATA
  // =========================================

  async function refresh(key, loader, options = {}) {

    return get(key, loader, {
      ...options,
      force: true
    });

  }

  // =========================================
  // CLEAR ALL DATA
  // =========================================

  function clear() {

    revision++;

    cache.clear();
    pendingRequests.clear();

  }

  // =========================================
  // AUTH STATE LISTENER
  // =========================================

  supabase.auth.onAuthStateChange(function (event, session) {

    const nextUserId = session?.user?.id || null;

    if (
      event === "SIGNED_OUT" ||
      currentUserId !== nextUserId
    ) {

      currentUserId = nextUserId;
      clear();

    }

  });

  // =========================================
  // PUBLIC API
  // =========================================

  window.kerjivaMalaysiaSync = Object.freeze({

    get,
    set,
    invalidate,
    refresh,
    clear,
    getSession,

    getCacheSize: function () {
      return cache.size;
    }

  });

  console.log(
    "Kerjiva Malaysia Data Synchronizer initialized."
  );

})();


/* =========================================================
   INITIALIZATION CHECK
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  console.log("Supabase initialized successfully.");
});



/* =========================================================
   FORGOT PASSWORD
   KERJIVA MALAYSIA
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

  const forgotPasswordForm = document.getElementById("forgotPasswordForm");

  if (!forgotPasswordForm) return;

  const emailInput = document.getElementById("forgotPasswordEmail");
  const submitBtn = document.getElementById("forgotPasswordSubmitBtn");
  const statusText = document.getElementById("forgotPasswordStatus");

  forgotPasswordForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const email = emailInput.value.trim().toLowerCase();

    if (!email) return;

    submitBtn.disabled = true;
    submitBtn.textContent = "Sending...";
    statusText.textContent = "";

    try {

      const { error } = await supabaseAuth.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: new URL(
            "reset-password.html",
            window.location.href
          ).href
        }
      );

      if (error) throw error;

      statusText.textContent = "";

      showKerjivaNotification(
        "If an account exists with this email address, a password reset link will be sent.",
        "success"
      );

      forgotPasswordForm.reset();

    } catch (error) {

      console.error("Forgot Password Error:", error);

      statusText.textContent = "";

      showKerjivaNotification(
        "Unable to send the reset link. Please try again later.",
        "error"
      );

    } finally {

      submitBtn.disabled = false;
      submitBtn.textContent = "Send Reset Link";

    }

  });

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
      const message = "Password must contain at least 8 characters.";
      registerStatus.textContent = message;
      showKerjivaNotification(message, "error");
      return;
    }

    if (password !== confirmPasswordValue) {
      const message = "Password and Confirm Password do not match.";
      registerStatus.textContent = message;
      showKerjivaNotification(message, "error");
      confirmPassword.focus();
      return;
    }

    let email = "";
    let metadata = {};

    // JOBSEEKER REGISTRATION DATA
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

    // COMPANY REGISTRATION DATA
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

      const message = "Please select a valid account type.";
      registerStatus.textContent = message;
      showKerjivaNotification(message, "error");
      return;

    }

    const originalButtonText = registerSubmitBtn.textContent;

    registerSubmitBtn.disabled = true;
    registerSubmitBtn.textContent = "Creating Account...";
    registerStatus.textContent = "Please wait...";

    try {

    
const { data, error } = await supabaseAuth.auth.signUp({
  email: email,
  password: password,
  options: {
    data: metadata,
  emailRedirectTo: new URL(
  "login.html?emailVerification=1",
  window.location.href
  ).href
  }
});


      if (error) {
        throw error;
      }

    
if (data.user) {

  // SAVE EMAIL WAITING FOR VERIFICATION
  localStorage.setItem(
    "kerjivaPendingEmailVerification",
    JSON.stringify({
      email: email.toLowerCase().trim()
    })
  );

  const successMessage =
    "Registration successful! Please check your email and click the verification link before logging in.";

  registerStatus.textContent = "";

  showKerjivaNotification(successMessage, "success");

  registerForm.reset();

  // Restore the default Jobseeker form
  registerRole.value = "jobseeker";
  registerRole.dispatchEvent(new Event("change"));

} else {


        throw new Error("Registration could not be completed. Please try again.");

      }

    } catch (error) {

      console.error("Kerjiva Malaysia Registration Error:", error);

      const errorMessage =
        error.message || "Registration failed. Please try again.";

      registerStatus.textContent = errorMessage;

      showKerjivaNotification(errorMessage, "error");

    } finally {

      registerSubmitBtn.disabled = false;
      registerSubmitBtn.textContent = originalButtonText;

    }

  });

});


/* =====================================================
   KERJIVA MALAYSIA
   SHARED NOTIFICATION SYSTEM
   ===================================================== */

function showKerjivaNotification(message, type = "success") {

  let notification = document.getElementById("kerjivaNotification");

  if (!notification) {

    const style = document.createElement("style");

    style.id = "kerjivaNotificationStyle";

    style.textContent = `
      #kerjivaNotification {
        position: fixed;
        top: 24px;
        right: 24px;
        z-index: 99999;
        max-width: calc(100% - 32px);
        padding: 14px 20px;
        border-radius: 8px;
        color: #ffffff;
        font-size: 14px;
        font-weight: 500;
        line-height: 1.5;
        box-shadow: 0 4px 16px rgba(0,0,0,0.15);
        opacity: 0;
        transform: translateY(-10px);
        transition: opacity 0.25s ease, transform 0.25s ease;
      }

      #kerjivaNotification.show {
        opacity: 1;
        transform: translateY(0);
      }

      #kerjivaNotification.success {
        background: #198754;
      }

      #kerjivaNotification.error {
        background: #dc3545;
      }

      @media (max-width: 600px) {
        #kerjivaNotification {
          top: 16px;
          right: 16px;
          left: 16px;
          max-width: none;
          text-align: center;
        }
      }
    `;

    document.head.appendChild(style);

    notification = document.createElement("div");
    notification.id = "kerjivaNotification";
    notification.setAttribute("role", "status");
    notification.setAttribute("aria-live", "polite");

    document.body.appendChild(notification);
  }

  notification.textContent = message;
  notification.className = type === "error" ? "error" : "success";

  // Restart notification animation
  void notification.offsetWidth;

  notification.classList.add("show");

  if (notification.hideTimer) {
    clearTimeout(notification.hideTimer);
  }

  notification.hideTimer = setTimeout(function () {
    notification.classList.remove("show");
  }, 3500);
}


// SAVE NOTIFICATION BEFORE PAGE REDIRECT
function saveKerjivaNotification(message, type = "success") {

  sessionStorage.setItem(
    "kerjivaPendingNotification",
    JSON.stringify({
      message: message,
      type: type
    })
  );
}


// DISPLAY AND REMOVE SAVED NOTIFICATION
function showPendingKerjivaNotification() {

  const savedNotification = sessionStorage.getItem(
    "kerjivaPendingNotification"
  );

  if (!savedNotification) return;

  sessionStorage.removeItem("kerjivaPendingNotification");

  try {

    const notification = JSON.parse(savedNotification);

    if (notification.message) {
      showKerjivaNotification(
        notification.message,
        notification.type
      );
    }

  } catch (error) {
    console.error("Kerjiva Notification Error:", error);
  }
}

// ========================================
// RETURN TO LOGIN AFTER EMAIL VERIFICATION
// ========================================
window.addEventListener("storage", function (event) {

  if (event.key !== "kerjivaEmailVerificationComplete") {
    return;
  }

  if (!event.newValue) return;

  window.location.replace("login.html");

});

// ========================================
// RETURN TO LOGIN AFTER PASSWORD RESET
// ========================================
window.addEventListener("storage", function (event) {

  if (event.key !== "kerjivaPasswordResetComplete") {
    return;
  }

  if (!event.newValue) return;

  try {

    const resetData = JSON.parse(event.newValue);

    saveKerjivaNotification(
      "Your password has been updated successfully. Please log in with your new password.",
      "success"
    );

    window.location.replace("login.html");

  } catch (error) {

    console.error("Password Reset Notification Error:", error);

  }

});


// ========================================
// EMAIL VERIFICATION CALLBACK
// ========================================
document.addEventListener("DOMContentLoaded", async function () {
  const isVerificationCallback =
    new URLSearchParams(window.location.search)
      .get("emailVerification") === "1";

  if (!isVerificationCallback) return;

          
  const hashParams = new URLSearchParams(
    window.location.hash.replace(/^#/, "")
  );

  const queryParams = new URLSearchParams(
    window.location.search
  );

  const callbackError =
    hashParams.get("error_description") ||
    hashParams.get("error") ||
    hashParams.get("error_code") ||
    queryParams.get("error_description") ||
    queryParams.get("error") ||
    queryParams.get("error_code");


  if (callbackError) {
    showKerjivaNotification(
      "Email verification failed. Please request a new verification link.",
      "error"
    );
    return;
  }

  try {
    const { data, error } =
      await supabaseAuth.auth.getSession();

    if (error) throw error;

    const session = data.session;
    const pendingData = localStorage.getItem(
      "kerjivaPendingEmailVerification"
    );

    if (!session || !session.user || !pendingData) {
      showKerjivaNotification(
        "We could not confirm your email verification. Please try the verification link again.",
        "error"
      );
      return;
    }

    const pending = JSON.parse(pendingData);

    const verifiedEmail =
      (session.user.email || "").toLowerCase().trim();

    const pendingEmail =
      (pending.email || "").toLowerCase().trim();

    if (
      !session.user.email_confirmed_at ||
      !verifiedEmail ||
      verifiedEmail !== pendingEmail
    ) {
      showKerjivaNotification(
        "Email verification could not be confirmed for this registration.",
        "error"
      );
      return;
    }

    // CREATE VERIFICATION SUCCESS DIALOG
    const overlay = document.createElement("div");

    overlay.id = "emailVerificationSuccessDialog";

    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      z-index: 100000;
      background: rgba(0, 0, 0, 0.55);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    `;

    const dialog = document.createElement("div");

    dialog.style.cssText = `
      width: 100%;
      max-width: 420px;
      background: #ffffff;
      border-radius: 12px;
      padding: 28px 24px;
      text-align: center;
      box-shadow: 0 8px 30px rgba(0,0,0,0.2);
    `;

    const message = document.createElement("p");

    message.textContent =
      "Email successfully verified. Your registration is complete.";

    message.style.cssText = `
      color: #333333;
      font-size: 16px;
      line-height: 1.6;
      margin: 0 0 24px;
    `;

    const okButton = document.createElement("button");

    okButton.type = "button";
    okButton.textContent = "OK";

    okButton.style.cssText = `
      min-width: 100px;
      padding: 11px 28px;
      border: none;
      border-radius: 6px;
      background: #198754;
      color: #ffffff;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
    `;

   okButton.addEventListener("click", async function () {

  okButton.disabled = true;
      
       // CLOSE SUCCESS DIALOG
  overlay.remove();

  try {

    await supabaseAuth.auth.signOut({ scope: "local" });

  } catch (signOutError) {

    console.error(
      "Verification callback sign-out error:",
      signOutError
    );

  }

  // SEND SIGNAL TO THE FIRST TAB
  localStorage.setItem(
    "kerjivaEmailVerificationComplete",
    JSON.stringify({
      email: pendingEmail,
      timestamp: Date.now()
    })
  );

  localStorage.removeItem(
    "kerjivaPendingEmailVerification"
  );
      // CLOSE VERIFICATION TAB
     window.close();

});
    dialog.appendChild(message);
    dialog.appendChild(okButton);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

  } catch (error) {
    console.error("Email Verification Callback Error:", error);

    showKerjivaNotification(
      "Unable to verify your email right now. Please try again.",
      "error"
    );
  }
});


          
/* =====================================================
   KERJIVA MALAYSIA
   USER LOGIN
   ===================================================== */

document.addEventListener("DOMContentLoaded", function () {

  const loginForm = document.getElementById("loginForm");

  if (!loginForm) return;

  const loginRole = document.getElementById("loginRole");
  const loginEmail = document.getElementById("loginEmail");
  const loginPassword = document.getElementById("loginPassword");
  const loginSubmitBtn = document.getElementById("loginSubmitBtn");
  const loginStatus = document.getElementById("loginStatus");

  if (
    !loginRole ||
    !loginEmail ||
    !loginPassword ||
    !loginSubmitBtn ||
    !loginStatus
  ) {
    return;
  }

  // DISPLAY PENDING NOTIFICATION AFTER RETURNING TO LOGIN
  showPendingKerjivaNotification();

  loginForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    if (!loginForm.checkValidity()) {
      loginForm.reportValidity();
      return;
    }

    const selectedRole = loginRole.value;
    const email = loginEmail.value.trim();
    const password = loginPassword.value;

    const originalButtonText = loginSubmitBtn.textContent;

    loginSubmitBtn.disabled = true;
    loginSubmitBtn.textContent = "Signing In...";
    loginStatus.textContent = "";

    try {

      // SIGN IN TO SUPABASE
      const { data, error } =
        await supabaseAuth.auth.signInWithPassword({
          email: email,
          password: password
        });

      if (error) throw error;

      const user = data.user;

      if (!user) {
        throw new Error("Unable to identify your account.");
      }

      // EMAIL VERIFICATION CHECK
      if (!user.email_confirmed_at) {
        await supabaseAuth.auth.signOut();

        throw new Error(
          "Please verify your email address before logging in."
        );
      }

      // CHECK JOBSEEKER PROFILE
      const { data: jobseeker, error: jobseekerError } =
        await supabaseAuth
          .from("jobseeker_profiles")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();

      if (jobseekerError) throw jobseekerError;

      // CHECK COMPANY PROFILE
      const { data: company, error: companyError } =
        await supabaseAuth
          .from("companies")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();

      if (companyError) throw companyError;

      // IDENTIFY ACTUAL ACCOUNT ROLE
      let actualRole = null;

      if (jobseeker && !company) {
        actualRole = "jobseeker";
      } else if (company && !jobseeker) {
        actualRole = "company";
      }

      if (!actualRole) {
        await supabaseAuth.auth.signOut();

        throw new Error(
          "Your account profile could not be identified. Please contact support."
        );
      }

      // VALIDATE SELECTED ROLE
      if (selectedRole !== actualRole) {
        await supabaseAuth.auth.signOut();

        throw new Error(
          "The selected account type does not match your registered account. Please select the correct account type."
        );
      }

      // SAVE LOGIN SUCCESS NOTIFICATION
      saveKerjivaNotification(
        "You have successfully logged in.",
        "success"
      );

      // JOBSEEKER LOGIN
      if (actualRole === "jobseeker") {

        const params = new URLSearchParams(window.location.search);
        const applyJobId = params.get("applyJob");

        if (applyJobId) {
          window.location.href =
            "index.html?applyJob=" + encodeURIComponent(applyJobId);
        } else {
          window.location.href =
            "index.html?dashboard=jobseeker";
        }
      }

      // COMPANY LOGIN
      else if (actualRole === "company") {

        window.location.href =
          "index.html?dashboard=company";
      }

    } catch (error) {

      console.error("Kerjiva Malaysia Login Error:", error);

      const errorMessage = (error.message || "").toLowerCase();

      let displayMessage = "Login failed. Please try again.";

      // WRONG EMAIL OR PASSWORD
      if (
        errorMessage.includes("invalid login credentials") ||
        errorMessage.includes("invalid email") ||
        errorMessage.includes("invalid password")
      ) {
        displayMessage = "Invalid email or password.";
      }

      // EMAIL NOT VERIFIED
      else if (
        errorMessage.includes("email not confirmed") ||
        errorMessage.includes("verify your email")
      ) {
        displayMessage =
          "Please verify your email address before logging in.";
      }

      // ACCOUNT TYPE MISMATCH
      else if (errorMessage.includes("account type")) {
        displayMessage =
          "The selected account type does not match your registered account. Please select the correct account type.";
      }

      // PROFILE NOT FOUND
      else if (errorMessage.includes("profile could not be identified")) {
        displayMessage =
          "Your account profile could not be identified. Please contact support.";
      }

      loginStatus.textContent = displayMessage;

      showKerjivaNotification(displayMessage, "error");

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

        saveKerjivaNotification(
          "You have successfully logged out.",
          "success"
        );

        window.location.href = "login.html";

      } catch (error) {

        console.error("Jobseeker Logout Error:", error);

        showKerjivaNotification(
          "Unable to sign out. Please try again.",
          "error"
        );

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

        saveKerjivaNotification(
          "You have successfully logged out.",
          "success"
        );

        window.location.href = "login.html";

      } catch (error) {

        console.error("Company Logout Error:", error);

        showKerjivaNotification(
          "Unable to sign out. Please try again.",
          "error"
        );

        companyLogoutBtn.disabled = false;

      }
    });
  }
   

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

    
      const sync = window.kerjivaMalaysiaSync;

      if (!sync) {
        throw new Error("Kerjiva Malaysia Sync is unavailable.");
      }

      // 1. Get session from Central Sync
      const identity = await sync.getSession();

      if (!identity || !identity.user) {
        window.location.href = "login.html";
        return;
      }

      // 2. Load both account profiles through Central Sync
    const [jobseekerProfile, company] = await Promise.all([
        sync.get(
          "jobseeker-profile",
          async function ({ supabase, userId }) {

            const { data, error } = await supabase
              .from("jobseeker_profiles")
              .select("*")
              .eq("user_id", userId)
              .maybeSingle();

            if (error) throw error;

            return data;
          }
        ),

        sync.get(
          "company-profile",
          async function ({ supabase, userId }) {

            const { data, error } = await supabase
              .from("companies")
              .select(`
                id,
                company_name,
                registration_number,
                industry,
                email,
                phone,
                website,
                state,
                city,
                address,
                description,
                logo_url
              `)
              .eq("user_id", userId)
              .maybeSingle();

            if (error) throw error;

            return data;
          }
        )

      ]);

      // 3. Determine actual account role
      let actualRole = null;

    if (jobseekerProfile && !company) {
      actualRole = "jobseeker";
     } else if (company && !jobseekerProfile) {
       actualRole = "company";
     }

     
      if (!actualRole) {
        await supabaseAuth.auth.signOut();
        window.location.href = "login.html";
        return;
      }

      // VALIDATE REQUESTED DASHBOARD AGAINST LOGIN ROLE
      if (requestedDashboard !== actualRole) {
        alert(
          "Access denied. Your account does not have permission to open this dashboard."
        );

        // Return to Homepage without ending the login session.
        window.location.href = "index.html";
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
       showPendingKerjivaNotification();

    } catch (error) {
      console.error("Kerjiva Malaysia Dashboard Routing Error:", error);
      alert("Unable to open your dashboard. Please sign in again.");
      window.location.href = "login.html";
      return;
    }
  }
   
});
      

/* =====================================================
   KERJIVA MALAYSIA
   HAMBURGER MENU LOGOUT
   ===================================================== */

document.addEventListener("DOMContentLoaded", function () {

  const hamburgerLogoutBtn = document.getElementById(
    "hamburgerLogoutBtn"
  );

  if (!hamburgerLogoutBtn) return;

  hamburgerLogoutBtn.addEventListener("click", async function (event) {

    event.preventDefault();

    hamburgerLogoutBtn.style.pointerEvents = "none";

    try {

      const { error } = await supabaseAuth.auth.signOut();

      if (error) throw error;

      saveKerjivaNotification(
        "You have successfully logged out.",
        "success"
      );

      window.location.href = "login.html";

    } catch (error) {

      console.error("Hamburger Logout Error:", error);

      showKerjivaNotification(
        "Unable to sign out. Please try again.",
        "error"
      );

      hamburgerLogoutBtn.style.pointerEvents = "";

    }

  });

});


/* =====================================================
   KERJIVA MALAYSIA
   COMPANY BACK TO HOMEPAGE
   ===================================================== */

document.addEventListener("DOMContentLoaded", function () {

  const companyBackHomeBtn = document.getElementById(
    "companyBackHomeBtn"
  );

  if (!companyBackHomeBtn) return;

  companyBackHomeBtn.addEventListener("click", function () {

    // Kembali ke Homepage tanpa mengakhiri sesi login.
    window.location.href = "index.html";

  });

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
  // LOAD PROFILE FROM CENTRAL SYNC
  // =========================================

  async function loadJobseekerProfile() {

    statusEl.textContent = "Loading profile...";

    try {

      const sync = window.kerjivaMalaysiaSync;

      if (!sync) {
        throw new Error("Kerjiva Malaysia Sync is unavailable.");
      }

      // Get jobseeker profile from central cache
      const data = await sync.get(
        "jobseeker-profile",
        async function ({ supabase, userId }) {

          const { data, error } = await supabase
            .from("jobseeker_profiles")
            .select("*")
            .eq("user_id", userId)
            .maybeSingle();

          if (error) throw error;

          return data;
        }
      );

      if (!data) {
        throw new Error("Jobseeker profile was not found.");
      }

      originalProfile = { ...data };

      fillProfile(originalProfile);

      setProfileMode(false);

      statusEl.textContent = "";

      console.log("Jobseeker Profile Loaded From Central Sync.");

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

     const identity = await sync.getSession();

     if (!identity || !identity.user) {
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

   // Update Central Sync with the latest saved profile.
      sync.set("jobseeker-profile", originalProfile);

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
  // RETURN TO HOMEPAGE WHEN FIND JOBS IS CLICKED
  if (sectionId === "jobs") {
    const mainHeader = document.querySelector(".main-header");
    const mainContent = document.querySelector("body > main");
    const mainFooter = document.querySelector(".main-footer");

    dashboard.hidden = true;

    if (mainHeader) mainHeader.hidden = false;
    if (mainContent) mainContent.hidden = false;
    if (mainFooter) mainFooter.hidden = false;
     menuLinks.forEach(link => {
     link.classList.remove("active");
     });

    const homepageJobs = document.getElementById("jobs");
    if (homepageJobs) {
      homepageJobs.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }

    return;
  }

  const targetSection = dashboard.querySelector("#" + sectionId);
  if (!targetSection) return;

  sections.forEach(section => {
    section.style.display = "none";
  });

  targetSection.style.display = "block";

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

   
  // DASHBOARD CTA BUTTONS - RETURN TO HOMEPAGE
  const dashboardFindJobBtn = document.getElementById("dashboardFindJobBtn");
  const dashboardExploreJobsBtn = document.getElementById("dashboardExploreJobsBtn");

  [dashboardFindJobBtn, dashboardExploreJobsBtn].forEach(button => {
    if (!button) return;

    button.addEventListener("click", function (event) {
      event.preventDefault();
      showSection("jobs");
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
   CENTRAL SYNC INTEGRATION
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

  const sync = window.kerjivaMalaysiaSync;

  let currentUser = null;
  let currentAvatarPath = null;
  let selectedPhoto = null;
  let currentProfile = null;

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
  // UPDATE CENTRAL PROFILE CACHE
  // =========================================

  async function updateProfileCache(avatarPath) {

    if (!currentProfile || !sync) return;

    currentProfile = {
      ...currentProfile,
      avatar_url: avatarPath,
      updated_at: new Date().toISOString()
    };

    await sync.set(
      "jobseeker-profile",
      currentProfile
    );

  }

  // =========================================
  // LOAD CURRENT PHOTO
  // =========================================

  async function loadJobseekerPhoto() {

    photoStatus.textContent = "Loading profile photo...";

    try {

      if (!sync) {
        throw new Error("Kerjiva Malaysia Sync is unavailable.");
      }

      const identity = await sync.getSession();

      if (!identity || !identity.user) {
        throw new Error("Please sign in again.");
      }

      currentUser = identity.user;

      currentProfile = await sync.get(
        "jobseeker-profile",
        async function ({ supabase, userId }) {

          const { data, error } = await supabase
            .from("jobseeker_profiles")
            .select("*")
            .eq("user_id", userId)
            .maybeSingle();

          if (error) throw error;

          return data;

        }
      );

      if (!currentProfile) {
        throw new Error("Jobseeker profile was not found.");
      }

      if (sidebarName && currentProfile.full_name) {
        sidebarName.textContent = currentProfile.full_name;
      }

      showInitials(currentProfile.full_name);

      currentAvatarPath = currentProfile.avatar_url || null;

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

      console.log("Jobseeker Profile Photo Loaded From Central Sync.");

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

      await updateProfileCache(avatarPath);

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

      console.log("Jobseeker Photo Cache Updated.");

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

      await updateProfileCache(null);

      showInitials(
        sidebarName ? sidebarName.textContent : "Job Seeker"
      );

      removePhotoBtn.hidden = true;

      photoStatus.textContent = "Profile photo removed successfully.";

      console.log("Jobseeker Photo Cache Updated.");

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
  heading.setAttribute("data-i18n", "my_documents_empty_title");
  heading.textContent = "No Documents Uploaded";

  const description = document.createElement("p");
  description.setAttribute(
    "data-i18n",
    "my_documents_empty_description"
  );
  description.textContent =
    "Your uploaded documents will appear here.";

  emptyState.append(heading, description);
  documentList.appendChild(emptyState);

if (typeof window.applyKerjivaTranslations === "function") {
  window.applyKerjivaTranslations(
    window.currentKerjivaLanguage || "en"
  );
}

}

 
  // =========================================
  // LOAD DOCUMENTS FROM CENTRAL SYNC
  // =========================================

  async function loadJobseekerDocuments() {

    documentList.textContent = "Loading documents...";

    try {

      const sync = window.kerjivaMalaysiaSync;

      if (!sync) {
        throw new Error("Kerjiva Malaysia Sync is unavailable.");
      }

      const data = await sync.get(
        "jobseeker-documents",
        async function ({ supabase, userId }) {

          const { data: documents, error } = await supabase
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
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

          if (error) throw error;

          return documents || [];

        }
      );

      if (!data || data.length === 0) {
        showEmptyState();
        console.log("Jobseeker Documents Loaded From Central Sync: 0");
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

        // Signed URL is generated fresh, not cached.
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

          const currentFileLabel = document.createElement("label");
          currentFileLabel.textContent = "Current File";

          const currentFileInfo = document.createElement("p");
          currentFileInfo.textContent = item.file_name;

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

              replacementPath = null;

              // Invalidate cached document list after successful update.
              const sync = window.kerjivaMalaysiaSync;
              if (sync) {
                sync.invalidate("jobseeker-documents");
              }

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

      console.log(
        "Jobseeker Documents Loaded From Central Sync:",
        data.length
      );

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
       const sync = window.kerjivaMalaysiaSync;
       if (sync) {
       sync.invalidate("jobseeker-documents");
      }

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

    const sync = window.kerjivaMalaysiaSync;

    if (!sync) {
      throw new Error("Kerjiva Malaysia Sync is unavailable.");
    }

    const identity = await sync.getSession();

    if (!identity || !identity.user) {
      throw new Error("Please sign in again.");
    }

    currentUser = identity.user;

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
   CENTRAL SYNC
   SUPABASE REALTIME
   ===================================================== */

document.addEventListener("DOMContentLoaded", async function () {

  const params = new URLSearchParams(window.location.search);

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

  const totalApplicationsElement = document.getElementById(
    "totalApplications"
  );

  if (!dashboard || !applicationList) return;

  const sync = window.kerjivaMalaysiaSync;

  let currentUser = null;
  let applicationChannel = null;
  let isLoading = false;
  let refreshRequested = false;

  if (!sync) {
    applicationList.textContent =
      "Kerjiva Malaysia Sync is unavailable.";
    return;
  }

  // =========================================
  // EMPTY STATE
  // =========================================

  function showEmptyState() {

    applicationList.replaceChildren();

    const emptyState = document.createElement("div");
    emptyState.className = "dashboard-empty-state";

    const heading = document.createElement("h3");
    heading.setAttribute("data-i18n", "applications_empty_title");
    heading.textContent = "No Applications Yet";

    const description = document.createElement("p");
    description.setAttribute(
      "data-i18n",
      "applications_empty_description"
    );

    description.textContent =
      "You have not submitted any job applications.";

    emptyState.append(heading, description);
    applicationList.appendChild(emptyState);

    if (typeof window.applyKerjivaTranslations === "function") {
      window.applyKerjivaTranslations(
        window.currentKerjivaLanguage || "en"
      );
    }
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
  // LOAD APPLICATIONS FROM CENTRAL SYNC
  // =========================================

  async function loadJobseekerApplications() {

    if (!currentUser) return;

    if (isLoading) {
      refreshRequested = true;
      return;
    }

    isLoading = true;

    applicationList.textContent = "Loading applications...";

    try {

      const result = await sync.get(
        "jobseeker-applications",
        async function ({ supabase, userId }) {

          // 1. Get Jobseeker applications.

          const {
            data: applications,
            error: applicationError
          } = await supabase
            .from("applications")
            .select(`
              id,
              job_id,
              status,
              applied_at
            `)
            .eq("user_id", userId)
            .order("applied_at", { ascending: false });

          if (applicationError) throw applicationError;

          const applicationData = applications || [];

          if (applicationData.length === 0) {
            return {
              applications: [],
              jobs: [],
              companies: []
            };
          }

          // 2. Get related jobs.

          const jobIds = [
            ...new Set(
              applicationData
                .map(item => item.job_id)
                .filter(Boolean)
            )
          ];

          let jobs = [];

          if (jobIds.length > 0) {

            const {
              data: jobData,
              error: jobsError
            } = await supabase
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

            jobs = jobData || [];
          }

          // 3. Get related companies.

          const companyIds = [
            ...new Set(
              jobs
                .map(job => job.company_id)
                .filter(Boolean)
            )
          ];

          let companies = [];

          if (companyIds.length > 0) {

            const {
              data: companyData,
              error: companyError
            } = await supabase
              .from("companies")
              .select("id, company_name")
              .in("id", companyIds);

            if (companyError) throw companyError;

            companies = companyData || [];
          }

          return {
            applications: applicationData,
            jobs: jobs,
            companies: companies
          };
        }
      );

      const applications = result.applications || [];
      const jobs = result.jobs || [];
      const companies = result.companies || [];

      // Update total applications.

      if (totalApplicationsElement) {
        totalApplicationsElement.textContent =
          String(applications.length);
      }

      if (applications.length === 0) {
        showEmptyState();
        console.log(
          "Jobseeker Applications Loaded From Central Sync: 0"
        );
        return;
      }

      const jobMap = new Map(
        jobs.map(job => [job.id, job])
      );

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

        if (jobType.textContent) {
          card.appendChild(jobType);
        }

        if (category.textContent) {
          card.appendChild(category);
        }

        if (location.textContent) {
          card.appendChild(location);
        }

        card.appendChild(appliedDate);

        applicationList.appendChild(card);
      }

      console.log(
        "Jobseeker Applications Loaded From Central Sync:",
        applications.length
      );

    } catch (error) {

      console.error(
        "Load Jobseeker Applications Error:",
        error
      );

      applicationList.textContent =
        "Unable to load your applications. Please try again.";

    } finally {

      isLoading = false;

      // Do not lose a refresh requested during loading.

      if (refreshRequested) {
        refreshRequested = false;
        loadJobseekerApplications();
      }
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
  // INITIALIZE SESSION FROM CENTRAL SYNC
  // =========================================

  try {

    const identity = await sync.getSession();

    if (!identity || !identity.user) {
      throw new Error("Please sign in again.");
    }

    currentUser = identity.user;

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

          // Invalidate cached application and related data.

          sync.invalidate("jobseeker-applications");

          loadJobseekerApplications();
        }
      )
      .subscribe(function (status) {

        if (
          status === "CHANNEL_ERROR" ||
          status === "TIMED_OUT"
        ) {
          console.warn(
            "My Applications Realtime is unavailable:",
            status
          );
        }
      });

    console.log(
      "Jobseeker My Applications Central Sync Active."
    );

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

const categoryTypeSelect = document.getElementById(
  "dashboardJobCategoryType"
);

  const searchButton = document.getElementById(
    "dashboardJobSearchBtn"
  );

  if (
    !dashboard ||
    !resultsContainer ||
    !keywordInput ||
    !locationInput ||
   !categoryTypeSelect ||
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

  const categoryTypeDropdown = document.getElementById(
    "dashboardJobCategoryTypeDropdown"
  );

  const categoryTypeToggle = document.getElementById(
    "dashboardJobCategoryTypeToggle"
  );

  const categoryTypeLabel = document.getElementById(
    "dashboardJobCategoryTypeLabel"
  );

  const categoryTypeOptions = document.getElementById(
    "dashboardJobCategoryTypeOptions"
  );

  if (
    !categoryTypeDropdown ||
    !categoryTypeToggle ||
    !categoryTypeLabel ||
    !categoryTypeOptions ||
    !categoryTypeSelect
  ) return;

  categoryTypeSelect.replaceChildren();
  categoryTypeOptions.replaceChildren();

  const jobCategories = [
    "Accounting & Finance",
    "Administration & Office Support",
    "Architecture & Interior Design",
    "Banking & Financial Services",
    "Beauty, Wellness & Personal Care",
    "Construction & Building",
    "Customer Service",
    "Design & Creative",
    "Education & Training",
    "Engineering",
    "Food & Beverage",
    "Government & Public Services",
    "Healthcare & Medical",
    "Hospitality & Tourism",
    "Human Resources",
    "Information Technology",
    "Insurance",
    "Legal",
    "Logistics, Transport & Supply Chain",
    "Manufacturing & Production",
    "Marketing & Communications",
    "Media & Entertainment",
    "Oil, Gas & Energy",
    "Property & Real Estate",
    "Retail & Merchandising",
    "Sales & Business Development",
    "Science & Research",
    "Security & Safety",
    "Telecommunications",
    "Agriculture & Plantation",
    "Automotive",
    "Aviation",
    "Environmental & Sustainability",
    "NGO & Social Services",
    "Others"
  ];

  const jobTypes = [
    "Full-time",
    "Part-time",
    "Contract",
    "Temporary",
    "Internship",
    "Freelance",
    "Casual",
    "Apprenticeship",
    "Graduate Programme"
  ];

  function createFilterGroup(groupTitle, items, prefix) {

    const heading = document.createElement("div");
    heading.className = "multi-select-group-title";
    heading.textContent = groupTitle;

    categoryTypeOptions.appendChild(heading);

    items.forEach((item, index) => {

      const value = prefix + ":" + item;

      const option = document.createElement("option");
      option.value = value;
      option.textContent = item;

      categoryTypeSelect.appendChild(option);

      const label = document.createElement("label");
      label.className = "multi-select-option";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.value = value;
      checkbox.id = "job-filter-" + prefix + "-" + index;

      const text = document.createElement("span");
      text.textContent = item;

      label.htmlFor = checkbox.id;
      label.append(checkbox, text);

      checkbox.addEventListener("change", function () {

        option.selected = checkbox.checked;

        const selectedFilters = Array.from(
          categoryTypeSelect.selectedOptions
        );

        if (selectedFilters.length === 0) {
          categoryTypeLabel.textContent =
            "All Categories & Job Types";
        } else if (selectedFilters.length === 1) {
          categoryTypeLabel.textContent =
            selectedFilters[0].textContent;
        } else {
          categoryTypeLabel.textContent =
            selectedFilters.length + " filters selected";
        }

        searchJobs();

      });

      categoryTypeOptions.appendChild(label);

    });

  }

  createFilterGroup("Categories", jobCategories, "category");
  createFilterGroup("Job Types", jobTypes, "type");

  categoryTypeLabel.textContent =
    "All Categories & Job Types";

  // Open and close dropdown.
  if (categoryTypeDropdown.dataset.initialized !== "true") {

    categoryTypeToggle.addEventListener("click", function () {

      const isExpanded =
        categoryTypeToggle.getAttribute("aria-expanded") === "true";

      categoryTypeToggle.setAttribute(
        "aria-expanded",
        String(!isExpanded)
      );

      categoryTypeOptions.hidden = isExpanded;

    });

    // Close dropdown when clicking outside.
    document.addEventListener("click", function (event) {

      if (!categoryTypeDropdown.contains(event.target)) {

        categoryTypeOptions.hidden = true;

        categoryTypeToggle.setAttribute(
          "aria-expanded",
          "false"
        );

      }

    });

    // Close dropdown with Escape.
    categoryTypeDropdown.addEventListener("keydown", function (event) {

      if (event.key === "Escape") {

        categoryTypeOptions.hidden = true;

        categoryTypeToggle.setAttribute(
          "aria-expanded",
          "false"
        );

        categoryTypeToggle.focus();

      }

    });

    categoryTypeDropdown.dataset.initialized = "true";

  }

}


  // =========================================
  // DISPLAY JOB CARDS
  // FIND JOBS - JOBSEEKER DASHBOARD
  // =========================================

  let selectedDashboardJob = null;
  let dashboardApplicationDocuments = [];

  // =========================================
  // CREATE DASHBOARD JOB MODALS
  // =========================================

  const dashboardJobDetailsModal = document.createElement("dialog");
  dashboardJobDetailsModal.id = "dashboardJobDetailsModal";
  dashboardJobDetailsModal.style.cssText =
    "width:min(700px,92%);max-height:85vh;overflow-y:auto;border:0;border-radius:12px;padding:24px;";

  const dashboardApplyDocumentsModal = document.createElement("dialog");
  dashboardApplyDocumentsModal.id = "dashboardApplyDocumentsModal";
  dashboardApplyDocumentsModal.style.cssText =
    "width:min(600px,92%);max-height:85vh;overflow-y:auto;border:0;border-radius:12px;padding:24px;";

  const dashboardModalStyle = document.createElement("style");

  dashboardModalStyle.textContent = `
    #dashboardJobDetailsModal::backdrop,
    #dashboardApplyDocumentsModal::backdrop {
      background: rgba(0,0,0,.6);
    }

    #dashboardJobDetailsModal h2,
    #dashboardApplyDocumentsModal h2 {
      margin-top: 0;
    }

    .dashboard-job-modal-section {
      margin: 18px 0;
    }

    .dashboard-job-modal-section h3 {
      margin-bottom: 8px;
    }

    .dashboard-job-modal-actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      margin-top: 22px;
    }

    .dashboard-job-modal-actions button {
      padding: 11px 18px;
      border: 0;
      border-radius: 6px;
      cursor: pointer;
    }

    .dashboard-job-primary-btn {
      background: #2563eb;
      color: white;
    }

    .dashboard-job-secondary-btn {
      background: #e5e7eb;
      color: #111827;
    }

    .dashboard-application-document {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 12px;
      border: 1px solid #e5e7eb;
      border-radius: 7px;
      margin-bottom: 9px;
    }

    .dashboard-application-document input {
      margin-top: 4px;
    }

    .dashboard-application-document label {
      cursor: pointer;
      flex: 1;
    }

    #dashboardApplyCoverLetter {
      width: 100%;
      min-height: 110px;
      box-sizing: border-box;
      padding: 10px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font: inherit;
    }

    #dashboardApplyDocumentStatus {
      margin-top: 12px;
      white-space: pre-wrap;
    }
  `;

  document.head.appendChild(dashboardModalStyle);

  document.body.append(
    dashboardJobDetailsModal,
    dashboardApplyDocumentsModal
  );

  // =========================================
  // HELPER: CREATE TEXT ELEMENT
  // =========================================

  function createDashboardText(tag, text, className) {

    const element = document.createElement(tag);

    element.textContent = text || "";

    if (className) {
      element.className = className;
    }

    return element;
  }

  // =========================================
  // CLOSE MODALS
  // =========================================

  function closeDashboardJobDetails() {

    if (dashboardJobDetailsModal.open) {
      dashboardJobDetailsModal.close();
    }

  }

  function closeDashboardApplyDocuments() {

    if (dashboardApplyDocumentsModal.open) {
      dashboardApplyDocumentsModal.close();
    }

  }

  // =========================================
  // SHOW JOB DETAILS
  // =========================================

  function openDashboardJobDetails(job) {

    selectedDashboardJob = job;

    dashboardJobDetailsModal.replaceChildren();

    const companyData = companyMap.get(job.company_id);

    const companyName = companyData
      ? companyData.company_name
      : "Company information unavailable";

    const heading = createDashboardText(
      "h2",
      job.title || "Untitled Job"
    );

    const company = createDashboardText(
      "p",
      companyName
    );

    const detailsSection = document.createElement("div");
    detailsSection.className = "dashboard-job-modal-section";

    const location = [
      job.city,
      job.state
    ].filter(Boolean).join(", ");

    const salary = formatJobSalary(job);

    const information = [
      ["Location", location || "Not specified"],
      ["Category", job.category || "Not specified"],
      ["Job Type", job.job_type || "Not specified"],
      ["Salary", salary],
      ["Experience", job.experience || "Not specified"],
      ["Education", job.education || "Not specified"],
      [
        "Application Deadline",
        job.application_deadline || "Not specified"
      ]
    ];

    information.forEach(([label, value]) => {

      const row = document.createElement("p");

      const strong = document.createElement("strong");
      strong.textContent = label + ": ";

      row.append(
        strong,
        document.createTextNode(value)
      );

      detailsSection.appendChild(row);

    });

    function addJobDescription(title, content) {

      const section = document.createElement("section");
      section.className = "dashboard-job-modal-section";

      section.appendChild(
        createDashboardText("h3", title)
      );

      section.appendChild(
        createDashboardText(
          "p",
          String(content || "").trim() || "Not provided."
        )
      );

      dashboardJobDetailsModal.appendChild(section);

    }

    dashboardJobDetailsModal.append(
      heading,
      company,
      detailsSection
    );

    addJobDescription(
      "Job Description",
      job.description
    );

    addJobDescription(
      "Requirements",
      job.requirements
    );

    const actions = document.createElement("div");
    actions.className = "dashboard-job-modal-actions";

    const applyButton = createDashboardText(
      "button",
      "Apply Now",
      "dashboard-job-primary-btn"
    );

    applyButton.type = "button";

    applyButton.addEventListener("click", function () {

      closeDashboardJobDetails();

      openDashboardApplyDocuments(job);

    });

    const closeButton = createDashboardText(
      "button",
      "Close",
      "dashboard-job-secondary-btn"
    );

    closeButton.type = "button";
    closeButton.addEventListener(
      "click",
      closeDashboardJobDetails
    );

    actions.append(applyButton, closeButton);

    dashboardJobDetailsModal.appendChild(actions);

    dashboardJobDetailsModal.showModal();

  }

        
// =========================================
// LOAD JOBSEEKER APPLICATION DOCUMENTS
// =========================================


async function loadDashboardApplicationDocuments() {

  const list = document.getElementById(
    "dashboardApplyDocumentList"
  );

  const status = document.getElementById(
    "dashboardApplyDocumentStatus"
  );

  list.replaceChildren();

  status.textContent = "Loading your documents...";

  dashboardApplicationDocuments = [];

  try {

    const sync = window.kerjivaMalaysiaSync;

    if (!sync || typeof sync.get !== "function") {
      throw new Error("Central Sync is unavailable.");
    }

    // Reuse the same document cache as My Documents.
   const documents = await sync.get(
  "jobseeker-documents",
  async function ({ supabase, userId }) {

    const { data: documents, error } = await supabase
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
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return documents || [];

  }
);

    dashboardApplicationDocuments = documents || [];

    if (!dashboardApplicationDocuments.length) {

      status.textContent =
        "You have no documents yet. Please upload your documents in My Documents first.";

      return;
    }

    const documentLabels = {
      cv: "CV / Resume",
      resume: "CV / Resume",
      certificate: "Certificate",
      education: "Education Certificate",
      education_certificate: "Education Certificate",
      experience: "Work Experience Letter",
      employment_certificate: "Work Experience Letter",
      mykad: "MyKad",
      identity_card: "MyKad",
      passport: "Passport",
      driving_license: "Driving Licence",
      driving_licence: "Driving Licence",
      other: "Other Documents"
    };

    dashboardApplicationDocuments.forEach(doc => {

      const wrapper = document.createElement("div");
      wrapper.className = "dashboard-application-document";

      const checkbox = document.createElement("input");

      checkbox.type = "checkbox";
      checkbox.name = "dashboardApplicationDocument";
      checkbox.value = doc.id;
      checkbox.id = "dashboard-document-" + doc.id;

      const label = document.createElement("label");
      label.htmlFor = checkbox.id;

      const type = documentLabels[doc.document_type] ||
        doc.document_type;

      label.textContent =
        type + " — " + doc.file_name;

      wrapper.append(checkbox, label);

      list.appendChild(wrapper);

    });

    status.textContent =
      "Select the documents you want to attach to your application.";

    console.log(
      "Dashboard Application Documents Loaded From Central Sync:",
      dashboardApplicationDocuments.length
    );

  } catch (error) {

    console.error(
      "Load Dashboard Application Documents Error:",
      error
    );

    status.textContent =
      error.message || "Unable to load your documents.";

  }

}

  // =========================================
  // OPEN APPLICATION DOCUMENT MODAL
  // =========================================

  async function openDashboardApplyDocuments(job) {

    selectedDashboardJob = job;

    dashboardApplyDocumentsModal.replaceChildren();

    const heading = createDashboardText(
      "h2",
      "Select Application Documents"
    );

    const jobTitle = createDashboardText(
      "p",
      "Applying for: " + (job.title || "Untitled Job")
    );

    const documentList = document.createElement("div");
    documentList.id = "dashboardApplyDocumentList";

    const coverLabel = createDashboardText(
      "h3",
      "Cover Letter (Optional)"
    );

    const coverLetter = document.createElement("textarea");
    coverLetter.id = "dashboardApplyCoverLetter";
    coverLetter.placeholder =
      "Write a cover letter to introduce yourself...";

    const status = document.createElement("p");
    status.id = "dashboardApplyDocumentStatus";
    status.setAttribute("role", "status");

    const actions = document.createElement("div");
    actions.className = "dashboard-job-modal-actions";

    const submitButton = createDashboardText(
      "button",
      "Submit Application",
      "dashboard-job-primary-btn"
    );

    submitButton.id = "submitDashboardApplicationBtn";
    submitButton.type = "button";

    const closeButton = createDashboardText(
      "button",
      "Close",
      "dashboard-job-secondary-btn"
    );

    closeButton.type = "button";

    closeButton.addEventListener(
      "click",
      closeDashboardApplyDocuments
    );

    submitButton.addEventListener("click", async function () {

      const selectedDocuments = Array.from(
        documentList.querySelectorAll(
          'input[name="dashboardApplicationDocument"]:checked'
        )
      ).map(input => input.value);

      if (!selectedDocuments.length) {

        status.textContent =
          "Please select at least one document.";

        status.style.color = "#dc2626";

        return;

      }

      if (!selectedDashboardJob) return;

      if (
        typeof window.submitMalaysiaJobApplication !== "function"
      ) {

        status.textContent =
          "Application system is unavailable. Please refresh the page.";

        status.style.color = "#dc2626";

        return;

      }

      try {

        const result =
          await window.submitMalaysiaJobApplication({
            jobId: selectedDashboardJob.id,
            documentIds: selectedDocuments,
            coverLetter: coverLetter.value.trim(),
            statusElement: status,
            submitButton: submitButton
          });

        if (result && result.success) {

          status.textContent =
            "Your application has been submitted successfully.";

          status.style.color = "#15803d";

          submitButton.disabled = true;
          closeButton.textContent = "Done";

          closeButton.onclick = function () {

            closeDashboardApplyDocuments();

          };

        }

      } catch (error) {

        console.error(
          "Dashboard Job Application Error:",
          error
        );

      }

    });

    actions.append(
      submitButton,
      closeButton
    );

    dashboardApplyDocumentsModal.append(
      heading,
      jobTitle,
      documentList,
      coverLabel,
      coverLetter,
      status,
      actions
    );

    dashboardApplyDocumentsModal.showModal();

    await loadDashboardApplicationDocuments();

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

    
const company = document.createElement("div");
company.className = "find-job-company";

const companyData = companyMap.get(job.company_id);

if (companyData && companyData.logo_url) {

  const companyLogo = document.createElement("img");

  companyLogo.src = companyData.logo_url;
  companyLogo.alt = companyData.company_name
    ? companyData.company_name + " Logo"
    : "Company Logo";

  companyLogo.style.width = "42px";
  companyLogo.style.height = "42px";
  companyLogo.style.objectFit = "contain";
  companyLogo.style.borderRadius = "8px";
  companyLogo.style.flexShrink = "0";

  companyLogo.addEventListener("error", function () {
    this.remove();
  });

  company.appendChild(companyLogo);

}

   const companyName = document.createElement("span");

    companyName.textContent = companyData
    ? companyData.company_name
    : "Company information unavailable";

     company.appendChild(companyName);

      company.style.display = "flex";
      company.style.alignItems = "center";
      company.style.gap = "10px";


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

      const viewDetailsButton = createDashboardText(
        "button",
        "View Details",
        "dashboard-job-primary-btn"
      );

      viewDetailsButton.type = "button";

      viewDetailsButton.addEventListener("click", function () {

        openDashboardJobDetails(job);

      });

      card.append(
        title,
        company,
        details,
        description,
        viewDetailsButton
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

  // Read all selected filters from the hidden multiple select.
  const selectedFilters = Array.from(
    categoryTypeSelect.selectedOptions
  ).map(option => option.value);

  const selectedCategories = selectedFilters
    .filter(value => value.startsWith("category:"))
    .map(value => value.substring(9).trim().toLowerCase());

  const selectedJobTypes = selectedFilters
    .filter(value => value.startsWith("type:"))
    .map(value => value.substring(5).trim().toLowerCase());

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

    const jobCategory = String(job.category || "")
      .trim()
      .toLowerCase();

    const jobType = String(job.job_type || "")
      .trim()
      .toLowerCase();

    // Multiple selected categories use OR logic.
    const matchesCategory =
      selectedCategories.length === 0 ||
      selectedCategories.includes(jobCategory);

    // Multiple selected job types use OR logic.
    const matchesJobType =
      selectedJobTypes.length === 0 ||
      selectedJobTypes.includes(jobType);

    // Category and Job Type groups use AND logic.
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

      const sync = window.kerjivaMalaysiaSync;

      if (!sync || typeof sync.get !== "function") {
        throw new Error("Central Sync is unavailable.");
      }

      const result = await sync.get(
        "published-jobs-with-companies",
        async function () {

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

          const publishedJobsData = jobs || [];

          const companyIds = [
            ...new Set(
              publishedJobsData
                .map(job => job.company_id)
                .filter(Boolean)
            )
          ];

          let companiesData = [];

          if (companyIds.length > 0) {

            const { data: companies, error: companyError } =
              await supabaseAuth
                .from("companies")
                .select("id, company_name, logo_url")
                .in("id", companyIds);

            if (companyError) throw companyError;

            companiesData = companies || [];

          }

          return {
            jobs: publishedJobsData,
            companies: companiesData
          };

        }
      );

      publishedJobs = result.jobs || [];

      companyMap = new Map(
        (result.companies || []).map(company => [
          company.id,
          company
        ])
      );

      populateJobFilters();

      if (publishedJobs.length === 0) {

        showJobEmptyState(
          "No Jobs Available",
          "Available job opportunities will appear here."
        );

        return;
      }

      searchJobs();

      console.log(
        "Jobseeker Find Jobs Loaded From Central Sync:",
        publishedJobs.length
      );

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

/* =========================================================
   KERJIVA MALAYSIA
   COMPANY DASHBOARD NAVIGATION
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

  const params = new URLSearchParams(window.location.search);

  // Jalankan hanya pada Company Dashboard.
  if (params.get("dashboard") !== "company") return;

  if (params.has("preview")) return;

  const dashboard = document.getElementById("companyDashboard");

  if (!dashboard) return;

  const menuLinks = dashboard.querySelectorAll(
    ".dashboard-nav a[href^='#']"
  );

  const contentSections = dashboard.querySelectorAll(
    ".dashboard-content-section"
  );

  if (!menuLinks.length || !contentSections.length) return;

  function showCompanySection(sectionId) {

    const targetSection = dashboard.querySelector(
      "#" + sectionId
    );

    if (!targetSection) return;

    // Tampilkan hanya section yang dipilih.
    contentSections.forEach(section => {
      section.hidden = section.id !== sectionId;
    });

    // Perbarui menu aktif.
    menuLinks.forEach(link => {
      link.classList.toggle(
        "active",
        link.getAttribute("href") === "#" + sectionId
      );
    });

  }

  // Navigasi menu Company.
  menuLinks.forEach(link => {

    link.addEventListener("click", function (event) {

      event.preventDefault();

      const sectionId = this.getAttribute("href").substring(1);

      showCompanySection(sectionId);

    });

  });

  // Buka Dashboard Overview saat pertama kali masuk.
  showCompanySection("companyOverview");

  console.log("Kerjiva Malaysia Company Navigation Ready.");

});

        
/* =========================================================
   KERJIVA MALAYSIA
   COMPANY PROFILE
   LOAD, EDIT, SAVE, CANCEL & COMPANY LOGO
   ========================================================= */

document.addEventListener("DOMContentLoaded", async function () {

  const params = new URLSearchParams(window.location.search);

  // Jalankan hanya pada Company Dashboard.
  if (params.get("dashboard") !== "company") return;

  if (params.has("preview")) return;

  const dashboard = document.getElementById("companyDashboard");

  if (!dashboard) return;

  const form = document.getElementById("companyProfileForm");

  const editBtn = document.getElementById("editCompanyProfileBtn");
  const saveBtn = document.getElementById("saveCompanyProfileBtn");
  const cancelBtn = document.getElementById("cancelCompanyProfileBtn");
  const statusEl = document.getElementById("companyProfileStatus");

  // COMPANY LOGO ELEMENTS
  const logoPreview = document.getElementById("companyLogoPreview");
  const logoPlaceholder = document.getElementById("companyLogoPlaceholder");
  const logoInput = document.getElementById("companyLogoInput");
  const logoUploadLabel = document.getElementById("companyLogoUploadLabel");
   
   // COMPANY SIDEBAR ELEMENTS
  const sidebarAvatar = document.getElementById("companyAvatar");
  const sidebarName = document.getElementById("companySidebarName");

  if (
    !form || !editBtn || !saveBtn || !cancelBtn || !statusEl ||
    !logoPreview || !logoPlaceholder || !logoInput || !logoUploadLabel
  ) {
    console.error("Company Profile: Required HTML elements not found.");
    return;
  }

  // =====================================================
  // PROFILE FIELDS
  // =====================================================

  const fields = {
    company_name: document.getElementById("companyName"),
    registration_number: document.getElementById("companyRegistrationNumber"),
    industry: document.getElementById("companyIndustry"),
    email: document.getElementById("companyEmail"),
    phone: document.getElementById("companyPhone"),
    website: document.getElementById("companyWebsite"),
    state: document.getElementById("companyState"),
    city: document.getElementById("companyCity"),
    address: document.getElementById("companyAddress"),
    description: document.getElementById("companyDescription")
  };

  if (Object.values(fields).some(field => !field)) {
    console.error("Company Profile: One or more fields are missing.");
    return;
  }

  const editableFields = Object.entries(fields)
    .filter(([key]) => key !== "email")
    .map(([, field]) => field);

  let originalProfile = null;
  let companyUserId = null;
  let originalLogoUrl = null;
  let selectedLogoFile = null;
  let previewObjectUrl = null;

  // =====================================================
  // SHOW COMPANY LOGO
  // =====================================================

  function showCompanyLogo(url) {

    if (previewObjectUrl) {
      URL.revokeObjectURL(previewObjectUrl);
      previewObjectUrl = null;
    }

    if (url) {
      logoPreview.src = url;
      logoPreview.hidden = false;
      logoPlaceholder.hidden = true;
    } else {
      logoPreview.removeAttribute("src");
      logoPreview.hidden = true;
      logoPlaceholder.hidden = false;
    }

  }
   
   // =====================================================
// UPDATE COMPANY SIDEBAR PROFILE
// =====================================================

function updateCompanySidebar(profile) {

  if (sidebarName) {
    sidebarName.textContent = profile.company_name || "Company Name";
  }

  if (sidebarAvatar) {

    sidebarAvatar.replaceChildren();

    if (profile.logo_url) {

      const logoImage = document.createElement("img");

      logoImage.src = profile.logo_url;
      logoImage.alt = "Company Logo";

      logoImage.style.width = "100%";
      logoImage.style.height = "100%";
      logoImage.style.objectFit = "cover";
      logoImage.style.borderRadius = "50%";

      sidebarAvatar.appendChild(logoImage);

    } else {

      const initial = (profile.company_name || "C")
        .trim()
        .charAt(0)
        .toUpperCase() || "C";

      sidebarAvatar.textContent = initial;

    }

  }

}

  // =====================================================
  // PROFILE MODE
  // =====================================================

  function setProfileMode(editing) {

    editableFields.forEach(field => {
      field.disabled = !editing;
    });

    // Company Email always read-only.
    fields.email.disabled = true;

    logoInput.disabled = !editing;
    logoUploadLabel.hidden = !editing;

    editBtn.hidden = editing;
    saveBtn.hidden = !editing;
    cancelBtn.hidden = !editing;

  }

  // =====================================================
  // SHOW STATUS
  // =====================================================

  function showStatus(message, isError = false) {

    statusEl.textContent = message;
    statusEl.style.color = isError ? "red" : "";

  }

  // =====================================================
  // FILL PROFILE FORM
  // =====================================================

  function fillProfile(profile) {

    fields.company_name.value = profile.company_name || "";
    fields.registration_number.value = profile.registration_number || "";
    fields.industry.value = profile.industry || "";
    fields.email.value = profile.email || "";
    fields.phone.value = profile.phone || "";
    fields.website.value = profile.website || "";
    fields.state.value = profile.state || "";
    fields.city.value = profile.city || "";
    fields.address.value = profile.address || "";
    fields.description.value = profile.description || "";

    showCompanyLogo(profile.logo_url || null);
     updateCompanySidebar(profile);

  }

  // =====================================================
  // SAVE ORIGINAL PROFILE VALUES
  // =====================================================

  function captureOriginalProfile(profile) {

    originalProfile = {};

    Object.entries(fields).forEach(([key, field]) => {
      originalProfile[key] = field.value;
    });

    originalLogoUrl = profile.logo_url || null;

  }

  // =====================================================
  // RESET LOGO SELECTION
  // =====================================================

  function resetLogoSelection() {

    selectedLogoFile = null;
    logoInput.value = "";

    showCompanyLogo(originalLogoUrl);

  }


  // =====================================================
  // LOAD COMPANY PROFILE
  // =====================================================

  async function loadCompanyProfile() {

    setProfileMode(false);

    showStatus("Loading company profile...");

    const sync = window.kerjivaMalaysiaSync;

    if (!sync) {
      throw new Error("Kerjiva Malaysia Sync is unavailable.");
    }

    // 1. Get logged-in user through central synchronizer
    const identity = await sync.getSession();

    if (!identity.user) {
      throw new Error("Please sign in again.");
    }

    companyUserId = identity.userId;

    // 2. Reuse cached company profile or fetch from Supabase
    const profile = await sync.get(
      "company-profile",
      async function ({ supabase, userId }) {

        const { data, error } = await supabase
          .from("companies")
          .select(`
            id,
            company_name,
            registration_number,
            industry,
            email,
            phone,
            website,
            state,
            city,
            address,
            description,
            logo_url
          `)
          .eq("user_id", userId)
          .maybeSingle();

        if (error) throw error;

        return data;

      }
    );

    if (!profile) {
      throw new Error("Company profile not found.");
    }

    // 3. Update company profile interface
    fillProfile(profile);

    captureOriginalProfile(profile);

    setProfileMode(false);

    showStatus("");

    console.log("Company Profile Loaded Successfully.");

  }

  // =====================================================
  // SELECT & PREVIEW COMPANY LOGO
  // =====================================================

  logoInput.addEventListener("change", function () {

    const file = this.files && this.files[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp"
    ];

    if (!allowedTypes.includes(file.type)) {

      showStatus(
        "Please select a JPG, PNG, or WebP image.",
        true
      );

      resetLogoSelection();
      return;

    }

    if (file.size > 2 * 1024 * 1024) {

      showStatus(
        "Company logo must not exceed 2 MB.",
        true
      );

      resetLogoSelection();
      return;

    }

    selectedLogoFile = file;

    if (previewObjectUrl) {
      URL.revokeObjectURL(previewObjectUrl);
    }

    previewObjectUrl = URL.createObjectURL(file);

    logoPreview.src = previewObjectUrl;
    logoPreview.hidden = false;
    logoPlaceholder.hidden = true;

    showStatus("");

  });

  // =====================================================
  // EDIT PROFILE
  // =====================================================

  editBtn.addEventListener("click", function () {

    setProfileMode(true);

    showStatus("");

  });

  // =====================================================
  // CANCEL EDIT
  // =====================================================

  cancelBtn.addEventListener("click", function () {

    if (originalProfile) {

      Object.entries(fields).forEach(([key, field]) => {
        field.value = originalProfile[key] || "";
      });

    }

    resetLogoSelection();

    setProfileMode(false);

    showStatus("");

  });

  // =====================================================
  // GET OLD LOGO STORAGE PATH
  // =====================================================

  function getOldLogoStoragePath(url) {

    if (!url) return null;

    const marker = "/storage/v1/object/public/company-logos/";

    const markerIndex = url.indexOf(marker);

    if (markerIndex === -1) return null;

    try {

      const path = decodeURIComponent(
        url.substring(markerIndex + marker.length).split("?")[0]
      );

      if (!path.startsWith(companyUserId + "/")) {
        return null;
      }

      return path;

    } catch (error) {

      console.warn("Unable to read old company logo path:", error);

      return null;

    }

  }

  // =====================================================
  // SAVE PROFILE
  // =====================================================

  form.addEventListener("submit", async function (event) {

    event.preventDefault();

    if (!companyUserId || !originalProfile) {
      showStatus("Company profile is not ready.", true);
      return;
    }

    const updatedProfile = {
      company_name: fields.company_name.value.trim(),
      registration_number: fields.registration_number.value.trim(),
      industry: fields.industry.value.trim(),
      phone: fields.phone.value.trim(),
      website: fields.website.value.trim() || null,
      state: fields.state.value,
      city: fields.city.value.trim(),
      address: fields.address.value.trim(),
      description: fields.description.value.trim(),
      updated_at: new Date().toISOString()
    };

    if (!updatedProfile.company_name) {
      showStatus("Company Name is required.", true);
      fields.company_name.focus();
      return;
    }

    saveBtn.disabled = true;
    cancelBtn.disabled = true;
    editBtn.disabled = true;

    logoInput.disabled = true;

    showStatus("Saving company profile...");

   let uploadedLogoPath = null;
   let profileUpdated = false;

       try {

      // -----------------------------------------------
      // UPLOAD NEW COMPANY LOGO IF SELECTED
      // -----------------------------------------------

      if (selectedLogoFile) {

        showStatus("Uploading company logo...");

        const fileExtension = selectedLogoFile.name
          .split(".")
          .pop()
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "");

        const uniqueFileName =
          Date.now() + "-" +
          Math.random().toString(36).substring(2, 10) +
          "." + fileExtension;

        uploadedLogoPath =
          companyUserId + "/" + uniqueFileName;

        const { error: uploadError } = await supabaseAuth
          .storage
          .from("company-logos")
          .upload(uploadedLogoPath, selectedLogoFile, {
            contentType: selectedLogoFile.type,
            upsert: false
          });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabaseAuth
          .storage
          .from("company-logos")
          .getPublicUrl(uploadedLogoPath);

        updatedProfile.logo_url = publicUrlData.publicUrl;

      }

      // -----------------------------------------------
      // UPDATE COMPANY PROFILE
      // -----------------------------------------------

      showStatus("Saving company profile...");

      const { data: savedProfile, error } = await supabaseAuth
        .from("companies")
        .update(updatedProfile)
        .eq("user_id", companyUserId)
        .select(`
          id,
          company_name,
          registration_number,
          industry,
          email,
          phone,
          website,
          state,
          city,
          address,
          description,
          logo_url
        `)
        .single();

  if (error) throw error;

profileUpdated = true;

// -----------------------------------------------
// UPDATE CENTRAL COMPANY PROFILE CACHE
// -----------------------------------------------

try {

  await window.kerjivaMalaysiaSync.set(
    "company-profile",
    savedProfile
  );

  console.log("Company Profile Cache Updated.");

} catch (syncError) {

  console.warn(
    "Company Profile Cache Update Warning:",
    syncError
  );

}

      // -----------------------------------------------
      // DELETE OLD LOGO AFTER DATABASE UPDATE SUCCEEDS
      // -----------------------------------------------

      if (selectedLogoFile && originalLogoUrl) {

        const oldLogoPath = getOldLogoStoragePath(originalLogoUrl);

        if (oldLogoPath && oldLogoPath !== uploadedLogoPath) {

          const { error: deleteError } = await supabaseAuth
            .storage
            .from("company-logos")
            .remove([oldLogoPath]);

          if (deleteError) {
            console.warn(
              "Old company logo could not be deleted:",
              deleteError
            );
          }

        }

      }

      // -----------------------------------------------
      // UPDATE FORM & ORIGINAL VALUES
      // -----------------------------------------------

      selectedLogoFile = null;
      logoInput.value = "";

      fillProfile(savedProfile);

      captureOriginalProfile(savedProfile);

      setProfileMode(false);

      showStatus("Company profile updated successfully.");

      console.log("Company Profile Saved Successfully.");

    } catch (error) {

      console.error("Save Company Profile Error:", error);

      // Hapus file baru jika penyimpanan database gagal.
         if (uploadedLogoPath && !profileUpdated) {

        const { error: cleanupError } = await supabaseAuth
          .storage
          .from("company-logos")
          .remove([uploadedLogoPath]);

        if (cleanupError) {
          console.warn(
            "Unable to clean up newly uploaded logo:",
            cleanupError
          );
        }

      }

      showStatus(
        error.message || "Unable to save company profile.",
        true
      );

    } finally {

      saveBtn.disabled = false;
      cancelBtn.disabled = false;
      editBtn.disabled = false;

      logoInput.disabled = false;

      // Pastikan input logo tetap terkunci di mode tampilan.
      if (!cancelBtn.hidden) {
        logoInput.disabled = false;
      } else {
        logoInput.disabled = true;
      }

    }

  });

  // =====================================================
  // INITIALIZE COMPANY PROFILE
  // =====================================================

  try {

    await loadCompanyProfile();

  } catch (error) {

    console.error("Load Company Profile Error:", error);

    showStatus(
      error.message || "Unable to load company profile.",
      true
    );

  }

});


/* =========================================================
   KERJIVA MALAYSIA
   COMPANY POST A JOB
   CREATE, SAVE DRAFT, PUBLISH & EDIT JOB
   ========================================================= */

document.addEventListener("DOMContentLoaded", async function () {

  const params = new URLSearchParams(window.location.search);

  // Jalankan hanya pada Company Dashboard.
  if (params.get("dashboard") !== "company") return;

  if (params.has("preview")) return;

  const dashboard = document.getElementById("companyDashboard");

  if (!dashboard) return;

  // =====================================================
  // FORM ELEMENTS
  // =====================================================

  const form = document.getElementById("companyJobForm");

  const editingJobId = document.getElementById("companyEditingJobId");

  const titleInput = document.getElementById("companyJobTitle");
  const categoryInput = document.getElementById("companyJobCategory");
  const typeInput = document.getElementById("companyJobType");
  const stateInput = document.getElementById("companyJobState");
  const cityInput = document.getElementById("companyJobCity");

  const salaryMinInput = document.getElementById("companyJobSalaryMin");
  const salaryMaxInput = document.getElementById("companyJobSalaryMax");

  const educationInput = document.getElementById("companyJobEducation");
  const experienceInput = document.getElementById("companyJobExperience");

  const descriptionInput = document.getElementById("companyJobDescription");
  const requirementsInput = document.getElementById("companyJobRequirements");
  const deadlineInput = document.getElementById("companyJobDeadline");

  const saveDraftBtn = document.getElementById("saveCompanyJobDraftBtn");
  const submitJobBtn = document.getElementById("submitCompanyJobBtn");
  const statusEl = document.getElementById("companyJobStatus");

  if (
    !form ||
    !editingJobId ||
    !titleInput ||
    !categoryInput ||
    !typeInput ||
    !stateInput ||
    !cityInput ||
    !salaryMinInput ||
    !salaryMaxInput ||
    !educationInput ||
    !experienceInput ||
    !descriptionInput ||
    !requirementsInput ||
    !deadlineInput ||
    !saveDraftBtn ||
    !submitJobBtn ||
    !statusEl
  ) {
    console.error("Company Post a Job: Required HTML elements not found.");
    return;
  }


// =====================================================
// STATE
// =====================================================

let companyUserId = null;
let companyId = null;
let isSaving = false;

// Store original English content when editing a job.
let originalJobContent = null;
let originalJobTranslations = null;


  // =====================================================
  // STATUS MESSAGE
  // =====================================================

  function showJobStatus(message, isError = false) {

    statusEl.textContent = message;
    statusEl.style.color = isError ? "red" : "";

  }


  // =====================================================
  // LOAD COMPANY ID
  // =====================================================

  async function loadCompanyId() {

    const sync = window.kerjivaMalaysiaSync;

    if (!sync) {
      throw new Error("Kerjiva Malaysia Sync is unavailable.");
    }

    // 1. Get logged-in user through central synchronizer
    const identity = await sync.getSession();

    if (!identity.user) {
      throw new Error("Please sign in again.");
    }

    companyUserId = identity.userId;

    // 2. Reuse cached company profile
    const company = await sync.get(
      "company-profile",
      async function ({ supabase, userId }) {

        const { data, error } = await supabase
          .from("companies")
          .select("id")
          .eq("user_id", userId)
          .maybeSingle();

        if (error) throw error;

        return data;

      }
    );

    if (!company) {
      throw new Error("Company profile not found.");
    }

    companyId = company.id;

    console.log(
      "Company Post a Job: Company ID Loaded From Central Sync."
    );

  }

  // =====================================================
  // RESET FORM
  // =====================================================

 function resetJobForm() {
  form.reset();
  editingJobId.value = "";
  originalJobContent = null;
    originalJobTranslations = null;
  showJobStatus("");
}

  // =====================================================
  // GET FORM DATA
  // =====================================================

  function getJobFormData(status) {

    const salaryMinValue = salaryMinInput.value.trim();
    const salaryMaxValue = salaryMaxInput.value.trim();

    const salaryMin = salaryMinValue === ""
      ? null
      : Number(salaryMinValue);

    const salaryMax = salaryMaxValue === ""
      ? null
      : Number(salaryMaxValue);

    if (
      salaryMin !== null &&
      salaryMax !== null &&
      salaryMin > salaryMax
    ) {
      throw new Error(
        "Minimum Salary cannot be greater than Maximum Salary."
      );
    }

    return {

      company_id: companyId,

      title: titleInput.value.trim(),

      category: categoryInput.value,

      job_type: typeInput.value,

      state: stateInput.value,

      city: cityInput.value.trim(),

      salary_min: salaryMin,

      salary_max: salaryMax,

      salary_currency: "MYR",

      education: educationInput.value.trim() || null,

      experience: experienceInput.value.trim() || null,

      description: descriptionInput.value.trim(),

      requirements: requirementsInput.value.trim() || null,

      application_deadline: deadlineInput.value || null,

      status: status,

      updated_at: new Date().toISOString()

    };

  }
   
   // ========================================
// CHECK JOB CONTENT AND EXISTING TRANSLATION
// ========================================

function getTranslationSource(job) {
  return {
    title: job.title ?? "",
    description: job.description ?? "",
    requirements: job.requirements ?? "",
    job_type: job.job_type ?? "",
    category: job.category ?? "",
    experience: job.experience ?? "",
    education: job.education ?? ""
  };
}

function hasJobContentChanged(jobData) {
  if (!originalJobContent) return true;

  return JSON.stringify(getTranslationSource(jobData)) !==
    JSON.stringify(originalJobContent);
}

function hasReusableTranslation(jobData) {
  if (!originalJobTranslations) return false;

  const source = getTranslationSource(jobData);

  const fields = [
    ["title", "title_ms"],
    ["description", "description_ms"],
    ["requirements", "requirements_ms"],
    ["job_type", "job_type_ms"],
    ["category", "category_ms"],
    ["experience", "experience_ms"],
    ["education", "education_ms"]
  ];

  return fields.every(([sourceField, translationField]) => {
    const originalText = source[sourceField].trim();
    const translatedText = originalJobTranslations[translationField];

    if (!originalText) {
      return translatedText === null || translatedText === "";
    }

    return typeof translatedText === "string" &&
      translatedText.trim() !== "";
  });
}

  // =====================================================
  // SAVE JOB
  // =====================================================

 
async function saveCompanyJob(status) {

  if (isSaving) return;

  if (!companyId) {
    showJobStatus("Company profile is not ready.", true);
    return;
  }

  if (!form.reportValidity()) return;

  let jobData;

  try {
    jobData = getJobFormData(status);
  } catch (error) {
    showJobStatus(error.message, true);
    return;
  }

  const jobId = editingJobId.value.trim();

  const contentChanged = hasJobContentChanged(jobData);
  const reusableTranslation = hasReusableTranslation(jobData);

  const shouldTranslate =
    status === "published" &&
    (!jobId || contentChanged || !reusableTranslation);

  isSaving = true;

  saveDraftBtn.disabled = true;
  submitJobBtn.disabled = true;

  showJobStatus(
    status === "draft"
      ? "Saving job draft..."
      : shouldTranslate
        ? "Translating and publishing job..."
        : "Publishing job..."
  );

  try {

    // ===============================================
    // SAVE DRAFT WITHOUT TRANSLATION
    // ===============================================

    if (status === "draft") {

      if (jobId && contentChanged) {
        jobData.title_ms = null;
        jobData.description_ms = null;
        jobData.requirements_ms = null;
        jobData.job_type_ms = null;
        jobData.category_ms = null;
        jobData.experience_ms = null;
        jobData.education_ms = null;
      }

    }

    // ===============================================
    // TRANSLATE ONLY WHEN NECESSARY
    // ===============================================

    if (shouldTranslate) {

      const { data: translationData, error: translationError } =
        await supabaseAuth.functions.invoke(
          "translate-job-ms",
          {
            body: {
              job: {
                title: jobData.title,
                description: jobData.description,
                requirements: jobData.requirements,
                job_type: jobData.job_type,
                category: jobData.category,
                experience: jobData.experience,
                education: jobData.education
              }
            }
          }
        );

      if (translationError) {
        throw new Error(
          translationError.message ||
          "Unable to translate job into Bahasa Melayu."
        );
      }

      if (
        !translationData ||
        translationData.success !== true ||
        !translationData.job
      ) {
        throw new Error(
          translationData?.error ||
          "Gemini translation returned an invalid result."
        );
      }

      const translatedJob = translationData.job;

      const translationFields = [
        "title",
        "description",
        "requirements",
        "job_type",
        "category",
        "experience",
        "education"
      ];

      for (const field of translationFields) {

        const value = translatedJob[field];

        if (
          !Object.prototype.hasOwnProperty.call(translatedJob, field) ||
          (value !== null && typeof value !== "string")
        ) {
          throw new Error(
            `Invalid Malay translation field: ${field}`
          );
        }
      }

      // Store Malay translations in Supabase.
      jobData.title_ms = translatedJob.title;
      jobData.description_ms = translatedJob.description;
      jobData.requirements_ms = translatedJob.requirements;
      jobData.job_type_ms = translatedJob.job_type;
      jobData.category_ms = translatedJob.category;
      jobData.experience_ms = translatedJob.experience;
      jobData.education_ms = translatedJob.education;

      showJobStatus("Translation completed. Publishing job...");

    }

     
    // ===============================================
    // SAVE JOB TO SUPABASE
    // ===============================================

    // Record the first publication date only.
    if (status === "published") {

      const publicationTime = new Date().toISOString();

      if (jobId) {

        // Check the existing publication date.
        const { data: existingJob, error: existingJobError } =
          await supabaseAuth
            .from("jobs")
            .select("published_at")
            .eq("id", jobId)
            .eq("company_id", companyId)
            .maybeSingle();

        if (existingJobError) throw existingJobError;

        if (!existingJob) {
          throw new Error("Job posting not found.");
        }

        // Preserve the original publication date.
        if (!existingJob.published_at) {
          jobData.published_at = publicationTime;
        }

      } else {

        // First publication of a new job.
        jobData.published_at = publicationTime;

      }
    }

    let result;

    if (jobId) {

      const { data, error } = await supabaseAuth
        .from("jobs")
        .update(jobData)
        .eq("id", jobId)
        .eq("company_id", companyId)
        .select()
        .single();

      if (error) throw error;

      result = data;

    } else {

      const { data, error } = await supabaseAuth
        .from("jobs")
        .insert(jobData)
        .select()
        .single();

      if (error) throw error;

      result = data;
    }
     
    // ===============================================
    // UPDATE CENTRAL COMPANY JOBS CACHE
    // ===============================================

    try {

      const sync = window.kerjivaMalaysiaSync;

      if (sync) {

        sync.invalidate("company-jobs");

        console.log(
          "Company Jobs Cache Invalidated After Save."
        );

      }

    } catch (syncError) {

      console.warn(
        "Company Jobs Cache Update Warning:",
        syncError
      );

    }



  const successMessage =
  status === "draft"
    ? "Job draft saved successfully."
    : "Job published successfully.";

resetJobForm();

showJobStatus(successMessage);

showKerjivaNotification(successMessage, "success");

    console.log(
      "Company Job Saved Successfully:",
      result.id
    );

  } catch (error) {

    console.error("Save Company Job Error:", error);

    showJobStatus(
      error.message || "Unable to save job.",
      true
    );

  } finally {

    isSaving = false;

    saveDraftBtn.disabled = false;
    submitJobBtn.disabled = false;

  }

}




  // =====================================================
  // SAVE AS DRAFT
  // =====================================================

  saveDraftBtn.addEventListener("click", function () {

    saveCompanyJob("draft");

  });

  // =====================================================
  // SEND / PUBLISH JOB
  // =====================================================

  submitJobBtn.addEventListener("click", function () {

    saveCompanyJob("published");

  });

  // =====================================================
  // PREPARE JOB FORM FOR EDITING
  // =====================================================

  window.openCompanyJobForEdit = async function (jobId) {

    if (!companyId) {
      showJobStatus("Company profile is not ready.", true);
      return;
    }

    if (!jobId) {
      showJobStatus("Invalid job ID.", true);
      return;
    }

    showJobStatus("Loading job details...");

    try {

      const { data: job, error } = await supabaseAuth
        .from("jobs")
        .select("*")
        .eq("id", jobId)
        .eq("company_id", companyId)
        .single();

      if (error) throw error;

      // Isi form dengan data lowongan.
      editingJobId.value = job.id;
       originalJobContent = {
  title: job.title ?? "",
  description: job.description ?? "",
  requirements: job.requirements ?? "",
  job_type: job.job_type ?? "",
  category: job.category ?? "",
  experience: job.experience ?? "",
  education: job.education ?? ""
};
       originalJobTranslations = {
  title_ms: job.title_ms,
  description_ms: job.description_ms,
  requirements_ms: job.requirements_ms,
  job_type_ms: job.job_type_ms,
  category_ms: job.category_ms,
  experience_ms: job.experience_ms,
  education_ms: job.education_ms
};

      titleInput.value = job.title || "";
      categoryInput.value = job.category || "";
      typeInput.value = job.job_type || "";

      stateInput.value = job.state || "";
      cityInput.value = job.city || "";

      salaryMinInput.value = job.salary_min ?? "";
      salaryMaxInput.value = job.salary_max ?? "";

      educationInput.value = job.education || "";
      experienceInput.value = job.experience || "";

      descriptionInput.value = job.description || "";
      requirementsInput.value = job.requirements || "";

      deadlineInput.value = job.application_deadline || "";

      // Buka section Post a Job melalui navigasi yang tersedia.
      const postJobLink = dashboard.querySelector(
        ".dashboard-nav a[href='#companyPostJob']"
      );

      if (postJobLink) {
        postJobLink.click();
      } else {
        document.getElementById("companyPostJob").hidden = false;
      }

      showJobStatus("Editing existing job.");

      console.log("Company Job Loaded For Editing:", job.id);

    } catch (error) {

      console.error("Load Company Job For Editing Error:", error);

      showJobStatus(
        error.message || "Unable to load job details.",
        true
      );

    }

  };

  // =====================================================
  // INITIALIZE COMPANY POST A JOB
  // =====================================================

  try {

    await loadCompanyId();

    console.log("Company Post a Job Ready.");

  } catch (error) {

    console.error("Company Post a Job Initialization Error:", error);

    showJobStatus(
      error.message || "Unable to initialize Post a Job.",
      true
    );

  }

});



/* =====================================================
   KERJIVA MALAYSIA
   HOMEPAGE LATEST JOBS
   VIEW JOB DETAILS
   ===================================================== */

document.addEventListener("DOMContentLoaded", async function () {
  const jobsGrid = document.getElementById("jobsGrid");
  const keywordInput = document.getElementById("keyword");
  const locationSelect = document.getElementById("location");
  const categorySelect = document.getElementById("jobCategory");
  const jobTypeSelect = document.getElementById("jobType");
  const searchButton = document.getElementById("searchJobsBtn");

  if (!jobsGrid) return;

  const supabase = window.supabaseAuth;

  if (!supabase) {
    console.error("Homepage Latest Jobs: Supabase client not found.");
    return;
  }

  const detailsModal = document.getElementById("homepageJobDetailsModal");
  const detailsContent = document.getElementById("homepageJobDetailsContent");
  const closeDetailsButton = document.getElementById("closeHomepageJobDetails");
  const applyNowButton = document.getElementById("homepageApplyNowBtn");

  let homepageJobs = [];
  let selectedHomepageJob = null;

  function getMalaysiaDate() {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kuala_Lumpur",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).formatToParts(new Date());

    const values = {};
    parts.forEach(part => {
      values[part.type] = part.value;
    });

    return `${values.year}-${values.month}-${values.day}`;
  }

  function formatSalary(job) {
    const currency = job.salary_currency || "MYR";

    function formatAmount(amount) {
      return new Intl.NumberFormat("en-MY", {
        style: "currency",
        currency: currency,
        maximumFractionDigits: 0
      }).format(amount);
    }

    const min = job.salary_min;
    const max = job.salary_max;

    if (min != null && max != null) {
      return `${formatAmount(min)} - ${formatAmount(max)}`;
    }

    if (min != null) return `From ${formatAmount(min)}`;
    if (max != null) return `Up to ${formatAmount(max)}`;

    return "Salary not specified";
  }

  function createTextElement(tag, className, value) {
    const element = document.createElement(tag);
    element.className = className;
    element.textContent = value || "";
    return element;
  }

  function addDetail(content, heading, value) {
    const wrapper = document.createElement("div");

    const label = createTextElement("h3", "", heading);
    const text = createTextElement(
      "p",
      "",
      value || "Not specified"
    );

    wrapper.append(label, text);
    content.appendChild(wrapper);
  }


function openJobDetails(job) {
  if (!detailsModal || !detailsContent) {
    console.error("Homepage job details modal not found.");
    return;
  }

  selectedHomepageJob = job;
  detailsContent.replaceChildren();

  const isMalay = window.currentKerjivaLanguage === "ms";

  const title = createTextElement(
    "h2",
    "",
    (isMalay && job.title_ms) || job.title
  );

  const company = createTextElement(
    "p",
    "",
    job.company_name || "Company"
  );

  const category = createTextElement(
    "p",
    "",
    `Category: ${(isMalay && job.category_ms) || job.category || "Other"}`
  );

  const location = [job.city, job.state]
    .filter(Boolean)
    .join(", ");

  const jobLocation = createTextElement(
    "p",
    "",
    `Location: ${location || "Not specified"}`
  );

  const jobType = createTextElement(
    "p",
    "",
    `Job Type: ${(isMalay && job.job_type_ms) || job.job_type || "Not specified"}`
  );

  const salary = createTextElement(
    "p",
    "",
    `Salary: ${formatSalary(job)}`
  );

  detailsContent.append(
    title,
    company,
    category,
    jobLocation,
    jobType,
    salary
  );

  addDetail(
    detailsContent,
    "Education",
    (isMalay && job.education_ms) || job.education
  );

  addDetail(
    detailsContent,
    "Experience",
    (isMalay && job.experience_ms) || job.experience
  );

  addDetail(
    detailsContent,
    "Job Description",
    (isMalay && job.description_ms) || job.description
  );

  addDetail(
    detailsContent,
    "Requirements",
    (isMalay && job.requirements_ms) || job.requirements
  );

  addDetail(
    detailsContent,
    "Application Deadline",
    job.application_deadline || "Not specified"
  );

  if (applyNowButton) {
    applyNowButton.disabled = false;
    applyNowButton.textContent = "Apply Now";
  }

  const applyStatus = document.getElementById("homepageApplyStatus");

  if (applyStatus) {
    applyStatus.textContent = "";
    applyStatus.hidden = true;
  }

  detailsModal.hidden = false;
  document.body.style.overflow = "hidden";
}


  function closeJobDetails() {
    if (detailsModal) detailsModal.hidden = true;

    document.body.style.overflow = "";
    selectedHomepageJob = null;
  }

  if (closeDetailsButton) {
    closeDetailsButton.addEventListener("click", closeJobDetails);
  }

  if (detailsModal) {
    detailsModal.addEventListener("click", function (event) {
      if (event.target === detailsModal) {
        closeJobDetails();
      }
    });
  }

  document.addEventListener("keydown", function (event) {
    if (
      event.key === "Escape" &&
      detailsModal &&
      !detailsModal.hidden
    ) {
      closeJobDetails();
    }
  });
   
// HOMEPAGE APPLY NOW - LOGIN CHECK + DOCUMENT SELECTION
if (applyNowButton) {
  applyNowButton.addEventListener("click", async function () {
    if (!selectedHomepageJob) return;
     const sync = window.kerjivaMalaysiaSync;

if (!sync) {
  console.error("Kerjiva Malaysia Central Sync is unavailable.");
  return;
}

    const applyStatus = document.getElementById("homepageApplyStatus");

    const documentsModal = document.getElementById(
      "homepageApplyDocumentsModal"
    );
     const jobDetailsModal = document.getElementById(
     "homepageJobDetailsModal"
   );
    const documentList = document.getElementById(
      "homepageApplyDocumentList"
    );
    const documentStatus = document.getElementById(
      "homepageApplyDocumentStatus"
    );
    const coverLetterInput = document.getElementById(
      "homepageApplyCoverLetter"
    );
    const submitButton = document.getElementById(
      "submitHomepageApplicationBtn"
    );
    const closeDocumentsButton = document.getElementById(
      "closeHomepageApplyDocuments"
    );

    applyNowButton.disabled = true;
    applyNowButton.textContent = "Please wait...";

    if (applyStatus) {
      applyStatus.textContent = "";
      applyStatus.hidden = true;
    }

    try {
       
    
      // 1. CHECK LOGIN SESSION THROUGH CENTRAL SYNC
      const identity = await sync.getSession();
      const sessionUser = identity?.user;

      // NOT LOGGED IN
      if (!sessionUser) {
        if (applyStatus) {
          applyStatus.textContent =
            "Please log in to your Jobseeker account to apply for this job.";
          applyStatus.hidden = false;
        }

        applyNowButton.textContent = "Redirecting...";

        const jobId = selectedHomepageJob.id;

        setTimeout(function () {
          window.location.href =
            "login.html?applyJob=" + encodeURIComponent(jobId);
        }, 800);

        return;
      }

      const userId = sessionUser.id;

      // 2. CHECK JOBSEEKER PROFILE THROUGH CENTRAL SYNC
      const jobseeker = await sync.get(
        "jobseeker-profile",
        async function ({ supabase, userId }) {

          const { data, error } = await supabase
            .from("jobseeker_profiles")
            .select("*")
            .eq("user_id", userId)
            .maybeSingle();

          if (error) throw error;

          return data;

        }
      );

      // 3. CHECK COMPANY PROFILE THROUGH CENTRAL SYNC
      const company = await sync.get(
        "company-profile",
        async function ({ supabase, userId }) {

          const { data, error } = await supabase
            .from("companies")
            .select("*")
            .eq("user_id", userId)
            .maybeSingle();

          if (error) throw error;

          return data;

        }
      );

      // 3. CHECK COMPANY PROFILE
      const { data: company, error: companyError } =
        await window.supabaseAuth
          .from("companies")
          .select("id")
          .eq("user_id", userId)
          .maybeSingle();

      if (companyError) throw companyError;

      // COMPANY ACCOUNT
      if (company && !jobseeker) {
        throw new Error("JOBSEEKER_ACCOUNT_REQUIRED");
      }

      // NO JOBSEEKER PROFILE
      if (!jobseeker) {
        throw new Error("JOBSEEKER_PROFILE_REQUIRED");
      }

      // 4. LOAD JOBSEEKER DOCUMENTS
      if (!documentsModal || !documentList || !submitButton) {
        throw new Error("APPLICATION_MODAL_NOT_FOUND");
      }

      documentList.innerHTML =
        '<p class="document-loading">Loading your documents...</p>';

      if (documentStatus) {
        documentStatus.textContent = "";
        documentStatus.hidden = true;
      }

      if (coverLetterInput) {
        coverLetterInput.value = "";
      }

      submitButton.disabled = true;

     const documents = await sync.get(
     "jobseeker-documents",
     async ({ supabase, userId }) => {
     const { data, error } = await supabase
      .from("jobseeker_documents")
      .select("id, document_type, file_name, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }
);

      documentList.innerHTML = "";

      if (!documents || documents.length === 0) {
        documentList.innerHTML = `
          <p class="empty-documents">
            You have no documents yet. Please upload your documents
            in My Documents before applying.
          </p>
        `;
      } else {
        const documentTypeLabels = {
          cv: "CV / Resume",
          certificate: "Certificate",
          education_certificate: "Education Certificate",
          employment_certificate: "Employment Certificate",
          identity_card: "Identity Card",
          driving_licence: "Driving Licence",
          other: "Other Document"
        };

        documents.forEach(function (doc) {
          const label = document.createElement("label");
          label.className = "application-document-option";
           label.style.display = "flex";
         label.style.alignItems = "center";
         label.style.gap = "12px";
         label.style.padding = "12px";
        label.style.marginBottom = "10px";
        label.style.border = "1px solid #e2e8f0";
        label.style.borderRadius = "8px";
        label.style.cursor = "pointer";

          const checkbox = document.createElement("input");
          checkbox.type = "checkbox";
          checkbox.name = "homepageApplicationDocument";
          checkbox.value = doc.id;

          const details = document.createElement("span");
          details.className = "application-document-details";
           details.style.display = "flex";
           details.style.flexDirection = "column";
           details.style.gap = "4px";

          const fileName = document.createElement("strong");
          fileName.textContent = doc.file_name || "Unnamed document";

          const documentType = document.createElement("small");
          documentType.textContent =
            documentTypeLabels[doc.document_type] ||
            doc.document_type ||
            "Document";

          details.appendChild(fileName);
          details.appendChild(documentType);

          label.appendChild(checkbox);
          label.appendChild(details);

          documentList.appendChild(label);
        });
      }

      submitButton.disabled = !documents || documents.length === 0;

    // 5. OPEN DOCUMENT SELECTION MODAL
     if (jobDetailsModal) {
     jobDetailsModal.hidden = true;
     jobDetailsModal.style.display = "none";
     }

    documentsModal.hidden = false;
    documentsModal.style.display = "flex";

     // CLOSE DOCUMENT MODAL
     if (closeDocumentsButton) {
     closeDocumentsButton.onclick = function () {
     documentsModal.hidden = true;
     documentsModal.style.display = "none";

    // RESTORE JOB DETAILS MODAL
    if (jobDetailsModal) {
      jobDetailsModal.hidden = false;
      jobDetailsModal.style.display = "flex";
     }
   };
  }
    } catch (error) {
      console.error("Homepage Apply Now Error:", error);

      if (applyStatus) {
        const messages = {
          JOBSEEKER_ACCOUNT_REQUIRED:
            "Company accounts cannot apply for jobs. Please use a Jobseeker account.",
          JOBSEEKER_PROFILE_REQUIRED:
            "Please complete your Jobseeker profile before applying."
        };

        applyStatus.textContent =
          messages[error.message] ||
          error.message ||
          "Unable to continue. Please try again.";

        applyStatus.hidden = false;
      }

    } finally {
      applyNowButton.disabled = false;

      if (applyNowButton.textContent !== "Redirecting...") {
        applyNowButton.textContent = "Apply Now";
      }
    }
  });
}


// =====================================================
// HOMEPAGE - SUBMIT APPLICATION
// USE SHARED MALAYSIA APPLY JOB SYSTEM
// =====================================================

const homepageSubmitButton = document.getElementById(
  "submitHomepageApplicationBtn"
);

if (homepageSubmitButton) {
  homepageSubmitButton.addEventListener("click", async function () {
    if (!selectedHomepageJob) return;

    const documentsModal = document.getElementById(
      "homepageApplyDocumentsModal"
    );
     const jobDetailsModal = document.getElementById(
     "homepageJobDetailsModal"
   );
    const documentStatus = document.getElementById(
      "homepageApplyDocumentStatus"
    );
    const coverLetterInput = document.getElementById(
      "homepageApplyCoverLetter"
    );
    const applyStatus = document.getElementById(
      "homepageApplyStatus"
    );

    const selectedDocumentIds = Array.from(
      document.querySelectorAll(
        'input[name="homepageApplicationDocument"]:checked'
      )
    ).map(function (checkbox) {
      return checkbox.value;
    });

    if (selectedDocumentIds.length === 0) {
      if (documentStatus) {
        documentStatus.textContent =
          "Please select at least one document.";
        documentStatus.hidden = false;
      }
      return;
    }

    try {
      if (typeof window.submitMalaysiaJobApplication !== "function") {
        throw new Error("SHARED_APPLY_SYSTEM_NOT_AVAILABLE");
      }

      const result = await window.submitMalaysiaJobApplication({
        jobId: selectedHomepageJob.id,
        documentIds: selectedDocumentIds,
        coverLetter: coverLetterInput
          ? coverLetterInput.value.trim()
          : "",
        statusElement: documentStatus,
        submitButton: homepageSubmitButton
      });

      if (!result || !result.success) {
        throw new Error("APPLICATION_SUBMISSION_FAILED");
      }

           // CLOSE DOCUMENT MODAL
      if (documentsModal) {
        documentsModal.hidden = true;
        documentsModal.style.display = "none";
      }

      // RESTORE JOB DETAILS MODAL
      if (jobDetailsModal) {
        jobDetailsModal.hidden = false;
        jobDetailsModal.style.display = "flex";
      }
      // SHOW SUCCESS NOTIFICATION
if (applyStatus) {
  applyStatus.textContent =
    "Your application has been submitted successfully!";
  applyStatus.hidden = false;
  applyStatus.style.display = "block";

  applyStatus.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });

  // AUTO HIDE AFTER 4 SECONDS
  setTimeout(function () {
    applyStatus.hidden = true;
    applyStatus.style.display = "none";
  }, 4000);
}
      console.log(
        "Homepage Application Submitted:",
        result.applicationId,
        "Documents:",
        result.documentCount
      );

    } catch (error) {
      console.error("Homepage Application Submission Error:", error);

      if (
        error.message === "DOCUMENT_REQUIRED" &&
        documentStatus
      ) {
        documentStatus.textContent =
          "Please select at least one document.";
        documentStatus.hidden = false;
      } else if (
        error.message === "ALREADY_APPLIED" &&
        documentStatus
      ) {
        documentStatus.textContent =
          "You have already applied for this job.";
        documentStatus.hidden = false;
      } else if (
        error.message === "SHARED_APPLY_SYSTEM_NOT_AVAILABLE" &&
        documentStatus
      ) {
        documentStatus.textContent =
          "Application system is temporarily unavailable. Please try again.";
        documentStatus.hidden = false;
      }
    }
  });
}

  
function renderHomepageJobs(jobs) {
  jobsGrid.replaceChildren();

  const isMalay = window.currentKerjivaLanguage === "ms";

  if (!jobs.length) {
    const empty = document.createElement("div");
    empty.className = "empty-jobs";

    empty.appendChild(
      createTextElement("h3", "", "No Jobs Available Yet")
    );

    empty.appendChild(
      createTextElement(
        "p",
        "",
        "New job opportunities will appear here soon."
      )
    );

    jobsGrid.appendChild(empty);
    return;
  }

  jobs.forEach(job => {
    const card = document.createElement("article");
    card.className = "job-card";

    const header = document.createElement("div");
    header.className = "job-card-header";

    const logo = document.createElement("img");
    logo.className = "job-card-company-logo";
    logo.alt = job.company_name
      ? `${job.company_name} logo`
      : "Company logo";

    logo.src = job.logo_url || "/kerjiva-favicon.png";

    logo.addEventListener("error", function () {
      logo.src = "/kerjiva-favicon.png";
    }, { once: true });

    const companyName = createTextElement(
      "span",
      "job-card-company-name",
      job.company_name || "Company"
    );

    header.append(logo, companyName);

      const title = createTextElement(
      "h3",
      "job-card-title",
      (isMalay && job.title_ms) || job.title
    );

    // PUBLISHED DATE
    let postedDate = null;

    if (job.published_at) {
      const formattedDate = new Intl.DateTimeFormat(
        isMalay ? "ms-MY" : "en-MY",
        {
          timeZone: "Asia/Kuala_Lumpur",
          day: "2-digit",
          month: "short",
          year: "numeric"
        }
      ).format(new Date(job.published_at));

      postedDate = createTextElement(
        "p",
        "job-card-posted-date",
        `${isMalay ? "Disiarkan pada" : "Posted on"} ${formattedDate}`
      );
    }

    const category = createTextElement(
      "span",
      "job-card-category",
      (isMalay && job.category_ms) || job.category || "Other"
    );

    const details = document.createElement("div");
    details.className = "job-card-details";

    const location = [job.city, job.state]
      .filter(Boolean)
      .join(", ");

    details.appendChild(
      createTextElement(
        "p",
        "",
        `Location: ${location || "Not specified"}`
      )
    );

    details.appendChild(
      createTextElement(
        "p",
        "",
        `Job Type: ${(isMalay && job.job_type_ms) || job.job_type || "Not specified"}`
      )
    );

    const salary = createTextElement(
      "p",
      "job-card-salary",
      formatSalary(job)
    );

    const viewDetailsButton = document.createElement("button");
    viewDetailsButton.type = "button";
    viewDetailsButton.className = "primary-btn";
    viewDetailsButton.textContent = "View Details";

    viewDetailsButton.addEventListener("click", function () {
      openJobDetails(job);
    });

       card.append(
       header,
       title
     );

    if (postedDate) {
      card.appendChild(postedDate);
    }

    card.append(
      category,
      details,
      salary,
      viewDetailsButton
    );

    jobsGrid.appendChild(card);
  });
}

        
function filterHomepageJobs(shouldScroll = false) {
  const keyword = (keywordInput?.value || "")
    .trim()
    .toLowerCase();

  const selectedLocation = (locationSelect?.value || "")
    .trim()
    .toLowerCase();

  const selectedCategory = (categorySelect?.value || "")
    .trim()
    .toLowerCase();

  const selectedJobType = (jobTypeSelect?.value || "")
    .trim()
    .toLowerCase();

  const filteredJobs = homepageJobs.filter(job => {
    const searchableText = [
      job.title,
      job.category,
      job.description,
      job.requirements,
      job.company_name,
      job.city,
      job.state,
      job.job_type
    ].filter(Boolean).join(" ").toLowerCase();

    const matchesKeyword =
      !keyword || searchableText.includes(keyword);

    const matchesLocation =
      !selectedLocation ||
      selectedLocation === "all locations" ||
      [job.city, job.state]
        .filter(Boolean)
        .some(value => value.toLowerCase() === selectedLocation);

    const matchesCategory =
      !selectedCategory ||
      selectedCategory === "all categories" ||
      (job.category || "").trim().toLowerCase() === selectedCategory;

    const matchesJobType =
      !selectedJobType ||
      selectedJobType === "all job types" ||
      (job.job_type || "").trim().toLowerCase() === selectedJobType;

    return (
      matchesKeyword &&
      matchesLocation &&
      matchesCategory &&
      matchesJobType
    );
  });

           renderHomepageJobs(filteredJobs);

// Scroll to Homepage job results after user searches.
if (shouldScroll) {
  jobsGrid.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

} // END filterHomepageJobs
   
   
// ========================================
// HOMEPAGE PUBLISHED JOB COUNT
// ========================================
 
   
function updateHomepagePublishedJobCount(count) {
  const countElement = document.getElementById(
    "homepagePublishedJobCount"
  );

  if (!countElement) return;

  countElement.dataset.count = count;

  const isMalay = window.currentKerjivaLanguage === "ms";

  countElement.textContent = isMalay
    ? `${count} Jawatan Disiarkan`
    : `${count} Published Jobs`;
}

// ========================================
// REFRESH HOMEPAGE JOBS WHEN LANGUAGE CHANGES
// ========================================
document.addEventListener("kerjivaLanguageChanged", function () {
  filterHomepageJobs();

  const countElement = document.getElementById(
    "homepagePublishedJobCount"
  );

  updateHomepagePublishedJobCount(
    Number(countElement?.dataset.count || 0)
  );
});



async function loadHomepageJobs() {
  jobsGrid.innerHTML =
    '<div class="job-card-loading">Loading latest jobs...</div>';

  try {
    const sync = window.kerjivaMalaysiaSync;

    if (!sync || typeof sync.get !== "function") {
      throw new Error("Central Sync is unavailable.");
    }

    // REUSE HOMEPAGE JOBS AND COMPANY CACHE
    const homepageData = await sync.get(
      "homepage-published-jobs-with-companies",
      async function ({ supabase }) {

        // 1. LOAD PUBLISHED JOBS
        const { data: jobs, error: jobsError } = await supabase
          .from("jobs")
          .select(`
            id,
            title,
            title_ms,
            description,
            description_ms,
            requirements,
            requirements_ms,
            job_type,
            job_type_ms,
            category,
            category_ms,
            city,
            state,
            salary_min,
            salary_max,
            salary_currency,
            education,
            education_ms,
            experience,
            experience_ms,
            application_deadline,
            created_at,
            published_at,
            company_id
          `)
          .eq("status", "published")
          .order("created_at", { ascending: false });

        if (jobsError) throw jobsError;

        const today = getMalaysiaDate();

        const activeJobs = (jobs || []).filter(job => {
          return (
            !job.application_deadline ||
            job.application_deadline >= today
          );
        });

        // 2. GET COMPANY IDS
        const companyIds = [
          ...new Set(
            activeJobs
              .map(job => job.company_id)
              .filter(Boolean)
          )
        ];

        console.log(
          "HOMEPAGE COMPANY IDS:",
          companyIds
        );

        // 3. LOAD COMPANY DATA AND LOGOS
        let companies = [];

        if (companyIds.length) {
          const { data, error: companyError } = await supabase
            .from("public_job_companies")
            .select("id, company_name, logo_url")
            .in("id", companyIds);

          if (companyError) throw companyError;

          companies = data || [];
        }

        return {
          jobs: jobs || [],
          companies
        };

      },
      {
        scope: "public"
      }
    );

    // 4. PRESERVE EXISTING HOMEPAGE LOGIC
    const jobs = homepageData.jobs || [];
    const companies = homepageData.companies || [];

    const today = getMalaysiaDate();

    const activeJobs = jobs.filter(job => {
      return (
        !job.application_deadline ||
        job.application_deadline >= today
      );
    });

    // UPDATE PUBLISHED JOB COUNT
    updateHomepagePublishedJobCount(jobs.length);

    console.log(
      "HOMEPAGE COMPANY LOGO DATA:",
      companies.map(company => ({
        id: company.id,
        company_name: company.company_name,
        logo_url: company.logo_url
      }))
    );

    const companyMap = new Map(
      companies.map(company => [company.id, company])
    );

    homepageJobs = activeJobs.map(job => {
      const company = companyMap.get(job.company_id);

      return {
        ...job,
        company_name: company?.company_name || "Company",
        logo_url: company?.logo_url || ""
      };
    });

    filterHomepageJobs();

    console.log(
      "Homepage Latest Jobs Ready:",
      homepageJobs.length,
      "active jobs."
    );

    console.log(
      "Homepage Jobs Loaded From Central Sync:",
      homepageJobs.length
    );

  } catch (error) {
    console.error("Homepage Latest Jobs Error:", error);

    jobsGrid.innerHTML =
      '<div class="job-card-error">Unable to load jobs. Please try again later.</div>';
  }
}

       if (searchButton) {
  searchButton.addEventListener("click", function () {
    filterHomepageJobs(true);
  });
}

if (categorySelect) {
  categorySelect.addEventListener("change", filterHomepageJobs);
}

if (jobTypeSelect) {
  jobTypeSelect.addEventListener("change", filterHomepageJobs);
}

if (locationSelect) {
  locationSelect.addEventListener("change", filterHomepageJobs);
}

  if (keywordInput) {
    keywordInput.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        filterHomepageJobs();
      }
    });
  }

  await loadHomepageJobs();
});

       
/* =========================================================
   KERJIVA MALAYSIA - SHARED APPLY JOB SYSTEM
   Used by Homepage and Jobseeker Dashboard
========================================================= */

window.submitMalaysiaJobApplication = async function ({
  jobId,
  documentIds,
  coverLetter,
  statusElement,
  submitButton
}) {
  const supabase = window.supabaseAuth;
  const uploadedPaths = [];
  let applicationId = null;

  const showStatus = (message, isError = false) => {
    if (!statusElement) return;

    statusElement.textContent = message;
    statusElement.hidden = false;
    statusElement.style.display = "block";
    statusElement.style.color = isError ? "#dc2626" : "#15803d";
  };

  const setLoading = (loading) => {
    if (!submitButton) return;

    submitButton.disabled = loading;
    submitButton.textContent = loading
      ? "Submitting..."
      : "Submit Application";
  };

  try {
    if (!supabase) {
      throw new Error("SUPABASE_NOT_AVAILABLE");
    }

    const selectedIds = Array.isArray(documentIds)
      ? [...new Set(documentIds)]
      : [];

    if (!jobId) {
      throw new Error("JOB_NOT_SELECTED");
    }

    if (selectedIds.length === 0) {
      throw new Error("DOCUMENT_REQUIRED");
    }

    setLoading(true);
    showStatus("Preparing your application...");

    // 1. Create application and document records
    const { data: applicationData, error: applicationError } =
      await supabase.rpc("submit_job_application", {
        p_job_id: jobId,
        p_document_ids: selectedIds,
        p_cover_letter: coverLetter || null
      });

    if (applicationError) throw applicationError;

    if (
      !applicationData ||
      !applicationData.success ||
      !applicationData.application_id
    ) {
      throw new Error("APPLICATION_CREATION_FAILED");
    }

    applicationId = applicationData.application_id;

    const documents = applicationData.documents || [];

    if (documents.length !== selectedIds.length) {
      throw new Error("APPLICATION_DOCUMENT_COUNT_MISMATCH");
    }

    // 2. Copy selected documents to application storage
    for (const document of documents) {
      showStatus(
        `Copying document ${uploadedPaths.length + 1} of ${documents.length}...`
      );

      const {
        data: sourceFile,
        error: downloadError
      } = await supabase.storage
        .from("jobseeker-documents")
        .download(document.source_storage_path);

      if (downloadError || !sourceFile) {
        throw downloadError || new Error("SOURCE_DOCUMENT_NOT_FOUND");
      }

      const contentType =
        document.mime_type ||
        sourceFile.type ||
        "application/octet-stream";

      const { error: uploadError } = await supabase.storage
        .from("application-document-copies")
        .upload(
          document.copy_storage_path,
          sourceFile,
          {
            contentType,
            upsert: false
          }
        );

      if (uploadError) throw uploadError;

      uploadedPaths.push(document.copy_storage_path);
    }

    showStatus("Application submitted successfully!");

    return {
      success: true,
      applicationId,
      documentCount: documents.length
    };

  } catch (error) {
    console.error("Kerjiva Apply Job Error:", error);

    let cleanupError = null;

    // 3. Remove copies already uploaded
    if (uploadedPaths.length > 0) {
      const { error: removeError } = await supabase.storage
        .from("application-document-copies")
        .remove(uploadedPaths);

      if (removeError) {
        cleanupError = removeError;
      }
    }

    // 4. Remove the failed application record
    if (applicationId && !cleanupError) {
      const { error: rpcCleanupError } = await supabase.rpc(
        "cleanup_failed_job_application",
        {
          p_application_id: applicationId
        }
      );

      if (rpcCleanupError) {
        cleanupError = rpcCleanupError;
      }
    }

    if (cleanupError) {
      console.error("Application cleanup error:", cleanupError);

      showStatus(
        "Your application needs attention. Please contact support.",
        true
      );

      throw cleanupError;
    }

    const errorMessages = {
      LOGIN_REQUIRED: "Please log in to apply.",
      JOBSEEKER_PROFILE_REQUIRED: "Please complete your Jobseeker profile.",
      JOBSEEKER_ACCOUNT_REQUIRED: "Only Jobseeker accounts can apply.",
      JOB_NOT_AVAILABLE: "This job is no longer available.",
      DOCUMENT_REQUIRED: "Please select at least one document.",
      DOCUMENT_NOT_OWNED: "One or more selected documents are invalid.",
      ALREADY_APPLIED: "You have already applied for this job."
    };

    const errorKey = error.message || error.code || "";

    const message =
      errorMessages[errorKey] ||
      "Your application could not be submitted. Please try again.";

    showStatus(message, true);

    throw error;

  } finally {
    setLoading(false);
  }
};


/* =========================================================
   KERJIVA MALAYSIA - COMPANY MY JOBS
   Load Published and Draft Jobs
========================================================= */

document.addEventListener("DOMContentLoaded", async function () {
  const params = new URLSearchParams(window.location.search);

  if (params.get("dashboard") !== "company") return;
  if (params.has("preview")) return;

  const supabase = window.supabaseAuth;
  const jobsList = document.getElementById("companyJobsList");

  if (!supabase || !jobsList) return;

 
  async function loadCompanyJobs() {

    jobsList.textContent = "Loading your job postings...";

    try {

      const sync = window.kerjivaMalaysiaSync;

      if (!sync) {
        throw new Error("Kerjiva Malaysia Sync is unavailable.");
      }

      // 1. Get company profile from central sync
      const company = await sync.get(
        "company-profile",
        async function ({ supabase, userId }) {

          const { data, error } = await supabase
            .from("companies")
            .select("id")
            .eq("user_id", userId)
            .maybeSingle();

          if (error) throw error;

          return data;

        }
      );

      if (!company) {
        jobsList.textContent = "Company profile not found.";
        return;
      }

      // 2. Get company jobs from central sync
      const jobs = await sync.get(
        "company-jobs",
        async function ({ supabase }) {

          const { data, error } = await supabase
            .from("jobs")
            .select(`
              id,
              title,
              status,
              city,
              state,
              published_at,
              created_at
            `)
            .eq("company_id", company.id)
            .order("created_at", {
              ascending: false
            });

          if (error) throw error;

          return data || [];

        }
      );

      // 3. Show empty state
      if (!jobs || jobs.length === 0) {
        jobsList.textContent = "No job postings yet.";
        return;
      }

      // 4. Render job list
      jobsList.replaceChildren();

      jobs.forEach(function (job) {

        const jobCard = document.createElement("div");
        jobCard.className = "company-job-card";

        const title = document.createElement("h3");
        title.textContent = job.title || "Untitled Job";

        const location = document.createElement("p");
        location.textContent = [job.city, job.state]
          .filter(Boolean)
          .join(", ");

        const status = document.createElement("p");
        status.textContent =
          "Status: " + (job.status || "Unknown").toUpperCase();

        jobCard.append(title, location, status);

        if (job.status === "published" && job.published_at) {

          const postedDate = document.createElement("p");

          postedDate.textContent =
            "Posted on " +
            new Date(job.published_at).toLocaleDateString("en-MY", {
              day: "2-digit",
              month: "short",
              year: "numeric"
            });

          jobCard.appendChild(postedDate);

        }

        // Show Publish button only for Draft jobs
        if (job.status === "draft") {

          const publishBtn = document.createElement("button");

          publishBtn.type = "button";
          publishBtn.className = "company-job-publish-btn";
          publishBtn.textContent = "Publish";

          publishBtn.addEventListener("click", async function () {

            publishBtn.disabled = true;

            try {

              if (typeof window.openCompanyJobForEdit !== "function") {
                throw new Error("Job editing function is not available.");
              }

              await window.openCompanyJobForEdit(job.id);

              const editingJobId = document.getElementById(
                "companyEditingJobId"
              );

              const submitJobBtn = document.getElementById(
                "submitCompanyJobBtn"
              );

              if (
                !editingJobId ||
                editingJobId.value !== job.id ||
                !submitJobBtn
              ) {
                throw new Error("Unable to prepare this draft for publishing.");
              }

              submitJobBtn.click();

            } catch (error) {

              console.error("Publish Draft Error:", error);

              alert(error.message || "Unable to publish this draft.");

              publishBtn.disabled = false;

            }

          });

          jobCard.appendChild(publishBtn);

        }

        jobsList.appendChild(jobCard);

      });

      console.log(
        "Company My Jobs Loaded From Central Sync:",
        jobs.length
      );

    } catch (error) {

      console.error("Company My Jobs Error:", error);

      jobsList.textContent =
        "Unable to load your job postings. Please try again.";

  
    }

  }

  // Load when opening My Jobs
  const myJobsLink = document.querySelector(
    '#companyDashboard .dashboard-nav a[href="#companyMyJobs"]'
  );

  if (myJobsLink) {
    myJobsLink.addEventListener("click", loadCompanyJobs);
  }

  // Also load if My Jobs is the initial section
  if (window.location.hash === "#companyMyJobs") {
    loadCompanyJobs();
  }

});

/* =====================================================
   KERJIVA MALAYSIA
   HOMEPAGE HAMBURGER MENU
   ===================================================== */


document.addEventListener("DOMContentLoaded", function () {

  const menuButton = document.getElementById("hamburgerMenuBtn");
  const dropdownMenu = document.getElementById("hamburgerDropdown");

  if (!menuButton || !dropdownMenu) return;

  function closeHamburgerMenu() {
    dropdownMenu.classList.remove("is-open");
    menuButton.setAttribute("aria-expanded", "false");
  }

  menuButton.addEventListener("click", function (event) {
    event.stopPropagation();

    const isOpen = dropdownMenu.classList.contains("is-open");

    if (isOpen) {
      closeHamburgerMenu();
    } else {
      dropdownMenu.classList.add("is-open");
      menuButton.setAttribute("aria-expanded", "true");
    }
  });

  // Close menu when clicking outside
  document.addEventListener("click", function (event) {
    if (
      !dropdownMenu.contains(event.target) &&
      !menuButton.contains(event.target)
    ) {
      closeHamburgerMenu();
    }
  });

  // Close menu with Escape key
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeHamburgerMenu();
    }
  });

   // Close menu after selecting a navigation link
  dropdownMenu.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      closeHamburgerMenu();
    });
  });

  // Close menu after selecting a language
  const languageSelect = document.getElementById("languageSelect");

  if (languageSelect) {
    languageSelect.addEventListener("change", function () {
      closeHamburgerMenu();
    });
  }

});

/* =========================================================
   KERJIVA MALAYSIA - COMPANY INCOMING APPLICANTS
   Load Applications, Applicant Profiles and Documents
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

  const params = new URLSearchParams(window.location.search);

  if (params.get("dashboard") !== "company") return;
  if (params.has("preview")) return;

  const supabase = window.supabaseAuth;
   const sync = window.kerjivaMalaysiaSync;

  const applicantsList = document.getElementById(
    "companyApplicantsList"
  );

  const applicantDetails = document.getElementById(
    "companyApplicantDetails"
  );

  const applicantProfile = document.getElementById(
    "companyApplicantProfile"
  );

  const applicantDocuments = document.getElementById(
    "companyApplicantDocuments"
  );

 if (
  !supabase ||
  !sync ||
  !applicantsList ||
  !applicantDetails ||
  !applicantProfile ||
  !applicantDocuments
) return;

  let applicationsCache = [];
  let profilesCache = [];
  let jobsCache = [];
  let documentsCache = [];

 
async function loadIncomingApplicants() {

  applicantsList.textContent = "Loading incoming applicants...";
  applicantDetails.hidden = true;

  try {

    // 1. Get current authenticated user.
    const identity = await sync.getSession();

    if (!identity || !identity.user) {
      applicantsList.textContent =
        "Please log in to view incoming applicants.";
      return;
    }

    // 2. Reuse the company profile from Central Sync.
    const company = await sync.get(
      "company-profile",
      async function ({ supabase, userId }) {

        const { data, error } = await supabase
          .from("companies")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle();

        if (error) throw error;

        return data;

      }
    );

    if (!company) {
      applicantsList.textContent =
        "Company profile not found.";
      return;
    }

    // 3. Load all incoming applicant data through one cache bundle.
    const applicantData = await sync.get(
      "company-incoming-applicants",
      async function ({ supabase }) {

        // Get jobs owned by this company.
        const { data: jobs, error: jobsError } = await supabase
          .from("jobs")
          .select("id, title, city, state")
          .eq("company_id", company.id);

        if (jobsError) throw jobsError;

        const jobRows = jobs || [];

        if (jobRows.length === 0) {
          return {
            jobs: [],
            applications: [],
            profiles: [],
            documents: []
          };
        }

        const jobIds = jobRows.map(job => job.id);

        // Get applications belonging to these company jobs.
        const { data: applications, error: applicationsError } =
          await supabase
            .from("applications")
            .select(`
              id,
              job_id,
              user_id,
              cover_letter,
              status,
              applied_at
            `)
            .in("job_id", jobIds)
            .order("applied_at", { ascending: false });

        if (applicationsError) throw applicationsError;

        const applicationRows = applications || [];

        if (applicationRows.length === 0) {
          return {
            jobs: jobRows,
            applications: [],
            profiles: [],
            documents: []
          };
        }

        const applicantUserIds = [
          ...new Set(
            applicationRows
              .map(app => app.user_id)
              .filter(Boolean)
          )
        ];

        const applicationIds = applicationRows.map(
          app => app.id
        );

        // Load applicant profiles and documents in parallel.
        const [profileResult, documentResult] =
          await Promise.all([

            applicantUserIds.length
              ? supabase
                  .from("jobseeker_profiles")
                  .select(`
                    user_id,
                    full_name,
                    email,
                    phone,
                    headline,
                    about_me,
                    education_level,
                    field_of_study,
                    institution,
                    graduation_year,
                    experience_years,
                    skills,
                    city,
                    state,
                    linkedin_url,
                    portfolio_url,
                    avatar_url
                  `)
                  .in("user_id", applicantUserIds)
              : Promise.resolve({
                  data: [],
                  error: null
                }),

            applicationIds.length
              ? supabase
                  .from("application_documents")
                  .select(`
                    id,
                    application_id,
                    file_name,
                    storage_path,
                    file_size,
                    mime_type,
                    created_at
                  `)
                  .in("application_id", applicationIds)
                  .order("created_at", { ascending: true })
              : Promise.resolve({
                  data: [],
                  error: null
                })

          ]);

        if (profileResult.error) {
          throw profileResult.error;
        }

        if (documentResult.error) {
          throw documentResult.error;
        }

        return {
          jobs: jobRows,
          applications: applicationRows,
          profiles: profileResult.data || [],
          documents: documentResult.data || []
        };

      }
    );

    // 4. Reuse bundle data for applicant details.
    jobsCache = applicantData.jobs || [];
    applicationsCache = applicantData.applications || [];
    profilesCache = applicantData.profiles || [];
    documentsCache = applicantData.documents || [];

    if (jobsCache.length === 0) {
      applicantsList.textContent = "No job postings found.";
      return;
    }

    if (applicationsCache.length === 0) {
      applicantsList.textContent = "No applicants yet.";
      return;
    }

    // 5. Render incoming applicants.
    applicantsList.replaceChildren();

    applicationsCache.forEach(function (application) {

      const job = jobsCache.find(
        item => item.id === application.job_id
      );

      const profile = profilesCache.find(
        item => item.user_id === application.user_id
      );

      const card = document.createElement("div");
      card.className = "company-applicant-card";

      const name = document.createElement("h3");
      name.textContent =
        profile?.full_name || "Applicant";

      const position = document.createElement("p");
      position.textContent =
        "Position: " + (job?.title || "Unknown Job");

      const location = document.createElement("p");
      location.textContent =
        [job?.city, job?.state]
          .filter(Boolean)
          .join(", ");

      const status = document.createElement("p");
      status.textContent =
        "Status: " +
        (application.status || "pending").toUpperCase();

      const date = document.createElement("p");
      date.textContent = application.applied_at
        ? "Applied: " +
          new Date(application.applied_at).toLocaleDateString("en-MY")
        : "Application date unavailable";

      const viewButton = document.createElement("button");
      viewButton.type = "button";
      viewButton.className = "company-applicant-action";
      viewButton.textContent = "View Details";

      viewButton.addEventListener("click", function () {
        showApplicantDetails(application.id);
      });

      // Invite to Interview button.
      const inviteButton = document.createElement("button");
      inviteButton.type = "button";
      inviteButton.className = "company-applicant-action";
      inviteButton.textContent = "Invite to Interview";

      inviteButton.addEventListener("click", function () {

        const applicationInput = document.getElementById(
          "companyInterviewApplicationId"
        );

        const interviewStatus = document.getElementById(
          "companyInterviewStatus"
        );

        const interviewLink = document.querySelector(
          '#companyDashboard .dashboard-nav a[href="#companyInterviews"]'
        );

        if (!applicationInput || !interviewLink) {
          console.error("Interview form or navigation link not found.");
          return;
        }

        applicationInput.value = application.id;

        if (interviewStatus) {
          interviewStatus.textContent =
            "Creating interview invitation for " +
            (profile?.full_name || "Applicant");
        }

        interviewLink.click();

        document.getElementById("companyInterviewForm")?.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });

      });

      card.append(
        name,
        position,
        location,
        status,
        date,
        viewButton,
        inviteButton
      );

      applicantsList.appendChild(card);

    });

    if (typeof window.applyKerjivaTranslations === "function") {
      window.applyKerjivaTranslations();
    }

    console.log(
      "Company Incoming Applicants Loaded From Central Sync:",
      applicationsCache.length
    );

  } catch (error) {

    console.error(
      "Company Incoming Applicants Error:",
      error
    );

    applicantsList.textContent =
      "Unable to load incoming applicants. Please try again.";

  }

}

  // 8. Show applicant profile and application documents
  async function showApplicantDetails(applicationId) {

    const application = applicationsCache.find(
      item => item.id === applicationId
    );

    if (!application) return;

    const profile = profilesCache.find(
      item => item.user_id === application.user_id
    );

    const job = jobsCache.find(
      item => item.id === application.job_id
    );

    if (!profile) {
      applicantProfile.textContent =
        "Applicant profile is unavailable.";
    } else {

      applicantProfile.replaceChildren();

      const profileFields = [
        ["Full Name", profile.full_name],
        ["Email", profile.email],
        ["Phone", profile.phone],
        ["Headline", profile.headline],
        ["About Me", profile.about_me],
        ["Education", profile.education_level],
        ["Field of Study", profile.field_of_study],
        ["Institution", profile.institution],
        ["Graduation Year", profile.graduation_year],
        ["Experience", profile.experience_years],
        ["Skills", profile.skills],
        ["City", profile.city],
        ["State", profile.state]
      ];

      profileFields.forEach(function ([label, value]) {

        if (value === null || value === undefined || value === "") {
          return;
        }

        const row = document.createElement("p");
        const strong = document.createElement("strong");

        strong.textContent = label + ": ";

        row.append(
          strong,
          document.createTextNode(String(value))
        );

        applicantProfile.appendChild(row);

      });

      // Optional profile links
      [
        ["LinkedIn", profile.linkedin_url],
        ["Portfolio", profile.portfolio_url]
      ].forEach(function ([label, url]) {

        if (!url) return;

        const row = document.createElement("p");
        const link = document.createElement("a");

        link.href = url;
        link.textContent = label;
        link.target = "_blank";
        link.rel = "noopener noreferrer";

        row.appendChild(link);
        applicantProfile.appendChild(row);

      });

    }

    // Cover letter
    const coverTitle = document.createElement("h4");
    coverTitle.textContent = "Cover Letter";

    const coverText = document.createElement("p");
    coverText.textContent =
      application.cover_letter || "No cover letter provided.";

    applicantProfile.append(
      coverTitle,
      coverText
    );

    // Job information
    const jobInfo = document.createElement("p");
    jobInfo.textContent =
      "Applied Position: " + (job?.title || "Unknown Job");

    applicantProfile.prepend(jobInfo);

    // Application documents
    applicantDocuments.replaceChildren();

    const attachedDocuments = documentsCache.filter(
      doc => doc.application_id === applicationId
    );

    if (attachedDocuments.length === 0) {

      applicantDocuments.textContent =
        "No application documents attached.";

    } else {

      for (const documentItem of attachedDocuments) {

        const documentRow = document.createElement("div");
        documentRow.className = "company-applicant-document";

        const fileName = document.createElement("p");
        fileName.textContent =
          documentItem.file_name || "Application Document";

        const openButton = document.createElement("button");
        openButton.type = "button";
        openButton.textContent = "Open Document";

        openButton.addEventListener("click", async function () {

          openButton.disabled = true;
          openButton.textContent = "Preparing document...";

          try {

            const {
              data,
              error
            } = await supabase.storage
              .from("application-document-copies")
              .createSignedUrl(
                documentItem.storage_path,
                600
              );

            if (error) throw error;

            if (!data?.signedUrl) {
              throw new Error("Document URL unavailable.");
            }

            const link = document.createElement("a");

            link.href = data.signedUrl;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            link.textContent = "Open " +
              (documentItem.file_name || "Document");

            documentRow.appendChild(link);

            openButton.remove();

          } catch (error) {

            console.error(
              "Applicant Document Error:",
              error
            );

            openButton.textContent = "Unable to open document";
            openButton.disabled = false;

          }

        });

        documentRow.append(
          fileName,
          openButton
        );

        applicantDocuments.appendChild(documentRow);

      }

    }

    applicantDetails.hidden = false;

    applicantDetails.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

  }


  // 9. Load when opening Incoming Applicants
  const applicantsLink = document.querySelector(
    '#companyDashboard .dashboard-nav a[href="#companyApplicants"]'
  );

  if (applicantsLink) {
    applicantsLink.addEventListener(
      "click",
      loadIncomingApplicants
    );
  }

  // Also load if Incoming Applicants is the initial section
  if (window.location.hash === "#companyApplicants") {
    loadIncomingApplicants();
  }

});

        

/* =========================================================
   KERJIVA MALAYSIA - COMPANY DASHBOARD OVERVIEW
   Dynamic Statistics, Recent Applications and Realtime
   Central Sync Integrated
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

  const params = new URLSearchParams(window.location.search);

  if (params.get("dashboard") !== "company") return;
  if (params.has("preview")) return;

  const supabase = window.supabaseAuth;
  const sync = window.kerjivaMalaysiaSync;

  const totalJobsEl = document.getElementById("companyTotalJobs");
  const publishedJobsEl = document.getElementById("companyPublishedJobs");
  const draftJobsEl = document.getElementById("companyDraftJobs");
  const totalApplicantsEl = document.getElementById("companyTotalApplicants");
  const recentApplicantsEl = document.getElementById("companyRecentApplicants");

  if (
    !supabase ||
    !sync ||
    !totalJobsEl ||
    !publishedJobsEl ||
    !draftJobsEl ||
    !totalApplicantsEl ||
    !recentApplicantsEl
  ) return;

  let realtimeChannel = null;
  let isLoading = false;
  let refreshAfterLoad = false;
  let refreshTimer = null;

  async function loadCompanyOverview() {

    if (isLoading) {
      refreshAfterLoad = true;
      return;
    }

    isLoading = true;

    try {

      // 1. Get company profile from Central Sync
      const company = await sync.get(
        "company-profile",
        async function ({ supabase, userId }) {

          const { data, error } = await supabase
            .from("companies")
            .select(`
              id,
              company_name,
              registration_number,
              industry,
              email,
              phone,
              website,
              state,
              city,
              address,
              description,
              logo_url
            `)
            .eq("user_id", userId)
            .maybeSingle();

          if (error) throw error;

          return data;

        }
      );

      if (!company) {
        recentApplicantsEl.textContent =
          "Company profile not found.";
        return;
      }

      // 2. Get company jobs from Central Sync
      const companyJobs = await sync.get(
        "company-jobs",
        async function ({ supabase }) {

          const { data, error } = await supabase
            .from("jobs")
            .select(`
              id,
              title,
              status,
              city,
              state,
              published_at,
              created_at
            `)
            .eq("company_id", company.id);

          if (error) throw error;

          return data || [];

        }
      );

      const jobIds = companyJobs.map(job => job.id);

      // 3. Update job statistics
      totalJobsEl.textContent = companyJobs.length;

      publishedJobsEl.textContent =
        companyJobs.filter(job =>
          (job.status || "").toLowerCase() === "published"
        ).length;

      draftJobsEl.textContent =
        companyJobs.filter(job =>
          (job.status || "").toLowerCase() === "draft"
        ).length;

      // 4. Get application statistics from Central Sync
      const overviewData = await sync.get(
        "company-overview-data",
        async function ({ supabase }) {

          if (jobIds.length === 0) {
            return {
              applicationCount: 0,
              recentApplications: [],
              applicantProfiles: []
            };
          }

          // Count and latest applications are independent
          const [countResult, applicationsResult] =
            await Promise.all([

              supabase
                .from("applications")
                .select("id", {
                  count: "exact",
                  head: true
                })
                .in("job_id", jobIds),

              supabase
                .from("applications")
                .select(`
                  id,
                  job_id,
                  user_id,
                  status,
                  applied_at
                `)
                .in("job_id", jobIds)
                .order("applied_at", {
                  ascending: false
                })
                .limit(5)

            ]);

          if (countResult.error) throw countResult.error;
          if (applicationsResult.error) throw applicationsResult.error;

          const recentApplications =
            applicationsResult.data || [];

          // 5. Load applicant profiles only when needed
          let applicantProfiles = [];

          if (recentApplications.length > 0) {

            const applicantIds = [
              ...new Set(
                recentApplications.map(app => app.user_id)
              )
            ];

            if (applicantIds.length > 0) {

              const { data, error } = await supabase
                .from("jobseeker_profiles")
                .select("user_id, full_name")
                .in("user_id", applicantIds);

              if (error) throw error;

              applicantProfiles = data || [];

            }

          }

          return {
            applicationCount: countResult.count || 0,
            recentApplications,
            applicantProfiles
          };

        }
      );

      // 6. Update application statistics
      totalApplicantsEl.textContent =
        overviewData.applicationCount;

      const recentApplications =
        overviewData.recentApplications || [];

      const applicantProfiles =
        overviewData.applicantProfiles || [];

      if (recentApplications.length === 0) {

        recentApplicantsEl.textContent =
          "No applications yet.";

      } else {

        // 7. Render recent applications
        recentApplicantsEl.replaceChildren();

        recentApplications.forEach(function (application) {

          const job = companyJobs.find(
            item => item.id === application.job_id
          );

          const profile = applicantProfiles.find(
            item => item.user_id === application.user_id
          );

          const card = document.createElement("div");
          card.className = "company-recent-application-card";

          const name = document.createElement("h4");
          name.textContent =
            profile?.full_name || "Applicant";

          const position = document.createElement("p");
          position.textContent =
            "Position: " + (job?.title || "Unknown Job");

          const status = document.createElement("p");
          status.textContent =
            "Status: " +
            (application.status || "pending").toUpperCase();

          const date = document.createElement("p");
          date.textContent = application.applied_at
            ? "Applied: " +
              new Date(application.applied_at)
                .toLocaleDateString("en-MY")
            : "Application date unavailable";

          card.append(name, position, status, date);
          recentApplicantsEl.appendChild(card);

        });

      }

      // 8. Subscribe to Supabase Realtime once
      if (!realtimeChannel) {

        realtimeChannel = supabase
          .channel("company-overview-" + company.id)

          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "jobs",
              filter: "company_id=eq." + company.id
            },
            queueOverviewRefresh
          )

          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "applications"
            },
            queueOverviewRefresh
          )

          .subscribe(function (status) {

            console.log(
              "Company Overview Realtime:",
              status
            );

          });

      }

      console.log("Company Overview Loaded From Central Sync:", {
        totalJobs: companyJobs.length,
        totalApplicants: overviewData.applicationCount,
        recentApplications: recentApplications.length
      });

    } catch (error) {

      console.error(
        "Company Overview Error:",
        error
      );

      recentApplicantsEl.textContent =
        "Unable to load company overview. Please try again.";

    } finally {

      isLoading = false;

      if (refreshAfterLoad) {
        refreshAfterLoad = false;
        loadCompanyOverview();
      }

    }

  }

  // 9. Refresh related caches after Realtime events
  function queueOverviewRefresh() {

    sync.invalidate("company-jobs");
    sync.invalidate("company-overview-data");
    sync.invalidate("company-incoming-applicants");

    // Public job listings may also be affected by job changes
    sync.invalidate("published-jobs-with-companies");
    sync.invalidate("homepage-published-jobs-with-companies");

    if (refreshTimer) {
      clearTimeout(refreshTimer);
    }

    refreshTimer = setTimeout(function () {
      loadCompanyOverview();
    }, 500);

  }

  // 10. Load when opening Company Overview
  const overviewLink = document.querySelector(
    '#companyDashboard .dashboard-nav a[href="#companyOverview"]'
  );

  if (overviewLink) {
    overviewLink.addEventListener(
      "click",
      loadCompanyOverview
    );
  }

  // 11. Load when Company Dashboard first opens
  if (
    !window.location.hash ||
    window.location.hash === "#companyOverview"
  ) {
    loadCompanyOverview();
  }

});

/* =========================================================
   KERJIVA MALAYSIA - COMPANY SEND INTERVIEW INVITATION
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

  const params = new URLSearchParams(window.location.search);

  if (params.get("dashboard") !== "company") return;
  if (params.has("preview")) return;

  const supabase = window.supabaseAuth;
   const sync = window.kerjivaMalaysiaSync;

  const form = document.getElementById("companyInterviewForm");
  const statusEl = document.getElementById("companyInterviewStatus");
  const interviewList = document.getElementById("companyInterviewList");

  const applicationInput = document.getElementById(
    "companyInterviewApplicationId"
  );

  const typeInput = document.getElementById("companyInterviewType");
  const dateInput = document.getElementById("companyInterviewDate");
  const timeInput = document.getElementById("companyInterviewTime");
  const locationInput = document.getElementById("companyInterviewLocation");
  const meetingLinkInput = document.getElementById("companyInterviewMeetingLink");
  const messageInput = document.getElementById("companyInterviewMessage");

if (
  !supabase ||
  !sync ||
  !form ||
  !statusEl ||
  !interviewList ||
  !applicationInput
) return;

 
async function loadCompanyInterviews(companyId) {

  interviewList.textContent = "Loading interview invitations...";

  try {

    const interviewData = await sync.get(
      "company-interviews",
      async function ({ supabase }) {

        const { data: interviews, error } = await supabase
          .from("interviews")
          .select(`
            id,
            application_id,
            jobseeker_id,
            interview_date,
            interview_type,
            interview_location,
            meeting_link,
            message,
            status,
            created_at
          `)
          .eq("company_id", companyId)
          .order("interview_date", { ascending: true });

        if (error) throw error;

        const interviewRows = interviews || [];

        if (interviewRows.length === 0) {
          return {
            interviews: [],
            profiles: []
          };
        }

        const userIds = [
          ...new Set(
            interviewRows.map(item => item.jobseeker_id)
          )
        ];

        let profiles = [];

        if (userIds.length > 0) {

          const { data, error: profilesError } = await supabase
            .from("jobseeker_profiles")
            .select("user_id, full_name")
            .in("user_id", userIds);

          if (profilesError) throw profilesError;

          profiles = data || [];

        }

        return {
          interviews: interviewRows,
          profiles
        };

      }
    );

    const interviews = interviewData.interviews || [];
    const profiles = interviewData.profiles || [];

    if (interviews.length === 0) {
      interviewList.textContent = "No interview invitations yet.";
      return;
    }

    interviewList.replaceChildren();

    interviews.forEach(function (interview) {

      const profile = profiles.find(
        item => item.user_id === interview.jobseeker_id
      );

      const card = document.createElement("div");
      card.className = "company-interview-card";

      const name = document.createElement("h3");
      name.textContent = profile?.full_name || "Applicant";

      const date = document.createElement("p");
      date.textContent =
        "Date: " +
        new Date(interview.interview_date).toLocaleString("en-MY", {
          timeZone: "Asia/Kuala_Lumpur",
          dateStyle: "medium",
          timeStyle: "short"
        }) +
        " (Malaysia Time)";

      const type = document.createElement("p");
      type.textContent =
        "Type: " + (interview.interview_type || "-");

      const status = document.createElement("p");
      status.textContent =
        "Status: " + (interview.status || "pending").toUpperCase();

      card.append(name, date, type, status);

      if (interview.interview_location) {
        const location = document.createElement("p");
        location.textContent =
          "Location: " + interview.interview_location;
        card.appendChild(location);
      }

      if (interview.meeting_link) {
        const link = document.createElement("a");
        link.href = interview.meeting_link;
        link.textContent = "Open Meeting Link";
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        card.appendChild(link);
      }

      if (interview.message) {
        const message = document.createElement("p");
        message.textContent =
          "Message: " + interview.message;
        card.appendChild(message);
      }

      interviewList.appendChild(card);

    });

    console.log("Company Interviews Loaded From Central Sync:", {
      total: interviews.length
    });

  } catch (error) {

    console.error("Load Company Interviews Error:", error);

    interviewList.textContent =
      "Unable to load interview invitations.";

  }

}

  form.addEventListener("submit", async function (event) {

    event.preventDefault();

    statusEl.textContent = "";

    const applicationId = applicationInput.value.trim();
    const interviewType = typeInput.value;
    const interviewDate = dateInput.value;
    const interviewTime = timeInput.value;
    const interviewLocation = locationInput.value.trim();
    const meetingLink = meetingLinkInput.value.trim();
    const message = messageInput.value.trim();

    if (!applicationId) {
      statusEl.textContent =
        "Please select an applicant first.";
      return;
    }

    if (!interviewType || !interviewDate || !interviewTime) {
      statusEl.textContent =
        "Please complete interview type, date and time.";
      return;
    }

    if (
      interviewType === "In-person" &&
      !interviewLocation
    ) {
      statusEl.textContent =
        "Please enter the interview location.";
      return;
    }

    if (
      interviewType === "Online" &&
      !meetingLink
    ) {
      statusEl.textContent =
        "Please enter the online meeting link.";
      return;
    }

    // Malaysia uses UTC+08:00
    const interviewDateTime = new Date(
      `${interviewDate}T${interviewTime}:00+08:00`
    );

    if (Number.isNaN(interviewDateTime.getTime())) {
      statusEl.textContent =
        "Invalid interview date or time.";
      return;
    }

    if (interviewDateTime.getTime() <= Date.now()) {
      statusEl.textContent =
        "Interview date and time must be in the future.";
      return;
    }

    const sendButton = document.getElementById(
      "sendCompanyInterviewBtn"
    );

    sendButton.disabled = true;
    sendButton.textContent = "Sending...";

    try {

     const session = await sync.getSession();

const user = session?.user;

if (!user) {
  throw new Error("Please log in again.");
}

// Get company profile from Central Sync
const company = await sync.get(
  "company-profile",
  async function ({ supabase, userId }) {

    const { data, error } = await supabase
      .from("companies")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw error;

    return data;

  }
);

if (!company) {
  throw new Error("Company profile not found.");
}
      // Verify the selected application belongs to this company
      const { data: application, error: applicationError } =
        await supabase
          .from("applications")
          .select("id, user_id")
          .eq("id", applicationId)
          .maybeSingle();

      if (applicationError) throw applicationError;

      if (!application) {
        throw new Error("Selected application was not found.");
      }

      // Insert interview invitation
      const { error: insertError } = await supabase
        .from("interviews")
        .insert({
          application_id: application.id,
          company_id: company.id,
          jobseeker_id: application.user_id,
          interview_date: interviewDateTime.toISOString(),
          interview_type: interviewType,
          interview_location: interviewLocation || null,
          meeting_link: meetingLink || null,
          message: message || null,
          status: "pending"
        });

      if (insertError) throw insertError;
       // Refresh interview data across company and jobseeker dashboards
          sync.invalidate("company-interviews");
          sync.invalidate("jobseeker-interviews");

      statusEl.textContent =
        "Interview invitation sent successfully!";

      form.reset();
      applicationInput.value = "";

      await loadCompanyInterviews(company.id);

      console.log("Interview Invitation Sent Successfully.");

    } catch (error) {

      console.error("Send Interview Invitation Error:", error);

      statusEl.textContent =
        error.message || "Unable to send interview invitation.";

    } finally {

      sendButton.disabled = false;
      sendButton.textContent = "Send Invitation";

    }

  });


  // Load invitations when opening the Interview Invitations menu
  const interviewsLink = document.querySelector(
    '#companyDashboard .dashboard-nav a[href="#companyInterviews"]'
  );


async function refreshCompanyInterviews() {

  try {

    const session = await sync.getSession();
    const user = session?.user;

    if (!user) return;

    const company = await sync.get(
      "company-profile",
      async function ({ supabase, userId }) {

        const { data, error } = await supabase
          .from("companies")
          .select("id")
          .eq("user_id", userId)
          .maybeSingle();

        if (error) throw error;

        return data;

      }
    );

    if (company) {
      await loadCompanyInterviews(company.id);
    }

  } catch (error) {

    console.error(
      "Refresh Company Interviews Error:",
      error
    );

  }

}

});


/* =====================================================
   KERJIVA MALAYSIA
   JOBSEEKER INTERVIEW INVITATIONS
   LOAD AND DISPLAY COMPANY INVITATIONS
   SUPABASE REALTIME
   ===================================================== */

document.addEventListener("DOMContentLoaded", async function () {

  const params = new URLSearchParams(window.location.search);

  // Run only on the actual Jobseeker Dashboard.
  if (
    params.get("dashboard") !== "jobseeker" ||
    params.has("preview")
  ) {
    return;
  }

  const dashboard = document.getElementById(
    "jobseekerDashboard"
  );
   const supabase = window.supabaseAuth;

  const interviewList = document.getElementById(
    "jobseekerInterviewList"
  );
   const totalInterviewsElement = document.getElementById(
    "totalInterviews"
  );

 if (!dashboard || !interviewList || !supabase) return;
   const sync = window.kerjivaMalaysiaSync;

 if (!sync) {
  console.error("Kerjiva Malaysia Central Sync is unavailable.");
  return;
 }

  let currentUser = null;
  let interviewChannel = null;
  let loadRequestId = 0;

  // =========================================
  // EMPTY STATE
  // =========================================

 function showInterviewEmptyState() {

  interviewList.replaceChildren();

  const emptyState = document.createElement("div");
  emptyState.className = "dashboard-empty-state";

  const heading = document.createElement("h3");
  heading.setAttribute("data-i18n", "interviews_empty_title");
  heading.textContent = "No Interview Invitations";

  const description = document.createElement("p");
  description.setAttribute(
    "data-i18n",
    "interviews_empty_description"
  );
  description.textContent =
    "Interview invitations from companies will appear here.";

  emptyState.append(heading, description);
  interviewList.appendChild(emptyState);

  if (typeof window.applyKerjivaTranslations === "function") {
    window.applyKerjivaTranslations(
      window.currentKerjivaLanguage || "en"
    );
  }

}
  // =========================================
  // FORMAT INTERVIEW DATE AND TIME
  // MALAYSIA TIMEZONE (GMT+8)
  // =========================================

  function formatInterviewDate(dateValue) {

    if (!dateValue) return "Date unavailable";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "Date unavailable";
    }

    return new Intl.DateTimeFormat("en-MY", {
      timeZone: "Asia/Kuala_Lumpur",
      dateStyle: "full"
    }).format(date);

  }

  function formatInterviewTime(dateValue) {

    if (!dateValue) return "Time unavailable";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "Time unavailable";
    }

    return new Intl.DateTimeFormat("en-MY", {
      timeZone: "Asia/Kuala_Lumpur",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    }).format(date);

  }

  function formatInterviewStatus(status) {

    if (!status) return "Status not set";

    return String(status)
      .replace(/[_-]+/g, " ")
      .replace(/\b\w/g, character => character.toUpperCase());

  }

  // =========================================
  // CREATE INTERVIEW CARD
  // =========================================

  function createInterviewCard(interview, job, company) {

    const card = document.createElement("div");
    card.className = "jobseeker-interview-card";

    const heading = document.createElement("h3");
    heading.textContent = job
      ? job.title
      : "Job details unavailable";

    const companyName = document.createElement("p");
    companyName.textContent = company
      ? company.company_name
      : "Company information unavailable";

    const date = document.createElement("p");
    date.textContent =
      "Interview Date: " +
      formatInterviewDate(interview.interview_date);

    const time = document.createElement("p");
    time.textContent =
      "Interview Time: " +
      formatInterviewTime(interview.interview_date) +
      " (Malaysia Time)";

    const type = document.createElement("p");
    type.textContent =
      "Interview Type: " +
      (interview.interview_type || "Not specified");

    const status = document.createElement("p");
    status.className = "interview-status";
    status.textContent =
      "Status: " +
      formatInterviewStatus(interview.status);

    card.append(
      heading,
      companyName,
      date,
      time,
      type,
      status
    );

    // In-person interview location.
    if (interview.interview_location) {

      const location = document.createElement("p");
      location.textContent =
        "Location: " + interview.interview_location;

      card.appendChild(location);

    }

    // Online interview meeting link.
    if (interview.meeting_link) {

      const linkLabel = document.createElement("p");
      linkLabel.textContent = "Meeting Link:";

      const meetingLink = document.createElement("a");
      meetingLink.textContent = "Join Online Interview";
      meetingLink.target = "_blank";
      meetingLink.rel = "noopener noreferrer";

      try {

        const url = new URL(interview.meeting_link);

        if (
          url.protocol === "https:" ||
          url.protocol === "http:"
        ) {

          meetingLink.href = url.href;

          card.append(linkLabel, meetingLink);

        }

      } catch (error) {

        console.warn(
          "Invalid interview meeting link:",
          interview.meeting_link
        );

      }

    }

    // Company invitation message.
    if (interview.message) {

      const messageHeading = document.createElement("h4");
      messageHeading.textContent = "Message from Company";

      const message = document.createElement("p");
      message.textContent = interview.message;
      message.className = "interview-message";

      card.append(messageHeading, message);

    }

    return card;

  }

  // =========================================
  // LOAD JOBSEEKER INTERVIEW INVITATIONS
  // =========================================

 
async function loadJobseekerInterviews() {

  if (!currentUser) return;

  const requestId = ++loadRequestId;

  interviewList.textContent =
    "Loading interview invitations...";

  try {

    // Load the complete interview bundle through Central Sync.
    const interviewData = await sync.get(
      "jobseeker-interviews",
      async function ({ supabase, userId }) {

        // 1. Get this Jobseeker's invitations.
        const { data: interviews, error: interviewError } =
          await supabase
            .from("interviews")
            .select(`
              id,
              application_id,
              company_id,
              interview_date,
              interview_type,
              interview_location,
              meeting_link,
              message,
              status,
              created_at
            `)
            .eq("jobseeker_id", userId)
            .order("interview_date", { ascending: true });

        if (interviewError) throw interviewError;

        const interviewRows = interviews || [];

        if (interviewRows.length === 0) {
          return {
            interviews: [],
            applications: [],
            jobs: [],
            companies: []
          };
        }

        const applicationIds = [
          ...new Set(
            interviewRows
              .map(item => item.application_id)
              .filter(Boolean)
          )
        ];

        const companyIds = [
          ...new Set(
            interviewRows
              .map(item => item.company_id)
              .filter(Boolean)
          )
        ];

        // 2. Load applications and companies in parallel.
        const [applicationResult, companyResult] =
          await Promise.all([

            applicationIds.length
              ? supabase
                  .from("applications")
                  .select("id, job_id")
                  .in("id", applicationIds)
              : Promise.resolve({
                  data: [],
                  error: null
                }),

            companyIds.length
              ? supabase
                  .from("companies")
                  .select("id, company_name")
                  .in("id", companyIds)
              : Promise.resolve({
                  data: [],
                  error: null
                })

          ]);

        if (applicationResult.error) {
          throw applicationResult.error;
        }

        if (companyResult.error) {
          throw companyResult.error;
        }

        const applications = applicationResult.data || [];
        const companies = companyResult.data || [];

        // 3. Load related job titles.
        const jobIds = [
          ...new Set(
            applications
              .map(item => item.job_id)
              .filter(Boolean)
          )
        ];

        let jobs = [];

        if (jobIds.length > 0) {

          const { data, error } = await supabase
            .from("jobs")
            .select("id, title")
            .in("id", jobIds);

          if (error) throw error;

          jobs = data || [];

        }

        return {
          interviews: interviewRows,
          applications,
          jobs,
          companies
        };

      }
    );

    if (requestId !== loadRequestId) return;

    const interviews = interviewData.interviews || [];
    const applications = interviewData.applications || [];
    const jobs = interviewData.jobs || [];
    const companies = interviewData.companies || [];

    // Update dashboard statistic.
    if (totalInterviewsElement) {
      totalInterviewsElement.textContent =
        String(interviews.length);
    }

    if (interviews.length === 0) {
      showInterviewEmptyState();
      return;
    }

    const applicationMap = new Map(
      applications.map(item => [item.id, item])
    );

    const jobMap = new Map(
      jobs.map(item => [item.id, item])
    );

    const companyMap = new Map(
      companies.map(item => [item.id, item])
    );

    // Display invitations.
    interviewList.replaceChildren();

    interviews.forEach(interview => {

      const application = applicationMap.get(
        interview.application_id
      );

      const job = application
        ? jobMap.get(application.job_id)
        : null;

      const company = companyMap.get(
        interview.company_id
      );

      interviewList.appendChild(
        createInterviewCard(interview, job, company)
      );

    });

    console.log(
      "Jobseeker Interview Invitations Loaded From Central Sync:",
      interviews.length
    );

  } catch (error) {

    console.error(
      "Load Jobseeker Interview Invitations Error:",
      error
    );

    if (requestId === loadRequestId) {

      interviewList.textContent =
        "Unable to load interview invitations. Please try again.";

    }

  }

}

  // =========================================
  // REFRESH WHEN OPENING INTERVIEW INVITATIONS
  // =========================================

  const menuLinks = dashboard.querySelectorAll(
    ".dashboard-menu .dashboard-menu-link"
  );

  menuLinks.forEach(link => {

    link.addEventListener("click", function () {

      if (
        this.getAttribute("href") === "#jobseekerInterviews"
      ) {

        loadJobseekerInterviews();

      }

    });

  });

  // =========================================
  // INITIALIZE SESSION
  // =========================================

  try {

  const identity = await sync.getSession();

  if (!identity || !identity.user) {
  throw new Error("Please sign in again.");
  }

   currentUser = identity.user;

    // Load invitations when Jobseeker Dashboard opens.
    await loadJobseekerInterviews();

    // =========================================
    // SUPABASE REALTIME SUBSCRIPTION
    // =========================================

   interviewChannel = supabase
      .channel("jobseeker-interviews-" + currentUser.id)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "interviews",
          filter: "jobseeker_id=eq." + currentUser.id
        },
         
         function () {

         sync.invalidate("jobseeker-interviews");

         loadJobseekerInterviews();

       }
      )
      .subscribe(function (status) {

        if (
          status === "CHANNEL_ERROR" ||
          status === "TIMED_OUT"
        ) {

          console.warn(
            "Jobseeker Interview Realtime is unavailable:",
            status
          );

        }

      });

  } catch (error) {

    console.error(
      "Initialize Jobseeker Interview Invitations Error:",
      error
    );

    interviewList.textContent =
      error.message ||
      "Unable to initialize Interview Invitations.";

  }

});


/* =====================================================
   KERJIVA MALAYSIA
   RESET PASSWORD
   ===================================================== */

document.addEventListener("DOMContentLoaded", async function () {

  const resetPasswordForm =
    document.getElementById("resetPasswordForm");

  if (!resetPasswordForm) return;

  const passwordInput =
    document.getElementById("resetPassword");

  const confirmPasswordInput =
    document.getElementById("confirmResetPassword");

  const submitBtn =
    document.getElementById("resetPasswordSubmitBtn");

  const statusText =
    document.getElementById("resetPasswordStatus");

  if (
    !passwordInput ||
    !confirmPasswordInput ||
    !submitBtn ||
    !statusText
  ) {
    return;
  }
   
  // RESET PASSWORD NOTIFICATION
  function showResetPasswordNotification(message) {

    statusText.textContent = "";

    showKerjivaNotification(message, "success");

    const notification = document.getElementById(
      "kerjivaNotification"
    );

    if (!notification) return;

    let style = document.getElementById(
      "resetPasswordNotificationStyle"
    );

    if (!style) {

      style = document.createElement("style");

      style.id = "resetPasswordNotificationStyle";

      style.textContent = `
        #kerjivaNotification {
          top: 24px;
          left: 50%;
          right: auto;
          width: max-content;
          max-width: calc(100% - 32px);
          text-align: center;
          transform: translate(-50%, -10px);
        }

        #kerjivaNotification.show {
          transform: translate(-50%, 0);
        }

        #kerjivaNotification.success {
          background: #198754;
        }

        @media (max-width: 600px) {
          #kerjivaNotification {
            top: 16px;
            left: 16px;
            right: 16px;
            width: auto;
            max-width: none;
            transform: translateY(-10px);
          }

          #kerjivaNotification.show {
            transform: translateY(0);
          }
        }
      `;

      document.head.appendChild(style);
    }
  }


  // VALIDATE PASSWORD RESET SESSION
  try {

    const { data, error } =
      await supabaseAuth.auth.getSession();

    if (error) throw error;

    if (!data.session || !data.session.user) {

     showResetPasswordNotification(
       "This password reset link is invalid or has expired. Please request a new link."
     );
      submitBtn.disabled = true;
      return;
    }

  } catch (error) {

    console.error("Reset Password Session Error:", error);

   showResetPasswordNotification(
    "Unable to verify your reset link. Please request a new link."
    );
    submitBtn.disabled = true;
    return;

  }

  // UPDATE PASSWORD
  resetPasswordForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    if (!resetPasswordForm.checkValidity()) {
      resetPasswordForm.reportValidity();
      return;
    }

    const newPassword = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (newPassword !== confirmPassword) {

    showResetPasswordNotification(
      "The passwords do not match."
     );
      return;
    }

    const originalButtonText = submitBtn.textContent;

    submitBtn.disabled = true;
    submitBtn.textContent = "Updating...";
    statusText.textContent = "";

    try {

      const { error } =
        await supabaseAuth.auth.updateUser({
          password: newPassword
        });

     
      if (error) throw error;

    
      resetPasswordForm.reset();

      submitBtn.textContent = "Password Updated";
      submitBtn.disabled = true;

      // CREATE PASSWORD RESET SUCCESS DIALOG
      const overlay = document.createElement("div");

      overlay.style.cssText = `
        position: fixed;
        inset: 0;
        z-index: 100000;
        background: rgba(0, 0, 0, 0.55);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
      `;

      const dialog = document.createElement("div");

      dialog.style.cssText = `
        width: 100%;
        max-width: 420px;
        background: #ffffff;
        border-radius: 12px;
        padding: 28px 24px;
        text-align: center;
        box-shadow: 0 8px 30px rgba(0,0,0,0.2);
      `;

      const message = document.createElement("p");

      message.textContent =
        "Your password has been updated successfully. You can now log in with your new password.";

      message.style.cssText = `
        color: #333333;
        font-size: 16px;
        line-height: 1.6;
        margin: 0 0 24px;
      `;

      const okButton = document.createElement("button");

      okButton.type = "button";
      okButton.textContent = "OK";

      okButton.style.cssText = `
        min-width: 100px;
        padding: 11px 28px;
        border: none;
        border-radius: 6px;
        background: #198754;
        color: #ffffff;
        font-size: 15px;
        font-weight: 600;
        cursor: pointer;
      `;

      okButton.addEventListener("click", async function () {

        okButton.disabled = true;

        overlay.remove();

        try {

          await supabaseAuth.auth.signOut({ scope: "local" });

        } catch (signOutError) {

          console.error(
            "Password reset sign-out error:",
            signOutError
          );

        }

        // SEND SIGNAL TO THE FIRST TAB
        localStorage.setItem(
          "kerjivaPasswordResetComplete",
          JSON.stringify({
            timestamp: Date.now()
          })
        );

   // CLOSE RESET PASSWORD TAB
      window.close();

      });

      dialog.appendChild(message);
      dialog.appendChild(okButton);
      overlay.appendChild(dialog);
      document.body.appendChild(overlay);


       
    } catch (error) {

      console.error("Reset Password Error:", error);

     showResetPasswordNotification(
      "Unable to update your password. Please try again."
     );

      submitBtn.disabled = false;

    } finally {

      if (!submitBtn.disabled) {
        submitBtn.textContent = originalButtonText;
      }

    }

  });

});



/* =====================================================
   KERJIVA MALAYSIA
   SHOW / HIDE RESET PASSWORD
   ===================================================== */

document.addEventListener("click", function (event) {

  if (!(event.target instanceof Element)) return;

  const button = event.target.closest(
    ".password-toggle-btn"
  );

  if (!button) return;

  event.preventDefault();

  const targetId = button.dataset.passwordTarget;
  const passwordInput = document.getElementById(targetId);

  if (!passwordInput) return;

  const isPasswordHidden =
    passwordInput.type === "password";

  passwordInput.type =
    isPasswordHidden ? "text" : "password";

  button.setAttribute(
    "aria-label",
    isPasswordHidden ? "Hide password" : "Show password"
  );

  button.setAttribute(
    "aria-pressed",
    String(isPasswordHidden)
  );

  button.innerHTML = isPasswordHidden
    ? `
      <svg xmlns="http://www.w3.org/2000/svg"
        width="21" height="21" viewBox="0 0 24 24"
        fill="none" stroke="currentColor"
        stroke-width="2" stroke-linecap="round"
        stroke-linejoin="round">
        <path d="M3 3l18 18"/>
        <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8"/>
        <path d="M9.9 5.2A11 11 0 0 1 12 5
          c6.4 0 10 7 10 7a16 16 0 0 1-4 4.7"/>
        <path d="M6.2 6.2C3.5 8 2 12 2 12
          s3.6 7 10 7c1 0 2-.2 2.9-.5"/>
      </svg>
    `
    : `
      <svg xmlns="http://www.w3.org/2000/svg"
        width="21" height="21" viewBox="0 0 24 24"
        fill="none" stroke="currentColor"
        stroke-width="2" stroke-linecap="round"
        stroke-linejoin="round">
        <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
    `;

});


/* =====================================================
   KERJIVA MALAYSIA
   HOMEPAGE LOGIN BUTTON - CHECK EXISTING SESSION
   ===================================================== */

document.addEventListener("DOMContentLoaded", function () {

  const homepageLoginBtn =
    document.querySelector(".header-actions .login-btn");

  if (!homepageLoginBtn) return;

  homepageLoginBtn.addEventListener("click", async function (event) {

    event.preventDefault();

    try {

      const { data, error } =
        await supabaseAuth.auth.getSession();

      if (error) throw error;

      // USER ALREADY LOGGED IN
      if (data.session?.user) {

        showKerjivaNotification(
          "You are already logged in.",
          "success"
        );

        return;
      }

      // USER NOT LOGGED IN
      window.location.href = "login.html";

    } catch (error) {

      console.error(
        "Homepage Login Session Check Error:",
        error
      );

      showKerjivaNotification(
        "Unable to check your login session. Please try again.",
        "error"
      );

    }

  });

});







