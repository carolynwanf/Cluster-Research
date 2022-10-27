from flask import Flask, render_template, request, redirect, url_for, send_from_directory
from flask_cors import CORS #comment this on deployment
from flask_restful import reqparse
import sys
import pandas as pd
import io
from sklearn.manifold import TSNE

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

    #df has text as metadata and other features 
    df = pd.read_csv(io.StringIO(data),sep=",", header=0)
    #print(df, file=sys.stderr)
    
    
    #This performs dimensionality reduction, for now fixed perplexity but could be changed later
    X_embedded = TSNE(n_components=2, perplexity=50, verbose=True).fit_transform(df.drop(columns = 'text').values)
    
    #Converting the x,y,labels into dataframe again
    df_tsne = pd.DataFrame(X_embedded,columns=['x', 'y'])
    df_tsne['label'] = df['text']

    print(df_tsne, file=sys.stderr)

    return df_tsne.to_json(orient="split")
# Run app in debug mode
if __name__ == "__main__": 
    app.run(debug=True, host="0.0.0.0", port=5000)
   