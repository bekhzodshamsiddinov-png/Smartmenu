"""Procedural 3D (.glb) food models for SmartMenu.
Geometry: lathe-built plates, kosa bowls, glasses, bread; food surfaces are
displaced meshes textured with top-down food photos. Units: meters, Y up."""
import sys, io, json
import numpy as np
from PIL import Image, ImageFilter, ImageDraw
import trimesh
from trimesh.visual.material import PBRMaterial
from trimesh.visual import TextureVisuals

SRC = sys.argv[1]
OUT = sys.argv[2]

def tex(name, size=1024, circle=None):
    im = Image.open(f"{SRC}/{name}.jpg").convert("RGB")
    im = im.resize((size, size), Image.LANCZOS)
    return im

def mat(image=None, color=(255, 255, 255, 255), rough=0.6, metal=0.0, alpha=False, double=True):
    return PBRMaterial(
        baseColorTexture=image,
        baseColorFactor=list(color),
        roughnessFactor=rough,
        metallicFactor=metal,
        alphaMode="BLEND" if alpha else "OPAQUE",
        doubleSided=double,
    )

def mesh(v, f, uv, m):
    t = trimesh.Trimesh(vertices=v, faces=f, process=False)
    t.visual = TextureVisuals(uv=uv, material=m)
    return t

def lathe(profile, seg=96, uv_mode="planar", uv_r=0.5, R=1.0, vrange=None, flip=False):
    """profile: list of (r, y). Returns vertices, faces, uv.
    uv_mode planar: u,v from x,z normalised by R to radius uv_r.
    uv_mode wrap: u = angle, v = along profile (vrange)."""
    prof = np.array(profile, dtype=float)
    n = len(prof)
    ang = np.linspace(0, 2 * np.pi, seg + 1)
    V, UV = [], []
    for i, (r, y) in enumerate(prof):
        for a in ang:
            x, z = r * np.cos(a), r * np.sin(a)
            V.append((x, y, z))
            if uv_mode == "planar":
                UV.append((0.5 + x / R * uv_r, 0.5 - z / R * uv_r))
            else:
                v0, v1 = vrange or (0, 1)
                UV.append((a / (2 * np.pi) * 3.0, v0 + (v1 - v0) * i / (n - 1)))
    F = []
    w = seg + 1
    for i in range(n - 1):
        for j in range(seg):
            a, b, c, d = i * w + j, i * w + j + 1, (i + 1) * w + j, (i + 1) * w + j + 1
            F += [(a, c, b), (b, c, d)] if not flip else [(a, b, c), (b, d, c)]
    return np.array(V), np.array(F), np.array(UV)

def mound(img, radius, height, base_y, power=0.6, bump=0.006, rings=56, seg=120, crop=0.5, flat_top=0.0):
    """Domed food surface displaced by image luminance."""
    g = np.asarray(img.convert("L").filter(ImageFilter.GaussianBlur(3)), dtype=float) / 255.0
    H, W = g.shape
    V, UV = [(0.0, 0, 0.0)], [(0.5, 0.5)]
    for i in range(1, rings + 1):
        t = i / rings
        r = radius * t
        for j in range(seg):
            a = 2 * np.pi * j / seg
            x, z = r * np.cos(a), r * np.sin(a)
            u, v = 0.5 + x / radius * crop, 0.5 - z / radius * crop
            V.append((x, 0, z)); UV.append((u, v))
    V = np.array(V); UV = np.array(UV)
    rr = np.sqrt(V[:, 0] ** 2 + V[:, 2] ** 2) / radius
    shape = np.clip(1 - rr ** 2, 0, 1) ** power
    if flat_top:
        shape = np.minimum(shape / (1 - flat_top), 1.0)
    px = np.clip((UV[:, 0] * (W - 1)).astype(int), 0, W - 1)
    py = np.clip((UV[:, 1] * (H - 1)).astype(int), 0, H - 1)
    lum = g[py, px] - 0.5
    edge = np.clip((1 - rr) * 6, 0, 1)
    V[:, 1] = base_y + height * shape + bump * lum * edge
    F = []
    for j in range(seg):
        F.append((0, 1 + (j + 1) % seg, 1 + j))
    for i in range(rings - 1):
        s0, s1 = 1 + i * seg, 1 + (i + 1) * seg
        for j in range(seg):
            a, b = s0 + j, s0 + (j + 1) % seg
            c, d = s1 + j, s1 + (j + 1) % seg
            F += [(a, b, c), (b, d, c)]
    return V, np.array(F), UV

def circle_mask(img, r=0.5, cx=0.5, cy=0.5):
    """Crop a circular region from a square texture and re-centre it."""
    W, H = img.size
    box = (int((cx - r) * W), int((cy - r) * H), int((cx + r) * W), int((cy + r) * H))
    return img.crop(box).resize((W, H), Image.LANCZOS)

# ---------- reusable vessels ----------
PLATE_TEX = None

