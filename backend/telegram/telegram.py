from telethon import TelegramClient, sync
from datetime import datetime, timedelta
import csv
from dotenv import load_dotenv
import os

load_dotenv()


# Replace 'your_api_id' and 'your_api_hash' with your actual API ID and hash
api_id = os.getenv("TELEGRAM_API_ID")
api_hash = os.getenv("TELEGRAM_API_HASH")

async def fetch_messages(channel_username, start_date, messages_list):
    # Create a new Telegram client within the function
    async with TelegramClient('session_name', api_id, api_hash) as client:
        # Get the entity of the channel
        channel = await client.get_entity(channel_username)

        # Iterate over messages in the channel from the start_date until now
        async for message in client.iter_messages(channel, offset_date=start_date, limit=5):
            messages_list.append({
                'Channel': channel_username,
                'Sender ID': message.sender_id,
                'Message': message.text,
                'Date': message.date.strftime('%Y-%m-%d %H:%M:%S')
            })

async def main():
    # List of channel usernames to fetch messages from
    channel_usernames = ['TechUprise_Updates', 'jobs_and_internships_updates']

    # Set the start date to fetch messages from (e.g., 1 day ago)
    start_date = datetime.now() - timedelta(days=1)

    # List to store all messages
    all_messages = []

    # Fetch messages from each channel
    for channel_username in channel_usernames:
        await fetch_messages(channel_username, start_date, all_messages)

    # Define CSV file path
    csv_file = 'messages.csv'

    # Write messages to CSV
    with open(csv_file, mode='w', newline='', encoding='utf-8') as file:
        writer = csv.DictWriter(file, fieldnames=['Channel', 'Sender ID', 'Message', 'Date'])
        writer.writeheader()
        for msg in all_messages:
            writer.writerow(msg)

    print(f"Messages have been saved to {csv_file}")

# Run the client
import asyncio
asyncio.run(main())