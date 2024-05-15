import { UserButton } from "@clerk/clerk-react";
import { useState, useRef } from "react";
import { useUser } from "@clerk/clerk-react";
import { useAuth } from '@clerk/clerk-react';

const PAGE_SIZE = 15; // Number of files to display per page

const Homepage = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { getToken } = useAuth();
  const { user } = useUser(); 

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(Array.from(event.target.files || []));
    setCurrentPage(1); // Reset to first page when new files are selected
  };

  const handleUpload = async () => {
    const token = await getToken();
    const formData = new FormData();

    files.forEach((file) => {
      formData.append("files", file, file.name);
    });

    // code to send the formData to the server
    // formData is in bianry format, so it can be sent to the server
    // console.log(formData);

    try {
      const response = await fetch("https://www.cloud-backup-app.vercel.app/api/upload", {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response);
    } catch (error) {
      console.log(error);
    }
  };

  const handleFileDelete = (index: number) => {
    const updatedFiles = [...files];
    updatedFiles.splice(index, 1);
    setFiles(updatedFiles);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      const dataTransfer = new DataTransfer();
      updatedFiles.forEach((file) => {
        dataTransfer.items.add(file);
      });
      fileInputRef.current.files = dataTransfer.files;
    }
  };

  const truncateFileName = (fileName: string) => {
    if (fileName.length > 20) {
      return `${fileName.slice(0, 20)}...`;
    }
    return fileName;
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const visibleFiles = files.slice(startIndex, endIndex);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative">
      <h1 className="text-4xl font-bold text-white mb-8">
        Welcome to the Drive, {user?.fullName}
      </h1>
      <div className="mb-8">
        <input
          type="file"
          multiple
          onChange={handleFileChange}
          ref={fileInputRef}
          className="bg-white text-indigo-600 font-semibold py-2 px-4 rounded-md shadow-md hover:bg-indigo-600 hover:text-white transition-colors duration-300"
        />
        <button
          onClick={handleUpload}
          disabled={files.length === 0}
          className="bg-white text-indigo-600 font-semibold py-2 px-4 rounded-md shadow-md hover:bg-indigo-600 hover:text-white transition-colors duration-300 ml-4"
        >
          Upload
        </button>
        {files.length > 0 && (
          <div className="mt-4">
            <ul>
              {visibleFiles.map((file, index) => (
                <li
                  key={startIndex + index}
                  className="flex items-center justify-between bg-white rounded-md shadow-md p-2 mb-2"
                >
                  <div>
                    <span className="font-semibold">
                      {truncateFileName(file.name)}
                    </span>
                    <span className="ml-2 text-gray-500">({file.type})</span>
                  </div>
                  <button
                    onClick={() => handleFileDelete(startIndex + index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex justify-center mt-4">
              {Array.from(
                { length: Math.ceil(files.length / PAGE_SIZE) },
                (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => handlePageChange(i + 1)}
                    className={`mx-1 py-1 px-3 rounded-md ${
                      currentPage === i + 1
                        ? "bg-indigo-600 text-white"
                        : "bg-white text-indigo-600 hover:bg-indigo-600 hover:text-white"
                    }`}
                  >
                    {i + 1}
                  </button>
                )
              )}
            </div>
          </div>
        )}
      </div>
      <div className="absolute top-4 right-4">
        <UserButton />
      </div>
    </div>
  );
};

export default Homepage;
