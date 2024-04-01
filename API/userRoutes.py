import jwt
import torch
import pickle
import datetime
from flask import Blueprint , make_response , jsonify , request
from database import collection_patents , collection_user , collection_transaction
from validateToken import validate_token_and_role
from enums import Roles , PatentStatus
from werkzeug.security import generate_password_hash, check_password_hash
from app import model , app

userRoutes = Blueprint("userRoutes" , __name__)

@userRoutes.route("/patentApply", methods=["POST"])
@validate_token_and_role(Roles.NORMALUSER.value)
def patentUpload():
    response = make_response()
    title = request.form['title']
    abstract = request.form['abstract']
    coinventors = str(request.form['coinventors'])
    if len(coinventors.strip()) == 0:
        coinventors = []
    else:
        coinventors = coinventors.split(",")

    patent = collection_patents.find_one({'title' : title})
    if patent:
        response.status_code = 401
        response.data = jsonify({'error' : True , 'isTitleAlreadyExist' : True}).response[0]
        return response        

    # Retrieve Aadhar Number from session token
    token = request.cookies.get('token')
    decoded_token = jwt.decode(token , key=app.config['SECRET_KEY'], algorithms=["HS256"])
    aadharNumber = decoded_token.get('aadharNumber')
    coinventors.append(aadharNumber)

    # Extracting text content from pdf
    # file = request.files['file']

    words = abstract.split()
    abstract = ' '.join(words)

    # BERT CODE
    # Tokenize and encode the target description
        # target_input_ids = tokenizer.encode(abstract, add_special_tokens=True)
        # target_input_ids = torch.tensor(target_input_ids).unsqueeze(0)

        # # Get contextualized embeddings for the target description
        # with torch.no_grad():
        #     target_outputs = model(target_input_ids)
        # target_embeddings = target_outputs.last_hidden_state.mean(dim=1)
    
    # T5 Sentence Transformer
    target_embeddings = model.encode(abstract)

    serialized_target_embeddings = pickle.dumps(target_embeddings)
    # serialized_file = pickle.dumps(file.read())

    collection_patents.insert_one({'title' : title , 'aadharNumbers' : coinventors , 'abstract' : abstract , 'abstract_embeddings' : serialized_target_embeddings , 'patent_status' : PatentStatus.PENDING.value , 'royalty_per_month' : 10 ,'created_at' : datetime.datetime.utcnow() , 'modified_at' : datetime.datetime.utcnow()})
    response.status_code = 200
    response.data = jsonify({'error' : False}).response[0]
    return response
    
@userRoutes.route("/ownedPatents", methods=["POST"])
@validate_token_and_role(Roles.NORMALUSER.value)
def userOwnedPatents():
    token = request.cookies.get("token")
    decoded_token = jwt.decode(token , key=app.config['SECRET_KEY'], algorithms=["HS256"])
    aadharNumber = decoded_token.get('aadharNumber')

    cursor = collection_patents.find({"aadharNumber" : aadharNumber} , {'title' : 1 , 'abstract' : 1 , 'patent_status' : 1 , 'created_at' : 1 , 'modified_at' : 1})
    documents = []
    
    for document in cursor:
        documents.append({"title" : dict(document).get("title") , "abstract" : dict(document).get("abstract") , "patent_status" : dict(document).get("patent_status") , "created_at" : dict(document).get("created_at") , "modified_at" : dict(document).get("modified_at")})

    response = make_response()
    response.status_code = 200
    response.data = jsonify({"documents" : documents}).response[0]
    return response


@userRoutes.route("/patentSearch", methods=["POST"])
@validate_token_and_role(Roles.NORMALUSER.value)
def userPatentSearch():
    # Get Aadhar Number of the User
    token = request.cookies.get("token")
    decoded_token = jwt.decode(token , key=app.config['SECRET_KEY'], algorithms=["HS256"])
    aadharNumber = decoded_token.get('aadharNumber')
    
    # Select Patents based on Search String Matching
    search = dict(request.get_json()).get("search")
    cursor = collection_patents.find({"abstract" : {"$regex" : search , "$options": "i"} , "patent_status" : PatentStatus.APPROVED.value})

    # Remove Patents registered by the Current User
    documents = []
    for document in cursor:
        if aadharNumber not in list(dict(document).get("aadharNumbers")):
            documents.append({"title" : dict(document).get("title") , "abstract" : dict(document).get("abstract") ,"aadharNumber" : dict(document).get("aadharNumbers") , "patent_status" : dict(document).get("patent_status") , "contractAddress" : dict(document).get("contractAddress") , "created_at" : dict(document).get("created_at") , "modified_at" : dict(document).get("modified_at")})

    # Make Response attached with Patents
    response = make_response()
    response.status_code = 200
    response.data = jsonify({"documents" : documents}).response[0]
    return response

