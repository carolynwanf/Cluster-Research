from flask import Flask, render_template, request, redirect, url_for, send_from_directory
from flask_cors import CORS #comment this on deployment
from flask_restful import reqparse
import sys
import pandas as pd
import io

app = Flask(__name__, static_url_path='', static_folder='frontend/build')
CORS(app)

# Serve home route
@app.route("/")
def home():
    return send_from_directory(app.static_folder, "index.html")

# Data uploading route
@app.route("/upload-data", methods=["POST"])
def data():
    parser = reqparse.RequestParser()
    parser.add_argument('data', type=str)

    args = parser.parse_args()

    data = args['data']

    df = pd.read_csv(io.StringIO(data),sep=",", header=None)
    print(df, file=sys.stderr)

    return df.to_json(orient="split")

# Run app in debug mode
if __name__ == "__main__": 
    app.run(debug=True, host="0.0.0.0", port=5000)
   