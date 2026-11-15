from PIL import Image
import numpy as np

im = Image.open('s_emblem.png').convert('RGB')
arr = np.array(im).astype(float)

r = arr[:, :, 0]
g = arr[:, :, 1]
b = arr[:, :, 2]

# The emblem has:
# Red part: r > 120, g < 80
# White notch: r > 200, g > 200, b > 200
# Background: r < 60, g < 10, b < 10

# Alpha is based on r and brightness above background
bg_r = 38.0
diff_r = np.maximum(0.0, r - bg_r)
diff_white = np.maximum(0.0, g - 10.0)

signal = np.maximum(diff_r * 1.3, diff_white * 2.0)
alpha = np.clip((signal - 20.0) / 45.0, 0.0, 1.0) * 255.0

# Unmultiply
fg = arr.copy()
# For pixels where alpha > 0:
mask = alpha > 0
fg[mask, 0] = np.clip((arr[mask, 0] - (1.0 - alpha[mask]/255.0) * bg_r) / (alpha[mask]/255.0), 0, 255)
# Enhance red
is_red = (fg[:, :, 0] > 140) & (fg[:, :, 1] < 120)
fg[is_red, 0] = np.clip(fg[is_red, 0] * 1.15, 0, 255)
fg[is_red, 1] = 10
fg[is_red, 2] = 10

# White notch
is_white = (arr[:, :, 1] > 100)
fg[is_white] = [255, 255, 255]

rgba = np.dstack([fg, alpha]).astype(np.uint8)
out_im = Image.fromarray(rgba)
# Upscale 3x with bicubic for high DPI
out_im_3x = out_im.resize((out_im.width * 3, out_im.height * 3), Image.Resampling.LANCZOS)
out_im_3x.save('public/slidescoiety-s-mark.png')
print('Saved public/slidescoiety-s-mark.png!')

