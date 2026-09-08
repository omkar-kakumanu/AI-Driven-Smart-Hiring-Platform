import pandas as pd
import re
from typing import Dict, Any, List, Tuple

# Domain skill mappings for semantic/NLP skill matching
SKILL_ALIASES = {
    "ml": "Machine Learning",
    "machine learning": "Machine Learning",
    "tf": "TensorFlow",
    "tensorflow": "TensorFlow",
    "aws sagemaker": "AWS SageMaker",
    "sagemaker": "AWS SageMaker",
    "k8s": "Kubernetes",
    "kubernetes": "Kubernetes",
    "py": "Python",
    "python": "Python",
    "postgres": "PostgreSQL",
    "postgresql": "PostgreSQL",
    "sql": "SQL",
    "js": "JavaScript",
    "javascript": "JavaScript",
    "ts": "TypeScript",
    "typescript": "TypeScript"
}

SKILL_SIMILARITIES = {
    ("machine learning", "tensorflow"): 0.8,
    ("machine learning", "aws sagemaker"): 0.75,
    ("data analysis", "sql"): 0.7,
    ("python", "machine learning"): 0.8,
    ("docker", "kubernetes"): 0.85
}

def calculate_match(candidate: Dict[str, Any], job: Dict[str, Any], use_semantic: bool = False) -> Tuple[float, List[str]]:
    """
    Calculates weighted compatibility score based on:
    - Skill matching (weight 0.6)
    - Experience matching (weight 0.25)
    - Education matching (weight 0.15)
    
    If use_semantic is True, uses semantic/domain skill similarity to detect related capabilities.
    Returns (hiring_score_pct, matched_skills_list)
    """
    score = 0.0
    total_weight = 0.0

    # 1. Skill matching (weight 0.6)
    req_skills = job.get("required_skills") or job.get("requiredSkills") or []
    cand_skills = candidate.get("skills") or []

    # Normalize skill names
    req_skills_map = {s.strip().lower(): s.strip() for s in req_skills if s}
    cand_skills_set = {s.strip().lower() for s in cand_skills if s}

    matched_keys = set(req_skills_map.keys()).intersection(cand_skills_set)
    matched_skills = [req_skills_map[k] for k in matched_keys]

    if req_skills:
        exact_ratio = len(matched_keys) / len(req_skills)
        if use_semantic and exact_ratio < 1.0:
            # Semantic boost for domain-related skills
            unmatched_reqs = set(req_skills_map.keys()) - matched_keys
            semantic_credit = 0.0
            for req_k in unmatched_reqs:
                for cand_k in cand_skills_set:
                    sim = SKILL_SIMILARITIES.get((cand_k, req_k)) or SKILL_SIMILARITIES.get((req_k, cand_k)) or 0.0
                    if sim > 0.5:
                        semantic_credit += sim * 0.5
                        if req_skills_map[req_k] not in matched_skills:
                            matched_skills.append(req_skills_map[req_k])
                        break
            skill_score = min(1.0, exact_ratio + (semantic_credit / len(req_skills)))
        else:
            skill_score = exact_ratio
    else:
        skill_score = 1.0

    score += skill_score * 0.6
    total_weight += 0.6

    # 2. Experience matching (weight 0.25)
    cand_exp = float(candidate.get("experience") or candidate.get("totalExperienceYears") or candidate.get("experience_years") or 0)
    job_req_exp = float(job.get("experience_required") or job.get("minExperienceYears") or job.get("experience_years") or 1)

    exp_score = min(cand_exp / max(job_req_exp, 1.0), 1.0)
    score += exp_score * 0.25
    total_weight += 0.25

    # 3. Education matching (weight 0.15)
    cand_edu = str(candidate.get("education") or candidate.get("degree") or "").strip().lower()
    job_req_edu = str(job.get("education_required") or job.get("educationRequirement") or "").strip().lower()

    if cand_edu == job_req_edu:
        edu_score = 1.0
    elif any(degree in cand_edu for degree in ["ms", "master", "bs", "bachelor", "phd"]) and any(degree in job_req_edu for degree in ["ms", "master", "bs", "bachelor", "phd"]):
        if ("ms" in cand_edu or "master" in cand_edu) and ("ms" in job_req_edu or "master" in job_req_edu):
            edu_score = 1.0
        elif ("bs" in cand_edu or "bachelor" in cand_edu) and ("bs" in job_req_edu or "bachelor" in job_req_edu):
            edu_score = 1.0
        else:
            edu_score = 0.75
    else:
        edu_score = 0.5 if cand_edu else 0.0

    score += edu_score * 0.15
    total_weight += 0.15

    # Final hiring score (0–100)
    hiring_score = round((score / total_weight) * 100, 2)
    return hiring_score, matched_skills


