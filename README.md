# 🚑 DocMind

### Virtual Healthcare Assistant PWA

---

## 🌟 Project Overview

An **offline-first Progressive Web Application (PWA)** designed as a **virtual healthcare assistant** for patients, doctors, health workers, and family members.

**Key integrations:**

- 📱 Wearable device data (Google Fit / FastTrack Watch) for real-time vitals  
- 🤖 AI-powered diagnostics for X-ray scans and prescriptions (powered by **Gemini AI**)  
- 🚨 Emergency alert system with geo-tagging & volunteer notifications  
- 👪 Family monitoring portal for elderly or chronic patients  

> **Why this app?**  
> Completely offline-capable, AI-assisted, and emergency-aware — ideal for rural & low-connectivity areas.  
> Reduces dependence on in-person consultations while enhancing patient safety and awareness.

---

## ❗ Problem Statement

Many rural and underserved regions face:

- 🚫 Limited access to qualified doctors or hospitals  
- ⏳ Delays in emergency response  
- 🩺 Poor monitoring of chronic and elderly patients  
- 📄 Fragmented healthcare records causing mismanagement  

Existing apps often:

- Require continuous internet connectivity  
- Focus on either data logging or teleconsultation, not both  
- Lack emergency response mechanisms  

**Our solution:** A comprehensive, offline-first, AI-driven PWA addressing these gaps.

---

## 🎯 Objectives

- Build a **cross-platform PWA** with offline & installable capabilities  
- Integrate **wearable devices** for automatic vitals tracking  
- Provide **AI-assisted diagnostics** using X-ray scan analysis & prescription reading (via Gemini AI)  
- Enable **emergency alerts** with geo-tagging for ambulances & volunteers  
- Create a **patient-family portal** to improve monitoring & trust  
- Offer **role-based dashboards** for doctors, patients, and health workers  

---

## 🚀 Key Features

- 🦴 AI-powered X-ray analysis to detect fractures & bone anomalies using Gemini AI  
- 📝 Prescription scanning with OCR + NLP to read doctor notes & suggest medicines  
- ⌚ Integration with Google Fit / FastTrack Watch to track vitals & health metrics  
- 🚨 Emergency SOS button with direct hospital/ambulance calling  
- 📍 Emergency geo-tagging with local volunteer alerts if no ambulance is available  
- 👨‍👩‍👧‍👦 Patient-family portal for monitoring elderly patients with alerts  
- 🔐 Auth-based login for doctors, patients, and health workers with role dashboards  
- 🌐 Offline-first PWA functionality to work without internet  
- 🗣️ Symptom checker with multilingual voice/chat support for accessibility  
- 📱 QR health passport for paramedics to quickly access critical patient data  

---

## 🛠️ Tech Stack (Free & Easy to Integrate)

### Frontend

- React.js / Next.js — PWA with offline support  
- TailwindCSS + shadcn/ui — Responsive UI components  
- Service Workers + IndexedDB / Dexie.js — Offline data storage  

### Backend / Database

- Firebase Authentication — Role-based login system  
- Firebase Firestore — NoSQL DB with offline sync  
- Firebase Functions — Serverless AI preprocessing & notifications  

### AI & ML

- Gemini AI — AI assistant & reports analysis  
- TensorFlow.js — In-browser X-ray scan analysis  
- Tesseract.js — Prescription OCR  
- Hugging Face (free tier) — NLP for drug extraction & semantic reasoning  

### Wearable Integration

- Google Fit API — Heart rate, steps, SpO₂ tracking  
- FastTrack Watch API / CSV export — Wearable data ingestion  

### Maps & Geo Services

- OpenStreetMap + Leaflet.js — Hospital & volunteer mapping  
- Nominatim API — Free geocoding  

### Notifications & Alerts

- Firebase Cloud Messaging — Push notifications for emergencies  
- Textbelt / Twilio (free trial) — SMS fallback for SOS alerts  

### Reports & Utilities

- jsPDF — PDF health report generation  
- qrcode.js — QR health passport generation  
- Web Speech API — Multilingual voice input for symptom checker  

---

## 👥 User Roles

- **Patient:** Logs symptoms, views AI suggestions, triggers emergencies  
- **Doctor:** Reviews dashboards, validates AI recommendations, generates reports  
- **Health Worker / Volunteer:** Manages multiple patients offline, responds to SOS alerts  
- **Family Member:** Monitors patient health, receives critical alerts  

---

## 💡 Innovation & Differentiators

- Offline-first AI + wearable integration for rural usability  
- Emergency geo-tagging with volunteer network for instant assistance  
- Gemini AI-powered semantic reasoning to analyze scans & prescriptions automatically  
- Patient-family portal to build trust & improve adherence  
- Explainable AI for transparency to doctors and patients  

---

## 🔮 Future Scope

- Blockchain Health Vault — Secure patient data ownership & sharing  
- Integration with smart pill boxes & home medical devices  
- Smart ambulance routing with live vitals streaming  
- Community disease heatmap for outbreak monitoring  
- Voice assistant for elderly or low-literacy users  

---

## ⚙️ Getting Started

### Prerequisites

- Node.js (v14+)  
- npm or yarn  
- Firebase account for backend services  
- Google Fit / FastTrack Watch API access (optional)  

### Installation

```bash
git clone https://github.com/Rohithsilent/doc-mind-app.git
cd doc-mind-app
npm install
