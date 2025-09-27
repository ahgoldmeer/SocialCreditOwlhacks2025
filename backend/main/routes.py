from flask import jsonify, request
from database import db

from . import bp

@bp.route('/', methods=['GET'])
def index():
	db.test()
	return jsonify({'message': 'SocialCredit API backend running'}), 200


@bp.route('/health', methods=['GET'])
def health():
	return jsonify({'status': 'ok'}), 200


@bp.route('/echo', methods=['POST'])
def echo():
	data = request.get_json(silent=True) or {}
	return jsonify({'received': data}), 200

