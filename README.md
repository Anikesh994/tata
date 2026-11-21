# 📊 InsightBoard — Full-Stack CSV Analytics & Visualization Platform

> **Tata Motors Internship Project — Team 22**  
> Developed by **Anikesh** (*NIT Jamshedpur*) .

**InsightBoard** is a full-stack data analytics and visualization platform designed to turn raw CSV datasets into interactive charts, searchable tables, and automated analytical summaries within seconds. It incorporates secure authentication, a high-performance streaming parser, client-side PDF export generation, and a hybrid IndexedDB caching architecture.

---

## 🌟 Key Features

- **⚡ Instant CSV Ingestion & Streaming:** Upload any `.csv` file via intuitive drag-and-drop or file browsing. The backend processes the upload in-memory using Node.js streaming pipelines (`multer` + `csv-parser`) and persists structured collections directly to MongoDB.
- **📈 Interactive Data Visualization:** Dynamic charts powered by `Chart.js` and `react-chartjs-2`:
  - Multiple chart modes: **Bar**, **Line**, and **Doughnut**.
  - On-the-fly axis selectors for dynamic X-axis and Y-axis mappings.
  - Automatic detection of numeric columns and sensible initial defaults.
- **🧮 Automatic Instant Analytics:** Real-time computation of key statistical metrics on data load:
  - Row counts
  - Column total / sum ($\sum$)
  - Column mean / average ($\varnothing$)
- **🔍 Real-Time Search & Tabular Filtering:** Filter multi-column datasets instantly as you type with zero lag.
- **📑 Hybrid PDF Export System:**
  - One-click client-side export generation using `html2canvas` and `jsPDF`.
  - Captures bento stat cards, table snippets, and chart displays.
  - **Hybrid Storage Strategy:** Light export metadata (filename, size, timestamps) is saved to MongoDB under the user's Clerk ID, while full PDF blobs are stored in browser **IndexedDB** (`insightboard_exports`), completely avoiding cloud payload constraints and heavy database bloating.
- **🔒 Secure Authentication:** User management and session validation powered by **Clerk**:
  - Protected client routes (`/dashboard`, `/my-exports`).
  - Backend JWT verification via `@clerk/backend` Bearer token inspection.
- **📁 "My Exports" Document Hub:** Dedicated dashboard to view export history, download locally cached reports, or delete records.
- **🎨 Modern Dark UI/UX:** Responsive dark-mode interface styled with Tailwind CSS, ambient gradient glows, glassy bento grid containers, and feedback toasts.

---

## 🛠️ Tech Stack

### Frontend (`/client`)
- **Framework:** React 19 (Vite 7)
- **Styling:** Tailwind CSS v4 (`@tailwindcss/vite`), Custom CSS, Syne / Inter typography
- **Routing:** React Router DOM v7
- **Auth:** Clerk React SDK (`@clerk/react`)
- **Visualizations:** Chart.js v4, React-Chartjs-2 v5
- **Document Generation:** jsPDF, jspdf-autotable, html2canvas
- **Local Storage:** Browser IndexedDB API
- **HTTP Client:** Axios

### Backend (`/server`)
- **Runtime & Framework:** Node.js, Express v5
- **Database:** MongoDB via Mongoose v8
- **Authentication:** Clerk Backend SDK (`@clerk/backend`)
- **CSV Ingestion:** Multer (memory buffer storage) + `csv-parser` stream processing
- **CORS & Utilities:** CORS, Body-Parser (25MB limit for large payloads), dotenv
- **Deployment Support:** Configured for Vercel Serverless (`vercel.json`) & Node servers (Render/Railway/Fly.io)

---

## 📂 Project Structure

