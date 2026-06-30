# 🌍 Community Hero – Hyperlocal Problem Solver

Community Hero is a full-stack AI-powered web application that enables citizens to report, verify, and track local civic issues such as potholes, garbage accumulation, streetlight failures, and water leaks. The platform promotes transparency by allowing users to monitor complaint status while helping authorities prioritize issues using community support and AI-assisted automation.

---

## 🚀 Problem Statement

**Problem Statement 2: Community Hero – Hyperlocal Problem Solver**

Many civic issues remain unresolved due to fragmented reporting systems, duplicate complaints, and a lack of transparency. Community Hero provides a centralized platform where citizens can report local infrastructure problems, track their progress, and assist authorities in prioritizing issues.

---

## 💡 Solution Overview

Community Hero transforms a simple 30-second reporting process into a structured civic record.

Users can:
- 📸 Capture and upload photos of local issues.
- 📍 Automatically attach the current location using browser geolocation.
- 🤖 Use AI to classify the issue type, determine severity, and generate a description.
- 👍 Support existing reports instead of creating duplicates.
- 🗺️ Track complaints on an interactive live map.
- 📊 Monitor complaint progress through a transparent six-stage workflow.

Administrators receive a dedicated dashboard to assign, update, and resolve complaints efficiently.

---


##  Live Demo: https://community-hero-988408502513.asia-south1.run.app/


---


# ✨ Features

## 👥 Citizen Features

- Secure User Authentication
- Photo-based Complaint Reporting
- Automatic Browser Geolocation
- AI-powered Issue Categorization
- Interactive Live Map
- Community Upvoting System
- My Reports Dashboard
- Search & Filter Complaints
- Edit/Delete Pending Reports
- Complaint Status Tracking
- Feedback & Star Rating System
- Citizen Reputation Badges

---

## 🤖 AI Features

Using **Google Gemini Vision API**, the platform automatically:

- Detects issue category
- Predicts severity level
- Generates a complaint description

Supported Categories:

- 🕳️ Pothole
- 💡 Streetlight Issue
- 🗑️ Garbage
- 💧 Water Leak
- 📌 Others

---

## 📊 Public Transparency Dashboard

Everyone can view:

- Total Complaints
- Pending Complaints
- Resolved Complaints
- Average Resolution Time
- Category-wise Statistics
- 7-Day Complaint Trend

---

## 🛠️ Admin Features

- Admin Login
- Complaint Assignment
- Status Updates
- Emergency Flagging
- Analytics Dashboard
- Complaint Management

---

## 🔄 Complaint Workflow

```
Submitted
      ↓
Under Review
      ↓
Assigned
      ↓
In Progress
      ↓
Resolved
      ↓
Closed
```

---

# 🛠 Tech Stack

## Frontend

- Next.js (App Router)
- TypeScript
- Tailwind CSS

## Backend

- Supabase
- PostgreSQL

## Authentication

- Supabase Authentication

## Storage

- Supabase Storage

## Maps

- Leaflet
- React Leaflet
- OpenStreetMap

## AI

- Google Gemini API (Vision)

## Deployment

- Google Cloud Run

## Version Control

- Git
- GitHub

---

# ☁ Google Technologies Used

- ✅ Google Cloud Run
- ✅ Google Buildpacks
- ✅ Google AI Studio
- ✅ Gemini Vision API

---

# 📂 Project Structure

```
Community-Hero
│
├── app/
├── components/
├── public/
├── lib/
├── styles/
├── utils/
├── supabase/
├── screenshots/
├── package.json
├── README.md
└── .gitignore
```

---

# 📸 Screenshots

> Add screenshots of your project inside the **screenshots/** folder.

Example:

```
screenshots/
│
├── home.png
├── report.png
├── dashboard.png
├── map.png
└── admin.png
```

Then display them like:

```markdown
## Home Page

![Home](screenshots/home.png)

## Dashboard

![Dashboard](screenshots/dashboard.png)
```

---

# ⚙ Installation

Clone the repository

```bash
git clone https://github.com/your-username/community-hero.git
```

Go to project directory

```bash
cd community-hero
```

Install dependencies

```bash
npm install
```

Create environment variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
GEMINI_API_KEY=
```

Run locally

```bash
npm run dev
```

---

# 🌟 Future Improvements

- Mobile Application
- Push Notifications
- Government Portal Integration
- AI Duplicate Detection
- Multi-language Support
- Voice-based Complaint Reporting
- Analytics Dashboard for Cities

---


---

# 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push the branch
5. Open a Pull Request

---



## ⭐ If you like this project, don't forget to star the repository!
