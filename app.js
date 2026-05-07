const STORAGE_KEY = "activationAccessData.v1";
const DEVICE_ID_KEY = "activationAccessDeviceId.v1";
const ADMIN_TOKEN_KEY = "activationAdminToken.v1";
const DEFAULT_ADMIN_PASSWORD = "ADMIN-2026";
const DAY_MS = 24 * 60 * 60 * 1000;
const SERIAL_INSTALL_DURATION_MS = 2 * 60 * 1000;
const MIN_FINAL_LOADING_MINUTES = 60;
const MAX_FINAL_LOADING_MINUTES = 80;
const ACTION_DELAY_MIN_MS = 2000;
const ACTION_DELAY_MAX_MS = 5000;
const FINAL_PHASE_MINUTES = 10;
const FINAL_PHASE_MESSAGES = [
  "10 Minute Security Protection Checking",
  "10 Minute Device Module Checking",
  "10 Minute Firewall Checking",
  "10 Minute Firewall and Firmware Initialization Checking",
  "10 Minute Web Activation Checking",
  "10 Minute All Function and Feature Checking",
  "10 Minute Device Module Final Checking",
  "10 Minute Access Stability Checking"
];

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

const deviceId = getOrCreateDeviceId();
let appData = loadData();
let activePackageId = null;
let activeTimer = null;
let countdownTimer = null;
let adminAuthenticated = false;
let adminToken = sessionStorage.getItem(ADMIN_TOKEN_KEY) || "";
let backendOnline = false;
let saveQueue = Promise.resolve();

const elements = {
  userView: $("#userView"),
  adminView: $("#adminView"),
  loginView: $("#loginView"),
  dashboardView: $("#dashboardView"),
  loginForm: $("#loginForm"),
  loginPassword: $("#loginPassword"),
  togglePasswordButton: $("#togglePasswordButton"),
  contactAdminLoginButton: $("#contactAdminLoginButton"),
  loginMessage: $("#loginMessage"),
  logoutButton: $("#logoutButton"),
  dashboardTitle: $("#dashboardTitle"),
  dashboardSubtitle: $("#dashboardSubtitle"),
  packageName: $("#packageName"),
  packageExpiry: $("#packageExpiry"),
  packageStatus: $("#packageStatus"),
  dashboardDeviceName: $("#dashboardDeviceName"),
  deviceDetails: $("#deviceDetails"),
  dashboardLegalInfo: $("#dashboardLegalInfo"),
  dashboardPackageDetails: $("#dashboardPackageDetails"),
  featureCount: $("#featureCount"),
  dashboardFeatures: $("#dashboardFeatures"),
  featureActionMessage: $("#featureActionMessage"),
  freeFireButton: $("#freeFireButton"),
  freeFireMaxButton: $("#freeFireMaxButton"),
  gameInjectMessage: $("#gameInjectMessage"),
  subscriptionCountdown: $("#subscriptionCountdown"),
  subscriptionCountdownText: $("#subscriptionCountdownText"),
  installState: $("#installState"),
  startInstallButton: $("#startInstallButton"),
  contactButton: $("#contactButton"),
  contactMessage: $("#contactMessage"),
  activationStage: $("#activationStage"),
  installStart: $("#installStart"),
  activationCodeOutput: $("#activationCodeOutput"),
  copyActivationButton: $("#copyActivationButton"),
  serialForm: $("#serialForm"),
  serialInput: $("#serialInput"),
  serialMessage: $("#serialMessage"),
  serialVerifiedPanel: $("#serialVerifiedPanel"),
  activationInstallButton: $("#activationInstallButton"),
  progressStage: $("#progressStage"),
  progressTitle: $("#progressTitle"),
  progressStatus: $("#progressStatus"),
  mainProgressBar: $("#mainProgressBar"),
  mainProgressPercent: $("#mainProgressPercent"),
  webCodeStage: $("#webCodeStage"),
  webCodeForm: $("#webCodeForm"),
  webCodeInput: $("#webCodeInput"),
  webCodeMessage: $("#webCodeMessage"),
  certificateStage: $("#certificateStage"),
  certificateForm: $("#certificateForm"),
  certificateInput: $("#certificateInput"),
  certificateMessage: $("#certificateMessage"),
  finalStage: $("#finalStage"),
  finalProgressStatus: $("#finalProgressStatus"),
  finalProgressBar: $("#finalProgressBar"),
  finalProgressPercent: $("#finalProgressPercent"),
  successStage: $("#successStage"),
  successMessage: $("#successMessage"),
  restartFlowButton: $("#restartFlowButton"),
  adminSettingsForm: $("#adminSettingsForm"),
  adminPasswordInput: $("#adminPasswordInput"),
  adminContactLabel: $("#adminContactLabel"),
  adminContactValue: $("#adminContactValue"),
  adminContactMode: $("#adminContactMode"),
  adminSettingsMessage: $("#adminSettingsMessage"),
  adminLogoutButton: $("#adminLogoutButton"),
  resetDemoButton: $("#resetDemoButton"),
  packageForm: $("#packageForm"),
  packageFormTitle: $("#packageFormTitle"),
  packageId: $("#packageId"),
  pkgName: $("#pkgName"),
  pkgPassword: $("#pkgPassword"),
  pkgValidity: $("#pkgValidity"),
  customValidityWrap: $("#customValidityWrap"),
  pkgCustomDays: $("#pkgCustomDays"),
  pkgStatusInput: $("#pkgStatusInput"),
  pkgSerial: $("#pkgSerial"),
  pkgDeviceName: $("#pkgDeviceName"),
  pkgActivationMode: $("#pkgActivationMode"),
  pkgActivationCode: $("#pkgActivationCode"),
  pkgWebCode: $("#pkgWebCode"),
  pkgCertificate: $("#pkgCertificate"),
  pkgContact: $("#pkgContact"),
  pkgLegalInfo: $("#pkgLegalInfo"),
  pkgPackageDetails: $("#pkgPackageDetails"),
  pkgLoadingPreset: $("#pkgLoadingPreset"),
  customLoadingWrap: $("#customLoadingWrap"),
  pkgCustomLoading: $("#pkgCustomLoading"),
  pkgFinalMessage: $("#pkgFinalMessage"),
  featurePicker: $("#featurePicker"),
  savePackageButton: $("#savePackageButton"),
  packageFormMessage: $("#packageFormMessage"),
  clearPackageFormButton: $("#clearPackageFormButton"),
  featureForm: $("#featureForm"),
  featureFormTitle: $("#featureFormTitle"),
  featureId: $("#featureId"),
  featureName: $("#featureName"),
  featureIcon: $("#featureIcon"),
  featurePhoto: $("#featurePhoto"),
  featureDescription: $("#featureDescription"),
  featureStatus: $("#featureStatus"),
  saveFeatureButton: $("#saveFeatureButton"),
  featureFormMessage: $("#featureFormMessage"),
  clearFeatureFormButton: $("#clearFeatureFormButton"),
  featureList: $("#featureList"),
  packageList: $("#packageList"),
  packageCount: $("#packageCount")
};

