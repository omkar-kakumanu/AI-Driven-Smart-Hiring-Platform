import fitz  # PyMuPDF
import docx
import re
import spacy
import pandas as pd
from spacy.matcher import PhraseMatcher

# Load NLP model
try:
    nlp = spacy.load("en_core_web_sm")
except Exception:
    nlp = spacy.blank("en")

# --- STEP 1: ROBUST FILE EXTRACTION ---
def extract_text_from_pdf(pdf_path):
    doc = fitz.open(pdf_path)
    text = ""
    for page in doc:
        text += page.get_text("text") + "\n"
    return text

def extract_text_from_docx(docx_path):
    doc = docx.Document(docx_path)
    return "\n".join([para.text for para in doc.paragraphs if para.text.strip()])

# --- STEP 2: ENTERPRISE-GRADE EXTRACTION ---
def extract_candidate_info(text):
    candidate = {
        "name": None,
        "email": None,
        "phone": None,
        "education": [],
        "skills": [],
        "experience": [],
        "certifications": []
    }
    
    # 1. Precise Clean Regex Filters
    email_regex = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
    phone_regex = r'(?:(?:\+?([1-9]|[0-9]{2,3})[-. ]?)?(?:\(?([0-9]{2,3})\)?[-. ]?)?([0-9]{3,4})[-. ]?([0-9]{4}))'
    
    email_match = re.search(email_regex, text)
    if email_match:
        candidate["email"] = email_match.group(0)
        
    phone_match = re.search(phone_regex, text)
    if phone_match:
        candidate["phone"] = phone_match.group(0).strip()

    # 2. Section Segmentation and Contextual Processing
    lines = [line.strip() for line in text.split("\n") if line.strip()]
    doc = nlp(text)
    
    # Extract Name safely (Typically the first clean text row if not an email/phone)
    for line in lines[:5]:
        if "@" not in line and not re.search(r'\d{5,}', line) and len(line.split()) <= 4:
            line_doc = nlp(line)
            for ent in line_doc.ents:
                if ent.label_ == "PERSON":
                    candidate["name"] = line.strip()
                    break
        if candidate["name"]:
            break

    # 3. Dynamic Phrase Dictionary Matcher for Skills
    # Organizations use expanded databases containing 50,000+ technical/soft skills
    skills_db = [
        "Python", "Java", "SQL", "Machine Learning", "TensorFlow", "Project Management", "PyTorch", "AWS",
        "React", "TypeScript", "JavaScript", "Docker", "Kubernetes", "FastAPI", "Node.js", "Git", "CI/CD",
        "Deep Learning", "NLP", "Scikit-Learn", "PostgreSQL", "MongoDB", "C++", "Go", "Azure", "GCP"
    ]
    matcher = PhraseMatcher(nlp.vocab, attr="LOWER")
    patterns = [nlp.make_doc(skill) for skill in skills_db]
    matcher.add("SKILLS_KEY", patterns)
    
    matches = matcher(doc)
    matched_skills = set([doc[start:end].text for match_id, start, end in matches])
    candidate["skills"] = sorted(list(matched_skills))

    # 4. Contextual Categorization for ORGs (Differentiating School vs Company)
    edu_keywords = ["university", "college", "school", "institute", "polytechnic", "degree", "bachelor", "master"]
    
    for ent in doc.ents:
        if ent.label_ == "ORG":
            cleaned_org = ent.text.strip().replace("\n", " ")
            ent_text_lower = cleaned_org.lower()
            # If entity contains educational naming keywords, map to education
            if any(kw in ent_text_lower for kw in edu_keywords):
                edu_lines = [p.strip() for p in ent.text.split("\n") if any(kw in p.lower() for kw in edu_keywords)]
                edu_name = edu_lines[0] if edu_lines else cleaned_org
                if edu_name not in candidate["education"]:
                    candidate["education"].append(edu_name)
            # Otherwise, it falls to a prospective workspace
            else:
                exp_lines = [p.strip() for p in ent.text.split("\n") if p.strip() and not any(kw in p.lower() for kw in edu_keywords)]
                exp_name = exp_lines[0] if exp_lines else cleaned_org
                # Avoid single skill words being misclassified as ORG
                if exp_name not in candidate["experience"] and exp_name.lower() not in [s.lower() for s in candidate["skills"]]:
                    candidate["experience"].append(exp_name)
                    
    # Certifications extraction
    cert_matches = re.findall(r'(?:AWS\s+Certified[A-Za-z\s]+|Professional\s+Data\s+Engineer|Certified\s+Kubernetes[A-Za-z\s]+|PMP)', text, re.IGNORECASE)
    if cert_matches:
        candidate["certifications"] = list(set([c.strip() for c in cert_matches]))

    return candidate

# --- STEP 3: STRUCTURED OUTPUT GENERATION ---
def generate_profile(candidate):
    # Convert lists to clean strings for analytical dataframe representation
    cleaned_candidate = {k: ", ".join(v) if isinstance(v, list) else v for k, v in candidate.items()}
    return pd.DataFrame([cleaned_candidate])

def process_resume(file_path):
    if file_path.lower().endswith(".pdf"):
        text = extract_text_from_pdf(file_path)
    elif file_path.lower().endswith(".docx"):
        text = extract_text_from_docx(file_path)
    elif file_path.lower().endswith(".txt"):
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            text = f.read()
    else:
        raise ValueError("Unsupported format. Use PDF or DOCX.")
        
    candidate_info = extract_candidate_info(text)
    return generate_profile(candidate_info)
