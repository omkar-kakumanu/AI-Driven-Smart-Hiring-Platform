"""
AI Resume Parser Module
-----------------------
Extracts candidate information from PDF or DOCX formats with high accuracy:
- PyMuPDF (fitz) for PDF text extraction
- python-docx for DOCX parsing
- spaCy / HuggingFace Transformers for NLP entity extraction
- Regex for email, phone, URLs, and date intervals
- pandas for structured candidate data storage

Extracts:
1. Full Name
2. Email Address
3. Phone Number
4. Current Job Title / Role
5. Total Years of Experience
6. Education / Degree
7. Institution / University
8. Technical Skills
9. Work Experience
10. Projects
11. Certifications
12. Achievements
13. LinkedIn / GitHub / Portfolio URLs
"""

import os
import re
import json
import datetime
from typing import Dict, Any, List, Optional, Tuple
import pandas as pd

# Load PyMuPDF
try:
    import pymupdf as fitz
except ImportError:
    try:
        import fitz
    except ImportError:
        fitz = None

# Load python-docx
try:
    import docx
except ImportError:
    docx = None

# Load spaCy NLP
try:
    import spacy
    try:
        nlp = spacy.load("en_core_web_sm")
    except Exception:
        nlp = spacy.blank("en")
except ImportError:
    nlp = None

# Comprehensive Technical Skills Vocabulary
TECHNICAL_SKILLS_SET = {
    # Languages
    "python", "java", "c++", "c#", "c", "go", "golang", "rust", "typescript", "javascript",
    "php", "ruby", "swift", "kotlin", "scala", "r", "dart", "bash", "shell", "powershell", "perl",
    # Frontend
    "react", "react.js", "vue", "vue.js", "angular", "svelte", "next.js", "nuxt.js", "redux",
    "html", "html5", "css", "css3", "tailwind", "tailwind css", "bootstrap", "sass", "less",
    "jquery", "rest", "restful api", "graphql", "grpc", "websockets",
    # Backend
    "node.js", "express", "express.js", "django", "flask", "fastapi", "spring", "spring boot",
    "asp.net", ".net", ".net core", "laravel", "ruby on rails", "nestjs", "microservices",
    # Databases & Big Data
    "sql", "postgresql", "postgres", "mysql", "mongodb", "redis", "sqlite", "mariadb", "oracle",
    "sql server", "snowflake", "bigquery", "dynamodb", "cassandra", "elasticsearch", "neo4j",
    "firebase", "supabase", "spark", "apache spark", "hadoop", "kafka", "apache kafka", "airflow",
    # Cloud & DevOps
    "aws", "amazon web services", "azure", "gcp", "google cloud", "docker", "kubernetes", "k8s",
    "terraform", "ansible", "jenkins", "github actions", "gitlab ci", "ci/cd", "git", "github",
    "gitlab", "linux", "unix", "nginx", "apache", "helm", "prometheus", "grafana",
    # AI / ML / Data Science
    "machine learning", "deep learning", "tensorflow", "pytorch", "keras", "scikit-learn",
    "pandas", "numpy", "scipy", "matplotlib", "seaborn", "nlp", "natural language processing",
    "llm", "large language models", "langchain", "openai", "prompt engineering", "vector databases",
    "pinecone", "chromadb", "computer vision", "opencv", "mlops", "data analysis", "tableau", "power bi",
    # Security & Tools
    "cybersecurity", "network security", "siem", "penetration testing", "agile", "scrum",
    "kanban", "jira", "confluence", "pytest", "unit testing", "jest"
}

