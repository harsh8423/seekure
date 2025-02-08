from flask import Flask, jsonify, request
from flask_cors import CORS
import asyncio
import logging
import pandas as pd
from jobspy import scrape_jobs
from pymongo import MongoClient
from telethon import TelegramClient
from datetime import datetime, timedelta, date
import os

# Configuration
MONGODB_URI = "mongodb+srv://harsh8423:8423047004@cluster0.1xbklyu.mongodb.net/seekure"
TELEGRAM_API_ID = '21837749'
TELEGRAM_API_HASH = 'c0a5dd3e08e7ee5b2c10f969930cb602'

logger = logging.getLogger(__name__)

class JobMonitoringAgent:
    def __init__(self):
        self.client = MongoClient(MONGODB_URI)
        self.db = self.client["seekure"]
        self.jobs_collection = self.db["jobs_with_embeddings"]
        self.telegram_collection = self.db["telegram_jobs"]
        self.tracking_collection = self.db["monitoring_tracking"]
        
        # Initialize tracking data
        self.initialize_tracking()

    def initialize_tracking(self):
        """Initialize tracking data for jobs and telegram channels"""
        # Initialize default job search tracking
        tracking_id = "default_job_search"
        if not self.tracking_collection.find_one({"_id": tracking_id}):
            self.tracking_collection.insert_one({
                "_id": tracking_id,
                "type": "job_search",
                "last_run": datetime.now() - timedelta(days=1),
                "status": "pending"
            })

        # Initialize telegram channel tracking
        tracking_id = "telegram_channels"
        if not self.tracking_collection.find_one({"_id": tracking_id}):
            self.tracking_collection.insert_one({
                "_id": tracking_id,
                "type": "telegram",
                "last_run": datetime.now() - timedelta(days=1),
                "status": "pending"
            })

    async def fetch_telegram_messages(self, channels):
        """Fetch messages from specified Telegram channels"""
        tracking_id = "telegram_channels"
        tracking = self.tracking_collection.find_one({"_id": tracking_id})
        last_run = tracking['last_run']
        
        all_messages = []
        try:
            async with TelegramClient('session_name', TELEGRAM_API_ID, TELEGRAM_API_HASH) as client:
                for channel in channels:
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
                            self.telegram_collection.insert_many(messages)
                            all_messages.extend(messages)
                            
                    except Exception as e:
                        logger.error(f"Error processing channel {channel}: {e}")
                
                # Update tracking
                self.tracking_collection.update_one(
                    {"_id": tracking_id},
                    {
                        "$set": {
                            "last_run": datetime.now(),
                            "status": "success",
                            "last_message_count": len(all_messages)
                        }
                    }
                )
                
                return all_messages
                
        except Exception as e:
            self.tracking_collection.update_one(
                {"_id": tracking_id},
                {"$set": {"status": "error", "error": str(e)}}
            )
            raise e

    def fetch_jobs(self, search_term, location):
        """Fetch jobs for a specific search term and location"""
        tracking_id = "default_job_search"
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

            jobs_list = []
            if jobs_df is not None and not jobs_df.empty:
                jobs_list = self.process_jobs(jobs_df)

            # Update tracking
            self.tracking_collection.update_one(
                {"_id": tracking_id},
                {
                    "$set": {
                        "last_run": datetime.now(),
                        "status": "success",
                        "last_job_count": len(jobs_list),
                        "search_term": search_term,
                        "location": location
                    }
                }
            )

            return jobs_list

        except Exception as e:
            self.tracking_collection.update_one(
                {"_id": tracking_id},
                {"$set": {"status": "error", "error": str(e)}}
            )
            raise e

    def process_jobs(self, jobs_df):
        """Process and store jobs in MongoDB"""
        if jobs_df is None or jobs_df.empty:
            return []
        
        # Set default values for empty job_type and date_posted
        jobs_df['job_type'] = jobs_df['job_type'].fillna('full-time')
        jobs_df['date_posted'] = jobs_df['date_posted'].fillna(datetime.now())
            
        jobs_documents = []
        for _, row in jobs_df.iterrows():
            job_doc = {}
            
            for key, value in row.items():
                try:
                    if isinstance(value, (pd.Timestamp, datetime)):
                        job_doc[key] = value.to_pydatetime()
                    elif isinstance(value, date):
                        job_doc[key] = datetime.combine(value, datetime.min.time())
                    elif pd.isna(value) or value is None:
                        job_doc[key] = None
                    else:
                        job_doc[key] = value
                except Exception as e:
                    logger.error(f"Error processing field {key}: {e}")
                    job_doc[key] = None

            jobs_documents.append(job_doc)

        try:
            if jobs_documents:
                self.jobs_collection.insert_many(jobs_documents)
                logger.info(f"Successfully stored {len(jobs_documents)} jobs")
            return jobs_documents
        except Exception as e:
            logger.error(f"Error storing jobs: {e}")
            raise e

