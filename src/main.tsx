import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css";
import ErrorBoundary from "./components/ErrorBoundary";
import { Toaster } from "sonner";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <ErrorBoundary>
            <App />
            <Toaster closeButton />
        </ErrorBoundary>
    </React.StrictMode>
);
