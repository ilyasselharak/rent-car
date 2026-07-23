# RentCar Enterprise

A production-ready, enterprise-grade Car Rental Management Platform built with modern technologies and best practices.

## Architecture

```
rentcar-enterprise/
├── apps/
│   ├── frontend/          # Next.js 16 App Router
│   └── backend/           # NestJS REST API
├── packages/
│   ├── database/          # Prisma schema & client
│   ├── shared/            # Shared types, constants, schemas, utilities
│   └── config/            # Shared ESLint, TSConfig, Tailwind configs
├── infrastructure/        # Docker, K8s configs
├── docs/                  # Documentation
├── Dockerfile
├── docker-compose.yml
└── turbo.json
```

## Technology Stack

### Frontend
- **Next.js 16** with App Router
- **React 19** with Server Components
- **TypeScript** with strict mode
- **Tailwind CSS v4** with CSS variables theming
- **shadcn/ui** inspired component library
- **Framer Motion** for animations
- **Zustand** for state management
- **TanStack Query** for server state
- **Recharts** for analytics charts
- **next-themes** for dark/light mode

### Backend
- **NestJS** with modular architecture
- **Passport** with JWT strategy
- **Swagger/OpenAPI** documentation
- **Rate limiting** with @nestjs/throttler
- **Helmet** for security headers
- **Compression** for response optimization

### Database
- **PostgreSQL** with fully normalized schema
- **Prisma ORM** with type-safe queries
- **Comprehensive seed data**

### DevOps
- **Docker** multi-stage builds
- **Docker Compose** for local development
- **GitHub Actions** CI/CD pipeline
- **Turborepo** for monorepo management

## Features

### Public Website
- Responsive landing page with animations
- Vehicle catalog with advanced filtering
- Vehicle detail pages with specifications
- About, Contact, and informational pages
- SEO optimization with sitemap and robots.txt

### Authentication & Authorization
- Email/password authentication
- JWT access & refresh tokens
- Role-Based Access Control (RBAC)
- Permission-based guards
- 5 user roles: Client, Employee, Manager, Admin, Super Admin

### Booking System
- Complete booking engine with conflict detection
- Automatic pricing with seasonal/weekly rules
- Coupon and discount support
- Multi-status booking workflow
- Waiting list management

### Vehicle Management
- Full CRUD for vehicles
- Availability calendar
- Maintenance scheduling
- Damage reporting
- GPS and feature tracking

### Dashboard & Analytics
- Real-time statistics cards
- Revenue charts and reporting
- Fleet overview
- Customer analytics
- Top performing vehicles

### CRM
- Customer profiles with loyalty program
- Document management
- Blacklist functionality
- Rental history

## Getting Started

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- PostgreSQL (or use Docker)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd rentcar-enterprise
```

2. Install dependencies:
```bash
yarn install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start with Docker Compose:
```bash
docker-compose up -d
```

Or run locally:
```bash
# Start PostgreSQL
yarn db:generate
yarn db:push
yarn db:seed

# Start development servers
yarn dev
```

### Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@rentcar.com | SuperAdmin123! |
| Manager | manager@rentcar.com | Manager123! |
| Employee | employee@rentcar.com | Employee123! |

### API Documentation

Once the backend is running, visit:
```
http://localhost:4000/api/docs
```

## Development

### Scripts

```bash
# Start all apps in development mode
yarn dev

# Build all apps
yarn build

# Run linting
yarn lint

# Database operations
yarn db:generate    # Generate Prisma client
yarn db:push        # Push schema to database
yarn db:migrate     # Run migrations
yarn db:studio      # Open Prisma Studio
yarn db:seed        # Seed database
```

### Project Structure

#### Backend Modules
- `auth` - Authentication & authorization
- `users` - User management
- `vehicles` - Vehicle inventory
- `bookings` - Reservation system
- `payments` - Payment processing
- `crm` - Customer relationship management
- `fleet` - Maintenance & damage tracking
- `dashboard` - Statistics & overview
- `analytics` - Reporting & insights
- `notifications` - Notification system
- `documents` - Document management

#### Frontend Structure
- `(public)` - Public marketing pages
- `dashboard` - Admin/employee dashboard
- `components/ui` - Reusable UI components
- `lib` - Utilities and API client
- `stores` - Zustand state stores
- `types` - TypeScript type definitions

## Security

- Helmet.js for security headers
- CORS configuration
- Rate limiting (100 requests/minute)
- Input validation with Zod
- Password hashing with bcrypt
- JWT token authentication
- Role-based & permission-based access control
- SQL injection protection via Prisma

## License

MIT
