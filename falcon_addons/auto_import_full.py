import openpyxl
import xmlrpc.client
import logging
import sys
from datetime import datetime

# Config
URL = "http://localhost:8069"
DB = "trajan45"
USER = "trajan@arc34.com"
PWD = "admin"

logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
logger = logging.getLogger("Importer")

class OdooAPI:
    def __init__(self, url, db, username, password):
        self.url = url
        self.db = db
        self.username = username
        self.password = password
        self.common = xmlrpc.client.ServerProxy(f'{url}/xmlrpc/2/common')
        self.models = xmlrpc.client.ServerProxy(f'{url}/xmlrpc/2/object')
        self.uid = self.common.authenticate(db, username, password, {})
        if not self.uid:
            raise Exception("Auth Failed")
        logger.info(f"Connected as UID {self.uid}")

    def execute(self, model, method, *args, **kwargs):
        return self.models.execute_kw(self.db, self.uid, self.password, model, method, args, kwargs)

    def search(self, model, domain, limit=0):
        # search returns [id, id, ...]
        return self.execute(model, 'search', domain, limit)

    def read(self, model, ids, fields=None):
        return self.execute(model, 'read', ids, fields)

    def search_read(self, model, domain, fields, limit=0):
        ids = self.search(model, domain, limit)
        if not ids: return []
        return self.read(model, ids, fields)
    
    def create(self, model, vals):
        return self.execute(model, 'create', vals)
    
    def write(self, model, ids, vals):
        return self.execute(model, 'write', ids, vals)

    def get_xmlid_res_id(self, xmlid):
        if not xmlid or '.' not in xmlid: return None
        try:
            module, name = xmlid.split('.', 1)
            ids = self.search('ir.model.data', [['module', '=', module], ['name', '=', name]], limit=1)
            if ids:
                data = self.read('ir.model.data', ids, ['res_id'])
                return data[0]['res_id'] if data else None
        except Exception as e:
            logger.warning(f"Error resolving XmlID {xmlid}: {e}")
        return None

    def set_xmlid(self, match_id, model, xmlid):
         if not xmlid or '.' not in xmlid: return
         try:
             module, name = xmlid.split('.', 1)
             ids = self.search('ir.model.data', [['module', '=', module], ['name', '=', name]], limit=1)
             if not ids:
                 self.create('ir.model.data', {
                     'module': module, 'name': name, 'model': model, 'res_id': match_id, 'noupdate': True
                 })
         except Exception as e:
             logger.warning(f"Failed to set XmlID {xmlid}: {e}")

def get_sheet_data(filepath):
    wb = openpyxl.load_workbook(filepath, read_only=True, data_only=True)
    ws = wb.active
    rows = list(ws.iter_rows(values_only=True))
    if not rows: return [], []
    headers = [str(h).strip() if h else f"col_{i}" for i, h in enumerate(rows[0])]
    data = []
    for r in rows[1:]:
        data.append({headers[i]: r[i] for i in range(len(headers)) if i < len(r)})
    return headers, data

def import_products(api):
    fpath = '/mnt/extra-addons/products_template_import.xlsx'
    logger.info(f"Importing Products from {fpath}")
    headers, rows = get_sheet_data(fpath)
    
    for row in rows:
        name = row.get('name')
        if not name: continue
        
        vals = {
            'name': name,
            'default_code': row.get('default_code') or False,
            'list_price': float(row.get('list_price') or 0),
            'standard_price': float(row.get('standard_price') or 0),
            'standard_price': float(row.get('standard_price') or 0),
            # 'detailed_type': 'product' 
        }
        
        xmlid = row.get('id')
        match_id = api.get_xmlid_res_id(xmlid)
        
        try:
            if match_id:
                api.write('product.template', [match_id], vals)
                logger.info(f"Updated Product {name} (ID {match_id})")
            else:
                # Search by code or name to avoid dupes if xmlid missing/broken
                domain = []
                if vals['default_code']:
                     domain = [['default_code', '=', vals['default_code']]]
                else:
                     domain = [['name', '=', name]]
                
                existing = api.search('product.template', domain, limit=1)
                if existing:
                    match_id = existing[0]
                    api.write('product.template', [match_id], vals)
                    logger.info(f"Updated Product {name} (Matched by content) (ID {match_id})")
                else:
                    match_id = api.create('product.template', vals)
                    logger.info(f"Created Product {name} (ID {match_id})")
            
            if xmlid and match_id:
                api.set_xmlid(match_id, 'product.template', xmlid)
        except Exception as e:
            logger.error(f"Failed to import Product {name}: {e}")

