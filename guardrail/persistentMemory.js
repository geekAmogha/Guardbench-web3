import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

// ================================================
// Persistent Memory Store
// Used by S09 and S10
// Memory survives across multiple agent sessions
// ================================================

const MEMORY_DIR = join(process.cwd(), "memory");
const MEMORY_FILE = join(MEMORY_DIR, "agentMemory.json");

// ------------------------------------------------
// Internal Helpers
// ------------------------------------------------

function initializeMemory() {
  if (!existsSync(MEMORY_DIR)) {
    mkdirSync(MEMORY_DIR);
  }

  if (!existsSync(MEMORY_FILE)) {
    writeFileSync(
      MEMORY_FILE,
      JSON.stringify({}, null, 2)
    );
  }
}

function loadMemory() {
  initializeMemory();

  return JSON.parse(
    readFileSync(MEMORY_FILE, "utf8")
  );
}

function saveMemoryObject(memory) {
  writeFileSync(
    MEMORY_FILE,
    JSON.stringify(memory, null, 2)
  );
}

// ------------------------------------------------
// Public API
// ------------------------------------------------

function resetMemory() {
  saveMemoryObject({});
}

function saveMemory(
  key,
  value,
  metadata = {}
) {

  const memory = loadMemory();

  memory[key] = {
    ...value,
    metadata: {
      source:
        metadata.source ?? "unknown",

      confidence:
        metadata.confidence ?? 1.0,

      storedAt:
        new Date().toISOString()
    }
  };

  saveMemoryObject(memory);

  return memory[key];
}

function getMemory(key) {

  const memory = loadMemory();

  return memory[key] ?? null;
}

function hasMemory(key) {

  const memory = loadMemory();

  return key in memory;
}

function deleteMemory(key) {

  const memory = loadMemory();

  delete memory[key];

  saveMemoryObject(memory);
}

function getAllMemory() {
  return loadMemory();
}

function printMemory(title = "Agent Memory") {

  console.log("===========================================");
  console.log(title);
  console.log("===========================================");

  const memory = loadMemory();

  if (Object.keys(memory).length === 0) {
    console.log("(empty)");
    return;
  }

  for (const [key, value] of Object.entries(memory)) {

    console.log(`${key}`);

    console.log("  Value    :", value.value);

    console.log("  Source   :", value.source);

    console.log("  StoredAt :", value.storedAt);

    console.log();
  }
}

// ------------------------------------------------
// Benchmark Utility
// ------------------------------------------------

function compareMemory(before, after) {

  const added = [];

  for (const key of Object.keys(after)) {

    if (!(key in before)) {

      added.push(key);

    }
  }

  return {
    added,
    changed:
      JSON.stringify(before) !==
      JSON.stringify(after)
  };
}

export {
  resetMemory,
  saveMemory,
  getMemory,
  hasMemory,
  deleteMemory,
  getAllMemory,
  printMemory,
  compareMemory
};