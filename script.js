const root = document.documentElement;
root.classList.add("js-enabled");

const form = document.getElementById("carbonForm");
const resultValue = document.getElementById("resultValue");
const resultDelta = document.getElementById("resultDelta");
const resultLevel = document.getElementById("resultLevel");
const resultHint = document.getElementById("resultHint");
const treesInfo = document.getElementById("treesInfo");
const meterFill = document.getElementById("meterFill");
const actionCards = document.getElementById("actionCards");
const dietSelect = document.getElementById("diet");

const emissionFactors = {
  car: 0.192,
  bus: 0.089,
  electricity: 0.65,
  gas: 1.9,
  waste: 0.45
};

const categoryLabels = {
  transport: "transport",
  home: "energia w domu",
  food: "dieta",
  waste: "odpady"
};

let previousTotal = null;
let previousDietEmission = null;

const actionCatalog = [
  {
    id: "novy-las",
    title: "Posadź drzewa z Novy Las",
    description: "Wsparcie sadzenia drzew i realna kompensacja emisji CO₂ na terenie Polski.",
    icon: "forest",
    url: "https://novy-las.pl/",
    categories: ["transport", "home", "food", "waste"],
    baseScore: 60
  },
  {
    id: "sadzimy",
    title: "Dołącz do akcji #sadziMY",
    description: "Sprawdź aktualną edycję akcji i dołącz do sadzenia drzew z leśnikami.",
    icon: "park",
    url: "https://www.lasy.gov.pl/pl/informacje/aktualnosci",
    categories: ["transport", "home", "food", "waste"],
    baseScore: 55
  },
  {
    id: "czyste-powietrze",
    title: "Program Czyste Powietrze",
    description: "Dotacje na termomodernizację i wymianę źródeł ciepła, aby ograniczyć emisję.",
    icon: "home_work",
    url: "https://www.gov.pl/web/klimat/powietrze-czystepowietrze",
    categories: ["home"],
    baseScore: 42
  },
  {
    id: "moj-prad",
    title: "Mój Prąd",
    description: "Wsparcie mikroinstalacji PV i magazynów energii dla gospodarstw domowych.",
    icon: "solar_power",
    url: "https://mojprad.gov.pl/",
    categories: ["home"],
    baseScore: 38
  },
  {
    id: "operacja-rzeka",
    title: "Operacja Rzeka",
    description: "Wolontariat terenowy: sprzątanie rzek i terenów zielonych w lokalnych sztabach.",
    icon: "water",
    url: "https://operacjarzeka.pl/",
    categories: ["waste"],
    baseScore: 32
  },
  {
    id: "too-good",
    title: "Ratuj jedzenie z Too Good To Go",
    description: "Aplikacja pomagająca ograniczyć marnowanie żywności i związane z tym emisje.",
    icon: "lunch_dining",
    url: "https://www.toogoodtogo.com/pl",
    categories: ["food", "waste"],
    baseScore: 30
  }
];

function sanitizeNumber(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < 0) {
    return 0;
  }
  return numeric;
}

function updateDietDelta(currentDietEmission) {
  if (!resultDelta) {
    return;
  }

  if (previousDietEmission === null) {
    resultDelta.textContent = "Zmiana: -";
    resultDelta.className = "result-delta flat";
    previousDietEmission = currentDietEmission;
    return;
  }

  const delta = currentDietEmission - previousDietEmission;
  const absDelta = Math.abs(delta);
  const formattedDelta = absDelta >= 1 ? absDelta.toFixed(0) : absDelta.toFixed(2);

  if (delta > 0.000001) {
    resultDelta.textContent = `Zmiana: dieta +${formattedDelta} kg CO₂e / miesiąc`;
    resultDelta.className = "result-delta up";
  } else if (delta < -0.000001) {
    resultDelta.textContent = `Zmiana: dieta -${formattedDelta} kg CO₂e / miesiąc`;
    resultDelta.className = "result-delta down";
  } else {
    resultDelta.textContent = "Zmiana: -";
    resultDelta.className = "result-delta flat";
  }

  previousDietEmission = currentDietEmission;
}

