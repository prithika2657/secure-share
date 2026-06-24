import { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { auth } from "../firebase";
function Upload({ documents, setDocuments, requests, setRequests,logs,setLogs }) {
  const [name, setName] = useState("");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [accessMode, setAccessMode] = useState("download");
  const [expiryHours, setExpiryHours] = useState("");
  const [copied, setCopied] = useState(false);
  const handleUpload = async() => {
  console.log("Before upload:",documents);
  console.log("Current User:", auth.currentUser);
console.log("Name:", name);
console.log("File:", file);
  if (!name || !file) {
    console.log("Name or file missing", name, file);
    return;
  }
  const formData = new FormData();

formData.append("file", file);
formData.append(
  "upload_preset",
  "secureshare_upload"
);

const cloudinaryResponse = await fetch(
  "https://api.cloudinary.com/v1_1/dpdr2tgpd/auto/upload",
  {
    method: "POST",
    body: formData,
  }
);

const cloudinaryData =
  await cloudinaryResponse.json();

console.log(
  "Cloudinary Upload:",
  cloudinaryData
);

const fileUrl = cloudinaryData.secure_url;
  const uniqueId = `doc-${Math.random()
  .toString(36)
  .substring(2, 10)}`;
  const  accessLink =`https://secure-share-six.vercel.app/#/access/${uniqueId}`;

  // Create new document
  const newDoc = {
    id: Date.now(),
    name,
    fileName: file.name,
    accessId: uniqueId,
    accessLink: accessLink,
    accessMode: accessMode,
    expiryHours:
    accessMode === "expiry"
      ? Number(expiryHours)
      : null,
    fileUrl: fileUrl,
  createdAt:
    new Date().toISOString(),
  ownerId: auth.currentUser.uid,
  ownerEmail: auth.currentUser.email,
  };
try {
  await addDoc(collection(db, "documents"), newDoc);
  console.log("Document saved to Firestore!");
} catch (error) {
  console.error("Error saving document:", error);
}
  // Create new request
 

  // Add document
  setDocuments((prev) => {
  const updated = [...prev, newDoc];
  localStorage.setItem("documents", JSON.stringify(updated));
  return updated;
  });
  console.log("Document added:", newDoc);
  // Add request
const newLog = {
  id: Date.now() + 2,
  action: "Document Uploaded",
  detail: name,
   timestamp: new Date().toLocaleString(),
   ownerId: auth.currentUser?.uid
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
  const handleCopyLink = () => {
console.log(
    "Copying:",
    latestDoc?.accessLink
  );
  if (!latestDoc?.accessLink) return;

  navigator.clipboard.writeText(
    latestDoc.accessLink
  );

  setCopied(true);

  setTimeout(() => {
    setCopied(false);
  }, 2000);

};
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
  <div className="mt-4">
  <label className="block mb-2 font-semibold">
    Access Mode
  </label>

  <select
    value={accessMode}
    onChange={(e) => setAccessMode(e.target.value)}
    className="border p-2 rounded w-full"
  >
    <option value="download">
      Download After Approval
    </option>

    <option value="viewOnly">
      View Only
    </option>

    <option value="expiry">
      Expiry Link
    </option>
  </select>
</div>
{accessMode === "expiry" && (
  <div className="mt-4">
    <label className="block mb-2 font-semibold">
      Expiry Hours
    </label>

    <input
      type="number"
      placeholder="Enter hours (e.g. 24)"
      value={expiryHours}
      onChange={(e) => setExpiryHours(e.target.value)}
      className="border p-2 rounded w-full"
    />
  </div>
)}
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
  onClick={handleCopyLink}
  className={`px-4 py-2 rounded text-white transition-all ${
    copied
      ? "bg-green-600"
      : "bg-blue-600"
  }`}
>
  {copied
    ? "✓ Copied"
    : "📋 Copy Link"}
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