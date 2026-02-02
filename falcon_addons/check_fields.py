import xmlrpc.client
url = "http://localhost:8069"
db = "trajan45"
username = "trajan@arc34.com"
password = "admin"

common = xmlrpc.client.ServerProxy(f'{url}/xmlrpc/2/common')
uid = common.authenticate(db, username, password, {})
models = xmlrpc.client.ServerProxy(f'{url}/xmlrpc/2/object')

fields = models.execute_kw(db, uid, password, 'product.template', 'fields_get', [], {'attributes': ['string', 'type', 'readonly']})
for k, v in fields.items():
    if 'type' in k:
        print(f"{k}: {v}")
