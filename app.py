from flask import Flask, render_template, request, redirect, url_for, send_from_directory
from flask_cors import CORS #comment this on deployment

app = Flask(__name__, static_url_path='', static_folder='frontend/build')
CORS(app)

# Serve home route
@app.route("/")
def home():
    return send_from_directory(app.static_folder, "index.html")

# Data uploading route
@app.route("/upload-data", methods=["POST"])
def data():
    data = request.form.get("data")
    print(data)
    return "done :)"

# Run app in debug mode
if __name__ == "__main__": 
    app.run(debug=True, host="0.0.0.0", port=5000)
   