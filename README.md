# <img src="icons/onfocus-logo.png" width="40" height="40" align="center"> OnFocus

**OnFocus** es una extensión de Chrome diseñada para maximizar tu productividad mediante un control inteligente de distracciones y una gestión de tiempo basada en ciclos de alto rendimiento.

![OnFocus Header](icons/onfocus-logo.png)

## 🚀 Características Principales

- **🔄 Ciclos de Pomodoro Automáticos:** Configura tus tiempos de estudio y descanso. La extensión gestiona las repeticiones y vuelve automáticamente al "Modo Libre" al finalizar.
- **🛡️ Bloqueo de Sitios Flexible:**
  - **Bloqueo Total:** Acceso denegado a sitios que roban tu atención.
  - **Modo Gracia (Countdown):** Un círculo de cuenta atrás de 30 segundos inmersivo antes de bloquear el acceso.
- **📊 Rastreo de Tiempo y Alertas:** Monitoriza cuánto tiempo pasas en cada web y configura límites diarios con avisos automáticos.
- **🎨 UI/UX Premium:**
  - **Popup Minimalista:** Un gran botón central con indicador de progreso circular y cambio de colores dinámico (Azul para estudio, Verde para descanso).
  - **Identidad Visual:** Diseño profesional basado en negros profundos y azules vibrantes.
- **🌍 Internacionalización (i18n):** Soporte completo para **Español** e **Inglés**, configurable desde los ajustes.
- **🔔 Sistema de Notificaciones Híbrido:** Avisos mediante notificaciones de sistema y banners (Toasts) visuales con sonido en la página activa.
- **🪄 Wizard de Configuración:** Un asistente paso a paso para dejarlo todo listo en menos de un minuto tras la instalación.

## 🛠️ Instalación

### Para Usuarios (Descarga Directa)
1. Ve a la sección de **Releases** de este repositorio.
2. Descarga el archivo `onfocus-extension.zip`.
3. Descomprime el archivo en una carpeta local.
4. En Chrome, navega a `chrome://extensions`.
5. Activa el **"Modo de desarrollador"** (esquina superior derecha).
6. Haz clic en **"Cargar descomprimida"** y selecciona la carpeta donde extrajiste el contenido.

### Para Desarrolladores (Compilación Manual)
Si deseas modificar o compilar el código tú mismo:
```bash
# Instalar dependencias
npm install

# Iniciar modo desarrollo (Vite con HMR)
npm run dev

# Compilar versión final
npm run build
```

## ⚙️ Configuración

Accede a la página de opciones haciendo clic en el icono de engranaje (⚙️) del popup. Desde allí podrás:
- Cambiar el idioma.
- Ajustar los minutos de estudio y descanso.
- Definir el número de repeticiones (ciclos).
- Gestionar tu lista negra de webs y tus alertas de tiempo.

## 🧪 Automatización

Este proyecto utiliza **GitHub Actions** para generar automáticamente una nueva versión cada vez que se realiza un commit con la etiqueta `[BUILD]` en el mensaje.

---
*Desarrollado con ❤️ para mejorar la concentración y el enfoque profundo.*