function calculateFootprint(values) {
  const transport = values.carKm * emissionFactors.car * 4.33 + values.busKm * emissionFactors.bus * 4.33;
  const home = values.electricity * emissionFactors.electricity + values.gas * emissionFactors.gas;
  const food = values.diet;
  const waste = values.waste * emissionFactors.waste * 4.33;
  const total = transport + home + food + waste;

  return {
    transport,
    home,
    food,
    waste,
    total
  };
}

function footprintLevel(total) {
  if (total < 320) {
    return {
      text: "Poziom: niski",
      hint: "Świetny wynik. Utrzymujesz nawyki sprzyjające klimatowi.",
      color: "#2f6b3b"
    };
  }
  if (total < 700) {
    return {
      text: "Poziom: umiarkowany",
      hint: "Dobry kierunek. Spróbuj zmniejszyć emisje z transportu i energii.",
      color: "#b6782f"
    };
  }
  return {
    text: "Poziom: wysoki",
    hint: "Duży potencjał zmian. Zacznij od ograniczenia samochodu i oszczędzania energii.",
    color: "#943c2f"
  };
}

function updateResult(total) {
  const rounded = Math.round(total);
  if (resultDelta) {
    if (previousTotal === null) {
      resultDelta.textContent = "Zmiana: -";
      resultDelta.className = "result-delta flat";
    } else {
      const delta = total - previousTotal;
      const absDelta = Math.abs(delta);
      const formattedDelta = absDelta >= 1 ? absDelta.toFixed(1) : absDelta.toFixed(2);

      if (delta > 0.000001) {
        resultDelta.textContent = `Zmiana: wzrost +${formattedDelta} kg CO₂e`;
        resultDelta.className = "result-delta up";
      } else if (delta < -0.000001) {
        resultDelta.textContent = `Zmiana: spadek -${formattedDelta} kg CO₂e`;
        resultDelta.className = "result-delta down";
      } else {
        resultDelta.textContent = "Zmiana: -";
        resultDelta.className = "result-delta flat";
      }
    }
  }

  if (rounded === 0) {
    resultValue.textContent = "0";
    resultLevel.textContent = "Poziom: startowy";
    resultLevel.style.color = "#4f5c4f";
    resultHint.textContent = "Wpisz dane, a wynik będzie aktualizował się na bieżąco.";
    meterFill.style.width = "0%";
    meterFill.style.background = "#b6782f";
    treesInfo.textContent = "Przy wyniku 0 nie potrzebujesz kompensacji emisji.";
    previousTotal = total;
    return;
  }

  const level = footprintLevel(rounded);
  const meterPercent = Math.min((rounded / 1200) * 100, 100);
  const treesPerMonth = Math.ceil(rounded / 21);

  resultValue.textContent = String(rounded);
  resultLevel.textContent = level.text;
  resultLevel.style.color = level.color;
  resultHint.textContent = level.hint;
  meterFill.style.width = `${meterPercent}%`;
  meterFill.style.background = level.color;
  treesInfo.textContent = `Aby zrównoważyć taki miesięczny ślad, potrzeba około ${treesPerMonth} drzew.`;
  previousTotal = total;
}

function getTopCategories(components) {
  return Object.entries({
    transport: components.transport,
    home: components.home,
    food: components.food,
    waste: components.waste
  })
    .sort((left, right) => right[1] - left[1])
    .map(([name]) => name);
}

function rankActions(components) {
  return actionCatalog
    .map((action) => {
      const categoryScore = action.categories.reduce((sum, category) => {
        return sum + (components[category] || 0);
      }, 0);

      return {
        ...action,
        score: action.baseScore + categoryScore
      };
    })
    .sort((left, right) => right.score - left.score)
    .slice(0, 6);
}

function renderActions(components) {
  if (!actionCards) {
    return;
  }

  const ranked = rankActions(components);

  actionCards.innerHTML = ranked
    .map((action) => {
      return `
        <article class="action-card" role="listitem">
          <div class="action-top">
            <span class="material-symbols-outlined action-icon" aria-hidden="true">${action.icon}</span>
            <h3>${action.title}</h3>
          </div>
          <p>${action.description}</p>
          <a class="action-link" href="${action.url}" target="_blank" rel="noopener noreferrer">Przejdź do programu</a>
        </article>
      `;
    })
    .join("");
}

