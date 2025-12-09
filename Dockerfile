# Use Node for frontend + backend
FROM node:18

# Install Python (HF already uses Debian-based images, so this works)
RUN apt-get update && apt-get install -y python3 python3-pip

# Create user
RUN useradd -m -u 1000 user
USER user
WORKDIR /home/user/app

# Copy package files first (cache-friendly)
COPY --chown=user package.json package-lock.json ./

# Install Node dependencies
RUN npm install

# Copy the rest of the repo
COPY --chown=user . .

# Build Vite frontend
RUN cd frontend && npm install && npm run build

# Move built frontend to backend's static folder
RUN cp -r frontend/dist backend/dist

# Install Python deps if any
COPY requirements.txt .
RUN pip3 install --no-cache-dir -r requirements.txt

RUN python -m nltk.downloader punkt
RUN python -m nltk.downloader punkt_tab

# Expose HF port
EXPOSE 7860

# Start your Node backend
CMD ["node", "backend/server.js"]
