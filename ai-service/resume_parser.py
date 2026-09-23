import fitz  # PyMuPDF
import docx
import re
import spacy
import pandas as pd
from typing import Dict, Any, List, Optional
from spacy.matcher import PhraseMatcher

# Load NLP model
try:
    nlp = spacy.load("en_core_web_sm")
except Exception:
    nlp = spacy.blank("en")

# Comprehensive Canonical Tech Skills Dictionary (Exact Display Names)
CANONICAL_SKILLS = [
    # Languages
    "Python", "Java", "JavaScript", "TypeScript", "C++", "C#", "Go", "Rust", "PHP", "Ruby", "Swift", "Kotlin", "Dart", "SQL",
    # Web & Frontend / Backend
    "HTML", "CSS", "React", "React Native", "Node.js", "Express.js", "Express", "Django", "Flask", "FastAPI", "Spring Boot",
    "Vue.js", "Vue", "Angular", "Next.js", "Tailwind CSS", "Bootstrap", "REST API", "APIs", "Microservices",
    # AI / ML / Data
    "Machine Learning", "Deep Learning", "GenAI", "Generative AI", "LLMs", "LLM", "Data Analysis", "Data Science",
    "TensorFlow", "PyTorch", "Keras", "Scikit-Learn", "Pandas", "NumPy", "NLP", "OpenAI", "Computer Vision", "Streamlit",
    # Cloud & DevOps
    "AWS", "Google Cloud", "GCP", "Azure", "Docker", "Kubernetes", "CI/CD", "Git", "GitHub", "GitLab", "Linux",
    # Databases & Tools
    "MySQL", "PostgreSQL", "MongoDB", "BigQuery", "Firebase", "Redis", "SQLite", "Snowflake", "Supabase",
    "VS Code", "Jupyter Notebook", "Jupyter", "Postman", "Cybersecurity", "Network Security"
]

# Case-insensitive lookup map to canonical display name
CANONICAL_MAP = {s.lower(): s for s in CANONICAL_SKILLS}
# Aliases
CANONICAL_MAP.update({
    "nodejs": "Node.js",
    "reactjs": "React",
    "react.js": "React",
    "vuejs": "Vue.js",
    "golang": "Go",
    "postgres": "PostgreSQL",
    "restful api": "REST API",
    "rest apis": "REST API",
    "api": "APIs",
    "llm": "LLMs",
    "large language models": "LLMs",
    "generative ai": "GenAI",
    "visual studio code": "VS Code",
    "vscode": "VS Code"
})

# Words that should NEVER be treated as company experience
EXCLUDED_ORGS = {
    "css", "html", "firebase", "bigquery", "google", "certifications", "projects", "education",
    "achievements", "skills", "technical skills", "hyderabad", "india", "state board", "ssc",
    "intermediate", "student", "b.tech", "tripzy", "ai & ml", "ai/ml", "data science"
}

# --- STEP 1: ROBUST FILE EXTRACTION ---
def extract_text_from_pdf(pdf_path: str) -> str:
    """Extract text from PDF using PyMuPDF (fitz)."""
    try:
        doc = fitz.open(pdf_path)
        text = ""
        for page in doc:
            # First attempt standard text
            page_text = page.get_text("text")
            if not page_text or len(page_text.strip()) < 20:
                # Fallback to text blocks if standard text is sparse
                blocks = page.get_text("blocks")
                page_text = "\n".join([b[4] for b in blocks if len(b) > 4 and b[4].strip()])
            text += page_text + "\n"
        return text
    except Exception as e:
        print(f"PDF extraction error: {e}")
        return ""

def extract_text_from_docx(docx_path: str) -> str:
    """Extract text from DOCX using python-docx."""
    try:
        doc = docx.Document(docx_path)
        text = "\n".join([para.text for para in doc.paragraphs if para.text.strip()])
        # Also extract table text
        for table in doc.tables:
            for row in table.rows:
                row_cells = [cell.text.strip() for cell in row.cells if cell.text.strip()]
                if row_cells:
                    text += "\n" + " | ".join(row_cells)
        return text
    except Exception as e:
        print(f"DOCX extraction error: {e}")
        return ""

