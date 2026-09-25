import os
import pandas as pd

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
REPORTS_DIR = os.path.join(BASE_DIR, "reports")
os.makedirs(REPORTS_DIR, exist_ok=True)

# -------------------------------
# Step 1: Candidate & Job Profiles
# -------------------------------
candidates = [
    {"name": "Sarah Johnson", "skills": ["Python", "Machine Learning", "TensorFlow", "SQL", "Data Analysis"], "experience": 5, "education": "MS Computer Science"},
    {"name": "David Lee", "skills": ["Java", "Spring", "AWS", "SQL"], "experience": 4, "education": "BS Computer Science"},
    {"name": "Priya Sharma", "skills": ["Python", "SQL", "AWS", "Kubernetes"], "experience": 3, "education": "MS Computer Science"}
]

jobs = [
    {"title": "Senior Machine Learning Engineer", "required_skills": ["Python", "TensorFlow", "Kubernetes", "AWS SageMaker", "SQL"], "experience_required": 4, "education_required": "MS Computer Science"},
    {"title": "Backend Developer", "required_skills": ["Java", "Spring", "SQL", "AWS"], "experience_required": 3, "education_required": "BS Computer Science"}
]

# -------------------------------
# Step 2: Matching & Hiring Score
# -------------------------------
def calculate_match(candidate, job):
    required_skills = set(job["required_skills"])
    candidate_skills = set(candidate["skills"])
    matched_skills = required_skills.intersection(candidate_skills)

    # Skill score (weight 0.6)
    skill_match_pct = round((len(matched_skills) / len(required_skills)) * 100, 2) if required_skills else 100.0
    skill_score = len(matched_skills) / len(required_skills) if required_skills else 1.0
    # Experience score (weight 0.25)
    exp_score = min(candidate["experience"] / job["experience_required"], 1.0)
    # Education score (weight 0.15)
    edu_score = 1.0 if candidate["education"] == job["education_required"] else 0.0

    # Weighted hiring score
    hiring_score = round((skill_score * 0.6 + exp_score * 0.25 + edu_score * 0.15) * 100, 2)
    return hiring_score, skill_match_pct, matched_skills

# -------------------------------
# Step 3: Skill-Gap Analysis
# -------------------------------
def skill_gap_analysis(candidate, job):
    required_skills = set(job["required_skills"])
    candidate_skills = set(candidate["skills"])
    missing_skills = required_skills - candidate_skills
    return list(missing_skills)

# -------------------------------
# Step 4: Build DataFrame & Ranking System
# -------------------------------
def run_batch_pipeline():
    results = []

    for candidate in candidates:
        for job in jobs:
            hiring_score, skill_match_pct, matched_skills = calculate_match(candidate, job)
            missing_skills = skill_gap_analysis(candidate, job)

            # Benchmark Logic: >=85% Qualified vs <85% Alert
            if skill_match_pct >= 85.0:
                benchmark_status = f"QUALIFIED ({skill_match_pct}% >= 85%)"
                alert_flag = "None (Meets >=85% Target)"
            else:
                benchmark_status = f"ALERT ({skill_match_pct}% < 85%)"
                alert_flag = f"ALERT: Skill match {skill_match_pct}% is below 85% benchmark. Upskilling recommended in: {', '.join(missing_skills) if missing_skills else 'Advanced Topics'}"

            results.append({
                "Candidate": candidate["name"],
                "Job Title": job["title"],
                "Skill Match (%)": skill_match_pct,
                "Hiring Score (%)": hiring_score,
                "Benchmark Status": benchmark_status,
                "Alert": alert_flag,
                "Matched Skills": ", ".join(matched_skills),
                "Missing Skills": ", ".join(missing_skills)
            })

    df = pd.DataFrame(results)

    # Dynamic Candidate Ranking per Job Title (sorted by score descending)
    df = df.sort_values(by=["Job Title", "Hiring Score (%)", "Skill Match (%)"], ascending=[True, False, False]).reset_index(drop=True)
    df["Rank"] = df.groupby("Job Title").cumcount() + 1
    df["Rank"] = df["Rank"].apply(lambda r: f"#{r}")

    # Reorder columns with Rank first
    column_order = [
        "Rank", "Candidate", "Job Title", "Skill Match (%)",
        "Hiring Score (%)", "Benchmark Status", "Alert", "Matched Skills", "Missing Skills"
    ]
    df = df[column_order]

    # -------------------------------
    # Step 5: Export Results
    # -------------------------------
    print("=" * 100)
    print("AI CANDIDATE RANKING & 85% BENCHMARK EVALUATION REPORT")
    print("=" * 100)
    print(df.to_string(index=False))
    print("=" * 100)
    
    csv_path = os.path.join(REPORTS_DIR, "matching_results.csv")
    xlsx_path = os.path.join(REPORTS_DIR, "matching_results.xlsx")
    
    df.to_csv(csv_path, index=False)
    
    try:
        df.to_excel(xlsx_path, index=False)
        print(f"\nSuccessfully exported {csv_path} and {xlsx_path}!")
    except Exception as e:
        print(f"\nSuccessfully exported {csv_path}! (Excel export notice: {e})")

    return df

if __name__ == "__main__":
    run_batch_pipeline()