def skill_gap_analysis(candidate: Dict[str, Any], job: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generates structured skill gap analysis report including:
    - Matched skills
    - Missing required skills
    - Actionable learning recommendations
    """
    hiring_score, matched_skills = calculate_match(candidate, job)

    req_skills = job.get("required_skills") or job.get("requiredSkills") or []
    cand_skills = candidate.get("skills") or []

    req_skills_map = {s.strip().lower(): s.strip() for s in req_skills if s}
    cand_skills_set = {s.strip().lower() for s in cand_skills if s}

    missing_keys = set(req_skills_map.keys()) - cand_skills_set
    missing_skills = [req_skills_map[k] for k in missing_keys]

    cand_name = candidate.get("name") or candidate.get("fullName") or "Candidate"
    job_title = job.get("title") or "Target Position"

    report = {
        "candidate": cand_name,
        "job_title": job_title,
        "hiring_score": hiring_score,
        "matched_skills": list(matched_skills),
        "missing_skills": list(missing_skills),
        "recommendations": [f"Consider training in {skill}" for skill in missing_skills]
    }

    return report


def process_batch_matching(candidates_list: List[Dict[str, Any]], jobs_list: List[Dict[str, Any]]) -> pd.DataFrame:
    """
    Performs batch cross-matching across multiple candidates and job positions,
    returning a structured pandas DataFrame.
    """
    records = []

    for cand in candidates_list:
        for job in jobs_list:
            score, matched = calculate_match(cand, job)
            report = skill_gap_analysis(cand, job)
            records.append({
                "Candidate Name": cand.get("name") or cand.get("fullName"),
                "Job Title": job.get("title"),
                "Hiring Score (%)": score,
                "Matched Count": len(matched),
                "Missing Count": len(report["missing_skills"]),
                "Matched Skills": ", ".join(matched),
                "Missing Skills": ", ".join(report["missing_skills"])
            })

    df = pd.DataFrame(records)
    return df


def extract_profile_from_text(raw_text: str) -> Dict[str, Any]:
    """
    Extracts skills, experience years, and education level from raw text via NLP/regex.
    """
    skills_catalog = [
        "Python", "Java", "C++", "JavaScript", "TypeScript", "React", "Node.js",
        "Machine Learning", "TensorFlow", "PyTorch", "SQL", "PostgreSQL",
        "Docker", "Kubernetes", "AWS", "AWS SageMaker", "Data Analysis", "NLP"
    ]

    found_skills = []
    text_lower = raw_text.lower()

    for skill in skills_catalog:
        pattern = r'\b' + re.escape(skill.lower()) + r'\b'
        if re.search(pattern, text_lower):
            found_skills.append(skill)

    # Experience extraction
    exp_match = re.search(r'(\d+)\+?\s*(?:years?|yrs?)\s*(?:of\s*)?(?:experience|exp)?', text_lower)
    exp_years = int(exp_match.group(1)) if exp_match else 3

    # Education extraction
    edu = "BS Computer Science"
    if "master" in text_lower or "ms" in text_lower or "m.s." in text_lower:
        edu = "MS Computer Science"
    elif "phd" in text_lower or "doctorate" in text_lower:
        edu = "PhD Computer Science"

    return {
        "skills": found_skills,
        "experience": exp_years,
        "education": edu
    }


def extract_profile_from_text_nlp(raw_text: str) -> Dict[str, Any]:
    """
    AI-powered NLP & Entity Extractor:
    Dynamically extracts skills, experience years, and degree level from raw text (resumes or job descriptions).
    Supports catalog regex, spaCy NER, and keyword boundary extraction.
    """
    extracted = extract_profile_from_text(raw_text)

    # Add spaCy enhancement if available without blocking
    try:
        import spacy
        try:
            nlp = spacy.load("en_core_web_sm")
            doc = nlp(raw_text[:2000])
            for ent in doc.ents:
                if ent.label_ in ["ORG", "PRODUCT"] and ent.text in ["AWS", "TensorFlow", "Kubernetes", "Docker", "PyTorch"]:
                    if ent.text not in extracted["skills"]:
                        extracted["skills"].append(ent.text)
        except Exception:
            pass
    except Exception:
        pass

    return extracted


