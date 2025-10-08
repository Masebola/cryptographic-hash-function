// Simple Hash Function using Modular Arithmetic
// This is educational - NOT for real cryptographic use!

const HASH_SIZE = 16 // 16-bit hash (0 to 65535)
const MODULUS = Math.pow(2, HASH_SIZE) // 65536

/**
 * Our custom hash function
 * Uses modular arithmetic to create a "fingerprint" of the input
 */
function simpleHash(input) {
  let hash = 5381 // Starting value (prime number)

  // Process each character
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i) // Get ASCII value

    // Mix the hash using modular arithmetic
    // This formula spreads values across the hash space
    hash = (hash * 33 + char) % MODULUS
    hash = ((hash << 5) + hash + char) % MODULUS // Bit shift for more mixing
  }

  return hash
}

/**
 * Convert hash to hexadecimal for display
 */
function hashToHex(hash) {
  return "0x" + hash.toString(16).toUpperCase().padStart(4, "0")
}

// ===== SECTION 1: Hash Function Demo =====

const inputText = document.getElementById("input-text")
const hashOutput = document.getElementById("hash-output")

function updateHash() {
  const text = inputText.value
  const hash = simpleHash(text)
  hashOutput.textContent = `${hashToHex(hash)} (decimal: ${hash})`
}

inputText.addEventListener("input", updateHash)
updateHash() // Initial calculation

// ===== SECTION 2: Birthday Attack Simulation =====

let birthdayAttackRunning = false
const hashMap = new Map() // Store hash -> input mapping
let attempts = 0

const runBirthdayBtn = document.getElementById("run-birthday")
const resetBirthdayBtn = document.getElementById("reset-birthday")
const attemptsDisplay = document.getElementById("attempts")
const uniqueHashesDisplay = document.getElementById("unique-hashes")
const collisionStatusDisplay = document.getElementById("collision-status")
const collisionResult = document.getElementById("collision-result")

function generateRandomString(length = 8) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let result = ""
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

function resetBirthdayAttack() {
  birthdayAttackRunning = false
  hashMap.clear()
  attempts = 0
  attemptsDisplay.textContent = "0"
  uniqueHashesDisplay.textContent = "0"
  collisionStatusDisplay.textContent = "No"
  collisionStatusDisplay.style.color = "#667eea"
  collisionResult.style.display = "none"
  runBirthdayBtn.disabled = false
  runBirthdayBtn.textContent = "Run Birthday Attack"
}

async function runBirthdayAttack() {
  if (birthdayAttackRunning) return

  birthdayAttackRunning = true
  runBirthdayBtn.disabled = true
  runBirthdayBtn.textContent = "Running..."
  hashMap.clear()
  attempts = 0

  // Run attack in chunks to keep UI responsive
  const runChunk = () => {
    for (let i = 0; i < 50; i++) {
      // Process 50 at a time
      attempts++
      const randomInput = generateRandomString()
      const hash = simpleHash(randomInput)

      // Check if we've seen this hash before
      if (hashMap.has(hash)) {
        // COLLISION FOUND!
        const originalInput = hashMap.get(hash)

        collisionStatusDisplay.textContent = "YES! 🎉"
        collisionStatusDisplay.style.color = "#28a745"

        document.getElementById("collision-input1").textContent = originalInput
        document.getElementById("collision-input2").textContent = randomInput
        document.getElementById("collision-hash").textContent = hashToHex(hash)
        collisionResult.style.display = "block"

        birthdayAttackRunning = false
        runBirthdayBtn.disabled = false
        runBirthdayBtn.textContent = "Run Birthday Attack"
        return
      }

      hashMap.set(hash, randomInput)
      attemptsDisplay.textContent = attempts
      uniqueHashesDisplay.textContent = hashMap.size
    }

    // Continue if no collision found
    if (birthdayAttackRunning && attempts < 10000) {
      setTimeout(runChunk, 0)
    } else if (attempts >= 10000) {
      birthdayAttackRunning = false
      runBirthdayBtn.disabled = false
      runBirthdayBtn.textContent = "Run Birthday Attack"
      alert("Stopped after 10,000 attempts. Try again!")
    }
  }

  runChunk()
}

