import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import {
  importAESKey,
  decryptFile,
} from "../utils/cryptoUtils";
import mammoth from "mammoth";
function Viewer() {

  const { id } = useParams();
  const [document, setDocument] = useState(null);
  useEffect(() => {
  const fetchDocument = async () => {

    const snapshot = await getDocs(
      collection(db, "documents")
    );

    const docs = snapshot.docs.map((doc) => doc.data());

    const found = docs.find(
      (doc) => doc.accessId === id
    );

    console.log("Document:", found);
    if (
  found?.accessMode === "expiry"
) {
  const now = new Date();

 const createdAt =
  new Date(
    found.createdAt
  );

const expiry =
  new Date(
    createdAt.getTime() +
    found.expiryHours *
      60 *
      60 *
      1000
  );

  if (now > expiry) {
    setExpired(true);
    return;
  }
}

if (
  found?.accessMode === "viewOnly" &&
  found?.viewed === true
) {
  setAlreadyViewed(true);
  return;
}

setDocument(found);

    const keySnapshot = await getDocs(
  collection(db, "documentKeys")
);

const keys = keySnapshot.docs.map(
  (doc) => doc.data()
);

const foundKey = keys.find(
  (key) => key.accessId === id
);

console.log("AES Key:", foundKey);

setAesKey(foundKey);
  };

  fetchDocument();
}, [id]);
  console.log("Access ID:", id);
  const [aesKey, setAesKey] = useState(null);
  const [cryptoKey, setCryptoKey] = useState(null);
  const [encryptedData, setEncryptedData] = useState(null);
  const [decryptedData, setDecryptedData] = useState(null);
  const [docContent, setDocContent] = useState("");
  const [fileUrl, setFileUrl] =useState("");
  const [alreadyViewed, setAlreadyViewed] =
  useState(false);
  const [expired, setExpired] =
  useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  useEffect(() => {
  const loadKey = async () => {
    if (!aesKey) return;

    const key = await importAESKey(
      aesKey.encryptedKey
    );

    console.log("Imported Key:", key);

    setCryptoKey(key);
  };

  loadKey();
}, [aesKey]);

useEffect(() => {
  const fetchEncryptedFile = async () => {
    if (!document) return;

    const response = await fetch(
      document.fileUrl
    );

    const buffer =
      await response.arrayBuffer();

    console.log(
      "Encrypted File Buffer:",
      buffer
    );

    setEncryptedData(buffer);
  };

  fetchEncryptedFile();
}, [document]);
useEffect(() => {
  const decryptDocument = async () => {
    if (
      !cryptoKey ||
      !encryptedData ||
      !document
    )
      return;

    const iv = Uint8Array.from(
      atob(document.iv),
      (char) => char.charCodeAt(0)
    );

    const decryptedBuffer =
      await decryptFile(
        encryptedData,
        cryptoKey,
        iv
      );

    console.log(
      "Decrypted Buffer:",
      decryptedBuffer
    );

    setDecryptedData(
      decryptedBuffer
    );
    if (
  document.fileName
    .toLowerCase()
    .endsWith(".pdf")
) {
  const blob = new Blob(
    [decryptedBuffer],
    {
      type: "application/pdf",
    }
  );

  const url =
    URL.createObjectURL(blob);

  setPdfUrl(url);
}
    if (
  document?.accessMode ===
  "viewOnly"
) {
  const snapshot =
    await getDocs(
      collection(db, "documents")
    );

  const firestoreDoc =
    snapshot.docs.find(
      (d) =>
        d.data().accessId === id
    );

  if (firestoreDoc) {
    await updateDoc(
      firestoreDoc.ref,
      {
        viewed: true,
      }
    );
  }
}
  };

  decryptDocument();
}, [
  cryptoKey,
  encryptedData,
  document,
]);
useEffect(() => {
  const renderDocx = async () => {
    if (
      !decryptedData ||
      !document?.fileName
    )
      return;

    const isDocx =
      document.fileName
        .toLowerCase()
        .endsWith(".docx");

    if (!isDocx) return;

    const result =
      await mammoth.convertToHtml({
        arrayBuffer: decryptedData,
      });

   

    setDocContent(result.value);
  };

  renderDocx();
}, [decryptedData, document]);
useEffect(() => {
  if (
    !decryptedData ||
    !document
  )
    return;

  const fileName =
    document.fileName.toLowerCase();

  if (
    fileName.endsWith(".pdf")
  ) {
    const blob = new Blob(
      [decryptedData],
      {
        type: "application/pdf",
      }
    );

    const url =
      URL.createObjectURL(blob);

    setFileUrl(url);
  }

  if (
    fileName.endsWith(".jpg") ||
    fileName.endsWith(".jpeg") ||
    fileName.endsWith(".png")
  ) {
    const blob = new Blob(
      [decryptedData]
    );

    const url =
      URL.createObjectURL(blob);

    setFileUrl(url);
    

  }
}, [decryptedData, document]);
useEffect(() => {
  const disableRightClick = (e) => {
    e.preventDefault();
  };

  window.addEventListener(
    "contextmenu",
    disableRightClick
  );

  return () => {
    window.removeEventListener(
      "contextmenu",
      disableRightClick
    );
  };
}, []);
if (alreadyViewed) {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-red-500">
        This document has already been viewed
      </h1>
    </div>
  );
}
if (expired) {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-red-500">
        Invalid or Expired Link
      </h1>
    </div>
  );
}
return (
  <div className="p-6">
    <h1 className="text-3xl font-bold">
      Secure Viewer
    </h1>
    {document ? (
      <div className="mt-6">
       <div className="mt-6">
  <h2 className="text-xl font-bold">
    Document:{document.fileName}
  </h2>

  <p className="text-gray-600">
    Access Mode:
    {" "}
    {document.accessMode}
  </p>
</div>

{docContent &&
 (document?.accessMode === "viewOnly" ||
  document?.accessMode === "expiry") && (

  <div className="relative mt-6 border p-4">

    <h3 className="font-bold text-xl mb-4">
      DOCX Preview
    </h3>

    <div
      dangerouslySetInnerHTML={{
        __html: docContent,
      }}
    />

    <div
      className="
        absolute
        inset-0
        flex
        items-center
        justify-center
        pointer-events-none
      "
    >
      <div
        className="
          text-5xl
          font-bold
          text-gray-500
          opacity-20
          rotate-[-30deg]
          text-center
        "
      >
        CONFIDENTIAL
        <br />
        {document.accessId}
        <br />
        {new Date().toLocaleDateString()}
      </div>
    </div>

  </div>
)}
{(document?.accessMode === "viewOnly" ||
  document?.accessMode === "expiry") &&
 pdfUrl &&
 document.fileName
   .toLowerCase()
   .endsWith(".pdf") && (

  <div
    className="relative"
    onContextMenu={(e) =>
      e.preventDefault()
    }
    style={{
      WebkitTouchCallout: "none",
      userSelect: "none",
    }}
  >

    <iframe
      src={pdfUrl}
      width="100%"
      height="800px"
      title="PDF Preview"
    />

    <div
      className="
        absolute
        inset-0
        flex
        items-center
        justify-center
        pointer-events-none
      "
    >
      <div
        className="
          text-5xl
          font-bold
          text-gray-500
          opacity-20
          rotate-[-30deg]
          text-center
        "
      >
        CONFIDENTIAL
        <br />
        {document.accessId}
        <br />
        {new Date().toLocaleDateString()}
      </div>
    </div>

  </div>
)}
{(document?.accessMode === "viewOnly" ||
  document?.accessMode === "expiry") &&
 fileUrl &&
 (
   document.fileName
     .toLowerCase()
     .endsWith(".jpg") ||
   document.fileName
     .toLowerCase()
     .endsWith(".jpeg") ||
   document.fileName
     .toLowerCase()
     .endsWith(".png")
 ) && (

  <div className="relative">

    <img
      src={fileUrl}
      alt="Preview"
      className="max-w-full"
    />

    <div
      className="
        absolute
        inset-0
        flex
        items-center
        justify-center
        pointer-events-none
      "
    >
      <div
        className="
          text-5xl
          font-bold
          text-gray-500
          opacity-20
          rotate-[-30deg]
          text-center
        "
      >
        CONFIDENTIAL
        <br />
        {document.accessId}
        <br />
        {new Date().toLocaleDateString()}
      </div>
    </div>

  </div>
)}
{decryptedData &&
 document?.accessMode === "download" && (
  <button
    onClick={() => {
      const blob = new Blob([
        decryptedData,
      ]);

      const url =
        URL.createObjectURL(blob);

      const a =
        window.document.createElement("a");

      a.href = url;
      a.download =
        document.fileName;

      a.click();
    }}
    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
  >
    Download File
  </button>
)}
      </div>
    ) : (
      <p>Loading document...</p>
    )}
  </div>
  
);
}
export default Viewer;