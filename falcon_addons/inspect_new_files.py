import openpyxl
import sys

files = ['/mnt/extra-addons/products_template_import.xlsx', '/mnt/extra-addons/lots_import.xlsx']

for f_path in files:
    try:
        print(f"--- Inspecting {f_path} ---")
        wb = openpyxl.load_workbook(f_path, read_only=True, data_only=True)
        ws = wb.active
        rows = list(ws.iter_rows(max_row=3, values_only=True))
        for i, row in enumerate(rows):
            print(f"Row {i}: {row}")
    except Exception as e:
        print(f"Error reading {f_path}: {e}")
