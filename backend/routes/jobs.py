from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from utils.atlasSearch import search_similar_jobs
from bson import ObjectId
import json
from datetime import datetime, timedelta
from groq import Groq
import os
from models.user import User
from google import generativeai as genai
from google.genai import types
from dotenv import load_dotenv
load_dotenv()

# Initialize Gemini properly
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

from models.user import client, db
jobs_collection = db["jobs"]  # Define jobs_collection

jobs_bp = Blueprint('jobs', __name__)


COVER_LETTER_FORMATS = {
    "standard": """
    Create a professional cover letter following a standard format:
    - Opening paragraph: Introduction and position you're applying for
    - Body paragraphs: Experience and skills relevant to the job
    - Closing paragraph: Thank you and call to action
    - Use bullet points and other formatting options to make it more engaging.
    """,
    
    "modern": """
    Create a modern, engaging cover letter that:
    - Starts with a compelling hook
    - Uses bullet points to highlight key achievements
    - Maintains a conversational yet professional tone
    - Ends with a strong call to action
    """,
    
    "creative": """
    Create a creative, story-telling cover letter that:
    - Opens with a personal anecdote or memorable introduction
    - Weaves skills and experiences into a narrative
    - Shows personality while maintaining professionalism
    - Concludes with an inspiring vision of contribution
    - Use emojis to make it more engaging iff and only if it the format instruction is story based.
    """
}

def parse_date(date_str):
    if not date_str:
        return None
    
    if isinstance(date_str, datetime):
        return date_str
        
    date_formats = [
        '%Y-%m-%d',
        '%Y-%m-%dT%H:%M:%S',
        '%Y-%m-%dT%H:%M:%S.%f',
        '%Y-%m-%d %H:%M:%S'
    ]
    
    for fmt in date_formats:
        try:
            return datetime.strptime(date_str, fmt)
        except ValueError:
            continue
    return None

def serialize_job(job):
    try:
        # Handle date
        date_posted = job.get('date_posted')
        formatted_date = None
        
        if date_posted:
            parsed_date = parse_date(date_posted)
            if parsed_date:
                formatted_date = parsed_date.isoformat()
        
        return {
            'id': str(job.get('_id', '')),
            'title': str(job.get('title', '')),
            'company': str(job.get('company', '')),
            'location': str(job.get('location', '')),
            'description': str(job.get('description', '')),
            'site': str(job.get('site', '')),
            'company_url': str(job.get('company_url', '')),
            'company_logo': str(job.get('company_logo', '')),
            'job_level': str(job.get('job_level', '')),
            'job_type': str(job.get('job_type', '')),
            'job_url': str(job.get('job_url', '')),
            'job_url_direct': str(job.get('job_url_direct', '')),
            'date_posted': formatted_date if formatted_date else '',
            'score': float(job.get('score', 0)) if job.get('score') is not None else 0.0
        }
    except Exception as e:
        print(f"Error serializing job: {e}")
        return {
            'id': str(job.get('_id', '')),
            'title': 'Error loading job details',
            'company': '',
            'date_posted': '',
            'score': 0.0
        }

def serialize_telegram_message(message):
    try:
        date = message.get('date')
        formatted_date = None
        
        if date:
            parsed_date = parse_date(date)
            if parsed_date:
                formatted_date = parsed_date.isoformat()
        
        return {
            'channel': str(message.get('channel', '')),
            'message': str(message.get('message', '')),
            'date': formatted_date if formatted_date else '',
            'url': str(message.get('url', '')),
            'score': float(message.get('score', 0)) if message.get('score') is not None else 0.0
        }
    except Exception as e:
        print(f"Error serializing telegram message: {e}")
        return {
            'channel': '',
            'message': 'Error loading message details',
            'date': '',
            'score': 0.0
        }

