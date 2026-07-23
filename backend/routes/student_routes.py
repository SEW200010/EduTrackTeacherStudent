from flask import Blueprint, jsonify, request
from middleware import token_required, marks_col, students_col, db

student_bp = Blueprint("student", __name__)
parent_bp = Blueprint("parent", __name__)

announcements_col = db["announcements"]
parents_col = db["users"] 
fees_col = db["fees"] 
deadlines_col = db["deadlines"]

@student_bp.route("/student/marks/<student_id>", methods=["GET"])
@token_required()
def get_student_marks_by_id(current_user, student_id):
    target_id = student_id.strip().upper()
    
    if current_user["role"] == "student" and current_user.get("user_id", "").upper() != target_id:
        return jsonify({"message": "Access denied! You can only view your own records."}), 403
        
    records = list(marks_col.find({"student_id": target_id}, {"_id": 0}))
    return jsonify({"marks": records}), 200


@student_bp.route("/student/announcements", methods=["GET"])
@token_required()
def get_student_announcements(current_user):
    notices = list(announcements_col.find().sort("_id", -1).limit(20))
    for notice in notices:
        notice['_id'] = str(notice['_id'])
    return jsonify({"announcements": notices}), 200


@student_bp.route("/student/summary/<student_id>", methods=["GET"])
@token_required()
def get_student_summary(current_user, student_id):
    target_id = student_id.strip().upper()
    
    if current_user["role"] == "student" and current_user.get("user_id", "").upper() != target_id:
        return jsonify({"message": "Access denied!"}), 403

    records = list(marks_col.find({"student_id": target_id}))
    
    total_subjects = len(records)
    if total_subjects == 0:
        return jsonify({
            "total_subjects": 0,
            "avg_marks": 0,
            "avg_attendance": "0%",
            "cumulative_gpa": 0.0
        }), 200

    total_marks = sum(r.get("marks_obtained", 0) for r in records)
    avg_marks = round(total_marks / total_subjects, 1)

    att_list = []
    for r in records:
        att_str = str(r.get("attendance_rate", "0")).replace("%", "").strip()
        try:
            att_list.append(float(att_str))
        except ValueError:
            att_list.append(0.0)
            
    avg_att = round(sum(att_list) / len(att_list), 1) if att_list else 0.0

    gpa_list = [float(r.get("previous_gpa", 0.0)) for r in records if r.get("previous_gpa") is not None]
    avg_gpa = round(sum(gpa_list) / len(gpa_list), 2) if gpa_list else 0.0

    return jsonify({
        "total_subjects": total_subjects,
        "avg_marks": avg_marks,
        "avg_attendance": f"{avg_att}%",
        "cumulative_gpa": avg_gpa
    }), 200


@student_bp.route("/student/deadlines", methods=["GET"])
@student_bp.route("/student/deadlines/<student_id>", methods=["GET"])
@token_required()
def get_student_deadlines(current_user, student_id=None):
    try:
        deadlines = list(deadlines_col.find({}, {"_id": 0}))
        return jsonify({"deadlines": deadlines}), 200
    except Exception as e:
        return jsonify({"message": f"Server error: {str(e)}"}), 500


@parent_bp.route("/parent/student-details/<student_id>", methods=["GET"])
@token_required()
def get_child_details(current_user, student_id):
    target_id = student_id.strip().upper()

    if current_user.get("role") == "parent" and current_user.get("student_id", "").upper() != target_id:
        return jsonify({"message": "Access denied! You can only view your child's records."}), 403

    try:
        student_user = students_col.find_one({
            "$or": [{"user_id": target_id}, {"student_id": target_id}]
        })
        student_name = student_user.get("name", "Student") if student_user else "Student"

        student_records = list(marks_col.find({"student_id": target_id}, {"_id": 0}))

        for record in student_records:
            subject = record.get("subject")
            if subject:
                pipeline = [
                    {"$match": {"subject": subject}},
                    {"$group": {"_id": "$subject", "avg_marks": {"$avg": "$marks_obtained"}}}
                ]
                avg_result = list(marks_col.aggregate(pipeline))
                record["class_avg"] = round(avg_result[0]["avg_marks"], 1) if avg_result else record.get("marks_obtained", 50)

        fee_info = fees_col.find_one({"student_id": target_id}, {"_id": 0}) or {
            "term_fee_status": "Paid",
            "due_date": "N/A",
            "amount_due": "LKR 0.00"
        }

        return jsonify({
            "student_id": target_id,
            "student_name": student_name,
            "marks": student_records,
            "fee_info": fee_info
        }), 200

    except Exception as e:
        return jsonify({"message": f"Server error: {str(e)}"}), 500