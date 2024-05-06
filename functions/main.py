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

def fetch_bedwars(bwkey, bwid, email):
        print("ENTER BEDWARS FUNCTION")
        if bwkey is None or bwid is None:
            print(f"EMAIL {email} MISSING BW KEY OR ID")
        else:
            print(f"EMAIL {email} HAS BW KEY {bwkey} AND ID {bwid}")
            print("making test api call")
            # Make API request using fetched key
            # api_url = f'https://api.hypixel.net/player?uuid={bwid}&key={bwkey}'
            api_url = f'https://api.hypixel.net/player?uuid={bwid}&key=126c1146-cd9d-4af6-a9ea-ac64bacb71d0'
            response = requests.get(api_url)
            
            # Check if the request was successful
            if response.status_code == 200:
                # Extract bedwars level from response
                bedwars_level = response.json().get('player', {}).get('achievements', {}).get('bedwars_level')
                if bedwars_level is not None:
                    current_time = int(time.time()) # current time (wow)
                    db.reference(f'/users/{email}/data/hypixelBW/{current_time}').set(bedwars_level) # will store under /currenttime/level, so like hypixelBW/2918309128 = 913
                    print(f"BEDWARS LEVEL FOR {email} AT {current_time} IS {bedwars_level}") # i <3 debug statements
                else:
                    print(f"Bedwars level not found for {email}") # idk if its even possible for this to happen lol
            else:
                print(f"Failed to fetch data for {email}. Status code: {response.status_code}")

def fetch_gdstars(gdname, email):
        print("ENTER GD FUNCTION")
        if gdname is None:
            print(f"ID {gdname} NOT FOUND")
        else:
            print(f"ID: {gdname}")
            api_url = f'https://api.prevter.me/gd/profile/{gdname}'
            response = requests.get(api_url)
            if response.status_code == 200:
                star_count = response.json().get('stars', {})
                username = response.json().get('userName', {})
                print(star_count)
                current_time = int(time.time()) # current time (wow)
                db.reference(f'/users/{email}/data/GD/{current_time}').set(star_count) # will store under /currenttime/level, so like hypixelBW/2918309128 = 913
                db.reference(f'/users/{email}/names/GD/actualname').set(username)
                print(f"STAR COUNT FOR {email} AT {current_time} IS {star_count}") # i <3 debug statements

# Define database Cloud Function to fetch key for each email and make API request
def fetch_and_store_data(data):
    # print("IF THIS PRINTS WE MADE IT INTO THE FUNCTION CALL.")
    # key = data['value']
    
    # Iterate through all users
    print("Attempting to get user ref")
    users_ref = db.reference('/users')
    print("That succeeded, now to get the users as a dict")
    users = users_ref.get()
    print("wow that worked too, now we iterate through the emails???")
    for email, _ in users.items():
        print(email)
        print(f"trying to set ref for key")
        bwkey_ref = db.reference(f'/users/{email}/keys/hypixelBW/key')
        bwid_ref = db.reference(f'/users/{email}/ids/hypixelBW/id')
        gd_ref = db.reference(f'/users/{email}/names/GD/name')
        #print("ref success")
        #print(bwkey_ref)
        bwkey = bwkey_ref.get()
        bwid = bwid_ref.get()
        gdname = gd_ref.get()
        print(f"bwkey get success: {bwkey}")
        print(f"gdname get success: {gdname}")
        # Make sure the email has the required key
        print("fetching bedwars hopefully")
        fetch_bedwars(bwkey=bwkey, bwid=bwid, email=email)
        #print("fetching gd hopefully")
        #fetch_gdstars(gdname=gdname, email=email)

    return 'made it out'

@scheduler_fn.on_schedule(schedule="0 0 * * *") # crontab = at every minute 0
def trigger_cloud_function(event: scheduler_fn.ScheduledEvent) -> None:
    print("Scheduled function triggered.")
    #fetch_and_store_data({})
