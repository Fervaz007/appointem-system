import { createClient } from "@supabase/supabase-js";
import fs from "fs";

// Read .env.local manually
const envFile = fs.readFileSync(".env.local", "utf8");
const env = {};
envFile.split("\n").forEach(line => {
  const parts = line.split("=");
  if (parts.length === 2) {
    env[parts[0].trim()] = parts[1].trim();
  }
});

console.log("URL:", env.NEXT_PUBLIC_SUPABASE_URL);
console.log("KEY:", env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ? "Present" : "Missing");

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

async function run() {
  const { data, error } = await supabase.from("services").select("*").limit(5);
  if (error) {
    console.error("Error fetching services:", error);
  } else {
    console.log("Services:", data);
  }
}

run();
