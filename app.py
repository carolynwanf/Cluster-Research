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
    parser.add_argument('selectedCol', type=str)

    args = parser.parse_args()

    data = args['data']
    reductionMethod = args['reductionMethod']
    selectedCol = args['selectedCol']

    #df has text as metadata and other features 
    df = pd.read_csv(io.StringIO(data),sep=",", header=0)

    # extracting column with color information from df
    if selectedCol != "none":
        print("dropping")
        colorByCol = df.loc[:,selectedCol]
        df = df.drop(selectedCol, axis=1)
    
    print(colorByCol, file=sys.stderr)
    
    # Check reduction method
    if reductionMethod == "TSNE":
        perplexity = args['perplexity']
        #This performs dimensionality reduction, for now fixed perplexity but could be changed later
        X_embedded = TSNE(n_components=2, perplexity=perplexity, verbose=True).fit_transform(df.drop(columns = ['text']).values)
    else:
         X_embedded = umap.UMAP(n_components=2).fit_transform(df.drop(columns = 'text').values)
    
    #Converting the x,y,labels,color into dataframe again
    df_dr = pd.DataFrame(X_embedded,columns=['x', 'y'])
    df_dr['label'] = df['text']
    df_dr['color'] = colorByCol

    # df_dr.to_json('./frontend/data/snap_embedding.json', orient="split")
    return df_dr.to_json(orient="split")

# Data categorization route
@app.route("/categorize-data", methods=["POST"])
def categorize():
    
    parser = reqparse.RequestParser()
    parser.add_argument('data', type=str)
    args = parser.parse_args()
    categorizedPoints = args['data']
    
    df = pd.DataFrame(literal_eval(categorizedPoints), columns = ['0','1'])
    
    #Make a list of all possible words in the text, currently capped at 100,000
    vectorizer = CountVectorizer(max_features=100000)
    BOW = vectorizer.fit_transform(df['0'])
    
    #Fit a linear Classifier
    x_train,x_test,y_train,y_test = train_test_split(BOW,np.asarray(df['1']))
    model = SVC(kernel='linear')
    model.fit(x_train,y_train)
    coeffs = model.coef_.toarray()
    
    #Find ids for pos and negative coeffs
    id_pos = coeffs[0]>0
    id_neg = coeffs[0]<0
    
    #We're just taking 30 largest values
    n_pos = heapq.nlargest(30, range(len(coeffs[0][id_pos])), coeffs[0][id_pos].take)
    n_neg = heapq.nsmallest(30, range(len(coeffs[0][id_neg])), coeffs[0][id_neg].take)
    
    
    pos_tokens = vectorizer.get_feature_names_out()[id_pos][n_pos]
    pos_token_coeffs = coeffs[0][id_pos][n_pos]
    

    neg_tokens = vectorizer.get_feature_names_out()[id_neg][n_neg]
    neg_token_coeffs = coeffs[0][id_neg][n_neg]
    
    df_coefs = pd.DataFrame(list(zip(pos_tokens,pos_token_coeffs,neg_tokens,neg_token_coeffs)), 
                            columns = ['pos_tokens', 'pos_coefs','neg_tokens','neg_coefs'])

    
    print(df_coefs)

    return df_coefs.to_json(orient="split")




@app.route("/get-default-data", methods=["GET"])
def defaultData():
    # SITE_ROOT = os.path.realpath(os.path.dirname(__file__))
    # json_url = os.path.join(SITE_ROOT, "static/data", "taiwan.json")
    data = json.load(open("./frontend/data/hp_embedding.json"))
    return data
    



# Run app in debug mode
if __name__ == "__main__": 
    app.run(debug=True, host="0.0.0.0", port=5000)
   
