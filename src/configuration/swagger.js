const swaggerJSDoc = require("swagger-jsdoc");

const swaggerDefinition = {
  definition: {
    openapi: "3.0",
  },
  info: {
    version: "1.0.0",
    title: "LakKanAn API",
    description: "INT366/372 Senior Project II (1/2565)",
    license: {
      name: "MIT",
      url: "https://opensource.org/licenses/MIT",
    },
  },
  host: "localhost:5000", // the host or url of the app
  basePath: "/", // the basepath of your endpoint
  tags: [
    {
      name: "user",
      description: "API for User in the system",
    },
    {
      name: "distributor",
      description: "API for distributor in the system",
    },
    {
      name: "book management",
      description: "API book management for distributor in the system",
    },
  ],
  schemes: ["http", "https"],
  consumes: ["application/json"],
  produces: ["application/json"],
  securityDefinitions: {
    Bearer: {
      type: "apiKey",
      name: "Authorization",
      in: "header",
    },
  },
};
// options for the swagger docs
const options = {
  // import swaggerDefinitions
  swaggerDefinition,
  // path to the API docs
  apis: ["./src/docs/**/*.yaml"],
};
// initialize swagger-jsdoc
module.exports = swaggerJSDoc(options);
