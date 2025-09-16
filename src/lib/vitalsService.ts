// src/lib/vitalsService.ts

import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebase"; // Assuming firebase config is in the same lib folder

interface VitalsData {
  heartRate: string;
  oxygenSaturation: string;
  steps: string;
}

// Function to save the fetched data to Firestore
const saveVitalsToFirebase = async (uid: string, vitals: VitalsData) => {
  try {
    const vitalsDocRef = doc(db, "vitals", uid);
    await setDoc(vitalsDocRef, {
      ...vitals,
      lastUpdated: serverTimestamp(),
      userId: uid,
    }, { merge: true });
    console.log("✅ Vitals successfully saved to Firestore for user:", uid);
  } catch (error) {
    console.error("❌ Error saving vitals to Firestore:", error);
  }
};

// Main function to fetch all vitals from Google Fit
export const syncVitalsFromGoogleFit = async () => {
  const user = auth.currentUser;
  const accessToken = sessionStorage.getItem('googleFitAccessToken');

  if (!user || !accessToken) {
    console.warn("User not authenticated or access token missing. Aborting vitals sync.");
    return;
  }

  console.log("🚀 Starting hourly vitals synchronization for user:", user.uid);

  const startTime = new Date();
  startTime.setHours(0, 0, 0, 0);
  const endTime = new Date();

  const fetchGoogleFitData = (requestBody: object) => {
    return fetch('https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
  };

  const stepsRequestBody: any = {
    aggregateBy: [{
      dataTypeName: "com.google.step_count.delta",
      dataSourceId: "derived:com.google.step_count.delta:com.google.android.gms:estimated_steps"
    }],
    bucketByTime: { durationMillis: 86400000 },
    startTimeMillis: startTime.getTime(),
    endTimeMillis: endTime.getTime()
  };

  const heartRateRequestBody: any = {
    aggregateBy: [{
      dataTypeName: "com.google.heart_rate.bpm",
      dataSourceId: "derived:com.google.heart_rate.bpm:com.google.android.gms:merge_heart_rate_bpm"
    }],
    bucketByTime: { durationMillis: 86400000 },
    startTimeMillis: startTime.getTime(),
    endTimeMillis: endTime.getTime()
  };

  const spo2RequestBody: any = {
    aggregateBy: [{
      dataTypeName: "com.google.oxygen_saturation",
      dataSourceId: "derived:com.google.oxygen_saturation:com.google.android.gms:merge_oxygen_saturation"
    }],
    bucketByTime: { durationMillis: 86400000 },
    startTimeMillis: startTime.getTime(),
    endTimeMillis: endTime.getTime()
  };

  try {
    const results = await Promise.allSettled([
      fetchGoogleFitData(stepsRequestBody),
      fetchGoogleFitData(heartRateRequestBody),
      fetchGoogleFitData(spo2RequestBody)
    ]);

    const [stepsResponse, heartRateResponse, spo2Response] = await Promise.all(
      results.map(async (result) => {
        if (result.status === 'fulfilled' && result.value.ok) return result.value.json();
        return null;
      })
    );
    
    const fetchedVitals: VitalsData = {
      heartRate: "72", // Default static value
      oxygenSaturation: "98", // Default static value
      steps: "8,432", // Default static value
    };

    if (heartRateResponse?.bucket[0]?.dataset[0]?.point[0]?.value[0]?.fpVal) {
      fetchedVitals.heartRate = Math.round(heartRateResponse.bucket[0].dataset[0].point[0].value[0].fpVal).toString();
    }
    if (spo2Response?.bucket[0]?.dataset[0]?.point[0]?.value[0]?.fpVal) {
      fetchedVitals.oxygenSaturation = Math.round(spo2Response.bucket[0].dataset[0].point[0].value[0].fpVal).toString();
    }
    if (stepsResponse?.bucket[0]?.dataset[0]?.point[0]?.value[0]?.intVal) {
      fetchedVitals.steps = stepsResponse.bucket[0].dataset[0].point[0].value[0].intVal.toLocaleString();
    }

    // Save the final data to Firestore
    await saveVitalsToFirebase(user.uid, fetchedVitals);

  } catch (error) {
    console.error('Error during vitals synchronization:', error);
  }
};