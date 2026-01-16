import { createRoot } from "react-dom/client";
import AppRouter from "../src/routes/AppRouter.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <AppRouter />
);