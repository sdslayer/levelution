# Welcome to Cloud Functions for Firebase for Python!
# To get started, simply uncomment the below code or create your own.
# Deploy with `firebase deploy`

# The Cloud Functions for Firebase SDK to set up triggers and logging.
from firebase_functions import db_fn, scheduler_fn
from firebase_admin import initialize_app, db
import requests
import time

# Initialize Firebase app
app = initialize_app()

# Define database Cloud Function to fetch key for each email and make API request
@db_fn.on_value_written(reference='/users/{email}/keys')
def fetch_and_store_data(data):
    print("IF THIS PRINTS WE MADE IT INTO THE FUNCTION CALL.")
    key = data['value']
    
    # Iterate through all users
    users_ref = db.reference('/users')
    users = users_ref.get()
    for email, _ in users.items():
        # Make sure the email has the required key
        if f'{email}/keys/hypixelBW/key' in data['path']:
            # Make API request using fetched key
            api_url = f'https://api.hypixel.net/player?uuid=sdslayer&key={key}'
            response = requests.get(api_url)
            
            # Check if the request was successful
            if response.status_code == 200:
                # Extract bedwars_level from API response
                bedwars_level = response.json().get('player', {}).get('achievements', {}).get('bedwars_level')
                if bedwars_level is not None:
                    # Store bedwars_level in Firebase Database with current Unix time as key
                    current_time = int(time.time())
                    db.reference(f'/users/{email}/data/hypixelBW/{current_time}').set(bedwars_level)
                    print(f"Bedwars level stored for {email} at time {current_time}: {bedwars_level}")
                else:
                    print(f"Bedwars level not found for {email}")
            else:
                print(f"Failed to fetch data for {email}. Status code: {response.status_code}")

    return 'Data fetched and stored successfully for all users!'

# Define scheduled function to trigger the Cloud Function every 5 minutes
@scheduler_fn.on_schedule(schedule="every 5 minutes")
def trigger_cloud_function(event: scheduler_fn.ScheduledEvent) -> None:
    print("Scheduled function triggered.")
    fetch_and_store_data({'data': event.data})
