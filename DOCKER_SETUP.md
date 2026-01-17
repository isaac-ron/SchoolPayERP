# SchoolPayERP Docker Setup Guide

## Prerequisites

- Docker Desktop installed (version 20.10 or higher)
- Docker Compose installed (version 2.0 or higher)
- At least 4GB of available RAM
- Ports 80, 5000, and 27017 available

## Quick Start

### 1. Environment Configuration

Copy the environment template and configure your settings:

```bash
cp .env.example .env
```

Edit `.env` and replace placeholder values with your actual credentials:
- JWT_SECRET: Generate a secure random string
- M-Pesa credentials: Obtain from Safaricom Daraja portal
- SMS credentials: Obtain from Africa's Talking

### 2. Start the Application

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb
```

### 3. Initial Setup

After the services start, seed the initial admin user:

```bash
docker-compose exec backend node seedUser.js
```

### 4. Access the Application

- **Frontend**: http://localhost
- **Backend API**: http://localhost:5000
- **MongoDB**: localhost:27017

Default admin credentials (after seeding):
- Email: admin@schoolpay.com
- Password: admin123

## Docker Services

### MongoDB (mongodb)
- **Image**: mongo:7.0
- **Port**: 27017
- **Data Persistence**: mongodb_data volume
- **Credentials**: 
  - Username: admin
  - Password: schoolpay_admin_2026
  - Database: schoolpay

### Backend (backend)
- **Port**: 5000
- **Technology**: Node.js + Express
- **Features**:
  - REST API
  - Socket.io for real-time updates
  - M-Pesa integration
  - SMS notifications

### Frontend (frontend)
- **Port**: 80
- **Technology**: React + Vite
- **Features**:
  - Responsive dashboard
  - Real-time updates via Socket.io
  - Tailwind CSS styling

## Common Commands

### Service Management

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart services
docker-compose restart

# Restart specific service
docker-compose restart backend

# Stop and remove volumes (WARNING: deletes data)
docker-compose down -v
```

### Logs and Monitoring

```bash
# View all logs
docker-compose logs

# Follow logs in real-time
docker-compose logs -f

# View last 100 lines
docker-compose logs --tail=100

# Check service status
docker-compose ps
```

### Database Operations

```bash
# Access MongoDB shell
docker-compose exec mongodb mongosh -u admin -p schoolpay_admin_2026 --authenticationDatabase admin

# Backup database
docker-compose exec mongodb mongodump --uri="mongodb://admin:schoolpay_admin_2026@localhost:27017/schoolpay?authSource=admin" --out=/data/backup

# Restore database
docker-compose exec mongodb mongorestore --uri="mongodb://admin:schoolpay_admin_2026@localhost:27017/schoolpay?authSource=admin" /data/backup/schoolpay
```

### Development

```bash
# Rebuild services after code changes
docker-compose up -d --build

# Rebuild specific service
docker-compose up -d --build backend

# Execute commands in containers
docker-compose exec backend npm install <package-name>
docker-compose exec backend node seedUser.js

# Access container shell
docker-compose exec backend sh
docker-compose exec frontend sh
```

## Troubleshooting

### Port Already in Use

If you get port binding errors:

```bash
# Check what's using the port
netstat -ano | findstr :80
netstat -ano | findstr :5000
netstat -ano | findstr :27017

# Stop the process or change ports in docker-compose.yml
```

### MongoDB Connection Issues

1. Ensure MongoDB is healthy:
```bash
docker-compose ps
docker-compose logs mongodb
```

2. Check connection string in backend environment variables

3. Restart services:
```bash
docker-compose restart backend
```

### Frontend Build Issues

1. Clear Docker build cache:
```bash
docker-compose build --no-cache frontend
```

2. Check Vite configuration in frontend/vite.config.js

### Backend Not Starting

1. Check environment variables:
```bash
docker-compose exec backend printenv
```

2. Verify MongoDB connection:
```bash
docker-compose logs mongodb
docker-compose logs backend
```

3. Check for missing dependencies:
```bash
docker-compose exec backend npm install
docker-compose restart backend
```

## Production Deployment

### Security Checklist

- [ ] Change default MongoDB credentials
- [ ] Generate strong JWT_SECRET
- [ ] Configure proper CORS origins
- [ ] Enable HTTPS/SSL certificates
- [ ] Set up firewall rules
- [ ] Configure backup strategy
- [ ] Enable MongoDB authentication
- [ ] Review and update all API keys
- [ ] Set NODE_ENV=production

### Environment Variables

Update the following for production:

```env
NODE_ENV=production
MONGO_URI=mongodb://admin:STRONG_PASSWORD@mongodb:27017/schoolpay?authSource=admin
JWT_SECRET=GENERATE_STRONG_SECRET_KEY
MPESA_CALLBACK_URL=https://yourdomain.com/api/payments/mpesa/callback
VITE_API_URL=https://api.yourdomain.com
VITE_SOCKET_URL=https://api.yourdomain.com
```

### Scaling

To run multiple backend instances:

```yaml
backend:
  scale: 3
```

Then run:
```bash
docker-compose up -d --scale backend=3
```

## Maintenance

### Update Docker Images

```bash
# Pull latest images
docker-compose pull

# Rebuild and restart
docker-compose up -d --build
```

### Backup Strategy

Create automated backup script:

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose exec -T mongodb mongodump \
  --uri="mongodb://admin:schoolpay_admin_2026@localhost:27017/schoolpay?authSource=admin" \
  --archive > backup_$DATE.dump
```

### Clean Up

```bash
# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Remove unused containers
docker container prune
```

## Support

For issues or questions:
1. Check logs: `docker-compose logs -f`
2. Verify service health: `docker-compose ps`
3. Review environment variables
4. Check GitHub issues

## License

See LICENSE file in the root directory.
