import os
from urllib import response
from flask import jsonify, request
from database import db
import google.genai as genai
from google.genai import types

from . import bp

# --- In-memory simple user store (placeholder until real auth/db) ---
_USER_POINTS = {
	'demo-user': 0
}

def _get_current_user_id():
	# Placeholder: in a real system, extract from auth (JWT/session)
	return 'demo-user'

@bp.route('/', methods=['GET'])
def index():
	db.test()
	print(os.getcwd())
	return jsonify({'message': 'SocialCredit API backend running'}), 200


@bp.route('/health', methods=['GET'])
def health():
	return jsonify({'status': 'ok'}), 200


@bp.route('/users/me', methods=['GET'])
def users_me():
	uid = _get_current_user_id()
	return jsonify({
		'user_id': uid,
		'points': _USER_POINTS.get(uid, 0)
	}), 200


@bp.route('/echo', methods=['POST'])
def echo():
	data = request.get_json(silent=True) or {}
	return jsonify({'received': data}), 200

@bp.route('/genai', methods=['GET', 'POST'])
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
		# Very naive parsing: grant a point if model says 'yes'
		text_lower = (response.text or '').lower()
		improved = 'yes' in text_lower and 'no' not in text_lower  # crude heuristic
		uid = _get_current_user_id()
		if improved:
			_USER_POINTS[uid] = _USER_POINTS.get(uid, 0) + 1
		return jsonify({
			'response': response.text,
			'improved': improved,
			'points': _USER_POINTS.get(uid, 0)
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