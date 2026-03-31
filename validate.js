#!/usr/bin/env node

/**
 * ServiceFlow Project Validation Script
 * Verifies all necessary files exist and project structure is correct
 */

const fs = require('fs');
const path = require('path');

const requiredFiles = [
  // Backend
  'backend/src/domain/entities/User.ts',
  'backend/src/domain/entities/Client.ts',
  'backend/src/domain/entities/Service.ts',
  'backend/src/domain/repositories/IUserRepository.ts',
  'backend/src/domain/repositories/IClientRepository.ts',
  'backend/src/domain/repositories/IServiceRepository.ts',
  'backend/src/application/use-cases/AuthUseCase.ts',
  'backend/src/application/use-cases/ClientUseCase.ts',
  'backend/src/application/use-cases/ServiceUseCase.ts',
  'backend/src/infra/repositories/UserRepository.ts',
  'backend/src/infra/repositories/ClientRepository.ts',
  'backend/src/infra/repositories/ServiceRepository.ts',
  'backend/src/presentation/controllers/AuthController.ts',
  'backend/src/presentation/controllers/ClientController.ts',
  'backend/src/presentation/controllers/ServiceController.ts',
  'backend/src/server.ts',
  'backend/prisma/schema.prisma',
  'backend/package.json',
  'backend/tsconfig.json',
  'backend/Dockerfile',
  'backend/.env',

  // Frontend
  'frontend/src/App.tsx',
  'frontend/src/main.tsx',
  'frontend/src/components/Header.tsx',
  'frontend/src/hooks/useAuth.ts',
  'frontend/src/hooks/useClients.ts',
  'frontend/src/hooks/useServices.ts',
  'frontend/src/pages/DashboardPage.tsx',
  'frontend/src/pages/ClientsPage.tsx',
  'frontend/src/pages/ServicesPage.tsx',
  'frontend/src/services/api.ts',
  'frontend/package.json',
  'frontend/tsconfig.json',
  'frontend/index.html',
  'frontend/Dockerfile',
  'frontend/.env',

  // Root
  'docker-compose.yml',
  'README.md',
  'ARCHITECTURE.md',
  '.gitignore',
];

const requiredDirectories = [
  'backend/src/domain',
  'backend/src/application',
  'backend/src/infra',
  'backend/src/presentation',
  'backend/tests',
  'frontend/src',
  'frontend/src/components',
  'frontend/src/pages',
  'frontend/src/hooks',
];

let missingFiles = [];
let missingDirs = [];

// Check files
requiredFiles.forEach((file) => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) {
    missingFiles.push(file);
  }
});

// Check directories
requiredDirectories.forEach((dir) => {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) {
    missingDirs.push(dir);
  }
});

// Report
console.log('\x1b[36m%s\x1b[0m', '╔════════════════════════════════════════╗');
console.log('\x1b[36m%s\x1b[0m', '║   ServiceFlow Project Validation       ║');
console.log('\x1b[36m%s\x1b[0m', '╚════════════════════════════════════════╝');
console.log('');

if (missingDirs.length === 0 && missingFiles.length === 0) {
  console.log('\x1b[32m%s\x1b[0m', '✅ All required files and directories exist!');
  console.log('');
  console.log('✨ Project structure is complete and ready to run');
  console.log('');
  console.log('Next steps:');
  console.log('  1. Read GETTING_STARTED.md');
  console.log('  2. Run: docker-compose up -d');
  console.log('  3. Visit: http://localhost:5173');
  process.exit(0);
} else {
  console.log('\x1b[31m%s\x1b[0m', '❌ Project structure incomplete!');
  console.log('');

  if (missingDirs.length > 0) {
    console.log('\x1b[33m%s\x1b[0m', 'Missing directories:');
    missingDirs.forEach((dir) => {
      console.log(`  - ${dir}`);
    });
    console.log('');
  }

  if (missingFiles.length > 0) {
    console.log('\x1b[33m%s\x1b[0m', 'Missing files:');
    missingFiles.forEach((file) => {
      console.log(`  - ${file}`);
    });
    console.log('');
  }

  process.exit(1);
}
