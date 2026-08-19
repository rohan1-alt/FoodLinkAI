# FoodLinkAI 🍽️ 
Smart Food Waste Exchange Platform 

## 🌐 Live Demo
- **Web App:** [https://food-link-ai-ten.vercel.app](https://food-link-ai-ten.vercel.app)
- **Backend API Docs (Swagger):** [https://foodlinkai-afyz.onrender.com/docs](https://foodlinkai-afyz.onrender.com/docs)
- **Backend Base URL:** `https://foodlinkai-afyz.onrender.com`

> ⚠️ The backend runs on Render's free tier, which spins down after periods of inactivity. If the app feels slow or unresponsive on first load, give it 30-50 seconds to wake up, then retry.

## 📌 Problem Statement 
Every day, restaurants, bakeries, hostels, supermarkets, and event venues throw away large amounts of perfectly edible food. 

At the same time: 
- NGOs struggle to feed people. 
- Shelters don’t know where surplus food is available. 
- Volunteers don’t know what needs to be picked up. 

The biggest issue isn’t the lack of food — it’s that there’s **no fast, intelligent system to connect donors with people who need it before the food expires.** 

FoodLinkAI aims to solve this.

---

## 🚀 Example Scenario 
Imagine a restaurant has: 
- 30 meals left 
- Prepared at 1 PM 
- Best before 7 PM 

Instead of throwing them away, the restaurant uploads the details to FoodLinkAI. 
- Nearby NGOs immediately see that food is available. 
- One NGO claims it. 
- A volunteer gets notified to pick it up. 
- The food reaches people before it expires. 

✅ Everyone wins.

---

## 🛠 Features (Planned) 
- Real‑time food availability dashboard 
- Donor → NGO → Volunteer matching system 
- Notifications & pickup scheduling 
- Data analytics for tracking food saved 

---

## 💻 Backend API & Technical Details

The core backend service for the Smart Food Waste Exchange platform. Built with **FastAPI**, this API securely manages food donations, connects donors with NGOs, and utilizes a custom AI model to calculate food expiration urgency.

### 🚀 Tech Stack
* **Framework:** FastAPI (Python)
* **Database:** PostgreSQL (Hosted on Neon) & SQLAlchemy ORM
* **Authentication:** OAuth2 with JWT (JSON Web Tokens)
* **AI Integration:** Scikit-learn (Custom Urgency Prediction Model)

### 🔐 Authentication
This API is secured using JWT. To access protected routes, users must first authenticate to receive a bearer token.
* `POST /api/v1/auth/signup` - Register a new user (Donor, NGO, or Volunteer)
* `POST /api/v1/auth/login` - Authenticate and receive a JWT token
* `GET /api/v1/auth/me` - Fetch details of the currently logged-in user

### 📦 Donation Endpoints
* `GET /api/v1/donations/` - Fetch all available food donations (Sorted by AI urgency score)
* `POST /api/v1/donations/` - Create a new food donation (Auto-calculates AI urgency & links to logged-in donor). Returns a `pickup_code` used for QR check-in.
* `GET /api/v1/donations/my-donations` - Fetch every donation posted by the logged-in donor (donor-only, includes `pickup_code`)
* `PATCH /api/v1/donations/{donation_id}/claim` - Claim a donation (NGO/Volunteer only)
* `PATCH /api/v1/donations/{donation_id}/complete` - Confirm a pickup by submitting the donor's `pickup_code` (QR check-in). Awards gamification points.
* `GET /api/v1/donations/my-claims` - Fetch a history of claims made by the logged-in user, with donation context attached

### 🤖 AI Endpoints
* `GET /api/v1/ai/donations/{donation_id}/matches` - Smart Matching: ranks nearby NGOs/volunteers for a donation by distance, urgency, and pickup reliability
* `GET /api/v1/ai/routes/optimize` - Volunteer Routing: returns an optimized stop order for the logged-in volunteer's pending pickups
* `GET /api/v1/ai/impact` - Public impact dashboard stats (meals saved, kg rescued, CO2 avoided)
* `GET /api/v1/ai/leaderboard` - Public gamification leaderboard (points, badges, completed pickups)

### 🧠 AI Urgency Model
When a new donation is posted, the `predict_urgency()` inference model automatically processes the `hours_to_expiry`, `quantity`, and `is_perishable` flags to assign an urgency score from 0.0 to 1.0. This ensures high-risk food is prioritized for immediate pickup.

### ⚙️ Local Development Setup

**Backend**
1. Clone the repository and navigate to the backend folder.
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Create a `.env` file:
   ```bash
   DATABASE_URL=sqlite+aiosqlite:///./dev.db   # or your Postgres/Neon URL
   SECRET_KEY=change-me
   ```
4. Run the API:
   ```bash
   uvicorn app.main:app --reload
   ```
   Tables are created automatically on startup. Docs at `http://localhost:8000/docs`.

**Frontend**
1. `cd frontend && npm install`
2. Copy `.env.example` to `.env` and point `VITE_API_URL` at your running backend (defaults to `http://localhost:8000/api/v1`).
3. `npm run dev`

The frontend has three role-based dashboards (`/dashboard/restaurant`, `/dashboard/ngo`, `/dashboard/volunteer`) plus a public `/impact` page. Register an account to pick a role and get routed automatically.

### ☁️ Deployment
- **Backend:** deployed on [Render](https://render.com) as a Python web service (`uvicorn app.main:app --host 0.0.0.0 --port $PORT`), connected to a [Neon](https://neon.tech) PostgreSQL database via `DATABASE_URL`.
- **Frontend:** deployed on [Vercel](https://vercel.com), root directory `frontend`, with `VITE_API_URL` set to the Render backend URL (including the `/api/v1` prefix).
- CORS on the backend is restricted to the deployed frontend's origin(s) — see `ALLOWED_ORIGINS` in `app/main.py`.