@userRoutes.route("/connectMetaAccount", methods=["POST"])
@validate_token_and_role(Roles.NORMALUSER.value)
def connectMetaAccount():
    try:
        # Get User Aadhar Number
        token = request.cookies.get("token")
        decoded_token = jwt.decode(token , key=app.config['SECRET_KEY'], algorithms=["HS256"])
        aadharNumber = decoded_token.get('aadharNumber')

        # Get Meta Address received from request object
        metaAddress = dict(request.get_json()).get("metaAddress")
        
        # Store the Meta Address in the User Document
        filter_criteria = {"aadharNumber" : aadharNumber}
        update_data = {
            "$set" : {
                "metaAddress" : metaAddress,
                "modified_at" : datetime.datetime.utcnow()
            }
        }
        collection_user.update_one(filter=filter_criteria , update=update_data)
        
        # Generate Response
        response = make_response()
        response.status_code = 200
        response.data = jsonify({"error" : False}).response[0]
        return response
    
    except Exception as e:
        response = make_response()
        response.status_code = 403
        response.data = jsonify({"error" : True , "errorMessage" : f"{e}"}).response[0]
        return response
    
@userRoutes.route("/contractAddress", methods=["POST"])
@validate_token_and_role(Roles.NORMALUSER.value)
def updateContractAddressToRespectivePatent():
    try:
        # Contract Address and Patent Title Received from the Client
        contractAddress = dict(request.get_json()).get("contractAddress")
        title = dict(request.get_json()).get("title")

        # Contract Address is stored in the Patent Document
        filter_criteria = {"title" : title}
        update_data = {
            "$set" : {
                "contractAddress" : contractAddress,
                "modified_at" : datetime.datetime.utcnow()
            }
        }
        collection_patents.update_one(filter=filter_criteria , update=update_data)
        
        # Response Generated to User
        response = make_response()
        response.status_code = 200
        response.data = jsonify({"error" : False}).response[0]
        return response
    
    except Exception as e:
        response = make_response()
        response.status_code = 403
        response.data = jsonify({"error" : True , "errorMessage" : f"{e}"}).response[0]
        return response
    
@userRoutes.route("/contractAddress", methods=["GET"])
@validate_token_and_role(Roles.NORMALUSER.value)
def getContractAddressWithPatentTitle():
    try:
        # Contract Address and Patent Title Received from the Client
        title = request.args.get("title")

        # Contract Address is stored in the Patent Document
        patentDetails = collection_patents.find_one({"title" : title} , {'contractAddress' : 1})
        print(patentDetails)
        # Response Generated to User
        response = make_response()
        response.status_code = 200
        response.data = jsonify({"error" : False , "contractAddress" : patentDetails["contractAddress"]}).response[0]
        return response
    
    except Exception as e:
        print(e)
        response = make_response()
        response.status_code = 403
        response.data = jsonify({"error" : True , "errorMessage" : f"{e}"}).response[0]
        return response

@userRoutes.route("/signup", methods=["POST"])
def userSignUp():
    name = dict(request.get_json()).get("name")
    aadharNumber = dict(request.get_json()).get("aadharNumber")
    password = dict(request.get_json()).get("password")

    users = collection_user.find_one({"aadharNumber": aadharNumber})
    response = make_response()

    if users:
        response.status_code = 401
        response.data = jsonify({
            "message": "aadharNumber Already Exists", "error": True}).response[0]
        return response

    hashed_password = generate_password_hash(password)
    collection_user.insert_one(
        {"name" : name, "aadharNumber": aadharNumber, "hashedPassword": hashed_password})
    response.status_code = 200
    response.data = jsonify(
        {"error": False, "message": "Account Created Successfully"}).response[0]
    return response

@userRoutes.route("/login", methods=["POST"])
def userLogin():
    aadharNumber = dict(request.get_json()).get("aadharNumber")
    password = dict(request.get_json()).get("password")

    account = collection_user.find_one({"aadharNumber": aadharNumber})
    response = make_response()

    if account == None:
        response.status_code = 401
        response.data = jsonify(
            {"error": True, "message": "Invalid Aadhar Number"}).response[0]
        return response

    if check_password_hash(account.get("hashedPassword"), password) == False:
        response.status_code = 401
        response.data = jsonify(
            {"error": True, "message": "Invalid Password"}).response[0]
        return response

    expire_date = datetime.datetime.utcnow() + datetime.timedelta(days=7)
    token = jwt.encode(payload={'aadharNumber': aadharNumber , 'role' : Roles.NORMALUSER.value, 'exp': expire_date}, key=app.config['SECRET_KEY'], algorithm="HS256")
    response.data = jsonify(
        {"error": False, "message": "Valid Credentials"}).response[0]
    response.status_code = 200
    response.set_cookie('token', token, max_age=60*60*24*7 , secure=True , samesite='None' , httponly=True , path='/')
    return response

