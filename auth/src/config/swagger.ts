import swaggerUi from 'swagger-ui-express'
import express from 'express'
import path from 'path'
import YAML from 'yaml'
import fs from 'fs'
import docsFileNames from '@routes/docs'

const loadSwaggerDocs = (): any => {
   const docs = YAML.parse(fs.readFileSync(path.join(process.cwd(), 'src', 'routes', 'docs', 'index.yml'), 'utf8'))
   docsFileNames.forEach((fileName) => {
      const parsedDoc = YAML.parse(fs.readFileSync(path.join(process.cwd(), 'src', 'routes', 'docs', fileName), 'utf8'))
      if (parsedDoc.paths) docs.paths = { ...docs.paths, ...parsedDoc.paths }
      if (parsedDoc.components.schemas)
         docs.components.schemas = { ...docs.components.schemas, ...parsedDoc.components.schemas }
      if (parsedDoc.components.parameters)
         docs.components.parameters = { ...docs.components.parameters, ...parsedDoc.components.parameters }
      if (parsedDoc.components.responses)
         docs.components.responses = { ...docs.components.responses, ...parsedDoc.components.responses }
      if (parsedDoc.components.requestBody)
         docs.components.requestBody = { ...docs.components.requestBody, ...parsedDoc.components.requestBody }
   })
   return docs
}

export default (app: express.Application) => {
   const swaggerDocs = loadSwaggerDocs();
   app.get('/api-docs/', swaggerUi.setup(swaggerDocs));
   app.use('/api-docs', swaggerUi.serve);
   // app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(loadSwaggerDocs()))
}