# Display names mapping for clean capitalization
SKILL_DISPLAY_MAP = {
    "python": "Python", "java": "Java", "c++": "C++", "c#": "C#", "c": "C", "go": "Go",
    "golang": "Golang", "rust": "Rust", "typescript": "TypeScript", "javascript": "JavaScript",
    "php": "PHP", "ruby": "Ruby", "swift": "Swift", "kotlin": "Kotlin", "scala": "Scala",
    "r": "R", "dart": "Dart", "bash": "Bash", "shell": "Shell", "powershell": "PowerShell",
    "react": "React", "react.js": "React", "vue": "Vue.js", "vue.js": "Vue.js",
    "angular": "Angular", "svelte": "Svelte", "next.js": "Next.js", "nuxt.js": "Nuxt.js",
    "redux": "Redux", "html": "HTML", "html5": "HTML5", "css": "CSS", "css3": "CSS3",
    "tailwind": "Tailwind CSS", "tailwind css": "Tailwind CSS", "bootstrap": "Bootstrap",
    "rest": "REST API", "restful api": "REST API", "graphql": "GraphQL", "grpc": "gRPC",
    "node.js": "Node.js", "express": "Express.js", "express.js": "Express.js",
    "django": "Django", "flask": "Flask", "fastapi": "FastAPI", "spring": "Spring",
    "spring boot": "Spring Boot", "asp.net": "ASP.NET", ".net": ".NET", ".net core": ".NET Core",
    "sql": "SQL", "postgresql": "PostgreSQL", "postgres": "PostgreSQL", "mysql": "MySQL",
    "mongodb": "MongoDB", "redis": "Redis", "sqlite": "SQLite", "snowflake": "Snowflake",
    "bigquery": "BigQuery", "dynamodb": "DynamoDB", "elasticsearch": "Elasticsearch",
    "aws": "AWS", "amazon web services": "AWS", "azure": "Azure", "gcp": "GCP",
    "docker": "Docker", "kubernetes": "Kubernetes", "k8s": "Kubernetes", "terraform": "Terraform",
    "jenkins": "Jenkins", "ci/cd": "CI/CD", "git": "Git", "github": "GitHub", "linux": "Linux",
    "machine learning": "Machine Learning", "deep learning": "Deep Learning",
    "tensorflow": "TensorFlow", "pytorch": "PyTorch", "keras": "Keras", "scikit-learn": "Scikit-Learn",
    "pandas": "Pandas", "numpy": "NumPy", "nlp": "NLP", "llm": "LLM", "langchain": "LangChain",
    "openai": "OpenAI", "spark": "Apache Spark", "kafka": "Kafka", "airflow": "Airflow",
    "tableau": "Tableau", "power bi": "Power BI", "agile": "Agile", "scrum": "Scrum",
    "jira": "Jira", "pytest": "PyTest"
}

# --- Step 1: Resume File Loader ---

def extract_text_from_pdf(pdf_path: str) -> str:
    """Extract text from PDF file using PyMuPDF (fitz)."""
    if not fitz:
        raise ImportError("PyMuPDF (fitz) is not installed.")
    try:
        doc = fitz.open(pdf_path)
        text = ""
        for page in doc:
            text += page.get_text() + "\n"
        return text
    except Exception as e:
        print(f"PDF extraction error: {e}")
        return ""

def extract_text_from_docx(docx_path: str) -> str:
    """Extract text from DOCX file using python-docx."""
    if not docx:
        raise ImportError("python-docx is not installed.")
    try:
        doc = docx.Document(docx_path)
        paragraphs_text = "\n".join([para.text for para in doc.paragraphs if para.text.strip()])
        # Also extract table text if present
        table_text = []
        for table in doc.tables:
            for row in table.rows:
                cells = [cell.text.strip() for cell in row.cells if cell.text.strip()]
                if cells:
                    table_text.append(" | ".join(cells))
        combined = paragraphs_text
        if table_text:
            combined += "\n" + "\n".join(table_text)
        return combined
    except Exception as e:
        print(f"DOCX extraction error: {e}")
        return ""

# --- Step 2: Content Parsing & Cleaners ---

