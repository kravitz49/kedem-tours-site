"""Generate PNG icons from SVG using Python only (no external libs needed).
   We create simple PNG icons programmatically."""

import struct, zlib, os

def make_png(size):
    """Create a simple PNG icon with the KT compass design."""
    w = h = size
    s = size / 512.0  # scale factor

    # Create RGBA pixel array
    pixels = []
    cx, cy = w // 2, int(h * 0.43)  # compass center
    r_outer = int(130 * s)
    r_inner = int(22 * s)
    r_dot   = int(8 * s)

    # Colors
    DARK  = (26, 26, 46, 255)
    ACCENT= (15, 52, 96, 255)
    GOLD  = (201, 168, 76, 255)
    GOLD2 = (240, 216, 120, 255)
    WHITE = (255, 255, 255, 180)
    TRANS = (0, 0, 0, 0)

    def lerp_color(c1, c2, t):
        return tuple(int(c1[i] + (c2[i]-c1[i])*t) for i in range(4))

    def in_circle(px, py, ccx, ccy, rad):
        return (px-ccx)**2 + (py-ccy)**2 <= rad**2

    def rounded_rect(px, py, rad):
        margin = int(size * 0.1)
        if px < margin or py < margin or px >= w-margin or py >= h-margin:
            corner = rad
            # check corners
            if px < margin+corner and py < margin+corner:
                return in_circle(px, py, margin+corner, margin+corner, corner)
            if px >= w-margin-corner and py < margin+corner:
                return in_circle(px, py, w-margin-corner, margin+corner, corner)
            if px < margin+corner and py >= h-margin-corner:
                return in_circle(px, py, margin+corner, h-margin-corner, corner)
            if px >= w-margin-corner and py >= h-margin-corner:
                return in_circle(px, py, w-margin-corner, h-margin-corner, corner)
            return True
        return True

    corner_r = int(size * 0.195)

    for y in range(h):
        row = []
        for x in range(w):
            # Background (rounded rect)
            if not rounded_rect(x, y, corner_r):
                row.extend([0, 0, 0, 0])
                continue

            # Gradient background
            t = (x + y) / (w + h)
            bg = lerp_color(DARK, ACCENT, t)

            # Outer compass circle
            dist = ((x-cx)**2 + (y-cy)**2)**0.5
            if abs(dist - r_outer) < max(2, int(3*s)):
                row.extend([201, 168, 76, 120])
                continue

            # North arrow (gold triangle pointing up)
            north_tip = cy - r_outer + int(10*s)
            if (x >= cx - int(20*s) and x <= cx + int(20*s) and
                y >= north_tip and y <= cy - int(45*s)):
                # Triangle shape
                mid = cx
                top = north_tip
                base_y = cy - int(45*s)
                if y >= top and y <= base_y:
                    span = int((y - top) / (base_y - top) * 20 * s)
                    if abs(x - mid) <= span:
                        row.extend([240, 216, 120, 255])
                        continue

            # South arrow (white)
            south_base = cy + int(45*s)
            south_tip  = cy + r_outer - int(10*s)
            if (x >= cx - int(20*s) and x <= cx + int(20*s) and
                y >= south_base and y <= south_tip):
                span = int((south_tip - y) / (south_tip - south_base) * 20 * s)
                if abs(x - cx) <= span:
                    row.extend([255, 255, 255, 140])
                    continue

            # Inner circle
            if in_circle(x, y, cx, cy, r_inner):
                t2 = (x + y) / (w + h)
                c = lerp_color(DARK, ACCENT, t2)
                if in_circle(x, y, cx, cy, r_dot):
                    row.extend([201, 168, 76, 255])
                else:
                    row.extend(list(c))
                continue

            # Gold dot at top
            if in_circle(x, y, cx, int(cy - r_outer + 5*s), max(3, int(6*s))):
                row.extend([240, 216, 120, 255])
                continue

            # Text area: "KT" bottom area
            text_y = int(h * 0.78)
            text_h = int(h * 0.16)
            if y >= text_y and y < text_y + text_h:
                # Simple block letters approximation
                rel_x = x - int(w * 0.25)
                rel_y = y - text_y
                lw = int(w * 0.5)
                lh = text_h
                # Draw gold bar
                if 0 <= rel_x < lw and int(lh*0.1) <= rel_y < int(lh*0.7):
                    row.extend([201, 168, 76, 200])
                    continue

            row.extend(list(bg))

        pixels.append(bytes(row))

    # Build PNG
    def chunk(name, data):
        c = name + data
        return struct.pack('>I', len(data)) + c + struct.pack('>I', zlib.crc32(c) & 0xffffffff)

    sig = b'\x89PNG\r\n\x1a\n'
    ihdr_data = struct.pack('>IIBBBBB', w, h, 8, 2, 0, 0, 0)  # RGB
    # Convert RGBA to RGB + filter byte
    raw = b''
    for row in pixels:
        raw += b'\x00'  # filter type none
        # RGBA -> RGB (drop alpha, composite on dark bg)
        for i in range(0, len(row), 4):
            r2, g2, b2, a2 = row[i], row[i+1], row[i+2], row[i+3]
            a_f = a2 / 255.0
            # Background is dark (26,26,46)
            fr = int(r2 * a_f + 26 * (1-a_f))
            fg = int(g2 * a_f + 26 * (1-a_f))
            fb = int(b2 * a_f + 46 * (1-a_f))
            raw += bytes([fr, fg, fb])

    ihdr_data2 = struct.pack('>IIBBBBB', w, h, 8, 2, 0, 0, 0)
    idat_data = zlib.compress(raw, 9)

    png = (sig +
           chunk(b'IHDR', ihdr_data2) +
           chunk(b'IDAT', idat_data) +
           chunk(b'IEND', b''))
    return png

sizes = [72, 96, 128, 144, 152, 192, 384, 512]
out_dir = os.path.join(os.path.dirname(__file__), 'icons')
os.makedirs(out_dir, exist_ok=True)

for sz in sizes:
    data = make_png(sz)
    path = os.path.join(out_dir, f'icon-{sz}.png')
    with open(path, 'wb') as f:
        f.write(data)
    print(f'Created {path} ({len(data)} bytes)')

print('Done!')
