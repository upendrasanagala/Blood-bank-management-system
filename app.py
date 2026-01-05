from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# --- CONFIGURATION ---
# Make sure your password (1111) and DB name (blood_donation) are correct
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:1111@localhost:5432/blood_donation'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# --- MODEL ---
class Donor(db.Model):
    __tablename__ = 'donors'
    
    id = db.Column(db.Integer, primary_key=True)
    # Added student_id to link with your frontend and prevent duplicates
    student_id = db.Column(db.String(50), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    age = db.Column(db.Integer, nullable=False)
    phone = db.Column(db.String(15), nullable=False)
    address = db.Column(db.String(200), nullable=False)
    blood_group = db.Column(db.String(5), nullable=False)

    def to_dict(self):
        return {
            "studentId": self.student_id,
            "name": self.name,
            "email": self.email,
            "age": self.age,
            "phone": self.phone,
            "address": self.address,
            "blood": self.blood_group
        }

# --- INITIALIZE DATABASE ---
with app.app_context():
    try:
        # This creates tables if they don't exist
        db.create_all()
        print("✅ Connected to PostgreSQL and tables checked!")
    except Exception as e:
        print(" Error connecting to PostgreSQL:", e)

# --- ROUTES ---

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    
    try:
        # 1. Validation: Check if Student ID already exists
        existing_student = Donor.query.filter_by(student_id=data['studentId']).first()
        if existing_student:
            return jsonify({"error": "Student ID already registered!"}), 409

        # 2. Create new Donor
        new_donor = Donor(
            student_id=data['studentId'],
            name=data['name'],
            email=data['email'],
            age=int(data['age']),
            phone=data['phone'],
            address=data['address'], # Frontend sends this lowercased usually
            blood_group=data['blood']
        )
        
        db.session.add(new_donor)
        db.session.commit()
        return jsonify({"message": "Registration Successful!"}), 201

    except Exception as e:
        print("Register Error:", str(e))
        return jsonify({"error": "Server Error during registration"}), 500

@app.route('/api/search', methods=['GET'])
def search():
    blood = request.args.get('blood')
    address = request.args.get('address')

    query = Donor.query

    # FIX: Use ilike for Case-Insensitive search and strip() to remove spaces
    if blood and blood.strip():
        clean_blood = blood.strip().upper()
        query = query.filter(Donor.blood_group == clean_blood)

        
    if address and address.strip():
        clean_address = address.strip()
        query = query.filter(Donor.address.ilike(f'%{clean_address}%'))

    results = query.all()
    return jsonify([donor.to_dict() for donor in results])

if __name__ == '__main__':
    app.run(debug=True, port=5000)