from odoo import models, fields, api, _
from datetime import datetime


class StockPicking(models.Model):
    _inherit = 'stock.picking'

    # ARC34 Contract Fields
    contract_number = fields.Char(string='Contract Number')
    contract_line_item = fields.Char(string='Contract Line Item')
    contract_po_reference = fields.Char(string='Contract PO Reference')
    
    # Enhanced tracking
    arc34_received_server = fields.Boolean(
        string='ARC34 Received Server',
        help='Mark as received server for Falcon workflow'
    )
    arc34_extraction_progress = fields.Float(
        string='Extraction Progress',
        compute='_compute_extraction_progress',
        store=True,
        help='Progress of component extraction from received server'
    )
    
    # Falcon workflow fields
    falcon_server_build = fields.Boolean(
        string='Falcon Server Build',
        help='Mark as Falcon server build'
    )
    falcon_source_server = fields.Many2one(
        'stock.picking',
        string='Source Rack Server',
        domain=[('arc34_received_server', '=', True)],
        help='Source rack server for Falcon build'
    )
    
    # Enhanced location tracking
    arc34_location_type = fields.Selection([
        ('ashburn_dc', 'Ashburn DC'),
        ('vendor', 'Vendor'),
        ('customer', 'Customer'),
        ('falcon_build', 'Falcon Build Area'),
        ('falcon_parts', 'Falcon Parts Storage'),
    ], string='Location Type', compute='_compute_location_type', store=True)
    
    # Govcon compliance
    delivery_method = fields.Selection([
        ('standard', 'Standard'),
        ('express', 'Express'),
        ('overnight', 'Overnight'),
        ('contract', 'Contract Delivery'),
    ], string='Delivery Method', default='standard')
    
    @api.depends('location_id', 'location_dest_id')
    def _compute_location_type(self):
        """Determine location type based on source/destination"""
        for picking in self:
            # Check if this is a Falcon workflow operation
            if picking.arc34_received_server:
                picking.arc34_location_type = 'falcon_parts'
            elif picking.falcon_server_build:
                picking.arc34_location_type = 'falcon_build'
            else:
                # Determine based on location names
                loc_name = (picking.location_id.name or '').lower()
                dest_name = (picking.location_dest_id.name or '').lower()
                
                if 'ashburn' in loc_name or 'ashburn' in dest_name:
                    picking.arc34_location_type = 'ashburn_dc'
                elif 'vendor' in loc_name or 'vendor' in dest_name:
                    picking.arc34_location_type = 'vendor'
                elif 'customer' in loc_name or 'customer' in dest_name:
                    picking.arc34_location_type = 'customer'
                else:
                    picking.arc34_location_type = 'standard'

    @api.depends('move_ids_without_package')
    def _compute_extraction_progress(self):
        """Calculate extraction progress for received servers"""
        for picking in self:
            if not picking.arc34_received_server:
                picking.arc34_extraction_progress = 0.0
                continue
            
            # Count total moves vs completed moves
            total_moves = len(picking.move_ids_without_package)
            completed_moves = len([
                move for move in picking.move_ids_without_package 
                if move.state == 'done'
            ])
            
            picking.arc34_extraction_progress = (
                (completed_moves / total_moves * 100) if total_moves > 0 else 0.0
            )

    def action_view_falcon_received_servers(self):
        """Action to view received servers"""
        return {
            'type': 'ir.actions.act_window',
            'name': _('Received Servers'),
            'res_model': 'stock.picking',
            'view_mode': 'tree,form',
            'domain': [('arc34_received_server', '=', True)],
            'context': {'default_arc34_received_server': True}
        }

    def action_view_falcon_server_builds(self):
        """Action to view Falcon server builds"""
        return {
            'type': 'ir.actions.act_window',
            'name': _('Falcon Server Builds'),
            'res_model': 'stock.picking',
            'view_mode': 'tree,form',
            'domain': [('falcon_server_build', '=', True)],
            'context': {'default_falcon_server_build': True}
        }

    def action_create_falcon_extraction(self):
        """Create extraction moves for received server components"""
        self.ensure_one()
        if not self.arc34_received_server:
            raise UserError(_('This operation is only available for received servers.'))
        
        # Create internal moves for component extraction
        extraction_moves = []
        for move in self.move_ids_without_package:
            if move.state == 'done':
                continue
                
            # Create reverse move for extraction
            extraction_moves.append({
                'name': f'Extract {move.product_id.name}',
                'product_id': move.product_id.id,
                'product_uom_qty': move.product_uom_qty,
                'product_uom': move.product_uom.id,
                'location_id': self.location_dest_id.id,
                'location_dest_id': self.env.ref('arc34.location_falcon_parts').id,
                'picking_type_id': self.picking_type_id.id,
            })
        
        if extraction_moves:
            self.env['stock.move'].create(extraction_moves)
            return {
                'type': 'ir.actions.client',
                'tag': 'display_notification',
                'params': {
                    'title': _('Extraction Created'),
                    'message': _('Component extraction moves have been created.'),
                    'type': 'success',
                    'sticky': False,
                }
            }
        
        return {
            'type': 'ir.actions.client',
            'tag': 'display_notification',
            'params': {
                'title': _('No Extraction Needed'),
                'message': _('All components have already been extracted.'),
                'type': 'info',
                'sticky': False,
            }
        }