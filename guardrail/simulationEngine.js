// ================================================
// Mock Simulation Engine
// Simulates calling a contract at a specific block
// and records what behavior was observed
// ================================================

async function simulateTransaction(
  contract,
  method,
  args,
  options = {}
) {
  const result = {
    method,
    args,
    simulationBlock: options.simulationBlock ?? "current",
    success: false,
    events: [],
    revertReason: null,
    observedBehavior: null,
  };

  try {
    // Use callStatic to simulate without sending a transaction
    const staticResult = await contract[method].staticCall(
      ...args,
      options.callOptions ?? {}
    );

    result.success = true;
    result.observedBehavior = "NORMAL";
    result.staticResult = staticResult;
  } catch (err) {
    result.success = false;
    result.revertReason = err.message;
    result.observedBehavior = "REVERTED";
  }

  return result;
}

// ================================================
// Evaluate simulation result for anomalies
// ================================================

function evaluateSimulationResult(simulationResult) {
  // If simulation reverted, flag it
  if (simulationResult.observedBehavior === "REVERTED") {
    return {
      allowed: false,
      verdict: "SIMULATION_REVERTED",
      reason: `Simulation reverted: ${simulationResult.revertReason}`,
    };
  }

  // If simulation passed cleanly
  return {
    allowed: true,
    verdict: "SIMULATION_PASSED",
    reason:
      "Simulation completed without revert. NOTE: Clean simulation does not guarantee safe live execution.",
  };
}

export { simulateTransaction, evaluateSimulationResult };