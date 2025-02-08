import os
import json
from PyPDF2 import PdfReader
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

# Function to extract text from a PDF file
def extract_text_from_pdf(file_path):
    try:
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"The file '{file_path}' does not exist.")
        reader = PdfReader(file_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text()
        return text
    except Exception as e:
        print(f"Error reading PDF: {e}")
        return ""

# Function to extract resume information using Groq API
def extract_resume_info(resume_text):
    # Initialize Groq client
    # Make sure to set your GROQ_API_KEY as an environment variable
    client = Groq(api_key=os.getenv("GROQ_API_KEY"))

    # Detailed prompt for information extraction
    prompt = f"""
    Extract the following structured information from the resume text:

    Guidelines:
    1. Return a JSON object with these keys:
       - job_titles: generate alist of most relevant job titles that can be extracted from the resume for that particular candidate example: ["Full Stack Developer", "Web Developer", "Freelance", "Software Developer", "Content Creator","copywriter", etc]
       - contact_details: (object with name, email, phone, location:object (city/state, country), github_link(or username), linkedin_link(or username), portfolio_link)
       - education: (array of objects with institute, degree, graduation_year, grade(optional))
       - work_experience: (array of objects with company, title, duration in months, responsibilities)
       - skills: (array of skills)
       - projects: (array of objects with name, description(including work done in short and concise), technologies, links (please check once colud be live project link or github link))

    2. Important rules:
       - Use "null" instead of "N/A" for missing values
       - Ensure graduation_year is a number or null
       - Include empty arrays [] for missing links or technologies
       - Be precise and accurate

    Resume Text:
    {resume_text}

    IMPORTANT: Return ONLY a valid JSON object. No additional text or explanations.
    """

    try:
        # Send request to Groq API using Llama model
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert resume parser. Extract structured information precisely and ensure valid JSON output."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            model="llama-3.3-70b-versatile",
            response_format={"type": "json_object"},
            temperature=0.2,
            max_tokens=1500
        )

        # Get the response content
        response_content = chat_completion.choices[0].message.content

        # Parse the JSON response
        resume_info = json.loads(response_content)
        return resume_info

    except json.JSONDecodeError as je:
        print(f"JSON Decode Error: {je}")
        print("Response content:", response_content)
        return None
    except Exception as e:
        print(f"Error extracting resume information: {e}")
        return None

# Function to save resume information to a JSON file
def save_resume_info(resume_info, output_file='resume_parsed_aft.json'):
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(resume_info, f, indent=4)
        print(f"Resume information saved to {output_file}")
    except Exception as e:
        print(f"Error saving resume information: {e}")

def main():
    # PDF file path
    file_path = "resumeaft.pdf"

    # Extract text from PDF
    resume_text = extract_text_from_pdf(file_path)

    if resume_text:
        # Extract structured information
        resume_info = extract_resume_info(resume_text)

        if resume_info:
            # Save to JSON file
            save_resume_info(resume_info)
        else:
            print("Failed to extract resume information.")
    else:
        print("No text extracted from the PDF.")

if __name__ == "__main__":
    main()