import pandas as pd

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
    skill_score = len(matched_skills) / len(required_skills)
    # Experience score (weight 0.25)
    exp_score = min(candidate["experience"] / job["experience_required"], 1.0)
    # Education score (weight 0.15)
    edu_score = 1.0 if candidate["education"] == job["education_required"] else 0.0

    # Weighted hiring score
    hiring_score = round((skill_score * 0.6 + exp_score * 0.25 + edu_score * 0.15) * 100, 2)
    return hiring_score, matched_skills

# -------------------------------
# Step 3: Skill-Gap Analysis
# -------------------------------
def skill_gap_analysis(candidate, job):
    required_skills = set(job["required_skills"])
    candidate_skills = set(candidate["skills"])
    missing_skills = required_skills - candidate_skills
    return list(missing_skills)

# -------------------------------
# Step 4: Build DataFrame
# -------------------------------
def run_batch_pipeline():
    results = []

    for candidate in candidates:
        for job in jobs:
            hiring_score, matched_skills = calculate_match(candidate, job)
            missing_skills = skill_gap_analysis(candidate, job)

            results.append({
                "Candidate": candidate["name"],
                "Job Title": job["title"],
                "Hiring Score (%)": hiring_score,
                "Matched Skills": ", ".join(matched_skills),
                "Missing Skills": ", ".join(missing_skills)
            })

    df = pd.DataFrame(results)

    # -------------------------------
    # Step 5: Export Results
    # -------------------------------
    print(df.to_string(index=False))
    
    df.to_csv("matching_results.csv", index=False)
    
    try:
        df.to_excel("matching_results.xlsx", index=False)
        print("\nSuccessfully exported matching_results.csv and matching_results.xlsx!")
    except Exception as e:
        print(f"\nSuccessfully exported matching_results.csv! (Excel export notice: {e})")

    return df

if __name__ == "__main__":
    run_batch_pipeline()