function seedData() {
  const now = Date.now();
  const features = [
    {
      id: "feat_aimbot",
      name: "AimBot",
      icon: "AB",
      description: "Precision assist enabled for selected packages.",
      status: "Active"
    },
    {
      id: "feat_aimkey",
      name: "AimKey",
      icon: "AK",
      description: "Custom aim key support for the active device.",
      status: "Active"
    },
    {
      id: "feat_config",
      name: "Config",
      icon: "CF",
      description: "Package configuration profile is available.",
      status: "Active"
    },
    {
      id: "feat_device",
      name: "Device Support",
      icon: "DS",
      description: "Bound serial support and device verification.",
      status: "Active"
    },
    {
      id: "feat_premium",
      name: "Premium Access",
      icon: "PR",
      description: "Premium package tools and access layer.",
      status: "Active"
    },
    {
      id: "feat_secure",
      name: "Secure Launcher",
      icon: "SL",
      description: "Protected launcher flow with certificate check.",
      status: "Active"
    }
  ];

  return {
    settings: {
      adminPassword: DEFAULT_ADMIN_PASSWORD,
      contactLabel: "WhatsApp Admin",
      contactValue: "https://wa.me/8801000000000",
      contactMode: "auto"
    },
    featureStateDefaultMode: "deactivated",
    userFeatureStates: {},
    features,
    packages: [
      {
        id: "pkg_1day",
        name: "1 Day Starter",
        password: "KEY-1DAY-2026",
        validityType: "1",
        customDays: 1,
        createdAt: now,
        expiresAt: now + DAY_MS,
        status: "Active",
        deviceSerial: "JG7KD916DT",
        deviceName: "iPhone 16 Pro Max",
        activationMode: "random",
        activationCode: "WEB-ACT-8K29-XP41",
        webAccessCode: "WEB-1DAY-4477",
        certificateCode: "CERT-1111",
        contactInfo: "WhatsApp: +8801000000000",
        legalInfo: "Regulatory model and access terms verified for this device.",
        packageDetails: "Starter access package with selected essential modules.",
        loadingPreset: "60",
        loadingMinutes: 60,
        finalMessage: "Access Activated Successfully",
        featureIds: ["feat_aimbot", "feat_aimkey"]
      },
      {
        id: "pkg_7day",
        name: "7 Days Premium",
        password: "KEY-7DAY-2026",
        validityType: "7",
        customDays: 7,
        createdAt: now,
        expiresAt: now + 7 * DAY_MS,
        status: "Active",
        deviceSerial: "F2LXR9A0Q05N",
        deviceName: "iPhone 16 Pro Max",
        activationMode: "random",
        activationCode: "WEB-ACT-5QZ7-LM90",
        webAccessCode: "WEB-7DAY-8899",
        certificateCode: "CERT-2222",
        contactInfo: "support@example.com",
        legalInfo: "Private access certificate is active. Use is limited to the assigned serial number.",
        packageDetails: "Premium weekly package with device support and configuration access.",
        loadingPreset: "60",
        loadingMinutes: 60,
        finalMessage: "Package Installed Successfully",
        featureIds: ["feat_aimbot", "feat_aimkey", "feat_config", "feat_device"]
      },
      {
        id: "pkg_30day",
        name: "30 Days Ultimate",
        password: "KEY-30DAY-2026",
        validityType: "30",
        customDays: 30,
        createdAt: now,
        expiresAt: now + 30 * DAY_MS,
        status: "Active",
        deviceSerial: "Q9MXR4B8V21K",
        deviceName: "Android Secure Device",
        activationMode: "fixed",
        activationCode: "WEB-ACT-72PA-RT33",
        webAccessCode: "WEB-30DAY-5522",
        certificateCode: "CERT-3333",
        contactInfo: "https://example.com/support",
        legalInfo: "Full package authorization is active for the registered device profile.",
        packageDetails: "Ultimate package with all modules and extended access duration.",
        loadingPreset: "80",
        loadingMinutes: 80,
        finalMessage: "Installation Complete",
        featureIds: features.map((feature) => feature.id)
      }
    ]
  };
}

function getOrCreateDeviceId() {
  try {
    const existing = localStorage.getItem(DEVICE_ID_KEY);
    if (existing) return existing;
    const id =
      window.crypto?.randomUUID?.() ||
      `dev_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 12)}`;
    localStorage.setItem(DEVICE_ID_KEY, id);
    return id;
  } catch (error) {
    return `dev_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 12)}`;
  }
}

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? normalizeData(JSON.parse(raw)) : seedData();
  } catch (error) {
    return seedData();
  }
}

function normalizeData(data) {
  const defaults = seedData();
  const hasDeactivatedFeatureDefaults = data.featureStateDefaultMode === "deactivated";
  return {
    settings: {
      ...defaults.settings,
      ...(data.settings || {})
    },
    featureStateDefaultMode: "deactivated",
    features: (data.features || defaults.features).map((feature) => ({
      ...feature,
      icon: feature.icon || feature.name.slice(0, 2).toUpperCase(),
      image: feature.image || ""
    })),
    userFeatureStates: hasDeactivatedFeatureDefaults ? data.userFeatureStates || {} : {},
    packages: (data.packages || defaults.packages).map((pkg) => ({
      ...pkg,
      deviceName: pkg.deviceName || "Registered Device",
      legalInfo: pkg.legalInfo || "Legal and regulatory access details are assigned by the admin.",
      packageDetails: pkg.packageDetails || "Package details are assigned by the admin.",
      loadingMinutes: getFinalLoadingMinutes(pkg)
    }))
  };
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
  if (adminAuthenticated && adminToken) {
    queueAdminSave();
  }
}

