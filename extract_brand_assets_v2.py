import fitz
import os

pdf_path = "WPP_Style_Guide_widescreen_v1 (1).pdf"
output_dir = "public/brand"

if not os.path.exists(output_dir):
    os.makedirs(output_dir)

def extract_assets():
    try:
        doc = fitz.open(pdf_path)
        print(f"Opened PDF: {pdf_path}")
        
        count = 0
        for i in range(len(doc)):
            page = doc[i]
            # Extract embedded images
            image_list = page.get_images(full=True)
            
            # Print info about page
            print(f"Page {i+1}: found {len(image_list)} images")
            
            for img_index, img in enumerate(image_list):
                xref = img[0]
                base_image = doc.extract_image(xref)
                image_bytes = base_image["image"]
                image_ext = base_image["ext"]
                
                # Filter small icons/noise
                if len(image_bytes) < 2000: # Skip very small files
                    continue
                    
                filename = f"{output_dir}/extracted_p{i+1}_{img_index}.{image_ext}"
                with open(filename, "wb") as f:
                    f.write(image_bytes)
                print(f"Saved: {filename}")
                count += 1
                
        print(f"Extraction complete. Total images: {count}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    extract_assets()