def plate(radius=0.14):
    global PLATE_TEX
    if PLATE_TEX is None:
        PLATE_TEX = circle_mask(tex("plate"), r=0.43)
    # top surface (well + rim), planar mapped so rim edge hits texture edge
    top = [(0.0, 0.006), (radius * 0.62, 0.006), (radius * 0.72, 0.010), (radius * 0.9, 0.019), (radius, 0.022)]
    v, f, uv = lathe(top, R=radius, uv_r=0.5)
    m_top = mesh(v, f, uv, mat(PLATE_TEX, rough=0.25))
    bottom = [(radius, 0.022), (radius * 1.01, 0.019), (radius * 0.75, 0.003), (radius * 0.45, 0.0), (radius * 0.42, 0.004), (0.0, 0.004)]
    v, f, uv = lathe(bottom, R=radius, uv_r=0.5, flip=True)
    m_bot = mesh(v, f, uv, mat(None, (250, 250, 248, 255), rough=0.3))
    return [m_top, m_bot], 0.006

def kosa(r_top=0.085, r_bot=0.038, h=0.075, wall=0.005, liquid=None, liquid_level=0.8, liquid_bump=0.0, liquid_h=0.0):
    band = tex("band", 1024).resize((1024, 256))
    outer = [(r_bot, 0.0), (r_bot * 1.05, 0.006), (r_bot * 1.25, 0.012), (r_top * 0.82, h * 0.55), (r_top, h)]
    v, f, uv = lathe(outer, uv_mode="wrap", vrange=(1.0, 0.0), flip=True)
    parts = [mesh(v, f, uv, mat(band, rough=0.2))]
    rim = [(r_top, h), (r_top - wall * 0.5, h + 0.002), (r_top - wall, h)]
    v, f, uv = lathe(rim, uv_mode="planar", R=r_top)
    parts.append(mesh(v, f, uv, mat(None, (30, 60, 160, 255), rough=0.2)))
    inner = [(r_top - wall, h), (r_top * 0.8 - wall, h * 0.55), (r_bot * 1.1, 0.012), (0.0, 0.010)]
    v, f, uv = lathe(inner, R=r_top)
    parts.append(mesh(v, f, uv, mat(None, (248, 248, 245, 255), rough=0.2)))
    base = [(0.0, 0.0), (r_bot, 0.0)]
    v, f, uv = lathe(base, R=r_bot, flip=True)
    parts.append(mesh(v, f, uv, mat(None, (235, 232, 225, 255))))
    if liquid is not None:
        y = h * liquid_level
        # radius of inner wall at that height (linear between the two inner points)
        r_at = np.interp(y, [0.012, h * 0.55, h], [r_bot * 1.1, r_top * 0.8 - wall, r_top - wall]) - 0.001
        v, f, uv = mound(liquid, r_at, liquid_h, y, bump=liquid_bump, crop=0.5, power=0.8)
        parts.append(mesh(v, f, uv, mat(liquid, rough=0.15 if liquid_h == 0 else 0.55)))
    return parts

def glass(liquid_tex, color, r=0.036, h=0.13, level=0.82):
    parts = []
    wall = [(r * 0.9, 0.0), (r, h)]
    v, f, uv = lathe(wall, uv_mode="wrap", flip=True)
    parts.append(mesh(v, f, uv, mat(None, (235, 245, 255, 60), rough=0.05, alpha=True, double=True)))
    rim = [(r, h), (r - 0.0015, h + 0.001), (r - 0.003, h)]
    v, f, uv = lathe(rim, R=r)
    parts.append(mesh(v, f, uv, mat(None, (240, 248, 255, 120), rough=0.05, alpha=True)))
    base = [(0, 0.0), (r * 0.9, 0.0), (r * 0.9, 0.008), (0, 0.008)]
    v, f, uv = lathe(base, R=r, flip=True)
    parts.append(mesh(v, f, uv, mat(None, (235, 245, 255, 120), rough=0.05, alpha=True)))
    lh = h * level
    side = [(r * 0.86, 0.008), (r * 0.97, lh)]
    v, f, uv = lathe(side, uv_mode="wrap", flip=True)
    parts.append(mesh(v, f, uv, mat(None, color + (248,), rough=0.08, alpha=True)))
    v, f, uv = mound(liquid_tex, r * 0.97, 0.0, lh, bump=0.0, crop=0.5)
    parts.append(mesh(v, f, uv, mat(liquid_tex, rough=0.1)))
    return parts

def bread(img, radius=0.11):
    t = circle_mask(img, r=0.39, cx=0.5, cy=0.495)
    # thick rim, stamped thin centre
    prof = [(0.0, 0.016), (radius * 0.55, 0.016), (radius * 0.66, 0.03), (radius * 0.82, 0.036), (radius * 0.95, 0.028), (radius, 0.012)]
    v, f, uv = lathe(prof, R=radius, uv_r=0.5)
    top = mesh(v, f, uv, mat(t, rough=0.75))
    bot = [(radius, 0.012), (radius * 0.97, 0.002), (0.0, 0.0)]
    v, f, uv = lathe(bot, R=radius, uv_r=0.5, flip=True)
    under = mesh(v, f, uv, mat(None, (196, 140, 76, 255), rough=0.8))
    return [top, under]