async function apiRequest(path, { method = "GET", body, token = adminToken } = {}) {
  const headers = {
    Accept: "application/json"
  };

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(path, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.toLowerCase().includes("application/json");
  const payload = isJson ? await response.json().catch(() => ({})) : {};

  if (!isJson) {
    const error = new Error("API unavailable");
    error.status = response.status === 200 ? 404 : response.status;
    error.payload = payload;
    throw error;
  }

  if (!response.ok) {
    const error = new Error(payload.message || "Server request failed");
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  backendOnline = true;
  return payload;
}

function queueAdminSave() {
  const snapshot = normalizeData(appData);
  saveQueue = saveQueue
    .then(() =>
      apiRequest("/api/admin/data", {
        method: "PUT",
        body: { data: snapshot },
        token: adminToken
      })
    )
    .catch((error) => {
      if (error.status === 401) {
        adminToken = "";
        sessionStorage.removeItem(ADMIN_TOKEN_KEY);
      }
      console.warn("Admin data sync failed:", error.message);
    });
  return saveQueue;
}

function isMissingApiError(error) {
  return error?.status === 404 || error?.status === 405;
}

async function loadPublicSettings() {
  try {
    const payload = await apiRequest("/api/public");
    if (payload.settings) {
      appData.settings = {
        ...appData.settings,
        ...payload.settings
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
    }
  } catch (error) {
    if (isMissingApiError(error)) {
      backendOnline = false;
      return;
    }
    backendOnline = false;
  }
}

function mergeActivePackage(pkg) {
  appData.packages = [
    ...appData.packages.filter((item) => item.id !== pkg.id),
    pkg
  ];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
}

async function loginWithServer(password) {
  try {
    const payload = await apiRequest("/api/login", {
      method: "POST",
      body: { password, deviceId }
    });

    if (payload.role === "admin") {
      adminToken = payload.token || "";
      sessionStorage.setItem(ADMIN_TOKEN_KEY, adminToken);
      appData = normalizeData(payload.data || seedData());
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
      adminAuthenticated = true;
      activePackageId = null;
      elements.loginPassword.value = "";
      elements.loginView.classList.remove("hidden");
      elements.dashboardView.classList.add("hidden");
      setMessage(elements.loginMessage, "");
      renderAdmin();
      setView("admin");
      return true;
    }

    if (payload.role === "user" && payload.package) {
      const pkg = normalizeData({ ...appData, packages: [payload.package] }).packages[0];
      activePackageId = pkg.id;
      mergeActivePackage(pkg);
      setMessage(elements.loginMessage, "");
      renderDashboard(pkg);
      return true;
    }
  } catch (error) {
    if (isMissingApiError(error)) {
      backendOnline = false;
      return false;
    }

    if (error.status) {
      setMessage(elements.loginMessage, error.message || "Login failed");
      return true;
    }
    backendOnline = false;
  }

  return false;
}

async function verifyServerAccess(path, body, messageElement, fallbackMessage) {
  try {
    await apiRequest(path, {
      method: "POST",
      body: {
        ...body,
        deviceId
      }
    });
    return true;
  } catch (error) {
    if (isMissingApiError(error)) {
      return null;
    }

    if (error.status) {
      setMessage(messageElement, error.message || fallbackMessage);
      return false;
    }
    return null;
  }
}

function makeId(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function generateActivationCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const makePart = () =>
    Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `WEB-ACT-${makePart()}-${makePart()}`;
}

function getActivePackage() {
  return appData.packages.find((pkg) => pkg.id === activePackageId) || null;
}

function getValidityDays(pkg) {
  if (pkg.validityType === "custom") {
    return Math.max(1, Number(pkg.customDays) || 1);
  }
  return Math.max(1, Number(pkg.validityType) || 1);
}

function isExpired(pkg) {
  return Date.now() > Number(pkg.expiresAt);
}

function formatCountdown(ms) {
  const safeSeconds = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(safeSeconds / 86400);
  const hours = Math.floor((safeSeconds % 86400) / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;
  const pad = (value) => String(value).padStart(2, "0");
  return `${days}d ${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
}

function formatDate(timestamp) {
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(timestamp));
}

function maskSerial(serial) {
  if (!serial) return "Not set";
  if (serial.length <= 5) return "Locked";
  return `${serial.slice(0, 4)}${"*".repeat(Math.max(serial.length - 6, 2))}${serial.slice(-2)}`;
}

function setMessage(element, text, type = "error") {
  element.textContent = text || "";
  element.classList.toggle("ok", type === "ok");
  element.classList.toggle("neutral", type === "neutral");
}

function wait(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function getActionDelay() {
  return Math.floor(ACTION_DELAY_MIN_MS + Math.random() * (ACTION_DELAY_MAX_MS - ACTION_DELAY_MIN_MS + 1));
}

async function runButtonLoading(button, text = "Loading...") {
  if (!button || button.classList.contains("is-loading")) return false;

  button.dataset.originalHtml ||= button.innerHTML;
  button.disabled = true;
  button.classList.add("is-loading");
  button.innerHTML = `<span>${escapeHtml(text)}</span>`;
  await wait(getActionDelay());
  button.disabled = false;
  button.classList.remove("is-loading");
  button.innerHTML = button.dataset.originalHtml;
  return true;
}

function showAnimatedElement(element) {
  element.classList.remove("hidden", "stage-enter");
  void element.offsetWidth;
  element.classList.add("stage-enter");
}

function showFeatureActionMessage(text, type = "ok") {
  showAnimatedMessage(elements.featureActionMessage, text, type);
}

function showAnimatedMessage(element, text, type = "ok") {
  element.textContent = text;
  element.classList.remove("show", "ok", "neutral");
  element.classList.add(type === "ok" ? "ok" : "neutral");
  void element.offsetWidth;
  element.classList.add("show");
}

function setView(view) {
  if (view === "admin" && !adminAuthenticated) {
    showLoginGate("Enter admin password to open Admin Panel.");
    return;
  }

  $$(".switch-button").forEach((button) => {
    const active = button.dataset.view === view;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", String(active));
  });
  elements.userView.classList.toggle("active", view === "user");
  elements.adminView.classList.toggle("active", view === "admin");
  updatePageMode();
}

function updatePageMode() {
  const loginActive = elements.userView.classList.contains("active") && !elements.loginView.classList.contains("hidden");
  const dashboardActive = elements.userView.classList.contains("active") && !elements.dashboardView.classList.contains("hidden");
  document.documentElement.classList.toggle("login-active", loginActive);
  document.documentElement.classList.toggle("dashboard-active", dashboardActive);
  document.body.classList.toggle("login-active", loginActive);
  document.body.classList.toggle("dashboard-active", dashboardActive);
}

function showLoginGate(message = "") {
  clearActiveTimer();
  clearCountdownTimer();
  activePackageId = null;
  elements.dashboardView.classList.add("hidden");
  elements.loginView.classList.remove("hidden");
  elements.userView.classList.add("active");
  elements.adminView.classList.remove("active");
  $$(".switch-button").forEach((button) => {
    const active = button.dataset.view === "user";
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", String(active));
  });
  setMessage(elements.loginMessage, message, message ? "neutral" : "error");
  updatePageMode();
  elements.loginPassword.focus();
}

function clearCountdownTimer() {
  if (countdownTimer) {
    window.clearInterval(countdownTimer);
    countdownTimer = null;
  }
}

function startSubscriptionCountdown(pkg) {
  clearCountdownTimer();

  const updateCountdown = () => {
    const remaining = Number(pkg.expiresAt) - Date.now();
    elements.subscriptionCountdown.textContent = remaining > 0 ? formatCountdown(remaining) : "Expired";
    elements.subscriptionCountdownText.textContent =
      remaining > 0 ? "Reverse counting until package expiry." : "This package access has expired.";
    elements.subscriptionCountdown.classList.toggle("is-expired", remaining <= 0);

    if (remaining <= 0) {
      clearCountdownTimer();
    }
  };

  updateCountdown();
  countdownTimer = window.setInterval(updateCountdown, 1000);
}

function updateStatusPill(element, status) {
  element.classList.remove("warn", "danger", "muted");
  element.textContent = status;
  if (status === "Expired") element.classList.add("warn");
  if (status === "Disabled") element.classList.add("danger");
}

function getVisibleFeatures(pkg) {
  return appData.features.filter(
    (feature) => pkg.featureIds.includes(feature.id) && feature.status === "Active"
  );
}

function getFeatureStateMap(pkg, visibleFeatures = getVisibleFeatures(pkg)) {
  appData.userFeatureStates ||= {};
  appData.userFeatureStates[pkg.id] ||= {};
  visibleFeatures.forEach((feature) => {
    if (typeof appData.userFeatureStates[pkg.id][feature.id] !== "boolean") {
      appData.userFeatureStates[pkg.id][feature.id] = false;
    }
  });
  return appData.userFeatureStates[pkg.id];
}

function getEnabledFeatures(pkg) {
  const visibleFeatures = getVisibleFeatures(pkg);
  const featureStateMap = getFeatureStateMap(pkg, visibleFeatures);
  return visibleFeatures.filter((feature) => featureStateMap[feature.id]);
}

function renderFeatureModules(pkg) {
  const visibleFeatures = getVisibleFeatures(pkg);
  const featureStateMap = getFeatureStateMap(pkg, visibleFeatures);
  const enabledTotal = visibleFeatures.filter((feature) => featureStateMap[feature.id]).length;

  elements.featureCount.textContent = `${enabledTotal}/${visibleFeatures.length} Active`;

  if (!visibleFeatures.length) {
    elements.dashboardFeatures.innerHTML = `
      <div class="feature-card console-feature-card">
        <div>
          <h4>No active features assigned</h4>
          <p>This package is active but no enabled feature is selected.</p>
        </div>
      </div>`;
    return;
  }

  elements.dashboardFeatures.innerHTML = visibleFeatures
    .map((feature) => {
      const enabled = featureStateMap[feature.id];
      return `
        <article class="feature-card console-feature-card ${enabled ? "is-enabled" : "is-disabled"}">
          ${renderFeatureIconMarkup(feature)}
          <div>
            <div class="feature-title-row">
              <h4>${escapeHtml(feature.name)}</h4>
              <span>${enabled ? "Active" : "Deactivated"}</span>
            </div>
            <p>${escapeHtml(feature.description || "Enabled for this package.")}</p>
            <button type="button" data-feature-toggle="${feature.id}">
              ${enabled ? "Deactivate" : "Activate"}
            </button>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderDashboard(pkg) {
  const status = isExpired(pkg) ? "Expired" : pkg.status;

  elements.loginView.classList.add("hidden");
  elements.dashboardView.classList.remove("hidden");
  elements.dashboardTitle.textContent = "Welcome to the Hyper Regedit Web Portal";
  elements.dashboardSubtitle.textContent = `${pkg.name} access is ready. Click the button below to install.`;
  elements.packageName.textContent = pkg.name;
  elements.packageExpiry.textContent = `${getValidityDays(pkg)} day(s), ${formatDate(pkg.expiresAt)}`;
  elements.dashboardDeviceName.textContent = pkg.deviceName || "Registered Device";
  elements.deviceDetails.textContent = pkg.deviceSerial;
  elements.dashboardLegalInfo.textContent = pkg.legalInfo || "Legal and regulatory access details are assigned by the admin.";
  elements.dashboardPackageDetails.textContent = pkg.packageDetails || "Package details are assigned by the admin.";
  updateStatusPill(elements.packageStatus, status);
  renderFeatureModules(pkg);
  startSubscriptionCountdown(pkg);
  saveData();

  resetInstallFlow();
  updatePageMode();
}

function resetInstallFlow() {
  clearActiveTimer();
  elements.dashboardView.classList.remove("install-mode");
  setInstallState("Waiting");
  setStage("start");
  elements.activationCodeOutput.value = "";
  elements.serialInput.value = "";
  elements.webCodeInput.value = "";
  elements.certificateInput.value = "";
  elements.serialForm.classList.add("hidden");
  elements.serialVerifiedPanel.classList.add("hidden");
  elements.featureActionMessage.textContent = "";
  elements.featureActionMessage.classList.remove("show", "ok", "neutral");
  elements.gameInjectMessage.textContent = "";
  elements.gameInjectMessage.classList.remove("show", "ok", "neutral");
  setMessage(elements.serialMessage, "");
  setMessage(elements.webCodeMessage, "");
  setMessage(elements.certificateMessage, "");
  setMessage(elements.contactMessage, "");
  setProgress(elements.mainProgressBar, elements.mainProgressPercent, 0);
  setProgress(elements.finalProgressBar, elements.finalProgressPercent, 0);
  updateStepDots("activation");
}

function setInstallState(text) {
  elements.installState.textContent = text;
}

function setStage(stage) {
  const stages = {
    start: elements.installStart,
    activation: elements.activationStage,
    progress: elements.progressStage,
    web: elements.webCodeStage,
    cert: elements.certificateStage,
    final: elements.finalStage,
    success: elements.successStage
  };

  Object.values(stages).forEach((element) => element.classList.add("hidden"));
  showAnimatedElement(stages[stage]);
}

function updateStepDots(activeStep) {
  const order = ["activation", "serial", "files", "web", "cert", "final"];
  const activeIndex = order.indexOf(activeStep);

  $$("[data-step-dot]").forEach((dot) => {
    const dotIndex = order.indexOf(dot.dataset.stepDot);
    dot.classList.toggle("active", dot.dataset.stepDot === activeStep);
    dot.classList.toggle("complete", dotIndex >= 0 && dotIndex < activeIndex);
  });
}

function setProgress(bar, percentElement, value) {
  const safeValue = Math.max(0, Math.min(100, Math.round(value)));
  bar.style.width = `${safeValue}%`;
  percentElement.textContent = `${safeValue}%`;
}

function runProgress({ bar, percentElement, statusElement, titleElement, title, messages, duration, onDone, tickMs = 80 }) {
  clearActiveTimer();
  if (titleElement && title) titleElement.textContent = title;
  const started = Date.now();

  activeTimer = window.setInterval(() => {
    const elapsed = Date.now() - started;
    const progress = Math.min(100, (elapsed / duration) * 100);
    const messageIndex = Math.min(messages.length - 1, Math.floor((progress / 100) * messages.length));

    const roundedProgress = Math.round(progress);
    statusElement.textContent =
      statusElement.id === "progressStatus" ? `Installing Files: ${roundedProgress}%` : messages[messageIndex];
    setProgress(bar, percentElement, progress);

    if (progress >= 100) {
      clearActiveTimer();
      onDone();
    }
  }, tickMs);
}

function clearActiveTimer() {
  if (activeTimer) {
    window.clearInterval(activeTimer);
    activeTimer = null;
  }
}

function startInstall() {
  const pkg = getActivePackage();
  if (!pkg) return;

  if (pkg.status !== "Active" || isExpired(pkg)) {
    setMessage(elements.contactMessage, isExpired(pkg) ? "Access expired" : "Access disabled");
    return;
  }

  const code = generateActivationCode();
  elements.activationCodeOutput.value = code;
  elements.serialForm.classList.add("hidden");
  elements.serialVerifiedPanel.classList.add("hidden");
  elements.serialInput.value = "";
  setMessage(elements.serialMessage, "");
  elements.dashboardView.classList.add("install-mode");
  window.scrollTo({ top: 0, behavior: "smooth" });
  setInstallState("Activation");
  setStage("activation");
  updateStepDots("serial");
}

function startDeviceLoading() {
  setInstallState("Installing");
  setStage("progress");
  updateStepDots("files");
  setProgress(elements.mainProgressBar, elements.mainProgressPercent, 0);
  runProgress({
    bar: elements.mainProgressBar,
    percentElement: elements.mainProgressPercent,
    statusElement: elements.progressStatus,
    titleElement: elements.progressTitle,
    title: "Installing Files...",
    messages: [
      "Device serial verified...",
      "Installing firmware...",
      "Installing files...",
      "Verifying package...",
      "Preparing web access activation..."
    ],
    duration: SERIAL_INSTALL_DURATION_MS,
    onDone: () => {
      setInstallState("Activation Code");
      setStage("web");
      updateStepDots("cert");
    }
  });
}

function startFileLoading() {
  setInstallState("Installing");
  updateStepDots("web");
  setProgress(elements.mainProgressBar, elements.mainProgressPercent, 0);
  runProgress({
    bar: elements.mainProgressBar,
    percentElement: elements.mainProgressPercent,
    statusElement: elements.progressStatus,
    titleElement: elements.progressTitle,
    title: "File Installation Step",
    messages: ["Installing files...", "Verifying package...", "Preparing access..."],
    duration: 4500,
    onDone: () => {
      setInstallState("Activation Code");
      setStage("web");
      updateStepDots("cert");
    }
  });
}

function startFinalLoading() {
  const pkg = getActivePackage();
  const loadingMinutes = getFinalLoadingMinutes(pkg);
  const finalMessages = getFinalPhaseMessages(loadingMinutes);
  const finalDuration = finalMessages.length * FINAL_PHASE_MINUTES * 60 * 1000;

  setInstallState("Final");
  setStage("final");
  updateStepDots("final");
  setProgress(elements.finalProgressBar, elements.finalProgressPercent, 0);
  elements.finalProgressStatus.textContent = finalMessages[0];

  runProgress({
    bar: elements.finalProgressBar,
    percentElement: elements.finalProgressPercent,
    statusElement: elements.finalProgressStatus,
    messages: finalMessages,
    duration: finalDuration,
    tickMs: 1000,
    onDone: () => {
      setInstallState("Success");
      setStage("success");
      elements.successMessage.textContent = pkg.finalMessage || "Installation Complete";
      $$("[data-step-dot]").forEach((dot) => {
        dot.classList.remove("active");
        dot.classList.add("complete");
      });
    }
  });
}

async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      // Some mobile browsers block clipboard after animated delays; fall back to selection copy.
    }
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  document.body.removeChild(textarea);
  return copied;
}

function readImageFile(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve("");
      return;
    }

    if (!file.type.startsWith("image/")) {
      reject(new Error("Please upload an image file."));
      return;
    }

    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(String(reader.result || "")));
    reader.addEventListener("error", () => reject(new Error("Image upload failed.")));
    reader.readAsDataURL(file);
  });
}

