import bcrypt
import datetime

def create_user(mongo, email, password, role='user'):
    hashed_pw = bcrypt.hashpw(password.encode(), bcrypt.gensalt())
    user = {
        "email": email,
        "password": hashed_pw,
        "role": role,
        "created_at": datetime.datetime.utcnow()
    }
    mongo.db.users.insert_one(user)

def find_user_by_email(mongo, email):
    return mongo.db.users.find_one({"email": email})

def get_all_users(mongo):
    return list(mongo.db.users.find({}, {"password": 0}))

def delete_user_by_email(mongo, email):
    return mongo.db.users.delete_one({"email": email})
