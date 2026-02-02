{
    'name': 'ARC34 Inventory Management',
    'version': '1.0.0',
    'summary': 'Enhanced inventory system for Arc34 with Falcon workflow',
    'description': '''
        Comprehensive inventory management system for Arc34 operations.
        Features:
        - Auto ARC34 IPN generation (ARC34-XXX-YYYY-R1)
        - Contract tagging for govcon compliance
        - Enhanced reporting for DCAA requirements
        - Falcon server workflow as submenu
        - Multi-location support (Ashburn DC warehouse)
    ''',
    'author': 'Arc34 Development Team',
    'website': 'https://arc34.com',
    'category': 'Inventory/Management',
    'depends': [
        'base',
        'stock',
        'purchase',
        'mrp',
        'account',
        'product',
        'sale',
        'contacts'
    ],
    'data': [
        # Security
        'security/ir.model.access.csv',
        
        # Data
        'data/arc34_categories.xml',
        'data/arc34_locations.xml',
        
        # Views
        'views/arc34_general.xml',
        'views/falcon_submenu.xml',
        
        # Menus
        'views/arc34_menu.xml',
        
        # Wizards
        'wizards/falcon_receive_wizard.xml',
    ],
    'demo': [
        'demo/arc34_demo.xml',
    ],
    'installable': True,
    'application': True,
    'auto_install': False,
    'license': 'LGPL-3',
}