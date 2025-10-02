from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import google.generativeai as genai
import os
from flask_sqlalchemy import SQLAlchemy
import pdfplumber
import json
import re
from datetime import datetime

# --- Web Search Tool (simulated for this environment) ---
def web_search(query: str):
    """Performs a web search for the given query and returns results."""
    print(f"--- Performing web search for: {query} ---")
    return json.dumps([
        {"title": f"What is {query}?", "snippet": f"{query} is a topic of great interest."},
        {"title": f"Recent news about {query}", "snippet": f"New developments concerning {query} have emerged recently."}
    ])

# --- Flask App Setup ---
app = Flask(__name__, static_url_path='')
CORS(app)

# --- Database Configuration ---
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///chat_history.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# --- Global variable for document context ---
doc_context = ""

# --- Generative AI Configuration ---
API_KEY = "AIzaSyBNMYYZYwjVzyan3hh-jlL4pRBybVfqHjY"
genai.configure(api_key=API_KEY)

# --- Database Model ---
class ChatMessage(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    is_user = db.Column(db.Boolean, nullable=False)
    message = db.Column(db.Text, nullable=False)

with app.app_context():
    db.create_all()

# --- Generative AI Model with Tool ---
search_tool = genai.protos.Tool(
    function_declarations=[
        genai.protos.FunctionDeclaration(
            name='web_search',
            description='Performs a web search to find recent or real-time information.',
            parameters=genai.protos.Schema(
                type=genai.protos.Type.OBJECT,
                properties={
                    'query': genai.protos.Schema(type=genai.protos.Type.STRING, description='The search query')
                },
                required=['query']
            )
        )
    ]
)

# --- System Instruction for the Bot's Personality ---
SYSTEM_INSTRUCTION = (
    "Your name is  A.R.I.S.E. You are a helpful and friendly AI assistant for Vazeer Ahmed Mohammad's portfolio. "
    "Classify each question into one of three categories: "
    "- Portfolio questions: Explicitly about Vazeer’s skills, projects, resume, or portfolio. Answer these using only the provided document content, with plain-text bullet points (e.g., '- Item') for lists. If the answer cannot be found, say 'I cannot find the answer in the provided documents.' "
    "- Subject questions: Related to programming, data science, or technical topics (e.g., Python, C, algorithms, loops, software development). Answer these using your general knowledge or the web search tool. Format code examples as plain text with four spaces indentation for each line (e.g., '    printf(\"Hello\");'), without using Markdown code fences like ```c or ```. Use plain-text bullet points for lists when appropriate. "
    "- Non-subject questions: Unrelated to Vazeer’s portfolio or technical topics (e.g., music, art, general non-technical topics). Respond with 'I cannot provide an answer for this question, as it is outside my scope.' "
        "Do not use Markdown symbols like **, __, *, or ``` for formatting; use plain text only to ensure compatibility with the web interface. "
    "Structure answers to be neat, organized, and user-friendly, avoiding dense paragraphs."
    
)

# --- Clean Response Function ---
def clean_response(text):
    """Remove Markdown artifacts and ensure clean plain-text bullet points and code."""
    # Remove Markdown code fences
    text = re.sub(r'```c\n|```python\n|```', '', text)
    # Remove common Markdown symbols
    text = re.sub(r'\*\*|\*|__|#', '', text)
    # Replace Markdown bullet points with plain-text bullets
    text = re.sub(r'^\s*\*\s+', '- ', text, flags=re.MULTILINE)
    # Ensure consistent spacing
    text = re.sub(r'\n\s*\n+', '\n', text)
    # Normalize code indentation to four spaces
    lines = text.split('\n')
    cleaned_lines = []
    in_code_block = False
    for line in lines:
        if line.strip() and not line.startswith('- ') and not in_code_block:
            in_code_block = True
            cleaned_lines.append(f"    {line.strip()}")
        elif line.startswith('- '):
            in_code_block = False
            cleaned_lines.append(line)
        elif in_code_block:
            cleaned_lines.append(f"    {line.strip()}")
        else:
            cleaned_lines.append(line)
    return '\n'.join(cleaned_lines).strip()

# --- Read Files from `docs` Folder ---
def load_docs_context():
    global doc_context
    docs_folder = "docs"
    doc_context = ""
    
    if not os.path.exists(docs_folder):
        print(f"Warning: 'docs' folder not found at {docs_folder}")
        return

    for filename in os.listdir(docs_folder):
        file_path = os.path.join(docs_folder, filename)
        try:
            if filename.lower().endswith('.pdf'):
                # Extract text from PDF
                with pdfplumber.open(file_path) as pdf:
                    for page in pdf.pages:
                        text = page.extract_text()
                        if text:
                            doc_context += f"\n--- {filename} ---\n{text}\n"
            elif filename.lower().endswith(('.py', '.js', '.html', '.css')):
                # Read code files as plain text
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    doc_context += f"\n--- {filename} ---\n{content}\n"
            else:
                print(f"Skipping unsupported file: {filename}")
        except Exception as e:
            print(f"Error processing file {filename}: {e}")

    if not doc_context:
        print("No content loaded from 'docs' folder.")
    else:
        print(f"Loaded context from {docs_folder} successfully.")

# Load documents at startup
load_docs_context()

# --- Model Initialization ---
model = genai.GenerativeModel(
    "gemini-1.5-flash",
    tools=[search_tool],
    system_instruction=SYSTEM_INSTRUCTION
)

chat = model.start_chat(history=[])

# --- Routes ---

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/assets/<path:path>')
def serve_static(path):
    return send_from_directory('assets', path)

@app.route('/chat', methods=['POST'])
def chat_endpoint():
    global doc_context
    data = request.json
    user_message = data.get('message', '').lower().strip()  # Convert to lowercase for case-insensitive check
    if not user_message:
        return jsonify({'error': 'No message provided'}), 400

    try:
        # Save user message to DB
        user_db_message = ChatMessage(is_user=True, message=user_message)
        db.session.add(user_db_message)
        db.session.commit()

        # Check for greeting
        greeting_keywords = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'how are you', 'greetings', 'what\'s up', 'yo', 'sup', 'hey there', 'hi there', 'hello there']
        if any(greeting in user_message for greeting in greeting_keywords):
            current_time = datetime.now().strftime('%I:%M %p %Z on %A, %B %d, %Y')
            welcome_message = f"Hello there! How can i help you today?."
            cleaned_response = clean_response(welcome_message)
            bot_db_message = ChatMessage(is_user=False, message=cleaned_response)
            db.session.add(bot_db_message)
            db.session.commit()
            return jsonify({'response': cleaned_response, 'source': 'model'})

        # Determine if the question is portfolio-related
        portfolio_keywords = ['vazeer', 'portfolio', 'resume', 'project', 'skill', 'experience', 'education',
                              'covid-19', 'house price', 'chat assistant', 'visualization', 'navigation', 'chat bot', 'swecha']
        is_portfolio_question = any(keyword in user_message for keyword in portfolio_keywords)

        final_prompt = user_message
        if is_portfolio_question and doc_context:
            # Portfolio-related: use document context
            final_prompt = (
                "Classify the following question as a portfolio question about Vazeer Ahmed Mohammad’s skills, projects, resume, or portfolio. "
                "Answer using only the provided document content, with plain-text bullet points (e.g., '- Item') for lists of projects, skills, or other enumerated information. "
                "Do not use Markdown symbols like **, __, *, or ```; use plain text only. "
                "If the answer cannot be found in the document, say 'I cannot find the answer in the provided documents.'\n\n"
                "--- DOCUMENT CONTENT ---\n"
                f"{doc_context}\n"
                "--- END OF DOCUMENT ---\n\n"
                f"Question: {user_message}"
            )
        else:
            # Subject or non-subject: let the model classify
            final_prompt = (
                f"Classify the following question as either a subject question (related to programming, data science, or technical topics like Python, C, algorithms, loops) or a non-subject question (unrelated to technical topics, e.g., music, art). "
                "For subject questions, answer using your general knowledge or the web search tool, with plain-text bullet points (e.g., '- Item') for lists. "
                "Format code examples as plain text with four spaces indentation for each line (e.g., '    printf(\"Hello\");'), without using Markdown code fences like ```c or ```. "
                "For non-subject questions, respond with 'I cannot provide an answer for this question, as it is outside my scope.' "
                "Do not use Markdown symbols like **, __, *, or ```; use plain text only.\n\n"
                f"Question: {user_message}"
            )

        # Send message to model
        response = chat.send_message(final_prompt)
        response_part = response.parts[0]
        source_type = "model"

        if response_part.function_call:
            source_type = "web"
            function_call = response_part.function_call
            if function_call.name == 'web_search':
                query = function_call.args['query']
                search_results = web_search(query)
                response = chat.send_message(
                    genai.protos.Part(
                        function_response=genai.protos.FunctionResponse(
                            name='web_search',
                            response={'results': search_results}
                        )
                    )
                )

        # Clean the response to remove Markdown artifacts
        cleaned_response = clean_response(response.text)

        # Save bot response to DB
        bot_db_message = ChatMessage(is_user=False, message=cleaned_response)
        db.session.add(bot_db_message)
        db.session.commit()

        return jsonify({'response': cleaned_response, 'source': source_type})

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': f"Sorry, an error occurred: {str(e)}"}), 500

