import json
from bs4 import BeautifulSoup
from typing import Dict, List, Any
import sys
import os


def parse_parameter_table(table) -> List[Dict[str, Any]]:
    """Parse a parameter table and extract parameter details."""
    parameters = []
    rows = table.find_all('tr')
    
    for row in rows[1:]:  # Skip header row
        cells = row.find_all('td')
        if len(cells) >= 4:
            param_name = cells[0].get_text(strip=True)
            param_type = cells[1].get_text(strip=True)
            cardinality = cells[2].get_text(strip=True)
            description = cells[3].get_text(strip=True)
            
            # Skip empty rows or header rows
            if not param_name or param_name == 'Parameter name':
                continue
            
            # Determine if it's an attribute or element
            is_attribute = param_name.startswith('@')
            clean_name = param_name.lstrip('@').strip()
            
            # Check if type is a link to another complex type
            type_link = cells[1].find('a')
            is_complex_type = type_link is not None
            complex_type_ref = None
            
            if is_complex_type and type_link:
                complex_type_ref = type_link.get('href', '').replace('#', '')
            
            param_info = {
                'name': clean_name,
                'original_name': param_name,
                'type': param_type,
                'is_attribute': is_attribute,
                'is_complex_type': is_complex_type,
                'cardinality': cardinality,
                'description': description,
                'required': '[1..1]' in cardinality or cardinality.startswith('[1..')
            }
            
            if complex_type_ref:
                param_info['complex_type_ref'] = complex_type_ref
            
            parameters.append(param_info)
    
    return parameters


def parse_element_details(soup, element_name: str) -> Dict[str, Any]:
    """Parse details for a specific element (complex type)."""
    # Find the anchor with the exact name
    anchor = soup.find('a', {'name': element_name})
    if not anchor:
        return None
    
    # Find the parent td or tr
    element_section = anchor.find_parent('td')
    if not element_section:
        return None
    
    # Get the h4 title
    title_element = element_section.find('h4', class_='ws-title')
    if not title_element:
        return None
    
    # Get description - it's typically in the first div after h4
    description = ""
    next_elem = title_element.find_next_sibling()
    if next_elem and next_elem.name == 'div':
        description = next_elem.get_text(strip=True)
    
    # Find the parameter table - look for table with class 'typetable'
    param_table = None
    for table in element_section.find_all('table', class_='typetable'):
        # Check if this table has parameter headers
        headers = table.find_all('th')
        if headers and any('Parameter name' in th.get_text() for th in headers):
            param_table = table
            break
    
    parameters = []
    if param_table:
        parameters = parse_parameter_table(param_table)
    
    return {
        'element_name': element_name.replace('Type', '').replace('_Request', '').replace('_Response', ''),
        'full_element_name': element_name,
        'description': description,
        'parameters': parameters
    }


def parse_nested_types(soup, parameters: List[Dict[str, Any]], parsed_types: set) -> List[Dict[str, Any]]:
    """Recursively parse nested complex types."""
    for param in parameters:
        if param['is_complex_type'] and 'complex_type_ref' in param:
            type_ref = param['complex_type_ref']
            
            # Avoid infinite recursion
            if type_ref in parsed_types:
                continue
            
            parsed_types.add(type_ref)
            nested_details = parse_element_details(soup, type_ref)
            
            if nested_details:
                param['nested_structure'] = nested_details
                # Recursively parse nested types
                if nested_details['parameters']:
                    parse_nested_types(soup, nested_details['parameters'], parsed_types)
    
    return parameters


def parse_workday_soap_doc(html_content: str) -> Dict[str, Any]:
    """Parse Workday SOAP operation documentation HTML."""
    soup = BeautifulSoup(html_content, 'html.parser')
    
    # Extract operation name
    operation_title = soup.find('h3', class_='ws-title')
    operation_name = operation_title.get_text(strip=True).replace('Operation: ', '') if operation_title else "Unknown"
    
    # Extract operation description
    operation_desc = ""
    if operation_title:
        next_p = operation_title.find_next('p')
        if next_p:
            operation_desc = next_p.get_text(strip=True)
    
    # Extract web service info - look in the breadcrumb or service directory links
    web_service_name = "Unknown"
    service_links = soup.find_all('a', href=lambda x: x and '.html' in str(x))
    for link in service_links:
        link_text = link.get_text(strip=True)
        if 'Human_Resources' in link_text or 'v45' in link_text:
            web_service_name = link_text
            break
    
    # Find all anchors to identify Request and Response element names
    request_element = None
    response_element = None
    
    # Look for Request section
    request_header = soup.find('h4', class_='ws-title', string=lambda x: x and 'Request' in x)
    if request_header:
        request_link = request_header.find_next('a', href=lambda x: x and '#' in str(x))
        if request_link:
            request_element = request_link.get('href').replace('#', '')
    
    # Look for Response section
    response_header = soup.find('h4', class_='ws-title', string=lambda x: x and 'Response' in x)
    if response_header:
        response_link = response_header.find_next('a', href=lambda x: x and '#' in str(x))
        if response_link:
            response_element = response_link.get('href').replace('#', '')
    
    # Parse Request structure
    request_details = None
    if request_element:
        request_details = parse_element_details(soup, request_element)
        if request_details and request_details['parameters']:
            parsed_types = {request_element}
            parse_nested_types(soup, request_details['parameters'], parsed_types)
    
    # Parse Response structure
    response_details = None
    if response_element:
        response_details = parse_element_details(soup, response_element)
        if response_details and response_details['parameters']:
            parsed_types = {response_element}
            parse_nested_types(soup, response_details['parameters'], parsed_types)
    
    # Build final JSON structure
    result = {
        'operation_name': operation_name,
        'description': operation_desc,
        'web_service': web_service_name,
        'request': request_details,
        'response': response_details
    }
    
    return result


def main():
    """Main function to parse HTML file and output JSON."""
    if len(sys.argv) < 2:
        print("Usage: python soap_parser.py <html_file_path> [output_json_path]")
        sys.exit(1)
    
    input_file = sys.argv[1]
    
    # Create output directory
    output_dir = "WebserviceOperationJSON"
    os.makedirs(output_dir, exist_ok=True)
    
    # If output file not specified, create one based on input filename
    if len(sys.argv) > 2:
        output_filename = sys.argv[2]
    else:
        # Get just the filename without path
        base_filename = os.path.basename(input_file)
        # Replace .html extension with .json
        if base_filename.lower().endswith('.html'):
            output_filename = base_filename[:-5] + '.json'
        else:
            output_filename = base_filename + '.json'
    
    # Combine with output directory
    output_file = os.path.join(output_dir, output_filename)
    
    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            html_content = f.read()
        
        parsed_data = parse_workday_soap_doc(html_content)
        
        json_output = json.dumps(parsed_data, indent=2, ensure_ascii=False)
        
        # Always write to file
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(json_output)
        print(f"Successfully parsed and saved to {output_file}")
    
    except FileNotFoundError:
        print(f"Error: File '{input_file}' not found.")
        sys.exit(1)
    except Exception as e:
        print(f"Error: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()