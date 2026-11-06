# Etapa 1: Compilación de la aplicación con Node.js
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Argumentos de compilación para Vite
ARG VITE_API_URL=http://localhost:5000/api
ARG VITE_CLOUDINARY_CLOUD_NAME=iof3ysvn
ARG VITE_CLOUDINARY_UPLOAD_PRESET=Chazinfood
ARG VITE_WOMPI_PUBLIC_KEY=pub_test_aqlt5Kk6gDrCW296IVkf1n0De21AEr2I

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_CLOUDINARY_CLOUD_NAME=$VITE_CLOUDINARY_CLOUD_NAME
ENV VITE_CLOUDINARY_UPLOAD_PRESET=$VITE_CLOUDINARY_UPLOAD_PRESET
ENV VITE_WOMPI_PUBLIC_KEY=$VITE_WOMPI_PUBLIC_KEY

RUN npm run build

# Etapa 2: Servidor web de producción con Nginx
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
