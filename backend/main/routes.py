from flask import jsonify, request
from database import db

from . import bp

@bp.route('/', methods=['GET'])
def index():
	result = add_user()
	print(result)
	return jsonify({'message': 'SocialCredit API backend running'}), 200


@bp.route('/health', methods=['GET'])
def health():
	return jsonify({'status': 'ok'}), 200


@bp.route('/echo', methods=['POST'])
def echo():
	data = request.get_json(silent=True) or {}
	return jsonify({'received': data}), 200

@bp.route('/add_user', methods=['POST'])
def add_user():
	data = request.get_json(silent=True) or { }
	username = data.get('username')
	email = data.get('email')
	password_hash = data.get('password_hash')
	createdAt = data.get('createdAt')

	if not username or not email or not password_hash or not createdAt:
		return jsonify({'error': 'Missing required fields'}), 400

	try:
		user_info = db.add_user(username, email, password_hash, createdAt)
		return jsonify({'message': 'User added', 'user_info': str(user_info)}), 201
	except Exception as e:
		return jsonify({'error': str(e)}), 500

