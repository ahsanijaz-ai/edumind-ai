import sys
import subprocess

try:
    from PIL import Image
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pillow"])
    from PIL import Image

def crop_transparent_padding(image_path):
    img = Image.open(image_path).convert("RGBA")
    # getbbox() works on the alpha channel if the image has transparency
    # It returns the bounding box of the non-zero regions
    # But wait, what if the background is solid white?
    # Let's check the top-left pixel.
    top_left = img.getpixel((0,0))
    if top_left[3] == 0:
        # Background is transparent
        bbox = img.getbbox()
    else:
        # Background is solid, we need to diff
        from PIL import ImageChops
        bg = Image.new(img.mode, img.size, top_left)
        diff = ImageChops.difference(img, bg)
        diff = ImageChops.add(diff, diff, 2.0, -100)
        bbox = diff.getbbox()

    if bbox:
        print(f"Cropping to {bbox}")
        cropped = img.crop(bbox)
        cropped.save(image_path)
    else:
        print("No cropping needed or image is empty.")

crop_transparent_padding('d:/UNIVERSITY/Study_Nexa_project/frontend/public/logo.png')
