import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import axios from 'axios';
import './App.css';

function App() {
  const [files, setFiles] = useState([]);       // State for uploaded PDF files
  const [loading, setLoading] = useState(false); // Merge operation status
  const [error, setError] = useState(null);      // Error messages
  const [success, setSuccess] = useState(null);  // Success message

  // Handle file uploads—append new files to existing list
  const handleFileChange = (e) => {
    const newFiles = [...e.target.files];
    setFiles((prevFiles) => [...prevFiles, ...newFiles]); // Add new files, keep old ones
    setError(null);
    setSuccess(null);
  };

  // Remove a specific file by index—fix for index 0
  const handleRemoveFile = (indexToRemove) => {
    setFiles((prevFiles) => {
      if (prevFiles.length === 0 || indexToRemove < 0 || indexToRemove >= prevFiles.length) {
        console.log(`Invalid removal attempt: index ${indexToRemove}, files length ${prevFiles.length}`);
        return prevFiles; // Safeguard against invalid indices
      }
      const updatedFiles = prevFiles.filter((_, index) => index !== indexToRemove);
      console.log(`Removed file at index ${indexToRemove}, new length: ${updatedFiles.length}`);
      return updatedFiles;
    });
    setError(null);
    setSuccess(null);
  };

  // Handle drag-and-drop reordering
  const onDragEnd = (result) => {
    if (!result.destination) return;
    const reordered = Array.from(files);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setFiles(reordered);
  };

  // Merge PDFs and handle response
  const handleMerge = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    const formData = new FormData();
    files.forEach((file, i) => {
      formData.append('pdfs', file);
      formData.append('order', i);
    });
    try {
      const response = await axios.post('http://localhost:5000/merge', formData, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'merged.pdf');
      document.body.appendChild(link);
      link.click();
      setSuccess("Success! PDFs merged and downloaded.");
    } catch (err) {
      console.error("Merge error:", err);
      setError("Failed to merge PDFs: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <h1>PDF Merger</h1>
      <input 
        type="file" 
        multiple 
        accept=".pdf" 
        onChange={handleFileChange} 
        disabled={loading} 
      />
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="pdfs">
          {(provided) => (
            <ul {...provided.droppableProps} ref={provided.innerRef}>
              {files.map((file, index) => (
                <Draggable key={file.name} draggableId={file.name} index={index}>
                  {(provided) => (
                    <li 
                      ref={provided.innerRef} 
                      {...provided.draggableProps} 
                      {...provided.dragHandleProps}
                    >
                      {file.name}
                      <button 
                        className="remove-btn" 
                        onClick={() => handleRemoveFile(index)}
                        disabled={loading}
                      >
                        🗑️
                      </button>
                    </li>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      </DragDropContext>
      <button 
        onClick={handleMerge} 
        disabled={loading || files.length === 0}
      >
        {loading ? 'Merging...' : 'Merge PDFs'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
    </div>
  );
}

export default App;