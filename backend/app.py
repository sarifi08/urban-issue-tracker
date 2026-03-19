from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
app.config['JWT_IDENTITY_CLAIM'] = 'sub'

CORS(app, origins="*", allow_headers=["Content-Type", "Authorization"], methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"])

jwt = JWTManager(app)

from routes.auth import auth_bp
from routes.reports import reports_bp
from routes.admin import admin_bp

app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(reports_bp, url_prefix='/api/reports')
app.register_blueprint(admin_bp, url_prefix='/api/admin')

@app.route('/health')
def health():
    return {'status': 'OK'}

if __name__ == '__main__':
    app.run(debug=True, port=8000)