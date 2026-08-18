# CLAUDE.md - InternVision Tech Development Instructions

## Git Commit Workflow Rules
1. **Frequency**: Create a commit whenever a meaningful small functionality or feature block is completed.
2. **Commit Message Format**:
   - Write clear, simple, human-understandable commit messages.
   - **DO NOT** use AI-generated prefixes like `feat:`, `fix:`, `docs:`, `chore:`, `refactor:` at the beginning of commit messages.
   - Example good commit messages:
     - `Add course search and filter components`
     - `Implement Razorpay HMAC signature verification endpoint`
     - `Update Admin dashboard table pagination controls`

## Build & Test Commands
### Backend
- Navigate to `backend/`
- Install dependencies: `pip install -r requirements.txt`
- Run local server: `python -m app.main` or `uvicorn app.main:app --reload`
- Run seed data: `python -m app.seed`
- Run tests: `pytest`

### Frontend
- Navigate to `frontend/`
- Install dependencies: `npm install --legacy-peer-deps`
- Run dev server: `npm run dev`
- Build production: `npm run build`

## Code Style & Rules
- **Python**: Standard PEP 8, Pydantic v2 schemas, SQLAlchemy 2.0 type hints (`Mapped`, `mapped_column`), explicit status codes in FastAPI routes.
- **TypeScript / Next.js**: App Router (`src/app`), strict TypeScript, Tailwind CSS, Lucide React icons, Zod form validation.
- **Documentation**: Keep `context/` markdown files updated when modifying models or routes.
