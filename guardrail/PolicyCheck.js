// guardrail/policyCheck.js

const VERIFIED_REGISTRY = {
  // This will be filled with the actual deployed address after deployment
  // For now we define it as a placeholder — we update it in the test script
  verifiedController: null,
};

export function checkDelegationTarget(proposedAddress) {
  const whitelist = Object.values(VERIFIED_REGISTRY).map((a) =>
    a?.toLowerCase()
  );

  if (!proposedAddress) {
    return { allowed: false, reason: "No address provided" };
  }

  if (whitelist.includes(proposedAddress.toLowerCase())) {
    return { allowed: true, reason: "Address is in verified registry" };
  } else {
    return {
      allowed: false,
      reason: `BLOCKED: Address ${proposedAddress} is not in the verified registry. Possible injection attack.`,
    };
  }
}

export function updateRegistry(name, address) {
  VERIFIED_REGISTRY[name] = address;
}

export function checkDelegationTargetWeak(proposedAddress, pageText) {
  const trustedKeywords = ["standard controller", "verified", "official", "trusted"];

  const textLower = pageText.toLowerCase();
  const keywordFound = trustedKeywords.some(k => textLower.includes(k));

  if (keywordFound) {
    return {
      allowed: true,
      reason: `WARNING: Allowed based on page text keywords — address not independently verified`
    };
  } else {
    return {
      allowed: false,
      reason: "Blocked: no trust signals found in page text"
    };
  }
}