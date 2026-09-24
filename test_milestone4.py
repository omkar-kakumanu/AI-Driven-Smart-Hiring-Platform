"""
Unit and Integration Test Suite for Milestone 4 (Week 8)
AI Recruitment Copilot

Validates:
1. Streamlit candidate data caching and satisfaction score >= 85%
2. Voice screening module (Speech-to-Text & AI Voice synthesis)
3. End-to-end recruitment workflow integration
"""

import sys
import unittest
import pandas as pd
from voice_screening import VoiceScreeningEngine, voice_screening
from streamlit_app import load_candidate_data


class TestMilestone4RecruitmentPipeline(unittest.TestCase):

    def setUp(self):
        self.engine = VoiceScreeningEngine()

    def test_voice_screening_evaluation(self):
        """Test candidate speech response scoring for clarity, relevance, and passing status."""
        question = "Hello, please describe your experience with machine learning and Python."
        sample_response = (
            "I have 4 years of experience building machine learning models in Python, "
            "optimizing neural networks, and deploying models using FastAPI and Docker."
        )

        eval_result = self.engine.evaluate_response(question, sample_response)
        
        self.assertIn("clarity", eval_result)
        self.assertIn("relevance", eval_result)
        self.assertIn("overall", eval_result)
        self.assertGreaterEqual(eval_result["overall"], 80)
        self.assertTrue(eval_result["passed"])
        self.assertIn("python", eval_result["matched_keywords"])

    def test_voice_screening_full_execution(self):
        """Test full voice_screening execution with simulated speech input."""
        simulated_input = "I have developed machine learning models using Python and PyTorch for predictive analytics."
        result_dict = voice_screening(simulated_input=simulated_input)

        self.assertTrue(result_dict["result"]["success"])
        self.assertEqual(result_dict["result"]["transcript"], simulated_input)
        self.assertGreaterEqual(result_dict["evaluation"]["overall"], 75)

    def test_streamlit_candidate_data_integrity(self):
        """Test candidate dataset, weighted scoring, and satisfaction rating benchmark >= 85%."""
        candidates = load_candidate_data()
        self.assertIsInstance(candidates, list)
        self.assertGreaterEqual(len(candidates), 3)

        df = pd.DataFrame(candidates)
        self.assertIn("name", df.columns)
        self.assertIn("score", df.columns)
        self.assertIn("status", df.columns)
        self.assertIn("missing_skills", df.columns)
        self.assertIn("satisfaction_rating", df.columns)

        # Milestone 4 Evaluation Criterion: User satisfaction score >= 85%
        avg_satisfaction = df["satisfaction_rating"].mean()
        self.assertGreaterEqual(
            avg_satisfaction, 
            85.0, 
            f"Average user satisfaction {avg_satisfaction}% should be >= 85%"
        )

    def test_end_to_end_workflow(self):
        """Test end-to-end recruitment pipeline flow: Data -> Match -> Voice Screen -> Report."""
        candidates = load_candidate_data()
        top_candidate = max(candidates, key=lambda c: c["score"])

        self.assertGreaterEqual(top_candidate["score"], 85)
        self.assertIn("matched_skills", top_candidate)

        # Voice screening for top candidate
        voice_result = self.engine.evaluate_response(
            question="Tell me about your Python ML experience.",
            response=f"I have extensive experience with {', '.join(top_candidate['matched_skills'])} in enterprise environments."
        )
        self.assertTrue(voice_result["passed"])
        self.assertGreaterEqual(voice_result["overall"], 80)


if __name__ == "__main__":
    unittest.main()
