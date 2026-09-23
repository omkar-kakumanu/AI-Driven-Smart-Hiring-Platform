import json
import pymupdf as fitz
from resume_parser import extract_candidate_info, generate_profile

ABHISHEK_TEXT = """
ABHISHEK
AI/ML ENGINEERING STUDENT
Building intelligent solutions for a better tomorrow

+91 8179171254
abhishek@gmail.com
linkedin.com/in/abhishek
github.com/abhishek
Hyderabad, India

ABOUT ME
Self-motivated B.Tech student specializing in AI & ML, passionate about building innovative solutions using technology. Interested in machine learning, full-stack development, cloud & cybersecurity. Eager to learn, contribute and grow in a challenging environment.

EDUCATION
B.Tech - AI & Machine Learning
Malla Reddy University (MR)
Hyderabad, India
2025 - 2029
CGPA: 8.4 / 10 (till 2nd year)

Intermediate (12th)
State Board
Percentage: 92%
2023 - 2025

SSC (10th)
State Board
Percentage: 95%
2021 - 2023

INTERNSHIP EXPERIENCE
Full Stack Developer Intern - CODEC
May 2025 - Jun 2025
- Developed responsive web applications using React, Node.js and MongoDB.
- Worked on real-time features and collaborated with the development team.
- Gained hands-on experience in full-stack development and deployment.

PROJECTS
Tripzy - AI Tour Planner
Mar 2025 - Apr 2025
- Built an AI-powered travel planner for India with personalized itineraries.
- Features: voice assistant, multi-language (22+ Indian languages), dark mode.
- Tech Stack: React Native | Node.js | Firebase | APIs

AI-Generated Image Detection
Jan 2025 - Feb 2025
- Developed a model to detect AI-generated images using deep learning techniques.
- Tech Stack: Python | TensorFlow | Streamlit

TECHNICAL SKILLS
Programming Languages
Python | Java | JavaScript

Web Development
HTML | CSS | React | Node.js

AI/ML & Data Science
Machine Learning | Deep Learning | GenAI | LLMs | Data Analysis

Cloud & DevOps
AWS | Google Cloud | Docker

Databases
MySQL | PostgreSQL | BigQuery

Tools & Others
Git | GitHub | VS Code | Linux | Jupyter Notebook | Firebase

CERTIFICATIONS
- AWS Cloud Foundation - AWS
- AWS Cloud Cybersecurity - AWS
- Google Cloud Computing - Google Cloud
- Full Stack Development - CODEC (Internship Certificate)
- ICAC Recognized Certification

ACHIEVEMENTS & EXTRACURRICULARS
- IGNITE 2K26 - 2nd Prize
- Participated in SIH (Smart India Hackathon)
- Google Developers Event - Srinidhi Institute of Technology
"""

def test_abhishek():
    info = extract_candidate_info(ABHISHEK_TEXT)
    print("Parsed Candidate Info:")
    print(json.dumps(info, indent=2))
    df = generate_profile(info)
    print("\nDataFrame Profile:")
    print(df)

if __name__ == "__main__":
    test_abhishek()
