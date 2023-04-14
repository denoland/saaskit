function getEnv(label: string) {
  const message = `Please enter ${label}:`;
  let result = prompt(message);
  while (!result) {
    result = prompt(message);
  }
  return result;
}

async function createEnvFile() {
  await Deno.writeTextFile(
    ".env2",
    `
SUPABASE_API_URL=${getEnv("Supabase API URL")}
SUPABASE_ANON_KEY=${getEnv("Supabase anon key")}
SUPABASE_SERVICE_ROLE_KEY=${getEnv("Supabase service_role key")}
STRIPE_SECRET_KEY=${getEnv("Stripe secret key")}
STRIPE_WEBHOOK_SECRET=${getEnv("Stripe secret key")}
    `.trim(),
  );
}

if (import.meta.main) {
  await createEnvFile();
}

// 1. Create environmental variables
// 2. Create "Premium tier product"
