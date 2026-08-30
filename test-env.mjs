console.log("ENV Keys:");
for (let key in process.env) {
  if (key.includes("SUPABASE") || key.includes("KEY") || key.includes("SECRET") || key.includes("DATABASE") || key.includes("POSTGRES")) {
    console.log(key, "=", process.env[key] ? "Present" : "Empty");
  }
}
