
/* =====================================================
   KERJIVA MALAYSIA
   LANGUAGE SWITCHER
   ===================================================== */

(function () {
  "use strict";

  const LANGUAGE_STORAGE_KEY = "kerjivaMalaysiaLanguage";

  const SUPPORTED_LANGUAGES = ["en", "ms"];

  function getSavedLanguage() {
    const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);

    return SUPPORTED_LANGUAGES.includes(savedLanguage)
      ? savedLanguage
      : "en";
  }

  function setActiveLanguage(language) {
    document.querySelectorAll(".language-btn").forEach(function (button) {
      const isActive = button.dataset.language === language;

      button.classList.toggle("active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
  }

  function changeLanguage(language) {
    if (!SUPPORTED_LANGUAGES.includes(language)) {
      return;
    }

    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);

    document.documentElement.lang = language;

    setActiveLanguage(language);

    window.currentKerjivaLanguage = language;

    document.dispatchEvent(
      new CustomEvent("kerjivaLanguageChanged", {
        detail: { language: language }
      })
    );
  }

  document.addEventListener("DOMContentLoaded", function () {
    const initialLanguage = getSavedLanguage();

    changeLanguage(initialLanguage);

    document.querySelectorAll(".language-btn").forEach(function (button) {
      button.addEventListener("click", function () {
        changeLanguage(button.dataset.language);
      });
    });
  });

})();

