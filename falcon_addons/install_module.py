import xmlrpc.client
import sys

url = "http://localhost:8069"
db = "trajan45"
username = "trajan@arc34.com"
password = "admin"

try:
    print("Connecting...")
    common = xmlrpc.client.ServerProxy(f'{url}/xmlrpc/2/common')
    uid = common.authenticate(db, username, password, {})
    if not uid:
        print("Auth failed")
        sys.exit(1)
    
    models = xmlrpc.client.ServerProxy(f'{url}/xmlrpc/2/object')
    
    # 1. Install Module
    print("Searching for module...")
    ids = models.execute_kw(db, uid, password, 'ir.module.module', 'search', [[('name', '=', 'import_wizards_caisse_manager_18')]])
    if ids:
        print(f"Found module ID: {ids}. Installing...")
        res = models.execute_kw(db, uid, password, 'ir.module.module', 'button_immediate_install', [ids])
        print(f"Install Result: {res}")
    else:
        print("Module not found!")

except Exception as e:
    print(f"Error: {e}")
    if hasattr(e, 'faultString'):
        print(f"Fault Details: {e.faultString}")
    with open('/mnt/extra-addons/install_error.log', 'w') as f:
        f.write(str(e))