function renderFeaturePicker(selectedIds = []) {
  if (!appData.features.length) {
    elements.featurePicker.innerHTML = `<p class="form-message neutral">No features available.</p>`;
    return;
  }

  elements.featurePicker.innerHTML = appData.features
    .map(
      (feature) => `
        <label class="checkbox-line">
          <input type="checkbox" name="featurePick" value="${feature.id}" ${selectedIds.includes(feature.id) ? "checked" : ""}>
          <span>${escapeHtml(feature.name)}${feature.status === "Disabled" ? " (Disabled)" : ""}</span>
        </label>
      `
    )
    .join("");
}

function renderFeatureList() {
  if (!appData.features.length) {
    elements.featureList.innerHTML = `<div class="list-item"><h4>No features</h4><p>Add a feature to assign it to packages.</p></div>`;
    return;
  }

  elements.featureList.innerHTML = appData.features
    .map(
      (feature) => `
        <article class="list-item">
          <div class="list-item-heading">
            ${renderFeatureIconMarkup(feature)}
            <div>
              <h4>${escapeHtml(feature.name)}</h4>
              <p>${escapeHtml(feature.description || "No description.")}</p>
            </div>
          </div>
          <div class="access-meta">
            <span>Icon: ${escapeHtml(getFeatureIcon(feature))}</span>
            <span>${feature.status}</span>
          </div>
          <div class="list-actions">
            <button type="button" data-feature-action="edit" data-feature-id="${feature.id}">Edit</button>
            <button type="button" data-feature-action="toggle" data-feature-id="${feature.id}">
              ${feature.status === "Active" ? "Disable" : "Enable"}
            </button>
            <button type="button" class="danger-action" data-feature-action="delete" data-feature-id="${feature.id}">Delete</button>
          </div>
        </article>
      `
    )
    .join("");
}

