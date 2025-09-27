from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi

def test():
    uri = "mongodb+srv://wyatt_db_admin:y4Dabv1SNdNuUrYw@creditcluster.weqoje8.mongodb.net/?retryWrites=true&w=majority&appName=CreditCluster"

    # Create a new client and connect to the server
    client = MongoClient(uri, server_api=ServerApi('1'))

    # Send a ping to confirm a successful connection
    try:
        client.admin.command('ping')
        print("Pinged your deployment. You successfully connected to MongoDB!")
    except Exception as e:
        print(e)