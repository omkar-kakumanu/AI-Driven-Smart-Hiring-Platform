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
        nlp = spacy.blank("en")
    except Exception:
        nlp = None

# Comprehensive Technical & Professional Skills Vocabulary (150+ Skills)
SKILLS_VOCABULARY = [
    # Programming & Scripting
    "Python", "Java", "C++", "C#", "C", "Go", "Golang", "Rust", "TypeScript", "JavaScript",
    "PHP", "Ruby", "Swift", "Kotlin", "Scala", "R", "Dart", "Bash", "Shell", "PowerShell", "Perl",
    # Frontend & Web
    "React", "React.js", "Vue", "Vue.js", "Angular", "Svelte", "Next.js", "Nuxt.js", "Redux",
    "HTML", "HTML5", "CSS", "CSS3", "Tailwind", "Tailwind CSS", "Bootstrap", "Sass", "LESS",
    "jQuery", "REST", "RESTful API", "GraphQL", "gRPC", "WebSockets",
    # Backend & Frameworks
    "Node.js", "Express", "Express.js", "Django", "Flask", "FastAPI", "Spring", "Spring Boot",
    "ASP.NET", ".NET Core", "Laravel", "Ruby on Rails", "NestJS", "Microservices",
    # Databases & Storage
    "SQL", "PostgreSQL", "MySQL", "MongoDB", "Redis", "SQLite", "MariaDB", "Oracle",
    "Microsoft SQL Server", "Snowflake", "BigQuery", "DynamoDB", "Cassandra", "Elasticsearch",
    "Neo4j", "Firebase", "Supabase", "Data Modeling", "ETL", "ELT",
    # Cloud & DevOps
    "AWS", "Amazon Web Services", "AWS SageMaker", "Azure", "GCP", "Google Cloud Platform",
    "Docker", "Kubernetes", "K8s", "Terraform", "Ansible", "Jenkins", "GitHub Actions", "CI/CD",
    "Git", "GitHub", "GitLab", "Linux", "Unix", "Nginx", "Apache", "Helm", "Prometheus", "Grafana",
    # AI / Machine Learning / Data Science
    "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "Keras", "Scikit-Learn",
    "Pandas", "NumPy", "SciPy", "Matplotlib", "Seaborn", "NLP", "Natural Language Processing",
    "LLM", "Large Language Models", "LangChain", "OpenAI", "Prompt Engineering", "Vector Databases",
    "Pinecone", "ChromaDB", "Computer Vision", "OpenCV", "MLOps", "Spark", "Apache Spark",
    "Airflow", "Apache Airflow", "Kafka", "Apache Kafka", "Hadoop", "Data Analysis", "Tableau", "Power BI",
    # Cybersecurity & Networking
    "Cybersecurity", "Network Security", "SIEM", "Penetration Testing", "Ethical Hacking",
    "Firewalls", "Wireshark", "Splunk", "Cryptography", "Identity Management",
    # Mobile & Game Dev
    "React Native", "Flutter", "iOS Development", "Android Development", "Unity", "Unreal Engine",
    # Methodologies & Tools
    "Agile", "Scrum", "Kanban", "Jira", "Confluence", "Unit Testing", "Jest", "Cypress", "PyTest"
]

def extract_text_from_pdf(pdf_path: str) -> str:
    doc = fitz.open(pdf_path)
    text = ""
    for page in doc:
        text += page.get_text() + "\n"
    return text

def extract_text_from_docx(docx_path: str) -> str:
    doc = docx.Document(docx_path)
    text = "\n".join([para.text for para in doc.paragraphs if para.text.strip()])
    return text

def validate_resume_content(text: str) -> bool:
    """
    Validates if text contains actual resume structure indicators.
    Returns True if text is a candidate resume, False if random text/file.
    """
    if not text or len(text.strip()) < 40:
        return False

    text_lower = text.lower()
    
    # Check resume structural section headers / keywords
    resume_keywords = [
        "experience", "education", "skills", "projects", "summary", "objective",
        "work history", "employment", "certifications", "qualification", "curriculum vitae",
        "resume", "bachelor", "master", "university", "college", "degree", "contact", "email", "phone"
    ]
    
    matches = [kw for kw in resume_keywords if kw in text_lower]
    
    # Check for email or phone
    has_contact = bool(re.search(r'[\w\.-]+@[\w\.-]+', text)) or bool(re.search(r'\+?\d[\d -]{8,}\d', text))
    
    # Check for technical skills
    found_skills_count = sum(1 for skill in SKILLS_VOCABULARY if re.search(r'\b' + re.escape(skill.lower()) + r'\b', text_lower))

    # A valid resume must have contact info OR (>= 2 section keywords) OR (>= 2 technical skills)
    if has_contact or len(matches) >= 2 or found_skills_count >= 2:
        return True

    return False

def extract_candidate_info(text: str) -> Dict[str, Any]:
    is_valid = validate_resume_content(text)
    
    if not is_valid:
        return {
            "is_valid": False,
            "error": "The uploaded document does not appear to contain a valid candidate resume structure or technical skills.",
            "name": None,
            "email": None,
            "phone": None,
            "education": [],
            "skills": [],
            "experience": [],
            "certifications": []
        }

    candidate = {
        "is_valid": True,
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

    # Extract Name (first line or PERSON entity)
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    if lines:
        possible_name = lines[0]
        if len(possible_name.split()) <= 4 and not any(kw in possible_name.lower() for kw in ["resume", "cv", "curriculum", "page"]):
            candidate["name"] = possible_name

    if nlp and not candidate["name"]:
        doc = nlp(text[:1000])
        for ent in doc.ents:
            if ent.label_ == "PERSON" and len(ent.text.strip().split()) <= 4:
                candidate["name"] = ent.text.strip()
                break

    # Extract Education
    edu_matches = re.findall(r'(?:Bachelor|Master|Doctor|Ph\.?D|BS|MS|B\.S|M\.S|B.Tech|M.Tech|Diploma)\s*(?:of|in|degree)?\s*[A-Za-z\s]+', text, re.IGNORECASE)
    if edu_matches:
        candidate["education"] = list(set([e.strip() for e in edu_matches[:3]]))

    # Extract skills strictly from vocabulary (case-insensitive boundary match)
    text_lower = text.lower()
    extracted_skills = []
    for skill in SKILLS_VOCABULARY:
        pattern = r'\b' + re.escape(skill.lower()) + r'\b'
        if re.search(pattern, text_lower):
            if skill not in extracted_skills:
                extracted_skills.append(skill)

    candidate["skills"] = extracted_skills

    # Extract work experience roles
    exp_matches = re.findall(r'(?:Senior|Junior|Lead|Principal|Staff)?\s*(?:Software|Data|Full Stack|Backend|Frontend|DevOps|ML|Machine Learning|Cloud|Security|Systems)\s*(?:Engineer|Developer|Scientist|Architect|Analyst|Specialist|Manager)', text, re.IGNORECASE)
    if exp_matches:
        candidate["experience"] = list(set([e.strip() for e in exp_matches]))

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

