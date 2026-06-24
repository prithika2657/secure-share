import { db } from "../firebase";
import {
  collection,
  getDocs,
  updateDoc,
  doc as firestoreDoc
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { auth } from "../firebase";
function Requests({ requests, setRequests, logs, setLogs }) {
  const [firestoreRequests, setFirestoreRequests] = useState([]);

useEffect(() => {
  const fetchRequests = async () => {
    try {
      const snapshot = await getDocs(
        collection(db, "requests")
      );

      const data = snapshot.docs.map(
        (doc) => doc.data()
      );

      data.sort(
        (a, b) => b.id - a.id
      );

      setFirestoreRequests(data);

    } catch (error) {
      console.error(error);
    }
  };

  fetchRequests();
}, []);
  const updateStatus = async(id, newStatus) => {
    // Update requests and save to localStorage
    try {
  const snapshot = await getDocs(
    collection(db, "requests")
  );

  const firestoreRequest = snapshot.docs.find(
    (d) => d.data().id === id
  );

  if (firestoreRequest) {
    await updateDoc(
      firestoreDoc(
        db,
        "requests",
        firestoreRequest.id
      ),
      {
        status: newStatus,
      }
    );
const refreshedSnapshot = await getDocs(
  collection(db, "requests")
);

const refreshedRequests =
  refreshedSnapshot.docs.map((doc) =>
    doc.data()
  );
refreshedRequests.sort(
  (a, b) => b.id - a.id
);
setFirestoreRequests(refreshedRequests);
    console.log(
      "Firestore request updated!"
    );
  }
} catch (error) {
  console.error(error);
}
    setRequests((prev) => {
      const updated = prev.map((req) =>
        req.id === id
          ? { ...req, status: newStatus }
          : req
      );

      localStorage.setItem(
        "requests",
        JSON.stringify(updated)
      );

      return updated;
    });

    // Update logs and save to localStorage
    setLogs((prev) => {
      const updatedLogs = [
        ...prev,
        {
          id: Date.now(),
          action:
            newStatus === "Approved"
              ? "Request Approved"
              : "Request Rejected",
          detail: `Request ID ${id}`,
        timestamp: new Date().toLocaleString(),
         ownerId: auth.currentUser?.uid,
        },
      ];

      localStorage.setItem(
        "logs",
        JSON.stringify(updatedLogs)
      );

      return updatedLogs;
    });
  };
const filteredRequests = firestoreRequests.filter(
  (request) =>
    request.documentOwnerId === auth.currentUser?.uid
);
console.log("Current User UID:", auth.currentUser?.uid);
console.log("Firestore Requests:", firestoreRequests);
console.log("Filtered Requests:", filteredRequests);
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">
        Access Requests
      </h1>

      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="bg-white p-6 rounded-xl shadow">
            No requests available
          </div>
        ) : (
          filteredRequests.map((request) => (
            <div
              key={request.id}
              className="bg-white p-6 rounded-xl shadow"
            >
              <h2 className="text-xl font-semibold">
                {request.requester}
              </h2>

              <p>
                <strong>Document:</strong>{" "}
                {request.document}
              </p>

              <p>
                <strong>Purpose:</strong>{" "}
                {request.purpose}
              </p>

              <p className="mt-2">
                <strong>Status:</strong>
                <span
                  className={`ml-2 font-bold ${
                    request.status === "Approved"
                      ? "text-green-600"
                      : request.status === "Rejected"
                      ? "text-red-600"
                      : "text-yellow-600"
                  }`}
                >
                  {request.status}
                </span>
              </p>

              <div className="mt-4 space-x-4">
                <button
                  onClick={() =>
                    updateStatus(
                      request.id,
                      "Approved"
                    )
                  }
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Approve
                </button>

                <button
                  onClick={() =>
                    updateStatus(
                      request.id,
                      "Rejected"
                    )
                  }
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  Reject
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Requests;