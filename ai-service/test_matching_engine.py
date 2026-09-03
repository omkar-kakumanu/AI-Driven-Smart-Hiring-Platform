import sys
import pandas as pd
from matching_engine import calculate_match, skill_gap_analysis, process_batch_matching, extract_profile_from_text, extract_profile_from_text_nlp

def test_matching_pipeline():
    print("==================================================")
    print("Testing Milestone 2: Candidate-Job Matching Engine")
    print("==================================================\n")

    # Step 1: Define Candidate & Job Profiles
    candidate = {
        "name": "Sarah Johnson",
        "skills": ["Python", "Machine Learning", "TensorFlow", "SQL", "Data Analysis"],
        "experience": 5,
        "education": "MS Computer Science"
    }

    job = {
        "title": "Senior Machine Learning Engineer",
        "required_skills": ["Python", "TensorFlow", "Kubernetes", "AWS SageMaker", "SQL"],
        "experience_required": 4,
        "education_required": "MS Computer Science"
    }

    # Step 2 & 3: Matching Engine & Skill-Gap Analysis
    hiring_score, matched_skills = calculate_match(candidate, job)
    report = skill_gap_analysis(candidate, job)

    print(f"Candidate: {candidate['name']}")
    print(f"Job: {job['title']}")
    print(f"Hiring Score: {hiring_score}%")
    print(f"Matched Skills: {set(matched_skills)}")
    print("Skill Gap Report:", report)
    print()

    # Step 4: Verification Asserts
    assert hiring_score == 76.0, f"Expected hiring score 76.0%, got {hiring_score}%"
    assert set(matched_skills) == {"Python", "TensorFlow", "SQL"}, f"Unexpected matched skills: {matched_skills}"
    assert set(report["missing_skills"]) == {"AWS SageMaker", "Kubernetes"}, f"Unexpected missing skills: {report['missing_skills']}"
    assert len(report["recommendations"]) == 2, "Expected 2 training recommendations"

    # Step 5: Test Batch Matching in Pandas DataFrame
    candidates_list = [
        candidate,
        {
            "name": "Alex Chen",
            "skills": ["Python", "Java", "Docker", "Kubernetes", "SQL"],
            "experience": 3,
            "education": "BS Computer Science"
        }
    ]

    jobs_list = [
        job,
        {
            "title": "Backend Java Specialist",
            "required_skills": ["Java", "SQL", "Docker"],
            "experience_required": 2,
            "education_required": "BS Computer Science"
        }
    ]

    df_report = process_batch_matching(candidates_list, jobs_list)
    print("==================================================")
    print("Batch Matching Pandas DataFrame Summary:")
    print("==================================================")
    print(df_report.to_string(index=False))
    print()

    assert isinstance(df_report, pd.DataFrame), "Result must be a pandas DataFrame"
    assert len(df_report) == 4, "Expected 4 candidate-job combination rows"

    # Step 6: Test NLP Dynamic Profile Extraction from Text
    raw_resume = """
    Experienced Software Engineer with 6 years of experience in Python, Machine Learning, TensorFlow, and AWS.
    Holds a Master of Science degree in Computer Science.
    """
    extracted = extract_profile_from_text(raw_resume)
    extracted_nlp = extract_profile_from_text_nlp(raw_resume)
    print("==================================================")
    print("NLP Auto-Extracted Profile from Raw Resume Text:")
    print(extracted_nlp)
    print("==================================================")

    assert "Python" in extracted["skills"], "Expected Python in extracted skills"
    assert extracted["experience"] == 6, f"Expected 6 years exp, got {extracted['experience']}"
    assert "Python" in extracted_nlp["skills"], "Expected Python in NLP extracted skills"

    print("\n[SUCCESS] All Milestone 2 Matching Engine tests PASSED successfully!")

if __name__ == "__main__":
    test_matching_pipeline()

