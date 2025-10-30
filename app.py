from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import google.generativeai as genai
import os
import pdfplumber
import re
from datetime import datetime
from dotenv import load_dotenv
from functools import lru_cache  # For caching

load_dotenv()  # Loads .env vars

# --- Flask App Setup ---
app = Flask(__name__, static_url_path='/assets', static_folder='assets')

CORS(app)

# --- Global Variables ---
doc_context = ""
chat_history = []  # Simple in-memory history (list of dicts)

# --- Generative AI Configuration ---
API_KEY = os.getenv('GEMINI_API_KEY')  # Use GEMINI_API_KEY from .env
if not API_KEY:
    raise ValueError("GEMINI_API_KEY environment variable is not set!")

genai.configure(api_key=API_KEY)

# --- System Instruction ---
SYSTEM_INSTRUCTION_NEW = (
    "You are A.R.I.S.E., an advanced AI assistant integrated into Vazeer Ahmed’s portfolio website. "
    "Your full form is 'Advanced Reasoning and Intelligent Support Engine.' "
    "You are friendly, professional, and focused on providing accurate, clear, and helpful answers related to Vazeer’s technical background.\n\n"
    
    "=== CORE BEHAVIOR RULES ===\n"
    "1. Tone & Personality:\n"
    "   - Be warm, concise, and confident.\n"
    "   - Use professional yet approachable language.\n"
    "   - Never use emojis, markdown symbols, or unnecessary punctuation.\n\n"
    
    "2. Knowledge Scope:\n"
    "   - Focus only on Vazeer’s professional topics: projects, skills, education, certifications, tools, and technologies.\n"
    "   - You may also explain general concepts in programming, machine learning, AI, or data science if relevant.\n"
    "   - Politely decline unrelated topics (e.g., personal life, hobbies, entertainment, or non-technical chatter) with a standard fallback message:\n"
    "       'That question seems beyond my scope. I can, however, help with Vazeer’s tech profile or related topics!'\n\n"
    
    "3. Context Handling:\n"
    "   - Use details from Vazeer’s uploaded documents when available.\n"
    "   - If information isn’t in the documents, provide a general technical explanation.\n"
    "   - Always keep answers brief, factual, and context-aware.\n\n"
    
    "4. Response Formatting (Plain Text Only):\n"
    "   - No markdown or special symbols.\n"
    "   - Use simple bullet lists: '- Item'\n"
    "   - Indent code examples with four spaces, without code fences.\n"
    "   - Always end responses cleanly (no trailing punctuation or spaces).\n\n"
    
    "5. Example Rule:\n"
    "   - When explaining a concept, first define it generally.\n"
    "   - Then, if relevant, link it to one of Vazeer’s projects for context.\n\n"
    
    "Remember: Your purpose is to help visitors understand Vazeer’s technical expertise and professional profile effectively."
)

# --- Clean Response Function ---
def clean_response(text):
    text = re.sub(r'```[a-zA-Z]*\n', '', text)
    text = re.sub(r'```', '', text)
    text = re.sub(r'\*\*|\*|__|_|#|`', '', text)
    text = re.sub(r'^\s*-\s+', '- ', text, flags=re.MULTILINE)
    text = re.sub(r'^\s*\+\s+', '- ', text, flags=re.MULTILINE)
    text = re.sub(r'^\s*\d+\.\s+', '- ', text, flags=re.MULTILINE)

    lines = text.split('\n')
    cleaned_lines = []
    potential_code_keywords = ['def ', 'if ', 'else:', 'for ', 'while ', 'import ', 'return ', 'console.log', 'printf', '{', '}', ';', '(', ')']

    for line in lines:
        stripped_line = line.strip()
        if not stripped_line:
            cleaned_lines.append("")
            continue
        if stripped_line.startswith('- '):
            cleaned_lines.append(stripped_line)
            continue
        if (line.startswith(' ') and len(line) > len(stripped_line)) or any(keyword in stripped_line for keyword in potential_code_keywords):
            if not line.startswith('    '):
                cleaned_lines.append('    ' + stripped_line)
            else:
                cleaned_lines.append(line)
        else:
            cleaned_lines.append(stripped_line)

    text = '\n'.join(cleaned_lines)
    text = re.sub(r'\n\s*\n+', '\n\n', text)
    return text.strip()

# --- Load Documents for Context (Summarized & Cached) ---
@lru_cache(maxsize=1)  # Cache forever, since docs don't change often
def load_docs_context():
    global doc_context
    docs_folder = "docs"
    raw_content = ""  # Temp holder for full text

    if not os.path.exists(docs_folder):
        print(f"Warning: 'docs' folder not found at {docs_folder}")
        doc_context = "No documents available."
        return doc_context

    # Load raw content (as before)
    for filename in os.listdir(docs_folder):
        file_path = os.path.join(docs_folder, filename)
        try:
            if filename.lower().endswith('.pdf'):
                with pdfplumber.open(file_path) as pdf:
                    text_content = ""
                    for page in pdf.pages:
                        text = page.extract_text()
                        if text:
                            text_content += text + "\n"
                if text_content:
                    raw_content += f"\n--- {filename} ---\n{text_content}\n"
            elif filename.lower().endswith(('.py', '.js', '.html', '.css')):
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    raw_content += f"\n--- {filename} ---\n{content}\n"
        except Exception as e:
            print(f"Error processing file {filename}: {e}")

    # Summarize with Gemini (one-time per app start)
    if raw_content.strip():
        summary_prompt = (
            "Summarize the following documents into a concise context for an AI assistant on Vazeer's tech portfolio. "
            "Focus on key skills, projects (e.g., titles, tech used, outcomes), education, experience. "
            "Keep under 1000 words. Structure as bullet points by section (e.g., Projects, Skills). Plain text only.\n\n"
            f"{raw_content}"
        )
        try:
            summary_model = genai.GenerativeModel("gemini-2.0-flash")  # No system instr needed
            summary_response = summary_model.generate_content(summary_prompt)
            doc_context = clean_response(summary_response.text)  # Use your cleaner
            print(f"Summarized context length: {len(doc_context)} chars (shorter = faster)")
        except Exception as e:
            print(f"Summarization failed: {e}. Using raw (may be slow).")
            doc_context = raw_content[:2000] + "\n... (truncated for speed)"
    else:
        doc_context = "No documents to summarize."

    print("Documents summarized and cached successfully.")
    return doc_context