def clean_extracted_text(text: str) -> str:
    """Correct obvious text-extraction and OCR artifacts."""
    if not text:
        return ""
    # Normalize unicode quotes and dashes
    text = text.replace('\u2013', '-').replace('\u2014', '-').replace('\u2018', "'").replace('\u2019', "'")
    text = text.replace('\u201c', '"').replace('\u201d', '"').replace('\u2022', '•').replace('\t', ' ')
    # Normalize multiple whitespace characters on single lines
    lines = [re.sub(r'[ ]{2,}', ' ', line.strip()) for line in text.splitlines()]
    return "\n".join(lines)

def split_into_sections(text: str) -> Dict[str, str]:
    """Segment resume text into standard thematic sections."""
    section_patterns = [
        ("summary", r'^(?:PROFESSIONAL\s+)?(?:SUMMARY|OBJECTIVE|PROFILE|ABOUT\s+ME)\b'),
        ("experience", r'^(?:WORK\s+)?(?:EXPERIENCE|EMPLOYMENT\s+HISTORY|WORK\s+HISTORY|EXPERIENCE\s*&?\s*ROLES)\b'),
        ("education", r'^(?:EDUCATION|ACADEMIC\s+BACKGROUND|ACADEMIC\s+HISTORY|QUALIFICATIONS)\b'),
        ("skills", r'^(?:TECHNICAL\s+)?(?:SKILLS|COMPETENCIES|CORE\s+COMPETENCIES|TOOLKIT|TECH\s+STACK)\b'),
        ("projects", r'^(?:KEY\s+)?(?:PROJECTS|ACADEMIC\s+PROJECTS|PERSONAL\s+PROJECTS)\b'),
        ("certifications", r'^(?:CERTIFICATIONS|LICENSES|CERTIFICATES|CREDENTIALS)\b'),
        ("achievements", r'^(?:ACHIEVEMENTS|AWARDS|HONORS|ACCOMPLISHMENTS)\b')
    ]
    
    lines = text.splitlines()
    sections: Dict[str, List[str]] = {"header": []}
    current_section = "header"
    
    for line in lines:
        cleaned_line = line.strip()
        if not cleaned_line:
            continue
            
        matched_section = None
        # Check if line looks like a header (short, capitalized, matches keyword)
        if len(cleaned_line) < 45:
            for sec_name, sec_regex in section_patterns:
                if re.search(sec_regex, cleaned_line, re.IGNORECASE):
                    matched_section = sec_name
                    break
        
        if matched_section:
            current_section = matched_section
            if current_section not in sections:
                sections[current_section] = []
        else:
            if current_section not in sections:
                sections[current_section] = []
            sections[current_section].append(cleaned_line)
            
    return {k: "\n".join(v) for k, v in sections.items()}

# --- Step 3: Sub-field Extractors ---

def extract_name(text: str, header_text: str) -> Optional[str]:
    """Extract candidate's full name using spaCy PERSON entity and layout heuristics."""
    lines = [line.strip() for line in (header_text or text).splitlines() if line.strip()]
    excluded_keywords = {"resume", "cv", "curriculum", "curriculum vitae", "page", "summary", "profile", "contact", "email", "phone"}
    for line in lines[:4]:
        candidate = re.sub(r'[^a-zA-Z\s\.\-]', '', line).strip()
        tokens = candidate.split()
        if 2 <= len(tokens) <= 4:
            if not any(token.lower() in excluded_keywords for token in tokens):
                if not re.match(r'^(?:SOFTWARE|SENIOR|LEAD|DATA|ENGINEER|DEVELOPER)', candidate, re.IGNORECASE):
                    return candidate

    if nlp:
        doc = nlp(text[:1200])
        for ent in doc.ents:
            if ent.label_ == "PERSON":
                cleaned = ent.text.strip()
                tokens = cleaned.split()
                if 2 <= len(tokens) <= 4 and not any(kw in cleaned.lower() for kw in excluded_keywords):
                    return cleaned
    return None

