from PIL import Image, ImageFont, ImageDraw
import numpy as np

# Load logo_tight to compare
orig = Image.open('logo_tight.png')

# Create a test canvas
canvas = Image.new('RGBA', (600, 120), (0, 0, 0, 0))
draw = ImageDraw.Draw(canvas)

# Try fonts
try:
    font_large = ImageFont.truetype(r'C:\Windows\Fonts\segoeuib.ttf', 44)
    font_small = ImageFont.truetype(r'C:\Windows\Fonts\segoeuib.ttf', 16)
except:
    font_large = ImageFont.truetype(r'C:\Windows\Fonts\arialbd.ttf', 44)
    font_small = ImageFont.truetype(r'C:\Windows\Fonts\arialbd.ttf', 16)

# Draw S mark:
# Let's see if we have clean S mark
s_mark = Image.open('s_emblem.png').convert('RGBA')
# Let's clean s_mark with exact threshold:
s_arr = np.array(s_mark)
# Background is dark red (R < 60)
# Red is R > 120, G < 50
# White is R > 180, G > 180, B > 180
s_clean = np.zeros_like(s_arr)
is_red = (s_arr[:, :, 0] > 90) & (s_arr[:, :, 1] < 100)
is_white = (s_arr[:, :, 0] > 160) & (s_arr[:, :, 1] > 160) & (s_arr[:, :, 2] > 160)

s_clean[is_red] = [238, 20, 24, 255]
s_clean[is_white] = [255, 255, 255, 255]

s_clean_im = Image.fromarray(s_clean).resize((68 * 2, 54 * 2), Image.Resampling.LANCZOS)
canvas.paste(s_clean_im, (10, 8), s_clean_im)

# Draw text
draw.text((155, 14), 'Slidescoiety', font=font_large, fill=(255, 255, 255, 255))
# Letter spaced SIM RACING STORE:
text_store = 'S I M   R A C I N G   S T O R E'
draw.text((158, 68), text_store, font=font_small, fill=(245, 245, 245, 230))

canvas.save('test_vector_logo.png')
print('Saved test_vector_logo.png')

