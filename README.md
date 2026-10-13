# AutoHeal Cloud

AutoHeal Cloud is a self-healing cloud infrastructure control loop that monitors microservices, detects anomalies in sub-seconds, and executes deterministic self-healing before downtime impacts users.

- **Deployed Frontend:** [https://auto-heal-one.vercel.app/](https://auto-heal-one.vercel.app/)
- **Frontend Stack:** React 19, TypeScript, Vite, Tailwind CSS, Lucide React
- **Backend Stack:** Python 3.13, FastAPI, SQLAlchemy 2.0 (Async), aiosqlite / asyncpg, PostgreSQL, WebSockets, Prometheus HTTP API, Kubernetes Python client

---

## Architecture Overview

```
[ Frontend: React 19 + Vite ] ──(HTTP/REST + WebSockets)──> [ FastAPI Backend ]
                                                                   │
                                                ┌──────────────────┼──────────────────┐
                                                ▼                  ▼                  ▼
                                        [ SQLite / Postgres ] [ Prometheus ] [ Kubernetes ]
                                        (Persistent State)   (Live Telemetry) (Guarded Actuators)
```

The system operates in two distinct modes:
1. **Demo Mode (Default):** Zero external dependencies required. Simulates real-time telemetry, allows triggering failure chaos simulations, runs the closed-loop recovery engine, and persists incidents in SQLite/PostgreSQL.
2. **Live Mode:** Connects to Prometheus for live cluster telemetry and an authorized Kubernetes cluster for policy-enforced remediation.

---

## Getting Started (Windows & VS Code)

### Prerequisites
- **Python 3.11+** installed (or `py` launcher on Windows).
- **Node.js 18+** & npm.
- *(Optional)* Docker & Docker Compose for PostgreSQL.

---

### Running Locally (Without Docker)

#### 1. Start the Backend
Open PowerShell in the project root:
```powershell
cd backend
py -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
$env:PYTHONPATH="."
uvicorn app.main:app --reload --port 8000
```
The FastAPI backend will start at `http://localhost:8000`.
- Interactive Swagger API docs: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/api/health`

#### 2. Start the Frontend
Open a second PowerShell terminal in the project root:
```powershell
npm install
npm run dev
```
Open `http://localhost:5173`. The dashboard will automatically detect the local backend and connect via WebSockets!

---

### Running with Docker Compose (PostgreSQL)

To run the backend with persistent PostgreSQL:
```powershell
docker compose up --build
```
This automatically boots PostgreSQL on port 5432 and the FastAPI backend on port 8000.

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Backend status and integration health (Prometheus/K8s) |
| `GET` | `/api/metrics` | Cluster golden signals and telemetry metrics |
| `GET` | `/api/services` | Active monitored service statuses |
| `GET` | `/api/incidents` | Incident history with filtering and pagination |
| `GET` | `/api/incidents/{id}` | Detailed incident timeline and stages |
| `GET` | `/api/recovery/actions`| History of executed remediation actions |
| `POST` | `/api/simulations` | Triggers a chaos failure scenario |
| `POST` | `/api/incidents/{id}/recover` | Executes authorized recovery action |
| `WS` | `/ws/dashboard` | WebSocket stream for live metrics and incident updates |

---

## Running Automated Tests

Run the test suite inside `backend`:
```powershell
cd backend
$env:PYTHONPATH="."
.\venv\Scripts\pytest.exe -v
```
All tests verify endpoint schemas, persistence, failure classification, anti-flapping deduplication, and simulation workflows.

---

## Deploying Backend & Vercel Configuration

1. **Deploy the Backend:**
   Deploy the `backend` folder as a container service (e.g. Railway, Render, Fly.io, or AWS ECS).
2. **Configure Vercel Frontend:**
   In your Vercel project settings ([auto-heal-one](https://auto-heal-one.vercel.app/)), add the environment variable:
   ```
   VITE_API_BASE_URL=https://your-backend-url.com
   ```
3. In the backend environment variables, ensure `CORS_ORIGINS` includes `https://auto-heal-one.vercel.app`.

---

---

## Cloud-Agnostic Architecture & Provider Configuration

AutoHeal Cloud decouples core telemetry processing, failure detection, incident classification, and recovery policies from underlying cloud infrastructure using abstract provider interfaces:
- **`MetricsProvider`**: Collects system utilization and golden signals (Demo, Prometheus).
- **`ClusterProvider`**: Validates credentials and lists services across clusters (Demo, Kubernetes, AWS EKS, GCP GKE, Azure AKS).
- **`RecoveryExecutor`**: Enforces least-privilege RBAC, namespace allowlists, and executes approved recovery actions.

### 1. Amazon EKS (AWS)
```env
OPERATING_MODE=live
CLOUD_PROVIDER=aws
CLUSTER_NAME=prod-eks-us-east-1
KUBE_ALLOWED_NAMESPACES=["prod-fintech","prod-core","default"]
METRICS_PROVIDER_TYPE=prometheus
PROMETHEUS_URL=http://prometheus-server.monitoring.svc.cluster.local:9090
LIVE_RECOVERY_ENABLED=true
```
- **Identity & RBAC:** Uses AWS IAM Roles for Service Accounts (IRSA) with least-privilege permissions (`pods:delete`, `deployments:patch`).

### 2. Google Kubernetes Engine (GCP GKE)
```env
OPERATING_MODE=live
CLOUD_PROVIDER=gcp
CLUSTER_NAME=gke-prod-us-central1
KUBE_ALLOWED_NAMESPACES=["prod-fintech","prod-core","default"]
METRICS_PROVIDER_TYPE=prometheus
PROMETHEUS_URL=http://prometheus-k8s.monitoring.svc.cluster.local:9090
LIVE_RECOVERY_ENABLED=true
```
- **Identity & RBAC:** Uses GKE Workload Identity binding Kubernetes ServiceAccounts to Google Service Accounts.

### 3. Azure Kubernetes Service (Azure AKS)
```env
OPERATING_MODE=live
CLOUD_PROVIDER=azure
CLUSTER_NAME=aks-prod-eastus
KUBE_ALLOWED_NAMESPACES=["prod-fintech","prod-core","default"]
METRICS_PROVIDER_TYPE=prometheus
PROMETHEUS_URL=http://prometheus-server.monitoring.svc.cluster.local:9090
LIVE_RECOVERY_ENABLED=true
```
- **Identity & RBAC:** Uses Azure Entra Workload ID with authorized federated credentials.

### 4. Local / Safe Demo Mode (Default)
```env
OPERATING_MODE=demo
CLOUD_PROVIDER=demo
LIVE_RECOVERY_ENABLED=false
```
- Operates 100% synthetically without touching cloud credentials or real clusters. Perfect for local demonstrations and CI/CD pipelines.