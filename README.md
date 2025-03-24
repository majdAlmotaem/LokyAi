# Loky AI

![Loky AI](https://img.shields.io/badge/Loky-AI%20Image%20Generator-purple)
![License](https://img.shields.io/badge/license-MIT-blue)

Loky AI is a locally-hosted AI image generation application that allows you to create images from text descriptions using state-of-the-art diffusion models. The application features a chat-like interface for a seamless user experience.

![Loky AI Screenshot](screenshot.png)

## Features

- **Text-to-Image Generation**: Create images from textual descriptions
- **Multiple Models**: Choose between high-quality (SDXL) or faster generation (Realistic Vision)
- **Chat Interface**: Intuitive chat-like experience for generating images
- **Image History**: Keep track of your generated images
- **Local Execution**: All processing happens on your local machine for privacy

## System Requirements

### Minimum Requirements

- **CPU**: Modern multi-core processor (Intel i5/i7 or AMD Ryzen 5/7)
- **RAM**: 16GB
- **Storage**: 20GB free space
- **OS**: Windows 10/11, macOS, or Linux

### Recommended Requirements

- **GPU**: NVIDIA GPU with at least 6GB VRAM (GTX 1660 or better)
- **CUDA**: CUDA 11.8 or newer
- **RAM**: 32GB
- **Storage**: 50GB SSD

## Installation

### Prerequisites

- Python 3.10 or newer
- Git
- CUDA Toolkit (for GPU acceleration)

### Step 1: Clone the Repository

```bash
git clone https://github.com/majdAlmotaem/Loky.git
cd Loky
```

### Step 2: Create a Virtual Environment

```bash
python -m venv venv
```

### Step 3: Activate the Virtual Environment

Windows:

```bash
venv\Scripts\activate
```

macOS/Linux:

```bash
source venv/bin/activate
```

### Step 4: Install Dependencies

```bash
pip install -r requirements.txt
```

### Step 5: Run the Application

Start the backend server:

```bash
python backend/app.py
```

Open `frontend/index.html` in your web browser, or serve it using a simple HTTP server:

```bash
cd frontend
python -m http.server
```

Then navigate to `http://localhost:8000` in your browser.

## Usage

1. Select a model from the dropdown menu (Stable Diffusion XL for higher quality or Realistic Vision for faster generation)
2. Type your image description in the text input
3. Press Enter or click the send button
4. Wait for the AI to generate your image
5. Continue the conversation with more image requests

### Example Prompts

- "A serene lakeside cabin at sunset with mountains in the background"
- "Portrait of a middle-aged man with salt and pepper beard, wearing a business suit"
- "A bustling city street in Tokyo at night with neon signs and rain-slicked pavement"
- "Close-up of a monarch butterfly on a purple flower with dew drops"

## Troubleshooting

### Common Issues

1. **"CUDA out of memory" error**

   - Try using a smaller model or reducing the image resolution
   - Close other GPU-intensive applications

2. **Slow generation times**

   - Ensure you're using GPU acceleration
   - Try the Realistic Vision model which is faster
   - Reduce the number of inference steps in the backend code

3. **"xformers not available" warning**

   - Install xformers with `pip install xformers`
   - Ensure your PyTorch and CUDA versions are compatible with xformers

4. **Images not displaying**
   - Check browser console for errors
   - Ensure the backend server is running
   - Check network tab in developer tools for response errors

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Hugging Face Diffusers](https://github.com/huggingface/diffusers) for the diffusion models
- [Stable Diffusion XL](https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0) by Stability AI
- [Realistic Vision](https://huggingface.co/SG161222/Realistic_Vision_V5.1_noVAE) by SG161222

## Contact

Majd Almotaem - [GitHub](https://github.com/majdAlmotaem)

Project Link: [https://github.com/majdAlmotaem/Loky](https://github.com/majdAlmotaem/Loky)

````

## 3. MIT License File

```plain text:LICENSE
MIT License

Copyright (c) 2024 Majd Almotaem

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
````
