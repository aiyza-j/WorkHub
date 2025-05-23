from fastapi import APIRouter, Depends, HTTPException, status
from model import UserCreate, UserUpdate, Role, User
from crud import create_user, get_all_users, delete_user, update_user, find_user_by_email
from auth import authenticate_user, create_access_token, get_current_user, require_role
from fastapi.security import OAuth2PasswordRequestForm
from typing import List

router = APIRouter()


@router.post("/signup", response_model=User)
async def signup(user_create: UserCreate):
    try:
        user = await create_user(user_create)

        user.password = None
        return user
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/", response_model=List[User])
async def read_users(
    page: int = 1,
    limit: int = 10,
    search: str = "",
    role: Role | None = None,
    current_user: User = Depends(require_role(Role.admin))
):
    skip = (page - 1) * limit
    users, total = await get_all_users(skip, limit, search, role)
    for u in users:
        u.password = None
    return users


@router.delete("/{user_id}")
async def delete_user_route(user_id: str, current_user: User = Depends(require_role(Role.admin))):
    if current_user.id == user_id:
        raise HTTPException(status_code=403, detail="Admins cannot delete their own account")
    success = await delete_user(user_id)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": f"User {user_id} deleted successfully"}


@router.put("/{user_id}", response_model=User)
async def update_user_route(user_id: str, user_update: UserUpdate, current_user: User = Depends(require_role(Role.admin))):
    updated_user = await update_user(user_id, user_update)
    if not updated_user:
        raise HTTPException(status_code=404, detail="User not found")
    updated_user.password = None
    return updated_user


@router.get("/emails")
async def get_user_emails(current_user: User = Depends(get_current_user)):
    users = await User.find_all().to_list()
    emails = [u.email for u in users]
    return {"emails": emails}
