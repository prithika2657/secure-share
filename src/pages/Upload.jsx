import { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";

function Upload({ documents, setDocuments, requests, setRequests,logs,setLogs }) {
  const [name, setName] = useState("");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const handleUpload = async() => {
  console.log("Before upload:",documents);

  if (!name || !file) {
    console.log("Name or file missing", name, file);
    return;
  }
  const uniqueId = `doc-${Math.random()
  .toString(36)
  .substring(2, 10)}`;
  // Create new document
  const newDoc = {
    id: Date.now(),
    name,
    fileName: file.name,
    accessLink: `https://secure-share-je1hs81ip-prithika2657s-projects.vercel.app/access/${uniqueId}`
  };
try {
  await addDoc(collection(db, "documents"), newDoc);
  console.log("Document saved to Firestore!");
} catch (error) {
  console.error("Error saving document:", error);
}
  // Create new request
  const newRequest = {
    id: Date.now() + 1,
    requester: "External User",
    document: name,
    purpose: "Access Request",
    status: "Pending",
  };
  try {
  await addDoc(collection(db, "requests"), newRequest);
  console.log("Request saved to Firestore!");
} catch (error) {
  console.error("Error saving request:", error);
}

  // Add document
  setDocuments((prev) => {
  const updated = [...prev, newDoc];
  localStorage.setItem("documents", JSON.stringify(updated));
  return updated;
  });
  console.log("Document added:", newDoc);
  // Add request
  setRequests((prev) => {
  const updated = [...prev, newRequest];
  localStorage.setItem("requests", JSON.stringify(updated));
  return updated;
});
const newLog = {
  id: Date.now() + 2,
  action: "Document Uploaded",
  detail: name,
};
try {
  await addDoc(collection(db, "logs"), newLog);
  console.log("Log saved to Firestore!");
} catch (error) {
  console.error("Error saving log:", error);
}
  // Add log
 setLogs((prev) => {
  const updated = [...prev,newLog];

  localStorage.setItem("logs", JSON.stringify(updated));

  return updated;
});
  // Success message
  setMessage("Upload successful ✅");

  // Clear fields
  setName("");
  setFile(null);
};
  const latestDoc = documents[documents.length - 1];
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">
        Upload Document
      </h1>

      <div className="bg-white p-8 rounded-xl shadow max-w-2xl">

        {/* Document name */}
        <input
          type="text"
          placeholder="Document name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border p-3 rounded mb-4"
        />

      <label className="block border p-3 rounded cursor-pointer bg-gray-50 mb-4">
        <input
          type="file"
          className="hidden"
          onChange={(e) => setFile(e.target.files[0])}
  />
        {file ? file.name : "Click to choose file"}
      </label>

        {/* Show selected file */}
        {file && (
          <p className="text-sm text-gray-600 mb-4">
            Selected: {file.name}
          </p>
        )}

        <button
          onClick={handleUpload}
          className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
        >
          Upload
        </button>
       {latestDoc?.accessLink && (
  <div className="mt-6 p-4 bg-gray-100 rounded">
    <h3 className="font-bold mb-2">Latest Access Link:</h3>

    <a
      href={latestDoc.accessLink}
      className="text-blue-600 underline"
    >
      Open Access Link
    </a>

    <button
      onClick={() =>
        navigator.clipboard.writeText(latestDoc.accessLink)
      }
      className="mt-2 bg-green-600 text-white px-4 py-2 rounded"
    >
      Copy Link
    </button>
  </div>
)}
   {message && (
     <p className="text-green-600 mt-4">
      {message}
      </p>
     )}
      </div>
    </div>
  );
}

export default Upload;