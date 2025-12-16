# Bilişim Vadisi GO Hackathon - Full Stack Application

![CI](https://github.com/erendemirer1/Bilisim_Vadisi_GO_Hackathon/workflows/CI/badge.svg)
![CD](https://github.com/erendemirer1/Bilisim_Vadisi_GO_Hackathon/workflows/CD/badge.svg)

Modern, cloud-native full-stack application with Docker containerization and Kubernetes orchestration.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Standards Compliance](#standards-compliance)

## ✨ Features

- 🐳 **Dockerized**: Multi-stage Docker builds for optimized images
- ☸️ **Kubernetes Ready**: Complete K8s manifests with HPA, ConfigMaps, Secrets
- 🔄 **CI/CD**: Automated testing and deployment via GitHub Actions
- 🧪 **Tested**: Unit and integration tests with Jest
- 📏 **Linted**: ESLint and Prettier for code quality
- 🔒 **Secure**: Non-root containers, health checks, security headers
- 📊 **Observable**: Health endpoints, readiness/liveness probes
- 🚀 **Scalable**: Horizontal Pod Autoscaling based on CPU/memory

## 🛠 Tech Stack

**Frontend:**
- Nginx (Alpine)
- HTML5/CSS3
- Responsive Design

**Backend:**
- Node.js 20 (Alpine)
- Native HTTP server
- RESTful API

**Infrastructure:**
- Docker & Docker Compose
- Kubernetes
- GitHub Actions
- Docker Hub

## 📁 Project Structure

\`\`\`
.
├── .github/
│   └── workflows/
│       ├── ci.yml              # Continuous Integration
│       └── cd.yml              # Continuous Deployment
├── backend/
│   ├── tests/                  # Test files
│   │   └── api.test.js
│   ├── .eslintrc.json          # ESLint config
│   ├── .prettierrc.json        # Prettier config
│   ├── Dockerfile              # Multi-stage Dockerfile
│   ├── package.json            # Dependencies & scripts
│   ├── jest.config.js          # Jest test config
│   └── server.ts               # Main application
├── frontend/
│   ├── .htmlhintrc             # HTML linting
│   ├── .prettierrc.json        # Prettier config
│   ├── Dockerfile              # Nginx Dockerfile
│   ├── nginx.conf              # Nginx configuration
│   ├── package.json            # Frontend tooling
│   └── index.html              # Frontend app
├── k8s/
│   ├── backend-deployment.yaml # Backend K8s deployment
│   ├── backend-service.yaml    # Backend service
│   ├── frontend-deployment.yaml# Frontend deployment
│   ├── frontend-service.yaml   # Frontend service (NodePort)
│   ├── configmap.yaml          # Configuration data
│   ├── secret.yaml             # Sensitive data
│   └── hpa.yaml                # Horizontal Pod Autoscaler
├── docker-compose.yml          # Local development
└── README.md                   # This file
\`\`\`

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 20+ (for local development)
- kubectl (for Kubernetes deployment)

### Local Development with Docker Compose

\`\`\`bash
# Clone the repository
git clone git@github.com:erendemirer1/Bilisim_Vadisi_GO_Hackathon.git
cd Bilisim_Vadisi_GO_Hackathon

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
\`\`\`

**Access the application:**
- Frontend: http://localhost:8080
- Backend: http://localhost:3000
- Health check: http://localhost:3000/health

## 💻 Development

### Backend Development

\`\`\`bash
cd backend

# Install dependencies
npm install

# Run in development mode
npm run dev

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format
\`\`\`

### Frontend Development

\`\`\`bash
cd frontend

# Install dependencies
npm install

# Lint HTML
npm run lint:html

# Format code
npm run format
\`\`\`

## 🧪 Testing

### Backend Tests

\`\`\`bash
cd backend
npm test                    # Run all tests
npm test -- --coverage      # With coverage report
npm run test:watch          # Watch mode
\`\`\`

## 🚢 Deployment

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy to Kubernetes

\`\`\`bash
# Apply all Kubernetes manifests
kubectl apply -f k8s/

# Check status
kubectl get pods
kubectl get svc
kubectl get hpa
\`\`\`

## 📚 API Documentation

See [API.md](docs/API.md) for complete API documentation.

### Quick Reference

- \`GET /\` - Backend status
- \`GET /health\` - Health check

## ✅ Standards Compliance

This project follows industry best practices and hackathon requirements:

### ✓ Frontend Standards
- Responsive design ready
- Security headers configured
- HTML linting & code formatting

### ✓ Backend Standards
- RESTful API structure
- Linting & formatting (ESLint, Prettier)
- Unit & integration tests

### ✓ Docker Standards
- Multi-stage builds for optimized images
- Alpine-based images
- Non-root users for security
- Health checks built-in

### ✓ Kubernetes Standards
- Resource limits & requests defined
- ConfigMap for configuration management
- Secrets for sensitive data
- HPA for autoscaling
- Health & readiness probes
- Minimum 2 replicas (backend)

### ✓ Project Management
- Git Flow branching strategy
- Conventional commits
- Comprehensive documentation
- CI/CD pipelines

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Eren Demirer**
- GitHub: [@erendemirer1](https://github.com/erendemirer1)

## 🙏 Acknowledgments

- Bilişim Vadisi GO Hackathon organizers
- Open source community

---

**Need help?** Open an issue or reach out to the maintainers.
