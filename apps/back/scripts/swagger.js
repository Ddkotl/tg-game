require('ts-node/register');
const fs = require('node:fs');
const path = require('node:path');
const { NestFactory } = require('@nestjs/core');
const { DocumentBuilder, SwaggerModule } = require('@nestjs/swagger');
const { AppModule } = require('../src/app.module');

async function main() {
  const app = await NestFactory.create(AppModule, { logger: false });
  app.setGlobalPrefix('v1');

  const config = new DocumentBuilder()
    .setTitle('TG Game API')
    .setDescription('API for Telegram Game')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  const targetDir = path.join(__dirname, '..', '..', 'front', 'src', 'api');
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  fs.writeFileSync(path.join(targetDir, 'schema.json'), JSON.stringify(document, null, 2));
  await app.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