runBirthdayBtn.addEventListener("click", runBirthdayAttack)
resetBirthdayBtn.addEventListener("click", resetBirthdayAttack)

// ===== SECTION 3: Differential Analysis =====

const diffInput = document.getElementById("diff-input")
const runDifferentialBtn = document.getElementById("run-differential")
const diffResults = document.getElementById("diff-results")

function runDifferentialAnalysis() {
  const baseInput = diffInput.value
  const baseHash = simpleHash(baseInput)

  let html = `<div class="diff-item">
        <strong>Original:</strong> "${baseInput}" → <code>${hashToHex(baseHash)}</code>
    </div>`

  // Test 1: Add one character
  const test1 = baseInput + "X"
  const hash1 = simpleHash(test1)
  const diff1 = Math.abs(hash1 - baseHash)
  html += `<div class="diff-item">
        <strong>Add 'X':</strong> "${test1}" → <code>${hashToHex(hash1)}</code><br>
        <small>Difference: ${diff1} (${((diff1 / MODULUS) * 100).toFixed(2)}% of hash space)</small>
    </div>`

  // Test 2: Change one character
  if (baseInput.length > 0) {
    const test2 = baseInput.slice(0, -1) + (baseInput.slice(-1) === "a" ? "b" : "a")
    const hash2 = simpleHash(test2)
    const diff2 = Math.abs(hash2 - baseHash)
    html += `<div class="diff-item">
            <strong>Change last char:</strong> "${test2}" → <code>${hashToHex(hash2)}</code><br>
            <small>Difference: ${diff2} (${((diff2 / MODULUS) * 100).toFixed(2)}% of hash space)</small>
        </div>`
  }

  // Test 3: Uppercase/lowercase
  const test3 = baseInput.toUpperCase()
  const hash3 = simpleHash(test3)
  const diff3 = Math.abs(hash3 - baseHash)
  html += `<div class="diff-item">
        <strong>Uppercase:</strong> "${test3}" → <code>${hashToHex(hash3)}</code><br>
        <small>Difference: ${diff3} (${((diff3 / MODULUS) * 100).toFixed(2)}% of hash space)</small>
    </div>`

  // Test 4: Reverse string
  const test4 = baseInput.split("").reverse().join("")
  const hash4 = simpleHash(test4)
  const diff4 = Math.abs(hash4 - baseHash)
  html += `<div class="diff-item">
        <strong>Reversed:</strong> "${test4}" → <code>${hashToHex(hash4)}</code><br>
        <small>Difference: ${diff4} (${((diff4 / MODULUS) * 100).toFixed(2)}% of hash space)</small>
    </div>`

  diffResults.innerHTML = html
}

runDifferentialBtn.addEventListener("click", runDifferentialAnalysis)

// ===== SECTION 4: Birthday Paradox Calculator =====

const hashBitsInput = document.getElementById("hash-bits")
const possibleValuesDisplay = document.getElementById("possible-values")
const expectedAttemptsDisplay = document.getElementById("expected-attempts")
const expectedAttempts99Display = document.getElementById("expected-attempts-99")

function updateBirthdayCalculations() {
  const bits = Number.parseInt(hashBitsInput.value)
  const possibleValues = Math.pow(2, bits)

  // Birthday paradox formula: sqrt(2 * N) for 50% probability
  const expected50 = Math.sqrt(2 * possibleValues)

  // For 99% probability: sqrt(2 * N * ln(1/(1-0.99)))
  const expected99 = Math.sqrt(2 * possibleValues * Math.log(1 / (1 - 0.99)))

  possibleValuesDisplay.textContent = possibleValues.toLocaleString()
  expectedAttemptsDisplay.textContent = `~${Math.round(expected50).toLocaleString()}`
  expectedAttempts99Display.textContent = `~${Math.round(expected99).toLocaleString()}`
}

hashBitsInput.addEventListener("input", updateBirthdayCalculations)
updateBirthdayCalculations()
