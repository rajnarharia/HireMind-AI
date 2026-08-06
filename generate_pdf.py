from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter

def create_resume(filename):
    c = canvas.Canvas(filename, pagesize=letter)
    
    # Title
    c.setFont("Helvetica-Bold", 16)
    c.drawString(72, 750, "John Doe")
    
    # Contact Info
    c.setFont("Helvetica", 12)
    c.drawString(72, 730, "Software Engineer | Email: john.doe@example.com | Phone: (555) 123-4567")
    
    # Experience
    c.setFont("Helvetica-Bold", 14)
    c.drawString(72, 690, "Experience")
    
    c.setFont("Helvetica-Bold", 12)
    c.drawString(72, 670, "Senior Software Engineer at Tech Corp (2020 - Present)")
    c.setFont("Helvetica", 12)
    c.drawString(82, 650, "- Developed scalable web applications using React and Python.")
    c.drawString(82, 635, "- Designed REST APIs with FastAPI.")
    c.drawString(82, 620, "- Improved database performance by 40%.")
    
    c.setFont("Helvetica-Bold", 12)
    c.drawString(72, 590, "Software Engineer at Web Solutions (2017 - 2020)")
    c.setFont("Helvetica", 12)
    c.drawString(82, 570, "- Built frontend features in Vue.js.")
    c.drawString(82, 555, "- Maintained legacy Java backend.")
    
    # Education
    c.setFont("Helvetica-Bold", 14)
    c.drawString(72, 515, "Education")
    
    c.setFont("Helvetica", 12)
    c.drawString(72, 495, "B.S. in Computer Science, University of Technology (2013 - 2017)")
    
    # Skills
    c.setFont("Helvetica-Bold", 14)
    c.drawString(72, 455, "Skills")
    
    c.setFont("Helvetica", 12)
    c.drawString(72, 435, "Python, JavaScript, React, FastAPI, SQL, Docker, AWS, Git")
    
    c.save()

if __name__ == "__main__":
    create_resume("dummy_resume.pdf")
    print("PDF created successfully as dummy_resume.pdf")
