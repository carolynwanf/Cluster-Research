from multiprocessing import reduction
from flask import Flask, send_from_directory, url_for, json
from flask_cors import CORS #comment this on deployment
from flask_restful import reqparse
import pandas as pd
import io
from sklearn.manifold import TSNE
import umap
from ast import literal_eval
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.svm import SVC
import numpy as np
import heapq

app = Flask(__name__, static_url_path='', static_folder='frontend/build')
CORS(app)

# Serve home route
@app.route("/")
def home():
    return send_from_directory(app.static_folder, "index.html")

# Performs selected dimensionality reduction method (reductionMethod) on uploaded data (data), considering selected parameters (perplexity, selectedCol)
@app.route("/upload-data", methods=["POST"])
def data():
    parser = reqparse.RequestParser()
    parser.add_argument('data', type=str)
    parser.add_argument('reductionMethod', type=str)
    parser.add_argument('perplexity', type=int)
    parser.add_argument('selectedCol', type=str)

    args = parser.parse_args()

    data = args['data']
    reductionMethod = args['reductionMethod']
    selectedCol = args['selectedCol']

    #df has text as metadata and other features
    df = pd.read_csv(io.StringIO(data),sep=",", header=0)
    

    # extracting column with color information from df
    if selectedCol != "none":
        selectedCol = selectedCol[1:-1]
        colorByCol = df.loc[:,selectedCol]
        df = df.drop(selectedCol, axis=1)
    # Check reduction method
    if reductionMethod == "TSNE":
        perplexity = args['perplexity']
        #This performs dimensionality reduction, for now fixed perplexity but could be changed later
        X_embedded = TSNE(n_components=2, perplexity=perplexity, verbose=True).fit_transform(df.values)
    else:
         X_embedded = umap.UMAP(n_components=2).fit_transform(df.values)

    #Converting the x,y,labels,color into dataframe again
    df_dr = pd.DataFrame(X_embedded,columns=['x', 'y'])
    df_dr['label'] = colorByCol

    if selectedCol != "none":
        df_dr['color'] = colorByCol

    df.to_csv('data.csv', index = False)
    df_dr = pd.concat([df_dr, df], axis=1, join="inner")
    return df_dr.to_json(orient="split")

# Returns most 30 most positively and negatively associated words with being in a selected area using a linear classifier
# Input schema: 
#   [
#       [label, categorization] # 1 if in selected area, 0 if not
#   ]
@app.route("/categorize-data", methods=["POST"])
def categorize():
    print("hello")
    parser = reqparse.RequestParser()
    parser.add_argument('data', type=str)
    args = parser.parse_args()
    categorizedPoints = args['data']
    print(categorizedPoints)
    df_data = pd.read_csv('data.csv')
    df = pd.DataFrame(literal_eval(categorizedPoints), columns = ['0', 'val', '1'])
    df_data['target'] = df['1']
    print(df_data)
    print(df)
    return 

# GPT-3-powered explanations
@app.route("/GPT-explanation", methods=["POST"])
def GPTexplanation():
    parser = reqparse.RequestParser()
    parser.add_argument('selectedLabels', type=str)
    args = parser.parse_args()
    selected_labels = args['selectedLabels']

    return "nothing yet"




# Populate center panel with default projection
@app.route("/get-default-data", methods=["GET"])
def defaultData():
    data = json.load(open("./datasets/hp_embedding.json"))
    return data




# Run app in debug mode
if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
