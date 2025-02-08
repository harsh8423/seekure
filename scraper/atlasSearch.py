from pymongo import MongoClient
import numpy as np
import datetime
import os
import json
import csv
import pandas as pd
from datetime import datetime
from bson import ObjectId

# MongoDB connection setup
client = MongoClient("mongodb+srv://harsh8423:8423047004@cluster0.1xbklyu.mongodb.net/seekure")
db = client["seekure"]
jobs_collection = db["jobs_with_embeddings"]
users_collection = db["users"]
telegram_messages_collection = db["telegram_jobs"]

def get_user_data(user_id):
    """
    Fetch user data including skills, job titles, and preferences.
    
    Args:
        user_id (str): ID of the user
        
    Returns:
        dict: User's data including skills, job titles, and preferences
    """
    try:
        user = users_collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise ValueError("User not found")
        
        return {
            "skills": user.get("skills", []),
            "job_titles": user.get("job_titles", []),
            "preferences": user.get("preferences", {})
        }
    except Exception as e:
        print(f"Error fetching user data: {e}")
        return None

def search_similar_jobs(user_id, top_k=5):
    """
    Perform Atlas Search to find relevant job postings based on user preferences.

    Args:
        user_id (str): User's ID
        top_k (int): Number of top results to retrieve.

    Returns:
        dict: Dictionary containing job results and telegram results
    """
    try:
        # Get user data
        user_data = get_user_data(user_id)
        if not user_data:
            return {"jobs": [], "telegram_messages": []}

        # Extract search parameters
        skills = user_data["skills"]
        job_titles = user_data["job_titles"]
        preferences = user_data["preferences"]

        # Prepare search queries
        skills_query = " ".join(skills) if skills else ""
        job_titles_query = " ".join(job_titles) if job_titles else ""

        # Build job search pipeline
        job_pipeline = [
            {
                "$search": {
                    "compound": {
                        "should": [
                            {
                                "text": {
                                    "query": skills_query,
                                    "path": ["description", "title"],
                                    "fuzzy": {
                                        "maxEdits": 1,
                                        "prefixLength": 0
                                    }
                                }
                            },
                            {
                                "text": {
                                    "query": job_titles_query,
                                    "path": "title",
                                    "score": { "boost": { "value": 2 } }
                                }
                            }
                        ],
                        "minimumShouldMatch": 1
                    }
                }
            },
            {
                "$limit": top_k
            },
            {
                "$project": {
                    "title": 1,
                    "company": 1,
                    "location": 1,
                    "description": 1,
                    "site": 1,
                    'company_url': 1,
                    'company_logo': 1,
                    'job_level': 1,
                    "job_type": 1,
                    'job_url': 1,
                    'job_url_direct': 1,
                    'date_posted': 1,
                    "id": 1,
                    "score": { "$meta": "searchScore" }
                }
            }
        ]

        # Execute job search
        job_results = list(jobs_collection.aggregate(job_pipeline))

        # Handle Telegram search if enabled in preferences
        telegram_results = []
        if user_data:
            telegram_channels = preferences.get("telegramChannels", [])
            if telegram_channels:
                channel_usernames = [channel["username"].replace("@", "") for channel in telegram_channels]
                print(channel_usernames)
                telegram_pipeline = [
                    {
                        "$search": {
                            "compound": {
                                "must": [
                                    {
                                        "text": {
                                            "query": channel_usernames,
                                            "path": "channel"
                                        }
                                    }
                                ],
                                "should": [
                                    {
                                        "text": {
                                            "query": job_titles_query,
                                            "path": "message"
                                        }
                                    },
                                    {
                                        "text": {
                                            "query": skills_query,
                                            "path": "message"
                                        }
                                    }
                                ],
                                "minimumShouldMatch": 1
                            }
                        }
                    },
                    {
                        "$limit": top_k
                    },
                    {
                        "$project": {
                            "channel": 1,
                            "message": 1,
                            "date": 1,
                            "score": { "$meta": "searchScore" }
                        }
                    }
                ]
                
                telegram_results = list(telegram_messages_collection.aggregate(telegram_pipeline))

        return {
            "jobs": job_results,
            "telegram_messages": telegram_results
        }

    except Exception as e:
        print(f"Error during Atlas search: {e}")
        return {"jobs": [], "telegram_messages": []}

def save_results_to_files(results, user_id):
    """
    Save job search results to both JSON and CSV files.
    
    Args:
        results (dict): Dictionary containing job and telegram results
        user_id (str): User's ID for filename
    """
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_dir = "job_search_results"
    os.makedirs(output_dir, exist_ok=True)

    # Prepare data for saving
    jobs_data = []
    for job in results.get("jobs", []):
        job_dict = {
            'title': job.get('title', 'N/A'),
            'company': job.get('company', 'N/A'),
            'location': job.get('location', 'N/A'),
            'description': job.get('description', 'N/A'),
            'site': job.get('site', 'N/A'),
            # 'posted_date': job.get('date_posted', 'N/A'),
            'job_type': job.get('job_type', 'N/A'),
            'id': job.get('id', 'N/A'),
            'search_score': job.get('score', 'N/A')
        }
        jobs_data.append(job_dict)

    # Save as JSON
    json_filename = f"{output_dir}/job_results_{user_id}_{timestamp}.json"
    with open(json_filename, 'w', encoding='utf-8') as f:
        json.dump({
            "jobs": jobs_data,
            "telegram_messages": results.get("telegram_messages", [])
        }, f, indent=4, ensure_ascii=False)
    
    
    return json_filename

if __name__ == "__main__":
    # Example usage with user ID
    user_id = "679dbdde474857ed94520c38"
    
    # Perform Atlas search using user's data
    results = search_similar_jobs(user_id)
    
    # Save results to files
    json_file= save_results_to_files(results, user_id)
    
    # Display the results and file locations
    print("\nTop Matching Jobs and Telegram Messages:")
    
    print("\nJobs:")
    for job in results["jobs"]:
        print(f"\nJob Title: {job.get('title', 'N/A')}")
        print(f"Company: {job.get('company', 'N/A')}")
        print(f"Search Score: {job.get('score', 'N/A')}")
    
    print("\nTelegram Messages:")
    for msg in results["telegram_messages"]:
        print(f"\nChannel: {msg.get('channel', 'N/A')}")
        print(f"Message: {msg.get('message', 'N/A')[:100]}...")
        print(f"Score: {msg.get('score', 'N/A')}")
    
    print(f"\nResults saved to:")
    print(f"JSON file: {json_file}")
