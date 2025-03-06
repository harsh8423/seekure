from pymongo import MongoClient
import datetime
import os
from datetime import datetime
from bson import ObjectId
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

# MongoDB connection setup
client = MongoClient(os.getenv("MONGO_URI"))
db = client["seekure"]
jobs_collection = db["jobs"]
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

def search_similar_jobs(user_id, filters=None, top_k=10):
    """
    Perform Atlas Search with filters to find relevant job postings.
    """
    try:
        user_data = get_user_data(user_id)
        if not user_data:
            return {"jobs": [], "telegram_messages": []}

        skills = user_data["skills"]
        job_titles = user_data["job_titles"]
        preferences = user_data["preferences"]

        # Build search compound query
        must_clauses = []
        should_clauses = []

        # Handle original query if it exists (from AI search)
        if filters and filters.get('original_query'):
            should_clauses.append({
                "text": {
                    "query": filters['original_query'],
                    "path": ["title", "description"],
                    "fuzzy": {"maxEdits": 1}
                }
            })
        else:
            # Use default user preferences for regular search
            should_clauses.extend([
                {
                    "text": {
                        "query": " ".join(skills) if skills else "",
                        "path": ["description", "title"],
                        "fuzzy": {"maxEdits": 1}
                    }
                },
                {
                    "text": {
                        "query": " ".join(job_titles) if job_titles else "",
                        "path": "title",
                        "score": {"boost": {"value": 2}}
                    }
                }
            ])

        # Add filter clauses (works for both AI and regular search)
        if filters:
            # Job Type filter
            if filters.get('jobType') and len(filters['jobType']) > 0:
                must_clauses.append({
                    "compound": {
                        "should": [
                            {
                                "text": {
                                    "query": job_type,
                                    "path": "job_type",
                                    "fuzzy": {"maxEdits": 1}
                                }
                            } for job_type in filters['jobType']
                        ],
                        "minimumShouldMatch": 1
                    }
                })

            # Work Mode filter
            if filters.get('workMode') and len(filters['workMode']) > 0:
                must_clauses.append({
                    "compound": {
                        "should": [
                            {
                                "text": {
                                    "query": mode,
                                    "path": "work_mode",
                                    "fuzzy": {"maxEdits": 1}
                                }
                            } for mode in filters['workMode']
                        ],
                        "minimumShouldMatch": 1
                    }
                })

            # Experience filter
            if filters.get('experience') and len(filters['experience']) > 0:
                must_clauses.append({
                    "compound": {
                        "should": [
                            {
                                "text": {
                                    "query": exp_level,
                                    "path": "job_level",
                                    "fuzzy": {"maxEdits": 1}
                                }
                            } for exp_level in filters['experience']
                        ],
                        "minimumShouldMatch": 1
                    }
                })

            # Location filter
            if filters.get('location'):
                must_clauses.append({
                    "text": {
                        "query": filters['location'],
                        "path": "location",
                        "fuzzy": {"maxEdits": 2}
                    }
                })

            # Date Posted filter
            if filters.get('datePosted'):
                date_range = {
                    'today': 1,
                    'week': 7,
                    'month': 30,
                }.get(filters['datePosted'])
                
                if date_range:
                    must_clauses.append({
                        "range": {
                            "path": "date_posted",
                            "gte": datetime.now() - timedelta(days=date_range),
                            "lte": datetime.now()
                        }
                    })

        # Build the final pipeline
        job_pipeline = [
            {
                "$search": {
                    "compound": {
                        "must": must_clauses,
                        "should": should_clauses,
                        "minimumShouldMatch": 1 if should_clauses else 0
                    }
                }
            },
            {"$limit": top_k},
            {
                "$project": {
                    "title": 1,
                    "company": 1,
                    "location": 1,
                    "description": 1,
                    "site": 1,
                    "company_url": 1,
                    "company_logo": 1,
                    "job_level": 1,
                    "job_type": 1,
                    "work_mode": 1,
                    "job_url": 1,
                    "job_url_direct": 1,
                    "date_posted": 1,
                    "id": 1,
                    "score": {"$meta": "searchScore"}
                }
            }
        ]

        # Execute search
        job_results = list(jobs_collection.aggregate(job_pipeline))

        # Handle Telegram search if enabled in preferences
        telegram_results = []
        if user_data:
            telegram_channels = preferences.get("telegramChannels", [])
            if telegram_channels:
                channel_usernames = [channel["username"].replace("@", "") for channel in telegram_channels]
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
                                "mustNot": [
                                    {
                                        "text": {
                                            "query": ["free", "guidance", "course", "webinar", "seminar", "workshop", "event", "training", "certification"],
                                            "path": "message"
                                        }
                                    }
                                ],
                                "should": [
                                    {
                                        "text": {
                                            "query": " ".join(job_titles) if job_titles else "",
                                            "path": "message"
                                        }
                                    },
                                    {
                                        "text": {
                                            "query": " ".join(skills) if skills else "",
                                            "path": "message"
                                        }
                                    }
                                ],
                                "minimumShouldMatch": 1
                            }
                        }
                    },
                    {
                        "$limit": 5
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

# def save_results_to_files(results, user_id):
#     """
#     Save job search results to both JSON and CSV files.
    
#     Args:
#         results (dict): Dictionary containing job and telegram results
#         user_id (str): User's ID for filename
#     """
#     timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
#     output_dir = "job_search_results"
#     os.makedirs(output_dir, exist_ok=True)

#     # Prepare data for saving
#     jobs_data = []
#     for job in results.get("jobs", []):
#         job_dict = {
#             'title': job.get('title', 'N/A'),
#             'company': job.get('company', 'N/A'),
#             'location': job.get('location', 'N/A'),
#             'description': job.get('description', 'N/A'),
#             'site': job.get('site', 'N/A'),
#             # 'posted_date': job.get('date_posted', 'N/A'),
#             'job_type': job.get('job_type', 'N/A'),
#             'id': job.get('id', 'N/A'),
#             'search_score': job.get('score', 'N/A')
#         }
#         jobs_data.append(job_dict)

#     # Save as JSON
#     json_filename = f"{output_dir}/job_results_{user_id}_{timestamp}.json"
#     with open(json_filename, 'w', encoding='utf-8') as f:
#         json.dump({
#             "jobs": jobs_data,
#             "telegram_messages": results.get("telegram_messages", [])
#         }, f, indent=4, ensure_ascii=False)
    
    
#     return json_filename

# if __name__ == "__main__":
#     # Example usage with user ID
#     user_id = "679dbdde474857ed94520c38"
    
#     # Perform Atlas search using user's data
#     results = search_similar_jobs(user_id)
    
#     # Save results to files
#     json_file= save_results_to_files(results, user_id)
    
#     # Display the results and file locations
#     print("\nTop Matching Jobs and Telegram Messages:")
    
#     print("\nJobs:")
#     for job in results["jobs"]:
#         print(f"\nJob Title: {job.get('title', 'N/A')}")
#         print(f"Company: {job.get('company', 'N/A')}")
#         print(f"Search Score: {job.get('score', 'N/A')}")
    
#     print("\nTelegram Messages:")
#     for msg in results["telegram_messages"]:
#         print(f"\nChannel: {msg.get('channel', 'N/A')}")
#         print(f"Message: {msg.get('message', 'N/A')[:100]}...")
#         print(f"Score: {msg.get('score', 'N/A')}")
    
#     print(f"\nResults saved to:")
#     print(f"JSON file: {json_file}")