load_docs_context()

# --- Initialize AI Model ---
model = genai.GenerativeModel("gemini-2.0-flash", tools=[], system_instruction=SYSTEM_INSTRUCTION_NEW)
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
    global chat_history, chat
    data = request.json
    user_message = data.get('message', '').strip()
    if not user_message:
        return jsonify({'error': 'No message provided'}), 400

    # Greeting handler
    greeting_patterns = [
        r'\b(hello|hi|hey|greetings|good (morning|afternoon|evening)|sup|yo)\b',
        r'\b(sorry|apologies|oops|my bad)\b',
        r'\b(bye|goodbye|see you|farewell)\b'
    ]
    user_message_lower = user_message.lower()
    is_greeting = any(re.search(pattern, user_message_lower) for pattern in greeting_patterns)
    
    if is_greeting:
        if 'bye' in user_message_lower or 'goodbye' in user_message_lower:
            bot_response = "Goodbye! Feel free to return anytime for tech insights on Vazeer's portfolio."
        else:
            bot_response = "Hello! I'm A.R.I.S.E. (Advanced Reasoning and Intelligent Support Engine), your guide to Vazeer's tech world. Ask about his projects, skills, etc."
        chat_history.append({"is_user": False, "text": bot_response})
        return jsonify({'response': bot_response, 'source': 'greeting_handler'})

    non_tech_keywords = [
        'singing', 'cooking', 'music', 'art', 'hobbies', 'personal life',
        'favorite food', 'what is love', 'meaning of life', 'how are you feeling',
        'what do you think about', 'who are you', 'tell me about yourself',
        'weather', 'politics', 'movies', 'books', 'sports', 'games', 'entertainment',
        'tell me a story', 'joke', 'what to do today', 'how was your day'
    ]
    if any(keyword in user_message_lower for keyword in non_tech_keywords):
        bot_response = "I cannot provide an answer for this question, as it is outside my scope."
        chat_history.append({"is_user": False, "text": bot_response})
        return jsonify({'response': bot_response, 'source': 'bot_scope'})

    chat_history.append({"is_user": True, "text": user_message})
    
    # Limit context if huge (safety net)
    context_to_use = doc_context
    if len(doc_context) > 3000:  # Adjust based on your summary size
        context_to_use = doc_context[:3000] + "\n... (context truncated for speed)"
    
    prompt_with_context = f"{SYSTEM_INSTRUCTION_NEW}\n\nContext: {context_to_use}\nUser's Question: {user_message}"
    response = chat.send_message(prompt_with_context)
    cleaned_response = clean_response(response.text)
    chat_history.append({"is_user": False, "text": cleaned_response})
    return jsonify({'response': cleaned_response, 'source': 'model'})

@app.route('/get_history')
def get_history():
    return jsonify(chat_history)

@app.route('/new_chat', methods=['POST'])
def new_chat():
    global chat_history, chat
    chat_history = []
    chat = model.start_chat(history=[])  # Reset chat
    # No load_docs_context() here—it's cached globally now
    return jsonify({"status": "ok", "message": "New chat started. A.R.I.S.E is ready!"})

@app.route('/summarize', methods=['GET'])
def summarize_chat():
    if not chat_history:
        return jsonify({"summary": "There's nothing to summarize yet, A.R.I.S.E is waiting for your questions."})
    full_conversation = "\n".join([f"{'User' if msg['is_user'] else 'A.R.I.S.E'}: {msg['text']}" for msg in chat_history])
    prompt = f"As A.R.I.S.E, provide a concise summary in plain-text bullet points.\n\n{full_conversation}"
    summary_response = model.generate_content(prompt, tools=[])
    cleaned_summary = clean_response(summary_response.text)
    return jsonify({"summary": cleaned_summary})

@app.route('/suggest_reply', methods=['GET'])
def suggest_reply():
    last_bot = next((msg for msg in reversed(chat_history) if not msg['is_user']), None)
    if not last_bot:
        return jsonify({"suggestion": "How can A.R.I.S.E assist you today?"})
    prompt = f"As A.R.I.S.E, based on this statement: '{last_bot['text']}', suggest one short, relevant question or reply in plain text."
    suggestion_response = model.generate_content(prompt, tools=[])
    clean_suggestion = clean_response(suggestion_response.text).strip().strip('"')
    return jsonify({"suggestion": clean_suggestion})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
