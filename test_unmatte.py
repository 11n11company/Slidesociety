from PIL import Image, ImageFilter
import numpy as np

im = Image.open('logo_tight.png').convert('RGB')
arr = np.array(im).astype(float)

# In logo_tight.png, background is dark red.
# Corners and borders are 100% background:
bg_color = arr[0:4, 0:4].mean(axis=(0,1))
print('Sampled background color:', bg_color)

# For each pixel, calculate distance from background color in RGB space:
# But note: foreground red has high R and low G, B.
# Background has low R (~35) and near zero G, B.
# White text has high R, high G, high B.
diff = np.sqrt(
    (arr[:, :, 0] - bg_color[0])**2 + 
    (arr[:, :, 1] - bg_color[1])**2 * 3.0 + 
    (arr[:, :, 2] - bg_color[2])**2 * 3.0
)

# Pixels with diff < 15 are definitely background
# Pixels with diff > 45 are definitely foreground
alpha = np.clip((diff - 14.0) / (45.0 - 14.0), 0.0, 1.0)

# Clean up colors:
fg = arr.copy()
# For pixels where alpha > 0, unblend
# color = alpha * fg + (1 - alpha) * bg => fg = (color - (1-alpha)*bg)/alpha
a_safe = np.maximum(alpha, 0.001)[:, :, np.newaxis]
unblended = (fg - (1.0 - a_safe) * bg_color) / a_safe
unblended = np.clip(unblended, 0.0, 255.0)

# Boost white text vibrancy
white_mask = (arr[:, :, 1] > 25) & (alpha > 0.5)
unblended[white_mask, 0] = np.clip(unblended[white_mask, 0] * 1.2 + 20, 0, 255)
unblended[white_mask, 1] = np.clip(unblended[white_mask, 1] * 1.2 + 20, 0, 255)
unblended[white_mask, 2] = np.clip(unblended[white_mask, 2] * 1.2 + 20, 0, 255)

# Boost red emblem vibrancy
red_mask = (arr[:, :, 0] > 120) & (arr[:, :, 1] < 100) & (alpha > 0.5)
unblended[red_mask, 0] = 235
unblended[red_mask, 1] = 12
unblended[red_mask, 2] = 12

rgba = np.dstack([unblended, alpha * 255.0]).astype(np.uint8)
out = Image.fromarray(rgba)
# 2x super-sample for crisp edges
out_2x = out.resize((out.width * 2, out.height * 2), Image.Resampling.LANCZOS)
out_2x.save('clean_test_logo.png')
print('Saved clean_test_logo.png')

