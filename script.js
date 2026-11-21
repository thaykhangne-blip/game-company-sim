(() => {
  const setup = document.getElementById('setup');
  const dashboard = document.getElementById('dashboard');
  const form = document.getElementById('company-form');
  const yearSelect = document.getElementById('founding-year');
  const error = document.getElementById('error');
  const currentYear = new Date().getFullYear();

  for (let year = currentYear; year >= 1998; year--) {
    const option = document.createElement('option');
    option.value = String(year);
    option.textContent = String(year);
    yearSelect.appendChild(option);
  }

  function launch(company) {
    document.getElementById('dash-name').textContent = company.companyName;
    document.getElementById('dash-subtitle').textContent = `Founded in ${company.foundingYear} · ${company.ceoName}, Founder & CEO`;
    document.getElementById('profile-ceo').textContent = company.ceoName;
    document.getElementById('profile-year').textContent = company.foundingYear;
    document.getElementById('seal-year').textContent = company.foundingYear;
    document.getElementById('year-chip').textContent = `YEAR ${company.foundingYear}`;
    document.getElementById('footer-company').textContent = company.companyName.toUpperCase();
    setup.classList.add('hidden');
    dashboard.classList.remove('hidden');
    document.title = `${company.companyName} | Gacha Studio`;
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    const company = {
      companyName: document.getElementById('company-name').value.trim(),
      foundingYear: Number(yearSelect.value),
      ceoName: document.getElementById('ceo-name').value.trim()
    };
    if (!company.companyName || !company.ceoName || !company.foundingYear) {
      error.textContent = 'Complete all three fields before establishing your company.';
      return;
    }
    if (company.foundingYear < 1998 || company.foundingYear > currentYear) {
      error.textContent = `Choose a year between 1998 and ${currentYear}.`;
      return;
    }
    error.textContent = '';
    try { localStorage.setItem('gachaStudioCompany', JSON.stringify(company)); } catch (_) {}
    launch(company);
  });

  document.getElementById('reset').addEventListener('click', () => {
    try { localStorage.removeItem('gachaStudioCompany'); } catch (_) {}
    dashboard.classList.add('hidden');
    setup.classList.remove('hidden');
    form.reset();
    yearSelect.value = String(currentYear);
    document.getElementById('company-name').focus();
    document.title = 'Gacha Studio | Company Simulator';
  });

  try {
    const saved = JSON.parse(localStorage.getItem('gachaStudioCompany') || 'null');
    if (saved && saved.companyName && saved.ceoName && saved.foundingYear) launch(saved);
  } catch (_) {}
})();