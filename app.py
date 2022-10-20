from flask import Flask, render_template, request, redirect, url_for, send_from_directory
from flask_cors import CORS #comment this on deployment

app = Flask(__name__, static_url_path='', static_folder='frontend/build')
CORS(app)

@app.route("/")
def home():
    return send_from_directory(app.static_folder, "index.html")

@app.route("/test", methods=["GET"])
def add():


    return "Hi! This is the server :)"


if __name__ == "__main__": 
    app.run(debug=True, host="0.0.0.0", port=5000)
   