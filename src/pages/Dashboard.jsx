import { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, onSnapshot,updateDoc,doc as firestoreDoc} from "firebase/firestore";

function Dashboard({documents=[],requests=[]}) {
  const [notifications, setNotifications] =
  useState([]);
  const markAllAsRead = async () => {

  try {

    await Promise.all(

      notifications.map(
        async (notification) => {

          if (
            notification.read === false
          ) {

            await updateDoc(
              firestoreDoc(
                db,
                "notifications",
                notification.firestoreId
              ),
              {
                read: true,
              }
            );

          }

        }
      )

    );

  } catch (error) {
    console.error(error);
  }

};

const [showNotifications,
  setShowNotifications] =
  useState(false);
  console.log("Dashboard documents:", documents);
  const userDocuments = documents.filter(
  (doc) =>
    doc.ownerId ===
    auth.currentUser?.uid
);

const userRequests = requests.filter(
  (req) =>
    req.documentOwnerId ===
    auth.currentUser?.uid
);
  useEffect(() => {

  const unsubscribe = onSnapshot(
    collection(db, "notifications"),
    (snapshot) => {

      const data = snapshot.docs
        .map((doc) => ({
          firestoreId: doc.id,
          ...doc.data(),
        }))
        .filter(
          (n) =>
            n.ownerId ===
            auth.currentUser?.uid
        );

      data.sort(
        (a, b) =>
          b.createdAt - a.createdAt
      );

      setNotifications(data);

    },
    (error) => {
      console.error(error);
    }
  );

  return () => unsubscribe();

}, []);
  const totalDocuments =
  userDocuments.length;

  const pendingRequests =
  userRequests.filter(
    (r) => r.status === "Pending"
  ).length;

  const approvedRequests =
  userRequests.filter(
    (r) => r.status === "Approved"
  ).length;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="bg-white p-6 rounded-xl shadow">
       <div className="flex justify-between items-center">

  <h1 className="text-3xl font-bold text-blue-600">
    SecureShare Dashboard
  </h1>

  <div
    className="relative cursor-pointer text-3xl"
    onClick={() => {
      setShowNotifications(
        !showNotifications
      );
     markAllAsRead();
    }}
  >
    🔔

    {
notifications.filter(
  (n) => !n.read
).length > 0 && (
      <span
        className="
        absolute
        -top-2
        -right-2
        bg-red-600
        text-white
        text-xs
        rounded-full
        px-2
      "
      >
        {
notifications.filter(
  (n) => !n.read
).length
}
      </span>
    )}
  </div>

</div>

        <p className="text-gray-600 mt-2">
          User-controlled secure document access system
        </p>
{showNotifications && (

  <div className="mt-4 bg-gray-50 border rounded p-4">

    <h2 className="font-bold mb-2">
      Notifications
    </h2>

    {notifications.length === 0 ? (

      <p>
        No notifications
      </p>

    ) : (

      notifications.map(
        (notification, index) => (

          <div
            key={index}
            className="
            border-b
            py-2
            text-sm
            "
          >
            {notification.message}
          </div>

        )
      )

    )}

  </div>

)}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded">
            Total Documents: {totalDocuments}
          </div>
          <div className="bg-yellow-50 p-4 rounded">
            Pending Requests: {pendingRequests}
          </div>
          <div className="bg-green-50 p-4 rounded">
            Approved Access: {approvedRequests}
          </div>
        </div>
      </div>
    </div>
  )
}
export default Dashboard;