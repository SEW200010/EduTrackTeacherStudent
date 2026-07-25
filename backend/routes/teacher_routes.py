import os
import datetime
import pytz
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from bson import ObjectId
import pandas as pd
from middleware import token_required, marks_col, db

fees_col = db["fees"]
announcements_col = db["announcements"]
teacher_bp = Blueprint("teacher", __name__)

MIN_REQUIRED_MARKS = 50
MIN_REQUIRED_ATTENDANCE = 80


@teacher_bp.route("/marks/upload", methods=["POST"])
@token_required(allowed_roles=["teacher", "admin"])
def upload_marks_csv(current_user):
    if 'file' not in request.files:
        return jsonify({"message": "No file part in request"}), 400

    file = request.files['file']
    if not file.filename.lower().endswith('.csv'):
        return jsonify({"message": "Invalid file. Please upload a CSV."}), 400

    filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], secure_filename(file.filename))

    try:
        file.save(filepath)
        df = pd.read_csv(filepath).fillna('')

        marks_entries = []
        sl_tz = pytz.timezone('Asia/Colombo')
        today_str = datetime.datetime.now(sl_tz).strftime("%Y-%m-%d")
        teacher_identifier = current_user.get("user_id") or current_user.get("email")

        for index, row in df.iterrows():
            raw_sid = (
                row.get('student_id') if 'student_id' in row and pd.notna(row['student_id']) else
                row.get('user_id') if 'user_id' in row and pd.notna(row['user_id']) else
                row.get('index_no') if 'index_no' in row and pd.notna(row['index_no']) else
                row.get('id') if 'id' in row and pd.notna(row['id']) else
                'N/A'
            )
            student_id = str(raw_sid).strip().upper()

            raw_marks = row.get('marks', row.get('marks_obtained', 0))
            try:
                marks_obtained = int(float(raw_marks)) if raw_marks != '' else 0
            except (ValueError, TypeError):
                marks_obtained = 0

            raw_att = row.get('attendance', row.get('attendance_rate', '0%'))
            att_str = str(raw_att).replace('%', '').strip()
            try:
                att_val = float(att_str) if att_str != '' else 0.0
            except (ValueError, TypeError):
                att_val = 0.0

            is_at_risk = True if (marks_obtained < MIN_REQUIRED_MARKS or att_val < MIN_REQUIRED_ATTENDANCE) else False

            raw_fee_status = row.get('fee_status', row.get('term_fee_status', 'Paid'))
            raw_due_date = row.get('due_date', 'N/A')
            raw_amount_due = row.get('amount_due', 'LKR 0.00')

            fee_status = str(raw_fee_status).strip() if str(raw_fee_status).strip() != '' else 'Paid'
            due_date = str(raw_due_date).strip() if str(raw_due_date).strip() != '' else 'N/A'
            amount_due = str(raw_amount_due).strip() if str(raw_amount_due).strip() != '' else 'LKR 0.00'

            if student_id != 'N/A':
                fees_col.update_one(
                    {"student_id": student_id},
                    {"$set": {
                        "student_id": student_id,
                        "term_fee_status": fee_status,
                        "due_date": due_date,
                        "amount_due": amount_due
                    }},
                    upsert=True
                )

            marks_entries.append({
                "student_id": student_id,
                "student_email": str(row.get('student_email', '')).strip().lower(),
                "student_name": str(row.get('student_na', row.get('student_name', 'Student'))).strip(),
                "subject": str(row.get('subject', 'General')).strip(),
                "marks_obtained": marks_obtained,
                "max_marks": int(row.get('max_marks', 100)) if row.get('max_marks') != '' else 100,
                "exam_type": str(row.get('exam_type', 'Mid-Term')).strip(),
                "attendance_rate": f"{att_val}%",
                "grade": str(row.get('grade', 'N/A')).strip(),
                "assignment_score": int(float(row.get('assignment_score', 0))) if row.get('assignment_score') != '' else 0,
                "study_hours_per_week": int(float(row.get('study_hours_per_week', 0))) if row.get('study_hours_per_week') != '' else 0,
                "previous_gpa": float(row.get('previous_gpa', 0.0)) if row.get('previous_gpa') != '' else 0.0,
                "is_at_risk": is_at_risk,
                "entered_by": teacher_identifier,
                "date_uploaded": today_str
            })

        if marks_entries:
            marks_col.insert_many(marks_entries)

        os.remove(filepath)
        return jsonify({"message": f"Successfully processed {len(marks_entries)} student marks & fee records!"}), 201

    except Exception as e:
        if os.path.exists(filepath):
            os.remove(filepath)
        return jsonify({"message": f"Upload failed: {str(e)}"}), 500


