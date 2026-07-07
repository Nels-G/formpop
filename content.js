/* FormPop — content.js
 * Moteur de remplissage automatique de formulaires.
 * Ré-injecté à chaque clic : toutes les données sont régénérées aléatoirement,
 * donc recliquer sur "Remplir" change bien les valeurs.
 * 100% local — aucune requête réseau, aucune donnée envoyée où que ce soit.
 */

(() => {
  // ---------- Données factices ----------
  const FIRST_NAMES = [
    "Camille", "Lucas", "Emma", "Hugo", "Léa", "Louis", "Chloé", "Nathan",
    "Manon", "Gabriel", "Sarah", "Adam", "Inès", "Raphaël", "Zoé", "Jules",
    "Alice", "Arthur", "Lina", "Noah", "Kokou", "Ama", "Kossi", "Afi",
    "Yawo", "Essi",
  ];
  const LAST_NAMES = [
    "Martin", "Bernard", "Dubois", "Thomas", "Robert", "Richard", "Petit",
    "Durand", "Leroy", "Moreau", "Simon", "Laurent", "Lefebvre", "Michel",
    "Garcia", "David", "Bertrand", "Roux", "Vincent", "Fournier",
    "Gnassingbé", "Amégan", "Kodjo", "Adjovi",
  ];
  const COMPANIES = [
    "Nova Studio", "Bluewave Tech", "Pixel Forge", "Atlas Labs", "Nordic Digital",
    "GreenLeaf SARL", "Vertex Solutions", "Lumière Corp", "Cirrus Group", "Onyx Media",
  ];
  const STREETS = [
    "Rue de la République", "Avenue des Champs", "Rue du Commerce", "Boulevard Voltaire",
    "Rue Victor Hugo", "Allée des Tilleuls", "Rue de la Paix", "Impasse des Lilas",
    "Rue du Grand Marché", "Avenue de la Libération",
  ];
  // Villes : mix France + Togo (le Togo est mis en avant car public cible probable)
  const CITIES = [
    "Lomé", "Kara", "Sokodé", "Kpalimé", "Atakpamé", "Dapaong", "Tsévié", "Aného",
    "Paris", "Lyon", "Marseille", "Bordeaux", "Lille",
  ];
  const TOGO_REGIONS = ["Maritime", "Plateaux", "Centrale", "Kara", "Savanes"];
  const NEIGHBORHOODS = [
    "Centre-ville", "Bè", "Tokoin", "Nyékonakpoè", "Adidogomé", "Agoè",
    "Hédzranawoé", "Kodjoviakopé", "Quartier Administratif", "Doulassamé",
  ];
  const RENTAL_CATEGORIES = ["Appartement", "Studio", "Villa", "Chambre meublée", "Maison"];
  const COUNTRIES = ["Togo", "France", "Belgique", "Bénin", "Ghana", "Côte d'Ivoire"];
  const EMAIL_DOMAINS = ["example.com", "mail-test.io", "demo-inbox.net", "testmail.dev"];
  const LOREM_WORDS = (
    "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod " +
    "tempor incididunt ut labore et dolore magna aliqua ut enim ad minim " +
    "veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea " +
    "commodo consequat duis aute irure dolor in reprehenderit voluptate velit " +
    "esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat"
  ).split(" ");

  // ---------- Utilitaires aléatoires ----------
  const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  function stripAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  function randomFullName() {
    return { first: rand(FIRST_NAMES), last: rand(LAST_NAMES) };
  }

  function randomEmail(name) {
    const base = name
      ? stripAccents(`${name.first}.${name.last}`).toLowerCase()
      : stripAccents(`${rand(FIRST_NAMES)}.${rand(LAST_NAMES)}`).toLowerCase();
    return `${base}${randInt(1, 999)}@${rand(EMAIL_DOMAINS)}`;
  }

  function randomPhone() {
    const rest = Array.from({ length: 4 }, () => randInt(10, 99)).join(" ");
    return `0${randInt(1, 7)} ${rest}`;
  }

  function randomPassword() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
    let out = "";
    for (let i = 0; i < 14; i++) out += chars[randInt(0, chars.length - 1)];
    return out;
  }

  function randomAddress() {
    return `${randInt(1, 200)} ${rand(STREETS)}`;
  }

  function randomZip() {
    return String(randInt(10000, 98000));
  }

  function randomDateISO() {
    const start = new Date(1975, 0, 1).getTime();
    const end = Date.now();
    const d = new Date(start + Math.random() * (end - start));
    return d.toISOString().slice(0, 10);
  }

  function randomHexColor() {
    return (
      "#" +
      Math.floor(Math.random() * 0xffffff)
        .toString(16)
        .padStart(6, "0")
    );
  }

  function loremSentence(wordCount) {
    const words = Array.from({ length: wordCount }, () => rand(LOREM_WORDS));
    const sentence = words.join(" ");
    return sentence.charAt(0).toUpperCase() + sentence.slice(1) + ".";
  }

  function generateText(long) {
    if (long) {
      const sentences = Array.from({ length: randInt(3, 5) }, () => loremSentence(randInt(8, 14)));
      return sentences.join(" ");
    }
    return loremSentence(randInt(5, 9));
  }

  // ---------- Injection compatible React / Vue / Angular ----------
  function nativeSetter(element, propName) {
    const proto = Object.getPrototypeOf(element);
    const descriptor = Object.getOwnPropertyDescriptor(proto, propName);
    return descriptor && descriptor.set ? descriptor.set : null;
  }

  function setElementValue(element, value) {
    const setter = nativeSetter(element, "value");
    if (setter) {
      setter.call(element, value);
    } else {
      element.value = value;
    }
    fireEvents(element);
  }

  function fireEvents(element) {
    ["input", "change", "blur"].forEach((type) => {
      const evt = new Event(type, { bubbles: true, cancelable: true });
      element.dispatchEvent(evt);
    });
  }

  // ---------- Détection du type de champ ----------
  function looksLikeLabel(elm) {
    if (!elm || !elm.textContent) return false;
    const text = elm.textContent.trim();
    if (!text || text.length > 60) return false;
    const tag = elm.tagName.toLowerCase();
    if (tag === "label") return true;
    if (["span", "div", "p", "small", "strong"].includes(tag) && !elm.querySelector("input,select,textarea,button")) {
      return true;
    }
    return false;
  }

  function getAssociatedLabel(el) {
    // 1. <label for="...">
    if (el.id) {
      const lbl = document.querySelector(`label[for="${CSS.escape(el.id)}"]`);
      if (lbl) return lbl.textContent || "";
    }
    // 2. wrapping <label>
    const parentLabel = el.closest("label");
    if (parentLabel) return parentLabel.textContent || "";

    // 3. aria-labelledby
    const labelledBy = el.getAttribute("aria-labelledby");
    if (labelledBy) {
      const texts = labelledBy
        .split(/\s+/)
        .map((id) => document.getElementById(id)?.textContent || "")
        .filter(Boolean);
      if (texts.length) return texts.join(" ");
    }

    // 4. Remonte l'arbre à la recherche d'un élément "label-like" juste avant
    //    le champ (motif fréquent: <label>Ville</label><div><input/></div>)
    let node = el;
    for (let depth = 0; depth < 4 && node; depth++) {
      let sib = node.previousElementSibling;
      while (sib) {
        if (looksLikeLabel(sib)) return sib.textContent;
        sib = sib.previousElementSibling;
      }
      node = node.parentElement;
    }
    return "";
  }

  function buildHaystack(el) {
    const label = getAssociatedLabel(el);
    return [
      el.name,
      el.id,
      el.placeholder,
      el.getAttribute("aria-label"),
      label,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
  }

  // ---------- Moteur de scoring sémantique local (mini-IA, 100% offline) ----------
  // Pas un réseau de neurones (impossible à embarquer sans télécharger de poids
  // externes), mais un vrai pas au-dessus des regex : dictionnaire de synonymes
  // multilingues + tokenisation intelligente + tolérance aux fautes de frappe.

  const AUTOCOMPLETE_MAP = {
    "given-name": "firstname",
    "family-name": "lastname",
    name: "fullname",
    email: "email",
    tel: "phone",
    "tel-national": "phone",
    "street-address": "address",
    "address-line1": "address",
    "address-line2": "address",
    "address-level2": "city",
    "address-level1": "region",
    "postal-code": "zip",
    country: "country",
    "country-name": "country",
    organization: "company",
    bday: "date",
    username: "username",
    "new-password": "password",
    "current-password": "password",
    url: "website",
  };

  const CATEGORY_SYNONYMS = {
    password: ["password", "mot de passe", "mdp", "passe", "passcode", "confirm password", "confirmer mot de passe"],
    email: ["email", "e mail", "courriel", "mail", "adresse mail", "adresse email"],
    phone: ["phone", "telephone", "mobile", "numero", "contact number", "whatsapp", "numero gestionnaire", "numero contact"],
    firstname: ["first name", "prenom", "given name", "fname", "forename"],
    lastname: ["last name", "nom de famille", "surname", "family name", "lname"],
    fullname: ["full name", "nom complet", "votre nom", "contact name", "nom du gestionnaire", "nom du proprietaire", "nom du contact"],
    username: ["username", "pseudo", "login", "identifiant", "handle"],
    neighborhood: ["quartier", "neighborhood", "neighbourhood", "district", "secteur"],
    region: ["region", "province", "etat", "departement"],
    category: ["categorie", "category", "type de bien", "type hebergement", "type logement", "type"],
    price: ["prix", "price", "tarif", "montant", "cout", "budget", "salaire", "salary", "loyer", "rate", "fee", "nuit"],
    company: ["company", "societe", "organisation", "organization", "entreprise", "gere par", "nom entreprise", "raison sociale"],
    zip: ["zip", "postal", "code postal", "cp"],
    city: ["city", "ville", "commune", "town"],
    country: ["country", "pays", "nation"],
    address: ["address", "adresse", "street", "rue", "localisation"],
    age: ["age"],
    website: ["website", "site web", "url", "lien web"],
    date: ["date", "naissance", "birthday", "anniversaire"],
    longtext: ["message", "comment", "commentaire", "description", "bio", "details", "notes", "a propos"],
  };

  function normalizeText(str) {
    return stripAccents(str)
      // sépare camelCase -> "camel Case"
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      // remplace séparateurs par des espaces
      .replace(/[_\-./]+/g, " ")
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function tokenize(str) {
    const normalized = normalizeText(str);
    return normalized.length ? normalized.split(" ") : [];
  }

  function levenshtein(a, b) {
    if (a === b) return 0;
    const m = a.length;
    const n = b.length;
    if (m === 0) return n;
    if (n === 0) return m;
    const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
      }
    }
    return dp[m][n];
  }

  const STOPWORDS = new Set([
    "de", "du", "des", "le", "la", "les", "un", "une", "et", "a", "au", "aux",
    "the", "of", "and", "for", "your", "votre", "vos", "ton", "ta",
  ]);

  function tokensMatch(a, b) {
    if (STOPWORDS.has(a) || STOPWORDS.has(b)) return false;
    if (a === b) return true;
    if (a.length >= 4 && b.length >= 4 && levenshtein(a, b) <= 1) return true;
    return false;
  }

  function scorePhrase(haystackTokens, phrase) {
    const phraseTokens = normalizeText(phrase)
      .split(" ")
      .filter((t) => t && !STOPWORDS.has(t));
    if (phraseTokens.length === 0) return 0;

    // Synonyme d'un seul mot : match direct (avec tolérance aux fautes) sur un token
    if (phraseTokens.length === 1) {
      const pt = phraseTokens[0];
      if (haystackTokens.some((ht) => ht === pt)) return 2;
      if (haystackTokens.some((ht) => tokensMatch(ht, pt))) return 1;
      return 0;
    }

    // Synonyme à plusieurs mots : on exige la phrase entière telle quelle,
    // ou au minimum TOUS ses mots présents — jamais un seul mot générique isolé
    // (sinon "adresse du bien" matcherait "type de bien" via le seul mot "bien").
    const haystackJoined = " " + haystackTokens.join(" ") + " ";
    if (haystackJoined.includes(" " + phraseTokens.join(" ") + " ")) return 4;
    const allPresent = phraseTokens.every((pt) => haystackTokens.some((ht) => tokensMatch(ht, pt)));
    return allPresent ? 2 : 0;
  }

  function detectCategory(el) {
    const type = (el.type || "").toLowerCase();
    if (type === "email") return "email";
    if (type === "tel") return "phone";
    if (type === "url") return "website";
    if (type === "password") return "password";

    // Priorité absolue : attribut autocomplete standard (info fiable à 100%)
    const autocompleteToken = (el.autocomplete || "").toLowerCase().split(" ").pop();
    if (autocompleteToken && AUTOCOMPLETE_MAP[autocompleteToken]) {
      return AUTOCOMPLETE_MAP[autocompleteToken];
    }

    const haystackRaw = buildHaystack(el);
    const haystackTokens = tokenize(haystackRaw);
    if (!haystackTokens.length) return "generic";

    let bestCategory = "generic";
    let bestScore = 0;

    for (const [category, synonyms] of Object.entries(CATEGORY_SYNONYMS)) {
      let categoryScore = 0;
      for (const phrase of synonyms) {
        categoryScore = Math.max(categoryScore, scorePhrase(haystackTokens, phrase));
      }
      if (categoryScore > bestScore) {
        bestScore = categoryScore;
        bestCategory = category;
      }
    }

    // Seuil minimal de confiance : au moins un token reconnu
    return bestScore >= 1 ? bestCategory : "generic";
  }

  // ---------- Génération de fichiers factices ----------
  function makeMinimalPdfBlob() {
    const pdf = `%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 200 200]/Resources<</Font<</F1 4 0 R>>>>/Contents 5 0 R>>endobj
4 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj
5 0 obj<</Length 64>>stream
BT /F1 14 Tf 20 100 Td (FormPop - Document de test) Tj ET
endstream
endobj
xref
0 6
0000000000 65535 f 
trailer<</Size 6/Root 1 0 R>>
%%EOF`;
    return new Blob([pdf], { type: "application/pdf" });
  }

  function makeImageBlob() {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      canvas.width = 300;
      canvas.height = 200;
      const ctx = canvas.getContext("2d");
      const grad = ctx.createLinearGradient(0, 0, 300, 200);
      grad.addColorStop(0, "#0a84ff");
      grad.addColorStop(1, "#5856d6");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 300, 200);
      ctx.fillStyle = "rgba(255,255,255,0.95)";
      ctx.font = "bold 20px sans-serif";
      ctx.fillText("FormPop", 90, 95);
      ctx.font = "12px sans-serif";
      ctx.fillText("sample-image.png", 78, 118);
      canvas.toBlob((blob) => resolve(blob), "image/png");
    });
  }

  function makeTextBlob() {
    return new Blob(["Fichier de test généré par FormPop.\n"], { type: "text/plain" });
  }

  async function fileFor(input) {
    const accept = (input.getAttribute("accept") || "").toLowerCase();
    if (accept.includes("pdf")) {
      return new File([makeMinimalPdfBlob()], "test-document.pdf", { type: "application/pdf" });
    }
    if (accept.includes("text") || accept.includes(".txt")) {
      return new File([makeTextBlob()], "sample-file.txt", { type: "text/plain" });
    }
    const blob = await makeImageBlob();
    return new File([blob], "sample-image.png", { type: "image/png" });
  }

  async function fillFileInput(input) {
    const dt = new DataTransfer();
    const first = await fileFor(input);
    dt.items.add(first);
    if (input.multiple) {
      const second = await fileFor(input);
      dt.items.add(second);
    }
    input.files = dt.files;
    fireEvents(input);
  }

  // ---------- Remplissage par catégorie ----------
  function valueForCategory(category, opts, context) {
    switch (category) {
      case "email":
        return randomEmail(context.name);
      case "password":
        return randomPassword();
      case "phone":
        return randomPhone();
      case "firstname":
        context.name = context.name || randomFullName();
        return context.name.first;
      case "lastname":
        context.name = context.name || randomFullName();
        return context.name.last;
      case "fullname":
        context.name = context.name || randomFullName();
        return `${context.name.first} ${context.name.last}`;
      case "username": {
        context.name = context.name || randomFullName();
        return stripAccents(`${context.name.first}${randInt(1, 999)}`).toLowerCase();
      }
      case "company":
        return rand(COMPANIES);
      case "address":
        return randomAddress();
      case "city":
        return rand(CITIES);
      case "region":
        return rand(TOGO_REGIONS);
      case "neighborhood":
        return rand(NEIGHBORHOODS);
      case "category":
        return rand(RENTAL_CATEGORIES);
      case "price":
        return String(randInt(20, 300) * 1000);
      case "zip":
        return randomZip();
      case "country":
        return rand(COUNTRIES);
      case "age":
        return String(randInt(18, 80));
      case "website":
        return `https://www.${stripAccents(rand(COMPANIES)).toLowerCase().replace(/\s+/g, "-")}.com`;
      case "date":
        return randomDateISO();
      case "color":
        return randomHexColor();
      case "longtext":
        return generateText(true);
      case "generic":
      default:
        return opts.longText ? generateText(true) : generateText(false);
    }
  }

  function fillNumberOrRange(el) {
    const h = buildHaystack(el);
    const hasMin = el.min !== "" && !isNaN(parseFloat(el.min));
    const hasMax = el.max !== "" && !isNaN(parseFloat(el.max));

    let min = hasMin ? parseFloat(el.min) : null;
    let max = hasMax ? parseFloat(el.max) : null;

    if (min === null && max === null) {
      if (/age\b|âge/.test(h)) {
        min = 18;
        max = 80;
      } else if (/prix|price|tarif|montant|coût|cout|budget|salaire|salary|loyer|nuit/.test(h)) {
        min = 5000;
        max = 150000;
      } else {
        min = 1;
        max = 100;
      }
    } else {
      if (min === null) min = 0;
      if (max === null) max = min + 100;
    }

    const step = el.step && !isNaN(parseFloat(el.step)) && el.step !== "any" ? parseFloat(el.step) : 1;
    const steps = Math.floor((max - min) / step);
    const value = min + randInt(0, Math.max(steps, 0)) * step;
    setElementValue(el, String(Math.round(value * 100) / 100));
  }

  function fillSelect(el) {
    const options = Array.from(el.options).filter((o) => !o.disabled && o.value !== "");
    if (options.length === 0) return false;
    const choice = rand(options);
    const setter = nativeSetter(el, "value");
    if (setter) {
      setter.call(el, choice.value);
    } else {
      el.value = choice.value;
    }
    fireEvents(el);
    return true;
  }

  function isVisible(el) {
    if (!(el instanceof HTMLElement)) return false;
    const style = window.getComputedStyle(el);
    return style.display !== "none" && style.visibility !== "hidden" && el.offsetParent !== null;
  }

  // ---------- Sélecteurs personnalisés type combobox/autocomplete ----------
  async function tryComboboxSelect(el) {
    const role = (el.getAttribute("role") || "").toLowerCase();
    const hasPopup = el.getAttribute("aria-haspopup");
    const isAutocomplete = el.hasAttribute("aria-autocomplete");
    if (role !== "combobox" && !hasPopup && !isAutocomplete) return false;

    el.focus();
    el.click();
    await sleep(180);

    let options = Array.from(document.querySelectorAll('[role="option"]')).filter(isVisible);

    if (!options.length) {
      // Certains composants n'ouvrent/filtrent qu'après une frappe
      setElementValue(el, "a");
      await sleep(220);
      options = Array.from(document.querySelectorAll('[role="option"]')).filter(isVisible);
    }

    if (options.length) {
      rand(options).click();
      await sleep(30);
      return true;
    }

    // Rien trouvé : referme proprement sans laisser un dropdown ouvert
    el.blur();
    return false;
  }

  // ---------- Fonction principale exposée au popup ----------
  window.__formPopRun = async function (opts) {
    const settings = Object.assign({ includeFiles: true, longText: false, fillChoices: true }, opts || {});
    const fields = Array.from(document.querySelectorAll("input, textarea, select"));
    const context = { name: null };
    const handledRadioGroups = new Set();
    let filledCount = 0;
    const fileJobs = [];

    for (const el of fields) {
      if (el.disabled) continue;
      if (!isVisible(el)) continue;

      const tag = el.tagName.toLowerCase();
      const type = (el.type || "text").toLowerCase();

      if (tag === "select") {
        if (fillSelect(el)) filledCount++;
        continue;
      }

      if (tag === "textarea") {
        if (el.readOnly) continue;
        setElementValue(el, generateText(settings.longText));
        filledCount++;
        continue;
      }

      // input elements
      switch (type) {
        case "hidden":
        case "submit":
        case "button":
        case "reset":
        case "image":
          continue;

        case "checkbox": {
          if (!settings.fillChoices) continue;
          const shouldCheck = Math.random() > 0.4;
          if (el.checked !== shouldCheck) el.click();
          filledCount++;
          continue;
        }

        case "radio": {
          if (!settings.fillChoices) continue;
          const groupKey = el.name || `noname-${el.id}`;
          if (handledRadioGroups.has(groupKey)) continue;
          handledRadioGroups.add(groupKey);
          const group = document.querySelectorAll(
            `input[type="radio"][name="${CSS.escape(el.name || "")}"]`
          );
          const candidates = el.name ? Array.from(group) : [el];
          const chosen = rand(candidates.filter((r) => !r.disabled));
          if (chosen) {
            if (!chosen.checked) chosen.click();
            filledCount++;
          }
          continue;
        }

        case "file": {
          if (!settings.includeFiles) continue;
          fileJobs.push(fillFileInput(el));
          filledCount++;
          continue;
        }

        case "color": {
          if (el.readOnly) continue;
          setElementValue(el, randomHexColor());
          filledCount++;
          continue;
        }

        case "date":
        case "datetime-local":
        case "month":
        case "week": {
          if (el.readOnly) continue;
          setElementValue(el, randomDateISO());
          filledCount++;
          continue;
        }

        case "number":
        case "range": {
          if (el.readOnly) continue;
          fillNumberOrRange(el);
          filledCount++;
          continue;
        }

        default: {
          if (el.readOnly) continue;

          const handledByCombobox = await tryComboboxSelect(el);
          if (handledByCombobox) {
            filledCount++;
            continue;
          }

          const category = detectCategory(el);
          const value = valueForCategory(category, settings, context);
          setElementValue(el, value);
          filledCount++;
          continue;
        }
      }
    }

    if (fileJobs.length) {
      await Promise.all(fileJobs);
    }

    return filledCount;
  };
})();
