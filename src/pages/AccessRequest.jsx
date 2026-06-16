import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs,addDoc } from "firebase/firestore";

function AccessRequest({requests, setRequests, logs, setLogs }) {
  const { id } = useParams();
 useEffect(() => {
  const fetchDocument = async() => {
    try {
      const snapshot = await getDocs(
        collection(db, "documents")
      );

      const docs = snapshot.docs.map((d) => d.data());
      console.log("URL ID:", id);
      console.log("Firestore Docs:", docs);
      console.log("Looking for ID:", id);

      docs.forEach((d) => {
  console.log(
    "Firestore ID:",
    d.accessId,
    "==",
    id,
    "?",
    d.accessId === id
  );
});

 const found = docs.find(
  (d) => d.accessId === id
);

console.log("Found:", found);

      setDoc(found || null);
    } catch (error) {
      console.error(error);
    }

    setLoading(false);
  };

  fetchDocument();
}, [id]);
 const [doc, setDoc] = useState(null);
 const [loading, setLoading] = useState(true);

 const [sent, setSent] = useState(false);
 const handleRequest = async() => {
    const newRequest = {
      id: Date.now(),
      requester: "External User",
      document: doc?.name,
      purpose: "Access via Link",
      status: "Pending",
    };
    try {
  await addDoc(collection(db, "requests"), newRequest);
  console.log("Request saved to Firestore");
} catch (error) {
  console.error(error);
}

    setRequests((prev) => [...prev, newRequest]);

    setLogs((prev) => [
      ...prev,
      {
        id: Date.now(),
        action: "Access Requested via Link",
        detail: doc?.name,
      },
    ]);

    setSent(true);
  };
  if (loading) {
  return (
    <div className="p-6">
      Loading...
    </div>
  );
}

  if (!doc) {
    return (
      <div className="p-6">
        <h1>Invalid or expired link</h1>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="bg-white p-6 rounded-xl shadow">
        <h1 className="text-2xl font-bold mb-4">
          Access Request
        </h1>

        <p><b>Document:</b> {doc.name}</p>
        <p><b>File:</b> {doc.fileName}</p>

        {!sent ? (
          <button
            onClick={handleRequest}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
          >
            Request Access
          </button>
        ) : (
          <p className="text-green-600 mt-4">
            Request Sent ✔
          </p>
        )}
      </div>
    </div>
  );
}

export default AccessRequest;