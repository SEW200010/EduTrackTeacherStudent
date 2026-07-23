from flask import Blueprint, jsonify, request
from middleware import token_required, marks_col, db

parent_bp = Blueprint("parent", __name__)

announcements_col = db["announcements"]
fees_col = db["fees"]


@parent_bp.route("/parent/student-details/<student_id>", methods=["GET"])
@token_required()
def get_child_details(current_user, student_id):
    target_id = student_id.strip().upper()

    if current_user.get("role") == "parent" and current_user.get("student_id", "").upper() != target_id:
        return jsonify({"message": "Access denied! You can only view your child's records."}), 403

    try:
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
            "marks": student_records,
            "fee_info": fee_info
        }), 200

    except Exception as e:
        return jsonify({"message": f"Server error: {str(e)}"}), 500


@parent_bp.route("/parent/announcements", methods=["GET"])
@token_required()
def get_parent_announcements(current_user):
    try:
        notices = list(announcements_col.find().sort("_id", -1).limit(10))
        for notice in notices:
            notice['_id'] = str(notice['_id'])

        return jsonify({"announcements": notices}), 200
    except Exception as e:
        return jsonify({"message": f"Error: {str(e)}"}), 500