@userRoutes.route("/users" , methods=["GET"])
@validate_token_and_role(Roles.NORMALUSER.value)
def getUsernameAndAadhar():
    try:
        token = request.cookies.get("token")
        decoded_token = jwt.decode(token , key=app.config['SECRET_KEY'], algorithms=["HS256"])
        ownerAadharNumber = decoded_token.get('aadharNumber')
        cursor = collection_user.find({} , {'name' : 1 , 'aadharNumber' : 1 , 'metaAddress' : 1})
        documents = []
        
        for document in cursor:
            if dict(document).get("aadharNumber") != ownerAadharNumber :
                documents.append({"aadharNumber" : dict(document).get("aadharNumber") , "name" : dict(document).get("name") , "metaAddress" : dict(document).get("metaAddress")})

        response = make_response()
        response.status_code = 200
        response.data = jsonify({"error" : False , "documents" : documents}).response[0]
        return response
    except Exception as e:
        print(e)
        response = make_response()
        response.status_code = 403
        response.data = jsonify({"error" : True , "errorMessage" : f"{e}"}).response[0]
        return response

@userRoutes.route("/storeTransaction", methods=["POST"])
@validate_token_and_role(Roles.NORMALUSER.value)
def storeTransaction():
    try:
        ownerAadharNumber = dict(request.get_json()).get("ownerAadharNumber")
        token = request.cookies.get("token")
        decoded_token = jwt.decode(token , key=app.config['SECRET_KEY'], algorithms=["HS256"])
        senderAadharNumber = decoded_token.get('aadharNumber')
        title = dict(request.get_json()).get("title")
        months = dict(request.get_json()).get("months")
        amountInWeiPayed = dict(request.get_json()).get("amountInWeiPayed")
        amountInDollarPayed = dict(request.get_json()).get("amountInDollarPayed")

        collection_transaction.insert_one({"ownerAadharNumber" : ownerAadharNumber , "senderAadharNumber" : senderAadharNumber , "title" : title , "months" : months , "amountInWeiPayed" : amountInWeiPayed , "amountInDollarPayed" : amountInDollarPayed , "created_at" : datetime.datetime.utcnow() , "modified_at" : datetime.datetime.utcnow()})

        response = make_response()
        response.status_code = 200
        response.data = jsonify({"error" : False}).response[0]
        return response        
    except Exception as e:
        response = make_response()
        response.status_code = 403
        response.data = jsonify({"error" : True , "errorMessage" : f"{e}"}).response[0]
        return response
    
@userRoutes.route("/patentStatus" , methods=["GET"])
@validate_token_and_role(Roles.NORMALUSER.value)
def patentStatus():
    try:
        # Get User Aadhar Number
        token = request.cookies.get("token")
        decoded_token = jwt.decode(token , key=app.config['SECRET_KEY'], algorithms=["HS256"])
        aadharNumber = decoded_token.get('aadharNumber')

        # Get Patent Title And Status of the user
        query = {'aadharNumbers': {'$in': [aadharNumber]}}
        projection = {'_id' : 0, 'title' : 1 , 'patent_status' : 1 , 'created_at' : 1 , 'royalty_per_month' : 1}
        cursor = collection_patents.find(query , projection)

        # Storing it in Documents List
        documents = []
        for patent in cursor:
            documents.append({
                "title" : dict(patent).get("title"),
                "royalty_per_month" : dict(patent).get("royalty_per_month"),
                "patentStatus" : dict(patent).get("patent_status"),
                "createdAt" : dict(patent).get("created_at")
            })

        # Generating Response
        response = make_response()
        response.status_code = 200
        response.data = jsonify({"error" : False , "documents" : documents}).response[0]
        return response

    except Exception as e:
        response = make_response()
        response.status_code = 403
        response.data = jsonify({"error" : True , "errorMessage" : f"{e}"}).response[0]
        return response
    
@userRoutes.route("/royaltyMade" , methods=["POST"])
@validate_token_and_role(Roles.NORMALUSER.value)
def royaltyMade():
    try:
        # Get User Aadhar Number
        token = request.cookies.get("token")
        decoded_token = jwt.decode(token , key=app.config['SECRET_KEY'], algorithms=["HS256"])
        aadharNumber = decoded_token.get('aadharNumber')

        # Get Patent Title, Amount Payed, Validity Date
        query = {'senderAadharNumber': aadharNumber}
        projection = {'_id' : 0, 'title' : 1 , 'months' : 1 , 'amountInWeiPayed' : 1 , 'amountInDollarPayed' : 1, 'created_at' : 1}
        cursor = collection_transaction.find(query , projection)

        # Store it in document list
        documents = []
        for document in cursor:
            documents.append({
                "title" : dict(document).get("title"),
                "months" : int(dict(document).get("months")),
                'amountInWeiPayed' : dict(document).get("amountInWeiPayed"),
                'amountInDollarPayed' : dict(document).get("amountInDollarPayed"),
                "createdAt" : dict(document).get("created_at"),
            })

        # Generating Response
        response = make_response()
        response.status_code = 200
        response.data = jsonify({"error" : False , "documents" : documents}).response[0]
        return response

    except Exception as e:
        response = make_response()
        response.status_code = 403
        response.data = jsonify({"error" : True , "errorMessage" : f"{e}"}).response[0]
        return response
    