def import_lots(api):
    fpath = '/mnt/extra-addons/lots_import.xlsx'
    logger.info(f"Importing Lots from {fpath}")
    headers, rows = get_sheet_data(fpath)
    
    # Check if x_assigned_part_ids exists
    has_x_parts = 'x_assigned_part_ids' in api.execute('stock.lot', 'fields_get')
    
    # 1st Pass: Create Lots
    for row in rows:
        name = row.get('name')
        if not name: continue
        
        prod_name = row.get('product_id')
        if not prod_name:
            logger.warning(f"Skipping Lot {name}: No Product Name provided")
            continue
            
        # Find Product ID
        # Lots link to product.product, usually. product_id field on stock.lot is product.product.
        # But input might be Template Name.
        # Try finding Product Variant first
        p_res = api.search_read('product.product', [['name', '=', prod_name]], ['id', 'product_tmpl_id'], limit=1)
        if not p_res:
            p_res = api.search_read('product.product', [['default_code', '=', prod_name]], ['id'], limit=1)
        
        if not p_res:
             # Try via Template?
             t_res = api.search_read('product.template', [['name', '=', prod_name]], ['id'], limit=1)
             if t_res:
                 # Get variant
                 p_res = api.search_read('product.product', [['product_tmpl_id', '=', t_res[0]['id']]], ['id'], limit=1)
        
        if not p_res:
            logger.warning(f"Skipping Lot {name}: Product '{prod_name}' not found")
            continue
            
        pid = p_res[0]['id']
        
        # Prepare Vals
        vals = {
            'name': name,
            'product_id': pid,
        }
        
        # Custom fields support
        # x_destination_server_lot_id
        # For now, ignore complex relations in first pass
        
        xmlid = row.get('id')
        match_id = api.get_xmlid_res_id(xmlid)
        
        if match_id:
            api.write('stock.lot', [match_id], vals)
            logger.info(f"Updated Lot {name} (ID {match_id})")
        else:
            # Search existing
            existing = api.search_read('stock.lot', [['name', '=', name], ['product_id', '=', pid]], ['id'])
            if existing:
                match_id = existing[0]['id']
                api.write('stock.lot', [match_id], vals)
            else:
                match_id = api.create('stock.lot', vals)
                logger.info(f"Created Lot {name} (ID {match_id})")

        if xmlid and match_id:
            api.set_xmlid(match_id, 'stock.lot', xmlid)

    # 2nd Pass: Link x_assigned_part_ids (Many2Many/One2Many)
    # This requires the other lots/parts to exist.
    # The header is 'x_assigned_part_ids/name' in the inspect output
    # inspect output: "x_assigned_part_ids/name"
    # This implies the value in the cell is the name of the assigned part.
    
    col_x_name = 'x_assigned_part_ids/name'
    if col_x_name in headers:
         with_links = [r for r in rows if r.get(col_x_name)]
         if with_links:
             logger.info(f"Processing Links for {len(with_links)} lots...")
             for row in with_links:
                 # Current Lot
                 lot_xmlid = row.get('id')
                 main_lot_id = api.get_xmlid_res_id(lot_xmlid)
                 if not main_lot_id: continue
                 
                 target_name = row.get(col_x_name)
                 # Find the target lot/part? 
                 # Assuming x_assigned_part_ids points to stock.lot? Or product? 
                 # Usually if it's "assigned parts" on a Lot, it might point to other Lots (Composition).
                 # Let's assume it points to stock.lot.name
                 
                 found_sub = api.search_read('stock.lot', [['name', '=', target_name]], ['id'], limit=1)
                 if found_sub:
                     sub_id = found_sub[0]['id']
                     # Link it. M2M: [(4, id)]
                     # If the field exists
                     try:
                         api.write('stock.lot', [main_lot_id], {'x_assigned_part_ids': [[4, sub_id]]})
                         logger.info(f"Linked Lot {main_lot_id} -> Sub {sub_id}")
                     except Exception as e:
                         # Field might not exist or wrong type
                         pass

if __name__ == "__main__":
    try:
        api = OdooAPI(URL, DB, USER, PWD)
        import_products(api)
        import_lots(api)
    except Exception as e:
        logger.error(f"Fatal: {e}")
        sys.exit(1)
