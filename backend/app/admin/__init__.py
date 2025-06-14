from sqladmin import Admin
from app.admin.views import UserAdmin, StreamAdmin

def setup_admin(app, engine):
    admin = Admin(app, engine)
    admin.add_view(UserAdmin)
    admin.add_view(StreamAdmin)
