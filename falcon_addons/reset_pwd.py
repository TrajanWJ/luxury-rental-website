try:
    user = env['res.users'].search([('login', '=', 'trajan@arc34.com')])
    if user:
        user.write({'password': 'admin'})
        env.cr.commit()
        print("SUCCESS: Password reset for trajan@arc34.com to 'admin'")
    else:
        print("ERROR: User not found")
except Exception as e:
    print(f"ERROR: {e}")
