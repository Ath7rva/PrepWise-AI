## PrepWise Client Notes

This frontend is the React + Vite client for PrepWise AI.

### Local development

```bash
npm install
npm run dev
```

The client reads `VITE_API_URL` from the environment. If it is not set, the code falls back to `http://localhost:5000` during local development and `https://prepwise-ai-backend-a16j.onrender.com` in production. See [`client/src/config/api.js`](C:/Users/salun/OneDrive/Desktop/PrepWise-AI/client/src/config/api.js).

### Auth behavior

After login or signup, the client stores the JWT in `localStorage` under `token` and reuses it through an Axios interceptor that sets the `Authorization` header automatically. The user payload is stored separately under `user`.

### Interview session output

Completed interviews can be exported locally as `PrepWise_Proctored_Interview_Report.pdf`. The interview flow also submits captured proctoring media with the session evaluation payload, including snapshots and a WebM video clip.

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
