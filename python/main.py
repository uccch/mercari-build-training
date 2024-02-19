import os
import logging
import pathlib
import json
import hashlib
import shutil
from fastapi import FastAPI, Form, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
logger = logging.getLogger("uvicorn")
logger.level = logging.DEBUG
images = pathlib.Path(__file__).parent.resolve() / "images"
origins = [os.environ.get("FRONT_URL", "http://localhost:3000")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "Hello, world!"}

@app.post("/items")
def add_item(name: str = Form(...), category: str = Form(...), image: UploadFile = File(...)):
    images_folder = "images"
    image_content = image.file.read()
    image_hash = hashlib.sha256(image_content).hexdigest() + ".jpg"
    image_path = os.path.join(images_folder, image_hash)
    with open(image_path, "wb") as image_file:
        image_file.write(image_content)
    logger.info(f"Receive item: {name} {category} {image_hash}")
    new_item = {"name": name, "category": category, "image_name":image_hash}
    with open('items.json', 'r') as file:
        items_data = json.load(file)
    items_data["items"].append(new_item)
    with open('items.json', 'w') as file:
        json.dump(items_data, file)
    return {"message": f"item received: {name}"}

@app.get("/items")
def get_items():
    with open('items.json', 'r') as file:
        items_data = json.load(file)
    return items_data

@app.get("/items/{item_id}")
def get_item_id(item_id: int):
    with open('items.json', 'r') as file:
        items_data = json.load(file)
        items_list = items_data["items"]
        item = items_list[item_id]
        return item

@app.get("/image/{image_name}")
async def get_image(image_name):
    # Create image path
    image = images / image_name

    if not image_name.endswith(".jpg"):
        raise HTTPException(status_code=400, detail="Image path does not end with .jpg")

    if not image.exists():
        logger.debug(f"Image not found: {image}")
        image = images / "default.jpg"

    return FileResponse(image)