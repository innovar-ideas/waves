/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",

  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, POST, PUT, PATCH, DELETE" },
          { key: "Access-Control-Allow-Headers", value: "X-Requested-With, X-Requested-Without, Content-Type" },
          { key: "Access-Control-Allow-Credentials", value: "true" },
        ]
      },
    ];
  }
};

export default nextConfig;
