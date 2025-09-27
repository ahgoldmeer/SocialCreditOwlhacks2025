from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/', methods=['GET'])
def index():
    return jsonify({'message': 'SocialCredit API backend running'}), 200

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'}), 200

@app.route('/echo', methods=['POST'])
def echo():
    data = request.get_json(silent=True) or {}
    return jsonify({'received': data}), 200

if __name__ == '__main__':
    # Use 127.0.0.1 and a fixed port so it's easy to test locally.
    app.run(host='127.0.0.1', port=5000, debug=True)