# Add Single Marks Record (Manual Entry)
@teacher_bp.route("/marks/add", methods=["POST"])
@token_required(allowed_roles=["teacher", "admin"])
def add_single_mark(current_user):
    data = request.get_json()
    if not data:
        return jsonify({"message": "Invalid request payload"}), 400

    teacher_identifier = current_user.get("user_id") or current_user.get("email")
    sl_tz = pytz.timezone('Asia/Colombo')
    today_str = datetime.datetime.now(sl_tz).strftime("%Y-%m-%d")

    try:
        marks_obtained = int(float(data.get("marks_obtained", 0)))
        attendance_rate = str(data.get("attendance_rate", "0%"))
        att_val = float(str(attendance_rate).replace('%', '').strip() or 0)

        is_at_risk = True if (marks_obtained < MIN_REQUIRED_MARKS or att_val < MIN_REQUIRED_ATTENDANCE) else False

        record = {
            "student_id": str(data.get("student_id", "")).strip().upper(),
            "student_email": str(data.get("student_email", "")).strip().lower(),
            "student_name": str(data.get("student_name", "")).strip(),
            "subject": str(data.get("subject", "")).strip(),
            "marks_obtained": marks_obtained,
            "max_marks": int(data.get("max_marks", 100)),
            "exam_type": str(data.get("exam_type", "Mid-Term")),
            "attendance_rate": attendance_rate,
            "grade": str(data.get("grade", "N/A")),
            "assignment_score": int(data.get("assignment_score", 0)),
            "study_hours_per_week": int(data.get("study_hours_per_week", 0)),
            "previous_gpa": float(data.get("previous_gpa", 0.0)),
            "is_at_risk": is_at_risk,
            "entered_by": teacher_identifier,
            "date_uploaded": today_str
        }

        marks_col.insert_one(record)
        return jsonify({"message": "Record added successfully!"}), 201

    except Exception as e:
        return jsonify({"message": f"Failed to add record: {str(e)}"}), 400


@teacher_bp.route("/teacher/recent-marks", methods=["GET"])
@token_required(allowed_roles=["teacher", "admin"])
def get_teacher_recent_marks(current_user):
    teacher_identifier = current_user.get("user_id") or current_user.get("email")

    records = list(marks_col.find({
        "$or": [
            {"entered_by": teacher_identifier},
            {"entered_by": current_user.get("email")}
        ]
    }).sort("_id", -1))

    for record in records:
        record['_id'] = str(record['_id'])
    return jsonify({"recent_marks": records}), 200


# 3. Update Remark
@teacher_bp.route("/marks/<record_id>/remark", methods=["PUT", "OPTIONS"])
def update_student_remark(record_id):
    if request.method == "OPTIONS":
        return jsonify({"message": "OK"}), 200

    @token_required(allowed_roles=["teacher", "admin"])
    def handle_put(current_user):
        data = request.get_json()
        if not data:
            return jsonify({"message": "Invalid body"}), 400

        remark = str(data.get("remark", "")).strip()

        try:
            res = marks_col.update_one(
                {"_id": ObjectId(record_id)},
                {"$set": {"teacher_remark": remark}}
            )

            if res.matched_count > 0:
                return jsonify({"message": "Remark updated successfully!"}), 200
            return jsonify({"message": "Record not found or access denied"}), 404

        except Exception as e:
            return jsonify({"message": f"Invalid Record ID: {str(e)}"}), 400

    return handle_put()


