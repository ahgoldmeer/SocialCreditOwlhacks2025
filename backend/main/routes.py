import os
from urllib import response
from flask import jsonify, request
from database import db
import google.genai as genai
from google.genai import types
from datetime import datetime

from . import bp
from auth import require_auth, optional_auth

EMAIL_DOMAIN_SCHOOL_MAP = {
	'temple.edu': 'temple',
	'lasalle.edu': 'lasalle',
	'drexel.edu': 'drexel',
	'upenn.edu': 'upenn',
	'ccp.edu': 'cccp',  # adjust if different
}

def _extract_email_domain(email: str):
	return email.split('@', 1)[1].lower() if '@' in email else ''

def _provision_user_if_needed(claims):
	email = claims.get('email')
	sub = claims.get('sub')
	if not email or not sub:
		return None, 'missing_email_or_sub'
	existing = db.get_user_by_username(email)  # using email as username key for uniqueness
	if existing:
		return existing, None
	# Create new user
	now_iso = datetime.utcnow().isoformat()
	domain = _extract_email_domain(email)
	school = EMAIL_DOMAIN_SCHOOL_MAP.get(domain, '')
	# Password hash not needed for social/JWT auth
	try:
		user_id = db.add_user(username=email, user_email=email, password_hash='', createdAt=now_iso)
		# Align template field names: ensure score field initialized (db template uses score)
		# add_user already inserts template with score 0
		created = db.get_user_by_username(email)
		return created, None
	except Exception as e:
		return None, str(e)

@bp.route('/', methods=['GET'])
def index():
	db.test()
	print(os.getcwd())
	return jsonify({'message': 'SocialCredit API backend running'}), 200


@bp.route('/health', methods=['GET'])
def health():
	return jsonify({'status': 'ok'}), 200


@bp.route('/auth/me', methods=['GET'])
@require_auth
def auth_me():
	claims = getattr(request, 'claims')
	user, err = _provision_user_if_needed(claims)
	if err:
		return jsonify({'error': err}), 400
	# Normalize response
	return jsonify({
		'sub': claims.get('sub'),
		'email': claims.get('email'),
		'user': {
			'username': user.get('username'),
			'email': user.get('email'),
			'school': user.get('school'),
			'score': user.get('points', user.get('score', 0))
		}
	}), 200

@bp.route('/users/me', methods=['GET'])
@require_auth
def users_me():
	claims = getattr(request, 'claims')
	user = db.get_user_by_username(claims.get('email'))
	if not user:
		return jsonify({'error': 'user_not_found'}), 404
	return jsonify({
		'user_id': user.get('username'),
		'score': user.get('points', user.get('score', 0)),
		'school': user.get('school')
	}), 200


@bp.route('/echo', methods=['POST'])
def echo():
	data = request.get_json(silent=True) or {}
	return jsonify({'received': data}), 200

