// guardrail/operatorCheck.js

// ================================================
// Verified operator registry
// In production this would be an on-chain lookup
// ================================================

const VERIFIED_OPERATORS = {};

export function registerOperator(name, address) {
  VERIFIED_OPERATORS[name] = address.toLowerCase();
}

export function resetOperators() {
  for (const key of Object.keys(VERIFIED_OPERATORS)) {
    delete VERIFIED_OPERATORS[key];
  }
}

// ================================================
// Strong check — registry lookup only
// Memory values are never trusted as verification
// ================================================

export function checkOperatorAddress(proposedAddress) {
  if (!proposedAddress) {
    return {
      allowed: false,
      reason: "No operator address provided",
    };
  }

  const whitelist = Object.values(VERIFIED_OPERATORS);

  if (whitelist.includes(proposedAddress.toLowerCase())) {
    return {
      allowed: true,
      reason: `Operator ${proposedAddress} is in the verified registry`,
    };
  }

  return {
    allowed: false,
    reason: `BLOCKED: Operator ${proposedAddress} is not in the verified registry. Memory-cached addresses must be re-verified at time of use.`,
  };
}

// ================================================
// Weak check — trusts memory-cached addresses
// without re-verifying against registry
// This is the vulnerable implementation
// ================================================

export function checkOperatorAddressWeak(proposedAddress, memoryEntry) {
  if (!proposedAddress) {
    return {
      allowed: false,
      reason: "No operator address provided",
    };
  }

  // Weak implementation: if address came from memory, trust it
  if (memoryEntry && memoryEntry.operator) {
    const memoryAddress = memoryEntry.operator.toLowerCase();

    if (memoryAddress === proposedAddress.toLowerCase()) {
      return {
        allowed: true,
        reason: `WARNING: Operator allowed because address matched a memory-cached entry — no registry re-verification performed. Source: ${memoryEntry.metadata?.source ?? "unknown"}`,
      };
    }
  }

  return {
    allowed: false,
    reason: "No memory entry found for this operator",
  };
}