# 4. Update Full Marks Record (Edit)
@teacher_bp.route("/marks/<record_id>", methods=["PUT"])
@token_required(allowed_roles=["teacher", "admin"])
def update_mark_record(current_user, record_id):
    data = request.get_json()
    if not data:
        return jsonify({"message": "Invalid request payload"}), 400

    try:
        marks_obtained = int(float(data.get("marks_obtained", 0)))
        attendance_rate = str(data.get("attendance_rate", "0%"))
        att_val = float(str(attendance_rate).replace('%', '').strip() or 0)
        is_at_risk = True if (marks_obtained < MIN_REQUIRED_MARKS or att_val < MIN_REQUIRED_ATTENDANCE) else False

        update_data = {
            "student_id": str(data.get("student_id", "")).strip().upper(),
            "student_email": str(data.get("student_email", "")).strip().lower(),
            "student_name": str(data.get("student_name", "")).strip(),
            "subject": str(data.get("subject", "")).strip(),
            "marks_obtained": marks_obtained,
            "max_marks": int(data.get("max_marks", 100)),
            "exam_type": str(data.get("exam_type", "Mid-Term")),
            "attendance_rate": attendance_rate,
            "grade": str(data.get("grade", "N/A")),
            "assignment_score": int(data.get("assignment_score", 0)),
            "study_hours_per_week": int(data.get("study_hours_per_week", 0)),
            "previous_gpa": float(data.get("previous_gpa", 0.0)),
            "is_at_risk": is_at_risk
        }

        res = marks_col.update_one(
            {"_id": ObjectId(record_id)},
            {"$set": update_data}
        )

        if res.matched_count > 0:
            return jsonify({"message": "Record updated successfully!"}), 200
        return jsonify({"message": "Record not found"}), 404

    except Exception as e:
        return jsonify({"message": f"Update failed: {str(e)}"}), 400


# 5. Delete Mark
@teacher_bp.route("/marks/<record_id>", methods=["DELETE"])
@token_required(allowed_roles=["teacher", "admin"])
def delete_student_mark(current_user, record_id):
    res = marks_col.delete_one({"_id": ObjectId(record_id)})
    if res.deleted_count > 0:
        return jsonify({"message": "Record deleted successfully!"}), 200
    return jsonify({"message": "Record not found"}), 404


# 6. Create Announcement
@teacher_bp.route("/announcements", methods=["POST"])
@token_required(allowed_roles=["teacher", "admin"])
def create_announcement(current_user):
    data = request.get_json()
    title = str(data.get("title", "")).strip()
    message = str(data.get("message", "")).strip()
    target_subject = str(data.get("subject", "General")).strip()
    event_date = str(data.get("event_date", "")).strip()
    event_time = str(data.get("event_time", "")).strip()

    if not title or not message:
        return jsonify({"message": "Title and Message are required!"}), 400

    teacher_identifier = current_user.get("user_id") or current_user.get("email")

    sl_tz = pytz.timezone('Asia/Colombo')
    sl_now = datetime.datetime.now(sl_tz).strftime("%Y-%m-%d %H:%M")

    announcement_doc = {
        "title": title,
        "message": message,
        "subject": target_subject,
        "event_date": event_date,
        "event_time": event_time,
        "posted_by": current_user.get("name", "Teacher"),
        "posted_by_id": teacher_identifier,
        "date_posted": sl_now
    }

    announcements_col.insert_one(announcement_doc)
    return jsonify({"message": "Announcement published successfully!"}), 201


# 7. Edit / Update Announcement
@teacher_bp.route("/announcements/<id>", methods=["PUT"])
@token_required(allowed_roles=["teacher", "admin"])
def update_announcement(current_user, id):
    data = request.get_json()
    if not data:
        return jsonify({"message": "Invalid request payload"}), 400

    title = str(data.get("title", "")).strip()
    message = str(data.get("message", "")).strip()
    target_subject = str(data.get("subject", "General")).strip()
    event_date = str(data.get("event_date", "")).strip()
    event_time = str(data.get("event_time", "")).strip()

    if not title or not message:
        return jsonify({"message": "Title and Message are required!"}), 400

    try:
        res = announcements_col.update_one(
            {"_id": ObjectId(id)},
            {"$set": {
                "title": title,
                "message": message,
                "subject": target_subject,
                "event_date": event_date,
                "event_time": event_time
            }}
        )

        if res.matched_count > 0:
            return jsonify({"message": "Announcement updated successfully!"}), 200
        return jsonify({"message": "Announcement not found!"}), 404

    except Exception as e:
        return jsonify({"message": f"Update failed: {str(e)}"}), 500


# 8. Get All Announcements
@teacher_bp.route("/announcements", methods=["GET"])
@token_required()
def get_announcements(current_user):
    records = list(announcements_col.find().sort("_id", -1).limit(20))
    for record in records:
        record['_id'] = str(record['_id'])
    return jsonify({"announcements": records}), 200


# 9. Delete Announcement
@teacher_bp.route("/announcements/<id>", methods=["DELETE"])
@token_required(allowed_roles=["teacher", "admin"])
def delete_announcement(current_user, id):
    res = announcements_col.delete_one({"_id": ObjectId(id)})
    if res.deleted_count > 0:
        return jsonify({"message": "Announcement deleted!"}), 200
    return jsonify({"message": "Not found"}), 404