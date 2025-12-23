# Portfolio

- Backend: src/Portfolio.Api (ASP.NET Core 8)
- Frontend: frontend (static site, ready for GitHub Pages)

Quick run (dev):
1. cd src\Portfolio.Api
2. dotnet run

Frontend on GitHub Pages:
- Publish `frontend/` to gh-pages branch (or GitHub Pages root).
- Configure API_BASE_URL in frontend if your API is hosted elsewhere (replace window.__API_BASE_URL__ or set during build).

Notes:
- Backend is CORS-enabled and serves API at /api/*. When deploying backend separately, set API_BASE_URL in the frontend to your API origin.