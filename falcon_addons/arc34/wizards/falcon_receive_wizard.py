from odoo import models, fields, api, _
from odoo.exceptions import UserError
import logging

_logger = logging.getLogger(__name__)


class FalconReceiveWizard(models.TransientModel):
    _name = 'arc34.falcon.receive.wizard'
    _description = 'Falcon Server Receive Wizard'

    # Server Information
    server_name = fields.Char(
        string='Server Name',
        required=True,
        help='Name/Identifier for the received server'
    )
    server_serial = fields.Char(
        string='Server Serial Number',
        required=True,
        help='Serial number from the physical server'
    )
    server_model = fields.Char(
        string='Server Model',
        required=True,
        help='Server model (e.g., Supermicro SYS-610T)'
    )
    
    # Contract Information
    contract_number = fields.Char(
        string='Contract Number',
        required=True,
        help='Govcon contract number'
    )
    contract_line_item = fields.Char(
        string='Contract Line Item',
        required=True,
        help='Specific line item from contract'
    )
    
    # Component Information
    cpu_count = fields.Integer(string='CPU Count', default=2)
    cpu_model = fields.Char(string='CPU Model')
    ram_gb = fields.Integer(string='RAM (GB)', default=64)
    ssd_count = fields.Integer(string='SSD Count', default=2)
    ssd_capacity_gb = fields.Integer(string='SSD Capacity (GB)', default=1000)
    psu_count = fields.Integer(string='PSU Count', default=2)
    
    # Location
    location_id = fields.Many2one(
        'stock.location',
        string='Location',
        domain=[('usage', '=', 'internal')],
        default=lambda self: self.env.ref('stock.stock_location_stock', raise_if_not_found=False)
    )
    
    # Vendor Information
    vendor_id = fields.Many2one('res.partner', string='Vendor', domain=[('supplier', '=', True)])
    po_reference = fields.Char(string='PO Reference')
    
    @api.model
    def default_get(self, fields_list):
        """Set default values"""
        defaults = super(FalconReceiveWizard, self).default_get(fields_list)
        
        # Try to get default location
        try:
            location = self.env.ref('stock.stock_location_stock')
            if location:
                defaults['location_id'] = location.id
        except:
            pass
            
        return defaults

    def action_receive_server(self):
        """Receive the server and create all necessary records"""
        self.ensure_one()
        
        # Validate inputs
        if not self.server_name or not self.server_serial:
            raise UserError(_('Server name and serial number are required.'))
        
        if self.cpu_count < 1 or self.ram_gb < 1:
            raise UserError(_('Invalid component specifications.'))
        
        # Create or get products for components
        cpu_product = self._get_or_create_component_product('CPU', self.cpu_model, 'cpu')
        ram_product = self._get_or_create_component_product('RAM', f'{self.ram_gb}GB', 'ram')
        ssd_product = self._get_or_create_component_product('SSD', f'{self.ssd_capacity_gb}GB', 'ssd')
        psu_product = self._get_or_create_component_product('PSU', 'Standard', 'psu')
        
        # Create received server picking
        picking = self._create_received_server_picking(cpu_product, ram_product, ssd_product, psu_product)
        
        # Create component moves
        self._create_component_moves(picking, cpu_product, ram_product, ssd_product, psu_product)
        
        # Return action to view the created picking
        return {
            'type': 'ir.actions.act_window',
            'name': _('Received Server'),
            'res_model': 'stock.picking',
            'res_id': picking.id,
            'view_mode': 'form',
            'target': 'current',
        }

    def _get_or_create_component_product(self, component_type, description, falcon_type):
        """Get or create component product"""
        # Search for existing product
        product = self.env['product.product'].search([
            ('name', 'ilike', component_type),
            ('falcon_component_type', '=', falcon_type),
            ('arc34_part_number', 'ilike', description),
        ], limit=1)
        
        if not product:
            # Create new product
            product = self.env['product.product'].create({
                'name': f'{component_type} - {description}',
                'type': 'product',
                'falcon_part': True,
                'falcon_component_type': falcon_type,
                'govcon_category': 'server_part',
                'arc34_part_number': f'{component_type}-{description}',
                'description': f'{component_type} component for Falcon servers',
                'list_price': 0.0,  # Will be set based on actual cost
                'standard_price': 0.0,
            })
            
            _logger.info(f'Created new {component_type} product: {product.name}')
        
        return product

    def _create_received_server_picking(self, cpu_product, ram_product, ssd_product, psu_product):
        """Create the received server picking"""
        picking_type = self.env['stock.picking.type'].search([
            ('code', '=', 'incoming'),
            ('warehouse_id', '!=', False)
        ], limit=1)
        
        if not picking_type:
            raise UserError(_('No incoming picking type found.'))
        
        picking = self.env['stock.picking'].create({
            'name': f'RECV-{self.server_name}-{self.server_serial}',
            'picking_type_id': picking_type.id,
            'location_id': self.env.ref('stock.stock_location_suppliers').id,
            'location_dest_id': self.location_id.id,
            'partner_id': self.vendor_id.id,
            'origin': self.po_reference,
            
            # ARC34 fields
            'arc34_received_server': True,
            'contract_number': self.contract_number,
            'contract_line_item': self.contract_line_item,
            'contract_po_reference': self.po_reference,
        })
        
        return picking

    def _create_component_moves(self, picking, cpu_product, ram_product, ssd_product, psu_product):
        """Create stock moves for all components"""
        moves = []
        
        # CPU moves
        if self.cpu_count > 0:
            moves.append({
                'name': f'Receive {self.cpu_count}x {cpu_product.name}',
                'product_id': cpu_product.id,
                'product_uom_qty': self.cpu_count,
                'product_uom': cpu_product.uom_id.id,
                'location_id': picking.location_id.id,
                'location_dest_id': picking.location_dest_id.id,
                'picking_id': picking.id,
            })
        
        # RAM moves
        if self.ram_gb > 0:
            ram_qty = self.ram_gb // 16  # Assuming 16GB modules
            if ram_qty > 0:
                moves.append({
                    'name': f'Receive {ram_qty}x {ram_product.name}',
                    'product_id': ram_product.id,
                    'product_uom_qty': ram_qty,
                    'product_uom': ram_product.uom_id.id,
                    'location_id': picking.location_id.id,
                    'location_dest_id': picking.location_dest_id.id,
                    'picking_id': picking.id,
                })
        
        # SSD moves
        if self.ssd_count > 0:
            moves.append({
                'name': f'Receive {self.ssd_count}x {ssd_product.name}',
                'product_id': ssd_product.id,
                'product_uom_qty': self.ssd_count,
                'product_uom': ssd_product.uom_id.id,
                'location_id': picking.location_id.id,
                'location_dest_id': picking.location_dest_id.id,
                'picking_id': picking.id,
            })
        
        # PSU moves
        if self.psu_count > 0:
            moves.append({
                'name': f'Receive {self.psu_count}x {psu_product.name}',
                'product_id': psu_product.id,
                'product_uom_qty': self.psu_count,
                'product_uom': psu_product.uom_id.id,
                'location_id': picking.location_id.id,
                'location_dest_id': picking.location_dest_id.id,
                'picking_id': picking.id,
            })
        
        if moves:
            self.env['stock.move'].create(moves)
            _logger.info(f'Created {len(moves)} component moves for server {self.server_name}')