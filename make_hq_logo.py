
from PIL import Image
import math

def process_image(input_path, output_path, crop_box):
    img = Image.open(input_path).convert('RGB')
    cropped = img.crop(crop_box)
    width, height = cropped.size
    
    pixels = cropped.load()
    
    # Estimate background color from edges
    bg_r, bg_g, bg_b = 245, 245, 245
    
    out_img = Image.new('RGBA', cropped.size)
    out_pixels = out_img.load()
    
    for y in range(height):
        for x in range(width):
            r, g, b = pixels[x, y]
            
            # Distance from background
            dist = math.sqrt((r-bg_r)**2 + (g-bg_g)**2 + (b-bg_b)**2)
            
            # Thresholds
            if dist < 20:
                alpha = 0.0
            elif dist > 150:
                alpha = 1.0
            else:
                alpha = (dist - 20) / 130.0
                
            if alpha > 0:
                # Recover foreground color to remove halo
                # C_fg = (C_obs - C_bg * (1 - A)) / A
                try:
                    fg_r = max(0, min(255, int((r - bg_r * (1 - alpha)) / alpha)))
                    fg_g = max(0, min(255, int((g - bg_g * (1 - alpha)) / alpha)))
                    fg_b = max(0, min(255, int((b - bg_b * (1 - alpha)) / alpha)))
                except ZeroDivisionError:
                    fg_r, fg_g, fg_b = r, g, b
            else:
                fg_r, fg_g, fg_b = 0, 0, 0
                
            out_pixels[x, y] = (fg_r, fg_g, fg_b, int(alpha * 255))
            
    bbox = out_img.getbbox()
    if bbox:
        out_img = out_img.crop(bbox)
        
    # Add small padding
    padding = 20
    final_w, final_h = out_img.size
    final_img = Image.new('RGBA', (final_w + 2*padding, final_h + 2*padding), (255, 255, 255, 0))
    final_img.paste(out_img, (padding, padding), out_img)
    final_img.save(output_path, 'PNG')

process_image('public/brand/build-your-business-logo.jpg', 'public/brand/build-your-business-logo-hq.png', (100, 250, 1300, 700))
print('HQ logo created successfully')

