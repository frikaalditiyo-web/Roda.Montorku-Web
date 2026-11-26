import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";

const ROOT = process.cwd();
const PORT = Number(process.env.SMOKE_TEST_PORT || 3099);
const BASE = `http://127.0.0.1:${PORT}`;

function parseCookieValue(setCookieHeader, name) {
  if (!setCookieHeader) return null;
  const regex = new RegExp(`${name}=([^;]+)`);
  const m = setCookieHeader.match(regex);
  return m ? m[1] : null;
}

async function waitForServer(timeoutMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`${BASE}/api/health`);
      if (res.ok) return await res.json();
    } catch {
      // retry until timeout
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  throw new Error(`Server did not become ready within ${timeoutMs}ms`);
}

async function req(urlPath, init = {}) {
  const res = await fetch(`${BASE}${urlPath}`, {
    redirect: "manual",
    ...init,
  });
  const contentType = res.headers.get("content-type") || "";
  const text = await res.text();
  let json = null;
  if (contentType.includes("application/json")) {
    try {
      json = JSON.parse(text);
    } catch {
      json = null;
    }
  }
  return { res, status: res.status, headers: res.headers, text, json };
}

async function main() {
  if (!fs.existsSync(path.join(ROOT, ".next", "BUILD_ID"))) {
    throw new Error("Missing .next production build. Run `npm run build` before `npm test`.");
  }

  const nextBin = path.join(ROOT, "node_modules", "next", "dist", "bin", "next");
  const server = spawn(process.execPath, [nextBin, "start", "-p", String(PORT), "-H", "127.0.0.1"], {
    cwd: ROOT,
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, PORT: String(PORT) },
  });

  const uploadedFilesToCleanup = [];
  let createdMotorId = null;
  let createdPredId = null;
  let adminCookie = "";
  const storePath = path.join(ROOT, "src", "data", "db_store.json");
  const initialStore = fs.existsSync(storePath)
    ? JSON.parse(fs.readFileSync(storePath, "utf8"))
    : null;

  try {
    const health = await waitForServer(30000);
    console.log("STEP 1 HEALTH:", JSON.stringify({
      status: health.status,
      database: health.database,
      dataset: health.dataset,
    }));
    assert.equal(health.status, "ok", "health.status must be ok");

    // STEP 2: Security Headers & Auth Guards
    const rAdminNoAuth = await req("/admin/dashboard");
    assert.ok(rAdminNoAuth.status === 307 || rAdminNoAuth.status === 302 || rAdminNoAuth.status === 308);
    assert.equal(rAdminNoAuth.headers.get("x-frame-options"), "DENY", "Security header X-Frame-Options must be DENY");
    assert.equal(rAdminNoAuth.headers.get("x-content-type-options"), "nosniff", "Security header X-Content-Type-Options must be nosniff");

    const rAdminForged = await req("/admin/dashboard", {
      headers: { Cookie: "rodamotorku_token=eyJhbGciOiJIUzI1NiJ9.eyJpZF91c2VyIjoxLCJyb2xlIjoiYWRtaW4ifQ.forgedsignature" },
    });
    assert.ok(rAdminForged.status === 307 || rAdminForged.status === 302);
    const forgedSetCookie = rAdminForged.headers.get("set-cookie") || "";
    assert.ok(
      forgedSetCookie.includes("rodamotorku_token=;") ||
      forgedSetCookie.includes("Max-Age=0") ||
      forgedSetCookie.includes("Expires=Thu, 01 Jan 1970")
    );

    const rReg = await req("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "hacker", password: "123" }),
    });
    assert.equal(rReg.status, 403);

    const rMeNoAuth = await req("/api/auth/me");
    assert.equal(rMeNoAuth.status, 401);

    const rPredListNoAuth = await req("/api/prediksi");
    assert.equal(rPredListNoAuth.status, 401);

    const rMotorPostNoAuth = await req("/api/motor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nama_motor: "X" }),
    });
    assert.equal(rMotorPostNoAuth.status, 401);

    const rUploadNoAuth = await req("/api/upload", { method: "POST" });
    assert.equal(rUploadNoAuth.status, 401);

    const rPredSaveNoAuth = await req("/api/prediksi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        merek: "Honda",
        cc: 110,
        tahun: 2021,
        kilometer: 10000,
        harga_beli: 11000000,
        domisili_samsat: "Nganjuk (AG)",
        kondisi_mesin: "Baik",
        kelengkapan_dokumen: "Lengkap (STNK + BPKB)",
        save_to_history: true,
      }),
    });
    assert.equal(rPredSaveNoAuth.status, 401);
    console.log("STEP 2 SECURITY HEADERS & AUTH GUARDS: PASSED");

    // STEP 3: Public UI Cleanliness, Admin Login Link on Navbar, Public Redaction of `harga_beli`, & Stateless ML Predict
    const rHome = await req("/");
    assert.equal(rHome.status, 200);
    assert.ok(rHome.text.includes("Login Admin"), "Public navbar must render Login Admin button");
    assert.ok(rHome.text.includes('href="/login"'), "Public navbar must link to /login");
    assert.ok(!rHome.text.includes("Akses Login Admin"), "Public footer must not render Akses Login Admin");

    const rLoginPage = await req("/login");
    assert.equal(rLoginPage.status, 200);
    assert.ok(!rLoginPage.text.includes("AdminRoda2026!"), "Login page must not expose password");
    assert.ok(!rLoginPage.text.includes("Isi Kredensial Admin"), "Login page must not render demo credential button");

    const rCatalog1 = await req("/katalog/1");
    assert.equal(rCatalog1.status, 200);

    const rCatalog404 = await req("/katalog/999999");
    assert.equal(rCatalog404.status, 200);
    assert.ok(!rCatalog404.text.includes("Application error"));

    const rMotorsPublic = await req("/api/motor");
    assert.equal(rMotorsPublic.status, 200);
    const publicMotorList = rMotorsPublic.json?.data || [];
    assert.ok(publicMotorList.length >= 187);
    assert.equal("harga_beli" in publicMotorList[0], false, "Public GET /api/motor must NOT expose harga_beli");
    assert.equal("id_user" in publicMotorList[0], false, "Public GET /api/motor must NOT expose id_user");
    assert.ok(publicMotorList[0].estimasi_pasar?.rangeLow > 0, "Public GET /api/motor must include estimasi_pasar");

    const rMotor1Public = await req("/api/motor/1");
    assert.equal(rMotor1Public.status, 200);
    assert.equal("harga_beli" in rMotor1Public.json.data, false, "Public GET /api/motor/1 must NOT expose harga_beli");

    const rPredictPublic = await req("/api/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        merek: "Honda",
        cc: 125,
        tahun: 2021,
        kilometer: 18000,
        domisili_samsat: "Nganjuk (AG)",
        kondisi_mesin: "Sangat Baik",
        kelengkapan_dokumen: "Lengkap (STNK + BPKB)",
        harga_beli: 14500000,
        save_to_history: false,
      }),
    });
    assert.equal(rPredictPublic.status, 200);
    console.log("STEP 3 PUBLIC REDACTION & ML PREDICT: PASSED");

    // STEP 4: Login Rate Limit & Authenticated Admin Views
    for (let attempt = 1; attempt <= 5; attempt++) {
      const rProbe = await req("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "rate_limit_probe", password: "wrong" }),
      });
      assert.equal(rProbe.status, 401);
    }
    const rRateLimited = await req("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "rate_limit_probe", password: "wrong" }),
    });
    assert.equal(rRateLimited.status, 429);

    const rBadLogin = await req("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "admin_otista", password: "WrongPassword" }),
    });
    assert.equal(rBadLogin.status, 401);

    const rLogin = await req("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "admin_otista", password: "AdminRoda2026!", rememberMe: false }),
    });
    assert.equal(rLogin.status, 200);
    const token = parseCookieValue(rLogin.headers.get("set-cookie"), "rodamotorku_token");
    assert.ok(token);
    adminCookie = `rodamotorku_token=${token}`;

    const rAdminAuth = await req("/admin/dashboard", { headers: { Cookie: adminCookie } });
    assert.equal(rAdminAuth.status, 200);
    assert.ok(!rAdminAuth.text.includes("Katalog Publik"), "Admin dashboard must not render Katalog Publik");

    const rMotorsAdmin = await req("/api/motor", { headers: { Cookie: adminCookie } });
    assert.equal(rMotorsAdmin.status, 200);
    assert.ok(typeof rMotorsAdmin.json.data[0].harga_beli === "number", "Admin GET /api/motor must include harga_beli");

    const rMeAuth = await req("/api/auth/me", { headers: { Cookie: adminCookie } });
    assert.equal(rMeAuth.status, 200);
    assert.equal(rMeAuth.json?.data?.username, "admin_otista");

    const rStats = await req("/api/stats", { headers: { Cookie: adminCookie } });
    assert.equal(rStats.status, 200);
    console.log("STEP 4 LOGIN, RATE LIMIT & ADMIN VIEWS: PASSED");

    // STEP 5: Upload Magic-Byte Validation, Serve & Traversal Protection
    const badForm = new FormData();
    badForm.append("file", new Blob([Buffer.from("NOT_A_REAL_JPEG")], { type: "image/jpeg" }), "fake.jpg");
    const rBadUpload = await req("/api/upload", {
      method: "POST",
      headers: { Cookie: adminCookie },
      body: badForm,
    });
    assert.equal(rBadUpload.status, 400);

    const png1x1 = Buffer.from(
      "89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000a49444154789c63000100000500010d0a2db40000000049454e44ae426082",
      "hex"
    );
    const okForm = new FormData();
    okForm.append("file", new Blob([png1x1], { type: "image/png" }), "smoke-test.png");
    const rOkUpload = await req("/api/upload", {
      method: "POST",
      headers: { Cookie: adminCookie },
      body: okForm,
    });
    assert.equal(rOkUpload.status, 200);
    const uploadedUrl = rOkUpload.json?.url;
    assert.ok(uploadedUrl && uploadedUrl.startsWith("/api/upload/"));
    uploadedFilesToCleanup.push(path.join(ROOT, "public", "uploads", path.basename(uploadedUrl)));

    const rServeUpload = await req(uploadedUrl);
    assert.equal(rServeUpload.status, 200);
    assert.equal(rServeUpload.headers.get("content-type"), "image/png");

    const rTraversal = await req("/api/upload/..%2F..%2Fpackage.json");
    assert.ok(rTraversal.status === 400 || rTraversal.status === 404);
    console.log("STEP 5 UPLOAD, SERVE & TRAVERSAL GUARD: PASSED");

    // STEP 6: Full CRUD + Mass Assignment Guard + View Throttle + Prediction Link/Delete + Logout
    const rBadMotor = await req("/api/motor", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: adminCookie },
      body: JSON.stringify({ tipe: "Invalid", merek: "Honda", tahun: 1800, harga_beli: 1000000, harga_jual: 2000000 }),
    });
    assert.equal(rBadMotor.status, 400);

    const rCreateMotor = await req("/api/motor", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: adminCookie },
      body: JSON.stringify({
        tipe: "Smoke Test Beat Deluxe",
        merek: "Honda",
        sku: "RDM-SMOKE-999",
        nopol: "AG 9999 SMO",
        tahun: 2022,
        cc: 110,
        kilometer: 12000,
        harga_beli: 11500000,
        harga_jual: 14200000,
        domisili_samsat: "Nganjuk (AG)",
        kondisi_mesin: "Sangat Baik",
        kelengkapan_dokumen: "Lengkap (STNK + BPKB)",
        status: "Tersedia",
        foto_motor: [{ nama_file: uploadedUrl, label: "Foto Utama", is_utama: true }],
      }),
    });
    assert.equal(rCreateMotor.status, 201);
    createdMotorId = rCreateMotor.json?.data?.id_motor;
    assert.ok(Number.isInteger(createdMotorId));

    const rUpdateMotor = await req(`/api/motor/${createdMotorId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Cookie: adminCookie },
      body: JSON.stringify({
        harga_jual: 14500000,
        id_motor: 999999,
        created_by: 999,
      }),
    });
    assert.equal(rUpdateMotor.status, 200);
    assert.equal(rUpdateMotor.json?.data?.id_motor, createdMotorId);
    assert.equal(rUpdateMotor.json?.data?.harga_jual, 14500000);

    const rView1 = await req(`/api/motor/${createdMotorId}/view`, { method: "POST" });
    assert.equal(rView1.status, 200);
    assert.equal(rView1.json?.data?.views_week, 1);

    const rView2 = await req(`/api/motor/${createdMotorId}/view`, { method: "POST" });
    assert.equal(rView2.status, 200);
    assert.equal(rView2.json?.data?.views_week, 1, "Rapid refresh must be throttled at views_week=1");
    assert.equal(rView2.json?.data?.throttled, true);

    const rCreatePred = await req("/api/prediksi", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: adminCookie },
      body: JSON.stringify({
        merek: "Honda",
        nama_motor_katalog: "Smoke Test Beat Deluxe",
        cc: 110,
        tahun: 2022,
        kilometer: 12000,
        domisili_samsat: "Nganjuk (AG)",
        kondisi_mesin: "Sangat Baik",
        kelengkapan_dokumen: "Lengkap (STNK + BPKB)",
        harga_beli: 11500000,
        save_to_history: true,
      }),
    });
    assert.equal(rCreatePred.status, 200);
    createdPredId = rCreatePred.json?.data?.saved_record?.id_prediksi;
    assert.ok(Number.isInteger(createdPredId));

    const rUpdatePred = await req(`/api/prediksi/${createdPredId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Cookie: adminCookie },
      body: JSON.stringify({ harga_estimasi: 13800000, catatan_simulasi: "Smoke test updated" }),
    });
    assert.equal(rUpdatePred.status, 200);
    assert.equal(rUpdatePred.json?.data?.harga_estimasi, 13800000);

    const rLinkPred = await req("/api/prediksi/link", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: adminCookie },
      body: JSON.stringify({ id_prediksi: createdPredId, id_motor: createdMotorId }),
    });
    assert.equal(rLinkPred.status, 200);

    const rDeleteMotor = await req(`/api/motor/${createdMotorId}`, {
      method: "DELETE",
      headers: { Cookie: adminCookie },
    });
    assert.equal(rDeleteMotor.status, 200);
    createdMotorId = null;

    const rDeletePred = await req(`/api/prediksi/${createdPredId}`, {
      method: "DELETE",
      headers: { Cookie: adminCookie },
    });
    assert.equal(rDeletePred.status, 200);
    createdPredId = null;

    const rLogout = await req("/api/auth/logout", {
      method: "POST",
      headers: { Cookie: adminCookie },
    });
    assert.equal(rLogout.status, 200);
    console.log("STEP 6 CRUD + VIEW THROTTLE + PREDICTION + LOGOUT: PASSED");
  } finally {
    if (createdMotorId && adminCookie) {
      await req(`/api/motor/${createdMotorId}`, { method: "DELETE", headers: { Cookie: adminCookie } }).catch(() => {});
    }
    if (createdPredId && adminCookie) {
      await req(`/api/prediksi/${createdPredId}`, { method: "DELETE", headers: { Cookie: adminCookie } }).catch(() => {});
    }
    for (const filePath of uploadedFilesToCleanup) {
      try {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      } catch {
        // ignore cleanup errors
      }
    }
    server.kill("SIGTERM");
    await new Promise((r) => setTimeout(r, 300));
    if (!server.killed) server.kill("SIGKILL");
  }

  if (initialStore && fs.existsSync(storePath)) {
    const store = JSON.parse(fs.readFileSync(storePath, "utf8"));
    assert.ok(store.users[0].password_hash.startsWith("scrypt:"));
    assert.equal(store.motors.length, initialStore.motors.length);
    assert.equal(store.predictions.length, initialStore.predictions.length);
    console.log("STEP 7 DB_STORE INTEGRITY: PASSED", JSON.stringify({
      motorsCount: store.motors.length,
      predictionsCount: store.predictions.length,
    }));
  }
}

main().catch((err) => {
  console.error("SMOKE TEST FAILED:", err);
  process.exit(1);
});
