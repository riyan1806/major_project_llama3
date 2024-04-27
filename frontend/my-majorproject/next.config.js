const nextConfig = {
    async rewrites() {
      return [
        {
          source: '/test_page',
          destination: '/app/test_page',
        },
      ];
    },
  };
  
  module.exports = nextConfig;
  

