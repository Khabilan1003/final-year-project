from pymongo import MongoClient

# cluster = MongoClient("mongodb+srv://Khabilan:1hRUiiu6q9PTOmZv@cluster0.ykas4fl.mongodb.net/?retryWrites=true&w=majority")
cluster = MongoClient("localhost", 27017)

db = cluster["Patent"]
collection_user = db["Users"]
collection_patents = db["Patents"]
collection_transaction = db["Transactions"]