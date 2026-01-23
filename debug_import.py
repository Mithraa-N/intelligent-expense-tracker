
import sys
import traceback

try:
    print("Importing data.schemas...")
    from data import schemas
    print("Importing models...")
    import models
    print("Importing ml.parser...")
    from ml import parser
    print("Importing api.routes...")
    from api import routes
    print("Success")
except Exception:
    with open("error_log.txt", "w") as f:
        traceback.print_exc(file=f)
    traceback.print_exc()
