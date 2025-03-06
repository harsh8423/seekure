from jobspy import scrape_jobs
from datetime import datetime, date
import pandas as pd
import logging
from pymongo import MongoClient

def fetch_jobs(search_term, location, jobs_collection, job_type):
    """Fetch jobs for a specific search term and location"""

    try:
        jobs_df = scrape_jobs(
            site_name=["indeed", "linkedin", "glassdoor"],
            search_term=search_term,
            location=location,
            job_type=job_type,
            results_wanted=5,
            verbose=0,
            linkedin_fetch_description=True,
            hours_old=72,
            hybrid_scraping=True,
            country_indeed='India',
        )

        jobs_list = []
        if jobs_df is not None and not jobs_df.empty:
            jobs_list = process_jobs(jobs_df, jobs_collection, job_type)

        return jobs_list

    except Exception as e:
        logging.error(f"Error fetching jobs: {e}")
        raise e

def process_jobs(jobs_df, jobs_collection, job_type):
    """Process and store jobs in MongoDB"""
    if jobs_df is None or jobs_df.empty:
        return []
    
    # Set default values for empty job_type and date_posted
    jobs_df['job_type'] = jobs_df['job_type'].fillna(job_type)
    jobs_df['date_posted'] = jobs_df['date_posted'].fillna(datetime.now())
    
    jobs_documents = []
    for _, row in jobs_df.iterrows():
        job_doc = {}
        
        for key, value in row.items():
            try:
                if isinstance(value, pd.Timestamp):
                    job_doc[key] = value.to_pydatetime()
                elif isinstance(value, datetime):
                    job_doc[key] = value  # No need to convert
                elif isinstance(value, date):
                    job_doc[key] = datetime.combine(value, datetime.min.time())
                elif pd.isna(value) or value is None:
                    job_doc[key] = None
                else:
                    job_doc[key] = value
            except Exception as e:
                logging.error(f"Error processing field {key}: {e}")
                job_doc[key] = None

        jobs_documents.append(job_doc)

    try:
        if jobs_documents:
            jobs_collection.insert_many(jobs_documents)
            logging.info(f"Successfully stored {len(jobs_documents)} jobs")
        return jobs_documents
    except Exception as e:
        logging.error(f"Error storing jobs: {e}")
        raise e

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    
    # Database setup
    client = MongoClient("mongodb+srv://harsh8423:8423047004@cluster0.1xbklyu.mongodb.net/seekure")
    db = client["seekure"]
    jobs_collection = db["jobs"]

    
    search_term = "Machine Learning Engineer"
    location = "India"
    job_type="internship"

    jobs = fetch_jobs(search_term, location, jobs_collection, job_type)
    logging.info(f"Fetched {len(jobs)} jobs.")