@jobs_bp.route('/search', methods=['POST'])
@jwt_required()
def search_jobs():
    try:
        current_user_id = get_jwt_identity()
        filters = request.get_json()
        
        results = search_similar_jobs(current_user_id, filters)
        
        if not isinstance(results, dict):
            print(f"Unexpected results format: {type(results)}")
            return jsonify({'error': 'Invalid results format'}), 500
        
        jobs = []
        telegram_messages = []
        
        # Process jobs
        for job in results.get('jobs', []):
            try:
                serialized_job = serialize_job(job)
                jobs.append(serialized_job)
            except Exception as e:
                print(f"Error processing job: {e}")
                continue
        
        # Process telegram messages
        for msg in results.get('telegram_messages', []):
            try:
                serialized_msg = serialize_telegram_message(msg)
                telegram_messages.append(serialized_msg)
            except Exception as e:
                print(f"Error processing telegram message: {e}")
                continue

        response_data = {
            'jobs': jobs,
            'telegram_messages': telegram_messages
        }
        
        # Debug logging
        # print("Response data structure:", json.dumps(response_data, default=str))
        
        return jsonify(response_data), 200

    except Exception as e:
        print(f"Error searching jobs: {e}")
        return jsonify({
            'error': 'Failed to fetch jobs',
            'details': str(e)
        }), 500

def generate_cover_letter(user_data, job_data, format_type="standard"):
    client = Groq(api_key=os.getenv("GROQ_API_KEY"))
    
    # Convert user_data object to dictionary format expected by the prompt
    user_dict = {
        'contact_details': user_data.contact_details,
        'work_experience': user_data.experience,
        'skills': user_data.skills,
        'projects': user_data.projects
    }
    
    # Prepare user data
    experience_text = "\n".join([
        f"- {exp['title']} at {exp['company']} for {exp['duration_in_months']} months: {exp['responsibilities']}"
        for exp in user_dict.get('work_experience', [])
    ])
    
    skills_text = ", ".join(user_dict.get('skills', []))
    projects_text = "\n".join([
        f"- {project['name']}: {project['description']}"
        for project in user_dict.get('projects', [])
    ])

    # Create the prompt
    prompt = f"""
    Create a cover letter based on the following information:

    JOB DETAILS:
    Title: {job_data.get('title','')}
    Company: {job_data.get('company','')}
    Description: {job_data['description']}

    CANDIDATE DETAILS:
    Contact: {user_dict['contact_details']['name']}
    Experience: {experience_text}
    Skills: {skills_text}
    Projects: {projects_text}

    FORMAT INSTRUCTIONS:
    {COVER_LETTER_FORMATS[format_type]}

    generate shorter but relevant cover letter
    Please format the response in markdown with appropriate tags for styling.
    Include line breaks and paragraphs for readability.
    Make it professional, engaging, and specifically tailored to the job description.
    Return the response in markdown format ONLY.
    """

    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert cover letter writer who creates compelling, personalized cover letters."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.7,
            max_tokens=1500
        )

        return chat_completion.choices[0].message.content

    except Exception as e:
        print(f"Error generating cover letter: {e}")
        return None

