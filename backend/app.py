from flask import Flask, request, send_file
from flask_cors import CORS
import PyPDF2
import os
import logging

app = Flask(__name__)
CORS(app)
logging.basicConfig(level=logging.DEBUG)

@app.route('/merge', methods=['POST'])
def merge_pdfs():
    files = request.files.getlist('pdfs')
    order = request.form.getlist('order')
    
    merger = PyPDF2.PdfMerger()
    temp_files = []
    
    try:
        for i, file in enumerate(files):
            path = f"temp_{i}.pdf"
            file.save(path)
            temp_files.append(path)
            app.logger.debug(f"Saved temp file: {path}, size: {os.path.getsize(path)} bytes")
        
        for idx in order:
            app.logger.debug(f"Merging file: {temp_files[int(idx)]}")
            merger.append(temp_files[int(idx)])
        
        output = "merged.pdf"
        merger.write(output)
        merger.close()
        
        app.logger.debug(f"Merged file written: {output}, size: {os.path.getsize(output)} bytes")
        
        for temp in temp_files:
            os.remove(temp)
        
        if not os.path.exists(output) or os.path.getsize(output) == 0:
            app.logger.error("Merged file is empty or missing")
            return "Error: Merged file is invalid", 500
        
        with open(output, 'rb') as f:
            response = f.read()
        app.logger.debug(f"Sending response, size: {len(response)} bytes")
        return response, 200, {
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename=merged.pdf'
        }
    
    except Exception as e:
        app.logger.error(f"Merge failed: {str(e)}")
        return f"Error: {str(e)}", 500
    
    finally:
        for temp in temp_files:
            if os.path.exists(temp):
                os.remove(temp)
        if os.path.exists(output):
            os.remove(output)

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)