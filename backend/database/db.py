from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from datetime import datetime
from bson import ObjectId
import json
import os

current_dir = os.path.dirname(os.path.abspath(__file__))
template_path = os.path.join(current_dir, "templates", "user_template.json")
with open(template_path) as t:
    user_template = json.load(t)

database_name = os.environ.get('MONGODB_DATABASE')
user_collection_name = os.environ.get('MONGODB_USER_COLLECTION')

uri = os.environ.get('MONGODB_URI')

def test():
    # Create a new client and connect to the server
    client = MongoClient(uri, server_api=ServerApi('1'))

    # Send a ping to confirm a successful connection
    try:
        client.admin.command('ping')
        print("Pinged your deployment. You successfully connected to MongoDB!")
    except Exception as e:
        print(e)

# User functions
def add_user(username, user_email, password_hash, createdAt):
    client = MongoClient(uri, server_api=ServerApi('1'))
    db = client.get_database(database_name)

    users_collection = db.get_collection(user_collection_name)
    schools = db.get_collection('schools')
    
    # Assign user info
    user = user_template.copy()
    user["username"] = username
    user["email"] = user_email
    user["password_hash"] = password_hash
    user["createdAt"] = createdAt
    
    all_schools = schools.find({}, {"name": 1, "email": 1, "_id": 1})
    for school in all_schools:
        school_email = school.get('email')
        if school_email in user_email:
            user["school"] = school.get('_id')
            break

    result = users_collection.insert_one(user)
    return result.inserted_id

def get_user_by_username(username):
    client = MongoClient(uri, server_api=ServerApi('1'))
    db = client.get_database(database_name)

    users_collection = db.get_collection(user_collection_name)

    user = users_collection.find_one({"username": username})
    return user

# School functions
def get_school_by_id(school_id):
    client = MongoClient(uri, server_api=ServerApi('1'))
    db = client.get_database(database_name)

    schools_collection = db.get_collection('schools')

    school = schools_collection.find_one({"_id": ObjectId(school_id)})
    return school