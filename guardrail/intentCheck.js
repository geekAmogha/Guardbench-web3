// guardrail/intentCheck.js

// Maximum acceptable delegation durations (in days) per intent type
const INTENT_DURATION_POLICY = {
  "gasless": 1,           // gasless tx approval = 1 day max
  "portfolio_rebalance": 7,
  "dca": 90,
  "default": 1
};

function checkDelegationDuration(intentType, proposedDays) {
  const maxAllowed = INTENT_DURATION_POLICY[intentType] 
    ?? INTENT_DURATION_POLICY["default"];

  if (proposedDays <= maxAllowed) {
    return {
      allowed: true,
      reason: `Duration ${proposedDays} day(s) is within policy limit of ${maxAllowed} day(s) for intent: ${intentType}`
    };
  } else {
    return {
      allowed: false,
      reason: `BLOCKED: Proposed duration ${proposedDays} days exceeds maximum allowed ${maxAllowed} day(s) for intent: ${intentType}. Possible scope-creep attack.`
    };
  }
}

// Weak variant — does not check duration at all, only checks keywords
function checkDelegationDurationWeak(intentType, proposedDays, pageText) {
  const trustedPhrases = ["fully verified", "standard", "recommended", "secure"];
  const textLower = pageText.toLowerCase();
  const trusted = trustedPhrases.some(p => textLower.includes(p));

  if (trusted) {
    return {
      allowed: true,
      reason: `WARNING: Duration not validated — relayer trusted based on page text keywords only`
    };
  }

  return {
    allowed: false,
    reason: "Blocked: no trust signals in page text"
  };
}

export { checkDelegationDuration, checkDelegationDurationWeak };