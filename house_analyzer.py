import requests
import json
import sys

def analyze_house():
    # API Configuration
    API_KEY = "vPVkUZ0KDFaHq36Wa2T5xuw4QBCkMJ"
    API_URL = "https://api.repliers.io/listings"

    print("--- House Analyzer (Powered by Repliers) ---")
    if len(sys.argv) > 1:
        address = " ".join(sys.argv[1:])
    else:
        address = input("Enter the house address: ").strip()

    if not address:
        print("Please enter a valid address.")
        return

    print(f"\nSearching for: {address}...")

    headers = {
        "REPLIERS-API-KEY": API_KEY,
        "Accept": "application/json"
    }
    
    # Advanced logic: Try to separate city if there's a comma
    params = {
        "maxResults": 3
    }

    if "," in address:
        parts = [p.strip() for p in address.split(",")]
        params["search"] = parts[0]
        if len(parts) > 1:
            params["city"] = parts[1]
    else:
        params["search"] = address

    try:
        response = requests.get(API_URL, headers=headers, params=params)
        
        if response.status_code == 200:
            data = response.json()
            listings = data.get("listings", []) if isinstance(data, dict) else []
            
            if not listings:
                print("No exact match found with city filter. Trying broad search...")
                params.pop("city", None)
                params["search"] = address
                response = requests.get(API_URL, headers=headers, params=params)
                data = response.json()
                listings = data.get("listings", []) if isinstance(data, dict) else []

            if listings:
                print(f"\nFound {len(listings)} potential match(es):")
                for i, property_info in enumerate(listings):
                    print("\n" + "="*40)
                    print(f"MATCH #{i+1}:")
                    print("="*40)
                    
                    addr = property_info.get("address", {})
                    unit = addr.get('unitNumber')
                    addr_str = f"{addr.get('streetNumber')} {addr.get('streetName')}"
                    if unit: addr_str += f" #{unit}"
                    
                    print(f"Address: {addr_str}, {addr.get('city')}, {addr.get('state')}")
                    print(f"Price: ${property_info.get('listPrice', 'N/A')}")
                    
                    details = property_info.get("details", {})
                    print(f"Bedrooms: {details.get('numBedrooms', 'N/A')}")
                    print(f"Bathrooms: {details.get('numBathrooms', 'N/A')}")
                    print(f"Property Type: {details.get('propertyType', 'N/A')}")
                    print(f"Status: {property_info.get('status', 'N/A')}")
                    print(f"MLS#: {property_info.get('mlsNumber', 'N/A')}")
            else:
                print("\nResult Status: No matching listings found.")
        else:
            print(f"Error calling API: {response.status_code}")
            print(response.text)

    except Exception as e:
        print(f"An unexpected error occurred: {e}")

if __name__ == "__main__":
    analyze_house()
