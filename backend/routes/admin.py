from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models.db import get_db
import bcrypt

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/staff', methods=['POST'])
@jwt_required()
def create_staff():
    data = request.get_json()
    hashed = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    try:
        conn = get_db()
        cur = conn.cursor()
        cur.execute(
            'INSERT INTO users (name, email, password, role) VALUES (%s, %s, %s, %s)',
            (data['name'], data['email'], hashed, 'staff')
        )
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({'message': 'Staff created'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/staff', methods=['GET'])
@jwt_required()
def get_all_staff():
    try:
        conn = get_db()
        cur = conn.cursor()
        cur.execute("SELECT id, name, email, role, created_at FROM users WHERE role = 'staff'")
        rows = cur.fetchall()
        cur.close()
        conn.close()
        staff = [
            {'id': r[0], 'name': r[1], 'email': r[2], 'role': r[3], 'created_at': r[4].isoformat()}
            for r in rows
        ]
        return jsonify(staff), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_stats():
    try:
        conn = get_db()
        cur = conn.cursor()

        # Count total reports
        cur.execute("SELECT COUNT(*) FROM reports")
        total = cur.fetchone()[0]

        # Count reports by each status
        cur.execute("SELECT COUNT(*) FROM reports WHERE status = 'submitted'")
        submitted = cur.fetchone()[0]

        cur.execute("SELECT COUNT(*) FROM reports WHERE status = 'under review'")
        under_review = cur.fetchone()[0]

        cur.execute("SELECT COUNT(*) FROM reports WHERE status = 'in progress'")
        in_progress = cur.fetchone()[0]

        cur.execute("SELECT COUNT(*) FROM reports WHERE status = 'resolved'")
        resolved = cur.fetchone()[0]

        # Count users by role
        cur.execute("SELECT COUNT(*) FROM users WHERE role = 'citizen'")
        citizens = cur.fetchone()[0]

        cur.execute("SELECT COUNT(*) FROM users WHERE role = 'staff'")
        staff = cur.fetchone()[0]

        cur.close()
        conn.close()

        return jsonify({
            'total_reports': total,
            'submitted': submitted,
            'under_review': under_review,
            'in_progress': in_progress,
            'resolved': resolved,
            'total_citizens': citizens,
            'total_staff': staff
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500