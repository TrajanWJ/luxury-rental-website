from odoo import models, fields, api, _
from odoo.exceptions import UserError
import re


class ProductProduct(models.Model):
    _inherit = 'product.product'

    # ARC34 IPN Fields
    arc34_ipn = fields.Char(
        string='ARC34 IPN',
        compute='_compute_arc34_ipn',
        store=True,
        readonly=True,
        help='Auto-generated ARC34 IPN format: ARC34-XXX-YYYY-R1'
    )
    arc34_revision = fields.Char(
        string='Revision',
        default='R1',
        help='Product revision number'
    )
    arc34_part_number = fields.Char(
        string='Part Number',
        help='Manufacturer part number'
    )
    
    # Govcon Categories
    govcon_category = fields.Selection([
        ('cots', 'COTS'),
        ('server_part', 'Server Part'),
        ('assembly', 'Assembly'),
        ('falcon_build', 'Falcon Build'),
    ], string='Govcon Category', default='cots')
    
    # Contract Information
    contract_number = fields.Char(string='Contract Number')
    contract_line_item = fields.Char(string='Contract Line Item')
    
    # Falcon-specific fields
    falcon_part = fields.Boolean(
        string='Falcon Part',
        compute='_compute_falcon_part',
        store=True,
        help='True for parts eligible for Falcon workflow'
    )
    falcon_component_type = fields.Selection([
        ('cpu', 'CPU'),
        ('ram', 'RAM'),
        ('ssd', 'SSD'),
        ('hdd', 'HDD'),
        ('psu', 'Power Supply'),
        ('motherboard', 'Motherboard'),
        ('chassis', 'Chassis'),
        ('other', 'Other'),
    ], string='Component Type')
    
    # Enhanced tracking
    manufacturer = fields.Char(string='Manufacturer')
    model_number = fields.Char(string='Model Number')
    serial_number_required = fields.Boolean(string='Serial Number Required', default=False)
    
    @api.depends('name', 'arc34_part_number', 'arc34_revision')
    def _compute_arc34_ipn(self):
        """Generate ARC34 IPN format: ARC34-XXX-YYYY-R1"""
        for product in self:
            if product.arc34_part_number:
                # Use part number if available
                base_code = product.arc34_part_number.replace(' ', '').upper()[:10]
            else:
                # Generate from product name
                name_clean = re.sub(r'[^a-zA-Z0-9]', '', product.name or '')
                base_code = name_clean[:10] if name_clean else 'UNKNOWN'
            
            revision = product.arc34_revision or 'R1'
            product.arc34_ipn = f"ARC34-{base_code}-{revision}"

    @api.depends('govcon_category', 'falcon_component_type')
    def _compute_falcon_part(self):
        """Determine if product is eligible for Falcon workflow"""
        for product in self:
            product.falcon_part = (
                product.govcon_category in ['server_part', 'assembly'] and
                product.falcon_component_type != 'other'
            )

    @api.constrains('arc34_ipn')
    def _check_arc34_ipn_unique(self):
        """Ensure ARC34 IPN is unique"""
        for product in self:
            if product.arc34_ipn:
                existing = self.search([
                    ('arc34_ipn', '=', product.arc34_ipn),
                    ('id', '!=', product.id)
                ])
                if existing:
                    raise UserError(_('ARC34 IPN must be unique!'))

    def action_view_falcon_parts(self):
        """Action to view Falcon parts"""
        self.ensure_one()
        return {
            'type': 'ir.actions.act_window',
            'name': _('Falcon Parts'),
            'res_model': 'product.product',
            'view_mode': 'tree,form',
            'domain': [('falcon_part', '=', True)],
            'context': {'default_falcon_part': True}
        }