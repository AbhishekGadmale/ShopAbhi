# Build stage
FROM node:18-alpine AS build
WORKDIR /app

# Add build arguments
ARG VITE_API_BASE
ARG VITE_RAZORPAY_KEY_ID

# Set them as environment variables for the build process
ENV VITE_API_BASE=$VITE_API_BASE
ENV VITE_RAZORPAY_KEY_ID=$VITE_RAZORPAY_KEY_ID

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
# Copy custom nginx config for React Router support
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
