import { auth } from "../firebase";
function AuditLogs({ logs =[] }) {
  const userLogs = logs.filter(
  (log) =>
    log.ownerId ===
    auth.currentUser?.uid
);
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">
        Audit Logs
      </h1>

      <div className="bg-white p-6 rounded-xl shadow">
       {userLogs.length === 0 ? (
          <p>No logs yet</p>
        ) : (
         [...userLogs]
  .sort((a, b) => b.id - a.id)
  .map((log) => (
            <div
               key={log.id}
              className="border-b py-2"
            >
              <p>
                <span className="font-bold">
                  {log.action}
                </span>{" "}
                - {log.detail}
              </p>
              <p className="text-xs text-gray-500">
  {log.timestamp}
</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AuditLogs;