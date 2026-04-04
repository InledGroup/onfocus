const fs = require('fs');

// PNG mínimo de 1x1 pixel azul claro (#A7C7E7)
const bluePixel = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN88P///38GIAAAH8IB9z7S16MAAAAASUVORK5CYII=', 'base64');

const sizes = [16, 48, 128];

sizes.forEach(size => {
  // Para mocks, simplemente usamos el mismo pixel o podrías generar algo más grande
  // Chrome suele aceptar que el archivo sea pequeño y lo escala, 
  // pero para mayor seguridad, escribiremos el buffer en los archivos indicados.
  fs.writeFileSync(`icons/icon${size}.png`, bluePixel);
});

console.log('Iconos mock generados correctamente.');