@bp.route('/genai', methods=['GET', 'POST'])
@require_auth
def genai_route():
	genaikey = os.environ.get('GEMINI_KEY')
	client = genai.Client(api_key=genaikey)
	
	if 'image1' not in request.files or 'image2' not in request.files:
		return jsonify({'error': 'Both image1 and image2 files are required.'}), 400
	
	image1 = request.files['image1']
	image2 = request.files['image2']

	image1_path = os.path.join(os.path.dirname(__file__), 'temp_image1.jpg')
	image2_path = os.path.join(os.path.dirname(__file__), 'temp_image2.jpg')
	image1.save(image1_path)
	image2.save(image2_path)

	try:
		uploaded_file = client.files.upload(file=image1_path)
		with open(image2_path, 'rb') as f:
			img2_bytes = f.read()

		# Create the prompt with text and multiple images
		response = client.models.generate_content(

			model="gemini-2.5-flash-lite",
			contents=[
				"Does the second image have less trash than the first image? Respond with yes or no.",
				uploaded_file,  # Use the uploaded file reference
				types.Part.from_bytes(
					data=img2_bytes,
					mime_type='image/png'
				)
			]
		)
		print(response.text)
		# Naive parsing to detect improvement
		text_lower = (response.text or '').lower()
		improved = 'yes' in text_lower and 'no' not in text_lower
		claims = getattr(request, 'claims')
		email = claims.get('email')
		updated_score = None
		if improved and email:
			try:
				# Reuse update_user_score which increments points and school total
				db.update_user_score(email, 1)
				user = db.get_user_by_username(email)
				updated_score = user.get('points', user.get('score', 0))
			except Exception as e:
				print('Failed to update user score:', e)
		return jsonify({
			'response': response.text,
			'improved': improved,
			'score': updated_score
		}), 200

	except Exception as e:
		print("Error during GenAI processing:", e)
		return jsonify({'error': 'Failed to process images with GenAI.'}), 500
	
	finally:
		# Clean up temporary files
		if os.path.exists(image1_path):
			os.remove(image1_path)
		if os.path.exists(image2_path):
			os.remove(image2_path)


	# # Upload the first image
	# base_dir = os.path.dirname(os.path.dirname(__file__))
	# image1_path = os.path.join(base_dir, 'img', 'trash.jpg')
	# if not os.path.exists(image1_path):
	# 	raise FileNotFoundError(f"{image1_path} is not a valid file path")
	# uploaded_file = client.files.upload(file=image1_path)

	# # Prepare the second image as inline data
	# image2_path = os.path.join(base_dir, 'img', 'notrash.jpg')
	# if not os.path.exists(image2_path):
	# 	raise FileNotFoundError(f"{image2_path} is not a valid file path")
	# with open(image2_path, 'rb') as f:
	# 	img2_bytes = f.read()


# User routes
@bp.route('/add_user', methods=['POST'])
@require_auth
def add_user():
	# Protected manual add (mostly for admin/testing)
	data = request.get_json(silent=True) or {}
	username = data.get('username')
	email = data.get('email')
	created_at = data.get('createdAt') or datetime.utcnow().isoformat()
	if not username or not email:
		return jsonify({'error': 'Missing required fields'}), 400
	try:
		user_id = db.add_user(username, email, '', created_at)
		return jsonify({'message': 'User added', 'id': str(user_id)}), 201
	except Exception as e:
		return jsonify({'error': str(e)}), 500


@bp.route('/get_user_details', methods=['GET'])
def get_user_details():
	username = request.args.get('username')
	try:
		user = db.get_user_by_username(username)
		if user:
			user['_id'] = str(user['_id'])  # Convert ObjectId to string for JSON serialization
			return jsonify({'user': user}), 200
		else:
			return jsonify({'error': 'User not found'}), 404
	except Exception as e:
		return jsonify({'error': str(e)}), 500


@bp.route('/add_user_score', methods=['PUT'])
@require_auth
def add_user_score():
	data = request.get_json(silent=True) or { }
	username = data.get('username')
	points = data.get('points')

	if not username or points is None:
		return jsonify({'error': 'Missing required fields'}), 400

	try:
		user = db.get_user_by_username(username)
		if not user:
			return jsonify({'error': 'User not found'}), 404

		# Update user score and history
		new_score = user.get('points', 0) + points
		db.update_user_score(username, points)

		return jsonify({'message': 'User score updated', 'new_score': new_score}), 200
	except Exception as e:
		return jsonify({'error': str(e)}), 500


# School routes
@bp.route('/get_school_details', methods=['GET'])
@optional_auth
def get_school_details():
	school_id = request.args.get('school_id')
	try:
		school = db.get_school_by_id(school_id)
		if school:
			school['_id'] = str(school['_id'])  # Convert ObjectId to string for JSON serialization
			return jsonify({'school': school}), 200
		else:
			return jsonify({'error': 'School not found'}), 404
	except Exception as e:
		return jsonify({'error': str(e)}), 500

