# 🤝 Contributing to VetChart EMR System

Thank you for your interest in contributing to VetChart! This document provides guidelines and instructions for contributing to this project.

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Development Environment](#development-environment)
- [Code Style Guidelines](#code-style-guidelines)
- [Contributing Process](#contributing-process)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Issue Guidelines](#issue-guidelines)
- [Code of Conduct](#code-of-conduct)

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (LTS version recommended)
- **npm** or **yarn**
- **Docker Desktop** (for database setup)
- **Git**

### Fork and Clone

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/vet-chart.git
   cd vet-chart
   ```
3. **Add the original repository** as upstream:
   ```bash
   git remote add upstream https://github.com/Eddie000321/vet-chart.git
   ```

## 🛠️ Development Environment

### Initial Setup

1. **Install frontend dependencies:**
   ```bash
   npm install
   ```

2. **Set up backend:**
   ```bash
   cd server
   npm install
   cd ..
   ```

3. **Start the database:**
   ```bash
   docker-compose up -d
   ```

4. **Run database migrations:**
   ```bash
   cd server
   npx prisma migrate dev --name init
   npx prisma generate
   cd ..
   ```

### Running the Application

**Start both frontend and backend:**
```bash
npm run dev:full
```

**Or run them separately:**

Frontend only:
```bash
npm run dev
```

Backend only:
```bash
npm run dev:backend
```

### Development Tools

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Database**: PostgreSQL on port 5434

## 🎨 Code Style Guidelines

### TypeScript Standards

- **Use TypeScript** for all new code
- **Define interfaces** for all data structures
- **Avoid `any` type** - use proper typing
- **Use meaningful variable names**

### React Component Guidelines

```typescript
// ✅ Good: Functional component with proper typing
interface PatientFormProps {
  onSubmit: (patient: Patient) => void;
  initialData?: Partial<Patient>;
}

export const PatientForm: React.FC<PatientFormProps> = ({ onSubmit, initialData }) => {
  // Component logic here
};

// ❌ Avoid: Components without proper typing
export const PatientForm = ({ onSubmit, initialData }) => {
  // Missing type definitions
};
```

### API Guidelines

```typescript
// ✅ Good: Proper error handling and typing
export const createPatient = async (patientData: CreatePatientRequest): Promise<Patient> => {
  try {
    const response = await fetch('/api/patients', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(patientData)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create patient: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating patient:', error);
    throw error;
  }
};
```

### Database Schema Guidelines

- **Use descriptive table names** (singular form)
- **Include proper relationships** with foreign keys
- **Add appropriate indexes** for performance
- **Use consistent naming conventions**

```prisma
// ✅ Good: Clear relationships and naming
model Patient {
  id        String   @id @default(cuid())
  name      String
  species   String
  breed     String
  ownerId   String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relations
  owner            Owner           @relation(fields: [ownerId], references: [id], onDelete: Cascade)
  appointments     Appointment[]
  medicalRecords   MedicalRecord[]
}
```

### CSS/Styling Guidelines

- **Use Tailwind CSS** utility classes
- **Follow responsive design** principles
- **Use consistent spacing** (Tailwind's spacing scale)
- **Implement dark mode** considerations where applicable

## 🔄 Contributing Process

### Branch Strategy

1. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Keep your branch updated:**
   ```bash
   git fetch upstream
   git merge upstream/master
   ```

3. **Make your changes** following the code style guidelines

4. **Test your changes:**
   ```bash
   npm run lint
   npm run build
   ```

5. **Commit your changes:**
   ```bash
   git add .
   git commit -m "feat: add patient search functionality"
   ```

### Commit Message Format

Use the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(patients): add search and filter functionality
fix(billing): resolve calculation error in tax computation
docs(readme): update installation instructions
```

## 📝 Pull Request Guidelines

### Before Submitting

- [ ] **Run linting:** `npm run lint`
- [ ] **Build successfully:** `npm run build`
- [ ] **Test your changes** thoroughly
- [ ] **Update documentation** if needed
- [ ] **Write meaningful commit messages**

### PR Title Format

Use the same format as commit messages:
```
feat(scope): add new functionality
```

### PR Description Template

```markdown
## 🎯 Purpose
Brief description of what this PR accomplishes.

## 🔧 Changes Made
- List of specific changes
- Include any breaking changes
- Mention new dependencies if added

## 🧪 Testing
- How did you test these changes?
- Include screenshots for UI changes
- List any edge cases considered

## 📋 Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or marked as such)
```

### Review Process

1. **Automated checks** must pass
2. **At least one maintainer** review required
3. **Address feedback** promptly
4. **Squash commits** if requested before merge

## 🐛 Issue Guidelines

### Bug Reports

Use the bug report template and include:

- **Clear title** describing the issue
- **Steps to reproduce** the bug
- **Expected vs actual behavior**
- **Environment details** (OS, Node version, etc.)
- **Screenshots** if applicable

### Feature Requests

Include:

- **Problem statement** - what problem does this solve?
- **Proposed solution** - how should it work?
- **Use cases** - who would benefit from this?
- **Mockups/wireframes** if applicable

### Questions and Discussions

- Use **Discussions** tab for general questions
- Search **existing issues** before creating new ones
- Use **clear, descriptive titles**

## 🤝 Code of Conduct

### Our Standards

- **Be respectful** and inclusive
- **Welcome newcomers** and help them learn
- **Provide constructive feedback**
- **Focus on what's best** for the community
- **Show empathy** towards other contributors

### Unacceptable Behavior

- Harassment or discriminatory language
- Personal attacks or trolling
- Publishing private information without permission
- Other conduct inappropriate in a professional setting

## 🏷️ Labels and Milestones

### Common Labels

- `bug` - Something isn't working
- `enhancement` - New feature or improvement
- `documentation` - Documentation improvements
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention is needed
- `priority: high/medium/low` - Issue priority

## 📚 Additional Resources

- [React Documentation](https://reactjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Express.js Documentation](https://expressjs.com/)

## ❓ Questions?

If you have questions about contributing:

1. **Check the documentation** first
2. **Search existing issues** and discussions
3. **Create a new discussion** for general questions
4. **Open an issue** for bug reports or feature requests

---

Thank you for contributing to VetChart! Your efforts help make this project better for everyone. 🎉