function renderPackageList() {
  const activePackages = appData.packages.filter((pkg) => pkg.status === "Active" && !isExpired(pkg));
  elements.packageCount.textContent = `${activePackages.length}/${appData.packages.length} Active`;

  if (!appData.packages.length) {
    elements.packageList.innerHTML = `<div class="list-item"><h4>No packages</h4><p>Create a package to allow user login.</p></div>`;
    return;
  }

  elements.packageList.innerHTML = [...appData.packages]
    .sort((a, b) => Number(b.status === "Active" && !isExpired(b)) - Number(a.status === "Active" && !isExpired(a)))
    .map((pkg) => {
      const status = isExpired(pkg) ? "Expired" : pkg.status;
      const featureTotal = pkg.featureIds.length;
      const lockStatus = pkg.deviceLockId ? "Device: Locked" : "Device: Unused";
      return `
        <article class="access-row">
          <div>
            <h4>${escapeHtml(pkg.name)}</h4>
            <p>Password: ${escapeHtml(pkg.password)} | Device: ${escapeHtml(pkg.deviceName || "Registered Device")} | Serial: ${escapeHtml(pkg.deviceSerial)}</p>
            <div class="access-meta">
              <span>${status}</span>
              <span>${getValidityDays(pkg)} day(s)</span>
              <span>${featureTotal} feature(s)</span>
              <span>${lockStatus}</span>
              <span>Web: ${escapeHtml(pkg.webAccessCode)}</span>
              <span>Cert: ${escapeHtml(pkg.certificateCode)}</span>
            </div>
          </div>
          <div class="list-actions">
            <button type="button" data-package-action="edit" data-package-id="${pkg.id}">Edit</button>
            <button type="button" data-package-action="unlock" data-package-id="${pkg.id}" ${pkg.deviceLockId ? "" : "disabled"}>
              Reset Device Lock
            </button>
            <button type="button" data-package-action="toggle" data-package-id="${pkg.id}">
              ${pkg.status === "Active" ? "Disable" : "Enable"}
            </button>
            <button type="button" class="danger-action" data-package-action="delete" data-package-id="${pkg.id}">Delete</button>
          </div>
        </article>
      `;
    })
    .join("");
}

function resetPackageForm() {
  elements.packageForm.reset();
  elements.packageId.value = "";
  elements.packageFormTitle.textContent = "Create Package";
  elements.savePackageButton.textContent = "Save Package";
  elements.pkgValidity.value = "1";
  elements.pkgStatusInput.value = "Active";
  elements.pkgActivationMode.value = "random";
  elements.pkgLoadingPreset.value = "60";
  elements.pkgCustomDays.value = "1";
  elements.pkgCustomLoading.value = "60";
  elements.pkgDeviceName.value = "Registered Device";
  elements.pkgLegalInfo.value = "Legal and regulatory access details are assigned by the admin.";
  elements.pkgPackageDetails.value = "Package details are assigned by the admin.";
  elements.pkgFinalMessage.value = "Access Activated Successfully";
  elements.pkgActivationCode.value = generateActivationCode();
  renderFeaturePicker([]);
  updateConditionalFields();
  setMessage(elements.packageFormMessage, "");
}

