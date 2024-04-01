from flask import Flask
from flask_cors import CORS
from sentence_transformers import SentenceTransformer

app = Flask(__name__)
CORS(app , supports_credentials=True , origins="*")
app.config['SECRET_KEY'] = "SECRET KEY"

# T5 Model
model = SentenceTransformer("./sentence_models/t5")