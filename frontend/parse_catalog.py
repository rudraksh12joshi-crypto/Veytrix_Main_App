import openpyxl
import json

wb = openpyxl.load_workbook(r'c:\Users\Rudrik Joshi\Downloads\Veytrix_Main_App\Veytrix_Main_App\frontend\src\data\catalog\asset_catalog.xlsx')
sheet = wb.active
rows = list(sheet.iter_rows(values_only=True))
filters = [r for r in rows[1:] if r[2] == 'FILTERS']

parsed = []
for r in filters:
    fid = f"filter_{r[0]}"
    fname = str(r[1]).strip()
    cat = str(r[3]).strip()
    plan_raw = str(r[4]).strip().upper()
    plan = 'Free' if plan_raw == 'FREE' else ('Pro' if plan_raw == 'PRO' else 'Premium')
    
    cat_slug = cat.lower().replace(' ', '_').replace('&', 'and')
    
    if cat in ['Colour', 'Nature', 'Black & White']:
        engine_type = 'ColorMatrixEngine'
        engine_key = f'color_matrix_{cat_slug}'
    elif cat in ['Portrait', 'Cinematic', 'Vintage & Retro']:
        engine_type = 'LUTSplitToneEngine'
        engine_key = f'lut_splittone_{cat_slug}'
    else:
        engine_type = 'MultiPassShaderEngine'
        engine_key = f'multipass_shader_{cat_slug}'

    parsed.append({
        'id': fid,
        'name': fname,
        'category': cat,
        'requiredPlan': plan,
        'engineType': engine_type,
        'engineKey': engine_key,
        'enabled': bool(r[6]),
        'version': str(r[7] or '1.0.0'),
        'description': f'{fname} filter from {cat} collection',
        'type': 'FILTERS'
    })

with open(r'c:\Users\Rudrik Joshi\Downloads\Veytrix_Main_App\Veytrix_Main_App\frontend\src\data\catalog\parsed_filters.json', 'w') as f:
    json.dump(parsed, f, indent=2)

print(f"SUCCESS: Generated {len(parsed)} filters")
