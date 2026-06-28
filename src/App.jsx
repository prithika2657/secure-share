//TEST123
import Login from "./pages/Login";
import { useState } from "react";
import {
  HashRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import Requests from "./pages/Requests";
import AuditLogs from "./pages/AuditLogs";
import AccessRequest from "./pages/AccessRequest.jsx";
import Signup from "./pages/Signup";
import { auth } from "./firebase";
import Viewer from "./pages/Viewer";

function RouteDebugger() {
  const location = useLocation();

  console.log("PATH:", location.pathname);

  return null;
}
function ProtectedRoute({ children }) {
  const location = useLocation();

  if (!auth.currentUser) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  return children;
}
export default function App() {
   console.log("APP LOADED");
  console.log("HASH:", window.location.hash);
 const [documents, setDocuments] = useState(() => {
  return JSON.parse(localStorage.getItem("documents")) || [];
});
 const [requests, setRequests] = useState(() => {
  return JSON.parse(localStorage.getItem("requests")) || [];
});
 const [logs, setLogs] = useState(() => {
  return JSON.parse(localStorage.getItem("logs")) || [];
});

  return (
    <HashRouter>
    <RouteDebugger />
      <div className="flex">
        {!window.location.hash.includes("/access/") && (
  <Sidebar />
)}

        <div className="flex-1">
          
          <Routes>
             <Route
  path="/signup"
  element={<Signup />}
/>
<Route
  path="/login"
  element={<Login />}
/>
 <Route
  path="/"
  element={
    <ProtectedRoute>
    <Dashboard
      documents={documents}
      requests={requests}
    />
    </ProtectedRoute>
  }
/>

          <Route
  path="/upload"
  element={
    <ProtectedRoute>
      <Upload
        documents={documents}
        setDocuments={setDocuments}
        requests={requests}
        setRequests={setRequests}
        logs={logs}
        setLogs={setLogs}
      />
    </ProtectedRoute>
  }
/>

            <Route
  path="/requests"
  element={
    <ProtectedRoute>
      <Requests
        requests={requests}
        setRequests={setRequests}
        logs={logs}
        setLogs={setLogs}
      />
    </ProtectedRoute>
  }
/>
            <Route
              path="/access/:id"
              element={
              <AccessRequest
                documents={documents}
                requests={requests}
                setRequests={setRequests}
                logs={logs}
                setLogs={setLogs}
    />

  }
/>
            <Route
  path="/logs"
  element={
    <ProtectedRoute>
      <AuditLogs logs={logs} />
    </ProtectedRoute>
  }
/>
<Route
  path="/viewer/:id"
  element={<Viewer />}
/>
          </Routes>
        </div>
      </div>
    </HashRouter>
  );
}