@userRoutes.route("/royaltyReceived" , methods=["POST"])
@validate_token_and_role(Roles.NORMALUSER.value)
def royaltyReceived():
    try:
        # Get User Aadhar Number
        token = request.cookies.get("token")
        decoded_token = jwt.decode(token , key=app.config['SECRET_KEY'], algorithms=["HS256"])
        aadharNumber = decoded_token.get('aadharNumber')

        # Get Patent Titles of the User
        query = {'aadharNumbers': {'$in': [aadharNumber]}}
        projection = {'_id' : 0, 'title' : 1 , 'aadharNumbers' : 1}
        cursor = collection_patents.find(query , projection)
        patentTitles = []
        titleToCoinventors = {}
        for doc in cursor:
            patentTitles.append(dict(doc).get('title'))
            titleToCoinventors[dict(doc).get('title')] = len(dict(doc).get('aadharNumbers'))
        
        # Now get the patent titles of the user
        query = {"title": {"$in": patentTitles}}
        cursor = collection_transaction.find(query)
        
        documents = []
        for document in cursor:
            documents.append({
                'title' : document.get("title"),
                'months' : document.get('months'),
                'numberOfCoinventors' : titleToCoinventors[dict(doc).get('title')],
                'amountInWeiPayed' : document.get('amountInWeiPayed'),
                'amountInDollarPayed' : document.get('amountInDollarPayed'),
                'senderAadharNumber' : document.get('senderAadharNumber'),
                'createdAt' : document.get('created_at')
            })
        
        # Generating Response
        response = make_response()
        response.status_code = 200
        response.data = jsonify({"error" : False , "documents" : documents}).response[0]
        return response

    except Exception as e:
        response = make_response()
        response.status_code = 403
        response.data = jsonify({"error" : True , "errorMessage" : f"{e}"}).response[0]
        return response
    

@userRoutes.route("/patent" , methods=["DELETE"])
@validate_token_and_role(Roles.NORMALUSER.value)
def deletePatent():
    try:
        patentTitle = request.args.get("patentTitle")
        response = make_response()
        result = collection_patents.delete_one({"title" : patentTitle})
        if result.deleted_count == 1:
            response.status_code = 200
            response.data = jsonify({"error" : False}).response[0]
            return response
        else:
            response.status_code = 204
            response.data = jsonify({"error" : False}).response[0]
            return response
    except Exception as e:
        print("Check")
        response = make_response()
        response.status_code = 403
        response.data = jsonify({"error" : True , "errorMessage" : f"{e}"}).response[0]
        return response
    
@userRoutes.route("/patent" , methods=["PUT"])
@validate_token_and_role(Roles.NORMALUSER.value)
def updateData():
    try:
        patentTitle = request.args.get("title")
        newAmount = request.args.get("amount")

        response = make_response()
        result = collection_patents.find_one_and_update({"title" : patentTitle} , {'$set': {'royalty_per_month': newAmount}})
        
        if result != None:
            response.status_code = 200
            response.data = jsonify({"error" : False}).response[0]
            return response
        else:
            response.status_code = 204
            response.data = jsonify({"error" : True , 'message' : 'Patent Not Found'}).response[0]
            return response
    except Exception as e:
        response = make_response()
        response.status_code = 403
        response.data = jsonify({"error" : True , "errorMessage" : f"{e}"}).response[0]
        return response
    
@userRoutes.route("/aadhar" , methods=["GET"])
@validate_token_and_role(Roles.NORMALUSER.value)
def getUserAadhar():
    try:
        token = request.cookies.get('token')
        decoded_token = jwt.decode(token , key=app.config['SECRET_KEY'], algorithms=["HS256"])
        aadharNumber = decoded_token.get('aadharNumber')
        response = make_response()
        response.status_code = 200
        response.data = jsonify({"error" : True , "aadharNumber" : aadharNumber}).response[0]
        return response
    except Exception as e:
        response = make_response()
        response.status_code = 403
        response.data = jsonify({"error" : True , "errorMessage" : f"{e}"}).response[0]
        return response