function getFormValues() {
  const formData = new FormData(form);
  return {
    carKm: sanitizeNumber(formData.get("carKm")),
    busKm: sanitizeNumber(formData.get("busKm")),
    electricity: sanitizeNumber(formData.get("electricity")),
    gas: sanitizeNumber(formData.get("gas")),
    diet: sanitizeNumber(formData.get("diet")),
    waste: sanitizeNumber(formData.get("waste"))
  };
}

function calculateFromForm() {
  const values = getFormValues();
  const components = calculateFootprint(values);
  updateResult(components.total);
  renderActions(components);
}

function initRevealOnScroll() {
  const sections = document.querySelectorAll(".section-reveal");
  if (!("IntersectionObserver" in window)) {
    sections.forEach((section) => section.classList.add("in-view"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12
    }
  );

  sections.forEach((section) => observer.observe(section));
}

function initTiltCards() {
  const cards = document.querySelectorAll(".tilt-card");
  cards.forEach((card) => {
    card.addEventListener("mousemove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((centerY - y) / centerY) * 5;
      const rotateY = ((x - centerX) / centerX) * 5;
      card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "rotateX(0deg) rotateY(0deg) translateY(0px)";
    });
  });
}

function parseNumericLimit(rawValue, fallback) {
  if (rawValue === "" || rawValue === null || rawValue === undefined) {
    return fallback;
  }
  const parsed = Number(rawValue);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeStepValue(value, step) {
  const stepText = String(step);
  const decimals = stepText.includes(".") ? stepText.split(".")[1].length : 0;
  if (decimals === 0) {
    return String(Math.round(value));
  }
  return String(value.toFixed(decimals));
}

function initSteppers() {
  const stepButtons = document.querySelectorAll(".stepper-btn[data-step-target]");

  stepButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const targetId = button.dataset.stepTarget;
      const input = document.getElementById(targetId);
      if (!(input instanceof HTMLInputElement)) {
        return;
      }

      const delta = parseNumericLimit(button.dataset.step, 0);
      const current = parseNumericLimit(input.value, 0);
      const min = parseNumericLimit(input.min, 0);
      const max = parseNumericLimit(input.max, Number.POSITIVE_INFINITY);
      const step = parseNumericLimit(input.step, 1);

      let next = current + delta;
      if (next < min) {
        next = min;
      }
      if (next > max) {
        next = max;
      }

      input.value = normalizeStepValue(next, step);
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
  });
}

function initEarthModel() {
  const model = document.getElementById("earthModel");
  const fallback = document.getElementById("earthFallback");
  const container = model ? model.closest(".hero-visual") : null;
  if (!model || !fallback || !container) {
    return;
  }

  let loaded = false;
  let switched = false;

  function switchToFallback() {
    if (switched || loaded) {
      return;
    }
    switched = true;
    container.classList.add("use-fallback");
  }

  model.addEventListener("load", () => {
    loaded = true;
    container.classList.remove("use-fallback");
  });

  model.addEventListener(
    "dblclick",
    (event) => {
      event.preventDefault();
      event.stopPropagation();
    },
    { capture: true }
  );

  model.addEventListener("error", switchToFallback);

  window.setTimeout(() => {
    if (!loaded) {
      switchToFallback();
    }
  }, 7000);
}

function initPage() {
  if (!form || !resultValue || !resultLevel || !resultHint || !treesInfo || !meterFill) {
    return;
  }

  form.addEventListener("input", calculateFromForm);
  form.addEventListener("change", calculateFromForm);
  if (dietSelect) {
    dietSelect.addEventListener("change", () => {
      const selectedDiet = sanitizeNumber(dietSelect.value);
      updateDietDelta(selectedDiet);
    });
  }

  initSteppers();
  initEarthModel();
  initRevealOnScroll();
  initTiltCards();
  calculateFromForm();
  if (dietSelect) {
    previousDietEmission = sanitizeNumber(dietSelect.value);
  }
  if (resultDelta) {
    resultDelta.textContent = "Zmiana: -";
    resultDelta.className = "result-delta flat";
  }
}

initPage();
