import os
import fitz # PyMuPDF
import docx
from resume_parser import process_resume, extract_text_from_pdf, extract_text_from_docx, extract_candidate_info, generate_profile

def create_sample_pdf(pdf_path):
    doc = fitz.open()
    page = doc.new_page()
    sample_text = """
    John Doe
    Email: john.doe@example.com
    Phone: +1 555-234-5678

    Education:
    Bachelor of Science in Computer Science, Stanford University

    Skills:
    Python, Java, SQL, Machine Learning, TensorFlow, React, FastAPI, Git, Project Management

    Certifications & Projects:
    AWS Certified Solutions Architect
    AI Recruitment Copilot System

    Experience:
    Senior Software Engineer at Tech Corp
    Developed high-throughput data processing pipelines using Python, SQL, and Machine Learning algorithms.
    """
    page.insert_text((50, 50), sample_text)
    doc.save(pdf_path)
    doc.close()

def create_sample_docx(docx_path):
    doc = docx.Document()
    doc.add_heading("Jane Smith", level=1)
    doc.add_paragraph("Email: jane.smith@techcorp.io")
    doc.add_paragraph("Phone: +1 555-987-6543")
    doc.add_paragraph("Education: Master of Science in Data Science, MIT")
    doc.add_paragraph("Skills: Python, SQL, Machine Learning, PyTorch, Docker, AWS, NLP, Project Management")
    doc.add_paragraph("Certifications: Professional Data Engineer")
    doc.add_paragraph("Experience: Lead Data Scientist - Built NLP extraction engines and automated profiling platforms.")
    doc.save(docx_path)

def test_pipeline():
    pdf_file = "sample_test_resume.pdf"
    docx_file = "sample_test_resume.docx"

    print("Generating sample PDF resume...")
    create_sample_pdf(pdf_file)
    
    print("Generating sample DOCX resume...")
    create_sample_docx(docx_file)

    try:
        print("\n--- Testing PDF Resume Extraction ---")
        pdf_profile_df = process_resume(pdf_file)
        print("Pandas DataFrame output for PDF:")
        print(pdf_profile_df)
        print("Extracted Info Dict:", pdf_profile_df.to_dict(orient="records")[0])

        print("\n--- Testing DOCX Resume Extraction ---")
        docx_profile_df = process_resume(docx_file)
        print("Pandas DataFrame output for DOCX:")
        print(docx_profile_df)
        print("Extracted Info Dict:", docx_profile_df.to_dict(orient="records")[0])

        print("\nSUCCESS: All PDF & DOCX Resume Extraction tests passed!")

    finally:
        if os.path.exists(pdf_file):
            os.remove(pdf_file)
        if os.path.exists(docx_file):
            os.remove(docx_file)

if __name__ == "__main__":
    test_pipeline()