def napoleon_slice(top_img, base_y):
    w, d, h = 0.07, 0.10, 0.055
    parts = []
    # layered side texture
    side = Image.new("RGB", (256, 256), (240, 225, 190))
    dr = ImageDraw.Draw(side)
    for i in range(8):
        y0 = int(i * 32)
        dr.rectangle([0, y0, 256, y0 + 12], fill=(214, 168, 96))
        dr.rectangle([0, y0 + 12, 256, y0 + 32], fill=(247, 236, 205))
    side = side.filter(ImageFilter.GaussianBlur(1.2))
    box = trimesh.creation.box(extents=(w, h, d))
    box.apply_translation((0, base_y + h / 2, 0))
    # per-face UV: unwrap by projecting each face on its dominant axis
    V, F = box.vertices[box.faces].reshape(-1, 3), np.arange(len(box.faces) * 3).reshape(-1, 3)
    n = np.repeat(box.face_normals, 3, axis=0)
    UV = np.zeros((len(V), 2))
    top_mask = n[:, 1] > 0.5
    UV[:, 0] = np.where(np.abs(n[:, 0]) > 0.5, (V[:, 2] / d + 0.5), (V[:, 0] / w + 0.5))
    UV[:, 1] = np.where(top_mask | (n[:, 1] < -0.5), 0.5 - V[:, 2] / d, 1 - (V[:, 1] - base_y) / h)
    topF = F[top_mask[::3]]
    sideF = F[~top_mask[::3]]
    parts.append(mesh(V, topF, UV, mat(top_img, rough=0.8)))
    parts.append(mesh(V, sideF, UV, mat(side, rough=0.7)))
    return parts

def save(name, parts, size_note):
    scene = trimesh.Scene()
    for i, p in enumerate(parts):
        scene.add_geometry(p, node_name=f"{name}_{i}")
    data = scene.export(file_type="glb")
    with open(f"{OUT}/{name}.glb", "wb") as fh:
        fh.write(data)
    print(f"{name}.glb  {len(data)/1024:.0f} KB  {size_note}")

def plated(name, food, h, r_food=0.105, bump=0.008, power=0.55, plate_r=0.14):
    p, y = plate(plate_r)
    img = tex(food)
    v, f, uv = mound(img, r_food, h, y - 0.001, power=power, bump=bump)
    save(name, p + [mesh(v, f, uv, mat(img, rough=0.7))], f"plate {plate_r*200:.0f}cm")

def make_all():
    plated("osh", "osh", 0.055, power=0.5, bump=0.008)
    plated("manti", "manti", 0.035, power=0.35, bump=0.014)
    plated("qozon", "qozon", 0.04, power=0.45, bump=0.014)
    plated("shashlik", "shashlik", 0.03, power=0.4, bump=0.012)
    plated("tovuq", "tovuq", 0.035, power=0.4, bump=0.014, r_food=0.112, plate_r=0.15)
    plated("lula", "lula", 0.028, power=0.35, bump=0.012)
    plated("achchiq", "achchiq", 0.025, power=0.5, bump=0.006, r_food=0.09, plate_r=0.12)
    plated("sezar", "sezar", 0.04, power=0.5, bump=0.012, r_food=0.095, plate_r=0.13)
    plated("somsa", "somsa", 0.045, power=0.35, bump=0.02, r_food=0.1)
    plated("chakchak", "chakchak", 0.06, power=0.7, bump=0.012, r_food=0.075, plate_r=0.12)
    # bowls
    save("lagmon", kosa(liquid=tex("lagmon"), liquid_level=0.82, liquid_bump=0.006, liquid_h=0.008), "kosa")
    save("shorva", kosa(liquid=tex("shorva"), liquid_level=0.8, liquid_bump=0.004), "kosa")
    save("muz", kosa(r_top=0.06, r_bot=0.03, h=0.05, liquid=tex("muz"), liquid_level=0.9, liquid_bump=0.01, liquid_h=0.04), "kosa")
    save("choy", kosa(r_top=0.045, r_bot=0.022, h=0.045, liquid=tex("tea"), liquid_level=0.8), "piyola")
    # glasses
    save("limonad", glass(tex("limonad"), (226, 214, 120)), "glass")
    save("kompot", glass(tex("kompot"), (96, 6, 22), r=0.04, h=0.12), "glass")
    cola = tex("tea").convert("L").point(lambda x: x * 0.35)
    cola = Image.merge("RGB", [cola.point(lambda x: x * 1.1), cola.point(lambda x: x * 0.6), cola.point(lambda x: x * 0.4)])
    save("cola", glass(cola, (34, 12, 6)), "glass")
    # bread
    save("non", bread(tex("non")), "flatbread")
    # cake slice on small plate
    p, y = plate(0.1)
    save("napoleon", p + napoleon_slice(tex("napoleon", 512), y), "slice")

make_all()
