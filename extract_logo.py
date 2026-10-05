
from PIL import Image
import math

def extract_logo(input_path, output_logo, output_mark):
    img = Image.open(input_path).convert('RGB')
    width, height = img.size
    pixels = img.load()
    
    out_img = Image.new('RGBA', img.size)
    out_pixels = out_img.load()
    
    navy = (0, 31, 63)
    blue = (0, 116, 217)
    
    for y in range(height):
        for x in range(width):
            r, g, b = pixels[x, y]
            
            # Compute saturation to distinguish from grayscale checkerboard
            cmax = max(r, g, b)
            cmin = min(r, g, b)
            
            # Background is light grayscale. If max < 50, it's black text (if any), but this logo is navy/blue.
            # Let's use color distance from grayscale axis.
            # dist to grayscale = distance from (r,g,b) to (l,l,l) where l = (r+g+b)/3
            l = (r + g + b) / 3.0
            dist_gray = math.sqrt((r-l)**2 + (g-l)**2 + (b-l)**2)
            
            # Checkerboard is perfectly gray, so dist_gray should be close to 0.
            # Navy: (0, 31, 63) -> l=31.3 -> dist = sqrt((0-31.3)^2 + (31-31.3)^2 + (63-31.3)^2) = sqrt(981 + 0.1 + 1002) = 44.5
            # Blue: (0, 116, 217) -> l=111 -> dist = sqrt(111^2 + 5^2 + 106^2) = sqrt(12321 + 25 + 11236) = 153.5
            
            # If dist_gray is very low, it's background.
            if dist_gray < 5:
                alpha = 0.0
            elif dist_gray > 30:
                alpha = 1.0
            else:
                alpha = (dist_gray - 5) / 25.0
            
            if alpha > 0:
                # Find closest foreground color
                dist_navy = math.sqrt((r-navy[0])**2 + (g-navy[1])**2 + (b-navy[2])**2)
                dist_blue = math.sqrt((r-blue[0])**2 + (g-blue[1])**2 + (b-blue[2])**2)
                
                if dist_navy < dist_blue:
                    fg = navy
                else:
                    fg = blue
                    
                out_pixels[x, y] = (fg[0], fg[1], fg[2], int(alpha * 255))
            else:
                out_pixels[x, y] = (0, 0, 0, 0)
                
    # Crop to bounding box
    bbox = out_img.getbbox()
    if bbox:
        out_img = out_img.crop(bbox)
        
    # Split into logo and mark based on width ratio (the mark is on the left)
    # The mark is about 1/3 of the total width or less.
    # We can isolate the mark by looking for the gap between the mark and the text.
    # For now, let's just save the full logo.
    # And create the mark by cropping the left portion.
    
    out_img.save(output_logo, 'PNG')
    
    # Simple mark extraction: the mark is roughly square.
    # Let's crop a square from the left edge.
    w, h = out_img.size
    mark = out_img.crop((0, 0, h, h)) # Assuming the mark is roughly square and on the left
    
    # Refine mark crop
    mark_bbox = mark.getbbox()
    if mark_bbox:
        mark = mark.crop(mark_bbox)
    mark.save(output_mark, 'PNG')

extract_logo('public/brand/build-your-business-logo.png', 'public/brand/build-your-business-logo.png', 'public/brand/build-your-business-mark.png')
print('Extraction successful!')