function fillPackageForm(pkg) {
  elements.packageId.value = pkg.id;
  elements.packageFormTitle.textContent = "Edit Package";
  elements.savePackageButton.textContent = "Update Package";
  elements.pkgName.value = pkg.name;
  elements.pkgPassword.value = pkg.password;
  elements.pkgValidity.value = pkg.validityType;
  elements.pkgCustomDays.value = pkg.customDays || getValidityDays(pkg);
  elements.pkgStatusInput.value = pkg.status;
  elements.pkgSerial.value = pkg.deviceSerial;
  elements.pkgDeviceName.value = pkg.deviceName || "Registered Device";
  elements.pkgActivationMode.value = pkg.activationMode || "random";
  elements.pkgActivationCode.value = pkg.activationCode || "";
  elements.pkgWebCode.value = pkg.webAccessCode;
  elements.pkgCertificate.value = pkg.certificateCode;
  elements.pkgContact.value = pkg.contactInfo || "";
  elements.pkgLegalInfo.value = pkg.legalInfo || "";
  elements.pkgPackageDetails.value = pkg.packageDetails || "";
  const loadingMinutes = getFinalLoadingMinutes(pkg);
  const savedLoadingPreset = String(pkg.loadingPreset || loadingMinutes);
  elements.pkgLoadingPreset.value = ["60", "70", "80"].includes(savedLoadingPreset) ? savedLoadingPreset : "custom";
  elements.pkgCustomLoading.value = loadingMinutes;
  elements.pkgFinalMessage.value = pkg.finalMessage || "Installation Complete";
  renderFeaturePicker(pkg.featureIds || []);
  updateConditionalFields();
  setMessage(elements.packageFormMessage, "");
  setView("admin");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function savePackageFromForm(event) {
  event.preventDefault();

  const id = elements.packageId.value || makeId("pkg");
  const existing = appData.packages.find((pkg) => pkg.id === id);
  const duplicatePassword = appData.packages.some(
    (pkg) => pkg.id !== id && pkg.password === elements.pkgPassword.value.trim()
  );
  const duplicateSerial = appData.packages.some(
    (pkg) => pkg.id !== id && pkg.deviceSerial === elements.pkgSerial.value.trim()
  );
  const duplicateWebCode = appData.packages.some(
    (pkg) => pkg.id !== id && pkg.webAccessCode === elements.pkgWebCode.value.trim()
  );
  const duplicateCertificate = appData.packages.some(
    (pkg) => pkg.id !== id && pkg.certificateCode === elements.pkgCertificate.value.trim()
  );

  if (duplicatePassword) {
    setMessage(elements.packageFormMessage, "This password is already used by another package.");
    return;
  }

  if (duplicateSerial) {
    setMessage(elements.packageFormMessage, "This serial number is already assigned to another package.");
    return;
  }

  if (duplicateWebCode) {
    setMessage(elements.packageFormMessage, "This web access activation code is already assigned to another package.");
    return;
  }

  if (duplicateCertificate) {
    setMessage(elements.packageFormMessage, "This certificate code is already assigned to another package.");
    return;
  }

  const validityType = elements.pkgValidity.value;
  const customDays = Number(elements.pkgCustomDays.value) || 1;
  const validityDays = validityType === "custom" ? customDays : Number(validityType);
  const loadingPreset = elements.pkgLoadingPreset.value;
  const loadingMinutes = getFinalLoadingMinutes({
    loadingPreset,
    loadingMinutes: loadingPreset === "custom" ? elements.pkgCustomLoading.value : loadingPreset
  });
  const featureIds = $$('input[name="featurePick"]:checked').map((input) => input.value);
  const now = Date.now();

  const packageData = {
    id,
    name: elements.pkgName.value.trim(),
    password: elements.pkgPassword.value.trim(),
    validityType,
    customDays: validityDays,
    createdAt: existing?.createdAt || now,
    expiresAt: now + validityDays * DAY_MS,
    status: elements.pkgStatusInput.value,
    deviceSerial: elements.pkgSerial.value.trim(),
    deviceName: elements.pkgDeviceName.value.trim() || "Registered Device",
    activationMode: elements.pkgActivationMode.value,
    activationCode: elements.pkgActivationCode.value.trim() || generateActivationCode(),
    webAccessCode: elements.pkgWebCode.value.trim(),
    certificateCode: elements.pkgCertificate.value.trim(),
    contactInfo: elements.pkgContact.value.trim(),
    legalInfo: elements.pkgLegalInfo.value.trim(),
    packageDetails: elements.pkgPackageDetails.value.trim(),
    loadingPreset,
    loadingMinutes,
    finalMessage: elements.pkgFinalMessage.value.trim(),
    featureIds,
    deviceLockId: existing?.deviceLockId || "",
    deviceLockedAt: existing?.deviceLockedAt || null
  };

  if (existing) {
    appData.packages = appData.packages.map((pkg) => (pkg.id === id ? packageData : pkg));
  } else {
    appData.packages.push(packageData);
  }

  saveData();
  renderAdmin();
  resetPackageForm();
  setMessage(elements.packageFormMessage, existing ? "Package updated." : "Package created.", "ok");
}

function resetFeatureForm() {
  elements.featureForm.reset();
  elements.featureId.value = "";
  elements.featurePhoto.value = "";
  elements.featureFormTitle.textContent = "Add Feature";
  elements.saveFeatureButton.textContent = "Save Feature";
  elements.featureStatus.value = "Active";
  setMessage(elements.featureFormMessage, "");
}

function fillFeatureForm(feature) {
  elements.featureId.value = feature.id;
  elements.featureFormTitle.textContent = "Edit Feature";
  elements.saveFeatureButton.textContent = "Update Feature";
  elements.featureName.value = feature.name;
  elements.featureIcon.value = feature.icon || getFeatureIcon(feature);
  elements.featurePhoto.value = "";
  elements.featureDescription.value = feature.description || "";
  elements.featureStatus.value = feature.status;
  setMessage(elements.featureFormMessage, "");
}

async function saveFeatureFromForm(event) {
  event.preventDefault();
  const id = elements.featureId.value || makeId("feat");
  const existing = appData.features.find((feature) => feature.id === id);
  let image = existing?.image || "";

  try {
    image = (await readImageFile(elements.featurePhoto.files?.[0])) || image;
  } catch (error) {
    setMessage(elements.featureFormMessage, error.message);
    return;
  }

  const featureData = {
    id,
    name: elements.featureName.value.trim(),
    icon: elements.featureIcon.value.trim() || elements.featureName.value.trim().slice(0, 2).toUpperCase(),
    image,
    description: elements.featureDescription.value.trim(),
    status: elements.featureStatus.value
  };

  if (existing) {
    appData.features = appData.features.map((feature) => (feature.id === id ? featureData : feature));
  } else {
    appData.features.push(featureData);
  }

  saveData();
  renderAdmin();
  resetFeatureForm();
  setMessage(elements.featureFormMessage, existing ? "Feature updated." : "Feature added.", "ok");
}

function renderAdmin() {
  renderAdminSettings();
  renderFeaturePicker($$('input[name="featurePick"]:checked').map((input) => input.value));
  renderFeatureList();
  renderPackageList();
}

function renderAdminSettings() {
  const settings = appData.settings || {};
  elements.adminPasswordInput.value = settings.adminPassword || DEFAULT_ADMIN_PASSWORD;
  elements.adminContactLabel.value = settings.contactLabel || "";
  elements.adminContactValue.value = settings.contactValue || "";
  elements.adminContactMode.value = settings.contactMode || "auto";
}

function saveAdminSettings(event) {
  event.preventDefault();
  appData.settings = {
    adminPassword: elements.adminPasswordInput.value.trim(),
    contactLabel: elements.adminContactLabel.value.trim(),
    contactValue: elements.adminContactValue.value.trim(),
    contactMode: elements.adminContactMode.value
  };
  saveData();
  setMessage(elements.adminSettingsMessage, "Admin settings saved.", "ok");
}

function updateConditionalFields() {
  elements.customValidityWrap.classList.toggle("hidden", elements.pkgValidity.value !== "custom");
  elements.customLoadingWrap.classList.toggle("hidden", elements.pkgLoadingPreset.value !== "custom");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getFeatureIcon(feature) {
  return (feature.icon || feature.name.slice(0, 2)).slice(0, 4).toUpperCase();
}

function renderFeatureIconMarkup(feature) {
  if (feature.image) {
    return `<span class="feature-icon has-image"><img src="${escapeHtml(feature.image)}" alt=""></span>`;
  }

  return `<span class="feature-icon">${escapeHtml(getFeatureIcon(feature))}</span>`;
}

function getFinalLoadingMinutes(pkg) {
  const minutes = Number(pkg?.loadingMinutes) || Number(pkg?.loadingPreset) || MIN_FINAL_LOADING_MINUTES;
  const roundedBlock = Math.ceil(minutes / FINAL_PHASE_MINUTES) * FINAL_PHASE_MINUTES;
  return Math.min(MAX_FINAL_LOADING_MINUTES, Math.max(MIN_FINAL_LOADING_MINUTES, roundedBlock));
}

function getFinalPhaseMessages(loadingMinutes) {
  const phaseCount = Math.min(
    FINAL_PHASE_MESSAGES.length,
    Math.max(1, Math.ceil(loadingMinutes / FINAL_PHASE_MINUTES))
  );
  return FINAL_PHASE_MESSAGES.slice(0, phaseCount);
}

function isLinkContact(value) {
  return /^(https?:\/\/|mailto:|tel:)/i.test(value);
}

function getContactTarget(value) {
  const contact = (value || "").trim();
  if (!contact) return "";
  if (isLinkContact(contact)) return contact;
  if (/^www\./i.test(contact)) return `https://${contact}`;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)) return `mailto:${contact}`;

  const phoneCandidate = contact.replace(/whats\s*app:?/i, "").replace(/[^\d+]/g, "");
  const digits = phoneCandidate.replace(/^\+/, "");
  if ((/whats\s*app/i.test(contact) || /^\+?\d[\d\s().-]{7,}$/.test(contact)) && digits.length >= 8) {
    return `https://wa.me/${digits}`;
  }

  return "";
}

