from multiprocessing import reduction
from flask import Flask, render_template, request, redirect, url_for, send_from_directory, url_for, json
from flask_cors import CORS #comment this on deployment
from flask_restful import reqparse
import sys
import pandas as pd
import io
import os
from sklearn.manifold import TSNE
import umap

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
    parser.add_argument('reductionMethod', type=str)
    parser.add_argument('perplexity', type=int)

    args = parser.parse_args()

    data = args['data']
    reductionMethod = args['reductionMethod']

    #df has text as metadata and other features 
    df = pd.read_csv(io.StringIO(data),sep=",", header=0)
    
    # Check reduction method
    if reductionMethod == "TSNE":
        perplexity = args['perplexity']
        #This performs dimensionality reduction, for now fixed perplexity but could be changed later
        X_embedded = TSNE(n_components=2, perplexity=perplexity, verbose=True).fit_transform(df.drop(columns = 'text').values)
    else:
         X_embedded = umap.UMAP(n_components=2).fit_transform(df.drop(columns = 'text').values)
    
    #Converting the x,y,labels into dataframe again
    df_dr = pd.DataFrame(X_embedded,columns=['x', 'y'])
    df_dr['label'] = df['text']

    # df_dr.to_json('./frontend/data/snap_embedding.json', orient="split")
    return df_dr.to_json(orient="split")

@app.route("/get-default-data", methods=["GET"])
def defaultData():
    # SITE_ROOT = os.path.realpath(os.path.dirname(__file__))
    # json_url = os.path.join(SITE_ROOT, "static/data", "taiwan.json")
    data = json.load(open("./frontend/data/hp_embedding.json"))
    return data
    



# Run app in debug mode
if __name__ == "__main__": 
    app.run(debug=True, host="0.0.0.0", port=5000)
   