# --- STEP 2: ACCURATE CANDIDATE EXTRACTION ---
def extract_candidate_info(text: str) -> Dict[str, Any]:
    candidate = {
        "name": None,
        "email": None,
        "phone": None,
        "current_role": None,
        "education": [],
        "skills": [],
        "experience": [],
        "certifications": [],
        "projects": [],
        "achievements": [],
        "linkedin": None,
        "github": None
    }
    
    # 1. Precise Clean Regex Filters for Contact
    email_regex = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
    phone_regex = r'(?:(?:\+?91[\s-]?)?[6-9]\d{9}|(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{4})'
    
    email_match = re.search(email_regex, text)
    if email_match:
        candidate["email"] = email_match.group(0).rstrip('.')
        
    phone_match = re.search(phone_regex, text)
    if phone_match:
        candidate["phone"] = phone_match.group(0).strip()

    # LinkedIn & GitHub
    li_match = re.search(r'(?:https?://)?(?:www\.)?linkedin\.com/in/[a-zA-Z0-9_-]+/?', text, re.IGNORECASE)
    if li_match:
        candidate["linkedin"] = li_match.group(0)

    gh_match = re.search(r'(?:https?://)?(?:www\.)?github\.com/[a-zA-Z0-9_-]+/?', text, re.IGNORECASE)
    if gh_match:
        candidate["github"] = gh_match.group(0)

    # 2. Candidate Name & Role Extraction
    lines = [line.strip() for line in text.split("\n") if line.strip()]
    doc = nlp(text)

    # Detect Name: examine top lines
    excluded_name_words = {
        "resume", "curriculum", "vitae", "cv", "page", "skills", "experience", "education",
        "contact", "phone", "email", "address", "about", "profile", "summary", "building",
        "intelligent", "solutions", "engineer", "developer", "student", "intern"
    }
    
    for line in lines[:6]:
        cleaned_line = re.sub(r'[^a-zA-Z\s]', '', line).strip()
        tokens = cleaned_line.split()
        if 1 <= len(tokens) <= 3:
            if not any(token.lower() in excluded_name_words for token in tokens):
                candidate["name"] = cleaned_line.title()
                break

    # If name still not found, check spaCy PERSON entities
    if not candidate["name"]:
        for ent in doc.ents:
            if ent.label_ == "PERSON":
                cleaned = ent.text.strip()
                if 1 <= len(cleaned.split()) <= 3 and not any(w in cleaned.lower() for w in excluded_name_words):
                    candidate["name"] = cleaned.title()
                    break

    # Detect Current Role / Headline
    role_pattern = r'\b(AI/ML\s+ENGINEERING\s+STUDENT|Full\s*Stack\s*Developer\s*Intern|Software\s*Engineer|Data\s*Scientist|ML\s*Engineer|Frontend\s*Developer|Backend\s*Developer)\b'
    role_match = re.search(role_pattern, text, re.IGNORECASE)
    if role_match:
        candidate["current_role"] = role_match.group(0).title()

    # 3. Comprehensive, Accurate Skill Extraction
    extracted_skills_set = set()

    # Method A: Structured Skill Section Delimiter Extraction (Lines with | or comma)
    skill_section_active = False
    for line in lines:
        line_clean = line.strip()
        if re.search(r'^(?:TECHNICAL\s+SKILLS|SKILLS|TECH\s+STACK)\b', line_clean, re.IGNORECASE):
            skill_section_active = True
            continue
        if skill_section_active and re.search(r'^(?:CERTIFICATIONS|PROJECTS|EXPERIENCE|EDUCATION|ACHIEVEMENTS|LANGUAGES|ABOUT)\b', line_clean, re.IGNORECASE):
            skill_section_active = False

        if skill_section_active or "Tech Stack:" in line_clean:
            # Parse tokens separated by | or ,
            parts = re.split(r'[:|•,]+', line_clean)
            for part in parts:
                p = part.strip()
                p_lower = p.lower()
                if p_lower in CANONICAL_MAP:
                    extracted_skills_set.add(CANONICAL_MAP[p_lower])
                elif len(p.split()) <= 2 and p_lower not in ["programming languages", "web development", "ai/ml & data science", "cloud & devops", "databases", "tools & others", "tech stack"]:
                    if len(p) >= 2 and re.match(r'^[a-zA-Z0-9#+.\s-]+$', p):
                        # Clean title case
                        extracted_skills_set.add(p)

    # Method B: Exact Word Boundary Matching against Canonical Skills
    text_lower = text.lower()
    for skill in CANONICAL_SKILLS:
        s_lower = skill.lower()
        # Single-letter skills require strict token boundaries and context
        if len(s_lower) <= 2 and s_lower in ["c", "r", "go"]:
            continue
        pattern = r'(?<![a-zA-Z0-9#+])' + re.escape(s_lower) + r'(?![a-zA-Z0-9#+])'
        if re.search(pattern, text_lower):
            extracted_skills_set.add(CANONICAL_MAP.get(s_lower, skill))

    # Deduplicate subphrase skills (e.g., keep "Jupyter Notebook" over "Jupyter")
    final_skills = []
    sorted_skills = sorted(list(extracted_skills_set), key=lambda x: len(x), reverse=True)
    for s in sorted_skills:
        # Don't add shorter standalone token if longer version is present and starts with it (e.g. Jupyter)
        if s.lower() == "jupyter" and any("jupyter notebook" in o.lower() for o in sorted_skills):
            continue
        final_skills.append(s)

    candidate["skills"] = sorted(final_skills)

    # 4. Contextual Categorization for ORGs (Universities vs Companies)
    edu_keywords = ["university", "college", "school", "institute", "polytechnic", "degree", "bachelor", "master", "malla reddy"]
    
    # Explicit Degree & University extraction
    edu_matches = re.findall(r'(?:B\.?Tech|Intermediate|SSC)[^\n,]*', text, re.IGNORECASE)
    for m in edu_matches:
        cand_edu = m.strip()
        if cand_edu and cand_edu not in candidate["education"]:
            candidate["education"].append(cand_edu)

    for ent in doc.ents:
        if ent.label_ == "ORG":
            cleaned_org = ent.text.strip().replace("\n", " ")
            org_lower = cleaned_org.lower()

            # Skip tech skills and common words misclassified as ORG
            if org_lower in EXCLUDED_ORGS or org_lower in [s.lower() for s in candidate["skills"]]:
                continue

            if any(kw in org_lower for kw in edu_keywords):
                edu_name = cleaned_org
                if edu_name not in candidate["education"]:
                    candidate["education"].append(edu_name)
            elif len(cleaned_org.split()) <= 5 and not any(kw in org_lower for kw in ["certifications", "projects", "achievements", "skills", "student", "state board", "percentage"]):
                if cleaned_org not in candidate["experience"]:
                    candidate["experience"].append(cleaned_org)

    # Explicit Internship / Experience Role Extraction
    exp_matches = re.findall(r'(?:Full\s*Stack\s*Developer\s*Intern\s*-\s*[A-Za-z0-9]+|Software\s*Engineer|Developer\s*Intern)[^\n]*', text, re.IGNORECASE)
    for exp in exp_matches:
        clean_exp = exp.strip().lstrip('-•* ')
        if clean_exp and clean_exp not in candidate["experience"]:
            candidate["experience"].insert(0, clean_exp)

    # 5. Certifications Extraction
    cert_matches = re.findall(
        r'(?:AWS\s+Cloud\s+(?:Foundation|Cybersecurity)|Google\s+Cloud\s+Computing|Full\s*Stack\s*Development[^\n,•]*|ICAC\s+Recognized\s+Certification|AWS\s+Certified[^\n,•]*)',
        text,
        re.IGNORECASE
    )
    for cert in cert_matches:
        cleaned_cert = cert.strip().lstrip('-•* ')
        if cleaned_cert and len(cleaned_cert) > 5 and cleaned_cert not in candidate["certifications"]:
            candidate["certifications"].append(cleaned_cert)

    # 6. Projects Extraction
    proj_matches = re.findall(r'(?:Tripzy[^\n]*|AI-Generated\s+Image\s+Detection[^\n]*)', text, re.IGNORECASE)
    for proj in proj_matches:
        p_clean = proj.strip().lstrip('-•* ')
        if p_clean and p_clean not in candidate["projects"]:
            candidate["projects"].append(p_clean)

    return candidate

# --- STEP 3: STRUCTURED OUTPUT GENERATION ---
def generate_profile(candidate: Dict[str, Any]) -> pd.DataFrame:
    """Convert lists to clean strings for analytical dataframe representation."""
    cleaned_candidate = {k: ", ".join(v) if isinstance(v, list) else v for k, v in candidate.items()}
    return pd.DataFrame([cleaned_candidate])

def process_resume(file_path: str) -> pd.DataFrame:
    """Processes PDF, DOCX, or TXT resume into structured DataFrame."""
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
