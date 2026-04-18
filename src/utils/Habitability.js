export function getHabitabilityScore(planet) {
  let score = 0
  let reasons = []

  // Temperature (0-25 points)
  if (planet.temperature >= 0 && planet.temperature <= 30) {
    score += 25
    reasons.push("✅ Comfortable temperature range")
  } else if (planet.temperature >= -20 && planet.temperature <= 60) {
    score += 15
    reasons.push("⚠️ Temperature is survivable but harsh")
  } else {
    reasons.push("❌ Temperature is too extreme")
  }

  // Water Coverage (0-25 points)
  if (planet.waterCoverage >= 40 && planet.waterCoverage <= 80) {
    score += 25
    reasons.push("✅ Good water coverage")
  } else if (planet.waterCoverage >= 20 && planet.waterCoverage <= 90) {
    score += 15
    reasons.push("⚠️ Water coverage is manageable")
  } else {
    reasons.push("❌ Water coverage is too low or too high")
  }

  // Atmosphere (0-25 points)
  if (planet.atmosphere === "Nitrogen-Oxygen") {
    score += 25
    reasons.push("✅ Breathable atmosphere")
  } else if (planet.atmosphere === "CO2" || planet.atmosphere === "Nitrogen") {
    score += 10
    reasons.push("⚠️ Atmosphere is present but not breathable")
  } else {
    reasons.push("❌ Atmosphere is toxic or absent")
  }

  // Mass (0-15 points)
  if (planet.mass >= 0.5 && planet.mass <= 2) {
    score += 15
    reasons.push("✅ Comfortable gravity")
  } else if (planet.mass >= 0.3 && planet.mass <= 5) {
    score += 8
    reasons.push("⚠️ Gravity is survivable but uncomfortable")
  } else {
    reasons.push("❌ Gravity is too strong or too weak to survive")
  }

  // Weather (0-10 points)
  if (planet.weather === "Mild") {
    score += 10
    reasons.push("✅ Stable and mild weather")
  } else if (planet.weather === "Moderate") {
    score += 6
    reasons.push("⚠️ Weather is manageable")
  } else if (planet.weather === "Extreme") {
    reasons.push("❌ Weather is too dangerous")
  }

  // Final verdict
  let verdict
  if (score >= 70) {
    verdict = "Habitable"
  } else if (score >= 50) {
    verdict = "Marginally Habitable"
  } else {
    verdict = "Not Habitable"
  }

  return { score, verdict, reasons }
}