@jobs_bp.route('/cover-letter', methods=['POST'])
@jwt_required()
def create_cover_letter():
    try:
        data = request.get_json()
        job_id = data.get('jobId')
        format_type = data.get('format', 'standard')
        current_user_id = get_jwt_identity()

        # Fetch user data
        user = User.get_by_id(current_user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404

        # Fetch job data
        job = jobs_collection.find_one({'_id': ObjectId(job_id)})
        if not job:
            return jsonify({'error': 'Job not found'}), 404

        # Generate cover letter
        cover_letter = generate_cover_letter(user, job, format_type)
        if not cover_letter:
            return jsonify({'error': 'Failed to generate cover letter'}), 500

        return jsonify({
            'coverLetter': cover_letter,
            'format': format_type
        }), 200

    except Exception as e:
        print(f"Error in cover letter generation: {e}")
        return jsonify({'error': 'Failed to generate cover letter'}), 500

def analyze_resume_ats(user_data, job_data):
    client = Groq(api_key=os.getenv("GROQ_API_KEY"))
    
    # Convert user_data object to dictionary format
    user_dict = {
        'contact_details': {
            'name': user_data.name,
            'email': user_data.email
        },
        'work_experience': user_data.experience,
        'skills': user_data.skills,
        'projects': user_data.projects,
        'education': user_data.education,
        'job_titles': user_data.job_titles
    }
    
    # Prepare user data for analysis
    experience_text = "\n".join([
        f"- {exp['title']} at {exp['company']} ({exp['duration_in_months']} months): {exp['responsibilities']}"
        for exp in user_dict.get('work_experience', [])
    ])
    
    skills_text = ", ".join(user_dict.get('skills', []))
    projects_text = "\n".join([
        f"- {project['name']}: {project['description']}"
        for project in user_dict.get('projects', [])
    ])
    
    education_text = "\n".join([
        f"- {edu.get('degree', 'Degree')} from {edu.get('institute', 'Institute')} ({edu.get('graduation_year', 'Year')})"
        for edu in user_dict.get('education', [])
    ])

    prompt = f"""
    Analyze this resume against the job description for ATS optimization.

    JOB DETAILS:
    Title: {job_data.get('title','')}
    Company: {job_data.get('company','')}
    Description: {job_data['description']}

    CANDIDATE'S RESUME:
    Contact: {user_dict['contact_details']['name']}
    Current Job Titles: {', '.join(user_dict['job_titles'])}
    
    Education:
    {education_text}
    
    Experience:
    {experience_text}
    
    Skills: {skills_text}
    
    Projects:
    {projects_text}

    Please provide a detailed ATS analysis in markdown format covering:
    1. Overall ATS Score (0-100)
    2. Keyword Match Analysis
       - Required keywords found
       - Missing important keywords
       - Keyword frequency
    3. Experience Match
       - Relevance of experience
       - Years of experience match
    4. Skills Assessment
       - Technical skills match
       - Soft skills match
    5. Specific Recommendations
       - Keywords to add
       - Phrases to modify
       - Format improvements
    6. Section-by-Section Analysis
       - Experience section
       - Skills section
       - Education section
    7. Resume Enhancement Tips
       - Action verbs to use
       - Industry-specific terminology
       - Format optimization

    Format the response in clean markdown with clear sections and bullet points.
    Focus on actionable improvements and specific examples.
    """

    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert ATS analyzer with deep knowledge of resume optimization and recruitment software."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.5,
            max_tokens=2000
        )

        return chat_completion.choices[0].message.content

    except Exception as e:
        print(f"Error analyzing resume: {e}")
        return None

