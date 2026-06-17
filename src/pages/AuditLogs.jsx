function AuditLogs({ logs =[] }) {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">
        Audit Logs
      </h1>

      <div className="bg-white p-6 rounded-xl shadow">
        {logs.length === 0 ? (
          <p>No logs yet</p>
        ) : (
          logs.map((log) => (
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
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AuditLogs;