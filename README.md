# PDF Merger

A web app to merge PDF files in a custom order with a drag-and-drop GUI.

## Setup

### Backend (Python)
1. `cd backend`
2. Install dependencies: `pip3 install -r requirements.txt`
3. Run: `python3 app.py`

### Frontend (React)
1. `cd frontend`
2. Install dependencies: `npm install`
3. Run: `npm start`

## Usage
- Open `http://localhost:3000`
- Upload PDFs, drag to reorder, remove unwanted files (click 🗑️), click "Merge PDFs"—download the result!

## Tech Stack
- Backend: Flask, PyPDF2 (PDF merging)
- Frontend: React, react-beautiful-dnd (drag-and-drop)