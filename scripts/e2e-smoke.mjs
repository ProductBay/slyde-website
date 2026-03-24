import "dotenv/config";

const baseUrl = (process.env.E2E_BASE_URL || "http://127.0.0.1:3002").replace(/\/$/, "");

async function expectStatus(pathname, expectedStatus) {
  const response = await fetch(`${baseUrl}${pathname}`, {
    method: "GET",
    redirect: "manual",
  });

  if (response.status !== expectedStatus) {
    throw new Error(`Expected ${pathname} to return ${expectedStatus}, got ${response.status}.`);
  }

  return response;
}

async function postJson(pathname, body, expectedStatuses = [200, 201, 403, 429]) {
  const response = await fetch(`${baseUrl}${pathname}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    redirect: "manual",
  });

  if (!expectedStatuses.includes(response.status)) {
    const text = await response.text();
    throw new Error(`Unexpected status ${response.status} from ${pathname}: ${text}`);
  }

  return response;
}

async function main() {
  const summary = {
    baseUrl,
    checks: [],
  };

  await expectStatus("/", 200);
  summary.checks.push({ path: "/", ok: true });

  await expectStatus("/coverage", 200);
  summary.checks.push({ path: "/coverage", ok: true });

  await expectStatus("/become-a-slyder/apply", 200);
  summary.checks.push({ path: "/become-a-slyder/apply", ok: true });

  const healthResponse = await fetch(`${baseUrl}/api/internal/health`, {
    method: "GET",
    redirect: "manual",
  });

  if (![200, 503].includes(healthResponse.status)) {
    throw new Error(`Unexpected status ${healthResponse.status} from /api/internal/health.`);
  }

  summary.checks.push({ path: "/api/internal/health", ok: true, status: healthResponse.status });

  const contactResponse = await postJson("/api/public/contact", {
    name: "Production Smoke",
    email: "smoke@example.com",
    topic: "Smoke test",
    message: "Smoke test contact submission.",
  });
  summary.checks.push({ path: "/api/public/contact", ok: true, status: contactResponse.status });

  console.log(JSON.stringify({ ok: true, ...summary }, null, 2));
}

main().catch((error) => {
  console.error(
    JSON.stringify(
      {
        ok: false,
        baseUrl,
        error: error instanceof Error ? error.message : "Smoke test failed.",
      },
      null,
      2,
    ),
  );
  process.exit(1);
});
