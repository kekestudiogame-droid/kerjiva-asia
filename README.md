# Kerjiva Malaysia

**A career platform for job seekers and companies in Malaysia.**

Kerjiva Malaysia helps job seekers discover relevant job opportunities and enables companies to publish vacancies and manage applications through one platform.

## Features

- Job search and discovery
- Job category and location filters
- English and Bahasa Melayu language support
- Job details and descriptions
- User registration and login
- Job Seeker Dashboard
- Company Dashboard
- Job seeker profiles
- Job applications
- CV and document uploads
- Company job management
- Incoming application management
- Interview invitations
- Responsive design for desktop and mobile devices
- Progressive Web App (PWA) support
- Centralized data synchronization

## Technology

- HTML
- CSS
- JavaScript
- Supabase
- GitHub Pages
- Progressive Web App (PWA)

## Database and Data Management

Kerjiva Malaysia uses its own Supabase project to manage application data, including:

- Job listings
- Company profiles
- Job seeker profiles
- Job applications
- Interview invitations
- CVs and other documents

Supabase serves as the primary source of data.

The Central Sync system helps manage data caching, synchronization, and updates across relevant website features to improve performance and reduce unnecessary database requests.

## Language Support

Kerjiva Malaysia supports:

- English as the default language
- Bahasa Melayu as an additional language

Website interface translations are managed separately from job listing translations.

Published job listings can use stored translations to avoid unnecessary repeated translation requests.

## Progressive Web App (PWA)

Kerjiva Malaysia includes PWA foundations:

- `manifest.json`
- `service-worker.js`
- Application icon
- Browser installation support
- Static asset caching
- Network-first page loading strategy

The Service Worker is designed to avoid caching Supabase authentication, API, storage, and dynamic application data.

## Deployment

Kerjiva Malaysia is developed as a static website and deployed through GitHub Pages.

Repository: `kerjiva-asia`

Website: https://kekestudiogame-droid.github.io/kerjiva-asia/

Planned custom domain: `my.kerjiva.com`

## Security

Never commit sensitive information to this repository, including:

- Passwords
- Private API keys
- Access tokens
- Secret keys
- Database credentials
- Authentication secrets

Public configuration must follow the security policies and Row Level Security (RLS) rules configured in Supabase.

## Project Status

Kerjiva Malaysia is under active development, with its core website features and data synchronization system being integrated and tested.

### Completed Foundations

- Separate Malaysia project and Supabase environment.
- Core job seeker and company features.
- Central Sync data synchronization system.
- English and Bahasa Melayu interface support.
- Job listing and application workflows.
- PWA manifest and application icon.
- Service Worker registration.
- Basic static asset caching configuration.
- GitHub Pages deployment.

### Next Development Stages

- Complete testing of existing website features.
- Configure and activate the custom domain.
- Continue PWA testing and optimization.
- Prepare for future Android application distribution.
- Improve website performance, stability, and user experience.
- Prepare for public launch and audience growth.

## Development Principles

Kerjiva Malaysia prioritizes:

- Stability and reliability
- Data security
- Efficient data synchronization
- Fast page navigation
- User-friendly design
- Independent development from Kerjiva Indonesia
- Gradual improvements without disrupting existing features
