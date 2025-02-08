import os
import pandas as pd
from jobspy import scrape_jobs
from pymongo import MongoClient
import google.generativeai as genai
import numpy as np
import datetime
import asyncio
from telethon import TelegramClient
import json
from time import sleep
from datetime import datetime, timedelta, date

# Configuration
MONGODB_URI = "mongodb+srv://harsh8423:8423047004@cluster0.1xbklyu.mongodb.net/seekure"
TELEGRAM_API_ID = '21837749'
TELEGRAM_API_HASH = 'c0a5dd3e08e7ee5b2c10f969930cb602'
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')

# Job search configurations
JOB_SEARCHES = [
    # {"search_term": "Full Stack Developer", "location": "India"},
    # {"search_term": "Data Scientist", "location": "India"},
    # {"search_term": "DevOps Engineer", "location": "India"},
    {"search_term": "Machine Learning Engineer", "location": "India"}
]

# Telegram channel configurations
TELEGRAM_CHANNELS = [
    "TechUprise_Updates",
    "jobs_and_internships_updates"
]

class JobMonitoringAgent:
    def __init__(self):
        self.client = MongoClient(MONGODB_URI)
        self.db = self.client["seekure"]
        self.jobs_collection = self.db["jobs_with_embeddings"]
        self.tracking_collection = self.db["monitoring_tracking"]
        self.telegram_collection = self.db["telegram_jobs"]
        
        # Initialize genai
        if GOOGLE_API_KEY:
            genai.configure(api_key=GOOGLE_API_KEY)
        
        # Initialize tracking data
        self.initialize_tracking()

    def initialize_tracking(self):
        """Initialize or load tracking data for jobs and telegram channels"""
        # Check and initialize job search tracking
        for job_config in JOB_SEARCHES:
            tracking_id = f"job_{job_config['search_term']}_{job_config['location']}"
            existing = self.tracking_collection.find_one({"_id": tracking_id})
            if not existing:
                self.tracking_collection.insert_one({
                    "_id": tracking_id,
                    "type": "job_search",
                    "search_term": job_config['search_term'],
                    "location": job_config['location'],
                    "last_run": datetime.now() - timedelta(days=1),
                    "status": "pending"
                })

        # Check and initialize telegram channel tracking
        for channel in TELEGRAM_CHANNELS:
            tracking_id = f"telegram_{channel}"
            existing = self.tracking_collection.find_one({"_id": tracking_id})
            if not existing:
                self.tracking_collection.insert_one({
                    "_id": tracking_id,
                    "type": "telegram",
                    "channel": channel,
                    "last_run": datetime.now() - timedelta(days=1),
                    "status": "pending"
                })

    async def fetch_telegram_messages(self, channel):
        """Fetch messages from a specific Telegram channel"""
        tracking_id = f"telegram_{channel}"
        tracking = self.tracking_collection.find_one({"_id": tracking_id})
        last_run = tracking['last_run']

        async with TelegramClient('session_name', TELEGRAM_API_ID, TELEGRAM_API_HASH) as client:
            try:
                channel_entity = await client.get_entity(channel)
                messages = []
                
                async for message in client.iter_messages(channel_entity, offset_date=last_run, limit=10):
                    messages.append({
                        'channel': channel,
                        'sender_id': message.sender_id,
                        'message': message.text,
                        'date': message.date,
                        'processed_at': datetime.now()
                    })

                if messages:
                    await self.process_telegram_messages(messages)
                
                # Update tracking
                self.tracking_collection.update_one(
                    {"_id": tracking_id},
                    {
                        "$set": {
                            "last_run": datetime.now(),
                            "status": "success",
                            "last_message_count": len(messages)
                        }
                    }
                )
                
                print(f"Processed {len(messages)} messages from {channel}")
                
            except Exception as e:
                print(f"Error processing channel {channel}: {e}")
                self.tracking_collection.update_one(
                    {"_id": tracking_id},
                    {"$set": {"status": "error", "error": str(e)}}
                )

    async def process_telegram_messages(self, messages):
        """Process and store Telegram messages"""
        try:
            self.telegram_collection.insert_many(messages)
        except Exception as e:
            print(f"Error storing telegram messages: {e}")

    def fetch_jobs(self, search_term, location):
        """Fetch jobs for a specific search term and location"""
        tracking_id = f"job_{search_term}_{location}"
        tracking = self.tracking_collection.find_one({"_id": tracking_id})
        
        try:
            jobs_df = scrape_jobs(
                site_name=["indeed", "linkedin", "glassdoor"],
                search_term=search_term,
                location=location,
                job_type="fulltime",
                results_wanted=5,
                verbose=0,
                linkedin_fetch_description=True,
                hours_old=24,
                country_indeed='India'
            )


            # Process and store jobs
            self.process_jobs(jobs_df)

            # Update tracking
            self.tracking_collection.update_one(
                {"_id": tracking_id},
                {
                    "$set": {
                        "last_run": datetime.now(),
                        "status": "success",
                        "last_job_count": len(jobs_df)
                    }
                }
            )

            print(f"Processed {len(jobs_df)} jobs for {search_term} in {location}")

        except Exception as e:
            print(f"Error processing jobs for {search_term} in {location}: {e}")
            self.tracking_collection.update_one(
                {"_id": tracking_id},
                {"$set": {"status": "error", "error": str(e)}}
            )

    def process_jobs(self, jobs_df):
        """Process and store jobs in MongoDB"""
        if jobs_df is None or jobs_df.empty:
            print("No jobs to process")
            return
            
        jobs_documents = []
        for _, row in jobs_df.iterrows():
            job_doc = {}
            
            # Convert row to dictionary and handle data types
            for key, value in row.items():
                try:
                    # Handle datetime/timestamp objects
                    if isinstance(value, (pd.Timestamp, datetime)):
                        job_doc[key] = value.to_pydatetime()
                    # Handle date objects
                    elif isinstance(value, date):  # Changed from datetime.date
                        job_doc[key] = datetime.combine(value, datetime.min.time())
                    # Handle numpy numeric types
                    elif isinstance(value, (np.int64, np.float64)):
                        job_doc[key] = value.item()
                    # Handle NaN/None values
                    elif pd.isna(value) or value is None:
                        job_doc[key] = None
                    # Handle all other types
                    else:
                        job_doc[key] = value
                except Exception as e:
                    print(f"Error processing field {key}: {e}")
                    job_doc[key] = None

            jobs_documents.append(job_doc)

        try:
            if jobs_documents:
                # Convert any remaining numpy types to Python native types
                cleaned_documents = [{k: v.item() if isinstance(v, (np.int64, np.float64)) else v 
                                    for k, v in doc.items()} 
                                   for doc in jobs_documents]
                self.jobs_collection.insert_many(cleaned_documents)
                print(f"Successfully stored {len(cleaned_documents)} jobs")
            else:
                print("No valid jobs to store")
        except Exception as e:
            print(f"Error storing jobs: {e}")

    async def run_monitoring_cycle(self):
        """Run a complete monitoring cycle"""
        while True:
            # Process job searches
            for job_config in JOB_SEARCHES:
                self.fetch_jobs(job_config['search_term'], job_config['location'])
                await asyncio.sleep(50)  # Wait 3 minutes between job searches

            # Process Telegram channels
            for channel in TELEGRAM_CHANNELS:
                await self.fetch_telegram_messages(channel)
                await asyncio.sleep(20)  # Wait 1 minute between channel fetches

            # Wait before starting next cycle
            await asyncio.sleep(50)  # Wait 5 minutes before starting next cycle

async def main():
    agent = JobMonitoringAgent()
    await agent.run_monitoring_cycle()

if __name__ == "__main__":
    asyncio.run(main())

