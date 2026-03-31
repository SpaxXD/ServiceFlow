# Production Deployment Guide

This guide covers deploying ServiceFlow to production environments.

## Pre-Deployment Checklist

- [ ] Read and understood the full README.md
- [ ] Reviewed ARCHITECTURE.md
- [ ] All tests passing (`npm test` in both backend and frontend)
- [ ] Code reviewed and quality checked
- [ ] Environment variables configured
- [ ] Database backed up
- [ ] SSL/TLS certificates obtained
- [ ] Domain names configured
- [ ] Monitoring/logging solution selected
- [ ] Load testing completed

## Environment Variables

### Backend Production (.env)

```env
# Server
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# Database
DATABASE_URL=postgresql://user:strongpassword@postgres-host.domain.com:5432/serviceflow

# JWT - Use strong random secrets!
JWT_SECRET=<generate-with: openssl rand -hex 32>
JWT_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# Frontend URL
FRONTEND_URL=https://your-domain.com
```

### Frontend Production (.env)

```env
VITE_API_URL=https://api.your-domain.com
```

## Generate JWT Secret

```bash
# Linux/Mac
openssl rand -hex 32

# Windows PowerShell
[System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((New-Guid).ToString())) | ForEach-Object { $_.Substring(0, 32) }
```

## Deployment Options

### Option 1: Docker on VPS (Recommended)

#### Requirements
- VPS with Docker & Docker Compose installed
- PostgreSQL server (managed or self-hosted)
- Domain with DNS records

#### Steps

1. **Setup VPS**
```bash
# SSH into VPS
ssh user@your-vps.com

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

2. **Deploy Application**
```bash
# Clone repository
git clone https://github.com/your-org/serviceflow.git
cd serviceflow

# Setup environment
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Update .env with production values
nano backend/.env

# Run migrations
docker-compose run backend npm run db:migrate
docker-compose run backend npm run db:seed

# Start services
docker-compose up -d

# View logs
docker-compose logs -f
```

3. **Setup Reverse Proxy (Nginx)**
```nginx
# /etc/nginx/sites-available/serviceflow

upstream backend {
  server localhost:3000;
}

upstream frontend {
  server localhost:5173;
}

