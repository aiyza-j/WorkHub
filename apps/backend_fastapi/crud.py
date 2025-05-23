from model import User, UserCreate, UserUpdate, Role
import bcrypt
from beanie import PydanticObjectId


async def create_user(user_create: UserCreate) -> User:
    existing = await User.find_one(User.email == user_create.email)
    if existing:
        raise ValueError("Email already registered")

    hashed_pw = bcrypt.hashpw(user_create.password.encode(), bcrypt.gensalt())
    user = User(
        full_name=user_create.full_name,
        email=user_create.email,
        password=hashed_pw.decode(),
        role=user_create.role,
    )
    await user.insert()
    return user


async def find_user_by_email(email: str) -> User | None:
    return await User.find_one(User.email == email)


async def get_all_users(skip: int = 0, limit: int = 10, search: str = "", role: Role | None = None):
    query = {}
    if search:
        query["$or"] = [
            {"full_name": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}},
        ]
    if role:
        query["role"] = role.value

    users = await User.find(query).skip(skip).limit(limit).to_list()
    total = await User.find(query).count()
    return users, total


async def delete_user(user_id: str):
    user = await User.get(PydanticObjectId(user_id))
    if not user:
        return False
    await user.delete()

    #if related docs like proj and tasks

    return True


async def update_user(user_id: str, update_data: UserUpdate):
    user = await User.get(PydanticObjectId(user_id))
    if not user:
        return None

    update_dict = update_data.dict(exclude_unset=True)


    if "password" in update_dict:
        hashed_pw = bcrypt.hashpw(update_dict["password"].encode(), bcrypt.gensalt())
        update_dict["password"] = hashed_pw.decode()

    #dependent doc like proj and tasks if added in future

    await user.set(update_dict)
    return user