def create_app():
    app = Flask(__name__)
    CORS(app)

    @app.route('/api/scrape-jobs', methods=['GET'])
    def scrape_jobs_endpoint():
        try:
            search_term = request.args.get('search_term', 'Full Stack Developer')
            location = request.args.get('location', 'India')
            return_data = request.args.get('data', 'false').lower() == 'true'
            
            agent = JobMonitoringAgent()
            jobs_data = agent.fetch_jobs(search_term, location)
            
            if return_data:
                return jsonify({
                    'status': 'success',
                    'jobs': jobs_data
                })
            else:
                return jsonify({
                    'status': 'success',
                    'message': 'Jobs fetched and stored successfully',
                    'jobs_count': len(jobs_data)
                })

        except Exception as e:
            logger.error(f"Error in scrape_jobs_endpoint: {e}")
            return jsonify({
                'status': 'error',
                'message': str(e)
            }), 500

    @app.route('/api/telegram-messages', methods=['GET'])
    async def telegram_messages_endpoint():
        try:
            channels = request.args.get('channels', '').split(',')
            return_data = request.args.get('data', 'false').lower() == 'true'
            
            if not channels or channels[0] == '':
                channels = ["TechUprise_Updates", "jobs_and_internships_updates"]
            
            agent = JobMonitoringAgent()
            messages = await agent.fetch_telegram_messages(channels)
            
            if return_data:
                return jsonify({
                    'status': 'success',
                    'messages': messages
                })
            else:
                return jsonify({
                    'status': 'success',
                    'message': 'Telegram messages fetched and stored successfully',
                    'messages_count': len(messages)
                })

        except Exception as e:
            logger.error(f"Error in telegram_messages_endpoint: {e}")
            return jsonify({
                'status': 'error',
                'message': str(e)
            }), 500

    @app.route('/api/tracking-status', methods=['GET'])
    def tracking_status_endpoint():
        try:
            agent = JobMonitoringAgent()
            job_tracking = agent.tracking_collection.find_one({"_id": "default_job_search"})
            telegram_tracking = agent.tracking_collection.find_one({"_id": "telegram_channels"})
            
            return jsonify({
                'status': 'success',
                'job_tracking': {
                    'last_run': job_tracking['last_run'],
                    'status': job_tracking['status'],
                    'last_job_count': job_tracking.get('last_job_count', 0),
                    'search_term': job_tracking.get('search_term', ''),
                    'location': job_tracking.get('location', '')
                },
                'telegram_tracking': {
                    'last_run': telegram_tracking['last_run'],
                    'status': telegram_tracking['status'],
                    'last_message_count': telegram_tracking.get('last_message_count', 0)
                }
            })

        except Exception as e:
            logger.error(f"Error in tracking_status_endpoint: {e}")
            return jsonify({
                'status': 'error',
                'message': str(e)
            }), 500

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, port=5000)