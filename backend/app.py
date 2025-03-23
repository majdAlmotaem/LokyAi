from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from diffusers import StableDiffusionPipeline, StableDiffusionXLPipeline
import torch
from io import BytesIO
import time

app = Flask(__name__)
CORS(app)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}")

# Initialize models dictionary to store loaded models
models = {}

def get_model(model_id):
    """Load and return the requested model, with caching"""
    if model_id in models:
        return models[model_id]
    
    print(f"Loading model: {model_id}")
    
    if model_id == "stabilityai/stable-diffusion-xl-base-1.0":
        # Initialize SDXL
        model = StableDiffusionXLPipeline.from_pretrained(
            model_id,
            torch_dtype=torch.float16,
            use_safetensors=True,
            variant="fp16"
        ).to(device)
        
        # Apply optimizations for SDXL
        model.enable_attention_slicing(slice_size=1)
        model.enable_vae_slicing()
        model.unet.to(memory_format=torch.channels_last)
        
    elif model_id == "SG161222/Realistic_Vision_V5.1_noVAE":
        # Initialize Realistic Vision
        model = StableDiffusionPipeline.from_pretrained(
            model_id,
            torch_dtype=torch.float16,
            safety_checker=None
        ).to(device)
        
        # Apply basic optimizations
        model.enable_attention_slicing()
        
    # Try to enable xformers for any model
    try:
        model.enable_xformers_memory_efficient_attention()
        print("Using xformers for memory efficient attention")
    except:
        print("xformers not available")
    
    # Cache the model
    models[model_id] = model
    return model

@app.route('/generate', methods=['OPTIONS', 'POST'])
def generate_image():
    if request.method == 'OPTIONS':
        return '', 200

    data = request.get_json()
    prompt = data.get('message', '')
    model_id = data.get('model', 'stabilityai/stable-diffusion-xl-base-1.0')
    
    # Get the appropriate model
    model = get_model(model_id)
    
    start_time = time.time()
    
    # Generate image with model-specific settings
    if model_id == "stabilityai/stable-diffusion-xl-base-1.0":
        image = model(
            prompt=prompt,
            num_inference_steps=20,
            guidance_scale=7.0,
            height=512,
            width=512
        ).images[0]
    else:
        image = model(
            prompt=prompt,
            num_inference_steps=30,
            guidance_scale=7.5,
            height=512,
            width=512
        ).images[0]
    
    print(f"Image generation took {time.time() - start_time:.2f} seconds")
    
    # Convert to bytes for sending
    img_io = BytesIO()
    image.save(img_io, 'PNG')
    img_io.seek(0)
    
    return send_file(img_io, mimetype='image/png')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
