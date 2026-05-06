const http = require("http");
const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");

const PORT = Number(process.env.PORT) || 3000;
const ROOT_DIR = __dirname;
const DATA_FILE = process.env.DATA_FILE || path.join(ROOT_DIR, "data", "store.json");
const DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "ADMIN-2026";
const ADMIN_SESSION_MS = 12 * 60 * 60 * 1000;

const sessions = new Map();
let writeQueue = Promise.resolve();

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
        featureIds: ["feat_aimbot", "feat_aimkey"],
        deviceLockId: "",
        deviceLockedAt: null
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
        featureIds: ["feat_aimbot", "feat_aimkey", "feat_config", "feat_device"],
        deviceLockId: "",
        deviceLockedAt: null
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
        featureIds: features.map((feature) => feature.id),
        deviceLockId: "",
        deviceLockedAt: null
      }
    ]
  };
}

function getFinalLoadingMinutes(pkg) {
  const raw = Number(pkg?.loadingMinutes || pkg?.loadingPreset || 60);
  return Math.max(60, Math.min(80, Number.isFinite(raw) ? raw : 60));
}

function normalizeData(data = {}) {
  const defaults = seedData();
  return {
    settings: {
      ...defaults.settings,
      ...(data.settings || {})
    },
    featureStateDefaultMode: "deactivated",
    userFeatureStates: data.userFeatureStates || {},
    features: (data.features || defaults.features).map((feature) => ({
      ...feature,
      icon: feature.icon || String(feature.name || "FT").slice(0, 2).toUpperCase(),
      image: feature.image || ""
    })),
    packages: (data.packages || defaults.packages).map((pkg) => ({
      ...pkg,
      featureIds: Array.isArray(pkg.featureIds) ? pkg.featureIds : [],
      deviceName: pkg.deviceName || "Registered Device",
      legalInfo: pkg.legalInfo || "Legal and regulatory access details are assigned by the admin.",
      packageDetails: pkg.packageDetails || "Package details are assigned by the admin.",
      loadingMinutes: getFinalLoadingMinutes(pkg),
      deviceLockId: pkg.deviceLockId || "",
      deviceLockedAt: pkg.deviceLockedAt || null
    }))
  };
}

async function readStore() {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    return normalizeData(JSON.parse(raw));
  } catch (error) {
    const seeded = normalizeData(seedData());
    await writeStore(seeded);
    return seeded;
  }
}

async function writeStore(data) {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(normalizeData(data), null, 2));
}

function withStoreUpdate(mutator) {
  writeQueue = writeQueue.then(async () => {
    const data = await readStore();
    const result = await mutator(data);
    await writeStore(data);
    return result;
  });
  return writeQueue;
}

function publicSettings(settings = {}) {
  return {
    contactLabel: settings.contactLabel || "",
    contactValue: settings.contactValue || "",
    contactMode: settings.contactMode || "auto"
  };
}

function userPackage(pkg) {
  const {
    password,
    webAccessCode,
    certificateCode,
    deviceLockId,
    deviceLockedAt,
    ...safePackage
  } = pkg;
  return {
    ...safePackage,
    deviceLocked: Boolean(deviceLockId),
    deviceLockedAt: deviceLockedAt || null
  };
}

function isExpired(pkg) {
  return Date.now() > Number(pkg.expiresAt);
}

function createAdminSession() {
  const token = crypto.randomBytes(32).toString("hex");
  sessions.set(token, Date.now() + ADMIN_SESSION_MS);
  return token;
}

function getBearerToken(req) {
  const header = req.headers.authorization || "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1] || "";
}

function requireAdmin(req) {
  const token = getBearerToken(req);
  const expiresAt = sessions.get(token);
  if (!expiresAt || expiresAt < Date.now()) {
    sessions.delete(token);
    return false;
  }
  sessions.set(token, Date.now() + ADMIN_SESSION_MS);
  return true;
}

function sendJson(res, status, payload) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(JSON.stringify(payload));
}

async function readJsonBody(req) {
  let raw = "";
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > 1_000_000) {
      throw new Error("Request body too large");
    }
  }
  return raw ? JSON.parse(raw) : {};
}

function verifyPackageDevice(pkg, deviceId) {
  if (!pkg) return "Incorrect Password";
  if (pkg.status !== "Active") return "Access disabled";
  if (isExpired(pkg)) return "Access expired";
  if (!deviceId) return "Device ID missing";
  if (pkg.deviceLockId && pkg.deviceLockId !== deviceId) {
    return "Already used on another device";
  }
  return "";
}

