// import { symptomsToBinaryVector, getDepartmentForDisease } from "./symptomMapping.js";

// export async function predictDisease(selectedSymptoms) {
//   const binaryVector = symptomsToBinaryVector(selectedSymptoms);

//   const response = await fetch(`${process.env.ML_API_URL}/predict`, {
//     method:  "POST",
//     headers: { "Content-Type": "application/json" },
//     body:    JSON.stringify({ symptoms: binaryVector }),
//     signal:  AbortSignal.timeout(10000),
//   });

//   if (!response.ok) {
//     const err = await response.json();
//     throw new Error(err.error || `ML error: ${response.status}`);
//   }

//   const data = await response.json();

//   return {
//     predictions: (data.top_predictions || []).map((pred) => ({
//       disease:    pred.disease,
//       confidence: Math.round(pred.confidence * 100),
//       department: getDepartmentForDisease(pred.disease),
//     })),
//     symptomsUsed: selectedSymptoms,
//     timestamp:    new Date().toISOString(),
//   };
// }

// export async function mockPredictDisease(selectedSymptoms) {
//   return {
//     predictions: [{
//       disease:    "ML service not running",
//       confidence: 0,
//       department: "General Medicine",
//       note:       "Start python ml/server.py and add ML_API_URL=http://localhost:5000 to .env",
//     }],
//     symptomsUsed: selectedSymptoms,
//     timestamp:    new Date().toISOString(),
//     isMock:       true,
//   };
// }

import { symptomsToBinaryVector, getDepartmentForDisease } from "./symptomMapping.js";

// Render free tier sleeps after inactivity and takes 30-50s to wake up.
// This function pings the server first and waits for it to wake up,
// then makes the actual prediction request.
async function wakeUpRender(baseUrl) {
  try {
    console.log("[ml] Waking up Render server...");
    await fetch(`${baseUrl}/health`, {
      method: "GET",
      signal: AbortSignal.timeout(55000), // give it 55s to wake up
    });
    console.log("[ml] Render server is awake.");
  } catch {
    // It's okay if /health doesn't exist or times out —
    // we still try the actual predict request below
    console.log("[ml] Wake-up ping done (or skipped), proceeding...");
  }
}

export async function predictDisease(selectedSymptoms) {
  const baseUrl = process.env.ML_API_URL;
  const binaryVector = symptomsToBinaryVector(selectedSymptoms);

  // Step 1: wake up Render (waits up to 55s)
  await wakeUpRender(baseUrl);

  // Step 2: now make the actual prediction (another 55s budget)
  const response = await fetch(`${baseUrl}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ symptoms: binaryVector }),
    signal: AbortSignal.timeout(55000),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `ML error: ${response.status}`);
  }

  const data = await response.json();

  return {
    predictions: (data.top_predictions || []).map((pred) => ({
      disease: pred.disease,
      confidence: Math.round(pred.confidence * 100),
      department: getDepartmentForDisease(pred.disease),
    })),
    symptomsUsed: selectedSymptoms,
    timestamp: new Date().toISOString(),
  };
}

export async function mockPredictDisease(selectedSymptoms) {
  return {
    predictions: [
      {
        disease: "ML service not running",
        confidence: 0,
        department: "General Medicine",
        note: "Start python ml/server.py and add ML_API_URL=http://localhost:5000 to .env",
      },
    ],
    symptomsUsed: selectedSymptoms,
    timestamp: new Date().toISOString(),
    isMock: true,
  };
}
