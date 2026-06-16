import { useState } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import { useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import Requests from "./pages/Requests";
import AuditLogs from "./pages/AuditLogs";
import AccessRequest from "./pages/AccessRequest.jsx";
function RouteDebugger() {
  const location = useLocation();

  console.log("PATH:", location.pathname);

  return null;
}
export default function App() {
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
        <Sidebar />

        <div className="flex-1">
          <h1 className="text-red-500 text-3xl">
  VERSION 2
</h1>
          <Routes>
            <Route
              path="/"
              element={
                <Dashboard
                  documents={documents}
                  requests={requests}
                />
              }
            />

            <Route
              path="/upload"
              element={
                <Upload
                   documents={documents}
                   setDocuments={setDocuments}
                   requests={requests}
                   setRequests={setRequests}
                   logs={logs}
                   setLogs={setLogs}
                />
              }
            />

            <Route
              path="/requests"
              element={
                <Requests
                  requests={requests}
                  setRequests={setRequests}
                  logs={logs}
                  setLogs={setLogs}
                />
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

            <Route path="/logs" element={<AuditLogs logs ={logs}/>} />
          </Routes>
        </div>
      </div>
    </HashRouter>
  );
}