function openOrCopyContact({ contact, label, mode = "auto", messageElement }) {
  const value = (contact || "").trim();

  if (!value) {
    setMessage(messageElement, "Admin contact not set.");
    return;
  }

  const target = getContactTarget(value);
  const shouldOpen = mode === "open" || (mode === "auto" && target);
  if (target && shouldOpen) {
    window.open(target, "_blank", "noopener");
    setMessage(messageElement, `${label || "Contact"} opened.`, "ok");
    return;
  }

  copyText(value).then(() => {
    setMessage(messageElement, `${label || "Contact"} copied.`, "ok");
  });
}

function openSelectedAdminContact() {
  const settings = appData.settings || {};
  openOrCopyContact({
    contact: settings.contactValue,
    label: settings.contactLabel || "Admin contact",
    mode: settings.contactMode || "auto",
    messageElement: elements.loginMessage
  });
}

$$("[data-view]").forEach((button) => {
  button.addEventListener("click", () => setView(button.dataset.view));
});

elements.togglePasswordButton.addEventListener("click", () => {
  const showing = elements.loginPassword.type === "text";
  elements.loginPassword.type = showing ? "password" : "text";
  elements.togglePasswordButton.textContent = showing ? "SHOW" : "HIDE";
  elements.togglePasswordButton.setAttribute("aria-label", showing ? "Show password" : "Hide password");
});

elements.contactAdminLoginButton.addEventListener("click", openSelectedAdminContact);

elements.loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const password = elements.loginPassword.value.trim();
  const handledByServer = await loginWithServer(password);
  if (handledByServer) return;

  const adminPassword = (appData.settings?.adminPassword || DEFAULT_ADMIN_PASSWORD).trim();

  if (password === adminPassword) {
    adminAuthenticated = true;
    activePackageId = null;
    elements.loginPassword.value = "";
    elements.loginView.classList.remove("hidden");
    elements.dashboardView.classList.add("hidden");
    setMessage(elements.loginMessage, "");
    setView("admin");
    return;
  }

  const pkg = appData.packages.find((item) => item.password === password);

  if (!pkg) {
    setMessage(elements.loginMessage, "Incorrect Password");
    return;
  }

  if (pkg.status !== "Active") {
    setMessage(elements.loginMessage, "Access disabled");
    return;
  }

  if (isExpired(pkg)) {
    setMessage(elements.loginMessage, "Access expired");
    return;
  }

  activePackageId = pkg.id;
  setMessage(elements.loginMessage, "");
  renderDashboard(pkg);
});

elements.logoutButton.addEventListener("click", () => {
  activePackageId = null;
  clearActiveTimer();
  clearCountdownTimer();
  elements.loginPassword.value = "";
  elements.loginView.classList.remove("hidden");
  elements.dashboardView.classList.add("hidden");
  updatePageMode();
});

elements.adminLogoutButton.addEventListener("click", () => {
  adminAuthenticated = false;
  showLoginGate("Admin logged out.");
});

elements.startInstallButton.addEventListener("click", async () => {
  const ready = await runButtonLoading(elements.startInstallButton, "Installing...");
  if (ready) startInstall();
});

elements.freeFireButton.addEventListener("click", async () => {
  const ready = await runButtonLoading(elements.freeFireButton, "Injecting...");
  if (ready) showAnimatedMessage(elements.gameInjectMessage, "Free Fire Injected", "ok");
});

elements.freeFireMaxButton.addEventListener("click", async () => {
  const ready = await runButtonLoading(elements.freeFireMaxButton, "Injecting...");
  if (ready) showAnimatedMessage(elements.gameInjectMessage, "Free Fire Max Injected", "ok");
});

elements.contactButton.addEventListener("click", () => {
  const pkg = getActivePackage();
  const contact = pkg?.contactInfo || appData.settings?.contactValue || "";
  if (!contact) {
    setMessage(elements.contactMessage, "No contact info set.", "neutral");
    return;
  }

  openOrCopyContact({
    contact,
    label: pkg?.contactInfo ? "Package contact" : appData.settings?.contactLabel || "Admin contact",
    mode: "auto",
    messageElement: elements.contactMessage
  });
});

elements.copyActivationButton.addEventListener("click", async () => {
  const copyPromise = copyText(elements.activationCodeOutput.value).catch(() => false);
  const ready = await runButtonLoading(elements.copyActivationButton, "Copying...");
  if (!ready) return;

  const copied = await copyPromise;
  elements.serialVerifiedPanel.classList.add("hidden");
  showAnimatedElement(elements.serialForm);
  elements.copyActivationButton.innerHTML = copied ? "<span>Copied</span>" : "<span>Continue</span>";
  window.setTimeout(() => {
    elements.copyActivationButton.innerHTML = elements.copyActivationButton.dataset.originalHtml || "<span>Copy Key</span>";
  }, 1200);
  elements.serialInput.focus();
});

