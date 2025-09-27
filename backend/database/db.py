from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from datetime import datetime
from flask import request
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

def add_user(username, email, password_hash, createdAt):
    client = MongoClient(uri, server_api=ServerApi('1'))
    db = client.get_database(database_name)

    users_collection = db.get_collection(user_collection_name)

    user = user_template.copy()
    user["username"] = username
    user["email"] = email
    user["password_hash"] = password_hash
    user["createdAt"] = createdAt

    result = users_collection.insert_one(user)
    return result.inserted_id