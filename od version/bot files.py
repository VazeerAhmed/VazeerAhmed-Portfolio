from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import google.generativeai as genai

app = Flask(__name__, static_url_path='')
CORS(app)

API_KEY = "AIzaSyBNMYYZYwjVzyan3hh-jlL4pRBybVfqHjY"  # Your Google Gemini API key
genai.configure(api_key=API_KEY)

model = genai.GenerativeModel("gemini-1.5-flash")
chat = model.start_chat(history=[
    {"role": "user", "parts": ["You are an AI assistant for Vazeer Ahmed Mohammad's portfolio. Answer questions about his skills, projects, and resume. Be professional and concise."]},
    {"role": "model", "parts": ["Got it! I'm ready to assist. Ask away!"]}
])

@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')

@app.route('/assets/<path:path>')
def serve_static(path):
    return send_from_directory('assets', path)

@app.route('/chat', methods=['POST'])
def chat_endpoint():
    data = request.json
    user_input = data.get('message')
    if not user_input:
        return jsonify({'error': 'No message provided'}), 400
    response = chat.send_message(user_input)
    return jsonify({'response': response.text})

if __name__ == '__main__':
    app.run(debug=True, port=5000)









from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
from dotenv import load_dotenv  # For loading .env
import google.generativeai as genai
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain.vectorstores import Chroma
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.chains import RetrievalQA
from langchain.document_loaders import TextLoader, PyPDFLoader
from langchain.document_loaders import DirectoryLoader

load_dotenv()  # Load .env file
app = Flask(__name__, static_url_path='')
CORS(app)

API_KEY = os.getenv('GEMINI_API_KEY')  # Use env var for security
genai.configure(api_key=API_KEY)

# Global variables for RAG
vectorstore = None
qa_chain = None

def index_docs():
    """Index all files in docs/ folder into ChromaDB."""
    global vectorstore, qa_chain
    
    docs_dir = 'docs'
    if not os.path.exists(docs_dir):
        print("No docs/ folder found. Create it and add files.")
        return
    
    # Load documents (handles .py, .html, .css, .js, .pdf)
    loader = DirectoryLoader(
        docs_dir,
        glob="**/*.*",  # All files
        loader_cls=PyPDFLoader,  # Default to PDF loader, but override for text
        loader_kwargs={'extract_images': False}  # Skip images in PDFs
    )
    # Custom loader for non-PDFs (TextLoader)
    docs = []
    for file_path in os.listdir(docs_dir):
        full_path = os.path.join(docs_dir, file_path)
        if file_path.endswith('.pdf'):
            loader = PyPDFLoader(full_path)
        else:
            loader = TextLoader(full_path, encoding='utf-8')
        docs.extend(loader.load())
    
    # Split into chunks (e.g., 1000 chars, overlap 200)
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000, chunk_overlap=200
    )
    splits = text_splitter.split_documents(docs)
    
    # Embed with Gemini
    embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001", google_api_key=API_KEY)
    
    # Store in ChromaDB (persistent in ./chroma_db)
    vectorstore = Chroma.from_documents(
        documents=splits,
        embedding=embeddings,
        persist_directory="./chroma_db"  # Saves locally
    )
    vectorstore.persist()
    
    # Create QA chain with Gemini
    llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", google_api_key=API_KEY)
    qa_chain = RetrievalQA.from_chain_type(
        llm=llm,
        chain_type="stuff",
        retriever=vectorstore.as_retriever(search_kwargs={"k": 3}),  # Top 3 relevant chunks
        return_source_documents=True
    )
    print("Docs indexed successfully!")

# Index on startup
index_docs()

@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')

@app.route('/assets/<path:path>')
def serve_static(path):
    return send_from_directory('assets', path)

@app.route('/chat', methods=['POST'])
def chat_endpoint():
    data = request.json
    user_input = data.get('message')
    if not user_input:
        return jsonify({'error': 'No message provided'}), 400
    
    if not qa_chain:
        return jsonify({'error': 'RAG not initialized'}), 500
    
    # Use RAG to get response
    result = qa_chain.invoke({"query": user_input})
    response_text = result['result']
    
    # Optional: Include sources (file snippets) for transparency
    sources = [doc.metadata.get('source', 'Unknown') for doc in result['source_documents']]
    
    return jsonify({
        'response': response_text,
        'sources': sources  # e.g., ['docs/app.py', 'docs/project_house_price.pdf']
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)