elements.dashboardFeatures.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-feature-toggle]");
  if (!button) return;

  const pkg = getActivePackage();
  if (!pkg) return;

  const card = button.closest(".console-feature-card");
  card?.classList.add("is-switching");
  const ready = await runButtonLoading(button, "Processing...");
  card?.classList.remove("is-switching");
  if (!ready) return;

  const featureId = button.dataset.featureToggle;
  const featureStateMap = getFeatureStateMap(pkg);
  featureStateMap[featureId] = !featureStateMap[featureId];
  const isActive = featureStateMap[featureId];
  saveData();
  renderFeatureModules(pkg);
  showFeatureActionMessage(
    isActive ? "Command successfully activated." : "Command deactivated successful.",
    isActive ? "ok" : "neutral"
  );
});

elements.serialForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const ready = await runButtonLoading(event.submitter || elements.serialForm.querySelector("button"), "Checking...");
  if (!ready) return;

  const pkg = getActivePackage();
  const serial = elements.serialInput.value.trim();
  const serverResult = await verifyServerAccess(
    "/api/verify-serial",
    { packageId: pkg?.id, serial },
    elements.serialMessage,
    "Incorrect Device Serial Number"
  );

  if (serverResult === false) {
    elements.serialVerifiedPanel.classList.add("hidden");
    return;
  }

  if (serverResult === true) {
    setMessage(elements.serialMessage, "");
    showAnimatedElement(elements.serialVerifiedPanel);
    return;
  }

  if (!pkg || serial !== pkg.deviceSerial) {
    setMessage(elements.serialMessage, "Incorrect Device Serial Number");
    elements.serialVerifiedPanel.classList.add("hidden");
    return;
  }

  setMessage(elements.serialMessage, "");
  showAnimatedElement(elements.serialVerifiedPanel);
});

elements.activationInstallButton.addEventListener("click", async () => {
  const ready = await runButtonLoading(elements.activationInstallButton, "Installing...");
  if (ready) startDeviceLoading();
});

elements.webCodeForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const ready = await runButtonLoading(event.submitter || elements.webCodeForm.querySelector("button"), "Verifying...");
  if (!ready) return;

  const pkg = getActivePackage();
  const webCode = elements.webCodeInput.value.trim();
  const serverResult = await verifyServerAccess(
    "/api/verify-web-code",
    { packageId: pkg?.id, code: webCode },
    elements.webCodeMessage,
    "Invalid Web Access Activation Code"
  );

  if (serverResult === false) return;

  if (serverResult === true) {
    setMessage(elements.webCodeMessage, "");
    setInstallState("Certificate");
    setStage("cert");
    return;
  }

  if (!pkg || webCode !== pkg.webAccessCode) {
    setMessage(elements.webCodeMessage, "Invalid Web Access Activation Code");
    return;
  }

  setMessage(elements.webCodeMessage, "");
  setInstallState("Certificate");
  setStage("cert");
});

elements.certificateForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const ready = await runButtonLoading(event.submitter || elements.certificateForm.querySelector("button"), "Activating...");
  if (!ready) return;

  const pkg = getActivePackage();
  const certificate = elements.certificateInput.value.trim();
  const serverResult = await verifyServerAccess(
    "/api/verify-certificate",
    { packageId: pkg?.id, code: certificate },
    elements.certificateMessage,
    "Incorrect Access Certificate Code"
  );

  if (serverResult === false) return;

  if (serverResult === true) {
    setMessage(elements.certificateMessage, "");
    startFinalLoading();
    return;
  }

  if (!pkg || certificate !== pkg.certificateCode) {
    setMessage(elements.certificateMessage, "Incorrect Access Certificate Code");
    return;
  }

  setMessage(elements.certificateMessage, "");
  startFinalLoading();
});

elements.restartFlowButton.addEventListener("click", resetInstallFlow);
elements.adminSettingsForm.addEventListener("submit", saveAdminSettings);
elements.packageForm.addEventListener("submit", savePackageFromForm);
elements.featureForm.addEventListener("submit", saveFeatureFromForm);
elements.clearPackageFormButton.addEventListener("click", resetPackageForm);
elements.clearFeatureFormButton.addEventListener("click", resetFeatureForm);
elements.pkgValidity.addEventListener("change", updateConditionalFields);
elements.pkgLoadingPreset.addEventListener("change", updateConditionalFields);

elements.featureList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-feature-action]");
  if (!button) return;

  const feature = appData.features.find((item) => item.id === button.dataset.featureId);
  if (!feature) return;

  if (button.dataset.featureAction === "edit") {
    fillFeatureForm(feature);
  }

  if (button.dataset.featureAction === "toggle") {
    feature.status = feature.status === "Active" ? "Disabled" : "Active";
    saveData();
    renderAdmin();
    if (activePackageId) renderDashboard(getActivePackage());
  }

  if (button.dataset.featureAction === "delete") {
    if (!window.confirm("Delete this feature?")) return;
    appData.features = appData.features.filter((item) => item.id !== feature.id);
    appData.packages = appData.packages.map((pkg) => ({
      ...pkg,
      featureIds: pkg.featureIds.filter((id) => id !== feature.id)
    }));
    saveData();
    renderAdmin();
    if (activePackageId) renderDashboard(getActivePackage());
  }
});

elements.packageList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-package-action]");
  if (!button) return;

  const pkg = appData.packages.find((item) => item.id === button.dataset.packageId);
  if (!pkg) return;

  if (button.dataset.packageAction === "edit") {
    fillPackageForm(pkg);
  }

  if (button.dataset.packageAction === "toggle") {
    pkg.status = pkg.status === "Active" ? "Disabled" : "Active";
    saveData();
    renderPackageList();
    if (activePackageId === pkg.id) renderDashboard(pkg);
  }

  if (button.dataset.packageAction === "unlock") {
    if (!window.confirm("Reset the saved device for this package?")) return;
    pkg.deviceLockId = "";
    pkg.deviceLockedAt = null;
    saveData();
    renderPackageList();
  }

  if (button.dataset.packageAction === "delete") {
    if (!window.confirm("Delete this access package?")) return;
    appData.packages = appData.packages.filter((item) => item.id !== pkg.id);
    if (activePackageId === pkg.id) {
      activePackageId = null;
      elements.loginView.classList.remove("hidden");
      elements.dashboardView.classList.add("hidden");
      updatePageMode();
    }
    saveData();
    renderPackageList();
  }
});

elements.resetDemoButton.addEventListener("click", () => {
  if (!window.confirm("Reset all demo data?")) return;
  appData = seedData();
  saveData();
  activePackageId = null;
  elements.loginView.classList.remove("hidden");
  elements.dashboardView.classList.add("hidden");
  updatePageMode();
  resetFeatureForm();
  resetPackageForm();
  renderAdmin();
});

async function initializeApp() {
  resetPackageForm();
  resetFeatureForm();
  renderAdmin();
  updatePageMode();
  await loadPublicSettings();
  renderAdminSettings();
}

initializeApp();