```text
tata-main/
└── tata-main/
    └── tata/
        ├── client/                       # React + Vite Frontend
        │   ├── public/
        │   ├── src/
        │   │   ├── components/
        │   │   │   ├── pages/
        │   │   │   │   ├── About.jsx       # Team & project background
        │   │   │   │   ├── Dashboard.jsx   # Core analytics & visualization hub
        │   │   │   │   ├── Home.jsx        # Landing page with hero & CTAs
        │   │   │   │   ├── MyExports.jsx   # Saved export manager
        │   │   │   │   └── Services.jsx    # Feature showcase
        │   │   │   ├── ChartDisplay.jsx    # Chart.js rendering & axis selection
        │   │   │   ├── CSVUploader.jsx     # Standalone CSV file uploader
        │   │   │   ├── DataTable.jsx       # Searchable tabular viewer
        │   │   │   ├── Navbar.jsx          # Responsive header & Clerk Auth controls
        │   │   │   └── ProtectedRoute.jsx  # Route guard for authenticated views
        │   │   ├── utils/
        │   │   │   └── exportStorage.js    # IndexedDB storage wrapper for PDFs
        │   │   ├── App.jsx                 # Routing configuration
        │   │   ├── main.jsx                # ClerkProvider root mount
        │   │   └── index.css               # Global styling
        │   ├── index.html
        │   ├── package.json
        │   └── vite.config.js
        │
        └── server/                       # Node.js + Express Backend
            ├── controllers/
            │   ├── csvController.js        # CSV memory streaming & dataset queries
            │   └── exportController.js     # User scoped export CRUD
            ├── middleware/
            │   └── requireAuth.js          # Clerk session token validator
            ├── models/
            │   ├── Dataset.js              # Ingested dataset schema
            │   └── Export.js               # Export metadata schema
            ├── routes/
            │   ├── csvRoutes.js            # CSV upload & retrieval endpoints
            │   └── exportRoutes.js         # Protected export endpoints
            ├── package.json
            ├── server.js                   # Express server entry point
            └── vercel.json                 # Vercel serverless deployment config
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v18.x or higher)
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)
- A running [MongoDB](https://www.mongodb.com/) instance (local or MongoDB Atlas connection URI)
- A [Clerk](https://clerk.com/) account for authentication keys

---

### 1. Backend Setup (`/server`)

Navigate to the server directory:
```bash
cd tata-main/tata/server
```

Install dependencies:
```bash
npm install
```

Create a `.env` file in `tata-main/tata/server/.env`:
```env
PORT=5000
NODE_ENV=development
MONGO_URL=mongodb+srv://<username>:<password>@cluster.mongodb.net/insightboard?retryWrites=true&w=majority
ALLOWED_ORIGIN=http://localhost:5173
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key_here
```

Start the backend server:
```bash
npm run dev
# or: node server.js
```
The server will start listening at `http://localhost:5000`.

---

### 2. Frontend Setup (`/client`)

Open a separate terminal and navigate to the client directory:
```bash
cd tata-main/tata/client
```

Install dependencies:
```bash
npm install
```

Create a `.env` file in `tata-main/tata/client/.env`:
```env
VITE_API_URL=http://localhost:5000
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key_here
```

Start the Vite development server:
```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 🔌 API Reference

### CSV Endpoints (`/api/csv`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/csv/upload` | Public | Upload a `.csv` file via `multipart/form-data` (field: `file`). Ingests into MongoDB. |
| `GET` | `/api/csv` | Public | Fetch all uploaded datasets. |
| `GET` | `/api/csv/latest` | Public | Fetch the most recently uploaded dataset. |

### Export Endpoints (`/api/exports`)

> *All export endpoints require `Authorization: Bearer <clerk_session_token>` header.*

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/exports` | Required | Saves export metadata (`fileName`, `exportType`, `fileSize`). |
| `GET` | `/api/exports` | Required | Retrieves all export history records owned by the authenticated Clerk user. |
| `DELETE` | `/api/exports/:id` | Required | Deletes an export record (enforces owner authorization). |

---

## 💡 How It Works

1. **Sign In / Authenticate:** Users authenticate securely via Clerk modal buttons on the navigation bar.
2. **Upload CSV:** Drag & drop any CSV file into the drop zone on `/dashboard`. The file is streamed through memory and saved to MongoDB.
3. **Analyze & Filter:**
   - The dataset appears instantly in an interactive table with live search across all rows and columns.
   - Summary statistics cards immediately compute row count, total sums, and column averages.
4. **Visualize:**
   - Switch between **Bar**, **Line**, and **Doughnut** views.
   - Choose any column from your dataset for the horizontal (X) and vertical (Y) axes.
5. **Export PDF:**
   - Click **Export PDF** to render a high-resolution snapshot of the dashboard.
   - The PDF downloads automatically to the user's machine.
   - The binary document is stored locally in the browser's **IndexedDB**, while metadata is linked to the user account in MongoDB.
6. **Manage Exports:**
   - Visit `/my-exports` to review previous reports, re-download PDFs available on your current device, or remove records.

---

## 👥 Authors & Acknowledgments

- **Anikesh** — Full Stack Developer ([NIT Jamshedpur](https://www.nitjsr.ac.in/))


*Developed as part of the **Tata Motors Internship Program** (Team 22).*
