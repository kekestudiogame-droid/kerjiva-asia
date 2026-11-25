
/* =====================================================
   KERJIVA MALAYSIA
   ALL JOBS PAGE
   Central Sync Integration
===================================================== */

document.addEventListener("DOMContentLoaded", function () {
  "use strict";

  const grid = document.getElementById("allJobsGrid");
  const resultCount = document.getElementById("allJobsResultCount");

  const keywordInput = document.getElementById("allJobsKeyword");
  const locationInput = document.getElementById("allJobsLocation");
  const categoryInput = document.getElementById("allJobsCategory");
  const typeInput = document.getElementById("allJobsType");
  const searchButton = document.getElementById("allJobsSearchBtn");

  if (!grid) {
    console.warn("All Jobs: allJobsGrid element not found.");
    return;
  }

  const CACHE_KEY = "homepage-published-jobs-with-companies";

  let allJobs = [];

  /* =====================================================
     HELPERS
  ===================================================== */

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      }[char];
    });
  }

  function getLanguage() {
    return window.currentKerjivaLanguage === "ms" ? "ms" : "en";
  }

  function getJobText(job, field) {
    const language = getLanguage();

    if (language === "ms" && job[field + "_ms"]) {
      return job[field + "_ms"];
    }

    return job[field] || "";
  }

  function getMalaysiaDate() {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kuala_Lumpur",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).format(new Date());
  }

  function isJobActive(job) {
    if (!job.application_deadline) return true;

    return job.application_deadline >= getMalaysiaDate();
  }

  function formatSalary(job) {
    const minimum = Number(job.salary_min || 0);
    const maximum = Number(job.salary_max || 0);
    const currency = job.salary_currency || "MYR";

    if (!minimum && !maximum) {
      return getLanguage() === "ms"
        ? "Gaji tidak dinyatakan"
        : "Salary not specified";
    }

    const formatter = new Intl.NumberFormat(
      getLanguage() === "ms" ? "ms-MY" : "en-MY"
    );

    if (minimum && maximum) {
      return currency + " " +
        formatter.format(minimum) +
        " - " +
        formatter.format(maximum);
    }

    return currency + " " + formatter.format(minimum || maximum);
  }

  function formatDate(dateValue) {
    if (!dateValue) return "";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) return "";

    return new Intl.DateTimeFormat(
      getLanguage() === "ms" ? "ms-MY" : "en-MY",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Kuala_Lumpur"
      }
    ).format(date);
  }

  /* =====================================================
     LOAD JOBS THROUGH CENTRAL SYNC
  ===================================================== */

  async function loadJobs() {
    try {
      grid.innerHTML = `
        <div class="loading-jobs">
          ${getLanguage() === "ms"
            ? "Memuatkan pekerjaan..."
            : "Loading jobs..."}
        </div>
      `;

      const sync = window.kerjivaMalaysiaSync;

      if (!sync || typeof sync.get !== "function") {
        throw new Error("Kerjiva Malaysia Central Sync is unavailable.");
      }

      const result = await sync.get(
        CACHE_KEY,
        async function (context = {}) {
          const supabase = context.supabase || window.supabaseAuth;

          if (!supabase) {
            throw new Error("Supabase client is unavailable.");
          }

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
            .order("published_at", { ascending: false });

          if (jobsError) throw jobsError;

          const validJobs = (jobs || []).filter(isJobActive);

          if (validJobs.length === 0) return [];

          const companyIds = [
            ...new Set(
              validJobs
                .map(job => job.company_id)
                .filter(Boolean)
            )
          ];

          let companies = [];

          if (companyIds.length > 0) {
            const { data, error } = await supabase
              .from("public_job_companies")
              .select("id, company_name, logo_url")
              .in("id", companyIds);

            if (error) throw error;

            companies = data || [];
          }

          const companyMap = new Map(
            companies.map(company => [company.id, company])
          );

          return validJobs.map(job => ({
            ...job,
            company: companyMap.get(job.company_id) || null
          }));
        },
        { scope: "public" }
      );

      allJobs = Array.isArray(result)
        ? result
        : Array.isArray(result?.data)
          ? result.data
          : [];

      allJobs = allJobs.filter(isJobActive);

      renderJobs();

    } catch (error) {
      console.error("All Jobs loading error:", error);

      grid.innerHTML = `
        <div class="empty-jobs">
          ${getLanguage() === "ms"
            ? "Pekerjaan tidak dapat dimuatkan. Sila cuba lagi."
            : "Unable to load jobs. Please try again."}
        </div>
      `;

      if (resultCount) resultCount.textContent = "0";
    }
  }

  /* =====================================================
     RENDER JOB CARDS
  ===================================================== */

  function renderJobs() {
    const keyword = (keywordInput?.value || "")
      .trim()
      .toLowerCase();

    const location = (locationInput?.value || "")
      .trim()
      .toLowerCase();

    const category = categoryInput?.value || "";
    const jobType = typeInput?.value || "";

    const filteredJobs = allJobs.filter(job => {
      const companyName = job.company?.company_name || "";

      const searchableText = [
        getJobText(job, "title"),
        getJobText(job, "description"),
        getJobText(job, "category"),
        companyName,
        job.city,
        job.state
      ].join(" ").toLowerCase();

      const jobLocation = [
        job.city,
        job.state
      ].join(" ").toLowerCase();

      const matchesKeyword =
        !keyword || searchableText.includes(keyword);

      const matchesLocation =
        !location || jobLocation.includes(location);

      const matchesCategory =
        !category || job.category === category;

      const matchesType =
        !jobType || job.job_type === jobType;

      return (
        matchesKeyword &&
        matchesLocation &&
        matchesCategory &&
        matchesType
      );
    });

    if (resultCount) {
      resultCount.textContent = filteredJobs.length;
    }

    if (filteredJobs.length === 0) {
      grid.innerHTML = `
        <div class="empty-jobs">
          ${getLanguage() === "ms"
            ? "Tiada pekerjaan ditemui."
            : "No jobs found."}
        </div>
      `;
      return;
    }

    grid.innerHTML = filteredJobs.map(job => {
      const companyName =
        job.company?.company_name ||
        "Company";

      const logo = job.company?.logo_url
        ? `
          <img
            src="${escapeHTML(job.company.logo_url)}"
            alt="${escapeHTML(companyName)}"
            class="job-card-company-logo"
            loading="lazy"
          >
        `
        : `
          <div class="job-card-company-logo">
            ${escapeHTML(companyName.charAt(0).toUpperCase())}
          </div>
        `;

      const title = getJobText(job, "title");
      const categoryText = getJobText(job, "category");
      const typeText = getJobText(job, "job_type");

      const locationText = [
        job.city,
        job.state
      ].filter(Boolean).join(", ");

      const publishedDate = formatDate(
        job.published_at || job.created_at
      );

      return `
        <article class="job-card" data-job-id="${escapeHTML(job.id)}">

          <div class="job-card-header">
            ${logo}

            <div>
              <div class="job-card-company-name">
                ${escapeHTML(companyName)}
              </div>
            </div>
          </div>

          <h3 class="job-card-title">
            ${escapeHTML(title)}
          </h3>

          <div class="job-card-category">
            ${escapeHTML(categoryText)}
          </div>

          <div class="job-card-details">
            ${locationText
              ? `<span>${escapeHTML(locationText)}</span>`
              : ""}

            ${typeText
              ? `<span>${escapeHTML(typeText)}</span>`
              : ""}
          </div>

          <div class="job-card-salary">
            ${escapeHTML(formatSalary(job))}
          </div>

          ${publishedDate
            ? `<div class="job-card-date">${escapeHTML(publishedDate)}</div>`
            : ""}

        </article>
      `;
    }).join("");
  }

  /* =====================================================
     SEARCH & FILTER EVENTS
  ===================================================== */

  if (searchButton) {
    searchButton.addEventListener("click", renderJobs);
  }

  [
    keywordInput,
    locationInput,
    categoryInput,
    typeInput
  ].forEach(input => {
    if (!input) return;

    input.addEventListener("input", renderJobs);
    input.addEventListener("change", renderJobs);
  });

  /* =====================================================
     CENTRAL SYNC UPDATE LISTENER
  ===================================================== */

  window.addEventListener(
    "kerjivaMalaysiaSyncUpdated",
    function (event) {
      if (
        !event.detail?.key ||
        event.detail.key === CACHE_KEY
      ) {
        loadJobs();
      }
    }
  );

  /* =====================================================
     INITIAL LOAD
  ===================================================== */

  loadJobs();

});

