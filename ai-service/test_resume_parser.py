import os
import json
import pymupdf as fitz
import docx
from resume_parser import (
    process_resume,
    extract_text_from_pdf,
    extract_text_from_docx,
    extract_candidate_info,
    generate_profile,
    parse_resume_to_json
)

def create_sample_pdf(pdf_path):
    doc = fitz.open()
    page = doc.new_page()
    sample_text = """
    John Doe
    Email: john.doe@example.com
    Phone: +1 (555) 234-5678
    LinkedIn: https://linkedin.com/in/johndoe
    GitHub: https://github.com/johndoe
    Portfolio: https://johndoe.dev

    PROFESSIONAL SUMMARY
    Senior Software Engineer with 6 years of experience building enterprise web applications and scalable cloud backends.

    WORK EXPERIENCE
    Senior Software Engineer at Tech Corp
    Jan 2021 - Present
    - Developed high-throughput data processing pipelines using Python, SQL, and FastAPI.
    - Orchestrated containerized microservices using Docker and Kubernetes on AWS.
    - Mentored junior engineers and led agile sprint retrospectives.

    Software Developer at Alpha Solutions
    Jun 2018 - Dec 2020
    - Built responsive frontend user interfaces with React, TypeScript, and Tailwind CSS.
    - Implemented secure RESTful APIs with PostgreSQL database integration.

    EDUCATION
    Bachelor of Science in Computer Science
    Stanford University, 2018

    TECHNICAL SKILLS
    Python, Java, TypeScript, React, FastAPI, SQL, PostgreSQL, Docker, Kubernetes, AWS, Git, CI/CD

    KEY PROJECTS
    AI Recruitment Copilot System
    Engineered automated resume parsing pipeline using PyMuPDF, spaCy, and transformers.

    CERTIFICATIONS
    AWS Certified Solutions Architect
    Certified Kubernetes Application Developer

    ACHIEVEMENTS
    Winner of Tech Corp Annual Innovation Hackathon 2022
    """
    page.insert_text((50, 50), sample_text)
    doc.save(pdf_path)
    doc.close()

def create_sample_docx(docx_path):
    doc = docx.Document()
    doc.add_heading("Jane Smith", level=1)
    doc.add_paragraph("Email: jane.smith@techcorp.io | Phone: +1 555-987-6543")
    doc.add_paragraph("LinkedIn: https://linkedin.com/in/janesmith | GitHub: https://github.com/janesmith")
    
    doc.add_heading("WORK EXPERIENCE", level=2)
    doc.add_paragraph("Lead Data Scientist at NextGen AI (2019 - Present)")
    doc.add_paragraph("- Built deep learning models and NLP extraction engines using PyTorch, Transformers, and Python.")
    doc.add_paragraph("- Managed cloud infrastructure on AWS and deployed production models using Docker.")

    doc.add_heading("EDUCATION", level=2)
    doc.add_paragraph("Master of Science in Data Science, MIT, 2019")

    doc.add_heading("TECHNICAL SKILLS", level=2)
    doc.add_paragraph("Python, SQL, Machine Learning, Deep Learning, PyTorch, Docker, AWS, NLP, Scikit-Learn")

    doc.add_heading("CERTIFICATIONS", level=2)
    doc.add_paragraph("Professional Data Engineer")

    doc.save(docx_path)

def test_pipeline():
    pdf_file = "sample_test_resume.pdf"
    docx_file = "sample_test_resume.docx"

    print("=== Generating Sample PDF Resume ===")
    create_sample_pdf(pdf_file)
    
    print("=== Generating Sample DOCX Resume ===")
    create_sample_docx(docx_file)

    REQUIRED_SCHEMA_KEYS = [
        "name", "email", "phone", "current_role", "total_experience_years",
        "education", "skills", "experience", "projects",
        "certifications", "achievements", "linkedin", "github", "portfolio"
    ]

    try:
        # Test 1: Sarah Johnson Minimal Example
        print("\n--- Testing Sarah Johnson Extraction ---")
        sarah_raw = (
            "Sarah Johnson\n"
            "Email: sarah@example.com | Phone: (555)123-4567\n"
            "MS Computer Science, Stanford University, 2019\n"
            "5 years' experience in software development\n"
            "Skills: Python, Machine Learning, SQL\n"
        )
        sarah_info = extract_candidate_info(sarah_raw)
        print("Sarah Johnson Parsed JSON:")
        print(json.dumps(sarah_info, indent=2))
        
        for k in REQUIRED_SCHEMA_KEYS:
            assert k in sarah_info, f"Missing key '{k}' in candidate schema"
        assert sarah_info["name"] == "Sarah Johnson"
        assert sarah_info["email"] == "sarah@example.com"
        assert sarah_info["phone"] == "(555)123-4567"
        assert sarah_info["total_experience_years"] == 5
        assert "Python" in sarah_info["skills"]
        assert "Machine Learning" in sarah_info["skills"]
        assert "SQL" in sarah_info["skills"]
        print("[PASS] Sarah Johnson test passed successfully!")

        # Test 2: PDF Parsing with PyMuPDF
        print("\n--- Testing PDF Resume Extraction (PyMuPDF) ---")
        pdf_profile_df = process_resume(pdf_file)
        pdf_dict = pdf_profile_df.to_dict(orient="records")[0]
        
        print("PDF Extracted Profile:")
        print(json.dumps(pdf_dict, indent=2))

        for k in REQUIRED_SCHEMA_KEYS:
            assert k in pdf_dict, f"Missing key '{k}' in PDF extracted dictionary"
        assert pdf_dict["name"] == "John Doe"
        assert pdf_dict["email"] == "john.doe@example.com"
        assert "555" in str(pdf_dict["phone"])
        assert "Senior Software Engineer" in str(pdf_dict["current_role"])
        assert isinstance(pdf_dict["education"], list)
        assert len(pdf_dict["education"]) > 0
        assert isinstance(pdf_dict["skills"], list)
        assert "Python" in pdf_dict["skills"]
        assert "Docker" in pdf_dict["skills"]
        assert isinstance(pdf_dict["experience"], list)
        assert len(pdf_dict["experience"]) > 0
        assert pdf_dict["linkedin"] == "https://linkedin.com/in/johndoe"
        assert pdf_dict["github"] == "https://github.com/johndoe"
        print("[PASS] PDF Extraction test passed successfully!")

        # Test 3: DOCX Parsing with python-docx
        print("\n--- Testing DOCX Resume Extraction (python-docx) ---")
        docx_json = parse_resume_to_json(docx_file)
        docx_dict = json.loads(docx_json)
        
        print("DOCX Extracted Profile JSON:")
        print(docx_json)

        for k in REQUIRED_SCHEMA_KEYS:
            assert k in docx_dict, f"Missing key '{k}' in DOCX JSON output"
        assert docx_dict["name"] == "Jane Smith"
        assert docx_dict["email"] == "jane.smith@techcorp.io"
        assert "555" in str(docx_dict["phone"])
        assert "Data Scientist" in str(docx_dict["current_role"])
        assert "PyTorch" in docx_dict["skills"]
        assert "Professional Data Engineer" in docx_dict["certifications"]
        print("[PASS] DOCX Extraction test passed successfully!")

        print("\n=======================================================")
        print("SUCCESS: All 13-field AI Resume Parser tests verified!")
        print("=======================================================")

    finally:
        if os.path.exists(pdf_file):
            os.remove(pdf_file)
        if os.path.exists(docx_file):
            os.remove(docx_file)

if __name__ == "__main__":
    test_pipeline()
