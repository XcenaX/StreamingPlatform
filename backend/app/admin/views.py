from sqladmin import ModelView
from app.models.stream import Stream
from app.models.user import User

class UserAdmin(ModelView, model=User):
    column_list = [User.id, User.username, User.email, User.created_at]
    column_searchable_list = [User.username, User.email]
    column_sortable_list = [User.id, User.created_at]

class StreamAdmin(ModelView, model=Stream):
    column_list = [Stream.id, Stream.title, Stream.status, Stream.stream_key, Stream.user_id, Stream.created_at]
    column_searchable_list = [Stream.title, Stream.stream_key]
    column_sortable_list = [Stream.created_at, Stream.status]
