import os
import json
import google.generativeai as genai
from pymongo import MongoClient
import dotenv

dotenv.load_dotenv()

# Set up Google Generative AI API
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    raise ValueError("Please set the GOOGLE_API_KEY environment variable")

genai.configure(api_key=GOOGLE_API_KEY)

# MongoDB Configuration
MONGO_URI = os.getenv("MONGO_URI")
DATABASE_NAME = "seekure"
COLLECTION_NAME = "users"

# Function to format resume data for embedding
def format_resume_data(resume_json):
    job_titles = resume_json.get("job_titles", [])
    
    experience = []
    for exp in resume_json.get("work_experience", []):
        title = exp.get("title", "")
        responsibilities = " ".join(exp.get("responsibilities", []))
        experience.append({"title": title, "responsibilities": responsibilities})

    skills = resume_json.get("skills", [])

    projects = []
    for project in resume_json.get("projects", []):
        description = project.get("description", "")
        technologies = project.get("technologies", [])
        projects.append({"description": description, "technologies": technologies})


    return {
        "job_titles": job_titles,
        "skills": skills,
        "experience": experience,
        "projects": projects,
    }

def generate_embeddings(text):
    """
    Generate embeddings for the given text using Google's Generative AI API.
    
    Args:
        text (str): Text for which embeddings need to be generated.
    
    Returns:
        list: Embedding vector.
    """
    model = 'models/embedding-001'  # Specify the correct model
    try:
        response = genai.embed_content(
            model=model,
            content=text,
            task_type="retrieval_document"  # Specify the task type
        )
        return response['embedding']  # Extract the embedding from the response
    except Exception as e:
        print(f"Error generating embeddings: {e}")
        return None


# Function to save data to MongoDB
def save_to_mongodb(data, embedding):
    client = MongoClient(MONGO_URI)
    db = client[DATABASE_NAME]
    collection = db[COLLECTION_NAME]

    document = {
        "name": data["contact_details"]["name"],
        "email": data["contact_details"]["email"],
        "job_titles": data["job_titles"],
        "experience": data["work_experience"],
        "skills": data["skills"],
        "projects": data["projects"],
        "contact_details": data["contact_details"],
        "education": data["education"],
        "embedding": embedding
    }
    collection.insert_one(document)
    print("Data saved to MongoDB successfully.")

# Main Function
def main():
    input_file = "resume_parsed_.json"  # Replace with your JSON file path

    # Load resume data from JSON file
    with open(input_file, "r") as file:
        resume_data = json.load(file)

    # Format resume data
    formatted_data = format_resume_data(resume_data)

    # Generate embeddings
    formatted_text = json.dumps(formatted_data, indent=4)
    embedding = generate_embeddings(formatted_text)

    # Save resume data and embedding to MongoDB
    save_to_mongodb(resume_data, embedding)

if __name__ == "__main__":
    main()