async function handleApi(req, res, pathname) {
  if (req.method === "GET" && pathname === "/api/health") {
    return sendJson(res, 200, { ok: true });
  }

  if (req.method === "GET" && pathname === "/api/public") {
    const data = await readStore();
    return sendJson(res, 200, {
      serverMode: true,
      settings: publicSettings(data.settings)
    });
  }

  if (req.method === "POST" && pathname === "/api/login") {
    const body = await readJsonBody(req);
    const password = String(body.password || "").trim();
    const deviceId = String(body.deviceId || "").trim();

    return withStoreUpdate((data) => {
      const adminPassword = String(data.settings?.adminPassword || DEFAULT_ADMIN_PASSWORD).trim();
      if (password === adminPassword) {
        return sendJson(res, 200, {
          role: "admin",
          token: createAdminSession(),
          data
        });
      }

      const pkg = data.packages.find((item) => item.password === password);
      if (!pkg) {
        return sendJson(res, 401, { message: "Incorrect Password" });
      }

      const accessError = verifyPackageDevice(pkg, deviceId);
      if (accessError) {
        return sendJson(res, accessError.includes("Already") ? 409 : 403, { message: accessError });
      }

      if (!pkg.deviceLockId) {
        pkg.deviceLockId = deviceId;
        pkg.deviceLockedAt = Date.now();
      }

      return sendJson(res, 200, {
        role: "user",
        package: userPackage(pkg)
      });
    });
  }

  if (req.method === "GET" && pathname === "/api/admin/data") {
    if (!requireAdmin(req)) {
      return sendJson(res, 401, { message: "Admin session expired" });
    }
    const data = await readStore();
    return sendJson(res, 200, { data });
  }

  if (req.method === "PUT" && pathname === "/api/admin/data") {
    if (!requireAdmin(req)) {
      return sendJson(res, 401, { message: "Admin session expired" });
    }
    const body = await readJsonBody(req);
    const nextData = normalizeData(body.data || {});
    await writeStore(nextData);
    return sendJson(res, 200, { ok: true, data: nextData });
  }

  if (req.method === "POST" && ["/api/verify-serial", "/api/verify-web-code", "/api/verify-certificate"].includes(pathname)) {
    const body = await readJsonBody(req);
    const packageId = String(body.packageId || "");
    const deviceId = String(body.deviceId || "");
    const code = String(body.code || "");
    const serial = String(body.serial || "");
    const data = await readStore();
    const pkg = data.packages.find((item) => item.id === packageId);
    const accessError = verifyPackageDevice(pkg, deviceId);

    if (accessError) {
      return sendJson(res, accessError.includes("Already") ? 409 : 403, { message: accessError });
    }

    if (pathname === "/api/verify-serial" && serial !== pkg.deviceSerial) {
      return sendJson(res, 403, { message: "Incorrect Device Serial Number" });
    }

    if (pathname === "/api/verify-web-code" && code !== pkg.webAccessCode) {
      return sendJson(res, 403, { message: "Invalid Web Access Activation Code" });
    }

    if (pathname === "/api/verify-certificate" && code !== pkg.certificateCode) {
      return sendJson(res, 403, { message: "Incorrect Access Certificate Code" });
    }

    return sendJson(res, 200, { ok: true });
  }

  return sendJson(res, 404, { message: "API route not found" });
}

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon"
  }[ext] || "application/octet-stream";
}

async function serveStatic(req, res, pathname) {
  const cleanPath = pathname === "/" ? "/index.html" : pathname;
  const decoded = decodeURIComponent(cleanPath);
  const filePath = path.normalize(path.join(ROOT_DIR, decoded));

  if (!filePath.startsWith(ROOT_DIR) || filePath.includes(`${path.sep}data${path.sep}`)) {
    res.writeHead(403);
    return res.end("Forbidden");
  }

  try {
    const content = await fs.readFile(filePath);
    res.writeHead(200, {
      "Content-Type": getMimeType(filePath),
      "Cache-Control": filePath.endsWith(".html") ? "no-store" : "public, max-age=600"
    });
    return res.end(content);
  } catch (error) {
    const index = await fs.readFile(path.join(ROOT_DIR, "index.html"));
    res.writeHead(200, {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store"
    });
    return res.end(index);
  }
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (url.pathname.startsWith("/api/")) {
      await handleApi(req, res, url.pathname);
      return;
    }
    await serveStatic(req, res, url.pathname);
  } catch (error) {
    sendJson(res, 500, { message: error.message || "Server error" });
  }
});

server.listen(PORT, () => {
  console.log(`Hyper access server running on port ${PORT}`);
});
