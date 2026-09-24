"""
Voice-Based Screening Module for AI Recruitment Copilot
Milestone 4 (Week 8) Evaluation Criteria:
- Voice screening module operational (Speech-to-text + AI interviewer voice)
- SpeechRecognition (for input) and pyttsx3 (for AI interviewer voice output)
"""

import sys
import time
import speech_recognition as sr
import pyttsx3

# Standard interview prompts
DEFAULT_INTERVIEW_PROMPT = (
    "Hello, please introduce yourself and describe your experience with machine learning."
)
DEFAULT_CLOSING_PROMPT = (
    "Thank you. Based on your response, we will proceed to the next round."
)

TECHNICAL_KEYWORDS = [
    "machine learning", "deep learning", "python", "pytorch", "tensorflow",
    "scikit-learn", "nlp", "computer vision", "neural network", "transformer",
    "data science", "aws", "sagemaker", "docker", "kubernetes", "sql", "pipeline",
    "feature engineering", "model training", "hyperparameter", "evaluation"
]


def init_tts_engine(rate=165, volume=0.9):
    """Initialize pyttsx3 text-to-speech engine with safe settings."""
    try:
        engine = pyttsx3.init()
        engine.setProperty("rate", rate)
        engine.setProperty("volume", volume)
        return engine
    except Exception as e:
        print(f"[VoiceScreening] TTS Init Warning: {e}")
        return None


def speak(text, engine=None):
    """Speak text using pyttsx3 engine safely."""
    tts = engine or init_tts_engine()
    if tts:
        try:
            tts.say(text)
            tts.runAndWait()
        except Exception as e:
            print(f"[VoiceScreening] Speech error: {e}")
    else:
        print(f"[AI Interviewer Voice]: {text}")


def evaluate_candidate_response(response_text, required_keywords=None):
    """
    Evaluates candidate's spoken response:
    - Calculates technical keyword coverage
    - Calculates communication fluency & length score
    - Generates hiring suitability score and feedback
    """
    if not response_text:
        return {
            "score": 40.0,
            "fluency_score": 30.0,
            "technical_score": 40.0,
            "detected_keywords": [],
            "status": "Incomplete",
            "feedback": "No response detected or transcription empty.",
            "recommendation": "Reschedule Voice Screening"
        }

    keywords = required_keywords or TECHNICAL_KEYWORDS
    lower_resp = response_text.lower()
    
    detected = [kw for kw in keywords if kw in lower_resp]
    word_count = len(response_text.split())
    
    # Fluency metric based on elaboration
    if word_count < 10:
        fluency_score = 50.0
    elif word_count < 30:
        fluency_score = 75.0
    elif word_count < 80:
        fluency_score = 92.0
    else:
        fluency_score = 96.0

    # Technical depth metric based on keywords
    tech_score = min(100.0, len(detected) * 22.0 + 35.0)
    
    overall_score = round(0.6 * tech_score + 0.4 * fluency_score, 1)
    
    if overall_score >= 80.0:
        rec = "Strong Pass - Proceed to Technical Deep Dive"
        status = "Interview Completed"
    elif overall_score >= 65.0:
        rec = "Pass - Qualified for Hiring Manager Round"
        status = "Interview Completed"
    else:
        rec = "Borderline - Additional Screening Recommended"
        status = "Screened"

    return {
        "score": overall_score,
        "fluency_score": fluency_score,
        "technical_score": tech_score,
        "word_count": word_count,
        "detected_keywords": detected,
        "status": status,
        "feedback": f"Candidate demonstrated {len(detected)} domain keywords with high articulation.",
        "recommendation": rec
    }


def voice_screening(audio_file=None, timeout=5, phrase_time_limit=10, simulate_text=None):
    """
    Step 2: Voice-Based Screening Module
    Operational Speech-to-text + AI interviewer voice using SpeechRecognition & pyttsx3.
    Supports live mic, audio file input, or deterministic simulated mode.
    """
    recognizer = sr.Recognizer()
    engine = init_tts_engine()

    print("\n--- Starting Voice Screening Module ---")
    speak(DEFAULT_INTERVIEW_PROMPT, engine)

    response = ""
    error_message = None

    # Deterministic simulation fallback
    if simulate_text:
        time.sleep(0.5)
        response = simulate_text
        print(f"Candidate Response (Simulated): {response}")
    elif audio_file:
        try:
            with sr.AudioFile(audio_file) as source:
                audio = recognizer.record(source)
            response = recognizer.recognize_google(audio)
            print("Candidate Response:", response)
        except Exception as e:
            error_message = str(e)
            print("Error:", e)
    else:
        try:
            mic = sr.Microphone()
            with mic as source:
                print("Listening... (Speak clearly into your microphone)")
                recognizer.adjust_for_ambient_noise(source, duration=0.6)
                audio = recognizer.listen(source, timeout=timeout, phrase_time_limit=phrase_time_limit)

            print("Processing speech...")
            response = recognizer.recognize_google(audio)
            print("Candidate Response:", response)

        except sr.WaitTimeoutError:
            error_message = "Listening timed out with no speech detected."
            print("Error:", error_message)
        except sr.UnknownValueError:
            error_message = "SpeechRecognition could not understand audio."
            print("Error:", error_message)
        except sr.RequestError as e:
            error_message = f"Speech service unavailable; {e}"
            print("Error:", error_message)
        except Exception as e:
            error_message = str(e)
            print("Error:", e)

    # Closing speech if valid response was recorded
    if response:
        speak(DEFAULT_CLOSING_PROMPT, engine)
    else:
        speak("We encountered an audio reception issue. Please retry.", engine)

    evaluation = evaluate_candidate_response(response)
    
    return {
        "success": bool(response),
        "prompt": DEFAULT_INTERVIEW_PROMPT,
        "candidate_response": response,
        "closing_prompt": DEFAULT_CLOSING_PROMPT,
        "evaluation": evaluation,
        "error": error_message
    }


def simulate_screening(candidate_name="Sarah Johnson", role="Senior Machine Learning Engineer"):
    """Simulation helper for automated testing and UI demonstration."""
    sample_response = (
        "Hello! I am a Machine Learning Engineer with 5 years of experience. "
        "I specialize in building deep learning and NLP models using Python, PyTorch, "
        "and TensorFlow. In my recent role, I deployed ML pipelines on AWS SageMaker and Docker, "
        "optimizing model evaluation and inference latency."
    )
    return voice_screening(simulate_text=sample_response)


if __name__ == "__main__":
    if "--live" in sys.argv:
        print("[Mode: Live Microphone Screening]")
        result = voice_screening()
    else:
        print("[Mode: Demonstration & Automated Verification]")
        result = simulate_screening()

    print("\n================ Screening Result ================")
    print(f"Status: {result['evaluation']['status']}")
    print(f"Score: {result['evaluation']['score']}%")
    print(f"Detected Keywords: {', '.join(result['evaluation']['detected_keywords'])}")
    print(f"Recommendation: {result['evaluation']['recommendation']}")
    print("==================================================")
