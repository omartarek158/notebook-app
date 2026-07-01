// ============================================================
// Notebook — Auth pages Helper (Cleaned for Laravel)
// ============================================================

const $ = (s) => document.querySelector(s);

// سبنا دالة الـ Toast عشان لو لارافيل بعت خطأ نظهره بشكل شيك
function toast(msg, type = "info") {
  const el = $("#toast");
  if (!el) return;
  el.textContent = msg;
  el.className = `toast show ${type === "error" ? "error" : ""}`;
  setTimeout(() => (el.className = "toast"), 3000); // زودنا الوقت لـ 3 ثواني للقراءة
}

// الكود ده بيراقب لو لارافيل رجع خطأ في الـ Validation يظهره في الـ Toast تلقائي
document.addEventListener("DOMContentLoaded", () => {
  // هنفحص لو السيرفر بعت رسالة خطأ (تقدر تهندلها من الـ Blade)
  const hasErrors = document.querySelector('.auth-errors-trigger');
  if (hasErrors) {
    toast(hasErrors.dataset.message, "error");
  }
});