import sys, io, glob
from pygltflib import GLTF2, BufferView
from PIL import Image
for path in sys.argv[1:]:
    g = GLTF2().load_binary(path)
    blob = g.binary_blob()
    chunks = []  # rebuild buffer: (bufferViewIndex, bytes)
    new_blob = bytearray()
    imgviews = {im.bufferView: im for im in g.images}
    for i, bv in enumerate(g.bufferViews):
        data = blob[bv.byteOffset or 0:(bv.byteOffset or 0) + bv.byteLength]
        if i in imgviews:
            im = Image.open(io.BytesIO(data)).convert("RGB")
            out = io.BytesIO(); im.save(out, "JPEG", quality=82, optimize=True, progressive=False)
            data = out.getvalue(); imgviews[i].mimeType = "image/jpeg"
        while len(new_blob) % 4: new_blob += b"\0"
        bv.byteOffset = len(new_blob); bv.byteLength = len(data)
        new_blob += data
    while len(new_blob) % 4: new_blob += b"\0"
    g.buffers[0].byteLength = len(new_blob)
    g.set_binary_blob(bytes(new_blob))
    g.save_binary(path)
    print(path.split("/")[-1], len(new_blob)//1024, "KB")
