# Accusations App - Docker Setup with Neon Database

This documentation provides comprehensive instructions for running the Accusations application with Docker in both development and production environments using Neon Database.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Development Environment Setup](#development-environment-setup)
- [Production Environment Setup](#production-environment-setup)
- [Environment Variables](#environment-variables)
- [Database Configuration](#database-configuration)
- [Troubleshooting](#troubleshooting)
- [Architecture Diagrams](#architecture-diagrams)

## Overview

The application supports two distinct deployment modes:

- **Development**: Uses Neon Local proxy in Docker to create ephemeral database branches
- **Production**: Connects directly to Neon Cloud database

## Prerequisites

Before setting up the application, ensure you have:

1. **Docker Engine** (v20.10+) and **Docker Compose** (v2.0+) installed
2. **Neon Database Account** with:
   - API Key
   - Project ID
   - Parent Branch ID (for development)
   - Production Database URL (for production)
3. **Git** for version control
4. **Node.js** (v20+) for local development (optional)

### Getting Neon Credentials

1. Sign up at [Neon](https://neon.tech)
2. Create a new project
3. Navigate to **Settings** → **API Keys** to get your API key
4. Note your Project ID from the project dashboard
5. Get your Parent Branch ID from the **Branches** tab

## Development Environment Setup

### Step 1: Clone and Configure

```bash
# Clone the repository
git clone <your-repo-url>
cd accusations

# Copy environment file and configure
cp .env.example .env.development
```

### Step 2: Configure Development Environment

Edit `.env.development` with your Neon credentials:

```bash
# Development Environment Configuration
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug

# Neon Local Database Configuration
DATABASE_URL=postgres://neon:npg@neon-local:5432/neondb?sslmode=require

# Neon API Configuration (required for Neon Local)
NEON_API_KEY=your_actual_neon_api_key
NEON_PROJECT_ID=your_actual_neon_project_id
PARENT_BRANCH_ID=your_parent_branch_id

# Arcjet Configuration
ARCJET_ENV=development
ARCJET_KEY=your_arcjet_key
```

### Step 3: Start Development Environment

```bash
# Start with Neon Local and application
docker-compose -f docker-compose.dev.yml --env-file .env.development up -d

# Optional: Start with database admin interface
docker-compose -f docker-compose.dev.yml --env-file .env.development --profile admin up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Check service status
docker-compose -f docker-compose.dev.yml ps
```

### Development Services

When running in development mode, you get:

- **Application**: http://localhost:3000
- **Neon Local Proxy**: localhost:5432 
- **Adminer** (optional): http://localhost:8080 (admin profile)
  - Server: `neon-local`
  - Username: `neon`
  - Password: `npg`

### Development Features

✅ **Ephemeral Branches**: Each container restart creates a fresh database branch  
✅ **Hot Reloading**: Source code changes are reflected immediately  
✅ **Database Admin**: Built-in Adminer for database inspection  
✅ **Health Checks**: Automatic service health monitoring  

## Production Environment Setup

### Step 1: Configure Production Environment

Create and configure `.env.production`:

```bash
# Production Environment Configuration
NODE_ENV=production
PORT=3000
LOG_LEVEL=info

# Neon Cloud Database Configuration
DATABASE_URL=postgres://username:password@ep-example-123456.us-east-1.aws.neon.tech/neondb?sslmode=require

# Arcjet Configuration
ARCJET_ENV=production
ARCJET_KEY=your_production_arcjet_key

# Security Settings
DISABLE_REQUEST_LOGGING=false
TRUST_PROXY=true

# Performance Settings
CLUSTER_MODE=false
MAX_CONCURRENT_REQUESTS=1000
```

### Step 2: Deploy Production Application

```bash
# Build and start production services
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d

# Optional: Start with reverse proxy
docker-compose -f docker-compose.prod.yml --env-file .env.production --profile proxy up -d

# Optional: Start with monitoring
docker-compose -f docker-compose.prod.yml --env-file .env.production --profile monitoring up -d

# View production logs
docker-compose -f docker-compose.prod.yml logs -f app
```

### Production Services

- **Application**: http://localhost:3000
- **Nginx Proxy** (optional): http://localhost:80, https://localhost:443
- **Health Monitor** (optional): Container monitoring service

### Production Features

🔒 **Security**: Non-root user, read-only filesystem, security options  
📊 **Resource Limits**: CPU and memory constraints  
💾 **Health Checks**: Application and database health monitoring  
🔄 **Auto Restart**: Automatic container restart on failure  
🚀 **Performance**: Optimized for production workloads  

## Environment Variables

### Required Variables

| Variable | Development | Production | Description |
|----------|-------------|------------|-------------|
| `NODE_ENV` | `development` | `production` | Application environment |
| `DATABASE_URL` | Neon Local URL | Neon Cloud URL | Database connection string |
| `NEON_API_KEY` | ✅ Required | ❌ Not needed | Neon API key for Local |
| `NEON_PROJECT_ID` | ✅ Required | ❌ Not needed | Neon project identifier |
| `PARENT_BRANCH_ID` | ✅ Required | ❌ Not needed | Parent branch for ephemeral branches |

### Optional Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Application port |
| `LOG_LEVEL` | `info` | Logging level |
| `ARCJET_ENV` | `development`/`production` | Arcjet environment |
| `ARCJET_KEY` | - | Arcjet API key |

## Database Configuration

The application automatically detects the environment and uses the appropriate database driver:

### Development (Neon Local)
- **Driver**: `pg` (PostgreSQL driver)
- **Connection**: Through Neon Local proxy
- **SSL**: Self-signed certificates (rejectUnauthorized: false)
- **Features**: Ephemeral branches, local development

### Production (Neon Cloud)
- **Driver**: `@neondatabase/serverless`
- **Connection**: Direct to Neon Cloud
- **SSL**: Full SSL verification
- **Features**: Serverless scaling, edge caching

## Useful Commands

### Development Commands

```bash
# Start development environment
docker-compose -f docker-compose.dev.yml --env-file .env.development up -d

# Stop development environment
docker-compose -f docker-compose.dev.yml down

# Rebuild application container
docker-compose -f docker-compose.dev.yml build app

# View application logs
docker-compose -f docker-compose.dev.yml logs -f app

# Access application container shell
docker-compose -f docker-compose.dev.yml exec app sh

# Run database migrations
docker-compose -f docker-compose.dev.yml exec app npm run db:migrate

# Access Neon Local directly
docker-compose -f docker-compose.dev.yml exec neon-local psql -h localhost -U neon -d neondb
```

### Production Commands

```bash
# Deploy production
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d

# Scale application (if using Docker Swarm)
docker service scale accusations_app=3

# Update production deployment
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d --force-recreate

# Backup and rollback
docker tag accusations-app:latest accusations-app:backup-$(date +%Y%m%d)
```

### Maintenance Commands

```bash
# Clean up unused Docker resources
docker system prune -a

# View resource usage
docker stats

# Check container health
docker inspect --format='{{.State.Health.Status}}' accusations-app-dev
```

## Troubleshooting

### Common Issues

#### 1. Neon Local Connection Failed

**Problem**: Cannot connect to Neon Local proxy

**Solutions**:
```bash
# Check Neon Local container logs
docker-compose -f docker-compose.dev.yml logs neon-local

# Verify Neon credentials
docker-compose -f docker-compose.dev.yml exec neon-local env | grep NEON

# Test direct connection
docker-compose -f docker-compose.dev.yml exec app ping neon-local
```

#### 2. SSL Certificate Issues

**Problem**: SSL connection errors with Neon Local

**Solution**: Ensure your database configuration includes:
```javascript
ssl: {
  rejectUnauthorized: false
}
```

#### 3. Application Won't Start

**Problem**: Container exits immediately

**Solutions**:
```bash
# Check application logs
docker-compose -f docker-compose.dev.yml logs app

# Verify environment variables
docker-compose -f docker-compose.dev.yml config

# Test database connection
docker-compose -f docker-compose.dev.yml exec app node -e "console.log(process.env.DATABASE_URL)"
```

#### 4. Port Already in Use

**Problem**: Port 3000 or 5432 already bound

**Solutions**:
```bash
# Find process using port
lsof -i :3000
lsof -i :5432

# Kill process or change port in docker-compose file
ports:
  - "3001:3000"  # Use different host port
```

### Health Check Commands

```bash
# Check application health
curl http://localhost:3000/health

# Check all services health
docker-compose -f docker-compose.dev.yml ps

# View health check logs
docker inspect accusations-app-dev | grep -A 10 "Health"
```

## Architecture Diagrams

### Development Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Developer     │    │   Docker Host    │    │   Neon Cloud    │
│                 │    │                  │    │                 │
│  ┌─────────────┐│    │ ┌──────────────┐ │    │ ┌─────────────┐ │
│  │   Browser   ││───▶│ │     App      │ │    │ │   Project   │ │
│  │             ││    │ │  Container   │ │    │ │             │ │
│  └─────────────┘│    │ │ Port: 3000   │ │    │ │  Branches   │ │
│                 │    │ └──────────────┘ │    │ │             │ │
│  ┌─────────────┐│    │         │        │    │ └─────────────┘ │
│  │   Adminer   ││───▶│ ┌──────────────┐ │    │        ▲        │
│  │             ││    │ │  Neon Local  │◀┼────┼────────┘        │
│  └─────────────┘│    │ │   Proxy      │ │    │   API Calls     │
│                 │    │ │ Port: 5432   │ │    │                 │
└─────────────────┘    │ └──────────────┘ │    └─────────────────┘
                       │   Docker Network │
                       └──────────────────┘
```

### Production Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│     Users       │    │   Docker Host    │    │   Neon Cloud    │
│                 │    │                  │    │                 │
│  ┌─────────────┐│    │ ┌──────────────┐ │    │ ┌─────────────┐ │
│  │   Browser   ││───▶│ │    Nginx     │ │    │ │ Production  │ │
│  │             ││    │ │   (Optional) │ │    │ │  Database   │ │
│  └─────────────┘│    │ │ Port: 80/443 │ │    │ │             │ │
│                 │    │ └──────────────┘ │    │ └─────────────┘ │
│                 │    │         │        │    │        ▲        │
│                 │    │ ┌──────────────┐ │    │        │        │
│                 │    │ │     App      │◀┼────┼────────┘        │
│                 │    │ │  Container   │ │    │ Direct Connection│
│                 │    │ │ Port: 3000   │ │    │   (Serverless)  │
└─────────────────┘    │ └──────────────┘ │    │                 │
                       │   Docker Network │    └─────────────────┘
                       └──────────────────┘
```

## Security Considerations

### Development
- Self-signed certificates are acceptable for Neon Local
- Environment variables stored in `.env.development`
- Database branches are ephemeral and isolated

### Production
- Use proper SSL certificates with Neon Cloud
- Store secrets securely (Docker secrets, environment injection)
- Enable security headers and HTTPS
- Use non-root containers with read-only filesystems
- Implement proper logging and monitoring

## Next Steps

1. **Configure Monitoring**: Set up proper application monitoring and alerting
2. **Add CI/CD**: Implement automated builds and deployments
3. **Load Balancing**: Configure multiple app instances behind a load balancer
4. **Backup Strategy**: Implement regular database backups
5. **Security Hardening**: Add additional security layers and vulnerability scanning

## Support

- **Application Issues**: Check application logs and health endpoints
- **Database Issues**: Verify Neon credentials and connection strings  
- **Docker Issues**: Review container logs and resource usage
- **Neon Local**: Refer to [Neon Local Documentation](https://neon.com/docs/local/neon-local)

---

**Note**: Always test your Docker setup in a staging environment before deploying to production.