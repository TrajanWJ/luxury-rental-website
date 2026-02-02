from odoo import models, fields, api, _
from odoo.exceptions import UserError


class AccountMove(models.Model):
    _inherit = 'account.move'

    # ARC34 Contract Fields for DCAA compliance
    contract_number = fields.Char(
        string='Contract Number',
        help='Govcon contract number for DCAA reporting'
    )
    contract_line_item = fields.Char(
        string='Contract Line Item',
        help='Specific line item from contract'
    )
    contract_po_reference = fields.Char(
        string='Contract PO Reference',
        help='Purchase order reference from contract'
    )
    
    # Enhanced tracking
    arc34_invoice_type = fields.Selection([
        ('cots', 'COTS Purchase'),
        ('server', 'Server Purchase'),
        ('falcon_build', 'Falcon Build'),
        ('service', 'Service'),
        ('other', 'Other'),
    ], string='Invoice Type', compute='_compute_invoice_type', store=True)
    
    # Govcon compliance
    cost_center = fields.Char(string='Cost Center')
    project_code = fields.Char(string='Project Code')
    work_order = fields.Char(string='Work Order')
    
    # DCAA fields
    direct_cost = fields.Boolean(string='Direct Cost', default=True)
    overhead_rate = fields.Float(string='Overhead Rate (%)', default=0.0)
    fee_rate = fields.Float(string='Fee Rate (%)', default=0.0)
    
    @api.depends('invoice_line_ids.product_id.govcon_category')
    def _compute_invoice_type(self):
        """Determine invoice type based on products"""
        for invoice in self:
            if not invoice.invoice_line_ids:
                invoice.arc34_invoice_type = 'other'
                continue
            
            categories = invoice.invoice_line_ids.mapped('product_id.govcon_category')
            
            if any(cat == 'falcon_build' for cat in categories):
                invoice.arc34_invoice_type = 'falcon_build'
            elif any(cat == 'server_part' for cat in categories):
                invoice.arc34_invoice_type = 'server'
            elif any(cat == 'cots' for cat in categories):
                invoice.arc34_invoice_type = 'cots'
            else:
                invoice.arc34_invoice_type = 'other'

    def action_create_dcaa_report(self):
        """Generate DCAA compliance report"""
        self.ensure_one()
        return {
            'type': 'ir.actions.report',
            'report_name': 'arc34.report_dcaa_compliance',
            'report_type': 'qweb-pdf',
            'data': {
                'invoice_id': self.id,
                'contract_number': self.contract_number,
                'cost_center': self.cost_center,
                'project_code': self.project_code,
            }
        }

    @api.constrains('contract_number', 'contract_line_item')
    def _check_contract_compliance(self):
        """Ensure contract information is complete for govcon compliance"""
        for invoice in self:
            if invoice.move_type in ['in_invoice', 'out_invoice']:
                if not invoice.contract_number:
                    raise UserError(_('Contract number is required for govcon compliance.'))
                if not invoice.contract_line_item:
                    raise UserError(_('Contract line item is required for govcon compliance.'))

    def action_view_contract_invoices(self):
        """Action to view invoices by contract"""
        self.ensure_one()
        return {
            'type': 'ir.actions.act_window',
            'name': _('Contract Invoices'),
            'res_model': 'account.move',
            'view_mode': 'tree,form',
            'domain': [
                ('contract_number', '=', self.contract_number),
                ('move_type', 'in', ['in_invoice', 'out_invoice'])
            ],
            'context': {
                'default_contract_number': self.contract_number,
                'default_contract_line_item': self.contract_line_item
            }
        }