@jobs_bp.route('/analyze-ats', methods=['POST'])
@jwt_required()
def analyze_resume():
    try:
        data = request.get_json()
        job_id = data.get('jobId')
        current_user_id = get_jwt_identity()

        # Fetch user data
        user = User.get_by_id(current_user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404

        # Fetch job data
        job = jobs_collection.find_one({'_id': ObjectId(job_id)})
        if not job:
            return jsonify({'error': 'Job not found'}), 404

        # Generate ATS analysis
        analysis = analyze_resume_ats(user, job)
        if not analysis:
            return jsonify({'error': 'Failed to analyze resume'}), 500

        return jsonify({
            'analysis': analysis
        }), 200

    except Exception as e:
        print(f"Error in ATS analysis: {e}")
        return jsonify({'error': 'Failed to analyze resume'}), 500

@jobs_bp.route('/analyze-ats-custom', methods=['POST'])
@jwt_required()
def analyze_resume_custom():
    try:
        data = request.get_json()
        job_data = data.get('job')
        current_user_id = get_jwt_identity()

        if not job_data:
            return jsonify({'error': 'Job data is required'}), 400

        # Fetch user data
        user = User.get_by_id(current_user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404

        # Generate ATS analysis
        analysis = analyze_resume_ats(user, job_data)
        if not analysis:
            return jsonify({'error': 'Failed to analyze resume'}), 500

        return jsonify({
            'analysis': analysis
        }), 200

    except Exception as e:
        print(f"Error in ATS analysis: {e}")
        return jsonify({'error': 'Failed to analyze resume'}), 500

@jobs_bp.route('/generate-cover-letter-custom', methods=['POST'])
@jwt_required()
def create_cover_letter_custom():
    try:
        data = request.get_json()
        job_data = data.get('job')
        format_type = data.get('format', 'standard')
        current_user_id = get_jwt_identity()

        if not job_data:
            return jsonify({'error': 'Job data is required'}), 400

        # Fetch user data
        user = User.get_by_id(current_user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404

        # Generate cover letter
        cover_letter = generate_cover_letter(user, job_data, format_type)
        if not cover_letter:
            return jsonify({'error': 'Failed to generate cover letter'}), 500

        return jsonify({
            'coverLetter': cover_letter,
            'format': format_type
        }), 200

    except Exception as e:
        print(f"Error in cover letter generation: {e}")
        return jsonify({'error': 'Failed to generate cover letter'}), 500


@jobs_bp.route('/ai-search', methods=['POST'])
@jwt_required()
def ai_search():
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        user_query = data.get('query')

        if not user_query:
            return jsonify({'error': 'Query is required'}), 400

        # Update the prompt to avoid f-string formatting issues
        prompt = """
        Convert this job search query into filters. Return ONLY a valid JSON object with no additional text.
        Query: "{0}"
        
        Available filters:
        - jobType: ["fulltime", "part-time", "internship"]
        - workMode: ["remote", "hybrid", "on-site"]
        - experience: ["entry", "mid-senior"]
        - location: string (city name)
        - datePosted: ["today", "week", "month", "all"]
        - original_query: extract the job title from the query
        
        Example format:
        {{
            "workMode": ["remote"],
            "location": "New York"
        }}
        
        If no specific filters are mentioned, return an empty object: {{}}
        """.format(user_query)
        
        # Generate response from Gemini - fix the API call
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(prompt)
        response_text = response.text.strip()
        
        print("Raw Gemini response:", response_text)  # Debug log
        
        try:
            # Remove any markdown formatting and get just the JSON object
            if "```json" in response_text:
                json_str = response_text.split("```json")[1].split("```")[0].strip()
            elif "```" in response_text:
                json_str = response_text.split("```")[1].split("```")[0].strip()
            else:
                # Find the first { and last }
                start = response_text.find('{')
                end = response_text.rfind('}')
                if start != -1 and end != -1:
                    json_str = response_text[start:end+1]
                else:
                    json_str = "{}"
            
            # Clean the JSON string
            json_str = json_str.strip()
            
            # Parse the JSON
            filters = json.loads(json_str)
            
            # Add original query
            
            print("Parsed filters:", filters)  # Debug log
            
            # Use existing search function
            results = search_similar_jobs(current_user_id, filters)
            
            # Process results
            processed_jobs = [serialize_job(job) for job in results.get('jobs', [])]
            
            return jsonify({
                'jobs': processed_jobs,
                'appliedFilters': filters
            }), 200
            
        except json.JSONDecodeError as e:
            print(f"JSON parsing error: {e}")
            print(f"Attempted to parse: {json_str}")
            # Fallback to basic search
            fallback_filters = {'original_query': user_query}
            results = search_similar_jobs(current_user_id, fallback_filters)
            processed_jobs = [serialize_job(job) for job in results.get('jobs', [])]
            
            return jsonify({
                'jobs': processed_jobs,
                'appliedFilters': fallback_filters
            }), 200
            
    except Exception as e:
        print(f"Error in AI search: {e}")
        # Fallback to basic search
        fallback_filters = {'original_query': user_query}
        try:
            results = search_similar_jobs(current_user_id, fallback_filters)
            processed_jobs = [serialize_job(job) for job in results.get('jobs', [])]
            
            return jsonify({
                'jobs': processed_jobs,
                'appliedFilters': fallback_filters
            }), 200
        except:
            return jsonify({
                'jobs': [],
                'appliedFilters': fallback_filters
            }), 200