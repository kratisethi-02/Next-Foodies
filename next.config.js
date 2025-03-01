/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "krati-nextjs-foodies-app-images.s3.eu-north-1.amazonaws.com",
        port: "",
        pathname: "/**"
      }
    ]
  }
};

module.exports = nextConfig;
