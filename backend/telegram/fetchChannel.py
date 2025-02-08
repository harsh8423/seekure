from telethon import TelegramClient
from pymongo import MongoClient
import asyncio

# Replace 'your_api_id' and 'your_api_hash' with your actual API ID and hash
api_id = '21837749'
api_hash = 'c0a5dd3e08e7ee5b2c10f969930cb602'

# MongoDB setup
client = MongoClient("mongodb+srv://harsh8423:8423047004@cluster0.1xbklyu.mongodb.net/seekure")
db = client["seekure"]

async def fetch_channel_metadata(channel_username):
    """
    Fetch metadata for a given Telegram channel by its username.
    
    Args:
        channel_username (str): Username of the Telegram channel.
    
    Returns:
        dict: A dictionary containing channel metadata like name, icon, URL, etc.
    """
    async with TelegramClient('session_name', api_id, api_hash) as client:
        # Get the entity of the channel
        channel = await client.get_entity(channel_username)
        
        # Extract metadata and handle the ChatPhoto object
        channel_icon_url = None
        if channel.photo:
            # Download the photo and get its URL
            file = await client.download_profile_photo(channel, file=bytes)
            channel_icon_url = f"data:image/jpeg;base64,{file.hex()}" if file else None

        metadata = {
            'channel_name': channel.title,
            'channel_username': channel.username,
            'channel_id': channel.id,
            'channel_url': f"https://t.me/{channel.username}" if channel.username else None,
            'channel_icon': channel_icon_url,
            'is_verified': channel.verified,
            'is_megagroup': channel.megagroup,
            'is_broadcast': channel.broadcast,
            'messages': []  # Initialize an empty list of messages
        }
        return metadata

def save_channel_metadata_to_mongodb(metadata):
    """
    Save channel metadata to MongoDB.
    
    Args:
        metadata (dict): Metadata of the Telegram channel.
    """
    collection = db["telegram_channels"]
    
    # Check if the channel already exists in the database
    existing_channel = collection.find_one({"channel_id": metadata["channel_id"]})
    if existing_channel:
        print(f"Channel '{metadata['channel_name']}' already exists in the database.")
    else:
        # Insert the metadata into the MongoDB collection
        collection.insert_one(metadata)
        print(f"Channel '{metadata['channel_name']}' metadata saved to MongoDB.")

