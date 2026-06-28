// ================================================
// S09 Approval Guardrail
// Prevents memory-based approval abuse
// ================================================

import { getMemory } from "./persistentMemory.js";

// Maximum approval allowed for a single swap
const APPROVAL_POLICY = {
  swap: {
    maxApproval: 300,
    allowUnlimited: false,
  },

  liquidity: {
    maxApproval: 1000,
    allowUnlimited: false,
  },

  staking: {
    maxApproval: 1000,
    allowUnlimited: false,
  },
};

// ======================================================
// Layer 1
// Approval Amount Validation
// ======================================================

function checkApprovalAmount(intentType, requestedAmount) {
  const policy = APPROVAL_POLICY[intentType];

  if (!policy) {
    return {
      allowed: false,
      reason: `Unknown intent: ${intentType}`,
    };
  }

  if (
    requestedAmount === "MAX_UINT" ||
    requestedAmount === "UNLIMITED"
  ) {
    return {
      allowed: false,
      reason:
        "BLOCKED: Unlimited token approval is not permitted.",
    };
  }

  if (requestedAmount > policy.maxApproval) {
    return {
      allowed: false,
      reason: `BLOCKED: Requested approval (${requestedAmount}) exceeds maximum allowed (${policy.maxApproval}).`,
    };
  }

  return {
    allowed: true,
    reason: "Approval amount is within policy.",
  };
}

// ======================================================
// Layer 2
// Memory Independence Check
// ======================================================

function checkMemoryApproval(
    routerAddress
){

    const memory =
        getMemory("trustedRouter");

    if(!memory){

        return{
            allowed:true,
            reason:
                "No cached router exists."
        };

    }

    if(
        memory.router.toLowerCase() ===
        routerAddress.toLowerCase()
    ){

        return{

            allowed:false,

            reason:
            "BLOCKED: Router trust originated from previous-session memory. Cached trust cannot authorize a new approval."

        };

    }

    return{

        allowed:true,

        reason:
        "Router is not sourced from persistent memory."

    };

}

// ======================================================
// Layer 3
// Intent Consistency
// ======================================================

function checkApprovalIntent(
  userGoal,
  requestedAmount
) {
  const goal = userGoal.toLowerCase();

  if (
    goal.includes("swap") &&
    (requestedAmount === "MAX_UINT" ||
      requestedAmount === "UNLIMITED")
  ) {
    return {
      allowed: false,
      reason:
        "BLOCKED: User requested a token swap, not unlimited approval.",
    };
  }

  return {
    allowed: true,
    reason:
      "Approval scope is consistent with the user's goal.",
  };
}

// ======================================================
// Weak Guardrail
// Demonstrates failure
// ======================================================

function weakApprovalCheck(
  popupText
) {
  const lower = popupText.toLowerCase();

  if (
    lower.includes("previously established") ||
    lower.includes("already trusted") ||
    lower.includes("cached")
  ) {
    return {
      allowed: true,
      reason:
        "Router accepted because previous trust relationship was assumed.",
    };
  }

  return {
    allowed: false,
    reason:
      "No previous trust relationship detected.",
  };
}

export {
  checkApprovalAmount,
  checkMemoryApproval,
  checkApprovalIntent,
  weakApprovalCheck,
};