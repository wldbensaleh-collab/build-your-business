
from PIL import Image, ImageChops

def trim_and_transparent(im):
    # Find background color
    bg_color = im.getpixel((0,0))
    bg = Image.new(im.mode, im.size, bg_color)
    diff = ImageChops.difference(im, bg)
    diff = ImageChops.add(diff, diff, 2.0, -100)
    bbox = diff.getbbox()
    if bbox:
        cropped = im.crop(bbox)
        # Convert to RGBA to add transparency
        cropped = cropped.convert('RGBA')
        data = cropped.getdata()
        new_data = []
        # Tolerance for background color
        tolerance = 30
        for item in data:
            if abs(item[0]-bg_color[0]) < tolerance and abs(item[1]-bg_color[1]) < tolerance and abs(item[2]-bg_color[2]) < tolerance:
                new_data.append((255, 255, 255, 0))
            else:
                new_data.append(item)
        cropped.putdata(new_data)
        return cropped
    return im

img = Image.open('public/brand/build-your-business-logo.jpg').convert('RGB')

# The primary horizontal logo is roughly in the top left quadrant
primary_area = (100, 250, 1300, 700)
primary_crop = img.crop(primary_area)
primary_trimmed = trim_and_transparent(primary_crop)
# Add some padding
padding = 10
width, height = primary_trimmed.size
primary_final = Image.new('RGBA', (width + 2*padding, height + 2*padding), (255, 255, 255, 0))
primary_final.paste(primary_trimmed, (padding, padding), primary_trimmed)
primary_final.save('public/brand/build-your-business-logo.png', 'PNG')

# The symbol-only mark is roughly in the top right quadrant
mark_area = (2100, 250, 2750, 850)
mark_crop = img.crop(mark_area)
mark_trimmed = trim_and_transparent(mark_crop)
width, height = mark_trimmed.size
mark_final = Image.new('RGBA', (width + 2*padding, height + 2*padding), (255, 255, 255, 0))
mark_final.paste(mark_trimmed, (padding, padding), mark_trimmed)
mark_final.save('public/brand/build-your-business-mark.png', 'PNG')

print('Crop with transparency successful!')

