import xmlrpc.client
import sys

url = "http://localhost:8069"
db = "trajan45"
username = "trajan@arc34.com"
password = "admin"

try:
    common = xmlrpc.client.ServerProxy(f'{url}/xmlrpc/2/common')
    uid = common.authenticate(db, username, password, {})
    models = xmlrpc.client.ServerProxy(f'{url}/xmlrpc/2/object')

    # Check Products
    prod_count = models.execute_kw(db, uid, password, 'product.template', 'search_count', [[]])
    print(f"Total Products: {prod_count}")

    # Check Lots
    lot_count = models.execute_kw(db, uid, password, 'stock.lot', 'search_count', [[]])
    print(f"Total Lots: {lot_count}")

    # Check Module Status
    modules = models.execute_kw(db, uid, password, 'ir.module.module', 'search_read', [[('name', '=', 'import_wizards_caisse_manager_18')]], ['state'])
    if modules:
        print(f"Module 'import_wizards_caisse_manager_18' State: {modules[0]['state']}")
    else:
        print("Module 'import_wizards_caisse_manager_18' not found in app list.")

except Exception as e:
    print(f"Error: {e}")
