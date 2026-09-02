import fitz  # PyMuPDF
import docx
import spacy
import re
import pandas as pd
from typing import Dict, Any, List

# Load spaCy NLP model with fallback
try:
    nlp = spacy.load("en_core_web_sm")
except Exception:
    try:
        spacy.cli.download("en_core_web_sm")
        nlp = spacy.load("en_core_web_sm")
    except Exception:
        nlp = spacy.blank("en")

def extract_text_from_pdf(pdf_path: str) -> str:
    doc = fitz.open(pdf_path)
    text = ""
    for page in doc:
        text += page.get_text()
    return text

def extract_text_from_docx(docx_path: str) -> str:
    doc = docx.Document(docx_path)
    text = "\n".join([para.text for para in doc.paragraphs])
    return text

def extract_candidate_info(text: str) -> Dict[str, Any]:
    doc = nlp(text)
    candidate = {
        "name": None,
        "email": None,
        "phone": None,
        "education": [],
        "skills": [],
        "experience": [],
        "certifications": []
    }

    # Extract email
    email_match = re.search(r'[\w\.-]+@[\w\.-]+', text)
    if email_match:
        candidate["email"] = email_match.group(0)

    # Extract phone
    phone_match = re.search(r'\+?\d[\d -]{8,}\d', text)
    if phone_match:
        candidate["phone"] = phone_match.group(0).strip()

    # Extract named entities
    for ent in doc.ents:
        clean_text = ent.text.strip().split('\n')[0].strip()
        if not clean_text:
            continue

        if ent.label_ == "PERSON" and not candidate["name"]:
            candidate["name"] = clean_text
        elif ent.label_ in ["ORG", "EDUCATION"]:
            if any(term in clean_text.lower() for term in ["university", "college", "institute", "school", "bachelor", "master", "bs", "ms", "phd", "degree", "education"]):
                if clean_text not in candidate["education"]:
                    candidate["education"].append(clean_text)
        elif ent.label_ in ["WORK_OF_ART", "PRODUCT"]: # placeholder for certifications/projects
            if clean_text not in candidate["certifications"]:
                candidate["certifications"].append(clean_text)


    # Extract skills (keyword matching)
    skills_list = [
        "Python", "Java", "SQL", "Machine Learning", "TensorFlow", "Project Management",
        "React", "TypeScript", "Node.js", "Docker", "AWS", "Spring Boot", "Git",
        "FastAPI", "PyTorch", "NLP", "Pandas", "Scikit-Learn", "PostgreSQL", "MongoDB"
    ]
    candidate["skills"] = [skill for skill in skills_list if re.search(r'\b' + re.escape(skill) + r'\b', text, re.IGNORECASE)]

    # Extract work experience roles if present
    exp_matches = re.findall(r'(?:Senior|Junior|Lead|Principal)?\s*(?:Software|Data|Full Stack|Backend|Frontend|DevOps|ML|Machine Learning)\s*(?:Engineer|Developer|Scientist|Architect|Manager)', text, re.IGNORECASE)
    if exp_matches:
        candidate["experience"] = list(set([e.strip() for e in exp_matches]))
    else:
        candidate["experience"] = ["Software Engineer / Developer"]

    return candidate

def generate_profile(candidate: Dict[str, Any]) -> pd.DataFrame:
    df = pd.DataFrame([candidate])
    return df

def process_resume(file_path: str):
    if file_path.lower().endswith(".pdf"):
        text = extract_text_from_pdf(file_path)
    elif file_path.lower().endswith(".docx"):
        text = extract_text_from_docx(file_path)
    elif file_path.lower().endswith(".txt"):
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            text = f.read()
    else:
        raise ValueError("Unsupported file format")

    candidate_info = extract_candidate_info(text)
    profile = generate_profile(candidate_info)
    return profile
