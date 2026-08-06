import fitz  # PyMuPDF
import io

def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Extracts text from a PDF file using PyMuPDF."""
    text = ""
    try:
        # Open the PDF from bytes
        pdf_document = fitz.open(stream=pdf_bytes, filetype="pdf")
        
        # Iterate through pages and extract text
        for page_num in range(pdf_document.page_count):
            page = pdf_document.load_page(page_num)
            text += page.get_text("text") + "\n"
            
        pdf_document.close()
    except Exception as e:
        print(f"Error extracting PDF text: {e}")
        return ""
        
    return text.strip()