@app.route('/get_history')
def get_history():
    messages = ChatMessage.query.order_by(ChatMessage.id).all()
    history = [{"is_user": msg.is_user, "text": msg.message} for msg in messages]
    return jsonify(history)

@app.route('/new_chat', methods=['POST'])
def new_chat():
    global doc_context, chat
    try:
        # Reload documents to ensure latest content
        load_docs_context()
        # Delete all messages from the database
        db.session.query(ChatMessage).delete()
        db.session.commit()
        # Reset the chat session with the model
        chat = model.start_chat(history=[])
        return jsonify({"status": "ok", "message": "New chat started."})
    except Exception as e:
        db.session.rollback()
        print(f"Error starting new chat: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/summarize', methods=['GET'])
def summarize_chat():
    try:
        messages = ChatMessage.query.all()
        if not messages:
            return jsonify({"summary": "There's nothing to summarize yet."})
        full_conversation = "\n".join([f"{'User' if msg.is_user else 'Bot'}: {msg.message}" for msg in messages])
        prompt = (
            "Provide a concise, neutral summary of the following conversation in plain-text bullet points (e.g., '- Item'). "
            "Do not use Markdown symbols like **, __, *, or ```; use plain text only.\n\n"
            f"{full_conversation}"
        )
        summary_response = model.generate_content(prompt, tools=[])
        cleaned_summary = clean_response(summary_response.text)
        return jsonify({"summary": cleaned_summary})
    except Exception as e:
        print(f"Error during summarization: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/suggest_reply', methods=['GET'])
def suggest_reply():
    try:
        last_bot_message = ChatMessage.query.filter_by(is_user=False).order_by(ChatMessage.id.desc()).first()
        if not last_bot_message:
            return jsonify({"suggestion": "How can I help you?"})
        prompt = (
            f"Based on this statement from a chatbot: '{last_bot_message.message}', suggest one short, relevant question or reply a user could send next. "
            "Provide only the text of the suggestion in plain text, without Markdown symbols."
        )
        suggestion_response = model.generate_content(prompt, tools=[])
        clean_suggestion = clean_response(suggestion_response.text).strip().strip('"')
        return jsonify({"suggestion": clean_suggestion})
    except Exception as e:
        print(f"Error suggesting reply: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)