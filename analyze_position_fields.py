import json

with open('WebserviceOperationJSON/Create_Position Operation Details.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

def print_params(params, indent=0, max_depth=3):
    if indent >= max_depth:
        return
    for param in params:
        prefix = '  ' * indent
        req = ' [REQUIRED]' if param.get('required', False) else ''
        attr = ' [@ATTR]' if param.get('is_attribute', False) else ''
        print(f"{prefix}{param['name']}{req}{attr}")
        print(f"{prefix}  Type: {param['type']}, Cardinality: {param['cardinality']}")
        if param.get('description'):
            desc = param['description'][:100] + '...' if len(param['description']) > 100 else param['description']
            print(f"{prefix}  Desc: {desc}")
        if param['is_complex_type'] and 'nested_structure' in param:
            print_params(param['nested_structure']['parameters'], indent + 1, max_depth)
        print()

# Find Create_Position_Data
for param in data['request']['parameters']:
    if param['name'] == 'Create_Position_Data':
        print('=== CREATE POSITION DATA STRUCTURE ===\n')
        print_params(param['nested_structure']['parameters'])
        break
