from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# POSTGRESQL CONFIGURATION
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:1111@localhost:5432/blood_donation'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# MODEL 
class Donor(db.Model):
    __tablename__ = 'donors' 
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    age = db.Column(db.Integer, nullable=False)
    phone = db.Column(db.String(15), nullable=False)
    address = db.Column(db.String(200), nullable=False)
    blood_group = db.Column(db.String(5), nullable=False)

    def to_dict(self):
        return {
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
        db.create_all()
        print("Connected to PostgreSQL and tables created!")
    except Exception as e:
        print("Error connecting to PostgreSQL:", e)

# --- ROUTES ---
@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    try:
        new_donor = Donor(
            name=data['name'],
            email=data['email'],
            age=int(data['age']),
            phone=data['phone'],
            address=data['address'],
            blood_group=data['blood']
        )
        db.session.add(new_donor)
        db.session.commit()
        return jsonify({"message": "Registration Successful!"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/search', methods=['GET'])
def search():
    blood = request.args.get('blood')
    address = request.args.get('address')

    query = Donor.query
    if blood:
        query = query.filter_by(blood_group=blood)
    if address:
        
        query = query.filter(Donor.address.ilike(f'%{address}%')) # Postgres ILIKE is case-insensitive

    results = query.all()
    return jsonify([donor.to_dict() for donor in results])

if __name__ == '__main__':
    app.run(debug=True, port=5000)