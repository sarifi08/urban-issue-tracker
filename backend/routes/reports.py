from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.db import get_db

reports_bp = Blueprint('reports', __name__)

@reports_bp.route('', methods=['POST'])
@jwt_required()
def submit_report():
    data = request.get_json()
    user_id = int(get_jwt_identity())

    try:
        conn = get_db()
        cur = conn.cursor()
        cur.execute(
            '''INSERT INTO reports (title, description, category, latitude, longitude, citizen_id)
               VALUES (%s, %s, %s, %s, %s, %s) RETURNING id''',
            (data['title'], data['description'], data['category'],
             data['latitude'], data['longitude'], user_id)
        )
        report_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({'message': 'Report submitted', 'id': report_id}), 201

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@reports_bp.route('/my', methods=['GET'])
@jwt_required()
def get_my_reports():
    user_id = int(get_jwt_identity())
    try:
        conn = get_db()
        cur = conn.cursor()
        cur.execute(
            '''SELECT id, title, description, status, category, latitude, longitude, created_at
               FROM reports WHERE citizen_id = %s ORDER BY created_at DESC''',
            (user_id,)
        )
        rows = cur.fetchall()
        cur.close()
        conn.close()
        reports = [
            { 'id': r[0], 'title': r[1], 'description': r[2], 'status': r[3],
              'category': r[4], 'latitude': str(r[5]), 'longitude': str(r[6]),
              'created_at': r[7].isoformat() }
            for r in rows
        ]
        return jsonify(reports), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@reports_bp.route('', methods=['GET'])
@jwt_required()
def get_all_reports():
    try:
        conn = get_db()
        cur = conn.cursor()
        cur.execute(
            '''SELECT id, title, description, status, category, latitude, longitude, created_at
               FROM reports ORDER BY created_at DESC'''
        )
        rows = cur.fetchall()
        cur.close()
        conn.close()
        reports = [
            { 'id': r[0], 'title': r[1], 'description': r[2], 'status': r[3],
              'category': r[4], 'latitude': str(r[5]), 'longitude': str(r[6]),
              'created_at': r[7].isoformat() }
            for r in rows
        ]
        return jsonify(reports), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@reports_bp.route('/<int:report_id>', methods=['PATCH'])
@jwt_required()
def update_status(report_id):
    data = request.get_json()
    status = data.get('status')
    try:
        conn = get_db()
        cur = conn.cursor()
        cur.execute(
            'UPDATE reports SET status = %s WHERE id = %s',
            (status, report_id)
        )
        cur.execute(
            '''INSERT INTO notifications (user_id, report_id, message)
               SELECT citizen_id, id, 'Your report status has been updated to: ' || %s
               FROM reports WHERE id = %s''',
            (status, report_id)
        )
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({'message': 'Status updated'}), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@reports_bp.route('/<int:report_id>/department', methods=['PATCH'])
@jwt_required()
def assign_department(report_id):
    data = request.get_json()
    department = data.get('department')
    try:
        conn = get_db()
        cur = conn.cursor()
        cur.execute(
            'UPDATE reports SET department = %s WHERE id = %s',
            (department, report_id)
        )
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({'message': 'Department assigned'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@reports_bp.route('/notifications', methods=['GET'])
@jwt_required()
def get_notifications():
    user_id = int(get_jwt_identity())
    try:
        conn = get_db()
        cur = conn.cursor()
        cur.execute(
            '''SELECT id, message, is_read, sent_at
               FROM notifications WHERE user_id = %s
               ORDER BY sent_at DESC''',
            (user_id,)
        )
        rows = cur.fetchall()
        cur.close()
        conn.close()
        notifications = [
            {'id': r[0], 'message': r[1], 'is_read': r[2], 'sent_at': r[3].isoformat()}
            for r in rows
        ]
        return jsonify(notifications), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500