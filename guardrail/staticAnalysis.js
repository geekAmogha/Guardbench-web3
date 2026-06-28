import { readFileSync } from "fs";
import { join } from "path";

// ================================================
// Known dangerous patterns for simulation evasion
// ================================================

const DANGEROUS_PATTERNS = [
  {
    id: "BLOCK_NUMBER_GATE",
    severity: "CRITICAL",
    pattern: /block\.number/g,
    description: "Contract behavior is conditional on block.number",
    reason:
      "Block-number gating allows contracts to behave differently during simulation vs live execution. A contract can pass simulation at any block and drain funds only at a specific target block.",
  },
  {
    id: "BLOCK_TIMESTAMP_GATE",
    severity: "HIGH",
    pattern: /block\.timestamp/g,
    description: "Contract behavior is conditional on block.timestamp",
    reason:
      "Timestamp gating is similar to block-number gating and can be used to defer malicious behavior past simulation windows.",
  },
  {
    id: "TX_ORIGIN_CHECK",
    severity: "CRITICAL",
    pattern: /tx\.origin/g,
    description: "Contract uses tx.origin for conditional logic",
    reason:
      "tx.origin differs between simulation and live broadcast contexts. Contracts checking tx.origin == msg.sender will behave benignly in simulation and maliciously in real transactions.",
  },
  {
    id: "TX_ORIGIN_EQUALITY",
    severity: "CRITICAL",
    pattern: /tx\.origin\s*==\s*msg\.sender/g,
    description: "Contract explicitly checks tx.origin == msg.sender",
    reason:
      "This is a known simulation-detection pattern. The condition is false in simulation frameworks where transactions pass through intermediaries, and true in direct user broadcasts.",
  },
  {
    id: "SELFDESTRUCT",
    severity: "CRITICAL",
    pattern: /selfdestruct|suicide/g,
    description: "Contract contains selfdestruct",
    reason:
      "Selfdestruct can be used to destroy contract state after draining, removing evidence.",
  },
  {
    id: "DELEGATECALL",
    severity: "HIGH",
    pattern: /delegatecall/g,
    description: "Contract uses delegatecall",
    reason:
      "Delegatecall executes external code in the context of the calling contract and can be used to inject malicious logic after simulation.",
  },
];

// ================================================
// Static analysis function
// ================================================

function analyzeContractSource(contractName, sourceCode) {
  const findings = [];

  for (const rule of DANGEROUS_PATTERNS) {
    const matches = sourceCode.match(rule.pattern);
    if (matches) {
      findings.push({
        id: rule.id,
        severity: rule.severity,
        description: rule.description,
        reason: rule.reason,
        occurrences: matches.length,
      });
    }
  }

  const hasCritical = findings.some((f) => f.severity === "CRITICAL");
  const hasHigh = findings.some((f) => f.severity === "HIGH");

  let verdict;
  let allowed;

  if (hasCritical) {
    verdict = "BLOCK";
    allowed = false;
  } else if (hasHigh) {
    verdict = "WARN";
    allowed = false;
  } else if (findings.length === 0) {
    verdict = "CLEAN";
    allowed = true;
  } else {
    verdict = "WARN";
    allowed = false;
  }

  return {
    contractName,
    allowed,
    verdict,
    findingsCount: findings.length,
    findings,
    summary:
      findings.length === 0
        ? "No dangerous patterns detected"
        : `${findings.length} dangerous pattern(s) found: ${findings.map((f) => f.id).join(", ")}`,
  };
}

// ================================================
// Load and analyze a contract from contracts/ folder
// ================================================

function analyzeContractFile(contractName) {
  const filePath = join(
    process.cwd(),
    "contracts",
    `${contractName}.sol`
  );

  let sourceCode;

  try {
    sourceCode = readFileSync(filePath, "utf8");
  } catch (err) {
    return {
      contractName,
      allowed: false,
      verdict: "ERROR",
      findingsCount: 0,
      findings: [],
      summary: `Could not read contract source: ${err.message}`,
    };
  }

  return analyzeContractSource(contractName, sourceCode);
}

export { analyzeContractFile, analyzeContractSource, DANGEROUS_PATTERNS };