from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from diffusers import StableDiffusionPipeline
import torch
from io import BytesIO

app = Flask(__name__)
CORS(app)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}")

# Initialize Stable Diffusion
model = StableDiffusionPipeline.from_pretrained(
    "runwayml/stable-diffusion-v1-5",
    torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32
).to(device)

@app.route('/generate', methods=['OPTIONS', 'POST'])
def generate_image():
    if request.method == 'OPTIONS':
        return '', 200

    data = request.get_json()
    prompt = data.get('message', '')
    
    # Generate image
    image = model(
        prompt,
        num_inference_steps=30,
        guidance_scale=7.5
    ).images[0]
    
    # Convert to bytes for sending
    img_io = BytesIO()
    image.save(img_io, 'PNG')
    img_io.seek(0)
    
    return send_file(img_io, mimetype='image/png')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