def extract_email(text: str) -> Optional[str]:
    """Extract email address via regex."""
    match = re.search(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+', text)
    if match:
        email = match.group(0).rstrip('.')
        return email
    return None

def extract_phone(text: str) -> Optional[str]:
    """Extract phone number via regex."""
    patterns = [
        r'(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}',
        r'\+?\d[\d -]{8,}\d'
    ]
    for pat in patterns:
        match = re.search(pat, text)
        if match:
            phone_cand = match.group(0).strip()
            if len(re.sub(r'\D', '', phone_cand)) >= 9:
                return phone_cand
    return None

def extract_urls(text: str) -> Tuple[Optional[str], Optional[str], Optional[str]]:
    """Extract LinkedIn, GitHub, and Portfolio URLs."""
    linkedin = None
    github = None
    portfolio = None

    # LinkedIn
    li_match = re.search(r'(?:https?://)?(?:www\.)?linkedin\.com/in/[a-zA-Z0-9_-]+/?', text, re.IGNORECASE)
    if li_match:
        val = li_match.group(0)
        linkedin = val if val.startswith("http") else f"https://{val}"

    # GitHub
    gh_match = re.search(r'(?:https?://)?(?:www\.)?github\.com/[a-zA-Z0-9_-]+/?', text, re.IGNORECASE)
    if gh_match:
        val = gh_match.group(0)
        if not val.rstrip('/').endswith(('github.com', 'com')):
            github = val if val.startswith("http") else f"https://{val}"

    # Portfolio / Personal Website
    portfolio_match = re.search(r'(?:Portfolio|Website|Web):\s*(https?://[^\s]+)', text, re.IGNORECASE)
    if portfolio_match:
        portfolio = portfolio_match.group(1).rstrip('.,;')
    else:
        site_match = re.search(r'https?://[a-zA-Z0-9.-]+\.(?:dev|me|io|tech|app|org)/?[^\s]*', text, re.IGNORECASE)
        if site_match:
            cand = site_match.group(0).rstrip('.,;')
            if "linkedin" not in cand.lower() and "github" not in cand.lower():
                portfolio = cand

    return linkedin, github, portfolio

def extract_skills(text: str, skills_section: str = "") -> List[str]:
    """Identify technical skills from the complete resume without duplicates."""
    found_skills = set()
    text_lower = text.lower()

    # 1. Match from vocabulary
    for skill_key in TECHNICAL_SKILLS_SET:
        pattern = r'(?<![a-zA-Z0-9])' + re.escape(skill_key) + r'(?![a-zA-Z0-9])'
        if re.search(pattern, text_lower):
            display_name = SKILL_DISPLAY_MAP.get(skill_key, skill_key.title())
            found_skills.add(display_name)

    # 2. Extract specific comma-separated skills in the Skills section
    if skills_section:
        candidates = re.split(r'[,|•\n\t]+', skills_section)
        for cand in candidates:
            c = cand.strip()
            if c and len(c) < 30 and len(c.split()) <= 3:
                c_clean = re.sub(r'^[•\-\*\s]+', '', c).strip()
                if c_clean.lower() in TECHNICAL_SKILLS_SET:
                    display_name = SKILL_DISPLAY_MAP.get(c_clean.lower(), c_clean.title())
                    found_skills.add(display_name)

    return sorted(list(found_skills))

def extract_education(text: str, edu_section: str = "") -> List[Dict[str, Optional[Any]]]:
    """Extract education history: degree, institution, graduation year."""
    target_text = edu_section if edu_section else text
    education_entries: List[Dict[str, Optional[Any]]] = []

    degree_regex = (
        r'\b(?:Bachelor(?:\'s)?(?:\s+(?:of|in)\s+[A-Za-z]+(?:\s+[A-Za-z]+){0,3})?|'
        r'Master(?:\'s)?(?:\s+(?:of|in)\s+[A-Za-z]+(?:\s+[A-Za-z]+){0,3})?|'
        r'Doctor(?:\'s)?(?:\s+(?:of|in)\s+[A-Za-z]+(?:\s+[A-Za-z]+){0,3})?|'
        r'Ph\.?D\.?|'
        r'(?:B\.?S\.?|M\.?S\.?|B\.?A\.?|M\.?A\.?|B\.?Tech|M\.?Tech|B\.?E\.?|M\.?E\.?)'
        r'(?:\s+(?:in\s+|of\s+)?[A-Za-z]+(?:\s+[A-Za-z]+){0,3})?|'
        r'Diploma)\b'
    )

    lines = target_text.splitlines()
    for i, line in enumerate(lines):
        line_str = line.strip()
        segments = [s.strip() for s in re.split(r'[,|]', line_str) if s.strip()]
        for seg in segments:
            degree_match = re.search(degree_regex, seg, re.IGNORECASE)
            if degree_match:
                degree_found = degree_match.group(0).strip()
                if degree_found.lower() in ["ma", "me", "in", "to", "at", "of", "or", "is"]:
                    continue

                context = line_str
                if i + 1 < len(lines) and len(lines[i+1].strip()) < 80:
                    context += " " + lines[i+1].strip()

                year_match = re.search(r'\b(19\d\d|20\d\d)\b', context)
                grad_year = int(year_match.group(1)) if year_match else None

                inst_found = None
                # Check comma-separated segments first for cleanest institution name
                for part in re.split(r'[,|\n]', context):
                    part_clean = part.strip()
                    if any(k in part_clean.lower() for k in ["university", "college", "institute", "school", "academy", "polytechnic"]):
                        # Strip any leading degree tokens
                        inst_clean = re.sub(degree_regex, '', part_clean, flags=re.IGNORECASE).strip(' ,-')
                        if inst_clean:
                            inst_found = inst_clean
                            break

                if not inst_found and nlp:
                    doc = nlp(context)
                    for ent in doc.ents:
                        if ent.label_ == "ORG" and any(k in ent.text.lower() for k in ["univ", "college", "inst", "school", "tech"]):
                            inst_found = ent.text.strip()
                            break

                education_entries.append({
                    "degree": degree_found,
                    "institution": inst_found,
                    "graduation_year": grad_year
                })
                break

    seen_degrees = set()
    unique_edu = []
    for edu in education_entries:
        key = (edu["degree"] or "").lower()
        if key not in seen_degrees:
            seen_degrees.add(key)
            unique_edu.append(edu)

    return unique_edu

def extract_experience_and_roles(text: str, exp_section: str = "") -> Tuple[List[Dict[str, Any]], Optional[str], Optional[int]]:
    """
    Extract work experience array, current role, and total experience years.
    Calculates total experience only from reliable employment dates or explicit mentions.
    """
    target_text = exp_section if exp_section else text
    experiences: List[Dict[str, Any]] = []
    current_role = None

    role_regex = (
        r'\b(?:Senior|Junior|Lead|Principal|Staff|Associate|Chief)?\s*'
        r'(?:Software|Data|Full\s*Stack|Frontend|Backend|DevOps|Cloud|ML|Machine\s*Learning|AI|Systems|Security|QA|Product)?\s*'
        r'(?:Engineer|Developer|Scientist|Architect|Analyst|Manager|Consultant|Specialist)\b'
    )
    
    date_range_regex = (
        r'((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{4}|\d{4})\s*'
        r'[-–—to]+\s*'
        r'((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{4}|\d{4}|Present|Current)'
    )

    lines = target_text.splitlines()
    blocks: List[List[str]] = []
    current_block: List[str] = []

    for line in lines:
        line_clean = line.strip()
        if not line_clean:
            continue
        has_role = bool(re.search(role_regex, line_clean, re.IGNORECASE))
        has_date = bool(re.search(date_range_regex, line_clean, re.IGNORECASE))
        
        starts_new_position = False
        if current_block:
            current_has_role = any(re.search(role_regex, l, re.IGNORECASE) for l in current_block)
            current_has_date = any(re.search(date_range_regex, l, re.IGNORECASE) for l in current_block)
            current_has_bullets = any(l.startswith(('-', '•', '*', '—')) for l in current_block)
            
            # Start new position when a role appears after bullets, or when another date appears after a date
            if has_role and (current_has_bullets or (current_has_role and current_has_date)):
                starts_new_position = True
            elif has_date and current_has_date and not has_role:
                starts_new_position = True

        if starts_new_position:
            blocks.append(current_block)
            current_block = [line_clean]
        else:
            current_block.append(line_clean)

    if current_block:
        blocks.append(current_block)

    all_start_years = []
    all_end_years = []

    for block in blocks:
        block_text = " ".join(block)
        
        # 1. Role
        role_match = re.search(role_regex, block_text, re.IGNORECASE)
        role = role_match.group(0).strip() if role_match else None
        
        # 2. Company
        company = None
        at_match = re.search(r'(?:at|@)\s+([A-Za-z0-9\s&.,-]+?)(?:\s*[-–|,(\n]|$)', block[0], re.IGNORECASE)
        if at_match:
            company = at_match.group(1).strip()
        elif nlp:
            doc = nlp(block_text[:200])
            for ent in doc.ents:
                ent_clean = ent.text.strip()
                ent_lower = ent_clean.lower()
                if ent.label_ == "ORG" and ent_lower not in TECHNICAL_SKILLS_SET:
                    if not (role and ent_lower in role.lower()):
                        company = ent_clean
                        break

        # Check if detected company is actually an educational institution
        is_inst = False
        if company:
            lower_comp = company.lower()
            if any(k in lower_comp for k in ["university", "college", "institute", "school"]):
                is_inst = True

        # 3. Dates
        date_match = re.search(date_range_regex, block_text, re.IGNORECASE)
        start_date = None
        end_date = None
        if date_match:
            start_date = date_match.group(1).strip()
            end_date = date_match.group(2).strip()

            s_year = re.search(r'\b(19\d\d|20\d\d)\b', start_date)
            if s_year:
                all_start_years.append(int(s_year.group(1)))
            if "present" in end_date.lower() or "current" in end_date.lower():
                all_end_years.append(datetime.datetime.now().year)
            else:
                e_year = re.search(r'\b(19\d\d|20\d\d)\b', end_date)
                if e_year:
                    all_end_years.append(int(e_year.group(1)))

        # 4. Responsibilities
        responsibilities = []
        for line in block[1:]:
            if line.startswith(('-', '•', '*', '—')) or len(line.split()) > 5:
                cleaned_resp = re.sub(r'^[\-•\*—\s]+', '', line).strip()
                if cleaned_resp:
                    responsibilities.append(cleaned_resp)

        # 5. Technologies
        technologies = []
        block_lower = block_text.lower()
        for skill in TECHNICAL_SKILLS_SET:
            pattern = r'(?<![a-zA-Z0-9])' + re.escape(skill) + r'(?![a-zA-Z0-9])'
            if re.search(pattern, block_lower):
                technologies.append(SKILL_DISPLAY_MAP.get(skill, skill.title()))
        technologies = sorted(list(set(technologies)))

        # Require a valid role (or explicit experience section) and exclude educational institutions
        if (role and not is_inst) or (exp_section and company and not is_inst):
            experiences.append({
                "company": company,
                "role": role,
                "start_date": start_date,
                "end_date": end_date,
                "responsibilities": responsibilities,
                "technologies": technologies
            })

    # Determine current role
    if experiences and experiences[0].get("role"):
        current_role = experiences[0]["role"]
    else:
        first_lines = "\n".join(text.splitlines()[:10])
        role_match = re.search(role_regex, first_lines, re.IGNORECASE)
        if role_match:
            current_role = role_match.group(0).strip()

    # Calculate total experience years
    total_exp_years = None
    if all_start_years and all_end_years:
        min_start = min(all_start_years)
        max_end = max(all_end_years)
        diff = max_end - min_start
        if diff >= 0:
            total_exp_years = max(1, diff)

    # Fallback to explicit mentions (e.g., "5 years' experience")
    explicit_match = re.search(r'(\d{1,2})\s*\+?\s*(?:years?|yrs?)(?:\'|\s+of)?\s*(?:experience|exp)', text, re.IGNORECASE)
    if explicit_match:
        explicit_years = int(explicit_match.group(1))
        if total_exp_years is None or abs(total_exp_years - explicit_years) <= 2:
            total_exp_years = explicit_years

    return experiences, current_role, total_exp_years

def extract_projects(text: str, projects_section: str = "") -> List[Dict[str, Any]]:
    """Extract projects: name, description, technologies."""
    target_text = projects_section
    if not target_text:
        return []

    projects: List[Dict[str, Any]] = []
    lines = [l.strip() for l in target_text.splitlines() if l.strip()]

    current_name = None
    current_desc_parts = []
    
    for line in lines:
        if len(line) < 60 and not line.startswith(('-', '•', '*')):
            if current_name:
                desc = " ".join(current_desc_parts)
                techs = [
                    SKILL_DISPLAY_MAP.get(s, s.title())
                    for s in TECHNICAL_SKILLS_SET
                    if re.search(r'(?<![a-zA-Z0-9])' + re.escape(s) + r'(?![a-zA-Z0-9])', desc.lower())
                ]
                projects.append({
                    "name": current_name,
                    "description": desc if desc else None,
                    "technologies": sorted(list(set(techs)))
                })
            current_name = line
            current_desc_parts = []
        else:
            current_desc_parts.append(line.lstrip('-•* '))

    if current_name:
        desc = " ".join(current_desc_parts)
        techs = [
            SKILL_DISPLAY_MAP.get(s, s.title())
            for s in TECHNICAL_SKILLS_SET
            if re.search(r'(?<![a-zA-Z0-9])' + re.escape(s) + r'(?![a-zA-Z0-9])', desc.lower())
        ]
        projects.append({
            "name": current_name,
            "description": desc if desc else None,
            "technologies": sorted(list(set(techs)))
        })

    return projects

def extract_certifications(text: str, cert_section: str = "") -> List[str]:
    """Extract list of certifications and licenses."""
    target_text = cert_section if cert_section else text
    certifications = []

    cert_patterns = [
        r'(?:AWS\s+Certified[A-Za-z\s]+?(?=\n|$|,|\.|;))',
        r'(?:Google\s+Cloud\s+Certified[A-Za-z\s]+?(?=\n|$|,|\.|;))',
        r'(?:Microsoft\s+Certified[A-Za-z\s]+?(?=\n|$|,|\.|;))',
        r'(?:Certified\s+Kubernetes\s+[A-Za-z]+(?:\s+Developer|\s+Administrator)?)',
        r'(?:PMP|Project\s+Management\s+Professional)',
        r'(?:Professional\s+Data\s+Engineer)',
        r'(?:Solutions\s+Architect\s*(?:Associate|Professional)?)'
    ]

    for pat in cert_patterns:
        for m in re.finditer(pat, target_text, re.IGNORECASE):
            cert = m.group(0).strip().rstrip('.,;')
            if cert and len(cert) > 3 and not any(cert.lower() == c.lower() for c in certifications):
                certifications.append(cert)

    if cert_section:
        for line in cert_section.splitlines():
            cleaned = re.sub(r'^[\-•\*—\s]+', '', line).strip()
            if cleaned and 5 < len(cleaned) < 80:
                if not re.match(r'^(?:certifications|licenses|certificates|credentials)$', cleaned, re.IGNORECASE):
                    if not any(cleaned.lower() in c.lower() or c.lower() in cleaned.lower() for c in certifications):
                        certifications.append(cleaned)

    # Clean redundant sub-matches
    filtered = []
    for c in certifications:
        if not any(c.lower() != o.lower() and c.lower() in o.lower() for o in certifications):
            filtered.append(c)

    return filtered

def extract_achievements(text: str, ach_section: str = "") -> List[str]:
    """Extract list of achievements, awards, and honors."""
    achievements = []
    if ach_section:
        for line in ach_section.splitlines():
            cleaned = re.sub(r'^[\-•\*—\s]+', '', line).strip()
            if cleaned and len(cleaned) < 150:
                if not re.match(r'^(?:achievements|awards|honors|accomplishments)$', cleaned, re.IGNORECASE):
                    achievements.append(cleaned)
    return achievements

# --- Step 4: Candidate Information Extraction (AI-powered) ---

def extract_candidate_info(text: str) -> Dict[str, Any]:
    """
    Extracts structured candidate information conforming strictly to the requested 13-field JSON schema.
    Rule: Extract information only from resume. Do not invent missing information (return null or []).
    """
    cleaned_text = clean_extracted_text(text)
    sections = split_into_sections(cleaned_text)

    # 1. Contact & Identity
    name = extract_name(cleaned_text, sections.get("header", ""))
    email = extract_email(cleaned_text)
    phone = extract_phone(cleaned_text)
    linkedin, github, portfolio = extract_urls(cleaned_text)

    # 2. Education
    education = extract_education(cleaned_text, sections.get("education", ""))

    # 3. Skills
    skills = extract_skills(cleaned_text, sections.get("skills", ""))

    # 4. Work Experience & Current Role & Total Experience Years
    experience, current_role, total_experience_years = extract_experience_and_roles(
        cleaned_text, sections.get("experience", "")
    )

    # 5. Projects
    projects = extract_projects(cleaned_text, sections.get("projects", ""))

    # 6. Certifications & Achievements
    certifications = extract_certifications(cleaned_text, sections.get("certifications", ""))
    achievements = extract_achievements(cleaned_text, sections.get("achievements", ""))

    candidate_profile = {
        "name": name,
        "email": email,
        "phone": phone,
        "current_role": current_role,
        "total_experience_years": total_experience_years,
        "education": education,
        "skills": skills,
        "experience": experience,
        "projects": projects,
        "certifications": certifications,
        "achievements": achievements,
        "linkedin": linkedin,
        "github": github,
        "portfolio": portfolio
    }

    return candidate_profile

# --- Step 5: Structured Profile Storage & End-to-End Pipeline ---

def generate_profile(candidate: Dict[str, Any]) -> pd.DataFrame:
    """Generate structured candidate profile as a pandas DataFrame."""
    return pd.DataFrame([candidate])

def process_resume(file_path: str) -> pd.DataFrame:
    """
    End-to-End Resume Processing Pipeline:
    - Reads PDF via PyMuPDF or DOCX via python-docx
    - Extracts 13 structured candidate fields
    - Returns structured pandas DataFrame
    """
    if file_path.lower().endswith(".pdf"):
        text = extract_text_from_pdf(file_path)
    elif file_path.lower().endswith(".docx"):
        text = extract_text_from_docx(file_path)
    elif file_path.lower().endswith(".txt"):
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            text = f.read()
    else:
        raise ValueError(f"Unsupported file format: {file_path}")

    candidate_info = extract_candidate_info(text)
    profile = generate_profile(candidate_info)
    return profile

def parse_resume_to_json(file_path: str, indent: int = 2) -> str:
    """Convenience helper to return ONLY valid JSON for an uploaded resume."""
    if file_path.lower().endswith(".pdf"):
        text = extract_text_from_pdf(file_path)
    elif file_path.lower().endswith(".docx"):
        text = extract_text_from_docx(file_path)
    elif file_path.lower().endswith(".txt"):
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            text = f.read()
    else:
        raise ValueError(f"Unsupported file format: {file_path}")

    candidate_info = extract_candidate_info(text)
    return json.dumps(candidate_info, indent=indent)

if __name__ == "__main__":
    sample_text = (
        "Sarah Johnson\n"
        "Email: sarah@example.com | Phone: (555)123-4567\n"
        "MS Computer Science, Stanford University\n"
        "5 years' experience in software development\n"
        "Skills: Python, Machine Learning, SQL\n"
    )
    extracted = extract_candidate_info(sample_text)
    print(json.dumps(extracted, indent=2))