server {
  listen 443 ssl http2;
  server_name api.your-domain.com;
  
  ssl_certificate /etc/letsencrypt/live/api.your-domain.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/api.your-domain.com/privkey.pem;
  
  location / {
    proxy_pass http://backend;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}

server {
  listen 443 ssl http2;
  server_name your-domain.com;
  
  ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
  
  location / {
    proxy_pass http://frontend;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}

# Redirect HTTP to HTTPS
server {
  listen 80;
  server_name api.your-domain.com your-domain.com;
  return 301 https://$server_name$request_uri;
}
```

4. **Setup SSL with Let's Encrypt**
```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Generate certificates
sudo certbot certonly --nginx -d your-domain.com -d api.your-domain.com
```

### Option 2: Cloud Platforms

#### Heroku (deprecated but similar to Render/Railway)

**For Render.com** (modern alternative):

1. Create account on [render.com](https://render.com)
2. Connect GitHub repository
3. Create Web Service for backend
   - Build command: `cd backend && npm install && npm run build`
   - Start command: `npm start`
   - Environment variables: Set in Render dashboard
4. Create Static Site for frontend
   - Build command: `cd frontend && npm install && npm run build`
   - Publish directory: `frontend/dist`

#### AWS Deployment

1. **For Backend**: Use ECS with Fargate
   - Create ECR repository
   - Push Docker image
   - Create ECS service
   - Set ALB health checks

2. **For Frontend**: Use CloudFront + S3
   - Build frontend (npm run build)
   - Upload dist/ to S3
   - Configure CloudFront distribution

3. **Database**: Use RDS PostgreSQL
   - Run migrations via Lambda or task

### Option 3: Kubernetes (Advanced)

```yaml
# deployment.yaml example
apiVersion: apps/v1
kind: Deployment
metadata:
  name: serviceflow-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: your-registry/serviceflow-backend:latest
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: url
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: jwt-secret
              key: secret
```

## Monitoring & Logging

### Application Monitoring
- [ ] Setup APM (DataDog, New Relic, or similar)
- [ ] Configure error tracking (Sentry)
- [ ] Setup uptime monitoring

### Log Aggregation
- [ ] Use centralized logging (ELK, Splunk, CloudWatch)
- [ ] Configure log retention
- [ ] Setup alerts for errors

### Example with ELK Stack
```bash
# Docker Compose addition
elasticsearch:
  image: docker.elastic.co/elasticsearch/elasticsearch:7.17.0
  environment:
    - discovery.type=single-node
  ports:
    - "9200:9200"

kibana:
  image: docker.elastic.co/kibana/kibana:7.17.0
  ports:
    - "5601:5601"

logstash:
  image: docker.elastic.co/logstash/logstash:7.17.0
  volumes:
    - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf
```

## Backup Strategy

### Database Backups
```bash
# Daily backup script
#!/bin/bash
BACKUP_DIR="/backups/serviceflow"
DATE=$(date +%Y%m%d_%H%M%S)

pg_dump -U serviceflow -h localhost serviceflow | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Keep only last 30 days
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +30 -delete
```

### Automated Backups
- Use managed database backup services
- Configure automated snapshots
- Test backup restoration regularly

## Performance Optimization

### Database
- Enable query logging
- Monitor slow queries
- Add indexes as needed
- Configure connection pooling

### Frontend
- Enable gzip compression
- Use CDN for static assets
- Implement browser caching
- Optimize images

### Backend
- Cache frequently accessed data
- Implement rate limiting
- Use database connection pooling
- Monitor memory usage

## Security Hardening

### Network
- [ ] Firewall rules configured
- [ ] Only expose necessary ports
- [ ] Enable WAF (Web Application Firewall)
- [ ] Setup DDoS protection

### Application
- [ ] Regular dependency updates
- [ ] Security headers configured
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Input validation strict
- [ ] Output encoding enabled

### Data
- [ ] Database encryption at rest
- [ ] TLS/SSL in transit
- [ ] Secrets manager configured
- [ ] Regular security audits

### Example Security Headers
```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
```

## Scaling Guidelines

### Vertical Scaling
- Increase server resources (CPU, RAM)
- Useful for databases

### Horizontal Scaling
- Multiple backend instances behind load balancer
- Multiple frontend instances behind CDN
- Database read replicas

### Auto-scaling Rules
- Scale up when CPU > 70%
- Scale down when CPU < 30%
- Minimum 2 instances, maximum 10 (adjust as needed)

## Maintenance

### Regular Tasks
- [ ] Review logs for errors
- [ ] Monitor performance metrics
- [ ] Check backup integrity
- [ ] Update dependencies monthly
- [ ] Review security logs
- [ ] Test disaster recovery plan

### Update Process
```bash
# Test updates in staging first
git pull origin main
npm install
npm test
npm run build

# If all tests pass, deploy to production
docker-compose up -d --build
```

## Rollback Procedure

```bash
# Keep multiple versions ready
docker tag serviceflow-backend:latest serviceflow-backend:v1.0.0
docker push serviceflow-backend:v1.0.0

# Rollback if needed
docker-compose down
git checkout previous-commit
docker-compose up -d --build
```

## Support & Troubleshooting

### Common Issues

**Database Connection Timeout**
- Check database accessibility
- Verify credentials
- Check firewall rules
- Increase connection timeout

**High Memory Usage**
- Check for memory leaks
- Monitor Node.js heap
- Restart services if necessary

**Slow API Responses**
- Check database query performance
- Monitor CPU usage
- Check network latency
- Review application logs

### Getting Help
- Check application logs
- Monitor system resources
- Review error tracking service
- Check status page

## Cost Optimization

- Use managed services where possible
- Monitor and cleanup unused resources
- Use auto-scaling to avoid over-provisioning
- Cache static assets
- Use CDN for global distribution
- Review and optimize database queries

## SLA & Uptime

Typical SLA targets:
- 99.9% uptime (43 minutes downtime/month)
- 99.99% uptime (4 minutes downtime/month)

To achieve:
1. Multi-region deployment
2. Health checks and auto-recovery
3. Load balancing
4. Redundant databases
5. Monitoring and alerting

## Post-Deployment

1. **Verify Services**
   - Frontend accessible
   - API endpoints responding
   - Database connected
   - Authentication working

2. **Performance Testing**
   - Load test with expected traffic
   - Monitor response times
   - Check error rates

3. **User Testing**
   - Test critical user flows
   - Verify all features working
   - Check permissions system

4. **Documentation**
   - Update deployment docs
   - Document any custom configs
   - Create runbooks for operations

---

For more help, refer to:
- [README.md](./README.md)
- [ARCHITECTURE.md](./ARCHITECTURE.md)
- Docker documentation
- PostgreSQL documentation
